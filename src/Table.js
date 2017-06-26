'use strict'
var dataType = {
    DT_INT: 0,
    DT_STRING: 1,
    DT_FLOAT: 2,
    DT_BOOL: 3,
    },
    Table = {};

function varString(buf,size) {
    this.buf = buf;
    this.size = size;
    this.bufsize = buf.length;
}

Table.makeVarString = function() {
    var varible = new varString(Buffer.alloc(100),0);
    return varible;
}

Table.getAndReturnString = function(varible) {
    var rst = varible.buf.toString('utf8',0,varible.size);
    // rst += '\0';
    return rst;
}

Table.Append = function(varible,string) {
    Table.appendString(varible,string);
}

Table.ensureSize = function(varible,newsize) {
    if(varible.bufsize < newsize){
        while((varible.bufsize *= 2) < newsize);
        var tmp = varible.buf.toString();
        varible.buf = Buffer.alloc(varible.bufsize);
        varible.buf.write(tmp,0);
    }
}

Table.appendString = function(varible,string) {
    var len = varible.size + string.length;
    Table.ensureSize(varible,len);
    varible.buf.write(string,varible.size);
    varible.size += string.length;
}

module.exports = Table;