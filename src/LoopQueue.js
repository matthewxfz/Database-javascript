var LoopQueue = function (max) {
    this.max = max;
    this.tail = new Node('Na', null, null);
    this.tail.next = this.tail;
    this.tail.pre = this.tail;
    this.length = 0;

}

function Node(data, pre, next) {
    this.data = data;
    this.pre = pre;
    this.next = next;
}
LoopQueue.prototype.peek = function () {
    if (this.length == 0) return null;
    else {
        return this.ail.data;
    }
}

LoopQueue.prototype.push = function (data) {
    if (this.length == 0) {
        this.tail.data = data;
    } else {
        if (this.length < this.max) {
            var node = new Node(data, null, null);
            node.next = this.tail.next;
            node.pre = this.tail;
            this.tail.next.pre = node;
            this.tail.next = node;
            this.tail = node;
        } else {
            throw new Error('Loop Queue out of boundary!');
        }
    }
    this.length = this.length + 1;
}

LoopQueue.prototype.pop = function () {
    if (this.length == 0)
        return null;
    else {
        var re = this.tail.data;
        if (this.length == 1) {
            this.tail.pre = this.tail;
            this.tail.next = this.tail;
        } else {
            this.tail.pre.next = this.tail.next;
            this.tail.next.pre = this.tail.pre;
            this.ail = this.tail.pre;
        }
       this.length = this.length - 1;
        return this.tail.data;
    }
}





module.exports = LoopQueue;