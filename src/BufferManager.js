'use strict'
const DBErrors = require('./DBErrors'),
    mkdir = require('./mkdir'),
    BufferManager = {};

var ReplacementStrategy = {RS_FIFO:0,
  RS_LRU: 1,
  RS_CLOCK: 2,
  RS_LFU: 3,
  RS_LRU_K: 4}

function BM_BufferPool(pageFile, numPages,strategy,mgmtData){
    this.pageFile = page;
    this.numPages = numPages;
    this.strategy = strategy;
    this.mgmtData =mgmtData;

}
function BM_PageHandle(pageNum,data){
    this.pageNum = pageNum;
    this.data = data;
}


module.exports = BufferManager;