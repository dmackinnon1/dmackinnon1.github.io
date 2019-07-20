/*
* Cell, Group, and Board are the main classes that model the
* Sudoku puzzle. 
*
* Valid puzzles are created using the Generator class.
* The Generator uses an instance of Solver to create the puzzle from
* a blank board, and verifies that it is solvable using
* methods provided by the Board class.
*
* Interaction is facilitated by callbacks and events that
* update the currentPosition variable.
*/

class PuzzleTriple {
    constructor(board, solution, difficulty){
        this.board = board;
        this.solution = solution;
        this.difficulty = difficulty;
    }
}

/*
 * Generates boards of different sizes.
 * Difficulty can be varied through the "openLevel" parameter
 * which determines the maximum valency (number of possible values)
 * of the cells. The higher the maximum valency, the more open 
 * spaces there are, and the more options there can be for some
 * cells.
 */

function boardCopy(b){
    let bs = new Board(b.n);
    bs.init();
    bs.cloneFrom(b);
    bs.freezeNonZero();
    return bs;    
} 
class Generator {

    /*
     * Small boards are 4x4. Currently returns boards
     * with cells with valence 1-3.
     */
    small() {
        return this.validatedBoard(4, 4);
    }

    /*
     * Large boards are 9x9. Currently returns boards
     * with cells with valence 1-5.
     */
    large() {
        //return this.validatedBoard(9, 6);
        return this.validatedBoard(9, 6);
    }

    validatedBoard(size, openLevel) {
        let b = this.baseBoard(size);  
        let bsolution = boardCopy(b);
        this.openBoard(b, openLevel);
        let bworking = boardCopy(b)
        let solver = new StagedSolver();
        while (!solver.solve(bworking)) {
            b = this.baseBoard(size);  
            bsolution = boardCopy(b);
            this.openBoard(b, openLevel);
            bworking = boardCopy(b);
        }
        b.freezeNonZero();
        return new PuzzleTriple(b,bsolution,solver.difficultyRating());
    }

    openBoard(b, openLevel) {
        b.openCompleteRegions();
        b.openSymmetric();
        b.openSymmetric();
        //increase difficulty by opening board to maximum valence level
        if (Math.floor(Math.random() * 100) < 70 || b.n == 4){ 
            b.openToValence(openLevel);
        }
        return b;
    }


    baseBoard(size) {
        let b = new Board(size);
        b.init();
        let s = new Solver(b);
        while (!s.solve()) {
            //console.log("failed to generate initial board - retry");
            b = new Board(size);
            b.init();
            s = new Solver(b);
        }
        return b;
    }

}
/*
* A Cell represents one element in the Sudoku grid.
* A Cell has a value (digit) and may or may not be editable.
* In this implementation, empty cells are given value = 0;
*
* A Cell is aware of its row, colunm, and block. By looking
* at the values in companion cells, we can determine if a
* cell is valid, or how many possible values it can have 
* (referred to here as its "valence").
*/
class Cell {
    constructor(x, y, b, v, brd) {
        this.column = x;
        x.addCell(this);
        this.row = y;
        y.addCell(this);
        this.block = b;
        b.addCell(this);
        this.value = v;
        if (v === 0) {
            this.editable = true;
        } else {
            this.editable = false;
        }
        this.valid = true;
        this.board = brd;
        this.exclusions = [];
    }

    exclude(x){
        this.exclusions.push(x);
    }

    cloneFrom(cell) {
        this.value = cell.value;
        this.editable = cell.editable;
    }

    updateValue(v) {
        this.value = v;
        this.board.revalidate();
    }

    revalidate() {
        let v = this.value;
        this.valid = true;
        if (v == 0) return;
        let already = false;

        let cvals = this.column.cells.filter(x => x != this).map(x => x.value);
        let rvals = this.row.cells.filter(x => x != this).map(x => x.value);
        let bvals = this.block.cells.filter(x => x != this).map(x => x.value);

        already = already || cvals.includes(v);
        already = already || rvals.includes(v);
        already = already || bvals.includes(v);

        if (already) {
            this.valid = false;
        }
    }

    isComplete() {
        return this.value !== 0;
    }

