/**
 * Created by matthewxfz on 6/26/17.
 */

var Constants = require('../Constants');
/**
 * Schema Object
 * @param {int}numAttr
 * @param {array}attrNames
 * @param {int}datatypes
 * @param {int}typeLength
 * @param {int}keyAttrs
 * @param {int}keySize
 * @constructor
 */
function Schema(numAttr, attrNames, datatypes, typeLength, keyAttrs, keySize, tableName) {
    "use strict";
    this.numAttr = numAttr;
    this.attrNames = attrNames;
    this.dataTypes = datatypes;
    this.typeLength = typeLength;
    this.keyAttrs = keyAttrs;
    this.keySize = keySize;
    this.tableName = tableName;
    this.size = 0;
    if (this.typeLength)
        this.updateSize();
    else
        this.size += Constants.RID + 1;//1 for isNUll
}

Schema.Datatype = {
    DT_INT: '0',
    DT_STRING: '1',
    DT_FLOAT: '2',
    DT_BOOL: '3'
}

Schema.prototype.getSize = function () {
    "use strict";
    return this.size;
}

Schema.prototype.updateSize = function () {
    "use strict";
    this.size = 0;
    for (var i = 0; i < this.typeLength.length; i++) {
        this.size += this.typeLength[i];
    }
    this.size += Constants.RID + 1;//1 for isNUll
    return this.size;
}

Schema.prototype.getdir = function () {
    if (this.tableName)
        return Constants.workdir + Constants.schemasdir + this.tableName;
    else
        return null;
}
Schema.prototype.upateFromJSON = function (json) {
    this.numAttr = json.numAttr;
    this.attrNames = json.attrNames;
    this.dataTypes = json.dataTypes;
    this.typeLength = json.typeLength;
    this.keyAttrs = json.keyAttrs;
    this.keySize = json.keySize;
    this.tableName = json.tableName;
    this.updateSize();
}

Schema.prototype.maxSlot = function () {
    "use strict";
    var rs = this.getSize();
    return (Constants.PAGE_SIZE) / (rs + Constants.slotSize);
}

module.exports = Schema;
