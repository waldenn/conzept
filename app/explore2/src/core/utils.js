// cross-app utility functions

function getTargetPane(){

  let target_pane = '';

  if ( window.name === '' ) {

    target_pane = 'p1'; // call from the sidebar

  }
  else {

    target_pane = 'ps2'; // call from ps1 pane

  }

  //console.log( window.name, parent.document.getElementById('query-builder').name );

  return target_pane;

}

function getCurrentPane(){

  let pane = '';

	if ( window.name === '' ) {

		pane = 'p0'; // call from the root window

	}
	else if ( window.name === 'infoframe' ) {

  	pane = 'p1'; // call from a single-pane view

	}
	else if ( window.name === 'infoframeSplit1' ){ // call from pane1 in a split-view

		pane = 'ps1';

	}
	else if ( window.name === 'infoframeSplit2' ){ // call from pane2 in a split-view

		pane = 'ps2';

	}

  return pane;

}

function renderToPane( target_pane, url, moveto ){

  if ( detectMobile() === true ){

    if ( moveto === true ){

      explore.swiper.slideTo( 1 );

    }

	}

	if ( target_pane === '' || target_pane === 'p0' || target_pane === 'p1' ){

    if ( typeof resetIframe === 'function' ){ // TODO: check the logic here

      resetIframe();

    }

    $( explore.baseframe ).attr({"src": url });

	}
	else if ( target_pane === 'ps1' ){

		$( '#infoframeSplit1' ).attr({"src": url });

	}
	else if ( target_pane === 'ps2' ){

		$( '#infoframeSplit2' ).attr({"src": url });

	}

}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce( func, wait, immediate ){

  let timeout;

  return function(){

    let context = this, args = arguments;

    clearTimeout(timeout);

    timeout = setTimeout(function() {

      timeout = undefined;

      if ( !immediate ) func.apply(context, args);

    }, wait);

    if (immediate && !timeout) func.apply(context, args);

  };

}

function detectMobile(){

  if ( getParameterByName('v') === 'mobile' ){ // force mobile view from URL param
    return true;
  }
  else if ( getParameterByName('v') === 'desktop' ){ // force desktop view from URL param
    return false;
  }
  else {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Mobile/i.test(navigator.userAgent) );
  }

}

function detectSafari(){

  const isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
									 navigator.userAgent &&
									 navigator.userAgent.indexOf('CriOS') === -1 &&
									 navigator.userAgent.indexOf('FxiOS') === -1;

  return isSafari;

}

function detectChrome(){

  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

  return isChrome;

}

function detectFirefox(){

  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

  return isFirefox;

}

function listed( myList, myItems, removeQ ){ // both should be a list of numbers!

  if ( ! valid( removeQ ) ){

    removeQ = false;

  }

  let r = false; // default

  if ( valid( myList ) ){

    if ( Array.isArray( myList ) ){

      if ( removeQ ){

        if ( myList.some( function( nr) { return myItems.includes( parseInt( nr.substring(1) ) ) } ) ){

          r = true;

        }

      }
      else {

        if ( myList.some( function( nr ) { return myItems.includes( nr ) } ) ){

          r = true;

        }

      }

    }

  }

  return r;

}

function isQid( title ) {

  if ( title.startsWith('Q') && isNumeric( title.substring(1) ) ){

    return true;

  }
  else {

    return false;

  }

}

// check a single or a list of conditions
function isCategory( title ){

  if ( ! valid( explore.lang_category ) || ! valid( title ) ){

    return false;

  }
  else {

    const catpattern = '^' + explore.lang_category + ':';
    const catre = new RegExp( catpattern, "g" );

    const matches = title.match( catre ) || [];

    if ( matches.length > 0 ){

      return true;

    }

  }

  return false;

}

