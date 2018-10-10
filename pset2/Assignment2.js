// JavaScript source code



////////////////
// Problem 2
///////////////

var NUM = "NUM";
var FALSE = "FALSE";
var VR = "VAR";
var PLUS = "PLUS";
var TIMES = "TIMES";
var LT = "LT";
var AND = "AND";
var NOT = "NOT";

var SEQ = "SEQ";
var IFTE = "IFSTMT";
var WHLE = "WHILESTMT";
var ASSGN = "ASSGN";
var SKIP = "SKIP";
var ASSUME = "ASSUME";
var ASSERT = "ASSERT";

function str(obj) { return JSON.stringify(obj); }

//Constructor definitions for the different AST nodes.

function flse() {
    return { type: FALSE, toString: function () { return "false"; } };
}

function vr(name) {
    return { type: VR, name: name, toString: function () { return this.name; } };
}
function num(n) {
    return { type: NUM, val: n, toString: function () { return this.val; } };
}
function plus(x, y) {
    return { type: PLUS, left: x, right: y, toString: function () { return "(" + this.left.toString() + "+" + this.right.toString() + ")"; } };
}
function times(x, y) {
    return { type: TIMES, left: x, right: y, toString: function () { return "(" + this.left.toString() + "*" + this.right.toString() + ")"; } };
}
function lt(x, y) {
    return { type: LT, left: x, right: y, toString: function () { return "(" + this.left.toString() + "<" + this.right.toString() + ")"; } };
}
function and(x, y) {
    return { type: AND, left: x, right: y, toString: function () { return "(" + this.left.toString() + "&&" + this.right.toString() + ")"; } };
}

function not(x) {
    return { type: NOT, left: x, toString: function () { return "(!" + this.left.toString() + ")"; } };
}


function seq(s1, s2) {
    return { type: SEQ, fst: s1, snd: s2, toString: function () { return "" + this.fst.toString() + ";\n" + this.snd.toString(); } };
}


function assume(e) {
    return { type: ASSUME, exp: e, toString: function () { return "assume " + this.exp.toString(); } };
}

function assert(e) {
    return { type: ASSERT, exp: e, toString: function () { return "assert " + this.exp.toString(); } };
}

function assgn(v, val) {
    return { type: ASSGN, vr: v, val: val, toString: function () { return "" + this.vr + ":=" + this.val.toString(); } };
}

function ifte(c, t, f) {
    return { type: IFTE, cond: c, tcase: t, fcase: f, toString: function () { return "if(" + this.cond.toString() + "){\n" + this.tcase.toString() + '\n}else{\n' + this.fcase.toString() + '\n}'; } };
}

function whle(c, b) {
    return { type: WHLE, cond: c, body: b, toString: function () { return "while(" + this.cond.toString() + "){\n" + this.body.toString() + '\n}'; } };
}

function skip() {
    return { type: SKIP, toString: function () { return "/*skip*/"; } };
}

//some useful helpers:

function eq(x, y) {
    return and(not(lt(x, y)), not(lt(y, x)));
}

function tru() {
    return not(flse());
}

function block(slist) {
    if (slist.length == 0) {
        return skip();
    }
    if (slist.length == 1) {
        return slist[0];
    } else {
        return seq(slist[0], block(slist.slice(1)));
    }
}


function sustitucion(prog, sust){
    //buscar dentro del programa, la variable y sustituir cada aparicion de la variable 
    // por el valor de sust
    switch (prog.type) {
        case FALSE: return prog;
        case NUM: return prog;
        case VR: return prog.name == sust.vr ? sust.val : prog;
        case PLUS: return plus(sustitucion(prog.left,sust),sustitucion(prog.right, sust));
        case TIMES: return times(sustitucion(prog.left,sust),sustitucion(prog.right, sust));
        case LT: return lt(sustitucion(prog.left,sust),sustitucion(prog.right, sust));
        case AND: return and(sustitucion(prog.left,sust),sustitucion(prog.right, sust));
        case NOT: return not(sustitucion(prog.left,sust));

        case IFTE: return ifte(sustitucion(prog.cond,sust),sustitucion(prog.tcase,sust),sustitucion(prog.fcase,sust));
        case SEQ: return seq(sustitucion(prog.fst,sust), sustitucion(prog.snd,sust));
        case WHLE: return whle(sustitucion(prog.cond,sust), sustitucion(prog.body,sust));
        case ASSGN: return assgn(prog.vr, sustitucion(prog.val,sust));
        case SKIP: return skip();
        case ASSUME: return assume(sustitucion(prog.exp,sust));
        case ASSERT: return assert(sustitucion(prog.exp,sust));
    }    
}

function list_sust(q_list, sust){
    var aux = [];
    q_list.forEach(function(element) {
        aux.push(sustitucion(element, sust));
    });
    return aux;

}




