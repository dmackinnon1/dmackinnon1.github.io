

var PolyGrid = {
	useGlyphQuestion: false,
	glyphQuestion:"<span class='glyphicon glyphicon-question-sign'> ",
	nonGlyphQuestion:"-- ? --",
};
/*
* A Poly represents a single variable polynomial.
* This representation is used to help carry out calculations
* like polynomial division.
*/

class Poly {
	/*
	* To create a polynomial, provide a list of coefficients.
	* var p = new Poly([1,2,3]); creates 1 + 2x + 3x^2.
	*/
	constructor(coefficients) {
		this.coefficients = coefficients;
	}
	
	static zero() {
		return new Poly([0]);
	}
	
	/*
	* The rawSize ofthe polynomial may include padding
	*/
	rawSize() {
		return this.coefficients.length;
	}
	
	/*
	* The degree ofthe polynomial is the degree of 
	* the highest term with a non-zero coefficient.
	*/
	degree() {
		var degree = 0;
		for (var i = 0; i < this.rawSize(); i ++) {
			if (this.coefficients[i]!=0) {
				degree = i;
			}
		}
		return degree;
	}
	
	/*
	* Sometimes you want to know the coefficient beyond 
	* what is actually declared in Poly itself - these are
	* always zero. For example what is the degree 4 coefficient
	* in 2x^3? It is zero.
	*/
	coefficient(degree) {
		if (degree > this.rawSize() -1) {
			return 0;
		}
		return this.coefficients[degree];
	}
	
	/*
	* Combining polynomials sometimes results in extra padding,
	* zero valued coefficients at the end of the list. These 
	* can be removed.
	*/
	trim() {
		var start = this.coefficients.length -1;
		for (var i = start; i >= 0; i--){
			if (this.coefficients[i] == 0) {
				this.coefficients.pop();
			} else {
				return this;
			}
		}
		return this;
	}
	/*
	* return a string for the ith term of the polynomial
	*/
	showAt(i, isLeading, showZero) {
		var termString = "";
		var currentPoly = this.polyAt(i);
		var term = currentPoly.coefficients[i];
		if (term === 0) {
			if (showZero) return "0";
			return "";
		}
		//figure out the sign
		var sign = "+";
		if (term < 0) {
			term = term * (-1);
			sign = "-";
		} else if (isLeading) {
			sign = "";
		}
		// adjust the term
		if (i !== 0 && term === 1) {
			term = "";
		}
		//figure out the power
		var power = "";
		if (i === 1) {
			power = "x";
		} else if (i > 1) {
			power = "x^" + i;
		}

		var result = "";
		if (isLeading) {
			result += sign + term + power;
		} else {
			result += " "+ sign + " " + term + power;
		}
		return result;
	}
	/*
	* Use show() to print the polynomial in ascending order.
	*/
	show() {
		this.trim();
		var rep = "";
		if (this.degree() === 0){
			rep = this.showAt(0,true,true);
		} else {
			var first = true;
			var rep = "";
			for (var i = 0; i < this.rawSize(); i ++) {
				rep += this.showAt(i,first, false);
				first = false;
			}
		}
		return rep;
	}

	/*
	* Shows a polynomial in descending order. 
	* TODO: There are some bugs in here.
	*/
	revShow() {
		this.trim();
		var rep = "";
		if (this.degree() === 0){
			rep = this.showAt(0,true,true);
		} else {
			var first = true;
			var rep = "";
			for (var i = this.rawSize() -1; i >= 0; i --) {
				rep += this.showAt(i,first, false);
				first = false;
			}
		}
		return rep;
	}
	
	/*
	* Create a new polynomial whose terms are the scalar product of scalar and this.
	*/
	scalarProd(scalar) {
		var newTerms = [];
		for (var i = 0; i < this.rawSize(); i ++) {
			newTerms.push(this.coefficient(i)*scalar);
		}		
		return new Poly(newTerms).trim();
	}
	
	/*
	* Create a new polynomial whose terms are the sum of other and this.
	*/
	add(other) {
		if (other.rawSize() > this.rawSize()) {
			return other.add(this);
		}
		var newTerms = [];
		for (var i = 0; i < this.rawSize(); i ++) {
			newTerms.push(this.coefficient(i) + other.coefficient(i));
		}
		return new Poly(newTerms).trim();
	}
	
	/*
	* Create a new polynomial whose terms are the difference of this and other.
	*/
	sub(other) {
		if (other.rawSize() > this.rawSize()) {
			return other.scalarProd(-1).add(this);
		} 
		return this.add(other.scalarProd(-1));
	}
	/*
	* For some operations it helps to stretch out the polynomial
	* by adding place holders - extra terms with 0 coefficients.
	*/	
	padTo(finalDegree) {
		if (this.coefficients.length -1 >=  finalDegree) 
			return this;
		var start =  this.coefficients.length;
		for (var i = start; i <= finalDegree; i++ ) {
			this.coefficients.push(0);
		}
		return this;
	}
	
