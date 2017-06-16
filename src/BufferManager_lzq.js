var sm = require('../src/StorageManager.js'),
	bm = require('../src/BufferManager.js');

/*
Replacement strategy: FIFO
@param bm: bufferpool
@param bmHandle: to handle the information of requested page
@param PageNum: the requested pagenumber
return: bmHandle
*/
function FIFO(bm,bmHandle,PageNum){
	var pagelist = bm.mgmtData;
	/*
	The requested page is found in the bufferpool,return bmhandle
	*/
	if(searchPage(bm,bmHandle,PageNum)){
		console.log('Page Found!');
		return bmHandle;
	}
	/*
	The requested page is not found in the bufferpool,if the bufferpool is not full,
	append the page at the end of the bufferpool,otherwise,replace the page in bufferpool
	with FIFO strategy.	
	*/
	if(pagelist.size < bm.numPages){
		appendPage(bm,bmHandle,pageNum);
	}else{
		pagelist.current = pagelist.head;
		while(pagelist.current != null || pagelist.current.fixCount != 0){
			pagelist.current = pagelist.current.next;
		}
		if(pagelist.current == null)
			return DBErrors.RC_NO_PAGE_REMOVEALBE
		replacePage(pagelist,bmHandle,pageNum);
	}
	return bmHandle;
}
/*
Method to search the requested page in bufferpool
@param bm: bufferpool
@param bmHandle: handle the information about the page if it is found
@param pageNum: the requested pageNumber
return: boolean value
*/
function searchPage(bm,bmHandle,pageNum){
	var pagelist = bm.mgmtData;
	/*
	searching the whole pagelist to find the requested page, 
	put information of the page into bmhandle and return true,
	otherwise, return false
	*/
	pagelist.current = pagelist.head;
	while(pagelist.current != null && pagelist.current.pageNum != PageNum){
		pagelist.current = pagelist.current.next;
	}
	//check if the page is found
	if(pagelit.current == null)
		return false;
	/*
	the requested page is found
	put information of the page into bmhandle
	fixCount and numReadIO increase by 1
	*/
	bmHandle.pageNum = pagelist.current.pageNum;
	bmHandle.data = pagelist.current.data;
	pagelist.current.numReadIO++;
	return true;
}
/*
Method to add new page at the end of pagelist if pagelist is not empty,
otherwise,add new page as the head of pagelist
@param bm: bufferpool
@param bmHandle: handle the information of page to add
@param pageNum: the requested pageNumber
*/
function appendPage(bm,bmHandle,pageNum){
	var pagelist = bm.mgmtData;
	file.curPagePos = pageNum;
	//open pagefile and read the requested page into bufferpool
	sm.openPageFile(bm.pageFile,file,function(){
		sm.readCurrentBlock(file,Buffer.alloc(PAGE_SIZE,' ',uft8),function(err,rbuf){
			if(err) throw err;
			var page = new pageFrame();
				bmHandle.data = rbuf;
				bmHandle.pageNum = pageNum;
				page.page = bmHandle;
				page.fixCount++;
				page.numReadIO++;
			/*
			if the pagelist is empty,put new page as the head of pagelist,
			otherwise,add new page at the end of pagelist
			*/
			if(pagelist.size == 0){
				pagelist.head = pagelist.tail = page;
			}else{
				page.previous = pagelist.tail;
				pagelist.tail.next = page;
				pagelist.tail = pagelist.tail.next;
			}
			sm.closePageFile(bm.pageFile);
		})	
	})
}
/*
Method to replace page in pagelist.
if the page is dirty,write it into file then replace it,
otherwise,replace it.
@param bm: bufferpool
@param bmHandle: handle the info of request page
@param pageNum: the requested pageNumber
*/
function replacePage(bm,bmHandle,pageNum) {
	var pagelist = bm.mgmtData;
	/*
	if the current page is dirty,open pagefile and write it into pagefile
	*/
	if(pagelist.current.dirty == true){
		sm.openPageFile(fileName,file,function() {
			var buf = Buffer.alloc(PAGE_SIZE,pagelist.current.page.data,uft8);
			buf[PAGE_SIZE - 1] = '/0';
			sm.writeBlock(file.totalPageNumber - 1, file, buf, function() {
				pagelist.current.numWriteIO++;
				pagelist.current.fixCount++;
				sm.closePageFile(file);
			});
		});
	}
	sleep.mslsleep(1);
	/*
	open pagefile and read requested page and replace the page in pagelist
	*/
	sm.openPageFile(bm.pageFile,file,function(){
		sm.readCurrentBlock(file,Buffer.alloc(PAGE_SIZE,' ',uft8),function(err,rbuf){
			if(err) throw err;
			var page = new pageFrame();
				bmHandle.data = rbuf;
				bmHandle.pageNum = pageNum;
				page.page = bmHandle;
				page.fixCount++;
				page.numReadIO++;
			/*
			if the replaced page is not the tail of pagelist,
			move the page into the tail of pagelist
			*/
			if(pagelist.current != pagelist.tail){
			pagelist.current.next.previous = pagelist.current.previous;
			pagelist.current.previous.next = pagelist.current.next;
			pagelist.current.previous = pagelist.tail;
			pagelist.current.next = null;
			pagelist.tail = pagelist.tail.next;
			}
			pagelist.current.page.data = bmHandle.data;
			pagelist.current.page.pageNum = bmHandle.pageNum;
			pagelist.current.fixCount = 1;
			pagelist.current.numReadIO = 1;
			pagelist.current.numWriteIO = 0;
			pagelist.dirty = false;
			sm.closePageFile(bm.pageFile);
		})
	})
	
}
/*
Replacement strategy: LRU
@param bm: bufferpool
@param bmHandle: handle the requested page
@param pageNum: the requested pageNumber
*/
function LRU(bm,bmHandle,pageNum){
	var pagelist = bm.mgmtData;
	/*
	if the requested page is found,return the info of the page
	and move this page to be the end of pagelist
	*/
	if(searchPage(bm,bmHandle,pageNum)){
		pagelist.current.previous.next = pagelist.current.next;
		pagelist.current.next.previous = pagelist.current.previous;
		pagelist.current.previous = pagelist.tail.next;
		pagelist.current.next = null;
		pagelist.tail = pagelist.tail.next;
		return bmHandle;
	}
	if(pagelist.size < bm.numPages){
		appendPage(bm,bmHandle,pageNum);
	}else{
		/*
		if the requested page is not in pagelist,then looking for
		the least recently used page
		*/
		pagelist.current = pagelist.head;
		while(pagelist.current != null && pagelist.current.fixCount != 0){
		pagelist.current = pagelist.current.next;
		}
		/*
		No removeable page is found
		*/
		if(pagelist.current == null)
			return RC_NO_PAGE_REMOVEALBE;
		/*
		Removeable page is found
		*/
		replacePage(pagelist,bmHandle,pageNum);

	}
	return bmHandle;	
}

