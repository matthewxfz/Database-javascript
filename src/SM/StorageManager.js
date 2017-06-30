'use strict';
var fs = require('fs')
    , mkdirp = require('mkdirp')
    , async = require('async')
    , path = require('path')
    , StorageManaer = {}
    , DBErrors = require('../DBErrors')
    , File = require('../BM/File')
    , Constants = require('../Constants');

const PAGE_SIZE = Constants.PAGE_SIZE;
const CODING = Constants.CODING;

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
    var p;
    fs.open(filename, 'wx+', (err, fd) => {
        if (err) {
            if (err.code === 'EEXIST') {
                err = new DBErrors('File already exist', DBErrors.type.RC_FILE_EXIST);
            }
            if (callback) callback(err);
        } else {
            //console.log('File [' + filename + '] created!');
            var buf = Buffer.alloc(PAGE_SIZE, ' ', CODING);
            fs.write(fd, buf, 0, PAGE_SIZE, 0, function (err) {
                if (callback) callback(err, fd);
            });
        }
    });
}


/**
 * Async open a file
 * @param {string} filename -filename and path
 * @param {File} file -file handle 
 */
StorageManaer.openPageFile = function (filename, file, callback) {
    fs.open(filename, 'w+', (err, fd) => {
        fs.stat(filename, (err, stats) => {
            if (err) {
                if (err.code == 'ENOENT')
                    err = new DBErrors('File already exist', DBErrors.type.RC_FILE_EXIST);
                if (callback) callback(err, file);
            } else {
                //console.log('FILE OPENED');
                file.fileName = filename;
                file.totalPageNumber = stats.size / PAGE_SIZE;
                file.curPagePos = 0;
                file.fd = fd;
                if (callback) callback(err, file);
            }
        });

    });
}

/**
 * Return teh number of pages in a file
 * @param filename
 * @returns {number}
 */
StorageManaer.getPageNumofFile = function(filename){
    const fd = fs.openSync(filename,'r+');
    var state = fs.fstatSync(fd);

    return stats.size / PAGE_SIZE;
}


/**
 * Sync open a file
 * 
 * @param {any} filename 
 * @param {any} file 
 * @param {any} callback 
 */
StorageManaer.openPageFileSync = function (filename, file, callback) {
    try {
        var fd = fs.openSync(filename, 'w+');
        var stats = fs.fstatSync(fd);
    } catch (error) {
        if (error.code == 'ENOENT')
            error = new DBErrors('File already exist', DBErrors.type.RC_FILE_EXIST);
        if (callback) callback(err, file);
    }
    file.fileName = filename;
    file.totalPageNumber = stats.size / PAGE_SIZE;
    file.curPagePos = 0;
    file.fd = fd;
    if (callback) callback(null, file);
}

/**
 * Async close a file
 * @param {any} file -file handle 
 */
StorageManaer.closePageFile = function (file, callback) {
    fs.close(file.fd, (err) => {
        //console.log('FILE CLOSED!');
        callback(err);
    });
}

/**
 * Async destroy a file
 * @param {any} file -file handle 
 */
StorageManaer.destroyPageFile = function (file, callback) {
    if (file.fileName == undefined) callback(new DBErrors('File Not Exist!', DBErrors.type.RC_FILE_NOT_FOUND))
    fs.unlink(file.fileName, (err) => {
        if (!err) {
            file.fileName = null;
            file.totalNumPages = 0;
            file.curPagePos = 0;
            file.fd = null;
            //console.log('FILE DELETED!');
        }
        callback(err);
    });
}

StorageManaer.destroyFile = function(fileName, cb){

    fs.unlink(fileName, (err)=>{
        if(cb) cb(err);
        else{
            if(err) throw err;
        }
    })
}

StorageManaer.destroyJSONFileSync = function(fileName, cb){
    fs.unlinkSync(fileName);
}

/**
 * Async read the data from disk to buffer.
 * 
 * @param {int} pageNum - numebr of page 
 * @param {File} file  - File handle
 * @param {Buffer} memPage - object buffer in memory
 */
StorageManaer.readBlock = function (pageNum, file, memPage, callback) {
    if (file.curPagePos < 0 || file.curPagePos >= file.totalPageNumber) {
        callback(new DBErrors("Current page number is not valid", DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY));
    } else {
        fs.read(file.fd, memPage, 0, PAGE_SIZE, pageNum * PAGE_SIZE, function (err, bytesRead, buffer) {
            if (err) {
                err = DBErrors('Operation not permited', DBErrors.type.RC_READ_FAILED);
            }
            callback(err, buffer);
        });
    }
}




/**
 * Safely read one block multiple time using stream
 *
 * @param {any} filename --file path
 * @param {any} buffer --written file
 * @param {any} offset --start page in the buffer
 * @param {any} position --start page in the file
 *
 * @param {any} callback
 */
