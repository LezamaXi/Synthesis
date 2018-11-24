var NUM = "NUM";
var FALSE = "FALSE";
var VR = "VAR";
var PLUS = "PLUS";
var TIMES = "TIMES";
var LT = "LT";
var AND = "AND";
var NOT = "NOT";
var ITE = "ITE";

var ALLOPS = [NUM, FALSE, VR, PLUS, TIMES, LT, AND, NOT, ITE];
var bestProb = 0;
var	finalTable = null;
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
	return { type: PLUS, left: x, right: y, toString: function () { return "("+ this.left.toString() + "+" + this.right.toString()+")"; } };
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
	return { type: NOT, left: x, toString: function () { return "(!" + this.left.toString()+ ")"; } };
}
function ite(c, t, f) {
	return { type: ITE, cond: c, tcase: t, fcase: f, toString: function () { return "(if " + this.cond.toString() + " then " + this.tcase.toString() + " else " + this.fcase.toString() + ")"; } };
}

//Interpreter for the AST.
function interpret(exp, envt) {
	switch (exp.type) {
		case FALSE: return false;
		case NUM: return exp.val;
		case VR: return envt[exp.name];
		case PLUS: return interpret(exp.left, envt) + interpret(exp.right, envt);
		case TIMES: return interpret(exp.left, envt) * interpret(exp.right, envt);
		case LT: return interpret(exp.left, envt) < interpret(exp.right, envt);
		case AND: return interpret(exp.left, envt) && interpret(exp.right, envt);
		case NOT: return !interpret(exp.left, envt);
		case ITE: if (interpret(exp.cond, envt)) { return interpret(exp.tcase, envt); } else { return interpret(exp.fcase, envt); }
	}
}

function writeToConsole(text) {
	var csl = document.getElementById("console");
	if (typeof text == "string") {
		csl.value += text + "\n";
	} else {
		csl.value += text.toString() + "\n";
	}
}



function exprColumnProb(exp, prob) {
	var probs = [];
	probs.push(prob(exp.type, 0, null)); 
	probs.push(prob(exp.type, 0, PLUS));
	probs.push(prob(exp.type, 1, PLUS));
	probs.push(prob(exp.type, 0, TIMES));
	probs.push(prob(exp.type, 1, TIMES));
	probs.push(prob(exp.type, 0, LT));
	probs.push(prob(exp.type, 1, LT));
	probs.push(prob(exp.type, 0, AND));
	probs.push(prob(exp.type, 1, AND));
	probs.push(prob(exp.type, 0, NOT));
	probs.push(prob(exp.type, 0, ITE));
	probs.push(prob(exp.type, 1, ITE));
	probs.push(prob(exp.type, 2, ITE));
	return probs;
}


function exprProb(table, exp, pos) {
	if (exp.type == PLUS)
		return table["p" + (1 + pos).toString()];
	if (exp.type == TIMES)
		return table["p" + (3 + pos).toString()];
	if (exp.type == LT)
		return table["p" + (5 + pos).toString()];
	if (exp.type == AND)
		return table["p" + (7 + pos).toString()];
	if (exp.type == NOT)
		return table["p" + (9 + pos).toString()];
	if (exp.type == ITE)
		return table["p" + (10 + pos).toString()];
	return table["p" + (0).toString()];
}


function getNewTable(table, exp1, exp2, exp3, prob) {
	var actual_prob = exprProb(exp1, table, 0);
	if (exp2 != null) {
		actual_prob *= exprProb(exp2, table, 1);
	}
	if (exp3 != null) {
		actual_prob *= exprProb(exp3, table, 2);
	}
	var probs = exprColumnProb(table, prob);
	for (var i = 0; i < 13; i++) {
		probs[i] *= actual_prob;
	}
	return putProb(table, probs);
}


function isCorrect(results, listOuts){

var count = 0
	for (var j = 0; j < listOuts.length; j++) {
		if (interpret(results, listOuts[j]) == listOuts[j]._out) {
			count += 1;
		} else {
			break;
		} 
	}
	if (listOuts.length == count) {
		return true;
	}
	return false;
}

function putProb(exp, probs) {
	table = {exp: exp}
	for (var i = 0; i < probs.length; i++) {
		table["p" + i.toString()] = probs[i];
	}
	return table;
}

function aux(table, level, inputoutputs){

	for (var i = 0; i < 13; i++) {
		if (table["p" + i.toString()] > 0){
			level.push(table);
			if (isCorrect(table.exp, inputoutputs)) {
				if (bestProb < table.p0) {
					bestProb = table.p0;
					finalTable = table;
				}
			}
		}
	}
}

