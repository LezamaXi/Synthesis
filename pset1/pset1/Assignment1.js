// JavaScript source code

function tree(n, x, y, z){
  return {value: n, first: x, second: y, third: z, toString: function () { return "(" + this.value.toString() + ")\n" + "!(" + this.first.toString() + ") , " + "(" + this.second.toString() + "), " + "(" + this.third.toString() + ")!"}}  
}

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
        csl.value += text + "\n";
    } else {
        csl.value += text.toString() + "\n";
    }
}

//drawer for the AST.
function draw(exp) {
    switch (exp.type) {
        case FALSE: return tree(false, "", "", "");
        case NUM: return tree(exp.val, "", "", "");
        case VR: return tree(exp.name, "", "", "");
        case PLUS: return tree("PLUS", draw(exp.left), draw(exp.right), "");
        case TIMES: return tree("TIMES", draw(exp.left),  draw(exp.right), "");
        case LT: return tree("LT",draw(exp.left), draw(exp.right), "");
        case AND: return tree("AND", draw(exp.left),  draw(exp.right), "");
        case NOT: return tree("NOT", draw(exp.left), "", "");
        case ITE:  return  tree("ITE", draw(exp.cond), draw(exp.tcase), draw(exp.fcase));
    }
}
/**
  *auxiliar function to grow the number of generated problems.
  *@param set of programs of our gramar.
  *@return set of the new generated programs grown by the gramar.
  */
function grow(intOps, boolOps, numberPrograms, booleanPrograms){
  var levelNum = [];
  var levelBool = [];

  for(var k = 0; k < numberPrograms.length; k++){
    console.log(numberPrograms[k]);  
  }
  for(var i = 0; i < boolOps.length; i++){
    for( var j = 0; j < numberPrograms.length; j++){
      //console.log(numberPrograms[j].toString());
      for( var k = 0; k < numberPrograms.length; k++){
        if(boolOps[i] == LT){
          levelBool.push(lt(numberPrograms[j], numberPrograms[k]));
        }
      }     
    }
    for( var j = 0; j < booleanPrograms.length; j++){
      for( var k = 0; k < booleanPrograms.length; k++){
        if(boolOps[i] == AND){
          levelBool.push(and(booleanPrograms[j], booleanPrograms[k]));
        }
      }
      if(boolOps[i] == NOT){
        levelBool.push(not(booleanPrograms[j]));
      }
    }
  }

  for(var i = 0; i < intOps.length; i++){
    if(intOps[i] == ITE){
      for( var j = 0; j < booleanPrograms.length; j++){
        for( var k = 0; k < numberPrograms.length; k++){       
          for( var l = 0; l < numberPrograms.length; l++){
            levelNum.push(ite(booleanPrograms[j], numberPrograms[k], numberPrograms[l]));
          } 
        }
      }
    }   

    for( var k = 0; k < numberPrograms.length; k++){       
      for( var l = 0; l < numberPrograms.length; l++){
        
        if(intOps[i] == PLUS){
          levelNum.push(plus(numberPrograms[k], numberPrograms[l]));
        } else if(intOps[i] == TIMES){
          levelNum.push(times(numberPrograms[k], numberPrograms[l]));
        }

      }
    }
  } 
  
   
  return {"nums":levelNum, "bools": levelBool};
}


function elimEquivalents(programList, inputs){
  var results = {};
  
  for(var i = 0; i < programList.length; i++){ 
    results[programList[i]] = [];
  } 
  for(var i = 0; i < inputs.length; i++){ 
    //making the new enviroment for the i-th insatance
    var envt = {};
    for(var key in inputs[i]) {
      if(key != "_out"){
        envt[key] = inputs[i][key];
      }  
    }
    
    //obtaining the result of the programs with each input
    for(var j = 0; j < programList.length; j++){
      var auxList = [];
      if(programList[j] === undefined){
        programList[j] = num(j);
        results[programList[j]] = [];
      }
      var result = interpret(programList[j], envt);
      var prog = programList[j];
      auxList = results[prog];
      auxList.push(result);
      results[programList[j]] = auxList;
    }
  }
  
  var matches = {};
  for(var key in results) {
    matches[results[key]] = key;
  } 
  
  return matches;

}


function isCorrect(results, listOuts){
    if(results.length != listOuts.length)
      return false;
    for(var i = 0; i < results.length; i++){
      if(results[i] != listOuts[i])
        return true;
    }
    return true;
}

