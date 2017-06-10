function File(fd, fileName, filePath, totalPageNumber, curPagePos) {
    this.fd = fd;
    this.fileName = fileName;
    //this.filePath = filePath;
    this.totalPageNumber = totalPageNumber;
    this.curPagePos = curPagePos;
}


module.exports = File;
