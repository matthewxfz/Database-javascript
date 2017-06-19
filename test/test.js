const assert = require('assert');
var buf = require('./BM_BufferPool');
var bpe = new buf();
var bp = new buf();
bp.fixCount = [2,3,4];
bp.dirty = ['x',' ','x'];
bp.storage_page_map = [2,3,4];
var str = ['[1 3],[2 2],[3 1]','[2x2],[3 3],[4x4]'];
var buflength = 3;
var bufindex = buflength - 1; 
var i = 0;


    /**
     * Return if the intput data fits the expect result?
     * 
     * @param {BM_BufferPool} bp -- buffer pool
     * @param {string} [str=[i]]  --expect result in a moment i
     */
    function bmTestHelper(bp, str,i){
        var count = 0;
        var array = str[i].split(',');
        for(var key in array){
            var subarray = array[key].split('');
            if(bp.storage_page_map[key] == subarray[1] 
            && bp.dirty[key] == subarray[2] 
            && bp.fixCount[key] == subarray[3]){
                count++;
            }
        }
        if(count == buflength)
            return true;
        return false;
    }


    console.log(bmTestHelper(bp,str,i));
    // var count = 0;
    // for(var op in str){
    //     var array = str[op].split(',');
    //     for(var key1 in array){
    //         var subarray = array[key1].split(',');
    //         for(var key2 in subarray){
    //             var subarray2 = subarray[key2].split('');
    //             if(count > bufindex)
    //                 count = 0;
    //             bp.storage_page_map[count] = subarray2[1];
    //             bp.dirty[count] = subarray2[3];
    //             bp.fixCount[count] = subarray2[5];
    //             count++;
    //         }
    //     }
    //     if(op == i)
    //         break;
    // }

    // describe('test',function(){
    //     FIFOtest(bp,i);
    //     it('test1',function(){
    //         assert(3,bp.fixCount[1]);
    //     })
    //     it('test2',function(){
    //         assert(1,bp.dirty[1]);
    //     })
    //     it('test3',function(){
    //         assert(2,bp.storage_page_map[0]);
    //     })
    // })
    


    // str.forEach(function(element) {
    //     var array = element.split(',');
    //     array.forEach(function(element) {
    //         var subarray = element.split(',');
    //         subarray.forEach(function(element){
    //             var subarray2 = element.split('');
    //             if(count > i)
    //                 count = 0;
    //             bp.storage_page_map[count] = subarray2[1];
    //             bp.dirty[count] = subarray2[3];
    //             bp.fixCount[count] = subarray2[5];
    //             count++;
    //         })
    //     })
        
    // });
    // console.log(bp.fixCount);




