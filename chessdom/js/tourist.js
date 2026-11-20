'use strict';
/*
* Tourist: the player builds a tour of the board by hand, one move at a time, starting
* from a random square. Options show how many moves are open from each square ("counts")
* and which moves follow Warnsdorff's rule ("hints"). Moves can be taken back.
*
* Tourist knows nothing about the page: after every change it fires the "gameChanged"
* event, and the display code (bottom of this file) draws it.
* Requires chess_base.js and tour.js.
*/

class Tourist {
	constructor(board, pieceType) {
		this.board = board;
		this.tour = new Tour(board, pieceType, board.randomStart());
		this.backtracks = 0;
		this.rejected = new Set();   // squares clicked since the last move that the piece can't reach
		this.showCounts = true;
		this.showHints = false;
	}

	// the square the piece is on
	current() {
		return this.tour.tail();
	}

	isDone() {
		return this.tour.isComplete();
	}

	// stuck before covering the board
	isBlocked() {
		return !this.isDone() && this.tour.freeDegree(this.current()) == 0;
	}

	// called when a square is clicked: move there if the piece can
	selectCell(cell) {
		if (this.tour.has(cell)) return;
		if (this.tour.neighbors(this.current()).includes(cell)) {
			this.tour.add(cell);
			this.rejected.clear();
		} else {
			this.rejected.add(cell);
		}
		evnts.fireEvent("gameChanged");
	}

	// take back the last move
	backtrack() {
		if (this.tour.cells.length < 2) return;
		this.tour.removeLast();
		this.backtracks++;
		this.rejected.clear();
		evnts.fireEvent("gameChanged");
	}

	setOptions(showCounts, showHints) {
		this.showCounts = showCounts;
		this.showHints = showHints;
		this.rejected.clear();
		evnts.fireEvent("gameChanged");
	}
}

/**
* display: these functions read a game and update the page
*/

// Each square shows the piece, a ring if it has been visited, a cross if it was clicked but
// can't be reached, or else how many moves are open from it. Moves the piece can make are
// light green, and the hinted ones dark green. When counts are off, the numbers are drawn
// in the square's own colour so they can't be seen.
function drawTourist(game) {
	let current = game.current();
	let moves = game.tour.freeNeighbors(current);
	let hinted = game.showHints ? game.tour.leastFreeNeighbors(current) : [];
	game.board.cells.flat().forEach(cell => {
		let div = getDiv(cell.rowNum, cell.colNum);
		if (cell === current) {
			div.innerHTML = gameGlyph(game.tour.pieceType);
		} else if (game.rejected.has(cell)) {
			div.innerHTML = iconGlyph("remove-circle");
		} else if (game.tour.has(cell)) {
			div.innerHTML = iconGlyph("ok-circle");
		} else {
			div.innerHTML = game.tour.freeDegree(cell);
		}
		let shade = boardShade(cell);
		let [background, colour] =
			hinted.includes(cell) ? ["darkgreen", game.showCounts ? "white" : "darkgreen"]
			: moves.includes(cell) ? ["#99ff99", game.showCounts ? "#004d00" : "#99ff99"]
			: cell === current ? [shade, "black"]
			: [shade, game.showCounts || game.tour.has(cell) ? (shade === "white" ? "grey" : "white") : shade];
		div.style.background = background;
		div.style.color = colour;
	});
}

// everything the Tourist page shows
function showTourist(game) {
	drawTourist(game);
	let status = game.isDone() ? "Finished!" : (game.isBlocked() ? "Blocked!" : "");
	byId("finish").innerHTML = status ? new Bldr("h2").att("align", "center").text(status).build() : "";
	byId("missteps").innerHTML = new Bldr("h3").att("align", "center").text("backtracks: " + game.backtracks).build();
	byId("mapDisplay").innerHTML = svgTourMap(game.tour.cells, game.board.rowNum, game.board.colNum);
}
