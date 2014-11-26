/**
 * Created by Sun on 11/24/2014.
 */
var gridSize = 15;
var players = null;
var grid = null;
var turn = 0;

$(function () {
	$("#play").click(function () {
		players = [];
		if ($("input#m")[0].checked) players.push(mage);
		if ($("input#w")[0].checked) players.push(warrior);
		if ($("input#t")[0].checked) players.push(thief);
		if ($("input#c")[0].checked) players.push(cleric);
		shuffle(players);
		initMaze($("#csv").val());
		turn = 0;
		startGame();
	});
	$("#roll").click(function () {
		if ($("input#moves").val() * 1 > 0) return;
		$("input#moves").val(Math.ceil(Math.random() * 6));
	});
	$("#reveal").click(function () {
		$("table.maze td.fog").addClass("hidefog");
		$("table.maze td.maker").addClass("visible");
	});
});

function initMaze(csv) {
	grid = csv.split("\n");
	for (var row in grid) {
		grid[row] = grid[row].split(",");
	}
	var maze = $("<table class='maze'></table>");
	for (var i = 0; i < gridSize; i++) {
		var row = $("<tr></tr>");
		for (var j = 0; j < gridSize; j++) {
			var cell = $("<td class=''><a class='a'></a><a class='b'></a><br><a class='c'></a><a class='d'></a></td>");
			switch (grid[i][j]) {
				case "M":
					cell.addClass("maker");
					break;
				case "W":
					cell.addClass("wall");
					break;
				case "T":
					cell.addClass("treasure");
					break;
				case "@":
					cell.addClass("warp");
					break;
				case "C":
					cell.addClass("compass");
					break;
				case "F":
					cell.addClass("fire");
					break;
				case "P":
					cell.addClass("pitfall");
					break;
				case "S":
					cell.addClass("spikes");
					break;
				case "E":
					for (var p in players) {
						cell.addClass(players[p].class);
					}
					break;
				case "1":
				case "2":
				case "3":
				case "4":
					cell.addClass("prison");
					break;
				default :
					break;
			}
			cell.addClass("fog");
			row.append(cell);
			cell.bind("click", [i,j], cellClicked);
		}
		maze.append(row);
	}
	$("div.maze-container").empty().append(maze);
}

function cellClicked(e) {
	$("table.maze td.hidefog").removeClass("hidefog");
	$("table.maze td.maker").removeClass("visible");
	if (turn < players.length) {
		var moves = $("input#moves").val() * 1;
		if (moves == 0) return;

		moves--;
		$("input#moves").val(moves);
		if (moves == 0) turn++;
	} else {

	}
}

function getCell(row, col) {
	return $($("table.maze tr")[row].children[col]);
}

function startGame() {

}

var mage = {class: "mage", fatal: "pitfall", immune: "fire"};
var warrior = {class: "warrior", fatal: "spikes", immune: "pitfall"};
var thief = {class: "thief", fatal: "fire", immune: "spikes"};
var cleric = {class: "cleric", fatal: "none", immune: "none"};

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex ;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}