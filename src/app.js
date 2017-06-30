'use strict'
var sm = require('./SM/StorageManager'),
    rm = require('./RM/RecordManager'),
    fs = require('fs'),
    File = require('./BM/File'),
    util = require('./util'),
    assert = require('assert'),
    BMQueue = require('./BM/BMQueue'),
    Queue = require('./Queue'),
    TestHelper = require('../test/TestHelper'),
    Constants = require('./Constants'),
    CatalogM = require('./RM/CatalogManager'),
    Catalog = require('./RM/Catalog'),
    Schema = require('./RM/Schema'),
    Record = require('./RM/Record'),
    Iterator = require('./Iterator');

var ts = require('../test/TestHelper');

var BM_PageHandle = require('./BM/Page');
var bm = require('./BM/BufferManager');

var Clock = require('./BM/Clock'),
    Heap = require('heap');

var buf = Buffer.alloc(Constants.PAGE_SIZE);

const async = require('async');
var filename = '/Users/matthewxfz/Workspaces/gits/Database-javascript/file.test',
    fileName = "/Users/matthewxfz/Workspaces/tmp/write.test",
    fileName2 = "/Users/matthewxfz/Workspaces/tmp/fake.test",
    file,
    buf;
function BM_BufferPool(pageFile, numPages, strategy, mgmtData) {
    this.pageFile = pageFile;
    this.numPages = numPages;
    this.strategy = strategy;
    this.mgmtData = mgmtData;
}
testCatalog();


function testCatalog(){
    CatalogM.init();
    CatalogM.add('student');
    CatalogM.add('teacher');
    CatalogM.add('class');
    CatalogM.add('registerTo');
    CatalogM.add('department');
    CatalogM.remove(('student'));
    var tablinfo = new Catalog.TableInfo(new Record.RID(0,10),'class', 12);
    CatalogM.update(tablinfo);
    var record = CatalogM.find('class');
    console.log(JSON.stringify(record));
    CatalogM.shutdown();
}
function testTableWholeFunction() {

    rm.initRecordManager();
    rm.createTable('student',
        rm.createSchema(4, ['name', 'school', 'age', 'isFool'],
            [Schema.Datatype.DT_STRING, Schema.Datatype.DT_STRING, Schema.Datatype.DT_INT, Schema.Datatype.DT_BOOL],
            [8, 8, 4, 4],
            1,
            [1, 0, 0, 0],
            'student'));
    rm.insertRecord('studnet',new Record('',0,['Xiong','iit',10,1]));
    rm.insertRecord('studnet',new Record('',0,['Yan','iit',10,1]));
    rm.insertRecord('studnet',new Record('',0,['Lee','iit',10,1]));
    rm.insertRecord('studnet',new Record('',0,['Sync','iit',10,1]));
    rm.insertRecord('studnet',new Record('',0,['Liang','iit',10,1]));

}

function testTablesWithCatalogInBP() {
    var schema = new Schema(4, ['attriName', 'dataType', 'typeLength', 'isKey'],
        [Schema.Datatype.DT_STRING, Schema.Datatype.DT_INT, Schema.Datatype.DT_INT, Schema.Datatype.DT_BOOL],
        [64, 1, 4, 1],
        [0, 0, 0, 0],
        0);
    var bp = getCatalogBp();
    var catalog = new Catalog();


    var buf = Buffer.alloc(Constants.PAGE_SIZE);
// buf.writeInt32BE(4017,0);
// sm.safeWriteBlock(bp.pageFile,buf,0,0);
//init
    bm.initBufferPool(bp, bp.pageFile, 1, bp.strategy);


// rm.insertRecord(catalog, new Record('', '',['hello',0, 12, 1]));
// rm.insertRecord(catalog, new Record('', '',['world',0, 12, 1]));
// rm.insertRecord(catalog, new Record('', '',['myfriend',0, 12, 1]));
//
// var record = new Record();
//
// rm.getRecord(catalog, new Record.RID(0,1),record);
// console.log(JSON.stringify(record));
// rm.getRecord(catalog, new Record.RID(0,2),record);
// console.log(JSON.stringify(record));
// rm.getRecord(catalog, new Record.RID(0,3),record);
// console.log(JSON.stringify(record));


    bm.shutdownBufferPool(bp);
}


