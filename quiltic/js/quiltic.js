// classes and functions for generating celtic knot/plait patterns using tiles.
// note: evnts.js is required for callback handling
var quiltic = {};
quiltic.sizeFactor = 5;
quiltic.strokeWidth = 3;
quiltic.color = "grey";
quiltic.crossings = 0;
quiltic.tileSet = "set 1";

quiltic.tile = function(t,l,b,r) {
	if (quiltic.tileSet === "set 1") {
		return quiltic.set1(t,l,b,r);
	}
	if (quiltic.tileSet === "set 2"){
		return quiltic.set2(t,l,b,r);
	}
	return quiltic.set3(t,l,b,r);	
}

quiltic.toggleTileSet = function(toggle) {
	quiltic.tileSet = toggle;
	quiltic.display = htmlTable(quiltic.board);
	evnts.fireEvent("refresh");
}

quiltic.set3= function(t,l,b,r) {
	var baseSize = 8;
	var img = "<svg align='center' width='" + (quiltic.sizeFactor*baseSize) + "' height='" + (quiltic.sizeFactor*baseSize) +"'>";
	img += quiltic.wpoly([quiltic.point(0,0), quiltic.point(8,0), quiltic.point(8,8), quiltic.point(0,8)]);	
	//corners
	img += quiltic.poly([quiltic.point(0,0), quiltic.point(2,0), quiltic.point(0,2)]);
	img += quiltic.poly([quiltic.point(6,0), quiltic.point(8,0), quiltic.point(8,2)]);
	img += quiltic.poly([quiltic.point(0,6), quiltic.point(0,8), quiltic.point(2,8)]);
	img += quiltic.poly([quiltic.point(8,6), quiltic.point(6,8), quiltic.point(8,8)]);
	//center
	img += quiltic.poly([quiltic.point(2,4), quiltic.point(4,2), quiltic.point(6,4), quiltic.point(4,6)]);
	//open and closed paths
	if(l) {	
		img += quiltic.line(quiltic.lpoints(0,2,2,4));
	} else {
		img += quiltic.line(quiltic.lpoints(0,2,0,6));
	}
	if(t) {	
		img += quiltic.line(quiltic.lpoints(4,2,6,0));
	} else {
		img += quiltic.line(quiltic.lpoints(2,0,6,0));
	}
	if(r) {	
		img += quiltic.line(quiltic.lpoints(6,4,8,6));
	} else {
		img += quiltic.line(quiltic.lpoints(8,2,8,6));
	}
	if(b) {	
		img += quiltic.line(quiltic.lpoints(2,8,4,6));
	} else {
		img += quiltic.line(quiltic.lpoints(2,8,6,8));
	}
	img += "</svg>";
	return img;
};

