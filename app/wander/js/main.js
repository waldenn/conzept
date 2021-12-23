$().ready(function() {

  let options = {
    start: 0,
    mute: true,
    repeat: false,
    videoId: '',
  }

  options.videoId = getParameterByName( 'videoId' ) || '';
  options.mute    = getParameterByName( 'mute' ) || true;
  options.title   = getParameterByName( 'title' ) || '';

  // TODO: 
  //  - go-forward-in-time / go-backward-in-time controls
  //  - video time
  //  - video date

  let isMobile = detectMobile();

	// we can also set the title by parameter
  if ( options.title !== '' ){
    $('#video-title').text( options.title );
  }
	else {

		let intId = setInterval( function() {

			if ( typeof player === undefined || typeof player === 'undefined' ) {
        // do nothing
      }
      else {

				// States: 1: playing, 2: paused, 5: stopped
				if ( [ 1, 2, 5 ].indexOf( player.getPlayerState() ) >= 0 ) {

					$('#video-title').text( player.getVideoData().title );
					clearInterval( intId );

				}

			}

		}, 1000 );

	}

  //console.log( options.mute );

  if ( options.mute === 'false' || options.mute === false ){

    //console.log( 'audio on' );
    options.mute = false;

    //$('.tubular-mute').find('i').removeClass('fa-volume-mute').addClass('fa-volume-up'); 
    //$('.tubular-mute').first().trigger('click');

  }
  else {

    //console.log( 'audio off' );
    options.mute = true;

    $('.tubular-mute').find('i').removeClass('fa-volume-up').addClass('fa-volume-mute'); 

  }

  //console.log( options.videoId );

  if ( typeof options.videoId === undefined || options.videoId === 'undefined' || options.videoId === '' ){

    // do nothing
    //vid = '-YT9tXUXOPo'; 

  }
  else {

    $('#wrapper').tubular( options );

  }

  $('.tubular-play-next').click(function(event) {

    window.top.postMessage({ event_id: 'next-wander-video', data: {  } }, '*' ); 

  });

  $('.tubular-goto-youtube').click(function(event) {

    // pause first
    $(this).find('i').removeClass('fa-play').addClass('fa-pause');
    $('.tubular-pause').first().trigger('click');

    let url = 'https://www.youtube.com/watch?v=' + options.videoId;

    openInNewTab( url ); 

  });

  $('.tubular-play-toggle').click(function(event) {

    if ( $(this).find('i').hasClass('fa-play') ){ // play-state

      $(this).find('i').removeClass('fa-play').addClass('fa-pause');
      $('.tubular-pause').first().trigger('click');

    }
    else { // pause-state

      $(this).find('i').removeClass('fa-pause').addClass('fa-play');
      $('.tubular-play').first().trigger('click');

    }

  });

  $('.tubular-mute').click(function(event) {

    if ( $(this).find('i').hasClass('fa-volume-mute') ){

      $(this).find('i').toggleClass('fa-volume-up');

    }
    else {

      $(this).find('i').toggleClass('fa-volume-mute');

    }

    window.top.postMessage({ event_id: 'toggle-wander-mute', data: {  } }, '*' ); 

  });

  // click on main screen
  $( '#tubular-shield' ).click(function(event) { 

    $('.tubular-play-toggle').trigger('click');

  }); 

  $('#tubular-shield').dblclick(function(){

    document.toggleFullscreen();

  }); 

  // keyboard control
  $(document).keydown(function(event) { 

    let key = (event.keyCode ? event.keyCode : event.which); 

    //console.log( event, key );

    if ( key == '70' ){ // "f"

      document.toggleFullscreen();

    }

    if ( key == '32' ){ // "space"

      $('.tubular-play-toggle').trigger('click');

    }

    if ( key == '77' ){ // "m"

      $('.tubular-mute').trigger('click');

    }

  }); 


  // for desktops: auto-hide control-menu after a few seconds, and show it again upon movement.
  if ( ! isMobile ){

    $("#video-controls").hide();

    let id    = '#video-controls';
    let t     = null;
    let msec  = 10000;

    $('body, #video-controls').mousemove(function() {

      if ( ! $( '#video-controls' ).is('visible') ){

        showControls( id, t, msec );

      }

    })
    //.mouseleave(function() {
      //hideControls( id, t );
    //})
    .keyup(function() {

      if ( ! $( '#video-controls' ).is('visible') ){

        showControls( id, t, msec );

      }
      
    });

  }



}); // end of jQuery

function showControls( id, t, msec ) {

  clearTimeout( t );
  $( id ).show();
  t = setTimeout('$("' + id + '").hide();', msec);

}

function hideControls( id, t ) {

  clearTimeout( t );
  $( id ).hide();  

}

function getParameterByName( name, url ) {

  if ( !url ){
    url = window.location.href;
  }

  // const stripHtml = html => (new DOMParser().parseFromString(html, 'text/html')).body.textContent || '';

  //name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec( url );

  if (!results) return undefined;
  if (!results[2]) return '';

  return stripHtml( decodeURIComponent(results[2].replace(/\+/g, " ")) );

}

function stripHtml( s ) {

  if ( typeof s === undefined || typeof s === 'undefined' ){
  }
  else {

    return s.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "") || '';

  }

}

document.toggleFullscreen = function() {

  if (screenfull.enabled) {

    screenfull.toggle();

    if ( $('.tubular-fullscreen').find('i').hasClass('fa-expand') ){

      $('.tubular-fullscreen').find('i').removeClass('fa-expand').addClass('fa-compress');

    }
    else {

      $('.tubular-fullscreen').find('i').removeClass('fa-compress').addClass('fa-expand');

    }

  }

  return 0;

};


function openInNewTab( url ) {
  window.open( url , "_blank");
}

function detectMobile(){

  return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Mobile/i.test(navigator.userAgent) );

}

