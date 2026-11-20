'use strict';
/*
* The Tour Generator: shows a tour with every square numbered. Clicking a square hides
* (or shows again) its number, and the page lists every other path of the same piece
* that fits the numbers still showing -- the ways a puzzle made from this tour would be
* ambiguous.
*
* TourGenerator knows nothing about the page: after every change it fires the
* "gameChanged" event, and the display code (bottom of this file) draws it.
* Requires chess_base.js and tour.js.
*/

// stop looking after this many solutions: with some pieces (like "any", which can move
// anywhere) hiding a handful of squares allows millions of paths
const SOLUTION_LIMIT = 1000;

class TourGenerator {
	constructor(board, pieceType) {
		this.board = board;
		this.pieceType = pieceType;
		this.tour = generateTour(board, pieceType);  // null if this piece can't tour the board
		this.hidden = new Set();
		this.alternatives = [];   // the other paths that fit the numbers still showing
		this.tooMany = false;     // true when there were more than SOLUTION_LIMIT
	}

	// called when a square is clicked: hide its number, or show it again
	selectCell(cell) {
		if (this.tour == null || cell === this.tour.head()) return;  // square 1 always stays shown
		if (this.hidden.has(cell)) {
			this.hidden.delete(cell);
		} else {
			this.hidden.add(cell);
		}
		let solutions = findSolutions(this.tour, this.hidden, SOLUTION_LIMIT + 1);
		this.tooMany = solutions.length > SOLUTION_LIMIT;
		this.alternatives = solutions.filter(solution => solution.mismatches.length > 0).slice(0, SOLUTION_LIMIT);
		evnts.fireEvent("gameChanged");
	}
}

/**
* display: these functions read a generator and update the page
*/

// the most small maps to draw: past this, drawing them all would make the page very slow
const MAPS_SHOWN = 100;

// each square shows its number, or a crossed circle if it's hidden
function drawGeneratorBoard(game) {
	game.board.cells.flat().forEach(cell => {
		getDiv(cell.rowNum, cell.colNum).innerHTML =
			game.hidden.has(cell) ? iconGlyph("remove-circle") : game.tour.numberOf(cell);
	});
}

// everything the Tour Generator page shows
function showGenerator(game) {
	if (game.tour == null) {
		byId("pathCount").innerHTML = "<h3 align='center'>This piece can't tour the board.</h3>";
		byId("mapDisplay").innerHTML = "";
		return;
	}
	drawGeneratorBoard(game);
	let count = game.tooMany ? "more than " + SOLUTION_LIMIT : "" + game.alternatives.length;
	byId("pathCount").innerHTML = new Bldr("h3").att("align", "center").text("new paths: " + count).build();

	let rows = game.board.rowNum, columns = game.board.colNum;
	let small = game.alternatives.slice(0, MAPS_SHOWN)
		.map(solution => "<span>  </span>" + svgTourMap(solution.cells, rows, columns, 20, "inline-block"));
	let more = game.alternatives.length > MAPS_SHOWN ? "<p>(showing the first " + MAPS_SHOWN + ")</p>" : "";
	byId("mapDisplay").innerHTML = svgTourMap(game.tour.cells, rows, columns) + "<br>" + small.join("") + more;
}
