"use strict";
/**
* Classes and functions in this script file are for
* performing calculations on knots. Only dependency should
* be on celtic_base.js.
*/

function crossingCount(grid){
	let count = 0;
	for (let p in grid.points){
		let point = grid.points[p];
		if (!point.isOnSecondary() && point.junctions.length == 0){
			count++;
		}
	}
	return count;
};

function setsOverlap(setA,setB){
	let arrayA = Array.from(setA);
	for (let a in arrayA){
		let element = arrayA[a];
		if (setB.has(element)){
			return true;
		}
	}
	return false;
};

function regionCount(grid){
	let regions = [];
	for (let n in grid.nodes){
		let node = grid.nodes[n];
		let newSet = node.getFullConnected();
		let overlap = false;
		for (let r in regions){
			let existingSet = regions[r];
			if (setsOverlap(newSet, existingSet)){
				overlap = true;
				break;
			}
		}
		if (!overlap){
			regions.push(newSet);
		}
	}
	return regions.length;
}
/* Loop count calculation is more involved than crossing
* or region count, and involves a number of classes and
* functions defined below.
*/

/**
* The function loopCount() creates a PathBuilder which
* uses the Grid provided to build all paths and count them.
* It does this by looking at the set of primary points of the
* grid, and determines the individual "strands" of paths
* that pass by each Point.
*
* A Strand represents a fragment of a Path that exists
* in the neighbourhood of a primary Grid Point. Strands
* around a primary grid point are collected in StrandGroups
* The structure of the Strands around a primary Point is completely
* determined by the Junctions that go through the primary Point.
* Once all the StrandGroups are calculated, the individual Strands
* can be collected together into closed Paths, and the 
* Paths can be counted.
*/

class Strand {
	constructor(end1, end2, group){
		this.ends = [];
		this.ends.push(end1);
		this.ends.push(end2);
		this.group = group;
	}

	toString() {
		let s = "(" + this.group.point.x + ", " + this.group.point.y +")";
	 	s += "[" + this.ends +"] ";
	 	return s;
	}

	hasEnd(end){
		for(let e in this.ends){
			if (this.ends[e] === end) {
				return true;
			}
		}
		return false;
	}

	getOtherEnd(end){
		for(let e in this.ends){
			if (this.ends[e] != end) {
				return this.ends[e];
			}
		}
	}
}

class StrandGroup {

	constructor(primaryPoint){
		this.point = primaryPoint;
		this.strands = [];		
	}

	toString(){
		let s = "(" + this.point.x + ", " + this.point.y +")";
		s += " {" + this.strands + "} ";
		return s;
	}

	getStrandPair(end){
		let foundStrand = null;
		for (let s in this.strands){
			if (this.strands[s].hasEnd(end)){
				foundStrand = this.strands[s];
				break;
			}
		}
		let pair = [foundStrand, end];
		return pair;
	}

	getStrand(end1, end2){
		for (let s in this.strands){
			let strand = this.strands[s];
			if (strand.hasEnd(end1) && strand.hasEnd(end2)){
				return strand;
			}
		}
		return null;
	}
	
	calculateStrands(){
		if (this.point.junctions.length === 0){
			this.strands.push(new Strand(0,2, this));
			this.strands.push(new Strand(1,3, this));
		} else if (this.point.hasNSJunction()){
			if (this.point.east() != null){
				this.strands.push(new Strand(1,2, this));
			}
			if (this.point.west() != null){
				this.strands.push(new Strand(0,3, this));
			}
		} else if (this.point.hasEWJunction()){
			if (this.point.north() != null){
				this.strands.push(new Strand(0,1, this));
			}
			if (this.point.south() != null){
				this.strands.push(new Strand(2, 3, this));
			}
		}
	}	
}

class PathBuilder {
	constructor(grid){
		this.grid = grid;
		this.allStrands = [];
		this.allPaths = [];
		this.strandGroups = new Map();
	}

	buildAllStrands(){
		this.strandGroups.clear();
		for (let p in this.grid.points){
			let point = this.grid.points[p];
			if (point.isOnSecondary()){
				continue;
			}
			let group = new StrandGroup(point);
			this.strandGroups.set(point,group);
			group.calculateStrands();
			this.allStrands.push.apply(this.allStrands, group.strands);
		}
	}

