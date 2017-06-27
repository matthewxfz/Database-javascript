/**
 *The BM_PageHandle stores information about a page. 
 *The page number (position of the page in the page file) is stored in pageNum. 
 *The page number of the first data page in a page file is 0. The data field points to the area in memory storing the content of the page. This will usually be a page frame from your buffer pool.
 * 
 * @param {any} pageNum -- the input page number in the file
 * @param {Buffer} buffPage -- the page number in the buffer pool
 */
var Constants = require('../Constants');

function BM_PageHandle(pageNum, buffPage, data) {
    this.pageNum = pageNum;
    this.buffPage = buffPage;
    this.data = data;
}

BM_PageHandle.sliceBuffer = function(){
    if(this.data != undefined && this.buffPage != undefined)
        return data.slice(this.buffPage,this.buffPage+Constants.PAGE_SIZE);
    else{
        if(data)
            throw new DBError('data is not defined in the Page handle');
        else
            throw new DBError('buffer page is not defined in the Page handle')
    }
}

module.exports = BM_PageHandle;