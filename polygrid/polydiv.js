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
	* Use show() to print the polynomial in ascending order.
	*/
	show() {
		if (this.degree() === 0 && this.coefficient(0) === 0) {
			return "" + this.coefficient(0);
		}
		var rep = "";		
		var first = true;
		for (var i = 0; i < this.rawSize(); i ++) {
			if (this.coefficient(i) === 0) continue;
			
			if (!first) {
				if (this.coefficient(i) > 0){
					rep += " + ";
				} else {
					rep += " - ";
				}
				
				if (this.coefficient(i) != 1 && this.coefficient(i) !== -1) {
					if (this.coefficient(i) > 0) {
						rep += this.coefficient(i);
					} else {
						rep += (-1 * this.coefficient(i));
					}
				}
			} else {
				if ((this.coefficient(i) !== 1 && (this.coefficient(i) !== -1)) || (i === 0)) 
					rep +=  this.coefficient(i) 
			}
			first = false;
			if (i === 1){
				rep += "x";
			}
			if (i > 1) {
				rep += "x^" + i;
			}				
		}
		return rep;
	}

	/*
	* Shows a polynomial in descending order. 
	* TODO: There are some bugs in here.
	*/
	revShow() {
		if (this.degree() === 0 && this.coefficient(0) === 0) {
			return "" + this.coefficient(0);
		}
		var rep = "";		
		var first = true;
		for (var i = this.degree(); i >= 0 ; i --) {
			if (this.coefficient(i) === 0) continue;
			
			if (!first) {
				if (this.coefficient(i) > 0){
					rep += " + ";
				} else {
					rep += " - ";
				}
				
				if (this.coefficient(i) != 1) {
					if (this.coefficient(i) > 0) {
						rep += this.coefficient(i);
					} else if (this.coefficient(i) !== -1){
						rep += (-1 * this.coefficient(i));
					} else {
						rep += "1";
					}
				} else {
					if (i === 0){
						rep += "1";
					} 
				}
			} else {	
				if ((this.coefficient(i) !== 1 && (this.coefficient(i) !== -1)) || (i === 0)){ 
					rep +=  this.coefficient(i) 
				} else if(this.coefficient(i) === -1){
					if (i == 0){
						rep += "1";
					} else {
						rep +=  "-";
					}
				} 
			}
			first = false;
			if (i === 1){
				rep += "x";
			}
			if (i > 1) {
				rep += "x^" + i;
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
				newTerms.splice(i+j, 1, existing + (this.coefficient(i) * (other.coefficient(j))));
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
			return new Mixed(new Poly([0]), new Rat(this, other));
		}
		var quotient = new Poly([0]);
		var grid = [];
		for(var i=0; i<= n; i++ ) {
			grid.push(new Poly([0]));
		}
		var m = this.degree();
		
		for (var k = m-n; k >=0; k-- ){
			var t = k+n;
			quotient.addToTerm(k, (this.coefficient(t) - this.sumAt(t,grid))/other.coefficient(n));
			for(var i = n; i >=0; i--) {	
				var temp = grid[i].add(other.polyAt(i).prod(quotient.polyAt(k)));
				grid[i] = temp;
			}
		}
		
		//printGrid(0, n, grid);
		var question = new Rational(this, other);
		var product = quotient.prod(other);
		if (this.isEqual(product)){
			return new DivisionResult(question, grid, new Mixed(quotient, null));
		}
		
		var rNum = this.sub(product);
		return  new DivisionResult(question, grid, new Mixed(quotient, new Rational(rNum, other)));
		
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
	constructor(question, grid, solution) {
		this.question = question;
		this.grid = grid;
		this.solution = solution;
	}
	
	latexShow() {
		return this.question.revLatexShow() + " = " + this.solution.latexShow();
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
	//TODO: refactor these to reuse (latex mode)
	internalLatexHtmlTableRow(firstTerm, remainingTerms) {
		var rowHtml = "<tr>";
		rowHtml += "<td>" + this.latexRemoteImage(firstTerm.revShow()) + "</td>";
		for (var i = remainingTerms.rawSize() -1; i > 0; i--) {
			rowHtml += "<td>" + this.latexRemoteImage(remainingTerms.polyAt(i).revShow()) + "</td>";
		}
		return rowHtml += "</tr>";
	}
	
	internalLatexHtmlTopRow(terms) {
		var rowHtml = "<tr>";
		rowHtml += "<td></td>";
		for (var i = terms.rawSize() -1; i >= 0; i--) {
			rowHtml += "<td>" + this.latexRemoteImage(terms.polyAt(i).revShow()) + "</td>";
		}
		return rowHtml += "</tr>";
	}
	
	htmlLatexGrid(){
		var table = "<table>";
		table += this.internalLatexHtmlTopRow(this.solution.main);
		var limit = this.grid.length - 1;
		for(var i = 0; i< this.grid.length; i ++) {
			table += this.internalLatexHtmlTableRow(this.question.denominator.polyAt(limit-i), this.grid[limit-i]);
		}
		table += "</table>"	
		return table;
	}
	
	toString() {
		return this.show();
	}	
	
	latexRemoteImage(latexString) {
		console.log("latexRemoteImage provided polnomial: " + latexString);
		var imgStr = "<img src='http://latex.codecogs.com/gif.latex?" + latexString +"'alt='" + latexString + "'/>";
		return imgStr;
	}
}




// todo: move latex functions to another location?

/*
* latex.codecogs.com provides a web service that will render latex, returnign a gif image.
* The latext text is supplied via a query parameter to the GET method shown below.
*/
function latexRemoteImage(latexString) {
	console.log("latexRemoteImage provided polnomial: " + latexString);
	var imgStr = "<img src='http://latex.codecogs.com/gif.latex?" + latexString +"'alt='" + latexString + "'/>";
	return imgStr;
}

/*
* Just for testing
*/
function samplePolyImage() {
	var p3 = new Poly([0,-1,2,-3,0,5]);
	return latexRemoteImage(p3.latexShow());	
}
function samplePolyImage2() {
	var p3 = new Rational(new Poly([3,-1,0,9]), new Poly([-2,3]));
	return latexRemoteImage(p3.simplify().latexShow());	
}
