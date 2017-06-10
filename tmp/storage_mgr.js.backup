class File {
    constructor(fd, fileName, filePath, totalPageNumber, curPagePos) {
        this.fd = fd;
        this.fileName = fileName;
        this.filePath = filePath;
        this.totalPageNumber = totalPageNumber;
        this.curPagePos = curPagePos;
    }
}
var fs = require('fs');
File f = new File();

exports.initStorageManager = function (){
	console.log("Initializing StorageManager...");
}

exports.createPageFile = function (fileName){
	fs.stat(fileName,(err,stats) => {
		if(err == null){
			console.log('FILE EXISTS');
		}else if(err.code =='ENOENT'){
			fs.writeFile(fileName,'',(err)=> {
				if(err)
					console.log(err.code);
				else
					console.log('FILE CREATED!');
			});
		}else{
			console.log(err.code);
		}
	});
}

exports.openPageFile = function(fileName,f){
	fs.stat(fileName,(err,stats)=> {
		if(err == null){
			fs.open(fileName,'r+',(err,fd)=> {
				console.log('FILE OPENED');
			});
			var totalNumPages = stats.size / pageSize;
			f.fileName = fileName;
			f.totalNumPages = totalNumPages;
			f.curPagePos = 0;
			f.fd = fd;

		}else if(err.code == 'ENOENT')
			console.log('FILE NOT FOUND');
		else
			console.log(err.code);
	});
}

exports.closePageFile = function(f){
	fs.close(f.fileName,(err)=> {
		if(err) {
			console.log('CLOSED FILE FAILED!');
			throw err;
			return;
		}
			console.log('FILE CLOSED!');
	});
}
exports.destroyPageFile = function(f){
	fs.unlink('f.fileName',(err)=> {
		if(err) {
			if(err == 'ENOENT')
				console.log('FILE NOT FOUND!')
			else
				console.log(err.code);
			return;
		}
		f.fileName = null;
		f.totalNumPages = 0;
		f.curPagePos = 0;
		f.fd = null;
		console.log('FILE DELETED!');
	});
}

exports.readBlock = function(storage){
	fs.read(fd,buf,offset,null,(err,bytesread,buffer) => {
		if(err){
			console.log('READ FILE FAILED');
			return;
		}

	})

}

