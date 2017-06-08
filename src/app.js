var fs = require('fs');
var sm = require('./SMFileHandle');


fs.readFile('file not exist!', function callbackStyle(err,data) {
    if(err){
        console.log(err.errno);
        return;
    }
    sm.filename = "hello world";
    comsole.error(sm.filename);
    console.log(data);
})