quiltic.set2 = function(t,l,b,r) {
	var baseSize = 8;
	var img = "<svg align='center' width='" + (quiltic.sizeFactor*baseSize) + "' height='" + (quiltic.sizeFactor*baseSize) +"'>";
	
	//handle blank
	if(!t&&!l&&!r&&!b) { 
		img += quiltic.poly([quiltic.point(0,0), quiltic.point(8,0), quiltic.point(8,8), quiltic.point(0,8)]);
		img += "</svg>";
		return img;	
	}
	img += quiltic.wpoly([quiltic.point(0,0), quiltic.point(8,0), quiltic.point(8,8), quiltic.point(0,8)]);	
	//corners
	img += quiltic.poly([quiltic.point(0,0), quiltic.point(2,0), quiltic.point(0,2)]);
	img += quiltic.poly([quiltic.point(6,0), quiltic.point(8,0), quiltic.point(8,2)]);
	img += quiltic.poly([quiltic.point(0,6), quiltic.point(0,8), quiltic.point(2,8)]);
	img += quiltic.poly([quiltic.point(8,6), quiltic.point(6,8), quiltic.point(8,8)]);
	
	//midlines
	img +=  quiltic.fline(quiltic.lpoints(1,3,3,1));
	img +=  quiltic.fline(quiltic.lpoints(5,1,7,3));
	img +=  quiltic.fline(quiltic.lpoints(7,5,5,7));
	img +=  quiltic.fline(quiltic.lpoints(1,5,3,7));
	//center
	img += quiltic.poly([quiltic.point(2,4), quiltic.point(4,2), quiltic.point(6,4), quiltic.point(4,6)]);
	//open and closed paths
	if(l) {	
		img += quiltic.line(quiltic.lpoints(0,2,2,4));
		img += quiltic.poly([quiltic.point(3,3), quiltic.point(2,4), quiltic.point(3,5)]);
		//midline
		img += quiltic.fline(quiltic.lpoints(1,5,0,4));
	} else {
		img += quiltic.line(quiltic.lpoints(0,2,0,6));		
		img += quiltic.line(quiltic.lpoints(3,3,3,5));
		//midline
		img += quiltic.fline(quiltic.lpoints(1,5,1,3));
	}
	if(t) {	
		img += quiltic.line(quiltic.lpoints(4,2,6,0));
		img += quiltic.poly([quiltic.point(3,3), quiltic.point(4,2), quiltic.point(5,3)]);
		//midline
		img += quiltic.fline(quiltic.lpoints(3,1,4,0));		
	} else {
		img += quiltic.line(quiltic.lpoints(2,0,6,0));
		img += quiltic.line(quiltic.lpoints(3,3,5,3));
		//midline
		img += quiltic.fline(quiltic.lpoints(3,1,5,1));		
	}
	if(r) {	
		img += quiltic.line(quiltic.lpoints(6,4,8,6));
		img += quiltic.poly([quiltic.point(5,3), quiltic.point(6,4), quiltic.point(5,5)]);	
		//midline
		img += quiltic.fline(quiltic.lpoints(7,3,8,4));			
	} else {
		img += quiltic.line(quiltic.lpoints(8,2,8,6));
		img += quiltic.line(quiltic.lpoints(5,3,5,5));
		//midline
		img += quiltic.fline(quiltic.lpoints(7,3,7,5));		
	}

	if(b) {	
		img += quiltic.line(quiltic.lpoints(2,8,4,6));
		img += quiltic.poly([quiltic.point(3,5), quiltic.point(4,6), quiltic.point(5,5)]);
		//midline
		img += quiltic.fline(quiltic.lpoints(5,7,4,8));
	} else {
		img += quiltic.line(quiltic.lpoints(2,8,6,8));
		img += quiltic.line(quiltic.lpoints(3,5,5,5));
		//midline
		img += quiltic.fline(quiltic.lpoints(5,7,3,7));			
	}
	img += "</svg>";
	return img;
};

quiltic.set1 = function(t,l,b,r) {
	var baseSize = 8;
	var img = "<svg align='center' width='" + (quiltic.sizeFactor*baseSize) + "' height='" + (quiltic.sizeFactor*baseSize) +"'>";
	//handle blank
	if(!t&&!l&&!r&&!b) { 
		img += quiltic.poly([quiltic.point(0,0), quiltic.point(8,0), quiltic.point(8,8), quiltic.point(0,8)]);
		img += "</svg>";
		return img;	
	}
	img += quiltic.wpoly([quiltic.point(0,0), quiltic.point(8,0), quiltic.point(8,8), quiltic.point(0,8)]);
	//corners
	if (t||l||!r||!b) {
		img += quiltic.poly([quiltic.point(0,0), quiltic.point(2,0), quiltic.point(0,2)]);	
	} else {
		img += quiltic.line(quiltic.lpoints(0,0,2,0));
		img += quiltic.line(quiltic.lpoints(0,0,0,2));
	}
	if (t||!l||r||!b) {	
		img += quiltic.poly([quiltic.point(6,0), quiltic.point(8,0), quiltic.point(8,2)]);
	} else {
		img += quiltic.line(quiltic.lpoints(6,0,8,0));
		img += quiltic.line(quiltic.lpoints(8,0,8,2));
	}		
	if (!t||l||!r||b) {	
		img += quiltic.poly([quiltic.point(0,6), quiltic.point(0,8), quiltic.point(2,8)]);
	} else {
		img += quiltic.line(quiltic.lpoints(0,6,0,8));
		img += quiltic.line(quiltic.lpoints(0,8,2,8));
	}
	if (!t||!l||r||b) {	
		img += quiltic.poly([quiltic.point(8,6), quiltic.point(6,8), quiltic.point(8,8)]);
	} else {
		img += quiltic.line(quiltic.lpoints(8,6,8,8));
		img += quiltic.line(quiltic.lpoints(6,8,8,8));
	}
	//center
	img += quiltic.poly([quiltic.point(2,4), quiltic.point(4,2), quiltic.point(6,4), quiltic.point(4,6)]);
	if(l) {	
		img += quiltic.line(quiltic.lpoints(0,2,2,4));
		img += quiltic.poly([quiltic.point(3,3), quiltic.point(2,4), quiltic.point(3,5)]);
	} else {
		img += quiltic.line(quiltic.lpoints(0,2,0,6));		
		img += quiltic.line(quiltic.lpoints(3,3,3,5));
	}
	if(t) {	
		img += quiltic.line(quiltic.lpoints(4,2,6,0));
		img += quiltic.poly([quiltic.point(3,3), quiltic.point(4,2), quiltic.point(5,3)]);
	} else {
		img += quiltic.line(quiltic.lpoints(2,0,6,0));
		img += quiltic.line(quiltic.lpoints(3,3,5,3));
	}
	if(r) {	
		img += quiltic.line(quiltic.lpoints(6,4,8,6));
		img += quiltic.poly([quiltic.point(5,3), quiltic.point(6,4), quiltic.point(5,5)]);	
	} else {
		img += quiltic.line(quiltic.lpoints(8,2,8,6));
		img += quiltic.line(quiltic.lpoints(5,3,5,5));
	}
	if(b) {	
		img += quiltic.line(quiltic.lpoints(2,8,4,6));
		img += quiltic.poly([quiltic.point(3,5), quiltic.point(4,6), quiltic.point(5,5)]);
	} else {
		img += quiltic.line(quiltic.lpoints(2,8,6,8));
		img += quiltic.line(quiltic.lpoints(3,5,5,5));
	}
	img += "</svg>";
	return img;
};

