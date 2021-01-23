"use strict";


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

constructor(size=300){
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
        
        this.svgBldr.elem(new Bldr("text").text("y").att("x",width/3-10).att("y",height+10)
            .att("font-size",30).att("text-anchor","middle").att("font-style","italic")
            .att("font-family","times, serif"));

        this.svgBldr.elem(simpleCirc(width,height,15));
        
        this.svgBldr.elem(new Bldr("text").text("m").att("x",width).att("y",height+10)
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
        
        this.svgBldr.elem(new Bldr("text").text("y").att("x",width/2).att("y",height+10)
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

function translateTokens(fb,sb){
    
    sb.xy = evalTokens(fb.xym,fb.xy_m);
    sb.x_y = evalTokens(fb.x_ym,fb.x_y_m);
    sb._xy = evalTokens(fb._xym,fb._xy_m);
    sb._x_y = evalTokens(fb._x_ym,fb._x_y_m);
    
}

function statements(sb){
    
    let s = "";
    if (sb.xy == 1) s += "No <em>x</em> are <em>y</em>.<br> ";
    if (sb.xy == 2) s += "Some <em>x</em> are <em>y</em>.<br> ";

    if (sb.x_y == 1) s += "No <em>x</em> are not <em>y</em>.<br> ";
    if (sb.x_y == 2) s += "Some <em>x</em> are not <em>y</em>.<br> ";

    if (sb._xy == 1) s += "No non-<em>x</em> are <em>y</em>.<br> ";
    if (sb._xy == 2) s += "Some non-<em>x</em> are <em>y</em>.<br> ";
   
    if (sb._x_y == 1) s += "No non-<em>x</em> are not <em>y</em>. <br>";
    if (sb._x_y == 2) s += "Some non-<em>x</em> are not <em>y</em>.<br> ";      

    console.log(s);
    return s;
}

function moreStatements(sb){

    let s = "";
	if (sb.xy == 2 && sb.x_y == 1) s += "All <em>x</em> are <em>y</em>.<br>";
    if (sb.xy == 2 && sb._xy == 1) s += "All <em>y</em> are <em>x</em>.<br>";
    //if (sb._xy == 2 && sb.x_y == 1) s += "All <em>y</em> are <em>x</em>.<br>";

    if (sb.x_y == 2 && sb.xy == 1) s += "All <em>x</em> are not <em>y</em>.<br>";
    if (sb.x_y == 2 && sb._x_y == 1) s += "All non-<em>y</em> are <em>x</em>.<br>";

    if (sb._x_y == 2 && sb.x_y == 1) s += "All non-<em>y</em> are not <em>x</em>.<br>";
    if (sb._x_y == 2 && sb._xy == 1) s += "All non-<em>x</em> are not <em>y</em>.<br>";


    if (sb._xy == 2 && sb.xy ==1) s += "All <em>y</em> are not <em>x</em>.<br>";
    if (sb._xy == 2 && sb._x_y ==1) s += "All non-<em>x</em> are <em>y</em>.<br>";

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

var globalFirstBoard = new FirstBoard();
globalFirstBoard.init();

var globalSecondBoard = new SecondBoard();
globalSecondBoard.init();