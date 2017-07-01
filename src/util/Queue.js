var Iterator = require('./Iterator');

var Queue = function () {
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

    var node = new Node(data, null, null);
    node.pre = this.head;
    node.next = this.head.next;
    this.head.next.pre = node;
    this.head.next = node;

    this.length++;

}

Queue.prototype.pop = function () {
    var node = this.peek();

    if (node == null) return null;
    node.pre.next = node.next;
    node.next.pre = node.pre;
    this.length--;
    return node.data;
}

Queue.prototype.remove = function (node) {
    remove(node);
}


function remove(node) {
    if (node.data != 'head') {
        node.pre.next = node.next;
        node.next.pre = node.pre;
    } else {
        throw new Error('cannot delete head!');
    }
}

Queue.prototype.iterator = function(){
    "use strict";
    return new Iterator(this.head);
};




module.exports = Queue;