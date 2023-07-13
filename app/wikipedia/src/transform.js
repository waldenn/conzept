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
	window.location.hash = '#';

}

/*
// see: https://github.com/viebel/klipse
window.klipse_settings = {
  // css selector for the html elements you want to klipsify
  selector_eval_js: '.mw-highlight-lang-scheme',
  //selector_eval_js: '.language-klipse-eval-js',
};
*/

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
  $('.noprint').not('.noprint.navbox').not('.side-box').not('.listen').not('[role="presentation"]').remove();

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

  if ( valid( explore.bread ) ){ // reading help: bold wordparts

		processNode( document.querySelector('.mw-parser-output') );

	}

	setupULS();

  // wrap reference-lists in a <detail> element
  $('div.reflist').wrap('<details class="reflist-block"></details>');
  $('details.reflist-block').prepend('<summary title="show / hide references"><i class="fa-regular fa-folder-open"></i></summary>');

  // wrap navboxes in a <detail> element
  $('.navbox').wrap('<details class="navbox-block"></details>');
  $('details.navbox-block').prepend('<summary title="show / hide navbox"><i class="fa-regular fa-folder-open"></i> navbox</summary>');

  // all done now, show the content
  $('main.explore').css({ 'visibility' : 'visible' });

  if ( !isMobile ){

    // go to initial URL hash
    window.location.hash = "#" + explore.hash; // NOTE: this breaks the mobile layout!

	  if ( valid( $( window.location.hash )[0] ) ){

	    $( window.location.hash )[0].scrollIntoView();
	    //$( window.location.hash )[0].scrollIntoView({ block: "start", inline: "nearest" });

      //const element = document.getElementById( explore.hash );
      //const y = element.getBoundingClientRect().top + window.pageYOffset + 40;
      //window.scrollTo({top: y, behavior: 'smooth'});

    }

  };

  addSectionTTS(); // add section TTS play buttons

  if ( explore.autospeak ){ // speak article

    startSpeaking();

  }

  // update JSON-LD info
  explore.ld.text = $('.sid#0, .sid#1').text().replace(/\[\d+\]/g, ''); // get first paragraphs as text, and remove all brackets-with-numbers
  //console.log( explore.ld );

  parentref.postMessage({ event_id: 'update-jsonld', data: { fields: explore.ld, } }, '*' );

  // send message to main-app that the page has been rendered
  parentref.postMessage({ event_id: 'page-rendered', data: { } }, '*' );

});