function getCatalogBp() {
    "use strict";
    var bp = new BM_BufferPool(Catalog.getCatalogAccess(), Constants.catalogBPLength, Constants.catalogStra);

    try {
        fs.accessSync(getDictionaryAccess(), fs.constants.R_OK | fs.constants.W_OK);
    } catch (err) {
        if (err.code === 'ENOENT') {// build the empty file
            var buf = Buffer.alloc(sm.PAGE_SIZE)
            sm.safeWriteBlock(getDictionaryAccess(), buf, 0, 0);
        }
    }

    //read the record

    //var totalpages = sm.getPageNumofFile(getDictionaryAccess());

    bm.initBufferPool(bp, bp.pageFile, 1, bp.strategy);

    return bp;
}
function testCreateSchema() {
    var path = '/Users/matthewxfz/Workspaces/gits/Database-javascript/dictionary';
    var buf = Buffer.alloc(sm.PAGE_SIZE);
    var numSlots = Math.floor(sm.PAGE_SIZE / (Constants.RID + Constants.schemaRecordLength));
    for (var i = 0; i < numSlots * 8; i += 4) {
        buf.writeInt32BE(-1, i);
    }

    var buf2 = Buffer.alloc(sm.PAGE_SIZE).fill('a');
    console.log(buf.readInt32BE(0, 4));
    sm.safeWriteBlock(path, buf, 0, 0, () => {
        sm.safeReadBlock(path, buf2, 0, 0, () => {
            console.log(buf2.readInt32BE(0, 4));
        })
    });
}

function testCheck() {
    var workdir = '/Users/matthewxfz/Workspaces/gits/Database-javascript/test';

    checkDir(workdir + '/JSDB', (err) => {
        checkDir(workdir + '/JSDB/schema');
        checkDir(workdir + '/JSDB/tables');
        checkDir(workdir + '/JSDB/index');
        checkDir(workdir + '/JSDB/views');
    });
}

function checkDir(dir, cb) {
    fs.access(dir, fs.constants.W_OK, (err) => {
        if (err.code = 'ENOENT')
            fs.mkdir(dir, 0o744, cb);
        else
            cb(err);
    })
}