//helpers for tile
quiltic.point = function(x, y) {
	return "" + (x*quiltic.sizeFactor) + "," + (y*quiltic.sizeFactor);
};

quiltic.lpoints = function(x1, y1, x2, y2) {
	var lp = " x1='" + (x1*quiltic.sizeFactor) + "' y1='" + (y1*quiltic.sizeFactor) + "'";
	lp += " x2='" + (x2*quiltic.sizeFactor) + "' y2='" + (y2*quiltic.sizeFactor) + "'";
	return lp;
};

quiltic.poly = function(list) {
	var poly = "<polygon points='";
	for (var i = 0; i < list.length; i ++){
		poly += list[i];
		poly += " ";
	}
	poly += "' style='fill:"+ quiltic.color +";stroke:" + quiltic.color + ";stroke-width:" + quiltic.strokeWidth + "'/>";
	return poly;
};

quiltic.wpoly = function(list) {
	var poly = "<polygon points='";
	for (var i = 0; i < list.length; i ++){
		poly += list[i];
		poly += " ";
	}
	poly += "' style='fill:white;stroke:white;stroke-width:0'/>";
	return poly;
};

quiltic.line = function(points) {
	var line = "<line " + points;
	line += " stroke-width='"+ quiltic.strokeWidth + "' stroke='"+ quiltic.color +"' stroke-linecap='round'/>";
	return line;	
};
//fine line
quiltic.fline = function(points) {
	var line = "<line " + points;
	line += " stroke-width='"+ (0.5*quiltic.strokeWidth) + "' stroke='"+ quiltic.color +"' stroke-linecap='round'/>";
	return line;	
};

//abstract representation of the tile
class QuilticTile {
	constructor (board, rowNum, colNum) {
		this.rowNum = rowNum;
		this.colNum = colNum;		
		this.t = 1;
		this.r = 1;
		this.b = 1;
		this.l = 1;
		this.board = board;
		
	}
	
	neighbor(i,j) {
		if ((this.rowNum + i < this.board.rows)
			&&(this.rowNum + i >= 0)
			&&(this.colNum + j < this.board.cols)
			&&(this.colNum + j >= 0)){
			return this.board.tiles[this.rowNum + i][this.colNum + j];
		}
		return null;
	}

	rotate() {
		var temp = this.t;
		this.t = this.r;
		this.r = this.b;
		this.b = this.l;
		this.l = temp;
	}

	north(){
		return this.neighbor(-1,0);
	}
	
	south(){
		return this.neighbor(1,0);
	}
	
	east(){
		return this.neighbor(0,1);		
	}
	
	west(){
		return this.neighbor(0,-1);
	}

	neighbors() {
		var list = [];
		if(this.north() != null) list.push(this.north());
		if(this.south() != null) list.push(this.south());
		if(this.east() != null) list.push(this.east());
		if(this.west() != null) list.push(this.west());
		return list;
	} 

	enforceBorders() {
			if (this.north() == null) this.t = 0;
			if (this.south() == null) this.b = 0;
			if (this.west() == null) this.l = 0;
			if (this.east() == null) this.r = 0; 
	}		

	enforceNeighbors() {
		if (this.north() != null) {
			this.t = this.north().b;
		}
		if (this.south() != null) {
			this.b = this.south().t;
		}
		if (this.east() != null) {
			this.r = this.east().l;
		}
		if (this.west() != null) {
			this.l = this.west().r;
		}
	}

