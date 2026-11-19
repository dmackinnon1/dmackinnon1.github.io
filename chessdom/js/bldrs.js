/**
* Builders to be used for HTML construction.
* ------------------------------------------
* This version of bldrs.js takes things in a little different direction.
* The builder is intended to be kept alive and updated dynamically. 
* Every time you need to represent the builder, you call the .build() method.
*/
'use strict';
class Bldr {

	constructor(name) {
		this.name = name;
		this.attributes = [];
		this.elements = [];
	}

	att(name, value) {
		let att = new Attribute(name, value);
		this.attributes.push(att);
		return this;
	}
	// add element allows you to add a builder to a builder
	elem(bldr) {
		this.elements.push(bldr);
		return this;
	}

	text(text) {
		this.elements.push (new RawHtml(text));
		return this;
	}

	build() {
		let atts = this.attributes.map(a => " " + a.toString()).join("");
		let children = this.elements.map(e => " " + e.build()).join("");
		return "<" + this.name + atts + ">" + children + "</" + this.name + ">";
	}
};

class Attribute {
	constructor(name, value) {
		this.name = name;
		this.value = value;
	}

	toString() {
		let s = "" + this.name + "='" + this.value + "'";
		return s;
	}
};

class RawHtml {
	constructor(raw) {
		this.raw = raw;
	}
	build() {
		return this.raw;
	}
};

