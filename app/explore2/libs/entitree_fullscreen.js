document.addEventListener('keydown', function(event) {

  if ( event.key === 'f' ) {

    const fullscreenButton = document.getElementById( 'fullscreen-button' );

    if (fullscreenButton) {

      fullscreenButton.click();

    }

  }

});
