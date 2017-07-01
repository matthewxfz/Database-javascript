/**
 * Created by matthewxfz on 6/30/17.
 */

var Table = require('./Table'),
    fs = require('fs'),
    sm = require('../SM/StorageManager'),
    Queue = require('../util/Queue');
var Constants = require('../Constants');


function TablePool(){
    "use strict";
    this.tables = new Queue();
}

TablePool.prototype.size = function(){
    "use strict";
    if(this.tables){
        return 0;
    }else{
        return this.tables.length;
    }
}

TablePool.prototype.add = function(table){
    "use strict";
    this.tables.push(table);
}

TablePool.prototype.remove =  function(table){
    "use strict";
    var ite = this.tables.iterator();
    while(ite.hasNext()){
        var ta = ite.next();
        if(ta.data.compareTo(table))
            this.tables.remove(ta);
    }
}

TablePool.prototype.search = function(tableName){
    "use strict";
    var ite = this.tables.iterator();
    while(ite.hasNext()){
        var ta = ite.next();
        if(ta.data.name  == tableName)
            return ta.data;
    }
    return null;
}

module.exports = TablePool;
