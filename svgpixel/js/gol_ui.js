/**
* Common functions across the life pages.
*
* Pages must perform additional initialization for the gameOfLife 
*/

function isBreakpoint( alias ) {
    return $('.device-' + alias).is(':visible');
}

var gameOfLife;

function reset() {
	gameOfLife.cells.reset();	
}

function setup() {
	if (isBreakpoint("xs")) {
		gameOfLife = new GameOfLife(300, 300, 61, 61);
		console.log("xs chosen");
	} else {
		gameOfLife = new GameOfLife(400, 400, 81, 81);
	}
	$("#pixelDisplay").html(gameOfLife.svg()); 	
	gameOfLife.init();
	stepClicked();
};

var isRunning = false;
var timedDraw;

function startClicked(){
	if (!isRunning) {
		isRunning = true;
		timedDraw = setInterval(run, 200);
	}
};

function stopClicked() {
	if (isRunning) {
		isRunning = false;
		clearTimeout(timedDraw);
	}
};

function stepClicked() {
	if (!isRunning) {
		run();
	}
};

function run() {
	gameOfLife.doIt();
	$("#generationDisplay").html("<h3 class='centered'> generation: " + gameOfLife.generation + "</h3>");
}
