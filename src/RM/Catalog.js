/**
 * Created by matthewxfz on 6/27/17.
 */
var BufferPool = require('../BM/BM_BufferPool'),
    Schema = require('./Schema'),
    Record = require('./Record'),
    Queue = require('../Queue'),
    Page = require('../BM/Page'),
    Stack = require('../Stack');

var fs = require('fs'),
    sm = require('../SM/StorageManager'),
    bm = require('../BM/BufferManager');

var rm_catalog = require('./RecordManager');

var Constants = require('../Constants');
function Catalog(){
    "use strict";
    var tableName = Constants.catalog.split('/')[2];
    var schema = new Schema(2, ['tableName', 'numberOfTuple'],
        [Schema.Datatype.DT_STRING, Schema.Datatype.DT_INT],
        [64, 4],
        [1, 0],
        1,
        tableName);
    var bp = new BufferPool(Constants.workdir + Constants.catalog, Constants.defaultBPSize, Constants.defaultStra);

    //Table.call(this,tableName, schema, bp)
    this.schema = schema;
    this.bp = bp;
    this.tableName = tableName;
    bm.initBufferPool(this.bp);
    this.lastRID = creatLastRID(this.bp, this.schema);


    //update data from file
    this.numTable;
    this.tableInfos = new Stack();
}
// Catalog.prototype = Object.create(Table.prototype);
// Catalog.prototype.constructor = Catalog;

Catalog.prototype.shutdown = function () {
    "use strict";
    bm.shutdownBufferPool(this.bp);
}


var TableInfo = function (rid, tableName, numTuple) {
    "use strict";
    this.RID = rid;
    this.tableName = tableName;
    this.numberOfTuple = numTuple;
}
Catalog.prototype.increaseTuple = function(){
    "use strict";
    this.numTable++;
}

Catalog.prototype.decreaseTuple = function(){
    "use strict";
    this.numTable--;
}
/**
 *
 * @param {tableInfo}data
 * @returns {Record}
 */
Catalog.prototype.getRecord  = function(data) {
    "use strict";
    return new Record(data.RID, 0, [data.tableName, data.numberOfTuple])
}

Catalog.prototype.getNode = function(record) {
    "use strict";
    return;
}
Catalog.prototype.add = function (tableName) {
    "use strict";
    var data = new TableInfo(findAvailableRID(this.tableInfos,this.schema), tableName, 0);
    this.tableInfos.push(data);
    return data;
}

function findAvailableRID(tableInfos,schema){
    "use strict";
    var node = tableInfos.peek();
    if(node == null)
        return new Record.RID(0,1);
    else{
        var oRID = node.RID;
        var nRID = new Record.RID(oRID.page, oRID.slot);
        var maxslot = schema.maxSlot();
        if(nRID.slot == maxslot){
            nRID.page++;
            nRID.slot = 0;
        }else{
            nRID.slot++;
        }
        return nRID;
    }
}
Catalog.prototype.remove = function (tableName) {
    "use strict";
    var node = this.search(tableName);
    if (node != null) this.tableInfos.remove(node);
    else node = null;
    return node.data;
}

Catalog.prototype.search = function (tableName) {
    "use strict";
    var ite = this.tableInfos.iterator();
    while (ite.hasNext()) {
        var ta = ite.next();
        if (ta.data.tableName == tableName)
            return ta;
    }
    return null;
}

Catalog.prototype.update = function (tableName,data) {
    "use strict";
    var node = this.search(tableName);
    if(node != null)
        node.data = data;
};


Catalog.tableExist = function (tableName) {
    "use strict";
    var res = this.search(tableName);
    if (res == null) return false;
    return true;
}


/**
 * update RID from the buffer pool
 */
Catalog.prototype.updateLastRID = function (rid) {
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
    var rid = new Record.RID(0,0);
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
Catalog.prototype.getLastRID = function() {
    "use strict";
    var page = new Page(0);
    var rid = new Record.RID();
    bm.pinPage(this.bp, page);

    var offset = (page.sliceBuffer(this.bp.data)).readInt16BE(0);

    if (offset == 0) {
        rid.page = 0;
        rid.slot = 0;
    }
    else {
        rid.page = page.sliceBuffer(this.bp.data).readInt32BE(offset);
        rid.slot = page.sliceBuffer(this.bp.data).readInt32BE(offset + Constants.RID / 2);
    }

    bm.unpinPage(this.bp, page);
    return rid;
}

Catalog.getLastRIDIndex = function(rid){
    "use strict";
    return rid.slot*Constants.slotSize;
}


function updateAtable(tableInfo, table) {
    "use strict";
    tableInfo.numberOfTuple = table.numberOfTuple;
}

function updatefile(catalog) {
    "use strict";
    var page = new Page();

    fs.accessSync(Catalog.getCatalogAccess(), fs.constants.W_OK);
    sm.writeJSON(Catalog.getCatalogAccess(),
        new Buffer(JSON.stringify({
            'numTable': catalog.numTable,
            'tableInfos': catalog.tableInfos
        })),
        (err) => {
            if (err) throw err;
        });
}


Catalog.getTableAccess = function (tableName) {
    "use strict";
    return Constants.workdir + Constants.tablesdir + tableName;
}

Catalog.getSchemaAccess = function (tableName) {
    "use strict";
    return Constants.workdir + Constants.schemasdir + tableName;
}

Catalog.getCatalogAccess = function () {
    "use strict";
    return Constants.workdir + Constants.catalog;
}

Catalog.TableInfo = TableInfo;
// Catalog.prototype.updateFromJSON = function (json) {
//     "use strict";
//     this.numTable = json.numTable;
//     this.tableInfos = json.tableInfos;
// }
module.exports = Catalog;


// function initCatalog() {
//     "use strict";
//     var page = new Page();
//
//     try {
//         fs.accessSync(this.getCatalogAccess(), fs.constants.R_OK);
//         this.updateFromJSON(JSON.parse(sm.readJSON(this.getCatalogAccess())));
//     } catch (err) {
//         if (err.code === 'ENOENT') {// build the empty file
//             this.numAttr = 0;
//
//             update();
//         }
//     }
// };

//
//