StorageManaer.safeReadBlock = function (filename, buf, offset, position, callback) {
    const opt = {
        flags: 'r+',
        encoding: 'hex',
        fd: null,
        mode: 0o666,
        autoClose: true,
        start: position * PAGE_SIZE,
        end: position * PAGE_SIZE + PAGE_SIZE
    };
    var readStream = fs.createReadStream(filename, opt);
    //readStream.resume();
    readStream.on('data', (chunk) => {
        //console.log('data'+chunk);
        buf.write(chunk, offset,'hex');
        //console.log('buf'+buf);
        offset += chunk.length;
    });
    readStream.on('end', () => {
        // console.log('end');
        if (callback) callback(null, buf);
    });

    readStream.on('error', (err) => {
        if (callback) callback(err, buf);
    });
}

/**
 * Async read the data from disk to buffer.
 * 
 * @param {int} pageNum - numebr of page 
 * @param {File} file  - File handle
 * @param {Buffer} memPage - object buffer in memory
 * @param {Buffer} offset - page number in the buffer
 * 
 */
StorageManaer.readBlockWithOffset = function (pageNum, file, memPage, offset, callback) {
    if (file.curPagePos < 0 || file.curPagePos >= file.totalPageNumber) {
        callback(new DBErrors("Current page number is not valid", DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY));
    } else {
        fs.read(file.fd, memPage, offset, PAGE_SIZE, pageNum * PAGE_SIZE, function (err, bytesRead, buffer) {
            if (err) {
                err = DBErrors('Operation not permited', DBErrors.type.RC_READ_FAILED);
            }
            callback(err, buffer);
        });
    }
}


/**
 * Async Read the first block of the file
 * 
 * @param {any} file -file handle
 * @param {any} memPage 
 */
StorageManaer.readFirstBlock = function (file, memPage, callback) {
    file.curPagePos = 0;
    StorageManaer.readBlock('0', file, memPage, callback);
}

/**
 * Async Read the Previous block of the file
 * 
 * @param {any} file -file handle
 * @param {any} memPage 
 * @param {any} offset -offset of the buffer 
 * @param {any} length -length of the buffer
 */
StorageManaer.readPreviousBlock = function (file, memPage, callback) {
    if (file.curPagePos <= 0) {
        callback(new DBErrors("No previous pages", DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY));
    } else {
        file.curPagePos--;
        StorageManaer.readBlock(file.curPagePos, file, memPage, callback);
    }
}


/**
 * Read current page of data.
 * 
 * @param {File} file 
 * @param {Buffer} memPage 
 */
StorageManaer.readCurrentBlock = function (file, memPage, callback) {
    StorageManaer.readBlock(file.curPagePos, file, memPage, callback);
}


/**
 * Read the next page of file, file handle indicate to the next page
 * 
 * @param {File} file 
 * @param {Buffer} memPage 
 */
StorageManaer.readNextBlock = function (file, memPage, callback) {
    if (file.curPagePos >= file.totalPageNumber) {
        callback(new DBErrors("No more pages", DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY));
    } else {
        file.curPagePos++;
        StorageManaer.readBlock(file.curPagePos, file, memPage, callback);
    }
}


/**
 * Read last page of file
 * 
 * @param {File} file 
 * @param {Buffer} memPage 
 */
StorageManaer.readLastBlock = function (file, memPage, callback) {
    StorageManaer.readBlock(file.totalPageNumber - 1, file, memPage, callback);
}

/**
 * Write Block once asyncly, not recommanded write multiple times, should use writeStream instead!
 * Before writting operation, the curPagePos will move to next block
 * @param {int} pageNum - number of current page
 * @param {File} file - File handle
 * @param {Buffer} memPage -buffer contains the data writting to the disk
 */
StorageManaer.writeBlock = function (pageNum, file, memPage, callback) {
    //console.log('in '+file.totalPageNumber);
    if (pageNum >= file.totalPageNumber) {
        callback(new DBErrors('Out of max pags number', DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY), null, file)
    } else {
        fs.write(file.fd, memPage, 0, PAGE_SIZE, PAGE_SIZE * pageNum, function (err, bytesWritten, buffer) {
            callback(err, buffer, file);
        });
    }

}

/**
 * This is used for safe write one block of data, you should use this function in multiple writting situation 
 * 
 * @param {any} file 
 * @param {any} buf 
 * @param {any} offset --page in buffer
 * @param {any} position --page in file
 * @param {any} callback 
 */