    isOption(x) {
        let notIn = true;
        notIn = notIn && !(this.column.cells.filter(a => a != this).filter(a => a.value == x).length > 0);
        notIn = notIn && !(this.row.cells.filter(a => a != this).filter(a => a.value == x).length > 0);
        notIn = notIn && !(this.block.cells.filter(a => a != this).filter(a => a.value == x).length > 0);
        
        notIn = notIn && !this.exclusions.includes(x);
        
        return notIn;
    }

    hasCompletableRegion(){
        let hasRegion = false;
        hasRegion = hasRegion || this.column.cells.filter(a => a != this).filter(a => a.value == 0).length == 0;
        hasRegion = hasRegion || this.row.cells.filter(a => a != this).filter(a => a.value == 0).length == 0;
        hasRegion = hasRegion || this.block.cells.filter(a => a != this).filter(a => a.value == 0).length == 0;
        return hasRegion;
    }

    allRegionsComplete(){
        let hasRegion = true;
        hasRegion = hasRegion && this.column.cells.filter(a => a != this).filter(a => a.value == 0).length == 0;
        hasRegion = hasRegion && this.row.cells.filter(a => a != this).filter(a => a.value == 0).length == 0;
        hasRegion = hasRegion && this.block.cells.filter(a => a != this).filter(a => a.value == 0).length == 0;
        return hasRegion;
    }


    optionList() {
        return baseList(this.board.n).filter(x => this.isOption(x));
    }

    hasOptions() {
        return this.optionList().length != 0;
    }

    valence() {
        return this.optionList().length;
    }

    getCompanions() {
        let companions = [];
        companions = companions.concat(this.column.cells.filter(a => a != this));
        companions = companions.concat(this.row.cells.filter(a => a != this));
        companions = companions.concat(this.block.cells.filter(a => a != this));
        return companions;
    }

    getNonZeroCompanions() {
        return this.getCompanions().filter(a => a.value != 0);
    }

    sameOptions(cell){
        let myOptions = this.optionList();
        let theirOptions = cell.optionList();
        if (myOptions.length != theirOptions.length) return false;
        let overlap = myOptions.filter(x => theirOptions.includes(x));
        return overlap.length == myOptions.length;
    }

    asString(){
        return "["+ this.row.label + ", " +this.column.label+"]("+ this.value +"){"+this.optionList()+"}";
    }

}

/*
* Rows, Columns, and Blocks of Cells are modeled as Cell Groups.
*/
class Group {
    constructor(t, l) {
        this.type = t;
        this.label = l;
        this.cells = [];
    }
    addCell(cell) {
        this.cells.push(cell);
    }

    nonZeroCount() {
        return this.cells.filter(x => x.value != 0).length;
    }
}

/*
* The Board is an aggregate of Cells. The Board
* must be initialized (filled with zeroed cells).
* The Board can generate HTML to draw itself 
* via the drawBoard() function.
* 
* There is a simple solving algorithm built into the
* Board that looks for single-valence cells and completes
* them until finished. If this method works, the 
* puzzle associated with the board has a unique solution.
* A board is solved using the solve() method. To test if 
* a board can be solved, the canSolve() will clone the 
* board and run the solve algorithm.
*
* An initial puzzle can be created using the Solver class,
* which uses random guesses and recursion to solve, rather
* than only filling in valence 1 cells.
* 
*/
class Board {
    constructor(size, name='default') {
        this.n = size; // only size 4 and 9 are valid.
        this.available = [];
        this.rows = [];
        this.columns = [];
        this.blocks = [];
        this.cells = [];
        this.hints = true;
        this.name = name;
        this.groups = [];
    }

    init() {
        for (let i = 0; i < this.n; i++) {
            let g = new Group("row", i);
            this.groups.push(g);
            this.rows.push(g);
            g = new Group("column", i);
            this.groups.push(g);
            this.columns.push(g);
            g = new Group("block", i);
            this.groups.push(g);
            this.blocks.push(g);
        }

        for (let i = 0; i < this.n; i++) {
            let col = [];
            for (let j = 0; j < this.n; j++) {
                let row = this.rows[j];
                let column = this.columns[i];
                let block = null;
                if (this.n == 4) {
                    if (i < 2 && j < 2) {
                        block = this.blocks[0];
                    } else if (j < 2) {
                        block = this.blocks[1];
                    } else if (i < 2 && j >= 2) {
                        block = this.blocks[2];
                    } else {
                        block = this.blocks[3]
                    }
                } else if (this.n == 9) {
                    if (j < 3) {
                        if (i < 3) {
                            block = this.blocks[0];
                        } else if (i < 6) {
                            block = this.blocks[1];
                        } else {
                            block = this.blocks[2];
                        }
                    } else if (j < 6) {
                        if (i < 3) {
                            block = this.blocks[3];
                        } else if (i < 6) {
                            block = this.blocks[4];
                        } else {
                            block = this.blocks[5];
                        }
                    } else {
                        if (i < 3) {
                            block = this.blocks[6];
                        } else if (i < 6) {
                            block = this.blocks[7];
                        } else {
                            block = this.blocks[8];
                        }
                    }
                }
                let cell = new Cell(column, row, block, 0, this);
                col.push(cell);
            }
            this.cells.push(col);
        }
    }

