var StorageManager = require('./StorageManager')
    , fs = require('fs')
    , File = require('./File')
    , util = require('./util');


var url = "/Users/matthewxfz/Workspaces/tmp/write.test",
    file
    ,buf;
fd = fs.openSync(url, 'w+');

file = new File(fd, util.parseFileName(url), util.parseFilePath(url), 2, 0);

buf = Buffer.allocUnsafe(4096);
for (i = 0; i < 256; i++) {
    buf.write('0123456789abcdef', i * 16);
}


StorageManager.ensureCapacity(4,file);

