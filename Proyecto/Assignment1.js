var NUM = "NUM";
var PLUS = "PLUS";
var MOD = "MOD";


var ALLOPS = [NUM, VR, PLUS, MOD];

function str(obj) { return JSON.stringify(obj); }

//Constructor definitions for the different AST nodes.


function vr(name) {
    return { type: VR, name: name, toString: function () { return this.name; } };
}
function num(n) {
    return { type: NUM, val: n, toString: function () { return this.val; } };
}
function plus(x, y) {
    return { type: PLUS, left: x, right: y, toString: function () { return "("+ this.left.toString() + "+" + this.right.toString()+")"; } };
}
function mod(x, y) {
    return { type: MOD, left: x, right: y, toString: function () { return "(" + this.left.toString() + "*" + this.right.toString() + ")"; } };
}

//Interpreter for the AST.
function interpret(exp, envt) {
    switch (exp.type) {
        case NUM: return exp.val;
        case VR: return envt[exp.name];
        case PLUS: return interpret(exp.left, envt) + interpret(exp.right, envt);
        case MOD: return interpret(exp.left, envt) * interpret(exp.right, envt);
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





function isCorrect(results, listOuts){
    if(results.length != listOuts.length)
      return false;
    for(var i = 0; i < results.length; i++){
      if(results[i] != listOuts[i])
        return true;
    }
    return true;
}

function elimEquivalents(progList, inputs){
  var results = {};
  
  for(var i = 0; i < progList.length; i++){ 
    results[progList[i]] = [];
  } 
  for(var i = 0; i < inputs.length; i++){ 
    var envt = {};
    for(var key in inputs[i]) {
      if(key != "_out"){
        envt[key] = inputs[i][key];
      }  
    }
    
    for(var j = 0; j < progList.length; j++){
      var auxList = [];
      if(progList[j] === undefined){
        progList[j] = num(j);
        results[progList[j]] = [];
      }
      var result = interpret(progList[j], envt);
      var prog = progList[j];
      auxList = results[prog];
      auxList.push(result);
      results[progList[j]] = auxList;
    }
  }
  
  var matches = {};
  for(var key in results) {
    matches[results[key]] = key;
  } 
  
  return matches;

}

function grow(numOps, progNum, progBool){
  var levelNum = [];



  for(var i = 0; i < numOps.length; i++){   
    for( var k = 0; k < progNum.length; k++){       
      for( var l = 0; l < progNum.length; l++){
        if(numOps[i] == PLUS){
          levelNum.push(plus(progNum[k], progNum[l]));
        } 
      }
    }
    for( var k = 0; k < progNum.length; k++){       
      for( var l = 0; l < progNum.length; l++){
        if(numOps[i] == MOD){
          levelNum.push(mod(progNum[k], progNum[l]));
        }
      }
    }
} 
  
   
  return {"nums":levelNum};
}


function bottomUp(globalBnd, numOps, consts, inputoutputs) {
  
  var constList = [];
  for(var i = 0; i < consts.length; i++){
    var nums = num(consts[i]);
    constList.push(nums);
  }

  var solution;
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


    newLvl = grow(numOps, constList);

    for(var k = 0; k < newLvl.nums.length; k++){
      constList.push(newLvl.nums[k]);
    }
    var auxConstList = elimEquivalents(constList, inputoutputs);
    
    constList = [];
    for(var key in auxConstList){
      constList.push(auxConstList[key]);
    }  
    
    if (typeof inputoutputs[0]._out == "number") {
      for(var key in auxConstList){
        if(isCorrect(key, outs)){
          solution = auxConstList[key];
        }  
      }        
    } 
    i++;
  }

  return solution;
}






function run1a1(){
	
	var rv = bottomUp(3, [PLUS, MOD], ["h","o"], [{x:7,y:14, _out:(10,17)}]);
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
// Es contante ya que el numero de if, son un numero constante, no importa cuanto crezca, el final es un numero constante de comparaciones 

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

  var te1 = plus(mod(num(2),vr("x")),num(t1));
  var te2 = plus(mod(vr("x"),vr("x")),num(t2));
  var te3 = plus(mod(num(3),vr("x")),num(t3));
  
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
      var term1 = plus(mod(num(2),num(ins[i])),num(t1));
      listT1.push(term1);
    }
    if((ins[i]*ins[i] + t2) == outs[i]){
      var term2 = plus(mod(num(ins[i]),num(ins[i])),num(t2));
      listT2.push(term2);
    }
    if((ins[i]*3 + t3) == outs[i]){
      var term3 = plus(mod(num(3),num(ins[i])),num(t3));
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
  var elseExp = mod(num(2), vr("x"));
  var finalExp = ite(lt(VR("x"), NUM(if1)), te1, ite(lt(VR("x"), NUM(if2)), te2, ite(lt(VR("x"), NUM(if3)), te3, elseExp)));

  return finalExp;

  
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
