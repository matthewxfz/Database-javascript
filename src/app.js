'use strict'
var sm = require('./SM/StorageManager'),
    rm = require('./RM/RecordManager'),
    fs = require('fs'),
    File = require('./BM/File'),
    util = require('./util/util'),
    assert = require('assert'),
    BMQueue = require('./BM/BMQueue'),
    Queue = require('./util/Queue'),
    TestHelper = require('../test/TestHelper'),
    Constants = require('./Constants'),
    CatalogM = require('./RM/CatalogManager'),
    Catalog = require('./RM/Catalog'),
    Schema = require('./RM/Schema'),
    Record = require('./RM/Record'),
    sleep = require('sleep'),
    Page = require('./BM/Page'),
    Iterator = require('./util/Iterator');

var ts = require('../test/TestHelper');

var BM_PageHandle = require('./BM/Page');
var bm = require('./BM/BufferManager');

var Clock = require('./BM/Clock'),
    Heap = require('heap');

var buf = Buffer.alloc(Constants.PAGE_SIZE);

testTableWholeFunction();

function testTableWholeFunction() {

    rm.initRecordManager();
    rm.createTable('student',
        rm.createSchema(4, ['name', 'school', 'age', 'isFool'],
            [Schema.Datatype.DT_STRING, Schema.Datatype.DT_STRING, Schema.Datatype.DT_INT, Schema.Datatype.DT_BOOL],
            [8, 8, 4, 4],
            1,
            [1, 0, 0, 0],
            'student'));
    rm.createTable('department',
        rm.createSchema(4, ['did', 'name', 'salary', 'isBig'],
            [Schema.Datatype.DT_INT, Schema.Datatype.DT_STRING, Schema.Datatype.DT_INT, Schema.Datatype.DT_BOOL],
            [8, 8, 4, 4],
            1,
            [1, 0, 0, 0],
            'department'));
    rm.createTable('school',
        rm.createSchema(4, ['sid', 'name', 'studnet', 'isClosed'],
            [Schema.Datatype.DT_INT, Schema.Datatype.DT_STRING, Schema.Datatype.DT_INT, Schema.Datatype.DT_BOOL],
            [8, 8, 4, 4],
            1,
            [1, 0, 0, 0],
            'school'));

    rm.openTable('student');
    var students = rm.getTableByName('student');
    rm.insertRecord(students,new Record('',0,['Xiong','iit',10,1]));
    rm.insertRecord(students,new Record('',0,['Yan','iit',10,1]));
    rm.insertRecord(students,new Record('',0,['Lee','iit',10,1]));
    rm.insertRecord(students,new Record('',0,['Sync','iit',10,1]));
    rm.insertRecord(students,new Record('',0,['Liang','iit',10,1]));

    rm.closeTable(students);

    rm.shutdownRecordManager();


}


