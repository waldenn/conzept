document.addEventListener('keydown', function(event) {

  event.preventDefault();

  if ( event.key === 'f' ) {

    const fullscreenButton = document.getElementById( 'fullscreen-button' );

    if (fullscreenButton) {

      fullscreenButton.click();

    }

  }

});
