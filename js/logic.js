"use strict";

let isEditable = true;



function rect(x,y,size){
	let b = new Bldr("rect");
	b.att("x",x).att("y",y).att("width", size).att("height",size)
	    .att("fill","white").att("stroke","black")
	    .att("stroke-width",2);
    return b;
}

function tokenClick(event){
    let token = event.srcElement;
    let name = token.getAttribute("data_name")
	if (!isEditable) return;
	globalFirstBoard[name] = (globalFirstBoard[name] + 1)%3;
	console.log(name +": "+ tokenValue(globalFirstBoard[name]));
    evnts.fireEvent("refreshFirstBoard");
}

function simpleCirc(x,y,r){
	let b = new Bldr("circle");
	b.att("cx",x).att("cy",y).att("r", r)
	    .att("fill","white").att("stroke","white")
	    .att("stroke-width",0);
    return b;

}

function circ(x,y,r,color,name="none"){
	let b = new Bldr("circle");
	b.att("cx",x).att("cy",y).att("r", r)
	    .att("fill",color).att("stroke","black")
	    .att("stroke-width",1);
	b.att("data_name",name);
	b.att("onclick", "tokenClick(event)");
    return b;
}

function circ2(x,y,r,color,name="none"){
	let b = new Bldr("circle");
	b.att("cx",x).att("cy",y).att("r", r)
	    .att("fill",color).att("stroke","black")
	    .att("stroke-width",1);
    return b;
}


function fill(token){
	let fills = ['white','grey','black']
    return fills[token];
}

function tokenValue(token){
    let fills = ['unknown','none','some']
    return fills[token];	

}

class FirstBoard {

    constructor(size=290){
		this.size = size;
		
		this.xym = 0;
		this.xy_m = 0;
		this.x_ym = 0;
		this._xym = 0;
		this.x_y_m = 0;
		this._xy_m = 0;
		this._x_ym = 0;
		this._x_y_m = 0;	
	}
    
    nonTrivial(){

    	let result = 	
    	this.xym +
		this.xy_m + 		
		this.x_ym +
		this._xym +
		this.x_y_m +
		this._xy_m +
		this._x_ym +
		this._x_y_m;

		return result > 0;
    }

    clear(){
    	this.xym = 0;
		this.xy_m = 0;
		this.x_ym = 0;
		this._xym = 0;
		this.x_y_m = 0;
		this._xy_m = 0;
		this._x_ym = 0;
		this._x_y_m = 0;
    }

    equals(other){
    	return this.xym == other.xym &&
                this.xy_m == other.xy_m &&
                this.x_ym == other.x_ym &&
                this._xym == other._xym &&
                this.x_y_m == other.x_y_m &&
                this._xy_m == other._xy_m &&
                this._x_ym == other._x_ym &&
                this._x_y_m == other._x_y_m;
    }

	init(){
		let height = this.size/2;
		let width = this.size/2;
		let outerSize = this.size/2;
		let innerSize = this.size/4;
		this.svgBldr = new Bldr("svg");
		this.svgBldr.att("version", "1.1").att("xmlns", "http://www.w3.org/2000/svg").att("xmlns:xlink", "http://www.w3.org/1999/xlink");
		this.svgBldr.att("align", "center").att("width", this.size).att("height", this.size);
		//1
		this.svgBldr.elem(rect(0,0,outerSize));
		//2
		this.svgBldr.elem(rect(width,0,outerSize));
		//3
		this.svgBldr.elem(rect(0,height,outerSize));
		//4
		this.svgBldr.elem(rect(width,height,outerSize));
		
		//1
		this.svgBldr.elem(rect(width/2,height/2,innerSize));
		//2
		this.svgBldr.elem(rect(width,height/2,innerSize));
		//3
		this.svgBldr.elem(rect(width/2,height,innerSize));
		//4
		this.svgBldr.elem(rect(width,height,innerSize));

        //labels, these are at hoc
        this.svgBldr.elem(simpleCirc(width,height/3-10,15));
        
        this.svgBldr.elem(new Bldr("text").text("x").att("x",width).att("y",height/3)
            .att("font-size",30).att("text-anchor","middle").att("font-style","italic")
            .att("font-family","times, serif"));

        
        this.svgBldr.elem(simpleCirc(width/3-10,height,15));
        
        this.svgBldr.elem(new Bldr("text").text("y").att("x",width/3-10).att("y",height+5)
            .att("font-size",30).att("text-anchor","middle").att("font-style","italic")
            .att("font-family","times, serif"));

        this.svgBldr.elem(simpleCirc(width,height,15));
        
        this.svgBldr.elem(new Bldr("text").text("m").att("x",width).att("y",height+5)
            .att("font-size",30).att("text-anchor","middle").att("font-style","italic")
            .att("font-family","times, serif"));

		return this; 
	}
      
