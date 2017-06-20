function testHelper() {

}
/**
     * Return if the intput data fits the expect result?
     * 
     * @param {BM_BufferPool} bp -- buffer pool
     * @param {string} [str=[i]]  --expect result in a moment i
     */
testHelper.bmTestHelper = function(bp, str){
    var count = 0;
    var array = str.split(',');
    for (var i = 0;i<array.length;i++) {
        var val = {};
        var p = 0;
        var subarray = array[i].split('');
        if(subarray[1] == '-'){
            val[0] = '-'+subarray[2];
            p=3;
        }else{
            val[0] = subarray[1];
            p=2;
        }
        if(subarray[p] == ' ') val[1] = 0;
        else val[1] = 1;

        if(subarray[p+1] == '-'){
            val[2] = '-'+subarray[p+2];
        }else{
            val[2] = subarray[p];
        }
        
        if (bp.storage_page_map[i] == val[0]
            && bp.dirty[i] == val[1]
            && bp.fixcount[i] == val[2]) {
            count++;
        }else{
             return false;
        }
    }
    return true;
}

module.exports = testHelper;