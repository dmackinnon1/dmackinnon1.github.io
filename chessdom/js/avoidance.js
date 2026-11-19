'use strict';

/*
* Safe Harbour: the board is split into coloured regions, and the player must place
* one piece in each region so that no piece can capture another.
*
* How a puzzle is made: IndependentSet places pieces at random so that none attack
* each other; PuzzleDescriptor records where they are (this is the solution);
* RegionCalculator grows a region around each of those squares until the board is
* covered; AvoidancePuzzle is the game the player interacts with.
*
* AvoidancePuzzle knows nothing about the page: after every change it fires the
* "gameChanged" event, and the display code (bottom of this file) draws it.
* Safe Harbour pieces need nothing beyond what Piece (chess_base.js) already does.
*/

class PuzzleDescriptorPosition {
	constructor(i,j){
		this.row = i;
		this.col = j;
	}
	toString(){
		return "("+this.row + ", " + this.col + ")";
	}
}

class PuzzleDescriptor {
	constructor(type){
		this.type = type;
		this.cells = [];
	}

	addCell(i,j){
		this.cells.push(new PuzzleDescriptorPosition(i,j));
	}
}

class IndependentSet {
	constructor(type, size){
		this.type = type;
		this.board = new Board(size);
		this.available = this.board.cells.flat();
		this.pieces = [];
		this.buildSet();
	}

	addToSet(){

		//place a random piece;
		let index = Math.floor(Math.random() * this.available.length);
		let cell = this.available[index];

		let piece = new Piece(this.type);
		piece.setCell(cell);
		this.pieces.push(piece);

		//remove the cell, and every cell the new piece attacks, from available
		let nbs = piece.neighbors();
		this.available = this.available.filter(c => c != cell && !nbs.includes(c));
	}

	buildSet(){
		// we only allow up to 12 regions in the final puzzle
		while(this.available.length !=0 && this.pieces.length < 12){
			this.addToSet();
		}
	}

	getDescriptor(){
		let descriptor = new PuzzleDescriptor(this.type);
		this.pieces.forEach(p => descriptor.addCell(p.getCell().rowNum, p.getCell().colNum));
		return descriptor;
	}
	
}

class AvoidancePuzzle {
	// a new puzzle on an empty board, with regions grown around the descriptor's squares
	constructor(board, descriptor){
		this.board = board;
		this.descriptor = descriptor;
		this.type = descriptor.type;
		this.cover = [];
		this.pieces = [];
		this.message = "Not solved yet.";
		// the descriptor holds positions; look up the matching cells on this puzzle's board
		let initialSet = descriptor.cells.map(position => board.getCell(position.row, position.col));
		this.regionCalculator = new RegionCalculator(board, initialSet);
	}

	regions(){
		return this.regionCalculator.regions;
	}

	// the region that contains this cell
	regionFor(cell){
		return this.regions().find(region => region.hasCell(cell));
	}

	// called when a square is clicked
	selectCell(cell) {

		if (this.isSolved()) {
			return;
		} 

		//1. If the cell's region already has a piece, remove it
		let region = this.regionFor(cell);
		let oldPiece = this.pieces.find(p => region.hasCell(p.cell));
		if (oldPiece) {
			this.pieces = this.pieces.filter(p => p !== oldPiece);
			oldPiece.cell.decoration = "";
		}

		//2. Place a piece in the cell -- unless the click was on the piece just removed
		if (!oldPiece || oldPiece.cell !== cell){
			let piece = new Piece(this.type);
			this.pieces.push(piece);
			piece.setCell(cell);
		}

		//3. Work out which pieces are attacked, and whether the puzzle is finished
		this.calculateCover();
		if (this.isSolved()){
			this.message = "Solved!";
		} else {
			this.message = "Not solved yet. You've placed "+this.pieces.length 
				+ " of " + this.regions().length + " pieces. There are " + this.coverCount() + " pieces that can be captured by another piece.";
		}
		evnts.fireEvent("gameChanged");
	}

	isSolved(){
		if (this.pieces.length != this.regions().length){
			return false;
		}
		if (this.coverCount() != 0){
			return false;
		}
		return true;
	}
	
	// pieces that another piece can capture
	piecesInCover(){
		return this.pieces.filter(p => this.cover.includes(p.getCell()));
	}

	coverCount(){
		return this.piecesInCover().length;
	}

