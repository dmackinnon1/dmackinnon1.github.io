
//$.getScript('polydiv.js', function() {} put tests in here if test.html does not include the dependency
/*
* Randomly generates Rational expressions.
*/
var count = 0;
var limit = 6; //limit - how many examples will we provide?
var cRange = 9;

var generateWithRemainders = true;

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
		terms.push(randomRange(0 - cRange, cRange));
	}
	return new Poly(terms);
}

function randomRational() {
	//1 pick a random remainder, lets make it from deg 0 to 2;
	//let's weight things towards having no remainder -  a bit better than 50%
	var remainder = new Poly([0]);
	if (generateWithRemainders === true) {
		remainder = randomPoly(randomInt(2));
	}
	//2 pick a random quotient, lets make it 1 or 2 more than the remainder;
	var quotient = randomPoly(randomRange(1,2) + remainder.degree());	
	//3 now pick a denominator, make it in the range of deg 1 to 3.
	var denominator = randomPoly(randomRange(1,3));
	// now the numerator will be computed: n = qd + r	
	var numerator = quotient.prod(denominator).add(remainder);
	return new Rational(numerator, denominator);
};