/**
 *The BM_PageHandle stores information about a page.
 *The page number (position of the page in the page file) is stored in pageNum.
 *The page number of the first data page in a page file is 0. The data field points to the area in memory storing the content of the page. This will usually be a page frame from your buffer pool.
 *
 * @param {any} pageNum -- the input page number in the file
 * @param {Buffer} buffPage -- the page number in the buffer pool
 */
var Constants = require('../Constants');
var DBError = require('../DBErrors');

function BM_PageHandle(pageNum, data) {
    this.pageNum = pageNum;
    this.data = data;
}

/**
 * slice the buf of the corresponding this.data page
 * @param buf
 * @returns {Blob|ArrayBuffer|Buffer|Array.<T>|string}
 */
BM_PageHandle.prototype.sliceBuffer = function (buf) {
    if (buf != undefined)
        return buf.slice(this.data*Constants.PAGE_SIZE,(this.data+1)*Constants.PAGE_SIZE);
    else {
        //if(this.data)
        throw new DBError('data is not defined in the Page handle');
        // else
        //     throw new DBError('buffer page is not defined in the Page handle')
    }
}

module.exports = BM_PageHandle;