    setTokens(){
    	let height = this.size/2;
		let width = this.size/2;
		let outerSize = this.size/2;
		let innerSize = this.size/4;

    	let xy_m = circ(width/3,height/3,innerSize/4,fill(this.xy_m),"xy_m");
        this.svgBldr.elem(xy_m);

        let xym = circ(3*width/4,3*height/4,innerSize/4,fill(this.xym),"xym");
        this.svgBldr.elem(xym);

        let x_ym = circ(5*width/4,3*height/4,innerSize/4,fill(this.x_ym),"x_ym");
        this.svgBldr.elem(x_ym);

        let x_y_m = circ(5*width/3,height/3,innerSize/4,fill(this.x_y_m),"x_y_m");
        this.svgBldr.elem(x_y_m);


        let _xy_m = circ(width/3,5*height/3,innerSize/4,fill(this._xy_m),"_xy_m");
        this.svgBldr.elem(_xy_m);

        let _xym = circ(3*width/4,5*height/4,innerSize/4,fill(this._xym),"_xym");
        this.svgBldr.elem(_xym);

        let _x_ym = circ(5*width/4,5*height/4,innerSize/4,fill(this._x_ym),"_x_ym");
        this.svgBldr.elem(_x_ym);

        let _x_y_m = circ(5*width/3,5*height/3,innerSize/4,fill(this._x_y_m),"_x_y_m");
        this.svgBldr.elem(_x_y_m);
    }

	build(){
		this.init();
		this.setTokens();
		return this.svgBldr.build();
	}
}


class SecondBoard {

constructor(size=200){
		this.size = size;
		
		this.xy = 0;
		this.x_y = 0;
		this._xy = 0;
		this._x_y = 0;	
	}

	clear(){
		this.xy = 0;
		this.x_y = 0;
		this._xy = 0;
		this._x_y = 0;
	}

	 nonTrivial(){

    	let result = 	
    	this.xy +
		this.x_y +
		this._xy +
		this.x_y;
		

		return result > 0;
    }


	init(){
		let height = this.size/2;
		let width = this.size/2;
		let outerSize = this.size/2;
		let innerSize = this.size/4;
		this.svgBldr = new Bldr("svg");
		this.svgBldr.att("version", "1.1").att("xmlns", "http://www.w3.org/2000/svg").att("xmlns:xlink", "http://www.w3.org/1999/xlink");
		this.svgBldr.att("align", "center").att("width", this.size).att("height", this.size);
		//1
		this.svgBldr.elem(rect(0,0,outerSize));
		//2
		this.svgBldr.elem(rect(width,0,outerSize));
		//3
		this.svgBldr.elem(rect(0,height,outerSize));
		//4
		this.svgBldr.elem(rect(width,height,outerSize));
		

        //labels, these are at hoc
        this.svgBldr.elem(simpleCirc(width,height/2-10,15));
        
        this.svgBldr.elem(new Bldr("text").text("x").att("x",width).att("y",height/2)
            .att("font-size",30).att("text-anchor","middle").att("font-style","italic")
            .att("font-family","times, serif"));

        
        this.svgBldr.elem(simpleCirc(width/2,height,15));
        
        this.svgBldr.elem(new Bldr("text").text("y").att("x",width/2).att("y",height+5)
            .att("font-size",30).att("text-anchor","middle").att("font-style","italic")
            .att("font-family","times, serif"));

		return this; 
	}
      
    setTokens(){
    	let height = this.size/2;
		let width = this.size/2;
		let outerSize = this.size/2;
		let innerSize = this.size/4;

    	let xy = circ2(width/2,height/2,innerSize/3,fill(this.xy),"xy");
        this.svgBldr.elem(xy);

        let x_y = circ2(3*width/2,height/2,innerSize/3,fill(this.x_y),"x_y");
        this.svgBldr.elem(x_y);


        let _xy = circ2(width/2,3*height/2,innerSize/3,fill(this._xy),"_xy");
        this.svgBldr.elem(_xy);

        let _x_y = circ2(3*width/2,3*height/2,innerSize/3,fill(this._x_y),"_x_y");
        this.svgBldr.elem(_x_y);
    }

