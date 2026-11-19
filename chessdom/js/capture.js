'use strict';

/*
* Piece Meal: every piece may capture a limited number of times (maxCaptures:
* 2 in the original NYT puzzle; 1 to 3 here), and the goal is to finish with a
* single piece (the king, if there is one). Captures are only allowed as real
* chess moves, and the king may never be captured.
*
* CapturePuzzle holds the state of one puzzle and knows nothing about the page:
* after every change it fires the "gameChanged" event, and the display code
* (bottom of this file) draws the puzzle from its state.
*/
class CapturePuzzle {
    constructor(board, maxCaptures = 2) {
        this.board = board;
        this.maxCaptures = maxCaptures;  // how many captures each piece may make
        this.moves = [];
        this.pieces=[];
        this.selected = null;
		this.message = "Choose a piece.";
		this.includeKing = true;
		this.moveStack = [];
    }

	// give every piece its full allowance of captures
	resetPieceCounts(){
		this.pieces.forEach(piece => piece.count = 0);
	}
    addPiece(piece) {
		piece.puzzle = this;
        this.pieces.push(piece);
    }
    piecesWithMovesAndSpace(){
        return this.pieces.filter(piece => piece.canMoveAndHasSpace());
    }
	capture(source, target){
		this.pieces = this.pieces.filter(p => p !== target);
        source.cell.decoration = "";
        target.cell.decoration = "";
		let ogCell = source.cell;
		source.setCell(target.cell);
		source.count++;
		this.selected = null;
		this.moveStack.push(new PuzzleMove(this, source, target,ogCell))
	}

	canUndo(){
		return this.moveStack.length !=0 && !this.checkForSolved();
	}
	undoLastMove(){
		if (!this.canUndo()){
			return;
		}
		let move = this.moveStack.pop();
		move.reverseMove();
		this.message = "Choose a piece";
		this.selected = null;
		evnts.fireEvent("gameChanged");
	}


	checkForSolved(){
		return this.pieces.length == 1;
	}

	checkForStuck(){
		let isStuck = false;
		let stuckReasons = [];
		let stuckMessage = "You may be stuck";
		const hasMoves =  this.pieces.filter((p) => p.canMove());
		const totalMoves = this.pieces.reduce((sum, p) => sum + p.remainingMoves(), 0);
		const totalPieces = this.pieces.length;
		const king = this.pieces.find((p) => p.type == 'king');
		const isolated = this.pieces.filter((p) => (p.inNeighbors().length == 0) && (p.outNeighbors().length == 0));
		const paralized = this.pieces.filter((p) => !p.canMove() && (p.inNeighbors().length == 0));
		// Reaching a piece that nothing can capture right now takes at least two captures:
		// one to move into position and one to take it. These pieces can still do that.
		const repositioners = this.pieces.filter((p) => p.remainingMoves() >= 2);

		if (this.includeKing){
			if (!king.canMove() && (this.pieces.length > 1)){
				isStuck = true;
				stuckReasons.push("king is out of moves");
			}
			if (king.outNeighbors().length == 0){
				isStuck = true;
				stuckReasons.push("king cannot capture");
			}
		}

		if (this.pieces.length == 2 && king == null){
			const p1 = this.pieces[0];
			const p2 = this.pieces[1];
			if ((!p1.pieceIsReachable(p2)) && (!p2.cellIsReachable(p1))){
				isStuck = true;
				stuckReasons.push("no final move available");
			}
		}
		
		if (totalMoves < this.pieces.length -1){
			isStuck = true;
			stuckReasons.push("not enough moves left to capture pieces");
		}

		if (hasMoves.length == 0){
			isStuck = true;
			stuckReasons.push("all pieces are out of moves");
		} else {
			if (paralized.length != 0 && repositioners.length == 0){
				isStuck = true;
				stuckReasons.push("there is a piece with no moves that can't be captured");
			}
		}	

		if (isolated.length == totalPieces){
			isStuck = true;
			stuckReasons.push("all pieces are isolated");
		} else {
			if (isolated.length != 0 && repositioners.length == 0){
				isStuck = true;
				stuckReasons.push("there is an isolated piece");
			}
		}

		if(isStuck){
			this.message = stuckMessage + ": " + joinWithAnd(stuckReasons) + ".";
		}
	}

