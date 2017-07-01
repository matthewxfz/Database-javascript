/**
 * Created by matthewxfz on 6/21/17.
 */

const RecordManager = {};

var sm = require('../SM/StorageManager'),
    bm = require('../BM/BufferManager');

var Page = require('../BM/Page'),
    DBErrors = require('../DBErrors'),
    Record = require('./Record'),
    Table = require('./Table'),
    Schema = require('./Schema'),
    Constants = require('../Constants'),
    BufferPool = require('../BM/BM_BufferPool'),
    fs = require('fs'),
    TablePool = require('./TablePool'),
    Catalog = require('./Catalog'),
    Stack = require('../Stack');

var workdir = Constants.workdir;

/**
 * All the in memory tables information
 * @param numTable
 * @param tableName
 * @param tableAccess
 * @param tableSchema
 * @param tableIndex
 */
var tablePool;
var catalog;
var CatalogManager = {};

/**
 * Check env
 * read dictionary
 * @param bp
 */
RecordManager.initRecordManager = function (dicBp) {
    "use strict";
    //check Env
    checkEnv();
    //read catalog
    CatalogManager.init()
    tablePool = new TablePool();
}

/**
 * Update to catalog
 * Close tables in the list
 */
RecordManager.shutdownRecordManager = function () {
    "use strict";

    CatalogManager.shutdown();

    var ite = tablePool.tables.iterator();
    while (ite.hasNext()) {
        var table = ite.next();
        this.closeTable(table);
    }
}
/**
 * Create Schema file
 * Create Table file
 *  First page is empty
 * Register the table in the Dictionary
 * @param tableName
 * @param schema
 */
RecordManager.createTable = function (tableName, schema) {
    if (CatalogManager.find(tableName) == null) {
        //create empty schema file
        sm.writeJSON(schema.getdir(), JSON.stringify(schema));

        //create table in memory
        var table = new Table(tableName, schema);
        //registering in the catalog
        CatalogManager.add(tableName, 0);
        //write to file
        table.shutdown();
    }
}
/**
 * Find the table information of the table
 * Read the schema bp of the table,
 * Read the table bp
 * @param {RM_TableData}table
 * @param {String}tableName
 * @return table
 */
RecordManager.openTable = function (tableName) {
    "use strict";
    //dictionary change
    var table = tablePool.search(tableName);
    if (table == null) {// no such table opened before, open one
        var schema = getSchemaFromFile(tableName);
        table = new Table(tableName,
            schema);

        table.numberOfTuple = CatalogManager.find(table.name).numberOfTuple;
        tablePool.add(table);
    }
    return table;
}

RecordManager.closeTable = function (tableName) {
    "use strict";
    var table;
    //update the tuple information CatalogManager.update()
    if (typeof tableName == 'string')
        table = tablePool.search(tableName);
    else
        table = tableName;
    if (table != null) {
        tablePool.remove(table);
        bm.shutdownBufferPool(table.bp);
    }
}
RecordManager.deleteTable = function (tableName) {
    "use strict";
    var table = tablePool.search(tableName);
    if (table != null)
        this.closeTable(table);
    //delete table file
    sm.destroyFile(Catalog.getTableAccess(tableName))
    //delete schema file
    sm.destroyFile(Catalog.getSchemaAccess(tableName));
    //delete from catalog
    CatalogManager.remove(tableName);
}

RecordManager.getNumTuple = function (tableName) {
    "use strict";
    var table = tablePool.search(tableName);
    if (tablePool == null) {
        return CatalogManager.find(tableName).numberOfTuple;
    }
    return table.numberOfTuple;
};


RecordManager.getTableByName = function (tableName) {
    var table = tablePool.search(tableName);
    if (table == null) return null;
    else return table;
}
//Handling records in the table
/**
 * Insert the record to the end of the file
 * @param {Table}table
 * @param {Record}record
 */