    fromRawString(s){
        let sCount = 0;
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                let v = parseInt(s[sCount]);
                this.cells[j][i].value = v;
                if (v !== 0){
                    this.cells[j][i].editable = false;
                } else {
                    this.cells[j][i].editable = true;
                }
                sCount++;
            }
        }
    }

    json(name){
        let json = {};
        json['name'] = name;
        json['values'] = this.rawString();
        return json;
    }

    reset() {
        let all = this.allCells();
        for (let c in all){
            if (all[c].editable){
                all[c].value = 0;
                all[c].valid = true;
            }
        }
    }

    zeroOut() {
        let all = this.allCells();
        for (let c in all){
            all[c].value = 0;
            all[c].valid = true;
        }
    }

    cloneFrom(board) {
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                this.cells[j][i].cloneFrom(board.cells[j][i]);
            }
        }
    }

    allCells() {
        let all = [];
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                all.push(this.cells[j][i]);
            }
        }
        return all;
    }

    block(k){
        return this.allCells().filter(x => x.block.label == k);
    }

    row(k){
        return this.allCells().filter(x => x.row.label == k);
        
    }
    column(k){
        return this.allCells().filter(x => x.column.label == k);
        
    }

    // used by the fill methods below.
    setRow(row, pos) {
        for (let j = 0; j < this.n; j++) {
            this.cells[pos][j].value = row[j];
            this.cells[pos][j].editable = false;
        }
        this.revalidate();
    }

    /* Attempts to correctly fill a board
     *  correctly, re-randomizing a whole row
     *  if a current guess does not work.
     *  Generates 4x4 boards,
     *  but fails on 9x9 boards and loop indefinetly. 
     */
    randomFillCorrect() {
        if (this.n > 4) {
            console.log(new Error().stack);
            throw "do not use randomFillCorrect() method on large boards";
        }
        let start = swapTwo(baseList(this.n));
        for (let i = 0; i < this.n; i++) {
            let goodRow = false
            while (!goodRow) {
                this.setRow(start, i);
                start = swapTwo(start);
                goodRow = this.isValid();
            }
        }
    }

    /* Attempts to fill boards leaving some
     * cells empty where random guesses fail.
     * Can generate unsolvable boards.
     */
    randomFill() {
        let start = swapTwoN(baseList(this.n), 4);
        for (let i = 0; i < this.n; i++) {
            this.setRow(start, i);
            start = swapTwoN(start, 4);
        }
        let cell = null;
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                cell = this.cells[j][i];
                if (!cell.valid) {
                    cell.updateValue(0);
                    cell.editable = true;
                }
            }
        }
    }

    randomOpen() {
        let i = Math.floor(Math.random() * this.n);
        let j = Math.floor(Math.random() * this.n);
        this.cells[i][j].value = 0;
        this.cells[i][j].editable = true;
    }
    
    //puts holes in puzzle that leaves regions completable
    openCompleteRegions(){
        this.blocks.forEach(function(b){
            let pos = b.cells.filter(x => x.allRegionsComplete());
            let rand = Math.floor(Math.random() * pos.length);
            let cell = pos[rand];
            cell.value = 0;
            cell.editable = true;
        })
    }

    openSymmetric(){
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                let cell = this.cells[j][i];
                if (cell.value == 0){
                    this.cells[i][j].value = 0;
                    this.cells[i][j].editable = true;
                    
                    this.cells[this.n-j-1][i].value = 0;
                    this.cells[this.n-j-1][i].editable = true;

                    this.cells[j][this.n-i-1].value = 0;
                    this.cells[j][this.n-i-1].editable = true;

                    this.cells[this.n-j-1][this.n-i-1].value = 0;
                    this.cells[this.n-j-1][this.n-i-1].editable = true;
                }
            }
        }
    }

    openValenceOne(){
        let cell = this.getValenceOne();
        if (cell != undefined){
            let target = cell.getCompanions().filter(x => x.value != 0)[0];
            target.value = 0;
            target.editable = true;
        }
    }


    openToValence(k) {
        while (this.maxValence() < k) {
            this.randomOpen();
        }
        return this;
    }

    openToMinimumValence(k){
        while (this.minValence() < k) {
            this.randomOpen();
        }
        return this;
    }


    revalidate() {
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                this.cells[j][i].revalidate();
            }
        }
    }

    isValid() {
        let valid = true;
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                valid = valid && this.cells[j][i].valid;
            }
        }
        return valid;
    }

    isComplete() {
        let complete = true;
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                complete = complete && this.cells[j][i].isComplete();
            }
        }
        return complete;

    }

    isCompleteAndValid(){
        return this.isComplete() && this.isValid();
    }

    consoleDisplay(){
        for (let i = 0; i < this.n; i ++){
            let row = "|";
            for (let j = 0; j < this.n; j ++){
                row += this.cells[j][i].value;
                row += "|"
            }
            console.log(row);
        }
    }

    latexDisplay(){
        let result = "";
        for (let i = 0; i < this.n; i ++){
            let row = "|";
            for (let j = 0; j < this.n; j ++){
                let val = this.cells[j][i].value;
                if (parseInt(val) != 0){
                    row += val;
                }
                row += "|"
            }
            row += ".\n";
            result += row;
        }
        return result;
    }

    rawString(){
        let result = "";
        for (let i = 0; i < this.n; i ++){
            let row = "";
            for (let j = 0; j < this.n; j ++){
                let val = this.cells[j][i].value;
                row += val;
            }
            result += row;
        }
        return result;
    }

    drawBoard() {
        let html = "<table>"
        for (let i = 0; i < this.n; i++) {
            //row drawing and style (tr)
            html += "<tr";
            if (this.n == 4 && i == 1) {
                html += " class='tr-sudoku-border-bottom'";
            }
            if (this.n == 9 && (i == 2 || i == 5)) {
                html += " class='tr-sudoku-border-bottom'";;
            }
            html += ">";
            for (let j = 0; j < this.n; j++) {
                //entry drawing and style (td)
                let td_class = " class='";
                html += "<td";
                if (this.n == 4 && j == 1) {
                    td_class += "td-sudoku-border-right "; 
                }
                if (this.n == 9 && (j == 2 || j == 5)) {
                    td_class += "td-sudoku-border-right ";
                }
                td_class += "'";
                html += td_class;
                //inner cell draw and style (div)
                let value = this.cells[j][i].value;
                let edit = this.cells[j][i].editable;
                let valid = this.cells[j][i].valid;
                let valence = this.cells[j][i].valence();
                let cell_class = " class='cell-sudoku ";
                html += "><div data-row='" + i + "' data-column='" + j;
                html += "' data-name='" + this.name;  
                html += "'onclick='buttonClicked(event)'"                
                if (!edit) {
                    cell_class += "cell-sudoku-noedit ";                
                } else if (!this.hints){
                    if (value == 0){
                       cell_class += "cell-sudoku-edit-zero ";  
                    } else{
                        cell_class += "cell-sudoku-edit";
                    }
                } else { 
                    if (!valid){
                        cell_class += "cell-sudoku-error "    
                    } else if (valence == 1){
                        cell_class += "cell-sudoku-hint ";
                    } else {
                        cell_class += "cell-sudoku-edit ";
                    }
                    if (value == 0) {
                        if (!valid){
                           cell_class += "cell-sudoku-error-zero "    
                        } else if (valence == 1){
                            cell_class += "cell-sudoku-hint-zero "
                        } else {
                            cell_class += "cell-sudoku-edit-zero "
                        }
                    }
                }    
                
                cell_class += "'";
                html += cell_class + "><p>" + this.cells[j][i].value + "</p></div></td>";
            }
            html += "</tr>"
        }
        html += "</table>";
        return html;
    }

    getValence(x) {
        let cell = null;
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                let cell = this.cells[i][j];
                if (cell.valence() == x && cell.value == 0) {
                    return cell;
                }
            }
        }
    }

    getCompletable() {
        let cell = null;
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                let cell = this.cells[i][j];
                if (cell.valence() == 1 && cell.value == 0 && cell.hasCompletableRegion()) {
                    return cell;
                }
            }
        }
    }

    getValenceZero() {
        return this.getValence(0);
    }

    /*
     * Will remove values to ensure no cells
     * have zero valence, but does not guarantee
     * a solvable board.
     */
    fixValenceZero() {
        while (this.hasValenceZero()) {
            let badCell = this.getValenceZero();
            while (!badCell.hasOptions()) {
                let other = badCell.getNonZeroCompanions()[0];
                other.value = 0;
                other.editable = true;
            }
        }

    }

    getValenceOne() {
        return this.getValence(1);
    }

    hasValenceOne() {
        return this.getValenceOne() != undefined;
    }

    hasValenceZero() {
        return this.getValenceZero() != undefined;
    }

    maxValence() {
        let valence = 0;
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                let cv = this.cells[i][j].valence();
                if (cv > valence) {
                    valence = cv;
                }
            }
        }
        return valence;
    }

    minValence(){
     let valence = 9;
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                let cv = this.cells[i][j].valence();
                if (cv < valence) {
                    valence = cv;
                }
            }
        }
        return valence;
    }

    /*
     * This solve method makes no guesses.
     * It fills in values for cells that only
     * have one option, repeating until finished
     * or blocked.
     */
    solve() {
        let solver = new StagedSolver();
        return solver.solve(this);
    }

    /*
     * Uses the no guessing algorithm to see if a board
     * can be solved. A board that fails this test may
     * be solvable using guesses.
     */
    canSolve() {
        let test = new Board(this.n);
        test.init();
        test.cloneFrom(this);
        test.solve();
        return test.isComplete();
    }

    freeze(){
        let all = this.allCells();
        for (let c in all){
                all[c].editable = false;
        }
    }

    freezeNonZero(){       
        let all = this.allCells();
        for (let c in all){
            if (all[c].value != 0){
                all[c].editable = false;
            }
        }
    }

    solution(){
        let solution = new Board(this.n);
        solution.init();
        solution.cloneFrom(this);
        solution.reset();
        solution.solve();
        solution.freeze();
        return solution;
    }

    updateFromCurrentPosition() {
        let cell = this.cells[currentPosition.i][currentPosition.j];
        if (!cell.editable) return;
        cell.updateValue((cell.value + 1) % (this.n + 1));
    }
}

