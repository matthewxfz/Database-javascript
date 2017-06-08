var fs = require('fs')
    , mkdirp = require('mkdirp')
    , async = require('async')
    , path = require('path')
    , SM_FileHandle = { fd: '', fileName: 'name', filePath: '', totalPageNumber: '0', curPagePos: '0' }
    , StorageManaer = {}
    , DBErrors = require('./Errors')
    ;
const PAGE_SIZE = 4096;
const CODE = 'utf8';

class File {
    constructor(fd, fileName, filePath, totalPageNumber, curPagePos) {
        this.fd = fd;
        this.fileName = fileName;
        this.filePath = filePath;
        this.totalPageNumber = totalPageNumber;
        this.curPagePos = curPagePos;
    }
}

/**
 * Init the storage Manager
 */
initStorageManager = function () {
    smHandle.fileName = 'hello';
    console.log(smHandle.fileName);
}


StorageManaer.createPageFile = function (filename) {
    fs.open(filename, 'wx', (err, fd) => {
        if (err) {
            if (err.code === 'EEXIST') {
                console.error(filename + 'already exists');
                return;
            }
            throw err;
            ;
        }
        return true;
    });
}

/**
 * Async read the data from disk to buffer.
 * 
 * @param {any} pageNum - numebr of page 
 * @param {any} file  - File handle
 * @param {any} memPage - object buffer in memory
 * @param {any} offset - start bytes of the buffer
 * @param {any} length - read length of the buffer
 */
StorageManaer.readBlock = function (pageNum, file, memPage, offset, length) {
    fs.read(file.fd, memPage, offset, length, pageNum * PAGE_SIZE, function (err, bytesRead, buffer) {
        if (err) {
            console.error(err);
            return;
        }
    });
}

/**
 * Async Read the first block of the file
 * 
 * @param {any} file 
 * @param {any} memPage 
 * @param {any} offset 
 * @param {any} length 
 */
StorageManaer.readFirstBlock = function (file, memPage, offset, length) {
    StorageManaer.readBlock(0, file, memPage, offset, length);
}

StorageManaer.readPreviousBlock = function (file, memPage, offset, length) {
    if (file.curPagePos <= 0) {
        throw new DBErrors("No previous pages", DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY);
    } else {
        file.curPagePos--;
        StorageManaer.readBlock(file.curPagePos, memPage, offset, length);
    }
}

StorageManaer.readCurrentBlock = function (file, memPage, offset, length) {
    if(file.curPagePos < 0 || file.curPagePos >= file.totalPageNumber){
        throw new DBErrors("Current page number is not valid", DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY);
    }else{
        StorageManaer.readBlock(file.curPagePos, memPage, offset, length);
    }
}

StorageManaer.readNextBlock = function(file, memPage, offset, length) {
    if(file.curPagePos >= file.totalPageNumber){
        throw new DBErrors("No more pages", DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY);
    }else{
        file.curPagePos++;
        StorageManaer.readBlock(file.curPagePos, memPage, offset, length);
    }
}

StorageManaer.readLastBlock = function(file, memPage, offset, length) {
        StorageManaer.readBlock(file.totalPageNumber-1, memPage, offset, length);
}

/**
 * Write Block once, not recommanded write multiple times, should use readBlockMul instead!Write 
 * 
 * @param {any} pageNum - number of current page
 * @param {any} file - File handle
 * @param {any} memPage -buffer contains the data writting to the disk
 * @param {any} offset -start bytes of the buffer
 * @param {any} length -length of data in the buffer
 * @returns err if write fail
 */
StorageManaer.writeBlock = function (pageNum, file, memPage, offset, length) {
    if(pageNum => file.totalPageNumber){
        file.totalPageNumber = pageNum+1;
    }
    fs.write(file.fd, memPage, offset, length, PAGE_SIZE * pageNum, function (err, bytesWritten, buffer) {
        if (err) {
            console.error(err);
        }
    });
}

StorageManaer.writeCurrentBlock = function (file, memPage, offset, length) {
    StorageManaer.writeBlock(file.curPagePos,memPage,offset,length);
}

StorageManaer.appendEmptyBlock = function (file, memPage, offset, length) {
    file.totalPageNumber++;
    StorageManaer.writeBlock(file.totalPageNumber,memPage,new Buffer(4096,'utf8'),0,PAGE_SIZE);
}

StorageManaer.ensureCapacity = function (numberOfPages, file){
    if(numberOfPages > file.totalPageNumber){
        pages = PAGE_SIZE *(numberOfPages-file.totalPageNumber);
        fs.write(file.fd, new Buffer(pages,'utf8'), 0, pages, pages, function (err, bytesWritten, buffer) {
        if (err) {
            console.error(err);
        }
     });
    }
}

StorageManaer.getInformationOfPath = function () {
    path = "/Users/matthewxfz/Workspaces/tmp/emptyfile.test"
    fs.stat(path, function (err, stats) {
        console.log(path);
        console.log();
        console.log(stats);
        console.log();

        if (stats.isFile()) {
            console.log('    file');
        }
        if (stats.isDirectory()) {
            console.log('    directory');
        }

        console.log('    size: ' + stats["size"]);
        console.log('    mode: ' + stats["mode"]);
        console.log('    others eXecute: ' + (stats["mode"] & 1 ? 'x' : '-'));
        console.log('    others Write:   ' + (stats["mode"] & 2 ? 'w' : '-'));
        console.log('    others Read:    ' + (stats["mode"] & 4 ? 'r' : '-'));

        console.log('    group eXecute:  ' + (stats["mode"] & 10 ? 'x' : '-'));
        console.log('    group Write:    ' + (stats["mode"] & 20 ? 'w' : '-'));
        console.log('    group Read:     ' + (stats["mode"] & 40 ? 'r' : '-'));

        console.log('    owner eXecute:  ' + (stats["mode"] & 100 ? 'x' : '-'));
        console.log('    owner Write:    ' + (stats["mode"] & 200 ? 'w' : '-'));
        console.log('    owner Read:     ' + (stats["mode"] & 400 ? 'r' : '-'));


        console.log('    file:           ' + (stats["mode"] & 0100000 ? 'f' : '-'));
        console.log('    directory:      ' + (stats["mode"] & 0040000 ? 'd' : '-'));



    });
}

var filename = "/Users/matthewxfz/Workspaces/tmp/adfad.test";
StorageManaer.createPageFile(filename);
var fd = fs.openSync(filename, 'w+');
var file = new File(fd,'name',filename,1,1);
StorageManaer.writeBlock(0,file,Buffer("That is a record!",'utf8'),0,15);


//var fdo = fs.openSync(filename, 'r');
var output = new Buffer(20);
file = new File(fd,'name',filename,1,1);
StorageManaer.readBlock(0,file,output,0,20);
console.log(output.toString('utf8',0,15));





module.exports = StorageManaer;