// check a single or a list of conditions
function valid( cond ){

  if ( Array.isArray( cond ) ){ // assumes a list of AND-conditions

    let state = true; // initial value

    if ( cond.length === 0 ){

      state = false;

		}
    else if ( cond.length > 0 ){

      $.each( cond, function( index, c ){

        if ( singleValid( c ) === false ){

          state = false;

          return false;

        }

      });

      //console.log( state );
      return state;

    }
    else {

      state = singleValid( cond[0] );

      //console.log( state, cond );
      return state;

    }

  }
  else { // single condition

    return singleValid( cond );

  }

}

function validAny( cond ){

  if ( Array.isArray( cond ) ){ // assumes a list of OR-conditions

    let state = false; // initial value

    if ( cond.length === 0 ){

      state = false;

		}
    else if ( cond.length > 0 ){

      $.each( cond, function( index, c ){

        if ( singleValid( c ) === true ){

          state = true;

          return true;

        }

      });

      //console.log( state );
      return state;

    }
    else {

      state = singleValid( cond[0] );

      //console.log( state, cond );
      return state;

    }

  }
  else { // single  condition

    return singleValid( cond );

  }

}

function singleValid( cond ){

  if ( typeof cond === undefined || typeof cond === 'undefined' || cond === 'undefined' || cond === null || cond === 'null' || cond === false || cond === '' ){

    return false;

  }
  else {

    return true;

  }

}

function capitalizeFirstLetter( string ) {

  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();

}

function initialIsCapital( string ){

  return string[0] !== string[0].toLowerCase();

}

function toTitleCase( string ) {

	return string.replace(/\w\S*/g, function(txt){
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});

}

function monthFormatted() { // get a zero-padded month-number

  const date  = new Date();
  const month = date.getMonth();

  return month+1 < 10 ? ("0" + month) : month;

}

function dragElement(elmnt) { 

  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  if (document.getElementById(elmnt.id + "header")) {

    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;

  }
  else { // otherwise, move the DIV from anywhere inside the DIV:

    elmnt.onmousedown = dragMouseDown;

  }

  function dragMouseDown(e) {

    e = e || window.event;
    e.preventDefault();

    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;

    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;

  }

  function elementDrag(e) {

    e = e || window.event;
    e.preventDefault();

    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

  }

  function closeDragElement() {

    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;

  }
}

function cloneTab() {

  event.preventDefault();

  openInNewTab( document.URL );


}

function openInNewTab( url ) {

  event.preventDefault();

  if ( url.startsWith('https%3A' ) || url.startsWith('http%3A' ) ){

    url = decodeURIComponent( url );

  }

  window.open( url , "_blank");

}

function stripHtml( s ) {

  if ( valid( s ) ){

    return s.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "") || '';

  }

}

function getParameterByName( name, url ) {

  if ( ! url ){

    url = window.location.href;

  }

  const regex   = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec( url );

  if (!results) return undefined;

  if (!results[2]) return '';

  let string = '';

  try { 

    string = decodeURIComponent( results[2].replace(/\+/g, " "));

  }
  catch(e) { 

    //console.error(e); 

    return '';

  }

  return stripHtml( string );

}

function setParameter( name, value ){

  const params = new URLSearchParams( window.location.search );

  if ( valid( value ) ){ // set paramater

    params.set( name, value );

  }
  else if ( value === '' ) { // remove parameter

    params.delete( name );

  }

  window.history.replaceState({}, '', decodeURIComponent(`${window.location.pathname}?${params}#` + explore.hash ));

}

function getRandomInt( max ) {

  return Math.floor( Math.random() * Math.floor(max) );

}

function shuffleArray(array) {

  let currentIndex = array.length,  randomIndex;

  // while there remain elements to shuffle...
  while (currentIndex != 0) {

    // pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // and swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [ array[randomIndex], array[currentIndex] ];
  }

  return array;
}

function getUnique(arr, comp){

  const unique = arr
    .map(e => e[comp])

     // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the dead keys & store unique objects
    .filter(e => arr[e]).map(e => arr[e]);

   return unique;
}

