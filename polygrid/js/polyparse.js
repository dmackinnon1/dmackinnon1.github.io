"use strict";

/*
* Classes for parsing polynomial expressions, used on the calc.html page.
*
*/
class Token {

	constructor(value, type) {
		this.value = value;
		this.type = type;
	}

	static end() {
		return new Token(null, 'end');
	}

	isDigit() {
		return this.type === 'digit';		
	}

	isSign() {
		return this.type === 'sign';
	}

	isCarrot() {
		return this.type === 'carrot';
	}

	isVariable() {
		return this.type === 'variable';		
	}

	isMultiplication() {
		return this.type === 'multiplication';
	}

	toString() {
		return "[" + this.value + "]." + this.type + " ";
	}

	isError() {
		return this.type === 'error';
	}

	isNumber() {
		return this.type === 'number';
	}

	isTerm() {
		return this.type === 'term';
	}

	isEnd() {
		return this.type == 'end';
	}

}


class Parser {
	constructor(input) {
		this.input = input
		this.tokens = [];
		this.stack = [];
		this.tokenIndex = 0;
		this.stackIndex = 0;	
		this.result = null;	
	}

	parse() {
		this.tokenize();
		this.reduce();
		if (this.hasError()) {
			console.log("had some difficulty parsing this " + this.showStack());
			return;
		}
		this.emit();
		this.result = this.consolidate();
		return this.result;
	}

	hasRemaining() {
		return this.tokenIndex < this.tokens.length; 
	}

	currentToken() {
		return this.tokens[this.tokenIndex];
	}

	peekToken() {
		if (this.tokenIndex + 1 < this.tokens.length) {
			return this.tokens[this.tokenIndex +1];
		}
		return Token.end();
	}

	hasError() {
		let hasError = false;
		for (let i = 0; i < this.stack.length; i++) {
			hasError = this.stack[i].isError();
			if (hasError === true) {
				return hasError;
			}
		}
		return hasError;
	}

	showStack() {
		return "" + this.stack;
	}

	tokenize() {		
		for(let i = 0; i < this.input.length; i++) {
			let current = this.input[i];
			if (current == 'x' || current == 'X') {
				this.tokens.push(new Token('x', 'variable'));
			} else if ( current == '^') {
				this.tokens.push(new Token('^', 'carrot'))
			} else if ( current == '*') {
				this.tokens.push(new Token('*', 'multiplication'));
			} else if ( current == '+' || current == '-') {
				this.tokens.push(new Token(current, "sign"))
			} else if (!isNaN(parseInt(current))) {
				this.tokens.push(new Token(parseInt(current), "digit"));
			} else if (current === '\n' || current === '\t' || current === ' ') {
				//skip
			}
			else {
				this.tokens.push(new Token(current, 'error'));
			}
		}
	}
	
	// begin reduction rules
	readNumber() {
		while(this.hasRemaining() && this.currentToken().isDigit()) {
			this.stack.push(this.tokens[this.tokenIndex]);
			this.tokenIndex ++;
		} 
		let current = "";
		for (let i = this.stack.length-1; i >= this.stackIndex ; i--) {
			current = this.stack.pop().value + current;
		}
		let result = parseInt(current);
		if (!isNaN(result)) {
			this.stack.push(new Token(result, "number"));
			this.stackIndex++;
		}
	}

	concatenateSigns() {
		let hasSign = false;
		let signPositive = true;
		while(this.hasRemaining() && this.currentToken().isSign()) {
			hasSign = true;
			let current = this.tokens[this.tokenIndex];
			if(current.value === '-') {
				signPositive = !signPositive;
			}
			this.tokenIndex ++;
		}
		if (hasSign) {
			if(signPositive) {
				this.stack.push(new Token("+", "sign"));
			} else {
				this.stack.push(new Token("-", "sign"));
			}
			this.stackIndex ++;
		}
	}

	removeMultiplication() {
		while(this.hasRemaining() && this.currentToken().isMultiplication()) {
			this.tokenIndex ++;
		}		
	}

	fallbackRule() {
		if (!this.hasRemaining()) return;
		let current = this.currentToken(); 
		if (current.isDigit() || current.isSign() || current.isMultiplication()) return; 
		this.stack.push(current) 
		this.stackIndex ++;
		this.tokenIndex ++;
	}

	reduce() {
		while(this.hasRemaining()) {
			this.readNumber();
			this.concatenateSigns();
			this.removeMultiplication();
			this.fallbackRule();
		}
	}
	//end reduction

	//emit polynomial terms onto stack
	emit() {
		this.tokens = this.stack;
		this.stack = [];
		this.stackIndex = 0;
		this.tokenIndex = 0;
		while(this.hasRemaining()){
			this.buildTerm();
		}		
	}

	buildTerm() {		
		//carry errors through
		if (this.currentToken().isError()) {
			this.stack.push(this.currentToken());
			return;
		}
		
		//term cannot begin with a carrot
		if (this.currentToken().isCarrot()) {
			this.stack.push(new Token(this.currentToken().value, "error"));
			this.tokenIndex ++;
			return;
		}

		// case: leading with number or sign
		let number = 1;		
		if (this.currentToken().isSign()) {
			if (this.currentToken().value == '-') number = -1;
			if (this.peekToken().isEnd()) {
				this.stack.push(new Token(number, "error"));
				return;
			}
			this.tokenIndex ++; //move along, absorbing sign
		}

		//absorb number
		if (this.currentToken().isNumber()) {
			number = this.currentToken().value * number;
		
			if (this.peekToken().isEnd() || this.peekToken().isSign()) {
				this.stack.push(new Token(Poly.term(number,0), "term"));
				this.tokenIndex ++;
				return;
			} else if(this.peekToken().isCarrot()){ //illegal sequence: 123^	
				this.stack.push(new Token(this.currentToken().value, "error"));
				this.tokenIndex ++;
				return;
			}
			this.tokenIndex ++;
		}
		
		//lookahead cases
		if (this.currentToken().isVariable()) {
			if (this.peekToken().isEnd() || this.peekToken().isNumber() || this.peekToken().isSign()) {
				this.stack.push(new Token(Poly.term(number,1), "term"));
				this.tokenIndex ++;
				return;
			}
			this.tokenIndex ++;
		}
		//carrot case is remaining
		if (!this.currentToken().isCarrot() || this.peekToken().isEnd()) {
			this.stack.push(new Token(this.currentToken().value, "error"));
			this.tokenIndex ++;
			return;
		}
		//absorb carrot
		this.tokenIndex++
		if (this.currentToken().isNumber()) {
			this.stack.push(new Token(Poly.term(number,this.currentToken().value),"term"));
			this.tokenIndex ++;
			return;
		}
	}

	//polynomial terms are combined into a single expression
	consolidate() {
		if (this.hasError()) return null;
		let poly = Poly.zero();
		for (var i=0; i<this.stack.length; i++){
			poly = poly.add(this.stack[i].value);
		}

		return poly;

	}
}

