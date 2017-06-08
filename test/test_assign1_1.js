var assert = require('assert');
var storageManager = require('../src/StorageManager.js');
var sleep = require('sleep');

var fs = require('fs');
var filename = "/Users/matthewxfz/Workspaces/tmp/emptyfile2.test";
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
  describe('Create a file',function(){
    it('Should created a file named:'+filename,function(){
        storageManager.createPageFile(filename);
        sleep.usleep(1);
        assert.equal(true,fs.existsSync(filename));
    });
  })
});