	isFreshStrand(strand){
		for (let p in this.allPaths){
			let path = this.allPaths[p];
			if (path.contains(strand)){
				return false;
			}
		}
		return true;
	}

	buildAllPaths(){
		let pathIndex = 0;
		for (let s in this.allStrands){
			let strand = this.allStrands[s];
			if (this.isFreshStrand(strand)){
				let p = new Path(strand, this, pathIndex);
				pathIndex ++;
				p.buildPath();
				this.allPaths.push(p);
			}
		}
	}

	getNE(strandGroup){		
		return this.strandGroups.get(strandGroup.point.north().east());
	}

	getNW(strandGroup){
		return this.strandGroups.get(strandGroup.point.north().west());
	}

	getSE(strandGroup){
		return this.strandGroups.get(strandGroup.point.south().east());
	}
	
	getSW(strandGroup){
		return this.strandGroups.get(strandGroup.point.south().west());
	}
}

class Path {
	constructor(start, pathBuilder, i = 0){
		this.startStrand = start;
		this.strands = [this.startStrand];
		this.pathBuilder = pathBuilder;
		this.index = i;
		this.startStrand.index = this.index;
	}

	contains(strand){
		for(let s in this.strands){
			if (this.strands[s] == strand){
				return true;
			}
		}
		return false;
	}

	length(){
		return this.strands.length
	}

	findNextStrand(strand, end){
		if (!strand.hasEnd(end)){
			return null;
		}
		let nextEnd = strand.getOtherEnd(end);
		let targetEnd = 0;
		let nextGroup = null;
		if (nextEnd === 0){
			nextGroup = this.pathBuilder.getNW(strand.group);
			targetEnd = 2;		
		} else if (nextEnd === 1){
			nextGroup = this.pathBuilder.getNE(strand.group);
			targetEnd = 3;
		} else if (nextEnd === 2){
			nextGroup = this.pathBuilder.getSE(strand.group);
			targetEnd = 0;
		} else if (nextEnd === 3){
			nextGroup = this.pathBuilder.getSW(strand.group);
			targetEnd = 1;
		}
		return nextGroup.getStrandPair(targetEnd);
	}

	buildPath(){
		let currentStrand = this.startStrand;
		let currentEnd = currentStrand.ends[0]; //pick one end
		while(true){
			let result = this.findNextStrand(currentStrand, currentEnd);
			
			currentStrand = result[0];
			currentEnd = result[1];
			if (this.contains(currentStrand)){
				break;
			}
			currentStrand.index = this.index;
			this.strands.push(currentStrand);
		} 
	}

	totalPathLengths() {
		let pl = 0;
		for (let p in this.allPaths){
			pl += this.allPaths[p].length();
		}
		return pl;
	}

}

function loopCount(grid){
	let pb = new PathBuilder(grid);
	pb.buildAllStrands();
	pb.buildAllPaths();
	return pb.allPaths.length;
}

/**
* Below is a display type that uses the path calculation.
*/

class PrimaryDisplayData extends DisplayData {
	constructor(){
		super();
		this.lines = [];
		this.circles = [];
		this.crossing = null;
		this.center = [];
		this.rounded = true;
	}

	polyCalc(strandGroup){
		let x = strandGroup.point.x;
		let y = strandGroup.point.y;
		this.center.push(new Point(x, y-(1/4)));
		this.center.push(new Point(x+(1/4), y));
		this.center.push(new Point(x, y+(1/4)));
		this.center.push(new Point(x-(1/4), y));		
	}

