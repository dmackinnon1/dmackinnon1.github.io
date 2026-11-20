// Summarise results: for each piece count, the typical difficulty as "1 in N" (N = 1 / pRandom),
// using the median across all settings, plus the spread between settings.
// usage: node summarise.js results/results_1.json results/results_2.json results/results_3.json
const fs = require('fs');
const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
const fmt = p => p > 0 ? ('1 in ' + Math.round(1 / p)).padStart(11) : '  (never)  ';
for (const file of process.argv.slice(2)) {
  const rows = JSON.parse(fs.readFileSync(file));
  const limit = rows[0].maxCaptures;
  console.log(`\n== ${limit} capture(s) per piece: typical chance a random player solves it`);
  console.log('pieces   all settings   with king  no king    knight     rook       bishop     queen      mixed     failed  estimated');
  const byPieces = {};
  rows.forEach(r => (byPieces[r.pieces] ??= []).push(r));
  for (const [pieces, rs] of Object.entries(byPieces)) {
    const ok = rs.filter(r => !r.failed);
    const m = f => fmt(median(ok.filter(f).map(r => r.pRandom)));
    console.log(String(pieces).padStart(4), '  ', m(() => true), m(r => r.kings), m(r => !r.kings),
      m(r => r.type === 'knight'), m(r => r.type === 'rook'), m(r => r.type === 'bishop'), m(r => r.type === 'queen'), m(r => r.type === 'all'),
      String(rs.length - ok.length).padStart(6), String(ok.filter(r => !r.exact).length).padStart(8));
  }
}
