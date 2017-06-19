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
    this.pageFile = pageFile;
    this.numPages = numPages;
    this.strategy = strategy;
    this.storage_page_map = storage_page_map;
    this.dirty = dirty;
    this.fixcount = fixcount;
    this.readBlocksNum = 0;
    this.writeBlockNum = 0;
    this.data = {};
    this.queue= {};
}

module.exports = BM_BufferPool;