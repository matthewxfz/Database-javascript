const assert = require('assert')
  , sm = require('../src/StorageManager.js')
  , path = require('path')
  , async = require('async');


var sleep = require('sleep')
  , File = require('../src/File')
  , util = require('../src/util')
  , fs = require('fs');


/**
 * ry to create, open, and close a page file 
 */
describe('Test create, open, and close file', function () {
  var filename = "file.test",
    file = new File();

  before(function () {
    if (fs.existsSync(filename))
      fs.unlinkSync(filename);
  });

  describe('Create a file', function () {
    it('Should created a file named:' + filename, function () {
      sm.createPageFile(filename, function () {
        assert.equal(true, fs.existsSync(filename));
      });
    });
  })
  describe('Open file', function () {

    it('Should open file successfull, and have right file handle', function () {
      sm.openPageFile(filename, file, function (file) {
        assert.equal(filename, file.fileName);//Should have right name in file handle
        assert.equal(1, file.totalPageNumber);//Expect 1 page in the new file
        assert.equal(0, file.curPagePos);//Fresh opened file\' page position should be 0
      });
    })
  })

  describe('Close file', function () {
    it('Should closed the file successfully', function () {
      sm.closePageFile(file);
    })
  })

  describe('Destroy file', function () {
    it('Should not find the file after deletion', function () {
      sm.destroyPageFile(file, function () {
        assert.equal(false, fs.existsSync(filename));
      });
    })
  })

});

/**
 * Try to write and read file
 */
describe('Test open, write, read, and close', function () {
  var filename = "file.test",
    file = new File(),
    buf = Buffer.alloc(sm.PAGE_SIZE),
    tmp = Buffer.alloc(sm.PAGE_SIZE, "aba", sm.CODING);

  before(function () {
    if (fs.existsSync(filename))
      fs.unlinkSync(filename);
  });

  it('Should created a file named:' + filename, function () {
    sm.createPageFile(filename, function () {
      assert.equal(true, fs.existsSync(filename));
    });
  });
  it('Should open file successfull, and have right file handle', function () {
    sm.openPageFile(filename, file, function () {
      assert.equal(1, file.totalPageNumber);
    });
    sleep.msleep(1);

  });
  it('Expect zero byte in first page of freshly initialized page', function () {
    sm.openPageFile(filename, file, function () {
      sm.readFirstBlock(file, Buffer.alloc(sm.PAGE_SIZE), function (err, memPage) {
        assert.equal(0, memPage[0]);
      })
    });
  })
  it('Ensure there is 3 pages capacity, 2 more empty pages are expected to be added', function () {
    sm.openPageFile(filename, file, function () {
      sm.ensureCapacity(3, file, function (err, memPage) {
        if (err) console.error(err)
        //console.log(file.totalPageNumber + ', ' + file.fileName);
        assert.equal(3, file.totalPageNumber);
        assert.equal(0, memPage[4096]);
        assert.equal(0, memPage[8198]);
      })
    })
  })

  it('Write 1,2,3 Block and should the read content should be the same', function () {
    sm.openPageFile(filename, file, function () {
      async.waterfall([
        function (cb) {
          buf = Buffer.alloc(sm.PAGE_SIZE, 'a');
          sm.writeBlock(0, file, buf, function () {
            cb(null, file);
          });
        },
        function (file, cb) {
          buf = Buffer.alloc(sm.PAGE_SIZE, 'b');
          sm.writeBlock(1, file, buf, function () {
            cb(null, file);
          })
        },
        function (file, cb) {
          buf = Buffer.alloc(sm.PAGE_SIZE, 'c');
          sm.writeBlock(2, file, buf, function () {
            cb(null);
          })
        },
      ], function (err) {
        if (err) console.error(err);
      });//async
    });//open file
  });//test case 

  it('Read current, previous, and next block of 2nd block', function () {
    async.series([
      function (cb) {//current
        file.curPagePos = 1;
        var buf = Buffer.alloc(sm.PAGE_SIZE, 'b', sm.CODING);
        //console.log('read '+file.fileName+', '+file.fd)
        sm.readCurrentBlock(file, tmp, function (err) {
          //onsole.log(tmp.toString())
          assert.equal(0, buf.compare(tmp));
          cb()
        })
      },
      // function (cb) {//previous
      //   file.curPagePos = 1;
      //   buf = Buffer.alloc(sm.PAGE_SIZE, 'a', sm.CODING);
      //   sm.readPreviousBlock(file, tmp, function (err) {
      //     ///console.log('buf' + buf[0] + '. tmp' + tmp[0]);
      //     assert(0, buf.compare(tmp));
      //     cb()
      //   })
      // },
      // function(cb) {//next
      //   file.curPagePos = 1;
      //   buf = Buffer.alloc(sm.PAGE_SIZE, 'c', sm.CODING);
      //   sm.readNextBlock(file, tmp, function (err) {
      //     assert.equal(0, buf.compare(tmp));
      //   })
      }
    ], function (err) {
        if(err) console.error(err);
    });
  })

  // it('Read last block of 2nd block', function () {
  //   file.curPagePos = 1;
  //   buf = Buffer.alloc(sm.PAGE_SIZE, 'c', sm.CODING);
  //   sm.readLastBlock(file, tmp, function (err) {
  //     assert.equal(0, buf.compare(tmp));
  //   })
  // })

  // it('Read first block of 2nd block', function () {
  //   file.curPagePos = 1;
  //   buf = Buffer.alloc(sm.PAGE_SIZE, 'a', sm.CODING);
  //   sm.readFirstBlock(file, tmp, function (err) {
  //     assert.equal(0, buf.compare(tmp));
  //   })
  // });//it
});