	addToTerm(i, toAdd) {
		this.padTo(i);	
		var temp = this.coefficient(i) + toAdd;
		this.coefficients[i] = temp;
		return this;
		
	}
	/*
	* Returns a single term in the polynomial as a polynomial in its own right.
	*/
	polyAt(degree) {
		var poly = new Poly([0]);
		poly.padTo(degree);
		poly.addToTerm(degree, this.coefficient(degree));
		return poly;
	}
	
	/*
	* The grid is a list of polynomials. We want to find the sum of the coefficients
	* of a certain degree of all polynomials in the grid.
	*/	
	sumAt(n, grid) {
		var sum = 0;
		for (var i = 0; i < grid.length; i++){
			var p = grid[i];
			sum += p.coefficient(n);
		}
		return sum;
	}
	
	isEqual(other) {
		if (this.degree() !== other.degree()) return false;	
		this.trim();
		other.trim();
		for (var i = 0; i < this.rawSize(); i++){
			if (this.coefficient(i) !== other.coefficient(i)) return false;		
		}
		return true;		
	}
	
	prod(other) {
		if (other.rawSize() > this.rawSize()) {
			return other.prod(this);
		}
		var newTerms = [];
		for (var k = 0; k < this.rawSize() + other.rawSize(); k ++ ){
			newTerms.push(0);
		}
		
		for(var i = 0; i < this.rawSize(); i++) {
			for (var j = 0; j < other.rawSize(); j++) {
				var existing = newTerms[(i+j)];
				newTerms[i+j] = existing + (this.coefficient(i) * (other.coefficient(j)));
			}
		}
		return new Poly(newTerms).trim();
	}
	
	latexShow() {
		return this.show();
	}
	revLatexShow() {
		return this.revShow();
	}
	
	toString() {
		return this.show();
	}

	divide(other){
		var n = other.degree();
		if (n > this.degree()) {
			return new Mixed(new Poly([0]), new Rational(this, other));
		}
		var quotient = new Poly([0]);
		var grid = [];
		var history = [];
		for(var i=0; i<= n; i++ ) {
			grid.push(new Poly([0]));
		}
		var m = this.degree();
		
		for (var k = m-n; k >=0; k-- ){
			var t = k+n;
			quotient.addToTerm(k, (this.coefficient(t) - this.sumAt(t,grid))/other.coefficient(n));
			history.push(new GridPair(this.cloneGrid(grid), k));
			for(var i = n; i >=0; i--) {	
				var temp = grid[i].add(other.polyAt(i).prod(quotient.polyAt(k)));
				grid[i] = temp;
				//history.push(this.cloneGrid(grid));
			}
		}	
		history.push(new GridPair(this.cloneGrid(grid), -1));		
		//printGrid(0, n, grid);
		var question = new Rational(this, other);
		var product = quotient.prod(other);
		if (this.isEqual(product)){
			return new DivisionResult(question, grid, history, new Mixed(quotient, null));
		}
		
		var rNum = this.sub(product);
		return  new DivisionResult(question, grid, history, new Mixed(quotient, new Rational(rNum, other)));
		
	}
	
	clone() {
		var copies = this.coefficients.slice();
		return new Poly(copies);
	}
	
	cloneGrid(aGrid) {
		var cloneGrid = [];
		for(var i = 0; i < aGrid.length; i++){
			cloneGrid.push(aGrid[i].clone());
		}			
		return cloneGrid;
	}
};

class GridPair {
	constructor(grid, column) {
		this.grid = grid;
		this.column = column;
	}
};

/*
* Represents a rational expression. It is useful to define this so that
* the same methods for showing polynomials can apply. It could be extended
* to other operations.
*/
class Rational {

	constructor(numerator, denominator) {
		this.numerator = numerator;
		this.denominator = denominator;
	}
	
	show() {	
		return "(" + this.numerator.show() + ")/(" + this.denominator.show() +")";
	}
	
	latexShow() {
		return "\\frac{" + this.numerator.show() + "}{" + this.denominator.show() +"}";
	}
	
	revShow() {	
		return "(" + this.numerator.revShow() + ")/(" + this.denominator.revShow() +")";
	}
	
	revLatexShow() {
		return "\\frac{" + this.numerator.revShow() + "}{" + this.denominator.revShow() +"}";
	}
	
	static zero() {
		return new Rational(new Poly([0]), new Poly([1]));
	}

	toString(){
		return this.show();
	}
	
	simplify() {
		return this.numerator.divide(this.denominator);
	}
	
};

/*
* A mixed expression combines a polynomial and a rational expression.
* It is useful to express the result of polynomial division in this way.
*/
class Mixed {
		
