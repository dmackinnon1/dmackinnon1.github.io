"use strict"

let underground = {}; 
underground.puzzles = []; 
underground.activeSet = []; 
underground.selected = null; //the puzzle selected for the user 

let guess = {}
guess.time = "day"
guess.first = "day";
guess.second = "day";

// UI must initialize display elements
let display = {};
display.versionDescription = null;
display.puzzleTitle = null;
display.puzzleIntro = null;
display.puzzleDescription = null;
display.explanationDisplay = null;
display.disabled = false;
display.solutionDisplay = null;
display.dayDisplay = null;

// the initial page layout, populating the display elements
function formatPuzzle(pc) {
	let pi = display.puzzleIntro;
	let pd = display.puzzleDescription;
	let pt = display.puzzleTitle;
	let dg = display.dayDisplay;
	dg.innerHTML = pc.dayDisplay();
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
	if  (underground.activeSet.length == 0) {
	 underground.activeSet = underground.puzzles;
	}
	let p = null;
	if (id != null) {
		p = getPuzzleWithId(id);
 	}
 	if (p == null) {
		p = randomElement(underground.activeSet);	
 	}
 	underground.selected = new PuzzleController(p);
 	underground.activeSet = removeElement(underground.activeSet,p);
	guess.time = "day"
	guess.first = "day";
	guess.second = "day";

	formatPuzzle(underground.selected);	
  	underground.answered = false;
	display.disabled = false;
	updateAllButtons();
	console.log(underground.selected)
}

function getPuzzleWithId(id) {
	let x = null;
	for (x in underground.activeSet){
		let p = underground.activeSet[x];
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
		let txt = "<ul><li> The first inhabitant says: <strong>" + this.puzzle.person1 + "</strong></li>";
		txt +="<li> The second inhabitant says: <strong>" + this.puzzle.person2 + "</strong></li>";
		txt += "</ul>";
		return txt;
	}

	dayDisplay(){
		let text ="<em>What time is it now?</em><br><br>"; 
		text += "<table><tbody><tr>";
		text += "<th></th><th>day</th> <th>night</th></tr>";
		text += this.controller("time","time");
		text += "</tbody></table>";
		text += "<br><br>";
		text += "<em>What type is each inhabitant?</em><br><br>";
		text += "<table><tbody><tr>";
		text += "<th></th><th>day-knight</th> <th>night-knight</th></tr>";
		text += this.controller("First Inhabitant","first");
		text += this.controller("Second Inhabitant","second");
		text += "</tbody></table>"
		text += "<br>";
		return text;
	}

	

	controller(text, data){
		
		let check = "glyphicon glyphicon-unchecked";
		let txt = "<tr><td>";
		txt += text + "</td><td>";
		txt +=  "<button type='button' id='"+data+"_day' class='name-btn btn btn-secondary', onclick='selectDay(event)'>";
		txt += "<span class='glypicon " + check + " lrg-font'></span>"
		txt += "</button></td><td>";
		txt +=  "<button type='button' id='"+ data + "_night' class='name-btn btn btn-secondary', onclick='selectDay(event)'>";
		txt += "<span class='glypicon " + check + " lrg-font'></span>"
		txt += "</button></td></tr>";
		return txt;
	}

	
	explanationDisplay(){
		let txt = "<br><p> Here is one way to think about it:<br>"
		txt += "<p>" + this.puzzle.person1_explain;
		txt += "</p><p>" + this.puzzle.person2_explain;
		txt += "</p><p>" + this.puzzle.solution_explain;
		txt += "</p></br>";
		return txt;
	}

	puzzleTitle(){
		return "Puzzle " + this.puzzle.id
	}
}

function other(day){
	if (day == "night") return "day";
	return "night";
}

function selectDay(event) {
	if (display.disabled == true) return;
	let id = event.currentTarget.id;
	console.log(id)
	let val = id.substring(0,id.indexOf("_"));
	let day = (id.substring(id.indexOf("_")+1));
	guess[val] = day;
	console.log("guess:" + guess.time + ", " + guess.first+ ", " + guess.second);
	console.log(guess)
	updateAllButtons();
};



//used with TreasureController and puzzleReset
function updateAllButtons(){
	$(".name-btn").removeClass("btn-primary");	
	$(".name-btn").addClass("btn-secondary");	
	$(".name-btn").html("<span class='glypicon glyphicon glyphicon-unchecked lrg-font'></span>");

	$("#time_" + guess.time).removeClass("btn-secondary");
	$("#time_" + guess.time).addClass("btn-primary");
	$("#time_" + guess.time).html("<span class='glypicon glyphicon glyphicon-ok lrg-font'></span>");

	$("#first_" + guess.first).removeClass("btn-secondary");
	$("#first_" + guess.first).addClass("btn-primary");
	$("#first_" + guess.first).html("<span class='glypicon glyphicon glyphicon-ok lrg-font'></span>");

	$("#second_" + guess.second).removeClass("btn-secondary");
	$("#second_" + guess.second).addClass("btn-primary");
	$("#second_" + guess.second).html("<span class='glypicon glyphicon glyphicon-ok lrg-font'></span>");

};

//called from UI to solve the puzzle
function solvePuzzle(){
	display.disabled = true;
	let solD = display.solutionDisplay;
	let correct = true;
	let txt = "<br>"
	if (guess.time == underground.selected.puzzle.time){
		txt += "You said it is " + guess.time +".";
		txt += " <em> You were right. </em><br>";
	} else {
		txt += "You said it is " + guess.time +".";
		txt += " <em> You were wrong. </em><br>";
		correct = false;
	} 
	if (guess.first == underground.selected.puzzle.person1_type){
		txt += "You said the first inhabitant is a " + guess.first + "-knight. <em>This was correct.</em><br>";
	} else {
			txt += "You said the first inhabitant is a " + guess.first + "-knight. <em>This was not correct. </em>";
			txt += "She is a " + underground.selected.puzzle.person1_type +"-knight.<br>"
		correct = false;
	} 
	if (guess.second == underground.selected.puzzle.person2_type){
		txt += "You said the second inhabitant is a " + guess.second + "-knight. <em>This was correct.</em><br>";
	} else {
			txt += "You said the second inhabitant is a " + guess.second + "-knight. <em>This was not correct. </em>";
			txt += "She is a " + underground.selected.puzzle.person2_type +"-knight.<br>"
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
	ed.innerHTML = underground.selected.explanationDisplay();
};

