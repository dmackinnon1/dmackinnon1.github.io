/**
* Classes in this file use the chess_base.js and solver.js scripts
* to generate path puzzles.
*
* There are kixote, hidato, and numbrix puzzles.
*
* The Generator utility can be used to explore how some path-coverings
* can lead to ambiguous puzzles.
*/

/**
* PathBuilder is the common superclass for the puzzle builders.
* The first step of building a puzzle is to generate a path through it.
* This is also used by the Generator utility.
*/
class PathBuilder {
	
	constructor() {
		this.board = new Board(8,8);
		this.board.init();
		this.path = new Path(this.board, this.board.randomStart());
	}

	isIncomplete(){
		return !this.path.isTour();
	}

	toString(){
		return "" + this.path + ": " + this.path.isTour(); 
	}
	
	getPath() {
		return this.path;
	}

	getBoard() {
		return this.board;
	}
	
	init () {
		this.path.initPath();	
		while (!this.path.isTour()) {
			this.path.initPath();
			if (this.path.isTour()) break;
			this.path = new Path(this.board, this.board.randomStart());
			this.path.initPath();
		}		
		this.path.decorateCells();
		this.hidePathElements();
	}
	//override
	hidePathElements() {
		//do nothing
	}

	start() {
		console.log("start() method called");	
	}
	
	getCell(i, j) {
		return this.board.cells[i][j];
	}
	
	clicked(i,j, target) {
		var cell = this.getCell(i,j);
		this.selectCell(cell, target);
	}
	
	selectCell(cell, target) {
		console.log(" cell selected: " + cell);
	}
	
};

/**
* A Puzzle is a 'path puzzle' - a hamiltonian path is generated for 
* the board, resulting in a numbering of all the cells. Some of the 
* numbers are hidden, and the puzzle is to figure out the values of 
* the hidden cells.
*
* Subclasses of Puzzle provide the rules for how the cells are connected,
* which determine what kind of 'tour' the path is.
*
*/
class Puzzle extends PathBuilder {

	constructor() {
		super();
		this.solution = [];
		this.wrong = [];
		this.misstep = 0;
	}

	start() {
		this.solution.push(this.path.head());
		var last = getDiv(this.solution[0].rowNum, this.solution[0].colNum);
		last.css("background"," #999966");	
		gameDisplay.statusMessage = "";
		gameDisplay.missteps = new Bldr("h3").att("align","center").text("missteps: 0").build();
		gameDisplay.map = svgMap(this.solution);
		evnts.fireEvent("refreshStatus");
		evnts.fireEvent("refreshSteps");
		evnts.fireEvent("refreshMap");
	}

	selectCell(cell, target) {

		var currentLevel = this.solution.length;
		var targetCell = this.path.cells[currentLevel];
		var i = parseInt(target.getAttribute("data-row"));
		var j = parseInt(target.getAttribute("data-col"));
		
		var parentTarget = target;
		if (target.localName === 'span') {
			parentTarget = target.parentNode;
		}	
		if (targetCell.isEqual(cell)){
		this.solution.push(cell);
		cell.showIt();
		parentTarget.innerHTML = cell.getDisplay();
		this.resetWrongs();
		this.updatePath();
		this.colourSolution();
		gameDisplay.map = svgMap(this.solution);
		if (this.getIsDone()){
			gameDisplay.statusMessage = new Bldr("h2").att("align","center").text("Finished!").build();
				evnts.fireEvent("refreshStatus");
		}
			evnts.fireEvent("refreshMap");
		} else {
			if (cell.hide && !this.isInWrong(cell)) {
				this.misstep ++;
				gameDisplay.missteps = new Bldr("h3").att("align","center").text("missteps: " + this.misstep).build();
				evnts.fireEvent("refreshSteps");				
				parentTarget.innerHTML= exGlyph(i,j);
				this.wrong.push(parentTarget);
			}
		}
	}
	
	getMissteps(){
		return this.missteps;	
	}
	
	getIsDone() {
		return this.solution.length == this.path.cells.length;
	}
	
	isInWrong(cell) {
		var ci = cell.rowNum;
		var cj = cell.colNum;
		for (var k = 0; k < this.wrong.length; k++) {
			var i = parseInt(this.wrong[k].getAttribute("data-row"));
			var j = parseInt(this.wrong[k].getAttribute("data-col"));
			if (ci === i && cj === j) return true;
		}		
		return false;
	}

