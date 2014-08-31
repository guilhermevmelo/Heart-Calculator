/**
 * File:	/scripts/main.js
 * Author:	Guilherme Vieira
 * Date:	29/06/2014
 */

var graph  = null;
var caller = null;
var user   = null;
var hit_caller = null;

$.ajax({
	url: 'action.php',
	type: 'GET',
	data: {
		'q': 'checkLogin'
	}
}).done(function(ans) {
	if(ans.permission === true) {
		user = ans;
		parseHash();
		//Debug: console.log("Processing ajax request", user);
	}
});

window.onhashchange = parseHash;
window.onload = parseHash;

/**
 * Function definitions
 */

function Alert(msg) {
	$("#Alert p").html(msg);
	$("#AlertOverlay").fadeIn('slow');
}

function valid_date(date) {
	var date_pattern = new RegExp(/^\d{2}(-|\/)\d{2}(-|\/)\d{4}$/);
	if (date_pattern.test(date)) {
		date_pattern = new RegExp(/-/);
		var separator = '/';
		if(date_pattern.test(date))
			separator = '-';
			
		var date_parts = date.split(separator);
		var formated_date = date_parts[2] + "-" + date_parts[1] + "-" + date_parts[0];
		return formated_date;
	}
	
	date_pattern = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
	if(date_pattern.test(date))
		return date;
	
	return false;
}

/**
 * Converts degrees into radians
 * @param x
 * @returns {Number}
 */
function rads(x) { return Math.PI * x / 180; }

/**
 * Get the difference in months between two dates
 * @param date1
 * @param date2
 * @returns the difference in months between the arguments
 */
function get_month_diff(date1, date2) {
	var r = Math.abs(date1.getTime() - date2.getTime());
	r = parseInt(r/2628000000);
	return r;
}

/**
 * Gets the mouse coordinates in a canvas element
 * 
 * This function was taken from http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
 * accessed on 30th August 2014
 * 
 * @param canvas
 * @param evt
 * @returns {}
 */
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
    };
}

/**
 * Check whether a point is inside a circle
 * @param point
 * @param center
 * @param radius
 * @returns {Boolean}
 */
function isInside(point, center, radius) {
	var d = Math.sqrt((point.x - center.x)*(point.x - center.x) + (point.y - center.y)*(point.y - center.y));
	// Debug: console.log(d, radius);
	if (d <= radius)
		return true;
	return false;
}