    // called when a square is clicked
    selectCell(cell) {
		let clickedOn = this.getCapturePiece(cell);
		if (this.selected == null && clickedOn!=null){
			this.selected = clickedOn;
            if (this.selected.remainingMoves() === 1){
                this.message = "You selected a " + clickedOn.type + " with only one move left.";
            } else {
                this.message = "You selected a " + clickedOn.type + " with " + this.selected.remainingMoves() + " moves left.";
            }
        } else if (this.selected == clickedOn){
			// same piece clicked again: keep it selected
		} else if(clickedOn == null) {
			this.selected = null;
			this.message = "No piece is slelected, please choose a piece.";
		} else if(this.selected.pieceIsReachable(clickedOn)) {
			if (this.selected.remainingMoves() == 0) {
                this.message = "No moves left for this piece.";
                this.selected = null;
            } else if (clickedOn.type == "king"){
				this.message = "You cannot capture the king.";
				this.selected = null;
			} else {
				this.message = "The " + this.selected.type + " captures the " + clickedOn.type +".";
				this.capture(this.selected,clickedOn);
			}
		} else{ 
			this.message = "This " + clickedOn.type + " is not reachable by selected " + this.selected.type;
			this.selected = null;
		}

		if(this.checkForSolved()){
			this.message = "You solved the puzzle!";
		} else {
			this.checkForStuck();
		}
		evnts.fireEvent("gameChanged");
	}

    // the piece on this cell, or null if it is empty
    getCapturePiece(cell) {
        // find() returns undefined when nothing matches; callers expect null
        return this.pieces.find(p => p.cell === cell) ?? null;
    }

    // a random piece that still has a capture left and an empty square it could move to,
    // or null if there is none
    randomAvailablePiece(){
        let available = this.piecesWithMovesAndSpace();
        if (available.length == 0) return null;
        return available[Math.floor(Math.random() * available.length)];
    }
}

