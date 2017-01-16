
// clplxfrac is the object to interact with

var cplxfrac = {};

 /*
 *CPoint represents a point in the complex plane.
 */
class CPoint { 
	constructor(a,  b){
		this.xvalue = a;
		this.yvalue = b;
	} 
	
	sum(p){  
		return new CPoint(this.xvalue + p.xvalue, this.yvalue + p.yvalue);
	}
	 
	diff(p){  
		return new CPoint(this.xvalue - p.xvalue, this.yvalue - p.yvalue);
	}
		 
	absolute() {
		var x = this.xvalue;
		var y = this.yvalue;
		if (x <0) x = -1 *x;
		if (y <0) y = -1 *y;
		return new CPoint(x,y);
	}
	 
	prod(p){
		var newx = this.xvalue*(p.xvalue) - this.yvalue*(p.yvalue);
		var newy = this.xvalue*(p.yvalue) + this.yvalue*(p.xvalue); 
		return new CPoint(newx, newy);
	}
	 
	squared(){
		return this.prod(this);
	}
	 
	cubed(){
		return this.squared().prod(this);
	}
	
	quad(){
		return this.squared().prod(this).prod(this);
	}
	
	quint(){
		return this.quad().prod(this);
	}
	 
	root(){
		return new CPoint(Math.sqrt(this.xvalue), Math.sqrt(this.yvalue));
	}
	
	magnit() {
		return Math.sqrt(this.xvalue*this.xvalue + (this.yvalue*this.yvalue));
	}
	 
	signedRoot(){
		var xsign = 1;
		var ysign = 1;
		if (this.xvalue < 0) xsign = -1;
		if (this.yvalue < 0) ysign = -1;
		return new CPoint(Math.sqrt(this.xvalue)*xsign, Math.sqrt(this.yvalue)*ysign);
	}
	 
	scalarProduct(d){
		return new CPoint(d * this.xvalue, d * this.yvalue);
	}
	 
	conjugate() {
		return new CPoint(this.xvalue, -1 * this.yvalue);	 
	}		
	toString() {
		return "" + this.xvalue + " + " + this.yvalue +"i";
	}
};

class Map {	
	constructor(arrow, iterator, initial, bound) {
		this.arrow = arrow;
		this.iterator = iterator;
		this.initial = initial;
		this.bound = bound;
	}
	
	evaluate(x, limit) {		
		return this.iterator(this.arrow, x, limit, this.initial, this.bound);
	}	
};
/*
 * TODO: come up with a better method.
 */ 
function colorChooser(level) {
	var colors = ['#ffffff','#f2f2f2','#e6e6e6','#d9d9d9','#cccccc','#bfbfbf','#b3b3b3','#a6a6a6','#999999',
	'#8c8c8c','#808080','#737373','#666666','#595959','#4d4d4d','#404040','#333333','#262626','#1a1a1a','#0d0d0d','#000000'];
	var clevel = Math.floor(colors.length * level);
	return colors[clevel];
}


var mandelbrot = function(x,c) { return x.squared().sum(c); };

/*
* Mandelbrot set iterator uses a variable c
* arrow is a function z_n = z_{n-1}^2 + c is the prototypical arrow
* value is the value that is put into c
* initial is the initial value for z
* bound is the magnitude to quit at, usually 2
*/
var mandelbrotIterator = function(arrow, value, limit, bound, initial) {
	var level = 0;
	var z = initial;
	var c = value;
	for(var i=0; i< limit; i++){
		z = arrow(z, c);    
	    if(z.magnit()>bound) break;
	      level++;
	    }
	return level/limit;
};

var juliaIterator = function(arrow, value, limit, bound, initial) {
	var level = 0;
	var z = value;
	var c = initial;
	for(var i=0; i< limit; i++){
		z = arrow(z, c);    
	    if(z.magnit()>bound) break;
	      level++;
	    }
	return level/limit;
};
	

var zero = new CPoint(0,0);
var one = new CPoint(1,0);
var julia1 = new CPoint(0.122,0.735);
var julia2 = new CPoint(-0.99,-0.34);
var julia3 = new CPoint(-0.11,-0.89);
var julia4 = new CPoint(-0.21,-0.79);
var julia5 = new CPoint(-0.299,-0.777);

cplxfrac.mandelbrotMap = new Map(mandelbrot, mandelbrotIterator,2, zero);
cplxfrac.juliaMap1 = new Map(mandelbrot, juliaIterator, 2, julia2);
cplxfrac.juliaMap2 = new Map(mandelbrot, juliaIterator, 2, julia5);
cplxfrac.juliaMap3 = new Map(mandelbrot, juliaIterator, 2, julia4);
cplxfrac.juliaMap4 = new Map(mandelbrot, juliaIterator, 2, julia1);
/**
* utilities
*/

function randomRange(greaterThan, lessThan){
	var shifted = randomInt(lessThan - greaterThan);
	return lessThan - shifted; 
};


function randomInt(lessThan){
	var selection = Math.floor(Math.random()*(lessThan));
	return selection;
};

function randomCPNoscale(){
	var isneg = randomInt(2);
	var sign1 = 1; 
	var sign2 = 1;
	if (isneg === 0 ) {
		sign1 = -1;
	}
	isneg = randomInt(2);
	if (isneg === 0) {
		sign2 = -1;
	}
	return new CPoint(sign1 * 2*Math.random(), sign2 * 2*Math.random());
};

function randomCP(range) {
		return new CPoint(randomRange(-1*range,range), randomRange(-1*range,range));
};



