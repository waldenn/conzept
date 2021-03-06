// © Copyright 2020-2021, J. Poulsen. All Rights Reserved.
"use strict";

let hash = '';

let isMobile                      = detectMobile();
let isSafari                      = detectSafari();

let nr_of_sections                = 0;

let image_width_string            = '/900px-';
let min_image_width_for_enlarge   = 60;
let min_image_height_for_enlarge  = 60; // 40?

if ( window.location.hash ) {
  // do nothing, fragment exists
} 
else {

	// TODO: also set parent-window hash?
	window.location.hash = '#_';

}

//console.log('window.location.hash: ', window.location.hash );

$( document ).ready(function() {

  if ( isMobile ){

    image_width_string = '/500px-';

  }
  else if ( $('img').length > 100 ){ // for articles with many images: lazy load them as smaller images

    image_width_string = '/400px-';
      
  }

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

  // allow any left-click to close the ULS-window in the sidebar
  $(document).click(function(e) {

    parentref.postMessage({ event_id: 'uls-close', data: { } }, '*' );

  });

  let image_modal_bg_color = '#fbfaf9';

  if ( typeof fontsize !== 'undefined' ){
    $('body').css('font-size', fontsize + 'px'); 
  }

  // cleanup wikipedia html

  $('.mw-empty-elt').remove();
  $('.mw-editsection-divider').remove();

  // TODO: research how important showing the Ambox is, see also: https://en.wikipedia.org/wiki/Template:Ambox
  $('table.ambox').remove();
  $('table.stub').remove();

  // remove video-play text-link
  $('.play-btn-large').remove();

  //$('.haudio').remove(); // TODO: example: https://conze.pt/explore/Friedrich%20Nietzsche

  //  prepare MIDI-elements
  $( "a.internal[title$='.mid']" ).addClass('midi');

  // TODO: these needs further styling improvements:
  $('.noprint').not('.noprint.navbox').not('[role="presentation"]').remove();
  $('.mbox-small.noprint[role="presentation"]').addClass('media-block');

  $('.mw-authority-control').remove();
  $('img.noviewer').parent().remove();

  $('.plainlinks').remove();  // TODO: verify this can always be removed!
  $('div.hatnote:empty').remove();

  $('.hatnote a').each(function(){ $(this).addClass('main_template_info'); });

  //$('table.sidebar').addClass('infobox'); // check "sidebar"-naming for other language-wikis

  // set the hatnote-style (for other languages than english)
  // TODO: design better multi-lingual hatnote-styling support
  if ( language === 'fr' ){
    $('.bandeau-cell a').each(function(){ $(this).addClass('main_template_info'); });
  }
  else if ( language === 'de' ){
    $('.hauptartikel a').each(function(){ $(this).addClass('main_template_info'); });
  }
  else if ( language === 'nl' ){
    $('div[role="note"] a').each(function(){ $(this).addClass('main_template_info'); });
  }

  $('.mbox-small.plainlinks.sistersitebox').remove();
  $('.metadata.mbox-small').remove(); // could be kept if styled better, example: https://conze.pt/explore/Wikidata?l=en&t=link&s=true&u=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FWikidata

  $('table.infoboks').addClass('infobox'); // Norway wikipedia
  $('table.sinottico').addClass('infobox'); // ?
  $('table.vertical-navbox').addClass('infobox'); // ?

  if ( ! isMobile ){
    $('div#toc').remove();
  }

  $('.tocright').remove();

  $('img.thumbimage').not('.mwe-math-fallback-image-inline').not('.noviewer').not('.gallery-image').not('.no-enlarge').each(function( index ){

    $(this).unwrap(); // unwrap: <a href="/wiki/File:Bulgaria_6200BC_neolithic_Chavdar_culture.jpg" class="image">

  });

  // clean article headers
  $('h1,h2,h3,h4,h5,h6').each(function(){

    $(this).find('a').remove();

    let h = $(this).text();
    h = h.replace('[', ' ');
    h = h.replace(']', ' '); // FIXME: why cant this be empty?

    $(this).text( h );

  });

  // end of cleanup

	setupKeys();

  setupToc();

  if ( explore.language_direction === 'rtl' ){

    $( 'body' ).css( 'direction', 'rtl', 'important' );

    //$( 'main' ).css( 'direction', 'rtl', 'important' );
    //$( 'aside' ).css(  'direction', 'rtl', 'important' );

  }

  setupArticleImages();

  setupLinks();

  setupAudiomassLinks();

  setupClicks();

  // insert section IDs: TODO move this to its own function
  $('p').not('table p').each(function( index ){

    $(this).addClass('sid');
    $(this).attr("id", index );

  });

  //setupMIDI(); // enable again when "html-midi.js" can ONLY be loaded on desktop-devices

  setupImageClicks();

  setupAudioClicks();

  setupImageZoom();

	setupULS();

  // wrap reference-lists in a <detail> element
  $('div.reflist').wrap('<details class="reflist-block"></details>');
  $('details.reflist-block').prepend('<summary title="show / hide references"><i class="far fa-folder-open"></i></summary>');

  // wrap navboxes in a <detail> element
  $('.navbox').wrap('<details class="navbox-block"></details>');
  $('details.navbox-block').prepend('<summary title="show / hide navbox"><i class="far fa-folder-open"></i> navbox</summary>');

  // all done now, show the content
  $('main.explore').css({ 'visibility' : 'visible' });

  if ( !isMobile ){

    // go to initial URL hash
    location.hash = "#" + explore.hash; // NOTE: this breaks the mobile layout!

  };

  addSectionTTS(); // add section TTS play buttons

  if ( explore.autospeak ){ // speak article

    //console.log('autospeaking');
    startSpeaking();

  }

  // send message to main-app that the page has been rendered
  parentref.postMessage({ event_id: 'page-rendered', data: { } }, '*' );

});

