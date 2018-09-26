"use strict";

let count = 0;
let examples = [];
function hasMoreExamples() {
	return count < examples.length;
};

function nextExample() {
	let nextExample = examples[count];
	count ++;
	return nextExample;
};

//just to make the construction shorter
function div(numerator,denominator ){
	return new Rational(new Poly(numerator),new Poly(denominator));
};
/*
* initializing the exaples array
*/
examples = [div([-10,-3,9,27],[-2,3]), 
	div([-42, 0, -12, 1],[-3,1]), 
	div([-10, 1, -5, 2],[1, -4, 1]), 
	div([12, -2, 3, 6], [1,2]), 
	div([2,1,2,3],[4,0,2]), 
	div([12,-2,3,6],[1,2]),
	div([-3,2,1],[1,1])
	];
