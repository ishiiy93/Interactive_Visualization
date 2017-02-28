// To get file started
document.getElementById("defaultOpen").click();

// To allow tab interaction
function openView(evt, viewName) {

    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(viewName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Global variables
var players = new Array();
var masterData;
var gridZoneData;
var zoneSummary = new Array();
for (var i = 1; i <= 9; i++) {
	zoneSummary.push({
		zone: i,
		count: 0, 
		average: 0,
		name: "",
	})
}
var masterZoneSummary = new Array();
var totalPitches;

// Used to read in CSV as well as masterZoneSummary (data for every player)
d3.csv("mariners.csv", function(data) {
	data.forEach(function(d) {
		d.balls = +d.balls
		d.batter = +d.batter
		d.hit_location = +d.hit_location
		d.inning = +d.inning
		d.on_1b = +d.on_1b
		d.on_2b = +d.on_2b
		d.on_3d = +d.on_3d
		d.outs_when_up = +d.outs_when_up
		d.strikes = +d.strikes
		d.zone = +d.zone
		d.hc_x = +d.hc_x
		d.hc_y = +d.hc_y
	})
	masterData = data;
	totalPitches = masterData.length;

	loaded();
	loaded3();
});

// Called after CSV is read in, and creats master data array of objects
// to be used in Strike Zone view. Also creates individual selected player's
// data.
function loaded() {
	var leftOrRight = "";
	document.getElementById("pitcherArm").disabled = true;

	// Create zoneSummary array to keep track of total zone count and its average
	for (var i = 1; i <= 9; i++) {
		masterZoneSummary.push({
			zone: i,
			count: 0, 
			average: 0,
			name: ""
		})
	}
	// Count each zone appearance in masterData
	for (var i = 0; i < masterData.length; i++) {
		for(var j = 0; j < masterZoneSummary.length; j++) {
			if (masterData[i].zone == masterZoneSummary[j].zone) {
				masterZoneSummary[j].count++;
			}
		}
	}
	// Calculate average for each zone total
	for (var i = 0; i < masterZoneSummary.length; i++) {
		masterZoneSummary[i].average = masterZoneSummary[i].count / totalPitches;
		masterZoneSummary[i].name = masterData[i].player_name;
	}

	function initiate() {
		document.getElementById("pitcherArm").disabled = false;
		leftOrRight = document.getElementById("pitcherArm").value;
		filterType(document.getElementById("playerList").value);
		loaded2();
		// loaded3();
	}

	// Begin query process when user selects a player, 
	// and it researches every time it is changed
	document.getElementById("playerList").onchange =
		function() {
			initiate();
		}

	// Begin query process when user select a L or R handed pitcher,
	// and it researches every time it is changed
	document.getElementById("pitcherArm").onchange = 
		function() {
			initiate();
		}

	function filterType(data) {
		var playerData = new Array();

		d3.select("h2").remove();

		d3.select("#description")
			.append("h2")
			.text(function(d) { return (data + " performance against a " + 
				leftOrRight + "HP") })
			.style("text-align", "center")

			for (var i = 0; i < masterData.length; i++) {
				if (masterData[i].player_name === data) {
					playerData.push(masterData[i])
				}
			}
			return zoneSummarize(playerData);
	}
	
	function zoneSummarize(data) {
		totalPitches = data.length;

		for (var i = 0; i < zoneSummary.length; i++) {
			zoneSummary[i].count = 0;
			zoneSummary[i].average = 0;
		}

		// Count each zone appearance in masterData		
		if (document.getElementById("pitcherArm").value == "") {
			for (var i = 0; i < data.length; i++) {
				for(var j = 0; j < zoneSummary.length; j++) {
					if (masterData[i].zone == zoneSummary[j].zone) {
						zoneSummary[j].count++;
					}
				}
			}
		} else {
			for (var i = 0; i < data.length; i++) {
				for(var j = 0; j < zoneSummary.length; j++) {
 					if (masterData[i].zone == zoneSummary[j].zone 
						&& masterData[i].p_throws === leftOrRight) {
						zoneSummary[j].count++;
					}
				}
			}
		}

		// Calculate average for each zone total
		for (var i = 0; i < zoneSummary.length; i++) {
			zoneSummary[i].average = zoneSummary[i].count / totalPitches;
			zoneSummary[i].name = masterData[i].player_name;
			// zoneSummary[i].p_throw = masterData[i].p_throw;
		}	
		return zoneSummary;
	}

	// Creates the grid on for Strike Zone view.
	function loaded2() {
		function gridData() {
			var data = new Array();
			var xpos = 1;
			var ypos = 1;
			var width = 100;
			var height = 100;
			var id = 0;

			for (var row = 0; row < 3; row++) {
				data.push(new Array());

				for (var column = 0; column < 3; column++) {
					data[row].push({
						id: id,
						x: xpos,
						y: ypos,
						width: width,
						height: height,
						zone: zoneSummary[id].zone,
						average: zoneSummary[id].average,
						name: zoneSummary[id].name
					})
					id++;
					xpos += width;
				}
				xpos = 1;
				ypos += height;
			}
			return data;
		}

		// Sets griddata to a variable to be used later
		var gridData = gridData();

		var grid = d3.select("#main")
			.append("g")

		d3.select("#gridSVG").remove();

		var rect = grid.append("svg")
			.attr("width", 305)
			.attr("height", 305)
			.attr("id", "gridSVG")
			.data(masterData);

		var row = rect.selectAll(".row")
			.data(gridData)
			.enter().append("g")
			.attr("class", "row")

		var column = row.selectAll(".square")
			.data(function(d) { return d; })
			.enter().append("rect")
			.attr("class", "square")
			.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y; })
			.attr("width", function(d) { return d.width; })
			.attr("height", function(d) { return d.height; })
			.style("stroke", "#000")
			.style("fill", function(d) {
				if (d.average > (0.005 + masterZoneSummary[d.id].average)) {
					return "red";
				} else if (d.average < (masterZoneSummary[d.id].average - 0.005)) {
					return "blue";
				} else if ((d.average <= (0.005 +masterZoneSummary[d.id].average)) && (d.average >= (masterZoneSummary[d.id].average - 0.005))) {
					return "white";
				}
			})
	}
}

