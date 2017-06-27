/**
 * Created by matthewxfz on 6/21/17.
 */

var RecordManager = {},
    sm = require('../SM/StorageManager'),
    bm = require('../BM/BufferManager');

var Page = require('../BM/Page'),
    DBErrors = require('../DBErrors'),
    Record = require('./Record'),
    Table = require('./RM_TableData'),
    Scan = require('./RM_ScanHandle'),
    Schema = require('./Schema'),
    Constants = require('../Constants'),
    BufferPool = require('../BM/BM_BufferPool'),
    fs = require('fs');

var workdir = '/Users/matthewxfz/Workspaces/gits/Database-javascript/test';

/**
 * All the in memory tables information
 * @param numTable
 * @param tableName
 * @param tableAccess
 * @param tableSchema
 * @param tableIndex
 */


var catalog
;
/**
 * Check env
 * read dictionary
 * @param bp
 */
RecordManager.initRecordManager = function (dicBp) {
    "use strict";
    //check Env
    checkEnv();
    dicBp = new BufferPool()
    //read dictionary
    readCatalog(dicBp);
}

/**
 * Update to Dictionary
 * Close tables in the list
 */
RecordManager.shutdownRecordManager = function () {
    "use strict";

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

}
/**
 * Find the table information of the table
 * Read the schema bp of the table,
 * Read the table bp
 * @param {RM_TableData}table
 * @param {String}tableName
 */
RecordManager.openTable = function (table, tableName) {
    "use strict";
    //dictionary change
    if (isValidTableName(tableName))
        table.name = tableName;
    if (checkSchemaExist(tableName))
        table.schema = getSchema(tableName);
    var bp = new BufferPool();
    // bm.initBufferPool(bp);

}

function isValidTableName(name) {

}
RecordManager.closeTable = function (table) {
}
RecordManager.deleteTable = function (tableName) {
}
RecordManager.getNumTuple = function (table) {
};


//Handling records in the table
/**
 * Insert Record
 * @param {Table}table
 * @param {Record}record
 */
RecordManager.insertRecord = function (table, record) {
    "use strict";
    var page = new Page(table.lastRID.page);
    bm.pinPage(table.bp, page);
    var buf = page.sliceBuffer();//last page buf
    var lastRecordOffset = buf.readInt16BE(table.getCurrent_LastRIDIndex());
    var freeSpace = 0;

    if (table.lastRID.slot = 0)
        freeSpace = Constants.PAGE_SIZE;
    else
        freeSpace = lastRecordOffset - table.getCurrent_LastRIDIndex() - Constants.slotSize + 1;

    if (freeSpace < record.getSize(table.schema)) {//need one more page
        bm.unpinPage(table.bp.page);
        page.pageNum++;
        bm.pinPage(table.bp, page);
        buf = page.sliceBuffer();

        table.lastRID.page++;
        table.lastRID.slot = 0;
        updateHeadOfTable(table);

        lastRecordOffset = Constants.PAGE_SIZE;
    }
    //start to write
    var recordOffset = lastRecordOffset - record.getSize(table.schema);
    buf.writeInt16BE(recordOffset, table.getNextSlotIndex());//write slot
    writeRecord(buf.slice(recordOffset, lastRecordOffset - 1), table.schema, record);//write record
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
    var buf = page.sliceBuffer();
    var offset;
    if ((offset = buf.readInt16BE(id.getSlotIndex())) < Constants.PAGE_SIZE) {
        var oRecord = buf.slice(offset, offset + table.getTupleSize() - 1);
        resetRecord(oRecord);
    } else {

        throw new DBError('Record offset out of boundary!');
    }

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
    var buf = page.sliceBuffer();//last page buf
    var offset;

    if ((offset = buf.readInt16BE(record.id.getSlotIndex())) < Constants.PAGE_SIZE) {
        var oRecord = buf.slice(offset, offset + table.getTupleSize() - 1);
        writeRecord(oRecord,
            table.schema,
            record);
    } else {
        throw new DBError('Record offset out of boundary!');
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
    var buf = page.sliceBuffer();//last page buf
    var offset;

    if ((offset = buf.readInt16BE(id.getSlotIndex())) < Constants.PAGE_SIZE) {
        var oRecord = buf.slice(offset, offset + table.getTupleSize() - 1);
        readRecord(oRecord,table.schema,record);
    } else {
        throw new DBError('Record offset out of boundary!');
    }
};


//Scan
RecordManager.startScan = function (table, scan, cond) {
};
RecordManager.next = function (scan, record) {
};
RecordManager.closeScan = function (scan) {
};

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
 * Create schema in memory
 * @param schemaName
 * @param numAttr
 * @param attrNames
 * @param dataTypes
 * @param typeLength
 * @param keySize
 * @param keys
 * @returns {Schema}
 */
RecordManager.createSchema = function (schemaName, numAttr, attrNames, dataTypes, typeLength, keySize, keys) {
    "use strict";
    var schema;
    if (attrNames.length == dataTypes.length == typeLength.length)
        schema = Schema(numAttr, attrNames, dataTypes, typeLength, keySize, keys);
    else
        throw new DBError('Schema is not well formatted!', DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY);

    //build empty schema file
};

RecordManager.freeSchema = function (schema) {
};

//dealing with records and attribute values
RecordManager.createRecord = function (record, shcema) {
};
RecordManager.freeRecord = function (record) {
};
RecordManager.getAttr = function (record, schema, attrNum, values) {
};
RecordManager.setAttr = function (record, schema, attrNum, values) {
};

function getSchema(shemaName) {
    "use strict";

}


//private functions
function readCatalog(bp) {
    "use strict";
    var page = new Page();

    try {
        fs.accessSync(getDictionaryAccess(), fs.constants.R_OK | fs.constants.W_OK);
    } catch (err) {
        if (err.code === 'ENOENT') {// build the empty file
            var buf = Buffer.alloc(sm.PAGE_SIZE)
            fillEmptySlots(buf);
            sm.safeWriteBlock(getDictionaryAccess(), buf, 0, 0);
        }
    }

    //read the record

    var totalpages = sm.getPageNumofFile(getDictionaryAccess());


    bm.initBufferPool(bp, getDictionaryAccess(), Constants.dictionaryBPLength, bm.ReplacementStrategy.RS_FIFO);
}
;
function updateCatalog() {
};
function deleteCatalog() {
};


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
    return workdir + Constants.disctionary;
}

