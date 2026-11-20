'use strict';
/*
* Tours: paths over the board made by one kind of piece, landing on every square once.
* Used by the tour puzzles (Kixote, Hidato, Numbrix), the Tourist and Joust games,
* and the Tour Generator.
*
* A tour belongs to a piece type ("knight", "king", "wazir", ... -- see MOVES in chess_base.js),
* so the same board can be toured by different pieces. Tours never write to cells:
* a square's number is just its position in the tour.
*
* Requires chess_base.js and bldrs.js.
*/

class Tour {
	// a tour of board by pieceType, optionally starting on start
	constructor(board, pieceType, start = null) {
		this.board = board;
		this.pieceType = pieceType;
		this.cells = [];
		this.visited = new Set();  // the same cells as this.cells, for quick lookups
		if (start != null) this.add(start);
	}

	add(cell){
		this.cells.push(cell);
		this.visited.add(cell);
	}

	// take back the last step (returns the cell that was removed)
	removeLast(){
		let cell = this.cells.pop();
		this.visited.delete(cell);
		return cell;
	}

	has(cell){
		return this.visited.has(cell);
	}

	head(){
		return this.cells[0];
	}

	tail(){
		return this.cells[this.cells.length - 1];
	}

	// true when the tour has landed on every square
	isComplete(){
		return this.cells.length === this.board.cellCount();
	}

	// a square's number in the tour (1 for the first square), or 0 if the tour hasn't been there
	numberOf(cell){
		return this.cells.indexOf(cell) + 1;
	}

	// the squares this tour's piece can move to from cell
	neighbors(cell){
		return attackedCells(cell, this.pieceType);
	}

	// ... of those, the ones the tour hasn't visited yet
	freeNeighbors(cell){
		return this.neighbors(cell).filter(next => !this.has(next));
	}

	// how many unvisited squares the piece could move to from cell
	freeDegree(cell){
		return this.freeNeighbors(cell).length;
	}

	// Warnsdorff's rule: of the unvisited squares reachable from cell, the ones with the
	// fewest onward moves (going to the hardest-to-reach squares first avoids dead ends)
	leastFreeNeighbors(cell){
		let free = this.freeNeighbors(cell);
		if (free.length == 0) return [];
		let least = Math.min(...free.map(next => this.freeDegree(next)));
		return free.filter(next => this.freeDegree(next) === least);
	}
}

// follow Warnsdorff's rule from start, breaking ties at random, until the piece gets stuck
// or the board is covered. The result is not always a complete tour.
function warnsdorffTour(board, pieceType, start) {
	let tour = new Tour(board, pieceType, start);
	while (!tour.isComplete()) {
		let choices = tour.leastFreeNeighbors(tour.tail());
		if (choices.length == 0) break;
		tour.add(choices[randomInt(choices.length)]);
	}
	return tour;
}

// a complete tour of board by pieceType: up to triesPerStart Warnsdorff tours from each
// random starting square, trying new starting squares until one works.
// Returns null if no tour is found (some pieces can't tour a board at all: a bishop never
// leaves the squares of its own colour).
function generateTour(board, pieceType, triesPerStart = 20, starts = 50) {
	for (let s = 0; s < starts; s++) {
		let start = board.randomStart();
		for (let t = 0; t < triesPerStart; t++) {
			let tour = warnsdorffTour(board, pieceType, start);
			if (tour.isComplete()) return tour;
		}
	}
	return null;
}

/*
* Puzzles from tours: the squares of a tour are numbered, some numbers are hidden,
* and the player has to work out the hidden ones. "hidden" is a Set of cells.
*/

