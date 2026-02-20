//references common framework from kixote_base.js

/*
* Joust is an implementation of pooping knights
*  
*/
class Joust {
	
	constructor(size = 8, secondary = 0) {
		if (secondary == 0){
			secondary = size;
		}
		this.board = new Board(size,secondary);
		this.board.init();
		this.path = new Path(this.board, this.board.randomStart());
		this.antipath = new Path(this.board, this.board.randomStart());
		this.totalpath = new Path(this.board, null);

		this.size = size;
		this.secondary = secondary;
		this.labels = false;
		this.hints = false;
		this.adversaryBlocked=false;
		this.playerBlocked=false;
		this.smartAdversary = true;
	}

	toString(){
		return "" + this.path + ": " + this.path.isTour(); 
	}
	
	getBoard() {
		return this.board;
	}

	init () {
		this.path.add(this.path.start);
		this.antipath.add(this.antipath.start);
		this.totalpath.add(this.path.start);
		this.totalpath.add(this.antipath.start);
	}


	startGame() {
		var i = this.path.tail().rowNum;
		var j = this.path.tail().colNum;
		var last = getDiv(i, j);
		last.html(cellTypeGlyph(i,j));

		var ai = this.antipath.tail().rowNum;
		var aj = this.antipath.tail().colNum;
		var alast = getDiv(ai, aj);
		alast.html(antiGlyph(ai,aj));

		
		this.colourCells();
		gameDisplay.statusMessage = "";
		//gameDisplay.backtracks = new Bldr("h3").att("align","center").text("backtracks: " + 0).build();
		//gameDisplay.map = svgMap(this.path.cells, this.size, this.secondary);
		evnts.fireEvent("refreshStatus");
		evnts.fireEvent("refreshSteps");
		//evnts.fireEvent("refreshMap");
	}
	

	colourCells(){

		this.updateCellDegrees();
		this.updateColours();
	}

	updateCellDegrees(){
		var current = this.path.tail();	
		for (var i = 0; i < this.board.rowNum; i++) {
			for (var j = 0; j < this.board.colNum; j++) {
				var cell = this.board.cells[i][j];		
				cell.decoration = this.totalpath.freeDegree(cell);	
			}
		}	
	}

