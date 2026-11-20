'use strict';

// one-square steps: up, down, right, left, then the four diagonals
const ORTHOGONAL_STEPS = [[1,0], [-1,0], [0,1], [0,-1]];
const KING_STEPS = [...ORTHOGONAL_STEPS, [1,1], [1,-1], [-1,1], [-1,-1]];
const KNIGHT_STEPS = [[-1,2], [-2,1], [-1,-2], [-2,-1], [1,2], [2,1], [1,-2], [2,-1]];

/*
* How each piece type moves: piece type -> function from a cell to the cells
* a piece of that type standing there attacks (on an otherwise empty board).
* Rooks, bishops and queens see all the way to the edge; capture.js checks
* separately whether another piece is in the way.
*/
const MOVES = {
	king:   cell => cell.steps(KING_STEPS),
	knight: cell => cell.steps(KNIGHT_STEPS),
	// two pieces used only by the tour puzzles (tour.js):
	// a wazir (its fairy chess name) steps one square up, down, left or right -- Numbrix puzzles follow it
	wazir:  cell => cell.steps(ORTHOGONAL_STEPS),
	// "any" can move to every other square, for exploring tours with no movement rule at all
	any:    cell => cell.board.cells.flat().filter(other => other !== cell),
	rook:   cell => [...cell.column(), ...cell.row()],
	bishop: cell => [...cell.upDiagonal(), ...cell.downDiagonal()],
	queen:  cell => [...MOVES.rook(cell), ...MOVES.bishop(cell)],
};

function attackedCells(cell, type) {
	let rule = MOVES[type];
	return rule ? rule(cell) : [];
}

class Cell {
		
	constructor(rowNum, colNum, board) {
		this.rowNum = rowNum;
		this.colNum = colNum;
		this.board = board;
		this.decoration = "";
	}
	
	
	// the cell i rows and j columns away, or null if that is off the board
	neighbor(i,j) {
		if ((this.rowNum + i < this.board.getRowSize())
			&&(this.rowNum + i >= 0)
			&&(this.colNum + j < this.board.getColumnSize())
			&&(this.colNum + j >= 0)){
			return this.board.cells[this.rowNum + i][this.colNum + j];
		}
		return null;
	}

	// the cells reached by each (i, j) step that stays on the board
	steps(offsets){
		return offsets.map(([i, j]) => this.neighbor(i, j)).filter(cell => cell != null);
	}

	// every other cell in this cell's row
	row(){
		return this.board.cells[this.rowNum].filter(c => c.colNum !== this.colNum);
	}

	// every other cell in this cell's column
	column(){
		return this.board.cells.map(r => r[this.colNum]).filter(c => c.rowNum !== this.rowNum);
	}

	// cells from here to the edge of the board, stepping (di, dj) each time
	// (a while loop is still the clearest way to walk until we fall off the board)
	ray(di, dj){
		let cells = [];
		let next = this.neighbor(di, dj);
		while (next != null) {
			cells.push(next);
			next = next.neighbor(di, dj);
		}
		return cells;
	}

	downDiagonal(){
		return [...this.ray(1, 1), ...this.ray(-1, -1)];
	}

	upDiagonal(){
		return [...this.ray(-1, 1), ...this.ray(1, -1)];
	}

	// the four cells directly up, down, right and left (used to grow Safe Harbour regions)
	neumannNeighbors(){
		return this.steps(ORTHOGONAL_STEPS);
	}

	toString() {
		return "Cell [" + this.rowNum + "][" + this.colNum +"]: " + this.decoration;
	}

	position(){
		return "(" +this.rowNum + "," + this.colNum + ")";
	}
};

class Board {

	// a board is ready to use as soon as it is created: no separate init() step.
	// Boards are square unless a number of columns is given (the tour pages allow e.g. 5x6).
	constructor(size, columns = size) {
		this.size = size;
		this.rowNum = size;
		this.colNum = columns;
		this.cells = Array.from({length: this.rowNum}, (_, i) =>
			Array.from({length: this.colNum}, (_, j) => new Cell(i, j, this)));
	}
	getCell(i, j) {
		return this.cells[i][j];
	}

	randomStart() {
		let i = randomInt(this.rowNum);
		let j = randomInt(this.colNum);
		return this.cells[i][j];
	}
	
	getRowSize() {
		return this.rowNum;
	}
	getColumnSize(){
		return this.colNum;
	}

	// the number of squares on the board
	cellCount(){
		return this.rowNum * this.colNum;
	}
};

/*
* A piece of one type ("king", "knight", "rook", "bishop" or "queen") standing on a cell.
* Placing a piece writes its type into the cell's decoration, which marks the cell
* as occupied and tells the display which glyph to draw.
* CapturePiece (capture.js) extends this; the other games use it as is.
*/
class Piece {
	constructor(type) {
		this.type = type;
		this.cell = null;
	}