class StagedSolver {
    
    constructor(){
        this.counts = {};
        this.board = null;
    }
    
    solve(board) {
        this.board = board;
        this.counts = {};
        let solvers = [new RegionCompleteSolver(), new ValenceOneSolver(), new EliminatorSolver(), new NakedSolver(), new NakedTripleSolver(), new ValenceOneSolver()];
        let result = false;
        let solver = null;
        while (!board.isComplete()) {            
            for (let s in solvers){
                solver = solvers[s];
                result = solver.move(board);
                
                if (result == false) {
                    //console.log("failed to solve using " + solver.name());
                    continue;
                }
                if (result == true) {
                    if (this.counts[solver.name()] == undefined){
                        this.counts[solver.name()] = 1;
                    } else {
                        this.counts[solver.name()] = this.counts[solver.name()] +1;
                    }
                    break;          
                }
            }
            if (result == false){
                break;   
            }                    
        }
        //console.log(this.counts); 
        return result;
    }

    difficultyRating(){
        if (this.board.n == 4) return "easy";
        else if (this.board.allCells().filter(x => x.editable).length < 40){
            return "easy";
        } else if (Object.keys(this.counts).length == 2){
            return "medium";
        } else if (Object.keys(this.counts).length == 3){
            return "difficult";
        } else {
            return "tricky";
        }
    }
}

