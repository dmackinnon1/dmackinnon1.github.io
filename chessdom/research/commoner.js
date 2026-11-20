// usage: node commoner.js
// Short range with overlap (commoner: moves like a king, but can be captured) vs short range without (knight).
// 8 pieces, 2 captures each, no king. The commoner exists only inside this experiment.
const { game, analyse, layoutOf } = require('./solver.js');
const vm = require('vm');
vm.runInContext('MOVES.commoner = cell => cell.steps(KING_STEPS);', game);
for (const type of ['knight', 'commoner', 'rook', 'bishop', 'queen']) {
  const ps = [];
  for (let n = 0; n < 150; n++) {
    const pz = game.generateCapturePuzzle(8, false, type, 7, 2);
    if (pz) ps.push(analyse(2, layoutOf(pz)).pRandom);
  }
  ps.sort((a, b) => a - b);
  console.log(`${type.padEnd(8)} typical solve chance 1 in ${Math.round(1 / ps[Math.floor(ps.length / 2)])} (${ps.length} puzzles)`);
}
