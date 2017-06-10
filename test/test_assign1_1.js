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
        file = file;
      });
      sleep.msleep(1);
    })

    it('Should have right name in file handle', function () {
      assert.equal(filename, file.fileName);
    });
    it('Expect 1 page in the new file', function () {
      assert.equal(1, file.totalNumPages);
    });
    it('Fresh opened file\' page position should be 0', function () {
      assert.equal(0, file.curPagePos);
    });
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
    buf = Buffer.alloc(sm.PAGE_SIZE);

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
      
      console.log(file.totalPageNumber)
    });
    sleep.msleep(1);
    assert.equal(1,file.totalPageNumber);
  });
  it('Expect zero byte in first page of freshly initialized page', function () {
    sm.readFirstBlock(file, buf, function (err, memPage) {
      assert.equal(0, memPage[0]);
    })
  })
  it('Ensure there is 3 pages capacity, 2 more empty pages are expected to be added', function () {
    sm.ensureCapacity(3, file, function (err, memPage) {
      assert.equal(3,file.totalPageNumber);
      assert.equal(0, memPage[4096]);
      assert.equal(0, memPage[8198]);
    })
  })
});