class RegionCompleteSolver {
    name(){
        return "regionCompleter"; 
    }

    move(board) {
            let cell = board.getCompletable();
            if (cell == undefined) {
                return false;
            }
            let value = cell.optionList()[0];
            cell.value = cell.optionList()[0];
            return true;
    }

}

class ValenceOneSolver {
    name(){
        return "valenceOne";
    }
    move(board) {
            let cell = board.getValenceOne();
            if (cell == undefined) {
                return false;
            }
            let value = cell.optionList()[0];
            cell.value = cell.optionList()[0];
            return true;
    }
}

class EliminatorSolver {
    name(){
        return "eliminator";
    }
    move(board) {
            let editables = board.allCells().filter(x => x.value == 0);
            for (let c in editables){
                let cell = editables[c];
                let options = cell.optionList();
                for (let o in options){
                    let option = options[o];
                    let good = cell.block.cells.filter(x => x != cell && x.value == 0 && x.optionList().includes(option)).length == 0;
                    good = good || cell.row.cells.filter(x => x != cell && x.value == 0 && x.optionList().includes(option)).length == 0;
                    good = good || cell.column.cells.filter(x => x != cell && x.value == 0 && x.optionList().includes(option)).length == 0;
                    if (good){
                        cell.updateValue(option);
                        return true;
                    }
                }
            }
            return false;
    }

}


