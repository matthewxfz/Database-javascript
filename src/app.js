var fs = require('fs');


fs.readFile('file not exist!', function callbackStyle(err,data) {
    if(err){
        console.log(err.errno);
        return;
    }
    console.log(data);
})