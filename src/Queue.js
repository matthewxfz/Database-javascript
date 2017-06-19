var Queue = function (max) {
    this.max = max;
    this.tail = new Node('Na', null, null);
    this.head = new Node('Na', null, null);

    this.tail.pre = this.head;
    this.head.next = this.tail;
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
        return this.ail.data;
    }
}

Queue.prototype.push = function (data) {
    if (this.length == 0) {
        this.tail.data = data;
    } else {
        if (this.length < this.max) {
            var node = new Node(data, null, null);
            node.next = this.head.next;
            node.pre = this.head;
            this.head.next.pre = node;
            this.head.next = node;
        } else {
            throw new Error('Loop Queue out of boundary!');
        }
    }
    this.length = this.length + 1;
}

Queue.prototype.pop = function () {
    if (this.length == 0)
        return null;
    else {
        var re = this.tail.data;
        if (this.length == 1) {
            this.tail.pre = this.head;
            this.head.next = this.tail;
        } else {
            this.tail =this.tail.pre;
            this.tail.next = 'NAA';
        }
        this.length = this.length - 1;
        return re;
    }
}





module.exports = Queue;