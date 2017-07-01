/**
 * Created by matthewxfz on 6/30/17.
 */

var rm = require('../src/RM/RecordManager'),
    sm = require('../src/SM/StorageManager'),
    Constants = require('../src/Constants'),
    Schema = require('../src/RM/Schema'),
    Record = require('../src/RM/Record')
    assert = require('assert'),
    fs = require('fs');

describe('Test cases for Record Manager', () => {
    "use strict";
    var table1, table2, table3;
    var schema1, schema2, schema3;
    schema1 = rm.createSchema(4, // num of attr
        ['ta1_ID', 'ta1_NAME', 'ta1_FLOAT', 'ta1_isTure'],//attr name
        [Schema.Datatype.DT_INT, Schema.Datatype.DT_STRING, Schema.Datatype.DT_FLOAT, Schema.Datatype.DT_BOOL],
        [4, 32, 4, 1], // type length
        1, //number of keywords
        [1, 0, 0, 0], //keys, 1 for yes, 0 for no
        'table1');

    rm.initRecordManager();

    describe('Test create tables', () => {
        it('should create table succesfull', () => {
            rm.createTable('table1', schema1);
        });

        it('should create table with schema file and table file', () => {
            checkTableAndSchema('table1');
        })

        it('should store right schema in the file', () => {
            checkSchema('table1', schema1);
        })
    });

    function checkSchema(tableName, target) {
        var schema = getSchemaFromFile(tableName);
        assert.equal(true, compareString(JSON.stringify(schema),(JSON.stringify(target))))
    }

    function compareString(str, str2){
        if(str.length != str2.length) return false;
        for(var i=0;i<str.length;i++){
            if(str[i] != str2[i]) return false;
        }
        return true;
    }
    function getSchemaFromFile(tableName) {
        "use strict";
        var json = JSON.parse(sm.readJSON(Constants.workdir + Constants.schemasdir + tableName));
        var schema = new Schema();
        schema.upateFromJSON(json);
        return schema;
    }

    function checkTableAndSchema(tableName) {
        fs.open(Constants.workdir + Constants.tablesdir + tableName, 'wx', (err, fd) => {
            assert.equal('EEXIST', err.code);
        });
        fs.open(Constants.workdir + Constants.schemasdir + tableName, 'wx', (err, fd) => {
            assert.equal('EEXIST', err.code);
        });
    }
    function reData(str, intc, floarc, booleanc){
        this.str = str;
        this.intc = intc;
        this.floarc = floarc;
        this.booleanc = booleanc;
    }

    var array = new Array(36);

    function fillArrayWithData(){
        var ndata = new reData('a',525,5.25,0);
        for(var i=0;i<36;i++){
            array[i] = ndata;
            ndata = new reData(ndata.str+1,
            ndata.intc+7,
            ndata.floarc+0.7,
            1 - ndata.booleanc)
        }
    }
     describe('Test insert many records',()=>{
         var table1;
         it('should open table successfull',()=>{
             rm.openTable('table1');
             table1 = rm.getTableByName('table1');
         })
         it('should insert 20 records right',()=>{
             fillArrayWithData();
             for(var i=0;i<array.length/2;i++){
                 rm.insertRecord(table1,
                     new Record('',0,[array[i].intc, array[i].str, array[i].floarc, array[i].booleanc]));
             }
         });
     });
    // describe('Test records');
    // describe('Test creat tables and insert');
    // describe('Test update table');
    // describe('Test scan');
    // describe('Test scan two');
    // describe('Test multiple scan');

    after(() => {

    });
})