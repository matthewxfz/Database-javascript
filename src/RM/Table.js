/**
 * Created by matthewxfz on 6/26/17.
 */
var Record = require('./Record');
var Constants = require('../Constants');
var DBErrors = require('../DBErrors');
var bm = require('../BM/BufferManager');
var Page = require('../BM/Page');
var BufferPool = require('../BM/BM_BufferPool');
/**
 * Handle of the Record Manager Table
 * @param {String}tableName
 * @param {Schema}schema
 * @param {BM_BufferPool}bp
 * @param {RID} lastRID
 * @constructor
 */
function RM_TableData(tableName, schema) {
    "use strict";
    this.name = tableName;
    this.schema = schema;
    this.bp = new BufferPool(Constants.workdir + Constants.tablesdir + tableName,
        Constants.defaultBPSize,
        Constants.defaultStra);
    bm.initBufferPool(this.bp);
    this.lastRID = this.getLastRID(this.bp, this.schema);
    this.numberOfTuple = 0;
}

RM_TableData.prototype.shutdown = function () {
    bm.shutdownBufferPool(this.bp);
}

RM_TableData.prototype.getLastRIDIndex = function () {
    "use strict";
    if (this.lastRID)
        return this.lastRID.slot * Constants.slotSize;
    else
        return null;
}

/**
 * update RID from the buffer pool
 */
RM_TableData.prototype.updateLastRID = function (rid) {
    "use strict";
    var page = new Page(0);
    bm.pinPage(this.bp, page);
    var pageBuf = page.sliceBuffer(this.bp.data);

    pageBuf.writeInt32BE(rid.page, pageBuf.readInt16BE(0));
    pageBuf.writeInt32BE(rid.slot, pageBuf.readInt16BE(0) + Constants.RID / 2);
    this.lastRID = rid;
    bm.markDirty(this.bp, page);
    bm.unpinPage(this.bp, page);
}


function creatLastRID(bp, schema) {

    "use strict";
    var rid = new Record.RID(0, 0);
    var page = new Page(0);
    bm.pinPage(bp, page);
    var pageBuf = page.sliceBuffer(bp.data);
    pageBuf.writeInt16BE((Constants.PAGE_SIZE - schema.getSize()), 0);
    pageBuf.writeInt32BE(rid.page, pageBuf.readInt16BE(0));
    pageBuf.writeInt32BE(rid.slot, pageBuf.readInt16BE(0) + Constants.RID / 2);
    bm.markDirty(bp, page);
    bm.unpinPage(bp, page);

    return rid;
}

/**
 * get the RID from the buffer pool
 * @param {BufferPool} bp of the table
 */
RM_TableData.prototype.getLastRID = function () {
    "use strict";
    var page = new Page(0);
    var rid = new Record.RID();
    bm.pinPage(this.bp, page);
    var buf = page.sliceBuffer(this.bp.data)


    var offset = (buf).readInt16BE(0);

    if (offset == 0) {
        rid = creatLastRID(this.bp, this.schema);
    }
    else {
        rid.page = buf.readInt32BE(offset);
        rid.slot = buf.readInt32BE(offset + Constants.RID / 2);
    }

    bm.unpinPage(this.bp, page);
    return rid;
}


RM_TableData.prototype.getTupleSize = function () {
    "use strict";
    return this.schema.getSize();
}


RM_TableData.prototype.compareTo = function (target) {
    "use strict";
    if (this.name == target.name)
        return true;
    else
        return false;
}

RM_TableData.prototype.increaseTuple = function () {
    "use strict";
    this.numberOfTuple++;
}

RM_TableData.prototype.decreaseTuple = function () {
    "use strict";
    this.numberOfTuple--;
}


RM_TableData.prototype.getData = function (record) {
    "use strict";
    return JSON.parse(record);
}




module.exports = RM_TableData;