	build(){
		this.init();
		this.setTokens();
		return this.svgBldr.build();
	}
}

var globalFirstBoard = new FirstBoard();
globalFirstBoard.init();

var globalSecondBoard = new SecondBoard();
globalSecondBoard.init();

function translateTokens(fb,sb){
    
    sb.xy = evalTokens(fb.xym,fb.xy_m);
    sb.x_y = evalTokens(fb.x_ym,fb.x_y_m);
    sb._xy = evalTokens(fb._xym,fb._xy_m);
    sb._x_y = evalTokens(fb._x_ym,fb._x_y_m);
    
}


function statementsFrom(sb,set){

	let s = "";
    if (sb.xy == 1) s += "No " + set.x + " " + set.u + " are " + set.y +".<br> ";
    if (sb.xy == 2) s += "Some " + set.x + " " + set.u + " are " + set.y +".<br> ";

    if (sb.x_y == 1) s += "No " + set.x + " " + set.u + " are " + set._y +".<br> ";
    if (sb.x_y == 2) s += "Some " + set.x + " " + set.u + " are  " + set._y +".<br> ";

    if (sb._xy == 1) s += "No " + set._x + " " + set.u + " are " + set.y +".<br> ";
    if (sb._xy == 2) s += "Some " + set._x + " " + set.u + " are  " + set.y +".<br> ";
   
    if (sb._x_y == 1) s += "No " + set._x + " " + set.u + " are " + set._y +".<br> ";
    if (sb._x_y == 2) s += "Some " + set._x + " " + set.u + " are  " + set._y +".<br> ";     

    console.log(s);
    if (s.length == 0){
    	s += "No conclusions can be drawn";
    }
    return s;

}

function moreStatementsFrom(sb,set){

    let s = "";
	if (sb.xy == 2 && sb.x_y == 1) s += "All " + set.x + " " + set.u + " are " + set.y +".<br> ";
    if (sb.xy == 2 && sb._xy == 1) s += "All " + set.y + " " + set.u + " are " + set.x +".<br> ";
    
    if (sb.x_y == 2 && sb.xy == 1) s += "All " + set.x + " " + set.u + " are " + set._y +".<br> ";
    if (sb.x_y == 2 && sb._x_y == 1) s += "All " + set._y + " " + set.u + " are " + set.x +".<br> ";

    if (sb._x_y == 2 && sb.x_y == 1) s += "All " + set._y + " " + set.u + " are " + set._x +".<br> ";
    if (sb._x_y == 2 && sb._xy == 1) s += "All " + set._x + " " + set.u + " are " + set._y +".<br> ";


    if (sb._xy == 2 && sb.xy ==1) s += "All " + set.y + " " + set.u + " are " + set._x +".<br> ";
    if (sb._xy == 2 && sb._x_y ==1) s += "All " + set._x + " " + set.u + " are " + set.y +".<br> ";

    return s;
}

function evalTokens(token1, token2){
	let sum = token1 + token2;
	if (sum == 0) return 0; //two unknowns == unknown
	if (sum == 1) return 0; //unknown + none = unknown
	if (sum == 4) return 2; // some + some = some;
	if (token1 == 1 && token2 ==1) return 1;// none + none == none
	if (sum == 3 ) return 2; //none and some == some
	if (sum == 2) return 2; //unknown and some == some
	 
}


/***
* Puzzles and solvers
*/

class PuzzleSet {

	constructor(x, _x,y,_y,m,_m, u=" "){

		this.x = x;
		this.y = y;
		this.m = m;


		this._x = _x;
		this._y = _y;
		this._m = _m;

		this.u = u;

	}
}

class Statement{
	constructor(q, v1, v2){		
	this.quant = q;
	this.v1 = v1;
	this.v2 = v2;
	}

    interpret(ps){
        let s = "";
        s += this.quant;
        s += " ";
        s += ps[this.v1];
        s += ps.u + "are ";
        s += ps[this.v2];
        s += "."	
        return s;
    }

    has(v){
    	if(this.v1.includes(v)|| this.v2.includes(v)){
    		return true;
    	}
        return false;	
    }


