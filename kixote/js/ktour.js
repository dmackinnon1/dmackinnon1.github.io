//references common framework from kixote_base.js

/*
* Tourist is the implementation for the 'knighttourist' game, using the base classes and functions defined
* in chess_base.js.
*  
*/
class Tourist {
	
	constructor() {
		this.board = new Board(8,8);
		this.board.init();
		this.path = new Path(this.board, this.board.randomStart());
		this.wrong = [];
		this.backtracks = 0;
	}

	toString(){
		return "" + this.path + ": " + this.path.isTour(); 
	}
	
	getBoard() {
		return this.board;
	}

	init () {
		this.path.add(this.path.start);
		this.decorateCells();
	}

	decorateCells() {
		var current = this.path.tail();		
		for (var i = 0; i < this.board.rowNum; i++) {
			for (var j = 0; j < this.board.colNum; j++) {
				var cell = this.board.cells[i][j];
				cell.decoration = this.path.freeDegree(cell);				
			}
		}		
	}

	startGame() {
		var i = this.path.tail().rowNum;
		var j = this.path.tail().colNum;
		var last = getDiv(i, j);
		last.html(knightGlyph(i,j));
		this.colourCells();
		gameDisplay.statusMessage = "";
		gameDisplay.backtracks = new Bldr("h3").att("align","center").text("backtracks: " + 0).build();
		gameDisplay.map = svgMap(this.path.cells);
		evnts.fireEvent("refreshStatus");
		evnts.fireEvent("refreshSteps");
		evnts.fireEvent("refreshMap");
	}

	colourCells(){
		var current = this.path.tail();	
		for (var i = 0; i < this.board.rowNum; i++) {
			for (var j = 0; j < this.board.colNum; j++) {
				var cell = this.board.cells[i][j];
				var div = getDiv(i, j);
				cell.decoration = this.path.freeDegree(cell);
				if (!cell.isEqual(current)) {
					if (this.path.contains(cell)) {
						div.html(checkGlyph(i,j));
					} else {
						div.html(cell.decoration);
					}
				}
				if (cell.isNeighbor(current) && !this.path.contains(cell)){
					div.css("color","#004d00");
					div.css("background","#99ff99");					
				} else if (cell.isEqual(current)) {
					div.attr("style", "color:black");
				} else {				
					div.attr("style", "color:grey");
				}	
			}
		}

	}
	
	getCell(i, j) {
		return this.board.cells[i][j];
	}
	
	
	clicked(i,j, target) {
		var cell = this.getCell(i,j);
		this.selectCell(cell, target);
	}
	
	backtrack() {
		if (this.path.cells.length <2) {
			console.log("no further backtracking allowed");
			return;
		}
		var last = this.path.cells.pop();
		var lastDiv = getDiv(last.rowNum,last.colNum);
		lastDiv.html(last.decoration);	
	
		var current = this.path.tail();
		var currentDiv = getDiv(current.rowNum,current.colNum);
		currentDiv.html(knightGlyph(current.rowNum,current.colNum));
		this.backtracks ++;	
		
		this.colourCells();
		gameDisplay.map = svgMap(this.path.cells);
		evnts.fireEvent("refreshMap");

		gameDisplay.statusMessage = ""; 
		evnts.fireEvent("refreshStatus");

		gameDisplay.backtracks = new Bldr("h3").att("align","center").text("backtracks: " + this.backtracks).build();
		evnts.fireEvent("refreshSteps");
				
	}

	selectCell(cell, target) {
		var i = parseInt(target.getAttribute("data-row"));
		var j = parseInt(target.getAttribute("data-col"));
		var targetCell = this.board.cells[i][j];
		var parentTarget = target;
		if (target.localName === 'span') {
			parentTarget = target.parentNode;
		}	
		if (this.path.contains(targetCell)) {
			return;
		}
		var currentCell = this.path.tail();
		var currentDiv = getDiv(currentCell.rowNum,currentCell.colNum);
		
		if (!currentCell.isNeighbor(targetCell)){
			parentTarget.innerHTML= exGlyph(i,j);
			return;
		}
		
		this.path.add(targetCell);
		
		parentTarget.innerHTML = knightGlyph(i,j);
		this.colourCells();
		gameDisplay.map = svgMap(this.path.cells);
		evnts.fireEvent("refreshMap");
	
		if (this.getIsDone()){
				gameDisplay.statusMessage = new Bldr("h2").att("align","center").text("Finished!").build();
				evnts.fireEvent("refreshStatus");
				return;
		}

		if (this.path.freeDegree(targetCell) == 0) {
				gameDisplay.statusMessage = new Bldr("h2").att("align","center").text("Blocked!").build();
				evnts.fireEvent("refreshStatus");
		}
	
	}
	
	getIsDone() {
		return this.path.cells.length === 8*8;
	}			
		
};

