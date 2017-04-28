class Domination {	
	
	constructor(board) {
		this.board = board;
		board.init();
		this.pieces =[];
		this.cover =[];
	}

	getBoard() {
		return this.board;
	}

	startGame() {
		gameDisplay.map = svgMap(this.pieces, this.cover, this.board.size);
		gameDisplay.score = scoreDisplay(0,this.dominationScore(), this.independenceScore()); 	
		evnts.fireEvent("refreshMap");
		evnts.fireEvent("refreshScore");
	}

	colourCells(){
		for (var i = 0; i < this.board.rowNum; i++) {
			for (var j = 0; j < this.board.colNum; j++) {
				var div = getDiv(i, j);
				div.attr("style", "color:black");		
			}
		}
		this.cover = [];
		for (var k = 0; k < this.pieces.length; k++)  {
			var selected = this.pieces[k];
			var nbs = selected.neighbors();
			for (var l = 0; l < nbs.length; l++){
				var nbCell = nbs[l];
				var i = nbCell.rowNum;
				var j = nbCell.colNum;
				if (!this.isInSet(i,j,this.cover)){
						this.cover.push(nbCell);
						var div = getDiv(i, j);
						div.css("background","#99ff99");
				}
			}
		}

	}
	
	dominationScore() {
		var score = 0;
		for (var i = 0; i < this.board.rowNum; i++) {
			for (var j = 0; j < this.board.colNum; j++) {
				if (!(this.isInSet(i,j, this.cover) || this.isInSet(i,j,this.pieces))){
					score ++;
				}
			}
		}
		return score;	
	}

	independenceScore() {
		var score = 0;
		for(var k=0; k <this.pieces.length; k++) {
			var cell = this.pieces[k];
			if (this.isInSet(cell.rowNum, cell.colNum, this.cover)) {
				score ++;
			}
		}
		return score;
	}

	getCell(i, j) {
		return this.board.cells[i][j];
	}
	
	
	clicked(i,j, target) {
		var cell = this.getCell(i,j);
		this.selectCell(cell, target);
	}
	
	
	isInSet(i,j, set) {
		for (var k=0; k < set.length; k++) {
			var current = set[k];
			if (current.rowNum == i && current.colNum == j) return true;
		}
		return false;
	}
	
	remove(i,j) {
		var reduced = [];
		for (var k=0; k < this.pieces.length; k++) {
			var current = this.pieces[k];
			if (current.rowNum == i && current.colNum == j){
				continue;
			} else {
				reduced.push(current);
			}
		}
		this.pieces = reduced;
	}
	
	selectCell(cell, target) {
		var i = parseInt(target.getAttribute("data-row"));
		var j = parseInt(target.getAttribute("data-col"));
		var targetCell = this.board.cells[i][j];
		var parentTarget = target;
		if (target.localName === 'span' || target.localName ==='svg') {
			parentTarget = target.parentNode;
		}	
		if (this.isInSet(i, j, this.pieces)) {
			this.remove(i,j);
			targetCell.decoration = "";
			parentTarget.innerHTML = emptyCell(i,j);	
		} else {
			targetCell.decoration = gameType.type;
			this.pieces.push(targetCell);
			parentTarget.innerHTML = gameGlyph(i,j, targetCell.decoration);
		}
		this.colourCells();
		gameDisplay.map = svgMap(this.pieces, this.cover, this.board.size);
		evnts.fireEvent("refreshMap");
		gameDisplay.score = scoreDisplay(this.pieces.length, this.dominationScore(), this.independenceScore()); 
		evnts.fireEvent("refreshScore");
	}
			
};

function scoreDisplay(pieces, domination, independence) {
	console.log("domination score: " + domination);
	console.log("independence score: " + independence);		
	var html = new Bldr("h4").att("align","center");
	html.text("" + pieces + " pieces have been placed.")
	html.elem(new Bldr("br"));
	if (domination == 0) {
		html.text("Board is dominated.");
		html.elem(new Bldr("br"));
	} else {
		html.text("Board not dominated (remaining squares: " + domination + ").");
		html.elem(new Bldr("br"));
	}
	if (independence == 0) {
		html.text("Set is independent.");
	} else {
		html.text("Set is not independent (" + independence + " overlaps).");
	}
	return html.build();
}
