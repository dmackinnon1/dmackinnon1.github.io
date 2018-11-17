"use strict"

let deeDum = {}; 
deeDum.puzzles = []; 
deeDum.activeSet = []; 
deeDum.selected = null; //the puzzle selected for the user 
let bro0 = {};
let bro1 = {};
bro0.name = "Tweedledee";
bro1.name = "Tweedledum";
bro0.card = "red";
bro1.card = "red";

// UI must initialize display elements
let display = {};
display.versionDescription = null;
display.puzzleTitle = null;
display.puzzleIntro = null;
display.puzzleDescription = null;
display.explanationDisplay = null;
display.disabled = false;
display.solutionDisplay = null;
display.goalDisplay = null;

// the initial page layout, populating the display elements
function formatPuzzle(pc) {
	let pi = display.puzzleIntro;
	let pd = display.puzzleDescription;
	let pt = display.puzzleTitle;
	let dg = display.goalDisplay;
	dg.innerHTML = pc.goalDisplay();
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
	if  (deeDum.activeSet.length == 0) {
	 deeDum.activeSet = deeDum.puzzles;
	}
	let p = null;
	if (id != null) {
		p = getPuzzleWithId(id);
 	}
 	if (p == null) {
		p = randomElement(deeDum.activeSet);	
 	}
 	deeDum.selected = new PuzzleController(p);
 	deeDum.activeSet = removeElement(deeDum.activeSet,p);
	bro0.name = "Tweedledee";
	bro1.name = "Tweedledum";
	bro0.card = "red";
	bro1.card = "red";
	formatPuzzle(deeDum.selected);	
  	deeDum.answered = false;
	display.disabled = false;
	updateAllButtons();
	console.log(deeDum.selected)
}

function getPuzzleWithId(id) {
	let x = null;
	for (x in deeDum.activeSet){
		let p = deeDum.activeSet[x];
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
	}
	
	puzzleIntro() {
		let txt = "<ul><li> The first brother says: <strong>" + this.puzzle.bro0 + "</strong></li>";
		txt +="<li> The second brother says: <strong>" + this.puzzle.bro1 + "</strong></li>";
		txt += "</ul>";
		return txt;
	}

	goalDisplay(){
		let text = "<table><tbody><tr>";
		text += "<th>brother</th><th>Tweedledee</th> <th>Tweedledum</th></tr>";
		text += this.nameDisplay(0, ["Tweedledee","Tweedledum"]);
		text += this.nameDisplay(1, ["Tweedledee","Tweedledum"]);
		text += "</tbody></table>"
		text += "<br><br>";
		text += "<table><tbody><tr>";
		text += "<th>brother</th><th>Red</th> <th>Black</th></tr>";
		text += this.nameDisplay(0, ["red","black"]);
		text += this.nameDisplay(1, ["red","black"]);
		text += "</tbody></table>"
		text += "<br>";
		return text;
	}

	nameDisplay(bro, variable){
		let btxt = "First Brother";
		if (bro === 1){
			btxt = "Second Brother";
		}
		let check = "glyphicon glyphicon-unchecked";
		let txt = "<tr><td>";
		txt += btxt + "</td><td>";
		txt +=  "<button type='button' id='"+ variable[0] +"_"+ bro + "' class='name-btn btn btn-secondary', onclick='selectName(event)'>";
		txt += "<span class='glypicon " + check + " lrg-font'></span>"
		txt += "</button></td><td>";
		txt +=  "<button type='button' id='"+ variable[1] +"_"+ bro + "' class='name-btn btn btn-secondary', onclick='selectName(event)'>";
		txt += "<span class='glypicon " + check + " lrg-font'></span>"
		txt += "</button></td></tr>";
		return txt;
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

function other(broName){
	if (broName == "Tweedledum") return "Tweedledee";
	return "Tweedledum";
}

function selectName(event) {
	let id = event.currentTarget.id;
	console.log(id);
	let val = id.substring(0,id.indexOf("_"));
	let bro = parseInt(id.substring(id.indexOf("_") +1));
	console.log("bro: " + bro + " val: " + val);
	if (bro === 0){
		if (val == "red" || val == "black"){
			bro0.card = val;
		} else {
			bro0.name = val;
			bro1.name = other(val);
		}
	} else {
		if (val == "red" || val == "black"){
			bro1.card = val;
		} else {
			bro1.name = val;
			bro0.name = other(val);
		}
	}
	console.log("bro0:" + bro0.name + ", " + bro0.card);
	console.log("bro1:" + bro1.name + ", " + bro1.card);
	updateAllButtons();
};



//used with TreasureController and puzzleReset
function updateAllButtons(){
	$(".name-btn").removeClass("btn-primary");	
	$(".name-btn").addClass("btn-secondary");	
	$(".name-btn").html("<span class='glypicon glyphicon glyphicon-unchecked lrg-font'></span>");

	$("#" + bro0.name + "_0").removeClass("btn-secondary");
	$("#" + bro0.name + "_0").addClass("btn-primary");
	$("#" + bro0.name + "_0").html("<span class='glypicon glyphicon glyphicon-ok lrg-font'></span>");

	$("#" + bro1.name + "_1").removeClass("btn-secondary");
	$("#" + bro1.name + "_1").addClass("btn-primary");
	$("#" + bro1.name + "_1").html("<span class='glypicon glyphicon glyphicon-ok lrg-font'></span>");

	$("#" + bro0.card + "_0").removeClass("btn-secondary");
	$("#" + bro0.card + "_0").addClass("btn-primary");
	$("#" + bro0.card + "_0").html("<span class='glypicon glyphicon glyphicon-ok lrg-font'></span>");

	$("#" + bro1.card + "_1").removeClass("btn-secondary");
	$("#" + bro1.card + "_1").addClass("btn-primary");
	$("#" + bro1.card + "_1").html("<span class='glypicon glyphicon glyphicon-ok lrg-font'></span>");	
};

//called from UI to solve the puzzle
function solvePuzzle(){
	display.disabled = true;
	let solD = display.solutionDisplay;
	let correct = true;
	let txt = ""
	if (bro0.name == deeDum.selected.puzzle.bro0_name){
		txt += "You said the first brother was " + bro0.name + ", and the second brother was ";
		txt += bro1.name + ". "
		txt += " <em> You were right. </em><br>";
	} else {
		txt += "You said the first brother was " + bro0.name + ", and the second brother was ";
		txt += bro1.name + ". <em>That was not right</em>.<br>";
		correct = false;
	} 
	if (bro0.card == deeDum.selected.puzzle.bro0_card){
		txt += "You said the first brother had a " + bro0.card + " card, this was correct.<br>";
	} else {
		txt += "You said the first brother had a " + bro0.card + " card, this was not correct, it was ";
		txt += deeDum.selected.puzzle.bro0_card + ".<br>";
		correct = false;
	} 
	if (bro1.card == deeDum.selected.puzzle.bro1_card){
		txt += "You said the second brother had a " + bro1.card + " card, this was correct.<br>";
	} else {
		txt += "You said the second brother had a " + bro1.card + " card, this was not correct, it was ";
		txt += deeDum.selected.puzzle.bro1_card + ".<br>";
		correct = false;
	}
	txt +="<br>";
	if (correct) {
		txt += "<strong> You solved the puzzle!</strong>"
	} else {
		txt += "<strong> Unfortunately, you did not solve the puzzle. </strong>"
	}

	solD.innerHTML = txt;
}; 

//called from UI to explain the puzzle
function explainPuzzle(){
	let ed = display.explanationDisplay;
	ed.innerHTML = deeDum.selected.explanationDisplay();
};

