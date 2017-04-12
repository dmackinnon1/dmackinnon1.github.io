
gameType.isKixote = function() {
	return gameType.type === "kixote";
}
gameType.isNumbrix = function() {
	return gameType.type === "numbrix";
}
gameType.isHidato = function() {
	return gameType.type === "hidato";
}
gameType.difficulty = 3;


//this is the Kixote and Hidato game.
class Game {
	
	constructor(board) {
		this.board = board;
		board.init();
		this.path = new Path(this.board, this.board.randomStart());
		this.solution = [];
		this.wrong = [];
		this.misstep = 0;
	}

	toString(){
		return "" + this.path + ": " + this.path.isTour(); 
	}
	
	isIncomplete(){
		return !this.path.isTour();
	}

	getPath() {
		return this.path;
	}

	getBoard() {
		return this.board;
	}
	
	init () {
		var difficulty = gameType.difficulty;
		this.path.initPath();	
		while (!this.path.isTour()) {c
			this.path.initPath();
			if (path.isTour()) break;
			this.path = new Path(board, board.randomStart());
			this.path.initPath();
		}		
		this.path.decorateCells(difficulty);
	}

	startGame() {
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
	
	getCell(i, j) {
		return this.board.cells[i][j];
	}
	
	clicked(i,j, target) {
		var cell = this.getCell(i,j);
		this.selectCell(cell, target);
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


//the game instance
var gameBoard = new Board(8,8);
gameBoard.init();
var game = null;

