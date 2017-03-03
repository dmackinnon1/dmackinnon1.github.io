/**
* Common functions across the life pages.
*
* Pages must perform additional initialization for the gameOfLife 
*/

function isBreakpoint( alias ) {
    return $('.device-' + alias).is(':visible');
}

var gameOfLife;

function setup() {
	if (isBreakpoint("xs")) {
		gameOfLife = new GameOfLife(300, 300, 61, 61);
		console.log("xs chosen");
	} else {
		gameOfLife = new GameOfLife(600, 600, 121, 121);
	}
	gameOfLife.init();
	$("#pixelDisplay").html(gameOfLife.svg()); 	
	stepClicked();
};

var isRunning = false;
var timedDraw;

function startClicked(){
	if (!isRunning) {
		isRunning = true;
		timedDraw = setInterval(run, 100);
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
