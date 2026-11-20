// usage: node neighbourhoods.js
// Primary (1-move) and secondary (2-move) neighbourhoods on an empty 8x8 board, using the game's MOVES rules.
// overlap = share of the 1-move squares that can also be reached in exactly two moves.
const { game } = require('./solver.js');
const vm = require('vm');
for (const type of ['knight', 'king', 'rook', 'bishop', 'queen']) {
  const board = new game.Board(8);
  let n1 = 0, n2 = 0, both = 0;
  board.cells.flat().forEach(s => {
    const one = new Set(game.attackedCells(s, type));
    const two = new Set();
    one.forEach(t => game.attackedCells(t, type).forEach(u => { if (u !== s) two.add(u); }));
    n1 += one.size; n2 += two.size; both += [...one].filter(c => two.has(c)).length;
  });
  console.log(`${type.padEnd(7)} 1 move: ${(n1 / 64).toFixed(1)} squares, 2 moves: ${(n2 / 64).toFixed(1)} squares, overlap: ${(100 * both / n1).toFixed(0)}% of the 1-move squares`);
}
