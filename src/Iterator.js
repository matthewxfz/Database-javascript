/**
 * Created by matthewxfz on 6/30/17.
 */

function Iterator(head){
    "use strict";
    this.curse = head;
}

Iterator.prototype.hasNext = function(){
    "use strict";
    if(this.curse.pre.data == 'head')
        return false;
    else
        return true;
}

Iterator.prototype.next = function(){
    "use strict";
    this.curse = this.curse.pre;
    return this.curse;
}

module.exports = Iterator;