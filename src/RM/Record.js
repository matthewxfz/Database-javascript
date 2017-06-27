/**
 * Created by matthewxfz on 6/26/17.
 */
const Constant = require('../Constants');
const assert = require('assert');
/**
 * Record Object
 * @param id
 * @param isNull
 * @param data
 * @constructor
 */
function Record(id, isNull, data, schema) {
    "use strict";
    this.id = id;
    this.isNull = isNull;
    this.data = this.data;
    if (schema) {
        updateSize(schema);
        this.schema = schema;
    }
    else {
        this.size = undefined;
        this.schema = undefined;
    }
}

Record.RID = function (page, slot) {
    "use strict";
    this.page = page;
    this.slot = slot;
}

Record.RID.getSlotIndex = function(){
    "use strict";
    return this.slot*Constant.slotSize;
}
/**
 * if shcema is not defined , return the previous size
 * @param {Schema}schema
 */
Record.getSize = function (schema) {
    if(schema == undefined) return undefined;
    if (!assert.deepEqual(schema,this.schema))
        return
    else
        return this.size;
}

function updateSize(schema) {
    "use strict";
    this.size = schema.getSize()+Constants.RID + 1;//1 for isNUll
    this.schema = schema;
    return this.size;
}

module.exports = Record;