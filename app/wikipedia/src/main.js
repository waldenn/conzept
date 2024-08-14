// © Copyright 2019-2021 J. Poulsen. All Rights Reserved.

'use strict';

// wikibase library
window.wbk = WBK({
  instance:       datasources.wikidata.instance,
  sparqlEndpoint: datasources.wikidata.endpoint,
})

/*
// see: https://github.com/viebel/klipse
window.klipse_settings = {
  // css selector for the html elements you want to klipsify
  selector_eval_js: '.mw-highlight-lang-scheme',
  //selector_eval_js: '.language-klipse-eval-js',
};
*/

let current_pane  = '';
let parentref     = '';

// main app state
const explore_default = {

  host          : CONZEPT_HOSTNAME,
  base          : CONZEPT_WEB_BASE,
  version       : CONZEPT_VERSION,

  title     		: getParameterByName('t') || '',
  language     	: getParameterByName('l') || 'en',
  lang3         : getParameterByName('lang3') || '',  // used for the Open Library book-link
  language_direction : getParameterByName('dir') || '',

  // used for TTS
  voice_code   	: getParameterByName('voice') || '',
  voice_rate   	: getParameterByName('rate')  || '1',
  voice_pitch  	: getParameterByName('pitch') || '1',
  autospeak_global : '',

  hash         	: location.hash.substring(1) || '',
	qid						: getParameterByName('qid') || '',    // global identifier
	embedded			: getParameterByName('embedded') || '', // signals to open links in the local iframe
	tutor		      : getParameterByName('tutor') || 'default', // AI chat app tutor
  tags         	: valid( getParameterByName('tags') )? getParameterByName('tags').split(',') : [],

  languages     : [],

	languages_with_variants : ['zh'], // TODO: check for more languages
	language_variant : getParameterByName('ws') || '',     // currently only used for the "zh"-language (TODO: make more general)

  firstVisit    : true,

	// could we read these from storage?
  locale       	: getParameterByName('locale') || 'en',
  fontsize     	: getParameterByName('fs') || '19',
  font1        	: getParameterByName('font') || CONZEPT_FONT,
  darkmode     	: getParameterByName('darkmode') || false,
  //linkpreview  	: getParameterByName('lp') || false,
  isMobile     	: getParameterByName('mobile') || detectMobile(),
  bread         : false,

	db						: undefined, // persistent client-side storage using immortalDB

	locales				: [ 'ceb', 'en', 'es', 'de', 'fr', 'hi', 'ja', 'nl', 'pt', 'ru'],
  banana				: undefined,
  banana_native	: undefined,

  language_script : '',       // see: https://www.w3.org/International/questions/qa-scripts.en#examples
  language_name : '',
  language_prev :  '', // previous language 2-letter-code
  langcode3     : undefined,
  langcode_librivox : undefined,
  lang_category : undefined,
  lang_catre1   : undefined, // localized "Category:" replace
  lang_catre2   : undefined, // localized "Category:3A" replace
  lang_portal   : undefined,
  lang_porre1   : undefined, // localized "Portal:" replace
  lang_book     : undefined,
  lang_bookre   : undefined,
  lang_talk     : undefined,
  lang_talkre   : undefined,

  isSafari      : detectSafari(),
  isChrome      : detectChrome(),
  isFirefox     : detectFirefox(),

  wp_languages  : wp_languages,

	tts_enabled		: true,
	synth_paused	: false,
	tts_removals	: 'table, sub, sup, style, .internal.hash, .rt-commentedText, .IPA, .catlink, .notts, #coordinates, .navbox-block',

  //Caribbean and South AmericaAtlanticEuropean watersLow Countries and GermanyFranceIrelandOrigins – List of battles1566–15721572–1576European waters1576–15791579–1588European watersTen Years, 1588–1598European waters1599–1609European watersTwelve Years' Truce, 1609–16211621–1648Peace – Aftermath – Historiography

  autospeak     : getParameterByName('autospeak') || false,
  autospeak_section : getParameterByName('autospeak_section') || '',

  keyboard_ctrl_pressed : false,

  ld            : {}, // linked data fields

  bookmarks     : [],

}

// merge the early and late explore-setting-objects into one final "explore" settings object
explore = { ...explore, ...explore_default };

// set complex explore objects (to prevent any issues with shallow-copying)
explore.synth = window.speechSynthesis;