RecordManager.insertRecord = function (table, record) {
    "use strict";
    var lrid = table.getLastRID();
    var page = new Page(lrid.page);

    bm.pinPage(table.bp, page);
    var buf = page.sliceBuffer(table.bp.data);//last page buf
    var lastRecordOffset;
    if ((lrid.page == 0 && lrid.slot == 0)) {
        lastRecordOffset = Constants.PAGE_SIZE - table.schema.getSize();
    }
    else
        lastRecordOffset = buf.readInt16BE(lrid.slot * Constants.slotSize);

    var freeSpace = 0;

    if (lrid.slot == 0)
        freeSpace = Constants.PAGE_SIZE;
    else
        freeSpace = lastRecordOffset - (lrid.slot * Constants.slotSize) - Constants.slotSize + 1;

//find the next slot for the record
    if (freeSpace < table.schema.getSize()) {//need one more page && !(table.lastRID.page == 0 && table.lastRID.slot == 0)
        bm.unpinPage(table.bp, page);
        page.pageNum++;
        bm.pinPage(table.bp, page);
        buf = page.sliceBuffer(table.bp.data);

        lrid.page++;
        lrid.slot = 0;

        lastRecordOffset = Constants.PAGE_SIZE;
    } else {
        lrid.slot++;
    }
    table.updateLastRID(lrid);

    //start to write
    var recordOffset = lastRecordOffset - table.schema.getSize();
    record.id = table.lastRID;
    buf.writeInt16BE(recordOffset, lrid.slot * Constants.slotSize);//write slot
    writeRecord(buf.slice(recordOffset, lastRecordOffset), table.schema, record);//write record

    table.increaseTuple();
    bm.markDirty(table.bp, page);

//after the writting
    bm.unpinPage(table.bp, page);

};

/**
 * delete Record information
 * @param table
 * @param id
 */
RecordManager.deleteRecord = function (table, id) {
    "use strict";
    var page = new Page(id.page);
    bm.pinPage(table.bp, page);
    var buf = page.sliceBuffer(table.bp.data);
    var offset;
    if ((offset = buf.readInt16BE(id.getSlotIndex())) < Constants.PAGE_SIZE) {
        var oRecord = buf.slice(offset, offset + table.schema.getSize());
        resetRecord(oRecord);
    } else {

        throw new DBErrors('Record offset out of boundary!');
    }

    table.decreaseTuple();
    bm.markDirty(table.bp, page);
    bm.unpinPage(table.bp, page);
};

/**
 * Update the record information
 * @param table
 * @param record
 */
RecordManager.updateRecord = function (table, record) {
    "use strict";
    var page = new Page(record.id.page);
    bm.pinPage(table.bp, page);
    var buf = page.sliceBuffer(table.bp.data);//last page buf

    //if there is data, still over write it.

    if (table.schema.maxSlot() >= record.id.slot) {//if too large, do nothing
        var rsize = table.schema.getSize();
        var offset = Constants.PAGE_SIZE - (record.id.slot + 1) * rsize;//offset for record
        buf.writeInt16BE(offset, record.id.getSlotIndex());//write slot
        writeRecord(buf.slice(offset, offset + rsize),
            table.schema,
            record);
    } else {
        throw new DBErrors('Record offset out of boundary!');
    }

    bm.markDirty(table.bp, page);
    bm.unpinPage(table.bp, page);
};

/**
 * Read the Record based on id, and read it to record
 * @param table
 * @param id
 * @param record
 */
RecordManager.getRecord = function (table, id, record) {
    "use strict";
    var page = new Page(id.page);
    bm.pinPage(table.bp, page);
    var buf = page.sliceBuffer(table.bp.data);//last page buf
    var offset;

    if ((offset = buf.readInt16BE(id.getSlotIndex())) < Constants.PAGE_SIZE) {
        var oRecord = buf.slice(offset, offset + table.schema.getSize());
        readRecord(oRecord, table.schema, record);
    } else {
        throw new DBError('Record offset out of boundary!');
    }
    bm.unpinPage(table.bp, page);
    return record;
};


//Scan function is implemented in the Scan object
// RecordManager.startScan = function (table, scan, cond) {
//     "use strict";
//
// };
// RecordManager.next = function (scan, record) {
// };
// RecordManager.closeScan = function (scan) {
// };

//dealing with schema

RecordManager.getRecordSize = function (schema) {
    "use strict";
    var result = 0;
    for (var l in schema.length) {
        result += l;
    }

    result += Constants.RID + 1;//1 for isNUll
    return result;
};

/**
 * Create schema in memory, not in file
 * @param schemaName
 * @param numAttr
 * @param attrNames
 * @param dataTypes
 * @param typeLength
 * @param keySize
 * @param keys
 * @returns {Schema}
 */
RecordManager.createSchema = function (numAttr, attrNames, dataTypes, typeLength, keySize, keys, schemaName) {
    "use strict";
    if (attrNames.length == dataTypes.length && dataTypes.length == typeLength.length)
        return new Schema(numAttr, attrNames, dataTypes, typeLength, keySize, keys, schemaName);
    else
        throw new DBErrors('Schema is not well formatted!', DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY);

};

