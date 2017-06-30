function Schema (numAttr,attrNames,dataTypes,typeLength,keyAttrs,keySize) {
    this.numAttr = numAttr;
    this.attrNames = attrNames;
    this.dataTypes = dataTypes;
    this.typeLength = typeLength;
    this.keyAttrs = keyAttrs;
    this.keySize = keySize;
}


module.exports = Schema;