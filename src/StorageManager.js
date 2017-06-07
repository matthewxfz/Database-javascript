var fs = require('fs')
  , mkdirp = require('mkdirp')
  , async = require('async')
  , path = require('path')
  , StorageManager = {}
  ;

StorageManager.exists = fs.exists;
StorageManager.rename = fs.rename;
StorageManager.writeFile = fs.writeFile;
StorageManager.unlink = fs.unlink;
StorageManager.appendFile = fs.appendFile;
StorageManager.readFile = fs.readFile;
StorageManager.mkdirp = mkdirp;

/**
 * Init the storage Manager
 */
StorageManager.initStorageManager = function(){
    return 0;
}

StrorageManager.createPageFile = function(fileaName){

}