var invars = [];
var conds = [];
var next_cmd = [];
function compute_inv(prog, v_total) {
   switch (prog.type) {
        case FALSE: return [];
        case NUM: return [];
        case VR: return [];
        case PLUS: v_total.push(compute_inv(prog.left,v_total));
                    return v_total.push(compute_inv(prog.right,v_total));
        case TIMES: v_total.push(compute_inv(prog.left,v_total));
                    return v_total.push(compute_inv(prog.right,v_total));
        case LT: v_total.push(compute_inv(prog.left,v_total));
                    return v_total.push(compute_inv(prog.right,v_total));
        case AND:  v_total.push(compute_inv(prog.left,v_total));
                    return v_total.push(compute_inv(prog.right,v_total));
        case NOT: return v_total.push(compute_inv(prog.left,v_total));
                    

        case IFTE: v_total.push(compute_inv(prog.cond,v_total)); 
                  v_total.push(compute_inv(prog.tcase,v_total));
                return v_total.push(compute_inv(prog.fcase,v_total));
        case SEQ: if(prog.fst.type == WHLE){
                        next_cmd.push(prog.snd)
                    }
                v_total.push(compute_inv(prog.fst,v_total)); 
                return v_total.push(compute_inv(prog.snd,v_total));


        case WHLE: aux = compute_inv(prog.body, []);
                   invars.push(v_total.push(aux));
                   conds.push(compute_inv(prog.cond, []));
                   return v_total;

        case ASSGN: return v_total.includes(prog) ? v_total : v_total.push(prog);
        case SKIP: return []; 
        case ASSUME: return v_total.push(compute_inv(prog.exp,v_total)); 
        case ASSERT: return v_total.push(compute_inv(prog.exp,v_total));
    }

}


//The stuff you have to implement.
/*
var SEQ = "SEQ";
var IFTE = "IFSTMT";
var WHLE = "WHILESTMT";
var ASSGN = "ASSGN";
var SKIP = "SKIP";
var ASSUME = "ASSUME";
var ASSERT = "ASSERT";
*/
function computeVC(prog){
    //Compute the verification condition for the program leaving some kind of place holder for loop invariants.
    // The input prog is an AST. The output is an AST representing the verification condition.
    var p = computeVC_aux(prog, []); 
    return p;
}

function computeVC_aux(prog, q_list) {
   switch (prog.type) {
        case FALSE: return prog;
        case NUM: return prog;
        case VR: return prog;
        case PLUS: return q_list.push(plus(computeVC_aux(prog.left,q_list),computeVC_aux(prog.right,q_list)));
        case TIMES: return q_list.push(times(computeVC_aux(prog.left,q_list),computeVC_aux(prog.right,q_list)));
        case LT: return q_list.push(lt(computeVC_aux(prog.left,q_list),computeVC_aux(prog.right,q_list)));
        case AND: return q_list.push(and(computeVC_aux(prog.left,q_list),computeVC_aux(prog.right,q_list)));
        case NOT: return q_list.push(not(computeVC_aux(prog.left,q_list)));

        case IFTE: return q_list.push(not(and(not(and(prog.cond, computeVC_aux(prog.tcase, q_list))), not(and(not(prog.cond,), computeVC_aux(prog.fcase,q_list))))));
        case SEQ: aux = computeVC_aux(prog.fst, computeVC_aux(prog.snd, q_list));
                    q_list = q_list.concat(aux);
                return q_list;
        //we compute the invariant in another part of the code
        case WHLE: q_list.push(prog);

        case ASSGN: return list_sust(q_list, prog);
        case SKIP: return q_list;
        case ASSUME: return q_list.map(function(x){
                                        return and(x, computeVC_aux(prog.exp, q_list));
                                        });
        case ASSERT: return q_list.map(function(x){
                                        return not(and(not(x),computeVC_aux(prog.exp, q_list)));
                                        });
    }

}

function make_invs(lista, index){
     
    var stri = "bit inv_" + index.toString() + "("; 
    lista.forEach(function(element) {
        if(!element.isArray()){
            stri += "int " + element.vr.toString() + ", ";  
                    
        }
    });

    stri = stri.substr(0, stri.length-2);
    stri = stri + "){\n";
    stri = stri + "return exprBool({";
    lista.forEach(function(element) {
        if(!element.isArray()){
            element.forEach(function(elemen){
                stri = stri + element.vr.toString() + ", ";  
            });        
        }
    });    
    stri = stri.substr(0, stri.length-2);
    stri = stri + "}, {PLUS});\n}\n";

    return stri;
}


function make_param(lista){
    var stri = "";
    lista.forEach(function(element) {
        if(element.isArray()){
            element.forEach(function(elemen){
                stri = stri + "int " + elemen.vr.toString() + "p, ";  
            });
        }
        stri = stri + "int " + element.vr.toString() + ", ";
    });    
    stri = stri.substr(0, stri.length-2);
    stri = stri + "){\n";
    return stri;
}


