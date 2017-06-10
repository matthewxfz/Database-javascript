var fs = require('fs')
    , mkdirp = require('mkdirp')
    , async = require('async')
    , path = require('path')
    , StorageManaer = {}
    , DBErrors = require('./DBErrors')
    , File = require('./File');

const PAGE_SIZE = 4096;
const CODING = 'utf8';

/**
 * Init the storage Manager
 */
StorageManaer.initStorageManager = function () {
    console.log("Initializing StorageManager...");
}


/**
 * Async create a file for read and write 
 * 
 * @param {any} filename 
 * @param throw 
 */
StorageManaer.createPageFile = function (filename, callback) {
    fs.open(filename, 'wx+', (err, fd) => {
        if (err) {
            if (err.code === 'EEXIST') {
                callback(new DBErrors('File already exist', DBErrors.type.RC_FILE_EXIST));
            } else {
                callback(err);
            }
        } else {
            console.log('File [' + filename + '] created!');
            fs.write(fd, Buffer.alloc(PAGE_SIZE), 0, PAGE_SIZE, 0, function (err) {
                if (err) {
                    //callback(err);
                }
                callback(null);
            });
        }
    });
}


/**
 * Async open a file
 * @param {any} fileName -filename and path
 * @param {any} file -file handle 
 */
StorageManaer.openPageFile = function (fileName, file, callback) {
    fs.stat(fileName, (err, stats) => {
        if (err) {
            if (err.code == 'ENOENT')
                callback(new DBErrors('File already exist', DBErrors.type.RC_FILE_EXIST));
            else
                callback(err);
        } else {
            fs.open(fileName, 'r+', (err, fd) => {
                console.log('FILE OPENED');
                file.fileName = fileName;
                file.totalNumPages = Math.ceil(stats.size / PAGE_SIZE);
                file.curPagePos = 0;
                file.fd = fd;
                if(callback) callback();
            });
        }
    });
}

/**
 * Async close a file
 * @param {any} file -file handle 
 */
StorageManaer.closePageFile = function (file, callback) {
    fs.close(file.fd, (err) => {
        console.log('FILE CLOSED!');
        callback(err);
    });
}

/**
 * Async destroy a file
 * @param {any} file -file handle 
 */
StorageManaer.destroyPageFile = function (file, callback) {
    fs.unlink(file.filename, (err) => {
        if (!err) {
            file.fileName = null;
            file.totalNumPages = 0;
            file.curPagePos = 0;
            file.fd = null;
            console.log('FILE DELETED!');
        }
        callback(err);
    });
}

/**
 * Async read the data from disk to buffer.
 * 
 * @param {int} pageNum - numebr of page 
 * @param {File} file  - File handle
 * @param {Buffer} memPage - object buffer in memory
 */
StorageManaer.readBlock = function (pageNum, file, memPage) {
    if (file.curPagePos < 0 || file.curPagePos >= file.totalPageNumber) {
        throw new DBErrors("Current page number is not valid", DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY);
    } else {
        fs.read(file.fd, memPage, 0, PAGE_SIZE, pageNum * PAGE_SIZE, function (err, bytesRead, buffer) {
            if (err) {
                if (err = 'EPERM') {
                    throw new DBErrors('Operation not permited', DBErrors.type.RC_READ_FAILED);
                }
                throw err;
            }
        });
    }
}

/**
 * Async Read the first block of the file
 * 
 * @param {any} file -file handle
 * @param {any} memPage 
 */
StorageManaer.readFirstBlock = function (file, memPage) {
    file.curPagePos = 0;
    StorageManaer.readBlock(0, file, memPage);
}

/**
 * Async Read the Previous block of the file
 * 
 * @param {any} file -file handle
 * @param {any} memPage 
 * @param {any} offset -offset of the buffer 
 * @param {any} length -length of the buffer
 */
StorageManaer.readPreviousBlock = function (file, memPage) {
    if (file.curPagePos <= 0) {
        throw new DBErrors("No previous pages", DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY);
    } else {
        file.curPagePos--;
        StorageManaer.readBlock(file.curPagePos, memPage);
    }
}


/**
 * Read current page of data.
 * 
 * @param {File} file 
 * @param {Buffer} memPage 
 */
StorageManaer.readCurrentBlock = function (file, memPage) {
    StorageManaer.readBlock(file.curPagePos);
}


/**
 * Read the next page of file, file handle indicate to the next page
 * 
 * @param {File} file 
 * @param {Buffer} memPage 
 */
StorageManaer.readNextBlock = function (file, memPage) {
    if (file.curPagePos >= file.totalPageNumber) {
        throw new DBErrors("No more pages", DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY);
    } else {
        file.curPagePos++;
        StorageManaer.readBlock(file.curPagePos, memPage);
    }
}


/**
 * Read last page of file
 * 
 * @param {File} file 
 * @param {Buffer} memPage 
 */
StorageManaer.readLastBlock = function (file, memPage) {
    StorageManaer.readBlock(file.totalPageNumber - 1, memPage, offset, length);
}

/**
 * Write Block once asyncly, not recommanded write multiple times, should use readBlockMul instead!Write 
 * Before writting operation, the curPagePos will move to next block
 * @param {int} pageNum - number of current page
 * @param {File} file - File handle
 * @param {Buffer} memPage -buffer contains the data writting to the disk
 */
StorageManaer.writeBlock = function (pageNum, file, memPage) {
    if (pageNum => file.totalPageNumber) {
        file.totalPageNumber = pageNum + 1;
    }
    file.curPagePos = pageNum + file.curPagePos;
    fs.write(file.fd, memPage, 0, PAGE_SIZE, PAGE_SIZE * pageNum, function (err, bytesWritten, buffer) {
        if (err) {
            console.error(err);
        }
        throw err;
    });
}

/**
 * Write Current BLock
 * 
 * @param {File} file 
 * @param {Buffer} memPage 
 */
StorageManaer.writeCurrentBlock = function (file, memPage) {
    StorageManaer.writeBlock(file.curPagePos, file, memPage);
}


/**
 * Write additional blank bLock in the end of the file
 * 
 * @param {File} file 
 * @param {Buffer} memPage  
 */
StorageManaer.appendEmptyBlock = function (file, memPage) {
    file.totalPageNumber++;
    StorageManaer.writeBlock(file.totalPageNumber - 1, file, memPage, Buffer.alloc(PAGE_SIZE));
}

/**
 * If total page number is less than the "numberOfPages", more pages are added untill they are equal.
 * 
 * @param {int} numberOfPages  
 * @param {File} file 
 */
StorageManaer.ensureCapacity = function (numberOfPages, file) {
    if (numberOfPages > file.totalPageNumber) {
        pages = PAGE_SIZE * (numberOfPages - file.totalPageNumber);
        fs.write(file.fd, Buffer.alloc(pages), 0, pages, pages, function (err, bytesWritten, buffer) {
            if (err) {
                console.error(err);
            }
        });
    }
}

StorageManaer.PAGE_SIZE = PAGE_SIZE;

module.exports = StorageManaer;