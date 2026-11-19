'use strict';
/*
* Domination keeps track of the pieces placed on a board and the squares they attack.
* It knows nothing about the page: after every change it fires the "gameChanged"
* event, and the display code (bottom of this file) draws the game from its state.
*/
class Domination {
	// pieceType: the kind of piece placed by clicking a square
	constructor(board, pieceType = "knight") {
		this.board = board;
		this.pieceType = pieceType;
		this.pieces =[];
		this.cover =[];  // every square attacked by at least one piece
	}

	getBoard() {
		return this.board;
	}

	startGame() {
		this.updateCover();
		evnts.fireEvent("gameChanged");
	}

	// called when a square is clicked: add a piece there, or remove the one that is there
	selectCell(cell) {
		let existing = this.pieceOn(cell);
		if (existing) {
			this.pieces = this.pieces.filter(piece => piece !== existing);
			cell.decoration = "";
		} else {
			let piece = new Piece(this.pieceType);
			piece.setCell(cell);
			this.pieces.push(piece);
		}
		this.updateCover();
		evnts.fireEvent("gameChanged");
	}

	updateCover(){
		this.cover = [];
		this.pieces.forEach(piece => {
			piece.neighbors().forEach(nbCell => {
				if (!this.cover.includes(nbCell)){
					this.cover.push(nbCell);
				}
			});
		});
	}

	// the piece on this cell, or undefined if it is empty
	pieceOn(cell) {
		return this.pieces.find(piece => piece.cell === cell);
	}

	// the cells that have a piece on them
	occupiedCells() {
		return this.pieces.map(piece => piece.cell);
	}

	// number of squares that are neither occupied nor attacked
	dominationScore() {
		let occupied = this.occupiedCells();
		return this.board.cells.flat().filter(cell =>
			!(this.cover.includes(cell) || occupied.includes(cell))).length;
	}

	// number of pieces that are attacked by another piece
	independenceScore() {
		return this.pieces.filter(piece => this.cover.includes(piece.cell)).length;
	}
};

/*
* A Puzzle is a Domination game with a goal, read from data/puzzles.json, e.g.
* {
*   "name": "5 queens on 5x5",
*   "size": 5,
*   "cover": true,     (every square must be attacked or occupied)
*   "unguard": true,   (no piece may attack another)
*   "pieces": [ { "name": "queen", "count": 5 } ]
* }
* For now every puzzle uses only one piece type.
*/
class Puzzle extends Domination {
	constructor(board, puzzledef) {
		super(board, puzzledef.pieces[0].name);
		this.puzzledef = puzzledef;
		this.number = puzzledef.pieces[0].count;
		this.type = puzzledef.pieces[0].name;
		this.size = puzzledef.size;
	}

	isSolved(){
		let rightCount = this.pieces.length === this.number;
		let dominated = !this.puzzledef.cover || this.dominationScore() === 0;
		let independent = !this.puzzledef.unguard || this.independenceScore() === 0;
		return rightCount && dominated && independent;
	}
};

/**
* display: these functions read a game and update the page
*/

// put a glyph on every occupied square and colour every attacked square green
function drawDominationBoard(game) {
	game.board.cells.flat().forEach(cell => {
		let i = cell.rowNum;
		let j = cell.colNum;
		let div = getDiv(i, j);
		let piece = game.pieceOn(cell);
		div.innerHTML = piece ? gameGlyph(piece.type) : emptyCell();
		div.setAttribute("style", "color:black");
		if (game.cover.includes(cell)) {
			div.style.background = "#99ff99";
		}
	});
}

// everything the Explorer and Puzzles pages show for a game
function showDomination(game) {
	drawDominationBoard(game);
	byId("mapDisplay").innerHTML = svgMap(game.occupiedCells(), game.cover, game.board.size);
	byId("scoreDisplay").innerHTML = scoreDisplay(game.pieces.length, game.dominationScore(), game.independenceScore());
}

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

function puzzleDescription(puzzle) {
	let d = "<div><h4> Your Puzzle: " + puzzle.puzzledef.name + "</h4>";
	d += "Place " + puzzle.number +" " + puzzle.type +"s";
	d += " on a " + puzzle.size + "x" + puzzle.size + " chessboard.";
	if(puzzle.puzzledef.cover){
		d+= " The board must be dominated.";
	}
	if(puzzle.puzzledef.unguard){
		d+= " The pieces must be independent.";
	}
	return d + "</div>";
}

function puzzleStatus(puzzle) {
	return puzzle.isSolved() ? "You solved the Puzzle!" : "Not solved yet...";
}

//utilities

function removeElement(array, e) {
	return array.filter(x => x !== e);
}

function randomRange(greaterThan, lessThan){
	let shifted = randomInt(lessThan - greaterThan + 1);
	return lessThan - shifted; 
};

function randomElement(array) {
	let res =randomRange(0, array.length-1);
	return array[res];
};