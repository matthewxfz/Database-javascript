/**
 * Created by matthewxfz on 6/26/17.
 */
var Record = require('./Record');
var Constants = require('../Constants');
/**
 * Handle of the Record Manager Table
 * @param {String}tableName
 * @param {Schema}schema
 * @param {BM_BufferPool}bp
 * @constructor
 */
function RM_TableData(tableName, schema, bp) {
    "use strict";
    this.name = name;
    this.schema = schema;
    this.bp = bp;
    this.lastRID;
}

RM_TableData.getCurrent_LastRIDIndex = function () {
    "use strict";
    if (this.lastRID)
        return this.lastRID.slot * Constants.slotSize;
    else
        return null;
}

RM_TableData.getLast_LastRIDIndex = function () {
    "use strict";
    if (this.lastRID)
        return (this.lastRID.slot -1)* Constants.slotSize;
    else
        return null;
}

RM_TableData.getNext_LastRIDIndex  = function () {
    "use strict";
    if (this.lastRID)
        return (this.lastRID.slot + 1)* Constants.slotSize;
    else
        return null;
}

RM_TableData.lastRID = Record.RID;

RM_TableData.getTupleSize  = function(){
    "use strict";
    return this.schema.getSize();
}


module.exports = RM_TableData;
