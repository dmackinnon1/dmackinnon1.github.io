// Exact difficulty measures for a Piece Meal puzzle, found by exploring every line of play.
// Loads the game's own code from ../js, so the rules are exactly the ones the page uses.
// Run it directly (node solver.js) for a quick self-check on a few generated puzzles.
//   pRandom   - chance that a player who picks uniformly among the legal captures each turn solves it
//   solutions - number of different winning capture sequences
//   states    - positions explored (how big the search was)
// Uses the game's own rules: CapturePiece.pieceIsReachable, remainingMoves, and "the king can't be captured".
const fs = require('fs'), vm = require('vm'), path = require('path');
function loadGame() {
  const ctx = { console, Math }; ctx.document = { getElementById: () => null }; vm.createContext(ctx);
  for (const f of ['evnts', 'bldrs', 'chess_base', 'capture']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f + '.js'), 'utf8'), ctx);
  // class declarations aren't properties of the global object, so hand them out explicitly
  vm.runInContext('this.Board = Board; this.CapturePuzzle = CapturePuzzle; this.CapturePiece = CapturePiece;', ctx);
  return ctx;
}
const game = loadGame();

// rebuild a puzzle from a list of [type, row, col, count] on a fresh board
function build(maxCaptures, layout) {
  const board = new game.Board(8);
  const puzzle = new game.CapturePuzzle(board, maxCaptures);
  for (const [type, r, c, count] of layout) {
    const p = new game.CapturePiece(type); p.setCell(board.getCell(r, c)); p.count = count; puzzle.addPiece(p);
  }
  return puzzle;
}
const layoutOf = puzzle => puzzle.pieces.map(p => [p.type, p.cell.rowNum, p.cell.colNum, p.count]);
const keyOf = layout => layout.map(x => x.join(',')).sort().join(';');

// all legal captures as [attackerIndex, targetIndex]
function legalCaptures(puzzle) {
  const moves = [];
  puzzle.pieces.forEach((p, i) => {
    if (!p.canMove()) return;
    puzzle.pieces.forEach((q, j) => { if (i !== j && q.type !== 'king' && p.pieceIsReachable(q)) moves.push([i, j]); });
  });
  return moves;
}

// the layout after attacker i captures target j
function after(layout, i, j) {
  const next = layout.map(x => [...x]);
  next[i][1] = layout[j][1]; next[i][2] = layout[j][2]; next[i][3] += 1;
  next.splice(j, 1);
  return next;
}

function analyse(maxCaptures, startLayout, stateLimit = 200000) {
  const memo = new Map();
  let states = 0;
  function visit(layout) {
    const key = keyOf(layout);
    if (memo.has(key)) return memo.get(key);
    if (++states > stateLimit) throw new Error('too big');
    let result;
    if (layout.length === 1) result = { p: 1, solutions: 1 };
    else {
      const moves = legalCaptures(build(maxCaptures, layout));
      if (moves.length === 0) result = { p: 0, solutions: 0 };
      else {
        let p = 0, solutions = 0;
        for (const [i, j] of moves) { const r = visit(after(layout, i, j)); p += r.p; solutions += r.solutions; }
        result = { p: p / moves.length, solutions };
      }
    }
    memo.set(key, result);
    return result;
  }
  const r = visit(startLayout);
  return { pRandom: r.p, solutions: r.solutions, states };
}

module.exports = { game, analyse, layoutOf };

// quick self-check on a few generated puzzles
if (require.main === module) {
  for (const maxCaptures of [1, 2, 3]) for (const depth of [3, 7, 11]) {
    const puzzle = game.generateCapturePuzzle(8, true, 'all', depth, maxCaptures);
    if (!puzzle) { console.log(maxCaptures, depth, 'no puzzle'); continue; }
    const t = Date.now();
    try { const r = analyse(maxCaptures, layoutOf(puzzle)); console.log(`limit ${maxCaptures}, ${depth + 1} pieces: pRandom ${r.pRandom.toFixed(4)}, ${r.solutions} solutions, ${r.states} states, ${Date.now() - t} ms`); }
    catch (e) { console.log(`limit ${maxCaptures}, ${depth + 1} pieces: ${e.message}`); }
  }
}
