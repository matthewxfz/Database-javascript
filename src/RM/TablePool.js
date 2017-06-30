/**
 * Created by matthewxfz on 6/30/17.
 */

var Table = require('./Table'),
    fs = require('fs'),
    sm = require('../SM/StorageManager'),
    Queue = require('../Queue');
var Constants = require('../Constants');


function TablePool(){
    "use strict";
    this.tables = new Queue();
}

TablePool.size = function(){
    "use strict";
    if(this.tables){
        return 0;
    }else{
        return this.tables.length;
    }
}

TablePool.add = function(table){
    "use strict";
    this.tables.push(table);
}

TablePool.remove =  function(table){
    "use strict";
    var ite = table.iterator();
    while(ite.hasNext()){
        var ta = ite.next();
        if(ta.compareTo(table))
            this.tables.remove(table);
    }
}

TablePool.search = function(tableName){
    "use strict";
    var ite = table.iterator();
    while(ite.hasNext()){
        var ta = ite.next();
        if(ta.data.name == tableName)
            return ta;
    }
    return null;
}

module.exports = TablePool;
