var gameType ={};

gameType.isKnight = function() {
	return gameType.type === "knight";
};

gameType.isKing = function() {
	return gameType.type === "king";
};

gameType.isRook = function() {
	return gameType.type === "rook";
};

gameType.isBishop = function() {
	return gameType.type === "bishop";
};
gameType.isQueen = function() {
	return gameType.type === "queen";
}
//Classes for generating knight tours, and kings tours
/*
* A Cell is a square on the chessboard.
*/
class Cell {
		
	constructor(rowNum, colNum, board) {
		this.rowNum = rowNum;
		this.colNum = colNum;
		this.board = board;
		this.decoration = "";
	}
	
	
	getDisplay() {
		return this.decoration;	
	}
	
	neighbor(i,j) {
		if ((this.rowNum + i < this.board.getRowSize())
			&&(this.rowNum + i >= 0)
			&&(this.colNum + j < this.board.getColumnSize())
			&&(this.colNum + j >= 0)){
			return this.board.cells[this.rowNum + i][this.colNum + j];
		}
		return null;
	}
	
	nne(){
		return this.neighbor(2,1);
	}
	
	nnw(){
		return this.neighbor(2,-1);
	}
	
	ene(){
		return this.neighbor(1,2);		
	}
	
	wnw(){
		return this.neighbor(1,-2);
	}
	
	sse(){
		return this.neighbor(-2,1);
	}
	
	ese(){
		return this.neighbor(-1,2);
	}
	
	ssw(){
		return this.neighbor(-2,-1)
	}
	
	wsw(){
		return this.neighbor(-1,-2);
	}
	
	north(){
		return this.neighbor(1,0);
	}
	
	south(){
		return this.neighbor(-1,0);
	}
	
	east(){
		return this.neighbor(0,1);		
	}
	
	west(){
		return this.neighbor(0,-1);
	}
	
	northEast(){
		return this.neighbor(1,1);
	}
	
	northWest(){
		return this.neighbor(1,-1);
	}
	
	southEast(){
		return this.neighbor(-1,1)
	}
	
	southWest(){
		return this.neighbor(-1,-1);
	}
	
	row(){
		var row = [];
		for (var i = 0; i < this.board.rowNum; i++) {
			if (i !== this.colNum) row.push(this.board.cells[this.rowNum][i]);	
		}
		return row;
	}

	column(){
		var col = [];
		for (var i = 0; i < this.board.colNum; i++) {
			if (i !== this.rowNum) col.push(this.board.cells[i][this.colNum]);	
		}
		return col;
	}

	downDiagonal(){
		var diag = [];
		var i = this.rowNum +1; 
		var j = this.colNum +1;
		while( i< this.board.rowNum && j<this.board.colNum){
			diag.push(this.board.cells[i][j]);
			i++;
			j++;
		}

		i = this.rowNum -1; 
		j = this.colNum -1;
		while( i >= 0 && j >= 0){
			diag.push(this.board.cells[i][j]);
			i--;
			j--;
		}
		return diag;
	}

	upDiagonal(){
		var diag = [];
		var i = this.rowNum -1; 
		var j = this.colNum +1;
		while( i >= 0 && j<this.board.colNum){
			diag.push(this.board.cells[i][j]);
			i--;
			j++;
		}

		i = this.rowNum +1; 
		j = this.colNum -1;
		while( i < this.board.rowNum && j >= 0){
			diag.push(this.board.cells[i][j]);
			i++;
			j--;
		}
		return diag;
	}


	neighbors(){
		if (gameType.isKnight()) { //reference to the global, not great.
			return this.knightNeighbors();
		} 

		if (gameType.isKing()) {
			return this.kingNeighbors();
		} 

		if (gameType.isRook()) {
			return this.rookNeighbors();
		}

		if (gameType.isBishop()) {
			return this.bishopNeighbors();
		}
		if (gameType.isQueen()) {
			return this.queenNeighbors();
		}

	}

