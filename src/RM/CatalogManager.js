/**
 * Created by matthewxfz on 6/30/17.
 */
var Catalog = require('./Catalog');
var Record = require('./Record');
var rm = require('./RecordManager');
var CatalogManager ={};

var catalog;

CatalogManager.init = function(){
    "use strict";
    catalog = new Catalog();
}

CatalogManager.shutdown = function(){
    "use strict";
    catalog.shutdown();
}


CatalogManager.add = function(tableName, numOfTuples){
    "use strict";
    var data = catalog.add(tableName);
    //catalog.updateLastRID(data.RID);
    rm.insertRecord(catalog, catalog.getRecord(data));
}

CatalogManager.remove = function(tableName){
    "use strict";
    var data = catalog.remove(tableName);
    rm.deleteRecord(catalog,data.RID);
}

CatalogManager.find = function(tableName){
    "use strict";
    var node = catalog.search(tableName);
    if(node){
        var record = new Record();
        rm.getRecord(catalog, node.data.RID, record);
        return record;
    }else
        return null;
}
/**
 *
 * @param tableName
 * @param {Catalog.tableInfo}data
 * @returns {*}
 */
CatalogManager.update = function(data){
    "use strict";
    var record = this.find(data.tableName);
    data.RID = record.id;
    catalog.update(data.tableName, data);
    rm.updateRecord(catalog,catalog.getRecord(data))
}



module.exports = CatalogManager;