// ["a"] -> "a",  ["a", "b"] -> "a and b",  ["a", "b", "c"] -> "a, b and c"
function joinWithAnd(items) {
	if (items.length <= 1) return items.join("");
	return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

// a Piece that also counts its captures (at most puzzle.maxCaptures)
// and knows which puzzle it belongs to, so it can look at the other pieces
class CapturePiece extends Piece {
    constructor(type) {
        super(type);
        this.count = 0;
		this.puzzle = null;
    }

    remainingMoves(){
        return this.puzzle.maxCaptures - this.count;
    }

    moveTo(target){
        this.cell.decoration="";
        this.count ++;
        this.setCell(target);
    }
    canMove(){
        return this.remainingMoves() > 0;
    }

    canMoveAndHasSpace(){
        return this.canMove() && this.hasEmptyNeighbors();
    }

	inNeighbors(){
		return this.puzzle.pieces.filter(p => p.pieceIsReachable(this));
	}

	//piece neighbors
	outNeighbors(){
		return this.puzzle.pieces.filter(p => this.pieceIsReachable(p));
	}

	pieceIsReachable(piece){
		let targetCell = piece.getCell();
		return this.cellIsReachable(targetCell);
	}
    cellIsReachable(cell){
        if(!this.neighbors().includes(cell)){
            return false;
        }
        // kings and knights jump, so nothing can block them
        if (this.type === "king" || this.type === "knight") { return true; }
        // rooks, bishops and queens are blocked by any piece in between
        return this.squaresBetween(cell).every(square => square.decoration === "");
    }

    // the squares strictly between this piece and a cell on the same row, column or diagonal
    squaresBetween(cell){
        let di = Math.sign(cell.rowNum - this.cell.rowNum);
        let dj = Math.sign(cell.colNum - this.cell.colNum);
        let line = this.cell.ray(di, dj);
        return line.slice(0, line.indexOf(cell));
    }
    hasEmptyNeighbors(){
        let nbs = this.reachableUnoccupiedNeighbors();
        return nbs.length > 0;
    }

    reachableUnoccupiedNeighbors(){
        return this.neighbors().filter(n => (this.cellIsReachable(n) && n.decoration === ""));
    }

}

class PuzzleMove{
	constructor(puzzle, activePiece, targetPiece, startCell){
		this.puzzle = puzzle;
		this.activePiece = activePiece;
		this.targetPiece = targetPiece;
		this.startCell = startCell;
	}

	reverseMove(){
		this.activePiece.count--;
		this.targetPiece.setCell(this.activePiece.cell);
		this.activePiece.setCell(this.startCell);
		this.puzzle.addPiece(this.targetPiece);
	}
}

class PuzzleGenerator{
    constructor(board, kings=true, pieceType='all', maxCaptures=2) {
        this.board = board;
		this.includeKing = kings ;
        this.puzzle = new CapturePuzzle(board, maxCaptures);
		this.puzzle.includeKing = this.includeKing;
		this.pieceType = pieceType;
		
    }

    randomType(){
		if (this.pieceType == 'all'){
	        let types = ["knight","bishop","rook","queen"];
	        return types[Math.floor(Math.random() * types.length)];
		} else {
			return this.pieceType;
		}
    }
    initialPosition(){
        let startposition = this.board.randomStart();
        let firstpiece = new CapturePiece(this.includeKing ? "king" : this.randomType());
        firstpiece.setCell(startposition);
        this.puzzle.addPiece(firstpiece);
    }
    // one backwards step; returns false if no piece can make it
    existingCapture(){
        let op = this.puzzle.randomAvailablePiece();
        if (op == null) return false;
        let newPiece = new CapturePiece(this.randomType());
        this.puzzle.addPiece(newPiece);

        let nbs = op.reachableUnoccupiedNeighbors();

        let ogCell = op.getCell();
        let newCell = nbs[Math.floor(Math.random() * nbs.length)];

        op.moveTo(newCell);
        newPiece.setCell(ogCell);
        this.puzzle.moves.push("the " + op.type +" at "
            + newCell.position()  + " takes " + newPiece.type +" at " + ogCell.position() );
        return true;
    }

    // build a puzzle backwards: start from one piece and "un-capture" depth times.
    // Each un-capture uses up one of a piece's captures, so the counts are
    // reset at the end to give the player a fresh puzzle.
    // Returns null if the generator gets stuck (every piece out of captures or boxed in),
    // which happens more often with maxCaptures = 1 -- see generateCapturePuzzle.
    puzzleOfDepth(depth){
        this.initialPosition();
        // every() stops at the first step that fails
        let complete = range(depth).every(() => this.existingCapture());
        if (!complete) return null;
        this.puzzle.resetPieceCounts();
        return this.puzzle;
    }
}

// a puzzle on a fresh size x size board, trying again if the generator gets stuck
function generateCapturePuzzle(size, kings, pieceType, depth, maxCaptures, attempts = 100) {
    for (let attempt = 0; attempt < attempts; attempt++) {
        let puzzle = new PuzzleGenerator(new Board(size), kings, pieceType, maxCaptures).puzzleOfDepth(depth);
        if (puzzle != null) return puzzle;
    }
    return null;
}

/**
* display: these functions read a puzzle and update the page
*/

// grey behind the selected piece: darker the fewer captures it has left
// (indexed by captures left: 0, 1, 2, 3)
const SELECTED_SHADE = ["rgb(128,128,128,1)", "rgb(128,128,128,0.5)", "rgb(128,128,128,0.2)", "rgb(128,128,128,0.1)"];

// draw every piece; shade the selected piece and colour the pieces it can capture green
function drawCaptureBoard(puzzle) {
    puzzle.board.cells.flat().forEach(cell => {
        let i = cell.rowNum;
        let j = cell.colNum;
        let div = getDiv(i, j);
        let piece = puzzle.getCapturePiece(cell);
        div.setAttribute("style", "color:black");
        div.innerHTML = piece ? gameGlyph(piece.type) : emptyCell();
    });

    let selected = puzzle.selected;
    if (selected != null){
        getDiv(selected.cell.rowNum, selected.cell.colNum).style.background = SELECTED_SHADE[selected.remainingMoves()];
        selected.outNeighbors().forEach(target =>
            getDiv(target.cell.rowNum, target.cell.colNum).style.background = "#99ff99");
    }
}

// everything the Piece Meal page shows for a puzzle
function showCapture(puzzle) {
    drawCaptureBoard(puzzle);
    byId("messageDisplay").innerHTML = puzzle.message;
    setButtonActive("#undoButton", puzzle.canUndo());
    setButtonActive("#advanceButton", puzzle.checkForSolved());
}

function captureSolutionHTML(puzzle) {
    // moves are recorded while building the puzzle backwards, so show them in reverse.
    // [...puzzle.moves] copies the list first: reverse() on its own would change puzzle.moves itself
    let items = [...puzzle.moves].reverse().map(move => "<li>" + move + "</li>\n");
    return "<ol>\n" + items.join("") + "</ol>\n";
}