function testLRU() {
    var bp = new BM_BufferPool(filename, 3, bm.ReplacementStrategy.RS_FIFO);
    var page = new BM_PageHandle(0, 0);
    const poolContents = [
        // read first five pages and directly unpin them
        '[0 0],[-1 0],[-1 0],[-1 0],[-1 0]',//0
        '[0 0],[1 0],[-1 0],[-1 0],[-1 0]',
        '[0 0],[1 0],[2 0],[-1 0],[-1 0]',
        '[0 0],[1 0],[2 0],[3 0],[-1 0]',
        '[0 0],[1 0],[2 0],[3 0],[4 0]',//4
        // use some of the page to create a fixed LRU order without changing pool content
        '[0 0],[1 0],[2 0],[3 0],[4 0]',//5
        '[0 0],[1 0],[2 0],[3 0],[4 0]',
        '[0 0],[1 0],[2 0],[3 0],[4 0]',
        '[0 0],[1 0],[2 0],[3 0],[4 0]',
        '[0 0],[1 0],[2 0],[3 0],[4 0]',//9
        // check that pages get evicted in LRU order
        '[0 0],[1 0],[2 0],[5 0],[4 0]',//10
        '[0 0],[1 0],[2 0],[5 0],[6 0]',
        '[7 0],[1 0],[2 0],[5 0],[6 0]',
        '[7 0],[1 0],[8 0],[5 0],[6 0]',
        '[7 0],[9 0],[8 0],[5 0],[6 0]'//14
    ]
    const orderRequests = [3, 4, 0, 2, 1]
    const numLRUOrderChange = 5
    var snapshot = 0;
    bm.initBufferPool(bp, filename, 5, bm.ReplacementStrategy.RS_LRU)

    for (var i = 0; i < 5; i++) {
        page.pageNum = i;
        bm.pinPage(bp, page)
        bm.unpinPage(bp, page)
        console.log(true, ts.bmTestHelper(bp, poolContents[snapshot++]));
    }

}
function testReadFromEmptyFileandCompare(num) {
    var expect = Buffer.alloc(sm.PAGE_SIZE);
    for (var i = 0; i < num; i++) {
        sm.safeWriteBlock(filename, Buffer.alloc(sm.PAGE_SIZE, i, 'utf8'), 0, i);
    }

    //console.log('ori, ' + expect.toString('utf8'))
    //sm.safeReadBlock(filename, expect, 0, 0, (err) => {

    var bp = new BM_BufferPool(filename, 1, bm.ReplacementStrategy.RS_FIFO);
    var page = new BM_PageHandle(0, 0);
    bm.initBufferPool(bp, filename, 3, bm.ReplacementStrategy.RS_FIFO, page);

    //console.log(expect);

    for (var i = 0; i < num; i++) {
        page.pageNum = i;
        bm.pinPage(bp, page);
        sm.safeReadBlock(filename, expect, page.data, page.pageNum);
        bm.unpinPage(bp, page);
        var corBuf = bp.data.slice(page.data * sm.PAGE_SIZE, (page.data + 1) * sm.PAGE_SIZE);
        console.log(corBuf.compare(expect));
    }
    //});
}

function testClock() {
    var fixcount = [0, 0, 1, 0, 0];
    var clock = new Clock(5, fixcount);

    for (var i = 0; i < 20; i++) {
        console.log(clock.pop());
    }
}
function testFIFO2() {

    const poolContents = [
        "[0 0],[-1 0],[-1 0]",
        "[0 0],[1 0],[-1 0]",
        "[0 0],[1 0],[2 0]",
        "[3 0],[1 0],[2 0]",
        "[3 0],[4 0],[2 0]",//1
        "[3 0],[4 1],[2 0]",//2
        "[3 0],[4 1],[5x0]",//3
        "[6x0],[4 1],[5x0]",
        "[6x0],[4 1],[0x0]",
        "[6x0],[4 0],[0x0]",
        "[6 0],[4 0],[0 0]"
    ];
    const requests = [0, 1, 2, 3, 4, 4, 5, 6, 0];
    const numLinRequests = 5;
    const numChangeRequests = 3;

    var file = new File();

    var bp = new BM_BufferPool(filename, 1, bm.ReplacementStrategy.RS_FIFO);
    var data;
    var page = new BM_PageHandle(1, data);
    bm.initBufferPool(bp, filename, 3, bm.ReplacementStrategy.RS_FIFO, page);


    // reading some pages linearly with direct unpin and no modifications
    for (var i = 0; i < numLinRequests; i++) {
        page.pageNum = requests[i];
        bm.pinPage(bp, page);
        bm.unpinPage(bp, page);

        assert.equal(true, ts.bmTestHelper(bp, poolContents[i]));
    }

    var i = numLinRequests;
    page.pageNum = requests[i];
    bm.pinPage(bp, page);
    assert.equal(true, ts.bmTestHelper(bp, poolContents[i]));

    for (var i = numLinRequests + 1; i < numLinRequests + numChangeRequests + 1; i++) {
        page.pageNum = requests[i];
        bm.pinPage(bp, page);
        bm.markDirty(bp, page);
        bm.unpinPage(bp, page);
        assert.equal(true, ts.bmTestHelper(bp, poolContents[i]));
    }

    // var i = numLinRequests + numChangeRequests + 1;
    // page.pageNum = 4;
    // bm.unpinPage(bp, page);
    // console.log(poolContents[i]);
    // assert.equal(true, ts.bmTestHelper(bp, poolContents[i]));
    // i++;
    // bm.forceFlushPool(bp);
    // assert.equal(false, ts.bmTestHelper(bp, poolContents[i]));
}


