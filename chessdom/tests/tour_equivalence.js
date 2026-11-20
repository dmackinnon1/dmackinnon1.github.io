// Checks that the shared tour code (js/chess_base.js + js/tour.js) behaves exactly like
// kixote's original code (kept in tests/kixote_original/ for this test), given the same random numbers. Needs only Node.js:
//   node tests/tour_equivalence.js        (from the repository folder; takes a few seconds)
// It compares moves for every piece type, generated tours, whole puzzles after making them
// unique, every solution the solver finds, and the tour maps.
const fs = require('fs'), vm = require('vm'), path = require('path');
const repo = path.join(__dirname, '..');
function sandbox(files, seed) {
  const ctx = { console: { log() {} }, Math: Object.create(Math) };
  let s = seed; ctx.Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647;
  ctx.reseed = v => { s = v; };
  vm.createContext(ctx);
  files.forEach(f => vm.runInContext(fs.readFileSync(path.join(repo, f), 'utf8'), ctx));
  return ctx;
}
const oldCtx = sandbox(['tests/kixote_original/evnts.js', 'tests/kixote_original/bldrs.js', 'tests/kixote_original/chess_base.js', 'tests/kixote_original/puzzles.js', 'tests/kixote_original/solver.js'], 1);
const newCtx = sandbox(['js/evnts.js', 'js/bldrs.js', 'js/chess_base.js', 'js/tour.js'], 1);
const run = (ctx, code) => vm.runInContext(code, ctx);
const NEW_NAME = { numbrix: 'wazir' };
run(newCtx, `function numbrixHidden(t) {
  let hidden = new Set(t.cells.filter((c, i) => i % 2 == 1));
  t.board.cells.flat().forEach(c => {
    let i = c.rowNum, j = c.colNum;
    if (i == 0 || j == 0 || i == 7 || j == 7 || (i > 2 && j > 2 && i < 6 && j < 6)) hidden.add(c);
  });
  hidden.delete(t.cells[0]); hidden.delete(t.cells[63]);
  return hidden;
}`);
let failures = 0;
const check = (label, a, b) => { const same = JSON.stringify(a) === JSON.stringify(b); if (!same) failures++; console.log((same ? 'same     ' : 'DIFFERENT') + ' ' + label); return same; };

// 1. moves from every square
for (const [rows, cols] of [[8, 8], [5, 6]]) for (const type of ['knight', 'king', 'numbrix', 'rook', 'bishop', 'queen']) {
  let old;
  try { old = run(oldCtx, `CellType = "${type}"; var b = new Board(${rows}, ${cols}); b.init(); b.cells.flat().map(c => c.toString() + ':' + c.neighbors().map(n => n.toString()).join(''))`); }
  catch (e) { console.log(`old code crashes: ${type} on ${rows}x${cols} (${e.message})`); continue; }
  const neu = run(newCtx, `var b = new Board(${rows}, ${cols}); b.cells.flat().map(c => '(' + c.rowNum + ',' + c.colNum + '):' + attackedCells(c, "${NEW_NAME[type] || type}").map(n => '(' + n.rowNum + ',' + n.colNum + ')').join(''))`);
  check(`moves: ${type} on ${rows}x${cols}`, old, neu);
}

// 2. generated tours (same random numbers on both sides)
for (const type of ['knight', 'king', 'numbrix']) {
  let same = 0, n = 150;
  for (let k = 0; k < n; k++) {
    oldCtx.reseed(1000 + k); newCtx.reseed(1000 + k);
    const old = run(oldCtx, `CellType = "${type}"; var pb = new PathBuilder(); pb.init(); pb.path.cells.map(c => [c.rowNum, c.colNum])`);
    const neu = run(newCtx, `var t = generateTour(new Board(8), "${NEW_NAME[type] || type}"); t.cells.map(c => [c.rowNum, c.colNum])`);
    if (JSON.stringify(old) === JSON.stringify(neu)) same++;
  }
  check(`tours: ${type}, ${n} random tours identical (${same}/${n})`, same, n);
}

