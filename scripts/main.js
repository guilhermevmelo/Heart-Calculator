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
		
		//Debug:
		console.log("this.w:", this.w, "this.h:", this.h);
		
		this.canvas.width = this.w;
		this.canvas.height = this.h;
		/*
		 * The canvas' drawing surface has now the same amount of pixels
		 * as its css properties specifies
		 */
		
		this.drawable.w = parseInt((this.limit.x - this.origin.x) * this.w);
		this.drawable.h = parseInt((this.limit.y - (this.axisOrigin.y + this.origin.y)) * this.h);
		
		//Debug: console.log("this.drawable.w", this.drawable.w, "this.drawable.h", this.drawable.h);
		
		/** Initial setup done, let's draw the axis and the backgrounds **/
		var context = this.context;
		context.save();
		
		context.translate(0, this.h);
		context.scale(1, -1);
		
		/*The rectangles must be drawn first so the axis overlap its borders */
		/* The green */
		context.fillStyle = "#36D936";
		context.fillRect(this.axisOrigin.x * this.w, (this.axisOrigin.y + this.origin.y) * this.h, (((this.limit.x+1)/2)-this.axisOrigin.x - 0.0125) * this.w, 0.2 * this.drawable.h);
		
		/* The yellow */
		context.fillStyle = "#FFFF3F";
		context.fillRect(this.axisOrigin.x * this.w, (this.axisOrigin.y + this.origin.y) * this.h + 0.2 * this.drawable.h, (((this.limit.x+1)/2)-this.axisOrigin.x - 0.0125) * this.w, 0.1 * this.drawable.h);
		
		/* The orange */
		context.fillStyle = "#FFB23F";
		context.fillRect(this.axisOrigin.x * this.w, (this.axisOrigin.y + this.origin.y) * this.h + 0.3 * this.drawable.h, (((this.limit.x+1)/2)-this.axisOrigin.x - 0.0125) * this.w, 0.1 * this.drawable.h);
		
		/* The red */
		context.fillStyle = "#FF3F3F";
		context.fillRect(this.axisOrigin.x * this.w, (this.axisOrigin.y + this.origin.y) * this.h + 0.4 * this.drawable.h, (((this.limit.x+1)/2)-this.axisOrigin.x - 0.0125) * this.w, 0.6 * this.drawable.h);
		
		/* Now the nice white-transparent background for the drawing area */
		context.fillStyle = "rgba(255, 255, 255, 0.7)";
		context.fillRect(this.origin.x * this.w, (this.axisOrigin.y + this.origin.y) * this.h, this.drawable.w, this.drawable.h);
		
		//Debug: console.log(this.axisOrigin.x, this.origin.x * this.w);
		
		/* Now that the background has been drawn, lets draw the axes */
		context.beginPath();
		/* y-axis */
		context.moveTo(this.axisOrigin.x * this.w, this.axisOrigin.y * this.h);
		context.lineTo(this.axisOrigin.x * this.w, (this.limit.y + 1)/2 * this.h);
		context.lineTo(this.axisOrigin.x * this.w - 5, (this.limit.y + 1)/2 * this.h - 10);
		context.moveTo(this.axisOrigin.x * this.w + 5, (this.limit.y + 1)/2 * this.h - 10);
		context.lineTo(this.axisOrigin.x * this.w, (this.limit.y + 1)/2 * this.h);
		
		/* x-axis */
		context.moveTo(this.axisOrigin.x * this.w, this.axisOrigin.y * this.h);
		context.lineTo((this.limit.x + 1)/2 * this.w, this.axisOrigin.y * this.h);
		context.lineTo((this.limit.x + 1)/2 * this.w - 10, this.axisOrigin.y * this.h + 5);
		context.moveTo((this.limit.x + 1)/2 * this.w - 10, this.axisOrigin.y * this.h - 5);
		context.lineTo((this.limit.x + 1)/2 * this.w, this.axisOrigin.y * this.h);
		
		context.strokeStyle = "#000000";
		context.lineWidth = 2;
		context.lineCap = "squared";
		context.lineJoin = "round";
		context.stroke();
		context.closePath();
		
		/* dashed lines */
		context.beginPath();
		context.moveTo(this.axisOrigin.x * this.w, (this.axisOrigin.y + this.origin.y) * this.h + 0.2 * this.drawable.h);
		context.lineTo((this.limit.x + 1)/2 * this.w, (this.axisOrigin.y + this.origin.y) * this.h + 0.2 * this.drawable.h);
		context.moveTo(this.axisOrigin.x * this.w, (this.axisOrigin.y + this.origin.y) * this.h + 0.4 * this.drawable.h);
		context.lineTo((this.limit.x + 1)/2 * this.w, (this.axisOrigin.y + this.origin.y) * this.h + 0.4 * this.drawable.h);
		context.setLineDash([8, 10]);
		context.strokeStyle = "#333";
		context.lineWidth = 1;
		context.lineCap = "square";
		context.stroke();
		context.closePath();
		
		context.restore();
		
		/* Now we follow with the texts */
		var aux = 0.0337 * this.h;
		context.font = aux + 'px "Shadows Into Light", sans-serif';
		context.fillStyle = "#000";
		context.fillText("Very High", (this.axisOrigin.x + 0.02)*this.w, 0.35*this.h);
		context.fillText("50%", (this.axisOrigin.x + 0.845)*this.w, 0.09*this.h);
		context.fillText("High", (this.axisOrigin.x + 0.02)*this.w, 0.65*this.h);
		context.fillText("20%", (this.axisOrigin.x + 0.845)*this.w, 0.63*this.h);
		context.fillText("Medium", (this.axisOrigin.x + 0.02)*this.w, 0.74*this.h);
		context.fillText("15%", (this.axisOrigin.x + 0.85)*this.w, 0.72*this.h);
		context.fillText("Low", (this.axisOrigin.x + 0.02)*this.w, 0.87*this.h);
		context.fillText("10%", (this.axisOrigin.x + 0.85)*this.w, 0.81*this.h);
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
		
		context.translate(this.origin.x * this.w, this.h * (1 - (this.axisOrigin.y + this.origin.y)));
		
		//Debug: console.log(this.origin.x * this.w, this.h * (1 - this.origin.y));
		
		context.scale(1, -1);
		context.beginPath();
		context.rect(0, 1, this.drawable.w, this.drawable.h-1);
		console.log("clip:", this.drawable.w, this.drawable.h-1);
		context.clip();
		
		context.beginPath();
		context.lineJoin = 'round';
		
		context.shadowOffsetX = 1;
		context.shadowOffsetY = 2;
		context.shadowColor	  = "#c4c4c4";
		context.shadowBlur = 2;
		
		for (var i = settings.from * this.xDotDist; i <= settings.to * this.xDotDist; i += this.xDotDist){
			context.lineTo(i, settings.f(i / this.xDotDist) * this.yDotDist);
			//Debug: console.log(i, parseInt(i/this.xDotDist));
			
			if (parseInt(i/this.xDotDist) % 9 == 0) {
				context.save();
				context.scale(1, -1);
				var f_i = (settings.f(i / this.xDotDist) * this.yDotDist);
				context.fillText("("+parseInt(i / this.xDotDist)+", "+parseInt(f_i/this.yDotDist)+")", i,  -f_i);
				context.restore();
			}
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

/**
 * Hash control
 */
function parseHash() {
	var hash = location.hash;
	
	switch(hash) {
		case "#/Login":
			//Debug: console.log("Login");
			$("#Login").fadeIn('slow');
			break;
		
		case "#/SignUp":
			//Debug: console.log("SignUp");
			if ($(".currentStep").length == 0) {
				$("#SignUp").fadeIn('slow').addClass("currentStep");
			} else if (!$("#SignUp").hasClass("currentStep")) {
				$(".currentStep").fadeOut('slow', function() {
					$(".currentStep").removeClass("currentStep");
					$("#SignUp").fadeIn('slow').addClass("currentStep");
				});
			}
			break;
			
		case "#/Intro":
			//Debug: console.log("Intro");
			if ($(".currentStep").length == 0) {
				$("#Introduction").fadeIn('slow').addClass("currentStep");
			} else if (!$("#Introduction").hasClass("currentStep")) {
				$(".currentStep").fadeOut('slow', function() {
					$(".currentStep").removeClass("currentStep");
					$("#Introduction").fadeIn('slow').addClass("currentStep");
				});
			}
			break;
		
		case "#/Step1":
			//Debug: console.log("Step 1");
			if ($(".currentStep").length == 0) {
				$("#Step1").fadeIn('slow').addClass("currentStep");
			} else if (!$("#Step1").hasClass("currentStep")) {
				$(".currentStep").fadeOut('slow', function() {
					$(".currentStep").removeClass("currentStep");
					$("#Step1").fadeIn('slow').addClass("currentStep");
				});
			}
			break;
			
		case "#/Result":
			/**
			 * TODO Validate to only show the result if the Step 1 has been completed
			 * TODO Add this new state to the user profile, if logged in
			 */
			//Debug: console.log("Result");
			if ($(".currentStep").length == 0) {
				$("#Result").fadeIn('slow').addClass("currentStep");
			} else if (!$("#Result").hasClass("currentStep")) {
				$(".currentStep").fadeOut('slow', function() {
					$(".currentStep").removeClass("currentStep");
					$("#Result").fadeIn('slow').addClass("currentStep");
					graph.initialize();
					//graph.redraw();
					graph.drawFunction({
						f: function(x) {
							var a = parseFloat(document.getElementById("frm_bp_sys").value);
							var b = parseFloat(document.getElementById("frm_tc_hdl").value);
							//Debug: console.log('a', a, 'b', b);
							return a*x/2000+b*x*x/1700 + 2;
						},
						//f: function(x) {return x;},
						//f: function(x) {return 120*x/2000+4.5*x*x/1700 + 2;},
						color: '#FF8B3F',
						from: parseInt( document.getElementById("frm_age").value),
						to: 90
					}, true);
				});
			}
			break;
		
		case "#/Title":
			//Debug: console.log("Title");
			if ($(".currentStep").length == 0) {
				$("#Title").fadeIn('slow').addClass("currentStep");
			} else if (!$("#Title").hasClass("currentStep")) {
				$(".currentStep").fadeOut('slow', function() {
					$(".currentStep").removeClass("currentStep");
					$("#Title").fadeIn('slow').addClass("currentStep");
				});
			}
			break;
		
		case "#/Profile":
			//Debug: console.log("Step 1");
			if ($(".currentStep").length == 0) {
				$("#Profile").fadeIn('slow').addClass("currentStep");
			} else if (!$("#Profile").hasClass("currentStep")) {
				$(".currentStep").fadeOut('slow', function() {
					$(".currentStep").removeClass("currentStep");
					$("#Profile").fadeIn('slow').addClass("currentStep");
				});
			}
			break;	
			
		default:
			console.log("Called default");
			location.hash = "#/Title";
			break;
		
	}
}

window.onhashchange = parseHash;
window.onload = parseHash;

var graph = null;

$(window).load(function() {
	graph = new Graph({
		canvasId: 	"ResultCanvas",
		ratioWH: 	1.5,
		resolution: {x: 90, y: 90},
		axisOrigin: {x: 0.03, y: 0.05},
		origin: 	{x: 0.1480, y: 0.0},
		limit: 		{x: 0.8600, y: 0.95}
	});
	
	$(window).resize(function() {
		graph.initialize();
		graph.redraw();
	});
	
	$("#Step1 input").change(function() {
		validate();
	});
	
	
	/** Substitute for hash control
	$("#SignUpConfirmation .nextStepLinkContainer a").click(function() {
		$("#SignUpConfirmation").fadeOut('slow', function() {
			$("#Title").fadeIn('slow');
		});
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
			//graph.redraw();
			graph.drawFunction({
				f: function(x) {
					var a = parseFloat(document.getElementById("frm_bp_sys").value);
					var b = parseFloat(document.getElementById("frm_tc_hdl").value);
					//Debug: console.log('a', a, 'b', b);
					return a*x/2000+b*x*x/1700 + 2;
				},
				//f: function(x) {return x;},
				//f: function(x) {return 120*x/2000+4.5*x*x/1700 + 2;},
				color: '#FF8B3F',
				from: parseInt( document.getElementById("frm_age").value),
				to: 90
			}, true);
		});
	});
	
	$("#signup_link").click(function() {
		$("#Title").fadeOut('slow', function() {
			$("#SignUp").fadeIn();
		});
	});
	
	**/
	
	/**
	 * The submit handler
	 */
	$("#SignUp .nextStepLinkContainer a").click(function() {
		/**
		 * TODO Form validation before submitting it to action.php
		 * TODO Add encryption to password before posting it to action.php
		 */
		$.ajax({
			type: 'POST',
			url: "action.php",
			data : {
				q: 'create_user',
				name: $("#snp_name").val(),
				email: $("#snp_email").val(),
				password: $("#snp_password").val(),
				birthday: $("#snp_birthday").val(),
				gender: $(".gender:checked").val(),
				risk: $(".risk:checked").val()
			}
		}).done(function(r) {
			if (r == "ok") {
				$("#SignUp").fadeOut('slow', function() {
					$("#SignUpConfirmation").fadeIn('slow');
				});
			}
		});
	});
		
	/** While styling the canvas **/
	graph.initialize();
	graph.redraw();
	/** end **/
	
	//$("#Result").hide();
	
	/** Update the label accordingly to the slider **/
	$("#frm_tc_hdl").change(function() {
		$("#frm_tc_hdl_val").html($("#frm_tc_hdl").val());
	});
	
	//Debug: console.log(graph);
});
