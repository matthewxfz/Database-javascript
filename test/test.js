const assert = require('assert');
var buf = require('./BM_BufferPool');
var bpe = new buf();
var bp = new buf();
bpe.fixCount = [1,2,3];
bpe.dirty = [0,0,1];
bpe.storage_page_map = [4,5,6];
var str = ['[1 0 3],[2 0 2],[3 0 1]','[2 1 2],[3 1 3],[4 1 4]'];
var buflength = 3;
var bufindex = buflength - 1; 
i = 0;
bp.fixCount = [];
bp.dirty = [];
bp.storage_page_map = [];
function FIFOtest(bp,i){
    var count = 0;
    for(var op in str){
        var array = str[op].split(',');
        for(var key1 in array){
            var subarray = array[key1].split(',');
            for(var key2 in subarray){
                var subarray2 = subarray[key2].split('');
                if(count > bufindex)
                    count = 0;
                bp.storage_page_map[count] = subarray2[1];
                bp.dirty[count] = subarray2[3];
                bp.fixCount[count] = subarray2[5];
                count++;
            }
        }
        if(op == i)
            break;
    }
}
    describe('test',function(){
        FIFOtest(bp,i);
        it('test1',function(){
            assert(3,bp.fixCount[1]);
        })
        it('test2',function(){
            assert(1,bp.dirty[1]);
        })
        it('test3',function(){
            assert(2,bp.storage_page_map[0]);
        })
    })
    


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