	lineCalc(strandGroup){
		this.lines = [];
		let x = strandGroup.point.x;
		let y = strandGroup.point.y;
		let strand = strandGroup.getStrand(0,1);		
		let d = null;
		if (strand != null) {
			d = new Decorator(strand.index);
			if (!this.rounded){
				this.lines.push(new Line(new Point(x-(1/2), y-(1/2)),new Point(x+(1/2), y-(1/2))).setDecorator(d));
			} else {
				this.lines.push(new Line(new Point(x-(1/2), y-(1/2)),new Point(x, y-(1/3))).setDecorator(d));
				this.lines.push(new Line(new Point(x, y-(1/3)),new Point(x+(1/2), y-(1/2))).setDecorator(d));
				this.circles.push(new Point(x,y-(1/3)).setDecorator(d));
			}
			this.circles.push(new Point(x-(1/2),y-(1/2)).setDecorator(d));
			this.circles.push(new Point(x+(1/2),y-(1/2)).setDecorator(d));
		}
		
		strand = strandGroup.getStrand(0,2);
		if (strand != null) {
			d = new Decorator(strand.index);			
			this.lines.push(new Line(new Point(x-(1/2), y-(1/2)),new Point(x+(1/2), y+(1/2))).setDecorator(d));
			this.circles.push(new Point(x-(1/2),y-(1/2)).setDecorator(d));
			this.circles.push(new Point(x+(1/2),y+(1/2)).setDecorator(d));
			if (strandGroup.point.x % 2 == 0){
				this.crossing = new Line(new Point(x-(1/2), y-(1/2)),new Point(x+(1/2), y+(1/2)));
				this.crossing.setDecorator(d);
			}
		}
		
		strand = strandGroup.getStrand(1,3);
		if (strand != null) {
			d = new Decorator(strand.index);
			this.lines.push(new Line(new Point(x+(1/2), y-(1/2)),new Point(x-(1/2), y+(1/2))).setDecorator(d));
			this.circles.push(new Point(x+(1/2),y-(1/2)).setDecorator(d));
			this.circles.push(new Point(x-(1/2),y+(1/2)).setDecorator(d));
			if (strandGroup.point.x % 2 == 1){
				this.crossing = new Line(new Point(x+(1/2), y-(1/2)),new Point(x-(1/2), y+(1/2)));
				this.crossing.setDecorator(d);
			}
		}

		strand = strandGroup.getStrand(0,3);
		if (strand != null) {
			d = new Decorator(strand.index);
			if (!this.rounded){
				this.lines.push(new Line(new Point(x-(1/2), y-(1/2)),new Point(x-(1/2), y+(1/2))).setDecorator(d));
			} else {
				this.lines.push(new Line(new Point(x-(1/2), y-(1/2)),new Point(x-(1/3), y)).setDecorator(d));
				this.lines.push(new Line(new Point(x-(1/3), y), new Point(x-(1/2), y+(1/2))).setDecorator(d));
				this.circles.push(new Point(x-(1/3),y).setDecorator(d));
			}
			this.circles.push(new Point(x-(1/2),y-(1/2)).setDecorator(d));
			this.circles.push(new Point(x-(1/2),y+(1/2)).setDecorator(d));
		}

		strand = strandGroup.getStrand(1,2);
		if (strand != null) {
			d = new Decorator(strand.index);
			if (!this.rounded){
				this.lines.push(new Line(new Point(x+(1/2), y-(1/2)),new Point(x+(1/2), y+(1/2))).setDecorator(d));
			} else {
				this.lines.push(new Line(new Point(x+(1/2), y-(1/2)),new Point(x+(1/3), y)).setDecorator(d));
				this.lines.push(new Line(new Point(x+(1/3), y), new Point(x+(1/2), y+(1/2))).setDecorator(d));
				this.circles.push(new Point(x+(1/3),y).setDecorator(d));
			}
			this.circles.push(new Point(x+(1/2),y-(1/2)).setDecorator(d));
			this.circles.push(new Point(x+(1/2),y+(1/2)).setDecorator(d));
		}

		strand = strandGroup.getStrand(2,3);
		if (strand != null) {
			d = new Decorator(strand.index);
			if (!this.rounded){
				this.lines.push(new Line(new Point(x+(1/2), y+(1/2)),new Point(x-(1/2), y+(1/2))).setDecorator(d));
			} else {
				this.lines.push(new Line(new Point(x+(1/2), y+(1/2)),new Point(x, y+(1/3))).setDecorator(d));
				this.lines.push(new Line(new Point(x, y+(1/3)), new Point(x-(1/2), y+(1/2))).setDecorator(d));
				this.circles.push(new Point(x,y+(1/3)).setDecorator(d));
			}
			this.circles.push(new Point(x+(1/2),y+(1/2)).setDecorator(d));
			this.circles.push(new Point(x-(1/2),y+(1/2)).setDecorator(d));
		}

	}
}

class Decorator {
	constructor(i){
		this.index = i;
	}
	decorate(){
		//let colors = ['blue','red','pink','lightgreen','green'];
		let colors = ['#a2b9bc', '#b2ad7f','#878f99','#6b5b95','#d6cbd3','#eca1a6','#bdcebe','#82b74b','#405d27'];
		if (interactive.colorPallette != undefined){
			colors = interactive.colorPallette;
		} 
		return colors[this.index%colors.length];
	}
}

