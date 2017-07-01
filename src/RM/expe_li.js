const EXPR = {};

var ExprType  = {
    EXPR_OP:0,
    EXPR_CONST :1,
    EXPR_ATTRREF :2
}
var OpType = {
    OP_BOL_AND :1,
    OP_BOOL_OR :2,
    OP_BOOL_NOT:3,
    OP_COMP_EQUAL:4,
    OP_COMP_SMALLER:5,
};
var datatype = {
  DT_INT : 0,
  DT_STRING :1,
  DT_FLOAT : 2,
  DT_BOOL : 3
}

var Expr = function(dt,value){
    this.dt = dt;
    switch(this.dt){
        case 0:{
           this.cons = value; 
           break;
        }
        case 1:{
            this.attrRef = value;
            break;
        }
        case 2:{
            this.optype = value;
            if(this.optype = 2){
                this.args1 = new Expr();
            }
            else{
                this.args1 = new Expr();
                this.args2 = new Expr();
            }
            break;
        }
    }
}


var Value = function(dt,value){
    this.dt = dt;
    switch(this.dt){
        case 0:{
           this.intV = value; 
           break;
        }
        case 1:{
            this.stringV = value;
            break;
        }
        case 2:{
            this.floatV = value;
            break;
        }
        case 3:{
            this.boolV = value;
            break;
        }
    }
   
}

//var v = new Value(datatype['DT_STRING'],'123');
//console.log('output:  '+v.stringV);
//console.log(datatype['DT_INT']);

//var ex = new Expr(2,2);
//ex.args1.dt = 0;
//var left = new Value(datatype['DT_STRING'],'1234');
//ex.args1.cons  = left;
//console.log(ex.args1.cons);


function strcmp(str1,str2){
    return ((str1 == str2) ? 0 : ((str1 > str2) ? 1 : -1));
}

function CPVAL(result,input){
    do{
        result.dt = input.dt;
        switch(input.dt){
            case 0:{
                result.intV = input.intV;
                break;
            }
            case 1:{
                //result.v.stringV = Buffer.alloc(input.v.stringV.length);
                result.stringV = input.stringV;
                break;
            }
            case 2:{
                result.floatV = input.floatV;
                break;
            }
            case 3:{
                result.boolV = input.boolV;
                break;
            }
        }

    }while(0)
}

//var input = new Value(datatype['DT_STRING'],'123');
//var result = new Value();
//CPVAL(result,input);
//console.log(result.stringV);


function MAKE_VALUE(result,datatype,value){
    do{
        //result = Buffer.alloc(Value.size);
        result.dt = datatype;
        switch(datatype){
            case 0:{
                result.intV = value;
                break;
            }
            case 1:{
                result.stringV = value;
                break;  
            }
            case 2:{
                result.floatV = value;
                break;
            }
            case 3:{
                result.boolV = value;
                break;
            }
        }
    }while(0)
}
//var result = new Value();
//MAKE_VALUE(result,datatype['DT_BOOL'],true);
//console.log(result.boolV);


function freeVal(val){
    switch(val.dt){
        case 0:{
           val.intV = null; 
           break;
        }
        case 1:{
            val.stringV = null;
            break;
        }
        case 2:{
            val.floatV = null;
            break;
        }
        case 3:{
            val.boolV = null;
            break;
        }
    }
    val.dt = null;
}
//freeVal(result);
//console.log(result.boolV);


EXPR.valueEquals = function(left, right, result){
    if(left.dt != right.dt) { // Define of left 'Value'
        throw Error('equality comparison only supported for values of the same datatype');
    }
    result.dt = 3; // define of DT_BOOL
    switch (left.dt){
        case 0:{
            result.boolV = (left.intV == right.intV);
            break;
        }
        case 1:{
            result.boolV = (strcmp(left.stringV,right.stringV)==0);
            break;
        }
        case 2:{
            result.boolV = (left.floatV == right.floatV);
            break;
        }
        case 3:{
             result.boolV = (left.boolV == right.boolV);
            break;
        }

    }

}
//var left = new Value(datatype['DT_STRING'],'12');
//var right = new Value(datatype['DT_STRING'],'123');
//var result = new Value();
//EXPR.valueEquals(left,right,result);
//console.log(result.boolV);