/**
 * The model for a graph
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
	this.simulationFunction = null;
	this.todayFunction = null;
	
	this.ratioWH = definitions.ratioWH;
	this.ratioHW = 1.0 / this.ratioWH;
	
	this.resolution = definitions.resolution;
	this.origin = definitions.origin;
	this.limit = definitions.limit;
	this.drawable = {};
	this.axisOrigin = definitions.axisOrigin;
	
	/**
	 * 
	 */
	this.initialize = function() {
		this.canvas.style.width = (parseInt(window.getComputedStyle(document.body,null).width) <= 820) ? "100%" : "70%";
		
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
		
		this.drawable.w = parseInt((this.limit.x - this.origin.x) * this.w);
		this.drawable.h = parseInt((this.limit.y - (this.axisOrigin.y + this.origin.y)) * this.h);
		
		//Debug: console.log("this.drawable.w", this.drawable.w, "this.drawable.h", this.drawable.h);
		
		/** Initial setup done, let's draw the axes and the backgrounds **/
		var context = this.context;
		context.save();
		
		context.translate(0, this.h);
		context.scale(1, -1);
		
		/*The rectangles must be drawn first so the axes overlap its borders */
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
		
		/* Draw the lines of the ages below the whiteish background*/
		context.beginPath();
		for (var i = this.origin.x * this.w; i <= this.limit.x * this.w; i += this.xDotDist){
			//Debug: console.log(i, parseInt(i/this.xDotDist));
			var age = parseInt(i/this.xDotDist);
			if (age % 9 == 0 && age - 18 >= 9) {
				//Debug: console.log("drawn");
				context.moveTo(i, this.axisOrigin.y * this.h);
				context.lineTo(i, this.limit.y * this.h);
			}
		}
		context.strokeStyle = "#333";
		context.lineWidth = 1;
		context.lineCap = "squared";
		context.lineJoin = "round";
		context.stroke();
		context.closePath();
		
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
		context.fillText("Very", (this.axisOrigin.x + 0.02)*this.w, 0.30*this.h);
		context.fillText("High", (this.axisOrigin.x + 0.022)*this.w, 0.34*this.h);
		context.fillText("50%", (this.axisOrigin.x + 0.845)*this.w, 0.09*this.h);
		context.fillText("High", (this.axisOrigin.x + 0.02)*this.w, 0.57*this.h);
		context.fillText("20%", (this.axisOrigin.x + 0.845)*this.w, 0.56*this.h);
		context.fillText("Medium", (this.axisOrigin.x + 0.02)*this.w, 0.66*this.h);
		context.fillText("15%", (this.axisOrigin.x + 0.85)*this.w, 0.64*this.h);
		context.fillText("Low", (this.axisOrigin.x + 0.02)*this.w, 0.78*this.h);
		context.fillText("10%", (this.axisOrigin.x + 0.85)*this.w, 0.73*this.h);
		
		/* Axes labels */
		context.save();
		aux *= 0.85;
		context.font = aux + 'px "Source Sans Pro", sans-serif';
		context.translate(this.axisOrigin.x * this.w, (1-this.axisOrigin.y) * this.h);
		context.fillText("Age", 0.022*this.h, 0.02*this.w);
		context.rotate(-Math.PI/2);
		context.fillText("Risk of heart desease", 0.015*this.h, -0.01*this.w);
		context.restore();
		
		/* Ages */
		context.save();
		for (var i = this.origin.x * this.w; i <= this.limit.x * this.w; i += this.xDotDist){
			//Debug: console.log(i, parseInt(i/this.xDotDist));
			var age = parseInt(i/this.xDotDist);
			if (age % 9 == 0 && age -18 >= 9) {
				context.fillText(age-18, i - 5, (1-this.axisOrigin.y) * this.h + 14);
			}
		}
		context.restore();
		
		/* Captions */
		context.save();
		context.beginPath();
		context.lineJoin = 'round';
		
		context.shadowOffsetX = 1;
		context.shadowOffsetY = 2;
		context.shadowColor	  = "#c4c4c4";
		context.shadowBlur 	  = 2;
		context.lineWidth = 2;
		
		/* prediction line */
		context.moveTo(0.04*this.w, 0.92*this.h);
		context.lineTo(0.08*this.w, 0.92*this.h);
		context.strokeStyle = "#ff8c3f";
		context.stroke();
		context.closePath();
		
		context.fillText("Your estimated risk", 0.083*this.w, 0.93*this.h);
		
		/* ideal line */
		context.beginPath();
		context.moveTo(0.04*this.w, 0.96*this.h);
		context.lineTo(0.08*this.w, 0.96*this.h);
		context.strokeStyle = "#36b0d9";
		context.stroke();
		context.closePath();
		
		context.fillText("The ideal risk to your profile", 0.083*this.w, 0.97*this.h);
		
		/* simulation line */
		context.beginPath();
		context.moveTo(0.4*this.w, 0.92*this.h);
		context.lineTo(0.44*this.w, 0.92*this.h);
		context.strokeStyle = "#E2389B";
		context.stroke();
		
		context.fillText("Your simulated risk", 0.45*this.w, 0.93*this.h);
		
		/* Dots */
		context.beginPath();
		context.arc(0.42 * this.w,
					0.96 * this.h,
					5,
					0,
					rads(360),
					false);
		context.fillStyle = "#ff8c3f";
		context.lineWidth = 4;
		context.strokeStyle = '#fff';
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.stroke();
		context.fill();
		
		context.fillStyle = "#000";
		context.fillText("Your risk today", 0.45*this.w, 0.97*this.h);
		
		context.beginPath();
		context.arc(0.72 * this.w,
					0.96 * this.h,
					5,
					0,
					rads(360),
					false);
		context.fillStyle = "#bfec3b";
		context.lineWidth = 4;
		context.strokeStyle = '#fff';
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.stroke();
		context.fill();
		
		context.fillStyle = "#000";
		context.fillText("Your history", 0.73*this.w, 0.97*this.h);
		
		context.restore();
	};
	
	this.initialize();
	
	this.xDotDist = this.drawable.w/this.resolution.x;
	this.yDotDist = this.drawable.h/this.resolution.y;
	
	//Debug: console.log("this.xDotDist", this.xDotDist, "this.yDotDist", this.yDotDist);
	
	/*
	 * {f, color, fromX, toX, drawToday}
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
		//Debug: console.log("clip:", this.drawable.w, this.drawable.h-1);
		context.clip();
		
		context.beginPath();
		context.lineJoin = 'round';
		
		context.shadowOffsetX = 1;
		context.shadowOffsetY = 2;
		context.shadowColor	  = "#c4c4c4";
		context.shadowBlur 	  = 2;
		
		for (var i = settings.from * this.xDotDist; i <= settings.to * this.xDotDist; i += this.xDotDist){
			context.lineTo(i, settings.f(i / this.xDotDist) * this.yDotDist);
			
			//Debug: console.log(i, parseInt(i/this.xDotDist));
			
			/* Draws the coordinates when x is a multiple of 9
			if (parseInt(i/this.xDotDist) % 9 == 0) {
				context.save();
				context.scale(1, -1);
				var f_i = (settings.f(i / this.xDotDist) * this.yDotDist);
				context.fillText("("+parseInt(i / this.xDotDist)+", "+parseInt(f_i/this.yDotDist)+")", i,  -f_i);
				context.restore();
			}
			*/
		}
		
		context.strokeStyle = settings.color;
		context.lineWidth = 2;
		context.stroke();
		context.closePath();
		
		if (settings.drawToday) {
			context.beginPath();
			context.arc(settings.from * this.xDotDist,
						settings.f(settings.from) * this.yDotDist,
						5,
						0,
						rads(360),
						false);
			context.fillStyle = settings.color;
			context.lineWidth = 4;
			context.strokeStyle = '#fff';
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.stroke();
			context.fill();
		}
		
		context.restore();
	};
	
	this.redraw = function() {
		if (this.simulationFunction != null)
			this.drawFunction(this.simulationFunction, false);
		
		for ( var i = 0; i < this.drawnFunctions.length ; i++) {
			this.drawFunction(this.drawnFunctions[i], false);
			//console.log("redrawing function ", this.drawnFunctions[i]);
		}
		
		if (this.todayFunction != null)
			this.drawFunction(this.todayFunction, false);
	};
	
	this.drawHistoryState = function(state) {
		var context = this.context;
		context.save();
		context.beginPath();
		var aux = 0.0337 * this.h;
		aux *= 0.85;
		context.font = aux + 'px "Source Sans Pro", sans-serif';
		
		context.fillStyle = 'rgba(203, 235, 245, 0.7)';
		context.strokeStyle = '#fff';
		context.lineJoin = 'round';
		context.lineWidth = 2;
		context.fillRect(0.18 * this.w, 0.09 * this.h, 0.27*this.w, 0.18*this.h);
		
		/*context.shadowOffsetX = 1;
		context.shadowOffsetY = 2;
		context.shadowColor	  = "#c4c4c4";
		context.shadowBlur 	  = 2;*/
		context.strokeRect(0.18 * this.w, 0.09 * this.h, 0.27*this.w, 0.18*this.h);
		
		context.fillStyle = "#000000";
		var date = new Date(state.date);
		context.fillText("State saved on "+date.toDateString(), 0.189 * this.w, 0.13 * this.h);
		context.fillText("Age: " + state.age+"   BP: "+state.pressure_sys+"/"+state.pressure_dia+"   TC/HDL: "+state.tc_hdl, 0.189 * this.w, 0.17 * this.h);
		context.fillText("You " + (state.has_diabetes == 0 ? "did not have": "had") + " diabetes" , 0.189 * this.w, 0.21 * this.h);
		context.fillText("You were " + (state.smoker == 0 ? "not": "") + " a smoker" , 0.189 * this.w, 0.25 * this.h);
	};
	
	this.addHistoryEvent = function(state) {
		var x = this.xDotDist;
		var y = this.yDotDist;
		var oxw = (this.origin.x) * this.w;
		var h = this.h;
		var h_offset = this.axisOrigin.y;
		
		var drawHistoryState = this.drawHistoryState;
		
		this.canvas.addEventListener('mousemove', function (e) {
			var mouse = getMousePos(this, e);
			var center = {
				x: Math.ceil(oxw + (parseInt(state.age) * x) + 2),
				y: Math.ceil(h - (state.func(parseInt(state.age)) * y + h_offset * h)) + 2
			};
			
			/*console.log("Event called");
			console.log("state", state);
			console.log('f(x)', func(parseInt(state.age)));
			console.log("mouse", mouse);
			console.log("center", center);*/
			
			if (isInside(mouse, center, 5)) {
				//Debug: console.log("Hit");
				graph.initialize();
				graph.redraw();
				graph.drawHistoryState(state);
				 hit_caller = state;
			} else{
				if (hit_caller == null) {
					graph.initialize();
					graph.redraw();
				} else if (hit_caller === state) {
					hit_caller = null;
				}
					
				
			}
			
		}, false);
	};
}