//our implmentation
function bottomUp(globalBnd, intOps, boolOps, vars, consts, inputoutputs) {
  
  var constList = [];
  var boolsList = [flse()];
  for(var i = 0; i < consts.length; i++){
    var nums = num(consts[i]);
    constList.push(nums);
  }
  for(var j = 0; j < vars.length; j++){
    if(typeof inputoutputs[0][vars[j]] == "number"){
      constList.push(vr(vars[j]));
    } else{
      boolsList.push(vr(vars[j]));  
    }
  }

  //for(var i = 0; i < boolsList.length; i++){
    //console.log(boolsList[i]);  
  //}
  var solution = flse();
  var outs = [];
  for(var j = 0; j < inputoutputs.length; j++){
    for(var key in inputoutputs[j]){
      if(key != "_out")
        outs.push(inputoutputs[j][key]);
    }
  }
  var i = 0;
  while(i < globalBnd){
    var newLvl = [];


    newLvl = grow(intOps, boolOps, constList, boolsList);

    //console.log(typeof newLvl); 
    console.log("---------------"); 
    console.log(i); 
    for(var k = 0; k < newLvl.nums.length; k++){
      constList.push(newLvl.nums[k]);
    }
    for(var k = 0; k < newLvl.bools.length; k++){
      boolsList.push(newLvl.bools[k]);
    }
    //constList = constList.concat(newLvl);
    //boolsList = boolsList.concat(plist.bools);
    //diccionarios [lista de resultados, programa]
    var auxConstList = elimEquivalents(constList, inputoutputs);
    var auxBoolsList = elimEquivalents(boolsList, inputoutputs);
    
    //getting just the programs
    constList = [];
    boolslist = [];
    for(var key in auxConstList){
      constList.push(auxConstList[key]);
    }  
    for(var key in auxBoolsList){
      constList.push(auxBoolsList[key]);
    }  
    
    //getting all the outputs
    
    if (typeof inputoutputs[0]._out == "number") {
      for(var key in auxConstList){
        if(isCorrect(key, outs)){
          solution = auxConstList[key];
        }  
      }        
    } else {
      for(var key in auxBoolsList){
        if(isCorrect(key, outs)){
          solution = auxBoolsList[key];
        }  
      }        
    }
    i++;
  }
  
  var arbolin = draw(solution);
  console.log(arbolin)
  console.log(solution)
  return solution;
}


/**
  *auxiliar function to grow the number of generated problems.
  *@param set of programs of our gramar.
  *@return set of the new generated programs grown by the gramar.
  */
function growFaster(intOps, boolOps, numberPrograms, booleanPrograms, inputoutputs){

  var levelNum = [];
  var levelBool = [];
  for(var i = 0; i < inputoutputs.length; i++){ 
    //making the new enviroment for the i-th insatanc
    var envt = {};
    for(var key in inputoutputs[i]) {
      if(key != "_out"){
        envt[key] = inputoutputs[i][key];
      }  
    }


    for(var i = 0; i < boolOps.length; i++){  
      for( var j = 0; j < numberPrograms.length; j++){
        for( var k = 0; k < numberPrograms.length; k++){
          var var1 = interpret(numberPrograms[j], envt);
          var var2 = interpret(numberPrograms[k], envt);
          if(boolOps[i] == LT){
            levelBool.push(lt(numberPrograms[j], numberPrograms[k]));
          }
        }     
      }
      for( var j = 0; j < booleanPrograms.length; j++){
        for( var k = 0; k < booleanPrograms.length; k++){
          var var1 = interpret(booleanPrograms[j], envt);
          var var2 = interpret(booleanPrograms[k], envt);
          if(boolOps[i] == AND){
            if(var1 == false && var2 == false){
              levelBool.push(and(flse(), flse()));
            }else if(var1 != false && var2 == false){
              levelBool.push(and(not(flse()), flse()));
            }else if(var1 == false && var2 != false){
              levelBool.push(and(flse(),not(flse())));
            }else if(var1 != false && var2 != false){
              levelBool.push(and(not(flse()), not(flse())));
            }
          }
        }
        if(boolOps[i] == NOT){
          if(var1 != false){
            levelBool.push(not(flse()));
          }else{   
            levelBool.push(flse());
          }
        }
      }
    }

    for(var i = 0; i < intOps.length; i++){
      if(intOps[i] == ITE){
        for( var j = 0; j < booleanPrograms.length; j++){
          for( var k = 0; k < numberPrograms.length; k++){       
            for( var l = 0; l < numberPrograms.length; l++){
              var var1 = interpret(booleanPrograms[j], envt);
              if(var1 == false){
                levelNum.push(ite(flse(), numberPrograms[k], numberPrograms[j]));
              } else{
                levelNum.push(ite(not(flse()), numberPrograms[k], numberPrograms[j]));
              }
            }
          }
        }
      }   

      for( var k = 0; k < numberPrograms.length; k++){       
        for( var l = 0; l < numberPrograms.length; l++){
          if(intOps[i] == PLUS){
            levelNum.push(plus(numberPrograms[k], numberPrograms[l]));
          } else if(intOps[i] == TIMES){
            levelNum.push(times(numberPrograms[k], numberPrograms[l]));
          }

        }
      }
    } 
  
  } 
  return {"nums":levelNum, "bools": levelBool};
}