	updateNeighbors() {
		var ns = this.neighbors();
		for (var i = 0; i < ns.length; i++){
			ns[i].enforceNeighbors();
		}
	}
};

//a board is a rectangular arrangement of tiles - the board will enforce placement rules
class QuilticBoard {
	constructor (rows, cols) {
		this.rows = rows;
		this.cols = cols;
		this.tiles = [];
		this.crossings = 0;
	}

	init() {
		for (var i = 0; i < this.rows; i ++) {
			var row = [];
			for (var j = 0; j < this.cols; j++) {
				row.push(new QuilticTile(this, i, j));
			}
			this.tiles.push(row);
		}
		for (var i = 0; i < this.rows; i ++) {
			for (var j = 0; j < this.cols; j++) {
				this.tiles[i][j].enforceBorders();
			}
		}
		this.countCrossings();
	}

	randomizeTile() {
		var r = randomInt(this.rows);
		var c = randomInt(this.cols);
		var cell = 	this.tiles[r][c];
		cell.t = randomInt(2);
		cell.b = randomInt(2);
		cell.r = randomInt(2);
		cell.l = randomInt(2);
		cell.enforceBorders();
		cell.updateNeighbors();
	}

	countCrossings() {
		var cross = 0;
		for (var i = 0; i < this.rows; i ++) {
			for (var j = 0; j < this.cols; j++) {
				cross += this.tiles[i][j].b + this.tiles[i][j].r;
			}
		}
		this.crossings = cross;
	}
	
	clear() {
		for (var i = 0; i < this.rows; i ++) {
			for (var j = 0; j < this.cols; j++) {
				var tile =  this.tiles[i][j];
				tile.b = 0;
				tile.t = 0;
				tile.l = 0;
				tile.r = 0;
			}
		}
		this.crossings = 0;
	}

};

quiltic.randomize = function () {
	for (var i = 0; i < 5; i++) { //replace magic number
		quiltic.board.randomizeTile();
	}
	quiltic.board.countCrossings();
	quiltic.crossings = quiltic.board.crossings;
	quiltic.display = htmlTable(quiltic.board);
	evnts.fireEvent("refresh");
};

quiltic.clear = function() {
	
	quiltic.board.clear();
	quiltic.crossings = quiltic.board.crossings;
	quiltic.display = htmlTable(quiltic.board);
	evnts.fireEvent("refresh");	
};

quiltic.setup = function(rows, cols){
	quiltic.board = new QuilticBoard(rows,cols);
	quiltic.board.init();
	quiltic.crossings = quiltic.board.crossings;
	quiltic.display = htmlTable(quiltic.board);
	evnts.fireEvent("refresh");
};

//board display
function htmlTable(quilticBoard) {
	var html = "<table align='center'>";
	for (var i = 0; i < quilticBoard.rows; i++){
		html += "<tr>";
		for (var j = 0; j < quilticBoard.cols; j ++) {
			html += "<td><div id='cell" + i +""+ j +"' class='quilticCell'";
			html +=" onclick='cellClick(event)' onDragover='dragOverCell(event)' ondragleave='exitDrag(event)' onDrop='dropCell(event)'";
			html += " data-row='"+ i + "' data-col='" + j + "'>";
			var tile = quilticBoard.tiles[i][j];
			html +=  quiltic.tile(tile.t,tile.l,tile.b,tile.r);
			html += "</div></td>";
		} 
		html += "</tr>";
	}
	html += "</table>";
	return html;	
};

//available tile display

