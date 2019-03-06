"use strict";

/*
 * Utility functions and classes for generating star polygons
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
	reduce(){
		if (this.isReduced()){
			return this;
		}
		let g = gcd(this.n,this.d);
		let f = new Frac(this.n/g, this.d/g);
		return f.reduce();		
	}
	text(){
		return this.n + "/" + this.d;
	}
}

class Vertex{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
	toString(){ 
		return "(" + this.x + ", " + this.y + ")";
	} 
	stretch(radius){
		this.x = this.x*radius;
		this.y = this.y*radius;
	}
}

class Edge{
	constructor(v1, v2){
		this.start = v1;
		this.end = v2;
	}
	
}

function allVertices(n){
	let vertices = [];
	for (let i = 0; i< n; i++){
		let angle = 2*i*Math.PI/n;
		vertices.push(new Vertex(Math.cos(angle), Math.sin(angle)));
	}
	return vertices;
}

class SVGWrapper{
	constructor(width, height, builder){
		let wrapper = new Bldr("svg");
		wrapper.att("version", "1.1").att("xmlns", "http://www.w3.org/2000/svg").att("xmlns:xlink", "http://www.w3.org/1999/xlink");
		wrapper.att("align", "center").att("width", width).att("height", height);	
		wrapper.elem(builder);
		this.svg = wrapper;
	}

	build(){
		return this.svg.build();
	}	
}

/*
* Drawing properties used for SVG generation
*/
let drawing = {};
drawing.strokeWidth = 4;
drawing.color = 'black';
drawing.color2 = 'lightgrey';
drawing.opacity = 0.6;

/*
* Representation of the polygon.
* The 'edges' are currently not used.
*/
class Polygon {
	constructor(v,s){
		this.vertexCount = v;
		this.skipCount = s;
		this.vertices = [];
		this.edges = [];
		this.polyPoints =[];
		this.cSize = this.vertexCount;
		this.cNumber = 1;
		this.init();
	}

	init(){
		let total = this.vertexCount*this.skipCount;
		let allVerts = allVertices(total);
		for (let i=0; i< total; i = i + this.skipCount){
			this.vertices.push(allVerts[i]);
		}
		for (let i=0; i < this.vertexCount; i++){
			this.edges.push(new Edge(this.vertices[i],this.vertices[(i+this.skipCount)%(this.vertexCount)]));
		}
		
		this.cNumber = gcd(this.vertexCount, this.skipCount);
		this.cSize = this.vertexCount/this.cNumber;

		let vIndex = 0;
		let currentPoly = [];
		while(this.polyPoints.length != this.cNumber){
			currentPoly.push(this.vertices[vIndex]);
			if (currentPoly.length == this.cSize){
				this.polyPoints.push(currentPoly);
				currentPoly = [];
				vIndex = vIndex + 1;
			} else{
				vIndex = (vIndex +this.skipCount) % this.vertexCount;	
			}		
		}
	}	
	
	svgComponent(radius){
		let g = new Bldr("g");		
		for (let v in this.vertices){
			let vert = this.vertices[v];
			vert.stretch(radius);
		}
		for (let cp in this.polyPoints){
			let currentPoly = this.polyPoints[cp];
			let polygonList = "";
			for (let p in currentPoly){
				let point = currentPoly[p];
				polygonList += point.x + ',';
				polygonList += point.y +' ';
			}
			let pg = new Bldr('polygon')
				.att('points', polygonList)
				.att("fill",drawing.color2)
				.att("stroke-width",drawing.strokeWidth)
				.att('stroke-linecap', 'round')
				.att("stroke",drawing.color)
				.att("style","fill-rule:nonzero")
				.att("fill-opacity",drawing.opacity);
			g.elem(pg);
	
		}
		return g;
	}

	schlafli(){
		let s = "";
		if (this.cNumber >1){
			s += this.cNumber;			
		} 
		s += "{";
		let f = new Frac(this.vertexCount, this.skipCount);
		f = f.reduce();
		if (f.d == 1){
			s += f.n;
		} else {
			s += f.text();	
		}
		s += "}";
		return s;
	}
	schlafliLaTeX(){
		let s = "\\[";
		if (this.cNumber >1){
			s += this.cNumber;			
		} 
		
		let f = new Frac(this.vertexCount, this.skipCount);
		f = f.reduce();
		if (f.d == 1){
			s += "\\{";
			s += f.n;
			s += "\\}";
		} else {
			s += "\\left\\{";
			s += f.latex();
			s += "\\right\\}";	
		}
		s += "\\]";
		return s;
	}
}

