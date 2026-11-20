'use strict';
/*
* The menu at the top of every page: one row of buttons for each family of puzzles,
* with the current page highlighted. A page shows it by including this script and an
* empty <span id="siteMenu"></span> where the menu should go. Add a page here and it
* appears on every page.
*/
const MENU = [
	{ label: "Placement", pages: [
		["puzzles.html", "Puzzles"],
		["index.html", "Explorer"],
		["capture.html", "Piece Meal"],
		["avoidance.html", "Safe Harbour"],
	]},
	{ label: "Tours", pages: [
		["kixote.html", "Kixote"],
		["hidato.html", "Hidato"],
		["numbrix.html", "Numbrix"],
		["tourist.html", "Tourist"],
		["joust.html", "Joust"],
		["generator.html", "Generator"],
	]},
];

// the menu's HTML, with currentPage (e.g. "capture.html") highlighted
function menuHTML(currentPage) {
	return MENU.map(group => {
		let links = group.pages.map(([file, title]) =>
			"<a class='btn " + (file === currentPage ? "btn-primary" : "btn-default") + "' href='" + file + "'>" + title + "</a>");
		return "<span class='btn-group' role='group' aria-label='" + group.label + " puzzles'>"
			+ "<span class='btn btn-link disabled'>" + group.label + "</span>" + links.join("") + "</span>";
	}).join("<br>");
}

document.addEventListener("DOMContentLoaded", function() {
	let menu = document.getElementById("siteMenu");
	// the page's file name, e.g. "capture.html"; the site's front page is index.html
	let currentPage = location.pathname.split("/").pop() || "index.html";
	if (menu) menu.innerHTML = menuHTML(currentPage);
});
