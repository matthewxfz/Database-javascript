/**
 * Created by matthewxfz on 6/30/17.
 */
var Iterator = require('./Iterator');

var Stack = function () {
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

Stack.prototype.peek = function () {
    if (this.length == 0) return null;
    else {
        return this.head.next.data;
    }
}

Stack.prototype.push = function (data) {

    var node = new Node(data, null, null);
    node.pre = this.head;
    node.next = this.head.next;
    this.head.next.pre = node;
    this.head.next = node;

    this.length++;

}

Stack.prototype.pop = function () {
    var node = this.peek();

    if (node == null) return null;
    node.pre.next = node.next;
    node.next.pre = node.pre;
    this.length--;
    return node.data;
}

Stack.prototype.remove = function (node) {
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

Stack.prototype.iterator = function(){
    "use strict";
    return new Iterator(this.head);
};




module.exports = Stack;