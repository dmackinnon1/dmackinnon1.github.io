// usage: node piece_types.js   (slow: the queen part takes the longest)
// Why are knight puzzles hard? For single-type puzzles (no king, 2 captures, 8 pieces), look at
//  - how many captures are available each turn, and how many of them still allow a win
//  - how play gets stuck: a piece nobody can reach and that can't reach anyone ("stranded"), or not
//  - how often a capture makes a new capture possible that wasn't possible before ("opens a line")
const { game, analyse, layoutOf } = require('./solver.js');
const maxCaptures = 2, pieces = 8, N = 150;

function build(layout) {
  const board = new game.Board(8), puzzle = new game.CapturePuzzle(board, maxCaptures);
  for (const [type, r, c, count] of layout) { const p = new game.CapturePiece(type); p.setCell(board.getCell(r, c)); p.count = count; puzzle.addPiece(p); }
  return puzzle;
}
const legal = pz => { const m = []; pz.pieces.forEach((p, i) => { if (p.canMove()) pz.pieces.forEach((q, j) => { if (i !== j && q.type !== 'king' && p.pieceIsReachable(q)) m.push([i, j]); }); }); return m; };
const after = (L, i, j) => { const n = L.map(x => [...x]); n[i][1] = L[j][1]; n[i][2] = L[j][2]; n[i][3]++; n.splice(j, 1); return n; };
// attack pairs among the pieces, ignoring whether the attacker still has captures left
const attackPairs = pz => { const s = new Set(); pz.pieces.forEach((p, i) => pz.pieces.forEach((q, j) => { if (i !== j && p.pieceIsReachable(q)) s.add(p.cell.position() + '>' + q.cell.position()); })); return s; };

for (const type of ['knight', 'rook', 'bishop', 'queen']) {
  const st = { puzzles: 0, p: [], choices: 0, good: 0, turns: 0, stuck: 0, stranded: 0, opened: 0, captures: 0, attackersPerPiece: 0, piecesSeen: 0 };
  for (let n = 0; n < N; n++) {
    const pz0 = game.generateCapturePuzzle(8, false, type, pieces - 1, maxCaptures);
    if (!pz0) continue;
    st.puzzles++;
    const start = layoutOf(pz0);
    st.p.push(analyse(maxCaptures, start).pRandom);
    // random games: at each turn, count choices and winning choices
    for (let g = 0; g < 20; g++) {
      let L = start.map(x => [...x]);
      while (L.length > 1) {
        const pz = build(L), moves = legal(pz);
        pz.pieces.forEach(q => { st.attackersPerPiece += pz.pieces.filter(p => p !== q && p.pieceIsReachable(q)).length; st.piecesSeen++; });
        if (!moves.length) {
          st.stuck++;
          if (pz.pieces.some(q => q.inNeighbors().length === 0 && q.outNeighbors().length === 0)) st.stranded++;
          break;
        }
        st.turns++; st.choices += moves.length;
        st.good += moves.filter(([i, j]) => analyse(maxCaptures, after(L, i, j)).pRandom > 0).length;
        const [i, j] = moves[Math.floor(Math.random() * moves.length)];
        const before = attackPairs(pz);
        const next = after(L, i, j), pzNext = build(next);
        // a pair (other than involving the capturer) that can attack now but couldn't before = a line opened
        const capturer = pzNext.pieces[i < j ? i : i - 1].cell.position();
        const opened = [...attackPairs(pzNext)].some(k => !before.has(k) && !k.startsWith(capturer + '>') && !k.endsWith('>' + capturer));
        st.captures++; if (opened) st.opened++;
        L = next;
      }
    }
  }
  const med = [...st.p].sort((a, b) => a - b)[Math.floor(st.p.length / 2)];
  console.log(`${type.padEnd(7)} solve chance 1 in ${Math.round(1 / med)} | ${(st.choices / st.turns).toFixed(1)} captures available per turn, ` +
    `${(100 * st.good / st.choices).toFixed(0)}% of them still winnable | each piece attacked by ${(st.attackersPerPiece / st.piecesSeen).toFixed(1)} others on average | ` +
    `stuck games with a stranded piece: ${(100 * st.stranded / st.stuck).toFixed(0)}% | captures that open a new line for other pieces: ${(100 * st.opened / st.captures).toFixed(0)}%`);
}
