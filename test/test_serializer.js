var tb = require('../src/Table.js'),
    RID = require('../src/RID'),
    Record = require('../src/Record'),
    RM_TableData = require('../src/RM_TableData'),
    Schema = require('../src/Schema'),
    Value = require('../src/ValueHelper'),
    rms = require('../src/rm_serializer');
    assert = require('assert');

describe('Functionality Test',function() {
    describe('Macro function test',function() {
    it('Should return value size 0, buffer size 100',() => {
        var vs = tb.makeVarString();
        assert.equal(0,vs.size);
        assert.equal(100,vs.bufsize);
    });

    it('Should return abc of buffer content, the same value size of string size and 100 buffer size',() => {
        var vs = tb.makeVarString(),
            str = 'abc';
        tb.Append(vs,str);
        assert.equal(str.length,vs.size);
        assert.equal(str,vs.buf.toString('utf8',0,vs.size));
        assert.equal(100,vs.bufsize); 
    });
    
    it('Should return 200 of buffer size',() => {
        var vs = tb.makeVarString();
        tb.ensureSize(vs,101);
        assert.equal(200,vs.bufsize);
    });

    it('Should return the same content and size as given',() => {
        var vs = tb.makeVarString(),
            string = 'abc';
        tb.Append(vs,string);
        // string += '\0';
        assert.equal(string,tb.getAndReturnString(vs));
        assert.equal(string.length,tb.getAndReturnString(vs).length);
    });
    });

    describe('Schema Test',function() {
        var attname = ['ID','Name','Score'],
                dt = [0,2,1],
                tl = [3,10,5],
                ka = [0,2],
                ks = ka.length,
                sch = new Schema(3,attname,dt,tl,ka,ks);
        it('Serialize Schema',() => {
            console.log(rms.serializeSchema(sch));
        });

        var rel = new RM_TableData('student',sch,3);

        it('Serialize TableInfo',() => {
            console.log(rms.serializeTableInfo(rel));
        })
        var rid = new RID(0,2);
        var data = [1,'zhiquan',100];
        var rc = new Record(rid,data);

        it('serializeAttr',() => {
            console.log(rms.serializeAttr(rc,sch,1));
        })

        it('serializeRecord',() => {
            console.log(rms.serializeRecord(rc,sch));
        })
        var v = new Value(0,22)
        it('serializeValue',() => {
            // console.log(rms.serializeValue(v));
            assert.equal('22',rms.serializeValue(v));
        })
        var val1 = 'i325';
        it('stringToValue:int',() => {
            assert.equal(0,rms.stringToValue(val1).dt)
            assert.equal(325,rms.stringToValue(val1).intV);
        })

        var val2 = 'f2.5'
        it('stringToValue:float',() => {
            assert.equal(1,rms.stringToValue(val2).dt)
            assert.equal(2.5,rms.stringToValue(val2).floatV);
        })

        var val3 = 'szhiquan'
        it('stringToValue:string',() => {
            assert.equal(2,rms.stringToValue(val3).dt)
            assert.equal('zhiquan',rms.stringToValue(val3).stringV);
        })

        var val4 = 'bfalse'
        it('stringToValue:boolean',() => {
            assert.equal(3,rms.stringToValue(val4).dt)
            assert.equal(false,rms.stringToValue(val4).boolV);
        })

    });
    
});

