'use strict'
const tb = require('../src/Table.js'),
      Serializer = {},
      Value = require('../src/ValueHelper');
// const RecordManager = require('../src/RecordManager.js');
// var tb = new Table();
// var rm = new RecordManager();

const DatatypeEnum = {
    DT_INT : 0,
    DT_FLOAT : 1,
    DT_STRING : 2,
    DT_BOOL : 3
}

Serializer.serializeTableInfo = function(rel) {
    var result = tb.makeVarString();
    var string = 'TABLE ' + rel.name +' with ' + rel.mgmData + ' tuples:\n';
    tb.Append(result,string);
    tb.Append(result,Serializer.serializeSchema(rel.schema));
    return tb.getAndReturnString(result);
}

Serializer.serializeTableContent = function(rel) {
    var result = tb.makeVarString();
    for(var i = 0;i < rel.schema.numAttr;i++){
        tb.Append(result,(i != 0)? ', ' : '',rel.schema.attrNames[i]);
    }
    rm.startScan(rel,sc,NULL);
    while(rm.next(sc,r) != RC_RM_NO_MORE_TUPLES) {
        appendString(result,serializeRecord(r,rel.schema));
        appendString(result,'\n');
    }
    rm.closeScan(sc);
    return tb.getAndReturnString(result);
}

Serializer.serializeSchema = function(schema) {
    var result = tb.makeVarString();
    var string = 'Schema with <' + schema.numAttr + '> attributes (';
    tb.Append(result,string);
    for(var i = 0;i < schema.numAttr;i++) {
        string = ((i != 0) ? ', ' : '') + schema.attrNames[i] + ': ';
        tb.Append(result,string);
        switch (schema.dataTypes[i]) {
            case DatatypeEnum.DT_INT:
                tb.appendString(result,'INT');
                break;
            case DatatypeEnum.DT_FLOAT:
                tb.appendString(result,'FLOAT');
                break;
            case DatatypeEnum.DT_STRING:
                tb.appendString(result,'STRING[' + schema.typeLength[i] + ']');
                break;
            case DatatypeEnum.DT_BOOL:
                tb.appendString(result,'BOOL');
                break; 
        }
    }
    tb.appendString(result,')');
    tb.appendString(result,' with keys: (');

    for(var i = 0;i < schema.keySize;i++) {
        string = ((i != 0) ? ', ' : '') + schema.attrNames[schema.keyAttrs[i]];
        tb.Append(result,string);
    }

    tb.appendString(result,')\n');
    return tb.getAndReturnString(result);
}

Serializer.serializeRecord = function(record,schema) {
    var result = tb.makeVarString();
    var string = '[' + record.id.pageNum + '-' + record.id.slot + '] (';
    tb.Append(result,string);

    for(var i = 0;i < schema.numAttr;i++) {
        tb.appendString(result,Serializer.serializeAttr(record,schema,i));
        tb.Append(result,(i == schema.numAttr - 1) ? '' : ',');
    }

    tb.appendString(result,')');
    return tb.getAndReturnString(result);
} 

Serializer.serializeAttr = function(record,schema,attrNum) {
    // var offset,
    //     attrData = record.data;
    var result = tb.makeVarString();

    // tb.attrOffset(schema,atrrNum,offset);
    // attrData = record.data + offset;

    switch(schema.dataTypes[attrNum]) {
        case DatatypeEnum.DT_INT:
        {
            var val = record.data[attrNum];
            // val = attrData;
            var string = schema.attrNames[attrNum] + ":" + val;
            tb.Append(result,string);
        }
            break;
        case DatatypeEnum.DT_STRING:
        {
            var len = schema.typeLength[attrNum];
            var buf = record.data[attrNum].substr(0,len);
            buf += '\0';
            var string = schema.attrNames[attrNum] + ':' + buf;
            tb.Append(result,string);
        }
            break;
        case DatatypeEnum.DT_FLOAT:
        {
           var val = record.data[attrNum];
           var string = schema.attrNames[attrNum] + ":" + val;
           tb.Append(result,string);
        }
            break;
        case DatatypeEnum.DT_BOOL:
        {
           var val = record.data[attrNum];
           var string = schema.attrNames[attrNum] + ":" + val ? 'true' : 'false';
           tb.Append(result,string);
        }
        break;
        default:
            return 'NO SERIALIZER FOR DATATYPE';
    }
    return tb.getAndReturnString(result);

}

Serializer.serializeValue = function(val) {
    var result = tb.makeVarString();
    var string = '';
    switch(val.dt) {
        case DatatypeEnum.DT_INT:
            string += val.intV;
            tb.Append(result,string);
            break;
        case DatatypeEnum.DT_FLOAT:
            string += val.floatV;
            tb.Append(result,string);
            break;
        case DatatypeEnum.DT_STRING:
            tb.Append(result,val.stringV);
            break;
        case DatatypeEnum.DT_BOOL:
            tb.appendString(result,(val.boolV) ? 'true' : 'false');
            break;
    }
    return tb.getAndReturnString(result);
}

Serializer.stringToValue = function(val){
    var result = new Value();
    switch(val[0]){
        case 'i':
            result.dt = DatatypeEnum.DT_INT;
            result.intV = parseInt(val.substr(1,val.length));
            break;
        case 'f':
            result.dt = DatatypeEnum.DT_FLOAT;
            result.floatV = parseFloat(val.substr(1,val.length));
            break;
        case 's':
            result.dt = DatatypeEnum.DT_STRING;
            result.stringV = val.substr(1,val.length);
            break;
        case 'b':
            result.dt = DatatypeEnum.DT_BOOL;
            result.boolV = (val[1] == 't') ? true : false;
            break;
        default:
            result.dt = DatatypeEnum.DT_INT;
            result.intV = -1;
            break;
    }
    return result;
}



// Serializer.attrOffset = function(schema,attrNum,result) {
//     var offset = 0,
//         attrPos = 0;
//     for(attrPos = 0;attrPos < attrNum;attrPos++){
//         switch(schema.dataTypes[attrPos]){
//             case DatatypeEnum.DT_STRING:
//                 offset += schema.typeLength[attrPos];
//                 break;
//             case DatatypeEnum.DT_INT:
//                 offset += 4;
//                 break;
//             case DatatypeEnum.DT_FLOAT:
//                 offset += 4;
//                 break;
//             case DatatypeEnum.DT_BOOL:
//                 offset += 1;
//                 break;
//         }
//         result = offset;
//     }
// }











module.exports = Serializer;