function bottomUpFaster(globalBnd, intOps, boolOps, vars, consts, inputoutputs){

  var constList = [];
  var boolsList = [flse()];
  for(var i = 0; i < consts.length; i++){
    var nums = num(consts[i]);
    constList.push(nums);
  }
  for(var j = 0; j < vars.length; j++){
    if(typeof inputoutputs[0][vars[j]] == "number"){
      constList.push(vr(vars[j]));
    } else{
      boolsList.push(vr(vars[j]));  
    }
  }

 var solution = flse();
  var outs = [];
  for(var j = 0; j < inputoutputs.length; j++){
    for(var key in inputoutputs[j]){
      if(key != "_out")
        outs.push(inputoutputs[j][key]);
    }
  }
  var i = 0;
  while(i < 2){
    var newLvl = [];

   
   

 
    newLvl = growFaster(intOps, boolOps, constList, boolsList, inputoutputs);
 
    for(var k = 0; k < newLvl.length; k++){
      console.log(newLvl[k].nums);  
    }


    for(var k = 0; k < newLvl.length; k++){
      console.log(newLvl[k].toString());  
    }


    for(var k = 0; k < newLvl.nums.length; k++){
      constList.push(newLvl.nums[k]);
    }
    for(var k = 0; k < newLvl.bools.length; k++){
      boolsList.push(newLvl.bools[k]);
    }
    var auxConstList = elimEquivalents(constList, inputoutputs);
    var auxBoolsList = elimEquivalents(boolsList, inputoutputs);
    
    constList = [];
    boolslist = [];
    for(var key in auxConstList){
      constList.push(auxConstList[key]);
    }  
    for(var key in auxBoolsList){
      constList.push(auxBoolsList[key]);
    }  
    
    //getting all the outputs
    
    if (typeof inputoutputs[0]._out == "number") {
      for(var key in auxConstList){
        if(isCorrect(key, outs)){
          solution = auxConstList[key];
        }  
      }        
    } else {
      for(var key in auxBoolsList){
        if(isCorrect(key, outs)){
          solution = auxBoolsList[key];
        //return deletedEqv[key]; 
        }  
      }        
    }
    i++;
  }
  

  return solution
}


function run1a1(){
	
	var rv = bottomUp(3, [VR, NUM, PLUS, TIMES, ITE], [AND, NOT, LT, FALSE], ["x", "y"], [4, 5], [{x:5,y:10, _out:5},{x:8,y:3, _out:3}]);
	writeToConsole("RESULT: " + rv.toString());
	
}


function run1a2(){
	
	var rv = bottomUp(3, [VR, NUM, PLUS, TIMES, ITE], [AND, NOT, LT, FALSE], ["x", "y"], [-1, 5], [
		{x:10, y:7, _out:17},
		{x:4, y:7, _out:-7},
		{x:10, y:3, _out:13},
		{x:1, y:-7, _out:-6},
		{x:1, y:8, _out:-8}		
		]);
	writeToConsole("RESULT: " + rv.toString());
	
}


