function testHelper() {

}

/**
     * Return if the intput data fits the expect result?
     * 
     * @param {BM_BufferPool} bp -- buffer pool
     * @param {string} [str=[i]]  --expect result in a moment i
     */
testHelper.bmTestHelper = function (bp, str) {
    var count = 0;
    var array = str.split(',');
    for (var key in array) {
        var subarray = array[key].split('');
        if (bp.storage_page_map[key] == subarray[1]
            && bp.dirty[key] == subarray[2]
            && bp.fixCount[key] == subarray[3]) {
            count++;
        }
    }
    if (count == bp.numPages)
        return true;
    return false;
}

module.exports = testHelper;