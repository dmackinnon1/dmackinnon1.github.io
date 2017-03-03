
<!-- the game of life rules -->

class GameOfLife {

	constructor(height, width, row, col) {
		this.generation = 0;
		this.row = row;
		this.col = col;
		this.display = new SVGPixel(height, width, row, col);
		this.cells = new CellArray(this.display);
		this.cellqueue = [];
		this.cells.colorRange = 1;
		this.display.useCircles = false;
		this.cells.setIncludeDiagonals(true);
	}

	includeDiagonals(value) {
		this.cells.setIncludeDiagonals(value);
	}

	init() {
		this.cells.init();
	}
	
	clearRules() {
		this.cells.rules = [];
	}

	addConwayLifeRules(){
		this.cells.addRule(function (cell){
			var count = cell.neighborSum();
			if(cell.value === 1 ){
				if (count == 2 || count ==3) {
					cell.on();
				} else {
					cell.off();
				}
			} else {
				if (count == 3 ) {
					cell.on();
				} else {
					cell.off();
				}
			}	
		});
	}	

	
	addHighLifeRules(){
		this.cells.addRule(function (cell){
			var count = cell.neighborSum();
			if(cell.value === 1 ){
				if (count == 2 || count == 3) {
					cell.on();
				} else {
					cell.off();
				}
			} else {
				if (count == 3 || count == 6) {
					cell.on();
				} else {
					cell.off();
				}
			}	
		});
	}

	dayAndNightRules(){
		this.cells.addRule(function (cell){
			var count = cell.neighborSum();
			if(cell.value === 1 ){
				if (count == 3 || count == 4|| count > 5) {
					cell.on();
				} else {
					cell.off();
				}
			} else {
				if (count == 3 || count > 5 ) {
					cell.on();
				} else {
					cell.off();
				}
			}	
		});
	}

	seedsRule(){
	this.cells.addRule(function (cell){
			var count = cell.neighborSum();
			if(cell.value === 0 ){
				if (count == 2 ) {
					cell.on();
				} else {
					cell.off();
				}
			} else {
				cell.off();
			}	
		});	
	}

	doIt() {
		this.generation ++;
		this.cells.applyRules();
		this.flushQueue();
		this.cells.transition();
	}

	svg() {
		return this.display.svg();
	}

	flushQueue() {
		for (var i = 0; i< this.cellqueue.length; i++) {
			var cell = this.cellqueue[i];
			if (cell != null) {
				this.cellqueue[i].on();
			}
		}
		this.cellqueue = [];
	}
	
	// some beasties
	rPentomino(i,j) {
		this.cellqueue.push(this.cells.cell(i,j));
		this.cellqueue.push(this.cells.cell(i,j+1));
		this.cellqueue.push(this.cells.cell(i+1,j));
		this.cellqueue.push(this.cells.cell(i+2,j));
		this.cellqueue.push(this.cells.cell(i+1,j-1));		
	}

	glider(i,j) {
		this.cellqueue.push(this.cells.cell(i,j));
		this.cellqueue.push(this.cells.cell(i,j+1));
		this.cellqueue.push(this.cells.cell(i,j+2));
		this.cellqueue.push(this.cells.cell(i-1,j+2));
		this.cellqueue.push(this.cells.cell(i-2,j+1));		
	}

	toad(i,j) {
		this.cellqueue.push(this.cells.cell(i,j));
		this.cellqueue.push(this.cells.cell(i,j+1));
		this.cellqueue.push(this.cells.cell(i,j+2));
		this.cellqueue.push(this.cells.cell(i+1,j+1));
		this.cellqueue.push(this.cells.cell(i+1,j+2));	
		this.cellqueue.push(this.cells.cell(i+1,j+3));		
		
	}

	square(i,j) {		
		var nbs = this.cells.cell(i,j).neighbors();
		for (var k = 0; k < nbs.length; k++) {
			this.cellqueue.push(nbs[k]);	
		}		
	}

	fullSquare(i,j) {		
		this.square(i,j);
		this.square(i+2,j+2);
		this.square(i-2,j-2);
	}


	highReplicator(i,j) {
		this.cellqueue.push(this.cells.cell(i+1,j+1));
		this.cellqueue.push(this.cells.cell(i-1,j-1));
		
		this.cellqueue.push(this.cells.cell(i+2,j));
		this.cellqueue.push(this.cells.cell(i-2,j));
		this.cellqueue.push(this.cells.cell(i,j-2));
		this.cellqueue.push(this.cells.cell(i,j+2));
		
		this.cellqueue.push(this.cells.cell(i+2,j-2));
		this.cellqueue.push(this.cells.cell(i-2,j+2));
		
		this.cellqueue.push(this.cells.cell(i+2,j-1));
		this.cellqueue.push(this.cells.cell(i-2,j+1));
		
		this.cellqueue.push(this.cells.cell(i-1,j+2));
		this.cellqueue.push(this.cells.cell(i+1,j-2));
	}


	highReplicator(i,j) {
		this.cellqueue.push(this.cells.cell(i+1,j));
		this.cellqueue.push(this.cells.cell(i+2,j));
		this.cellqueue.push(this.cells.cell(i+3,j));
		
		this.cellqueue.push(this.cells.cell(i,j+1));
		this.cellqueue.push(this.cells.cell(i,j+2));
		this.cellqueue.push(this.cells.cell(i,j+3));
	}

	explodingPants(i,j) {
		this.cellqueue.push(this.cells.cell(i,j+1));
		this.cellqueue.push(this.cells.cell(i+1,j+1));
		this.cellqueue.push(this.cells.cell(i-1,j+1));
		
		this.cellqueue.push(this.cells.cell(i,j-1));
		this.cellqueue.push(this.cells.cell(i-1,j-1));
		this.cellqueue.push(this.cells.cell(i+1,j-1));

		this.cellqueue.push(this.cells.cell(i-1,j));
	}

};