	constructor(main, remainder) {
		this.main = main;
		this.remainder = remainder;
	}
	
	show() {
		if (this.remainder == null && this.main == null) {
			return "0";
		}
		if (this.remainder == null) return this.main.show();
		if (this.main == null) return this.remainder.show();
		return this.main.show() + " + " + this.remainder.show();
	}
	
	latexShow() {
		if (this.remainder == null && this.main == null) {
			return "0";
		}
		if (this.remainder == null) return this.main.revLatexShow();
		if (this.main == null) return this.remainder.revLatexShow();
		return this.main.revLatexShow() + " + " + this.remainder.revLatexShow();
	}
	
	toString(){
		return this.show();
	}
};


class DivisionResult {
	/*
	* question is a rational expression expressing the division question
	* grid is an array of polygons, showing the stages of grid division
	* solution is the final result, a Mixed expression (can contain Poly, plus Rational)
	*/
	constructor(question, grid, history, solution) {
		this.question = question;
		this.grid = grid;
		this.solution = solution;
		this.history = history;
	}
	
	remainderCalculation() {
		var prod = this.question.denominator.prod(this.solution.main);
		var remain = this.question.numerator.sub(prod);
		return "$$" + remain.revShow() + "$$";
	}
	
	hasRemainder() {
		return this.solution.remainder !== null;
	}
	
	validate() {
		var remainder = null;
		if (this.solution.remainder !== null) {
			remainder = this.solution.remainder.numerator;
		}	
		var denom = this.question.denominator;
		var quotient = this.solution.main;
		var computed = null;
		if (remainder !== null) {
			computed = quotient.prod(denom).add(remainder);
		} else {
			computed = quotient.prod(denom)
		};
		console.log("computed: " + computed + " original: " + this.question.numerator);
		return this.question.numerator.isEqual(computed);	
	}

	latexShow() {
		return this.question.revLatexShow() + " = " + this.solution.latexShow();
	}
	
	latexShowSolution() {
		return this.solution.latexShow();
	}
	
	latexShowQuestion() {
		return this.question.revLatexShow();
	}
	
	show() {
		console.log("--- start grid ----")
		for (var i = 0; i < this.grid.length; i++){
			console.log(this.grid[i].revShow());
		} 
		console.log("--- end grid ----");
		
		return this.question.show() + " = " + this.solution.show();
	}
	
	internalHtmlTableRow(firstTerm, remainingTerms) {
		var rowHtml = "<tr>";
		rowHtml += "<td>" + firstTerm.revShow() + "</td>";
		for (var i = remainingTerms.rawSize() -1; i > 0; i--) {
			rowHtml += "<td>" + remainingTerms.polyAt(i).revShow() + "</td>";
		}
		return rowHtml += "</tr>";
	}
	
	internalHtmlTopRow(terms) {
		var rowHtml = "<tr>";
		rowHtml += "<td></td>";
		for (var i = terms.rawSize() -1; i >= 0; i--) {
			rowHtml += "<td>" + terms.polyAt(i).revShow() + "</td>";
		}
		return rowHtml += "</tr>";
	}
	
	htmlGrid(){
		var table = "<table>";
		table += this.internalHtmlTopRow(this.solution.main);
		var limit = this.grid.length - 1;
		for(var i = 0; i< this.grid.length; i ++) {
			table += this.internalHtmlTableRow(this.question.denominator.polyAt(limit-i), this.grid[limit-i]);
		}
		table += "</table>"	
		return table;
	}
	
	// <span class="glyphicon glyphicon-question-sign"></span>	
	//"-- ? --"
	//TODO: refactor these to reuse (latex mode)
	internalLatexHtmlTableRow(firstTerm, remainingTerms, columns, limit) {
		var rowHtml = "<tr>";
		rowHtml += "<td>" + this.latexRemoteImage(firstTerm.revShow()) + "</td>";
		var qmark = PolyGrid.nonGlyphQuestion;
		if (PolyGrid.useGlyphQuestion) {
			qmark = PolyGrid.glyphQuestion;
		}
		for (var i = 0; i <= columns; i++) {
			var index = remainingTerms.rawSize() -1 -i;
			if (columns - i > limit)
				rowHtml += "<td>" + this.latexRemoteImage(remainingTerms.polyAt(index).revShow()) + "</td>";
			else
				rowHtml += "<td>" + qmark + "</td>";

		}
		return rowHtml += "</tr>";
	}
		
	
	internalLatexHtmlTopRow(terms, limit) {
		var rowHtml = "<tr>";
		rowHtml += "<td></td>";
		var qmark = PolyGrid.nonGlyphQuestion;
		if (PolyGrid.useGlyphQuestion) {
			qmark = PolyGrid.glyphQuestion;
		}
		for (var i = terms.rawSize() -1; i >= 0; i--) {
			if (i > limit)
				rowHtml += "<td>" + this.latexRemoteImage(terms.polyAt(i).revShow()) + "</td>";
			else 
				rowHtml += "<td>" + qmark + "</td>";
		}
		return rowHtml += "</tr>";
	}
		