RecordManager.freeSchema = function (schema) {
    "use strict";
    if (schema.tableName)
        sm.destroyFile(schema.getdir());
};

function getSchemaFromFile(tableName) {
    "use strict";
    var json = JSON.parse(sm.readJSON(Constants.workdir + Constants.schemasdir + tableName));
    var schema = new Schema();
    schema.upateFromJSON(json);
    return schema;
}

//dealing with records and attribute values
RecordManager.createRecord = function (record, shcema) {
};
RecordManager.freeRecord = function (record) {
};
RecordManager.getAttr = function (record, schema, attrNum, values) {
};
RecordManager.setAttr = function (record, schema, attrNum, values) {
};


//private functions


/**
 * Fill the buffer with empty slots
 * @param {Buffer} page
 */
function fillEmptySlots(page) {
    "use strict";
    var numSlots = Math.floor(sm.PAGE_SIZE / (Constants.RID + Constants.schemaRecordLength));
    for (var i = 0; i < numSlots * Constants.RID; i += Constants.RID / 2) {
        buf.writeInt32BE(Constants.NaN, i);
    }
}

/**
 * Check if the env for bm is ready?
 */
function checkEnv() {
    checkDir(workdir + Constants.rootdir, (err) => {
        checkDir(workdir + Constants.schemasdir);
        checkDir(workdir + Constants.tablesdir);
        checkDir(workdir + Constants.index);
        checkDir(workdir + Constants.viewsdir);
    });
}


function checkDir(dir, cb) {
    fs.access(dir, fs.constants.W_OK | fs.constants.R_OK, (err) => {
        if (err != undefined && err.code == 'ENOENT')
            fs.mkdir(dir, 0o744, cb);
        else if (cb) cb(err);

    })
}

//layout manager
function getTableAccess(tableName) {
    "use strict";
    return workdir + Constants.tablesdir + tableName;
}

function getSchemaAccess(tableName) {
    "use strict";
    return workdir + Constants.schemasdir + tableName;
}

function getDictionaryAccess() {
    "use strict";
    return workdir + Constants.catalog;
}

/**
 * Write the record from record to buf
 * @param {Buffer}buf destination buf, start from 0
 * @param {Schema}schema
 * @param {Record}record
 */
function writeRecord(buf, schema, record) {
    "use strict";
    buf.writeInt32BE(record.id.page, 0);
    buf.writeInt32BE(record.id.slot, 4);
    if (!schema) return;

    if (buf.length < (schema.getSize())) {
        throw new DBErrors('Written buf is too small!');
    } else {
        buf.writeInt8(0, 8);//isNull = 0
        //insert data
        if (record.data) {
            if (record.data.length != schema.numAttr)
                throw new DBErrors('Schema does not match data!');

            var curs = 9;
            for (var i = 0; i < schema.numAttr; i++) {
                var length = schema.typeLength[i];
                if (record.data[i].length > length) {
                    throw new DBError('Insert data is out of boundary!')
                }
                //buf.write(record.data[i].toString(), curs, length, Constants.CODING);
                switch (schema.dataTypes[i]) {
                    case Schema.Datatype.DT_INT:
                        writeInt(buf.slice(curs, curs + length), record.data[i], length);
                        break;
                    case Schema.Datatype.DT_BOOL:
                        writeBoolean(buf.slice(curs, curs + length), record.data[i]);
                        break;
                    case Schema.Datatype.DT_STRING:
                        writeString(buf.slice(curs, curs + length), record.data[i]);
                        break;
                    case Schema.Datatype.DT_FLOAT:
                        writeFloat(buf.slice(curs, curs + length), record.data[i]);
                        break;

                }
                curs += (length);
            }
        }
    }
}

function writeString(buf, data) {
    "use strict";
    buf.fill(0);
    buf.write(data, Constants.CODING);
}

function writeInt(buf, data, length) {
    "use strict";
    return buf.writeIntBE(data, 0, length);
}

function writeFloat(buf, data) {
    "use strict";
    return buf.writeFloatBE(data, 0);
}

function writeBoolean(buf, data) {
    "use strict";
    var val;
    if (data == true) val = 1;
    else val = 0;
    buf.writeInt8(data);
}

/**
 * Write the record from the buf to the record
 * @param buf
 * @param schema
 * @param record
 */
