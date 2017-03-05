
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
		this.onValue = 1;
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

	addConwayLifeRules() {
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

	
	addHighLifeRules() {
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

	dayAndNightRules() {
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

	seedsRule() {
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

	fredkinRule() {
		this.cells.addRule(function (cell){
			if (cell.onEdge()) {cell.off();
				return;
			}
			var count = cell.neighborSum();
			if(count %2 == 0){
				cell.off();
			} else {
				cell.on();			
			}
		});
	}

	ulamRule() {
		this.cells.addRule(function (cell){
			if (cell.neighborLiveCount() == 1) {
				cell.on();
				cell.increment();
				return;
			}
			if (cell.value > 0) {
				cell.decrement();		
			}
		});
	}

	langtonRule() {	
		this.cells.addRule(function (cell){
			var val = cell.value;
			if (val < 2) return;
			var nextCell;
			
			if (val == 2 || val == 6){
				if (val == 2) { 
					cell.nextValue = 1;
				} else {
					cell.nextValue = 0;
				}
				nextCell = cell.north();
				if(nextCell != null){
					if (nextCell.value == 0) {
						nextCell.nextValue = 3;
					} else if (nextCell.value == 1){
						nextCell.nextValue = 9;
					} else if (nextCell.value < 6) {
						nextCell.nextValue = 9;;
					} else {
						nextCell.nextValue = 3;
					}
				}
			} else if (val == 3 || val == 7){				
				if (val == 3) { 
					cell.nextValue = 1;
				} else {
					cell.nextValue = 0;
				}
				nextCell = cell.east();
				if(nextCell != null){
					if (nextCell.value == 0) {
						nextCell.nextValue = 4;
					} else if (nextCell.value == 1){
						nextCell.nextValue = 6;
					} else if (nextCell.value < 6) {
						nextCell.nextValue = 6;
					} else {
						nextCell.nextValue = 4;
					}
				}
			} else if (val == 4 || val == 8){				
				if (val == 4) { 
					cell.nextValue = 1;
				} else {
					cell.nextValue = 0;
				}
				nextCell = cell.south();
				if(nextCell != null){
					if (nextCell.value == 0) {
						nextCell.nextValue = 5;
					} else if (nextCell.value == 1){
						nextCell.nextValue = 7;
					} else if (nextCell.value < 6) {
						nextCell.nextValue = 7;
					} else {
						nextCell.nextValue = 5;
					}
				}
			} else if (val == 5 || val == 9){				
				if (val == 5) { 
					cell.nextValue = 1;
				} else {
					cell.nextValue = 0;
				}
				nextCell = cell.west();
				if(nextCell != null){
					if (nextCell.value == 0) {
						nextCell.nextValue = 2;
					} else if (nextCell.value == 1){
						nextCell.nextValue = 8;
					} else if (nextCell.value < 6) {
						nextCell.nextValue = 8;
					} else {
						nextCell.nextValue = 2;
					}
				}
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
				this.cellqueue[i].nextValue = this.onValue;
			}
		}
		this.cellqueue = [];
	}

	
	forceFlushQueue() {
		for (var i = 0; i< this.cellqueue.length; i++) {
			var cell = this.cellqueue[i];
			if (cell != null) {
				this.cellqueue[i].onNow(this.onValue);
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

	pixel(i,j) {
		this.cellqueue.push(this.cells.cell(i,j));
	}

	center() {
		var cell = this.cells.cell((this.cells.rowNum -1)/2, (this.cells.colNum -1)/2);	
		this.cellqueue.push(cell);
	}

};