function availableTiles() {
	var html = "<table align='center'>";
	html += "<tr>";
	html += "<td><div id='available1' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-b=1 data-t=1 data-l=1 data-r=1 style='border: 1px solid black'>";
	html += quiltic.tile(1,1,1,1);
	html += "</td>";
	html += "<td><div id='available1' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-b=0 data-t=0 data-l=0 data-r=0 style='border: 1px solid black'>";
	html += quiltic.tile(0,0,0,0);
	html += "</td>";
	html += "</tr>";
	html += "</table>";
	html += "<br>";
	html += "<table align='center'>";
	html += "<tr>";
	html += "<td><div id='available1a' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=1 data-l=0 data-b=0 data-r=0 style='border: 1px solid black'>";
	html += quiltic.tile(1,0,0,0);
	html += "</td>";
	html += "<td><div id='available1b' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=0 data-l=1 data-b=0 data-r=0 style='border: 1px solid black'>";
	html += quiltic.tile(0,1,0,0);
	html += "</td>";
	html += "<td><div id='available1c' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=0 data-l=0 data-b=1 data-r=0 style='border: 1px solid black'>";
	html += quiltic.tile(0,0,1,0);
	html += "</td>";
	html += "<td><div id='available1d' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=0 data-l=0 data-b=0 data-r=1 style='border: 1px solid black'>";
	html += quiltic.tile(0,0,0,1);
	html += "</td>";
	html += "</tr>";
	html += "</table>";
	html += "<br>";
	html += "<table align='center'>";
	html += "<tr>";
	html += "<td><div id='available2a' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=1 data-l=1 data-b=0 data-r=0 style='border: 1px solid black'>";
	html += quiltic.tile(1,1,0,0);
	html += "</td>";
	html += "<td><div id='available2b' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=0 data-l=1 data-b=1 data-r=0 style='border: 1px solid black'>";
	html += quiltic.tile(0,1,1,0);
	html += "</td>";
	html += "<td><div id='available2c' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=0 data-l=0 data-b=1 data-r=1 style='border: 1px solid black'>";
	html += quiltic.tile(0,0,1,1);
	html += "</td>";
	html += "<td><div id='available2d' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=1 data-l=0 data-b=0 data-r=1 style='border: 1px solid black'>";
	html += quiltic.tile(1,0,0,1);
	html += "</td>";
	html += "<td><div id='available2e' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=1 data-l=0 data-b=1 data-r=0 style='border: 1px solid black'>";
	html += quiltic.tile(1,0,1,0);
	html += "</td>";
	html += "<td><div id='available2f' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=0 data-l=1 data-b=0 data-r=1 style='border: 1px solid black'>";
	html += quiltic.tile(0,1,0,1);
	html += "</td>";
	html += "</tr>";
	html += "</table>";
	html += "<br>";
	html += "<table align='center'>";
	html += "<tr>";
	html += "<td><div id='available3a' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=1 data-l=1 data-b=1 data-r=0 style='border: 1px solid black'>";
	html += quiltic.tile(1,1,1,0);
	html += "</td>";
	html += "<td><div id='available3b' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=0 data-l=1 data-b=1 data-r=1 style='border: 1px solid black'>";
	html += quiltic.tile(0,1,1,1);
	html += "</td>";
	html += "<td><div id='available3c' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=1 data-l=0 data-b=1 data-r=1 style='border: 1px solid black'>";
	html += quiltic.tile(1,0,1,1);
	html += "</td>";
	html += "<td><div id='available3d' class='quilticCell' draggable=true ondragstart=startDrag(event)";
	html += " data-t=1 data-l=1 data-b=0 data-r=1 style='border: 1px solid black'>";
	html += quiltic.tile(1,1,0,1);
	html += "</td>";
	html += "</tr>";
	html += "</table>";
	return html;	
};

quiltic.available = availableTiles();

function randomInt(lessThan){
	var selection = Math.floor(Math.random()*(lessThan));
	return selection;
};

function dragOverCell(event) {
	event.preventDefault();
	event.currentTarget.setAttribute("style","border: 1px solid black");
};

function exitDrag(event) {
	event.currentTarget.setAttribute("style","");	
};

function startDrag(event) {
	var trbl = "" + event.target.getAttribute('data-t') + event.target.getAttribute('data-l');
	trbl += event.target.getAttribute('data-b') + event.target.getAttribute('data-r');
	event.dataTransfer.setData('text/plain', trbl);
	effectAllowed = "copy";
}

function dropCell(event) {
	var i = parseInt(event.currentTarget.getAttribute("data-row"));
	var j = parseInt(event.currentTarget.getAttribute("data-col"));
	var data =  event.dataTransfer.getData("text");
	var cell = quiltic.board.tiles[i][j];
	cell.t = parseInt(data.charAt(0));
	cell.l = parseInt(data.charAt(1));
	cell.b = parseInt(data.charAt(2));
	cell.r = parseInt(data.charAt(3));
	cell.enforceBorders();
	cell.updateNeighbors();
	
	quiltic.board.countCrossings();
	quiltic.crossings = quiltic.board.crossings;
	quiltic.display = htmlTable(quiltic.board);
	evnts.fireEvent("refresh");

};

function cellClick(event) {
	var i = parseInt(event.currentTarget.getAttribute("data-row"));
	var j = parseInt(event.currentTarget.getAttribute("data-col"));
	quiltic.board.tiles[i][j].rotate();
	quiltic.board.tiles[i][j].enforceBorders();
	quiltic.board.tiles[i][j].updateNeighbors();
	quiltic.board.countCrossings();
	quiltic.crossings = quiltic.board.crossings;
	quiltic.display = htmlTable(quiltic.board);
	evnts.fireEvent("refresh");
	
};