function readRecord(buf, schema, record) {
    "use strict";
    if (buf.length < (schema.getSize())) {// only when record length is fixed
        throw new DBErrors('Schema does not match data!');
    } else {
        var page = buf.readInt32BE(0);
        var slot = buf.readInt32BE(4);
        record.id = new Record.RID(page, slot);
        record.isNull = buf.readInt8(8);

        record.data = new Array(schema.numAttr);
        var curs = 9;
        for (var i = 0; i < schema.numAttr; i++) {
            var length = schema.typeLength[i];
            switch (schema.dataTypes[i]) {
                case Schema.Datatype.DT_INT:
                    record.data[i] = readInt(length, buf.slice(curs, curs + length), record.data[i]);
                    break;
                case Schema.Datatype.DT_BOOL:
                    record.data[i] = readBoolean(length, buf.slice(curs, curs + length), record.data[i]);
                    break;
                case Schema.Datatype.DT_STRING:
                    record.data[i] = readString(length, buf.slice(curs, curs + length));
                    break;
                case Schema.Datatype.DT_FLOAT:
                    record.data[i] = readFloat(length, buf.slice(curs, curs + length), record.data[i])
                    break;

            }
            curs += length;
        }
    }
}

function readString(length, buf) {
    "use strict";
    var j;
    for (j = 0; j < length; j++) {
        if (buf[j] == 0)
            break;
    }
    return buf.toString(Constants.CODING, 0, j);
}

function readInt(length, buf) {
    "use strict";
    return buf.readIntBE(0, length);
}

function readFloat(length, buf) {
    "use strict";
    return buf.readFloatBE(0);
}

function readBoolean(length, buf) {
    "use strict";
    if (buf.readInt8() == 0) return false;
    else return true;
}

/**
 * delete the records
 * @param {Buffer}buf destination buf, start from 0
 * @param {Schema}schema
 * @param {Record}record
 */
function resetRecord(buf) {
    "use strict";

    buf.writeInt8(1, 8);//is null
}


CatalogManager.init = function () {
    "use strict";
    catalog = new Catalog();
    CatalogManager.scanAllTheRecords(catalog);
}

CatalogManager.scanAllTheRecords = function (catalog) {
    var scan = new Scan(catalog);
    scan.startScan();
    var data = scan.next();
    while (data != null) {
        catalog.add(data.tableName, data.numberOfTuple);
        data = scan.next();
    }
}

CatalogManager.shutdown = function () {
    "use strict";
    catalog.shutdown();
}


CatalogManager.add = function (tableName, numOfTuples) {
    "use strict";
    if (CatalogManager.find(tableName) == null) {
        var data = catalog.add(tableName, numOfTuples);
        //catalog.updateLastRID(data.RID);
        RecordManager.insertRecord(catalog, catalog.getRecord(data));
    }
}

CatalogManager.remove = function (tableName) {
    "use strict";
    var data = catalog.remove(tableName);
    RecordManager.deleteRecord(catalog, data.RID);
}

CatalogManager.find = function (tableName) {
    "use strict";
    var node = catalog.search(tableName);
    if (node) {
        var record = new Record();
        RecordManager.getRecord(catalog, node.data.RID, record);
        return record;
    } else
        return null;
}
/**
 *
 * @param tableName
 * @param {Catalog.tableInfo}data
 * @returns {*}
 */
CatalogManager.update = function (data) {
    "use strict";
    var record = this.find(data.tableName);
    data.RID = record.id;
    catalog.update(data.tableName, data);
    RecordManager.updateRecord(catalog, catalog.getRecord(data))
}

function Scan(table) {
    "use strict";
    this.table = table;
    this.cond;
    this.curse;//RID
    this.maxSlot = table.schema.getSize();
}

RecordManager.Scan = Scan;

Scan.prototype.startScan = function (cond) {
    "use strict";
    if (cond) this.cond = cond;
    this.curse = new Record.RID(0, 1);
};

Scan.prototype.next = function () {
    "use strict";
    while (this.curse.compareTo(this.table.lastRID) <= 0) {
        //read the record
        var record = RecordManager.getRecord(this.table, this.curse, new Record());
        if (record.isNull == 0 && satisfyTheCond(record, this.cond))// the record is not null and satisfied the condition
        {
            nextCurse(this.curse, this.maxSlot);
            return this.table.getData(record);
        }
        nextCurse(this.curse, this.maxSlot);
    }

    return null;
};

function satisfyTheCond(record, cond) {
    return true;
};

function nextCurse(curse, maxSlot) {
    "use strict";
    if (curse.slot == maxSlot) {
        curse.page++;
        curse.slot = 0;
    } else {
        curse.slot++;
    }
}

Scan.prototype.closeScan = function () {
    "use strict";
    this.curse = new Record.RID(0, 1);

};


module.exports = RecordManager;