	queenNeighbors() {
		var queen = this.rookNeighbors();
		Array.prototype.push.apply(queen, this.bishopNeighbors());
		return queen;
	}

	rookNeighbors(){
		var rook = this.column();
		Array.prototype.push.apply(rook, this.row());
		return rook;
	}

	bishopNeighbors(){
		var bish = this.upDiagonal();
		Array.prototype.push.apply(bish, this.downDiagonal());
		return bish;
	}

	kingNeighbors() {
		var list = [];
		if(this.north() != null) list.push(this.north());
		if(this.south() != null) list.push(this.south());
		if(this.east() != null) list.push(this.east());
		if(this.west() != null) list.push(this.west());
		
		if(this.northEast() != null) list.push(this.northEast());
		if(this.northWest() != null) list.push(this.northWest());
		if(this.southEast() != null) list.push(this.southEast());
		if(this.southWest() != null) list.push(this.southWest());				
		return list;
	}

	knightNeighbors() {
		var list = [];
		if(this.ese() != null) list.push(this.ese());
		if(this.sse() != null) list.push(this.sse());
		if(this.wsw() != null) list.push(this.wsw());
		if(this.ssw() != null) list.push(this.ssw());
		
		if(this.ene() != null) list.push(this.ene());
		if(this.nne() != null) list.push(this.nne());
		if(this.wnw() != null) list.push(this.wnw());
		if(this.nnw() != null) list.push(this.nnw());
		return list;
	}

	
	isNeighbor(cell) {
		var nbrs = this.neighbors();
		for (var i = 0; i < nbrs.length; i ++) {
			if (cell.isEqual(nbrs[i])) return true;
		}
		return false;
	}
	
	degree(){
		return this.neighbors().length;
	}
	
	toString() {
		return "Cell [" + this.rowNum + "][" + this.colNum +"]: " + this.decoration;
	}
	
	isEqual(other) {
		var result =(this.rowNum === other.rowNum) && (this.colNum === other.colNum);
		return result;
	}
};

/*
* A chessboard of configurable size.
*/
class Board {

	constructor(size) {
		this.size = size;
		this.rowNum = size;
		this.colNum = size;
		this.cells = [];
	}
	
	init() {
		for (var i = 0; i < this.rowNum; i ++) {
			this.cells[i] = [];
			for (var j = 0; j < this.colNum; j ++){
				this.cells[i].push (new Cell(i, j, this));
			}
		}
	}
	randomStart() {
		var i = randomInt(this.rowNum);
		var j = randomInt(this.colNum);
		return this.cells[i][j];
	}
	
	toString () {
		var result = "";
		for (var i = 0; i < this.rowNum; i ++){
			result += this.cells[i];
		}
		return result;
	}
	getRowSize() {
		return this.rowNum;
	}
	getColumnSize(){
		return this.colNum;
	}
	getSize() {
		return this.colNum * this.rowNum;
	}
};


/**
* display 
*/

function htmlForBoard(board) {
	var html = "<table border = 1 cellspacing = 1 cellpadding = 1 align='center'>";
	for (var i = 0; i < board.cells.length; i++){
		var row = board.cells[i];
		html += "<tr>";
		for (var j = 0; j < row.length; j ++) {
			var c = row[j];
			html += "<td><div id='cell" + i +""+ j +"' class='gameCell' onclick='cellClick(event)'";
			html += " data-row='"+ i + "' data-col='" + j + "'>";
			html += emptyCell(i,j) + "</div></td>";
		}
		html += "</tr>";
	}
	html += "</table>";
	return html;	
};

function emptyCell(i,j){
	var empty = new Bldr("svg").att("width","28").att("height","28");
	empty.att("data-row",i).att("data-col",j);
	empty.att("stroke-width",0);
	return empty.build();
};

function cellClick(event) {
	var i = parseInt(event.target.getAttribute("data-row"));
	var j = parseInt(event.target.getAttribute("data-col"));
	game.clicked(i,j, event.target); //event.target
};