// every way to fill in the hidden squares so the numbers still form a path of the tour's piece.
// Each solution is { cells: the path, mismatches: the positions where it differs from the tour }.
// The first square must be shown. Stops early once limit solutions are found.
function findSolutions(tour, hidden, limit = Infinity) {
	let n = tour.cells.length;
	let path = [tour.cells[0]];
	let used = new Set(path);
	let solutions = [];

	// try to fill position index onwards; returns true once enough solutions are found
	function extend(index) {
		if (index === n) {
			let mismatches = range(n).filter(k => path[k] !== tour.cells[k]);
			solutions.push({ cells: [...path], mismatches: mismatches });
			return solutions.length >= limit;
		}
		let previous = path[index - 1];
		let shown = tour.cells[index];
		// a shown number has to be where it is: just check the piece can get there
		let options = !hidden.has(shown)
			? tour.neighbors(previous).filter(cell => cell === shown)
			: tour.neighbors(previous).filter(cell => hidden.has(cell) && !used.has(cell));
		// try the options last-first, the order the original solver used, so
		// solutions come out in the same order (makeUnique depends on that order)
		for (let k = options.length - 1; k >= 0; k--) {
			let cell = options[k];
			path.push(cell);
			used.add(cell);
			let done = extend(index + 1);
			path.pop();
			used.delete(cell);
			if (done) return true;
		}
		return false;
	}

	extend(1);
	return solutions;
}

// reveal hidden squares until the puzzle has only one solution: each time, look at the
// first solution that differs from the tour, and reveal the first square where it differs.
// Changes hidden, and returns the squares it revealed.
function makeUnique(tour, hidden) {
	let revealed = [];
	// two solutions are enough to know the puzzle isn't unique, and to pick the next square
	let solutions = findSolutions(tour, hidden, 2);
	while (solutions.length > 1) {
		let other = solutions.find(solution => solution.mismatches.length > 0);
		let cell = tour.cells[other.mismatches[0]];
		hidden.delete(cell);
		revealed.push(cell);
		solutions = findSolutions(tour, hidden, 2);
	}
	return revealed;
}

/**
* display
*/

// the plain colour of a square in the Tourist and Joust games: alternating white and light grey
function boardShade(cell) {
	return cell.rowNum % 2 != cell.colNum % 2 ? "white" : "lightgrey";
}

// a picture of a path: the board, a line through the squares in order, a ring on the
// first square and a dot on the last. cellSize is the width of a square in pixels;
// display "inline-block" lets several small maps sit side by side.
function svgTourMap(cells, rows = 8, columns = rows, cellSize = 30, display = "block") {
	let half = cellSize / 2;
	let svg = new Bldr("svg");
	svg.att("align", "center").att("width", columns * cellSize).att("height", rows * cellSize);
	svg.att("style", "display:" + display);
	// the board
	range(columns).forEach(i => range(rows).forEach(j => {
		if ((i + j) % 2 == 0){
			let rect = new Bldr("rect").att("x", i * cellSize).att("y", j * cellSize);
			rect.att("width", "" + cellSize).att("height", "" + cellSize).att("fill", "#ccccb3");
			svg.elem(rect);
		}
	}));
	let x = cell => half + cell.colNum * cellSize;
	let y = cell => half + cell.rowNum * cellSize;
	// the path
	cells.slice(1).forEach((cell, k) => {
		let previous = cells[k];
		let line = new Bldr("line").att("x1", x(previous)).att("y1", y(previous)).att("x2", x(cell)).att("y2", y(cell));
		line.att("stroke", "black").att("stroke-width", 2);
		svg.elem(line);
	});
	// the dots, with a ring on the first square and a filled dot on the last
	cells.forEach((cell, k) => {
		let circle = new Bldr("circle").att("cx", x(cell)).att("cy", y(cell));
		circle.att("r", 3).att("stroke", "black").att("stroke-width", 1).att("fill", "grey");
		svg.elem(circle);
		if (k === 0){
			let ring = new Bldr("circle").att("cx", x(cell)).att("cy", y(cell));
			ring.att("r", 6).att("stroke", "black").att("stroke-width", 1).att("fill", "none");
			svg.elem(ring);
		} else if (k === cells.length - 1) {
			let end = new Bldr("circle").att("cx", x(cell)).att("cy", y(cell));
			end.att("r", 5).att("stroke", "black").att("stroke-width", 1).att("fill", "black");
			svg.elem(end);
		}
	});
	return svg.build();
}