function unique(arr) {

  const u = {}, a = [];

  for ( let i = 0, l = arr.length; i < l; ++i){

    if ( ! u.hasOwnProperty( arr[i] ) ) {

      a.push( arr[i] );

      u[ arr[i] ] = 1;

    }

  }

  return a;
}

function findObjectByKey(array, key, value) {

  const list = [];

  if ( !Array.isArray( array ) ){

    return list;

  }

  for ( let i = 0; i < array.length; i++) {

    if ( array[i][key] === value ) {

      list.push( array[i] );

    }

  }

  return list;

}

function sortObjectsArrayByNestedProperty( arr, prop ) {

  prop = prop.split('.');

  let len = prop.length;

  arr.sort(function (a, b) {

    let i = 0;

    while( i < len ) { a = a[prop[i]]; b = b[prop[i]]; i++; }

    if (a < b) {
      return -1;
    }
    else if (a > b) {
      return 1;
    }
    else {
      return 0;
    }

  });

  return arr;

};

function sortObjectsArray(objectsArray, sortKey){

  let retVal;

  if (1 < objectsArray.length) {

    const pivotIndex  = Math.floor((objectsArray.length - 1) / 2);  // middle index
    const pivotItem   = objectsArray[pivotIndex];                    // value in the middle index
    const less = [], more = [];

    objectsArray.splice(pivotIndex, 1);                          // remove the item in the pivot position

    objectsArray.forEach( function(value, index, array){

      if ( value[sortKey] <= pivotItem[sortKey] ){ // compare values
        less.push(value);
      }
      else {
        more.push(value);
      }

    });

    retVal = sortObjectsArray(less, sortKey).concat([pivotItem], sortObjectsArray(more, sortKey));

  }
  else {

    retVal = objectsArray;

  }

  return retVal;
}

function countDecimals(value) {

    if ( Math.floor(value) === value ) return 0;

    return value.toString().split(".")[1].length || 0; 

}

function guidGenerator(){

  let S4 = function() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };

  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

// TODO: could we use this?
function validURL( url ){

  try {

    new URL(url);
    return true;

  } catch (error) {

    return false;

  }

};

function isNumeric( n ) {

  return !isNaN(parseFloat(n)) && isFinite(n);

}

function convertToSeconds( myTime ) { // hh:mm:ss -> seconds

  return myTime.split(':').reduce((acc,time) => (60 * acc) + +time);

}

