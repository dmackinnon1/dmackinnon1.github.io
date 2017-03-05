
var displayCount = 0;
var svgPixel = {};
svgPixel.cellFunctions = [];

/*
* SVGPixel is a grid of pixels.
*/
class SVGPixel {

	constructor(height, width, rows, cols) {
		this.height = height;
		this.width = width;
		this.rows = rows;
		this.cols = cols;
		this.count = displayCount ++;
		this.clickFunctions = [];
		this.useCircles = true;
	}


	svg() {
		var radius = Math.min(this.height/this.rows, this.width/this.cols)/2;
		var svg = new Bldr("svg");
		svg.att("align", "center").att("width", this.width).att("height", this.height);
		for (var i = 0; i < this.rows; i ++) {
			for (var j = 0; j < this.cols; j ++) {
				var x = radius*(2*j+1);
				var y = radius*(2*i+1);				
				var c0; 
				if (this.useCircles) {
					c0 = new Bldr("circle").att("cx",x).att("cy", y);
					c0.att("r",radius).att("stroke-width",0).att("fill","none");
				} else {
					c0 = new Bldr("rect").att("x", x - radius).att("y",y - radius);
					c0.att("width", radius*2).att("height", radius*2).att("fill", "none"); 	
				}
				c0.att("onclick", "elementClick(event)");	
				c0.att("id", this.count + "pixel_"+i+"_"+j);
				c0.att("data-row", i);
				c0.att("data-col", j);
				c0.att("data-count", this.count);				
				svg.elem(c0);
			}
		}
		return svg.build();	
	}

	element(i,j) {
		return $("#"+this.count + "pixel_"+i+"_"+j);
	}
	
	on(i,j) {
		this.element(i,j).attr("fill", "black");
	}

	off(i,j) {
		this.element(i,j).attr("fill", "white");
	}

	value(i,j, value) {
		this.element(i,j).attr("fill", value);
	}	
	
};

function elementClick(event) {
	var i = parseInt(event.target.getAttribute("data-row"));
	var j = parseInt(event.target.getAttribute("data-col"));	
	var d = parseInt(event.target.getAttribute("data-count"));	
	for (var k =0; k < svgPixel.cellFunctions.length; k++) {
		svgPixel.cellFunctions[k](i,j);
	}
};

/*
* A cell for finite automata.
*/
class Cell {
		
	constructor(rowNum, colNum, cellArray) {
		this.rowNum = rowNum;
		this.colNum = colNum;
		this.value = 0;
		this.nextValue = 0;
		this.cellArray = cellArray;
		this.pixel= null;
	}

	maxRows() {
		return this.cellArray.getRowSize();
	}

	maxCols() {
		return this.cellArray.getColumnSize();
	}

	maxNeighbors() {
		if (this.cellArray.includeDiagonals) return 8;
		return 4;
	}

	on() {
		this.nextValue = 1;
	}
	
	onNow(n) {
		if (n == null) 	this.nextValue = 1;
		else  this.nextValue = n;
		this.transition();
	}

	off(){
		this.nextValue = 0;
	}

	increment() {
		this.nextValue ++;
	}

	decrementBy(amount) {
		this.nextValue -= amount;
	}
	
	decrement() {
		if (this.nextValue > 0) {
			this.nextValue --;
		}
	}

	transition() {
		this.value = this.nextValue;
		this.cellArray.update(this);
	}	

	neighbor(i,j) {
		if ((this.rowNum + i < this.cellArray.getRowSize())
			&&(this.rowNum + i >= 0)
			&&(this.colNum + j < this.cellArray.getColumnSize())
			&&(this.colNum + j >= 0)){
			return this.cellArray.cells[this.rowNum + i][this.colNum + j];
		}
		return null;
	}

	onEdge() {
		if (this.rowNum == 0 || this.colNum ==0) return true;
		if (this.rowNum == this.cellArray.getRowSize()-1 || this.colNum == this.cellArray.getColumnSize() -1) return true;
		return false;
	}

	north(){
		return this.neighbor(1,0);
	}
	