	updateColours(){
		var current = this.path.tail();
		var anticurrent = this.antipath.tail();
		for (var i = 0; i < this.board.rowNum; i++) {
			for (var j = 0; j < this.board.colNum; j++) {
				var cell = this.board.cells[i][j];
				var div = getDiv(i, j);

				if (!cell.isEqual(current) && !cell.isEqual(anticurrent)) {
					if (this.path.contains(cell)) {
						div.html(circleGlyph(i,j));
					} else {
						//div.html(cell.decoration);
					}
				}
				if (this.antipath.contains(cell)) {
					div.html(exGlyph(i, j));
				}
				if (cell.isEqual(anticurrent)) {
					div.html(antiGlyph(i, j));
				}

				if (cell.isNeighbor(current) && !this.totalpath.contains(cell)){
					if (this.labels) {
						div.css("color","#004d00");
					} else {
						div.css("color","#99ff99" )
					}
					div.css("background","#99ff99");					
				} else if (cell.isEqual(current) || cell.isEqual(anticurrent)) {
					if (i%2 != j%2){
						div.css("color", "black");
						div.css("background","white");
					} else {
						div.css("color", "black");
						div.css("background","lightgrey");
					}
				} else {
					if (i%2 != j%2){
						if (this.labels || this.totalpath.contains(cell)) {
							div.css("color", "grey");
						} else {
							div.css("color", "white");
						}
						div.css("background","white");
					} else {
						if (this.labels || this.path.contains(cell)|| this.antipath.contains(cell)) {
							div.css("color", "white");
						} else {
							div.css("color", "lightgrey");
						}
						div.css("background","lightgrey");
					}
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

	selectCell(cell, target) {
		var i = parseInt(target.getAttribute("data-row"));
		var j = parseInt(target.getAttribute("data-col"));
		var targetCell = this.board.cells[i][j];
		var parentTarget = target;
		if (target.localName === 'span') {
			parentTarget = target.parentNode;
		}	
		if (this.path.contains(targetCell)||this.antipath.contains(targetCell)) {
			return;
		}
		var currentCell = this.path.tail();
		var currentDiv = getDiv(currentCell.rowNum,currentCell.colNum);
		
		if (!currentCell.isNeighbor(targetCell)){
			console.log("cell is not a neighbour");
			//parentTarget.innerHTML= exGlyph(i,j);
			return;
		}
		//success
		this.path.add(targetCell);
		this.totalpath.add(targetCell);
		
		parentTarget.innerHTML = cellTypeGlyph(i,j);
		this.adversaryMove();
		this.colourCells();
		//gameDisplay.map = svgMap(this.path.cells, this.size, this.secondary);
		//evnts.fireEvent("refreshMap");
	
		if (this.getIsDone()){
				var message = "";
				if(this.adversaryBlocked){
					message = "Adversary Blocked!";
				} else if (this.playerBlocked){
					message = "Adversary Blocked!";
				} else {
					message = "Finished!";
				}
				
				gameDisplay.statusMessage = new Bldr("h2").att("align","center").text(message).build();
				evnts.fireEvent("refreshStatus");
				return;
		}

		if (this.totalpath.freeDegree(targetCell) == 0) {
				gameDisplay.statusMessage = new Bldr("h2").att("align","center").text("Blocked!").build();
				this.playerBlocked = true;
				evnts.fireEvent("refreshStatus");
		}

	
	}

	/**
	* The algorithm for the adversary to win is that they always pick the most free cell.
	* This is the opposite of the tour strategy, where you pick the least free cell.
	*/

	isAdversaryFirstChoice(cell){
		(this.smartAdversary 
			&& cell.isMaxNeighborOffPath(cell, this.totalpath) 
			&& !this.totalpath.contains(cell)) ||
		(!this.smartAdversary 
			&& cell.isMaxNeighborOffPath(cell, this.totalpath) 
			&& !this.totalpath.contains(cell));	
	}
	
	adversaryMove() {
		console.log("adversary move")
		var currentCell = this.antipath.tail();
		var currentDiv = getDiv(currentCell.rowNum,currentCell.colNum);
		console.log("adversary move")

		if (this.totalpath.freeDegree(currentCell)==0) {
			gameDisplay.statusMessage = new Bldr("h2").att("align","center").text("Adversary Blocked!").build();
			this.adversaryBlocked = true;
			evnts.fireEvent("refreshStatus");
			return;
		}
		var best = null;
		var secondbest = null;
		for (var i = 0; i < this.board.rowNum; i++) {
			for (var j = 0; j < this.board.colNum; j++) {
				var cell = this.board.cells[i][j];
				if (this.isAdversaryFirstChoice(cell)){
					best = cell;
				} else if (cell.isNeighbor(currentCell) && !this.totalpath.contains(cell)){
					secondbest = cell;
				}
			}
		}
		console.log("best: " + best);
		console.log("secondbest: " + secondbest);
		var selected = null;
		if (best !== null) {
			selected = best;
		} else if (secondbest !== null) {
			selected = secondbest;
		}
		if (selected !== null) {
			this.antipath.add(selected);
			this.totalpath.add(selected);
			var ai = this.antipath.tail().rowNum;
			var aj = this.antipath.tail().colNum;
			var alast = getDiv(ai, aj);
			alast.html(antiGlyph(ai,aj));
		}

	}
	
	getIsDone() {
		
		var covered = this.antipath.cells.length === this.size*this.secondary;
		return covered || this.adversaryBlocked || this.playerBlocked;
	}
};

function antiGlyph(i,j){
	var glyph = "<span class='glyphicon glyphicon-user' ";
	glyph += " data-row='"+ i + "' data-col='" + j + "'>";
	return glyph;
}
