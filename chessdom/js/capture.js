'use strict';

class CapturePuzzle {
    constructor(board) {
        this.board = board;
        this.moves = [];
        this.pieces=[];
        this.selected = null;
        this.target = null;
		this.message = "Choose a piece";
    }

	clone(){
		let clone = new CapturePuzzle(this.board);
		clone.moves = this.moves;
		clone.pieces = structuredClone(this.pieces);
		return clone;
	}

	resetPieceCounts(){
		for (let index = 0; index < this.pieces.length; index++) {
			this.pieces[index].count = 0;
		}
	}
    addPiece(piece) {
        this.pieces.push(piece);
    }
    piecesWithMovesAndSpace(){
        return this.pieces.filter(piece => piece.canMoveAndHasSpace());
    }
	capture(source, target){
		this.pieces = this.pieces.filter(p => p !== target);
		let div = getDiv(source.cell.rowNum, source.cell.colNum);
		div.html(emptyCell(source.cell.rowNum,source.cell.colNum));
        source.cell.decoration = "";
        target.cell.decoration = "";
		source.setCell(target.cell);
		source.count++;
		console.log(source.type + " count: " + source.count);
		this.selected = null;	
	}

    getCell(i, j) {
		return this.board.cells[i][j];
	}
    clicked(i,j, target){
        console.log("received click event: " + i +"," +j+ ": "+ target);
        let cell = this.getCell(i,j);
		this.selectCell(cell, target);
    }

	checkForSolved(){
		return this.pieces.length == 1;
	}

    selectCell(cell, target) {
		let i = parseInt(target.getAttribute("data-row"));
		let j = parseInt(target.getAttribute("data-col"));
		let targetCell = this.board.cells[i][j];
        console.log("clicked on: " + targetCell.decoration);
        console.log("clicked on: " + this.getCapturePiece(i,j));

		let clickedOn =this.getCapturePiece(i,j);
		if (this.selected == null && clickedOn!=null){
			this.selected = clickedOn;
            if (this.selected.remainingMoves() === 1){
                this.message = "You selected a " + clickedOn.type + " with only one move left.";
            } else {
                this.message = "You selected a " + clickedOn.type + " with " + this.selected.remainingMoves() + " moves left.";
            }
        } else if (this.selected == clickedOn){
			console.log("double clicked on same");
		} else if(clickedOn == null) {
			console.log("clicked on empty");
			this.selected = null;
			this.message = "No piece is slelected";
		} else if(this.selected.pieceIsReachable(clickedOn)) {
			console.log(this.selected.type +" can capture " + clickedOn.type);
			if (this.selected.remainingMoves() == 0) {
                this.message = "No moves left for this piece";
                this.selected = null;
            } else if (clickedOn.type == "king"){
				this.message = "You cannot capture the king";
				this.selected = null;
			} else {
				this.message = "The " + this.selected.type + " captures the " + clickedOn.type;
				this.capture(this.selected,clickedOn);
			}
		} else{ 
			this.message = "This " + clickedOn.type + " is not reachable by selected " + this.selected.type;
			this.selected = null;
		}

		if(this.checkForSolved()){
			this.message = "You solved the puzzle!";
		}

		this.colourCells();
		evnts.fireEvent("refreshMessage");
	}

    getCapturePiece(i, j) {
        for (let k = 0; k < this.pieces.length; k++) {
            if (this.pieces[k].isAt(i,j)) {
                return this.pieces[k];
            }
        }
        return null;
    }

    solutionHTML(){
        let list = this.moves.reverse();
        let html = "<ol>\n";
        for(let i = 0; i < list.length; i++) {
            html += "<li>" + list[i] +"</li>\n";
        }
        html += "</ol>\n";
        return html;
    }

	messageHTML(){
		return this.message;
	}

    randomAvailablePiece(){
        let available = this.piecesWithMovesAndSpace();
        return available[Math.floor(Math.random() * available.length)];
    }