    get(v){
    	if(this.v1.includes(v)){
    		return this.v1;
    	}
    	if(this.v2.includes(v)){
    		return this.v2;
    	}
    	return "";
    }       
}

class RandomStatement {
	constructor(v){
		this.variable = v;
	}
    
    build(){
    	let qlist = ["Some","No","All"];
    	let vlist = [this.variable, "_"+this.variable];
    	let mlist = ["m","_m"];
        
        let order = Math.floor(Math.random()*2);
        let s = null;
        if (order == 0){
        	s = new Statement(qlist[Math.floor(Math.random()*3)],
        	    vlist[Math.floor(Math.random()*2)],
        	    mlist[Math.floor(Math.random()*2)]);        	    
        } else {
        	s = new Statement(qlist[Math.floor(Math.random()*3)],
        	    mlist[Math.floor(Math.random()*2)],
        	    vlist[Math.floor(Math.random()*2)]);

        }
        return s;
    }
}

let blankPuzzleSet = new PuzzleSet("<em>x</em>","not <em>x</em>","<em>y</em>","not <em>y</em>", "<em>m</em>", "not <em>m</em>");
class RandomBlankSyllogism {
	constructor(){};
	build(){
		let s1 = new RandomStatement("x").build();
		let s2 = new RandomStatement("y").build();
		return new Syllogism(blankPuzzleSet, s1,s2);
	}
}

function noFromAll(s){
	let newV2 = ""
	if(s.v2.includes("_")){
		newV2 = s.v2.replace("_","");
	} else {
		newV2 = "_" + s.v2;
	}
	let statement = new Statement("No",s.v1,newV2);
	console.log(statement);
	return statement;
}

//no idea how bad this loop will be
function nonTrivialSyllogism(){

    let nonTrivial = false;
    let syl = null;
    while (!nonTrivial){
    	syl = new RandomBlankSyllogism().build();
    	let sol = new Solver(syl, new FirstBoard(), new SecondBoard());
    	sol.solve();
    	nonTrivial = sol.sb.nonTrivial();
    }
    return syl;
}



class Syllogism{

    constructor(set, statement1, statement2){
    	this.ps = set;
    	this.s1 = statement1;
    	this.s2 = statement2;
    }
    
    toString(){
    	let s= "";
    	s += this.s1.interpret(this.ps);
    	s += " <br> "
    	s += this.s2.interpret(this.ps);
    	s += "<br>"
    	s += "(x: '"+ this.ps.x +"', y: '" + this.ps.y +"', m: '"+ this.ps.m +"')";  
        return s;  
    }
}    

class Move{

	constructor(description, value){
		this.m = description;
		this.v = value;
	}

	apply(board){
        board[this.m] = this.v;
	}
}

class Solver {
	constructor(syllogism, firstBoard, secondBoard){
		this.s = syllogism;
		this.fb = firstBoard;
		this.sb = secondBoard;
		this.noMoves = [];
		this.someMoves=[];
	}

	solve(){
    
      this.buildNegativeMoves();  
      this.applyNegativeMoves();

      this.buildPositiveMoves();
      this.applyPositiveMoves();
      translateTokens(this.fb, this.sb);
	}

	applyNegativeMoves(){
	    this.noMoves.forEach(m => m.apply(this.fb)); 
	}
	
	applyPositiveMoves(){
		this.someMoves.forEach(m => m.apply(this.fb));
	}

	buildNegativeMoves(){
       this.negativeMovesFromStatement(this.s.s1);
       this.negativeMovesFromStatement(this.s.s2);
	}

	buildPositiveMoves(){
       this.positiveMovesFromStatement(this.s.s1);
       this.positiveMovesFromStatement(this.s.s2);
	}
    
    negativeMovesFromStatement(st){
    	let moveString=""
    	if(st.quant == "No"){
            if(st.has("x")){
                moveString = st.get("x") +"y" + st.get("m");    
            	this.noMoves.push(new Move(moveString,1));
            	moveString = st.get("x") +"_y" + st.get("m");
            	this.noMoves.push(new Move(moveString,1));  
            } else if(st.has("y")){
                moveString = "x" + st.get("y") + st.get("m");    
            	this.noMoves.push(new Move(moveString,1));
            	moveString = "_x" +st.get("y") + st.get("m");
            	this.noMoves.push(new Move(moveString,1));  
            }
    	}
    	if(st.quant == "All"){
    		//do No statement
    		this.negativeMovesFromStatement(noFromAll(st));
    	}
    }