StorageManaer.safeWriteBlock = function (filename, buf, offset, position, callback) {
    var opt = {
        flags: 'w+',
        defaultEncoding: 'hex',
        fd: null,
        mode: 0o666,
        autoClose: true,
        start: position * PAGE_SIZE
    }
    var writeStream = fs.createWriteStream(filename, opt);

    keepWrite(callback);
    function keepWrite(callback) {
        var ok = writeStream.write(buf.slice(offset * PAGE_SIZE, (offset + 1) * PAGE_SIZE), 'hex', callback);
        if (!ok)
            writeStream.once('drain', keepWrite());
    }
}

/**
 * This is used for safe write override a JSON sting to file, you should use this function in multiple writting situation
 *
 * @param {any} file
 * @param {any} buf
 * @param {any} offset --page in buffer
 * @param {any} position --page in file
 * @param {any} callback
 */
StorageManaer.writeJSON = function (filename, buf, callback) {
    var opt = {
        flags: 'w+',
        defaultEncoding: 'hex',
        fd: null,
        mode: 0o666,
        autoClose: true,
        start: 0
    }
    var writeStream = fs.createWriteStream(filename, opt);

    keepWrite(callback);
    function keepWrite(callback) {
        var ok = writeStream.write(buf, Constants.CODING, callback);
        if (!ok)
            writeStream.once('drain', keepWrite());
    }
}

StorageManaer.writeJSONSync = function (filename, buf, callback) {
    fs.writeFileSync(filename,buf,Constants.CODING);
}

/**
 * Safely read file to JSON string
 *
 * @param {any} filename --file path
 * @param {any} buffer --written file
 * @param {any} offset --start page in the buffer
 * @param {any} position --start page in the file
 *
 * @param {any} callback
 */
StorageManaer.readJSON = function (filename, callback) {
    fs.access(filename,fs.constants.R_OK, (err)=>{
        if(err) throw err;
    });
    return fs.readFileSync(filename,Constants.CODING);
}




/**
 * Write Block once asyncly, not recommanded write multiple times, should use writeStream instead!
 * Before writting operation, the curPagePos will move to next block
 * @param {int} pageNum - number of current page
 * @param {File} file - File handle
 * @param {Buffer} memPage -buffer contains the data writting to the disk
 * @param {Buffer} offset - page number in the buffer
 * 
 */
StorageManaer.writeBlockWithOffset = function (pageNum, file, memPage, offset, callback) {
    //console.log('in '+file.totalPageNumber);
    if (pageNum >= file.totalPageNumber) {
        callback(new DBErrors('Out of max pags number', DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY), null, file)
    } else {
        fs.write(file.fd, memPage, offset * PAGE_SIZE, PAGE_SIZE, PAGE_SIZE * pageNum, function (err, bytesWritten, buffer) {
            if (err) throw err;
            callback(err, buffer, file);
        });
    }

}


/**
 * Write Current BLock
 * 
 * @param {File} file 
 * @param {Buffer} memPage 
 */
StorageManaer.writeCurrentBlock = function (file, memPage, callback) {
    StorageManaer.writeBlock(file.curPagePos, file, memPage, callback);
}

/**
 * Write Current BLock
 * 
 * @param {File} file 
 * @param {Buffer} memPage 
 * @param {int} offset
 */
StorageManaer.writeCurrentBlockWithOffset = function (file, memPage, offset, callback) {
    StorageManaer.writeBlockWithOffset(file.curPagePos, file, memPage, offset, callback);
}

/**
 * Write additional blank bLock in the end of the file
 * 
 * @param {File} file 
 * @param {Buffer} memPage  
 */
StorageManaer.appendEmptyBlock = function (file, callback) {
    file.totalPageNumber++;
    var buf = Buffer.alloc(PAGE_SIZE);
    buf[PAGE_SIZE - 1] = '\0';
    StorageManaer.writeBlock(file.totalPageNumber - 1, file, buf, callback);
}

/**
 * If total page number is less than the "numberOfPages", more pages are added untill they are equal.
 * 
 * @param {int} numberOfPages  
 * @param {File} file 
 */
StorageManaer.ensureCapacity = function (numberOfPages, file, callback) {
    if (numberOfPages > file.totalPageNumber) {
        file.totalPageNumber = numberOfPages;
        // var pages = PAGE_SIZE * (numberOfPages - file.totalPageNumber);
        // fs.write(file.fd, Buffer.alloc(pages).fill(' '), 0, pages, PAGE_SIZE * file.totalPageNumber, function (err, bytesWritten, buffer) {
        //     if (!err)
        //         file.totalPageNumber = numberOfPages;
        //     callback(err, file);
        // });
        callback(null, file);
    } else {
        callback(null, file);
    }
}

StorageManaer.PAGE_SIZE = PAGE_SIZE;
StorageManaer.CODING = CODING;

module.exports = StorageManaer;