	updatePath() {
		var sIndex = this.solution.length;
		for (var i = sIndex; i < this.path.cells.length; i++) {
				var nextCell = this.path.cells[i];
				if (!nextCell.hide) {
					this.solution.push(nextCell);
				} else {
					break;
				}
		}
	}

	colourSolution() {
			for (var i = 0; i < this.solution.length; i ++){
				var div = getDiv(this.solution[i].rowNum, this.solution[i].colNum);
				div.css("background","#e0e0d1");
			}
			var lastIndex = this.solution.length -1;
			if (lastIndex >= 0) {
				var last = getDiv(this.solution[lastIndex].rowNum, this.solution[lastIndex].colNum);
				last.css("background"," #999966");
			}
	}
	
	resetWrongs() {
		for (var k = 0; k < this.wrong.length; k++){
			var div = this.wrong[k];
			var i = parseInt(div.getAttribute("data-row"));
			var j = parseInt(div.getAttribute("data-col"));
			div.innerHTML = questionGlyph(i,j);
		}
		this.wrong = [];	
	}
};

/**
* Kixote is a path puzzle based off of the moves of a chess knight.
*/
class Kixote extends Puzzle {

	constructor() {
		super();
		CellType = "knight";
	}

	hidePathElements() {
		var last = 63;
		for (var i = 0; i < this.path.cells.length; i ++) {
			if (i%2 == 1) {
				this.path.cells[i].hideIt();
			}
			if (i%7 == 1) {
			this.path.cells[i].hideIt();
			}
		}
		this.path.cells[last].showIt();			
	}
}
/**
* Hidato is a path puzzle based on the moves of a chess king.
*/

class Hidato extends Puzzle {

	constructor() {
		super();
		CellType = "king";
	}

	hidePathElements() {
		var last = 63;
		for (var i = 0; i < this.path.cells.length; i ++) {
			if (i%2 == 1) {
				this.path.cells[i].hideIt();
			}
			if (i%11 == 1) {
				this.path.cells[i].hideIt();
			}
		}
		this.path.cells[last].showIt();			
	}
}

/**
* Numbrix is a path puzzle based on the moves of a bi-directional
* non-attacking pawn, or the 'von-Neumann neighborhood' of a cell.
*/
class Numbrix extends Puzzle {

	constructor() {
		super();
		CellType = "numbrix";
	}

	hidePathElements() {
		var last = 63;
		for (var i = 0; i < this.path.cells.length; i ++) {
			if (i%2 == 1) {
				this.path.cells[i].hideIt();
			}
			if (i%3 == 1) {
				this.path.cells[i].hideIt();
			}
			if (i%7 == 1) {
				this.path.cells[i].hideIt();
			}
			if (i%13 == 1) {
				this.path.cells[i].hideIt();
			}		
		}
		this.path.cells[last].showIt();			
	}

}

/**
* Generator is a PathBuilder that is used to explore how
* hiding path elements generates new solutions.
* Selected cells are toggled as hidden/shown, and with each click
* The path is checked for new solutions.
*/
class Generator extends PathBuilder {

	selectCell(cell, target) {
	
		var i = parseInt(target.getAttribute("data-row"));
		var j = parseInt(target.getAttribute("data-col"));
		var parentTarget = target;
		if (target.localName === 'span') {
			parentTarget = target.parentNode;
		}	

		if (cell.decoration == 1) return; // can't handle hiding first element now
		if (cell.hide) {
			cell.showIt();
			parentTarget.innerHTML= cell.decoration;
		} else {
			cell.hideIt();
			parentTarget.innerHTML= exGlyph(i,j);
		}

		var  solver = new Solver(this);
		solver.init();
		var solutions = solver.solve();

		gameDisplay.missteps = new Bldr("h3").att("align","center").text("new paths: " + (solutions.length-1)).build();
		evnts.fireEvent("refreshSteps");				
			

		gameDisplay.map = svgMap(this.path.cells);
		gameDisplay.map += "<br>";
		for (var i = 0; i< solutions.length; i++) {
			if (!solutions[i].isOriginal()){
				gameDisplay.map += "<span>  </span>";
				gameDisplay.map += svgMapSmall(solutions[i].solutionPath);
			}
		}
		evnts.fireEvent("refreshMap");
	}

	start() {
		gameDisplay.map = svgMap(this.path.cells);
		evnts.fireEvent("refreshMap");
		gameDisplay.missteps = new Bldr("h3").att("align","center").text("new paths: 0").build();
		evnts.fireEvent("refreshSteps");	
	}

};