function testHelper() {
    var bp = new BM_BufferPool(filename, 1, bm.ReplacementStrategy.RS_FIFO);
    bp.fixcount = [0, 0, 0];
    bp.storage_page_map = [0, -1, -1];
    bp.dirty = [0, 0, 0];

    assert(true, bmTestHelper(bp, "[0 0],[-1 0],[-1 0]"));
}

/**
 * Return if the intput data fits the expect result?
 *
 * @param {BM_BufferPool} bp -- buffer pool
 * @param {string} [str=[i]]  --expect result in a moment i
 */
function bmTestHelper(bp, str) {
    var count = 0;
    var array = str.split(',');
    for (var i = 0; i < array.length; i++) {
        var val = {};
        var p = 0;
        var subarray = array[i].split('');
        if (subarray[1] == '-') {
            val[0] = '-' + subarray[2];
            p = 3;
        } else {
            val[0] = subarray[1];
            p = 2;
        }
        if (subarray[p] == ' ') val[1] = 0;
        else val[1] = 1;

        if (subarray[p + 1] == '-') {
            val[2] = '-' + subarray[p + 2];
        } else {
            val[2] = subarray[p];
        }

        if (bp.storage_page_map[i] == val[0]
            && bp.dirty[i] == val[1]
            && bp.fixcount[i] == val[2]) {
            count++;
        } else {
            return false;
        }
    }
    return true;
}


function testWriteStream(callback) {
    buf = Buffer.alloc(2 * 4096).fill('a', 0, 4095);
    buf.fill('b', 4096, 2 * 4096 - 1);
    sm.safeWriteBlock(new File(0, filename), buf, 1, 0);
    sm.safeWriteBlock(new File(0, filename), buf, 0, 1);

}

function safeWriteBlock(file, buf, offset, callback) {
    var opt;
    opt = {
        flags: 'w+',
        defaultEncoding: 'utf8',
        fd: null,
        mode: 0o666,
        autoClose: true,
        start: offset
    };
    var writeStream = fs.createWriteStream(file.fileName, opt);

    keepWrite(callback);
    function keepWrite(callback) {
        var ok = writeStream.write(buf, 'utf8', callback);
        if (!ok)
            writeStream.once('drain', keepWrite());
    }
}

function testQueue() {
    var fixcount = [0, 0, 1, 0];
    var queue = new BMQueue(4, fixcount);
    queue.push(2);
    queue.push(0);
    queue.push(3);
    queue.push(1);

    console.log(queue.pop());
    console.log(queue.pop());
    console.log(queue.pop());
    queue.push(5);
    console.log(queue.pop());

}


function testFIFO() {
    var poolContent = [
        "[0 0],[-1 0],[-1 0]",
        "[0 0],[1 0],[-1 0]",
        "[0 0],[1 0],[2 0]",
        "[3 0],[1 0],[2 0]",
        "[3 0],[4 0],[2 0]",
        "[3 0],[4 1],[2 0]",
        "[3 0],[4 1],[5x0]",
        "[6x0],[4 1],[5x0]",
        "[6x0],[4 1],[0x0]",
        "[6x0],[4 0],[0x0]",
        "[6 0],[4 0],[0 0]"]
    var request = [0, 1, 2, 3, 4, 4, 5, 6, 0];
    var numLinRequests = 5;
    var numChangeRequests = 3;
    var page, bp;

    var file = new File();

    var bp = new BM_BufferPool(fileName, 1, bm.ReplacementStrategy.RS_FIFO);
    var data;
    var page = new BM_PageHandle(1, data);
    bm.initBufferPool(bp, fileName, 3, bm.ReplacementStrategy.RS_FIFO, page);
    for (var i = 3; i <= 6; i++) {
        page.pageNum = request[i];
        bm.pinPage(bp, page, request[i]);
        bm.unpinPage(bp, page);
        assert.equal(true, ts.bmTestHelper(bp, poolContent[i]))
    }
    bm.shutdownBufferPool(bp);
}