EXPR.valueSmaller = function(left, right, result){
    if(left.dt != right.dt) { // Define of left 'Value'
        throw Error('equality comparison only supported for values of the same datatype');
    }
    result.dt = 3; // define of DT_BOOL
    switch (left.dt){
        case 0:{
            result.boolV = (left.intV < right.intV);
            break;
        }
        case 1:{
            result.boolV = (strcmp(left.stringV,right.stringV)<0);
            result.boolV = (left.floatV < right.floatV);
            break;
        }
        case 2:{
            result.boolV = (left.floatV < right.floatV);
            break;
        }
        case 3:{
             result.boolV = (left.boolV < right.boolV);
            break;
        }

    }

}
//var left = new Value(datatype['DT_STRING'],'12');
//var right = new Value(datatype['DT_STRING'],'123');
//var result = new Value();
//EXPR.valueSmaller(left,right,result);
//console.log(result.boolV);

EXPR.boolNot = function(input, result){
    if (input.dt != 3){ 
        throw Error('boolean NOT requires boolean input');
    }
    result.dt = 3;
    result.boolV = !(input.boolV);
}
//var input = new Value(datatype['DT_BOOL'],false);
//var result = new Value();
//EXPR.boolNot(input,result);
//console.log(result.boolV);

EXPR.boolAnd = function(left,right,result){
    if(left.dt != 3 || right.dt != 3){
        throw Error('boolean AND requires boolean inputs');
    }
    result.dt = 3;
    result.boolV = (left.boolV && right.boolV);
    
}
//var left = new Value(datatype['DT_BOOL'],true);
//var right = new Value(datatype['DT_BOOL'],true);
//var result = new Value();
//EXPR.boolAnd(left,right,result);
//console.log(result.boolV);

EXPR.boolOr = function(left,right,result){
    if(left.dt != 3 || right.dt != 3){
        throw Error('boolean OR requires boolean inputs');
    }
    result.dt = 3;
    result.boolV = (left.boolV || right.boolV);   
}
//var left = new Value(datatype['DT_BOOL'],false);
//var right = new Value(datatype['DT_BOOL'],false);
//var result = new Value();
//EXPR.boolOr(left,right,result);
//console.log(result.boolV);


EXPR.evalExpr =function(record, schema, expr,result){
    var lIn = new Value();  
    var rIn = new Value(); 
    MAKE_VALUE(result,0,-1);
    //MAKE_VALUE(result,3,true);
    switch(expr.dt){
        case 2:{
            var twoArgs = (expr.optype != 2);
            try{
                EXPR.evalExpr(record,schema,expr.args1,lIn);
            }catch(error){
                throw error;
            }
            if(twoArgs){
                try{
                    EXPR.evalExpr(record,schema,expr.args2,rIn);
                }catch(error){
                    throw error;
            }
        }
            switch(expr.optype){
                case 0:{
                    try{
                        EXPR.boolAnd(lIn,rIn,result);
                     }catch(error){
                        throw error;
                    }
                    break;
                }
                case 1:{
                    try{
                        EXPR.boolOr(lIn,rIn,result);
                     }catch(error){
                        throw error;
                    }
                    break;
                }
                 case 2:{
                    try{
                        EXPR.boolNot(lIn,result);
                     }catch(error){
                        throw error;
                    }
                    break;
                }
                case 3:{
                    try{
                        EXPR.valueEquals(lIn,rIn,result);
                     }catch(error){
                        throw error;
                    }
                    break;
                }
                case 4:{
                    try{
                        EXPR.valueSmaller(lIn,rIn,result);
                     }catch(error){
                        throw error;
                    }
                    break;
                }
                default:{
                    break;
                }
            }
// clean up
            freeVal(lIn);
            if(twoArgs){
                freeVal(rIn);
            }
            break;
        
        }
     case 0:{
         CPVAL(result,expr.cons);
         break;
     }
     case 1:{
         result = null;
         try{
             getAttr(record,schema,expr.attrRef,result);
         }catch(error){
             throw error;
         }
         break;
     }
    }

}

//var ex = new Expr(2,2);
//ex.args1.dt = 0;
//var left = new Value(datatype['DT_BOOL'],false);
//ex.args1.cons = left;
//var result1 = new Value();
//EXPR.evalExpr(1,1,ex,result1);
//console.log(result1.boolV);

EXPR.freeExpr=function(expr){
    switch(expr.dt){
        case 2:{
            switch(expr.optype){
                case 2:{
                    EXPR.freeExpr(expr.args1);
                    break;
                }
                default:{
                    EXPR.freeExpr(expr.args1);
                    EXPR.freeExpr(expr.args2);
                    break;
                }
            }
            //expr.args1 = null;
            break;
        }
        case 0:{
            freeVal(expr.cons);//freeval
            break;

        }
        case 1:{
            break;
        }
    }
    expr=null;
}
//var left = new Value(datatype['DT_BOOL'],false);
//var ex = new Expr(0,left)
//EXPR.freeExpr(ex);
//console.log(ex.cons);


module.exports = EXPR;