	htmlLatexHistory() {
		var answerSoFar = new Poly([0]);
		var htmlSection = "";
		var degree = this.question.numerator.degree();
		for (var i = 0; i < this.history.length; i++) {
			var step = this.history.length - this.history[i].column - 1;
			answerSoFar = answerSoFar.add(this.solution.main.polyAt(this.solution.main.degree() - i));
			htmlSection += "<br><h3> Step " + step + "</h3>";
			if (step === 1) {
				htmlSection += "First, place the divisor down the first column of the grid.";
				htmlSection += " The goal is to find a polynomial to place along the top so that when the grid is filled ";
				htmlSection += "by forming the product of the leftmost column and the top row, the sum will equal the dividend. ";
				htmlSection += "The top row will be the quotient. If the sum of the cells in the table does not match the dividend, ";
				htmlSection += "there is a remainder.";
				htmlSection += "<br><br>";
			} else if (step == 2){
				htmlSection += "The product of the first two cells must give us the first term in the dividend, ";
				htmlSection += "\\(" + this.question.numerator.polyAt((degree - step) + 2).revShow() + "\\).";
				htmlSection += " The rest of the column is found by multiplying each of the terms in the divisor by the term that was just placed in the top row.";
				htmlSection += "<br><br>";
			} else if (step === this.history.length) {
				htmlSection += "The next term to take care of in the dividend is ";
				htmlSection += "\\(" + this.question.numerator.polyAt((degree - step) + 2).revShow() + "\\).";
				htmlSection += " Once the whole table is filled in, if the sum of all the internal cells equals the dividend, we are done.";
				htmlSection += " Otherwise, we know that we have a remainder. To find the remainder, subtract the sum of the internal cells ";
				htmlSection += "of the grid from the divisor."
				htmlSection += "<br><br>";
			} else {
				htmlSection += "Continue by filling in the top row with a value that results in a term that completes the sum for the next highest power, ";
				htmlSection += "\\(" + this.question.numerator.polyAt((degree - step) + 2).revShow() + "\\).";
				htmlSection += " Then fill in the rest of the column by multiplying by the terms of the divisor in the first column.";
				htmlSection += "<br><br>";
			}
			htmlSection += this.htmlHistoryEntry(this.history[i].grid, this.history[i].column, answerSoFar);
		}
		htmlSection += "<br>The top row of the grid provides us with the quotient.";
		htmlSection += this.latexRemoteImage(this.solution.main.revLatexShow());
		
		if (this.hasRemainder()){
			htmlSection += "<br>In this case, there is a remainder: ";
			htmlSection += this.remainderCalculation();
			htmlSection += "<br>";
		} else {
			htmlSection += "<br>In this case, the sum of all the inner cells of the grid equals the dividend, so the remainder is zero.";
			htmlSection += "<br>";
		}
		
		return htmlSection;		
	}
	
	htmlHistoryEntry(histGrid, index, answerSoFar) {
		var table = "<table align='center'>";
		table += this.internalLatexHtmlTopRow(answerSoFar, index);
		var limit = this.grid.length - 1;
		for(var i = 0; i< this.grid.length; i ++) {
			table += this.internalLatexHtmlTableRow(this.question.denominator.polyAt(limit-i), histGrid[limit-i], this.solution.main.degree(), index);
		}
		table += "</table>"	
		return table;
	}
	
	
	htmlLatexGrid(){
		var table = "<table align='center'>";
		table += this.internalLatexHtmlTopRow(this.solution.main, -1);
		var limit = this.grid.length - 1;
		for(var i = 0; i< this.grid.length; i ++) {
			table += this.internalLatexHtmlTableRow(this.question.denominator.polyAt(limit-i), this.grid[limit-i], this.solution.main.degree(),-1);
		}
		table += "</table>"	
		return table;
	}
	
	toString() {
		return this.show();
	}	
	
	latexRemoteImage(latexString) {
		return "$$"+latexString +"$$";
	}
};

// todo: move latex functions to another location?

/*
* latex.codecogs.com provides a web service that will render latex, returnign a gif image.
* The latext text is supplied via a query parameter to the GET method shown below.
* This method was abandoned in favor of mathjax rendering.
*/
function latexRemoteImage(latexString) {
	var mathJaxDelimiter = "$$";
	return mathJaxDelimiter + latexString + mathJaxDelimiter;
	//return "<img src='http://latex.codecogs.com/gif.latex?" + latexString +"'alt='" + latexString + "'/>";
}
