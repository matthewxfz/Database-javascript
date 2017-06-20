'use strict';
const assert = require('assert')
    , sm = require('../src/StorageManager.js')
    , path = require('path')
    , async = require('async');

var bm = require('../src/BufferManager');
var BM_PageHandle = require('../src/BufferManagerHelper');
var BM_BufferPool = require('../src/BM_BufferPool');
var ts = require('./TestHelper.js');

var sleep = require('sleep')
    , File = require('../src/File')
    , util = require('../src/util')
    , fs = require('fs');


describe('Test for BufferManager, FIFO', function () {
    var filename = 'testbuffer.bin',
        file = new File(),
        bp,
        page;

    before(() => {
        if (fs.existsSync(filename))
            fs.unlinkSync(filename);
         bp = new BM_BufferPool(filename, 1, bm.ReplacementStrategy.RS_FIFO);
         page = new BM_PageHandle(1, null);

        sm.createPageFile(filename, function () {
            assert.equal(true, fs.existsSync(filename));
        });
    })

    // describe('Create dumme page', () => {
    //     it('Should init a init a buffer pool successfull!', () => {
    //         bm.initBufferPool(bp, filename, 3, bm.ReplacementStrategy.RS_FIFO);

    //     });

    //     it('Should pin, make dirty, unpin successfull for all pages ', () => {
    //         for (var i = 0; i < bp.numPages; i++) {
    //             page.pageNum = i;
    //             bm.pinPage(bp, page, i);
    //             console.log('Page, '+page.pageNum+', '+page.data);
    //             bm.markDirty(bp,page);
    //             bm.unpinPage(bp,page);

    //             console.log(bp.data.toString());
    //         }
    //     });

    //     it('Should shut down page successfull',()=>{
    //         bm.shutdownBufferPool(bp);
    //     })
    // })// create dumme page

     describe('Create dumme page', () => {
        it('Should init a init a buffer pool successfull!', () => {
            bm.initBufferPool(bp, filename, 3, bm.ReplacementStrategy.RS_FIFO);

        });

        it('Should pin, make dirty, unpin successfull for all pages ', () => {
            for (var i = 0; i < bp.numPages; i++) {
                page.pageNum = i;
                bm.pinPage(bp, page, i);
                console.log('Page, '+page.pageNum+', '+page.data);
                bm.markDirty(bp,page);
                bm.unpinPage(bp,page);
                console.log(bp.data.toString());
            }
        });

        it('Should shut down page successfull',()=>{
            bm.shutdownBufferPool(bp);
        })
    })//check dumme page

    describe('FIFO test',function() {
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
        var request = [0,1,2,3,4,4,5,6,0];
        var numLinRequests = 5;
        var numChangeRequests = 3
        it('Should init a init a buffer pool successfull!', () => {
            bm.initBufferPool(bp, filename, 3, bm.ReplacementStrategy.RS_FIFO);
        });
            

        it('Should return true',() => {
            for(var i = 3;i <= 6;i++){
                page.pageNum = request[i];
                bm.pinPage(bp,page,request[i]);
                bm.unpinPage(bp,page);
                assert.equal(true,ts.bmTestHelper(bp,poolContent[i]))
            }
        })

        it('Should return true by pin one page',() => {
            var i = numLinRequests;
            page.pageNum = request[i];
            bm.pinPage(bp,page,request[i]);
            assert.equal(true,ts.bmTestHelper(bp,poolContent[i]));
        })

        it('Should return true by reading page and marking them dirty',() => {
            for(var i = numLinRequests+1;i < numLinRequests + numChangeRequests;i++){
                page.pageNum = i;
                bm.pinPage(bp,page,i);
                bm.markDirty(bp,page);
                bm.unpinPage(bp,page);
                assert.equal(true,ts.bmTestHelper(bp,poolContent[i]));
            } 
        })

        it('Should return true after unpin last page',() => {
            var i = numLinRequests + numChangeRequests + 1;
            page.pageNum = 4;
            bm.unpinPage(bp,page);
            assert.equal(true,ts.bmTestHelper(bp,poolContent[i]));
            i++;
            bm.forceFlushPool(bp);
            assert.equal(false,ts.bmTestHelper(bp,poolContent[i]));
        })

        it('Should return 3 for writeIO and 8 for readIO',() => {
            assert.equal(3,bm.getNumWriteIO(bp));
            assert.equal(8,bm.getNumReadIO(bp));
        })

        it('Should shut down page successfull',()=>{
            bm.shutdownBufferPool(bp);
        })
    })



})