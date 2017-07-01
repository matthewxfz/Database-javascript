/**
 * Created by matthewxfz on 6/26/17.
 */

var rm = require('./RecordManager'),
    Constants = require('../Constants'),
    Record = require('./Record');

/**
 * Handle of the RM scan
 * @param rel
 * @param bp
 * @constructor
 */
function Scan(table) {
    "use strict";
    this.table = table;
    this.cond;
    this.curse;//RID
    this.maxSlot = table.schema.getSize();
}

Scan.prototype.startScan = function (cond) {
    "use strict";
    if(cond) this.cond = cond;
    this.curse = new Record.RID(0, 1);
};

Scan.prototype.next = function () {
    "use strict";
    while (this.curse.compareTo(this.table.lastRID) <= 0) {
        //read the record
        var record = rm.getRecord(this.table, this.curse, new Record());
        if (record.isNull == 0 && satisfyTheCond(record,this.cond))// the record is not null and satisfied the condition
        {
            nextCurse(this.curse,this.maxSlot);
            return record;
        }
        nextCurse(this.curse,this.maxSlot);
    }

    return null;
};

function satisfyTheCond(record, cond){return true;};

function nextCurse(curse, maxSlot){
    "use strict";
    if(curse.slot == maxSlot){
       curse.page++;
        curse.slot = 0;
    }else{
        curse.slot++;
    }
}

Scan.prototype.closeScan = function () {
    "use strict";
    this.curse = new Record.RID(0, 1);

};

module.exports = Scan;