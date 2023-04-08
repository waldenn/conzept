"use strict";

let hash = '';

let isMobile = detectMobile();
let isSafari = detectSafari();

let parentref = '';

function loadFile(event) { 

  let img = document.getElementById('input'); 

  img.src = URL.createObjectURL( event.target.files[0] ); 

  //console.log( output.src );

  img.onload = function() { 

    URL.revokeObjectURL( img.src ) // free object 

  } 

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

function goExplore( title, newtab ){

  //console.log( language );

  if ( newtab ){

    openInNewTab( 'https://' + CONZEPT_HOSTNAME + CONZEPT_WEB_BASE + '/explore/' + title + '?l=' + language + '&t=wikipedia' );

  }
  else {

    const url = '/app/wikipedia/?t=' + encodeURIComponent( title ) + '&l=' + language;

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', language: language, url: url, current_pane: getCurrentPane(), target_pane: 'ps2' } }, '*' );

    //parentref.postMessage({ event_id: 'handleClick', data: { type: 'explore', title: title, language: language } }, '*' );


  }

}

setParentRef();