class PrimaryKnotDisplay extends BasicKnotDisplay {

	buildSVG(){
		this.edge = this.scale/2;
		this.lines();
	}

	newDisplayData(){
		return new PrimaryDisplayData();
	}

	buildStructure(){
		let pb = new PathBuilder(this.g);
		pb.buildAllStrands();
		pb.buildAllPaths();
		let v = pb.strandGroups.values()
		let val = v.next().value;
		while(val !== undefined) {
			let d = this.newDisplayData();
			d.lineCalc(val);
			d.polyCalc(val);
			this.displayData.push(d);	
			val = v.next().value;
		}	
				
	}

	lines(){
		for (let n in this.displayData){
			let node = this.displayData[n];
			for (let l in node.lines){
				let secLine = node.lines[l];		
				let line = new Bldr("line").att("x1",secLine.source.x*this.scale)
					.att("y1", secLine.source.y*this.scale)
					.att("x2", secLine.target.x*this.scale)
					.att("y2", secLine.target.y*this.scale)
					.att("stroke-linecap","butt");
				if (secLine.decorator != null){
					line.att("stroke-width",this.edge).att("stroke", secLine.decorator.decorate());
				} else {
					line.att("stroke-width",this.edge).att("stroke", this.backgroundColor);
				}
				this.svgBldr.elem(line);
			}
			for (let j in node.circles){
				let joint = node.circles[j];		
				let circle = new Bldr("circle").att("cx",joint.x*this.scale)
					.att("cy", joint.y*this.scale)
					.att("r", (this.edge/2)*(0.96));
				if (joint.decorator != null){
					circle.att("fill",joint.decorator.decorate()); 
				} else {
					circle.att("fill", this.backgroundColor);
					//.att("stroke-width",this.edge/3).att("stroke", this.backgroundColor);
				}
				this.svgBldr.elem(circle);
			}
			let xline = node.crossing;
			if (xline != null) {				
				let plist = "";
				for (let p in node.center){
					let point = node.center[p];
					plist += "" + (point.x*this.scale) + "," +(point.y*this.scale) +" ";
				}
				
				let crossing1 = new Bldr("polygon").att("points",plist);
				crossing1.att("stroke-width",this.edge/2).att("fill",this.foregroundColor).att("stroke", this.foregroundColor);	
				
				this.svgBldr.elem(crossing1);

				let crossing2 = new Bldr("line").att("x1",xline.source.x*this.scale)
					.att("y1", xline.source.y*this.scale)
					.att("x2", xline.target.x*this.scale)
					.att("y2", xline.target.y*this.scale)
					.att("stroke-linecap","butt");
				if (xline.decorator != null){
					let d = xline.decorator;
					crossing2.att("stroke-width",this.edge).att("fill", d.decorate()).att("stroke", d.decorate());
				} else {
					crossing2.att("stroke-width",this.edge/2).att("fill",this.foregroundColor).att("stroke", this.foregroundColor);	
				}
				this.svgBldr.elem(crossing2);
			}
		}
		return this;		
	}	
}

let pallettes = {
	'blues':['#011f4b','#03396c','#005b96','#6497b1','#b3cde0'],
	'gryffindor': ['#740001','#ae0001','#eeba30','#d3a625','#000000'],
	'greys':['#999999','#777777','#555555','#333333','#111111'],
	'pinks':['#ff00a9','#fb9f9f','#ff0065','#ffbfd3','#fb5858'],
	'metro':['#d11141','#00b159','#00aedb',	'#f37735','#ffc425'],
	'pastel':['#ffb3ba','#ffdfba','#ffffba','#baffc9','#bae1ff'],
	'ravenclaw': ['#0e1a40','#222f5b','#5d5d5d','#946b2d','#000000'],
	'slytherin':['#1a472a','#2a623d','#5d5d5d','#aaaaaa','#000000'],
	'hufflepuff':['#ecb939','#f0c75e','#726255','#372e29','#000000'],
	'neon' : ['#fe0000','#fdfe02','#0bff01','#011efe','#fe00f6'],
	'seafoam' :['#a3c1ad','#a0d6b4','#5f9ea0','#317873','#49796b']	
}

