/**
 * File:	/scripts/main.js
 * Author:	Guilherme Vieira
 * Date:	29/06/2014
 */

/**
 * 
 * @param definitions
 * definitions is the following object:
 * {
 * 	canvasID,
 * 	ratioWH,
 * 	resolution {x, y},
 *  axisOrigin {x, y}, // relative to canvas
 *  origin {x, y}, //relative to axisOrigin
 *  limit {x, y}
 * }
 */
function Graph(definitions) {
	this.canvas = document.getElementById(definitions.canvasId);
	this.context = this.canvas.getContext("2d");
	this.drawnFunctions = new Array();
	
	this.ratioWH = definitions.ratioWH;
	this.ratioHW = 1.0 / this.ratioWH;
	
	this.resolution = definitions.resolution;
	this.origin = definitions.origin;
	this.limit = definitions.limit;
	this.drawable = {};
	this.axisOrigin = definitions.axisOrigin;
	
	this.initialize = function() {
		this.canvas.style.width = "100%";
		this.w = parseInt(window.getComputedStyle(this.canvas, null).width);
		this.h = parseInt(this.w * this.ratioHW);
		this.canvas.style.height = this.h + "px";
		
		//Debug: console.log("this.w:", this.w, "this.h:", this.h);
		
		this.canvas.width = this.w;
		this.canvas.height = this.h;
		/*
		 * The canvas' drawing surface has now the same amount of pixels
		 * as its css properties specifies
		 */
		
		this.drawable.w = parseInt((this.limit.x - this.origin.x)/100 * this.w);
		this.drawable.h = parseInt((this.limit.y - (this.axisOrigin.y*100 + this.origin.y))/100 * this.h);
		
		//Debug: console.log("this.drawable.w", this.drawable.w, "this.drawable.h", this.drawable.h);
		
		/** Initial setup done, let's draw the axis and the backgrounds **/
		var context = this.context;
		context.save();
		
		context.translate(0, this.h);
		context.scale(1, -1);
		
		/*The rectangles must be drawn first so the axis overlap its borders */
		/* The green */
		context.fillStyle = "#36D936";
		context.fillRect(this.axisOrigin.x * this.w, this.axisOrigin.y * this.h, (((this.limit.x+100)/200)-this.axisOrigin.x - 0.0125) * this.w, 0.2 * this.drawable.h);
		
		/* The yellow */
		context.fillStyle = "#FFFF3F";
		context.fillRect(this.axisOrigin.x * this.w, this.axisOrigin.y * this.h + 0.2 * this.drawable.h, (((this.limit.x+100)/200)-this.axisOrigin.x - 0.0125) * this.w, 0.1 * this.drawable.h);
		
		/* The orange */
		context.fillStyle = "#FFB23F";
		context.fillRect(this.axisOrigin.x * this.w, this.axisOrigin.y * this.h + 0.3 * this.drawable.h, (((this.limit.x+100)/200)-this.axisOrigin.x - 0.0125) * this.w, 0.1 * this.drawable.h);
		
		/* The red */
		context.fillStyle = "#FF3F3F";
		context.fillRect(this.axisOrigin.x * this.w, this.axisOrigin.y * this.h + 0.4 * this.drawable.h, (((this.limit.x+100)/200)-this.axisOrigin.x - 0.0125) * this.w, 0.6 * this.drawable.h);
		
		/* Now the nice white-transparent background for the drawing area */
		context.fillStyle = "rgba(255, 255, 255, 0.7)";
		context.fillRect(this.origin.x/100 * this.w, (this.axisOrigin.y + this.origin.y) * this.h, this.drawable.w, this.drawable.h);
		
		//Debug: console.log(this.axisOrigin.x, this.origin.x/100 * this.w);
		
		/* Now that the background has been drawn, lets draw the axes */
		context.beginPath();
		/* y-axis */
		context.moveTo(this.axisOrigin.x * this.w, this.axisOrigin.y * this.h);
		context.lineTo(this.axisOrigin.x * this.w, (this.limit.y + 100)/200 * this.h);
		context.lineTo(this.axisOrigin.x * this.w - 5, (this.limit.y + 100)/200 * this.h - 10);
		context.moveTo(this.axisOrigin.x * this.w + 5, (this.limit.y + 100)/200 * this.h - 10);
		context.lineTo(this.axisOrigin.x * this.w, (this.limit.y + 100)/200 * this.h);
		
		/* x-axis */
		context.moveTo(this.axisOrigin.x * this.w, this.axisOrigin.y * this.h);
		context.lineTo((this.limit.x + 100)/200 * this.w, this.axisOrigin.y * this.h);
		context.lineTo((this.limit.x + 100)/200 * this.w - 10, this.axisOrigin.y * this.h + 5);
		context.moveTo((this.limit.x + 100)/200 * this.w - 10, this.axisOrigin.y * this.h - 5);
		context.lineTo((this.limit.x + 100)/200 * this.w, this.axisOrigin.y * this.h);
		
		context.strokeStyle = "#000000";
		context.lineWidth = 2;
		context.lineCap = "square";
		context.stroke();
		
		context.closePath();
		
		
		context.restore();
	};
	
	this.initialize();
	
	this.xDotDist = this.drawable.w/this.resolution.x;
	this.yDotDist = this.drawable.h/this.resolution.y;
	
	//Debug: console.log("this.xDotDist", this.xDotDist, "this.yDotDist", this.yDotDist);
	
	/*
	 * {f, color, fromX, toX}
	 */
	this.drawFunction = function(settings, addToPool) {
		var context = this.context;
		if (addToPool) this.drawnFunctions.push(settings);
		
		context.save();
		
		context.translate(this.origin.x/100 * this.w, this.h * (1 - (this.axisOrigin.y + this.origin.y)));
		
		//Debug: console.log(this.origin.x/100 * this.w, this.h * (1 - this.origin.y/100));
		
		context.scale(1, -1);
		context.beginPath();
		context.rect(0, 1, this.drawable.w, this.drawable.h-1);
		context.clip();
		
		context.beginPath();
		context.lineJoin = 'round';
		
		context.shadowOffsetX = 1;
		context.shadowOffsetY = 2;
		context.shadowColor	  = "#c4c4c4";
		context.shadowBlur = 2;
		
		for (var i = settings.from * this.xDotDist; i <= settings.to * this.xDotDist; i++/* += this.xDotDist*/){
			//if (settings.f(i / this.xDotDist) * this.yDotDist <= this.limit.y/100*this.drawable.h) 
				context.lineTo(i, settings.f(i / this.xDotDist) * this.yDotDist);
		}
		
		
		context.strokeStyle = settings.color;
		context.lineWidth = 2;
		context.stroke();
		context.closePath();
		
		context.restore();
	};
	
	this.redraw = function() {
		for ( var i = 0; i < this.drawnFunctions.length; i++) {
			this.drawFunction(this.drawnFunctions[i], false);
			//console.log("redrawing function ", this.drawnFunctions[i]);
		}
	};
}

