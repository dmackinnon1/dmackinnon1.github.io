"use strict";

/*
 * Utility functions and classes for calculating Faery sequences
 */

 /*
 * Uses the Euclidian algorithm to calculate the GCD of a pair of positive
 * integers.
 */
function gcd(a, b) {
	if (a == b || a == 0) {
		return b;
	}
	if (b == 0){
		return a;
	}
	let r1 = 0;
	let r2 = 0;
	
	if (a > b){
		r1 = a;
		r2 = b;
	} else {
		r1 = b;
		r2 = a;
	}
	let r3 = r1%r2;
	return gcd(r3, r2);
}

/*
* Frac class represents a fraction
* Public class, the returned Faery sequence
* is a list of Frac instances. Constructor
* should only be used internally.
*/
class Frac {
	constructor(n,d){
		this.n = n;
		this.d = d;
	}
	toString(){
		return "" +this.n + "/" + this.d;
	}
	isReduced(){
		return gcd(this.n,this.d) == 1;
	}
	value(){
		return this.n/this.d;
	}
	latex(){
		return "\\frac{" + this.n + "}{" + this.d + "}"; 
	}
}

class FracList {
	constructor(list){
		this.list = list;
	}

	fracList(){
		if (this.list.length < 25){
			return this.shortFracList();
		} else{
			return this.longFracList();
		}
	}

	shortFracList(){
		let fList = "\\[[";
		let frac = null;
		let position = 0;
		for(let f in this.list){
			position ++;
			frac = this.list[f];
			fList += (frac.latex());
			if (position < this.list.length) {
				fList += ", ";
			}
		}
		fList += "]\\]";
		return  fList;
	}

	longFracList(){
		let fList = "\\[[";
		let frac = null;
		for(let f = 0; f < 4; f++){
			frac = this.list[f];
			fList += (frac.latex());
			fList += ", ";			
		}
		
		fList += " \\ldots ";
		
		let mid = Math.floor(this.list.length/2);
		for(let f = (mid-3) ; f <=(mid+3); f++){
			let frac = this.list[f];
			fList += (frac.latex());
			fList += ", ";
		}

		fList += " \\ldots ";
		let position = this.list.length -4;			
		for(let f = (this.list.length -4); f <(this.list.length); f++){
			let frac = this.list[f];
			fList += (frac.latex());
			position++;
			if (position < this.list.length) {
				fList += ", ";
			}

		}

		fList += "]\\]";
		return  fList;

	}
}

/*
* Internal function for calculating the greatest denominator
* in a list of fractions.
*/
function maxDenominator(sequence){
	let max = 1;
	for (let f in sequence){
		let frac = sequence[f]
		if (frac.d > max){
			max = frac.d;
		}
	}
	return max;
}

/*
* Internal function for adding the n-level of mediants into an existing 
* Faery sequence.
*/
function addMediant(sequence, frac1, frac2, n){
	if (frac1.d + frac2.d == n){
		let med = new Frac(frac1.n + frac2.n, frac1.d + frac2.d);
		if (med.isReduced()){
			sequence.push(med);
		}
	}
}
/*
* Internal function for generating the next level of a Faery sequence
*/

function faerySequence(sequence){
	let newSequence = [];
	let level = maxDenominator(sequence) +1 ;
	for (let f in sequence){
		let i = parseInt(f);
		if (i == (sequence.length -1)){
			newSequence.push(sequence[i]);
			break;
		}
		newSequence.push(sequence[i]);
		addMediant(newSequence, sequence[i],sequence[i+1], level);
	}
	return newSequence;
}



/*
* Principle public function for generating Faery sequence.
*/
function nthLevelFaery(n){
	let start =[new Frac(0,1), new Frac(1,1)];
	for (let i = 0; i < n; i++){
		start = faerySequence(start);
	}
	return start;
}

function fordCirclesSVG(sequence, size, color='grey',direction='horizontal', omitEnds=false, omitCentre=false){
	let height = size;
	let width = size;
	if (direction == 'horizontal'){
		height = height/2;
	} else {
		width = width/2;
	}
	let scale = size;
	let svgBldr = new Bldr("svg");
	svgBldr.att("version", "1.1").att("xmlns", "http://www.w3.org/2000/svg").att("xmlns:xlink", "http://www.w3.org/1999/xlink");
	svgBldr.att("align", "center").att("width", width).att("height", height);	
	
	for (let f in sequence){
		let i = parseInt(f);
		if ((i == 0 || i == (sequence.length - 1)) && omitEnds){
			continue;
		}
		if( (i == ((sequence.length -1)/2))&& omitCentre ){
			continue;
		}
		let frac = sequence[f];
		let x = scale*frac.value();
		let r = (scale)/(2*(Math.pow(frac.d,2)))
		let y = null;
		
		let dot = null;
		let cx1 = null;
		let cy1 = null;
		let cx2 = null;
		let cy2 = null;
		if (direction === "horizontal"){
			y =  height/2 + r;
			cx1 = width-x;
			cy1 = y;
			cx2 = width-x;
			cy2 = height-y; 
		} else {
			y = width/2 +r;
			cx1 = width -y;
			cy1 = x;
			cx2 = y;
			cy2 = x; 			
		}
		dot = new Bldr("circle")
			.att("cx", cx1)
			.att("cy", cy1)
			.att("r",r)
			.att("stroke-width",0)
			.att("fill",color);
		svgBldr.elem(dot);
		
		dot = new Bldr("circle")
			.att("cx", cx2)
			.att("cy", cy2)
			.att("r",r)
			.att("stroke-width",0)
			.att("fill",color);
		svgBldr.elem(dot);	
		
	}
	return svgBldr.build();
}