function validate() {
	if ($("input[name='frm_gender']").is(':checked') &&
		$("input[name='frm_risk']").is(':checked') &&
		$("input[name='frm_smoke']").is(':checked')&&
		$("input[name='frm_diabetes']").is(':checked'))
		$("#btn_ShowResult").fadeIn('slow');
}

/**
 * Hash control
 */
function parseHash() {
	
	var hash = location.hash;
	var pattern = new RegExp(/^#\/Confirm\//);
	
	//Debug: console.log(pattern.test(hash));
	
	$('html, body').stop().animate({
		scrollTop: 0
	}, 1500,'easeInOutExpo');
	
	if (pattern.test(hash))
		hash = "#/Confirm";
	
	switch(hash) {
		case "#/Login":
			//Debug: console.log("Login");
			if ($(".currentStep").length == 0) {
				$("#LoginOverlay").fadeIn('slow').addClass("currentStep");
			} else if (!$("#LoginOverlay").hasClass("currentStep")) {
				$(".currentStep").fadeOut('slow', function() {
					$(".currentStep").removeClass("currentStep");
					$("#LoginOverlay").delay(100).fadeIn('slow').addClass("currentStep");
				});
			}
			break;
			
		case "#/ProcessLogin":
			if (caller != 'login_btn') break;
			
			/*$("#LoginOverlay").fadeOut('slow', function() {
				$("#Title").fadeIn('slow');
			});*/
			
			$.ajax({
				type: 'POST',
				url: 'action.php',
				data: {
					q: 'login',
					email: $("#lgn_email").val(),
					password: $("#lgn_password").val()
				}
			}).done(function(ans) {
				if (ans.permission === true) {
					user = ans;
					//location.hash = '#/Title';
					Alert('Hello, ' + user.data.name + '.');
				} else if (ans.permission == "not_confirmed") {
					Alert('Your account is not confirmed.<br>Please check your email for a confirmation to enable login.');
				} else {
					Alert('Please check your login credentials.');
				}

				location.hash = '#/Title';
			});
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
				if(user != null) {
					$('#frm_gender_'+user.data.gender).attr('checked', 'checked');
					$('#frm_age').val(user.data.age);
					$('#frm_risk_'+(user.data.risk?'y':'n')).attr('checked', 'checked');
					
					$('#frm_fld_gender').hide();
					$('#frm_fld_age').hide();
					$('#frm_fld_risk').hide();
					
					$('#AlreadyKnow').html("We already know you are a " + user.data.age + ' years old ' + (user.data.gender == 'f'? 'woman' : 'man') + " who "+ (user.data.risk? "belongs" : "does not belong") + " to a high risk ethnic group.");
					$('#AlreadyKnow').show();
				} else {
					for (var i = 0; i < document.forms.length; i++)
						document.forms[i].reset();
					
					$('#frm_fld_gender').show();
					$('#frm_fld_age').show();
					$('#frm_fld_risk').show();
					$('#AlreadyKnow').hide();
				}
				$("#Step1").fadeIn('slow').addClass("currentStep");
			} else if (!$("#Step1").hasClass("currentStep")) {
				$(".currentStep").fadeOut('slow', function() {
					
					if(user != null) {
						$('#frm_gender_'+user.data.gender).attr('checked', 'checked');
						$('#frm_age').val(user.data.age);
						$('#frm_risk_'+(user.data.risk?'y':'n')).attr('checked', 'checked');
						
						$('#frm_fld_gender').hide();
						$('#frm_fld_age').hide();
						$('#frm_fld_risk').hide();
						
						$('#AlreadyKnow').html("We already know you are a " + user.data.age + ' years old ' + (user.data.gender == 'f'? 'woman' : 'man') + " who "+ (user.data.risk? "belongs" : "does not belong") + " to a high risk ethnic group.");
						$('#AlreadyKnow').show();
					} else {
						for (var i = 0; i < document.forms.length; i++)
							document.forms[i].reset();
						
						$('#frm_fld_gender').show();
						$('#frm_fld_age').show();
						$('#frm_fld_risk').show();
						$('#AlreadyKnow').hide();
					}
					
					$(".currentStep").removeClass("currentStep");
					$("#Step1").fadeIn('slow').addClass("currentStep");
				});
			}
			break;
			
		case "#/Result":
			if (caller != 'step1')
				location.hash = '#/Title';
				
			$("#Result").css("opacity", 1);
			//Debug: console.log("Result");
			if ($(".currentStep").length == 0) {
				$("#Result").fadeIn('slow').addClass("currentStep");
			} else if (!$("#Result").hasClass("currentStep")) {
				$(".currentStep").fadeOut('slow', function() {
					$(".currentStep").removeClass("currentStep");
					$("#Result").fadeIn('slow', function() {
						/**
						 * Dynamically show and fill prediction controllers
						 * after the section has faded in
						 */
						if ($("#frm_smoke_y").is(':checked'))
							$("#fld_stopSmoke").fadeIn('fast');
						else
							$("#fld_startSmoke").fadeIn('fast');
						
						var delay = 1;
						
						if ($("#frm_diabetes_n").is(':checked'))
							$("#fld_diabetes").delay(300*delay++).fadeIn('fast');
						
						$("#wif_tc_hdl").val($("#frm_tc_hdl").val());
						$("#wif_tc_hdl_val").html($("#wif_tc_hdl").val());
						$("#fld_tc_hdl").delay(300*delay++).fadeIn('fast');
						
						$("#wif_bp").val($("#frm_bp_sys").val());
						$("#wif_bp_val").html($("#wif_bp").val());
						$("#fld_bp").delay(300*delay++).fadeIn('fast');
						
						if(user != null)
							$("#saveLink").show();
						
						$("#Result .nextStepLinkContainer a").click(function() {
							$("#WhatIf fieldset").hide();
						});
						
						/**
						 * Add this state to the history
						 */
						$.ajax({
							url: 'action.php',
							type: 'POST',
							data: {
								'q': 'saveState',
								'tc_hdl': $('#frm_tc_hdl').val(),
								'smoker': $('[name="frm_smoke"]:checked').val(),
								'has_diabetes': $('[name="frm_diabetes"]:checked').val(),
								'pressure_sys': $('#frm_bp_sys').val(),
								'pressure_dia': $('#frm_bp_dia').val()
							}
						});
						
						/**
						 * Dynamically change prediction
						 */
						$("#WhatIf input").change(function() {
							graph.initialize();
							var predFunc = {
								f: function(x) {
									var a = parseFloat($("#wif_bp").val());
									var b = parseFloat($("#wif_tc_hdl").val());
									var c = 1;
									if ($("#wif_startSmoke").is(":checked"))
										c *= 1.7;
										
									if ($("#wif_stopSmoke").is(":checked"))
										c *= 0.58;
										
									if ($("#wif_diabetes").is(":checked")|| $("#frm_diabetes").is(":checked"))
										c *= 1.5;
									
									//Debug: console.log('a', a, 'b', b);
									return c * (a*x/2000+b*x*x/1700 + 2);
								},
								color: '#E2389B',
								from: parseInt( document.getElementById("frm_age").value),
								to: 90,
								drawToday: false
							};
							graph.simulationFunction = predFunc;
							graph.redraw();
						});
					}).addClass("currentStep");
					
					graph.initialize();
					//graph.redraw();
					
					/**
					 * Draw History
					 */
					var ideal_begin = 0;
					if (user != null) {
						$.ajax({
							url: 'action.php',
							type: 'GET',
							data: {
								'q': 'getHistory',
								'id_user': user.data.id_user
							}
						}).done(function(ans) {
							//Debug: console.log(ans);
							if (ans.length >= 2) Alert("Please note we are only showing history entries with at least six months from one another.");
							var last = null;
							var i = 0;
							do {
								var state = ans[i];
								if (last == null || (last != null && get_month_diff(new Date(last.date), new Date(state.date)) >= 6 )) {
									//var date = new Date(state.date);
									//Debug: console.log(state, date);
									state.func = function(x) {
										var c = 1;
										
										if (state.smoker == 1)
											c *= 1.7;
										
										if (state.has_diabetes == 1)
											c *= 1.5;
										
										console.log(state.has_diabetes, 'c', c);
										return c * (parseFloat(state.pressure_sys)*x/2000+parseFloat(state.tc_hdl)*x*x/1700 + 2);
									};
									graph.drawFunction({
										f: state.func,
										color: '#bfec3b',
										from: parseInt(state.age),
										to: parseInt(state.age),
										drawToday: true
									}, true);
									graph.addHistoryEvent(state);
									last = state;
								}
							} while (i++ < ans.length - 1);
							ideal_begin = last!= null? parseInt(last.age) : 0;
							/**
							 * Draw ideal curve
							 */
							graph.drawFunction({
								f: function(x) {
									return 1 * (120*x/2000+4*x*x/1700 + 2);
								},
								color: '#36b0d9',
								from: ((ideal_begin != 0) ? ideal_begin : parseInt(document.getElementById("frm_age").value)),
								to: 90,
								drawToday: false
							}, true);
						});
						
						
					} else {
						/**
						 * Draw ideal curveif the user is not loggedin
						 */
						graph.drawFunction({
							f: function(x) {
								return 1 * (120*x/2000+4*x*x/1700 + 2);
							},
							color: '#36b0d9',
							from: parseInt(document.getElementById("frm_age").value),
							to: 90,
							drawToday: false
						}, true);
					}
					
					
					/**
					 * Draw prediction
					 */
					var todayFunc = {
						f: function(x) {
							var a = parseFloat(document.getElementById("frm_bp_sys").value);
							var b = parseFloat(document.getElementById("frm_tc_hdl").value);
							var c = 1;
							
							if ($("#frm_smoke_y").is(":checked"))
								c *= 1.7;
								
							if ($("#frm_diabetes_y").is(":checked"))
								c *= 1.5;
								
							//Debug: console.log('a', a, 'b', b);
							return c * (a*x/2000+b*x*x/1700 + 2);
						},
						//f: function(x) {return x;},
						//f: function(x) {return 120*x/2000+4.5*x*x/1700 + 2;},
						color: '#FF8B3F',
						from: parseInt( document.getElementById("frm_age").value),
						to: 90,
						drawToday: true
					};
					graph.drawFunction(todayFunc, false);
					graph.todayFunction = todayFunc;
				});
			}
			break;
		
		case "#/Title":
			//Debug: console.log("Title");
			
			if (user != null) {
				$("#beginLink").html('Begin');
				$("#signup_link").hide();
				$("#loginLink").hide();
			} else {
				$("#beginLink").html('Begin without registering');
				$("#signup_link").show();
				$("#loginLink").show();
			}
			
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
			
		case "#/Logout":
			user = null;
			$.ajax({
				url: "action.php",
				type: "GET",
				data: {
					'q': 'logout'
				}
			}).done(function(ans) {
				Alert("Successfully logged out.");
				user = null;
				location.hash = "#/Title";
			});
			graph.drawnFunction = new Array();
			break;
		
		case "#/Confirm":
			//Debug: console.log("Confirm");
			var hashPieces = location.hash.split('/');
			var uid = hashPieces[2];
			location.hash = "#/Title";
			$.ajax({
				url: 'action.php',
				type: 'GET',
				data: {
					q: 'confirm',
					'uid': uid
				}
			}).done(function(ans) {
				Alert(ans);
			});
			break;
		
		case "#/SignUpConfirmation":
			if (caller != 'signupsubmit')
				location.hash = '#/Title';
			break;	
		
		default:
			console.log("Called default");
			location.hash = "#/Title";
			break;
	}
	
	/**
	 * Display the header iff the user is logged
	 */
	if (user != null) {
		$("#hdr_name").html(user.data.name);
		$("header").fadeIn();
	} else {
		$("header").fadeOut();
	}
	
}