function run1b(){
	
	var rv = bottomUpFaster(3, [VR, NUM, PLUS, TIMES, ITE], [AND, NOT, LT, FALSE], ["x", "y"], [-1, 5], [
		{x:10, y:7, _out:17},
		{x:4, y:7, _out:-7},
		{x:10, y:3, _out:13},
		{x:1, y:-7, _out:-6},
		{x:1, y:8, _out:-8}		
		]);
	writeToConsole("RESULT: " + rv.toString());
	
}


 function findMinMax(list){
  var max = 0;
  var min = 0;
  for(i = 0; i < list.length; i++){
    if(list[i] < min){
      min = list[i];
    }
  for(i = 0; i < list.length; i++){
    if(list[i] > min){
      max = list[i];
    }
  }

  return [min, max];
  }
}
//Useful functions for exercise 2. 
//Not so much starter code, though.

function structured(inputoutputs){
  var ins = [];
  var outs = [];
  for (var i = 0; i < inputoutputs.length; i++){
    ins.push(inputoutputs[i][0]);
    outs.push(inputoutputs[i][1]);
  }
  
  var t1 = 0;
  var t2 = 0;
  var t3 = 0;
  
  for(i = 0; i < ins.length; i++){
    if(t1 <= 0){
      t1 = outs[i] - ins[i]*2;
    }
    if(t2 <= 0){
      t2 = outs[i] - ins[i]*ins[i];
    }
    if(t3 <= 0){
      t3 = outs[i] - ins[i]*3;
    }
  }

  var te1 = plus(times(num(2),vr("x")),num(t1));
  var te2 = plus(times(vr("x"),vr("x")),num(t2));
  var te3 = plus(times(num(3),vr("x")),num(t3));
  
  //list for instances of 2*X + ??
  var listT1 = [];
  //list for instances of X*X + ??
  var listT2 = [];
  //list for instances of 3*X + ??
  var listT3 = [];
  //list for instances that no match with the other ones 
  var others = [];
  //matching with the list of terms
  for(i = 0; i < ins.length; i++){
    if((ins[i]*2 + t1) == outs[i]){
      var term1 = plus(times(num(2),num(ins[i])),num(t1));
      listT1.push(term1);
    }
    if((ins[i]*ins[i] + t2) == outs[i]){
      var term2 = plus(times(num(ins[i]),num(ins[i])),num(t2));
      listT2.push(term2);
    }
    if((ins[i]*3 + t3) == outs[i]){
      var term3 = plus(times(num(3),num(ins[i])),num(t3));
      listT3.push(term3);
    }
    else {
      var other = {};
      other["x"] = ins[i]; 
      other["_out"] = outs[i];
      others.push(other);
    }
  }

  //find the bounds
  var bnd1 = findMinMax(listT1);
  var bnd2 = findMinMax(listT2);
  var bnd3 = findMinMax(listT3);
  var bnd4 = findMinMax(others);
  var list1 = [bnd1[0], bnd2[0], bnd3[0], bnd4[0]]
  var list2 = [bnd1[1], bnd2[1], bnd3[1], bnd4[1]]
  list1.sort();
  list2.sort();
  
  var if1 = randInt(list2[0], list1[1]);
  var if2 = randInt(list2[1], list1[2]);
  var if3 = randInt(list2[2], list1[3]);
  var elseExp = bottomUpFaster(3,[VR, NUM, PLUS, TIMES, ITE], [AND, NOT, LT, FALSE], ["x"], [1,2,3,4,5,6,7,8,9], others);
  var finalExp = ite(lt(VR("x"), NUM(if1)), te1, ite(lt(VR("x"), NUM(if2)), te2, ite(lt(VR("x"), NUM(if3)), te3, elseExp)));

  return finalExp;

  
}


function run2() {
    var inpt = JSON.parse(document.getElementById("input2").value);
    //This is the data from which you will synthesize.
    writeToConsole(structured(inpt).toString());    
}


function genData() {
    //If you write a block of code in program1 that writes its output to a variable out,
    //and reads from variable x, this function will feed random inputs to that block of code
    //and write the input/output pairs to input2.
    program = document.getElementById("program1").value
    function gd(x) {
        var out;
        eval(program);
        return out;
    }
    textToIn = document.getElementById("input2");
    textToIn.value = "[";
    for(i=0; i<10; ++i){
        if(i!=0){ textToIn.value += ", "; }
        var inpt = randInt(0, 100);
        textToIn.value += "[" + inpt + ", " + gd(inpt) + "]";
    }
    textToIn.value += "]";
}
