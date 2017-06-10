const assert = require('assert')
  , storageManager = require('../src/StorageManager.js')
  , path = require('path')
  , async = require('async');


var sleep = require('sleep')
  , File = require('../src/File')
  , util = require('../src/util')
  , fs = require('fs');



describe('Test creat, open, and close file', function () {
  var filename = "file.test",
      file = new File();

  before(function () {
    if (fs.existsSync(filename))
      fs.unlinkSync(filename);
  });

  describe('Create a file', function () {
    it('Should created a file named:' + filename, function () {
      async.series([
        function (callback) {
          storageManager.createPageFile(filename);
        },
        function (callback) {
          assert.equal(true, fs.existsSync(filename));
        }]), function (err) {
          if (err) console.error(err);
        };
    });

  })
  describe('Open file', function () {
    
    it('Should open file successfull', function () {
      storageManager.openPageFile(filename, file);
    })
    
    it('Should have right name in file handle', function () {
      assert.equal(filname,file.fileName);
    });
    it('Expect 1 page in the new file', function () {
      assert.equal(1,file.totalNumPages);
    });
    it('Fresh opened file\' page position should be 0', function () {
      assert.equal(0,file.curPagePos);
    });
  })

  describe('Close file', function () {
    it('Should closed the file successfully', function () {
      storageManager.closePageFile(file);
    })
  })

  describe('Destroy file', function () {
    it('Should not find the file after deletion', function () {
      async.series([
        function (callback) {
          storageManager.destroyPageFile(file);
        },
        function (callback) {
          assert.equal(false, fs.existsSync(filename));
        }
      ], function (errr) {
        if (err) console.error(err)
      });
    })
  })

});

// describe('Test Write', function(){
//   var url = "/Users/matthewxfz/Workspaces/tmp/write.test",
//   file;
//   before(function() {
//     fd = fs.openSync(url,'w+');

//     file = new File(fd, util.parseFileName(url), util.parseFilePath(url), )

//   });

  // describe('Write Several Blocks of data', function () {
  //   it('After write 1 block of data, files size should be larger than 1*PageSize', function () {
  //     buffer = Buffer.allocUnsafe(4096);
  //     for (i = 0; i < 256; i++) {
  //       buffer.write('0123456789abcdef', i * 16);
  //     }
  //     storageManager.writeBlock(0,file);
  //   })
  // })
// })