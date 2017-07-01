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
    CleanEnv();
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

    function CleanEnv() {
        deleteSchemaAndTable('table1');
        deleteSchemaAndTable('testScan');
        deleteFile(Constants.workdir+Constants.catalog);
    }

    function deleteSchemaAndTable(tablename) {
        deleteFile(Constants.workdir + Constants.tablesdir + tablename);
        deleteFile(Constants.workdir + Constants.schemasdir + tablename);
    }
    function deleteFile(path){
        try {
            fs.accessSync(path);
            fs.unlink(path);
        } catch (err) {
            if (err.code == 'ENOENT') {
                //do nothing
            }
        }
    }

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

        it('should be recorded in catalog file', () => {
            assert.notEqual(null, rm.CatalogManager.find('table1'));
        })
    });

    function checkSchema(tableName, target) {
        var schema = getSchemaFromFile(tableName);
        assert.equal(true, compareString(JSON.stringify(schema), (JSON.stringify(target))))
    }

    function compareString(str, str2) {
        if (str.length != str2.length) return false;
        for (var i = 0; i < str.length; i++) {
            if (str[i] != str2[i]) return false;
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

    function Tuple(str, intc, floarc, booleanc) {
        this.str = str;
        this.intc = intc;
        this.floarc = floarc;
        this.booleanc = booleanc;
    }

    Tuple.prototype.udpateFromJSON = function (json) {
        this.str = json.str;
        this.intc = json.intc;
        this.floarc = json.floarc;
        this.booleanc = json.booleanc;
    }

    Tuple.prototype.compareTo = function (tar) {
        if (this.str.localeCompare(tar.str) &&
            this.inc == tar.intc &&
            this.floarc == tar.floarc &&
            this.booleanc == tar.booleanc)
            return true;
        else
            return false;
    }

    var array = new Array(36);

    function fillArrayWithData(array) {
        var ndata = new Tuple('a', 525, 5.25, 0);
        for (var i = 0; i < 36; i++) {
            array[i] = ndata;
            ndata = new Tuple(String.fromCharCode(ndata.str.charCodeAt(0) + 1),
                ndata.intc + 7,
                ndata.floarc + 0.7,
                1 - ndata.booleanc)
        }
        return array;
    }

    describe('Test insert many records', () => {
        var table1;
        it('Should open table successfull', () => {
            rm.openTable('table1');
            table1 = rm.getTableByName('table1');
        })
        it('Should insert 36 records right', () => {
            fillArrayWithData(array);
            for (var i = 0; i < array.length; i++) {
                rm.insertRecord(table1,
                    new Record('', 0, [array[i].intc, array[i].str, array[i].floarc, array[i].booleanc]));
            }
        });
        it('Should have same value as the originial data', () => {
            for (var i = 0; i < array.length; i++) {
                // rm.getRecord(table1,)
            }
        })
        it('Should close the file successfully', () => {
            rm.closeTable(table1);
        })
    });


    describe('Test Scan', () => {
        var table, scan;
        var tuples = new Array(36);//inserted
        var tableName = 'testScan';
        var schema = rm.createSchema(4, // num of attr
            ['ID', 'NAME', 'Percent', 'isAva'],//attr name
            [Schema.Datatype.DT_INT, Schema.Datatype.DT_STRING, Schema.Datatype.DT_FLOAT, Schema.Datatype.DT_BOOL],
            [4, 32, 4, 1], // type length
            1, //number of keywords
            [1, 0, 0, 0], //keys, 1 for yes, 0 for no
            tableName);

        it('Should create table successfull', () => {
            rm.createTable(tableName, schema);
        })
        it('Should open table successfull', () => {
            rm.openTable(tableName);
            table = rm.getTableByName(tableName);
        })
        it('should insert 36 data successfull', () => {
            fillArrayWithData(tuples);
            for (var i = 0; i < tuples.length; i++) {
                rm.insertRecord(table,
                    new Record('', 0, [tuples[i].intc, tuples[i].str, tuples[i].floarc, tuples[i].booleanc]));
            }
        })
        it('Should reOpen the file successfully!', () => {
            rm.closeTable(table);
            rm.openTable(tableName);
        })
        it('Should starScan successfully', () => {
            scan = new rm.Scan(table);
            scan.startScan();
        })

        it('Should scan all the element insertted before', () => {
            var data = scan.next();
            var i = 0;
            while (data != null) {
                var nTuple = new Tuple(data[1], data[0], data[2], data[3]);
                assert(true, nTuple.compareTo(tuples[i]));
                data = scan.next();
            }
        })

        it('Should close the file successfully!', () => {
            rm.closeTable(table);
        })
        it('Should destroy the file successfull', () => {
            rm.deleteTable(tableName);
        })
        it('After the deletion, the table should not befound in catalog', () => {
            assert.equal(null, rm.CatalogManager.find(tableName));
        })
    });

    describe('Test multiple scan ', () => {
        var table, scan;
        var tuples = new Array(36);//inserted
        var tableName = 'testScan';
        var schema = rm.createSchema(4, // num of attr
            ['ID', 'NAME', 'Percent', 'isAva'],//attr name
            [Schema.Datatype.DT_INT, Schema.Datatype.DT_STRING, Schema.Datatype.DT_FLOAT, Schema.Datatype.DT_BOOL],
            [4, 32, 4, 1], // type length
            1, //number of keywords
            [1, 0, 0, 0], //keys, 1 for yes, 0 for no
            tableName);

        it('Should create table successfull', () => {
            rm.createTable(tableName, schema);
        })
        it('Should open table successfull', () => {
            rm.openTable(tableName);
            table = rm.getTableByName(tableName);
        })
        it('should insert 36 data successfull', () => {
            fillArrayWithData(tuples);
            for (var i = 0; i < tuples.length; i++) {
                rm.insertRecord(table,
                    new Record('', 0, [tuples[i].intc, tuples[i].str, tuples[i].floarc, tuples[i].booleanc]));
            }
        })

        it('Should reOpen the file successfully!', () => {
            rm.closeTable(table);
            rm.openTable(tableName);
        })
        it('Should starScan successfully', () => {
            scan = new rm.Scan(table);
            scan.startScan();
        })

        it('Should reOpen the file successfully!', () => {
            rm.closeTable(table);
            rm.openTable(tableName);
        })
        it('Should starScan again successfully', () => {
            scan = new rm.Scan(table);
            scan.startScan();
        })

        it('Should scan all the element insertted before', () => {
            var data = scan.next();
            var i = 0;
            while (data != null) {
                var nTuple = new Tuple(data[1], data[0], data[2], data[3]);
                assert(true, nTuple.compareTo(tuples[i]));
                data = scan.next();
            }
        })

        it('Should close the file successfully!', () => {
            rm.closeTable(table);
        })
        it('Should destroy the file successfull', () => {
            rm.deleteTable(tableName);
        })
        it('After the deletion, the table should not befound in catalog', () => {
            assert.equal(null, rm.CatalogManager.find(tableName));
        })
    });


})