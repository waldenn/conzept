let globalVariable;
let select;

let parentref;
let isMobile = detectMobile();

let app = {
	title: '',
	language: 'en',
	lang3: 'eng',
};

$().ready( function () {

	init();

	$( '#fullscreenToggle' ).focus();

} );

async function init() {

	setParentRef();

	app.title			= getParameterByName( 't' ) || '';
	app.language	= getParameterByName( 'l' ) || 'en';
	app.lang3			= getParameterByName( 'lang3' ) || 'eng';

	if ( valid( app.lang3 ) ) {

		switch ( app.lang3 ) { // correct any mismatching lang3 codes
										// see: https://tesseract-ocr.github.io/tessdoc/Data-Files-in-different-versions.html
										// TODO: add more languages
			case 'fre':
				app.lang3 = 'fra';
				break;
			case 'chi':
				app.lang3 = 'chi_sim';
				break;
			case 'ger':
				app.lang3 = 'deu';
				break;

		}

		$('#dropdown').val( app.lang3 ).change();

	}

	document.getElementById( 'submit' ).onclick = runningOCR;

	//const image = document.getElementById( 'fileElementId' ).files[ 0 ];

}

function setParentRef(){

  if ( isMobile ){

    parentref = parent;

  }
  else { // desktop

    if ( window.parent.name === 'infoframeSplit2' || window.parent.name === 'infoframe_' ){ // request from secondary content iframe
      parentref = parent;
    }
    else { // primary content frame
      parentref = parent.top;
    }

  }

}

function loadFile(event) {

  // TODO: clear previous image-thumbs

	//console.log( event.target.files );

  // TODO: allow for multiple image-thumbnails
  // for each file
  //  - create an <img>-tag
  //  - set img.src

  let img = document.getElementById('input');

  img.src = URL.createObjectURL( event.target.files[0] );

  img.onload = function() {

    URL.revokeObjectURL( img.src ) // free object 

  }

}


function goExplore( title, newtab ){

  if ( newtab ){

    openInNewTab( 'https://conze.pt/explore/' + title + '?l=' + app.language + '&t=wikipedia' );

  }
  else {

    const url = 'https://conze.pt/app/wikipedia/?t=' + encodeURIComponent( title ) + '&l=' + app.language;

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', language: app.language, url: url, current_pane: getCurrentPane(), target_pane: 'ps2' } }, '*' );

  }

}

window.onload = function () {

	select = document.getElementById( 'dropdown' );

};

$( "#btn-save" ).click( function () {

	let text = $( "#output" ).val();
	let filename = $( "#input-fileName" ).val();
	let blob = new Blob( [ text ], { type: "text/plain;charset=utf-8" } );
	saveAs( blob, filename + ".txt" );

} );


function runningOCR() {

	$('#output').empty(); // clear first

	let inp = document.getElementById( 'fileElementId' );

	for ( let i = 0; i < inp.files.length; ++ i ) {

		let name          = inp.files.item( i ).name;
		let working_files = inp.files.item( i );

		runOCR( working_files );

	}

}

function changeHiddenInput( objDropDown ) {

	//console.log( objDropDown );

	let objHidden = document.getElementById( "hiddenInput" );
	objHidden.value = objDropDown.value;
	globalVariable = objHidden.value;

}

function markSelections(text, markers) { // sort markers just in case the are not sorted from the Storage

	const sortedMarkers = [...markers].sort((m1, m2) => m1.start - m2.start);
	let markedText = '';
	let characterPointer = 0;

	sortedMarkers.forEach(({start, end, title}) => {
		markedText += text.substring(characterPointer, start);
		markedText += '<a href="#" onclick="goExplore( &quot;' + encodeURIComponent( title ) + '&quot; )">';
		markedText += text.substring(start, end);
		markedText += '</a>';
		characterPointer = end;
	});

	// add the remaining text after markers
	markedText += text.substring( characterPointer );

	return markedText;

}


function runOCR( url ) {

  //console.log( url );

	Tesseract.recognize( url, {
		lang: globalVariable
	} )
		.then( function ( result ) {

      let mytext = result.text; 

      // convert each word into a link
      const words = result.text.split(" ");
      const markers = [];

      // get Spacy NER tags: proper nouns ("NNP")
			jQuery.ajax ({

				url: 'https://conze.pt/app/spacy/ent',
				type: "POST",
				data: JSON.stringify({ "text": result.text, 'model': app.language, 'collapse_phrases': 1, 'collapse_punctuation': 0 }),
				dataType: "json",
				contentType: "application/json; charset=utf-8",

				success: function( res ){

					// suppose we are given the original text, and the markers as start-end pairs of selection character positions
					const text = mytext;
					const markers = [];
					//const markers = [{start: 77, end: 82}, {start: 40, end: 45}];

					$.each( res, function ( i, v ) {

						if ( v.type !== 'CARDINAL' ){ // dont use the cardinal strings

							markers.push({ start: v.start, end: v.end, title: v.text });

						}

					})

					//console.log( markers );

					// see: https://stackoverflow.com/a/50291381
					$('#output').append( markSelections( text, markers) + '<hr>');

				}

			})

      /*
			// common nouns ("NN")
			jQuery.ajax ({

				url: 'https://conze.pt/app/spacy/dep',
				type: "POST",
				data: JSON.stringify({ "text": result.text, 'model': app.language, 'collapse_phrases': 1, 'collapse_punctuation': 0 }),
				dataType: "json",
				contentType: "application/json; charset=utf-8",

				success: function( res ){

					//console.log( 'common nouns (NN): ', res.words );
				
				}

			});
      */

		} ).progress( function ( result ) {

					document.getElementById( "ocr_status" )
						.innerText = result[ "status" ] + " (" + ( result[ "progress" ] * 100 ).toFixed() + "%)";

		} );

}


