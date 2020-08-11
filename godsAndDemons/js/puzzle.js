"use strict"

let godsAndDemons = {}; 
godsAndDemons.puzzles = []; 
godsAndDemons.activeSet = []; 
godsAndDemons.selected = null; //the puzzle selected for the user 

let guess = {}
guess.A = "knight";
guess.B = "knight";

// UI must initialize display elements
let display = {};
display.versionDescription = null;
display.puzzleTitle = null;
display.puzzleIntro = null;
display.puzzleDescription = null;
display.explanationDisplay = null;
display.disabled = false;
display.solutionDisplay = null;
display.typeDisplay = null;

// the initial page layout, populating the display elements
function formatPuzzle(pc) {
	let pi = display.puzzleIntro;
	let pd = display.puzzleDescription;
	let pt = display.puzzleTitle;
	let td = display.typeDisplay;
	td.innerHTML = pc.typeDisplay();
	pt.innerHTML = pc.puzzleTitle()
	pi.innerHTML = pc.puzzleIntro();
	let solD = display.solutionDisplay;
	solD.innerHTML ="";
	let ed = display.explanationDisplay;
	ed.innerHTML =""
}

// called from UI to reset the puzzle
function puzzleReset(url = null) {	
	let id = null;
	if (url != null){
		id = getQueryParameter(url, 'id');
	}
	if  (godsAndDemons.activeSet.length == 0) {
	 godsAndDemons.activeSet = godsAndDemons.puzzles;
	}
	let p = null;
	if (id != null) {
		p = getPuzzleWithId(id);
 	}
 	if (p == null) {
		p = randomElement(godsAndDemons.activeSet);	
 	}
 	godsAndDemons.selected = new PuzzleController(p);
 	godsAndDemons.activeSet = removeElement(godsAndDemons.activeSet,p);
	guess.A = "knight";
	guess.B = "knight"
    console.log(godsAndDemons.selected)
	formatPuzzle(godsAndDemons.selected);	
  	godsAndDemons.answered = false;
	display.disabled = false;
	updateAllButtons();
	console.log(godsAndDemons.selected)
}

function getPuzzleWithId(id) {
	let x = null;
	for (x in godsAndDemons.activeSet){
		let p = godsAndDemons.activeSet[x];
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
		let txt = "<ul><li> The first inhabitant says: <strong>" + this.puzzle.statement_A + ".</strong></li>";
		txt +="<li> The second inhabitant says: <strong>" + this.puzzle.statement_B + ".</strong></li>";
		txt += "</ul>";
		return txt;
	}

	typeDisplay(){
		let text ="<em>What is the type of each inhabitant?</em><br><br>"; 
		text += "<table><tbody><tr>";
		text += "<th></th><th>knight</th> <th>knave</th>  <th>god</th>  <th>demon</th></tr>";
		text += this.controller("First Inhabitant","A");
		text += this.controller("Second Inhabitant","B");
		text += "</tbody></table>";
		return text;
	}

	

	controller(text, data){
		
		let check = "glyphicon glyphicon-unchecked";
		let txt = "<tr><td>";
		txt += text + "</td><td>";
		txt +=  "<button type='button' id='"+data+"_knight' class='name-btn btn btn-secondary', onclick='selectType(event)'>";
		txt += "<span class='glypicon " + check + " lrg-font'></span>"
		txt += "</button></td><td>";
		txt +=  "<button type='button' id='"+ data + "_knave' class='name-btn btn btn-secondary', onclick='selectType(event)'>";
		txt += "<span class='glypicon " + check + " lrg-font'></span>"
		txt += "</button></td><td>";
		txt +=  "<button type='button' id='"+ data + "_god' class='name-btn btn btn-secondary', onclick='selectType(event)'>";
		txt += "<span class='glypicon " + check + " lrg-font'></span>"
		txt += "</button></td><td>";
		txt +=  "<button type='button' id='"+ data + "_demon' class='name-btn btn btn-secondary', onclick='selectType(event)'>";
		txt += "<span class='glypicon " + check + " lrg-font'></span>"
		txt += "</button></td></tr>";
		return txt;
	}

	
	explanationDisplay(){
		let txt = "<br><p>The solution is:<br>"
		txt += "<p>" + this.puzzle.solution;
		txt += ".</p>"
		return txt;
	}

	puzzleTitle(){
		return "Puzzle " + this.puzzle.id + " of " + godsAndDemons.puzzles.length
	}
}

function other(day){
	if (day == "night") return "day";
	return "night";
}

function selectType(event) {
	if (display.disabled == true) return;
	let id = event.currentTarget.id;
	console.log(id)
	let val = id.substring(0,id.indexOf("_"));
	let selected = (id.substring(id.indexOf("_")+1));
	guess[val] = selected;
	console.log("guess:" + guess.time + ", " + guess.first+ ", " + guess.second);
	console.log(guess)
	updateAllButtons();
};



//used with TreasureController and puzzleReset
function updateAllButtons(){
	$(".name-btn").removeClass("btn-primary");	
	$(".name-btn").addClass("btn-secondary");	
	$(".name-btn").html("<span class='glypicon glyphicon glyphicon-unchecked lrg-font'></span>");


	$("#B_" + guess.B).removeClass("btn-secondary");
	$("#B_" + guess.B).addClass("btn-primary");
	$("#B_" + guess.B).html("<span class='glypicon glyphicon glyphicon-ok lrg-font'></span>");

	$("#A_" + guess.A).removeClass("btn-secondary");
	$("#A_" + guess.A).addClass("btn-primary");
	$("#A_" + guess.A).html("<span class='glypicon glyphicon glyphicon-ok lrg-font'></span>");


};

//called from UI to solve the puzzle
function solvePuzzle(){
	display.disabled = true;
	let solD = display.solutionDisplay;
	let correct = true;
	let txt = "<br>"
	if (guess.A == godsAndDemons.selected.puzzle.A){
		txt += "You said the first inhabitant was a " + guess.A +".";
		txt += " <em> You were right. </em><br>";
	} else {
		txt += "You said the first inhabitant was a " + guess.A +".";
		txt += " <em> You were wrong. </em><br>";
		correct = false;
	} 
	if (guess.B == godsAndDemons.selected.puzzle.B){
		txt += "You said the second inhabitant was a " + guess.B +".";
		txt += " <em> You were correct. </em><br>";
	} else {
		txt += "You said the second inhabitant was a " + guess.B +".";
		txt += " <em> You were not correct. </em><br>";
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
	let txt = "The solution is that ";
	txt = txt + "the first inhabitant is a " + godsAndDemons.selected.puzzle.A;
	txt = txt + ", and the second inhabitant is a " +godsAndDemons.selected.puzzle.B
	txt = txt + "."
	ed.innerHTML = txt;
};

