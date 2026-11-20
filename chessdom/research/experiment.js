// For one capture limit: generate puzzles for every piece count and setting, and record how hard each is.
// usage: node experiment.js <maxCaptures> <puzzlesPerSetting> <maxPieces>
//   e.g. node experiment.js 2 10 14   (writes results/results_2.json; takes about half an hour)
const { game, analyse, layoutOf } = require('./solver.js');
const fs = require('fs'), path = require('path');
const maxCaptures = +process.argv[2], perSetting = +process.argv[3], maxPieces = +process.argv[4];

// estimate pRandom by playing randomly (for puzzles too big to explore fully)
function playouts(layout, n) {
  let wins = 0;
  for (let k = 0; k < n; k++) {
    const board = new game.Board(8), puzzle = new game.CapturePuzzle(board, maxCaptures);
    for (const [type, r, c, count] of layout) { const p = new game.CapturePiece(type); p.setCell(board.getCell(r, c)); p.count = count; puzzle.addPiece(p); }
    while (puzzle.pieces.length > 1) {
      const moves = [];
      puzzle.pieces.forEach(p => { if (p.canMove()) puzzle.pieces.forEach(q => { if (p !== q && q.type !== 'king' && p.pieceIsReachable(q)) moves.push([p, q]); }); });
      if (!moves.length) break;
      const [p, q] = moves[Math.floor(Math.random() * moves.length)];
      puzzle.capture(p, q);
    }
    if (puzzle.pieces.length === 1) wins++;
  }
  return wins / n;
}

const rows = [];
for (let pieces = 3; pieces <= maxPieces; pieces++) {
  for (const kings of [true, false]) for (const type of ['all', 'knight', 'rook', 'bishop', 'queen']) {
    for (let n = 0; n < perSetting; n++) {
      const puzzle = game.generateCapturePuzzle(8, kings, type, pieces - 1, maxCaptures);
      if (!puzzle) { rows.push({ maxCaptures, pieces, kings, type, failed: true }); continue; }
      const layout = layoutOf(puzzle);
      let r;
      try { r = analyse(maxCaptures, layout, 150000); r.exact = true; }
      catch (e) { r = { pRandom: playouts(layout, 4000), exact: false }; }
      rows.push({ maxCaptures, pieces, kings, type, ...r });
    }
  }
  process.stderr.write(`limit ${maxCaptures}: ${pieces} pieces done\n`);
}
fs.writeFileSync(path.join(__dirname, 'results', `results_${maxCaptures}.json`), JSON.stringify(rows));
