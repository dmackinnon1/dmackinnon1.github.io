let currentPosition = null;


/*
 * Generates boards of different sizes.
 * Diffic	ulty can be varied through the "openLevel" parameter
 * which determines the maximum valency (number of possible values)
 * of the cells. The higher the maximum valency, the more open 
 * spaces there are, and the more options there can be for some
 * cells.
 */
class Generator {

    /*
     * Small boards are 4x4. Currently returns boards
     * with cells with valence 1-3.
     */
    small() {
        return this.validatedBoard(4, 3);
    }


    /*
     * Large boards are 9x9. Currently returns boards
     * with cells with valence 1-5.
     */
    large() {
        return this.validatedBoard(9, 5);
    }

    validatedBoard(size, openLevel) {
        let b = this.openedBoard(size, openLevel);
        while (!b.canSolve()) {
            console.log("could not solve generated board, getting new one");
            b = this.openedBoard(size, openLevel);
        }
        return b;
    }

    openedBoard(size, openLevel) {
        return this.baseBoard(size).openToValence(openLevel);
    }

    baseBoard(size) {
        let b = new Board(size);
        b.init();
        let s = new Solver(b);
        while (!s.solve()) {
            console.log("failed to generate initial board - retry");
            b = new Board(size);
            b.init();
            s = new Solver(b);
        }
        return b;
    }

}

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
        return notIn;
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

}

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

class Board {
    constructor(size) {
        this.n = size;
        this.available = [];
        this.rows = [];
        this.columns = [];
        this.blocks = [];
        this.cells = [];
        this.hints = true;
    }

    init() {
        for (let i = 0; i < this.n; i++) {
            this.rows.push(new Group("row", i));
            this.columns.push(new Group("column", i));
            this.blocks.push(new Group("block", i));
        }

        for (let i = 0; i < this.n; i++) {
            let col = [];
            for (let j = 0; j < this.n; j++) {
                let row = this.rows[j];
                let column = this.columns[i];
                let block = null;
                //hardcode for n = 4 - will figure out algorithm
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

    openToValence(k) {
        while (this.maxValence() < k) {
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

    drawBoard() {
        let html = "<table>"
        for (let i = 0; i < this.n; i++) {
            html += "<tr";
            if (this.n == 4 && i == 1) {
                html += " style='border-bottom:3px solid #000000'";
            }
            if (this.n == 9 && (i == 2 || i == 5)) {
                html += " style='border-bottom:3px solid #000000'";
            }
            html += ">";
            for (let j = 0; j < this.n; j++) {
                html += "<td";
                if (this.n == 4 && j == 1) {
                    html += " style='border-right:3px solid #000000'";
                }
                if (this.n == 9 && (j == 2 || j == 5)) {
                    html += " style='border-right:3px solid #000000'";
                }
                let style = "style='height:30px; width:30px; padding-top:3px; ";
                html += "><div data-row='" + i + "' data-column='" + j + "'onclick='buttonClicked(event)'"
                if (!this.cells[j][i].editable) {
                    style += " background-color:lightgrey;";
                } else if ((this.cells[j][i].valence() == 1 && this.cells[j][i].value == 0) && this.hints) {
                    style += " background-color:lightgreen;"
                } else if ((!this.cells[j][i].valid && this.cells[j][i].editable) && this.hints) {
                    style += " background-color:pink;";
                }
                style += "'";
                html += style + ">" + this.cells[j][i].value + "</div></td>";
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

    /*
     * This solve method makes no guesses.
     * It fills in values for cells that only
     * have one option, repeating until finished
     * or blocked.
     */
    solve() {
        while (!this.isComplete()) {

            let cell = this.getValenceOne();
            if (cell == undefined) {
                console.log("could not find valence 1 cell");
                return;
            }
            let value = cell.optionList()[0];
            cell.value = cell.optionList()[0];
        }
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

    updateFromCurrentPosition() {
        let cell = this.cells[currentPosition.i][currentPosition.j];
        if (!cell.editable) return;
        cell.updateValue((cell.value + 1) % (board.n + 1));
    }
}

class Position {
    constructor(x, y) {
        this.i = x;
        this.j = y;
    }
}

/*
 * A step in the solution - tracks the current
 * cell being considered, and a list of excluded (already tried) 
 * values.
 */

class Move {
    constructor(c) {
        this.cell = c;
        this.exclude = [];
    }

    reset() {
        this.cell.value = 0;
        this.cell.editable = true;
    }

    options() {
        return this.cell.optionList().filter(x => !this.exclude.includes(x));
    }

    canMove() {
        return this.options().length != 0;
    }

    move() {
        let v = randomElement(this.options());
        this.cell.value = v;
        this.cell.editable = false;
        this.exclude.push(v);
    }

}

/*
 * Takes an initialized board and solves it.
 * Can be used to generate completed boards that are
 * then re-opened to create puzzles.
 * let b = new Board(4);
 * b.init();
 * let s = new Solver(b); 
 * s.solve();
 */

class Solver {
    constructor(b) {
        this.board = b;
        this.index = 0;
        this.moves = [];
        this.cells = this.board.allCells();
    }

    forward() {
        this.moves.push(new Move(this.cells[this.index]));
        this.index++;
    }

    backward() {
        this.moves.pop();
        this.index--;
    }

    look() {
        return this.moves[this.index - 1];
    }

    solve() {
        this.forward();
        return this.move();
    }

    move() {
        if (this.board.isComplete()) {
            return true;
        }
        if (this.moves.length == 0) {
            return false;
        }

        let move = this.look();
        if (move.canMove()) {
            move.move();
            this.forward();
        } else {
            this.backward();
        }
        //recurse
        return this.move();
    }

}

function buttonClicked(e) {
    let r = e.currentTarget.getAttribute("data-row");
    let c = e.currentTarget.getAttribute("data-column");
    currentPosition = new Position(c, r);
    evnts.fireEvent("positionUpdate");
}


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