
class Move {
	constructor(path, index) {
		this.index = index;
		this.path = path;
		this.options = []; // list of possible moves
		this.cell = null; //current option
	}

	isFree() {
		return this.path.cells[this.index].hide;
	}

	toString(){
		if (this.cell != null) {
			return "(" + this.cell.rowNum + "," + this.cell.colNum + ")";
		} else {
			return "(undecided)";
		}
	}
}

class Solver {
	constructor(game) {
		this.game = game;
		this.solutionPath = [];
		this.solutions = [];
	}

	init() {
		for (var i = 0; i < this.game.path.cells.length; i ++) {
			this.solutionPath.push(new Move(game.path, i));
		}
	}

	toString() {
		return this.solutionPath.toString();
	}

	moveAt(index) {
		return this.solutionPath[index];
	}

	previousFree(index) {
		if (index <= 0) return -1;
		for (var i = index -1; i >= 0; i --){
			if(this.game.path.cells[i].hide){
				return i;
			}
		}
		return -1;
	}

	pop(index) {
		this.moveAt(index).cell = null;
	}

	freeMoves(index){
		var neighbors = this.moveAt(index).cell.neighbors();
		var freeNeighbors = [];
		for (var i = 0; i <neighbors.length; i++){
			var cell = neighbors[i]; 
			if (cell.hide && ! this.inSolution(cell)){
				freeNeighbors.push(cell)
			}
		}
		return freeNeighbors;
	}

	inSolution(cell) {
		for (var i = 0; i <this.solutionPath.length; i++) {
			if (this.solutionPath[i].cell === cell) return true;
		}
		return false;
	}

	solve() {
		//first cell is always known
		this.moveAt(0).cell = this.game.path.cells[0];
		var index = 1;
		while (index >= 0){
			var move = this.moveAt(index);
			if(move.isFree()){
				if (move.cell != null){ // not the first time we have been here
					if (move.options.length == 0){
						this.pop(index);
						index = this.previousFree(index);
					} else {
						move.cell = move.options.pop();
						index ++;
					}
				} else {
					move.options = this.freeMoves(index -1);
					if (move.options.length == 0) {
						this.pop(index);
						index = this.previousFree(index);
					} else {
						move.cell = move.options.pop();
						index ++;
					}
				}
			} else{
				move.cell = this.game.path.cells[index];
				if (this.moveAt(index-1).cell.isNeighbor(move.cell)) {
					index ++;
				} else {
					index = this.previousFree(index);
				}
			}
			if (index == this.game.path.cells.length) {
				this.solutions.push(this.solution());
				index = this.previousFree(index);
			}
		}	
		return this.solutions;
	}

	solution() {
		var mismatches = [];
		var delta = "";
		for (var i = 0; i < this.solutionPath.length; i ++) {
			if (this.solutionPath[i].cell != this.game.path.cells[i]){
				mismatches.push(i);
				delta += " " + this.solutionPath[i] +"!=" + this.game.path.cells[i];;
			}
		}
		return new Solution(mismatches, delta);
		
	}
}

class Solution {
	constructor(mismatches, delta) {
		this.mismatches = mismatches;
		this.delta = delta;
	}

	toString() {
		if (this.mismatches.length == 0) {
			return "[original]";
		} else {
			return "" + this.mismatches + ": " + this.delta;		  
		}
	}
	isOriginal() {
		return this.mismatches.length == 0;
	}
}

class Fixer {

	constructor(game) {
		this.game = game;
	}

	fix() {
		var solver = new Solver(this.game);
		solver.init();
		var solutions = solver.solve();
		var trial = 1;
		console.log("--------------")
		console.log("" + trial + ") puzzle has solutions: " + solutions.length);
		while(solutions.length >1 ) {
			trial++;
			console.log("attempting to fix");
			//pick another solution;
			var otherSolution = null;
			for (var i=0 ; i < solutions.length; i++) {
				otherSolution = solutions[i];
				if (!otherSolution.isOriginal()) {
					break;
				}
			}
			//reveal the first cell that had a problem.
			var indexToShow = otherSolution.mismatches[0];
			console.log("revealing path element: " + indexToShow);
			this.game.path.cells[indexToShow].showIt();
			
			solver = new Solver(this.game)
			solver.init();
			solutions = solver.solve();
			console.log("" + trial + ") puzzle has solutions: " + solutions.length);		
		}

	}

}