/*
* Returns a pair: an SVG builder and the polygon it contains.
*/
function alone(n,p,size){
	let frame = 3*size;
	let center = 3*size/2;
	let poly = new Polygon(n,p);
	let g = new Bldr('g');
	g.elem(poly.svgComponent(size));
	g.att('transform','translate('+center+','+center+')');
	return [new SVGWrapper(frame,frame, g),poly];
}

/*
* Returns an HTML table of star polygons on 'value' vertices in the first row
* and their symbols (latex) in the second row.
*/
function row(value, size){
	let table = new Bldr("table");
	let row = new Bldr("tr");
	let row1 = new Bldr("tr");
	table.elem(row);
	table.elem(row1);
	for (let i = 1; i <= Math.floor(value/2); i++){
		let p = alone(value, i, size);
		row.elem(new Bldr("td").elem(p[0]));
		row1.elem(new Bldr("td").text(p[1].schlafliLaTeX()));
			
	}
	return table;
}

/*
* Returns an SVG builder for a trianglular table of star polygons
* on all vertices less than the given value. No symbols written in table.
*/
function triangularChart(limit){
	let radius = sizeRange(limit);
	let height = limit*radius*2.5;
	let width = height/1.5;

	let table = new Bldr("g");
	for(let j = 2; j < limit; j++){
		let vShift = radius +2.5*(j-2)*radius;
		let row = new Bldr("g");
		for (let i = 1; i <= Math.floor(j/2); i++){
			let p = new Polygon(j,i);
			let g = p.svgComponent(radius);
			let hShift = radius + 2.5*i*radius;
			g.att('transform','translate('+hShift+','+vShift+')');
			row.elem(g);	
		}
		table.elem(row)
	}
	return new SVGWrapper(width,height,table);
}

/*
* Just for fun - the same chart as above, back to back
* to make a pyramidal chart.
*/
function doubleChart(limit){
	let radius = sizeRange(limit);
	let height = 2*limit*radius*3;
	let width = height/2;

	let table = new Bldr("g");
	for(let j = 3; j < limit; j++){
		let vShift = radius +2.5*(j-3)*radius;
		let row = new Bldr("g");
		for (let i = 1; i <= Math.floor(j/2); i++){
			let p = new Polygon(j,i);
			let g = p.svgComponent(radius);
			let hShift =  2.5*(i-1)*radius;
			g.att('transform','translate('+ (width/2 + hShift) +','+vShift+')');
			row.elem(g);
			
			let p2 = new Polygon(j,i);
			p2.init();
			let g2 = p2.svgComponent(radius);
			g2.att('transform','translate('+ (width/2 - hShift )+','+vShift+')');
			row.elem(g2);
				
		}
		table.elem(row)
	}
	return new SVGWrapper(width,height,table);
}

/*
* Just for fun, same as above but back to back and up and down,
* to make a diamond-shaped chart.
*/
function diamondChart(limit){
	let radius = sizeRange(limit)/2;
	let height = 2*limit*radius*2.5;
	let width = height/1.5;

	let table = new Bldr("g");
	for(let j = 3; j < limit; j++){
		let vShift = 2.5*(limit-j-1)*radius;
		
		let row = new Bldr("g");
		for (let i = 1; i <= Math.floor(j/2); i++){
			//upper
			let p = new Polygon(j,i);
			let g = p.svgComponent(radius);
			let hShift =  2.5*(i-1)*radius;
			g.att('transform','translate('+ (width/2 + hShift) +','+ (height/2- vShift)+')');
			row.elem(g);
			
			if (i != 1){
				let p2 = new Polygon(j,i);
				p2.init();
				let g2 = p2.svgComponent(radius);
				g2.att('transform','translate('+ (width/2 - hShift )+',' + (height/2 - vShift) +')');
				row.elem(g2);
			}
			//lower
			if (j != limit -1){
				let p3 = new Polygon(j,i);
				p3.init();
				let g3 = p3.svgComponent(radius);
				g3.att('transform','translate('+ (width/2 + hShift) +','+ (height/2+ vShift)+')');
				row.elem(g3);
			}
			
			if (i != 1 && j != limit -1){
				let p4 = new Polygon(j,i);
				p4.init();
				let g4 = p4.svgComponent(radius);
				g4.att('transform','translate('+ (width/2 - hShift )+',' + (height/2 + vShift) +')');
				row.elem(g4);
			}
			
							
		}
		table.elem(row)
	}
	return new SVGWrapper(width,height,table);
}

//arbitrary sizing of polygons
function sizeRange(limit){
	if (limit <= 6) return 40;
	if (limit <= 12) return 30;
	if (limit <= 24) return 20;
	if (limit <= 48) return 10;	
	return 5;
}