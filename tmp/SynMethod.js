
StorageManaer.readBlock = function (pageNum, file, memPage){
    if (file.curPagePos < 0 || file.curPagePos >= file.totalPageNumber) {
         new DBErrors("Current page number is not valid", DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY);
    } else {
        fs.readSync(file.fd, memPage, 0, PAGE_SIZE, pageNum * PAGE_SIZE);
    }
}

StorageManaer.writeBlock = function (pageNum, file, memPage){
    if (pageNum >= file.totalPageNumber) {
         new DBErrors('Out of max pags number', DBErrors.type.RC_PAGE_NUMBER_OUT_OF_BOUNDRY);
    } else {
        fs.writeSync(file.fd, memPage, 0, PAGE_SIZE, PAGE_SIZE * pageNum);
    }
}

StorageManaer.createPageFile = function (filename) {
    if(fs.existsSync(filename)){
        fs.openSync(filename,'wx+');
    }else{
        var buf = Buffer.alloc(PAGE_SIZE,' ',CODING);
        fs.writeSync(fd, buf, 0, PAGE_SIZE, 0)
    }
}

StorageManaer.openPageFile = function (filename, file) {
    if(fs.existsSync(filename)){
        fs.openSync(filename,'wx+');
        file.fileName = filename;
        file.totalPageNumber = stats.size / PAGE_SIZE;
        file.curPagePos = 0;
        file.fd = fd;
    }else{
        new DBErrors('File already exist', DBErrors.type.RC_FILE_EXIST);
    }
}

StorageManaer.closePageFile = function (file) {
    if(!fs.existsSync(file.filename)){
         new DBErrors('file not found',DBErrors.type.RC_FILE_NOT_FOUND);
    }
    fs.closeSync(file.fd);
}

StorageManaer.destroyPageFile = function (file) {
    if (file.fileName == undefined) {
         new DBErrors('File Not Exist!', DBErrors.type.RC_FILE_NOT_FOUND);
    }else{
        fs.unlinkSync(file.fileName);
        if(!fs.existsSync(file.filename)){
            file.fileName = null;
            file.totalNumPages = 0;
            file.curPagePos = 0;
            file.fd = null;
        }else{
            console.log('File deletion failed'); 
        }
    }
}