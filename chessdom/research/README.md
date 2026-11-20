# Piece Meal difficulty research

Notes and scripts from measuring how hard Piece Meal puzzles are, used to choose the
number of pieces in each level of a puzzle set for 1, 2 and 3 captures per piece.

All scripts load the game's own code from `../js`, so they use exactly the rules the
page uses. They need only Node.js (no packages). Run them from this folder:

| Script | What it does | Time |
|---|---|---|
| `solver.js` | Exact difficulty measures for one puzzle (used by the others). `node solver.js` runs a self-check. | seconds |
| `experiment.js` | For one capture limit, generates 10 puzzles per setting for every piece count and records their difficulty in `results/`. `node experiment.js 2 10 14` | ~30 min |
| `summarise.js` | Prints the tables below from the results files. `node summarise.js results/results_2.json` | instant |
| `neighbourhoods.js` | One-move and two-move neighbourhoods of each piece type on an empty board. | instant |
| `reach.js` | After a capture, how many of its old targets a piece can still capture. | seconds |
| `commoner.js` | Knight vs. a capturable king-like piece: short range with and without overlap. | ~1 min |
| `piece_types.js` | Choices per turn, share still winnable, how play gets stuck, per piece type. | slow (queens) |

`results/` holds the data behind the tables (100 puzzles per piece count per capture limit,
10 for each piece-type setting, with and without a king).

## The difficulty measure

Imagine a **random player** who, every turn, makes one of the legal captures chosen at random.
The chance that this player solves a puzzle is a simple, repeatable measure of difficulty:
if almost any sequence of captures works, the puzzle is easy; if only a few careful sequences
avoid getting stuck, the random player almost always fails.

`solver.js` computes this chance exactly by exploring every line of play from the starting
position (remembering positions it has already seen). It also counts the winning capture
sequences. For puzzles too big to explore fully (some with 11+ pieces), `experiment.js` falls
back to estimating the chance from 4,000 random games, which is rougher, and can't tell apart
anything harder than about 1 in 4,000.

Results are shown as "1 in N": the random player solves the puzzle about once in N tries.
Each number is the middle value (median) of the puzzles measured.

## Levels

Typical difficulty by number of pieces (all settings together):

| Pieces | 1 capture | 2 captures | 3 captures |
|---:|---:|---:|---:|
| 4 | 1 in 5 | 1 in 3 | 1 in 3 |
| 5 | 1 in 7 | 1 in 6 | 1 in 5 |
| 6 | 1 in 20 | 1 in 13 | 1 in 11 |
| 7 | 1 in 31 | 1 in 24 | 1 in 17 |
| 8 | 1 in 88 | 1 in 45 | 1 in 22 |
| 9 | 1 in 267 | 1 in 87 | 1 in 45 |
| 10 | 1 in 1,042 | 1 in 190 | 1 in 104 |
| 11 | 1 in 6,897 | 1 in 328 | 1 in 155 |
| 12 | 1 in 31,189 | 1 in 609 | 1 in 232 |
| 13 | – | 1 in 667 | 1 in 286 |
| 14 | – | 1 in 1,333 | 1 in 571 |

A good set gets steadily harder, each puzzle a few times harder than the one before.

- **2 captures** (the original rule): the hand-picked levels of 4, 6, 8, 10 and 12 pieces come out
  at 1 in 3, 13, 45, 190 and 609, each level about 3½–4 times harder than the last. Kept as they were.
- **3 captures**: each extra piece adds less difficulty, so the same levels made an easier set.
  4, 6, 9, 11 and 14 pieces (1 in 3, 11, 45, 155, 571) match the 2-capture set level for level.
- **1 capture**: each extra piece adds a lot, but large puzzles often can't be generated
  (see below). 4, 5, 6, 8 and 9 pieces (about 1 in 5, 7, 20, 88, 267) is the steadiest ramp
  that can always be made. This set ends easier than the others.

In `capture.html` these are stored as the number of captures needed (one less than the pieces):

