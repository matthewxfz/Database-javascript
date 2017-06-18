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
var filename = 'file.test',
    fileName = "/Users/matthewxfz/Workspaces/tmp/write.test",
    fileName2 = "/Users/matthewxfz/Workspaces/tmp/fake.test",
    file,
    buf;
var fd = fs.openSync(filename, 'w+');
function BM_BufferPool(pageFile, numPages, strategy, mgmtData) {
    this.pageFile = pageFile;
    this.numPages = numPages;
    this.strategy = strategy;
    this.mgmtData = mgmtData;
}


file = new File(fd, '', '', 2, 0);


buf = Buffer.allocUnsafe(4096);
for (var i = 0; i < 256; i++) {
    buf.write('0123456789abcdef', i * 16);
}

if (fs.existsSync(filename))
    fs.unlinkSync(filename);

sm.createPageFile(filename, function (fd) {
    // sm.openPageFile(filename, file, function (err, file) {
    //     console.log(file.totalPageNumber);
    //     sm.readFirstBlock(file, Buffer.alloc(sm.PAGE_SIZE), function (err, memPage) {
    //         console.log(memPage[0]);
    //     });
    //     sm.ensureCapacity(3, file, function (err, memPage) {
    //         console.log(file.totalPageNumber);
    //     })
    // });
    sm.openPageFile(filename, file, function () {
        sm.ensureCapacity(3, file, function (err, memPage) {
            //console.log('ensure'+file.totalPageNumber + ', ' + file.fileName);
            assert.equal(3, file.totalPageNumber);
            buf = Buffer.alloc(sm.PAGE_SIZE, 'a', sm.COING);
            sm.writeBlock(0, file, buf, function (err, buf) {
                if (err) console.error(err)
                else {
                    assert('a', buf[0]);
                    buf = Buffer.alloc(sm.PAGE_SIZE, 'b', sm.COING);
                    sm.writeBlock(1, file, buf, function (err, buf) {
                        if (err) console.error(err)
                        else {
                            assert('b', buf[4096]);
                            buf = Buffer.alloc(sm.PAGE_SIZE, 'c', sm.COING);
                            sm.writeBlock(2, file, buf, function (err, buf) {
                                if (err) console.error(err)
                                else {
                                    assert('c', buf[4096 * 2]);
                                }
                            });
                        }
                    });
                }

            });//sm.write
        });//open file
    })

    fs.close(file.fd);
});



var dirty;
var map;
var fixcount;

var bp = new BM_BufferPool(fileName, 1, bm.ReplacementStrategy.RS_FIFO, map, dirty, fixcount);
var data;
var page = new BM_PageHandle(1, data);
bm.initBufferPool(bp, fileName, 3, bm.ReplacementStrategy.RS_FIFO, page);

page.pageNum = 0;
page.data.write("Buffer write, force page test", sm.PAGE_SIZE * page.pageNum);
bp.dirty[1] = 1;
bp.storage_page_map[0] = 0;
bp.storage_page_map[1] = 1;
//bm.forcePage(bp, page) 
// fs.open(filename,'w+',function(err,fd){
//     buf = Buffer.alloc(sm.PAGE_SIZE, '?', sm.COING);
//     fs.write(fd, buf, page.pageNum*4096, 4096 * page.pageNum, function (err, bytesWritten, buffer) {
//            if(err) throw err;
//            else{
//               //console.log(buf.toString('utf8'));
//            }
//            fs.close(fd);
//         });
// })
sm.openPageFile('/Users/matthewxfz/Workspaces/gits/Database-javascript/file.test', file, function (err, file) {
    buf = Buffer.alloc(sm.PAGE_SIZE, '?', sm.COING);
    sm.writeBlock(0, file, buf, function (err, buf) {
        if (err) console.error(err)
    });
});

// async.waterfall([
//     function (callback) {
//         sm.openPageFile(fileName2, file,function(err){
//              if(err){
//                  console.error(err);
//              }else{
//                 callback(null, file);
//              }
//         });
//     },
//     function (file, callback) {
//         console.log('file: ' + file.fd + ', ' + file.fileName);
//         callback(null,file);
//     },
//     function(file,callback){
//        sm.closePageFile(file,function(){
//          callback(null,file);
//        })
//     },
//     function(file,callback){
//        sm.destroyPageFile(file,function(){
//            console.log(file.fileName)
//          callback(null);
//        })
//     },
// ], function (err, results) {
//     console.error(err);
// });