    positiveMovesFromStatement(st){
    	let testString = "";
    	let moveString=""
    	if(st.quant == "Some"){
            if(st.has("x")){
                testString = st.get("x") +"y" + st.get("m");
                if (this.fb[testString] == 1){
                    moveString = st.get("x") +"_y" + st.get("m");    
            	    this.someMoves.push(new Move(moveString,2));
                }
                testString = st.get("x") +"_y" + st.get("m");
                if (this.fb[testString] == 1){
                    moveString = st.get("x") +"y" + st.get("m");    
            	    this.someMoves.push(new Move(moveString,2));
                }  
            } else if(st.has("y")){
                testString = "x" + st.get("y") + st.get("m"); 
                if (this.fb[testString] == 1){
                    moveString = "_x" + st.get("y") + st.get("m");    
            	    this.someMoves.push(new Move(moveString,2));
                }
                testString = "_x" +st.get("y") + st.get("m");
                if (this.fb[testString] == 1){
            	    moveString = "x" +st.get("y") + st.get("m");
            	    this.someMoves.push(new Move(moveString,2));  
                }
    	    }
    	}
       	if(st.quant == "All"){
            let newStatement = new Statement("Some",st.v1,st.v2);
            console.log(newStatement);
    		this.positiveMovesFromStatement(newStatement);
    	}
    
    }

}

let puzzles = [];
//1


let testSet = new PuzzleSet("lizard",
    "non lizard",
    "in need of a hair brush",
    "not needing a hair brush",
    "bald",
    "hairy",
    " creatures "
    );

let testStatement = new Statement("No","m","y");
let testStatement2 = new Statement("No","x","_m");
let syl1 = new Syllogism(testSet,testStatement,testStatement2);

puzzles.push(new Solver(syl1,globalFirstBoard,globalSecondBoard));

//2
let testSet2 = new PuzzleSet("cheating",
    "non cheating",
    "trustworthy",
    "untrustworthy",
    "honest",
    "dishonest",
    " folk "
    );

let ts1 = new Statement("No","m","x");
let ts2 = new Statement("No","_m","y");
let syl2 = new Syllogism(testSet2,ts1,ts2);

puzzles.push(new Solver(syl2,globalFirstBoard,globalSecondBoard));
//3
let testSet3 = new PuzzleSet("new",
    "old",
    "nice",
    "not nice",
    "wholsome",
    "unwholsome",
    " cakes "
    );

let ts1a = new Statement("Some","x","_m");
let ts2a = new Statement("No","y","_m");
let syl2a = new Syllogism(testSet3,ts1a,ts2a);

puzzles.push(new Solver(syl2a,globalFirstBoard,globalSecondBoard));

//4

let testSet4 = new PuzzleSet("dragons",
    "non-dragons",
    "Scottish folk",
    "non-Scottish folk",
    "canny",
    "uncanny",
    " "
    );

let ts1b = new Statement("All","x","_m");
let ts2b = new Statement("All","y","m");
let syl2b = new Syllogism(testSet4,ts1b,ts2b);

puzzles.push(new Solver(syl2b,globalFirstBoard,globalSecondBoard));

//5

let testSet5 = new PuzzleSet("hard boiled",
    "non-hard-boiled",
    "crackable",
    "uncrackable",
    "eggs",
    "non-eggs",
    " things "
    );
let syl2c = new Syllogism(testSet5,new Statement("Some","m","x"),new Statement("No","m","_y"));

puzzles.push(new Solver(syl2c,globalFirstBoard,globalSecondBoard));

//6
let testSet6 = new PuzzleSet("soldiers",
    "non-soldiers",
    "mischievous",
    "non-mischievous",
    "monkeys",
    "non-monkeys",
    " "
    );
let syl2d = new Syllogism(testSet6,new Statement("No","m","x"),new Statement("All","m","y"));

puzzles.push(new Solver(syl2d,globalFirstBoard,globalSecondBoard));

//7
let testSet7 = new PuzzleSet("pigs",
    "non-pigs",
    "skeletons",
    "non-skeletons",
    "fat",
    "skinny",
    " "
    );
let syl2e = new Syllogism(testSet7,new Statement("All","x","m"),new Statement("No","y","m"));

puzzles.push(new Solver(syl2e,globalFirstBoard,globalSecondBoard));