```js
var LEVELS = { 1: [3,4,5,7,8], 2: [3,5,7,9,11], 3: [3,5,8,10,13] };
```

### One capture per piece: everything happens on one square

With a limit of 1, after A takes B, A can't capture again, so the only way forward is for
another piece to take A, on the square where B was. Every capture in the puzzle lands on that
same square. So every piece except the one starting there must be able to reach it, which caps the
size of some puzzles (a square can be reached by at most 8 knights, so knight puzzles have at
most 9 pieces), and the puzzle reduces to spotting that square and finding the order.

## Why knight puzzles are the hardest

At 2 captures, 8 pieces and no king, single-type puzzles come out at:

| Piece | Typical solve chance | Captures available per turn | Share of those still winnable | Old targets kept after a capture |
|---|---:|---:|---:|---:|
| knight | 1 in 124 | 9.0 | 31% | 0% |
| rook | 1 in 29 | 8.3 | 39% | 35% |
| bishop | 1 in 26 | 8.6 | 48% | 32% |
| queen | 1 in 11 | 11.0 | 68% | 40% |
| *commoner* | 1 in 13 | | | |

(*Commoner*: a test-only piece that moves like a king but can be captured. Solve chances are from
`commoner.js`; the other columns are from `piece_types.js` and `reach.js`, on separate samples of puzzles.)

The knight isn't hard because there are fewer captures to choose from: it has about as many
choices per turn as the others. It's hard because fewer of those choices keep the puzzle solvable,
and every stuck game ends with a stranded piece that nothing can reach.

The explanation is the overlap between a piece's **primary neighbourhood** (squares it reaches in
one move) and its **secondary neighbourhood** (squares it reaches in two moves). On an empty board:

| Piece | 1-move squares | 2-move squares | Overlap |
|---|---:|---:|---:|
| knight | 5.3 | 16.9 | **0%** |
| king | 6.6 | 17.1 | 100% |
| bishop | 8.8 | 30.9 | 99% |
| rook | 14.0 | 63.0 | 100% |
| queen | 22.8 | 63.0 | 100% |

Every knight move changes square colour, so its one-move squares are all one colour and its
two-move squares all the other: the two neighbourhoods never meet. In Piece Meal that means a
knight that captures loses every target it had and starts again with a completely new set, and
the pieces it could have taken are left behind. A rook, bishop or queen keeps the line it moved
along, and about a third of its old targets.

The commoner settles whether short range alone is the cause: it has the knight's short range,
but full overlap, and its puzzles are about as easy as queen puzzles. Range matters much less
than overlap.

## Caveats

- Real players aren't random: they plan ahead and use logic. The measure ranks puzzles sensibly,
  but "1 in 600" is not a human solve rate. For 1 capture per piece in particular, the
  one-square shortcut makes puzzles easier for a person than the numbers suggest.
- Piece type matters more than the capture limit: at 2 captures and 12 pieces, knight puzzles are
  about 1 in 4,000 and queen puzzles about 1 in 80. One set of levels can't be equally hard for
  every setting; separate levels per piece type would be the next refinement.
- 100 puzzles per piece count gives a reasonable median, but individual puzzles vary a lot, and
  the 12–14 piece figures are estimates from random games.

## Open questions

Ideas from discussing the puzzles, not yet measured:

- **Safe Harbour colouring**: the regions add a rule (fewer valid answers) but also give
  information (small regions force placements). Count valid placements with and without regions,
  and how far a simple deduction solver gets before it has to guess, for each piece type.
- **Region shapes give a hint**: each region grows outward from its solution square, so that
  square tends to sit near the middle of its region. How strong is this, and does growing regions
  differently remove it?
- **Generated Puzzles-page puzzles**: every maximal independent set is also dominating, so the
  independent-set generator always makes valid "independent and dominating" puzzles, but usually
  of middling size. How often does keeping the smallest or largest of many attempts find the
  true extremes?
- **Board size**: how difficulty and generation failures change on other board sizes.
