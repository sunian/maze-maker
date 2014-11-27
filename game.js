/**
 * Created by Sun on 11/24/2014.
 */
var gridSize = 15;
var players = null;
var grid = null;
var turn = 0;
var PLAYER_STATUS = {OK: "ok", STUCK: "stuck", DEAD: "dead", PRISON: "prison"};
var keymap = {32: "space", 37: "left", 38: "up", 39: "right", 40: "down"};

var mage = {class: "mage", fatal: "pitfall", immune: "fire", status: PLAYER_STATUS.OK};
var warrior = {class: "warrior", fatal: "spikes", immune: "pitfall", status: PLAYER_STATUS.OK};
var thief = {class: "thief", fatal: "fire", immune: "spikes", status: PLAYER_STATUS.OK};
var cleric = {class: "cleric", fatal: "none", immune: "none", status: PLAYER_STATUS.OK};
var maker = null;

$(function () {
	$("#play").click(function () {
		players = [];
		maker = {};
		if ($("input#m")[0].checked) players.push($.extend({}, mage));
		if ($("input#w")[0].checked) players.push($.extend({}, warrior));
		if ($("input#t")[0].checked) players.push($.extend({}, thief));
		if ($("input#c")[0].checked) players.push($.extend({}, cleric));
		shuffle(players);
		initMaze($("#csv").val());
		turn = 0;
		updateGameState();
	});
	$("#roll").click(function () {
		if ($("input#moves").val() * 1 > 0) return;
		$("input#moves").val(Math.ceil(Math.random() * 6));
	});
	$("#reveal").click(function () {
		$("table.maze td.fog").addClass("hidefog visible");
		$("table.maze td.maker").addClass("visible");
	});
	$(document).keydown(function (e) {
		//console.log(e.which);
		if (players != null && turn == players.length) {
			$("table.maze td.hidefog").removeClass("hidefog");
			$("table.maze td.maker").removeClass("visible");
			var valid = true;
			switch (keymap[e.which]) {
				case "space":
					maker.row = maker.rowTemp;
					maker.col = maker.colTemp;
					advanceTurn();
					break;
				case "left":
					if (maker.colTemp > 0 && maker.colTemp >= maker.col)
						maker.colTemp--;
					break;
				case "right":
					if (maker.colTemp < gridSize - 1 && maker.colTemp <= maker.col)
						maker.colTemp++;
					break;
				case "up":
					if (maker.rowTemp > 0 && maker.rowTemp >= maker.row)
						maker.rowTemp--;
					break;
				case "down":
					if (maker.rowTemp < gridSize - 1 && maker.rowTemp <= maker.row)
						maker.rowTemp++;
					break;
				default :
					valid = false;
					break;
			}
			if (valid) {
				e.preventDefault();
				updateGameState();
			}
		}
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
					cell.addClass("maker visible");
					maker.row = i; maker.col = j;
					maker.rowTemp = i; maker.colTemp = j;
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
						players[p].row = i; players[p].col = j;
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
			if (i == 0) cell.append("<span class='top'>" + (j + 1) + "</span>");
			if (j == 0) cell.append("<span class='left'>" + (i + 1) + "</span>");
			if (i == gridSize - 1) cell.append("<span class='bottom'>" + (j + 1) + "</span>");
			if (j == gridSize - 1) cell.append("<span class='right'>" + (i + 1) + "</span>");
			cell.addClass("fog");
			row.append(cell);
			cell.bind("click", [i, j], cellClicked);
		}
		maze.append(row);
	}
	$("div.maze-container").empty().append(maze);
}

function cellClicked(e) {
	if (turn < players.length) {
		var moves = $("input#moves").val() * 1;
		if (moves == 0) return;
		if (getCell(e.data[0], e.data[1]).hasClass("wall")) return;
		if (e.data[0] == players[turn].row) {
			if (Math.abs(e.data[1] - players[turn].col) != 1) return;
		} else if (e.data[1] == players[turn].col) {
			if (Math.abs(e.data[0] - players[turn].row) != 1) return;
		} else return;
		players[turn].row = e.data[0];
		players[turn].col = e.data[1];
		moves--;
		$("input#moves").val(moves);
		if (moves == 0) advanceTurn();
		updateGameState();
	}
}

function advanceTurn() {
	turn++;
	if (turn < players.length) {
		if (players[turn].status != PLAYER_STATUS.OK) {
			advanceTurn();
		}
	} else if (turn > players.length) {
		turn = -1;
		advanceTurn();
	}
}

function getCell(row, col) {
	if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return $();
	return $($("table.maze tr")[row].children[col]);
}

function updateGameState() {
	updateGameStatus();
	updatePlayers();
	updateMaker();
	updateFog();
}

function updateFog() {
	for (var p in players) {
		if (players[p].status != PLAYER_STATUS.PRISON) {
			getCell(players[p].row, players[p].col).removeClass("fog");
			getCell(players[p].row - 1, players[p].col).removeClass("fog");
			getCell(players[p].row + 1, players[p].col).removeClass("fog");
			getCell(players[p].row, players[p].col - 1).removeClass("fog");
			getCell(players[p].row, players[p].col + 1).removeClass("fog");
			if (!getCell(players[p].row - 1, players[p].col).hasClass("wall") || !getCell(players[p].row, players[p].col + 1).hassClass("wall"))
				getCell(players[p].row - 1, players[p].col + 1).removeClass("fog");
			if (!getCell(players[p].row - 1, players[p].col).hasClass("wall") || !getCell(players[p].row, players[p].col - 1).hassClass("wall"))
				getCell(players[p].row - 1, players[p].col - 1).removeClass("fog");
			if (!getCell(players[p].row + 1, players[p].col).hasClass("wall") || !getCell(players[p].row, players[p].col + 1).hassClass("wall"))
				getCell(players[p].row + 1, players[p].col + 1).removeClass("fog");
			if (!getCell(players[p].row + 1, players[p].col).hasClass("wall") || !getCell(players[p].row, players[p].col - 1).hassClass("wall"))
				getCell(players[p].row + 1, players[p].col - 1).removeClass("fog");
		}
	}
}

function updateGameStatus() {
	if (turn < players.length) {
		$("input#reveal").css("visibility", "hidden");
		$("div#game-status").text(players[turn].class + "'s turn to move!");
	} else {
		$("input#reveal").css("visibility", "");
		$("div#game-status").text("Maze Maker's turn to move!");
	}
}

function updatePlayers() {
	for (var p in players) {
		$("table.maze td").removeClass(players[p].class);
		getCell(players[p].row, players[p].col).addClass(players[p].class);
	}
}

function updateMaker() {
	$("table.maze td.maker").removeClass("maker LOS");
	if (getCell(maker.row, maker.col).addClass("maker").hasClass("wall")) return;
	for (var p in players) {
		if (players[p].status == PLAYER_STATUS.DEAD || players[p].status == PLAYER_STATUS.PRISON) continue;
		var rowDiff = Math.sign(maker.row - players[p].row);
		var colDiff = Math.sign(maker.col - players[p].col);
		if (rowDiff * colDiff == 0) {
			var hasWall = false;
			for (var i = players[p].row; i != maker.row + rowDiff; i += rowDiff) {
				for (var j = players[p].col; j != maker.col + colDiff; j += colDiff) {
					if (getCell(i, j).hasClass("wall")) hasWall = true;
				}
			}
			if (!hasWall) {
				getCell(maker.row, maker.col).addClass("LOS");
				break;
			}
		}
	}
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

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