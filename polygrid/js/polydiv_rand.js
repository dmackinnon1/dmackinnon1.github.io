
//$.getScript('polydiv.js', function() {} put tests in here if test.html does not include the dependency
/*
* Randomly generates Rational expressions.
*/
var count = 0;
var limit = 4; //limit - how many examples will we provide?
var cRange = 9;

var generateWithRemainders = false;

function hasMoreExamples() {
	return count < limit;
};

function nextExample(){
	count ++;
	return randomRational();
};

function randomInt(lessThan){
	return Math.floor(Math.random()*lessThan);
};

function randomRange(greaterThan, lessThan){
	var shifted = randomInt(lessThan - greaterThan);
	return lessThan - shifted; 
};

function randomPoly(degree) {
	if (degree === 0) {
		return new Poly([randomInt(degree)]);
	}
	var terms = [];	
	for (var i = 0; i <= degree; i ++){
		//make the polynomials sparser - a good chance of zero
		var zeroChance = randomInt(10);
		if (zeroChance < 2) {
			terms.push(0);
		} else {		
			terms.push(randomRange(0 - cRange, cRange));
		}
	}
	return new Poly(terms);
}

function randomRational() {
	//1 pick a random remainder, lets make it from deg 0 to 2;
	//let's weight things towards having no remainder -  a bit better than 50%
	var remainder = new Poly([0]);
	if (generateWithRemainders === true) {
		remainder = randomPoly(randomRange(1,2));
		if (remainder.isEqual(new Poly([0]))) {
			remainder = new Poly([1,randomInt(5)]);
		}
	}
	
	console.log("remainder: " + remainder.toString());
	//2 pick a random quotient, lets make it 1 or 2 more than the remainder;
	var quotient = randomPoly(randomRange(1,2) + remainder.degree());
	if(quotient.isEqual(Poly.zero())) {
		quotient = new Poly([1,2]); //arbitrary for the moment
	}
	console.log("quotient: " + quotient.toString());
	//3 now pick a denominator, make it in the range of deg 1 to 3.
	var denominator = null;
	if (remainder.isEqual(Poly.zero())) {
		denominator = randomPoly(randomRange(1,3));
	} else {
		denominator = randomPoly(remainder.degree() + 1);
	}	
	if (denominator.isEqual(Poly.zero())){
		denominator = new Poly([1,1]); //arbitrary
	}
	console.log("denominator: " + denominator.toString());
	// now the numerator will be computed: n = qd + r	
	var numerator = quotient.prod(denominator).add(remainder);
	console.log("numerator: " + numerator.toString());
	return new Rational(numerator, denominator);
};