function setupLinks(){

  const special_ref = wp_languages[ explore.language ].namespaces.special;
  const isbn_ref    = wp_languages[ explore.language ].isbn; 
  const isbn_sel    = 'a[href*="' + encodeURIComponent( special_ref ) + ':' + encodeURIComponent( isbn_ref ) + '"]';
  //console.log( isbn_sel );

  // book ISBN links
  $( isbn_sel ).each(function( index ){

    let link = $(this).attr('href');
    let ISBN = link.split('/').pop();
    //console.log( 'ISBN: ', ISBN );

    $(this).attr('href', 'https://openlibrary.org/search?q=' + ISBN );

    $(this).addClass('link external ISBN');

  });

  // FIXME? maybe use a language-property for ISBN detection?
  // book ISBN links (NL, FR)
  /*
  $('.ISBN a', 'a.mw-magiclink-isbn' ).each(function( index ){

    let link = $(this).attr('href');
    let ISBN = link.split('/').pop();

    $(this).attr('href', 'https://openlibrary.org/search?q=' + ISBN );

    $(this).addClass('link external ISBN');

  });
  */



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
        type      : 'string',
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
      parentref.postMessage({ event_id: 'handleClick', data: { type: 'string', title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

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

  // update hash in parent-window
  parentref.postMessage({ event_id: 'hash-change', data: { hash: window.location.hash  } }, '*' );

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
      /*
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

        let model_html = '<model-viewer id="' + model_id + '" class="model-view" title="' + model_name + '" data-name="' + model_name + '" src="' + model_url + '" environment-image="../explore2/assets/images/skybox/aircraft_workshop_01_1k.hdr" exposure="0.64" shadow-intensity="0" shadow-softness="0" ar ar-modes="scene-viewer quick-look" camera-controls loading="lazy" poster="' + thumb + '" ><button class="model-view-button" id="model-view-ar-button" title="AR button" slot="ar-button">AR</button><button title="fullscreen toggle" class="model-view-button" id="model-view-fullscreen-button" onclick="screenfull.toggle(document.getElementById(&quot;' + model_id + '&quot;))"><i class="fa-solid fa-expand"></i></button><div class="model-title">' + caption_plaintext + '</div></model-viewer>'; 

        $(this)[0].src = src;
        let img_html = $(this).html();

        $(this)
          .wrap( '<figure class="model-media"></figure>' )
          .wrap( model_html );

      }
      */
      else { // render as image

        src = src.replace( /\/\d+px\-/g, image_width_string );

        $(this)[0].src = src;
        let img_html = $(this).html();

				// set image source link
				let commons_file_name = src.split('/').pop();
				let image_width_string_no_slash = image_width_string.replace( '\/', '');
				commons_file_name = commons_file_name.replace( image_width_string_no_slash, '' );

				// cleanup SVG-exported image names
				if ( commons_file_name.endsWith( '.svg.png' ) ){
					commons_file_name = commons_file_name.replace( '.svg.png', '.svg' );
				}
				else if ( commons_file_name.endsWith( '.svg.jpg' ) ){
					commons_file_name = commons_file_name.replace( '.svg.jpg', '.svg' );
				}

				if ( !valid( commons_file_name ) ){ // different URL-format

					commons_file_name = src.split('/').pop();

				}

        //console.log( commons_file_name );

				let commons_url = `https://commons.wikimedia.org/w/index.php?search=%22${commons_file_name}%22&title=Special:MediaSearch&go=Go&type=image`;

        $(this)
          .wrap( '<figure class="non-thumb-media"></figure>' )
          .after('</span> <figcaption>' + caption + '&nbsp;&nbsp;<a title="copyright info" target="_blank" href="' + commons_url + '"><i class="fa-regular fa-copyright"></i></href>' + '</figcaption>')
          //.after('<span class="copyright"><a id="image-source" title="source" aria-label="source" target="_blank" href="' + src + '"><i class="fa-regular fa-copyright fa-2x"></i></a></span> <figcaption>' + caption + '</figcaption>')
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

    let heading = $(this).text().replace(/[ %{}|^~\[\]()"'+<>%'&\.\/?:@;=,]/g, '_').replace(/^.+_svg_/, '').toLowerCase().replace( /_+$/, '' );

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

      //console.log( 'audio found: ', audio_url );

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

				if ( key.endsWith('wiki') ){ // use only the Wikimedia-sitelinks

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

			  window.parent.postMessage({ event_id: 'handleClick', data: { type: 'string', title: title_, hash: hash, language: language, languages: encodeURIComponent( JSON.stringify( languages_ ) ), current_pane: current_pane, target_pane: current_pane } }, '*' );

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

function gotoChat( newtab, t ){ // AI chat

  let tutor = explore.tutor; 

  if ( valid( t ) ){

    tutor = t;

  }

  //console.log( 'tutor: ', explore.tutor );

  const url = explore.base + '/app/chat/?m=' + encodeURIComponent( title ) + '&l=' + explore.language + '&t=' + tutor;

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link-split', url: url , title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

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

function bookmarkToggle(){

  //console.log( 'bookmarkToggle(): ', findObjectByKey( explore.bookmarks, 'name', title ).length > 0 );

  // check if already bookmarked
  //if ( findObjectByKey( explore.bookmarks, 'name', title ).length > 0 )
  if (  $('.icon .bookmark-icon').hasClass('bookmarked') ){ // remove bookmark

    console.log('TODO: implement remove bookmark: ', title );

    var node = findObjectByKey( explore.bookmarks, 'name', title );

    if ( valid( node[0]?.id ) ){

      console.log( node[0].id );

      window.parent.postMessage({ event_id: 'remove-bookmark', data: { id: node[0].id } }, '*' );

    }

    $('.icon .bookmark-icon').removeClass('bookmarked');

  }
  else { // add bookmark

    //console.log( 'add bookmark: ', title, explore.qid, 'tags: ', explore.tags );

    $('.icon .bookmark-icon').addClass('bookmarked');  
    window.parent.postMessage({ event_id: 'add-bookmark', data: {
      language:   explore.language,
      qid:        explore.qid,
      tags:       explore.tags,
      datasource: 'wikipedia',
    } }, '*' );

  }

}

function gotoVideo( newtab ){

  const url = explore.base + '/app/video/#/search/' + quoteTitle( title );

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url , title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function gotoImages( newtab ){

  const url = `https://www.bing.com/images/search?q=${title}&form=HDRSC2&setlang=${explore.language}&first=1`;

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url, title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function gotoBooks( newtab ){

  // FIXME: when the language is changed by the user we should also update "lang3"
  const url = encodeURI( 'https://openlibrary.org/search?q=' + quoteTitle( title ) + '&mode=everything&language=' + explore.lang3 );

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url, title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function gotoBookISBN( newtab, id ){

  const url = encodeURI( 'https://openlibrary.org/search?q=ISBN%3A' + id + '&mode=everything');

  window.top.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url, title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

}

function addToCompare( ){

  if ( qid !== '' ){

    window.top.postMessage({ event_id: 'add-to-compare', data: { type: 'compare', title: title, hash: hash, language: language, qid: qid } }, '*' );

  }

}

function switchLanguageVariant( newtab, lv ){

  console.log('switch language-variant to: ', lv );

  if ( valid( lv ) ){

    explore.language_variant = lv;

    parentref.postMessage({ event_id: 'update-language-variant', data: { language : explore.language, language_variant: explore.language_variant } }, '*' );

    // store language-variant preference
    (async () => { await explore.db.set( 'language-variant-' + explore.language, explore.language_variant ); })();

    // goto Wikipedia-article with correct writing style
    const url = `${explore.base}/app/wikipedia/?t=${ encodeURIComponent( title )}&l=${explore.language}&lv=${explore.language_variant}&voice=${explore.voice_code}&dir=${explore.language_direction}&tags=${explore.tags.join(',')}&tutor=${explore.tutor}&embedded=${explore.embedded}#${explore.hash}`;

    if ( newtab ){ openInNewTab( url ); }
    else if ( explore.embedded ){ location.href = url; }
    else {

      parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url , title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

    }

  }
  else {

    explore.language_variant = '';

  }

}

function showLanguageVariants( newtab, task ){

  console.log( 'show language variants' );

  $('#language-variants').toggle();

}

function showAI( newtab, task ){

  // toggle AI task overview
  $('#tutor-style').text( `${explore.tutor}` );
  $('#ai-tasks').toggle();

}

function gotoAI( newtab, task ){

  // workaround: to not make the iframe-context reload the large AI models each time
  //newtab = true;

  let text = $('p').text();

  let arg2 = ''; // optional argument

  if ( task === 'question-answering' ){

    text = text.substring(0, 1700 );
    arg2 = `What is ${title}?`;

  }
  else {

    text = text.substring(0, 2000 );

  }

  //console.log( text );

  const url = encodeURI( `${explore.base}/app/ai/?task=${task}&arg1=${ encodeURIComponent( text ) }&arg2=${ encodeURIComponent( arg2 ) }&l=${explore.language}` );

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url, title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function gotoCommons( newtab ){

  const url = encodeURI( `${explore.base}/app/commons/?q=${qid}&l=${explore.language}` );

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url, title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function gotoWikidata( newtab ){

  const url = encodeURI( 'https://www.wikidata.org/wiki/' + qid + '?uselang=' + explore.language );

  if ( newtab ){ openInNewTab( url ); }
  else if ( explore.embedded ){ location.href = url; }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url, title: title, hash: hash, language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function gotoWikipedia( newtab ){

  let directory = 'wiki'

  if ( valid( explore.language_variant ) ){

    directory = explore.language_variant;

  }
  
  const url = encodeURI( `https://${language}.wikipedia.org/${directory}/${title}` );

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

      $('<span class="section-title-button" title="stop speaking" onclick="stopSpeaking()" tabIndex="0"><i class="fa-solid fa-stop"></i></span>&nbsp;' + 
        '<span class="section-title-button" title="pause speaking" onclick="pauseSpeaking()" tabIndex="0"><i class="fa-solid fa-pause"></i></span>' +
        '<span class="section-title-button" title="start speaking from here" onclick="startSpeaking()" tabIndex="0"><i class="fa-solid fa-play"></i></span>' )

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

					$('<span class="section-title-button" title="stop speaking" onclick="stopSpeaking()" tabIndex="0"><i class="fa-solid fa-stop"></i></span>&nbsp;' + 
            '<span class="section-title-button" title="pause speaking" onclick="pauseSpeaking()" tabIndex="0"><i class="fa-solid fa-pause"></i></span>' +
            '<span class="section-title-button" title="start speaking from here" onclick="startSpeaking( \'' + text + '\' )" tabIndex="0"><i class="fa-solid fa-play"></i></span>')

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

// TODO:
//  - https://codepen.io/erenkulaksiz/pen/GRQmYQq
//  - https://codepen.io/onion2k/pen/qBxmVpR
//  - https://www.cssscript.com/demo/bold-first-few-characters-words/
//  - https://www.skypack.dev/view/splitting
/*
function anchorPoints() {

  // add Times New Roman
  // add line-height option

	console.log('adding anchor points');

  $('.mw-parser-output p');

  const u = () => r.innerHTML.split(" ").map(w => `<b>${w.split("").slice(0,Math.ceil(w.length/2)).join("")}</b>${w.split("").slice(Math.ceil(w.length / 2),w.length).join("")} `).join(" ");
  u();

}
*/

let
minWordLength = 4,    // Minimum word length
minTextLength = 20,   // Minimum text length
boldRatio     = 0.4;  // Bold ratio (percentage of letters per word)

// source: https://github.com/ltguillaume/bread/blob/main/bread.user.js
function insertTextBefore( text, node, bold ){

	if (bold) {
		let span = document.createElement('span');
		span.className = 'bread';
		span.appendChild(document.createTextNode(text));

		node.parentNode.insertBefore(span, node);
	} else {
		node.parentNode.insertBefore(document.createTextNode(text), node);
	}

}

function processNode( root ) {

	let walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode: function (node) {
			return (
				node.parentNode.nodeName !== 'INPUT' &&
				node.parentNode.nodeName !== 'NOSCRIPT' &&

				node.parentNode.nodeName !== 'SCRIPT' &&
				node.parentNode.nodeName !== 'STYLE' &&
				node.parentNode.nodeName !== 'TEXTAREA' &&
				node.parentNode.nodeName !== 'TITLE' &&
			 (node.parentNode.nodeName === 'A' ||
				node.parentNode.nodeName === 'EM' ||
				node.parentNode.nodeName === 'STRONG' ||
				node.nodeValue.length	 >= minTextLength)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
		}
	});

	let node;

	while (node = walker.nextNode()) {

		let text = node.nodeValue;
		let wStart = -1, wLen = 0, eng = null;

		//console.log( text );

		for (let i = 0; i <= text.length; i++) {	// We use <= here because we want to include the last character in the loop
			let cEng = i < text.length ? /[\p{Letter}\p{Mark}]/u.test(text[i]) : false;

			if (i == text.length || eng !== cEng) {
				// State flipped or end of string
				if (eng && wLen >= minWordLength) {
					let word = text.substring(wStart, wStart + wLen);
					let numBold = Math.ceil(word.length * boldRatio);
					let bt = word.substring(0, numBold), nt = word.substring(numBold);
					insertTextBefore(bt, node, true);
					insertTextBefore(nt, node, false);
				} else if (wLen > 0) {
					let word = text.substring(wStart, wStart + wLen);
					insertTextBefore(word, node, false);
				}
				wStart = i;
				wLen = 1;
				eng = cEng;
			} else {
				wLen++;
			}
		}

		node.nodeValue = '';	// Can't remove the node (otherwise the tree walker will break) so just set it to empty
	}

};
