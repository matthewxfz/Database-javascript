var assert = require('assert');
var storageManager = require('../src/StorageManager.js');
var sleep = require('sleep');
var File = require('../src/File');
var util = require('../src/util');

var fs = require('fs');

describe('Test creat, open, and close file', function () {
  var fielpath = "/Users/matthewxfz/Workspaces/tmp/file.test",
  file;
  before(function() {

  });

  describe('Create a file', function () {
    it('Should created a file named:' + filename, function () {
      storageManager.createPageFile(filename);
      sleep.sleep(1);
      assert.equal(true, fs.existsSync(filename));
    });
  })

});

describe('Test Write', function(){
  var url = "/Users/matthewxfz/Workspaces/tmp/write.test",
  file;
  before(function() {
    fd = fs.openSync(url,'w+');
    
    file = new File(fd, util.parseFileName(url), util.parseFilePath(url), )
    
  });

  // describe('Write Several Blocks of data', function () {
  //   it('After write 1 block of data, files size should be larger than 1*PageSize', function () {
  //     buffer = Buffer.allocUnsafe(4096);
  //     for (i = 0; i < 256; i++) {
  //       buffer.write('0123456789abcdef', i * 16);
  //     }
  //     storageManager.writeBlock(0,file);
  //   })
  // })
})