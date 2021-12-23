let app = {
  title : '',
  img   : '',
};

$().ready(function() {

  init();

  $('#fullscreenToggle').focus();

});

async function init(){

  app.img   = getParameterByName( 'img' ) || '';
  app.title = getParameterByName( 't' )   || '';

	if ( valid( app.img ) ){

    $('#title').text( app.title );

  }

	if ( valid( app.img ) ){

    //console.log( app.img );

		const panorama = new PANOLENS.ImagePanorama( app.img );

		const viewer = new PANOLENS.Viewer( { output: 'console' } );

    //viewer.OrbitControls.noZoom = true;

		viewer.add( panorama );

	}

}


document.toggleFullscreen = function() {

  if (screenfull.enabled) {

    screenfull.toggle();

  }

  return 0;

};

// keyboard control
$(document).keydown(function(event) {

  let key = (event.keyCode ? event.keyCode : event.which);

  //console.log( event, key );

  if ( key == '70' ){ // "f"

    //screenfull.toggle();
    document.toggleFullscreen();

  }

});