function hashCode(str){

  let hash = 0;

  if (str.length == 0) return hash;

  for (i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs( hash ).toString();

}

function isEmptyObject(obj) {

  return Object.keys(obj).length === 0;

}


function setOnMultiValueClick( args ){ // dynamically creates lists of "onclick"-strings 

  // remove unneeded data
  delete args.item;

  if ( args.type !== 'wikipedia' ){ // only 'wikipedia' types need the sometimes large "languages" data-structure
    args.languages = '';
  }

  //console.log(args);

  args.title = args.title.replace(/,/g, '_'); // hack to prevent the jQuery-selector from breaking

  return ' onclick="stateResetCheck( event ); insertMultiValues( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;)" data-title="' + args.title + '" ';

}

function setOnClick( args ){ // creates the "onclick"-string for most dynamic-content links / buttons

  // remove unneeded data
  delete args.item;

  if ( args.type !== 'wikipedia' ){ // only 'wikipedia' types need the sometimes large "languages" data-structure
    args.languages = '';
  }

  return ' onclick="stateResetCheck( event ); handleClick( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;)" onauxclick="onMiddleClick( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;)" ';

}

async function onMiddleClick( args ) {

  event.preventDefault();

  if ( typeof args === 'string' ){ // args is a string

    if ( args.startsWith('%7B%') ){ // args is an encoded string

      // decode the args-string
      args = JSON.parse( decodeURIComponent( args ) );

    }

  }

  let type  = args.type;
  let title = args.title;
  let lang  = args.language;
  let qid   = args.qid || '';
  let url   = args.url || '';

  // open new tab with correct parameters
  let new_url = '';

  if ( valid( url ) ){

    new_url = url;

    openInNewTab( new_url );

  }
  else if ( type === 'wikipedia' || type === 'wikipedia-qid' ){

    new_url = explore.base + '/explore/' + encodeURIComponent( title ) + '?l=' + lang + '&t=' + type + '&i=' + qid;

  }
  else { // FIXME: handle any 'undefined' cases coming in here

    console.log( 'TODO handle this URL type: ', title, lang, type, qid );
    //new_url = `https://${explore.hostname}/explore/${title}?l=${lang}&t=${type}&i=${qid}`;

  }

  if ( new_url !== '' ){

    openInNewTab( new_url );

  }

}

function removeCategoryFromTitle( title ){ // remove (possible) category-prefix

  const catpattern = '^' + explore.lang_category + ':';

  const catre = new RegExp( catpattern, "g" );

  return title.replace( explore.lang_catre1, '');

}

function setupSwipe( el ){ // used to set up TinyGesture-swiping for apps

  // Options object is optional. These are the defaults.
  const options = {

    // used to calculate the threshold to consider a movement a swipe. it is passed type of 'x' or 'y'.
    threshold: (type, self) => Math.max(
      25,
      Math.floor(0.15 * (
        type === 'x'
          ? window.innerWidth || document.body.clientWidth
          : window.innerHeight || document.body.clientHeight
      ))
    ),

    // Minimum velocity the gesture must be moving when the gesture ends to be considered a swipe.
    velocityThreshold: 10,

    // Used to calculate the distance threshold to ignore the gestures velocity and always consider it a swipe.
    disregardVelocityThreshold: (type, self) => Math.floor(
      0.5 * (
        type === 'x'
          ? self.element.clientWidth
          : self.element.clientHeight
      )
    ),

    // point at which the pointer moved too much to consider it a tap or longpress gesture.
    pressThreshold: 8,

    // If true, swiping in a diagonal direction will fire both a horizontal and a vertical swipe.
    // If false, whichever direction the pointer moved more will be the only swipe fired.
    diagonalSwipes: false,

    // the degree limit to consider a swipe when diagonalswipes is true.
    diagonalLimit: Math.tan(45 * 1.5 / 180 * Math.PI),

    // listen to mouse events in addition to touch events. (for desktop support.)
    mouseSupport: true

  };

  const target = document.getElementById( el );
  const gesture = new TinyGesture(target, options);

  gesture.on('swiperight', event => {
    gesture.swipedHorizontal; // This will always be true for a right swipe.
    gesture.swipedVertical;   // This will be true if diagonalSwipes is on and the gesture was diagonal enough to also be a vertical swipe.
    window.parent.postMessage({ event_id: 'slide-to-next', data: { } }, '*' );
    //nextEl: ".swiper-button-next",
  });


  gesture.on('swipeleft', event => {
    gesture.swipedHorizontal; // This will always be true for a left swipe.
    gesture.swipedVertical;   // This will be true if diagonalSwipes is on and the gesture was diagonal enough to also be a vertical swipe.
    window.parent.postMessage({ event_id: 'slide-to-previous', data: { } }, '*' );
    //prevEl: ".swiper-button-prev",
  });

}

function unpackString( str ){

  if ( typeof str === 'string' ){ // is a string

    if ( str.startsWith('%7B%') ){ // and is encoded

      str = JSON.parse( decodeURIComponent( str ) );

    }

  }

	return str;

}

function removeWords( string, list ) {

  const expStr = list.join( '|' );

  return string.replace( new RegExp(expStr, 'gi'), '');

}

function setupAppKeyboardNavigation() {

  if ( detectMobile() === false ){ // only support keyboard-navigation on desktop

    document.addEventListener('keydown', e => {

      if (e.key === 'ArrowLeft') { // move to sidebar

        window.parent.postMessage({ event_id: 'move-to-sidebar', data: { } }, '*' );

      }

      if (e.key === 'ArrowRight') { // move to second content-pane

        console.log('TODO: move to second content-pane');

      }

    });

  }

}


// automatically pause any other audio-element already playing (upon a new 'play'-event)
async function setupAutoStopAudio(){

  document.addEventListener('play', function(e){

    const audios = document.getElementsByTagName('audio');

    for( let i = 0, len = audios.length; i < len;i++){

      if( audios[i] != e.target ){

        audios[i].pause();

      }
    }
  }, true);

}

function stopAllAudio(){ // pause all audio

  const audios = document.getElementsByTagName('audio');

  for( let i = 0, len = audios.length; i < len;i++){

		audios[i].pause();

  }

}

/*
  Screenfull library: https://github.com/sindresorhus/screenfull
  Copyright: Sindre Sorhus, MIT-license
*/
! function() {

  var u = "undefined" != typeof window && void 0 !== window.document ? window.document : {},
      e = "undefined" != typeof module && module.exports,
      t = "undefined" != typeof Element && "ALLOW_KEYBOARD_INPUT" in Element,
      c = function() {
          for (var e, n = [
                  ["requestFullscreen", "exitFullscreen", "fullscreenElement", "fullscreenEnabled", "fullscreenchange", "fullscreenerror"],
                  ["webkitRequestFullscreen", "webkitExitFullscreen", "webkitFullscreenElement", "webkitFullscreenEnabled", "webkitfullscreenchange", "webkitfullscreenerror"],
                  ["webkitRequestFullScreen", "webkitCancelFullScreen", "webkitCurrentFullScreenElement", "webkitCancelFullScreen", "webkitfullscreenchange", "webkitfullscreenerror"],
                  ["mozRequestFullScreen", "mozCancelFullScreen", "mozFullScreenElement", "mozFullScreenEnabled", "mozfullscreenchange", "mozfullscreenerror"],
                  ["msRequestFullscreen", "msExitFullscreen", "msFullscreenElement", "msFullscreenEnabled", "MSFullscreenChange", "MSFullscreenError"]
              ], l = 0, r = n.length, t = {}; l < r; l++)
              if ((e = n[l]) && e[1] in u) {
                  for (l = 0; l < e.length; l++) t[n[0][l]] = e[l];
                  return t
              }
          return !1
      }(),
      r = {
          change: c.fullscreenchange,
          error: c.fullscreenerror
      },
      n = {
          request: function(r) {
              return new Promise(function(e) {
                  var n = c.requestFullscreen,
                      l = function() {
                          this.off("change", l), e()
                      }.bind(this);
                  r = r || u.documentElement, / Version\/5\.1(?:\.\d+)? Safari\//.test(navigator.userAgent) ? r[n]() : r[n](t ? Element.ALLOW_KEYBOARD_INPUT : {}), this.on("change", l)
              }.bind(this))
          },
          exit: function() {
              return new Promise(function(e) {
                  if (this.isFullscreen) {
                      var n = function() {
                          this.off("change", n), e()
                      }.bind(this);
                      u[c.exitFullscreen](), this.on("change", n)
                  } else e()
              }.bind(this))
          },
          toggle: function(e) {
              return this.isFullscreen ? this.exit() : this.request(e)
          },
          onchange: function(e) {
              this.on("change", e)
          },
          onerror: function(e) {
              this.on("error", e)
          },
          on: function(e, n) {
              var l = r[e];
              l && u.addEventListener(l, n, !1)
          },
          off: function(e, n) {
              var l = r[e];
              l && u.removeEventListener(l, n, !1)
          },
          raw: c
      };
  c ? (Object.defineProperties(n, {
      isFullscreen: {
          get: function() {
              return Boolean(u[c.fullscreenElement])
          }
      },
      element: {
          enumerable: !0,
          get: function() {
              return u[c.fullscreenElement]
          }
      },
      enabled: {
          enumerable: !0,
          get: function() {
              return Boolean(u[c.fullscreenEnabled])
          }
      }
  }), e ? module.exports = n : window.screenfull = n) : e ? module.exports = !1 : window.screenfull = !1
}();