function setupLinks(){

  $('a.external').each(function( index ){

    $(this).addClass('link');

  });

  // register links
  $('a').not('a.link.external').not('a.link.internal').each(function( index ){

    let link = $(this).attr('href') || '';
    let title_ = $(this).attr('href') || '';

    if ( link.startsWith( explore.base + '/explore/') ){ // wikipedia link

      $(this).addClass('link');
      $(this).attr('href', link.replace('/explore/', '') );

    	title_ = title_.replace('/explore/', '');

    }
    else if ( link.startsWith('#') ){ // internal link

      $(this).addClass('internal hash');

    	title_ = ''; // FIXME use title + hash to open in new tab

    }
    else if ( link.startsWith('/w/index.php?title=') || link.endsWith('redlink=1') ){ // missing link

      $(this).addClass('missing-link');

      let href = 'https://' + language + '.wikipedia.org' + $(this).attr('href');
      $(this).attr('href', href );

    	title_ = ''; // FIXME: link to wikipedia

    }

		// handle middle-mouse-click
		if ( title_ !== '' ){

			const args = {
        type      : 'wikipedia',
        title     : title_,
        language  : language,
      };

			let onauxclick = 'onMiddleClick( "' + encodeURIComponent( JSON.stringify( args ) ) + '" )';

			$(this).attr('onauxclick', onauxclick );

		}

  });

  // external links that can not be safely loaded in the iframe
  $('a.link.external').attr("target","_blank");
  $('a.external').attr("target","_blank"); // TODO: this line can be removed.
  $('a.missing-link').attr("target","_blank");

  // setup preview on links
  if ( explore.linkpreview === true || explore.linkpreview === 'true' ){

    // see: https://github.com/wikimedia/wikipedia-preview
    wikipediaPreview.init({

      root: document.querySelector('main'),
      selector: 'a.link', // TODO, specify this more precise (only wikipedia links!)
      //popupContainer: '.popup-container',
      lang: language,

    });

  }

}

