'use strict'
const DBErrors = require('./DBErrors'),
	mkdirp = require('mkdirp'),
	async = require('async'),
	path = require('path'),
	BufferManager = {},
	fs = require('fs'),
	assert = require('assert'),
	sm = require('./StorageManager');

var ReplacementStrategy = {
	RS_FIFO: 0,
	RS_LRU: 1,
	RS_CLOCK: 2,
	RS_LFU: 3,
	RS_LRU_K: 4
},
	PAGE_SIZE = sm.PAGE_SIZE,
	CODING = sm.CODING,
	Heap = require('heap'),
	LoopQueue = require('./LoopQueue');

/**
 * Element of the pageData array, describe extral information of page.
 * 
 * @param {any} storagePage 
 * @param {any} dirty 
 * @param {any} fixcount 
 */
var pageInfo = function (storagePage, dirty, fixcount) {
	var storge_page;
	var dirty;
	var fixcount;
}

/**
 * tores information about a buffer pool: 
 * the name of the page file associated with the buffer pool (pageFile), 
 * the size of the buffer pool, i.e., the number of page frames (numPages), 
 * the page replacement strategy (strategy), and a pointer to bookkeeping data (mgmtData). 
 * mgmData is an array that use the first one byte of   
 * 
 * @param {string} pageFile 
 * @param {int} numPages -number of pages in total
 * @param {ReplacementStrategy} strategy 
 * @param {Array[]} storage_page_map
 * @param {Array[]} dirty
 * @param {Array[]} fixcount
 *  
 */
function BM_BufferPool(pageFile, numPages, strategy, storage_page_map, dirty, fixcount) {
	this.pageFile = page;
	this.numPages = numPages;
	this.strategy = strategy;
	this.storage_page_map = storage_page_map;
	this.dirty = dirty;
	this.fixcount = fixcount;
}

BM_BufferPool.toString = function () {
	return 'hello ' + pageFile + ', ' + numPages + ', ' + strategy + ', ' + storage_page_map.toString() + ', ' + dirty.toString() + ', ' + fixcount.toString();
}
/**
 *The BM_PageHandle stores information about a page. 
 *The page number (position of the page in the page file) is stored in pageNum. 
 *The page number of the first data page in a page file is 0. The data field points to the area in memory storing the content of the page. This will usually be a page frame from your buffer pool.
 * 
 * @param {any} pageNum 
 */
function BM_PageHandle(pageNum) {
	this.pageNum = pageNum;
}

/**
 *  creates a new buffer pool with numPages page frames using the page replacement strategy strategy. 
 * The pool is used to cache pages from the page file with name pageFileName. 
 * Initially, all page frames should be empty. 
 * The page file should already exist, i.e., this method should not generate a new page file. 
 * stratData can be used to pass parameters for the page replacement strategy. 
 * 
 * @param {BM_BufferPool} bp 
 * @param {char} pageFileName path to the file
 * @param {int} numPages 
 * @param {ReplacementStrategy} strategy 
 * @param {any} stratData 
 */
BufferManager.initBufferPool = function (bp, pageFileName, numPages, strategy, startData) {
	var fd;
	try {
		fd = fs.openSync(pageFileName, 'w+');
		bp.pageFile = pageFileName;
		switch (bp.strategy) {
			case 0:
				bp.queue = new Array(numPages);
				break;
			case 1:
				bp.heap = new Heap();
				break;
			case 2:
				bp.loopQueue = new LoopQueue(numPages);
				break;
			default:
		}
		bq.queueLength = 0;
		if (strategy < 0 || strategy > 3) {
			throw new DBErrors('No such strategy!', DBErrors.type.RC_RM_UNKOWN_DATATYPE);
		} else {
			bp.strategy = strategy;
			try {
				bp.numPages = numPages;
				initSpace(numPages, startData, bp);
			} catch (error) {
				throw error;
			}
		}
	} catch (error) {
		throw error;
	}
}

function initSpace(numPages, startData, bp) {
	startData = Buffer.alloc(sm.PAGE_SIZE * numPages, ' ', sm.CODING);
	bp.storage_page_map = new Array(numPages);
	bp.fixcount = new Array(numPages);
	bp.dirty = new Array(numPages);
}

/**
 * destroys a buffer pool. 
 * This method should free up all resources associated with buffer pool. 
 * For example, it should free the memory allocated for page frames. 
 * If the buffer pool contains any dirty pages, then these pages should be written back to disk before destroying the pool. 
 * It is an error to shutdown a buffer pool that has pinned pages.
 * 
 * @param {any} bp 
 * @param {any} callback 
 */
