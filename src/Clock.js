var Clock = function (length, fixcount) {
    this.fixcount = fixcount;
    this.length = length;
    this.curse = 0;
    this.clock = new Array(length).fill(0);
}
Clock.prototype.pop = function () {
    for (var i = 0; i < this.length*2; i++) {
        if (this.clock[this.curse] == 0 && this.fixcount[this.curse] == 0) {
            var avaFrame = this.curse;
            this.clock[this.curse] = 1;
            this.next();
            return avaFrame;
        }
        if (this.clock[this.curse] == 1)
            this.clock[this.curse] = 0;
       this.next();
    }

   this.next();//always go to the next frame

    return null;
}

Clock.prototype.next = function() {
    this.curse = (this.curse + 1) % this.length;
}




module.exports = Clock;