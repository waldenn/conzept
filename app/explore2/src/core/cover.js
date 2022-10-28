// NOTE: these variables are set from the parent-frame: title, language, type, hash

let isMobile    = detectMobile();

let fake_image  = '';

function detectMobile(){
  return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Mobile/i.test(navigator.userAgent) );
}

function detectSafari(){

  const isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
               navigator.userAgent &&
               navigator.userAgent.indexOf('CriOS') == -1 &&
               navigator.userAgent.indexOf('FxiOS') == -1;

  return isSafari;
}


$( document ).ready(function() {

  let language = $('html').attr('lang');

  if ( noCoverFound && !isMobile ){

		renderDynamicBackground();

  }
	else {

		$('body').css({ "background-image" : 'url("' + file + '")' }); 

		let commons_file_name = file.split('px-')[1] || file;

		// cleanup SVG-exported image name
		if ( commons_file_name.endsWith( '.svg.png' ) ){
			commons_file_name = commons_file_name.replace( '.svg.png', '.svg' );
		} 
		else if ( commons_file_name.endsWith( '.svg.jpg' ) ){
			commons_file_name = commons_file_name.replace( '.svg.jpg', '.svg' );
		} 

		if ( !valid( commons_file_name ) ){ // different URL-format

			commons_file_name = file.split('/').pop();

		}

		$('#image-source').attr('href', `https://commons.wikimedia.org/w/index.php?search=${commons_file_name}&title=Special:MediaSearch&go=Go&type=image` );

		setBackgroundColor( file );

	  $('#copyright-notice').show();

	}

  // allow any left-click to close the ULS-window in the sidebar
  $(document).click(function(e) {
    window.parent.postMessage({ event_id: 'uls-close', data: { } }, '*' );
  });

	$('#topiclink').on("click", function (e) {

    if ( type == ''){
      type = 'explore';
    }

    if ( detectSafari() ){ // Safari bug workaround: Safari opens link in iframe

      window.parent.parent.window.location = 'https://wikischool.org/explore/' + encodeURIComponent( title ) + '?l=' + language;

    }
    else {

      window.parent.postMessage({ event_id: 'handleClick', data: { title: title, language: language, type: type, hash: hash, } });

      hash = ''; // reset hash
      e.preventDefault();

    }


	});

  if ( isMobile ){
  }

});

document.toggleFullscreen = function() {

  if (screenfull.enabled) {
    screenfull.toggle();
  }

  return 0;

};

// keyboard control
$(document).keydown(function(event) {

	let key = (event.keyCode ? event.keyCode : event.which);

	if ( key == '70' ){ // "f"

		document.toggleFullscreen();

	}

});

function setBackgroundColor( url ){

	// set fake image
	fake_img = document.querySelector('img#color-test-image');

	if ( fake_img !== null ){

		fake_img.setAttribute('crossOrigin', '');
		fake_img.setAttribute('src', url )
		fake_img.addEventListener('load', () => {

      // see: https://github.com/null2/color-thief
      const colorThief = new ColorThief();
      let c = colorThief.getColor( fake_img );

      $('body').css( 'background-color', 'rgb(' +  c[0] + ',' + c[1] + ',' + c[2] + ')' );

		});

		// get image colors
		const colorThief = new ColorThief();
		const img = document.querySelector('img#color-test-image');
		let main_color = '#fbfaf9';

	}

}

function renderDynamicBackground(){

	setup();
	draw();

  $('body').css({
    background: 'black',
    overflow: 'hidden',
  })

}

/*
	Johan Karlsson, 2022, MIT License
	https://twitter.com/DonKarlssonSan
	source: https://codepen.io/DonKarlssonSan/pen/PoOzabY
*/
let canvas;
let ctx;
let w, h;
let stepSize;

var seed1 = Math.random();
var seed2 = Math.random() / 10;

function setup() {

	canvas = document.querySelector("#canvas");
	ctx = canvas.getContext("2d");
	resize();

  /*
	window.addEventListener("resize", () => {
		resize();
	 draw();
	});
  */

	//canvas.addEventListener("click", draw);
}

function resize() {
	const m = Math.min(window.innerWidth, window.innerHeight); 
	w = canvas.width = m;
	h = canvas.height = m;
}

function draw() {

	stepSize = Math.random() * 2 + 0.5;
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, w, h);
 
	ctx.lineWidth = w * 0.001;

	ctx.strokeStyle = "#ffffff04";
	//ctx.strokeStyle = "#"+((1<<24)*Math.random()|0).toString(16);

	let mx = w * 0.05;
	let my = h * 0.05;
	let steps = seed2 * Math.random() * 2000 + 1000;
	let xdir = Math.random() > 0.5;
	let ydir = Math.random() > 0.5;
	let sineMode = Math.random() > 0.75;
	let turns = Math.random() * 15 + 5;
	let min = Math.min(w, h);

	for ( let i = 0; i < steps; i++ ) {

		let x, y;

		if (sineMode){
			let angle = i/steps * Math.PI * 2;
			x = (Math.sin(angle)*0.5 + 0.5) * w * 0.9 + w * 0.05;
			y = (Math.sin(angle)*0.5 + 0.5) * h * 0.9 + h * 0.05;
		}
		else {
			let normalized = i / steps;
			let xn = normalized;
			let yn = normalized;
			if (xdir) {
				xn = 1 - normalized;
			}
			if (ydir) {
				yn = 1 - normalized;        
			}
			x = xn * w * 0.9 + w * 0.05;
			y = yn * h * 0.9 + h * 0.05;
		}

		let angle = Math.sin(1 + Math.PI * 2) * turns * i / steps;

		let r = i/steps * min * seed1 + 10;

		let x2, y2;

		if ( Math.random() > seed2 ){
    	x2 = Math.cos(angle) * r + w / 2;
   		y2 = Math.sin(angle) * r + h / 2;
		}
		else {
			x2 = Math.cos(angle*seed1/Math.sin(1 / Math.PI * 2)) * r + w / 2;
			y2 = Math.sin(angle*seed1/Math.cos(1 / Math.PI * 2)) * r + w / 2;
		}

		/*
		if ( Math.random() > 0.30 ){
    	x2 = Math.cos(angle) * r + w / 2;
   		y2 = Math.sin(angle + x2 / Math.random() ) * r + h / 2;
		}
		else if ( Math.random() > 0.20 ){
			x2 = Math.cos(angle/ Math.PI * 2 ) * r + w / 2;
			y2 = Math.sin(angle/ Math.PI * 2 ) * r + w / 2;
		}
		*/

		line(x, my, x2, y2);
		line(w-mx, y, x2, y2);
		line(x, h-my, x2, y2);
		line(mx, y, x2, y2);

		if ( Math.random() > seed2 ){
      line(h-my, x, y2, x2);
      line(y2, x, x2, y2);
    }

	}
}

function line(x1, y1, x2, y2) {
	ctx.beginPath();
  //ctx.setLineDash([10 * seed1, 20 * seed2 ]);
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}