$( document ).ready( function() {

  current_pane = getCurrentPane();

  $('#tutor-style').text( `${explore.tutor}` );

  setupAppKeyboardNavigation();

  setupAutoStopAudio();

  if ( explore.language_direction === '' ){ // double-check that this is not an RTL-language (note: hack for second-content-pane calls)

    if ( [ 'ar', 'arz', 'bal', 'bgn', 'ckb', 'fa', 'khw', 'ps', 'sd', 'ur', 'he', 'yi', 'arc', 'dv' ].includes( explore.language ) ){

      explore.language_direction = 'rtl';

    }

  }

  if ( explore.locale === 'simple' ){
    explore.locale = 'en';
  }

  // uppercase-first letter (this makes the API language search work correctly)
  explore.title = explore.title.charAt(0).toUpperCase() + explore.title.slice(1);

  if ( explore.isMobile && explore.isChrome ){ // TTS not working on Chrome mobile?
    explore.tts_enabled = false;
  }

  if ( explore.isMobile ){
    setupSwipe( 'wikipedia-content' );
  }

  (async () => {

    explore.db = ImmortalDB.ImmortalDB;

    if ( explore.voice_code === '' ){

      explore.voice_code = await explore.db.get('voice_code_selected');
      explore.voice_code = ( explore.voice_code === null || explore.voice_code === undefined ) ? '' : explore.voice_code;

    }

    if ( explore.autospeak_global === '' ){

      explore.autospeak_global = await explore.db.get('autospeak');
      explore.autospeak_global = ( explore.autospeak_global === null || explore.autospeak_global === undefined ) ? '' : explore.autospeak_global;

    }

    if ( !valid( getParameterByName('darkmode') ) ){ // no darkmode-param was set, so check the local DB

      explore.darkmode = await explore.db.get('darkmode');
      explore.darkmode = ( explore.darkmode === null || explore.darkmode === 'false' ) ? false : true;

      if ( valid( explore.darkmode ) ){

        $('body').addClass( 'dark' );

      }

    }

    // reading help: bold words
    explore.bread = await explore.db.get('bread');
    explore.bread = ( explore.bread === null || explore.bread === undefined ) ? false : explore.bread;

    //console.log('explore.language_variant: ', explore.language_variant );

    // check if there is a preferred language-variant
    if ( explore.language_variant === '' && explore.languages_with_variants.includes( explore.language ) ){ 

			//console.log('check writing-style from storage');

      explore.language_variant = await explore.db.get('language-variant-' + explore.language );
      explore.language_variant = ( explore.language_variant === null || explore.language_variant === undefined ) ? '' : explore.language_variant;

      //console.log('Wikipedia app: language variant from storage: ', explore.language_variant );

    }
    else {

      //console.log('Wikipedia: language variant set to: ', explore.language_variant );

    }

    explore.bookmarks = await explore.db.get('bookmarks');
    explore.bookmarks = ( explore.bookmarks === null || explore.bookmarks === undefined ) ? [] : JSON.parse( explore.bookmarks );

		explore.lang3 = getLangCode3( explore.language );

    const voice_rate_user = await explore.db.get('voice_rate');

    if ( isNumeric( voice_rate_user ) ){

      explore.voice_rate = voice_rate_user;

    }

    const voice_pitch_user = await explore.db.get('voice_pitch');

    if ( isNumeric( voice_pitch_user ) ){

      explore.voice_pitch = voice_pitch_user;

    }

    // set font
		explore.font1 = await explore.db.get('font1');

		if ( explore.font1 !== CONZEPT_FONT ){ // custom font

      if ( ! valid( explore.font1 ) ){

        explore.font1 = CONZEPT_FONT;

      }

			$('#fontlink').replaceWith( '<link id="fontlink" href="https://fonts.googleapis.com/css?family=' + explore.font1 + ':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">' );
			$('#fontlink').replaceWith( '<link id="fontlink" href="https://fonts.googleapis.com/css?family=' + explore.font1 + ':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">' );

			$( 'body').css( 'fontFamily', explore.font1 , '');

		}
		else { // standard font

			$( '#fontlink').replaceWith( '<link id=fontlink />' );

		}

		// set link-previews
		explore.linkpreview = await explore.db.get('linkpreview');

    explore.fontsize = await explore.db.get('fontsize'); // TODO: also correctly handle invalid fontsize returns here
    $( 'body' ).css('fontSize', explore.fontsize + 'px' );

		// i18n engine: https://github.com/wikimedia/banana-i18n
		// set default locale and locale-fallback, we will set the true user-locale later.
		explore.banana        = new Banana( explore.locale, { finalFallback: 'en' } ); // used for the UI interface
		explore.banana_native = new Banana( explore.locale, { finalFallback: 'en' } ); // allows for translating to the native-content language
		updateLocaleNative();

    if ( explore.qid === '-1' ){ // don't use a non-valid qid
      explore.qid = '';
    }

		// allow for embedded-apps to trigger the Wikipedia-app with only a title (and no Qid), then check for a matching Qid.
		if ( !valid( explore.qid ) && valid( explore.title )  ){

			let qid_ = await checkForQid();

			if ( qid_.hasOwnProperty('entities') ){

				const qid = Object.keys( qid_.entities )[0];

				if ( isQid( qid ) ){

					explore.qid = qid;

          // now that we do have a Qid: add the nav-links.
          $('#gotoWikipedia').before('<span id="gotoCommons"><button onclick="gotoCommons()" onauxclick="gotoCommons( true )" class="dropbtn" tabIndex="0" title="Wikimedia Commons images" aria-label="Wikimedia Commons images"><span class="icon"><i class="fa-regular fa-images"></i></span></button></span> ');
          $('#gotoWikipedia').after('<span id="gotoWikidata"><button onclick="gotoWikidata()" onauxclick="gotoWikidata( true )"class="dropbtn" tabIndex="0" title="go to Wikidata" aria-label="go to Wikidata"><span class="icon"><i class="fa-solid fa-barcode"></i></span></button></span> ');

				}

			}

		}

		//console.log( 'title:', explore.title, '| language:', explore.language, '| hash:', explore.hash, '| qid:', explore.qid, '| locale:', explore.locale, '| font1:', explore.font1 );

    window.addEventListener("message", receiveMessage, false);

    // MIME-type hack: https://stackoverflow.com/questions/2618959/not-well-formed-warning-when-loading-client-side-json-in-firefox-via-jquery-aj
    $.ajaxSetup({beforeSend: function(xhr){ if (xhr.overrideMimeType) { xhr.overrideMimeType("application/json"); } } });

    if ( explore.title === '' && explore.qid === '' ){

      return 0; // do nothing

    }
    else { // we have a title or qid

      if ( explore.qid !== '' ){ // we have a qid

				if ( !explore.qid.startsWith('Q') ){ // add 'Q' if its missing

					explore.qid = 'Q' + explore.qid;

 				}

        getWikidata_( explore.qid )

      }
      else { // use the title

        // get all the languages for this wikipedia-article
        // see: https://www.mediawiki.org/wiki/API:Langlinks
        let title = '';

        if ( explore.embedded ){

          // https://stackoverflow.com/questions/5396560
          // test URL: https://conze.pt/app/wikipedia/?t=Ch%C3%A2teau%20de%20Bussi%C3%A8re&l=fr&voice=fr-FR&qid=2968712&dir=ltr&embedded=true#_
          title = decodeURI( title );
          //console.log( title );
          //title = decodeURIComponent( escape( title ) );
          //title = unescape( URIComponent( title ) );

        }
        else {

          title = encodeURIComponent( explore.title );

        }

        const url = `https://${explore.language}.${datasources.wikipedia.endpoint}?action=query&titles=' + title + '&prop=langlinks&lllimit=500&format=json`;
        //const url = 'https://' + explore.language + '.wikipedia.org/w/api.php?action=query&titles=' + title + '&prop=langlinks&lllimit=500&format=json';

        //console.log( url );

        $.ajax({
          url: url,
          dataType: "jsonp",

          success: function( ll ) {

            //console.log( ll );

            if ( typeof ll === undefined || typeof ll === 'undefined' ){
              // do nothing

              // do nothing
              console.log('no Wikipedia pages defined 1');

              // fallback to Wikidata, if there is a Qid.
              if ( valid( explore.qid ) ){
                window.open( `https://${explore.host}${explore.base}/app/wikidata/?q=${explore.qid}&lang=${explore.language}`, '_self');
                //openInFrame( `https://${explore.host}${explore.base}/app/wikidata/?q=${explore.qid}&lang=${explore.language}` )
              };

            }
            else {

              if ( typeof ll.query.pages[ Object.keys( ll.query.pages)[0] ] === undefined ){

                // do nothing
                console.log('no Wikipedia pages defined 2');

                // fallback to Wikidata, if there is a Qid.
                if ( valid( explore.qid ) ){
                  window.open( `https://${explore.host}${explore.base}/app/wikidata/?q=${explore.qid}&lang=${explore.language}`, '_self');
                }

              }
              else {

                // for each entry in "langlinks": add an object with: <iso2> : <name>
                let languages = {};

                $.each( ll.query.pages[ Object.keys( ll.query.pages)[0] ].langlinks, function( k, lang_item ){

                  //console.log( lang_item['*'] );
                  languages[ lang_item[ 'lang' ] ] = lang_item['*'];  

                });

                //console.log( languages );

                explore.languages = encodeURIComponent( JSON.stringify( languages ) );

                renderWikiArticle( explore.title, explore.language, explore.hash, explore.languages, explore.tags, '', '', false, '' );

              }

            }

          },

        });

      }

    }

	})();

	// keyboard control
	$(document).keydown(function(event) {

		let key = (event.keyCode ? event.keyCode : event.which);

		//console.log( event, key );

		if ( key == '70' && ! detectSpecialKeyPressed( event ) ){ // singel "f"-key

			document.toggleFullscreen();

		}

	});

});

function checkForQid(){

	let title = '';

	if ( explore.embedded ){

		title = decodeURI( explore.title );

	}
	else {

		title = encodeURIComponent( explore.title );

	}

	// get qid and wikidata data
	// https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&format=json&titles=Karachi

	return $.ajax({

		url: datasources.wikidata.instance_api + '?action=wbgetentities&sites=' + explore.language + 'wiki&format=json&normalize=true&titles=' + title,
		dataType: "jsonp",

		success: function( wd ) {

			//console.log( wd );

			if ( typeof wd.entities === undefined || typeof wd.entities === 'undefined' ){
				// do nothing
			}
			else {

				const qid = Object.keys( wd.entities )[0];

				if ( qid.startsWith('Q') ){

					let d = fetchWikidata( [ qid ], '', 'wikipedia', 'ps2' );

				}

			}

		},

	});

}


