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
function Schema(numAttr, attrNames, datatypes, typeLength, keyAttrs, keySize){
    "use strict";
    this.numAttr = numAttr;
    this.attrNames = attrNames;
    this.dataTypes = datatypes;
    this.typeLength = typeLength;
    this.keyAttrs = keyAttrs;
    this.keySize = keySize;
}

Schema.Datatype = {
    DT_INT:'0',
    DT_STRING:'1',
    DT_FLOAT:'2',
    DT_BOOL:'3'
}

Schema.getSize = function(){
    "use strict";
    for (var l in this.schema.length) {
        this.size += l;
    }
    this.size += Constants.RID + 1;//1 for isNUll

    return this.size;
}

module.exports = Schema;