// 3. whole puzzles: tour, hiding rule, then made unique
const HIDE = {
  // the hiding rules from kixote's puzzles.js, as lists of tour positions
  knight: `range(64).filter(i => (i % 2 == 1 || i % 7 == 1) && i != 63)`,
  king: `range(64).filter(i => (i % 2 == 1 || i % 11 == 1) && i != 63)`,
  numbrix: `null`,
};
for (const [type, cls] of [['knight', 'Kixote'], ['king', 'Hidato'], ['numbrix', 'Numbrix']]) {
  let same = 0, n = 60;
  for (let k = 0; k < n; k++) {
    oldCtx.reseed(5000 + k); newCtx.reseed(5000 + k);
    const old = run(oldCtx, `game = new ${cls}(); game.init(); new Fixer(game).fix();
      [game.path.cells.map(c => [c.rowNum, c.colNum]), game.path.cells.map((c, i) => c.hide ? i : -1).filter(i => i >= 0)]`);
    const neu = run(newCtx, `var t = generateTour(new Board(8), "${NEW_NAME[type] || type}");
      var hidden = new Set(${HIDE[type]} ? (${HIDE[type]}).map(i => t.cells[i]) : numbrixHidden(t));
      makeUnique(t, hidden);
      [t.cells.map(c => [c.rowNum, c.colNum]), t.cells.map((c, i) => hidden.has(c) ? i : -1).filter(i => i >= 0)]`);
    if (JSON.stringify(old) === JSON.stringify(neu)) same++;
  }
  check(`puzzles: ${cls}, ${n} puzzles with identical hidden squares after making them unique (${same}/${n})`, same, n);
}

// 4. all solutions for random hidden sets (like the Generator page), on knight and king tours
for (const type of ['knight', 'king']) {
  let same = 0, n = 80, total = 0;
  for (let k = 0; k < n; k++) {
    oldCtx.reseed(9000 + k); newCtx.reseed(9000 + k);
    // build the tour on the old side, then copy it and the hidden squares to the new side
    const setup = run(oldCtx, `CellType = "${type}"; game = new PathBuilder(); game.init();
      var hideIdx = range64().filter(i => i > 0 && Math.random() < 0.35);
      hideIdx.forEach(i => game.path.cells[i].hideIt());
      [game.path.cells.map(c => [c.rowNum, c.colNum]), hideIdx]`.replace('range64()', '[...Array(64).keys()]'));
    const old = run(oldCtx, `var s = new Solver(game); s.init(); s.solve().map(x => [x.solutionPath.map(c => [c.rowNum, c.colNum]), x.mismatches])`);
    newCtx.setup = setup;
    const neu = run(newCtx, `var b = new Board(8); var t = new Tour(b, "${type}"); setup[0].forEach(([r, c]) => t.add(b.getCell(r, c)));
      var hidden = new Set(setup[1].map(i => t.cells[i]));
      findSolutions(t, hidden).map(x => [x.cells.map(c => [c.rowNum, c.colNum]), x.mismatches])`);
    total += old.length;
    if (JSON.stringify(old) === JSON.stringify(neu)) same++;
  }
  check(`solver: ${type}, ${n} random hidden sets, identical solution lists (${same}/${n}, ${total} solutions in all)`, same, n);
}

// 5. tour maps
{
  let same = 0, n = 20;
  for (let k = 0; k < n; k++) {
    oldCtx.reseed(300 + k);
    const old = run(oldCtx, `CellType = "knight"; var pb = new PathBuilder(); pb.init(); var part = pb.path.cells.slice(0, ${3 + k}); [svgMap(part), part.map(c => [c.rowNum, c.colNum])]`);
    newCtx.cellsAt = old[1];
    const neu = run(newCtx, `var b = new Board(8); svgTourMap(cellsAt.map(([r, c]) => b.getCell(r, c)))`);
    if (old[0] === neu) same++;
  }
  check(`maps: 8x8 tour pictures identical (${same}/${n})`, same, n);
  const oldWide = run(oldCtx, `var b = new Board(5, 6); b.init(); svgMap([b.cells[0][0], b.cells[1][2], b.cells[4][5]], 5, 6)`);
  const newWide = run(newCtx, `var b = new Board(5, 6); svgTourMap([b.getCell(0,0), b.getCell(1,2), b.getCell(4,5)], 5, 6)`);
  check('maps: 5x6 tour picture identical', oldWide, newWide);
}
console.log(failures ? `\n${failures} difference(s)` : '\nall the same');
process.exitCode = failures ? 1 : 0;
