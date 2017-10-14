/**
* Infrastructure for "knights and knaves" puzzles.
*/

/**
* Model classes
*/
var originalNameSet = ["Alice", "Bob", "Carol", "Dave", 
	"Edward", "Francine", "Gary", 
	"Henry", "Ingrid", "Joan", "Kevin", "Lisa", "Mike",
	"Neil", "Owen", "Pat", "Quinn", "Rachel", "Sally",
	"Trevor", "Unis", "Victoria", "Wallace","Xavier",
	"Zelda"];

var nameSet; //to do, move to Islanders scope
class Islanders {

	constructor(count) {

		this.count = count;
		this.liarCount = randomRange(Math.floor(count/2)-1, count-2);
		this.knaves = [];
		this.knights = [];
		this.islanders = [];
		this.islanderControllers = {};
		nameSet = copyArray(originalNameSet);
		for (var i=0; i < this.liarCount; i++) {
			var pos = randomRange(0, nameSet.length -1);
			var islander = new Knave(nameSet.splice(pos, 1)[0]);
			this.knaves.push(islander);
			this.islanderControllers[islander.name] = new IslanderController(islander);
		}

		for (var i = this.liarCount; i <this.count; i++) {
			var pos = randomRange(0, nameSet.length -1);
			var islander = new Knight(nameSet.splice(pos, 1)[0]);
			this.knights.push(islander);
			this.islanderControllers[islander.name] = new IslanderController(islander);
		}
		this.islanders = shuffle(this.knaves.concat(this.knights));
	}

	knaveNames() {
		var x;
		var list = [];
		for (x in this.knaves) {
			list.push(this.knaves[x].name);
		}
		return list;
	}

	statements() {
		var x;
		var statements = [];
		for (x in this.islanders) {
			var target = this.islanders[x];
			var remainders = arrayWithoutElement(this.islanders, target);
			var source = randomElement(remainders);
			statements.push(source.statementFor(target));	
		}
		return statements;
	}

	clue() {
		if (this.count/2 === this.liarCount) {
			return this.knaves[0].name + " is a knave. There numbers of knights and knaves are equal.";
		}
		return "There are " + this.liarCount + " knaves in this group.";
	}
}

class Islander {
	constructor (n) {
		this.name = n;
	}
}

class Knave extends Islander {
	isKnight() {
		return false;
	}
	
	statementFor(i) {
		if (i.isKnight()){
			return new Accusation(this, i);
		} else {
			return new Affirmation(this, i);
		}
	}
}

class Knight extends Islander {
	isKnight() {
		return true;
	}

	statementFor(i) {
		if (i.isKnight()){
			return new Affirmation(this, i);
		} else {
			return new Accusation(this, i);
		}
	}
}

class Statement {
	constructor(source, target){
		this.source = source;
		this.target = target;
		this.text == this.buildStatement();
	}

	fullStatement() {
		var fs = this.source.name;
		fs += " says: " + this.text + "."
		return fs;
	}
}

class Accusation extends Statement {	
	buildStatement() {
		var options = [
			" is lying",
			" is a knave",
			" always lies",
			" never tells the truth",
			" lies",
			" is untruthful"		
		];
		this.text = this.target.name + options[randomRange(0,options.length -1)];
		return this.text;		
	}	
}

class Affirmation extends Statement {
	buildStatement() {
		var options = [
			" is truthful",
			" is a knight",
			" always tells the truth",
			" never lies",
			" tells the truth"
		];
		this.text = this.target.name + options[randomRange(0,options.length -1)];
		return this.text;		
	}
}


/**
* Controlers
*/

class IslanderController {
	constructor(islander) {
		this.islander = islander;
		this.selected = false;
	}

	display() {
		var txt = "glyphicon glyphicon-unchecked";
		if (this.selected) {
			txt = "glyphicon glyphicon-checked";
		}
		var btn = "<li><span class='padSpan'>" + this.islander.name + "</span>";
		btn +=  "<button type='button' id='"+ this.islander.name + "' class='btn btn-primary', onclick='selectIslander(event)'>";
		btn += "<span class='glypicon " + txt + " lrg-font'></span>"
		btn += "</button> </li>";
		return btn;		
	}	
}

class IslandControllers {
	constructor(island) {
		this.island = island;
	}

	clueDisplay() {
		return this.island.clue();
	}

	accusationDisplay() {
			var s = "<div> <ul>";
		var i;
		var statements = this.island.statements();
		for (i in statements ) {
			s += statements[i].fullStatement();
			s += "</br>";
		}
		s += "</ul></div>";
		return s;
	
	}

	islandersDisplay() {
		var s = "<div> <ul>";
		var i;
		for (i in this.island.islanders) {
			s += new IslanderController(this.island.islanders[i]).display();
		}
		s += "</ul></div>";
		return s;
	}

}
var knavesList = [];
function selectIslander(event) {
	var theKnave = event.currentTarget.id;
	knavesList = addOrRemove(knavesList, theKnave);
	if (arrayContains(knavesList,theKnave)) {
		$("#" + theKnave).addClass("btn-danger");
	} else {
		$("#" + theKnave).removeClass("btn-danger");	
	}
	console.log(knavesList);
};


class StatementController {

}

/**
* Utility functions
*/

function randomInt(lessThan){
	return Math.floor(Math.random()*lessThan);
};

function randomRange(greaterThan, lessThan){
	var shifted = randomInt(lessThan - greaterThan);
	return lessThan - shifted; 
};

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = randomRange(0, currentIndex -1);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};

function arrayWithoutElement(array, e) {
	var x;
	var remainder = [];
	for (x in array) {
		if (array[x] !== e) {
			remainder.push(array[x]);
		}
	}
	return remainder;
}

function arrayContains(array, e) {
	var x;
	for (x in array) {
		if (array[x] === e) {
			return true;
		}
	}
	return false;
};

function arrayContainsArray(array1, array2) {
	var x;
	for (x in array2) {
		var a = arrayContains(array1, array2[x]);
		if (a!==true) { return false };
	}
	return true;
};

function arraysEquivalent(array1, array2) {
	return arrayContainsArray(array1, array2) && arrayContainsArray(array2, array1);
};


function addOrRemove(array, e) {
	if (arrayContains(array,e)){
		return arrayWithoutElement(array, e);
	} else {
		array.push(e);
		return array;
	}
}

function copyArray(array) {
	var newArray = [];
	var x;
	for (x in array) {
		newArray.push(array[x])
	}
	return newArray;
}

function randomElement(array) {
	return array[randomRange(0, array.length -1)];
}
