
<!-- the sandpile rules -->

class Sandpile {

	constructor(height, width, row, col) {
		this.generation = 0;
		this.row = row;
		this.col = col;
		this.display = new SVGPixel(height, width, row, col);
		this.cells = new CellArray(this.display);
	}

	init() {
		this.cells.init();

	}
		
	clearRules() {
		this.cells.rules = [];
	}	

	addMainRule() {
		this.cells.addRule(function (cell){
			if(cell.value >= cell.maxNeighbors()) {		
				var nbs = cell.neighbors();
				for (var i = 0; i < nbs.length; i++) {		
					nbs[i].increment();
					cell.decrement();			
				}
			}
		});
	}	

	addCenterRule() {
		this.cells.addRule(function (cell){
			if (cell.rowNum == (cell.maxRows()-1)/2 && cell.colNum == (cell.maxCols()-1)/2){
				cell.increment();	
			}	
		});
	}


	addCornerRule() {
		this.cells.addRule(function (cell){
			if ((cell.rowNum == 1 || cell.rowNum == cell.maxRows()-2) && (cell.colNum == 1 || cell.colNum == cell.maxCols() -2)){
				cell.increment();
			//cell.increment(); //pour into corners twice as fast
			}
		});
	}

	addOffCenterRule() {
		this.cells.addRule(function (cell){
			if ((cell.rowNum == ((cell.maxRows()-1)/2 - 10)) && cell.colNum == (cell.maxCols()-1)/2){
				cell.increment();	
			} else if (cell.rowNum == ((cell.maxRows()-1)/2 + 10) && cell.colNum == (cell.maxCols()-1)/2){
				cell.increment();	
			} else if (cell.rowNum == ((cell.maxRows()-1)/2) && cell.colNum == (cell.maxCols()-1)/2 - 10){
				cell.increment();	
			} else if (cell.rowNum == ((cell.maxRows()-1)/2) && cell.colNum == (cell.maxCols()-1)/2 + 10){
				cell.increment();	
			}
		});
	}

	addOverEdgesRule() {
		this.cells.addRule(function (cell){
			if (cell.value < cell.maxNeighbors()) return;
			var edgeCount = cell.maxNeighbors() - cell.neighbors().length;
			for (var i = 0; i < edgeCount; i++) {
				cell.decrement();
			}
		});
	}

	doIt() {
		this.generation ++;
		this.cells.applyRules();
		this.cells.transition();
	}

	svg() {
		return this.display.svg();
	}


};





