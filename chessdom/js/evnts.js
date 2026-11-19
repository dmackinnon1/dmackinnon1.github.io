'use strict';
/**
* Simple callback handling
*
*/
let evnts = {};
evnts.dict = {};

evnts.fireEvent = function(eventName) {
	let callbacks = evnts.dict[eventName] ?? [];
	callbacks.forEach(callback => callback());
};

evnts.addCallback = function (eventName, callback) {
	if (evnts.dict[eventName] == null) {
		evnts.dict[eventName] = [];
	}
	evnts.dict[eventName].push(callback);
};