class NakedSolver {

   name(){
        return "nakedPairs";
    }
    move(board) {           
            let result = false;
            board.groups.forEach(function(region){
                let candidates = region.cells.filter(x => x.valence() == 2 && x.value == 0); 
                if (candidates.size ==1) return;
                let selected = null;
                let cell = null;
                while(candidates.length >1){
                    cell = candidates.pop();
                    let other = candidates.filter(x => cell.sameOptions(x));
                    if (other.length == 1){
                        selected = other[0];
                        break;
                    }
                }
                if (selected != null){               
                    let options = cell.optionList();
                    //console.log("pair found: " + cell.asString() +  " , " + selected.asString());
                    
                    let toBlock = region.cells.filter(x => (x!= cell)&&(x != selected)&&x.value==0);
                    for (let c in toBlock){
                        //console.log("updating: " + toBlock[c].asString());
                        toBlock[c].exclusions.push(options[0]);
                        toBlock[c].exclusions.push(options[1]);
                       // console.log("to:" + toBlock[c].asString());
                        
                        if (toBlock[c].valence() == 1 && toBlock[c].value == 0){
                            let value = toBlock[c].optionList()[0];
                            toBlock[c].value = value;
                            //console.log("+ updating: " + toBlock[c].asString());
                            result = true;                        
                        } 
                          
                    }                                          
                }
            });
            return result;           
    }
}   

class NakedTripleSolver {

   name(){
        return "nakedTriples";
    }
    move(board) {           
            let result = false;
            board.groups.forEach(function(region){
                let candidates = region.cells.filter(x => x.valence() == 3 && x.value == 0); 
                if (candidates.size <3) return;
                let selected = null;
                let second = null;
                let cell = null;
                while(candidates.length >2){
                    cell = candidates.pop();
                    let other = candidates.filter(x => cell.sameOptions(x));
                    if (other.length == 2){
                        selected = other[0];
                        second = other[1]
                    }
                }
                if (selected != null){               
                    let options = cell.optionList();
                    //console.log("triple found: " + cell.asString() +  " , " + selected.asString() + "," +second.asString());
                    
                    let toBlock = region.cells.filter(x => (x!= cell)&&(x != selected)&&(x != second) && x.value==0);
                    for (let c in toBlock){
                        //console.log("updating: " + toBlock[c].asString());
                        toBlock[c].exclusions.push(options[0]);
                        toBlock[c].exclusions.push(options[1]);
                        toBlock[c].exclusions.push(options[2]);
                        //console.log("to:" + toBlock[c].asString());
                        
                        if (toBlock[c].valence() == 1 && toBlock[c].value == 0){
                            let value = toBlock[c].optionList()[0];
                            toBlock[c].value = value;
                            //console.log("+ updating: " + toBlock[c].asString());
                            result = true;                        
                        } 
                          
                    }                                          
                }
            });
            return result;           
    }
}   


/*
* The currentPositon variable, buttonClicked() function, and Position class 
* are used to interact with the generated board. It relies on the 
* display logic to regester with the 'positionUpdate' event.
* In particular, the board instance needs to be invoked with
* updateFromCurrentPosition() as part of the postionUpdate event flow.
*/

let currentPosition = null;

function buttonClicked(e) {
    let r = e.currentTarget.getAttribute("data-row");
    let c = e.currentTarget.getAttribute("data-column");
    let name = e.currentTarget.getAttribute("data-name");
    currentPosition = new Position(c, r);
    evnts.fireEvent(name);
}

