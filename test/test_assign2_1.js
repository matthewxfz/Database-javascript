'use strict';
const assert = require('assert')
    , sm = require('../src/StorageManager.js')
    , path = require('path')
    , async = require('async');

var bm = require('../src/BufferManager');
var BM_PageHandle = require('../src/BufferManagerHelper');
var BM_BufferPool = require('../src/BM_BufferPool');
var ts = require('./TestHelper');

var sleep = require('sleep')
    , File = require('../src/File')
    , util = require('../src/util')
    , fs = require('fs');


describe('Test for BufferManager', function () {
    var filename = 'testbuffer.bin',
        file = new File(),
        bp,
        page;

    before(() => {
        if (fs.existsSync(filename))
            fs.unlinkSync(filename);
        bp = new BM_BufferPool(filename, 3, bm.ReplacementStrategy.RS_FIFO);
        page = new BM_PageHandle(1, null);

        sm.createPageFile(filename, function () {
            assert.equal(true, fs.existsSync(filename));
        });
    })

    beforeEach(function () {
        page.pageNum = 0;
        page.data = 0;
    });

    describe('Create dumme page with 22 iteration', () => {
        var bp = new BM_BufferPool(filename, 3, bm.ReplacementStrategy.RS_FIFO);
        var page = new BM_PageHandle(0, 0);
        createDummePage(bp, page, 22);
    })//check dumme page

    describe('Check dumme page with 20 iteration', () => {
        var bp = new BM_BufferPool(filename, 3, bm.ReplacementStrategy.RS_FIFO);
        var page = new BM_PageHandle(0, 0);
        checkDummePage(bp, page, 20);
    })//check dumme page

    describe('Create dumme page with 10000 iteration', () => {
        var bp = new BM_BufferPool(filename, 3, bm.ReplacementStrategy.RS_FIFO);
        var page = new BM_PageHandle(0, 0);
        createDummePage(bp, page, 10000);
    })//check dumme page

    describe('Check dumme page with 10000 iteration', () => {
        var bp = new BM_BufferPool(filename, 3, bm.ReplacementStrategy.RS_FIFO);
        var page = new BM_PageHandle(0, 0);
        checkDummePage(bp, page, 10000);
    })//check dumme page


    function createDummePage(bp, ite) {
        it('Should init a init a buffer pool successfull!', () => {
            bm.initBufferPool(bp, filename, bp.numPages, bm.ReplacementStrategy.RS_FIFO);

        });

        it('Should pin, make dirty, unpin successfull for all pages ', () => {
            for (var i = 0; i < ite; i++) {
                page.pageNum = i;
                bm.pinPage(bp, page);
                bm.markDirty(bp, page);
                bm.unpinPage(bp, page);

            }
        });



        it('Should shut down page successfull', () => {
            bm.shutdownBufferPool(bp);
        })
    }

    function checkDummePage(bp, ite) {
        var bp = new BM_BufferPool(filename, 1, bm.ReplacementStrategy.RS_FIFO);
        var page = new BM_PageHandle(0, 0);
        it('should create file with ' + ite + ' successfull!', () => {
            var expect = Buffer.alloc(sm.PAGE_SIZE);
            for (var i = 0; i < ite; i++) {
                sm.safeWriteBlock(filename, Buffer.alloc(sm.PAGE_SIZE, i, 'utf8'), 0, i);
            }
        })

        it('should init a buffer pool successfull!', () => {
            bm.initBufferPool(bp, filename, 3, bm.ReplacementStrategy.RS_FIFO, page);
        })

        it('should pin page with with corrent file block content in the buffer', () => {
            for (var i = 0; i < ite; i++) {
                page.pageNum = i;
                bm.pinPage(bp, page);
                sm.safeReadBlock(filename, expect, page.data, page.pageNum);
                bm.unpinPage(bp, page);
                var corBuf = bp.data.slice(page.data * sm.PAGE_SIZE, (page.data + 1) * sm.PAGE_SIZE);
                console.log(corBuf.compare(expect));
            }
        })
    }


    describe('FIFO test', function () {
        var poolContents = [
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
        var requests = [0, 1, 2, 3, 4, 4, 5, 6, 0];
        var numLinRequests = 5;
        var numChangeRequests = 3;
        var page, bp;

        before(() => {
            bp = new BM_BufferPool(filename, 3, bm.ReplacementStrategy.RS_FIFO);
            page = new BM_PageHandle(0, 0);
        })


        //var ts = new TestHelper();
        it('Should init a init a buffer pool successfull!', () => {
            bm.initBufferPool(bp, filename, 3, bm.ReplacementStrategy.RS_FIFO);
        });


        it('Should return true', () => {
            for (var i = 0; i < numLinRequests; i++) {
                page.pageNum = requests[i];
                bm.pinPage(bp, page);
                bm.unpinPage(bp, page);

                assert.equal(true, ts.bmTestHelper(bp, poolContents[i]));
            }
        })

        it('Should return true by pin one page', () => {
            var i = numLinRequests;
            page.pageNum = requests[i];
            bm.pinPage(bp, page);
            assert.equal(true, ts.bmTestHelper(bp, poolContents[i]));
        })

        it('Should return true by reading page and marking them dirty', () => {
            for (var i = numLinRequests + 1; i < numLinRequests + numChangeRequests + 1; i++) {
                page.pageNum = requests[i];
                bm.pinPage(bp, page);
                bm.markDirty(bp, page);
                bm.unpinPage(bp, page);
                assert.equal(true, ts.bmTestHelper(bp, poolContents[i]));
            }
        })

        it('Should return true after unpin last page', () => {
            var i = numLinRequests + numChangeRequests + 1;
            page.pageNum = 4;
            bm.unpinPage(bp, page);
            assert.equal(true, ts.bmTestHelper(bp, poolContents[i]));
            i++;
            bm.forceFlushPool(bp);
            assert.equal(false, ts.bmTestHelper(bp, poolContents[i]));
        })

        it('Should return 3 for writeIO and 8 for readIO', () => {
            sleep.msleep(10);
            assert.equal(3, bm.getNumWriteIO(bp));
            assert.equal(8, bm.getNumReadIO(bp));
        })

        it('Should shut down page successfull', () => {
            bm.shutdownBufferPool(bp);
        })
    })

    describe('LRU test', function () {
        var bp = new BM_BufferPool(filename, 3, bm.ReplacementStrategy.RS_FIFO);
        var page = new BM_PageHandle(0, 0);
        const poolContents = [
            // read first five pages and directly unpin them
            '[0 0],[-1 0],[-1 0],[-1 0],[-1 0]',
            '[0 0],[1 0],[-1 0],[-1 0],[-1 0]',
            '[0 0],[1 0],[2 0],[-1 0],[-1 0]',
            '[0 0],[1 0],[2 0],[3 0],[-1 0]',
            '[0 0],[1 0],[2 0],[3 0],[4 0]',
            // use some of the page to create a fixed LRU order without changing pool content
            '[0 0],[1 0],[2 0],[3 0],[4 0]',
            '[0 0],[1 0],[2 0],[3 0],[4 0]',
            '[0 0],[1 0],[2 0],[3 0],[4 0]',
            '[0 0],[1 0],[2 0],[3 0],[4 0]',
            '[0 0],[1 0],[2 0],[3 0],[4 0]',
            // check that pages get evicted in LRU order
            '[0 0],[1 0],[2 0],[5 0],[4 0]',
            '[0 0],[1 0],[2 0],[5 0],[6 0]',
            '[7 0],[1 0],[2 0],[5 0],[6 0]',
            '[7 0],[1 0],[8 0],[5 0],[6 0]',
            '[7 0],[9 0],[8 0],[5 0],[6 0]'
        ]
        const orderRequests = [3, 4, 0, 2, 1]
        const numLRUOrderChange = 5
        var snapshot = 0;
        it('Should init a init a buffer pool successfull!', () => {
            bm.initBufferPool(bp, filename, 5, bm.ReplacementStrategy.RS_LRU)
        })

        it('Should return true by reading first five pages with direct unpin and no modifications', () => {
            for (var i = 0; i < 5; i++) {
                page.pageNum = i;
                bm.pinPage(bp, page)
                bm.unpinPage(bp, page)
                assert.equal(true, ts.bmTestHelper(bp, poolContents[snapshot++]));
            }
        })

        it('Should return true by reading pages to change LRU order', () => {
            for (var i = 0; i < numLRUOrderChange; i++) {
                page.pageNum = orderRequests[i];
                bm.pinPage(bp, page)
                bm.unpinPage(bp, page)
                assert.equal(true, ts.bmTestHelper(bp, poolContents[snapshot++]));
            }
        })

        it('Should return true by replacing pages and check that it happens in LRU order', () => {
            for (var i = 0; i < 5; i++) {
                page.pageNum = 5 + i;
                bm.pinPage(bp, page)
                bm.unpinPage(bp, page)
                assert.equal(true, ts.bmTestHelper(bp, poolContents[snapshot++]));
            }
        })

        it('Should return 0 of numwriteIO and 10 of numreadIO', () => {
            assert.equal(0, bm.getNumWriteIO(bp));
            assert.equal(10, bm.getNumReadIO(bp));
        })

        it('Should shut down page successfull', () => {
            bm.shutdownBufferPool(bp)
        })
    })
})
