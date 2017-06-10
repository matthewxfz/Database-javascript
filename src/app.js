var sm = require('./StorageManager')
    , fs = require('fs')
    , File = require('./File')
    , util = require('./util');

const async = require('async');
var fileName = "/Users/matthewxfz/Workspaces/tmp/write.test",
    fileName2 = "/Users/matthewxfz/Workspaces/tmp/fake.test",
    file,
    buf;
fd = fs.openSync(fileName, 'w+');

file = new File(fd, util.parseFileName(fileName), util.parseFilePath(fileName), 2, 0);

buf = Buffer.allocUnsafe(4096);
for (i = 0; i < 256; i++) {
    buf.write('0123456789abcdef', i * 16);
}

sm.createPageFile(fileName, function (fd) {
    sm.openPageFile(fileName, file, function (err,file) {
        console.log(file.totalPageNumber);
        sm.readFirstBlock(file, Buffer.alloc(sm.PAGE_SIZE), function (err, memPage) {
            console.log(memPage[0]);
        });
        sm.ensureCapacity(3, file, function (err, memPage) {
            console.log(file.totalPageNumber);
        })
    });
});


// async.waterfall([
//     function (callback) {
//         sm.openPageFile(fileName2, file,function(err){
//              if(err){
//                  console.error(err);
//              }else{
//                 callback(null, file);
//              }
//         });
//     },
//     function (file, callback) {
//         console.log('file: ' + file.fd + ', ' + file.fileName);
//         callback(null,file);
//     },
//     function(file,callback){
//        sm.closePageFile(file,function(){
//          callback(null,file);
//        })
//     },
//     function(file,callback){
//        sm.destroyPageFile(file,function(){
//            console.log(file.fileName)
//          callback(null);
//        })
//     },
// ], function (err, results) {
//     console.error(err);
// });