function initBufferPool(bm,fileName,numPages,strategy,mgmtData){
	bm.pageFile = fileName;
	bm.numPages = numPages;
	bm.strategy = strategy;
	bm.mgmtData = mgmtData;
}

function shutdownBufferPool(bm){
	pagelist = bm.mgmtData;
	pagelist.current = pagelist.head;
	file.curPagePos = 0;
	forceFlushPool(bm);
}
/*
Method to write all dirty page into pagefile
@param bm: bufferpool
*/
function forceFlushPool(bm){
	sm.openPageFile(bm.pageFile,file,function(){
		while(pagelist.current != null){
			if(pagelist.current.dirty == true){
				sm.writeCurrentBlock(file,pagelist.current.page.data,function(err){
					if(err) throw err;
				});
				file.curPagePos++;
			}
		}
		sm.closePageFile(bm.pageFile);
	});
}
/*
Method to pin a page
@param bm: bufferpool
@param bmHandle: handle the requested page
@param pageNum: the requested pageNumber
*/
function pinPage(bm,bmHandle,pageNum){
	if(bm.strategy == 0){
		FIFO(bm,bmHandle,PageNum);
	}else if(bm.strategy == 1){
		LRU(bm,bmHandle,pageNum)
	}
}
/*
Method to pin a page
@param bm: bufferpool
@param bmHandle: handle the requested page
*/
function unpinPage(bm,bmHandle){
	var pagelist = bm.mgmtData;	
	if(searchPage(pagelist,bmHandle,bmHandle.pageNum)){
		pagelist.current.fixCount--;
	}
}