var hoveredPlayer = "";

// Creates the 
function loaded3() {
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	    width = 600 - margin.left - margin.right,
	    height = 600 - margin.top - margin.bottom;
	// setup x 
	var xValue = function(d) { return d.hc_x;}, // data -> value
		player = function(d) { return d.player_name; },
	    xScale = d3.scaleLinear().range([0, width]), // value -> display
	    xMap = function(d) { return xScale(xValue(d));}, // data -> display
	    xAxis = d3.axisBottom()
	    	.scale(xScale);

	// setup y
	var yValue = function(d) { return d.hc_y;}, // data -> value
	    yScale = d3.scaleLinear().range([height, 0]), // value -> display
	    yMap = function(d) { return yScale(yValue(d));}, // data -> display
	    yAxis = d3.axisLeft()
	    	.scale(yScale);

	// setup fill color
	var cValue = function(d) { return d.events;},
	    color = d3.scaleOrdinal()
	    	.domain(["Single", "Double", "Triple", "Home Run"])
	    	.range(["red", "blue", "green", "yellow"]);

	// add the graph canvas to main2 of the webpage
	var chart = d3.select("#main2")
    	.append("g")

    d3.selectAll("#spraySVG").remove();

	var svg = chart.append("svg")
	  	.attr("width", 700)
	    .attr("height", 700)
	    .attr("id", "spraySVG")

	// add the tooltip area to the webpage
	var tooltip = d3.select("#main2").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

	d3.csv("mariners.csv", function(error, data) {
		// change string (from CSV) into number format
		data.forEach(function(d) {
			d.hc_y = +d.hc_y;
			d.hc_y = -1 * d.hc_y;
			d.hc_x = +d.hc_x;
			d.hc_x = -1 * d.hc_x;
		});

		// don't want dots overlapping axis, so add in buffer to data domain
		xScale.domain([d3.min(data, xValue)-10, d3.max(data, xValue)+1]);
		yScale.domain([d3.min(data, yValue)-10, d3.max(data, yValue)+10]);

		// x-axis
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append("text")
				.attr("class", "label")
				.attr("x", width)
				.attr("y", -6)
				.style("text-anchor", "end")
				.text("Calories");

		// y-axis
		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Protein (g)");

		// draw dots
		svg.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			.attr("class", "dot")
			.attr("r", 3.5)
			.attr("cx", xMap)
			.attr("cy", yMap)
			.attr("player", player)
			.style("fill", function(d) { return color(cValue(d));}) 
			.on("mouseover", function(d) {
				tooltip.transition()
					.duration(500)
					.style("opacity", 1);
				tooltip.html(d.events + "<br/> (" + player(d) + ")")
					.style("left", (d3.event.pageX + 15) + "px")
					.style("top", (d3.event.pageY - 28) + "px");

				hoveredPlayer = player(d);
				relatedDots(hoveredPlayer, tooltip, svg);
				})
			.on("mouseout", function(d) {
				console.log("first function, mouse off");
				tooltip.transition()
					.duration(200)
					.style("opacity", 0);
			});

		// draw legend
		var legend = svg.selectAll(".legend")
			.data(color.domain())
			.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		// draw legend colored rectangles
		legend.append("rect")
			.attr("x", width - 18)
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

		// draw legend text
		legend.append("text")
			.attr("x", width - 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) { return d;});
	});
}