$(window).load(function() {
	graph = new Graph({
		canvasId: 	"ResultCanvas",
		ratioWH: 	1.5,
		resolution: {x: 90, y: 90},
		axisOrigin: {x: 0.06, y: 0.15},
		origin: 	{x: 0.1480, y: 0.0},
		limit: 		{x: 0.90, y: 0.95}
	});
	
	$(window).resize(function() {
		graph.initialize();
		graph.redraw();
	});
	
	$("#Step1 input").change(function() {
		validate();
	});
	
	$(":not(#Alert)").click(function() {
		$("#AlertOverlay").fadeOut('slow');
	});
	
	$("#ProcessLogin_btn").click(function() {
		caller = 'login_btn';
	});
	
	$("#btn_ShowResult").click(function() {
		caller = 'step1';
	});
	
	/**
	 * The submit handler
	 */
	$("#SignUp .nextStepLinkContainer a#SignUpSubmit").click(function() {
		caller = 'signupsubmit';
		$("#AlertOverlay").fadeOut('slow');
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
				birthday: valid_date($("#snp_birthday").val()),
				gender: $(".gender:checked").val(),
				risk: $(".risk:checked").val()
			}
		}).done(function(r) {
			if (r == "ok") {
				$("#SignUp").fadeOut('slow', function() {
					$("#SignUpConfirmation").fadeIn('slow').addClass("currentStep");
				});
			} else {
				Alert("An error occurred while trying to create your account.<br>Please check if all your data are correctly input.");
			}
		});
	});
		
	/** While styling the canvas **/
	graph.initialize();
	graph.redraw();
	/** end **/
	
	$("#Result").hide().css("opacity", 1);
	
	/** Update the labels accordingly to the sliders **/
	$("#frm_tc_hdl").change(function() {
		$("#frm_tc_hdl_val").html($("#frm_tc_hdl").val());
	});
	
	$("#wif_bp").change(function() {
		$("#wif_bp_val").html($("#wif_bp").val());
	});
	
	$("#wif_tc_hdl").change(function() {
		$("#wif_tc_hdl_val").html($("#wif_tc_hdl").val());
	});
	
	
	
	//Debug: console.log(graph);
});
