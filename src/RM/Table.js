/**
 * Created by matthewxfz on 6/26/17.
 */
var Record = require('./Record');
var Constants = require('../Constants');
var DBErrors = require('../DBErrors');
var bm = require('../BM/BufferManager');
var Page = require('../BM/Page');
/**
 * Handle of the Record Manager Table
 * @param {String}tableName
 * @param {Schema}schema
 * @param {BM_BufferPool}bp
 * @param {RID} lastRID
 * @constructor
 */
function RM_TableData(tableName, schema, bp) {
    "use strict";
    this.name = tableName;
    this.schema = schema;
    this.bp = bp;
    bm.initBufferPool(this.bp, bp.pageFile,bp.numPages,bp.strategy);
    this.lastRID = this.getLastRID();
    this.numberOfTuple = 0;
}

RM_TableData.prototype.getLastRIDIndex = function () {
    "use strict";
    if (this.lastRID)
        return this.lastRID.slot * Constants.slotSize;
    else
        return null;
}

/**
 * get the RID from the buffer pool
 * @param {BufferPool} bp of the table
 */
RM_TableData.prototype.getLastRID = function(){
    "use strict";
    var page = new Page(0);
    var rid = new Record.RID();
    bm.pinPage(this.bp, page);

    var offset = (page.sliceBuffer(this.bp.data)).readInt16BE(0);

    if(offset == 0) {
        rid.page = 0;
        rid.slot = 0;
    }
    else{
        rid.page = page.sliceBuffer(this.bp.data).readInt32BE(offset);
        rid.slot = page.sliceBuffer(this.bp.data).readInt32BE(offset+Constants.RID/2);
    }

    bm.unpinPage(this.bp, page);
    return rid;
}


/**
 * update RID from the buffer pool
 */
RM_TableData.prototype.updateLastRID = function(rid){
    "use strict";
    var page = new Page(0);
    bm.pinPage(this.bp, page);
    var pageBuf = page.sliceBuffer(this.bp.data);

    pageBuf.writeInt32BE(rid.page, buf.readInt16BE(0));
    pageBuf.writeInt32BE(rid.slot, buf.readInt16BE(0) + Constants.RID/2);
    this.lastRID = rid;
    bm.markDirty(this.bp, page);
    bm.unpinPage(this.bp, page);
}


RM_TableData.prototype.getTupleSize = function () {
    "use strict";
    return this.schema.getSize();
}


RM_TableData.prototype.compareTo = function(target){
    "use strict";
    if(this.name == target.name)
        return true;
    else
        return false;
}

RM_TableData.prototype.increaseTuple = function(){
    "use strict";
    this.numberOfTuple++;
}

RM_TableData.prototype.decreaseTuple = function(){
    "use strict";
    this.numberOfTuple--;
}

module.exports = RM_TableData;


// RM_TableData.prototype.getLast_LastRIDIndex = function () {
//     "use strict";
//     if (this.lastRID)
//         return (this.lastRID.slot -1)* Constants.slotSize;
//     else
//         return null;
// }
//
// RM_TableData.prototype.getNext_LastRIDIndex  = function () {
//     "use strict";
//     if (this.lastRID)
//         return (this.lastRID.slot + 1)* Constants.slotSize;
//     else
//         return null;
// }