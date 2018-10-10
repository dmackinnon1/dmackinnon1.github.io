"use strict"

let sentries = {}; 
sentries.puzzles = []; 
sentries.activeSet = []; 
sentries.selected = null; //the puzzle selected for the user 
// UI must initialize display elements
let display = {};
display.versionDescription = null;
display.puzzleTitle = null;
display.puzzleIntro = null;
display.puzzleDescription = null;
display.explanationDisplay = null;
display.disabled = false;
display.solutionDisplay = null;
display.treasureDisplay = null;

// the initial page layout, populating the display elements
function formatPuzzle(pc) {
	let pi = display.puzzleIntro;
	let pd = display.puzzleDescription;
	let pt = display.puzzleTitle;
	let dd = display.treasureDisplay;
	dd.innerHTML = pc.treasureDisplay();
	pt.innerHTML = pc.puzzleTitle()
	pi.innerHTML = pc.puzzleIntro();
	let solD = display.solutionDisplay;
	solD.innerHTML ="";
	let ed = display.explanationDisplay;
	ed.innerHTML = "";
}

// called from UI to reset the puzzle
function puzzleReset(url = null) {	
	let id = null;
	if (url != null){
		id = getQueryParameter(url, 'id');
	}
	if  (sentries.activeSet.length == 0) {
	 sentries.activeSet = sentries.puzzles;
	}
	let p = null;
	if (id != null) {
		p = getPuzzleWithId(id);
 	}
 	if (p == null) {
		p = randomElement(sentries.activeSet);	
 	}
 	sentries.selected = new PuzzleController(p);
 	sentries.activeSet = removeElement(sentries.activeSet,p);
	formatPuzzle(sentries.selected);	
  	sentries.answered = false;
	display.disabled = false;
	updateAllButtons();
	console.log(sentries.selected)
}

function getPuzzleWithId(id) {
	let x = null;
	for (x in sentries.activeSet){
		let p = sentries.activeSet[x];
		 if (p.id == id){
		 	return p;
		 }
	}
	console.log('No puzzle with provided id was found in active set: ' + id);
	return null;
}

/*
* Renders the selected puzzle and tracks puzzle data.
*/
class PuzzleController {
	constructor(p){
		this.puzzle = p;
		this.treasure = null;
	}
	
	puzzleIntro() {
		let txt = "<ul><li> Guard 1 says: " + this.puzzle.guard1 + "</li>";
		txt +="<li> Guard 2 says: " + this.puzzle.guard2 + "</li>";
		txt += "</ul>";
		return txt;
	}

	treasureDisplay(){
		let treasures = ['copper', 'silver', 'gold', 'platinum', 'diamonds', 'rubies'];
		let text = "<table>"
		for (let d in treasures){
			let dc = new TreasureController(treasures[d]);
			text += "<tr>"
			text += dc.display();
			text += "</tr>"
		}
		text += "</table>"
		return text;
	}

	explanationDisplay(){
		let txt = "<br><p> Here is one way to think about it:<br>"
		txt += this.puzzle.explanation;
		txt += "</br>";
		return txt;
	}

	puzzleTitle(){
		return "Puzzle " + this.puzzle.id
	}

}

/*
* Renders UI element for treasure selectors, updates the PuzzleController
* using the associated selecttreasure() function.
*/
class TreasureController {
	constructor(name) {
		this.name = name;
	}

	display() {
		let txt = "glyphicon glyphicon-unchecked";
		let btn = "<td>"+ this.name+"</td>"; 
		btn +=  "<td><button type='button' id='treasure_"+ this.name + "' class='treasure-btn btn btn-secondary', onclick='selecttreasure(event)'>";
		btn += "<span class='glypicon " + txt + " lrg-font'></span>"
		btn += "</button></td>";
		return btn;		
	}	
}
//used with TreasureController
function selecttreasure(event) {
	if (display.disabled) return;
	let id = event.currentTarget.id;
	let treasure = id.substring(id.indexOf('_')+1, id.length);
	sentries.selected.treasure = treasure;
	updateAllButtons(treasure)
};

//used with TreasureController and puzzleReset
function updateAllButtons(treasure){
	$(".treasure-btn").removeClass("btn-primary");	
	$(".treasure-btn").addClass("btn-secondary");	
	$(".treasure-btn").html("<span class='glypicon glyphicon glyphicon-unchecked lrg-font'></span>");

	$("#treasure_" + treasure).removeClass("btn-secondary");
	$("#treasure_" + treasure).addClass("btn-primary");
	$("#treasure_" + treasure).html("<span class='glypicon glyphicon glyphicon-ok lrg-font'></span>");	
};

//called from UI to solve the puzzle
function solvePuzzle(){
	display.disabled = true;
	let solD = display.solutionDisplay;
	let txt = ""
	if (sentries.selected.treasure == sentries.selected.puzzle.solution){
		txt = "You said the treasure is " + sentries.selected.treasure + ".";
		txt += " <em> You were right. </em>";
	} else if (sentries.selected.treasure == null){
		txt = "You did not pick a treasure. It turns out that thtreasure  is ";
		txt += sentries.selected.puzzle.solution + ".";
	} else {
		txt = "You said the treasure is " + sentries.selected.treasure + ".";
		txt += "<em> You were wrong</em>, it is actually " + sentries.selected.puzzle.solution + ".";
	}
	solD.innerHTML = txt;
}; 

//called from UI to explain the puzzle
function explainPuzzle(){
	let ed = display.explanationDisplay;
	ed.innerHTML = sentries.selected.explanationDisplay();
};

