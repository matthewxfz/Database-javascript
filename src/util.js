var util = {};


/**
 * Parse the input path string to get the name of the file
 * 
 * @param {any} str 
 * @returns name string of the file
 */
util.parseFileName = function(str){
    var tmp = str.split("/");
    if(tmp.length <= 0){
        throw new RangeError("The input string is empty");
    }else{
        return tmp[tmp.length-1];
    }
}

util.parseFilePath = function(str){
    var filename = util.parseFileName(str);
    if(str.length == filename.length){
        throw new RangeError('The input string is not a valid file path');
    }else{
        return str.substr(0,str.length-filename.length-1);
    }
}

module.exports = util;