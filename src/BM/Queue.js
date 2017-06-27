var Queue = function (max, fixcount) {
    this.max = max;
    if (!(fixcount instanceof Array)) {
        throw new TypeError('Fixcount should be an array!');
    }
    this.fixcount = fixcount;
    this.head = new Node('head', null, null);

    this.head.pre = this.head;
    this.head.next = this.head;
    this.length = 0;
}

function Node(data, pre, next) {
    this.data = data;
    this.pre = pre;
    this.next = next;
}
Queue.prototype.peek = function () {
    if (this.length == 0) return null;
    else {
        return this.head.pre.data;
    }
}

Queue.prototype.push = function (data) {
    if (this.length < this.max) {
        var node = new Node(data, null, null);
        node.pre = this.head;
        node.next = this.head.next;
        this.head.next.pre = node;
        this.head.next = node;
    
        this.length++;
    } else {
        console.error('Queue out of boundary! ' );
    }
}

Queue.prototype.pop = function () {
    var node = findPopElement(this.head.pre, this.fixcount);

    if (node == null) return null;
    node.pre.next = node.next;
    node.next.pre = node.pre;
    this.length--;
    return node.data;
}

Queue.prototype.toString = function(){
    var node = head.next;
    var result = '';
    if(node == null) result = null;
    while(node.data != 'head'){
        result += node.data + ', '
    }
    
    return result;
}

Queue.prototype.moveToHead = function(pageNum){
    var node = this.head.next;
    while(node.data != 'head'){
        if(pageNum == node.data){
            this.remove(node);
            this.push(node);
            return;
        }
    }
}

Queue.prototype.remove = function(node){
    remove(node);
}

function remove(node){
    if(node.data != 'head'){
        node.pre.next = node.next;
        node.next.pre = node.pre;
    }else{
        throw new Error('cannot delete head!');
    }
}


function findPopElement(node, fixcount) {
    while (node.data != 'head') {
        if (fixcount[node.data] == 0) {
            return node;
        }
        node = node.pre;
    }
    return null;
}







module.exports = Queue;