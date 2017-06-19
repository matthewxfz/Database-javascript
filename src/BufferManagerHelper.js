/**
 *The BM_PageHandle stores information about a page. 
 *The page number (position of the page in the page file) is stored in pageNum. 
 *The page number of the first data page in a page file is 0. The data field points to the area in memory storing the content of the page. This will usually be a page frame from your buffer pool.
 * 
 * @param {any} pageNum -- the input page number in the file
 * @param {Buffer} data -- the page number in the buffer pool
 */
function BM_PageHandle(pageNum, data) {
    this.pageNum = pageNum;
    this.data = data;
}

module.exports = BM_PageHandle;