	calculateCover(){
		this.cover = [];
		this.pieces.forEach(selected => {
			selected.neighbors().forEach(nbCell => {
				if (!this.cover.includes(nbCell)){
					this.cover.push(nbCell);
				}
			});
		});
	}

	// the piece on this cell, or null if it is empty
	pieceOn(cell) {
		return this.pieces.find(p => p.cell === cell) ?? null;
	}
}
	
	
class Region {
	constructor(startCell, exclusion){
		this.cells = [];
		this.cells.push(startCell);
		this.exclusion = [...exclusion];
	}

	toString(){
		return "Region length " + this.cells.length;
	}
	candidate(){
		// flatMap: collect the up/down/left/right neighbours of every cell into one list
		// (a cell next to two region cells appears twice, making it a more likely pick)
		let viableCandidates = this.cells
			.flatMap(c => c.neumannNeighbors())
			.filter(c => !this.cells.includes(c) && !this.exclusion.includes(c));
		if (viableCandidates.length !=0){
			const randomIndex = Math.floor(Math.random() * viableCandidates.length);
			return viableCandidates[randomIndex];	
		} else {
			return null;
		}
	}

	addToRegion(cell){
		this.cells.push(cell);
	}

	addToExclusion(cell){ 
		this.exclusion.push(cell);
	}

	hasCell(cell){
		return this.cells.includes(cell);
	}
}


class RegionCalculator{
    constructor(board, initialSet) { // initial testing is with queen
        this.board = board;
		this.initialSet = initialSet;
		this.regions = this.initialSet.map(cell => new Region(cell, this.initialSet));
		this.calculate();
    }

	totalRegionSize(){
		return this.regions.reduce((total, region) => total + region.cells.length, 0);
	}

	// grow every region by one cell (if it can), and keep the other regions out of that cell
	calculateOne(){
		this.regions.forEach(region => {
			let candidate = region.candidate();
			if (candidate != null){
				region.addToRegion(candidate);
				this.regions
					.filter(other => other !== region)
					.forEach(other => other.addToExclusion(candidate));
			}
		});
	}

	// keep growing until the regions cover the whole board
	// (a while loop fits here: we don't know in advance how many rounds it takes)
	calculate(){
		let boardSize = this.board.rowNum * this.board.colNum;
		while (this.totalRegionSize() < boardSize){
			this.calculateOne();
		}
	}
}

/**
* display: these functions read a puzzle and update the page
*/

// one background colour per region (puzzles have at most 12 regions)
const REGION_COLOURS = ["#99FF99", "#D98899", "#7A9EC2", "#E6C88A", "#B39BC8",
                        "#C98A70", "#76B5AE", "#A8A29E", "#E8DF6E", "#7CC2EB",
                        "#E6A378", "#C5D97E"];

// colour each region, draw the pieces, and show attacked pieces in red
function drawAvoidanceBoard(puzzle) {
	// the region colour goes on the table cell (the div's parent) behind each square
	puzzle.regions().forEach((region, index) => {
		region.cells.forEach(cell =>
			getDiv(cell.rowNum, cell.colNum).parentElement.style.background = REGION_COLOURS[index]);
	});

	let attacked = puzzle.piecesInCover().map(piece => piece.cell);
	puzzle.board.cells.flat().forEach(cell => {
		let i = cell.rowNum;
		let j = cell.colNum;
		let div = getDiv(i, j);
		let piece = puzzle.pieceOn(cell);
		div.setAttribute("style", "color:black");
		div.innerHTML = piece ? gameGlyph(piece.type) : emptyCell();
		if (attacked.includes(cell)) {
			div.style.color = "#FF0000";
		}
	});
}

// everything the Safe Harbour page shows for a puzzle
function showAvoidance(puzzle) {
	drawAvoidanceBoard(puzzle);
	byId("messageDisplay").innerHTML = puzzle.message;
	byId("puzzleDescription").innerHTML = "<h4>Place " + puzzle.regions().length + " independent " + puzzle.type
		+ "s, one in each coloured region of the board.</h4>";
}

// the solution: where the pieces of the original independent set were
function avoidanceSolutionHTML(descriptor) {
	let items = descriptor.cells.map(position => "<li>" + position.toString() + "</li>");
	return "<h5>Place "+ descriptor.type + "s at these positions: </br>" + "<ul>" + items.join("") + "</ul></h5>";
}
