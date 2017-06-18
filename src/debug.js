'use strict';
var sm = require('./StorageManager')
    , fs = require('fs')
    , File = require('./File')
    , util = require('./util'),
    assert = require('assert');

var bm = require('./BufferManager');
var BM_PageHandle = require('./BufferManagerHelper');

var LoopQueue = require('./LoopQueue'),
    Heap = require('heap');

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

function testBP() {
    var file = new File();

    var bp = new BM_BufferPool(fileName, 1, bm.ReplacementStrategy.RS_FIFO);
    var data;
    var page = new BM_PageHandle(1, data);
    bm.initBufferPool(bp, fileName, 3, bm.ReplacementStrategy.RS_FIFO, page);

    bp.dirty[0] = 1;
    bp.dirty[1] = 1;
    bp.dirty[2] = 1;

    bp.storage_page_map[0] = 0;
    bp.storage_page_map[1] = 1;
    bp.storage_page_map[2] = 2;

    bp.pageFile = filename;

    page.pageNum = 0;
    page.data.write("1st floor", sm.PAGE_SIZE * page.pageNum,sm.PAGE_SIZE * (page.pageNum+1));
     bm.forcePage(bp, page)

    page.pageNum = 1;
    page.data.write("2nd floor", sm.PAGE_SIZE * page.pageNum,sm.PAGE_SIZE * (page.pageNum+1));
    bm.forcePage(bp, page);

    page.pageNum = 2;
    // page.data = (Buffer.alloc(sm.PAGE_SIZE));
    // page.data.write('222222222222', 0);
    page.data.write("3rd floor", sm.PAGE_SIZE * page.pageNum,sm.PAGE_SIZE * (page.pageNum+1));
     bm.forcePage(bp, page);
}

testBP();

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
    writeAlong(bp.pageFile,page.pageNum, page.data);
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





