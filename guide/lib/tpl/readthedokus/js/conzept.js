var $ = jQuery;

jQuery(document).ready(function() {

  // open all explore-links in parent window
  $('.interwiki.iw_explore').attr('target', '_parent');

  // setup image previous/next data
  nr_of_images_on_page = parseInt( $( 'img.media, img.mediabox2, img.mediaright, img.mediacenter, img.medialeft' ).length ) - 1;

  $( 'img.media, img.mediabox2, img.mediaright, img.mediacenter, img.medialeft' ).each(function( index ) {
    //console.log( index + ": " + $( this ).text() );
    $( this ).addClass('idx-' + index);
  });

  // handle scroll in modal mode
  var position = $(window).scrollTop();

});

var gotoPreviousImage = function ( ) {

  // get previous image index
  var currimg = parseInt( activeModalImage.replace(/^idx-/g, '') );
  var nextimg = currimg - 1;

  if ( nextimg < 0 ){ nextimg = nr_of_images_on_page; }
  $('img.idx-' + nextimg ).click();
}

var gotoNextImage = function ( ) {

  // get next image index
  var currimg = parseInt( activeModalImage.replace(/^idx-/g, '') );
  var nextimg = currimg + 1;

  if ( nextimg > nr_of_images_on_page ){ nextimg = 0; }

  $('img.idx-' + nextimg ).click();

}

// setup image modal
var modal = document.getElementById('myModal');
var img = $('img.mediabox2');
var modalImg = $("#img01");
var captionText = document.getElementById("caption");

$('img.media, img.mediabox2, img.mediaright, img.mediacenter, img.medialeft ').click(function( event ){

	event.preventDefault();

	var classList = $(this).attr('class').split(/\s+/);

	$.each( classList, function(index, item) {
			if ( item.startsWith('idx-') ) {
				//console.log( item );
				activeModalImage = item;
			}
	});

	if ( $('div.tocible').is(":visible") ){
		previousModalToc = true;
		$('div.tocible').hide(); // hide ToC
	}
	else {
		previousModalToc = false;
	}

	modal.style.display = "block";
	var newSrc = this.src;

	// remove from the "?" onwards
	newSrc = newSrc.substring(0, newSrc.indexOf('?'));
	modalImg.attr('src', newSrc);

	// use alt-atr only if there is no thumbcaption-text
	var thumbcaption = $(this).next().text() || '';
	thumbcaption = thumbcaption.replace(/\(click for animation\)/g, '');

	if ( thumbcaption == '' ){
		captionText.innerHTML = this.alt;
	}
	else {
		captionText.innerHTML = thumbcaption;
	}

  var span = document.getElementsByClassName("close")[0];

	// to close image modal by X-button
	span.onclick = function( e ) {

		modal.style.display = "none";

	}

	// to close image modal by click
	modal.onclick = function( e ) {

		console.log( e );
		console.log( e.target.id );

		if ( e.target.id === 'modal_previous' || e.target.id === 'modal_next' ){ // prev / next button clicked
			// do nothing
			console.log('do nothing');
		}
		else { // close modal
			console.log('closing modal');

			modal.style.display = "none";

			if ( previousModalToc ){
				$('div.tocible').show(); // hide ToC
			}

		}
	}

});


$(document).on('keyup', function(evt) {


	if ( $('#myModal').is(':visible') ) { // image modal is in use

		if ((evt.keyCode || evt.which) == 37) { // left arrow

			gotoPreviousImage();

		}
		if ((evt.keyCode || evt.which) == 39) { // right arrow

			gotoNextImage();

		}

	}


  if ( (evt.keyCode || evt.which) == 27) { // escape-key

    // close modal (if open)
    var modal = document.getElementById('myModal');

    if ( modal.style.display == "block" ) {
        $('span#modal_close').click();
        //return 0;
    }

  }

});
