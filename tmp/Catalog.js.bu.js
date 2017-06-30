/**
 * Created by matthewxfz on 6/27/17.
 */
var Table = require('./Table'),
    fs = require('fs'),
    sm = require('../SM/StorageManager'),
    Queue = require('../Queue'),
    Page = require('../BM/Page');
var Constants = require('../Constants');
function Catalog() {
    "use strict";
    this.numTable;
    this.tableInfos = new Queue();

    initCatalog();
}

Catalog.prototype = Object.create(Table.prototype);
Catalog.prototype.constructor = Catalog;

TableInfo = function (tableName, numTuple) {
    "use strict";
    this.tableName = tableName;
    this.numberOfTuple = numTuple;
}

Catalog.prototype.getTableAccess = function (tableName) {
    "use strict";
    return Constants.workdir + Constants.tablesdir + tableName;
}

Catalog.prototype.getSchemaAccess = function (tableName) {
    "use strict";
    return Constants.workdir + Constants.schemasdir + tableName;
}

Catalog.getCatalogAccess = function () {
    "use strict";
    return Constants.workdir + Constants.catalog;
}


Catalog.prototype.updateFromJSON = function (json) {
    "use strict";
    this.numTable = json.numTable;
    this.tableInfos = json.tableInfos;
}


function initCatalog() {
    "use strict";
    var page = new Page();

    try {
        fs.accessSync(this.getCatalogAccess(), fs.constants.R_OK);
        this.updateFromJSON(JSON.parse(sm.readJSON(this.getCatalogAccess())));
    } catch (err) {
        if (err.code === 'ENOENT') {// build the empty file
            this.numAttr = 0;

            update();
        }
    }
};

Catalog.prototype.update = function (table) {
    "use strict";
    if (table) {
        var tableInfo = this.search(table.name);
        if (tableInfo) {
            updateAtable(tableInfo, table);
        }
    }
    updatefile(this);
};

function updateAtable(tableInfo, table) {
    "use strict";
    tableInfo.numberOfTuple = table.numberOfTuple;
}

function updatefile(catalog) {
    "use strict";
    var page = new Page();

    fs.accessSync(Catalog.getCatalogAccess(), fs.constants.W_OK);
    sm.writeJSON(Catalog.getCatalogAccess(),
        new Buffer(JSON.stringify({
            'numTable': catalog.numTable,
            'tableInfos': catalog.tableInfos
        })),
        (err) => {
            if (err) throw err;
        });
}


Catalog.prototype.add = function (tableName) {
    "use strict";
    this.tableInfos.push(new TableInfo(tableName, 0));
}

Catalog.prototype.remove = function (tableName) {
    "use strict";
    var node = this.search(tableName);
    if (node != null) this.tableInfos.remove(node);
}

Catalog.prototype.search = function (tableName) {
    "use strict";
    var ite = table.iterator();
    while (ite.hasNext()) {
        var ta = ite.next();
        if (ta.data.tableName == tableName)
            return ta;
    }
    return null;
}

Catalog.tableExist = function (tableName) {
    "use strict";
    var res = this.search(tableName);
    if (res == null) return false;
    return true;
}
module.exports = Catalog;