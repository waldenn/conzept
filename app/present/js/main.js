'use strict';

const current_pane = getCurrentPane();

const explore = {

  app_version   : '0.45.05',

  title         : getParameterByName('t') || '',
  language      : getParameterByName('l') || 'en',
  lang3         : getParameterByName('lang3') || '',  // used for the Open Library book-link
  voice_code    : getParameterByName('voice') || '',  // used for TTS
  voice_rate    : '1',                                // used for TTS
  voice_pitch   : '1',                                // used for TTS

  voice_code    : getParameterByName('voice') || '',

}

function receiveMessage(event){

  //console.log('receiveMessage() called: ', event.data.data );

  if ( event.data.event_id === 'set-value' ){

		if ( typeof explore[ event.data.data[0] ] === undefined ){
			// do nothing
		}
		else {

			//console.log( 'set-value: ', event.data.data[0], event.data.data[1] );
			explore[ event.data.data[0] ] = event.data.data[1];

		}

  }

}

// insert webcomponent (with some extra settings)
var el = document.createElement('iiif-storyboard');
el.setAttribute('annotationurl', 'https://dnoneill.github.io/annotate/annotations/wh234bz9013-0001-list.json'); 
el.setAttribute('styling', 'tts:' + explore.voice_code ); 
document.body.appendChild( el );
