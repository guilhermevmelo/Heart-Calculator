/**
 * File:	/scripts/main.js
 * Author:	Guilherme Vieira
 * Date:	29/06/2014
 */

function initialise_result_canvas() {
	var canvas = document.getElementById("ResultCanvas");
	
	
	canvas.width = $("#ResultCanvas").width();
	canvas.height = $("#ResultCanvas").height();
	
	console.log(canvas.width);
	
	var w = canvas.width;
	var h = canvas.height;
	var canvas_context = canvas.getContext("2d");
	
	canvas_context.beginPath();
	canvas_context.moveTo(0.066*w, 0.1*h);
	canvas_context.lineTo(0.066*w, 0.95*h);
	canvas_context.moveTo(0.033*w, 0.9*h);
	canvas_context.lineTo(0.933*w, 0.9*h);
	
/*	canvas_context.moveTo(10, 10);
	canvas_context.lineTo(10, 95);
	canvas_context.moveTo(5, 90);
	canvas_context.lineTo(140, 90);*/
	
	canvas_context.strokeStyle = "#000";
	canvas_context.stroke();
}

function update_result_canvas() {
	initialise_result_canvas();
	
	var canvas = document.getElementById("ResultCanvas");
	var w = canvas.width;
	var h = canvas.height;
	var canvas_context = canvas.getContext("2d");
	
	canvas_context.beginPath();
	canvas_context.moveTo(0.133*w, 0.8*h);
	canvas_context.bezierCurveTo(0.667*w, 0.8*h, 0.667*w, 0.8*h, 0.933*w, 0.2*h);
	
	canvas_context.strokeStyle = "#f00";
	canvas_context.stroke();
	
}

/**
 * 
 * @param definitions
 * definitions is the following object:
 * {
 * 	canvasID,
 * 	ratioWH,
 * 	resolution {x, y},
 *  origin {x, y}
 * }
 */
function Graph(definitions) {
	this.canvas = document.getElementById(definitions.canvasId);
	this.context = this.canvas.getContext("2d");
	this.drawnFunctions = new Array();
	
	this.ratioWH = definitions.ratioWH;
	this.ratioHW = 1 / this.ratioWH;
	
	this.resolution = definitions.resolution;
	this.origin = definitions.origin;
	
	this.initialize = function() {
		this.canvas.style.width = "100%";
		this.w = parseInt(window.getComputedStyle(this.canvas, null).width);
		this.h = parseInt(this.w * this.ratioHW);
		this.canvas.style.height = this.h + "px";
		
		this.canvas.width = this.w;
		this.canvas.height = this.h;
		/*
		 * The canvas' drawing surface has now the same amount of pixels
		 * as its css properties specifies
		 */
	};
	
	this.initialize();
	
	
	
	this.xDotDist = this.w/this.resolution.x;
	this.yDotDist = this.h/this.resolution.y;
	
	console.log(this.xDotDist, this.yDotDist);
	/*
	 * {f, color, fromX, toX}
	 */
	this.drawFunction = function(settings, addToPool) {
		var context = this.context;
		if (addToPool) this.drawnFunctions.push(settings);
		
		context.save();
		//context.save();
		
		context.translate(this.origin.x, this.h - this.origin.y);
		context.scale(1, -1);
		context.beginPath();
		context.lineJoin = 'round';
		
		
		
		for (var i = settings.from * this.xDotDist; i <= settings.to * this.xDotDist; i++/* += this.xDotDist*/){
			//if (equation(i) <= 0.5333*this.w) 
				context.lineTo(i, settings.f(i / this.xDotDist) * this.yDotDist);
				//context.rect(i, f(i/this.xDotDist)*this.yDotDist, 2, 2);
				//console.log(i, f(i/this.xDotDist)*this.yDotDist);
			//console.log(i, f(i), context.strokeStyle);
		}
		
		
		context.strokeStyle = settings.color;
		context.lineWidth = 2;
		context.stroke();
		
		
		context.restore();
		
		//context.restore();
	};
	
	this.redraw = function() {
		console.log(this.drawnFunctions);
		
		for ( var i = 0; i < this.drawnFunctions.length; i++) {
			this.drawFunction(this.drawnFunctions[i], false);
			console.log("redrawing function ", this.drawnFunctions[i]);
		}
	};
}

$(document).ready(function() {
	var graph = new Graph({
		canvasId: "ResultCanvas",
		ratioWH: 1.5,
		resolution: {x:2, y:1.333},
		origin: {x:0, y: 0}
	});
	
	$(window).resize(function() {
		graph.initialize();
		graph.redraw();
	});
	/*
	$("input").change(function() {
		update_result_canvas();
	});*/
	
	
	
	graph.drawFunction({
		f: function(x){return Math.sin(x);},
		color: "#00f",
		from: 0,
		to: 40
	}, true);
	
	graph.drawFunction({
		f: function(x){return Math.sqrt(x);},
		color: "#0f0",
		from: 0,
		to: 48
	}, true);
	
	graph.drawFunction({
		f: function(x){return x*x;},
		color: "#f0f",
		from:0,
		to: 10
	}, true);
	
	graph.drawFunction({
		f: function(x) {return x*x*x/84 - x*x/14 + 29*x/84;},
		color: '#fdfe34',
		from: 0,
		to: 100
	}, true);
});