class Position {
    constructor(x, y) {
        this.i = x;
        this.j = y;
    }
}

class Stats {
    constructor (b){
        this.board = b;
    }

    print(){
        this.board.consoleDisplay();
        let freeCount = this.editableCount();
        let clueCount = Math.pow(this.board.n,2) - freeCount;
        console.log("free cells: " + freeCount);
        console.log("clues: " + clueCount);


    }

    editableCount(){
        return this.board.allCells().filter(x => x.editable).length;
    }
}

/*
 * Randomizing backtracking solver classes
 *
 * A Move is a step in the solution - tracks the current
 * cell being considered, and a list of excluded (already tried) 
 * values.
 */

class Move {
    constructor(c) {
        this.cell = c;
        this.exclude = [];
    }

    reset() {
        if (this.cell.editable){
            this.cell.value = 0;
        }
    }

    options() {
        return this.cell.optionList().filter(x => !this.exclude.includes(x));
    }    

    /*
    * An editiable cell can be moved if it has options available,
    * A non-editable cell can be moved only if it has not been 
    * visited as part of the current attempt.
    */
    canMove() {
        if (this.cell.editable){
            return this.options().length != 0;
        } else {
            return this.exclude.length == 0;
        }        
    }

    /*
    * If a cell is editable, take one of the not previously used
    * options. If a cell is not editable, use the only value available,
    * and count it as excluded for the next time.
    */
    move() {
        if (this.cell.editable) {
            let v = randomElement(this.options());
            this.cell.value = v;
            this.exclude.push(v);
        } else {
            this.exclude.push(this.cell.value);
        }
    }

}

/*
 * Takes an initialized board and solves it.
 * 
 * Used to generate completed boards that are
 * then re-opened to create puzzles.
 * let b = new Board(4);
 * b.init();
 * let s = new Solver(b); 
 * s.solve();
 *
 * The solving logic is in the Move class - a random digit is chosen
 * from the values currently available to the cell.
 * The recusive backtracking is done in the Solver class,
 * if the random choice at a given level leads to a dead end, it
 * backs up to the previous move and tries again.
 * Cells with low valence (few options) are selected first in order
 * to speed up the algorithm (fewer dead ends).
 * 
 */

class Solver {
    constructor(b) {
        this.board = b;
        this.moves = [];
        this.cells = this.board.allCells().sort(cellComp);
    }

    forward() {
        this.cells.sort(cellComp);
        this.moves.push(new Move(this.cells.pop()));
    }

    backward() {
        let old = this.moves.pop();
        old.reset();
        this.cells.push(old.cell);
    }

    look() {
        return this.moves[this.moves.length -1];
    }

    continue(){    
        return (this.moves.length != 0) &&(!this.board.isComplete());
    }

    solve() {
        this.forward();
        while (this.continue()){
            this.move();    
        }
        return this.board.isCompleteAndValid();
    }

    move() {        
        let move = this.look();
        if (move.canMove()) {
            move.move();
            this.forward();
        } else {
            this.backward();
        }
   }

}
// end solver classes.

/*
* Utility functions.
*/




function swapTwo(array) {
    let narray = [...array];
    let first = Math.floor(Math.random() * array.length);
    let second = Math.floor(Math.random() * array.length);
    let temp1 = narray[first];
    let temp2 = narray[second];
    narray[first] = temp2;
    narray[second] = temp1;
    return narray;
}

function swapTwoN(array, n) {
    let result = swapTwo(array);
    for (let i = 1; i < n; i++) {
        result = swapTwo(result);
    }
    return result;
}

function baseList(n) {
    let list = [];
    for (let i = 1; i <= n; i++) {
        list.push(i);
    }
    return list;
}

function randomElement(l) {
    let index = Math.floor(Math.random() * l.length);
    return l[index];
}


//uses general solver on a partially complete board;
function runFullSolveTest(){
    console.log("Beginning board generation -> ignore preliminary solver failures");
    let board = new Generator().large();
    board.consoleDisplay();
    console.log("Solving provided board -> no failures expected");
    let solver = new Solver(board);;
    console.log(solver.solve());
    board.consoleDisplay();
    console.log("end test");    
}

function cellComp(a,b){
    return (b.valence() - a.valence());
}

//for node export
try{
    module.exports = new Generator();
} catch(err){
    console.log("non-node execution context")
}
