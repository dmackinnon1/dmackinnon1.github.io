'use strict';
/*
* Domination class keeps track of chess board domination and independence.
*/
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
		for (let i = 0; i < this.board.rowNum; i++) {
			for (let j = 0; j < this.board.colNum; j++) {
				let div = getDiv(i, j);
				div.attr("style", "color:black");		
			}
		}
		this.cover = [];
		for (let k = 0; k < this.pieces.length; k++)  {
			let selected = this.pieces[k];
			let nbs = selected.neighbors();
			for (let l = 0; l < nbs.length; l++){
				let nbCell = nbs[l];
				let i = nbCell.rowNum;
				let j = nbCell.colNum;
				if (!this.isInSet(i,j,this.cover)){
						this.cover.push(nbCell);
						let div = getDiv(i, j);
						div.css("background","#99ff99");
				}
			}
		}

	}
	
	dominationScore() {
		let score = 0;
		for (let i = 0; i < this.board.rowNum; i++) {
			for (let j = 0; j < this.board.colNum; j++) {
				if (!(this.isInSet(i,j, this.cover) || this.isInSet(i,j,this.pieces))){
					score ++;
				}
			}
		}
		return score;	
	}

	independenceScore() {
		let score = 0;
		for(let k=0; k <this.pieces.length; k++) {
			let cell = this.pieces[k];
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
		let cell = this.getCell(i,j);
		this.selectCell(cell, target);
	}
	
	
	isInSet(i,j, set) {
		for (let k=0; k < set.length; k++) {
			let current = set[k];
			if (current.rowNum == i && current.colNum == j) return true;
		}
		return false;
	}
	
	remove(i,j) {
		let reduced = [];
		for (let k=0; k < this.pieces.length; k++) {
			let current = this.pieces[k];
			if (current.rowNum == i && current.colNum == j){
				continue;
			} else {
				reduced.push(current);
			}
		}
		this.pieces = reduced;
	}
	
	selectCell(cell, target) {
		let i = parseInt(target.getAttribute("data-row"));
		let j = parseInt(target.getAttribute("data-col"));
		let targetCell = this.board.cells[i][j];
		let parentTarget = target;
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

/*
{
  "name": "5 queens on 5x5",
  "size": 5,
  "cover": "true",
  "unguard": "true",
  "pieces": [
    {
      "name": "queen",
      "count": 5
    }
  ]
}
In this first version of mathematical chess puzzles,
we are assume only one piece type
*/

class Puzzle extends Domination {
	constructor(board, puzzledef) {
		super(board);
		this.puzzledef = puzzledef;
		this.number = parseInt(puzzledef.pieces[0].count)
		this.type = puzzledef.pieces[0].name
		this.size = puzzledef.size;
		this.resetStatus();
	}

	selectCell(cell, target){
		super.selectCell(cell, target);
		this.resetStatus();
		evnts.fireEvent("refreshScore");
	}

	resetStatus(){
		if (this.isSolved()){
			gameDisplay.status = "You solved the Puzzle!";
		} else {
			gameDisplay.status = "Not solved yet...";		
		}			
	}

	isSolved(){
		let solvedCover = false;
		let solvedUnguard = false;
		let solvedPieceCount = false;

		if (this.pieces.length === this.number){
			solvedPieceCount = true;
		}
		if(this.puzzledef.cover === 'true'){
			if (this.dominationScore() === 0){
				solvedCover = true;
			} else {
				solvedCover = false;
			} 
		} else {
			solvedCover = true;
		}
		if (this.puzzledef.unguard === 'true'){
			if (this.independenceScore() === 0){
				solvedUnguard = true;
			} else {
				solvedUnguard = false;
			}
		} else {
			solvedUnguard = true;
		}
		return solvedPieceCount && solvedUnguard && solvedCover;
	}

	puzzleDescription() {
		let d = "<div><h4> Your Puzzle: " + this.puzzledef.name + "</h4>";
		d += "Place " + this.number +" " + this.type +"s";
		d += " on a " + this.size + "x" + this.size + " chessboard.";
		if(this.puzzledef.cover === 'true'){
			d+= " The board must be dominated.";
		}
		if(this.puzzledef.unguard === 'true'){
			d+= " The pieces must be independent. </div>";
		}
		return d;
	}

};

function scoreDisplay(pieces, domination, independence) {
	let html = new Bldr("h4").att("align","center");
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

//utilities

function randomInt(lessThan){
	return Math.floor(Math.random()*lessThan);
};

function removeElement(array, e) {
	let newArray = [];
	let x;
	for (x in array) {
		if (e !== array[x]) {
			newArray.push(array[x]);
		}
	}
	return newArray;
}

function randomRange(greaterThan, lessThan){
	let shifted = randomInt(lessThan - greaterThan + 1);
	return lessThan - shifted; 
};

function randomElement(array) {
	let res =randomRange(0, array.length-1);
	return array[res];
};