function testReadStream(callback) {
    const opt = {
        flags: 'r',
        encoding: 'utf8',
        fd: null,
        mode: 0o666,
        autoClose: true,
        start: 0,
        end: 4096
    };
    var readStream = fs.createReadStream(filename, opt);
    buf = Buffer.alloc(4096);
    readStream.on('data', (chunk) => {
        buf.write(chunk, 'utf8');
    });
    readStream.on('end', () => {
        callback(buf);
    });
}

function testBP() {
    var file = new File();

    var bp = new BM_BufferPool(fileName, 1, bm.ReplacementStrategy.RS_FIFO);
    var data;
    var page = new BM_PageHandle(1, data);
    bm.initBufferPool(bp, filename, 3, bm.ReplacementStrategy.RS_FIFO, page);

    bp.dirty[0] = 1;
    bp.dirty[1] = 1;
    bp.dirty[2] = 1;

    bp.storage_page_map[0] = 0;
    bp.storage_page_map[1] = 1;
    bp.storage_page_map[2] = 2;

    bp.pageFile = filename;

    page.pageNum = 0;
    bp.data.write("1st floor", sm.PAGE_SIZE * page.pageNum, sm.PAGE_SIZE * (page.pageNum + 1));
    bm.forcePage(bp, page)

    page.pageNum = 1;
    bp.data.write("2nd floor", sm.PAGE_SIZE * page.pageNum, sm.PAGE_SIZE * (page.pageNum + 1));
    bm.forcePage(bp, page);

    page.pageNum = 2;
    bp.data.write("3rd floor", sm.PAGE_SIZE * page.pageNum, sm.PAGE_SIZE * (page.pageNum + 1));
    bm.forcePage(bp, page);
}


function testFlushPool() {
    var bp = new BM_BufferPool(filename, 1, bm.ReplacementStrategy.RS_FIFO);
    bp.numPages = 3;
    var data;
    var page = new BM_PageHandle(1, data);
    bm.initBufferPool(bp, filename, 3, bm.ReplacementStrategy.RS_FIFO, page);

    for (var i = 0; i < bp.numPages; i++) {
        bp.data.write(i + "st floor, hahahahahah", sm.PAGE_SIZE * i, sm.PAGE_SIZE * (i + 1));
    }

    bp.dirty[0] = 1;
    bp.dirty[1] = 1;
    bp.dirty[2] = 1;

    bp.storage_page_map[0] = 2;
    bp.storage_page_map[1] = 1;
    bp.storage_page_map[2] = 0;

    bm.forceFlushPool(bp);
}

function testMultiwrite() {
    var file = new File();
    buf = (Buffer.alloc(sm.PAGE_SIZE));
    buf.write('asdfasdfasdfsadfadsfadsfasd!safdfasdfasdfadsfasdfsadfasdfasdfasdfasdfasd', 0);

    writeAlong(filename, 0, buf);
    buf = (Buffer.alloc(sm.PAGE_SIZE));
    buf.write('asdfasdfasdfsadfadsfadsfasd!safdfasdfasdfadsfasdfsadfasdfasdfasdfasdfasd', 0);

    writeAlong(filename, 1, buf);
}

function forcePage2(bp, page) {
    writeAlong(bp.pageFile, page.pageNum, page.data);
}

function writeAlong(filename, pageNum, buf) {
    sm.openPageFile(filename, new File, function (err, file) {
        sm.ensureCapacity(3, file, function (err, file) {
            //buf = Buffer.alloc(sm.PAGE_SIZE, '.', sm.COING);
            sm.writeBlock(pageNum, file, buf, function (err, buf) {
                if (err) console.error(err)
                sm.closePageFile(file, function () {
                    if (err) throw err;
                });
            });
        });
    });
}