    colourCells() {
        for (let i = 0; i < this.board.rowNum; i++) {
            for (let j = 0; j < this.board.colNum; j++) {
                let div = getDiv(i, j);
                div.attr("style", "color:black");
                var cell = this.board.cells[i][j];
                if (cell.decoration !=""){
                    div.html(gameGlyph(i,j, cell.decoration));
                    //div.css("background","#99ff99");
                }

            }
        }

        if (this.selected != null){
            let si = this.selected.cell.rowNum;
            let sj= this.selected.cell.colNum;
            let sdiv = getDiv(si, sj);
            if (this.selected.remainingMoves() == 0) {
                sdiv.css("background","rgb(128,128,128,1)");
            } else if (this.selected.remainingMoves() == 1) {
                sdiv.css("background","rgb(128,128,128,0.5)");
            }else if(this.selected.remainingMoves() == 2){
                sdiv.css("background","rgb(128,128,128,0.2)");
            }


			let nbs = this.selected.neighbors();
            for (let l = 0; l < nbs.length; l++){
                let nbCell = nbs[l];
                let i = nbCell.rowNum;
                let j = nbCell.colNum;
                if (this.selected.cellIsReachable(nbCell)&&nbCell.decoration!==""){
                    let div = getDiv(i, j);
                    div.css("background","#99ff99");
                }
            }
        }
    }
}

class CapturePiece {
    constructor(board) {
        this.board = board;
        this.count = 0;
        this.type = "knight";
        this.cell = null;
    }

    remainingMoves(){
        return 2 - this.count;
    }

	toString(){
		let str = "" +this.type + " at " + this.cell;
		return str;
	}

    isAt(i,j){
        return this.cell.rowNum==i && this.cell.colNum==j;
    }

    setCell(cell) {
        this.cell = cell;
        this.cell.decoration = this.type;
    }
    getCell(){
        return this.cell;
    }
    moveTo(target){
        this.cell.decoration="";
        this.count ++;
        this.setCell(target);
    }
    canMove(){
        return this.count < 2;
    }

    canMoveAndHasSpace(){
        return this.canMove() && this.hasEmptyNeighbors();
    }

	neighbors(){
		return this.cell.neighbors();
	}
	
    getNeighborCell(){
        let nbs = this.cell.neighbors();
        let nonEmpties = nbs.filter(n => n.decoration == "");
        console.log("found occupied neighbours: "+  nbs.filter(n => n.decoration != ""));
        return nonEmpties[Math.floor(Math.random() * nonEmpties.length)];
    }

	pieceIsReachable(piece){
		let targetCell = piece.getCell();
		return this.cellIsReachable(targetCell);
	}
    cellIsReachable(cell){
        if(!this.cell.neighbors().includes(cell)){
            return false;
        }
        let thetype = this.type;
        if(thetype==="king" | thetype==="knight"){ return true;}
        let this_row = this.cell.rowNum;
        let this_col = this.cell.colNum;
        let other_row = cell.rowNum;
        let other_col =  cell.colNum;

        if (this_row == other_row || this_col == other_col){
            console.log("- use rook positioning");
            return this.cellIsReachableRook(cell);
        }

        console.log("- use bishop positioning");
        return this.cellIsReachableBishop(cell);
    }

