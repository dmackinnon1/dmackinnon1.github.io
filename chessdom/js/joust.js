'use strict';
/*
* Joust: the player and an adversary each move the same kind of piece around the board,
* starting at opposite edges. Neither may land on a square either of them has visited.
* The player wins by leaving the adversary with no move before getting stuck themselves.
* Inspired by "Radioactive Pooping Knights".
*
* Joust knows nothing about the page: after every change it fires the "gameChanged"
* event, and the display code (bottom of this file) draws it.
* Requires chess_base.js and tour.js.
*/

class Joust {
	constructor(board, pieceType) {
		this.board = board;
		// the player starts somewhere on the top row, the adversary somewhere on the bottom row
		this.player = new Tour(board, pieceType, board.getCell(0, randomInt(board.colNum)));
		this.adversary = new Tour(board, pieceType, board.getCell(board.rowNum - 1, randomInt(board.colNum)));
		this.visited = new Set([this.player.head(), this.adversary.head()]);
		this.smartAdversary = true;
		this.playerBlocked = false;
		this.adversaryBlocked = false;
	}

	// the squares the piece could move to from cell that neither side has visited
	freeMoves(cell) {
		return this.player.neighbors(cell).filter(next => !this.visited.has(next));
	}

	isOver() {
		return this.playerBlocked || this.adversaryBlocked || this.visited.size === this.board.cellCount();
	}

	// called when a square is clicked: the player moves there if they can, then the adversary replies
	selectCell(cell) {
		if (this.isOver() || !this.freeMoves(this.player.tail()).includes(cell)) return;
		this.player.add(cell);
		this.visited.add(cell);
		this.adversaryMove();
		if (!this.adversaryBlocked && this.freeMoves(cell).length == 0) {
			this.playerBlocked = true;
		}
		evnts.fireEvent("gameChanged");
	}

	adversaryMove() {
		let available = this.freeMoves(this.adversary.tail());
		if (available.length == 0) {
			this.adversaryBlocked = true;
			return;
		}
		let next = this.smartAdversary ? this.smartMove(available) : this.mostOpen(available, false);
		this.adversary.add(next);
		this.visited.add(next);
	}

	// The smart adversary takes the player's last free square if it can (that wins the game).
	// Otherwise it picks the move that leaves it the most moves compared with the player:
	// open space for itself, and squares taken away from the player (moving onto a square the
	// player could go to next counts in its favour). The first such move wins ties.
	smartMove(available) {
		let advantage = cell => {
			this.visited.add(cell);   // try the move...
			let playerMoves = this.freeMoves(this.player.tail()).length;
			let score = playerMoves == 0 ? Infinity : this.freeMoves(cell).length - playerMoves;
			this.visited.delete(cell);   // ...and take it back
			return score;
		};
		return available.reduce((best, cell) => advantage(cell) > advantage(best) ? cell : best);
	}

	// the first of cells with the most onward moves (most = true) or the fewest (most = false)
	mostOpen(cells, most) {
		let count = cell => this.freeMoves(cell).length;
		return cells.reduce((best, cell) => (most ? count(cell) > count(best) : count(cell) < count(best)) ? cell : best);
	}
}

/**
* display: these functions read a game and update the page
*/

// The player's piece and the squares it has visited (rings); the adversary and its trail
// (crosses). The player's possible moves are green.
function drawJoust(game) {
	let player = game.player.tail();
	let adversary = game.adversary.tail();
	let moves = game.isOver() ? [] : game.freeMoves(player);
	game.board.cells.flat().forEach(cell => {
		let div = getDiv(cell.rowNum, cell.colNum);
		if (cell === adversary) {
			div.innerHTML = iconGlyph("user");
		} else if (game.adversary.has(cell)) {
			div.innerHTML = iconGlyph("remove-circle");
		} else if (cell === player) {
			div.innerHTML = gameGlyph(game.player.pieceType);
		} else if (game.player.has(cell)) {
			div.innerHTML = iconGlyph("ok-circle");
		} else {
			div.innerHTML = emptyCell();
		}
		let shade = boardShade(cell);
		let [background, colour] =
			moves.includes(cell) ? ["#99ff99", "#99ff99"]
			: (cell === player || cell === adversary) ? [shade, "black"]
			: [shade, game.visited.has(cell) ? (shade === "white" ? "grey" : "white") : shade];
		div.style.background = background;
		div.style.color = colour;
	});
}

// everything the Joust page shows
function showJoust(game) {
	drawJoust(game);
	let status = game.adversaryBlocked ? "Adversary Blocked!"
		: game.playerBlocked ? "Blocked!"
		: game.isOver() ? "Finished!" : "";
	byId("finish").innerHTML = status ? new Bldr("h2").att("align", "center").text(status).build() : "";
}
