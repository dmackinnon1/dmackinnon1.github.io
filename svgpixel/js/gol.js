
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
	}

	includeDiagonals(value) {
		this.cells.setIncludeDiagonals(value);
	}

	init() {
		this.cells.init();
		this.addUnderPopulationRule();
		this.addContinueToLiveRule();
		this.addOverPopulationRule();
		this.addReproductionRule();
	}
		
	clearRules() {
		this.cells.rules = [];
	}	

	addUnderPopulationRule() {
		this.cells.addRule(function (cell){
			if(cell.neighborSum()  < 2 ){
						cell.off();
			}
		});
	}	

	addContinueToLiveRule() {
		this.cells.addRule(function (cell){
			if(cell.neighborSum() === 2 && cell.value === 1 ){
						cell.on();
			}	
		});
	}

	addOverPopulationRule() {
		this.cells.addRule(function (cell){
			if(cell.neighborSum() > 3 ){
						cell.off();
			}	
		});
	}

	addReproductionRule() {
		this.cells.addRule(function (cell){
			if(cell.neighborSum() === 3 ){
						cell.on();
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

};





