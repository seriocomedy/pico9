function loadScript (src, cb) {
  var doc = document
  var tag = 'script'
  var firstScript
  var el
  el = doc.createElement(tag)
  firstScript = doc.getElementsByTagName(tag)[0]
  el.async = 1
  el.src = src
  el.onload = function () { cb() }
  el.onerror = function () { cb(new Error('failed to load: ' + src)) }
  firstScript.parentNode.insertBefore(el, firstScript)
}

var lel = document.getElementById("loading");

try {
	var gameId = window.location.hash.split('#')[1].split('/')[0];
} catch (error) {
	lel.innerText = error;
}

loadScript("carts/"+gameId+".js", function(error) {
	if (error) {
		lel.innerText = error;
	} else {
		lel.style.display = "none";
	}
});

function onKeyDown_blocker(event) {
	event = event || window.event;
	var o = document.activeElement;
	if (!o || o == document.body || o.tagName == "canvas")
	{
		if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1)
		{
			if (event.preventDefault) event.preventDefault();
		}
	}
}

var pico8_buttons = [0, 0, 0, 0, 0, 0, 0, 0];
	 	
function press_pico8_button(pl, which, state) {
	if (state == 0)
		pico8_buttons[pl] &= ~(1 << which);
	else
		pico8_buttons[pl] |= (1 << which);
}

document.addEventListener('keydown', onKeyDown_blocker, false);

var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var Module = {};
Module.canvas = canvas;

var mb = 0; // deleteme
			
function abs(x) {
	return x < 0 ? -x : x;
}

// step 0 down 1 drag 2 up
function pico8_buttons_event(e, step) {
	pico8_buttons[0] = 0;
	
	// show buttons as soon as touched
	document.getElementById("touch_controls").style.display="";

	var num = 0;
	if (e.touches) num = e.touches.length;
	
	for (var i = 0; i < num; i++) {
		var touch = null;
	
		touch = e.touches[i];
		//tindex = touch.identifier;
		var x = touch.clientX;
		var y = touch.clientY;
		
		//if (codo_running && y > 100) 
		//	e.preventDefault();
	
		var w = document.body.clientWidth;
		var h = document.body.clientHeight;
		
		b = 0;
		
		// determine mask to clear (mask) and mask to set (b) for button state changes.
		
		if (x < w/2) {
			mask = 0xf; // dpad
			var cx = 70;
			var cy = h-70;
			deadzone = 15;
			var dx = x - cx;
			var dy = y - cy;
			
			if (abs(dx) > abs(dy) * 0.8) {
				if (dx < -deadzone) b |= 0x1;
				if (dx > deadzone) b |= 0x2;
			}
			if (abs(dy) > abs(dx) * 0.8) {
				if (dy < -deadzone) b |= 0x4;
				if (dy > deadzone) b |= 0x8;
			}
		} else {
			// button; diagonal split from bottom right corner
		
			mask = 0x30;
			
			// close to menu?
			dx = x - (w/2);
			dy = y - (h-20);
		
			if (dx*dx + dy*dy < 50*50) {
				// menu button
				b |= 0x40;
			} else {
				// one or both of [X], [O]
				if ( (h-y) > (w-x) * 0.8) b |= 0x10;
				if ( (w-x) > (h-y) * 0.8) b |= 0x20;
			}
			
		}
		
		pico8_buttons[0] |= b;
	
	}
}

var touch_detected = false;
addEventListener("touchstart", function(event){ 
	touch_detected = true;
	pico8_buttons_event(event, 0);}, false);
addEventListener("touchmove", function(event){ pico8_buttons_event(event, 1);}, false);
addEventListener("touchend", function(event){ pico8_buttons_event(event, 2);}, false);