/**
 * Write the record from record to buf
 * @param {Buffer}buf destination buf, start from 0
 * @param {Schema}schema
 * @param {Record}record
 */
function writeRecord(buf, schema, record) {
    "use strict";
    if (buf.length < (record.getSize(schema))) {
        throw new DBError('Written buf is too small!');
    } else {

        buf.writeInt32BE(record.id.page, 0);
        buf.writeInt32BE(record.id.slot, 4);
        buf.writeInt8(0, 8);//is null
        if (record.data.length != schema.numAttr)
            throw new DBError('Schema does not match data!');

        var curs = 9;
        for (var i = 0; i < schema.numAttr; i++) {
            var length = schema.typeLength[i];
            if (record.data[i].length > length) {
                throw new DBError('Insert data is out of boundary!')
            }
            buf.write(record.data[i], curs, length, Constants.CODING);
            curs += (length);
        }
    }
}

/**
 * Write the record from the buf to the record
 * @param buf
 * @param schema
 * @param record
 */
function readRecord(buf, schema, record) {
    "use strict";
    if (buf.length < (record.getSize(schema))) {// only when record length is fixed
        throw new DBError('Schema does not match data!');
    } else {
        record.id.page = buf.readInt32BE(0);
        record.id.slot = buf.readInt32BE(4);
        record.isNull = buf.readInt8(8);

        var curs = 9;
        for (var i = 0; i < schema.numAttr; i++) {
            var length = schema.typeLength[i];
            record.data[i] = buf.toString(Constants.CODING, curs, curs + length - 1);
            curs += length;
        }
    }
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

/**
 * Update the head of the record, includes RID, etc
 * @param table
 */
function updateHeadOfTable(table) {
    "use strict";
    var page = new Page(0);
    bm.pinPage(table.bp, page);
    var buf = page.sliceBuffer();

    buf.writeInt32BE(record.id.page, buf.readInt16BE(0));
    buf.writeInt32BE(record.id.slot, buf.readInt16BE(0) + 4);
    bm.markDirty(table.bp, page);
    bm.unpinPage(table.bp, page);
}

module.exports = RecordManager;


