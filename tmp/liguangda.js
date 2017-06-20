'use strict'
const DBErrors = require('../src/dbErrors.js'),
    sm = require('../src/StorageManager.js'),
    BufferManager = {};
var NumRead,NumWrite,flag;
var FIFO = new Queue();

 var ReplacementStrategy = {
  RS_FIFO:0,
  RS_LRU: 1,
  RS_CLOCK: 2,
  RS_LFU: 3,
  RS_LRU_K: 4}

 var Bufferhandle=function(){
  var buffer_page;
  var storge_page;
  var dirty ;
  var pin;
}

 BufferManager.BM_BufferPool=function(){
    var pageFile ;
    var numPages ; 
    var strategy ; 
    var mgmtData ;
    var mgmtData2 ;

}
BufferManager.BM_PageHandle=function(pageNum,data){
    this.pageNum = pageNum;
    this.data = data;
}

function Queue(){
  var a=[],b=0;
  this.getLength=function(){return a.length-b};
  this.isEmpty=function(){return 0==a.length};
  this.enqueue=function(b){a.push(b)};
  this.dequeue=function(){if(0!=a.length)
    {var c=a[b];2*++b>=a.length&&(a=a.slice(b),b=0);return c}};
  this.peek=function(){return 0<a.length?a[b]:void 0}
};

BufferManager.searchPage = function(bp,page){
  var location;
  for(var i=0;i<bp.numPages;i++){
    if(bp.mgmtData2[i].storge_page = page.pageNum)
      location = bp.mgetData2[i].buffer_page;
      return location
  }
  return -1;
}
  // Buffer Manager Interface Pool Handling
  BufferManager.initBufferPool = function(bp,pageFileName, numPages, strategy,stratData){
    bp.pageFile = pageFileName;
    bp.numPages = numPages;
    bp.strategy = strategy;
    bp.mgmtData = new Buffer.alloc(4096*numPages);
    bp.mgmtData2 = []
    NumRead = 0;
    NumWrite = 0;
    for(var i=0;i<numPages;i++){
      bp.mgmtData2[i]=new Bufferhandle();
    }
  }

  BufferManager.shutdownBufferPool = function(bp,callback){
   if (bp.mgmtData=null) callback(new DBErrors('Buffer pool Not Exist!', DBErrors.type.RC_FILE_NOT_FOUND));
   for(var i=0;i<bp.numPages;i++){
      if (bp.mgmtData2[i].pin >0) callback(new DBErrors('Some buffer still pin!'))
    bp.pageFile = null;
    bp.numPages = null;
    bp.strategy = null;
    NumRead = null;
    NumWrite = null;
    bp.mgmtData = null;
    bp.mgmtData2 = null;
    }


  }
  BufferManager.forceFlushPool=function(bp){

  }

  // Buffer Manager Interface Access Pages
  BufferManager.markDirty=function(bp,page){
    var location = BufferManager.searchPage(bp,page);
    bp.mgmtData2[location].dirty = false;
  }

  BufferManager.unpinPage = function(bp,page){
    var location = searchPage(bp,page);
    bp.mgmtData2[location].pin -= 1;
  }
  BufferManager.forcePage = function(bp,page){

  }
  BufferManager.pinPage = function(bp,page,pageNum){
    if(FIFO.length=0){
      flag=0;
      sm.readBlock(pageNum, bp.pageFile,bp.mgmtData.slice(0,4095));
      FIFO.enqueue(flag);
      bp.mgmtData2[flag].buffer_page=flag;
      bp.mgmtData2[flag].storge_page=pageNum;
      bp.mgmtData2[flag].dirty = false;
      bp.mgmtData2[flag].pin = 1;
      NumRead +=1;
    }

    if (FIFO.length>0 && FIFO.length<bp.numPages){
      var location, find =false ;
      for(var i=0;i<bp.numPages;i++){
        if(bp.mgmtData2[i].storge_page = pageNum){
          location = bp.mgmtData2[i].buffer_page;
          bp.mgmtData2[location].pin += 1;
          find = true;

        }
      }
      if(find == false){
        flag +=1;
        sm.readBlock(pageNum, bp.pageFile,bp.mgmtData.slice(0+flag*4096,4095+flag*4096));
        FIFO.enqueue(flag);
        bp.mgmtData2[flag].buffer_page=flag;
        bp.mgmtData2[flag].storge_page=pageNum;
        bp.mgmtData2[flag].dirty = false;
        bp.mgmtData2[flag].pin += 1;
        NumRead +=1;

      }

    }
    if(FIFO.length = bp.numPages){
      var location, find =false ;
      for(var i=0;i<bp.numPages;i++){
        if(bp.mgmtData2[i].storge_page = pageNum){
          location = bp.mgmtData2[i].buffer_page;
          bp.mgmtData2[location].pin += 1;
          find = true;
        }
      }
      if(find=false){
        flag = FIFO.dequeue();
        sm.readBlock(pageNum, bp.pageFile,bp.mgmtData.slice(0+flag*4096,4095+flag*4096));
        FIFO.enqueue(flag);
        bp.mgmtData2[flag].buffer_page=flag;
        bp.mgmtData2[flag].storge_page=pageNum;
        bp.mgmtData2[flag].dirty = false;
        bp.mgmtData2[flag].pin =1 ;
        NumRead +=1;
      }

    }
  }
//Statistics Interface
BufferManager.getFrameContents = function(bp){
  var list = [];
  for(var i=0;i<bp.numPages;i++){
    if(bp.mgmtData2[i].storge_page !=null){
      list[i]=bp.mgmtData2[i].storge_page;
    }
    else{
      list[i]='NO_PAGE';
    }
  }
  return list;

}
BufferManager.getDirtyFlags = function(bp){
  var list = [];
  for(var i=0;i<bp.numPages;i++){
    if(bp.mgmtData2[i].storge_page !=null){
      list[i]=bp.mgmtData2[i].dirty;
    }
    else{
      list[i]=false;
    }
  }
  return list;

}
BufferManager.getFixCounts = function(bp){
  var list = [];
  for(var i=0;i<bp.numPages;i++){
    if(bp.mgmtData2[i].storge_page !=null){
      list[i]=bp.mgmtData2[i].pin;
    }
    else{
      list[i]=0;
    }
  }
  return list;

}

BufferManager.getNumReadIO = function(bp){
  return NumRead;

}

BufferManager.getNumWriteIO = function(bp){
  return NumWrite;

}
 

module.exports = BufferManager;