BufferManager.shutdownBufferPool = function (bp) {
	if (bp.mgmtData = undefined)
		throw new DBErrors('Buffer pool Not defined!');
	else
		//check if there is pin page
		for (var i = 0; i < bp.fixcount.length; i++) {
			if (bo.fixcount[i] != 0) {
				throw DBErrors('Still one page is pinned!');
			}
		}
	//Objects (including Buffers) are tracked by the garbage collector and deallocated when there are no more references to it

	//WRITE DIRTYR PAGE BACK TO THE DISK
	forceFlushPool(bp);
}

/**
 * causes all dirty pages (with fix count 0) from the buffer pool to be written to disk.
 * 
 * @param {any} bp 
 */
BufferManager.forceFlushPool = function (bp) {
	sm.openPageFile(bp.pageFile, file, function (err, file) {
		for (file.curPagePos = 0; file.curPagePos < bp.numPages; file.curPagePos++) {
			if (bp.dirty[file.curPagePos] == 0) {
				sm.writeCurrentBlock(file, pagelist.current.page.data, function (err) {
					if (err) throw err
					else
						bp.dirty[file.curPagePos] = 0;
				});
			}
		}
		while (isAllZero(bp.dirty)) { }; //wait for all the work
		sm.closePageFile(file, function (err) {
			if (err) throw err;
		});//async close
	});
}

function isAllZero(array) {
	var result = 0;
	for (var i = 0; i < array; i++) {
		result = result | array[i];
		if (result > 0)
			return false;
	}

	return true;
}

function findFilePageId(bp, memPage) {
	return bp.storage_page_map[memPage];
}

function findMemPageId(bp, filePage) {
	for (var i = 0; i < bp.numPages; i++) {
		if (bp.storage_page_map[i] == filePage)
			return i;
	}
	throw new DBErrors('The file page is out of bp');
}

/**
 * marks a page as dirty.
 * 
 * @param {BM_BufferPoort} bp 
 * @param {BM_PageHandle} page
 */
BufferManager.markDirty = function (bp, page) {
	bp.dirty[page.pageNum] = 1;
}

/**
 * unpins the page page. 
 * 
 * @param {BM_BufferPoort} bp 
 * @param {BM_PageHandle} page
 */
BufferManager.unpinPage = function (bp, page) {
	if (bp.fixcount[page.pageNum] > 0)
		bp.fixcount[page.pageNum]--;
}

/**
 * pinPage pins the page with page number pageNum. 
 * The buffer manager is responsible to set the pageNum field of the page handle passed to the method. 
 * Similarly, the data field should point to the page frame the page is stored in (the area in memory storing the content of the page).
 * 
 * @param {any} bp 
 * @param {BM_PageHandle} page - page in the file
 */
BufferManager.pinPage = function (bp, page) {
	switch (bp.strategy) {
		case 0:
			break;
		case 1:
			break;
		case 2:
			break;
		default:
	}
}

function fifo_pinPage(bp, page) {
	if (bp.queue == undefined) {
		throw Error('The FIFO queue is not defined!');
	}
	if (findMemPageId(page.pageNum)) {//if the page is in the buffer
		fixcount[page.pageNum]++;
	} else {
		if (page.pageNum > bq.queueLength) {// the queue is not full
			// sm.openPageFile(filename, file, function () {
			//     sm.writeBlock(0, file, buf, function (err, buf) {

			//     });
			// });
			var avaFrame = findAvalableBuffer(bp);

			//write data from file to the buffer
			//update map, dirty, and queue
			bp.storage_page_map[avaFrame] = page.pageNum;
			dirty[avaFrame] = 0;
			bp.queue.push(avaFrame);
			bq.queueLength++;
		} else {
			var avaFrame = bp.queue.pop();

			//write data from file to the buffer
			//update map, dirty, and queue
			bp.storage_page_map[avaFrame] = page.pageNum;
			dirty[avaFrame] = 0;
			bp.queue.push(avaFrame);
		}
	}
}

function findAvalableBuffer(bp) {
	for (var i = 0; i < bp.numPages; i++) {
		if (bp.storage_page_map[i] != undefined) {
			return i;
		}
	}
}

BufferManager.forcePage = function (bp, page) {
	sm.openPageFile(filename, file, function () {
		buf = Buffer.alloc(sm.PAGE_SIZE, 'a', sm.COING);
		sm.writeBlock(0, file, buf, function (err, buf) {
		});
	});
}


BufferManager.ReplacementStrategy = ReplacementStrategy;

module.exports = BufferManager;
