function value(dt,v) {
    this.dt = dt;
    switch(dt)
    {
        case 0:
            this.intV = v;
            break;
        case 1:
            this.floatV = v;
            break;
        case 2:
            this.stringV = v;
            break;
        case 3:
            this.boolV = v;
            break;
    }
}
module.exports = value;