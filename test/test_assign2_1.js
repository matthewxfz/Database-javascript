'use strict';
const assert = require('assert')
    , sm = require('../src/StorageManager.js')
    , path = require('path')
    , async = require('async');

var bm = require('../src/BufferManager');
var BM_PageHandle = require('../src/BufferManagerHelper');
var BM_BufferPool = require('../src/BM_BufferPool');


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

    describe('Creaet dumme page', () => {
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
    })// create dumme page

     describe('Creaet dumme page', () => {
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



})