	setCell(cell){
		this.cell = cell;
		this.cell.decoration = this.type;
	}

	getCell(){
		return this.cell;
	}

	// the cells this piece attacks
	neighbors(){
		return attackedCells(this.cell, this.type);
	}

	toString(){
		return "" + this.type + " at " + this.cell;
	}
};


/**
* display 
*/

function htmlForBoard(board) {
	let rows = board.cells.map((row, i) => {
		let tds = row.map((c, j) =>
			"<td><div id='" + cellId(i, j) + "' class='gameCell' onclick='cellClick(event)'"
			+ " data-row='"+ i + "' data-col='" + j + "'>"
			+ emptyCell() + "</div></td>");
		return "<tr>" + tds.join("") + "</tr>";
	});
	return "<table border = 1 cellspacing = 1 cellpadding = 1 align='center'>" + rows.join("") + "</table>";
};

// an empty square: a blank svg the same size as a piece glyph
function emptyCell(){
	let empty = new Bldr("svg").att("width","28").att("height","28");
	empty.att("stroke-width",0);
	return empty.build();
};

// the id of a square's div, e.g. "cell-3-10" (the dashes keep row 1, column 10 apart from row 11, column 0)
function cellId(i, j){
	return "cell-" + i + "-" + j;
}

/*
* The game currently on the page. Each page sets this when it creates a game;
* every game class has a selectCell(cell) method that is called when a square is clicked.
*/
let game = null;

// onclick handler for every square (set up in htmlForBoard).
// event.currentTarget is the square's div, the element the handler is attached to;
// event.target may be the glyph or svg inside it.
function cellClick(event) {
	let i = parseInt(event.currentTarget.getAttribute("data-row"));
	let j = parseInt(event.currentTarget.getAttribute("data-col"));
	game.selectCell(game.board.getCell(i, j));
};

// small helpers for working with the page (plain DOM, no libraries)

// the element with this id
function byId(id) {
	return document.getElementById(id);
}

// call handler(event) whenever any element matching the CSS selector is clicked
function onClick(selector, handler) {
	document.querySelectorAll(selector).forEach(element => element.addEventListener("click", handler));
}

// show Bootstrap buttons as the highlighted choice (btn-primary) or as inactive (btn-secondary)
function setButtonActive(selector, active) {
	document.querySelectorAll(selector).forEach(button => {
		button.classList.toggle("btn-primary", active);
		button.classList.toggle("btn-secondary", !active);
	});
}

// highlight the button with this id, and show the rest of its group (e.g. ".typeButton") as unselected
function selectButton(groupSelector, id) {
	setButtonActive(groupSelector, false);
	setButtonActive("#" + id, true);
}

// the div for the square at row i, column j
function getDiv(i,j) {
	return byId(cellId(i, j));
};
	


/**
 * utilities
 */
function randomInt(lessThan){
	var selection = Math.floor(Math.random()*(lessThan));
	return selection;
};

// [0, 1, ..., n-1] -- handy for looping a fixed number of times with forEach
function range(n){
	return [...Array(n).keys()];
};

function svgMap(pieces, cover, size) {
	let svg = new Bldr("svg");
	let boardSize = 30*size;
	svg.att("align", "center").att("width",boardSize).att("height",boardSize);
	let cellSize = boardSize/size;
	//first the board: shade the squares where i and j are both even or both odd
	range(size).forEach(i => range(size).forEach(j => {
		if ((i + j) % 2 == 0){
			let rect = new Bldr("rect").att("x", i*cellSize).att("y", j*cellSize);
			rect.att("width", cellSize).att("height",cellSize).att("fill", "#ccccb3");
			svg.elem(rect);
		}
	}));

	//finally, the dots
	let dot = (cell, radius, fill) => {
		let circle = new Bldr("circle").att("cx", 15 + cell.colNum*cellSize).att("cy", 15 + cell.rowNum*cellSize);
		circle.att("r", radius).att("stroke", "black").att("stroke-width",1).att("fill", fill);
		svg.elem(circle);
	};
	pieces.forEach(cell => {
		dot(cell, 3, "grey");
		dot(cell, 6, "black");
	});
	cover.forEach(cell => dot(cell, 3, "grey"));

	return svg.build();
};

// Bootstrap glyphicon name for each piece type
const GLYPHS = {
	knight: "knight",
	king:   "king",
	rook:   "tower",
	bishop: "bishop",
	queen:  "queen",
};

// a Bootstrap icon by name, e.g. iconGlyph("remove-circle")
function iconGlyph(name) {
	return "<span class='glyphicon glyphicon-" + name + "'></span>";
}

// the icon for a piece type
function gameGlyph(type) {
	return iconGlyph(GLYPHS[type] ?? "square-empty");
}
