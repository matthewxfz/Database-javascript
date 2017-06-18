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
    LoopQueue = require('./LoopQueue'),
    File = require('./File');

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
 *The BM_PageHandle stores information about a page. 
 *The page number (position of the page in the page file) is stored in pageNum. 
 *The page number of the first data page in a page file is 0. The data field points to the area in memory storing the content of the page. This will usually be a page frame from your buffer pool.
 * 
 * @param {any} pageNum 
 * @param {Buffer} data
 */
function BM_PageHandle(pageNum, data) {
    this.pageNum = pageNum;
    this.data = data;
}

/**
 * tores information about a buffer pool: 
 * the name of the page file associated with the buffer pool (pageFile), 
 * the size of the buffer pool, i.e., the number of page frames (numPages), 
 * the page replacement strategy (strategy), and a pointer to bookkeeping data (mgmtData). 
 * mgmData is an array that use the first one byte of   
 * 
 * @param {string} pageFile 
 * @param {int} numPages 
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
    this.readBlocksNum = 0;
    this.writeBlockNum = 0;
}

BM_BufferPool.toString = function () {
    return 'hello ' + pageFile + ', ' + numPages + ', ' + strategy + ', ' + storage_page_map.toString() + ', ' + dirty.toString() + ', ' + fixcount.toString();
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
BufferManager.initBufferPool = function (bp, pageFileName, numPages, strategy, page) {
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
        bp.queueLength = 0;
        if (strategy < 0 || strategy > 3) {
            throw new DBErrors('No such strategy!', DBErrors.type.RC_RM_UNKOWN_DATATYPE);
        } else {
            bp.strategy = strategy;
            try {
                bp.numPages = numPages;
                initSpace(numPages, page, bp);
            } catch (error) {
                throw error;
            }
        }
    } catch (error) {
        throw error;
    }
}

function initSpace(numPages, page, bp) {
    page.data = Buffer.alloc(sm.PAGE_SIZE * numPages);
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
            FIFO_pinPage();
            break;
        case 1:
            LRU_pinPage();
            break;
        case 2:
            CLOCK_pinPage();
            break;
        default:
    }
}

function FIFO_pinPage(bp, page) {
    if (bp.queue == undefined) {
        throw Error('The FIFO queue is not defined!');
    }
    if (findMemPageId(page.pageNum)) {//if the page is in the buffer
        fixcount[page.pageNum]++;
    } else {
        if (page.pageNum > bp.queueLength) {// the queue is not full
            var avaFrame = findAvalableBuffer(bp);

            forcePage(bp, page);
            bp.storage_page_map[avaFrame] = page.pageNum;
            dirty[avaFrame] = 0;
            bp.queue.push(avaFrame);
            bp.queueLength++;
        } else {
            var memPage = bp.queue.pop();
            forcePage(bp, page);
            bp.storage_page_map[memPage] = page.pageNum;
            bp.queueLength--;
        }
    }
}

function LRU_pinPage(bp, page) {
    if (bp.heap == undefined) {
        throw Error('The LRU queue is not defined!');
    }
    if (findMemPageId(page.pageNum)) {//if the page is in the buffer
        fixcount[page.pageNum]++;
    } else {
        if (page.pageNum > bp.queueLength) {// the queue is not full
            var avaFrame = findAvalableBuffer(bp);

            forcePage(bp, page);
            bp.storage_page_map[avaFrame] = page.pageNum;
            dirty[avaFrame] = 0;
            bp.heap.push(avaFrame);
            bp.queueLength++;
        } else {
            var memPage = bp.heap.pop();
            forcePage(bp, page);
            bp.storage_page_map[memPage] = page.pageNum;
            bp.queueLength--;
        }
    }
}

function CLOCK_pinPage(bp, page) {
    if (bp.heap == undefined) {
        throw Error('The LRU queue is not defined!');
    }
    if (findMemPageId(page.pageNum)) {//if the page is in the buffer
        fixcount[page.pageNum]++;
    } else {
        if (page.pageNum > bp.queueLength) {// the queue is not full
            var avaFrame = findAvalableBuffer(bp);

            forcePage(bp, page);
            bp.storage_page_map[avaFrame] = page.pageNum;
            dirty[avaFrame] = 0;
            bp.heap.push(avaFrame);
            bp.queueLength++;
        } else {
            var memPage = bp.heap.pop();
            forcePage(bp, page);
            bp.storage_page_map[memPage] = page.pageNum;
            bp.queueLength--;
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

function findFilePageId(bp, memPage) {
    return bp.storage_page_map[memPage];
}

function findMemPageId(bp, filePage) {
    try {
        for (var i = 0; i < bp.numPages; i++) {
            if (bp.storage_page_map[i] == filePage)
                return i;
        }
        return null;
    } catch (error) {
        throw error;
    }

}

/**
 * forcePage should write the current content of the page back to the page file on disk.
 * 
 * @param {any} bp 
 * @param {any} page 
 */
BufferManager.forcePage = function (bp, page) {
    var memPageNum = findMemPageId(bp, page.pageNum);
    if (memPageNum !== null) {
        if (bp.dirty[memPageNum] == 1) {
            writeOneBlockForOnce(bp.pageFile,page.pageNum, page.data, memPageNum);
        } else {
            throw new DBErrors('Writting page is not dirty!');
        }
    } else {
        throw new DBErrors('Writting page is not in the buffer pool');
    }
}

function writeOneBlockForOnce(filename, pageNum, buf, offset) {
    sm.openPageFile(filename, new File, function (err, file) {
        sm.ensureCapacity(3, file, function (err, file) {
            //buf = Buffer.alloc(sm.PAGE_SIZE, '.', sm.COING);
            sm.writeBlockWithOffset(pageNum, file, buf,offset, function (err, buf) {
                if (err) console.error(err)
                sm.closePageFile(file, function () {
                    if (err) throw err;
                });
            });
        });
    });
}

/**
 * The getFrameContents function returns an array of PageNumbers (of size numPages) where the ith element is the number of the page stored in the ith page frame. 
 * An empty page frame is represented using the constant NO_PAGE.
 * 
 * @param {any} bp 
 * @returns 
 */
BufferManager.getFrameContents = function (bp) {
    return bp.storage_page_map;
}

/**
 * The getDirtyFlags function returns an array of bools (of size numPages) where the ith element is TRUE if the page stored in the ith page frame is dirty. 
 * Empty page frames are considered as clean.
 * @param {any} bp 
 */
BufferManager.getDirtyFlags = function (bp) {
    return bp.dirty;
}

/**
 * The getFixCounts function returns an array of ints (of size numPages) where the ith element is the fix count of the page stored in the ith page frame. Return 0 for empty page frames.
 * 
 * @param {any} bp 
 */
BufferManager.getFixCounts = function (bp) {
    return bp.fixcount;
}


/**
 * The getNumReadIO function returns the number of pages that have been read from disk since a buffer pool has been initialized. 
 * You code is responsible to initializing this statistic at pool creating time and update whenever a page is read from the page file into a page frame.
 * 
 * @param {any} bp 
 * @returns 
 */
BufferManager.getNumReadIO = function (bp) {
    return bp.readBlocksNum;
}

/**
 * getNumWriteIO returns the number of pages written to the page file since the buffer pool has been initialized.
 * 
 * @param {any} bp 
 */
BufferManager.getNumWriteIO = function (bp) {
    return bp.writeBlockNum;
}

BufferManager.ReplacementStrategy = ReplacementStrategy;

module.exports = BufferManager;