function setupClicks(){

  // external links that can safely loaded in the iframe
	$('a.link.framed').on("click", function (e) {
		e.preventDefault();
    window.open( $(this).attr('href'), '_blank'); // TODO change to "_self" when back-forward-movement works
	});

  // internal explore link
	$('a.link.explore').on("click", function (e) {

		e.preventDefault();
    //console.log('001: ', title, language, hash );  

    parentref.postMessage({ event_id: 'show-loader', data: { } }, '*' );
    parentref.postMessage({ event_id: 'handleClick', data: { type: 'explore', title: title, hash: hash, language: language, } }, '*' );

	});

  // wikipedia links
  $('a.link').not('a.link.external').not('a.link.internal').not('a.link.framed').not('a.link.explore').not('a.link.random').on("click", function (e) {

		e.preventDefault();

    hash = $(this).attr('href').split('#')[1] || '';

		title =  $(this).attr('href').split('#')[0].replace(/_/g, ' ');
		title =  title.replace(/\.\/|_|<i>|<\/i>|<b>|<\/b>/g, '');

    if ( explore.embedded ){

      location.href = explore.base + '/app/wikipedia/?t=' + encodeURIComponent( title ) + '&l=' + language;

    }
		else if ( explore.keyboard_ctrl_pressed ){ // click with CTRL-key -> open link in new tab

			explore.keyboard_ctrl_pressed = false;

			//const open_in_new_tab_code = e.target.getAttribute("onauxclick");
      //console.log( open_in_new_tab_code );
			//if ( valid( open_in_new_tab_code ) ){
        //console.log( 'valid code');

        const url = explore.base + '/explore/' + encodeURIComponent( title ) + '?l=' + language;

        openInNewTab( url );

				//eval( open_in_new_tab_code );

			//}

			return 0;

		}
    else {

      parentref.postMessage({ event_id: 'show-loader', data: { } }, '*' );
      parentref.postMessage({ event_id: 'handleClick', data: { type: 'wikipedia', title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

    }

    hash = ''; // reset hash

	});


  // handle "#foobar" internal links
  window.onhashchange = locationHashChanged;

}

function locationHashChanged() {

  // ugly... but we assume we need to see the references
  if ( window.location.hash.startsWith('#cite') ){

    $('details.reflist-block').attr('open', '');

	  $( window.location.hash )[0].scrollIntoView();

  }

}

function setupArticleImages(){

  if ( $('title').text().startsWith('Portal:') || $('title').text().startsWith('Book:') ){
    // do nothing
  }
  else { // wiki-text page

		// fix "kartographer-map"-URLs (else we get a 403 "access-forbidden" error-code for these URLs)
		$('a.mw-kartographer-map img').each(function( index ){

			// replace the used URLs with a CORS-enabled one
			const url = explore.base + '/app/cors/raw/?url=' + encodeURIComponent( $(this).attr('src') );

      $(this).attr('src', url );
      $(this).attr('srcset', url + ' 2x');

		});

    // CASE 1: handle thumbnail media
    $('img.thumbimage').not('.mwe-math-fallback-image-inline').not('.noviewer').not('.gallery-image').not('.no-enlarge').each(function( index ){

      $(this).unwrap().unwrap();

      $(this).removeAttr( 'width' ).removeAttr( 'height' );

      let caption = '';
      let caption_plaintext = '';

      if ( $('title').text().startsWith('Portal:') || $('title').text().startsWith('Book:') ){
        // do nothing
      }
      else {

        let el = $(this).next();

        if ( el.attr('class') ===  'thumbcaption' ) {

          el.find('.magnify').remove();
          caption = el.html();
          caption_plaintext = el.text().replace(/"/g, '&quot;');

          el.remove();

        }

      }

      // image-URL
      let src = $(this)[0].src.replace(/wikipedia.org\//, language + '.wikipedia.org/') || ''; // TODO: could this be wikicommons too?

      let file_url = src.split('?')[0].trim();

			if ( file_url.endsWith('.ogv.jpg') || file_url.endsWith('.webm.jpg') ){ // render as video

        let thumb = file_url;

        file_url = $(this).next('a')[0].href;
        $(this).next('a').remove();

        if ( $(this).next().hasClass('thumbcaption') ){

          caption = $(this).next().html();
          $(this).next().remove();

        }

        let video_caption = '';

        if ( caption !== '' ){
          video_caption = '<figcaption>' + caption + '</figcaption>';
        }

        $(this).unwrap().unwrap().replaceWith( '<figure style="max-width:100% !important;"><video class="inline-video" width="100% !important" poster="' + thumb + '" controls><source src="' + file_url + '"></video>' + video_caption + '</figure>' );

      }
			else if ( file_url.endsWith('.stl.png') ){ // render as 3D model

        let thumb = src.replace( /\/\d+px\-/g, image_width_string );

        src = src.replace( /.*\/\d+px\-/g, '').replace( /\.stl\.png$/g, '.glb')
        let model_url = '../explore2/assets/models/glb/draco/' + src; 
        let model_name = src.replace( /_/g, ' ' ).replace( /\.glb$/g, '' ); 
        let model_id = 'model-' + guidGenerator();
        //let environment-image = 'environment-image="https://conze.pt/app/explore2/assets/images/skybox/aircraft_workshop_01_1k.hdr;
        //let skybox = '';
        //let skybox = '" skybox-image="https://conze.pt/app/explore2/assets/images/skybox/adams_place_bridge_2k.hdr" '; // see also: https://hdrihaven.com

        // remove parent 'thumb'-class for a better layout
        if ( $(this).parent().hasClass('thumb') ){

          $(this).parent().removeClass('thumb');

        }

        let model_html = '<model-viewer id="' + model_id + '" class="model-view" title="' + model_name + '" data-name="' + model_name + '" src="' + model_url + '" environment-image="../explore2/assets/images/skybox/aircraft_workshop_01_1k.hdr" exposure="0.64" shadow-intensity="0" shadow-softness="0" ar ar-modes="scene-viewer quick-look" camera-controls loading="lazy" poster="' + thumb + '" ><button class="model-view-button" id="model-view-ar-button" title="AR button" slot="ar-button">AR</button><button title="fullscreen toggle" class="model-view-button" id="model-view-fullscreen-button" onclick="screenfull.toggle(document.getElementById(&quot;' + model_id + '&quot;))"><i class="fas fa-expand"></i></button><div class="model-title">' + caption_plaintext + '</div></model-viewer>'; 

        $(this)[0].src = src;
        let img_html = $(this).html();

        $(this)
          .wrap( '<figure class="model-media"></figure>' )
          .wrap( model_html );

      }
      else { // render as image

        src = src.replace( /\/\d+px\-/g, image_width_string );

        $(this)[0].src = src;
        let img_html = $(this).html();

        $(this)
          .wrap( '<figure class="non-thumb-media"></figure>' )
          .after('</span> <figcaption>' + caption + '</figcaption>')
          //.after('<span class="copyright"><a id="image-source" title="source" aria-label="source" target="_blank" href="' + src + '"><i class="far fa-copyright fa-2x"></i></a></span> <figcaption>' + caption + '</figcaption>')
          .wrap('<a href="' + src + '" class="elem" data-lcl-txt="' + caption_plaintext + '" data-articulate-ignore="" tabindex="0"></a>');

      }

    });

    // CASE 2: handle non-thumbnail media
    $('img').not('img.thumbimage').not('.mwe-math-fallback-image-inline').not('.noviewer').not('.gallery-image').not('.no-enlarge').each(function( index ){

      let caption = '';
      let caption_plaintext = '';

      let src = $(this)[0].src.replace(/wikipedia.org\//, language + '.wikipedia.org/') || ''; // TODO: could this be wikicommons too?

      let file_url = src.split('?')[0].trim();

      // check if we need to unwrap the media
      if ( ! $(this).parent().is( 'a' ) ){ // not a linked image

			  if ( file_url.endsWith('.ogv.jpg') || file_url.endsWith('.webm.jpg') ){ // render as video
          // do nothing
        }
        else { // non-linked image-media: don't unwrap these!

          // TODO: research what these other images are (icons, etc.) and determine how to handle them best.
          //console.log( 'not unwraping this image: ', $(this)[0].src, $(this).parent() );

          return 1;

        }

      }

      // FIXME: exclude "unwrapping" some images on this page: https://conze.pt/explore/Octagrammic%20prism?l=en&t=wikipedia&s=true
      $(this).unwrap();

			if ( file_url.endsWith('.ogv.jpg') || file_url.endsWith('.webm.jpg') ){ // render as video

        let thumb = file_url;

        file_url = $(this).next('a')[0].href;
        $(this).next('a').remove();

        if ( $(this).next().hasClass('thumbcaption') ){

          caption = $(this).next().html();
          $(this).next().remove();

        }

        let video_caption = '';

        if ( caption !== '' ){
          video_caption = '<figcaption>' + caption + '</figcaption>';
        }

        $(this).unwrap().unwrap().replaceWith( '<figure style="max-width:100% !important;"><video class="inline-video" width="100% !important" poster="' + thumb + '" controls><source src="' + file_url + '"></video>' + video_caption + '</figure>' );

      }
      else { // render as image

        let figstyle = '';

        // skip icons
        if (  $(this).attr('width') < min_image_width_for_enlarge ||
              $(this).attr('height') < min_image_height_for_enlarge
          ){

          $(this).removeClass('enlargable');

          return 0;

        }

        if( $(this).hasClass( 'thumbborder' ) ){
          figstyle = 'width: initial;';
        }

        src = src.replace( /\/\d+px\-/g, image_width_string );

        $(this).wrap('<a href="' + src + '" class="elem" data-lcl-txt="' + caption_plaintext + '" data-articulate-ignore=""></a>').wrap( '<figure style="' + figstyle + '"></figure>' );

      }

    });

  }

  // remove extra parent-image-element around figure-element
  if ( $('title').text().startsWith('Portal:') || $('title').text().startsWith('Book:') ){
    $('a.image figure').unwrap();
  }

  // style exception: correct clade-leaf figure + img styling
  $('.clade-leaf figure').each(function( index ){

    $(this).css( {

      'max-width': 'none',
      'width': 'auto',
      'float': 'none',
      'margin': '1em 0em 0em 1em',
      'clear': 'none',
      'padding-left': 'initial',
      'position': 'relative',

    });

  });

  $('.clade-leaf img').each(function( index ){

    $(this).css( {

      'width': 'auto',
      'float': 'none',

    });

  });


  // for each gallery-image: also add the caption to the image-element
  $('li.gallerybox').each(function( index ){

    // get caption-text
    const caption = $(this).find('.gallerytext').text() || '';

    // add it to the image-element
    $(this).find('a.elem').attr('data-lcl-txt', caption );

  });

  // image-map fix
  $('div.locmap').each(function( index ){

 		// move all map-markers into the figure-element
		$( $(this).find('div.od') ).appendTo( $(this).find('figure') );

  });
 
}

function setupToc(){

  $('h1,h2,h3,h4,h5,h6').each(function(){

    const head = $(this).text();

    // remove some sections
    if ( head.startsWith('Book:') ){
      $(this).parent().remove();
      return true;
    }

    let heading = $(this).text().replace(/[ %{}|^~\[\]()"'+<>%'&\.\/?:@;=,]/g, '_').replace(/^.+_svg_/, '').toLowerCase();

    $(this).attr('id', heading );

  });

  if ( isMobile ){ 

    // make sections collapsable
    // see also: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_collapsible

    // wrap the parent-element of each found h1, h2 and h3 in a collapsable-title-button (but skip first h1?)
    //$('h1:not(:first),h2,h3').each(function(){

      // TODO
      //$(this).wrap('<button type="button" class="collapsible"></button>');

      //$(this).nextAll().wrapAll( '<div class="collapsable-content"></div>');
      // see also:
      //  https://api.jquery.com/siblings/
      //  https://api.jquery.com/nextAll/

    //});

    // add interactivity
    /*
    const coll = document.getElementsByClassName("collapsible-content");

    for ( let i = 0; i < coll.length; i++ ) {

      coll[i].addEventListener("click", function() {

        this.classList.toggle("active");

        var content = this.nextElementSibling;

        if (content.style.display === "block") {
          content.style.display = "none";
        }
        else {
          content.style.display = "block";
        }

      });

    }
    */

  }
  else{ // desktop sidebar ToC

    // tocbot API:
    //   http://tscanlin.github.io/tocbot/
    //   https://github.com/tscanlin/tocbot/

    tocbot.init({
      tocSelector: '.js-toc',
      contentSelector: '.js-toc-content',
      headingSelector: 'h2, h3, h4, h5, h6',
      //headingSelector: 'h1, h2, h3, h4, h5, h6',
      ignoreSelector: '#notes',
      //headingsOffset: 1,
      onClick: clickedToc,
      //scrollEndCallback: function (e) { },
      collapseDepth: 1,
      scrollSmooth: false, // don't enable!!
      //scrollSmoothDuration: 420,
      orderedList: true,
      // onclick function to apply to all links in toc. will be called with
      // the event as the first parameter, and this can be used to stop,
      // propagation, prevent default or perform action
      // onClick: false,
      //throttleTimeout: 100,
    });

  }

}

function setupMIDI(){

  $('a.midi').each(function(index, value){

    const midi_url  = $(this).attr('href');
    const midi_id   = 'midi-' + index; // $(this).attr('title');
    $(this).after('<midi-player src="' + midi_url + '"> </midi-player>');

		$(this).hide(); // hide original wikipedia-link

  });

}

function setupImageClicks(){

  $('img')
    .not('.no-enlarge')
    .not('.mwe-math-fallback-image-inline')
    .not('.mwe-math-fallback-image-display')
    .attr('loading', 'lazy')
    .addClass('enlargable');

  // remove the "enlargable"-class from icons in infobox
  // (CSS selectors can't filter attributes numerically!)
  $('img.enlargable').each(function( index ){

    if (  $(this).attr('width') < min_image_width_for_enlarge ||
          $(this).attr('height') < min_image_height_for_enlarge
      ){

      $(this).removeClass('enlargable');

    }

  });

	// see: https://lcweb.it/lc-lightbox/documentation
	const LC = lc_lightbox('.elem', {
		wrap_class: 'lcl_fade_oc',
		gallery : true, 
		thumb_attr: false, // 'data-lcl-thumb', 
    tn_hidden: true,
    thumbs_nav: true,
		download: true,
		skin: 'minimal',
    counter: true,
    touchswipe: true,
		//fullscreen: false,
		//fs_only: true,
    //on_fs_exit: function(){ console.log('close LC'); close_lb(); }
	}); 

}

function setupAudiomassLinks(){

  $('.haudio').each(function( index ){

    // get audio-src link 
    const file_url      = $(this).find('source').first().attr('src'); // FIXME: always use MP3 or ONLY use MP3 for Apple iOS/Mac support.
    const audiomass_url = explore.base + '/app/audio/?url=' + encodeURIComponent( explore.base + '/app/cors/raw/?url=https:' + file_url );

    // set audiomass-link
    $(this).find('a.link').first().attr({ 'href' : audiomass_url, onauxclick : audiomass_url }).addClass('internal');
    
  });

}

function setupAudioClicks(){

  $('.enlargable').each(function( index ){

    let val = $(this).attr('src' ).split('?')[0] || '';

    if ( val.endsWith('.ogg') || val.endsWith('.oga') || val.endsWith('.mp3') || val.endsWith('.wav') ){

      let audio_url = val;

      console.log( 'audio found: ', audio_url );

      let audio_html = '<audio controls><source src="' + audio_url + '"></audio>';

      // replace inner "img" element with audio element
      $(this).replaceWith( audio_html );
    }

  });

}

function setupULS(){ // "Univerdsal Language Switcher" widget

  if ( typeof languages === undefined || typeof languages === 'undefined' || languages === 'undefined' || languages === '' ){
    return 1;
  }

  languages = JSON.parse( decodeURIComponent( languages ) );

  let skip_replace = false;

  if ( typeof languages === 'object' ) {
    // do nothing
  }
  else {
    languages = JSON.parse( decodeURIComponent( languages ) );
    skip_replace = true; // FIXME prevent double-encoding and better detect + signal that the language-list has already been parsed for this article
  }

  let languages_ = {};

  if ( skip_replace ){
    languages_ = languages;
  }
  else {

		// TODO: can we improve this hack?
		if ( getParameterByName('qid') === '' || getParameterByName('qid') === false || getParameterByName('qid') === '-1' ){ // --> use the wikipedia-language structure 

			for ( let [key, value] of Object.entries( languages ) ) {

				languages_[ key ] = value;

			}


		}
		else { // qid-URL --> use the wikidata-language-structure 

			for ( let [key, value] of Object.entries( languages ) ) {

				if ( key.endsWith('wiki') ){ // use only the "wikipedia" links

					key               = key.replace(/wiki$/, '');
					languages_[ key ] = value;

				}

			}

		}

  }

  let title_ = '';

  $( '.uls-trigger' ).uls( {

    onSelect: function( l ) {

      language = l;

      // get matching article-title for that language
      let title_  = languages_[ l ];

      // TODO: also update "explore.lang3"

      if ( explore.embedded ){

        location.href = explore.base + '/app/wikipedia/?t=' + encodeURIComponent( title ) + '&l=' + language;

      }
      else {

			  window.parent.postMessage({ event_id: 'handleClick', data: { type: 'wikipedia', title: title_, hash: hash, language: language, languages: encodeURIComponent( JSON.stringify( languages_ ) ), current_pane: current_pane, target_pane: current_pane } }, '*' );

      }

			hash = ''; // reset hash

    },
    onReady: function( l ) {

			$( "input.uls-filterinput.uls-languagefilter.languagefilter" ).val( 'foo' );

    },
		lazyload: true, // ?

    //quickList: getWikipediaLanguages(),
    //quickList: ['en', 'hi', 'he', 'ml', 'ta', 'fr'],

    languages: languages_,

  });

  $( '.uls-trigger' ).click( function () {

    // ULS style hack: The ULS api should be probably modified to allow optional classes and not force position.
    $( '.uls-menu' )
      .addClass( 'uls-mobile' )
      .css( 'right', '2.5%' );
  });

}

// close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {

  if (!event.target.matches('.dropbtn')) {

    let dropdowns = document.getElementsByClassName("dropdown-content");
    let i;

    for (i = 0; i < dropdowns.length; i++) {

      let openDropdown = dropdowns[i];

      if (openDropdown.classList.contains('show')) {

        openDropdown.classList.remove('show');

      }

    }

  }

}

function clickedToc( event ){

  let id = event.target.getAttribute('href');

  $('html, body').animate({
      scrollTop: $( id ).offset().top + 40 // verify "40" is correct for all devices!
  }, 200);
  
}

function goExplore( newtab ){

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'explore', title: title, hash: hash, language: language } }, '*' );

  }

}

function gotoArticle( newtab ){ // used on Talk-page

  if ( title.startsWith( explore.lang_talk + ':' ) ){ // on a talk page

    // remove Talk: namespace from title
    title = title.replace( explore.lang_talkre, '');

  }

  const url = explore.base + '/app/wikipedia/?t=' + encodeURIComponent( title ) + '&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + '&dir=' + explore.language_direction;

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url , title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function gotoTalkPage( newtab ){

  if ( title.startsWith( explore.lang_talk + ':' ) ){ // already on a talk page

    return 0;

  }

  const url = explore.base + '/app/wikipedia/?t=' + encodeURIComponent( explore.lang_talk + ':' + title ) + '&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + '&dir=' + explore.language_direction;

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url , title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function gotoVideo( newtab ){

  const url = explore.base + '/app/video/#/search/' + title;

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url , title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function gotoImages( newtab ){

  const url = 'https://www.bing.com/images/search?&q=' + title + '&qft=+filterui:photo-photo&FORM=IRFLTR';

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url, title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function gotoBooks( newtab ){

  // FIXME: when the language is changed by the user we should also update "lang3"
  const url = encodeURI( 'https://openlibrary.org/search?q=' + title + '&mode=everything&language=' + explore.lang3 );

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    window.top.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url, title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function gotoBookISBN( newtab, id ){

  //console.log( id );

  const url = encodeURI( 'https://openlibrary.org/search?q=ISBN%3A' + id + '&mode=everything');

  window.top.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url, title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

}

function addToCompare( ){

  if ( qid !== '' ){

    window.top.postMessage({ event_id: 'add-to-compare', data: { type: 'compare', title: title, hash: hash, language: language, qid: qid } }, '*' );

  }

}

function gotoWikipedia( newtab ){

  console.log('gotoWikipedia: ', current_pane );

  const url = encodeURI( 'https://' + language + '.wikipedia.org/wiki/' + title );

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url, title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function detectMobile(){

   return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Mobile/i.test(navigator.userAgent) );

}

function setupKeys(){

  // see:
  //  https://github.com/RobertWHurst/KeyboardJS
  //  https://www.jqueryscript.net/other/jQuery-Plugin-For-Scrolling-Content-with-Arrow-Keys-keyscroll.html

  keyboardJS.bind('alt+y', function(e) {
    window.parent.postMessage({ event_id: 'toggle-sidebar', data: { } }, '*' );
  });

  keyboardJS.bind('alt+i', function(e) {
    window.parent.postMessage({ event_id: 'add-bookmark', data: { } }, '*' );
  });

  /*
	keyboardJS.bind('ctrl', (e) => {
		explore.keyboard_ctrl_pressed = true;
	}, (e) => {
		explore.keyboard_ctrl_pressed = false;
	});

	keyboardJS.bind('ctrl', null, (e) => {
		explore.keyboard_ctrl_pressed = false;
	});
  */

}

function setupImageZoom(){ // using OpenSeaDragon

	// see: https://openseadragon.github.io/docs/
	$('#openseadragon').hide;

	window.viewer = OpenSeadragon({

		id: "openseadragon",

		prefixUrl: explore.base + '/app/explore2/node_modules/openseadragon/build/openseadragon/images/',

		tileSources: {
			type: 'image',
			url:  '../explore2/assets/images/icon_home.png',
			crossOriginPolicy: 'Anonymous',
			ajaxWithCredentials: false,
      //maxZoomLevel: 10,
      //maxZoomPixelRatio: 2,
      //visibilityRatio: 0.2,
		},

    showNavigator:  true,
    navigatorSizeRatio: 0.25,

	});

	window.viewer.world.addHandler('add-item', function(event) {

		let tiledImage = event.item;

		tiledImage.addHandler('fully-loaded-change', fullyLoadedHandler);

    window.viewer.navigator.addTiledImage( {
     tileSource: tiledImage, 
    });

	});

	window.viewer.setVisible(true);

}

function fullyLoadedHandler() {

	$('#loader-openseadragon').hide();

}

function addSectionTTS(){

  // TODO:
  //  - Safari desktop: pause and stop button not working
  //  - Firefox mobile global-speaking button is broken sometimes: figure out which text is causing the breaking and remove it.

  let text = '';

	if ( explore.tts_enabled ){

    $('h2:first').append(

      $('<span class="section-title-button" title="stop speaking" onclick="stopSpeaking()" tabIndex="0"><i class="fas fa-stop"></i></span>&nbsp;' + 
        '<span class="section-title-button" title="pause speaking" onclick="pauseSpeaking()" tabIndex="0"><i class="fas fa-pause"></i></span>' +
        '<span class="section-title-button" title="start speaking from here" onclick="startSpeaking()" tabIndex="0"><i class="fas fa-play"></i></span>' )

    );

		$('.mw-parser-output h2, .mw-parser-output h3, .mw-parser-output h4').each(function(index, value) {
			
			if ( $(this).attr('id') === 'see_also'){
				// do nothing
			}
			else {

				text  = $(this).nextAll('p, h2, h3, h4, h5, h6, ul, li, dl, dd').clone()
						.find( explore.tts_removals ).remove()
						.end().text();

				text = $(this).text() + text;
        text = cleanText( text );

				$(this).append(

					$('<span class="section-title-button" title="stop speaking" onclick="stopSpeaking()" tabIndex="0"><i class="fas fa-stop"></i></span>&nbsp;' + 
            '<span class="section-title-button" title="pause speaking" onclick="pauseSpeaking()" tabIndex="0"><i class="fas fa-pause"></i></span>' +
            '<span class="section-title-button" title="start speaking from here" onclick="startSpeaking( \'' + text + '\' )" tabIndex="0"><i class="fas fa-play"></i></span>')

	      );
		
	    }

    });

    // allow the user to enter-click on the TTS-buttens
    $( '.section-title-button' ).on( 'keyup' , function( event ){

      if ( event.keyCode == 13 ){

        $(this).click();

      }

    });

  }

} 
