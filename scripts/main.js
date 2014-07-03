/**
 * File:	/scripts/main.js
 * Author:	Guilherme Vieira
 * Date:	29/06/2014
 */

function initialise_result_canvas() {
	var canvas = document.getElementById("ResultCanvas");
	
	canvas.style.width = '100%';
	
	//console.log( $("#ResultCanvas").width());
	
	$("#ResultCanvas").height( 0.6667*$("#ResultCanvas").width());
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

$(document).ready(function() {
	initialise_result_canvas();
	
	$(window).resize(function() {
		update_result_canvas();
	});
	
	$("input").change(function() {
		update_result_canvas();
	});
});