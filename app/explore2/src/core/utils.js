// cross-app utility functions

async function setTags( item, tags ){

  if ( ! Array.isArray( tags ) || tags.length === 0 ){

    return;

  }
  else { // we have some tags

    if ( valid( tags[0] ) ){
      item.tags[0] = tags[0];
    }

    if ( valid( tags[1] ) ){
      item.tags[1] = tags[1];
    }

  }

}

function checkTag( item, level, name ){

  let r = false; // default

  if ( Number.isInteger( level ) ){

    if ( Array.isArray( name ) ){ // check against a list of tag-strings

      if ( name.some( function( str ) { return item.tags[ level ] === str } ) ){

        r = true;

      }

    }
    else if ( item.tags[ level ] === name ){ // check for one tag-string

      r = true;

    }

  }

  return r;

}

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

      if ( valid( explore.swiper ) ){ 

        //explore.swiper.slideTo( 1 ); // ? TODO

      }

    }

	}

	if ( target_pane === '' || target_pane === 'p0' || target_pane === 'p1' ){

    // only on mobile: with clicks from the sidebar, always blank "ps2" (as it may have stale content) 
    if ( explore.isMobile && ( target_pane === '' || target_pane === 'p0' ) ){
      $('#doc2').empty();
    }

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

    if ( detectMobile() === true ){

      if ( valid( explore.swiper ) ){ 

        // explore.swiper.slideTo( 2 ); // ? TODO

      }

    }

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

function detectTouch(){

  return valid( ('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch) );

}

function countryInRegion( country, region ) {

  const regions = {

    europe : ['ad', 'al', 'at', 'ba', 'be', 'bg', 'ch', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'fo', 'de', 'gr', 'hu', 'ie', 'is', 'it', 'li', 'lv', 'lt', 'lu', 'mc', 'md', 'me', 'mk', 'mt', 'nl', 'no', 'pl', 'pt', 'ro', 'sk', 'sm', 'si', 'es', 'se', 'gb', 'va', 'xk'],

  }

  if ( regions[ region ].includes( country ) ){

    return true;

  }
  else {
    return false
  }

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

  if ( valid( title ) ){

    if ( title.startsWith('Q') && isNumeric( title.substring(1) ) ){

      return true;

    }
    else {

      return false;

    }

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

// check the current user language and/or country settings against the allowed set
function checkLC( l, c ){

  // defaults
  let l_check = false;
  let c_check = false;
  
  if ( l === '' ){ // ignore empty strings

    l_check = true;

  }
  else {

    if ( Array.isArray( l ) ){ 

      l = l.map( lang => { return lang.toLowerCase(); });

      l_check = l.includes( explore.language );

    }
    else {

      l_check = ( l.toLowerCase() === explore.language );

    }

  }

  if ( ! singleValid( c ) ){ // no country argument

    c_check = true;

  }
  else if ( c === '' ){

    c_check = true;

  }
  else {

    if ( Array.isArray( c ) ){ 

      c = c.map( country => { return country.toLowerCase(); });

      c_check = c.includes( explore.country );

    }
    else {

      c_check = ( c.toLowerCase() === explore.country );

    }

  }

  return l_check && c_check;

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

  if (  typeof cond === undefined ||
        typeof cond === 'undefined' ||
        cond === 'undefined' ||
        cond === null ||
        cond === 'null' ||
        cond === 'false' ||
        cond === false ||
        cond === '' ){

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

  if ( valid( event ) ){
    event.preventDefault();
  }

  openInNewTab( document.URL );

}

function openInNewTab( url ) {

  if ( valid( event ) ){
    event.preventDefault();
  }

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

  //console.log( name, results );

  if ( results === null ){

    return '';
    //return undefined;

  }
  else if ( results[2] === 'false' ){

    return 'false';

  }
  else if ( ! valid( results[2] ) ){

    return '';

  }

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

function setParameter( name, value, hash ){

  const params = new URLSearchParams( window.location.search );

  if ( valid( value ) ){ // set paramater

    params.set( name, value );

  }
  else if ( value === '' ) { // remove parameter

    params.delete( name );

  }

  window.history.replaceState({}, '', decodeURIComponent(`${window.location.pathname}?${params}#` + hash ));

}

function setHashParameter( name, value ) {

	let theURL           	= new URL('https://example.com');     // dummy url
	theURL.search					= window.location.hash.substring(1);
	theURL.searchParams.set( name, value );
	window.location.hash	= theURL.searchParams;

}

function getRandomInt( max ) {

  return Math.floor( Math.random() * Math.floor(max) );

}

function getRandomInt2(min, max) {

  return Math.floor(Math.random() * (max - min + 1)) + min;

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

  if ( args.type !== 'string' ){ // only Wikipedia-topics need the sometimes large "languages" data-structure
    args.languages = '';
  }

  args.title = args.title.replace(/,|\//g, '_'); // keep special charatecters out of the jQuery-selector 

  return ' onclick="stateResetCheck( event ); insertMultiValues( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;)" data-title="' + args.title + '" ';

}

function setOnClick( args ){ // creates the "onclick"-string for most dynamic-content links / buttons

  // remove unneeded data
  delete args.item;

  //console.log(args);

  if ( args.type !== 'string' ){ // only Wikipedia-topics types need the sometimes large "languages" data-structure
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
  else if ( type === 'string' || type === 'wikipedia-qid' ){

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

function packListOfObjects( loo ){

  str = encodeURIComponent( JSON.stringify( loo ) );

	return '"' + str + '"';

}

function unpackListOfObjects( str ){

  let loo = '';

  if ( valid( str ) ){

    loo = decodeURIComponent( str );

  }

	return loo;

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

        if ( ! $('input').is(':focus') ){

          window.parent.postMessage({ event_id: 'move-to-sidebar', data: { } }, '*' );

        }

      }

      if (e.key === 'ArrowRight') { // move to second content-pane

        if ( ! $('input').is(':focus') ){

          console.log('TODO: move to second content-pane');

        }

      }

    });

  }

}

function selectLanguageFrom( available_languages, fallback ) {

  let language          = '';
  let fallback_language = '';

  if ( valid( fallback ) ){

    fallback_language = fallback; // custom fallback language

  }
  else {

    fallback_language = 'en'; // default fallback language

  }

  if ( ! Array.isArray( available_languages ) ){

    console.log('warning: no available languages specified.');

    language = fallback_language;

  }
  else {

    if ( available_languages.includes( explore.language ) ){ // current language is available

      language = explore.language;

    }
    else {

      language = fallback_language;

    }

  }

  return language;

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

async function fetchLabel( list, lang ){

  let obj = {};
  let qlist = '';

  //console.log( list );

  $.each( list, function (j, item ) {

    if (  j < 49 ){

      qlist += item + '|';

    }
    else {
      // skip label, as we are over the query-limit
    }

  });

  qlist = qlist.slice(0, -1); // remove last "|"

  // note API limit of 50!
  let url = 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + qlist + '&format=json&languages=' + lang + '|en&props=labels';

  //console.log( url );

  let result = '';

  try {

    result = await $.ajax({
        url: url,
        type: 'GET',
        jsonp: "callback",
        dataType: "jsonp",
        //data: args
    });

    return result;

  }
  catch ( error ) {

    console.error( error );

  }

}

function removebracesTitle( title ){ // remove anything in braces

  title = title.replace(/ *\([^)]*\) */g, "").replace(/\//g, ' ').trim();

  return title;

}

function minimizeTitle( title ){

  if ( valid( [ explore.lang_catre1, explore.lang_bookre, explore.lang_porre1 ] )){

  	title = title.replace(/[()]/g, '').replace(/\//g, ' ').replace( explore.lang_catre1 , '').replace( explore.lang_bookre , '').replace( explore.lang_porre1, '').replace(/disambiguation/, '');

	}

  return title;

}

function quoteTitle( title ){

  if ( valid( [ explore.lang_catre1, explore.lang_bookre, explore.lang_porre1 ] )){

    // used for correctly-quoted searches
    title = title.replace(/\//g, ' ').replace( explore.lang_catre1 , '').replace( explore.lang_bookre , '').replace( explore.lang_porre1, '');

  }

  if ( ! title.includes('(') ){ // no-start-parens in title --> assume no parens

    title = '"' + title + '"';

  }
  else if ( title.startsWith('(') ){ // (foo)-bar baz -> "foo-bar baz"

    title = '"' + title.replace(/ *\([^)]*\) */g, '') + '"';

  }
  else { // foo bar (baz) -> "foo bar" baz

    title = '"' + title.replace(/ *\(/, '" ').replace(/[()]/g, '');

  }

  // FIXME: this should be handle correctly for all languages
  title = title.replace(/disambiguation/, '');

  return title;

}

function getSearchTerm(){

  const searchterm = $('#srsearch').val();

  return searchterm;

}

function getBoundingBox(lon, lat, delta){

  return `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;

}

function createSingleImageIIIF( title, image_url ){

  let url			= '';
  let coll		= { "images": [ ]};
  let label		= encodeURIComponent( title );
  let author  = '';
  let desc    = '';

  let img = explore.base + '/app/cors/raw/?url=https://commons.m.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent( image_url ) + '?width=5000px';

  coll.images.push( [ img, label, desc, author, 'wikiCommons' ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

  if ( coll.images.length > 0 ){

    let iiif_manifest_link = explore.base + '/app/response/iiif-manifest?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

    let iiif_viewer_url = explore.base + '/app/iiif/#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

    return JSON.stringify( encodeURIComponent( iiif_viewer_url ) );

  }

}

function getTimeSpaceURL( item ){

	// not bullet-proof, but we need some 'relevance'-filters before showing the timspace-button (as most events don't have the required data to show a timeline)
	if (  valid( item.category ) || ( valid( item.followed_by ) || valid( item.part_of ) || valid( item.has_parts ) || valid( item.list_of ) ) ){

		let used_qid = item.qid;

		if ( !valid( item.category ) && valid( item.part_of ) ){ // this is a fallible escape-hatch for using an alternative qid

			if ( Array.isArray( item.part_of ) ){

				used_qid = item.part_of[0];

			}
			else {

				used_qid = item.part_of;

			}

		}

		let limited_types = [
			'3186692', '577', '578', '39911', '36507', // year, decade, century, milennium, 

			// TODO: how to better handle these:
			'27020041', '82414', '159821', // sports events
		];

		let limited = 'false';

		if ( limited_types.includes( item.instance_qid ) ) { 

			limited = 'true';
		}

		return `${explore.base}/app/timespace/?q=${used_qid}&l=${explore.language}&highlight=${item.qid}&limited=${limited}`;

	}

}

function cleanText( text ){

  // should single-quotes still be allowed?
  return text.replace(/(\r\n|\n|\r|'|"|`|\(|\)|\[|\])/gm, '');

}


function getTutor( item ){

  let tutor = valid( explore.tutor )? explore.tutor : 'default'; // initial tutor

  if ( tutor === 'auto-select' ){

    // 2nd-level tags
    if ( checkTag( item, 1, ['religion' ] ) ){ tutor = 'theologian'; }
    else if ( checkTag( item, 1, ['mathematics' ] ) ){ tutor = 'mathematician'; }
    else if ( checkTag( item, 1, ['painter','sculptor','musician','composer','musician','music-group','filmmaker','architect' ] ) ){ tutor = 'art-historian'; }
    else if ( checkTag( item, 1, ['protein','chromosome','gene','anatomy' ] ) ){ tutor = 'scientist'; }

    // 1st-level tags
    else if ( checkTag( item, 0, ['location', 'organization', 'group', 'cultural-concept', 'natural-type', 'natural-concept' ] ) ){ tutor = 'professor'; }
    else if ( checkTag( item, 0, ['time' ] ) ){ tutor = 'historian'; }
    else if ( checkTag( item, 0, ['organism', ] ) ){ tutor = 'biologist';}
    else if ( checkTag( item, 0, ['substance', ] ) ){ tutor = 'chemist';}
    else if ( checkTag( item, 0, ['meta-concept', ] ) ){ tutor = 'philosopher';}
    else if ( checkTag( item, 0, ['person' ] ) ){ tutor = 'historian'; }
    else if ( checkTag( item, 0, ['work' ] ) ){ tutor = 'art-history'; }

    //auto-select, examinator, default, teacher, historian, scientist, philosopher, mathematician, chemist, economist, politician, art-historian, artist, travel-guide, statistician, nutritionist, psychologist, legislator, theologian, poet, storyteller, biologist, doctor, investor, lifecoach, entrepreneur, farmer, ecologist, military-expert, financial-expert, engineer, professor, demographer, social-scientist, linguist

  }

  return tutor;

}

function getDatingHTML( item, args ){

  let start_date        = '';
  let end_date          = '';
  let pointintime       = '';
  let dating            = '';

  let date_obj          = {};

  // derives from start/end years and can be used to filter output-renderings
  date_obj.filter_year_start  = new Date().getFullYear();
  date_obj.filter_year_end    = new Date().getFullYear();

  // DATES
  if ( valid( item.start_date ) ){

    //console.log( item.start_date, typeof item.start_date );

    start_date = String( item.start_date );

  }
  else if ( valid( item.date_inception ) ){

    start_date = String( item.date_inception );

  }

  if ( valid( item.end_date) ){

    end_date = String( item.end_date );

  }
  else { // check any other possible end-date types

    if ( valid( item.dissolved_date ) ){

      end_date = String( item.dissolved_date );

    }

  }

  // TODO: could we code this n-to-1 pointintime login in de fields file?
  if ( valid( item.date_pointintime ) ){

    pointintime = String( item.date_pointintime );

  }

  if ( pointintime === '' ){

    if ( valid( item.date_release ) ){

      pointintime = String( item.date_release );

    }

  }

  const dash = ( explore.language_direction === 'rtl' ) ? '&#10510;' : '&#10511'; // '&#10143;';

  if ( start_date !== '' && end_date !== '' ){ // case 1) start & end date

    const start = new Date( start_date );
    const end   = new Date( end_date );

    date_obj.filter_year_start = start.getFullYear();
    date_obj.filter_year_end   = end.getFullYear();

    dating = '<a href="javascript:void(0)" ' + setOnClick( Object.assign({}, args, { title: start.getFullYear().toString(), type: 'string', qid: ''  } ) ) + '>' + start.getFullYear() + '</a>' + dash +
             '<a href="javascript:void(0)" ' + setOnClick( Object.assign({}, args, { title: end.getFullYear().toString(), type: 'string', qid: '' } ) ) + '>' + end.getFullYear() + '</a>';

    if ( isNaN( start.getFullYear() ) && isNaN( end.getFullYear() ) ){ // probably a complex date string, so just use the original strings

      let s = Math.round( parseInt( item.start_date.split('-01')[0] ) / 1000000 ).toString();
      let e = Math.round( parseInt( item.end_date.split('-01')[0] ) / 1000000 ).toString();

      //let ancient_format = wNumb({ thousand: ',', }); // TODO: use numbro instead?
      dating = s + ' mil.' + dash + e + ' mil.';

    }


  }
  else if ( start_date !== '' ){ // case 2) only start date

    const start = new Date( start_date );

    date_obj.filter_year_start = start.getFullYear();

    if ( ! isNaN( start.getFullYear() ) ){ // check to prevent very ancient dates to give a NaN result

      dating = '<a href="javascript:void(0)" ' + setOnClick( Object.assign({}, args, { title: start.getFullYear().toString(), type: 'string' } ) ) + '>' + start.getFullYear() + '</a>' + dash;

    }
    else { // probably a complex date string, so just use the original string

      let s = Math.round( parseInt( start_date.toString().split('-01')[0] ) / 1000000 );
      dating = s + ' mil.' + dash;

    }

  }
  else if ( end_date !== '' ){ // case 3: only end date

    const end   = new Date( end_date );
    dating = dash + '<a href="javascript:void(0)" ' + setOnClick( Object.assign({}, args, { title: end.getFullYear().toString(), type: 'string' } ) ) + '>' + end.getFullYear() + '</a>';

  }

  if ( dating === '' ){ // no dating set yet

    if ( pointintime !== '' ){

      const date = new Date( pointintime );

      date_obj.filter_year_start = date.getFullYear();

      if ( ! isNaN( date.getFullYear() ) ){ // check to prevent very ancient dates to give a NaN result

        dating = '<a href="javascript:void(0)" ' + setOnClick( Object.assign({}, args, { title: date.getFullYear().toString(), type: 'string' } ) ) + '>' + date.getFullYear() + '</a>';

      }
    }

  }

  if ( dating !== '' ){ // if any dating was set, style it.
    dating = ' <span class="headline-dating" title="dating" class="nowrap">' + dating + '</span> ';
  }

  //console.log( 'dating: ', dating, start_date, end_date);

  date_obj.dating = dating;

  return date_obj;

}

function getLocation( callback ){

  const options = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000
  };

  if ( navigator.geolocation ) {


    if ( !valid( explore.position_watch_id ) ){

      explore.position_watch_id = navigator.geolocation.watchPosition( setPosition, errorPosition, options);

    }

    if ( typeof callback == 'function' ){

      const myTimeout = setTimeout( runLocationCallback(callback), 2000 );

    }

  }
  else {

    $.toast({
        heading: 'Geolocation is not supported by this browser.',
        text: '',
        hideAfter : 3000,
        stack : 1,
        showHideTransition: 'slide',
        icon: 'info'
    })

  }

}

function runLocationCallback( callback ){

  if ( valid( explore.position?.coords?.latitude ) ){

    //console.log( 'calling position callback...: ', explore.position.GeolocationCoordinates  );
    callback();

  }
  else {

    $.toast({
        heading: 'Geolocation data not yet available, wait a few seconds and try again.',
        text: '',
        hideAfter : 3000,
        stack : 1,
        showHideTransition: 'slide',
        icon: 'info'
    })

  }

}

function setPosition( pos ){

  //console.log( pos.coords.latitude, pos.coords.longitude );

  explore.position = pos;

}

function errorPosition( pos ) {

  $.toast({
      heading: 'Geolocation error. Is geolocation access permitted?',
      text: '',
      hideAfter : 3000,
      stack : 1,
      showHideTransition: 'slide',
      icon: 'error'
  })

  //explore.position_watch_id = undefined;

}

function initialIsCapital( word ){

  return word[0] !== word[0].toLowerCase();

}


function isEmbedded(){

  return (window !== top);

}

/*
function objectToString(obj){

	let str = '{';

	if ( typeof obj == 'object' ){

		for ( let p in obj){

			if ( obj.hasOwnProperty(p) ){

				str += p + ':' + objectToString (obj[p]) + ',';

			}
		}

	}
	else {

	 if ( typeof obj == 'string' ){
			return '"'+obj+'"';
		}
		else {
			return obj+'';
		}

	}

	return str.substring(0,str.length-1)+"}";

}
*/

/*
function fixCountryData(){

  let objects = findObjectByKey( Object.values(countries), 'check', true);
  let list = objects.map(e => e.chamber1);


  Object.values( parls ).forEach( (( p ) => {

    Object.keys( countries ).forEach( (( qid ) => {

      if ( p.c === qid ){ // matching country

        console.log( p.c );

        if ( countries[ qid ].hasOwnProperty( 'chamber_1' ) ){

          countries[ qid ].chamber1 = p.p;

        }

      }

    }))

  }))

  console.log( countries );

  ----------------------------

  Object.keys( old ).forEach( (( l ) => {

    Object.keys( countries ).forEach( (( qid ) => {

      if ( l === qid ){ // matching country

        if ( ! countries[ qid ].hasOwnProperty( 'chamber1' ) ){

          // work on this country data, if possible

          if ( old[ qid ].hasOwnProperty( 'legislative_chamber_1' ) ){

            countries[ qid ].chamber1         = old[ qid ].legislative_chamber_1;
            countries[ qid ].chamber1_members = old[ qid ].legislative_chamber_1;
            countries[ qid ].check = true;

          }
          else if ( old[ qid ].hasOwnProperty( 'legislative_chamber_2' ) ){

            countries[ qid ].chamber2         = old[ qid ].legislative_chamber_2;
            countries[ qid ].chamber2_members = old[ qid ].legislative_chamber_2;
            countries[ qid ].check = true;

          }
          else if ( old[ qid ].hasOwnProperty( 'legislative_chamber_3' ) ){

            countries[ qid ].chamber3         = old[ qid ].legislative_chamber_3;
            countries[ qid ].chamber3_members = old[ qid ].legislative_chamber_3;
            countries[ qid ].check = true;
          
          }

        }

      }

    }))

  }))

  console.log( countries );

  ----------------------------

  // remove incorrect fields first
  Object.values( legislatures ).forEach( (( l ) => {

    Object.keys( countries ).forEach( (( qid ) => {

      if ( l.country === qid && countries[ qid ].hasOwnProperty( 'check' ) ){ // matching check country

        if ( countries[ qid ].hasOwnProperty( 'chamber1' ) ){ delete countries[ qid ].chamber1; }
        if ( countries[ qid ].hasOwnProperty( 'chamber1_members' ) ){ delete countries[ qid ].chamber1_members; }
        if ( countries[ qid ].hasOwnProperty( 'chamber2' ) ){ delete countries[ qid ].chamber2; }
        if ( countries[ qid ].hasOwnProperty( 'chamber2_members' ) ){ delete countries[ qid ].chamber2_members; }

      }

    }))

  }))


  // update fields
  Object.values( legislatures ).forEach( (( l ) => {

    Object.keys( countries ).forEach( (( qid ) => {

      if ( l.country === qid && countries[ qid ].hasOwnProperty( 'check' ) ){ // matching check country

        if ( l.role === 'Q637846' ){ // upper chamber
          countries[ qid ].chamber1 = l.chamber;
          countries[ qid ].chamber1_members = l.members;
        }
        else if ( l.role === 'Q375928' ){ // lower chamber
          countries[ qid ].chamber2 = l.chamber;
          countries[ qid ].chamber2_members = l.members;
        }
        else { // no role indicated

          if ( countries[ qid ].hasOwnProperty( 'chamber1' ) ){

            if ( countries[ qid ].hasOwnProperty( 'chamber2' ) ){

              if ( countries[ qid ].hasOwnProperty( 'chamber3' ) ){

                // do nothing, we are done

              }
              else {
                countries[ qid ].chamber3 = l.chamber;
                countries[ qid ].chamber3_members = l.members;
              }

            }
            else {
              countries[ qid ].chamber2 = l.chamber;
              countries[ qid ].chamber2_members = l.members;
            }
          }
          else {
            countries[ qid ].chamber1 = l.chamber;
            countries[ qid ].chamber1_members = l.members;
          }

        }
      }

    }))

  }))

  console.log( countries );


  if ( countries[ qid ].hasOwnProperty( 'chamber1' ) ){

    if ( countries[ qid ].hasOwnProperty( 'chamber2' ) ){

      if ( countries[ qid ].hasOwnProperty( 'chamber3' ) ){

        // do nothing, we are done

      }
      else { countries[ qid ].chamber3 = data.chambers; }

    }
    else { countries[ qid ].chamber2 = data.chambers; }

  }
  else { countries[ qid ].chamber1 = data.chambers; }



  Object.values( l1 ).forEach( (( data ) => {

    Object.keys( countries ).forEach( (( qid ) => {

      if ( data.country === qid ){

        countries[ qid ].l1 = data.item;

      }

    }))

  }))

  Object.values( l2 ).forEach( (( data ) => {

    Object.keys( countries ).forEach( (( qid ) => {

      if ( data.country === qid ){

        countries[ qid ].l2 = data.item;

      }

    }))

  }))

  Object.values( l3 ).forEach( (( data ) => {

    Object.keys( countries ).forEach( (( qid ) => {

      if ( data.country === qid ){

        countries[ qid ].l3 = data.item;

      }

    }))

  }))

  console.log( countries );

}
*/