function grow(intOps, boolOps, vars, consts, tables, inputoutputs, prob) {
	var actual_prob = 1;
	var new_exp = null;
	var actual_level = [];
	var lvlTable = null;

	for(var i = 0; i < boolOps.length; i++){
		if (boolOps[i] == LT) {

			for( var j = 0; j < tables.length; j++){
				for( var k = 0; k < tables.length; k++){
					new_exp = lt(tables[j].exp, tables[k].exp);
					lvlTable = getNewTable(new_exp, tables[j], tables[k], null, prob);

					aux(lvlTable, actual_level,inputoutputs);
				}
			}

		} else if (boolOps[i] == AND) {

			for( var j = 0; j < tables.length; j++){
				for( var k = 0; k < tables.length; k++){
					new_exp = and(tables[j].exp, tables[k].exp);
					lvlTable = getNewTable(new_exp, tables[j], tables[k], null, prob);
					
					aux(lvlTable, actual_level,inputoutputs);


				}		
			}

		} else if (boolOps[i] == NOT) {

			for( var j = 0; j < tables.length; j++){
				new_exp = not(tables[j].exp);
				lvlTable = getNewTable(new_exp, tables[j], null, null, prob);
				aux(lvlTable, actual_level,inputoutputs);
				
			} 
		}
	}
	for (var l = 0; l < intOps.length; l++){
		var item = intOps[l];
		if (item == PLUS) {
			for (var j = 0; j < tables.length; j++){
				for (var k = 0; k < tables.length; k++){
					new_exp = plus(tables[j].exp, tables[k].exp);
					actual_table = getNewTable(new_exp, tables[j], tables[k], null, prob);
					aux(actual_table, actual_level,inputoutputs);
				}
			}
		} else if (item == TIMES) {
			for (var i = 0; i < tables.length; i++){
				for (j = 0; j < tables.length; j++){
					new_exp = and(tables[i].exp, tables[j].exp);
					actual_table = getNewTable(new_exp, tables[i], tables[j], null, prob);
					aux(actual_table, actual_level,inputoutputs);
				}
			}
		} else if (item == ITE) {
			for (var i = 0; i < tables.length; i++){
				for (var j = 0; j < tables.length; j++){
					for (var k = 0; k < tables.length; k++){
						new_exp = ite(tables[i].exp, tables[j].exp, tables[k].exp);
						actual_table = getNewTable(new_exp, tables[i], tables[j], tables[k], prob);
						aux(actual_table, actual_level,inputoutputs);
					}
				}
			}
		}
	}
	return actual_level;
}


function elimEquivalents(tables, inputs) {
	var result = {};
	var newTable = []
	var index;
	for (index = 0; index < tables.length; index++){
		var item = tables[index];
		var resultStr = "";
		var index2;
		for (index2 = 0; index2 < inputs.length; index2++){
			var input = inputs[index2];
			resultStr += interpret(item.exp, input).toString();
		}
		if (result[resultStr] === undefined) {
			result[resultStr] = index;
			console.log(index);
			newTable.push(item);
		}
	}
	return newTable;
}


function bottomUp(globalBnd, intOps, boolOps, vars, consts, inputoutputs, prob) {

	var multable = [];
	var lvlTable = null;

	for(var i = 0; i < vars.length; i++){
		lvlTable = putProb(vr(vars[i]), exprColumnProb(vr(vars[i]), prob));
		multable.push(lvlTable);
		if (isCorrect(lvlTable.exp, inputoutputs)) {
			if (bestProb < lvlTable.p0) {
				bestProb = lvlTable.p0;
				finalTable = lvlTable;
			}
		}
	}
	for(var i = 0; i < consts.length; i++){
		lvlTable = putProb(num(consts[i]), exprColumnProb(num(consts[i]), prob));

		multable.push(lvlTable);
		if (isCorrect(lvlTable.exp, inputoutputs)) {
			if (bestProb < lvlTable.p0) {
				bestProb = lvlTable.p0;
				finalTable = lvlTable;
			}
		}

	}

	lvlTable = putProb(flse(), exprColumnProb(flse(), prob));
	multable.push(lvlTable);
	if (isCorrect(lvlTable.exp, inputoutputs)) {
		if (bestProb < lvlTable.p0) {
			bestProb = lvlTable.p0;
			finalTable = lvlTable;
		}
	}
    // While true
    var k = 0;
    while(k < globalBnd){

    	var newLvl = [];
    	console.log("aqui" + vars);
    	console.log("aqui" +  multable[k]);
    	newLvl = grow(intOps, boolOps, vars, consts, multable, inputoutputs, prob);
    	multable = multable.concat(newLvl);
    	multable = elimEquivalents(multable, inputoutputs);
    	console.log("anterior" + multable[k]);
    	k++;
    }
    console.log(finalTable);
    return finalTable.exp;
}


function run2(){

	function prob(child, id, parent){
        //Example of a probability function. In this case, the function
        //has uniform distributions for most things except for cases that would
        //cause either type errors or excessive symmetries.
        //You want to make sure your solution works for arbitrary probability distributions.
        
        function unif(possibilities, kind){
        	if(possibilities.includes(kind)){
        		return 1.0/possibilities.length;
        	}
        	return 0;
        }
        
        switch(parent){
        	case PLUS: 
        	if(id == 0)
        		return unif([NUM, VR, PLUS, TIMES, ITE], child);
        	else
        		return unif([NUM, VR, TIMES, ITE], child);
        	break;
        	case TIMES: 
        	if(id == 0)
        		return unif([NUM, VR, PLUS, TIMES, ITE], child);
        	else
        		return unif([NUM, VR, ITE], child);
        	break;              
        	case LT: 
        	return unif([NUM, VR, PLUS, TIMES, ITE], child);
        	break;
        	case AND:
        	return unif([LT, AND, NOT, FALSE], child);
        	break;
        	case NOT:
        	return unif([LT, AND, FALSE], child);
        	break;
        	case ITE:
        	if(id == 0)
        		return unif([LT, AND, FALSE, NOT], child);                  
        	else
        		return unif([NUM, VR, PLUS, TIMES, ITE], child);
        	break;
        	case null:
        	return 0.11;
        }
    }
    
    
    var rv = bottomUp(3, [VR, NUM, PLUS, TIMES, ITE], 
    	[AND, NOT, LT, FALSE], ["x", "y"], [4, 5], 
    	[{x:5,y:10, _out:5},{x:8,y:3, _out:3}], 
    	prob
    	);
    writeToConsole("RESULT: " + rv.toString());
    
}