function validate() {
	if ($("input[name='frm_gender']").is(':checked') &&
		$("input[name='frm_risk']").is(':checked') &&
		$("input[name='frm_smoke']").is(':checked')&&
		$("input[name='frm_diabetes']").is(':checked'))
		$("#Step1 p.nextStepLinkContainer").fadeIn('slow');
}

$(document).ready(function() {
	var graph = new Graph({
		canvasId: 	"ResultCanvas",
		ratioWH: 	1.5,
		resolution: {x: 95, y: 90},
		axisOrigin: {x: 0.03, y: 0.05},
		origin: 	{x: 14.80, y: 0},
		limit: 		{x: 86.00, y: 95}
	});
	
	$(window).resize(function() {
		graph.initialize();
		graph.redraw();
	});
	
	$("input").change(function() {
		validate();
	});
	
	$("#Title a.nextStepLink").click(function() {
		$("#Title").fadeOut('slow', function() {
			$("#Introduction").fadeIn('slow');
		});
	});
	
	$("#Introduction a.nextStepLink").click(function() {
		$("#Introduction").fadeOut('slow', function() {
			$("#Step1").fadeIn('slow');
		
		});
	});
	
	$("#Step1 a.nextStepLink").click(function() {
		$("#Step1").fadeOut('slow', function() {
			$("#Result").fadeIn('slow');
			graph.initialize();
			graph.redraw();
		});
	});
	
	/** While styling the canvas **/
	graph.initialize();
	graph.redraw();
	/** end **/
	
	/** Update the label accordingly to the slider **/
	$("#frm_tc_hdl").change(function() {
		$("#frm_tc_hdl_val").html($("#frm_tc_hdl").val());
	});
	
	graph.drawFunction({
		f: function(x) {return x*x*x/84 - x*x/14 + 29*x/84;},
		color: '#A236D9',
		from: 0,
		to: 90
	}, true);
	
	//Debug: console.log(graph);
});;