    cellIsReachableBishop(cell){
        let this_row = this.cell.rowNum;
        let this_col = this.cell.colNum;
        let other_row = cell.rowNum;
        let other_col =  cell.colNum;
        if (this_row < other_row){ //other is ahead in row
            if (this_col < other_col){ //other is ahead in column
                let i = this_row + 1;
                let j = this_col + 1;
                while (i < other_row && j < other_col){
                    let space = this.board.cells[i][j];
                    if (space.decoration !== "") {
                        console.log("-- found " + space.decoration + " in path");
                        return false;
                    }
                    i++;
                    j++;
                }

            } else { //other is behind on column
                let i = this_row + 1;
                let j = this_col - 1;
                while (i < other_row && j > other_col){
                    let space = this.board.cells[i][j];
                    if (space.decoration !== "") {
                        console.log("-- found " + space.decoration + " in path");
                        return false;
                    }
                    i++;
                    j--;
                }
            }
        } else {
            if (this_col < other_col){ //other is ahead in column
                let i = this_row - 1;
                let j = this_col + 1;
                while (i > other_row && j < other_col){
                    let space = this.board.cells[i][j];
                    if (space.decoration !== "") {
                        console.log("-- found " + space.decoration + " in path");
                        return false;
                    }
                    i--;
                    j++;
                }

            } else { //other is behind on column
                let i = this_row - 1;
                let j = this_col - 1;
                while (i > other_row && j > other_col){
                    let space = this.board.cells[i][j];
                    if (space.decoration !== "") {
                        console.log("-- found " + space.decoration + " in path");
                        return false;
                    }
                    i--;
                    j--;
                }
            }
        }
        return true;
    }
    cellIsReachableRook(cell){
        let this_row = this.cell.rowNum;
        let this_col = this.cell.colNum;
        let other_row = cell.rowNum;
        let other_col =  cell.colNum;

        let minRow = Math.min(this_row, other_row);
        let maxRow = Math.max(this_row, other_row);
        let minCol = Math.min(this_col, other_col);
        let maxCol = Math.max(this_col, other_col);

        if (this_row == other_row){
            for (let i = minCol + 1; i < maxCol; i++) {
               let space = this.board.cells[this_row][i];
               if (space.decoration !=""){
                   console.log("-- found " + space.decoration + " in path");
                   return false;
               }
            }
        } else if (this_col == other_col){
            for (let i = minRow + 1; i < maxRow; i++) {
                let space = this.board.cells[i][this_col];
                if (space.decoration !==""){
                    console.log("-- found " + space.decoration + " in path");
                    return false;
                }
            }
        }
        console.log("-- found nothing in rook path");
        return true;
    }
    hasEmptyNeighbors(){
        let nbs = this.reachableUnoccupiedNeighbors();
        return nbs.length > 0;
    }

    reachableUnoccupiedNeighbors(){
        return this.cell.neighbors().filter(n => (this.cellIsReachable(n) && n.decoration === ""));
    }

}

class PuzzleGenerator{
    constructor(board) {
        this.board = board;
        this.puzzle = new CapturePuzzle(board);
    }

    randomType(){
        let types = ["knight","bishop","rook","queen"];
        return types[Math.floor(Math.random() * types.length)];
    }
    initialPosition(){
        let startposition = this.board.randomStart();
        let firstpiece = new CapturePiece(this.board);
        firstpiece.type = "king";
        firstpiece.setCell(startposition);
        this.puzzle.addPiece(firstpiece);
    }
    existingCapture(){
        let op = this.puzzle.randomAvailablePiece();
        let newPiece = new CapturePiece(this.board);
        newPiece.type = this.randomType();
        console.log("new piece: " + newPiece.type);
        this.puzzle.addPiece(newPiece);

        let nbs = op.reachableUnoccupiedNeighbors();
        console.log("creating puzzle -- selected " + op);

        let ogCell = op.getCell();
        let newCell = nbs[Math.floor(Math.random() * nbs.length)];

        console.log("new cell is reachable: " + op.cellIsReachable(newCell));
        op.moveTo(newCell);
        newPiece.setCell(ogCell);
        this.puzzle.moves.push("the " + op.type +" at "
            + newCell.position()  + " takes " + newPiece.type +" at " + ogCell.position() );
    }

    puzzleOfDepth(depth){
        this.initialPosition();
        for(let i=0; i< depth; i++){
            this.existingCapture();
        }
        return this.puzzle;
    }

    //2pieces
    verySimplePuzzle(){
        return this.puzzleOfDepth(1);
    }
    //3pieces
    simplePuzzle(){
        return this.puzzleOfDepth(2);
    }
   
    

}