function getDiv(i,j) {
	return $("#cell" + i +""+j);
};
	

//object containing displayable elements
var gameDisplay = {};
gameDisplay.map = "";
gameDisplay.score = "";
/**
* Some events are fired when these elements are updated
* refreshStatus - called when status is updated
* refreshMap - called when map is updated
* refreshSteps - called when misstep count is updated
* 
* These use the 'evnts' object to invoke any registered callbacks
*/

/**
* utilities
*/
function randomInt(lessThan){
	var selection = Math.floor(Math.random()*(lessThan));
	return selection;
};

function svgMap(pieces, cover, size) {
	var svg = new Bldr("svg");
	var boardSize = 30*size;
	svg.att("align", "center").att("width",boardSize).att("height",boardSize);
	var cellSize = boardSize/size;
	//first the board
	for (var i = 0; i < size; i++) {
		for (var j = 0; j < size; j ++) {
			var x = i*cellSize;
			var y = j*cellSize;
			if (i%2==0 && j%2==0){
				var rect = new Bldr("rect").att("x", x).att("y",y);
				rect.att("width", cellSize).att("height",cellSize).att("fill", "#ccccb3"); 			
				svg.elem(rect);
			}
			if (i%2!=0 && j%2!=0){
				var rect = new Bldr("rect").att("x", x).att("y",y);
				rect.att("width", cellSize).att("height",cellSize).att("fill", "#ccccb3"); 			
				svg.elem(rect);
			}
		}
	}
	//finally, the dots
	for (var i=0; i< pieces.length; i++) {
		var cell = pieces[i];
		var x = (15 + cell.colNum*cellSize);
		var y = (15 + cell.rowNum*cellSize);
		var circle = new Bldr("circle").att("cx",x).att("cy", y);
		circle.att("r",3).att("stroke", "black").att("stroke-width",1).att("fill","grey");
		svg.elem(circle);
		var c0 = new Bldr("circle").att("cx",x).att("cy", y);
		c0.att("r",6).att("stroke", "black").att("stroke-width",1).att("fill","black");
		svg.elem(c0);						
	}
	
	for (var i=0; i< cover.length; i++) {
		var cell = cover[i];
		var x = (15 + cell.colNum*cellSize);
		var y = (15 + cell.rowNum*cellSize);
		var circle = new Bldr("circle").att("cx",x).att("cy", y);
		circle.att("r",3).att("stroke", "black").att("stroke-width",1).att("fill","grey");
		svg.elem(circle);
	}

	return svg.build();
};

function knightGlyph(i,j){
	var glyph = "<span class='glyphicon glyphicon-knight' ";
	glyph += " data-row='"+ i + "' data-col='" + j + "'>";
	return glyph;	
};

function kingGlyph(i,j){
	var glyph = "<span class='glyphicon glyphicon-king' ";
	glyph += " data-row='"+ i + "' data-col='" + j + "'>";
	return glyph;	
};

function rookGlyph(i,j){
	var glyph = "<span class='glyphicon glyphicon-tower' ";
	glyph += " data-row='"+ i + "' data-col='" + j + "'>";
	return glyph;	
};

function bishopGlyph(i,j){
	var glyph = "<span class='glyphicon glyphicon-bishop' ";
	glyph += " data-row='"+ i + "' data-col='" + j + "'>";
	return glyph;	
};

function queenGlyph(i,j){
	var glyph = "<span class='glyphicon glyphicon-queen' ";
	glyph += " data-row='"+ i + "' data-col='" + j + "'>";
	return glyph;	
};

function gameGlyph(i,j) {
	if (gameType.isKnight()){
		return knightGlyph(i,j);
	}
	if (gameType.isKing()){
		return kingGlyph(i,j);
	}
	if (gameType.isRook()) {
		return rookGlyph(i,j);
	}
	if (gameType.isBishop()) {
		return bishopGlyph(i,j);
	}
	if (gameType.isQueen()) {
		return queenGlyph(i,j);
	}
}