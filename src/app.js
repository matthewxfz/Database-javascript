var StorageManager = require('./StorageManager')
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
async.waterfall([
    function (callback) {
        StorageManager.openPageFile(fileName2, function(err){
            callback(null, file);
        });
    },
    function (file, callback) {
        console.log('file: ' + file.fd + ', ' + file.fileName);
        callback(null);
    }
], function (err, results) {
    console.log('finally');
});