function make_ifs(lista, index){
    var stri = "if("; 
    lista.forEach(function(element) {
        if(!element.isArray()){
            stri = stri + element.vr.toString() + " == " + element.val.toString() + " && ";
        }
    });    
    stri = stri.substr(0, stri.length-4);
    stri = stri + "){\n";
    stri = stri + "assert inv_" + index.toString() + "("
    lista.forEach(function(element) {
        if(!element.isArray()){
            stri = stri + element.vr.toString() + ",";
        }
    });
    stri = stri.substr(0, stri.length-1);
    stri = stri + ");\n";
    stri = stri + "if(inv_" + index.toString() + "(";

    
    bandera = 0;
    lista.forEach(function(element) {
        if(!element.isArray()){
            lista[lista.length-1].forEach(function(elemen){
                if (element.vr.toString() == elemen.vr.toString()){ 
                    bandera = 1;
                    stri = stri + element.vr.toString() + "p,";
                }
            });

            if(bandera == 1){
                stri = stri + element.vr.toString() +",";
            }
            bandera = 0;            
        }
    });

    stri = stri.substr(0, stri.length-1);
    stri = stri + ") &&" + conds.toString() + "){\n";

    stri = stri + "assert inv_" + index.toString() + "(";
    bandera = 0;
    lista.forEach(function(element) {
        if(!element.isArray()){
            lista[lista.length-1].forEach(function(elemen){
                if (element.vr.toString() == elemen.vr.toString()){ 
                    bandera = 1;
                    stri = stri + element.val.toString() + ",";
                }
            });

            if(bandera == 1){
                stri = stri + element.vr.toString() + ",";
            }
            bandera = 0;            
        }
    });

    stri = stri.substr(0, stri.length-1);
    stri = stri + ");\n";
    stri = stri + "}\n";

    stri = stri + "if(inv_" + index.toString() + "(";
    bandera = 0;
    lista.forEach(function(element) {
        if(!element.isArray()){
            lista[lista.length-1].forEach(function(elemen){
                if (element.vr.toString() == elemen.vr.toString()){ 
                    bandera = 1;
                    stri = stri + element.vr.toString() + "p,";
                }
            });

            if(bandera == 1){
                stri = stri + element.vr.toString() + ",";
            }
            bandera = 0;            
        }
    });

    stri = stri.substr(0, stri.length-1);
    stri = stri + ") && !" + conds.toString() + "){\n";
    stri = stri + "assert";
    if((next_cmd.length-1) >= index){
        next_cmd[index].forEach(function(element) {
            stri = stri + element.toString() + ";\n";
        });
        stri = stri + "}}}\n";
        
    }
    else {
       stri = stri + "true;\n"; 

    }


    return stri;
}

function auxwhile_inv(prog){
    var i = 1;
    switch (prog.type) {
        case WHLE: var str = "harness void while_" + i.toString() + "(" + make_param(invars);
                    str = str + make_ifs(invars, i);
                    str = str + make_invs(invars, i);
                    i++;
                    writeToConsole("bandera");
                    writeToConsole(str);
                 

        default:writeToConsole("bandera");
                writeToConsole(prog.toString());
                writeToConsole("\/*------------*\/");
                auxwhile_inv(prog.left);
    } 
}

function genSketch(vc) {
    //Write a pretty printer that generates a sketch from the verification condition.
    //You can write your generators as a separate library, but you may do better by creating generators specialized for your problem.
	//The input is the VC that was generated by computeVC. The output is a String 
	//representing the sketch that you can feed to the sketch solver to synthesize the invariants.
    vc.forEach(function(element) {
            auxwhile_inv(element);
    });
}



function P2a() {
    var prog = eval(document.getElementById("p2input").value);
    clearConsole();
    writeToConsole("Just pretty printing for now");
    writeToConsole(prog.toString());
    writeToConsole("---------------------");
    writeToConsole(genSketch(computeVC(prog)));

}


function P2b() {
    var prog = eval(document.getElementById("p2input").value);
    clearConsole();
    writeToConsole("Just pretty printing for now");
    writeToConsole(prog.toString());
}


//Some functions you may find useful:
function randInt(lb, ub) {
    var rf = Math.random();
    rf = rf * (ub - lb) + lb;
    return Math.floor(rf);
}

function randElem(from) {
    return from[randInt(0, from.length)];
}

function writeToConsole(text) {
    var csl = document.getElementById("console");
    if (typeof text == "string") {
        csl.textContent += text + "\n";
    } else {
        csl.textContent += text.toString() + "\n";
    }
}

function clearConsole() {
    var csl = document.getElementById("console");
    csl.textContent = "";
}
