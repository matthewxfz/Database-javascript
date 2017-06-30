/**
 * Created by matthewxfz on 6/26/17.
 */
const Constants = require('../Constants');
const assert = require('assert');
/**
 * Record Object
 * @param id
 * @param isNull
 * @param data
 * @constructor
 */
function Record(id, isNull, data) {
    "use strict";
    this.id = id;
    this.isNull = isNull;
    this.data = data;
}

Record.RID = function(page, slot) {
    "use strict";
    this.page = page;
    this.slot = slot;
}

Record.RID.prototype.getSlotIndex = function () {
    "use strict";
    return this.slot * Constants.slotSize;
}

Record.prototype.toString = function () {
    return JSON.stringify(this.id) + ', ' + JSON.stringify(this.isNull) + ', ' + JSON.stringify(this.data);
}

// /**
//  * if shcema is not defined , return the previous size
//  * @param {Schema}schema
//  */
// Record.prototype.getSize = function (schema) {
//     if (schema == undefined) return undefined;
//     try{
//         assert.equal(schema, this.tmpschema)
//     }catch (err){
//         updateSize(schema);
//     }
//
//     return this.size;
// }
//
// function updateSize(schema) {
//     "use strict";
//     this.size = schema.getSize() + Constants.RID + 1;//1 for isNUll
//     this.tmpschema = schema;
//     return this.size;
// }

module.exports = Record;