// Very similar function to loaded(), however includes conditional class assignment
// while creating the circles
function relatedDots(hoveredPlayer, tooltip, svg) {
	console.log("in");

	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	    width = 600 - margin.left - margin.right,
	    height = 600 - margin.top - margin.bottom;

	// setup x 
	var xValue = function(d) { return d.hc_x;}, // data -> value
		player = function(d) { return d.player_name; },
	    xScale = d3.scaleLinear().range([0, width]), // value -> display
	    xMap = function(d) { return xScale(xValue(d));}, // data -> display
	    xAxis = d3.axisBottom()
	    	.scale(xScale);

	// setup y
	var yValue = function(d) { return d.hc_y;}, // data -> value
	    yScale = d3.scaleLinear().range([height, 0]), // value -> display
	    yMap = function(d) { return yScale(yValue(d));}, // data -> display
	    yAxis = d3.axisLeft()
	    	.scale(yScale);

	// setup fill color
	var cValue = function(d) { return d.events;},
	    color = d3.scaleOrdinal()
	    	.domain(["Single", "Double", "Triple", "Home Run"])
	    	.range(["red", "blue", "green", "yellow"]);

	// add the graph canvas to main2 of the webpage
	var chart = d3.select("#main2")
    	.append("g")

    d3.selectAll(".dot").remove();

	d3.csv("mariners.csv", function(error, data) {
		data.forEach(function(d) {
			d.hc_y = +d.hc_y;
			d.hc_y = -1 * d.hc_y;
			d.hc_x = +d.hc_x;
			d.hc_x = -1 * d.hc_x;
		});

		// don't want dots overlapping axis, so add in buffer to data domain
		xScale.domain([d3.min(data, xValue)-10, d3.max(data, xValue)+1]);
		yScale.domain([d3.min(data, yValue)-10, d3.max(data, yValue)+10]);

		// This is similar to the one in loaded3(), however this one will assign a class
		// depending on if the dot's player matches or does not match the player hovered over by 
		// the user.
		svg.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			.attr("class", function(d) {
				if (player(d) != hoveredPlayer) {
					return "lowOpacity"
				} else {
					return "dot"
				}
			})
			.attr("r", 3.5)
			.attr("cx", xMap)
			.attr("cy", yMap)
			.attr("player", player)
			.style("fill", function(d) { return color(cValue(d));}) 
			.on("mouseout", function(d) {
				tooltip.html(d.events + "<br/> (" + player(d) + ")")
						.style("left", (d3.event.pageX + 15) + "px")
						.style("top", (d3.event.pageY - 28) + "px")
						.style("text-align", "center");
			})
			.on("mouseout", function(d) {
				console.log("yest");
				tooltip.transition()
					.duration(200)
					.style("opacity", 0);
				loaded3();
			});
	})
}





