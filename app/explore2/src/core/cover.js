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

  $('body').css({ "background-image" : 'url("' + file + '")' }); 

	setBackgroundColor( file );

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