function getWikidata_( qid ){

  const wikidata_url = window.wbk.getEntities({
    ids: [ qid ],
    redirections: false,
  })

  //wbk.simplify.claims( entity.claims, { keepQualifiers: true })

  // get wikidata json
  fetch( wikidata_url )

    .then( response => response.json() )
    .then( window.wbk.parse.wd.entities )
    //.then( data => window.wbk.simplify.entities(data.entities, { keepQualifiers: true } ))
    .then( entities => {

			let item = { qid : qid };

			//console.log( 'single item: ', item, entities[ item.qid ] );

			// detect the relevant wikidata-data and put this info into the item
			setWikidata( item, entities[ item.qid ], true, current_pane, afterSetWikidata ); // TODO: use target_pane?

  }) // end of qid entity processing

}


function afterSetWikidata( item ){

  explore.languages = item.languages;

	if ( valid( item.title ) ){

	  if ( explore.tutor === 'auto-select' ){

      explore.tutor = getTutor( item );

    }

    $('#tutor-style').text( `${explore.tutor}` );

		explore.title = item.title;

    explore.tags  = item.tags.filter(Boolean);
    //console.log( 'tags set to: ', explore.tags );

    let gbif_id = '';
    let banner  = '';

    if ( valid( item.gbif_id ) ){ gbif_id = item.gbif_id; }
    if ( valid( item.page_banner ) ){  banner = item.page_banner; }

    //console.log( 'jsonld item info: ', item );
    explore.ld.title        = valid( item.title )? item.title : '';
    explore.ld.tags         = item.tags.filter(Boolean);
    explore.ld.qid          = valid( item.qid )? item.qid : '';

    explore.ld.thumbnailUrl = valid( item.image )? item.image : '';
    explore.ld.image        = valid( item.image_full )? item.image_full : '';
    explore.ld.description  = valid( item.description )? item.description : '';
    explore.ld.google_kg    = valid( item.google_knowledge_graph )? item.google_knowledge_graph : '';
    explore.ld.website      = valid( item.website )? Object.values( item.website ) : [];

    //console.log( 'ld: ', item.website, explore.ld );

		renderWikiArticle( explore.title, explore.language, explore.hash, explore.languages, explore.tags, item.qid, gbif_id, false, banner );

	}
	else { // no wikipedia article for this Qid, so just show the wikidata-page

		window.location.href = '../wikidata/?q=' + explore.qid + '&lang=' + explore.language;

	}

}

function updateLocaleNative(){

  let l = explore.language;

  if ( l === 'simple' ){

    l = 'en';

  }

  explore.banana_native.setLocale( l );

  if ( explore.locales.includes( l ) ){

    fetch('../explore2/assets/i18n/ui/conzept-' + l + '.json?' + explore.version ).then((response) => response.json()).then((messages) => {

      explore.banana_native.load( messages, l );

    });

  }

}


function getTitleFromQid( qid ){

  //fetchWikidata( [ qid ], '', 'wikidata' );

}


function renderWikiArticle( title, lang, hash_, languages, tags, qid, gbif_id, allow_recheck, banner ){

  //console.log( 'renderWikiArticle: ', title, lang, hash_, languages, tags, qid, gbif_id, allow_recheck );

  let doc = {};

  doc.title = '';
  doc.html  = '';

  $.ajax({

    // see:
    //  https://www.mediawiki.org/wiki/API:Main_page
    //  https://stackoverflow.com/questions/21211037/how-can-i-make-the-wikipedia-api-normalize-and-redirect-without-knowing-the-exac/22339407
    //  https://en.wikipedia.org/w/api.php?action=parse&page=Apaloderma%20vittatum&prop=text&formatversion=2&format=json&redirects=
    //  https://en.wikipedia.org/w/api.php?action=query&prop=revisions%7Cpageprops&rvprop=content&maxlag=5&rvslots=main&origin=*&format=json&redirects=true&titles=Apaloderma_vittatum

    url: `https://${explore.language}.${datasources.wikipedia.endpoint}?action=parse&page=${ encodeURIComponent( title ) }&prop=text&formatversion=2&format=json&redirects=&variant=${explore.language_variant}`,

    dataType: "jsonp",

    success: function( res ) {

      if ( res === null ){ res = undefined; } // avoid using "null" values

      // hack to fix 'undefined' language when going back to the explore-homepage
      // TODO: research if we should/could do this fallback earlier?
      if ( explore.language === undefined || explore.language === 'undefined' ){
        explore.language = window.language = 'en';
      }

      if ( title.startsWith( explore.lang_category + ':' ) ){ // category page

        // get all content ( preface text, subcategories, included pages)
        //
        // https://www.mediawiki.org/wiki/API:Categorymembers
        // https://www.mediawiki.org/wiki/API:Categories
        // https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Flamenco&cmlimit=10

        $.ajax({

          url: `https://${explore.language}.${datasources.wikipedia.endpoint}`,
          //url: 'https://' + explore.language + '.wikipedia.org/w/api.php',
          //url: 'https://' + lang +'.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=' + title + '&cmlimit=10',
          dataType: "jsonp",

          data: {
            'action': "query",
            'format': "json",
            'list' : 'categorymembers',
            'cmlimit': 300,
            'cmtitle': decodeURIComponent( title ),
            'cmnamespace': '0|14|100',
            // prop=categories
          },

          success: function( pages ) {

            renderWikipediaHTML( title, lang, hash_, doc, 'category', pages.query.categorymembers, '', languages, tags, qid, gbif_id, banner );

          },

          error: function( data ) {
            console.log('Category JSON fetch error: ' + errorMessage);
          },

          //timeout: 3000,

        });

      }
      else { // standard page

        // 1) check if there is a category with the same name as the article-title (lowercased)
        $.ajax({

          url: `https://${explore.language}.${datasources.wikipedia.endpoint}`,
          //url: 'https://' + explore.language + '.wikipedia.org/w/api.php',
          dataType: "jsonp",
          data: {
            'action': "query",
            'format': "json",
            'list' : 'categorymembers',
            'cmlimit': 300,
            'cmtitle': decodeURIComponent( explore.lang_category + ':' + title ),
            'cmnamespace': '0|14',
            //'cmnamespace': '0|14|100',
            // prop=categories
          },

          success: function( pages ) {

            if ( typeof pages.query === undefined || typeof pages.query === 'undefined' ){

              console.log('warning: no pages.query results found');

							// fallback to Wikidata, if there is a Qid.
              if ( valid( explore.qid ) ){
                window.open( `https://${explore.host}${explore.base}/app/wikidata/?q=${explore.qid}&lang=${explore.language}`, '_self');
              }

            }
            else {

              // 2) if so: get subcategories, main-category and main-category-articles (aka related articles)
              
              // check res.query.redirects[0].to
              if ( typeof res.query === undefined || typeof res.query === 'undefined' ){
              }
              else {

                if ( typeof res.query.redirects[0].to === undefined ){
                  // no redirect for this title
                }
                else { // found redirect

                  doc.title = res.query.redirects[0].to || '';

                }

              }

              if ( typeof res.parse === undefined || typeof res.parse === 'undefined' ){
              }
              else {

                if ( typeof res.parse.title === undefined ){
                  // no direct title found
                }
                else { // found title

                  doc.title = res.parse.title;

                  //console.log('direct title: ', doc.title );
                }

              }

              if ( title == doc.title || allow_recheck === false ){

                if ( typeof res.parse === undefined || typeof res.parse === 'undefined' ){ // article does not exist in this language-Wikipedia

                  if ( valid( explore.qid ) ){

                    console.log('goto Wikidata');
                    window.location.href = explore.base + `/app/wikidata/?q=${explore.qid}&lang=${explore.language}`;

                  }
                  else {

                    console.log('Wikipedia app: no article found for: ', explore.language, explore.title );
                    window.location.href = explore.base + '/pages/blank.html';

                  }

                  //window.location.href = 'https://www.bing.com/search?q=%22' + explore.title + '%22+-wikipedia.org+-wikimedia.org+-wikiwand.com+-wiki2.org&setlang=' + explore.language + '-' + explore.language;

                  $('#loader').hide();

                  return 1;

                }

                doc.html = res.parse.text;

                if ( doc === undefined ){

                  explore.noWikipediaContentYet = true;

                  console.log('doc undefined');

                  // fallback to Wikidata, if there is a Qid.
                  if ( valid( explore.qid ) ){
                    window.open( `https://${explore.host}${explore.base}/app/wikidata/?q=${explore.qid}&lang=${explore.language}`, '_self');
                  }

                  //tryFallbackToQid();

                  //return 1;
                }
                else {

                  explore.noWikipediaContentYet = false;

                  renderWikipediaHTML( doc.title, lang, hash_, doc, 'standard-with-category', pages.query.categorymembers, '', languages, tags, qid, gbif_id, banner )

                }

              }
              else { // if "title" is different from "doc.title()"

                console.log('Hmmm... redirect found: fetch wikidata for it: ', doc.title, title );

								return 0;

              }

            }

          },

          error: function(data) {

						console.log('error fetching wikipedia data');

          },

        });
      }

    },

  });

}

