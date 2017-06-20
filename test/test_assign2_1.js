'use strict';
const assert = require('assert')
    , sm = require('../src/StorageManager.js')
    , path = require('path')
    , async = require('async');

var bm = require('../src/BufferManager');
var BM_PageHandle = require('../src/BufferManagerHelper');
var BM_BufferPool = require('../src/BM_BufferPool');
var TestHelper = require('./TestHelper.js');

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

    describe('Create dumme page with 20 iteration', () => {
        var bp = new BM_BufferPool(filename, 3, bm.ReplacementStrategy.RS_FIFO);
        var page = new BM_PageHandle(0, 0);
        createDummePage(bp, page, 22);
    })//check dumme page

    describe('Check dumme page with 20 iteration', () => {
        var bp = new BM_BufferPool(filename, 3, bm.ReplacementStrategy.RS_FIFO);
        var page = new BM_PageHandle(0, 0);
        checkDummePage(bp, page, 20);
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
        var ts = new TestHelper();
        it('Should init a init a buffer pool successfull!', () => {
            bm.initBufferPool(bp, filename, 3, bm.ReplacementStrategy.RS_FIFO);
        });


        it('Should return true', () => {
            for (var i = 3; i <= 6; i++) {
                page.pageNum = request[i];
                bm.pinPage(bp, page, request[i]);
                bm.unpinPage(bp, page);
                assert.equal(true, ts.bmTestHelper(bp, poolContent[i]))
            }
        })

        it('Should return true by pin one page', () => {
            var i = numLinRequests;
            page.pageNum = request[i];
            bm.pinPage(bp, page, request[i]);
            assert.equal(true, ts.bmTestHelper(bp, poolContent[i]));
        })

        it('Should return true by reading page and marking them dirty', () => {
            for (var i = numLinRequests + 1; i < numLinRequests + numChangeRequests; i++) {
                page.pageNum = i;
                bm.pinPage(bp, page, i);
                bm.markDirty(bp, page);
                bm.unpinPage(bp, page);
                assert.equal(true, ts.bmTestHelper(bp, poolContent[i]));
            }
        })

        it('Should return true after unpin last page', () => {
            var i = numLinRequests + numChangeRequests + 1;
            page.pageNum = 4;
            bm.unpinPage(bp, page);
            assert.equal(true, ts.bmTestHelper(bp, poolContent[i]));
            i++;
            bm.forceFlushPool(bp);
            assert.equal(false, ts.bmTestHelper(bp, poolContent[i]));
        })

        it('Should return 3 for writeIO and 8 for readIO', () => {
            assert.equal(3, bm.getNumWriteIO(bp));
            assert.equal(8, bm.getNumReadIO(bp));
        })

        it('Should shut down page successfull', () => {
            bm.shutdownBufferPool(bp);
        })
    })



})
