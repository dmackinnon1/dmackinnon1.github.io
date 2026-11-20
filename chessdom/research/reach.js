// usage: node reach.js
// After a piece captures, how many of the pieces it could capture before can it still capture?
const { game, layoutOf } = require('./solver.js');
for (const type of ['knight', 'rook', 'bishop', 'queen']) {
  let before = 0, kept = 0, captures = 0;
  for (let n = 0; n < 300; n++) {
    const pz = game.generateCapturePuzzle(8, false, type, 7, 2);
    // play random captures, measuring each one
    while (pz.pieces.length > 1) {
      const moves = [];
      pz.pieces.forEach(p => { if (p.canMove()) pz.pieces.forEach(q => { if (p !== q && p.pieceIsReachable(q)) moves.push([p, q]); }); });
      if (!moves.length) break;
      const [p, q] = moves[Math.floor(Math.random() * moves.length)];
      const oldTargets = pz.pieces.filter(o => o !== p && o !== q && p.pieceIsReachable(o));
      pz.capture(p, q);
      before += oldTargets.length; kept += oldTargets.filter(o => p.pieceIsReachable(o)).length; captures++;
    }
  }
  console.log(`${type.padEnd(7)} after a capture, keeps ${(100 * kept / before).toFixed(0)}% of the other pieces it could already capture (${captures} captures)`);
}