function renderWikipediaHTML( title, lang, hash_, doc, type, cat_members, raw_html, languages, tags, qid, gbif_id, banner ){

  const source_page       = 'https://' + lang + '.wikipedia.org/wiki/' + title;
  const contributors_page = 'https://' + lang + '.wikipedia.org/w/index.php?title=' + title + '&action=history';

	const language_display = ( explore.isMobile ) ? lang : getNamefromLangCode2( explore.language ); // show the shorter ISO2 language-name on mobile

  //console.log( 'renderWikipediaHTML: ', title, lang, hash_, doc, type, cat_members, raw_html, languages, tags, qid, gbif_id );

  // grab the whole HTML string of this article
  let html_ = '<body id="wikipedia-content"></span><h2 class="article-title">' + title + '</h2> <!--catheadline-->' + doc.html + '</body>';

  let catheadline = '<div class="catheadline"><ul class="notts">';

  // FIXME
  //console.log( cat_members  );

  // https://en.wikipedia.org/w/api.php?action=query&format=json&titles=Janelle%20Mon%C3%A1e&prop=categories
  let c = [];

  const cat_url = `https://${explore.language}.${datasources.wikipedia.endpoint}?action=query&format=json&titles=${ encodeURIComponent( title ) }&prop=categories`;

  $.ajax({

    url: cat_url,
    dataType: "jsonp",

    success: function( res ) {

      if ( typeof res.query.pages === undefined || typeof res.query.pages === 'undefined' ){
        // do nothing
      }
      else {

        //if ( typeof res.query.pages[ Object.keys( res.query.pages)[0] ].categories === undefined || typeof res.query.pages[ Object.keys( res.query.pages)[0] ].categories === 'undefined' ){
          // do nothing
        //}
        //else {

          //console.log ( res.query.pages[ Object.keys( res.query.pages)[0] ].categories ) ;

          if ( !valid( res.query.pages ) ){

            //console.log('hmm.. no categories found');
            //console.log( res.query.pages );

          }
          else {

            if ( valid( Object.keys( res.query.pages)[0] ) ){

              if ( valid( res.query.pages[ Object.keys( res.query.pages)[0] ].categories ) ){

                c = res.query.pages[ Object.keys( res.query.pages)[0] ].categories.map( a => a.title );

              }

            }

          }

        //}

      }
      
      //const c = doc.categories(); // categories _of_ the article ( NOT the child categories or pages)

      //console.log( 'categories: ', c)

      let own_cats = '';
      let j = 0;

      for ( let i = 0; i < c.length; ++i) {

        const own_cat = encodeURIComponent( c[i] ) ;
        //const own_cat = explore.lang_category + '%3A' + encodeURIComponent( c[i] ) ;

        let t =  c[i].replace( explore.lang_catre1, '');

        //if ( explore.lang_category + ':'  + title === own_cat )
        if ( title === own_cat ){
          own_cats += '<li class="notts"><a class="link catlink" href="' + own_cat + '"><b>  <span class="icon"><i class="fa-regular fa-folder-open fa-xs">&nbsp; </i></span> ' + t + '</b></a></li>';
          //own_cats += '<li><a class="link catlink" href="./?l=' + explore.language + '&t=' + own_cat + '"><b>  <span class="icon"><i class="fa-regular fa-folder-open fa-xs">&nbsp; </i></span> ' + t + '</b></a></li>';
        }
        else {
          own_cats += '<li class="notts"><a class="link catlink" href="' + own_cat + '">  <span class="icon"><i class="fa-regular fa-folder-open fa-xs">&nbsp; </i></span> ' + t + '</a></li>';
          //own_cats += '<li><a class="link catlink" href="./?l=' + explore.language + '&t=' + own_cat + '">  <span class="icon"><i class="fa-regular fa-folder-open fa-xs">&nbsp; </i></span> ' + t + '</a></li>';
        }

        // collect first 3 categories for display under page title 
        if ( j < 3 ){

          //console.log( own_cat );

          // TODO: can we put these strings somewhere into the 'en' language object (and also register the start or end matching mode?)
          // skip uninteresting cats
          if (

                // multi-lingual start
                own_cat.startsWith( explore.lang_category + '%3AWikipedia') ||
                own_cat.startsWith( explore.lang_category + '%3ACS1') ||
                own_cat.startsWith( explore.lang_category + '%3A!') || // see eg.: https://conze.pt/explore/Trogon?l=pt&t=wikipedia&s=true&i=945088
                own_cat.startsWith( explore.lang_category + '%3APages%20') ||
                own_cat.startsWith( explore.lang_category + '%3AWebarchive%20') ||
                own_cat.startsWith( explore.lang_category + '%3ACite%20') ||
                own_cat.startsWith( explore.lang_category + '%3ATemplate%20') ||

                // multi-lingual end
                own_cat.endsWith('%20errors') ||
                own_cat.endsWith('%20Wikidata') ||
                own_cat.endsWith('%20categories') ||
                own_cat.endsWith('%20pages') ||
                own_cat.endsWith('uncertain') ||

                // english start
                own_cat.startsWith( explore.lang_category + '%3AAll%20') ||
                own_cat.startsWith( explore.lang_category + '%3AArticles%20') ||
                own_cat.startsWith( explore.lang_category + '%3ABurials%20at') ||
                own_cat.startsWith( explore.lang_category + '%3ABurials%20in') ||
                own_cat.startsWith( explore.lang_category + '%3APeople%20from') ||
                own_cat.startsWith( explore.lang_category + '%3AGood%20articles') ||
                own_cat.startsWith( explore.lang_category + '%3AAC%20with%20') ||
                own_cat.startsWith( explore.lang_category + '%3AUse%20') ||

                // english end
                own_cat.endsWith('births') ||
                own_cat.endsWith('deaths') ||
                own_cat.endsWith('alumni') ||
                own_cat.endsWith('people') ||

                // french start
                // ? constrain to 'fr' language?
                // TODO: encode all explore.lang_category first, as they may contain non-ascii characters
                own_cat.startsWith( 'Cat%C3%A9gorie%3AArticle%20') ||
                own_cat.startsWith( 'Cat%C3%A9gorie%3APage%20') ||
                own_cat.startsWith( 'Cat%C3%A9gorie%3APortail%3A')
                //own_cat.startsWith( explore.lang_category + '%3AArticle%20') ||
                //own_cat.startsWith( 'Catégorie%3AArticle%20')

            ){
            // do nothing
          }
          else {
            j += 1;
            // remove upto ':' from category name
            //const own_cat_ = own_cat.substring( own_cat.indexOf(":") + 1 );
            catheadline += '<li class="notts"><a class="link catlink" href="' + own_cat + '"><span class="icon"><i class="fa-regular fa-folder-open fa-xs"></i></span>&nbsp; ' + t + '</a></li>';
          }

        }

        //console.log( catheadline );

      }

      catheadline += '</ul></div>';

      // dont show catheadline if there are no entries
      const test_ = catheadline.match(/<ul class="notts"><\/ul>/g);

      if ( test_ !== null ){
        if ( test_.length > 0 ){
          catheadline = '';
        }
      }

      // remove catheadline if it has no entries
      if ( catheadline.length < 33 ){
        catheadline = '';
      }

      let inner_cats = '';
      let inner_pages = '';
      let cathtml = '';
      let catparents_title = 'super';

      let main_title = '<h1>' + decodeURIComponent( title ) +  '</h1>';

      if ( type === 'portal' ){
        main_title = '';
        catheadline = ''; // dont show catheadline on category-pages
      }
      else if ( type === 'book' ){
        main_title = '';
        catheadline = ''; // dont show catheadline on category-pages
      }
      else if ( type === 'category' ){

        main_title = '<h2> <span class="icon"><i class="fa-regular fa-folder-open fa-xs">&nbsp; </i></span> ' + decodeURIComponent( title.replace( explore.lang_catre1 , '') ) +  '</h2>';

        catparents_title = '';

        const catpattern = '^' + explore.lang_category + ':';
        const catre = new RegExp( catpattern, "g" );

        for ( let i = 0; i < cat_members.length; ++i) {

          if ( cat_members[i].ns === 14 ){ // sub-categories namespace

            const t = cat_members[i].title.replace( explore.lang_catre1, '');

            inner_cats += '<li class="notts"><a class="link catlink" href="' + encodeURIComponent( cat_members[i].title ) + '"> <span class="icon"><i class="fa-regular fa-folder-open fa-xs">&nbsp; </i></span> ' + t + '</a></li>';

          }
          else { // non-category-page

            const t = decodeURIComponent( title.replace( explore.lang_catre2 , '' ) );

            if ( t === cat_members[i].title ){

              inner_pages += '<li class="notts"><a class="link catlinks" href="' +  encodeURIComponent( cat_members[i].title ) + '"><b>' + cat_members[i].title + '</b></a></li>';

            }
            else {

              inner_pages += '<li class="notts"><a class="link catlink" href="' + encodeURIComponent( cat_members[i].title ) + '">' + cat_members[i].title + '</a></li>';

            }
          }

        }

        if ( own_cats !== '' ){ // supercats
          cathtml += '<div class="catheadline"><ul class="notts">' + own_cats + '</ul></div>';
        }

        if ( inner_cats !== '' ){ // subcats
          cathtml += '<h3 class="catheader">sub </h3><ul class="foldercats subs notts">' + inner_cats + '</ul>';
        }

        if ( inner_pages !== '' ){ // related pages
          cathtml += '<h3 class="catheader">pages</h3><ul class="notts">' + inner_pages + '</ul>'; 

        }

      }
      else if ( type === 'standard-with-category' ){

        if ( typeof gbif_id === undefined || typeof gbif_id === 'undefined' || gbif_id === '' || gbif_id === true || gbif_id === false ){
          // do nothing
        }
        else {
          cathtml += renderEmbeddedGbifMap( gbif_id, title );
        }

        catparents_title = 'super';

        for ( let i = 0; i < cat_members.length; ++i) {

          if ( cat_members[i].ns === 14 ){ // sub-categories namespace

            const t = cat_members[i].title.replace( explore.lang_catre1 , '');

            inner_cats += '<li class="notts"><a class="link catlink" href="' + cat_members[i].title + '"> <span class="icon"><i class="fa-regular fa-folder-open fa-xs">&nbsp; </i></span> ' + t + '</a></li>';

          }
          else {

            const t = decodeURIComponent( title.replace(/Category%3A/, '' ) );

            if ( t === cat_members[i].title ){
              inner_pages += '<li class="notts"><a class="link catlink" href="' + encodeURIComponent( cat_members[i].title ) + '"><b>' + cat_members[i].title + '</b></a></li>';
            }
            else {
              inner_pages += '<li class="notts"><a class="link catlink" href="' + encodeURIComponent( cat_members[i].title ) + '">' + cat_members[i].title + '</a></li>';
            }

          }

        }

        // FIXME: ideally we use the plural name for "Category" here instead of the singular (add another column for this word?)
        const cat_plural = ( explore.language === 'en') ? 'Categories' : explore.lang_category;

        cathtml += '<div class="section"> <h2 class="catheader">' + cat_plural + '</h2>';

        if ( own_cats !== '' ){ // super categories
          cathtml +=  '<h3 class="catheader">super</h3>' + '<div class="categories"><div class="catheadline"><ul class="foldercats">' + own_cats + '</ul></div></div>';
        }

        if ( inner_cats !== '' ){ // sub categories
          cathtml += '<h3 class="catheader">sub </h3><ul class="foldercats subs">' + inner_cats + '</ul>';
        }

        if ( inner_pages !== '' ){ // related pages
          cathtml += '<h3 class="catheader">pages</h3><ul>' + inner_pages + '</ul>';
        }

        cathtml += '</div>';

        html_ = html_.replace(/<\!--catheadline-->/, catheadline );

      }

      const darkclass = ( explore.darkmode ) ? 'dark' : '';

      raw_html = raw_html
                  .replace(/\/wiki\//g, '/explore/')
                  ;

      html_ = html_.replace(/\/wiki\//g, '/explore/')
                .replace(/listaref/g, 'listaref reflist')
                .replace(/references-small/g, 'references-small reflist')
                //.replace(/<ol class="references">/g, '<ol class="references reflist">') // correct in all cases? no. how to fix this?
                .replace(/infobox_v2/g, 'infobox')
                .replace(/infobox_v3/g, 'infobox')
                .replace(/"tright"/g, '"tright infobox"') // TODO: verify there are no unintended effects from this!
                .replace(/infocaseta/g, 'infobox infocaseta') // french: table legend
                .replace(/legende-bloc/g, 'legend legende-bloc') // french: table legend
                //.replace(/<img /g, '<img loading="lazy" ') // lazy image loading
                ;

      let fontlink_html = '<link id="fontlink" />';

      if ( explore.font1 !== CONZEPT_FONT ){ // only add font-link for alternative fonts
        fontlink_html = '<link id="fontlink" href="https://fonts.googleapis.com/css?family=' + explore.font1 + ':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">';
      }

      let banner_html = '';

      if ( typeof banner === undefined || typeof banner === 'undefined' ){
        // do nothing
      }
      else {

        if ( banner !== '' ){

          banner_html = '<img id="article-banner" class="no-enlarge" src="' + banner + '"></img>';

        }

      }

      /*
      let talk_page_button = '<span id="gotoTalkPage"><button onclick="gotoTalkPage()" onauxclick="gotoTalkPage( true )" class="dropbtn" tabIndex="0" title="go to talk-page" aria-label="go to talk-page"><span class="icon"><i class="fa-regular fa-comments"></i></span></button></span> ';

      if ( title.startsWith( explore.lang_talk + ':' ) ){ // already on a talk page

        // replace talk button with the Wikipedia-article button
        talk_page_button = '<span id="gotoArticle"><button onclick="gotoArticle()" onauxclick="gotoArticle( true )" class="dropbtn" tabIndex="0" title="go to article" aria-label="go to article"><span class="icon"><i class="fa-solid fa-align-justify"></i></span></button></span> ';

      }
      */

      const wikidata_page_button = valid( explore.qid )? '<span id="gotoWikidata"><button onclick="gotoWikidata()" onauxclick="gotoWikidata( true )"class="dropbtn" tabIndex="0" title="go to Wikidata" aria-label="go to Wikidata"><span class="icon"><i class="fa-solid fa-barcode"></i></span></button></span> ' : '';

      const commons_page_button = valid( explore.qid )? '<span id="gotoCommons"><button onclick="gotoCommons()" onauxclick="gotoCommons( true )" class="dropbtn" tabIndex="0" title="Wikimedia Commons images" aria-label="Wikimedia Commons images"><span class="icon"><i class="fa-regular fa-images"></i></span></button></span> ' : '';

      const ai_toggle_button = ( current_pane !== 'ps2' )? '<span id="showAI"><button onclick="showAI()" onauxclick="showAI()" class="dropbtn" tabIndex="0" title="show AI tasks" aria-label="show AI tasks"><span class="icon"><i class="fa-solid fa-wand-sparkles"></i></span></button></span>' : '';

      const presentation_button = valid( explore.qid )? '<span id="gotoPresentation"><button onclick="gotoPresentation()" onauxclick="gotoPresentation( true )" class="dropbtn" tabIndex="0" title="topic presentation" aria-label="topic presenation"><span class="icon"><i class="fa-solid fa-chalkboard-user"></i></span></button></span> ' : '';

      const language_variants_toggle_button = ( explore.language === 'zh' && current_pane !== 'ps2' )? '<span id="showLanguageVariants"><button onclick="showLanguageVariants()" onauxclick="showLanguageVariants()" class="dropbtn" tabIndex="0" title="switch language variant" aria-label="switch language variant"><span class="icon"><i class="fa-solid fa-language"></i></span></button>' : '';

      let class_bookmarked = '';

      if ( findObjectByKey( explore.bookmarks, 'name', title ).length > 0 ){

        $.each( findObjectByKey( explore.bookmarks, 'name', title ), function( index, obj ){

          if ( obj.language === explore.language ){

            if ( valid( obj.qid ) ){
              
              if ( obj.qid === explore.qid ){

                class_bookmarked = 'bookmarked'; 

              }

            }
            else {

              class_bookmarked = 'bookmarked'; 

            }

          }

        });

      }

      html_ = html_.replace(/<body id="wikipedia-content">/, '<a id="skip-nav" class="screenreader-text" title="skip to main content" aria-label="skip to main content" href="#main-content">skip to main content</a>' + fontlink_html +
        '<a href="javascript:void(0)" id="fullscreenToggle" onclick="document.toggleFullscreen()" class="global-actions"><i id="fullscreenIcon" title="fullscreen toggle" class="fa-solid fa-expand"></i></a>' +
        // TODO: move all JS variables into one object and put that object stringified into the iframe data-fields attribute
        '<script> let language = "' + lang + '"; let locale =  "' + explore.locale + '"; let title =  "' + title + '"; let qid =  "' + explore.qid + '"; let languages =  "' + languages + '"; let font1 =  "' + explore.font1 + '"; let darkmode = ' + explore.darkmode + '; </script>' +
        '<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=1, minimum-scale=1.0, maximum-scale=5.0">' +
        '<style>html{visibility: hidden;opacity:0;}</style>' +
        '<aside class="js-toc"> </aside>' +
        '<main class="explore" role="main">' +
          '<div id="openseadragon" style="display:none; width: 100vw; height: 100vh;"><img id="loader-openseadragon" class="no-enlarge" style="position: fixed; top: 50%; left: 10%; transform: translate(-50%, -50%); z-index: 999999; width: 100px; height: 100px;" alt="loading" src="../explore2/assets/images/loading.gif"/></div>' +
          '<div id="wikipedia-menu">' +
            '<span id="exploreTopic"><button onclick="goExplore()" onauxclick="goExplore(true)" class="dropbtn" tabIndex="0" title="explore this topic" aria-label="explore this topic"><span class="icon"><i class="fa-solid fa-retweet"></i></span></button></span> ' +

            '<span id="newTab"><button onclick="openInNewTab( &quot;' + 'https://' + CONZEPT_HOSTNAME + CONZEPT_WEB_BASE + '/explore/' + encodeURIComponent( title ) + '?l=' + explore.language + '&t=wikipedia&i=' + explore.qid + '&quot;)" onauxclick="openInNewTab( &quot;' + 'https://' + CONZEPT_HOSTNAME + CONZEPT_WEB_BASE + '/explore/' + encodeURIComponent( title ) + '?l=' + explore.language + '&t=wikipedia&i=' + explore.qid + '&quot;)" class="dropbtn" tabIndex="0" title="open in new tab"><span class="icon"><i class="fa-solid fa-external-link-alt"></i></span></button></span>' +
            '<span id="bookmarkToggle"><button onclick="bookmarkToggle()" onauxclick="" class="dropbtn" tabIndex="0" title="bookmark topic" aria-label="bookmark topic"><span class="icon"><i class="bookmark-icon fa-solid fa-bookmark ' + class_bookmarked + '"></i></span></button></span> ' +
            '<span id="gotoVideo"><button onclick="gotoVideo()" onauxclick="gotoVideo( true )" class="dropbtn" tabIndex="0" title="go to video" aria-label="go to video"><span class="icon"><i class="fa-solid fa-video"></i></span></button></span> ' +
            //'<span id="gotoImages"><button onclick="gotoImages()" onauxclick="gotoImages( true )" class="dropbtn" tabIndex="0" title="go to images" aria-label="go to images"><span class="icon"><i class="fa-regular fa-images"></i></span></button></span> ' +
            //'<span id="gotoBooks"><button onclick="gotoBooks()"  onauxclick="gotoBooks( true )" class="dropbtn" tabIndex="0" title="go to books" aria-label="go to books"><span class="icon"><i class="fa-brands fa-mizuni"></i></span></button></span> ' +
            //'<span id="addToCompare"><button onclick="addToCompare()" class="dropbtn" tabIndex="0" title="add to compare" aria-label="add to compare"><span class="icon"><i class="fa-solid fa-plus"></i></span></button></span> ' +
            '<span id="printPage"><button onclick="window.print()" class="dropbtn" tabIndex="0" title="print page" aria-label="print page"><span class="icon"><i class="fa-solid fa-print"></i></span></button></span> ' +

            ai_toggle_button + // AI task UI toggle

            // AI task actions
            '<div id="ai-tasks" style="display:none;">' + 

              '<div id="aiChat"><button onclick="gotoChat(false)" onauxclick="gotoChat(true)" class="dropbtn" tabIndex="0" title="AI chat" aria-label="AI chat"><span class="icon"><i class="fa-regular fa-comments"></i></span>&nbsp; <span id="tutor-style"></span> tutor</button> (ChatGPT)</div>' +
              '<div id="aiChat-related-topics"><button onclick="gotoChat(false, &quot;advisor-related-topics&quot;)" onauxclick="gotoChat(true, &quot;advisor-related-topics&quot;)" class="dropbtn" tabIndex="0" title="AI related topics" aria-label="AI related topics"><span class="icon"><i class="fa-solid fa-diagram-project"></i></span>&nbsp; related topics</button></div>' +
              '<div id="aiChat-examinator"><button onclick="gotoChat(false, &quot;examinator&quot;)" onauxclick="gotoChat(true, &quot;examinator&quot;)" class="dropbtn" tabIndex="0" title="AI examinator" aria-label="AI examinator"><span class="icon"><i class="fa-regular fa-circle-question"></i></span>&nbsp; examinator</button></div>' +
              //'<div id="aiSummary"><button onclick="gotoAI( false, &quot;summarization&quot; )" onauxclick="gotoAI( false, &quot;summarization&quot; )" class="dropbtn" tabIndex="0" title="AI generated summary" aria-label="AI generated summary"><span class="icon"><i class="fa-regular fa-file-lines"></i></span>&nbsp; summary (local)</button></div>' +
              //'<div id="aiQA"><button onclick="gotoAI( false, &quot;question-answering&quot; )" onauxclick="gotoAI( false, &quot;question-answering&quot; )" class="dropbtn" tabIndex="0" title="AI question-answering" aria-label="AI question-answering"><i class="fa-regular fa-circle-question"></i></span>&nbsp; QA (local)</button></div>' +

            '</div>' +

            //summary_page_button +

            presentation_button +

            //talk_page_button +
            commons_page_button +
            '<span id="gotoWikipedia"><button onclick="gotoWikipedia()" onauxclick="gotoWikipedia( true )"class="dropbtn" tabIndex="0" title="go to Wikipedia" aria-label="go to Wikipedia"><span class="icon"><i class="fa-brands fa-wikipedia-w"></i></span></button></span> ' +
            wikidata_page_button +
            '<span id="otherLanguage"><button onclick="showWikipediaLanguages()" class="dropbtn active uls-trigger" tabIndex="0" title="article in other languages"> '  + language_display + '</button></span>' +

            language_variants_toggle_button + // language variant switcher

            // language-variant actions
            '<div id="language-variants" style="display:none;">' + 

              // FIXME: dynamically insert language-variants for other languages (also: use a dropdown?)
              '<div id="switch-to-zh"><button onclick="switchLanguageVariant(false, &quot;zh&quot;)" onauxclick="switchLanguageVariant(true, &quot;zh&quot;)" class="dropbtn" tabIndex="0" title="switch language variant" aria-label="switch language variant"><span id="writing-style-option">ZH</span> (traditional)</button></div>' +
              '<div id="switch-to-zh-cn"><button onclick="switchLanguageVariant(false, &quot;zh-cn&quot;)" onauxclick="switchLanguageVariant(true, &quot;zh-cn&quot;)" class="dropbtn" tabIndex="0" title="switch language variant" aria-label="switch language variant"><span id="writing-style-option">ZH-CN</span> (Mainland simplified)</button></div>' +
              '<div id="switch-to-zh-hk"><button onclick="switchLanguageVariant(false, &quot;zh-hk&quot;)" onauxclick="switchLanguageVariant(true, &quot;zh-hk&quot;)" class="dropbtn" tabIndex="0" title="switch language variant" aria-label="switch language variant"><span id="writing-style-option">ZH-HK</span> (Hong Kong traditional)</button></div>' +
              '<div id="switch-to-zh-mo"><button onclick="switchLanguageVariant(false, &quot;zh-mo&quot;)" onauxclick="switchLanguageVariant(true, &quot;zh-mo&quot;)" class="dropbtn" tabIndex="0" title="switch language variant" aria-label="switch language variant"><span id="writing-style-option">ZH-MO</span> (Macau traditional)</button></div>' +
              '<div id="switch-to-zh-my"><button onclick="switchLanguageVariant(false, &quot;zh-my&quot;)" onauxclick="switchLanguageVariant(true, &quot;zh-my&quot;)" class="dropbtn" tabIndex="0" title="switch language variant" aria-label="switch language variant"><span id="writing-style-option">ZH-MY</span> (Malaysia simplified)</button></div>' +
              '<div id="switch-to-zh-sg"><button onclick="switchLanguageVariant(false, &quot;zh-sg&quot;)" onauxclick="switchLanguageVariant(true, &quot;zh-sg&quot;)" class="dropbtn" tabIndex="0" title="switch language variant" aria-label="switch language variant"><span id="writing-style-option">ZH-SG</span> (Singapore simplified)</button></div>' +
              '<div id="switch-to-zh-tw"><button onclick="switchLanguageVariant(false, &quot;zh-tw&quot;)" onauxclick="switchLanguageVariant(true, &quot;zh-tw&quot;)" class="dropbtn" tabIndex="0" title="switch language variant" aria-label="switch language variant"><span id="writing-style-option">ZH-TW</span> (Taiwan style)</button></div>' +

            '</div>' +

          '</div>' +

          '<span id="main-content" class="screenreader-text" title="main content target" aria-label="main content target"></span>' +

          banner_html

      );

      $( 'body#wikipedia-content' ).html(
				html_ + 
        '<base target="_parent" />' + 

        '<script type="text/javascript" src="../wikipedia/dist/transform.js?' + explore.version + '"></script>' +

        raw_html +

        cathtml +

        '<script src="../explore2/dist/webcomponent/gbif-map.js?' + explore.version + '" type="module"></script>' +
        '<script src="../explore2/libs/sortable.js"></script>' +

        '<br><div id="legalnotice">This page is based on a <a target="_blank_" href="' + source_page + '">Wikipedia</a> article written by <a href="' + contributors_page + '">contributors</a>. The text is available under the <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> license; additional terms may apply. Images, videos and audio are available under their respective licenses.</div>' + 
        '</main><br><br><br>'

      );

			// on mobile hide some buttons
			if ( explore.isMobile ){
				$( '#gotoImages' ).hide();
				$( '#gotoBooks' ).hide();
				$( '#addToCompare' ).hide();
				$( '#printPage' ).hide();
			}

			if ( explore.isFirefox ){ // pause() does nothing with Firefox on Linux (what about Firefox on Windows?), so hide the pause-button
				$('#pauseButton').hide();
			}

			/*
      $( explore.baseframe ).attr({"data-title": title });
      $( explore.baseframe ).attr({"data-language": explore.language });
      $( explore.baseframe ).attr({"data-hash": hash_ });
      $( explore.baseframe ).attr({"data-font1": explore.font1 });
			*/

    },

  });

}

document.toggleFullscreen = function() {

  if ( screenfull.enabled ) {

    screenfull.toggle();

  }

  return 0;

};

function getLangCode3( lang2 ){

  let lang3 = undefined;

  for ( const [ code , langobj ] of Object.entries( explore.wp_languages )) {

    if ( lang2 === code ){

      lang3 = langobj.iso3;

			//console.log( langobj, lang3 );

      // TODO DRY this code
      explore.language_script = langobj.script;
      explore.language_name = langobj.name;

      if ( explore.voice_code.startsWith( explore.language ) ){
        // do nothing
      }
      else {

        explore.voice_code = langobj.voice || 'en-GB';

      }

      explore.langcode_librivox = langobj.librivox || 1;
      //setLanguageDirection(); // FIXME?

      // "Category" regexes
      explore.lang_category = langobj.namespaces.category;

      // TODO handle RTL-scripts like Arab for category-matching

      if ( explore.language_direction === 'rtl' ){

        //console.log('using RTL-direction for category matching');

        const c1 = ':' + explore.lang_category + '$';
        explore.lang_catre1 = new RegExp( c1, "g" );

        const c2 = '%3A' + explore.lang_category + '$';
        explore.lang_catre2 = new RegExp( c2, "g" );

        explore.lang_portal = langobj.namespaces.portal;
        const p1 = ':' + explore.lang_portal + '$';
        explore.lang_porre1 = new RegExp( p1, "g" );

        explore.lang_talk = langobj.namespaces.talk;
        const t1 = ':' + explore.lang_talk + '$';
        explore.lang_talkre = new RegExp( t1, "g" );

        //const t1 = ':' + explore.lang_talk + '$';
        //explore.lang_talkre = new RegExp( t1, "g" );

      }
      else {

        const c1 = '^' + explore.lang_category + ':';
        explore.lang_catre1 = new RegExp( c1, "g" );

        const c2 = '^' + explore.lang_category + '%3A';
        explore.lang_catre2 = new RegExp( c2, "g" );

        explore.lang_portal = langobj.namespaces.portal;
        const p1 = '^' + explore.lang_portal + ':';
        explore.lang_porre1 = new RegExp( p1, "g" );

        explore.lang_book = langobj.namespaces.book; // TODO
        const b1 = '^' + explore.lang_book + ':';
        explore.lang_bookre = new RegExp( b1, "g" );

        explore.lang_talk = langobj.namespaces.talk;
        const t1 = '^' + explore.lang_talk + ':';
        explore.lang_talkre = new RegExp( t1, "g" );

      }

      break;
    } 

  }

  return lang3;

}

function getNamefromLangCode2( lang2 ){

  let name = '';

  if ( explore.wp_languages.hasOwnProperty( lang2 ) ){

    name = explore.wp_languages[ lang2 ].namelocal;

  }

  return name;

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

function receiveMessage(event){

	//console.log('receiveMessage() called: ', event.data.data );

  if ( event.data.event_id === 'set-value' ){

	  //console.log( 'set-value: ', event.data.data[0], event.data.data[1] );
    explore[ event.data.data[0] ] = event.data.data[1];

    if ( event.data.data[0] === 'bread' ){

	    console.log( 'set-value: ', event.data.data[0], event.data.data[1] );

      if ( valid( event.data.data[1] ) ){ // turn on

        if ( valid( explore.bread ) && $('.bread').length === 0  ){ // not bolded yet --> bold wordparts

          processNode( document.querySelector('.mw-parser-output') );

        }

        $('.bread').attr('style', 'font-weight: bolder !important');
        //$('.bread').css('font-weight', 'bolder');

      }
      else { // turn off

        $('.bread').attr('style', 'font-weight: unset !important');
        //$('.bread').css('font-weight', 'normal');

      }

    }

  }
  else if ( event.data.event_id === 'pause-speaking' ){ // signal from main-app to pause any speech

    pauseSpeaking();

  }
  else if ( event.data.event_id === 'resume-speaking' ){ // signal from main-app to resume any speech

    resumeSpeaking();

  }
  else if ( event.data.event_id === 'stop-speaking' ){ // signal from main-app to stop any speech

    //console.log('wikipedia app: stop speaking');

    stopSpeaking();

  }
  else if ( event.data.event_id === 'goto' ){ // move text-cursor

    const fragment = '#:~:text=' + encodeURIComponent( event.data.data[0] );

		//console.log('goto fragment: ', fragment );

		window.location.hash = fragment;

  }

}

function showWikipediaLanguages() {
  //console.log('opening article ULS menu');
  //console.log( explore.languages );
}

function renderEmbeddedGbifMap( id, title ){

    //console.log( id, title );

    const height = explore.isMobile ? '300px' : '500px';

    const html = '<div class="section"><h2 class="map-gbif">' + explore.banana_native.i18n('app-title-occurence') + '</h2><gbif-map style="resize: both; overflow: auto; width:100%;height:' + height + ';" gbif-id="'+ id +'" gbif-title="'+ title + '" gbif-language="'+ explore.language +'" gbif-style="scaled.circles" center-latitude="30.0" center-longitude="13.6" controls ></gbif-map>';

    return html;

}

function pauseSpeaking(){

  explore.synth_paused = true;
  explore.synth.pause();

}

function stopSpeaking(){

  if ( valid( explore.synth ) ){

    explore.synth.cancel();

  }

  if ( typeof parentref.postMessage  === "function"){

    // also stop parent-frame speaking (if needed)
    parentref.postMessage({ event_id: 'stop-all-speaking', data: { } }, '*' );
    
  }

}

function cleanText( text ){

  if ( typeof text === undefined || typeof text === 'undefined' ){

    return '';

  }
  else {

    text = text.replace(/(\r\n|\n|\r|'|"|`|\(|\)|\[|\])/gm, '');

    while (text != (text = text.replace(/\{[^\{\}]*\}/gm, ''))); // remove math-element-noise
    //.replace(/ {displaystyle.*?} /gm, '');

    //console.log( text );

    return text;

  }

}

function resumeSpeaking(){

  if ( valid( explore.synth ) ){

    explore.synth_paused = false;
    explore.synth.resume();

  }

}

function startSpeaking( text ){

  parentref.postMessage({ event_id: 'show-loader', data: { } }, '*' );
  
  if ( ! valid( explore.synth ) ){ return 1; }

  if ( explore.synth_paused ){

    resumeSpeaking();

    return 0;

  }
  else if ( explore.synth.speaking ){ // something else is currently speaking

    if ( explore.firstVisit === true ){ // but dont stop it upon first visit

      //console.log( 'other speaker active upon first visit');
      explore.firstVisit = false;
      //return 0;

    }

    //console.log('already speaking, so cancelling first');
    stopSpeaking();
    //parentref.postMessage({ event_id: 'stop-parent-speaking', data: { } }, '*' );

  }

  explore.synth_paused = false;

  //console.log( text );

	if ( typeof text === undefined || typeof text === 'undefined' || text === '' ){ // speak full article

    text  = $('.mw-parser-output h2, h3, h4, h5, h6, p:not(table p), ul:not(table ul), li:not(table li), dl:not(.navbox-block dl), dd:not(.navbox-block dd)').clone()
          .find( explore.tts_removals ).remove()
          .end().text()

    //console.log( text );

    text = $('h2:first').text() + text;

	}
	else { // speak article section

	}

  text = cleanText( text );

	//console.log( text );

  let utterance   = new SpeechSynthesisUtterance( text );

	utterance.lang  = explore.voice_code;
	utterance.rate  = explore.voice_rate;
	utterance.pitch = explore.voice_pitch;

	//if ( explore.synth.speaking ){
		// do nothing, already speaking
	//}
	//else {
		explore.synth.speak( utterance );
	//}

  parentref.postMessage({ event_id: 'hide-loader', data: { } }, '*' );

}
