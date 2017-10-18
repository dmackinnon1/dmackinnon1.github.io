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
		this.statements = this.generateStatements();
	}

	knaveNames() {
		var x;
		var list = [];
		for (x in this.knaves) {
			list.push(this.knaves[x].name);
		}
		return list;
	}

	generateStatements() {
		var x;
		var statements = [];
		for (x in this.islanders) {
			var target = this.islanders[x];
			var remainders = arrayWithoutElement(this.islanders, target);
			var source = randomElement(remainders);
			statements.push(source.statementFor(target));	
		}
		statements = pruneStatements(statements);
		statements = joinConnectedSets(this.islanders, statements);
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
		var statements = this.island.statements;
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
* Utility functions - mostly managing arrays
*/

function joinConnectedSets(islanders, listOfStatements) {
	//1 calculate the connected sets
	var cSets = connectedSets(islanders, islanders, listOfStatements, [], []);

	//2 if there is only one connected set, then return
	if (cSets.length == 1) {
		console.log("the statments form a connected graph - no joins required");
		return listOfStatements;
	}
	//3 otherwise, add statements that will connect the sets
	// use a simple join based on the first element of the first set.
	var joiner = cSets[0][0];
	var remainingSets = removeElement(cSets, cSets[0]);
	var newStatements = [];
	var x;
	for (x in remainingSets) {
		var joinee = remainingSets[x][0];
		newStatements.push(joinee.statementFor(joiner));
		console.log("linking disjoint sets using " + joiner.name + " and " + joinee.name);
	}
	console.log("adding " + newStatements.length + " statements to connect the sets");
	return listOfStatements.concat(newStatements);
}


function pruneStatements(listOfStatements) {
	var x;
	var extras = [];
	for (x in listOfStatements) {
		var e = listOfStatements[x];
		if (arrayContains(extras, e)) continue;
		var s = e.source;
		var t = e.target;
		var remainder = arrayWithoutElement(listOfStatements, e);
		var y;
		for (y in remainder){
			var e1 = remainder[y];
			var s1 = e1.source;
			var t1 = e1.target;
			if (s1 === t && t1 ===s) {
				extras.push(e1);
			}
		}
	}
	console.log("pruning " + extras.length + " statments from original list of " + listOfStatements.length);
	return arrayDifference(listOfStatements, extras);
}

//returns all islanders that are neighbors of the current islander
function allSourcesAndTargets(islander, listOfStatements) {
	var list = [];
	list.push(islander);
	var x;
	for (x in listOfStatements) {
		var source = listOfStatements[x].source;
		var target = listOfStatements[x].target;
		if (islander === source) {
			list.push(target);
		}
		if(islander === target) {
			list.push(source);
		}
	}
	return list;
};

function allReachable(islander, listOfStatements, listSoFar) {
	var reachable = copyArray(listSoFar);	
	var immediateNeigbours = allSourcesAndTargets(islander, listOfStatements);
	reachable = addAllUnique(reachable,immediateNeigbours);
	//stop if we are not growing
	if (arraysEquivalent(reachable, listSoFar)) return listSoFar;
	//continue onto immediateNeighbors
	for (x in immediateNeigbours) {
		addAllUnique(reachable, allReachable(immediateNeigbours[x], listOfStatements, reachable));
	}
	return reachable;
};

function connectedSets(islanders, completeIslanders, listOfStatements, setList, soFar) {
	//1 start with the first islander, and get the connected set.
	var connect1 = allReachable(islanders[0], listOfStatements, []);
	addAllUnique(soFar, connect1);
	setList.push(connect1);
	//2 end contition
	if (arraysEquivalent(completeIslanders, soFar)) {
		return setList;
	}
	//3 recurse down
	var remainder = arrayDifference(islanders, soFar);
	return connectedSets(remainder,completeIslanders, listOfStatements, setList, soFar);
}


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
};

function removeElement(array, e) {
	var newArray = [];
	var x;
	for (x in array) {
		if (e !== array[x]) {
			newArray.push(array[x]);
		}
	}
	return newArray;
}

function addUnique(array, e) {
	if (arrayContains(array, e)){
		return array;
	} else {
		array.push(e);
		return array;
	}
};

function addAllUnique(array1, array2) {
	var x;
	for (x in array2){
		addUnique(array1, array2[x]);
	}
	return array1;
};

function arrayDifference(array1, array2) {
	var newArray = copyArray(array1);
	var x;
	for (x in array2) {
		newArray = removeElement(newArray, array2[x]);
	}
	return newArray;
}

function copyArray(array) {
	var newArray = [];
	var x;
	for (x in array) {
		newArray.push(array[x])
	}
	return newArray;
};

function randomElement(array) {
	return array[randomRange(0, array.length -1)];
};