	south(){
		return this.neighbor(-1,0);
	}
	
	east(){
		return this.neighbor(0,1);		
	}
	
	west(){
		return this.neighbor(0,-1);
	}
	
	northEast(){
		return this.neighbor(1,1);
	}
	
	northWest(){
		return this.neighbor(1,-1);
	}
	
	southEast(){
		return this.neighbor(-1,1)
	}
	
	southWest(){
		return this.neighbor(-1,-1);
	}
	
	neighborSum() {
		var sum = 0;
		var list = this.neighbors();
		for (var i=0; i< list.length; i++) {
			sum += list[i].value;
		}
		return sum;
	}

	neighborLiveCount(){
		var count = 0;
		var list = this.neighbors();
		for (var i=0; i< list.length; i++) {
			if(list[i].value > 0) {
				count ++;
			}
		}
		return count;
	}

	neighbors(){
		var list = [];
		if(this.north() != null) list.push(this.north());
		if(this.south() != null) list.push(this.south());
		if(this.east() != null) list.push(this.east());
		if(this.west() != null) list.push(this.west());
		
		if (this.cellArray.includeDiagonals) {
			if(this.northEast() != null) list.push(this.northEast());
			if(this.northWest() != null) list.push(this.northWest());
			if(this.southEast() != null) list.push(this.southEast());
			if(this.southWest() != null) list.push(this.southWest());				
		}
		return list;
	}

	degree(){
		return this.neighbors().length;
	}

	neighborValue(){
		var nbv = 0;
		var nbs = this.neighbors();
		for (var i = 0; i < nbs.length; i++) {
			nbv += nbs[i].value;
		}
		return nbv;
	}	

};

class CellArray {

	constructor(svgPixel) {
		this.includeDiagonals = true;
		this.rowNum = svgPixel.rows;
		this.colNum = svgPixel.cols;
		this.cells = [];
		this.svgPixel = svgPixel;
		this.rules = [];
		this.colorRange = 8;
	}

	setIncludeDiagonals(value) {
		this.includeDiagonals = value;
	}

	addRule(rule){
		this.rules.push(rule);
	}

	on(i,j){
		if (i > this.rowNum -1 || j > this.colNum -1) {
			return;
		}
		this.cells[i][j].on();
	}

	cell(i,j) {
		if (i > this.rowNum -1 || j > this.colNum -1) {
			return;
		}
		return this.cells[i][j];
	}

	reset() {
		for (var i = 0; i < this.rowNum; i++) {
			for (var j = 0; j < this.colNum; j++) {		
				this.cells[i][j].value = 0;
				this.cells[i][j].nextValue = 0;	
			}
		}
	}

	applyRules() {		
		for (var r = 0; r < this.rules.length; r++) {
			for (var i = 0; i < this.rowNum; i++) {
				for (var j = 0; j < this.colNum; j++) {		
					this.rules[r](this.cells[i][j]);
				}
			}
		}
	}

	transition() {
		for(var i = 0; i < this.rowNum; i++) {
			for (var j = 0; j < this.colNum; j++) {
				this.cells[i][j].transition();
			}
		}
	}
	
	update(cell) {
		cell.pixel.attr("fill", hslColorChooser(cell.value,this.colorRange));
		
	}

	init() {
		for (var i = 0; i < this.rowNum; i ++) {
			this.cells[i] = [];
			for (var j = 0; j < this.colNum; j ++){
				var cell = new Cell(i, j, this);
				this.cells[i].push (cell);
				cell.pixel = this.svgPixel.element(cell.rowNum, cell.colNum);
			}
		}
	}
	
	toString () {
		var result = "";
		for (var i = 0; i < this.rowNum; i ++){
			result += this.cells[i];
		}
		return result;
	}
	
	getRowSize() {
		return this.rowNum;
	}
	
	getColumnSize(){
		return this.colNum;
	}
	
	getSize() {
		return this.colNum * this.rowNum;
	}
};

function hslColorChooser(level, max) {
	var l = (100 - Math.floor(level/max * 100)) + "%";
	return "hsl(250, 50%, " + l +")";
};