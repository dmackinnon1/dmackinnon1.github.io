'use strict';
/*
* Path puzzles: a tour of the board is numbered square by square, some of the numbers are
* hidden, and the player retraces the tour by clicking the squares in order.
*   Kixote - a knight's tour
*   Hidato - a king's tour
*   Numbrix - a wazir's tour (one square up, down, left or right)
*
* Making a puzzle: generate a tour, hide squares by the puzzle type's rule, then reveal
* squares until there is only one way to fill in the rest (makeUnique, in tour.js).
*
* PathPuzzle knows nothing about the page: after every change it fires the "gameChanged"
* event, and the display code (bottom of this file) draws the puzzle.
* Requires chess_base.js and tour.js.
*/

class PathPuzzle {
	constructor(board, pieceType) {
		this.board = board;
		this.tour = generateTour(board, pieceType);
		this.hidden = new Set(this.squaresToHide());
		makeUnique(this.tour, this.hidden);
		this.found = 1;            // how many squares the player has traced (square 1 is given)
		this.wrong = new Set();    // hidden squares clicked out of turn since the last correct click
		this.missteps = 0;
	}

	// which squares to hide before making the puzzle unique -- each puzzle type has its own rule
	squaresToHide() {
		return [];
	}

	// the square the player has to find next
	next() {
		return this.tour.cells[this.found];
	}

	isDone() {
		return this.found === this.tour.cells.length;
	}

	// a square whose number hasn't been revealed yet
	isStillHidden(cell) {
		return this.hidden.has(cell) && this.tour.numberOf(cell) > this.found;
	}

	// the squares traced so far, in order
	traced() {
		return this.tour.cells.slice(0, this.found);
	}

	// called when a square is clicked
	selectCell(cell) {
		if (this.isDone()) return;
		if (cell === this.next()) {
			this.found++;
			this.wrong.clear();
			// numbers that were showing anyway are traced automatically, up to the next hidden one
			while (!this.isDone() && !this.hidden.has(this.next())) {
				this.found++;
			}
		} else if (this.isStillHidden(cell) && !this.wrong.has(cell)) {
			this.missteps++;
			this.wrong.add(cell);
		}
		evnts.fireEvent("gameChanged");
	}
}

// the squares of the tour whose position (0 = the first square) matches rule, except the last square
const positionsWhere = (tour, rule) =>
	tour.cells.filter((cell, i) => rule(i) && i !== tour.cells.length - 1);

// a knight's tour, with every second number hidden and a few more besides
class Kixote extends PathPuzzle {
	constructor(board) { super(board, "knight"); }
	squaresToHide() {
		return positionsWhere(this.tour, i => i % 2 == 1 || i % 7 == 1);
	}
}

// a king's tour, with every second number hidden and a few more besides
class Hidato extends PathPuzzle {
	constructor(board) { super(board, "king"); }
	squaresToHide() {
		return positionsWhere(this.tour, i => i % 2 == 1 || i % 11 == 1);
	}
}

// a wazir's tour: every second number hidden, plus the whole edge of the board and a block
// in the middle (the first and last numbers always show). The block assumes an 8x8 board.
class Numbrix extends PathPuzzle {
	constructor(board) { super(board, "wazir"); }
	squaresToHide() {
		let last = this.board.rowNum - 1;
		let onEdge = cell => cell.rowNum == 0 || cell.colNum == 0 || cell.rowNum == last || cell.colNum == last;
		let inMiddle = cell => cell.rowNum > 2 && cell.colNum > 2 && cell.rowNum < 6 && cell.colNum < 6;
		let hide = new Set(this.tour.cells.filter((cell, i) => i % 2 == 1));
		this.board.cells.flat().filter(cell => onEdge(cell) || inMiddle(cell)).forEach(cell => hide.add(cell));
		hide.delete(this.tour.head());
		hide.delete(this.tour.tail());
		return [...hide];
	}
}

/**
* display: these functions read a puzzle and update the page
*/

// traced squares are shaded (the latest one darker); hidden squares show a question mark,
// or a cross if they were clicked out of turn
function drawPathPuzzle(game) {
	let traced = game.traced();
	let latest = traced[traced.length - 1];
	game.board.cells.flat().forEach(cell => {
		let div = getDiv(cell.rowNum, cell.colNum);
		if (game.wrong.has(cell)) {
			div.innerHTML = iconGlyph("remove-circle");
		} else if (game.isStillHidden(cell)) {
			div.innerHTML = iconGlyph("question-sign");
		} else {
			div.innerHTML = game.tour.numberOf(cell);
		}
		div.style.background = cell === latest ? "#999966" : (traced.includes(cell) ? "#e0e0d1" : "");
	});
}

// everything a path puzzle page shows
function showPathPuzzle(game) {
	drawPathPuzzle(game);
	byId("missteps").innerHTML = new Bldr("h3").att("align", "center").text("missteps: " + game.missteps).build();
	byId("finish").innerHTML = game.isDone() ? new Bldr("h2").att("align", "center").text("Finished!").build() : "";
	byId("mapDisplay").innerHTML = svgTourMap(game.traced(), game.board.rowNum, game.board.colNum);
}
