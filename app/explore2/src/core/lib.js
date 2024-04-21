'use strict';

async function setupAIChat(){

  $('#ai-chat-container').html( `<iframe id="aichat" class="resized" title="AI chat" role="application" loading="lazy" style="min-height: 401px" src="https://${explore.host}/app/chat/?l=${explore.language}&t=${explore.tutor}" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen="" allow-downloads="" width="95%" height="100%" loading="lazy">`);

}

async function setupInfiniteScroll(){

	const sentinel = document.querySelector('.sentinel'); // intersection-observer sensor

	// see: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
	let intersectionObserver = new IntersectionObserver( entries => {

		if ( entries[0].intersectionRatio <= 0 ) { // sentinel out of view
			return;
		}

    $('#loader').show();

		loadNextPage(); // load in more results (if any)

	});

	intersectionObserver.observe( sentinel );

}

const loadNextPage = async function() {

  if ( explore.searchmode === 'wikidata' ){ // wikidata-structured-query

    $('#blink').show();

    explore.page += 1; // increment page
    const offset = ( explore.page - 1 ) * datasources.wikidata.pagesize;

    explore.wikidata_query = explore.wikidata_query.replace( /OFFSET%20.*%20LIMIT/, 'OFFSET%20' + offset + '%20LIMIT');

    // only fetch and render next-pages (since the first page was already fetched)
    if ( explore.page > 1 ){

      let topicResults = await fetchWikidataQuery();

      //console.log( 'explore.totalRecords structured query: ', explore.totalRecords );
      topicResults[0].value[0].source.data.query.searchinfo.totalhits = explore.totalRecords;

      renderTopics( { 'wikidata' : { data: topicResults[0] } } );

    }

  }
  else { // string-based search

    explore.q = getSearchValue();

    let combined_pagesize = 0; // reset

    $.each( explore.datasources, async function( index, source ){ // for each active datasource

      if ( ! datasources[ source ].done ){

        combined_pagesize += parseInt( datasources[ source ].pagesize );

      }

    });

    //console.log( 'combined_pagesize: ', combined_pagesize );

    const relative_done   = explore.totalRecords / ( combined_pagesize *  explore.page ); 

    const no_more_results = ( Math.max( Math.ceil( relative_done ), 1) === 1 );
    
    if ( no_more_results ){

    	$('#loader').hide();

    }
    else {

      $('#blink').show();

      explore.page += 1;

      explore.type = 'string';

      loadTopics( true ); // "true" indicates loading a follow-up page

    }

  }

}

async function applyFont( font ){

	explore.font1 = font; // store new font

  (async () => { await explore.db.set( 'font1', explore.font1 ); })();

	$('#fontlink').replaceWith( '<link id="fontlink" href="https://fonts.googleapis.com/css?family=' + explore.font1 + ':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">' );
  $( explore.baseframe ).contents().find('#fontlink').replaceWith( '<link id="fontlink" href="https://fonts.googleapis.com/css?family=' + explore.font1 + ':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">' );

  // activate font on parent-body
	$('body').css( 'font-family', explore.font1 , '');
	$('.article-title.linkblock').css( 'font-family', explore.default_font, 'important');
	$('body').css( 'font-size', explore.fontsize + 'px' );

  // TODO: make fontsize also work in splitframes

  // activate font on iframe
  $( explore.baseframe ).contents().find('body').css( 'fontFamily', explore.font1 , '');

}

async function setupFonts(){

	// font type
	explore.font1 = ( explore.font1 === null || explore.font1 === undefined ) ? explore.default_font : explore.font1;

  applyFont( explore.font1 );

	$('#font1').fontselect().on('change', function() {

    let font = this.value.replace(/\+/g, ' '); // replace + signs with spaces for css
    font = font.split(':'); // split font into family and weight
		applyFont( font[0] );

	});

  $('#selectedfont').text( explore.font1 );

  // detect default fontsize
  if ( !explore.isMobile ){ // desktop computer

    if ( window.innerWidth < 1300 ){
      explore.default_fontsize = explore.default_fontsize_small_desktop;
    }
    else if ( window.innerWidth < 1600 ){
      explore.default_fontsize = explore.default_fontsize_medium_desktop;
    }
    else { // smaller desktop screen
      explore.default_fontsize = explore.default_fontsize_large_desktop;
    }

  }

  explore.fontsize = ( explore.fontsize === undefined || explore.fontsize === null || explore.fontsize === 'null' || isNaN( explore.fontsize ) ) ? explore.default_fontsize : explore.fontsize;

  (async () => { await explore.db.set( 'fontsize', explore.fontsize ); })();

	// set font size
	$('body').css( 'fontFamily', explore.font1 , 'important');
	$('body').css( 'fontWeight', explore.fontsize + 'px' );

  // sync UI value
  $('#fontsizer').val( explore.fontsize );
  $('#fontsize').text( explore.fontsize );

  // set default fontsize
  $('body').css('font-size', explore.fontsize + 'px');
  //$( explore.baseframe ).contents().find("body").css('font-size', explore.fontsize + 'px'); // FIXME not needed?

  // change fontsize
	$('#fontsizer').on('input', function () {

		explore.fontsize = $(this).val();

    $('#fontsize').text( explore.fontsize );
    (async () => { await explore.db.set( 'fontsize', explore.fontsize ); })();

		$('body').css('font-size', explore.fontsize + 'px');
    $( explore.baseframe ).contents().find("body").css('font-size', explore.fontsize + 'px'); // FIXME not needed?

    resizeFont();

	});

  // apply link colors
	explore.linkcolor = ( explore.linkcolor === null || explore.linkcolor === undefined ) ? 'inherit' : explore.linkcolor;
	explore.linkbgcolor = ( explore.linkbgcolor === null || explore.linkbgcolor === undefined ) ? 'inherit' : explore.linkbgcolor;

  $( explore.baseframe ).contents().find('a.link').css( 'color', explore.linkcolor , 'important');
  $( explore.baseframe ).contents().find('a.link').css( 'background', explore.linkbgcolor , 'important');

}

function setupSwiping(){

  if ( explore.isMobile ){

		explore.swiper = new Swiper(".swiper-container", {
			slidesPerView: 1,
			spaceBetween: 30,
			autoHeight: true,
			keyboard: {
				enabled: true,
			},
			pagination: {
				el: ".swiper-pagination",
				clickable: true,
			},
			navigation: {
				nextEl: ".swiper-button-next",
				prevEl: ".swiper-button-prev",
			},
		});

		$('[aria-label="Go to slide 1"]').css( 'background-image', 'url("' + explore.base + '/app/explore2/assets/images/icon_home.png")' );
		$('[aria-label="Go to slide 1"]').css( 'background-size', 'contain' );

    // TODO: by default hide unused slides
		//$('[aria-label="Go to slide 3"]').hide();
		//$('[aria-label="Go to slide 4"]').hide();

		// check which slides are active upon each sliding-action,
		explore.swiper.on("slideNextTransitionStart", function() { updateSlideAvalability(); });
		explore.swiper.on("slidePrevTransitionEnd", function() { updateSlideAvalability(); });

	}

}

function updateSlideAvalability(){

	// 0 nav
	// 1 primary content frame
	// 2 secondary content frame 1
	// 3 secondary content frame 1

	if ( explore.swiper.realIndex >= explore.swiperLimit ) {
		explore.swiper.allowSlideNext = 0; // disable sliding
	}
	else {
		explore.swiper.allowSlideNext = 1; // enable sliding
	}

}

function triggerQueryForm(){

  if ( explore.q.charAt(0) === '!' ){ // command query

    explore.page = 1; // reset page position

    $('#pager').hide();

    let s = explore.q;

    $('#srsearch').val( explore.q );
    explore.q = getSearchValue();

    $('.submitSearch').click(); // trigger submit

  }
  else if ( explore.commands !== '' ){ // editor commands

    let check = setInterval(function() {

     if ( $('textarea.ace_text-input').length > 0 ) {

        clearInterval( check );

        // insert editor command
        //explore.editor.setValue( beautify( explore.commands ) );
        explore.editor.setValue( explore.commands );

				runEditorCode( explore.commands );

        updateSidebar( explore.q );

        // setup presentation TTS element FIXME: not yet working
        if ( valid( explore.q ) ){

          const tts_start = document.getElementById( 'presentation-tts-start' );

          tts_start.onclick = function(){

            const section = $('#presentation-tts-sections').val();

            if ( valid( section ) ){ // speak section

              startSpeakingArticle( explore.q, '', explore.language, section );

            }
            else { // speak article

              startSpeakingArticle( explore.q, '', explore.language );

            }

          }

          // FIXME: we need to get a Qid from the URL
          const qid_ = valid( explore.qid )? explore.qid : getParameterByName( 'i' );

          insertPresentationSections( explore.q, qid_, explore.language );

          startSpeakingArticle( explore.q, '', explore.language );
        }

     }
     else  {

      console.log('waiting for command editor...');

     }

    }, 1000);

  }
  else if ( explore.query !== '' ){ // structured-query

    $('#structured-search').prop('checked', true).change();

    //console.log('structured query');

    let check = setInterval(function() {

     if ( $('.querybuilder__run button').length > 0 ) {

        clearInterval( check );

        //explore.query_run = false;

        $('.querybuilder__run button').click();

     }
     else  {

      console.log('waiting for query-builder...');

     }

    }, 1000);

    // try to render content-pane too
    handleClick({
      id        : 'n1-0',
      type      : explore.type,
      title     : explore.q,
      language  : explore.language,
      qid       : explore.qid,
      gid       : explore.gid,
      url       : explore.uri,
      tag       : '',
      languages : '',
      custom    : explore.custom,
      target_pane : 'p1',
    });

  }
  else if ( explore.type === 'presentation' && explore.qid !== '' ){ // presentation request from Qid

    console.log('make presentation from Qid: ', explore.qid );
   
    makePresentation( explore.qid );

  }
  else if ( explore.type === 'presentation' && explore.q !== '' ){ // presentation request from title

    console.log('make presentation from title: ', explore.q );
   
    makePresentation( explore.q );

  }
  else if ( explore.type === 'geospatial' && explore.custom !== '' ){ // geo-search request

    if ( valid( [ getParameterByName('u'), explore.custom ] ) ){

      runQuery( '', getParameterByName('u') );

    }

  }
  else if ( explore.type === 'doi' && explore.custom !== '' ){ // DOI-search request

    if ( isDOI( explore.custom.trim() ) ){

      const doi   = explore.custom.trim();

      doDOISearch( doi );

    }

  }
  else if ( explore.q !== ''){ // normal query

    explore.searchmode = 'string';

    explore.page = 1; // reset page position

    $('#pager').hide();

    explore.q = explore.q.trim().replace('/\/|\\|?/g','').replace(/&quot;/g, '"');

    $('#srsearch').val( explore.q );
    explore.q = getSearchValue();

    if ( explore.isSafari ){ console.log('triggerQueryForm() ', explore.q ); }

    $('.submitSearch').trigger('click'); // synthetic trigger submit

    //console.log('trigger form: ', explore.q, explore.type, explore.qid, explore.gid, explore.uri );

    /*
    if ( explore.type !== 'string' && explore.type !== '' ){

      handleClick({
        id        : 'n1-0',
        type      : explore.type,
        title     : explore.q,
        language  : explore.language,
        qid       : explore.qid,
        gid       : explore.gid,
        url       : explore.uri,
        tag       : '',
        languages : '',
        custom    : explore.custom,
        target_pane : 'p1',
      });

    }
    */

  }
  else if ( explore.q === '' && explore.type === 'wikipedia-qid' && explore.qid !== '' ){ // wikipedia-qid query

    explore.searchmode = 'string';

    let qid = '';

    if ( !explore.qid.startsWith('Q') ){
      explore.qid = 'Q' + explore.qid; // add 'Q' to qid string
    }

    qid = explore.qid;

    resetIframe();

    // TODO: use async-await
    let promiseB = fetchLabel([ qid ], explore.language ).then(function(result) {

      let label = '';

      if ( result.entities[ qid ]?.labels[ explore.language ] ){ // with label

        label = result.entities[ qid ].labels[ explore.language ].value;

        // show results
        handleClick({ 
          id        : 'n1-0',
          type      : 'articles',
          title     : label,
          language  : explore.language,
          qid       : '' + qid,
          url       : '',
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p0',
        });

        // try to show a single wikipedia page derived from this qid
        handleClick({
          id        : 'n1-0',
          type      : 'wikipedia-qid',
          title     : label,
          language  : explore.language,
          qid       : '' + qid,
          url       : '',
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p1',
        });

      }
      else { // without label

        handleClick({ 
          id        : 'n1-0',
          type      : 'wikipedia-qid',
          title     : '',
          language  : explore.language,
          qid       : '' + qid,
          url       : '',
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p1',
        });

      }

    });

  }
  else if ( explore.q === '' && explore.type === 'bookmark' ){ // extension text-fragment bookmark-add request

    addBookmark( new CustomEvent( 'build', { } ), 'extension' );

  }
  else if ( explore.type === 'compare' ){ // compare request  && explore.compares !== []

    console.log('showing compare');

    explore.searchmode = 'string';

    resetIframe();

    // try to show a single wikipedia page derived from this qid
    explore.custom = explore.compares;

    if ( explore.compares.length >= 2 ){

      showCompare();

      /*
      handleClick({ 
        id        : 'n1-0',
        type      : 'compare',
        title     : explore.q.trim(),
        language  : explore.language,
        qid       : '',
        url       : '',
        tag       : '',
        languages : '',
        ids       : explore.compares.join(),
        custom    : '',
        target_pane : 'p1',
      });
      */

      //explore.custom = '';

    }

  }
  else { // no query, show intro screen

    showStartPage();

  }

}

async function newSearch(){

  explore.searchmode    = 'string';
  explore.type          = '';

  $('#srsearch').val('');
  $('#srsearch').focus();

  explore.tabsInstance.select('tab-topics');

}

async function showStartPage(){

  explore.searchmode    = 'string';
  explore.type          = '';
  explore.hash          = '';

  $('#srsearch').val('');
  $('#srsearch').focus();
  $('#tab-topics .overflow-container').scrollTop(0);

  if ( valid( explore.tab ) ){
    explore.tabsInstance.select( explore.tab );
    explore.tab = '';
  }
  else {
    explore.tabsInstance.select('tab-topics');
  }

  let title = 'home - Conzept encyclopedia';

  document.title = title;
  $('title').text( title );

  // reset meta-tags
  $('meta[property="og:title"]').attr('content', title );
  $('meta[property="twitter:title"]').attr('content', title );

  const description = 'Conzept is an attempt to create an encyclopedia for the 21st century. A modern topic-exploration tool based on Wikipedia, Wikidata, Open Library and many other information sources.';

  $('meta[name=description]').attr('content', description );
  $('meta[property="og:description"]').attr('content', description );
  $('meta[property="twitter:description"]').attr('content', description );

  const url = 'https://' + explore.host + explore.base + '/explore?l=' + explore.language + '#' + explore.hash;

  $('link[rel=canonical]').attr('href', url );
  $('meta[property="og:url"]').attr('content', url );
  $('meta[property="twitter:url"]').attr('content', url );

  history.pushState({ id: 'home' }, 'conzept explore', url );

  setDefaultDisplaySettings();

}

async function setupKeyboardNavigation(){

    document.addEventListener('keyup', e => {

      explore.keyboard_ctrl_pressed = false;

    });

    document.addEventListener('keydown', e => {

      if ( e.key === 'Control' || e.which == '17' ){

        explore.keyboard_ctrl_pressed = true;

      }

      const exclude_from_navigation = [ 'INPUT' ];

      //console.log( $(document.activeElement).prop('nodeName') );
      // exclude some (already keybinding) form-elements from this keyboard-navigation
      if ( ! exclude_from_navigation.includes( $(document.activeElement).prop('nodeName') ) ){

        if (e.key === 'ArrowDown' ) { // go to next topic

          if ( $( '#' + explore.topic_cursor ).next().length ){ // topic exists

            if ( $( '#' + explore.topic_cursor ).next().is(":visible") ){ // and is not hidden

              $('#results details').removeAttr("open"); // needed to position the cursor correctly
              explore.topic_cursor = $( '#' + explore.topic_cursor ).next().attr('id');
              $( '#' + explore.topic_cursor )[0].scrollIntoView({block: 'center'});
              $( '#' + explore.topic_cursor + ' a').first().focus();

            }

          }

        }

        if ( e.key === 'ArrowUp' ) { // go to previous topic

          if ( $( '#' + explore.topic_cursor ).prev().length ){ // topic exists

            if ( $( '#' + explore.topic_cursor ).prev().is(":visible") ){ // and is not hidden

              $('#results details').removeAttr("open"); // needed to position the cursor correctly
              explore.topic_cursor = $( '#' + explore.topic_cursor ).prev().attr('id');
              $( '#' + explore.topic_cursor )[0].scrollIntoView({block: 'center'});
              $( '#' + explore.topic_cursor + ' a').first().focus();

            }

          }

        }

        if (e.key === 'ArrowRight') { // move to content-pane

          if ( $( explore.baseframe ).contents().find('html').length ){ // content-pane exists

            if ( $( explore.baseframe ).contents()[0].baseURI.startsWith( 'https://' + explore.host ) ){ // local iframe URL

              $( explore.baseframe ).contents().find('a').first().focus();

            }

          }

        }

      }

	  }
  );

}

async function setupKeyboardCombos(){

  // see:
  //  https://github.com/RobertWHurst/KeyboardJS
  //  https://www.jqueryscript.net/other/jQuery-Plugin-For-Scrolling-Content-with-Arrow-Keys-keyscroll.html

  keyboardJS.bind('f', function(e) {

		// only go on if no input/editor-element has focus!
    if (	!($('input').is(':focus')) && !($('.ace_text-input').is(':focus')) ){
      toggleFullscreen();
    }

  });

  keyboardJS.bind('alt+x', function(e) {
    newSearch();
  });

  keyboardJS.bind('alt+y', function(e) {
    toggleSidebar();
  });

  keyboardJS.bind('alt+i', function(e) {
    //e.preventRepeat();
    addBookmark(event, 'clicked' );
  });

  keyboardJS.bind('alt+r', function(e) {
    showRandomQuery();
  });

}

async function auxClick( e ) {

  if ( typeof e.parentElement.attributes.getNamedItem('onClick').value === null || typeof e.parentElement.attributes.getNamedItem('onClick').value === undefined ){
    // do nothing
  }
  else {

    let hc_string = e.parentElement.attributes.getNamedItem('onClick').value; // get string
    let args      = hc_string.replace(/handleClick\(/g, '').slice(0, -1); // cleanup string
    args          = args.split(',');

    // create new URL from args
    let url = '/explore/';

    // handleClick (  0:id,   1:type,  2:title,                   3:lang, 4:url,                                                                    5:qid,      6:tag, 7:languages ) {
    //               "n1-0",  "link" , "Vanessa Benelli Mosell" , "en" ,  "https://commons.m.wikimedia.org/wiki/Category:Vanessa Benelli Mosell" ,  "4008536"

    // title
    if ( valid( args[2] ) ){
      url += args[2].trim().replace(/"/g, '');
      url += '?';
    }

    // type 
    if ( valid( args[1] ) ){
      url += '&t=' + args[1].trim().replace(/"/g, '');
    }

    // language
    if ( valid( args[3] ) ){
      url += '&l=' + args[3].trim().replace(/"/g, '');
    }

    // url
    if ( valid( args[4] ) ){
      url += '&u=' + args[4].trim().replace(/"/g, '');
    }

    // identifier
    if ( valid( args[5] ) ){
      url += '&i=' + args[5].trim().replace(/"/g, '');
    }

    // sidebar
    if ( explore.show_sidebar ){
      url += '&s=true';
    }
    else {
      url += '&s=false';
    }

    openInNewTab( url );

  }

}

function init() {

  // setup wikibase library
  window.wbk = WBK({
    instance:       datasources.wikidata.instance,
    sparqlEndpoint: datasources.wikidata.endpoint,
  })

	window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

	// handle broadcast messages
	explore.broadcast_channel.onmessage = (event) => {

		console.log( 'broadcast message: ', event.data );

		if ( event.data === 'update_bookmark_view' ){

			// re-render bookmarks
			updateBookmarks();

		}

	};


  // simple number padding
  Number.prototype.pad = function(size) {
    let s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
  }

  window.addEventListener("message", receiveMessage, false);

  // MIME-type hack: https://stackoverflow.com/questions/2618959/not-well-formed-warning-when-loading-client-side-json-in-firefox-via-jquery-aj
  $.ajaxSetup({beforeSend: function(xhr){ if (xhr.overrideMimeType) { xhr.overrideMimeType("application/json"); } } });

  // build the supported-languages object for the ULS widget
  for ( const [ code , langobj ] of Object.entries( explore.wp_languages )) {
    explore.uls_languages[ code ] =  langobj.name + ' - ' + langobj.title;
  }

  /*
  if ( explore.direct === true || explore.direct === 'true' ){
    explore.direct = true;
  }
  else {
    explore.direct = false;
  }
  */

  // pre-construct the HTML tag-select options, so we only have to do this once
  explore.osm_tag_options += '<option value=""></option>';

  $.each( osm_tags, function ( i, v ) {

    const label = v.value.replace('Tag:', '').replace('=', ' : ').replace(':', ' : ').replace('_', ' ') + ' : ' + v.label;

    explore.osm_tag_options += '<option value="' + v.value.replace('Tag:', '') + '">' + label + '</option>';

  });

  explore.date_tag_options += '<option value=""></option>';

  let date_tags = Array.from({length: 2021}, (v, k) => k+1);

  date_tags.push( '2000s', '1900s', '1800s', '1700s', '1600s', '1500s', '1400s', '1300s', '1200s', '1100s', '1st century', '2nd century', '3rd century', '4th century', '5th century', '6th century', '7th century', '8th century', '9th century', '10th century', '11th century', '12th century', '13th century', '14th century', '15th century', '16th century', '17th century', '18th century', '19th century', '20th century', 'middle ages', 'prehistory', 'ancient', 'history', 'modern' );

  date_tags = date_tags.sort((a, b) => a - b).reverse();

  $.each( date_tags, function ( i, v ) {

    explore.date_tag_options += '<option value="' + v + '">' + v + '</option>';

  });

  // temporary toggle the icon class
  $('#add-bookmark').on("click", function () {
  
    $('#bookmarkIcon').addClass('fas');
    setTimeout( removeBookmarkClass, 4000);

  });

  // add hexagonal-covers list
  //if ( explore.language === 'en' || explore.language === 'simple' ){

    // FIXME:
    //  - make this language-independent with Qid's
    //  - allow other lists to be created from a SPARQL-based query
    //  - make this also work for mobile
    $( '#hexpages' ).html(
        '<li><a title="1000 essential articles" href="' + explore.base + '/app/coverhex/1000_essential_articles.html" target="infoframe"><span class="icon"><i class="fa-brands fa-first-order"></i></span> 1000 essential articles</a></li>' + 
        '<li><a title="100 non-western artists" href="' + explore.base + '/app/coverhex/artists.html" target="infoframe"><span class="icon"><i class="fa-brands fa-first-order"></i></span> 100 non-western artists</a></li>'
    );

  //}

  let cover_topic_html = '';

  $.each( cover_topics, function ( i, v ) {

    cover_topic_html += '<option value="' + v + '">' + v + '</option>'; // TODO: how to translate the label in all languages?

  });

  $('#covertopic').append( cover_topic_html );

}

function removeBookmarkClass(){

  $('#bookmarkIcon').removeClass('fas')

}

function renderBookmarks(){

  const t = $('#tree');

	// see: https://mbraak.github.io/jqTree/
	t.tree({

		data: explore.bookmarks,
		//saveState: true, // FIXME not yet working, see also: https://mbraak.github.io/jqTree/examples/04_save_state/
		buttonLeft: false,
		autoOpen: false,
		slide: false,

		// https://stackoverflow.com/questions/18376165/remove-node-by-id-in-jstree-when-button-is-clicked
		closedIcon: $('<span class="icon"><i class="fa-solid fa-plus"></i></span>'),
		openedIcon: $('<span class="icon"><i class="fa-solid fa-minus"></i></span>'),
		dragAndDrop: true,
		onCreateLi: function(node, $li, is_selected) {

			let icon = '';

			if ( valid( node.datasource ) ){ // datasource item

        if ( node.datasource === 'raw' ){ // raw-item

          icon = '<sub>' + node.language + '</sub> &nbsp;';

        }
        else { // real topic item

          icon = '<small>' + datasources[ node.datasource ].icon + '</small><sub>' + node.language + '</sub> &nbsp;';

        }

			}
      /*
			else if ( node.type === 'video' ){
				icon = '<span class="icon"><i class="fa-solid fa-video"></i></span>';
			}
			else if ( node.type === 'music' ){
				icon = '<span class="icon"><i class="fa-brands fa-itunes-note"></i></span>';
			}
			else if ( node.type === 'images' ){
				icon = '<span class="icon"><i class="fa-regular fa-images"></i></span>';
			}
			else if ( node.type === 'book' || node.type === 'archive-book-pdf' || node.type === 'archive-book-html' ){
				icon = '<span class="icon"><i class="fa-solid fa-book-open"></i></span>';
			}
			else if ( node.type === 'archive' ){
				icon = '<span class="icon"><i class="fa-solid fa-archive"></i></span>';
			}
			else if ( node.type === 'websearch' ){
				icon = '<span class="icon"><i class="fa-brands fa-searchengin"></i></span>';
			}
			else if ( node.type === 'compare' ){
				icon = '<span class="icon"><i class="fa-solid fa-equals"></i></span>';
			}
      */
			else if ( node.type === 'url' ){
				icon = '<span class="icon"><i class="fa-solid fa-up-right-from-square"></i></span>';
			}
			else { // link, link-split, ...
				icon = '<span class="icon"><i class="fa-solid fa-link"></i></span><sub>' + node.language + '</sub>';
			}

			$li.find('.jqtree-title').before('<div class="bookmark-row">');

			$li.find('.jqtree-title').after(node.custom_b);

			$li.attr( 'tabindex' , '0');

			if ( node.id === 1 ){ // never show removal-button on root node
				// skip root node
			}
			else { // construct bookmark-element and its action-buttons

				let explore_button  = '';
				let tag_button      = '&nbsp;'; // '<span class="icon"><i class="fa-solid fa-o"></i></span>';
				let geo_button      = '&nbsp;';

				const qid           = valid( node.qid ) ? node.qid : '';
        const osm_relation_id = ''; // TODO: add this when a bookmark is added

				//if ( node.type === 'string' ){ // for wikipedia-bookmark add an explore-button

					explore_button = '&nbsp;<a href="javascript:void(0)" aria-label="exploreBookmark" role="button" title="explore bookmark" onclick="exploreBookmark( event, &quot;' + node.id + '&quot;)" class="bookmark-explore" data-node-id="'+ node.id +'"><span class="icon"><i class="fa-solid fa-retweet"></i></span></a> ';


				//}

				if ( valid( node.geo ) ){ // has a geo-location

          let lat = node.geo.split(';')[0];
          let lon = node.geo.split(';')[1];

          let geo_url = `${explore.base}/app/map/?l=${node.language}&bbox=${getBoundingBox( lon, lat, 0.05 )}&lat=${lat}&lon=${lon}&osm_id=${ valid( osm_relation_id )? osm_relation_id : "" }&qid=${qid}&title=${ encodeURIComponent( node.name ) }`;

          // FIXME: trigger click on lower element
					//geo_button = `<a title="show on map" target="infoframe" href="${ geo_url }"><i class="fa-solid fa-location-dot"></i></a> `;
					//geo_button = `<a title="show on map" aria-label="show on map" role="button" href="javascript:void(0)" onclick="openLink( event, &quot;${ geo_url }&quot; )"><i class="fa-solid fa-location-dot"></i></a> `;

				}

				if ( valid( node.tags ) ){ // has a tag class

					let tags = [];

          if ( ! Array.isArray( node.tags ) ){ // it is a comma-separated-string
            tags = node.tags.split(',');
          }
          else { // array of tags

            tags = node.tags;

          }

					// set tag_icon
					if ( valid( conzept_tags[ tags[0] ] ) ){ // found a matching main-tag, now also check the sub-tags

						let tag = conzept_tags[ tags[0] ];

						let tag_icon = '';

						if ( tags[1] !== '' ){ // a sub-tag is defined

							// check if there is a matching sub-tag object
							if ( valid( tag.sub[ tags[1] ] ) ){ // match

								tag = conzept_tags[ tags[0] ].sub[ tags[1] ];

								tag_icon = ' <i title="' + tag.text + '" class="tag-icon ' + tag.icon[0] + '"></i>';

								if ( valid( tag.icon[1] ) ){ // also add the second icon-symbol
									tag_icon += ' <i title="' + tag.text + '" class="tag-icon ' + tag.icon[1] + '"></i>';
								}

							}
							else { // no matching sub-tag object

								tag_icon = ' <i title="' + tag.text + '" class="tag-icon ' + tag.icon[0] + '"></i>';

								if ( valid( tag.icon[1] ) ){ // also add the second icon-symbol
									tag_icon += ' <i title="' + tag.text + '" class="tag-icon ' + tag.icon[1] + '"></i>';
								}

							}

						}
						else { // set icon from root-class

							tag_icon = ' <i title="' + tag.text + '" class="tag-icon ' + tag.icon[0] + '"></i>';

						}

						tag_button += tag_icon + ' ';

					}

        }

				// check bookmark-select status
				const bookmark_selected		= valid( node.selected )? 'selected' : ''; 
				const bookmark_icon_class = valid( node.selected )? 'fa-square-check' : 'fa-square'; 

				$li.find('.jqtree-title.jqtree_common ').prepend( explore_button + tag_button + geo_button + icon + '&nbsp;' );
				$li.find('.jqtree-element').append(
          '<a href="javascript:void(0)" aria-label="removeBookmark" role="button" title="remove bookmark" onclick="removeBookmark( event, &quot;' + node.id + '&quot;)" class="bookmark-remove" data-node-id="'+ node.id +'"><span class="icon"><i class="fa-solid fa-trash-alt"></i></span></a>' +
          '<a href="javascript:void(0)" aria-label="selectBookmark" role="button" title="select bookmark" onclick="event.stopPropagation(); selectBookmark( event, &quot;'+ node.id +'&quot;)" class="bookmark-select '+ bookmark_selected +'" data-node-id="'+ node.id +'"><span class="icon"><i class="fa-regular '+ bookmark_icon_class +'"></i></span></a>'
        );

				if ( valid( node.images ) ){ // has an image-url

          //console.log( node.images );

          $.each( node.images, function( index, image ){

            if ( valid( image ) ){

              if ( image.startsWith( 'http' ) ){

                const image_iiif_url = createImageIIIF( node.name, image );

                $li.append(
                  `<div class="bookmark-image-container"><img class="bookmark-image" src="${ image }" onclick="resetIframe(); openLink( &quot;${ image_iiif_url }&quot; )"></div>`

                );

              }
              else {

                const dataStr   = JSON.stringify( image ); // stringify the binary data
                const blob      = new Blob( [dataStr] );   // create a blob object
                const blob_url  = URL.createObjectURL( blob );

                //const image_iiif_url = createImageIIIF( URL.createObjectURL( blob ) );

                $li.append(

                  `<div class="bookmark-image-container"><img class="bookmark-image" src="${ image }" onclick="resetIframe(); openInFrame( &quot;/app/blob/index.html?img=${ blob_url }&quot; )"></div>`

                );

              }

            }

          });

        }

			}

			$li.find('b').after( node.custom_i + '</div>' );
			$li.attr('id', node.id);
			$li.attr('data-type', node.type);
			$li.attr('title', `${node.name} (${ valid(node.datasource)? node.datasource : 'link view'}, ${node.language})` );
			$li.attr('data-select', false );

			// ENTER-key 
			$li.keypress( function( event ){

				// FIXME
				if ( event.which === 13 ){
					console.log('bookmark ENTER keypress');
					$li.click();
				}

			});

      /*
			// bookmark-search filtering
			var searchValue = $('#bookmark-search').val().toLowerCase();
			var nodeValue = $li.find('.jqtree-title').text().toLowerCase();

			if ( $li.find('.jqtree-toggler').length == 0){ // child (leaf)

				if (nodeValue.indexOf(searchValue) == -1){ // child mismatch

					$li.find('.jqtree-title').parent().hide(); // hide child
					$li.find('.jqtree-title').parent().siblings('.bookmark-image-container').hide(); // hide bookmark-images

				}
				else { // child match

					// show child and all parent folders, down to root
					for (var i = node.parent.getLevel() ; i > 0; i--) {
							$(node.parent.element).find("div").first().show();
							node.parent = node.parent.parent;
					}

				}

			}
			else { // folder

					$li.find('.jqtree-element').hide(); // initially hide all folders

			}
      */

		}

	});

  updateSelectedBookmarksCounter();

  /*
  $('#bookmark-search').keyup(function () {

    console.log('key up');

    clearTimeout(thread);
    let searchVal = $(this).val();
    thread = setTimeout( function () {

      console.log('reload new bookmark list');
      $('#tree').tree('loadData', explore.bookmarks );

    }, 500);

  });
  */


	/*
	// triggered when a tree node is selected or deselected.
	t.on( 'tree.select', function(event) {

			if ( event.node ){ // node was selected

				let node = event.node;
				console.log( 'bookmark selected: ', node.name, node.id );

			}
			else { // a node was deselected

				// event.previous_node contains the deselected node
				let node = event.previous_node;
				console.log( 'bookmark deselected: ', node.name, node.id );

			}

		}

	);
	*/

}

/*
function openLink( event, url ){

	event.preventDefault();

	resetIframe();

	if ( valid( url ) ){

		$( explore.baseframe ).attr({ "src": url });

	}

}
*/

function setupBookmarks(){

  const t = $('#tree');

  // get stored bookmarks
  (async () => {

    explore.bookmarks = await explore.db.get('bookmarks');

    if ( explore.bookmarks === undefined ){ // no stored bookmarks found
      explore.bookmarks = [ { name: "my bookmarks", display: 'my bookmarks', url: explore.base + '/pages/blank.html', id: '1', language: 'en', type: 'none' }, ];
    }
    else { // stored bookmarks found
      explore.bookmarks = JSON.parse( explore.bookmarks );
    }

		renderBookmarks();

    t.bind(
      'tree.move',
      function(event) {
        event.preventDefault();
        event.move_info.do_move();
        (async () => { await explore.db.set('bookmarks', $('#tree').tree('toJson') ); })();
      }
    );

    // initially collapse all nodes
    //const $tree = $('#tree');

    //$('#collapse').click(function() {
      let tree = t.tree('getTree');

      tree.iterate(function(node) {

        if (node.hasChildren()) {
          t.tree('closeNode', node, true);
        }

        return true;

      });
    //});

  })();

  // bind left-mouse click 
  t.on( 'tree.click', function(event) { openBookmark( event, false ) } );

  // bind middle-mouse click
  t.on("auxclick", (event) => {

    if ( event.button === 1) {

      const node = t.tree("getNodeByHtmlElement", event.target);

      if (node) {

        event.node = node;

        openBookmark( event, true );

      }

    }

  });

  // TODO: bind right-mouse click
  //$('#tree').on( 'tree.contextmenu', function(event) { openBookmark( event, true ) } );

}

function openBookmark( event, newtab ) {

  let node = event.node; // clicked node

  //console.log( 'openBookmark', node );

  // items can be:
  //		URL (new handleClick type?) --> IF its an iframe-safe URL: load this URL in the link/link-split iframe(s)
  //		                            --> ELSE: load this URL in a new tab 
  //  	string											--> construct: datasource, type, title, language 

  // detect bookmark type

  let pattern = /^((http|https):\/\/)/;

  setLanguage ( node.language );

  let datasource = valid( node.datasource ) ? node.datasource : '';

  if ( valid( datasource ) ){

    updateActiveDatasources( [ datasource ]  );

  }
  else {

    updateActiveDatasources( [ 'wikipedia' ]  ); // fallback

  }

  if ( pattern.test(node.url) ) { // check if bookmark-type is a link (internal or external)

    if ( node.type === 'url' ){ // always open in new tab

      openInNewTab( node.url );

    }
    else if ( newtab ){ // user wants URL to open in a new tab

      const url = 'https://' + explore.host + explore.base + '/explore/' + encodeURIComponent( node.name ) + '?l=' + explore.language + '&t=link&u=' + encodeURIComponent( node.url );

      openInNewTab( url );

    }
    else {

      handleClick({ 
        id        : 'n1-0',
        type      : valid( node.type === 'link-split' )? 'link-split' : 'link',
        title     : node.name,
        language  : node.language,
        source    : datasource,
        qid       : '',
        url       : node.url,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

    }

  }
  else { // non-link bookmark: string / qid / gid

    //console.log( node );

    if ( node.datasource === 'wikipedia' ){ // wikipedia title-string

      if ( newtab ){

        const url = '/explore/' + encodeURIComponent( node.name ) + '?l=' + explore.language + '&t=string' + '#' + explore.hash;

        openInNewTab( url );

      }
      else {

        handleClick({ 
          id          : 'n1-0',
          type        : 'string',
          title       : node.name,
          language    : node.language,
          source      : datasource,
          qid         : '',
          url         : '',
          tag         : '',
          languages   : '',
          custom      : '',
          target_pane : 'p1',
        });

      }

    }
    else if ( valid( datasources[ node.datasource ]) ){ // some other datasource title / ID

      // TODO: QQQ use "qid" or "gid"

      //console.log( node.datasource, node );

      // URL-substitution variables
      let language    = node.language;
      let qid         = valid( node.qid )? node.qid : '';
      let gid         = valid( node.gid )? node.gid : '';

      let url_format  = datasources[ node.datasource ].display_url;
      let url         = eval(`\`${ url_format }\``);

      console.log( url );

      if ( newtab ){

        openInNewTab( url );

      }
      else {

        handleClick({ 
          id          : 'n1-0',
          type        : 'link',
          title       : node.name,
          language    : node.language,
          source      : datasource,
          qid         : valid( node.qid )? node.qid : '',
          gid         : valid( node.gid )? node.gid : '',
          url         : url,
          tag         : '',
          languages   : '',
          custom      : '',
          target_pane : 'p1',
        });

      }

    }

  }

}

function setupDatasourceSet(){

  if ( !valid( explore.datasource_set_selection ) || explore?.datasource_set_selection === 'none' ){ // no "datasource set" parameter set

    if ( valid( explore.datasource_selection ) ){ // no "datasource set", but "datasources" requested: dont use any datasource-set.

      explore.datasource_set            = '';
      explore.datasource_set_selection  = '';

      return 0;

    }
    else {

      (async () => { // check browser storage for "datasource set"

        let datasource_set = await explore.db.get( 'datasource_set' );

        if ( ! valid( datasource_set ) || datasource_set === 'null' || datasource_set === null ){ // no browser storage datasource-set found

        }
        else { // use browser storage datasource-set

          if ( datasource_sets.includes( datasource_set ) ){

            explore.datasource_set            = datasource_set;
            explore.datasource_set_selection  = datasource_set;

          }
          else { // unkown "datasource set" param

            explore.datasource_set            = '';
            explore.datasource_set_selection  = '';

          }

          setActiveDatasourceSet();

        }

      })();

    }

  }
  else { // valid datasource-set param

    setActiveDatasourceSet();

  }

}

function setActiveDatasourceSet(){
    
  if ( datasource_sets.includes( explore.datasource_set_selection ) ){ // valid set

    explore.datasource_set = explore.datasource_set_selection;

    // when "singleuse" is active, prevent permanently storing datasource-set
    if ( ! valid( explore.singleuse ) ){

      (async () => { await explore.db.set( 'datasource_set', explore.datasource_set ); })();

    }

    explore.datasource_selection = datasource_set_map[ explore.datasource_set ].join();

    //setActiveDatasources();

  }
  else {

    // reset datasource set
    explore.datasource_set        = '';
    explore.datasource_set_selection  = '';

    // when "singleuse" is active, prevent permanently storing datasource-set
    if ( ! valid( explore.singleuse ) ){

      (async () => { await explore.db.set( 'datasource_set', '' ); })();

    }

    setParameter( 'd', '', explore.hash );
    setParameter( 'ds', '', explore.hash );

    //setActiveDatasources();

  }

}

function setActiveDatasources(){

  explore.datasources = []; // reset

  if ( valid( explore.datasource_selection ) ){ // datasources requested

    $.each( explore.datasource_selection.split(',') , function( index, source ){ // for each active datasource

      if ( valid( datasources[source.trim()] ) ){

        let d = datasources[source.trim()];

        d.active = true;

      }

    });

    explore.datasource_selection = ''; // reset

    activateDatasources();

  }
  else { // no datasources requested

    if ( ! valid( explore.datasources ) ){

      (async () => { // first check browser storage for datasources

        let ds = await explore.db.get( 'datasources' );

        if ( ! valid( ds ) ){ // no browser storage datasources found

          // use default datasources
          explore.datasources = [ 'wikipedia', 'wikidata' ]; //TODO: define these defaults via the datasources.js file

        }
        else {

          explore.datasources = ds.split(',');

        }

        // activate datasources
        $.each( explore.datasources, function( index, source ){ // for each active datasource

          if ( valid( datasources[source] ) ){

            let d = datasources[source];

            d.active = true;

          }

        });

        activateDatasources();

      })();

    }

  }

}

function updateActiveDatasources( list ){

  explore.datasources = []; // reset

  // reset
  Object.keys( datasources ).forEach(( key, index ) => {

    let d = datasources[key];

    d.active = false;

  });

  // set again
  $.each( list, function( index, source ){

    if ( valid( datasources[source] ) ){

      let d = datasources[source];

      d.active = true;

    }

  });

  activateDatasources();

}

function activateDatasources(){

  Object.keys( datasources ).forEach(( key, index ) => {

    let d = datasources[key];

    if ( d.active ){

      explore.datasources.push( key );

    }

  });

  explore.datasources = [...new Set( explore.datasources )]; // remove any duplicates

  if ( !valid( explore.datasource_set ) || explore.datasource_set === 'none' ){ // no datasource-set

      setParameter( 'd', explore.datasources.join(','), explore.hash );

  }
  else {

      setParameter( 'ds', explore.datasource_set, explore.hash );

  }

  //`<span class="datasource-list-icon icon ${ valid( d.icon_invert )? 'invert' : '' }">${d.icon} </span>`;
  //$('#app-tab-topics-title').after( `<div id="show_datasources"> ${ show_datasources_html } </div>`);

  // when "singleuse" is active, prevent permanently storing the datasources
  if ( ! valid( explore.singleuse ) ){

    (async () => { await explore.db.set( 'datasources', explore.datasources.join(',') ); })();

  }

  setupOptionActiveDatasources(); // update datasource toggles

}

function renderResultSummary(){

  // indicate the active datasources in the topic-tab
  let search_results = [];
  let last_color = '';

  $.each( explore.datasources, function( index, source ){ // for each active datasource

    let d = datasources[ source ];
          last_color = valid( d.color )? d.color : getRandomColorHex();

    //console.log( index, source, d );

    search_results.push({

      title: d.name,
      value: valid( d.total )? parseInt( d.total ) : 0,
      color: last_color,

    });

  });

  //console.log( search_results.length, search_results );

  $(".pieTip").remove();
  $("#pieChart").empty();

  if ( search_results.length <= 1 ){

    // Hack, see: https://github.com/githiro/drawPieChart/issues/2
    search_results.push( { title: '', value : 0,  color: last_color });

  }
  else if ( search_results.length > 3 ){

    search_results = sortObjectsArray( search_results, 'value' );

  }

  $('#detail-result-summary').show();
  $("#pieChart").drawPieChart( search_results );

}

function setupOptionActiveDatasources(){

  let html    = '';
  let checked = '';

  Object.keys( datasources ).forEach(( key, index ) => {

    let d = datasources[key];

    if ( d.active ){

      checked = 'checked';

    }
    else {

      checked   = '';

    }

    html += `
      <div id="datasource-setting-${key}" class="switch ${d.set}">
        <label>
          <input type="checkbox" ${checked} id="datasource-${key}" onclick="toggleDatasource( &quot;${key}&quot;)">
          <span class="lever"></span>
          <span class="datasource-list-icon icon ${ valid( d.icon_invert )? 'invert' : '' }">${d.icon} </span>
          <span class="datasource-name"><a class="" title="more info" aria-label="more info" role="button" href="${explore.base}/app/wikipedia/?t=&l=${explore.language}&qid=${d.qid}&tutor=${explore.tutor}" target="infoframe">${d.name}</a></span>
          <span class="datasource-description"><a class="" title="more info" aria-label="more info" role="button" href="${explore.base}/app/wikipedia/?t=&l=${explore.language}&qid=${d.qid}&tutor=${explore.tutor}" target="infoframe">(${d.description})</a></span>
          <span class="datasource-set-label">${ valid( d.set )? explore.banana.i18n( 'app-menu-search-in-option-' + d.set ) : '' }</span>
        </label>
      </div>`;

  });

  $('#datasources-setting').html( html );

}

async function toggleDatasource( source ) {

  //if ( typeof event !== 'undefined' ){

    //if ( event.hasOwnProperty('originalEvent') ){ // user-click

      // clear the "datasource set"
      (async () => { await explore.db.set( 'datasource_set', '' ); })();
      explore.datasource_set            = '';
      explore.datasource_set_selection  = '';
      $('#search-in').val('none');

      setParameter( 'ds', '', explore.hash );

    //}

  //}

  // activate datasources
  if ( valid( datasources[ source ]) ){

    datasources[ source ].active = $( '#datasource-' + source ).prop("checked");

  }

  explore.datasources = []; // reset

  // collect active datasources
  Object.keys( datasources ).forEach(( key, index ) => {

    if ( datasources[ key ].active ){

      explore.datasources.push( key );

    }

  });

  explore.datasources = [...new Set( explore.datasources )]; // remove any duplicates

  if ( !valid( explore.datasource_set ) || explore.datasource_set === 'none' ){ // no datasource-set

      setParameter( 'd', explore.datasources.join(','), explore.hash );

  }
  else {

      setParameter( 'ds', explore.datasource_set, explore.hash );

  }

  // when "singleuse" is active, prevent permanently storing the datasources
  if ( ! valid( explore.singleuse ) ){

    (async () => { await explore.db.set( 'datasources', explore.datasources.join(',') ); })();

  }

}

async function fetchAutocompleteData( term ) {

  term = cleanText( term );
  term = term.replace(/&/g, ' ');

  let autocomplete_fetches = [];

  $.each( Object.keys( datasources), function( index, source ){ // for each active datasource

    let d = datasources[ source ];

    let filterby        = '';    // default
    let skip_datasource = false; // default

    let sortby          = '';

    //console.log('fetchAutocompleteData(): ');

    if ( valid( explore.filterby ) ){ // filter requested

      //console.log( '  filter requested: ', explore.filterby );

      if ( d.media.includes( explore.filterby ) ){ // filter-media-type is supported by the datasource
    
        //console.log( '  filter-media-type supported by datasource: ', d.name, explore.filterby );

        if ( valid( d.filter_map[ explore.filterby ] ) ){ // specific filter-parameter-mapping found

          filterby = d.filter_map[ explore.filterby ];

          //console.log( '    --> use this specific filter-parameter mapping: ', d.name, filterby );

        }
        else { // just use the datasource _as is_, no 

          // do nothing
          //console.log( '    --> use this datasource as is (but no custom "filterby" is needed!): ', d.name, filterby );

        }

      }
      else { // filter-media-type is NOT supported by the datasource

        skip_datasource = true;

      }

    }
    else { // no filter was set

      filterby = d.filter_map[ 'none' ]; // TODO: selects the default filter-value (IF the datasource url uses custom filters)

      //console.log( '  no filter requested:', d.name, filterby );

    }

    if ( valid( d.sort_map[ explore.sortby ] ) ){

      sortby = d.sort_map[ explore.sortby ];

    }
    else {

      sortby = d.sort_map[ 'none' ];

    }

    if ( valid( [ d.active, d.autocomplete_active, !skip_datasource ] ) ){ // active autocomplete

      autocomplete_fetches.push( $.ajax({

        url:      eval(`\`${ d.autocomplete_url }\``),
        dataType: d.autocomplete_connect,
        success:  function( data ) { },

      }) );

    }
    else { // disabled autocomplete: use a dummy promise query

      if ( skip_datasource ){
        //console.log( '  skipping datasource: ', d.name );
      }

      autocomplete_fetches.push( Promise.resolve([]) );

    }

  });

  // TODO: make this promise-handing dynamic (like was done with the result-data-fetching)

  let res     = '';
  let dataset = [];

  [ ...res ] = await Promise.all( autocomplete_fetches );

  res.forEach(( r, index ) => {

    //console.log( 'autocomplete: ', r, index, explore.datasources,  Object.keys( datasources)[ index ] );
    let d = datasources[ Object.keys( datasources)[ index ] ];

    if ( d.active ){ // only use at active datasources

      if ( r.length === 0 ){ // empty or disabled autocomplete
        // do nothing
      }
      else {

        if ( valid( d.code_autocomplete ) ){

          eval( `${ d.code_autocomplete }` );

        }

      }

    }

  });

  // FIXME: wikidata-only datasource, fails for autocomplete-results
  //console.log( 'dataset is now: ', dataset );

  // merge results
  let union = [...new Set( dataset.flat(1) )] // flatten and get the unique values

  return union;

}

function setupSearch() {

	// TODO is this more efficient?: https://stackoverflow.com/questions/8748559/how-does-jqueryui-autocomplete-handle-asynchronous-results

  $( '#srsearch, a.submitSearch' ).on( 'keyup', function( event ){

      explore.searchmode = 'string';

      if (event.which == 13) { // ENTER-key

          event.preventDefault();

          explore.topic_cursor = 'n1-1';

          // reset any structured-search query-data
          explore.query     = '';
          explore.hash      = '';
          explore.commands  = '';

          explore.type  = 'string'; // set to default type

          if ( explore.isSafari ){

            explore.q = getSearchValue();
            //$('#srsearch').val( ui.item.label );

            //console.log( 'Safari: ', explore.q,  getSearchValue() );

          }

          if ( explore.q.charAt(0) === '!' ){ // form-query-command

            if ( explore.q.startsWith( '!graph' ) ){ 
              console.log('graph query detected');
            }
            else if ( explore.q.startsWith( '!chat' ) ){ 
              console.log('chat query detected');
            }
            else if ( explore.q.startsWith( '!doi' ) ){ 
              console.log('DOI query detected');
            }

          }

          if ( explore.isMobile ){

            explore.preventSliding = true;

          }

          //$('.submitSearch').click();
          $('a.submitSearch').trigger('click');

          // TODO always close autocomplete-result upon ENTER
          $('.searchbox').autocomplete('close');

          // go to the results tab
          explore.tabsInstance.select('tab-topics');
      }

  });

  // jQueryUI autocomplete: http://api.jqueryui.com/autocomplete/
  //  bug on iOS? https://forum.jquery.com/topic/jqueryui-dialog-closes-immediately
  //  Wikipedia opensearch API: https://www.mediawiki.org/wiki/API:Opensearch
  $('.searchbox').autocomplete({

    source: function(request, response) {

      $('#blink').show();

			fetchAutocompleteData( request.term ).then(( union ) => {

        response( union ); // return the final autocomplete results

        $('#blink').hide();

			}).catch( error => {

				  console.log('some autocomplete request failed: ', request, error );

          $.toast({
            heading: `datasource autocomplete failed`,
            text: 'please temporarily disable the failing datasource',
            hideAfter : 20000,
            stack : 1,
            showHideTransition: 'slide',
            icon: 'error'
          })

          $('#blink').hide();

			});

    },

    search: function( event, ui ){

      if ( getSearchValue().charAt(0) === '!' ){ // structured form-query

        $('.searchbox').autocomplete('close');

        // skip normal json-results-fetch
        event.preventDefault();

      }

    }

    // TODO
    /*
    // custom item rendering:
    //  https://api.jqueryui.com/autocomplete/#method-_renderItem
    //  https://stackoverflow.com/questions/15664964/jquery-autocomplete-renderitem
    _renderItem: function( ul, item ) {
      return $( "<li>" )
        .attr( "data-value", item.value )
        .append( item.label )
        .appendTo( ul );
    },
    */

  });

  $('.searchbox').on( 'autocompleteselect', function( event, ui ){

    $('#pager').hide();
    $('#blink').show();

    // FIXME
    $('.searchbox').autocomplete('close');
    $('#srsearch').blur();

    // trigger input-search change
    $('#srsearch').val( ui.item.label );
    explore.q = getSearchValue();

    // reset any structured-search query-data
    explore.query     = '';
    explore.commands  = '';

    explore.type  = 'string'; // set default type

    // discern user-click from synthetic-click
    if ( event.hasOwnProperty('originalEvent') ){ // user-click

      explore.hash = ''; // reset hash

      if ( explore.isMobile ){

        explore.preventSliding = true; // for mobile: stay on search-results page

      }

    }
    else if ( explore.isMobile && explore.isSafari ){ // HACK: iOS Safari does not support synthetic-click detection, so dont slide

      explore.preventSliding = true; // for mobile: stay on search-results page

    }

    // trigger submit
    $('.submitSearch').trigger('click');

    // goto to results tab
    explore.tabsInstance.select('tab-topics');

  });

  document.getElementById('srsearch').addEventListener("dragover", function(event) {

    event.preventDefault();

    $('#srsearch').val('');

  });

  $('#srsearch').on( 'drop', function(event) {

    //$('.searchbox').autocomplete( 'disable' );
    event.target.style.border = 'none';
    event.target.style.borderBottom = '1px solid #9e9e9e';

    // TODO: unable to get the "event.target" string
    //console.log( event.target );

    explore.type = 'string';

    const q = getSearchValue( );

 		//if ( q.startsWith( 'https://' ) || q.startsWith( 'http://' ) ){ // remove 'dropped' URL-string-text
		//	q = decodeURIComponent( q.substring( q.lastIndexOf('/') + 1) ).replace(/_/g, ' ');
    //}

		$('#srsearch').val( q );
    explore.q = $('#srsearch').val();

    explore.tabsInstance.select('tab-topics');
    $('#tab-topics .overflow-container').scrollTop(0);

  });

  $('a.submitSearch').on( 'click', async function(e){

    let q = getSearchValue();

    //console.log( 'search: ', q, explore.q, $( '#srsearch' ).val() );

    // FIXME
    $('.searchbox').autocomplete('close');
    $('#srsearch').blur();
    $('#detail-result-summary').hide();

    explore.searchmode = 'string';

    // discern user-click from synthetic-click
    if ( e.hasOwnProperty('originalEvent') ){ // user-click

      // reset any structured-search query-data
      explore.query     = '';
      explore.hash      = '';
      explore.commands  = '';

      if ( explore.isMobile ){

        explore.preventSliding = true; // for mobile: stay on search-results page

      }

      // go to the results tab
      explore.tabsInstance.select('tab-topics');

    }
    else if ( explore.isMobile && explore.isSafari ){ // iOS Safari does not support synthetic-click detection, so dont slide

      explore.preventSliding = true; // for mobile: stay on search-results page

    }

    // reset any structured-search query-data
    explore.query     = '';
    explore.commands  = '';

    e.preventDefault();

    explore.page = 1;       // reset page position
    explore.wallpaper = ''; // reset wallpaper

    $('#pager').hide();

    explore.q = q;

 		if ( explore.q.startsWith( 'https://' ) || explore.q.startsWith( 'http://' ) ){ // remove 'dropped' URL-string-text
			explore.q = decodeURIComponent( explore.q.substring( explore.q.lastIndexOf('/') + 1) ).replace(/_/g, ' ');

			$('#srsearch').val( explore.q );
		}

    // reset some query-dependent fields

    // make wikipedia the base type (we can override later)
    if ( explore.type === '' && explore.page === 1 ){
      explore.type = 'string';
    }

    // only use custom type on firstAction visits
    if ( ! explore.firstAction ){
      explore.type = 'string';
    }

    if ( explore.q ) {

      if ( explore.q.charAt(0) === '!' ){ // show command search query results

        if ( explore.q.startsWith( '!graph' ) ){ // graph command

          explore.q = explore.q.trim().charAt(0).toUpperCase() + explore.q.slice(1);

          // see: https://github.com/PullJosh/graphing-calculator
          const formula = explore.q.replace( '!graph ', '' );
          const url = `https://joshs-graphing-calculator.vercel.app/app#%7B%22items%22%3A%5B%7B%22id%22%3A0%2C%22visible%22%3Atrue%2C%22type%22%3A%22Equation%22%2C%22latex%22%3A%22${ encodeURIComponent( formula ) }%22%2C%22color%22%3A%22red%22%7D%5D%2C%22variables%22%3A%5B%5D%2C%22slices%22%3A%5B%5D%7D`
          //const url = explore.base + '/app/xrgraph/?function=' + explore.q.replace( '!graph ', '' ).replace('=','%3D');

          handleClick({ 
            id        : 'n1-0',
            type      : 'link',
            title     : explore.q,
            language  : explore.language,
            qid       : '',
            url       : encodeURI( url ),
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

        }
        else if ( explore.q.startsWith( '!chat' ) ){ // chat command

          explore.q = explore.q.trim().charAt(0).toUpperCase() + explore.q.slice(1);

          const m = explore.q.replace( '!chat ', '' );

          handleClick({ 
            id        : 'n1-0',
            type      : 'link-split',
            //panelwidth : 70,
            title     : m,
            language  : explore.language,
            qid       : '',
            url       : encodeURI( `${explore.base}/app/chat/?m=${m}&l=${explore.language}&t=${explore.tutor}` ),
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

        }
        if ( explore.q.startsWith( '!doi' ) ){ // DOI command

          explore.q   = explore.q.trim();
          const doi   = explore.q.replace( '!doi ', '' );
          let   url   = '';
          let   title = '';

          console.log('DOI: ', doi );

          fetch( `https://api.openalex.org/works/https://doi.org/${doi}` ).then((response) => response.json() ).then( ( data ) => {

            console.log( data );

            if ( valid( data.id ) ){

              url = data.id;

            }

            if ( valid( data.title ) ){

              title = data.title;

            }

            if ( valid( [ url, title ] ) ){

              // content pane
              handleClick({
                id        : 'n1-0',
                type      : 'articles',
                title     : title,
                language  : explore.language,
                qid       : '',
                url       : '',
                tag       : '',
                languages : '',
                custom    : '',
                target_pane : 'p0',
              });

              // sidebar
              handleClick({
                id        : 'n1-0',
                type      : 'link',
                title     : title,
                language  : explore.language,
                qid       : '',
                url       : encodeURI( url ),
                tag       : '',
                languages : '',
                custom    : '',
                target_pane : 'p1',
              });

            }

          });

        }

      }
      else { // normal query results

				// TODO: make this optional/depend on a datasource which requires a Qid as input
				// lookup the Wikidata Qid for the search term
				// (required for the Wikimedia Commons datasource)
				let qid_ = await checkForQid( explore.q.replace( /"/gm, '' ), 'ps2' );

				if ( qid_.hasOwnProperty('entities') ){

					const qid = Object.keys( qid_.entities )[0];

					if ( isQid( qid ) ){

						//console.log( 'Qid found: ', qid );
						explore.q_qid = qid;

					}
					else {

						if ( valid( explore.q_qid ) ){

							explore.q_qid = ''; // reset

						}

					}

				}

        // TODO: verify this is URL update is correct in all cases
        updatePushState( explore.q, 'add' );

        refreshArticles(); // render the list of sidebar-topics

        $('#blink').show();

      }

    }
    else {

      explore.type = '';

      setDefaultDisplaySettings();

    }

  });

  $('#search-in').on( 'change', function (e) {

    e.preventDefault();

    if ( datasource_sets.includes( $('#search-in').val() ) ){

      explore.datasource_set            = $('#search-in').val();
      explore.datasource_set_selection  = $('#search-in').val();

      setParameter( 'd', '', explore.hash );
      setParameter( 'ds', explore.datasource_set, explore.hash );

      setActiveDatasourceSet();
      updateActiveDatasources( explore.datasource_selection.split(',').map( d => d.trim() ) );

      $('a.submitSearch').trigger('click'); // trigger a new search

    }

  });

  $('#sortby').on( 'change', function (e) {

    e.preventDefault();

    if ( valid_sort_options.includes( $('#sortby').val() ) ){

      explore.sortby        = $('#sortby').val();
      explore.sortby_param  = $('#sortby').val();

      setParameter( 'sortby', explore.sortby, explore.hash );

      $('a.submitSearch').trigger('click'); // trigger a new search

    }

  });

  $('#filterby').on( 'change', function (e) {

    e.preventDefault();

    //console.log('filter changed to: ', $('#filterby').val() );

    if ( valid_filter_options.includes( $('#filterby').val() ) ){

      explore.filterby        = $('#filterby').val();
      explore.filterby_param  = $('#filterby').val();

      setParameter( 'filterby', explore.filterby, explore.hash );

      $('a.submitSearch').trigger('click'); // trigger a new search

    }

  });

  $('a.link.clear').on( 'click', function (e) {

    e.preventDefault();
    $('#srsearch').val('');
    $('#srsearch').focus();

  });

  $('a.link.compare').on( 'click', function (e) {

    e.preventDefault();

    explore.custom = explore.compares;

    if ( explore.compares.length >= 2 ){

      handleClick({ 
        id        : 'n1-0',
        type      : 'compare',
        title     : explore.q.trim(),
        language  : explore.language,
        qid       : '',
        url       : '',
        tag       : '',
        languages : '',
        ids       : explore.compares.join(),
        custom    : '',
        target_pane : 'p1',
      });

      explore.custom = '';

    }
    else {

      $.toast({
        heading: explore.banana.i18n('app-notification-too-few-compare-topics'),
        text: '',
        hideAfter : 10000,
        stack : 1,
        showHideTransition: 'slide',
        icon: 'info'
      })

    }

  });

  if ( explore.page === 1 ){
    $('#previous').css("visibility", "hidden");
  }

}

function setBgmode( ) {

  if ( explore.wallpaper === ''  ){ // no wallpaper set, just use the default background

    return 0;
  }

  if ( explore.bgmode ){

    if ( explore.type === 'string' || explore.type === 'video' ){
      $( explore.baseframe ).contents().find("body").addClass('wallpaper').trigger('classChange');
      $( explore.baseframe ).contents().find("body").css( 'background-image', 'linear-gradient(to right, rgba(251, 250, 249,0.95), rgba(251, 250, 249,0.80)), url("' + explore.wallpaper + '"', 'important' );
      $( explore.baseframe ).contents().find("aside").css( 'background-color', 'transparent', 'important');
    }

  }
  else {

    $( explore.baseframe ).contents().find("body").removeClass('wallpaper').trigger('classChange');
    $( explore.baseframe ).contents().find("body").css( 'background', '#fbfaf9', 'important');
    $( explore.baseframe ).contents().find("body").css( 'background-image', 'none', 'important');
    $( explore.baseframe ).contents().find("aside").css( 'background-color', 'inherit', 'important');

  }

}

function setupOptionBgmode() {

  (async () => {

    explore.bgmode = await explore.db.get('bgmode');
    explore.bgmode = ( explore.bgmode === null || explore.bgmode === 'false' ) ? false : true;

    if ( explore.bgmode ){
      $('#bgmode').prop('checked', true);
    }
    else {
      $('#bgmode').prop('checked', false);
    }

    setBgmode();

    $('#bgmode').change(function() {

      if ( $('#bgmode').prop('checked') ){

        (async () => { await explore.db.set('bgmode', true); })();
        explore.bgmode = true;
        setBgmode();

      }
      else {

        (async () => { await explore.db.set('bgmode', false); })();
        explore.bgmode = false;
        setBgmode();

      }

    })

  })();

}

function setDarkmode() {

  // also check user preference for darkmode
  if ( explore.darkmode ){
    $('#darkmode').prop('checked', true);
  }
  else {
    $('#darkmode').prop('checked', false);
  }

  if ( explore.darkmode ){
    $('body').addClass('dark');
    $( explore.baseframe ).contents().find("body").addClass('dark').trigger('classChange');

    $('#infoframeSplit1').contents().find("body").addClass('dark').trigger('classChange');
    $('#infoframeSplit2').contents().find("body").addClass('dark').trigger('classChange');

    // TODO: also go into the sub-iframes of #infoframeSplit2

  }
  else {
    $('body').removeClass('dark');
    $( explore.baseframe ).contents().find("body").removeClass('dark').trigger('classChange');

    $('#infoframeSplit1').contents().find("body").removeClass('dark').trigger('classChange');
    $('#infoframeSplit2').contents().find("body").removeClass('dark').trigger('classChange');

    // TODO: also go into the sub-iframes of #infoframeSplit2
  }

}

function setupOptionDarkmode() {

  (async () => {

    explore.darkmode = await explore.db.get('darkmode');

    let prefersDarkMode   = '';
    let darkmode_was_set  = false;

    darkmode_was_set = ( explore.darkmode === null ) ? false : true;

    if ( !darkmode_was_set ){ // no darkmode was set previously

      // follow prefersDarkmode
      prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if ( prefersDarkMode ) {
        explore.darkmode = true;
      }

    }
    else { // use the set darkmode

        explore.darkmode = ( explore.darkmode === null || explore.darkmode === 'false' ) ? false : true;

    }

    setDarkmode();

    $('#darkmode').change(function() {

      if ( $('#darkmode').prop('checked') ){

        (async () => { await explore.db.set('darkmode', true); })();
        explore.darkmode = true;

      }
      else {

        (async () => { await explore.db.set('darkmode', false); })();
        explore.darkmode = false;

      }

      setDarkmode();

    })

  })();

}

function setShowHelp() {

  if ( explore.showhelp ){
    $('#showhelp').prop('checked', true);
    $('.doclink').show();
  }
  else {
    $('#showhelp').prop('checked', false);
    $('.doclink').hide();
  }

}

function setupOptionShowHelp(){

  (async () => {

    explore.showhelp = await explore.db.get('showhelp');

    explore.showhelp = ( explore.showhelp === null || explore.showhelp === 'false' ) ? false : true;

    setShowHelp();

    $('#showhelp').change(function() {

      if ( $('#showhelp').prop('checked') ){

        (async () => { await explore.db.set('showhelp', true); })();
        explore.showhelp = true;

        updateValueInPanes( 'showhelp', true );
        setShowHelp();

      }
      else {

        (async () => { await explore.db.set('showhelp', false); })();
        explore.showhelp = false;

        updateValueInPanes( 'showhelp', false );
        setShowHelp();

      }

    })

  })();

}

function setApiKeys(){

  if ( valid( explore.api_key_openai ) ){

    explore.openai_enabled = true;
    $('#openai_api_key').val( explore.api_key_openai );

  }
  else {

    explore.openai_enabled = false;
    $('#openai_api_key').val('');

  }


}

function setupOptionApiKeys(){

  (async () => {

    explore.api_key_openai = await explore.db.get('api_key_openai');

    explore.api_key_openai = ( explore.api_key_openai === null || explore.api_key_openai === undefined ) ? '' : explore.api_key_openai;

    setApiKeys();

    $('#openai_api_key').change(function() {

      (async () => {

        const key = $('#openai_api_key').val();

        explore.api_key_openai = key;

        await explore.db.set( 'api_key_openai', key );

        setApiKeys();

      })();

    });

  })();

}

function setGridmode() {

  // also check user preference for gridmode
  if ( explore.gridmode ){
    $('#gridmode').prop('checked', true);
    $('#results').addClass('grid');
    $('#results .entry').addClass('sidebar-grid-item'); // also update existing sidebar results
  }
  else {
    $('#gridmode').prop('checked', false);
    $('#results').removeClass('grid');
    $('#results .entry').removeClass('sidebar-grid-item'); // also update existing sidebar results
  }

}

function setupOptionGridmode() {

  (async () => {

    explore.gridmode = await explore.db.get('gridmode');

    let prefersGridMode   = '';
    let gridmode_was_set  = false;

    gridmode_was_set = ( explore.gridmode === null ) ? false : true;

    if ( !gridmode_was_set ){ // no gridmode was set previously

      // follow prefersGridmode
      //prefersGridMode = window.matchMedia('(prefers-color-scheme: grid)').matches;

      if ( prefersGridMode ) {
        explore.gridmode = true;
      }

    }
    else { // use the set gridmode

        explore.gridmode = ( explore.gridmode === null || explore.gridmode === 'false' ) ? false : true;

    }

    setGridmode();

    $('#gridmode').change(function() {

      if ( $('#gridmode').prop('checked') ){

        (async () => { await explore.db.set('gridmode', true); })();
        explore.gridmode = true;
        setGridmode();

      }
      else {

        (async () => { await explore.db.set('gridmode', false); })();
        explore.gridmode = false;
        setGridmode();

      }

    })

  })();

}

function setBread() {

  if ( explore.bread ){
    $('#bread').prop('checked', true);
  }
  else {
    $('#bread').prop('checked', false);
  }

}

function setupOptionBread(){

  (async () => {

    explore.bread = await explore.db.get('bread');

    explore.bread = ( explore.bread === null || explore.bread === 'false' ) ? false : true;

    setBread();

    $('#bread').change(function() {

      if ( $('#bread').prop('checked') ){

        (async () => { await explore.db.set('bread', true); })();
        explore.bread = true;

        updateValueInPanes( 'bread', true );
        setBread();

      }
      else {

        (async () => { await explore.db.set('bread', false); })();
        explore.bread = false;

        updateValueInPanes( 'bread', false );
        setBread();

      }

    })

  })();

}

function setStructuredSearch(){

  if ( explore.structured_search ){

    $('#structured-search').prop('checked', true);

    $('#app-menu-structured-search-title').text( explore.banana.i18n('app-menu-structured-search') );
    $('#detail-structured-search').show();

  }
  else {

    $('#structured-search').prop('checked', false);

    $('#detail-structured-search').hide();

  }

}

function setupOptionStructuredSearch(){

  (async () => {

    explore.structured_search = await explore.db.get('structured_search');

    explore.structured_search = ( explore.structured_search === null || explore.structured_search === 'false' ) ? false : true;

    setStructuredSearch();

    $('#structured-search').change(function() {

      if ( $('#structured-search').prop('checked') ){

        (async () => { await explore.db.set('structured_search', true); })();

        explore.structured_search = true;

        updateValueInPanes( 'structured_search', true );
        setStructuredSearch();

      }
      else {

        (async () => { await explore.db.set('structured_search', false); })();
        explore.structured_search = false;

        updateValueInPanes( 'structured_search', false );
        setStructuredSearch();

      }

    })

  })();

}

function setAIchat() {

  if ( explore.aichat ){

    $('#aichat').prop('checked', true);

    $('#detail-ai-chat').show();

  }
  else {

    $('#aichat').prop('checked', false);

    $('#detail-ai-chat').hide();

  }

}

function setupOptionAIchat(){

  (async () => {

    explore.aichat = await explore.db.get('aichat');

    explore.aichat = ( explore.aichat === null || explore.aichat === 'false' ) ? false : true;

    setAIchat();

    $('#aichat').change(function() {

      if ( $('#aichat').prop('checked') ){

        (async () => { await explore.db.set('aichat', true); })();
        explore.aichat = true;

        updateValueInPanes( 'aichat', true );
        setAIchat();

      }
      else {

        (async () => { await explore.db.set('aichat', false); })();
        explore.aichat = false;

        updateValueInPanes( 'aichat', false );
        setAIchat();

      }

    })

  })();

}


function doDOISearch( doi ){

  let   url   = '';
  let   title = '';

  console.log('DOI: ', doi );

  fetch( `https://api.openalex.org/works/https://doi.org/${doi}` ).then((response) => response.json() ).then( ( data ) => {

    console.log( data );

    if ( valid( data.id ) ){

      url = data.id;

    }

    if ( valid( data.title ) ){

      title = data.title;

    }

    if ( valid( [ url, title ] ) ){

      // content pane
      handleClick({
        id        : 'n1-0',
        type      : 'articles',
        title     : title,
        language  : explore.language,
        qid       : '',
        url       : '',
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p0',
      });

      // sidebar
      handleClick({
        id        : 'n1-0',
        type      : 'link',
        title     : title,
        language  : explore.language,
        qid       : '',
        url       : encodeURI( url ),
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

    }

  });

}

function doGeospatialSearch( url, custom ){

  explore.custom  = custom; // 'lat;lon;radius'
  explore.uri     = url;
  explore.type    = 'geospatial';

  updatePushState( explore.q, 'add' );

  if ( ! valid( explore.geospatial_search ) ){ // enable geospatial_search iframe first, which will use any custom map data provided

    $('#geospatial-search').prop("checked", true).change();

  }

  runQuery( '', url );

}

function setGeospatialSearch( custom ){

  // customizable
  let lat     = '';
  let lon     = '';
  let radius = '';

  if ( explore.geospatial_search ){

    if ( valid( custom ) ){ // lat, lon, radius

      custom = custom.split(';') || [];

      if ( custom.length === 3 ){

        lat     = custom[0];
        lon     = custom[1];
        radius  = '&radius=' + custom[2]; // only insert when needed (so the default radius can be used too)

      }

    }

    $('#geospatial-search').prop('checked', true);

    $('#geospatial-search-container').html( `<iframe id="geospatial-search-frame" class="resized" title="geospatial search" role="application" loading="lazy" style="min-height: 401px" src="https://${explore.host}/app/geo-search/index.html?l=${explore.language}&lat=${lat}&lon=${lon}${radius}" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen="" allow-downloads="" width="95%" height="100%" loading="lazy">`);

    $('#detail-geospatial-search').show();

  }
  else {

    $('#geospatial-search').prop('checked', false);

    $('#geospatial-search-container').empty();

    $('#detail-geospatial-search').hide();

  }

}

function setupOptionGeospatialSearch(){

  let custom = '';

  (async () => {

    explore.geospatial_search = await explore.db.get('geospatial_search');

    explore.geospatial_search = ( explore.geospatial_search === null || explore.geospatial_search === 'false' ) ? false : true;

    if ( explore.type === 'geospatial' && valid( explore.custom ) ){

      custom = explore.custom;

    }

    setGeospatialSearch( custom );

    $('#geospatial-search').change(function() {

      if ( $('#geospatial-search').prop('checked') ){

        (async () => { await explore.db.set('geospatial_search', true); })();

        explore.geospatial_search = true;

        updateValueInPanes( 'geospatial_search', true );
        setGeospatialSearch( custom );

      }
      else {

        (async () => { await explore.db.set('geospatial_search', false); })();
        explore.geospatial_search = false;

        updateValueInPanes( 'geospatial_search', false );
        setGeospatialSearch( custom );

      }

    })

  })();

}

function setBold() {

  if ( explore.bold ){

    $( explore.baseframe ).contents().find("a.link").css({ 'font-weight': '450'});
    $('#bold').prop('checked', true);
  }
  else {

    $( explore.baseframe ).contents().find("a.link").css({ 'font-weight': 'initial'});
    $('#bold').prop('checked', false);
  }

};

function setupOptionBoldLinks() {

  (async () => {

    explore.bold = await explore.db.get('bold');
    explore.bold = ( explore.bold === 'false' ) ? false : true;

    setBold();

    $('#bold').change(function() {

      if ( $('#bold').prop('checked') ){
        explore.bold = true;
        (async () => { await explore.db.set('bold', true); })();
      }
      else {
        explore.bold = false;
        (async () => { await explore.db.set('bold', false); })();
      }

      setBold();

    })

  })();

}

async function setUnderline() {

  if ( explore.underline ){

    $( explore.baseframe ).contents().find("a").addClass('underline');
    $('#underline').prop('checked', true);
  }
  else {

    $( explore.baseframe ).contents().find("a").removeClass('underline');
    $('#underline').prop('checked', false);
  }

};

function setupOptionUnderlineLinks() {

  (async () => {

    explore.underline = await explore.db.get('underline');
    explore.underline = ( explore.underline === 'false' ) ? false : true;

    setUnderline();

    $('#underline').change(function() {

      if ( $('#underline').prop('checked') ){
        explore.underline = true;
        (async () => { await explore.db.set('underline', true); })();
      }
      else {
        explore.underline = false;
        (async () => { await explore.db.set('underline', false); })();
      }

      setUnderline();

    })

  })();

}

function setLinkPreview() {

  if ( explore.linkpreview ){

    $('#linkpreview').prop('checked', true);

  }
  else {

    $('#linkpreview').prop('checked', false);

  }

};

function setupOptionLinkPreview(){

  (async () => {

    explore.linkpreview = await explore.db.get('linkpreview');
    explore.linkpreview = ( explore.linkpreview === null || explore.linkpreview === 'false' ) ? false : true;

    setLinkPreview();

    $('#linkpreview').change(function() {

      if ( $('#linkpreview').prop('checked') ){
        explore.linkpreview = true;
        (async () => { await explore.db.set('linkpreview', true); })();
      }
      else {
        explore.linkpreview = false;
        (async () => { await explore.db.set('linkpreview', false); })();
        console.log('linkpreview set to false');
      }

      setLinkPreview();

    })

  })();

}

function setMulticolumn() {

  if ( explore.multicolumn ){

    $( explore.baseframe ).contents().find('p').css({ 'column-count': '2', 'text-align' : 'unset' });

    $( explore.baseframe ).contents().find('main').css({ 'max-width': 'initial'});
    $('#multicolumn').prop('checked', true);

  }
  else {

    $( explore.baseframe ).contents().find('p').css({ 'column-count': '', 'text-align' : 'justify' });

    $('#multicolumn').prop('checked', false);

  }

};

function setupOptionMulticolumn() {

  (async () => {

    explore.multicolumn = await explore.db.get('multicolumn');
    explore.multicolumn = ( explore.multicolumn === null || explore.multicolumn === 'false' ) ? false : true;

    setMulticolumn();

    $('#multicolumn').change( function() {

      if ( $('#multicolumn').prop('checked') ){
        explore.multicolumn = true;
        (async () => { await explore.db.set('multicolumn', true); })();
      }
      else {
        explore.multicolumn = false;
        (async () => { await explore.db.set('multicolumn', false); })();
      }

      setMulticolumn();

    })

  })();

}

function setupLanguage(){

  let fallback_language = 'en';
  let fallback_voice_code = 'en-GB';

  let sync_locale_with_language = false; 

  // determine locale
  if ( !valid( explore.locale ) && !valid( explore.locale_param ) ){ // no locale defined yet

    // no locale was given, use browser preference if available
    let locale = window.navigator.language;

    if ( valid( locale ) ){ // we have a browser-locale

      fallback_language  = locale.split('-')[0];

      explore.locale = fallback_language;
      fallback_voice_code = locale;

    }
    else { // no locale

      explore.locale = fallback_language;

    }

    sync_locale_with_language = true;

  }

  //console.log('locale: ', explore.locale );

  // something went wrong, use the default locale
  if ( explore.locale === null || ! explore.locales.includes( explore.locale ) ){

    explore.locale    = 'en';
    fallback_language = 'en';

  }

  // determine editor-commands
  if ( explore.commands_param !== undefined ){

    explore.commands = decodeURIComponent( explore.commands_param ).replace('“', '"').replace('”','"');
    //explore.commands = unpackString( explore.commands_param );

  }

  // determine structured-search query
  if ( explore.query_param !== undefined ){

    explore.query = explore.query_param;

  }

  // determine datasource-set-key
  if ( valid( explore.datasource_set_selection ) ){

    explore.datasource_set = explore.datasource_set_selection;

    if ( datasource_sets.includes( explore.datasource_set ) ){

      $('#search-in').val( explore.datasource_set );

    }

  }

  // determine sort-key
  if ( valid( explore.sortby_param ) ){

    explore.sortby = explore.sortby_param;

    if ( valid_sort_options.includes( explore.sortby ) ){

      $('#sortby').val( explore.sortby );

    }

  }

  // determine filter-key
  if ( valid( explore.filterby_param ) ){

    explore.filterby = explore.filterby_param;

    if ( valid_filter_options.includes( explore.filterby ) ){

      console.log( 'valid filter found: ', explore.filterby );

      $('#filterby').val( explore.filterby );

    }

  }

  // determine language
  if ( !valid( explore.language ) && !valid( explore.language_param ) ){ // no language

    explore.language = window.language = fallback_language; // use fallback-language 'en'
    explore.voice_code = fallback_voice_code;

  }
  else if ( explore.language_param !== undefined ){

    for ( const [ code , langobj ] of Object.entries( explore.wp_languages ) ) {

      // verify language-code correctness
      if ( explore.language_param === code ){

        explore.language = window.language = explore.language_param;

				if ( explore.voice_code_selected.startsWith( explore.language ) ){

					explore.voice_code = explore.voice_code_selected;
					explore.voice_name = explore.voice_name_selected;

				} 
				else {

        	explore.voice_code = langobj.voice || fallback_voice_code;

				}

        explore.language_script           = langobj.script;
        explore.langcode                  = langobj.langcode;
        explore.language_name             = langobj.name;
        explore.language_name_capitalized = capitalizeFirstLetter( explore.language_name );
        explore.lang_current_events_page  = langobj.articles.current_events;

        setLanguageDirection();

        (async () => { await explore.db.set('language', explore.language ); })();

        break;

      }
      else {

        explore.language = window.language = fallback_language; // no language match found: fallback to default
        explore.voice_code = fallback_voice_code;

      }

    }

    // check if there is a preferred language-variant
    if ( explore.languages_with_variants.includes( explore.language ) ){

      console.log( 'Global app: checking language-variant in storage...');

      (async () => {

        explore.language_variant = await explore.db.get('language-variant-' + explore.language );
        explore.language_variant = ( explore.language_variant === null || explore.language_variant === undefined ) ? '' : explore.language_variant;

        console.log('Global app: writing style from storage: ', explore.language_variant );

      })();

      console.log( 'Global app: done checking: ', explore.language_variant );

    }

    updateLocaleNative();

  }

  // if the locale was set initially, but is unmatched against the current language -> sync the locale to the language
  if ( sync_locale_with_language && explore.locale !== explore.language ){
    explore.locale = explore.language;
  }

  if ( ! explore.locales.includes( explore.locale ) ){

    explore.locale = 'en';

  }

  // update locale
  updateLocale( explore.locale );

  explore.lang3 = getLangCode3( explore.language ); // used by Open Library and Archive.org

  const language_name = ( explore.language === 'en') ? 'English' : explore.language;

  afterLanguageUpdate();

  // setup "Universal Language Selector" (ULS)
  // 	https://github.com/wikimedia/jquery.uls
  // 	https://www.mediawiki.org/wiki/Universal_Language_Selector
  $( '.uls-trigger' ).uls( {

    top: '10px', 

    onSelect: function( l ) {

      (async () => { await explore.db.set('language', l ); })();

      explore.language    = window.language = l;
      explore.lang3       = getLangCode3( explore.language );

      explore.voice_code  = getVoiceCode( explore.language );

      let languageName    = $.uls.data.getAutonym( l );

      $( '.uls-trigger' ).html( '<span class="icon"><i class="fa-solid fa-caret-right"></i></span> &nbsp; ' + getNamefromLangCode2( explore.language ) );

      $('.submitSearch').click(); // do submit

			reloadVoices(); // update voices list after language change

      afterLanguageUpdate();

    },

    languages: explore.uls_languages,

    //showRegions: [ 'WW', 'AM', 'EU', 'ME', 'AF', 'AS', 'PA' ],

  });

  $( '.uls-trigger' ).click( function () {

    $( '.uls-menu' ).addClass( 'uls-mobile' ).css( 'left', '2.5%' );

  });


  // locale configuration option change-event-listener
  $('#locale').change(function() {

    explore.locale = $(this).val();
    (async () => { await explore.db.set('locale', $(this).val() ); })();

    updateLocale( explore.locale );

  })

	// TTS voice option handling
	if ('speechSynthesis' in window) {

		explore.tts_enabled = true;

	  reloadVoices(); // needed for Firefox

    window.speechSynthesis.onvoiceschanged = () =>{ // needed for Chromium-browsers

      reloadVoices();

    };

  }
	else {

		explore.tts_enabled = false;

	}

  $('#voices').change(function(){

		explore.voice_code_selected = explore.voice_code = $(this).val();
		explore.voice_name_selected = explore.voice_name = $("#voices option:selected").text();

    console.log('voice selected: ', explore.voice_code_selected, explore.voice_name_selected );

    (async () => {

      await explore.db.set('voice_code_selected', explore.voice_code_selected );
      await explore.db.set('voice_name_selected', explore.voice_name_selected );

    })();

    // also update the voice-code of any open + receptive app-pane (used for: Wikipedia and PDF-Speaker app)
    updateValueInPanes( 'voice_code', explore.voice_code_selected );
    updateValueInPanes( 'voice_name', explore.voice_name_selected );
    updateValueInPanes( 'voice_rate', explore.voice_rate );
    updateValueInPanes( 'voice_pitch', explore.voice_pitch );

  });

  // change voice-rate
	$('#voice-rate').on('input', function () {

		explore.voice_rate = $(this).val();

    $('#voicerate').text( explore.voice_rate );

    (async () => { await explore.db.set( 'voice_rate', explore.voice_rate ); })();

    updateValueInPanes( 'voice_rate', explore.voice_rate );

	});

  // check for user voice-rate
  (async () => {

    explore.voice_rate = await explore.db.get('voice_rate');

    explore.voice_rate = ( explore.voice_rate === null || explore.voice_rate === '' ) ? 1.00 : explore.voice_rate;

    $('#voicerate').text( explore.voice_rate );
    $('#voice-rate').val(  explore.voice_rate );

  })();

  // change voice-pitch
	$('#voice-pitch').on('input', function () {

		explore.voice_pitch = $(this).val();

    $('#voicepitch').text( explore.voice_pitch );

    (async () => { await explore.db.set( 'voice_pitch', explore.voice_pitch ); })();

    updateValueInPanes( 'voice_pitch', explore.voice_pitch );

	});

  // check for user voice-pitch
  (async () => {

    explore.voice_pitch = await explore.db.get('voice_pitch');

    explore.voice_pitch = ( explore.voice_pitch === null || explore.voice_pitch === '' ) ? 1.00 : explore.voice_pitch;

    $('#voicepitch').text( explore.voice_pitch );
    $('#voice-pitch').val(  explore.voice_pitch );

  })();

}

async function updateValueInPanes( name, value ){

  // also update the voice-code of any open Wikikipedia-app-pane
  let iframeEl = '';

  if ( document.getElementById('infoframeSplit2') === null ){ // single-content-frame

    iframeEl = document.getElementById( 'infoframe' );

  }
  else { // dual-content-frame

    iframeEl = document.getElementById( 'infoframeSplit2' );

  }

  if ( valid( iframeEl ) ){

    iframeEl.contentWindow.postMessage( { event_id: 'set-value', data: [ name, value ] }, '*' );

  }

}

function updateLocale( l ){ // set from user-locale

  explore.banana.setLocale( l );

  if ( l === 'simple' ){

    l = 'en';

  }

  if ( explore.locales.includes( l ) ){

    explore.locale = l;

    fetch(explore.base + '/app/explore2/assets/i18n/ui/conzept-' + explore.banana.locale + '.json?' + explore.version ).then((response) => response.json()).then((messages) => {

      explore.banana.load( messages, explore.banana.locale)
      updateLocaleInterface();
      setupOptionActiveDatasources(); // updates the datasource labels 

      $('#locale').find('option[value="' + explore.locale + '"]').prop('selected', true);
      $('#locale').formSelect();

    });

  }

}

function updateLocaleNative( ){ // set from language

    let l = explore.language;

    if ( l === 'simple' ){

      l = 'en';

    }

    explore.banana_native.setLocale( l );

    if ( explore.locales.includes( l ) ){

      fetch(explore.base + '/app/explore2/assets/i18n/ui/conzept-' + l + '.json?' + explore.version ).then((response) => response.json()).then((messages) => {

        explore.banana_native.load( messages, l );

      });

    }

}

async function updateLocaleInterface(){

  // search-input-placeholder
  const placeholder = explore.banana.i18n('app-search-placeholder') || 'search';
  $('#srsearch').attr('placeholder', placeholder );

  // tab-titles
  $('#app-tab-topics-title').text( explore.banana.i18n('app-tab-topics-title') );
  $('#app-tab-list-title').text( explore.banana.i18n('app-tab-list-title') );
  $('#app-tab-bookmarks-title').text( explore.banana.i18n('app-tab-bookmarks-title') );
  $('#app-tab-tools-title').text( explore.banana.i18n('app-tab-tools-title') );
  $('#app-tab-settings-title').text( explore.banana.i18n('app-tab-settings-title') );
  $('#app-tab-help-title').text( explore.banana.i18n('app-tab-help-title') );
  $('#app-tab-audio-chat-title').text( explore.banana.i18n('app-tab-audio-chat-title') );

  // menus
  $('#app-menu-api-keys').html( explore.banana.i18n('app-menu-api-keys') );

  $('#app-menu-search-in').html( explore.banana.i18n('app-menu-search-in') );
  $('#app-menu-search-in-option-reference').html( explore.banana.i18n('app-menu-search-in-option-reference') );
  $('#app-menu-search-in-option-culture').html( explore.banana.i18n('app-menu-search-in-option-culture') );
  $('#app-menu-search-in-option-science').html( explore.banana.i18n('app-menu-search-in-option-science') );
  $('#app-menu-search-in-option-business').html( explore.banana.i18n('app-menu-search-in-option-business') );

  $('#app-menu-filter-by').html( explore.banana.i18n('app-menu-filter-by') );
  $('#app-menu-filter-by-option-text').html( explore.banana.i18n('app-menu-filter-by-option-text') );
  $('#app-menu-filter-by-option-image').html( explore.banana.i18n('app-menu-filter-by-option-image') );
  $('#app-menu-filter-by-option-video').html( explore.banana.i18n('app-menu-filter-by-option-video') );
  $('#app-menu-filter-by-option-audio').html( explore.banana.i18n('app-menu-filter-by-option-audio') );
  $('#app-menu-filter-by-option-data').html( explore.banana.i18n('app-menu-filter-by-option-data') );
  $('#app-menu-filter-by-option-3D').html( explore.banana.i18n('app-menu-filter-by-option-3D') );
  $('#app-menu-filter-by-option-software').html( explore.banana.i18n('app-menu-filter-by-option-software') );
  $('#app-menu-filter-by-option-archive').html( explore.banana.i18n('app-menu-filter-by-option-archive') );
  $('#app-menu-filter-by-option-entity').html( explore.banana.i18n('app-menu-filter-by-option-entity') );

  $('#app-menu-filter-by-year-range').html( explore.banana.i18n('app-menu-filter-by-year-range') );

  $('#app-menu-sort-by').html( explore.banana.i18n('app-menu-sort-by') );
  $('#app-menu-sort-by-option-relevance-desc').html( explore.banana.i18n('app-menu-sort-by-option-relevance-desc') );
  $('#app-menu-sort-by-option-relevance-asc').html( explore.banana.i18n('app-menu-sort-by-option-relevance-asc') );
  $('#app-menu-sort-by-option-date-desc').html( explore.banana.i18n('app-menu-sort-by-option-date-desc') );
  $('#app-menu-sort-by-option-date-asc').html( explore.banana.i18n('app-menu-sort-by-option-date-asc') );
  $('#app-menu-sort-by-option-update-desc').html( explore.banana.i18n('app-menu-sort-by-option-update-desc') );
  $('#app-menu-sort-by-option-update-asc').html( explore.banana.i18n('app-menu-sort-by-option-update-asc') );
  $('#app-menu-sort-by-option-random').html( explore.banana.i18n('app-menu-sort-by-option-random') );
  $('#app-menu-sort-by-option-citations-desc').html( explore.banana.i18n('app-menu-sort-by-option-citations-desc') );
  $('#app-menu-sort-by-option-citations-asc').html( explore.banana.i18n('app-menu-sort-by-option-citations-asc') );
  $('#app-menu-sort-by-option-title-asc').html( explore.banana.i18n('app-menu-sort-by-option-title-asc') );
  $('#app-menu-sort-by-option-title-desc').html( explore.banana.i18n('app-menu-sort-by-option-title-desc') );
  $('#app-menu-sort-by-option-distance-asc').html( explore.banana.i18n('app-menu-sort-by-option-distance-asc') );
  $('#app-menu-sort-by-option-distance-desc').html( explore.banana.i18n('app-menu-sort-by-option-distance-desc') );

  $('#app-menu-upload-json').html( explore.banana.i18n('app-menu-upload-json') );
  $('#app-menu-actions').html( explore.banana.i18n('app-menu-actions') );
  $('#app-menu-background-audio').html( explore.banana.i18n('app-menu-background-audio') );
  $('#app-menu-background-midi').html( explore.banana.i18n('app-menu-background-midi') );
  $('#app-menu-topic-lists').html( explore.banana.i18n('app-menu-topic-lists') );
  $('#app-menu-various-links').html( explore.banana.i18n('app-menu-various-links') );
  $('#app-menu-font').html( explore.banana.i18n('app-menu-font') );
  $('#app-menu-theme').html( explore.banana.i18n('app-menu-theme') );
  $('#app-menu-grid-mode').html( explore.banana.i18n('app-menu-grid-mode') );
  $('#app-menu-interface-language').html( explore.banana.i18n('app-menu-interface-language') );
  $('#app-menu-voice').html( explore.banana.i18n('app-menu-voice') );
  $('#app-menu-hear-voice').html( explore.banana.i18n('app-menu-hear-voice') );
  $('#app-menu-inline-help').html( explore.banana.i18n('app-menu-inline-help') );
  $('#app-menu-show-inline-help').html( explore.banana.i18n('app-menu-show-inline-help') );
  $('#app-menu-user-manual').html( explore.banana.i18n('app-menu-user-manual') );
  $('#app-menu-keyboard-shortcuts').html( explore.banana.i18n('app-menu-keyboard-shortcuts') );
  $('#app-menu-credits').html( explore.banana.i18n('app-menu-credits') );
  $('#app-menu-license').html( explore.banana.i18n('app-menu-license') );
  $('#app-menu-about').html( explore.banana.i18n('app-menu-about') );

  $('#app-menu-random-topic').html( explore.banana.i18n('app-menu-random-topic') );
  $('#app-menu-compare-topics').html( explore.banana.i18n('app-menu-compare-topics') );
  $('#app-menu-toggle-fullscreen').html( explore.banana.i18n('app-menu-toggle-fullscreen') );
  $('#app-menu-clone-tab').html( explore.banana.i18n('app-menu-clone-tab') );
  $('#app-menu-nature-location-quiz').html( explore.banana.i18n('app-menu-nature-location-quiz') );
  $('#app-menu-plant-identification').html( explore.banana.i18n('app-menu-plant-identification') );
  $('#app-menu-text-identification').html( explore.banana.i18n('app-menu-text-identification') );
  //$('#app-menu-visual-identification').html( explore.banana.i18n('app-menu-visual-identification') ); // TODO: add to locales
  $('#app-menu-digital-libraries').html( explore.banana.i18n('app-menu-digital-libraries') );
  $('#app-menu-geography').html( explore.banana.i18n('app-menu-geography') );
  $('#app-menu-version').html( explore.banana.i18n('app-menu-version') );
  $('#app-menu-made-by').html( explore.banana.i18n('app-menu-made-by') );
  $('#app-menu-all-rights-reserved').html( explore.banana.i18n('app-menu-all-rights-reserved') );
  $('#app-menu-font-type').html( explore.banana.i18n('app-menu-font-type') );
  $('#app-menu-font-size').html( explore.banana.i18n('app-menu-font-size') );
  $('#app-menu-darkmode').html( explore.banana.i18n('app-menu-darkmode') );
  $('#app-menu-link-preview').html( explore.banana.i18n('app-menu-link-preview') );
  $('#app-menu-color-filter').html( explore.banana.i18n('app-menu-color-filter') );
  $('#app-menu-locale').html( explore.banana.i18n('app-menu-locale') );
  $('#app-menu-style').html( explore.banana.i18n('app-menu-style') );
  $('#app-menu-speed').html( explore.banana.i18n('app-menu-speed') );
  $('#app-menu-pitch').html( explore.banana.i18n('app-menu-pitch') );
  $('#app-menu-fullscreen-active-pane').html( explore.banana.i18n('app-menu-fullscreen-active-pane') );
  $('#app-menu-toggle-sidebar').html( explore.banana.i18n('app-menu-toggle-sidebar') );
  $('#app-menu-bookmark-current-view').html( explore.banana.i18n('app-menu-bookmark-current-view') );
  $('#app-menu-add-bookmark').html( explore.banana.i18n('app-menu-add-bookmark') );
  $('#app-menu-add-bookmark-title').html( explore.banana.i18n('app-menu-add-bookmark-title') );
  $('#app-menu-add-bookmark-url').html( explore.banana.i18n('app-menu-add-bookmark-url') );
  $('#app-menu-add-bookmark-images').html( explore.banana.i18n('app-menu-add-bookmark-images') );
  $('#app-menu-add-bookmark-clear-files').html( explore.banana.i18n('app-menu-add-bookmark-clear-files') );
  $('#app-menu-add-bookmark-submit').html( explore.banana.i18n('app-menu-add-bookmark-submit') );
  $('#app-menu-random-topic-key').html( explore.banana.i18n('app-menu-random-topic-key') );
  $('#app-menu-note-1').html( explore.banana.i18n('app-menu-note-1') );

  $('#app-menu-goto-next-topic').html( explore.banana.i18n('app-menu-goto-next-topic') );
  $('#app-menu-goto-previous-topic').html( explore.banana.i18n('app-menu-goto-previous-topic') );
  $('#app-menu-goto-next-pane').html( explore.banana.i18n('app-menu-goto-next-pane') );
  $('#app-menu-goto-previous-pane').html( explore.banana.i18n('app-menu-goto-previous-pane') );
  $('#app-menu-new-search').html( explore.banana.i18n('app-menu-new-search') );

  $('#app-menu-cover-topic').text( explore.banana.i18n('app-menu-cover-topic') );
  $('#app-menu-culture').text( explore.banana.i18n('app-menu-culture') );
  $('#app-menu-nature').text( explore.banana.i18n('app-menu-nature') );
  $('#app-menu-news').text( explore.banana.i18n('app-menu-news') );
  $('#app-menu-license').text( explore.banana.i18n('app-menu-license') );
  $('#app-menu-features').text( explore.banana.i18n('app-menu-features') );
  $('#app-menu-persona').text( explore.banana.i18n('app-menu-persona') );
  $('#app-menu-country').text( explore.banana.i18n('app-menu-country') );

  $('#app-menu-all-rights-reserved').text( explore.banana.i18n('app-menu-all-rights-reserved') );
  $('#app-menu-interests').text( explore.banana.i18n('app-menu-interests') );
  $('#app-menu-country-select').text( explore.banana.i18n('app-menu-country-select') );
  $('#app-menu-command-editor').text( explore.banana.i18n('app-menu-command-editor') );

  if ( explore.language === 'en' ){
    $('#app-menu-run-code').text( explore.banana.i18n('app-menu-run-code') );
    $('#app-menu-clear-editor').text( explore.banana.i18n('app-menu-clear-editor') );
  }

  $('#app-menu-presentation').text( explore.banana.i18n('app-menu-presentation') );
  $('#app-menu-editor').text( explore.banana.i18n('app-menu-editor') );

  $('#app-menu-bookmark-actions-reasoning').text( explore.banana.i18n('app-menu-bookmark-actions-reasoning') );
  $('#app-menu-bookmark-actions').text( explore.banana.i18n('app-menu-bookmark-actions') );
  $('#app-menu-ai-tutor').text( explore.banana.i18n('app-menu-ai-tutor') );
  $('#app-menu-bread').text( explore.banana.i18n('app-menu-bread') );
  $('#app-menu-reading-assistance').text( explore.banana.i18n('app-menu-reading-assistance') );
  $('#app-menu-visual-search').text( explore.banana.i18n('app-menu-visual-search') );
  $('#app-menu-bookmark-actions-media').text( explore.banana.i18n('app-menu-bookmark-actions-media') );
  $('#app-menu-add-bookmark').text( explore.banana.i18n('app-menu-add-bookmark') );
  $('#app-menu-export-as').text( explore.banana.i18n('app-menu-export-as') );
  $('#app-menu-import-as').text( explore.banana.i18n('app-menu-import-as') );
  $('#app-menu-datasources').text( explore.banana.i18n('app-menu-datasources') );

  $('#app-menu-structured-search').text( explore.banana.i18n('app-menu-structured-search') );
  $('#app-menu-structured-search-title').text( explore.banana.i18n('app-menu-structured-search') );

  $('#app-menu-geospatial-search').text( explore.banana.i18n('app-menu-geospatial-search') );
  $('#app-menu-geospatial-search-title').text( explore.banana.i18n('app-menu-geospatial-search') );

  $('#app-menu-nature-location-quiz').text( explore.banana.i18n('app-menu-nature-location-quiz') );

  // guide elements
  $('#app-guide-string-search').text( explore.banana.i18n('app-guide-string-search') );

  $('#app-guide-bookmarks-selected').text( explore.banana.i18n('app-guide-bookmarks-selected') );
  $('#app-guide-bookmarks-deselect-all').text( explore.banana.i18n('app-guide-bookmarks-deselect-all') );

  $('#app-guide-bookmark-history').text( explore.banana.i18n('app-guide-bookmark-history') );
  $('#app-guide-bookmark-implications').text( explore.banana.i18n('app-guide-bookmark-implications') );
  $('#app-guide-bookmark-similarities').text( explore.banana.i18n('app-guide-bookmark-similarities') );
  $('#app-guide-bookmark-commonalities').text( explore.banana.i18n('app-guide-bookmark-commonalities') );
  $('#app-guide-bookmark-topic-differences').text( explore.banana.i18n('app-guide-bookmark-topic-differences') );
  $('#app-guide-bookmark-related-topics').text( explore.banana.i18n('app-guide-bookmark-related-topics') );
  $('#app-guide-bookmark-quiz-topics').text( explore.banana.i18n('app-guide-bookmark-quiz-topics') );
  $('#app-guide-bookmark-teach-topics').text( explore.banana.i18n('app-guide-bookmark-teach-topics') );
  $('#app-guide-bookmark-gapminder-country-trend').text( explore.banana.i18n('app-guide-bookmark-gapminder-country-trend') );

  $('#app-guide-ongoing-conflicts').text( explore.banana.i18n('app-guide-ongoing-conflicts') );
  $('#app-guide-conflict-map').text( explore.banana.i18n('app-guide-conflict-map') );
  $('#app-guide-news-economic-indicators').text( explore.banana.i18n('app-guide-news-economic-indicators') );
  $('#app-guide-news-tv').text( explore.banana.i18n('app-guide-news-tv') );
  $('#app-guide-live-tv').text( explore.banana.i18n('app-guide-live-tv') );
  $('#app-guide-news-radio').text( explore.banana.i18n('app-guide-news-radio') );
  $('#app-guide-news-gdelt').text( explore.banana.i18n('app-guide-news-gdelt') );
  $('#app-guide-newspapers').text( explore.banana.i18n('app-guide-newspapers') );
  $('#app-guide-near-me').text( explore.banana.i18n('app-guide-near-me') );
  $('#app-guide-technology').text( explore.banana.i18n('app-guide-technology') );

  // guide: welcome view elements
  $('#app-guide-welcome-text').html( explore.banana.i18n('app-guide-welcome-text') );
  $('#app-guide-featured-article').text( explore.banana.i18n('app-guide-featured-article') );
  $('#app-guide-featured-portal').text( explore.banana.i18n('app-guide-featured-portal') );
  $('#app-guide-continent').text( explore.banana.i18n('app-guide-continent') );
  $('#app-guide-bioregion').text( explore.banana.i18n('app-guide-bioregion') );
  $('#app-guide-mountain-range').text( explore.banana.i18n('app-guide-mountain-range') );
  $('#app-guide-disease').text( explore.banana.i18n('app-guide-disease') );
  $('#app-guide-organism').text( explore.banana.i18n('app-guide-organism') );
  $('#app-guide-protein').text( explore.banana.i18n('app-guide-protein') );
  $('#app-guide-atom').text( explore.banana.i18n('app-guide-atom') );
  $('#app-guide-protist').text( explore.banana.i18n('app-guide-protist') );
  $('#app-guide-help').text( explore.banana.i18n('app-guide-help') );
  $('#app-guide-sea').text( explore.banana.i18n('app-guide-sea') );

  $('#app-guide-current-events').text( explore.banana.i18n('app-guide-current-events') );
  $('#app-guide-topic').text( explore.banana.i18n('app-guide-topic') );
  $('#app-guide-artwork').text( explore.banana.i18n('app-guide-artwork') );
  $('#app-guide-music').text( explore.banana.i18n('app-guide-music') );
  $('#app-guide-documentary').text( explore.banana.i18n('app-guide-documentary') );
  $('#app-guide-country').text( explore.banana.i18n('app-guide-country') );
  $('#app-guide-historical-country').text( explore.banana.i18n('app-guide-historical-country') );
  $('#app-guide-ethnic-group').text( explore.banana.i18n('app-guide-ethnic-group') );
  $('#app-guide-language').text( explore.banana.i18n('app-guide-language') );
  $('#app-guide-national-park').text( explore.banana.i18n('app-guide-national-park') );
  $('#app-guide-mammal').text( explore.banana.i18n('app-guide-mammal') );
  $('#app-guide-bird').text( explore.banana.i18n('app-guide-bird') );
  $('#app-guide-reptile').text( explore.banana.i18n('app-guide-reptile') );
  $('#app-guide-fish').text( explore.banana.i18n('app-guide-fish') );
  $('#app-guide-amphibian').text( explore.banana.i18n('app-guide-amphibian') );
  $('#app-guide-insect').text( explore.banana.i18n('app-guide-insect') );
  $('#app-guide-spider').text( explore.banana.i18n('app-guide-spider') );
  $('#app-guide-plant').text( explore.banana.i18n('app-guide-plant') );
  $('#app-guide-algae').text( explore.banana.i18n('app-guide-algae') );
  $('#app-guide-fungus').text( explore.banana.i18n('app-guide-fungus') );
  $('#app-guide-bacterium').text( explore.banana.i18n('app-guide-bacterium') );
  $('#app-guide-virus').text( explore.banana.i18n('app-guide-virus') );
  $('#app-guide-cell-type').text( explore.banana.i18n('app-guide-cell-type') );
  $('#app-guide-archae').text( explore.banana.i18n('app-guide-archae') );

  $('#app-guide-country-map').text( explore.banana.i18n('app-guide-country-map') );
  $('#app-guide-country').text( explore.banana.i18n('app-guide-country') );
  $('#app-guide-capital').text( explore.banana.i18n('app-guide-capital') );
  $('#app-guide-form-of-government').text( explore.banana.i18n('app-guide-form-of-government') );
  $('#app-guide-religion').text( explore.banana.i18n('app-guide-religion') );
  $('#app-guide-philosophy').text( explore.banana.i18n('app-guide-philosophy') );
  $('#app-guide-period').text( explore.banana.i18n('app-guide-period') );
  $('#app-guide-history-aspect').text( explore.banana.i18n('app-guide-history-aspect') );
  $('#app-guide-revolution').text( explore.banana.i18n('app-guide-revolution') );
  $('#app-guide-war').text( explore.banana.i18n('app-guide-war') );
  $('#app-guide-battle').text( explore.banana.i18n('app-guide-battle') );
  $('#app-guide-documentary').text( explore.banana.i18n('app-guide-documentary') );
  $('#app-guide-documentary-title').text( explore.banana.i18n('app-guide-documentary-title') );
  $('#app-guide-film-title').text( explore.banana.i18n('app-guide-film-title') );
  $('#app-guide-art-movement').text( explore.banana.i18n('app-guide-art-movement') );
  $('#app-guide-composer').text( explore.banana.i18n('app-guide-composer') );
  $('#app-guide-painter').text( explore.banana.i18n('app-guide-painter') );
  $('#app-guide-science').text( explore.banana.i18n('app-guide-science') );
  $('#app-guide-poet').text( explore.banana.i18n('app-guide-poet') );
  $('#app-guide-philosopher').text( explore.banana.i18n('app-guide-philosopher') );
  $('#app-guide-architect').text( explore.banana.i18n('app-guide-architect') );
  $('#app-guide-inventor').text( explore.banana.i18n('app-guide-inventor') );
  $('#app-guide-software').text( explore.banana.i18n('app-guide-software') );
  $('#app-guide-mathematics').text( explore.banana.i18n('app-guide-mathematics') );
  $('#app-guide-tourist-attraction').text( explore.banana.i18n('app-guide-tourist-attraction') );
  $('#app-guide-dish').text( explore.banana.i18n('app-guide-dish') );
  $('#app-guide-musical-instrument').text( explore.banana.i18n('app-guide-musical-instrument') );
  $('#app-guide-technology').text( explore.banana.i18n('app-guide-technology') );
  $('#app-guide-radio').text( explore.banana.i18n('app-guide-radio') );

  // other elements
  $('#app-topics-found').text( explore.banana.i18n('app-topics-found') );
  $('#app-guide-see-more').text( explore.banana.i18n('app-guide-see-more') );
  $('#app-guide-page').text( explore.banana.i18n('app-guide-page') );

  // TODO: localize all section-names
  Object.keys( explore.sections ).forEach(( sid ) => {

    let id = 'app-section-' + sid;

    // update all current sections
 		$( '[id=' + id + ']' ).text( explore.banana.i18n( id ) );

    // update future section-html
 		explore.section_dom.find('#' + id ).text( explore.banana.i18n( id ) );

  });

}

async function setPersonas() {

  if ( valid( explore.personas ) ){

    if ( !Array.isArray( explore.personas ) ){ // string

      if ( explore.personas.includes(',') ){ // string with multiple values

        explore.personas = explore.personas.split(',') || [];

      }
      else if ( ! explore.personas.includes('"') ){ // one string

        explore.personas = [ explore.personas ];

      }
      else { // string of an array

        explore.personas = eval( explore.personas ) || [];

      }

    }

    explore.personas.forEach(( v ) => {

      $('#persona-select').find('option[value="' + v + '"]').prop('selected', true);

    });

    $('#persona-select').formSelect();

    // activate GPS for tourists and nomads
    if ( explore.personas.includes('nomad') || explore.personas.includes('tourist') ){

      getLocation();

      console.log( 'explore.position: ', explore.position );

    }

  }

};

function setupOptionTutor() {

  (async () => {

    explore.tutor = await explore.db.get('tutor');
    explore.tutor = ( explore.tutor === null || explore.tutor === '' ) ? 'auto-select' : explore.tutor;

    setTutor( explore.tutor );

    $('#tutor').change(function() {

      explore.tutor = $(this).val();

      (async () => { await explore.db.set('tutor', $(this).val() ); })();

      setTutor( explore.tutor );

    })

  })();

}

async function setTutor( t ) {

  if ( explore.tutors.includes( t ) ){

    explore.tutor = t;

    $('#tutor').find('option[value="' + explore.tutor + '"]').prop('selected', true);
    $('#tutor').formSelect();

    // FIXME: Safari browser error in regex: "SyntaxError: Invalid regular expression: invalid group specifier name"
    if ( explore.isSafari ){ return false; }

    setupAIChat();

    /*
    if ( explore.q === '' && explore.qid === '' && explore.type === '' ){
      // do nothing on the start page
    }
    else { // only do this on the initial visit

      //refreshArticles();

    }
    */

  }

}

function setupOptionPersonas() {

  (async () => {

    explore.personas = await explore.db.get('personas');
    explore.personas = ( explore.personas === null || explore.personas === '' ) ? [] : explore.personas;

    setPersonas();

    $('#persona-select').change(function() {

      explore.personas = $(this).val();

      (async () => { await explore.db.set('personas', $(this).val() ); })();

      setPersonas();

    })

  })();

}

async function setCountry( country ) {

  if ( valid( country ) ){

    explore.country = country.toLowerCase();

    // fix country-select option-value
    //if ( explore.country === 'gb' ){ explore.country = 'uk'; }

    Object.keys( countries ).forEach( (( qid ) => {

      if ( countries[ qid ].iso2 === explore.country.toUpperCase() ){

        explore.country_qid   = qid;

        explore.country_name  = countries[ qid ].name;
        explore.country_iso3  = countries[ qid ].iso3;
        explore.country_gdelt = countries[ qid ].gdelt;

      }

    }));

    (async () => { await explore.db.set('country', explore.country ); })();

    $('#country-select').countrySelect('selectCountry', explore.country);

  }

}

function setupOptionCountry(){

  // see: https://github.com/mrmarkfrench/country-select-js
  $("#country-select").countrySelect({
    //defaultCountry: "jp",
    //onlyCountries: ['us', 'gb', 'ch', 'ca', 'do', 'jp'],
    //preferredCountries: ['ca', 'gb', 'us'],
    responsiveDropdown: true
  });

  $('#country-select').change(function(e) {{ 

    console.log( 'country changed' );

    setCountry( $('#country-select').countrySelect('getSelectedCountryData')['iso2']  );

  }});


  (async () => {

    explore.country = await explore.db.get('country');

    if ( explore.country === null  || !valid( explore.country ) ){

      let split = navigator.language.split('-');

      if ( valid( split[1] ) ){

        explore.country = split[1].toLowerCase();

        setCountry( explore.country );

      }
      else {

        explore.country = '';

      }

    }
    else {

      setCountry( explore.country );
 
    }

  })();

}

async function setTopicCover() {

  $('#covertopic').find('option[value="' + explore.covertopic + '"]').prop('selected', true);
  $('#covertopic').formSelect();

}

function setupOptionTopicCover(){

  (async () => {

    explore.covertopic = await explore.db.get('covertopic');
    explore.covertopic = ( explore.covertopic === null || explore.covertopic === '' ) ? '' : explore.covertopic;

    setTopicCover();

    $('#covertopic').change(function() {

      explore.covertopic = $(this).val();
      (async () => { await explore.db.set('covertopic', $(this).val() ); })();

      setTopicCover();

    })

  })();

}

async function setColorFilter() {

  if ( explore.colorfilter === 'grayscale' ){
    $('iframe').css({ 'filter': 'grayscale(100)'});
    $('body').css({ 'filter': 'grayscale(100)'});
  }
  else if ( explore.colorfilter === 'sepia' ){
    $('iframe').css({ 'filter': 'sepia(10%)'});
    $('body').css({ 'filter': 'sepia(10%)'});
  }
  else if ( explore.colorfilter === 'invert' ){
    $('iframe').css({ 'filter': 'invert(85%)'});
    $('body').css({ 'filter': 'invert(85%)'});
  }
  else if ( explore.colorfilter === 'reduced-contrast' ){
    $('body').css({ 'filter': 'constrast(80%)'});
  }
  else if ( explore.colorfilter === 'blur' ){
    $('body').css({ 'filter': 'blur(0.3em)'});
  }
  else {
    $('iframe').css({ 'filter': 'none'});
    $('body').css({ 'filter': 'none'});
  }

  $('#colorfilter').find('option[value="' + explore.colorfilter + '"]').prop('selected', true);
  $('#colorfilter').formSelect();

};

function setupOptionColorFilter() {

  (async () => {

    explore.colorfilter = await explore.db.get('colorfilter');
    explore.colorfilter = ( explore.colorfilter === null || explore.colorfilter === '' ) ? '' : explore.colorfilter;

    setColorFilter();

    $('#colorfilter').change(function() {

      explore.colorfilter = $(this).val();
      (async () => { await explore.db.set('colorfilter', $(this).val() ); })();

      setColorFilter();

    })

  })();

}

function setupOptionAutocompleteToggle() {

  (async () => {

    explore.autocomplete = await explore.db.get('autocomplete');

    if ( explore.autocomplete === 'false' ){
      explore.autocomplete = false;
    }
    else {
      explore.autocomplete = true;
    }

    if ( explore.autocomplete ){
      $('#autocompletetoggle').prop('checked', true);
      $('.searchbox').autocomplete( 'enable' );
    }
    else {
      $('#autocompletetoggle').prop('checked', false);
      $('.searchbox').autocomplete( 'disable' );
    }

    $('#autocompletetoggle').change(function() {

      if ( $('#autocompletetoggle').prop('checked') ){
        (async () => { await explore.db.set('autocomplete', true); })();
        explore.autocomplete = true;
        $('.searchbox').autocomplete( 'enable' );
      }
      else {
        (async () => { await explore.db.set('autocomplete', false); })();
        explore.autocomplete = false;
        $('.searchbox').autocomplete( 'disable' );
      }

    })

  })();

}

function setupURL() {

  // URI.js: https://medialize.github.io/URI.js/docs.html
  //				 https://medialize.github.io/URI.js/docs.html#search-set
  explore.url = URI.parse( document.URL );
  //explore.hash = window.location.hash.substring(1) || '';

  // store previous URL state values
  explore.q_prev = explore.q;
  explore.type_prev = explore.type;
  explore.language_prev = explore.language;
  explore.show_sidebar_prev = explore.sidebar;

  explore.q = explore.url.path.split('/')[2] || ''; 
  explore.q = decodeURIComponent( explore.q.trim().replace(/(_|%20)/g, ' ').replace(/%25/g, '%') ).replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "");

  // handle backward & forward URL requests:
  //   https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
  $(window).on('popstate', function (e) {

    // set hash if needed
    //let hash = window.location.hash.substring(1) || '';
    explore.hash = explore.hash.replace(/[ %{}|^~\[\]()`"'+<%'&\.\/?:@;=,]/g, '_').toLowerCase(); //`

    // set language 
    explore.language = window.language = getParameterByName('l');

    // set type
    explore.type = getParameterByName('t');

    if ( explore.type === '' || explore.type === undefined ){
      explore.type = 'string';
    }

    //console.log('moving backwards, type is: ', explore.type );

    /*
    // set direct title
    explore.direct = getParameterByName('d');

    if ( explore.direct === true ){
      explore.direct = true;
    }
    else {
      explore.direct = false;
    }
    */

    // set sort-key
    explore.sortby = getParameterByName('sortby');

    // set filter-key
    explore.filterby = getParameterByName('filterby');

    // set custom data
    explore.custom = getParameterByName('c');

    // FIXME: not yet using this info when going back
    explore.uri = getParameterByName('u').replace(/%253C/g, '<').replace(/%253E/g, '>');

    // set query-builder data
    explore.query = getParameterByName('query');

    // set editor-commands data
    explore.commands = getParameterByName('commands');
    //explore.commands = unpackString( getParameterByName('commands') );

    // set linemarks
    explore.marks = getParameterByName('m');

    if ( explore.marks === '' || explore.marks === undefined ){
      explore.marks = '';
    }

    setReplaceState();

  });

}

function setReplaceState(){

  // store previous URL state values
  explore.q_prev        = explore.q;
  explore.language_prev = explore.language;

  // get current query string
  let q = window.location.pathname.replace(/\/explore\/?/g, ' ') || ''; 
  q = q.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, '').replace(/_/g, ' ');

  q = q.replace(/%25/g, '%');
  q = q.replace(/%20/g, ' ');

  explore.q = decodeURIComponent( q ).trim();

  if ( explore.q_prev === explore.q && explore.type_prev === explore.type && explore.language_prev === explore.language && explore.show_sidebar_prev === explore.show_sidebar_prev ){

    // we are on the same URL query (so likely also the same page)

    if ( explore.hash !== '' ){

      // TODO cleanup this duplicate hash-code into a utility function
      const hash_ = explore.hash.replace(/[ %{}|^~\[\]()`"'+<>%'&\.\/?:@;=,]/g, '_').toLowerCase(); // NOTE: `sync this replace-line with wikipedia-iframe.js
      const iframeEl = document.getElementById( explore.baseframe );

      if ( iframeEl === null ){
        // no iframe found?
      }
      else {

        iframeEl.contentWindow.location.hash = hash_;

      }
    }

    explore.replaceState = true; // allow any new replace State calls to work

  }
  else { // user-browser went backwards or forwards

    // FIXME: going back and forth is not yet triggering the sidebar toggling
    //if ( explore.show_sidebar_prev !== explore.show_sidebar_prev ){
    //  toggleSidebar();
    //}

    // in this case: prevent the replace State() action to take place (as this would cause a loop)
    explore.replaceState = false;

    if ( ! explore.isSafari ){ // prevent the input-field-clearing Safari bug??

      let terms = $('#srsearch').val( decodeURIComponent( explore.q ) );

    }

    $('.submitSearch').click();
    //console.log( 'go to page with state: ', explore.q, explore.language, ' type: ', explore.type, ' hash: ', explore.hash );

    explore.replaceState = true;
  }

}

async function setupUI() {

  // FIXME cleanup / order this code

  // sticky header
  $(window).scroll(function(){

    const sticky = $('.sticky');
    const scroll = $(window).scrollTop();

    if ( scroll >= 100 ){
      sticky.addClass('fixed');
    }
    else {
      sticky.removeClass('fixed');
    }
  });

  $('select').formSelect(); // required MaterializeCSS "select"-init

  // close inactive details 
  $('details.auto').click(function (event) {
    $('details.auto').not(this).removeAttr("open");  
  });

  if ( !explore.isMobile ){

    determineWidthSplitter();

  }

  // screen resizing
  $( window ).resize(function() {

    if (window.matchMedia("(orientation: portrait)").matches) {
      explore.deviceOrientation = 'portrait';
    }

    if (window.matchMedia("(orientation: landscape)").matches) {
      explore.deviceOrientation = 'landscape';
    }

    if ( !explore.isMobile ){ // tablets & desktops

      if ( explore.splitter === undefined ){
        // do nothing
      }
      else {

        // resize splitter dimensions
        $('#splitter').css({ width : $(window).width(), height: $(window).height() });

        // resize sidebar
        $('div.sticky').css({ 'width' : explore.splitter.position() });

        explore.splitter.refresh();
      }

      resizeEmbeddedSplitter();

    }

  });

  // initial sticky header width
  $('.sticky').width( $('#sidebar').css('width') );
  $('#srsearch').focus();
  $('#srsearch').change( function( e ) {

    $('#srsearch').val();
    explore.q = getSearchValue();

    if ( explore.q ) {

      if ( valid( explore.tab ) ){
        explore.tabsInstance.select( explore.tab );
        explore.tab = '';
      }
      else if ( explore.isMobile === false ){
        explore.tabsInstance.select('tab-topics');
      }

    }

  });

}


// =======================

/*
async function exploreString( string ) {

  handleClick({ 
    id        : 'n1-0',
    type      : 'explore',
    title     : string,
    language  : explore.language,
    qid       : '',
    url       : '',
    tag       : '',
    languages : '',
    custom    : '',
    //target_pane : 'p1',
  });

}
*/

async function exploreTopic( qid ) {

  handleClick({ 
    id        : 'n1-0',
    type      : 'wikipedia-qid',
    title     : '',
    language  : explore.language,
    qid       : qid,
    url       : '',
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });

}

async function updateQueryBuilder(){

  if ( valid( explore.language ) ){

    setParameter( 'l', explore.language, explore.hash );

  }

  if ( valid( explore.query ) ){

    setParameter( 'query', explore.query, explore.hash );

  }

  const query_builder_html =
    '<link href="' + explore.base + '/app/query-builder/css/app.4dc2b4db.css" rel="stylesheet">' + 
    '<link href="' + explore.base + '/app/query-builder/css/chunk-vendors.313a1896.css" rel="stylesheet">' +
    '<link href="' + explore.base + '/app/explore2/dist/css/conzept/query-builder-custom.css?v001" rel="stylesheet">' +
    '<script src="' + explore.base + '/app/query-builder/js/chunk-vendors.9d2b1a47.js"></script>' +
    '<script src="' + explore.base + '/app/query-builder/js/app.9d67c455.js"></script>';

  $( '#query-builder-code' ).html( query_builder_html );

}

// reset the elements visibility to default.
async function setDefaultDisplaySettings( cover, type ) {

  if ( window.location !== window.parent.location ) { // embedded in an iframe

    resetIframe();

    $( explore.baseframe ).attr({"src": explore.base + '/pages/blank.html' }); // TODO: is it worth it to fix this via a PHP page?

    $('#loader').hide(); // not really needed?

    return 0;

  }

  explore.topic_cursor = 'n1-1';

  // results summary stats
  $('#detail-result-summary').hide();
  $('.pieTip').remove();
  $('#pieChart').empty();

	$( '#results-paging' ).css( 'display', 'none' );
	$( '#results-label' ).css( 'display', 'inline-block' );
	$( '#next' ).css( 'display', 'none' );
	$( '#previous' ).css( 'display', 'none' );
	$( '#results' ).empty();
  $( '#total-results' ).empty();

  const welcome_footer_space = explore.isMobile ? '<div style="margin-bottom:18rem;"></div>' : '';

  let quote_author  = '';
  let quote_line    = '';
  let quote         = '';
  let wp_prefix     = '';

  $( '#results' ).html( 
    '<div class="intro-box">' +
      '<img title="Boston Public Library" alt="Boston Public Library" style="width: 100%; border-radius:0.2em;" src="' + explore.base + '/app/explore2/assets/images/front.jpg">' +

      '<p>' + 
        '<span id="app-guide-welcome-text"></span> &nbsp;' + 
        '<span id="app-social-icons">' + 
          '<a target="_blank" rel="noopener" href="https://github.com/waldenn/conzept" title="GitHub repository" aria-label="GitHub repository" role="button"><i class="fa-brands fa-github"></i></a> &nbsp;' + 
          '<a target="infoframe" onclick="resetIframe()" href="/pages/privacy_policy.html" title="privacy policy" aria-label="privacy policy" role="button"><i class="fa-solid fa-section"></i></a> &nbsp;' + 
          '<a target="_blank" rel="noopener" href="https://github.com/sponsors/waldenn?o=esb" title="GitHub sponsor" aria-label="GitHub sponsor" role="button"><i class="fa-solid fa-heart"></i></a> &nbsp;' + 
          '<a target="_blank" rel="noopener" href="https://addons.mozilla.org/en-US/firefox/addon/conzept-encyclopedia-extension/" title="Firefox browser extension" aria-label="Firefox browser extension" role="button"><i class="fa-brands fa-firefox-browser"></i></a> &nbsp;' + 
          //'<a target="_blank" rel="noopener" href="https://chrome.google.com/webstore/detail/bhenkikoaimipnapdhofmpmopnggakmn/preview?hl=en-GB" title="Chrome browser extension" aria-label="Chrome browser extension" role="button"><i class="fa-brands fa-chrome"></i></a> &nbsp;' + 
          '<a target="_blank" rel="noopener" href="https://twitter.com/conzept__" title="Twitter news" aria-label="Twitter news" role="button"><i class="fa-brands fa-twitter"></i></a> &nbsp;' + 
        '</span>' + 
      '</p>' + 
    
      '<div class="frontpage-grid-container">' +

        '<div><a class="" title="random featured article" aria-label="random featured article" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;featured-article&quot; )"><span class="icon"><i class="fa-regular fa-star fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-featured-article">featured article</span></span></a></div>' +

        // show a geolocation-button or a random-button
        ( valid( navigator.geolocation ) ? '<div><a class="" title="topics near me" aria-label="topics near me" role="button" href="javascript:void(0)" onclick="getLocation( showTopicsNearMe )"><span class="icon"><i class="fa-solid fa-map-location-dot fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-near-me">near me</span></span></a></div>' : '<div><a class="link random" title="go to a random topic" aria-label="random topic" role="button" href="javascript:void(0)" onclick="showRandomQuery()"><span class="icon"><i class="fa-solid fa-map-signs fa-2x" style="transform:rotate(5deg);"></i></span><br><span class="frontpage-icon"><span id="app-guide-topic"></span></span></a></div>' ) +

        '<div><a class="link random" title="documentation" aria-label="documentation" role="button" href="/guide/user_manual" target="infoframe"><span class="icon"><i class="fa-solid fa-question fa-2x" style=""></i></span><br><span class="frontpage-icon"><span id="app-guide-help">help</span></span></a></div>' +

      '</div>' +

        '<details class="auto frontpage" style="" closed>' +
          '<summary><span id="app-menu-culture">culture</span></summary>' +

          '<div class="frontpage-grid-container">' +

            // general culture
            '<div><a class="" title="random featured portal" aria-label="random featured portal" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;featured-portal&quot; )"><span class="icon"><i class="fa-regular fa-star fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-featured-portal">featured portal</span></span></a></div>' +
            //'<div><a class="" title="visual search" aria-label="visual search" role="button" href="javascript:void(0)" onclick="identifyOther()"><span class="icon"><i class="fa-solid fa-camera fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-menu-visual-identification">visual search</span></span></a></div>' +

            // geography
            '<div><a class="" title="random country map" aria-label="random country map" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;country-map&quot; )"><span class="icon"><i class="fa-solid fa-globe-africa fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-country-map">country map</span></span></a></div>' +
            '<div><a class="" title="random country" aria-label="random country" role="button" href="javascript:void(0)" onclick="showRandomCountry()"><span class="icon"><i class="fa-regular fa-flag fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-country"></span></span></a></div>' +
            '<div><a class="" title="random historical country" aria-label="random historical country" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;historical-country&quot; )"><span class="icon"><i class="fa-regular fa-flag fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-historical-country"></span></span></a></div>' +
            '<div><a class="" title="random capital" aria-label="random capital" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;capital&quot; )"><span class="icon"><i class="fa-solid fa-map-marker-alt fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-capital">capital</span></span></a></div>' +
            '<div><a class="" title="random form of government" aria-label="random form of government" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;form-of-government&quot; )"><span class="icon"><i class="fa-solid fa-balance-scale-right fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-form-of-government">form of gov.</span></span></a></div>' +
            '<div><a class="" title="random ethnic group" aria-label="random ethnic group" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;ethnic-group&quot; )"><span class="icon"><i class="fa-solid fa-hand-holding-heart fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-ethnic-group"></span></span></a></div>' +
            '<div><a class="" title="random language" aria-label="random language" role="button" href="javascript:void(0)" onclick="showRandomLanguage()"><span class="icon"><i class="fa-solid fa-language fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-language"></span></span></a></div>' +
            '<div><a class="" title="random religion" aria-label="random religion" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;religion&quot; )"><span class="icon"><i class="fa-solid fa-dharmachakra fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-religion">religion</span></span></a></div>' +

            // history
            '<div><a class="" title="random period" aria-label="random period" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;period&quot; )"><span class="icon"><i class="fa-solid fa-history fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-period">period</span></span></a></div>' +
            '<div><a class="" title="random aspect of history" aria-label="random aspect of history" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;history-aspect&quot; )"><span class="icon"><i class="fa-solid fa-history fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-history-aspect">history aspect</span></span></a></div>' +
            '<div><a class="" title="random revolution" aria-label="random revolution" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;revolution&quot; )"><span class="icon"><i class="fa-solid fa-history fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-revolution">revolution</span></span></a></div>' +
            '<div><a class="" title="random war" aria-label="random war" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;war&quot; )"><span class="icon"><i class="fa-solid fa-crosshairs fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-war">war</span></span></a></div>' +
            '<div><a class="" title="random battle" aria-label="random battle" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;battle&quot; )"><span class="icon"><i class="fa-solid fa-crosshairs fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-battle">battle</span></span></a></div>' +

            // film
            '<div><a class="" title="random documentary" aria-label="random documentary" role="button" href="javascript:void(0)" onclick="showRandomDocumentary()"><span class="icon"><i class="fa-solid fa-film fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-documentary"></span></span></a></div>' +
            '<div><a class="" title="random documentary title" aria-label="random documentary title" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;documentary&quot; )"><span class="icon"><i class="fa-solid fa-film fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-documentary-title">documentary title</span></span></a></div>' +
            '<div><a class="" title="random film title" aria-label="random film title" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;film&quot; )"><span class="icon"><i class="fa-solid fa-film fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-film-title">film title</span></span></a></div>' +

            // arts
            '<div><a class="" title="random art movement" aria-label="random art movement" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;art-movement&quot; )"><span class="icon"><i class="fa-brands fa-uncharted fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-art-movement">art movement</span></span></a></div>' +
            '<div><a class="" title="random artwork" aria-label="random artwork" role="button" href="javascript:void(0)" onclick="showRandomArtwork()"><span class="icon"><i class="fa-regular fa-image fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-artwork"></span></span></a></div>' +
            //'<div><a class="" title="random Europeana artwork" aria-label="random Europeana artwork" role="button" href="javascript:void(0)" onclick="showRandomEuropeanaArtwork()"><span class="icon"><i class="fa-regular fa-image fa-2x" ></i></span><br><span class="frontpage-icon">Europeana</span></a></div>' +
            '<div><a class="" title="random music" aria-label="random music" href="javascript:void(0)" role="button" onclick="showRandomMusic()"><span class="icon"><i class="fa-solid fa-music fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-music"></span></span></a></div>' +
            '<div><a class="" title="radio stations map" aria-label="radio stations map" role="button" href="javascript:void(0)" onclick="openLink( &quot;https://www.radio-browser.info/map&quot; )"><span class="icon"><i class="fa-solid fa-radio fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-radio-map">radio map</span></span></a></div>' +
            '<div><a class="" title="random radio station" aria-label="random radio station" role="button" href="javascript:void(0)" onclick="showRandomRadioStation()"><span class="icon"><i class="fa-solid fa-radio fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-radio">radio</span></span></a></div>' +
            '<div><a class="" title="random musical instrument" aria-label="random musical instrument" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;musical-instrument&quot; )"><span class="icon"><i class="fa-solid fa-guitar fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-musical-instrument">instrument</span></span></a></div>' +
            '<div><a class="" title="random music composer" aria-label="random music composer" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;composer&quot; )"><span class="icon"><i class="fa-solid fa-user-edit fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-composer">composer</span></span></a></div>' +
            '<div><a class="" title="random painter" aria-label="random painter" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;painter&quot; )"><span class="icon"><i class="fa-solid fa-user-edit fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-painter">painter</span></span></a></div>' +
            '<div><a class="" title="random poet" aria-label="random poet" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;poet&quot; )"><span class="icon"><i class="fa-solid fa-user-edit fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-poet">poet</span></span></a></div>' +
            '<div><a class="" title="random philosopher" aria-label="random philosopher" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;philosopher&quot; )"><span class="icon"><i class="fa-solid fa-user-edit fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-philosopher">philosopher</span></span></a></div>' +
            '<div><a class="" title="random architect" aria-label="random architect" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;architect&quot; )"><span class="icon"><i class="fa-solid fa-user-edit fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-architect">architect</span></span></a></div>' +

            // industry
            '<div><a class="" title="random inventor" aria-label="random inventor" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;inventor&quot; )"><span class="icon"><i class="fa-solid fa-user-edit fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-inventor">inventor</span></span></a></div>' +
            '<div><a class="" title="random science" aria-label="random science" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;science&quot; )"><span class="icon"><i class="fa-solid fa-microscope fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-science">science</span></span></a></div>' +
            '<div><a class="" title="random area of mathematics" aria-label="random area of mathematics" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;mathematics&quot; )"><span class="icon"><i class="fa-solid fa-square-root-alt fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-mathematics">mathematics</span></span></a></div>' +
            '<div><a class="" title="random software" aria-label="random software" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;software&quot; )"><span class="icon"><i class="fa-regular fa-window-maximize fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-software">software</span></span></a></div>' +

            // various
            '<div><a class="" title="random tourist attraction" aria-label="random tourist attraction" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;tourist-attraction&quot; )"><span class="icon"><i class="fa-solid fa-gopuram fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-tourist-attraction">tourist attraction</span></span></a></div>' +
            '<div><a class="" title="random dish" aria-label="random dish" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;dish&quot; )"><span class="icon"><i class="fa-solid fa-utensils fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-dish">dish</span></span></a></div>' +

          '</div>' +

        '</details>' +

        '<details class="auto frontpage" style="" closed>' +
          '<summary><span id="app-menu-nature">nature</span></summary>' +

          '<div class="frontpage-grid-container">' +
            '<div><a class="" title="random sea" aria-label="random sea" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;sea&quot; )"><span class="icon"><i class="fa-solid fa-water fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-sea">sea</span></span></a></div>' +
            '<div><a class="" title="random continent" aria-label="random continent" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;continent&quot; )"><span class="icon"><i class="fa-brands fa-firstdraft fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-continent">continent</span></span></a></div>' +
            '<div><a class="" title="random bioregion" aria-label="random bioregion" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;bioregion&quot; )"><span class="icon"><i class="fa-brands fa-firstdraft fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-bioregion">bioregion</span></span></a></div>' +
            '<div><a class="" title="random mountain range" aria-label="random mountain range" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;mountain-range&quot; )"><span class="icon"><i class="fa-solid fa-mountain fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-mountain-range">mountain range</span></span></a></div>' +
            '<div><a class="" title="random national park" aria-label="random national park" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;national-park&quot; )"><span class="icon"><i class="fa-solid fa-mountain fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-national-park"></span></span></a></div>' +
            '<div><a class="" title="random disease" aria-label="random disease" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;disease&quot; )"><span class="icon"><i class="fa-solid fa-head-side-cough fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-disease">disease</span></span></a></div>' +
            '<div><a class="" title="random organism" aria-label="random organism" role="button" href="javascript:void(0)" onclick="showRandomOrganism()"><span class="icon"><i class="fa-solid fa-paw fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-organism">organism</span></span></a></div>' +
            '<div><a class="" title="random mammal" aria-label="random mammal" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;mammal&quot; )"><span class="icon"><i class="fa-solid fa-otter fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-mammal"></span></span></a></div>' +
            '<div><a class="" title="random bird" aria-label="random bird" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;bird&quot; )"><span class="icon"><i class="fa-solid fa-crow fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-bird"></span></span></a></div>' +
            '<div><a class="" title="random reptile" aria-label="random reptile" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;reptile&quot; )"><span class="icon"><i class="oma oma-black-snake oma-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-reptile"></span></span></a></div>' +
            '<div><a class="" title="random fish" aria-label="random fish" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;fish&quot; )"><span class="icon"><i class="fa-solid fa-fish fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-fish"></span></span></a></div>' +
            '<div><a class="" title="random fish" aria-label="random amphibian" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;amphibian&quot; )"><span class="icon"><i class="fa-solid fa-frog fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-amphibian"></span></span></a></div>' +
            '<div><a class="" title="random insect" aria-label="random insect" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;insect&quot; )"><span class="icon"><i class="fa-solid fa-bug fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-insect"></span></span></a></div>' +
            '<div><a class="" title="random spider" aria-label="random spider" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;spider&quot; )"><span class="icon"><i class="fa-solid fa-spider fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-spider"></span></span></a></div>' +
            '<div><a class="" title="random plant" aria-label="random plant" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;plant&quot; )"><span class="icon"><i class="fa-brands fa-pagelines fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-plant"></span></span></a></div>' +
            '<div><a class="" title="plant photo identification" aria-label="plant photo identification" role="button" href="javascript:void(0)" onclick="identifyPlant()"><span class="icon"><i class="fa-brands fa-pagelines fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-menu-plant-identification"></span></span></a></div>' +
            '<div><a class="" title="random algae" aria-label="random algae" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;algae&quot; )"><span class="icon"><i class="oma oma-black-fish-cake-with-swirl oma-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-algae"></span></span></a></div>' +
            '<div><a class="" title="random fungus" aria-label="random fungus" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;fungus&quot; )"><span class="icon"><i class="oma oma-black-champignon-brown oma-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-fungus"></span></span></a></div>' +
            '<div><a class="" title="random protist" aria-label="random protist" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;protist&quot; )"><span class="icon"><i class="fa-solid fa-bacterium fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-protist">protist</span></span></a></div>' +
            '<div><a class="" title="random bacterium" aria-label="random bacterium" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;bacterium&quot; )"><span class="icon"><i class="fa-solid fa-bacterium fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-bacterium"></span></span></a></div>' +
            '<div><a class="" title="random archae" aria-label="random archae" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;archae&quot; )"><span class="icon"><i class="fa-solid fa-bacterium fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-archae">archae</span></span></a></div>' +
            '<div><a class="" title="random cell type" aria-label="random cell type" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;cell-type&quot; )"><span class="icon"><i class="oma oma-black-hollow-red-circle oma-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-cell-type">cell type</span></span></a></div>' +
            '<div><a class="" title="random virus" aria-label="random virus" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;virus&quot; )"><span class="icon"><i class="fa-solid fa-virus fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-virus"></span></span></a></div>' +
            '<div><a class="" title="random protein" aria-label="random protein" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;protein&quot; )"><span class="icon"><i class="fa-solid fa-dna fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-protein">protein</span></span></a></div>' +
            '<div><a class="" title="random atomic element" aria-label="random atomic element" role="button" href="javascript:void(0)" onclick="showRandomListItem( &quot;element&quot; )"><span class="icon"><i class="fa-solid fa-atom fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-atom">atom</span></span></a></div>' +
          '</div>' +
        '</details>' +

        '<details class="auto frontpage" style="" closed>' +
          '<summary><span id="app-menu-news">news</span></summary>' +

          '<div class="frontpage-grid-container">' +

            // by language
            '<div><a class="" title="current events" aria-label="current events" role="button" href="javascript:void(0)" onclick="showCurrentEventsPage()"><span class="icon"><i class="fa-brands fa-wikipedia-w fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-current-events"></span></span></a></div>' +

            '<div><a class="" title="WikiNews" aria-label="WikiNews" role="button" href="javascript:void(0)" onclick="openInFrame( &quot;https://' + explore.language + '.m.wikinews.org/wiki/&quot; )"><span class="icon"><i class="fa-regular fa-newspaper fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-wikinews">Wikinews</span></span></a></div>' +

            `<div><a class="" title="GDELT news database" aria-label="GDELT news database" role="button" href="javascript:void(0)" onclick="openLink( &quot;/app/gdelt#api=geo&query=&sourcelang=${ explore.langcode }&geomode=PointData&geotimespan=1d&quot; )"><span class="icon"><i class="fa-regular fa-newspaper fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-news-gdelt">GDELT</span></span></a></div>` +

            // by country
            `<div><a class="" title="W3 Newspapers" aria-label="W3 Newspapers" role="button" href="javascript:void(0)" onclick="gotoW3NewspapersLink()"><span class="icon"><i class="fa-regular fa-newspaper fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-newspapers">newspapers</span></span></a></div>` +

            //`<div><a class="" title="World-Newspapers" aria-label="World-Newspapers" role="button" href="javascript:void(0)" onclick="gotoWorldNewspapersLink()"><span class="icon"><i class="fa-regular fa-newspaper fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-newspapers-2">newspapers (II)</span></span></a></div>` +

            // FIXME: create i18n for the word "news"
            `<div><a class="" title="YouTube video news" aria-label="YouTube video news" role="button" href="javascript:void(0)" onclick="openLink( &quot;/app/video/?l=${explore.language}#/search/%22${ wp_languages[ explore.language ].namelocal }%22%20news&quot; )"><span class="icon"><i class="fa-solid fa-video fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-news-youtube">YouTube</span></span></a></div>` +

            '<div><a class="" title="country news radio stations" aria-label="country news radio stations" role="button" href="javascript:void(0)" onclick="openLink( &quot;https://www.radio-browser.info/search?page=1&order=clickcount&reverse=true&hidebroken=true&tagList=news&countrycode=${ explore.country.toLowerCase() }&language=${explore.language_name.toLocaleLowerCase()}&quot; )"><span class="icon"><i class="fa-solid fa-radio fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-news-radio">radio</span></span></a></div>' +

            '<div><a class="" title="TV news" aria-label="TV news" role="button" href="javascript:void(0)" onclick="openLink( &quot;https://archive.org/search?identifier=tv&query=${ explore.country_name }&sort=-publicdate&and[]=mediatype%3A%22movies%22&and[]=mediatype%3A%22audio%22&and[]=language%3A%22${ explore.language_name }%22&and[]=year%3A[2020+TO+2030]&quot; )"><span class="icon"><i class="fa-solid fa-tv fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-news-tv">TV news</span></span></a></div>' + // note: TV by country-string AND language
    //
            '<div><a class="" title="Live TV news" aria-label="Live TV news" role="button" href="javascript:void(0)" onclick="openLink( &quot;https://iptv-org.github.io/?q=country:${ explore.country }&quot; )"><span class="icon"><i class="fa-solid fa-tv fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-live-tv">live TV</span></span></a></div>' +

            '<div><a class="" title="OECD stats" aria-label="OECD statistics" role="button" href="javascript:void(0)" onclick="openLink( &quot;https://data.oecd.org/\${encodeURIComponent( explore.country_name.toLowerCase() ) }.htm&quot; )"><span class="icon"><i class="fa-solid fa-globe fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-news-oecd">OECD</span></span></a></div>' +

            '<div><a class="" title="country economic indicators" aria-label="country economic indicators" role="button" href="javascript:void(0)" onclick="openLink( &quot;https://tradingeconomics.com/${ encodeURIComponent( explore.country_name.toLowerCase() )}/indicators&quot; )"><span class="icon"><i class="fa-solid fa-globe fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-news-economic-indicators">economic indicators</span></span></a></div>' +

            '<div><a class="" title="Gapminder world statistics" aria-label="world statistics" role="button" href="javascript:void(0)" onclick="openLink( &quot;https://www.gapminder.org/tools/#$model$markers$bubble$encoding$frame$value=1800;&trail$data$filter$markers$${ explore.country_iso3.toLowerCase() }=1800;;;;;;;;&chart-type=bubbles&url=v1&quot; )"><span class="icon"><i class="fa-solid fa-globe fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-world-statistics">world statistics</span></span></a></div>' +

            // by theme: conflicts
            `<div><a class="" title="Wikipedia: ongoing conflicts" aria-label="Wikipedia: ongoing conflicts" role="button" href="javascript:void(0)" onclick="openInFrame( &quot;/app/wikipedia/?t=&l=${explore.language}&qid=Q280998&dir=ltr&embedded=#&quot; )"><span class="icon"><i class="fa-solid fa-person-military-rifle fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-ongoing-conflicts">conflicts</span></span></a></div>` +

            '<div><a class="" title="conflict news" aria-label="conflict news" role="button" href="javascript:void(0)" onclick="openInFrame( &quot;https://liveuamap.com/' + explore.language + '&quot; )"><span class="icon"><i class="fa-solid fa-person-military-rifle fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-conflict-map">conflict map</span></span></a></div>' +

            // tocheck: https://acleddata.com/early-warning/dashboard/

            // by theme: tech
            '<div><a class="" title="tech news" aria-label="tech news" role="button" href="javascript:void(0)" onclick="openInFrame( &quot;https://remix.hnclone.win&quot; )"><span class="icon"><i class="fa-solid fa-microchip fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-technology">technology</span></span></a></div>' +

            // by theme: science
            //'<div><a class="" title="science news" aria-label="science news" role="button" href="javascript:void(0)" onclick="openInFrame( &quot;https://synthical.com/feed/simple&quot; )"><span class="icon"><i class="fa-solid fa-microchip fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-news-science">science</span></span></a></div>' +

          '</div>' +
        '</details>' +

    '</div>'
  );

  if ( explore.type === 'random'){
  
    return 0;

  }

  if (  explore.firstAction &&
        valid( explore.uri ) &&
        !valid( explore.query_param ) &&
        !valid( explore.commands_param )
      ){ // an URL was passed upon a new load, which is not a structured-query, nor editor-commands

    $( explore.baseframe ).attr({"src": explore.uri });

    explore.uri = ''; // reset URL param

    $('#blink').hide();
    $('#loader').hide();

    return 0;

  }

  resetIframe();

  if ( explore.isMobile ){

    $( explore.baseframe ).attr({"src": explore.base + '/pages/blank.html' });
    $('#loader').hide();

  }
  else { // desktop

    if ( listed( cover_topics, [ explore.covertopic ] ) ){ // show cover-topic

      renderTopicCover( explore.covertopic );

    }
    else { // show default cover

      setPopularCover();

    }

  }

  // TODO: could we avoid this here?
  if ( !valid( explore.datasource_set ) || explore.datasource_set === 'none' ){ // no datasource-set

      setParameter( 'd', explore.datasources.join(','), explore.hash );

  }
  else {

      setParameter( 'ds', explore.datasource_set, explore.hash );

  }

}

function gotoW3NewspapersLink(){

  let name = explore.country_name;

  if ( name === 'United States of America' ){ name = 'USA'; }
  else if ( name === 'United Kingdom' ){ name = 'UK'; }

  const url = 'https://www.w3newspapers.com/' + encodeURIComponent( name.toLowerCase() );

  openInFrame( url );

}

function gotoWorldNewspapersLink(){

  let name = explore.country_name;

  if ( name === 'United States of America' ){ name = 'USA'; }
  //else if ( name === 'United Kingdown' ){ name = 'UK'; }

  const url = 'https://www.world-newspapers.com/countries/' + encodeURIComponent( name.toLowerCase() );

  openInFrame( url );

}



async function renderTopicCover( name ){

  $('#blink').show();

  let url = '';

  if ( name === 'bookmarks' ){ // use bookmarks

    let topics = []; // list of topics

    const obj = $('#tree').tree('getTree');

    if ( valid( obj.children ) ){

      obj.children.forEach(( b, index ) => {

        exportAllBookmarkTopics( topics, b );

      });

    }
    
    // get random topic
    const topic = topics[ Math.floor(Math.random() * topics.length ) ];

    handleClick({ 
      id        : 'n1-0',
      type      : 'wikipedia-qid',
      title     : topic,
      language  : explore.language,
      qid       : '',
      url       : '',
      tag       : '',
      languages : '',
      custom    : '',
      target_pane : 'p1',
    });

    return 0; // done

  }
  else if ( name === 'featured-article' ){ // non-standard URL

    url = explore.base + '/app/explore2/assets/json/lists/featured-article/' + explore.language + '.json';

  }
  else if ( name === 'featured-portal' ){ // non-standard URL

    url = explore.base + '/app/explore2/assets/json/lists/featured-portal/' + explore.language + '.json';

  }
  else { // standard URL

    url = explore.base + '/app/explore2/assets/json/lists/' + name + '.json';

  }

  //console.log( name, url );

  fetch( url )
    .then(response => response.json())
    .then( list => {

      const nr  = Math.floor( Math.random() * list.length );
      let qid = 'Q' + list[ nr ];
      let other_id = '';

      if ( name === 'country-map' ){ // split QID|OSMID

        const fields = qid.split('|');
        qid = fields[0];
        other_id = fields[1];

      }

      // TODO: async-await
      let promiseB = fetchLabel([ qid ], explore.language ).then(function(result) {

        let label = '';

        if ( valid( result.entities ) ){

          if ( result.entities[ qid ]?.labels[ explore.language ] ){

            label = result.entities[ qid ].labels[ explore.language ].value;

            // content pane info
            if ( name === 'country-map' ){ // split QID|OSMID

              handleClick({ 
                id        : 'n1-0',
                type      : 'link',
                title     : label,
                language  : explore.language,
                qid       : '' + qid,
                url       : `${explore.base}/app/map/?l=${explore.language}&bbox=&osm_id=${other_id}&qid=${qid}&title=${label}`,
                tag       : '',
                languages : '',
                custom    : '',
                target_pane : 'p1',
              });

            }
            else {

              let cover_name = label || '';
              cover_name = cover_name.replace(/_/g, ' ');

              let cover_file = '';
              let cover_type = '';
              let cover_css_extra = '';

              let fontlink_html = '<link id="fontlink" />';

              //if ( explore.font1 !== 'IBM Plex Sans Condensed' ){ // only add font-link for alternative fonts

                //fontlink_html = '<link id="fontlink" href="https://fonts.googleapis.com/css?family=' + explore.font1 + ':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">';

              //}

              // API format: https://en.wikipedia.org/w/api.php?action=query&titles=Flamenco&prop=pageimages&format=json&pithumbsize=600

              let thumbsize = explore.isMobile ? '600' : '1200';

              let url_api_image = `https://${explore.language}.${datasources.wikipedia.endpoint}?action=query&titles=${ encodeURIComponent( cover_name ) }&prop=pageimages&format=json&pithumbsize=${ thumbsize }&pilimit=1`;
              //let url_api_image = 'https://' + explore.language + '.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent( cover_name ) + '&prop=pageimages&format=json&pithumbsize=600&pilimit=1';

              let covers = [ 'abstract_004.jpg', 'abstract_005.jpg' ];

              const abstract_cover = covers[ Math.floor( Math.random() * covers.length) ];

              let noCoverFound = false;

              $.ajax({

                url: url_api_image,

                dataType: "jsonp",

                success: function( img_data ) {

                  if ( typeof img_data.query.pages[ Object.keys( img_data.query.pages)[0] ] === undefined ){ // no cover image found

                    //cover_file = explore.base + '/app/explore2/assets/images/wallpapers/' + abstract_cover;

                    noCoverFound = true;

                  }
                  else {

                    if (  typeof img_data.query.pages[ Object.keys( img_data.query.pages)[0] ].thumbnail === undefined ||
                          typeof img_data.query.pages[ Object.keys( img_data.query.pages)[0] ].thumbnail === 'undefined' ){ // no cover image found

                      //cover_file = explore.base + '/app/explore2/assets/images/wallpapers/' + abstract_cover;

                      noCoverFound = true;
                      
                    }
                    else {

                      // TODO?: get higher-resolution image
                      cover_file = img_data.query.pages[ Object.keys( img_data.query.pages)[0] ].thumbnail.source || '';
                      cover_css_extra = 'background-size: contain !important;';

                    }

                  }

                  $( explore.baseframe ).attr({ "srcdoc": 
                    '<!DOCTYPE html> <html lang=' + explore.language + '> <head>' +
                    '<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=1, minimum-scale=1.0, maximum-scale=5.0">' +
                    '<link rel="stylesheet" href="' + explore.base + '/app/explore2/node_modules/animate.css/animate.min.css">' +
                    '<link rel="stylesheet" href="' + explore.base + '/assets/fonts/fontawesome/css/all.min.css?v6.01" type="text/css">' +
                    '<link rel="stylesheet" href="' + explore.base + '/app/explore2/dist/css/conzept/common.css">'+
                    '<link rel="stylesheet" href="' + explore.base + '/app/explore2/dist/css/conzept/cover.css?0.10">' +
                    fontlink_html +

                    '</head>' +
                    '<body style="' + cover_css_extra + ' font-size: ' + explore.fontsize + 'px">' + 
                    '<canvas id="canvas"></canvas>' +
                    //'</head><body style="' + cover_css_extra + ' font-family: ' + explore.default_font + '; font-size: ' + explore.fontsize + 'px">' + 

                    '<div class="bgimg-1"><div class="caption btn animated fadeIn delay-1s"><span class="border"><a id="topiclink" href="javascript:void(0)" onauxclick="openInNewTab( &quot;' + '/explore/' + encodeURIComponent( cover_name ) + '?t=string&l=' + explore.language + '&quot;)">' + cover_name.trim() + '</a></span></div> </div> <span id="copyright-notice"><a id="image-source" title="source" aria-label="source" role="button" target="_blank" href="https://en.wikipedia.org"><span class="icon"><i class="fa-regular fa-copyright fa-2x"></i></span></a></span>' + 

                    '<img id="color-test-image" src="" style="display:none;"></img>' +
                    '<a href="javascript:void(0)" id="fullscreenToggle" onclick="document.toggleFullscreen()" class="global-actions" style="display:none;"><i id="fullscreenIcon" title="fullscreen toggle" class="fa-solid fa-expand"></i></a>' +

                    '<script>let noCoverFound = ' + noCoverFound + '; let language = "en"; let hash = ""; let title = "' + cover_name.trim() + '"; const file = "' + cover_file + '"; let type = "' + cover_type  + '"; const fontsize = ' + explore.fontsize + '</script>' +
                    '<script src="' + explore.base + '/app/explore2/node_modules/jquery/dist/jquery.min.js"></script>' +
                    '<script src="' + explore.base + '/app/explore2/node_modules/keyboardjs/dist/keyboard.min.js"></script>' +
                    '<script src="' + explore.base + '/app/explore2/node_modules/sunzi-color-thief/dist/color-thief.umd.js"></script>' +
                    '<script src="' + explore.base + '/app/explore2/dist/core/utils.js?' + explore.version + '"></script>' +
                    '<script src="' + explore.base + '/app/explore2/dist/core/cover.js?' + explore.version + '"></script>' +

                    '</body></html>'

                  });

                },

              });

            }

          }
          else {

            console.log('todo: handle topic cover without a matching language')

            handleClick({ 
              id        : 'n1-0',
              type      : 'wikipedia-qid',
              title     : '',
              language  : explore.language,
              qid       : '' + qid,
              url       : '',
              tag       : '',
              languages : '',
              custom    : '',
              target_pane : 'p1',
            });

          }

        }
        else {

          $.toast({
              heading: 'no results found',
              text: '',
              hideAfter : 2000,
              stack : 1,
              showHideTransition: 'slide',
              icon: 'info'
          })

        }

    });

  });

}

async function setPopularCover() {

  if ( ! valid( explore.language ) ){

    return 0;

  }

  let date          = new Date();
  //let year        = '2022'; // TEMP HACK
  let year          = date.getFullYear();
  let day_of_month  = date.getDate();

  let month         = ''; 

  if ( day_of_month <= 2 ){ // ALSO use the previous month during the first two days of the month (so there is time for the stats data to update first)

    month = (date.getMonth() - 1 <= 9 ? '0': '') + ( date.getMonth() - 1 );

    if ( month === '0-1' ){ // special case: January (00) -> December (11)
      month = '11';
    }

  }
  else {

    month = (date.getMonth() <= 9 ? '0': '') + date.getMonth(); // get previous month (and pad with a zero if needed)

  }

  //month = '11'; // TEMP HACK

  // FIXME looks like something sets the language to 'eng' at times, research what is causing this.
  if ( explore.language === 'eng' ){
    explore.language = 'en'; // or use: getLangCode2( lang3 )
  }

  let url = explore.base + '/app/explore2/assets/json/covers/' + explore.language + '-' + year + '-' + month + '.json?' + explore.version;

  $.ajax({

    url: url,

    success: function( data ) {

      let articles = data.items[0].articles;

      const nr = getRandomInt( articles.length );

      let cover_name = articles[ nr ].article || '';
      cover_name = cover_name.replace(/_/g, ' ');

      let cover_file = '';
      let cover_type = '';
      let cover_css_extra = '';

      let fontlink_html = '<link id="fontlink" />';

      if ( explore.font1 !== 'Hind' ){ // only add font-link for alternative fonts

        fontlink_html = '<link id="fontlink" href="https://fonts.googleapis.com/css?family=' + explore.font1 + ':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">';

      }

      let thumbsize = explore.isMobile ? '600' : '1200';

      // https://en.wikipedia.org/w/api.php?action=query&titles=Flamenco&prop=pageimages&format=json&pithumbsize=600
      let url_api_image = `https://${ explore.language }.wikipedia.org/w/api.php?action=query&titles=${ encodeURIComponent( cover_name ) }&prop=pageimages&format=json&pithumbsize=${ thumbsize }&pilimit=1`;

      let covers = [ 'abstract_004.jpg', 'abstract_005.jpg' ];
      const abstract_cover = covers[ Math.floor( Math.random() * covers.length) ];
  
      let noCoverFound = false;

      $.ajax({

        url: url_api_image,
        dataType: "jsonp",

        success: function( img_data ) {

          if ( typeof img_data.query.pages[ Object.keys( img_data.query.pages)[0] ] === undefined ){ // no cover image found

            cover_file = explore.base + '/app/explore2/assets/images/wallpapers/' + abstract_cover;

            noCoverFound = true;
              

          }
          else {

            if (  typeof img_data.query.pages[ Object.keys( img_data.query.pages)[0] ].thumbnail === undefined ||
                  typeof img_data.query.pages[ Object.keys( img_data.query.pages)[0] ].thumbnail === 'undefined' ){ // no cover image found

              cover_file = explore.base + '/app/explore2/assets/images/wallpapers/' + abstract_cover;
              noCoverFound = true;
              
            }
            else {

              // TODO?: get higher-resolution image
              cover_file = img_data.query.pages[ Object.keys( img_data.query.pages)[0] ].thumbnail.source || '';
              cover_css_extra = 'background-size: contain !important;';

            }

          }

          $( explore.baseframe ).attr({ "srcdoc": 
            '<!DOCTYPE html> <html lang=' + explore.language + '> <head>' +
            '<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=1, minimum-scale=1.0, maximum-scale=5.0">' +
            '<link rel="stylesheet" href="' + explore.base + '/app/explore2/node_modules/animate.css/animate.min.css">' +
            '<link rel="stylesheet" href="' + explore.base + '/assets/fonts/fontawesome/css/all.min.css?v6.01" type="text/css">' +
            '<link rel="stylesheet" href="' + explore.base + '/app/explore2/dist/css/conzept/common.css">'+
            '<link rel="stylesheet" href="' + explore.base + '/app/explore2/dist/css/conzept/cover.css?0.10">' +
            fontlink_html +

            '</head><body style="' + cover_css_extra + ' font-family: ' + explore.default_font + '; font-size: ' + explore.fontsize + 'px">' + 
            '<canvas id="canvas"></canvas>' +

            '<div class="bgimg-1"><div class="caption btn animated fadeIn delay-1s"><span class="border"><a id="topiclink" href="javascript:void(0)" onauxclick="openInNewTab( &quot;' + '/explore/' + encodeURIComponent( cover_name ) + '?t=string&l=' + explore.language + '&quot;)">' + cover_name.trim() + '</a></span></div> </div> <span id="copyright-notice"><a id="image-source" title="source" aria-label="source" role="button" target="_blank" href="https://en.wikipedia.org"><span class="icon"><i class="fa-regular fa-copyright fa-2x"></i></span></a></span>' + 

            '<img id="color-test-image" src="" style="display:none;"></img>' +
						'<a href="javascript:void(0)" id="fullscreenToggle" onclick="document.toggleFullscreen()" class="global-actions" style="display:none;"><i id="fullscreenIcon" title="fullscreen toggle" class="fa-solid fa-expand"></i></a>' +

            '<script>let noCoverFound = ' + noCoverFound + '; let language = "en"; let hash = ""; let title = "' + cover_name.trim() + '"; const file = "' + cover_file + '"; let type = "' + cover_type  + '"; const fontsize = ' + explore.fontsize + '</script>' +
            '<script src="' + explore.base + '/app/explore2/node_modules/jquery/dist/jquery.min.js"></script>' +
            '<script src="' + explore.base + '/app/explore2/node_modules/keyboardjs/dist/keyboard.min.js"></script>' +
            '<script src="' + explore.base + '/app/explore2/node_modules/sunzi-color-thief/dist/color-thief.umd.js"></script>' +
            '<script src="' + explore.base + '/app/explore2/dist/core/utils.js?' + explore.version + '"></script>' +
            '<script src="' + explore.base + '/app/explore2/dist/core/cover.js?' + explore.version + '"></script>' +

            '</body></html>'

          });

        },

      });

    },

    error: function( errorMessage ) {
      console.log('popular cover data JSON fetch error for language: ', explore.language );
    },

    //timeout: 3000,

  });

}

// display the hidden elements meant for results.
async function setDisplayForResults() {
	$( '#results-paging' ).css( "display", "inline-block" );
	$( '#results-label' ).css( "display", "inline-block" );
}

// prepares data for query to get random pages and triggers request.
function getRandomPages() {

	const data = {
		action: "query",
		generator: "random",
		format: "json",
		grnlimit: 5,
		grnnamespace: 0,
		prop: "extracts",
		exlimit: 5,
		exchars: 500,
		exintro: true
	};

	getData( 'https://' + explore.language + '.wikipedia.org/w/api.php?callback=?', data, displayRandomPages );

}

function displayRandomPages ( response ) {

	$.each( response.query.pages, function( i, item ){

    if ( item.title !== '' ){

      // prevent infinite-loop-case from happening when the 'explore'-view is triggered by replaceState()
      if ( explore.replaceState ){

        explore.q = item.title;

        $('#srsearch').val( decodeURI( explore.q ) );

        $('.submitSearch').click();

      }

      return false; // break after the first item, we have a random title
    }

	});

}

// send JSON request to get data from an API-URL
function getData( url, data, callback ) {

	$.getJSON( url, data, callback )

		.fail(function( error ){

				console.log( 'error reaching wikipedia API: ', error.responseText);

				$.toast({
						heading: 'Search error',
						text: 'The Wikipedia search API is not working correctly for the <b>' + explore.language + '</b> language.',
						hideAfter : 5000,
						stack : 1,
						showHideTransition: 'slide',
						icon: 'error'
				})

		});

}

function addRawTopicCard( title ){

  const args = { 
    id            : 'n00',
    language      : explore.language,
    qid           : '',
    pid           : '',
    thumbnail     : '',
    title         : title,
    snippet       : '',
    extra_classes : 'raw-entry',
    item          : '',
    source        : 'raw',
  }

  // set non-wikidata fields
  let item_raw    = { qid : '' };
  setWikidata( item_raw, [ ], true, 'p1' );
  item_raw.title  = title;
  item_raw.tags[0]= 'raw-query-string';

  args.item = item_raw;

  const raw_entry = createItemHtml( args );

  if ( explore.page === 1 && explore.searchmode === 'string' ){
    $('#results').append( raw_entry );
  }

}

async function insertMultiValues( args ){

	let obj = {};

  if ( typeof args === 'string' ){ // args is a string

    if ( args.startsWith('%7B%') ){ // args is an encoded string

      // decode the args-string
      args  = JSON.parse( decodeURIComponent( args ) );

	    let sel = 'details#mv-' + args.target + '[data-title=' + args.title + '] p ul';

      if ( $( sel ).length > 0 ){ // check if the mv-element is already filled

        return 0; // do nothing, mv-content already fetched

      }
      else {

        //console.log( args, 'list: ', args.list );

        if ( typeof args.list === 'string' ){

          // TODO: find a way to add these function calls to the fields-JSON and call them dynamically

					if ( args.list.startsWith('https://iptv-org') ){

          	args.list = args.list.toLowerCase(); // lowercase the iso2-code in this url
						fetchIPTV( args, args.list );

					}
					else if ( args.list.startsWith('https://nl1') ){

          	args.list = args.list.toLowerCase(); // lowercase the iso2-code in this url
						fetchRadio( args, args.list );

					}
					else if ( args.list.startsWith('osm:') ){

						insertSelectMenuOSM( args, args.list );

          }
					else if ( args.list.startsWith('stocks:') ){

            let f = args.list.split(':') || [];

            if ( f[2] === 'true' ){

              fetchStocks( args, args.list );

            }
    
          }
					else if ( args.list.startsWith('openlibrary-ebooks-meta:') ){

            fetchEbooksMeta( args, null, 1, 'relevance', '' );

          }
					else if ( args.list.startsWith('openlibrary-ebooks-author:') ){

            fetchEbooksMeta( args, null, 1, 'relevance', 'author' );

          }
					else if ( args.list.startsWith('openlibrary-ebooks-inside:') ){

            fetchEbooksInside( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('archive-audio:') ){

            fetchArchiveAudio( args, null, 1, 'month+desc' );

          }
					else if ( args.list.startsWith('crossref:') ){

            fetchCrossRef( args, null, 1, 'relevance', '*' );

          }
					else if ( args.list.startsWith('wikisource:') ){

            fetchWikiSource( args, args.list );

          }
					else if ( args.list.startsWith('wikiquote:') ){

            fetchWikiQuote( args, args.list );

          }
					else if ( args.list.startsWith('wikinews:') ){

            fetchWikiNews( args, args.list );

          }
					else if ( args.list.startsWith('hackernews:') ){

            fetchHackerNews( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('archive-scholar:') ){

            fetchArchiveScholar( args, null, 1, 'relevancy' );

          }
					else if ( args.list.startsWith('unpaywall') ){

            fetchUnpaywall( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('elixir') ){

            fetchElixir( args, null, 1, 'rel' );

          }
					else if ( args.list.startsWith('ms-academic') ){

            fetchMSAcademic( args, null, 1, 'DESC(%3FpaperPubDate)' );

          }
					else if ( args.list.startsWith('bhl:') ){

            fetchBHL( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('mastodon') ){

            fetchMastodon( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('pexels') ){

            fetchPexels( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('europeana') ){

            fetchEuropeana( args, null, 1, 'score' );

          }
					else if ( args.list.startsWith('rijksmuseum') ){

            fetchRijksmuseum( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('searchculture-greece') ){

            fetchSearchCultureGreece( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('loc-images') ){

            fetchLoCImages( args, null, 1, 'date_desc' );

          }
					else if ( args.list.startsWith('depicts') ){

            fetchDepicts( args, null, 1, '%3Fdate' );

          }
					else if ( args.list.startsWith('wikicommons') ){

            fetchWikicommons( args, null, 1, 'DESC(%3Fdate)' );

          }
					else if ( args.list.startsWith('met') ){

            fetchMET( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('cleveland') ){

            fetchCleveland( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('smithsonian:') ){

            fetchSmithsonian( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('us-archives:') ){

            fetchUSArchive( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('paintings:') ){

            fetchPaintings( args, null, 1, 'DESC(%3Fdate)' );

          }
					else if ( args.list.startsWith('wikidata-inlinks:') ){

            fetchWikidataInlinks( args, args.list );

          }
					else if ( args.list.startsWith('inlinks:') ){

            fetchInlinks( args, args.list );

          }
					else if ( args.list.startsWith('outlinks:') ){

            fetchOutlinks( args, args.list );

          }
					else if ( args.list.startsWith('arxiv:') ){

            fetchArxiv( args, null, 1, 'descending' );

          }
					else if ( args.list.startsWith('gdelt-news:') ){

            fetchGN( args, args.list );
    
          }
					else if ( args.list.startsWith('gdelt-tv-news:') ){

            fetchGTV( args, args.list );
    
          }
					else if ( args.list.startsWith('currentsapi:') ){

            let f = args.list.split(':') || [];

            if ( f[2] === 'true' ){

              fetchCurrentsAPI( args, args.list );

            }
    
          }
					else if ( args.list.startsWith('searchcode') ){

            fetchSearchCode( args, args.list );
    
          }
					else if ( args.list.startsWith('ebird-quiz-search') ){

            fetchEbirdHotspots( args, null  );

          }
					else if ( args.list.startsWith('plos') ){

            fetchPLOS( args, null, 1, 'relevance' );
    
          }
					else if ( args.list.startsWith('xeno-canto') ){

            fetchXenoCanto( args, null, 1, 'relevance' );
    
          }
					else if ( args.list.startsWith('semantic-scholar-author') ){

            fetchSemanticScholarAuthorPapers( args, args.list );
    
          }
					else if ( args.list.startsWith('semantic-scholar-query') ){

            fetchSemanticScholarQuery( args, null, 1, 'relevance' );
    
          }
					else if ( args.list.startsWith('dates:') ){ // not a sparql-query, fix this workflow later!

						insertSelectMenuDates( args, args.list );

          }

					else if ( args.list.startsWith('category_tree:') ){ // not a sparql-query, fix this workflow later!

						insertCategoryTree( args );

          }
					else if ( args.list.startsWith('iframe-url:') ){ // map-sparql HTML

            showInlineIframe( args, false );

          }
					else { // wikipedia-qid-sparql URL

            fetchSparql( args, null, 1, '%3Fdate' );

					}

        }
        else { // render a topic-list of Qid's 

          //console.log('qid topics');

          // TODO: if there are more than 50 labels, split the resolving up into batches.
          insertQidTopics( args, args.list );

        }

        // set URL-fragment
        let args_ = unpackString( args ); 

        //if ( valid( args.list ) ){

          // FIXME: args.list not matching up
          //console.log( 'fragment to match for: ', args.list );
          //console.log( 'fragment to match: ', args.list.split(':')[0] );
          //explore.fragment = args.list.split(':')[0];
          //updatePushState( args.topic, 'add' );
          //explore.fragment = '';

        //}

      }

    }

  }

}

async function insertCategoryTree( args ){

  // check if detail-element was already opened
  let check = 'details#mv-' + args.target + '[data-title="' + args.title + '"] p div';

  if ( $( check ).length > 0 ){ // element was already opened

    return 0;

  }

  let f         = args.list.split(':') || [];
  let cat_title = '';
  let sel       = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';

  if ( isCategory( args.topic ) ){ // check for "Category:FooBar" string first

    cat_title = args.topic;

  }
  else if ( valid( f[1] ) ){ // use Qid to resolve to the Category title

    let qid = f[1];

    const labels = await fetchLabel( [ qid ], explore.language );

    // see: https://stackoverflow.com/questions/58780817/using-optional-chaining-operator-for-object-property-access#58780897
    // example?.a?.[1]?.b
    if ( valid( labels.entities[ qid ].labels[explore.language] ) ){

      if ( labels.entities[ qid ].labels[explore.language].value ){ // FIXME

        cat_title = labels.entities[ qid ].labels[explore.language].value;

      }

    }
    else { // no matching category-language

      // TODO: it would be better to never show the cattree-button if there is no matching language. so use fetchLabel on each category-article?
      console.log('no matching category-language');

      // remove the fetch-more loading indicator
      $( sel + ' .mv-loader.' + args.id ).remove();

      return 0;

    }

  }

  if ( cat_title.length > 0 ){

    let html =
      '<div>' + 
        '<h6 class="category main">' +
          '<a class="main" href="#' + cat_title + '">' + removeCategoryFromTitle( cat_title ) + '</a>' +
        '</h6>' +
      '</div>';

    $( sel ).html( html );

    // trigger the opening of the first category
    $( sel + ' a.main ' ).click();

  }

}

async function openInline( title, fragment_id, fragment_title ){

  //explore.hash = ''; // reset hash

  //console.log( 'openInline: ', title, fragment_id, fragment_title );

  //if ( valid( title) && valid( fragment_title ) ){

    explore.fragment = fragment_title;
    updatePushState( title , 'add' );
    explore.fragment = '';

    const sel = 'details#' + fragment_id + '[data-title=' + fragment_title + ']';

    if ( $( sel ).length ){ // element exists

      //console.log( sel );

      $( sel ).first().parents('details').attr( 'open', '' );
      $( sel ).first().click().attr('open', '');

      const container = $('#tab-topics .overflow-container');
      const position	= $( sel ).first().offset().top - container.offset().top + container.scrollTop() - 20;
      container.animate({ scrollTop: position });

      $( sel + ' a:first' ).focus();

    }

  //}

}

function showInlineIframe( args ){

  args = unpackString( args );

  let limit = 1000;

  let f = args.list.split(':') || [];

  if ( valid( f[1] ) ){

    if ( f[1] === 'similar' ){

      showInlineSimilar( args );

    }
    else { // by URL

      const url = 'https://' + f[1];

      const min_height = explore.isMobile ? '300px' : '500px';

      const html = '<ul class="multi-value"><li class="resizer"><iframe class="inline-iframe resized" style="min-height: ' + min_height + '; border:none;" src="' + url + '" width="100%" height="100%" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock title="embedded widget: URL-content" role="application"></iframe></li></ul>'; 

      const sel = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';

      $( sel ).html( html );

    }

  }

}


function getSimilarSparqlURL( item ){

  let url   = '';
  let limit = 1000;

  // TODO:
  //  - choose table-view if non-geo-item-class, example: "Breaking Bad"

  let country_condition           = '';

  if ( valid( item.country ) ){ country_condition = '%0A%20%20%3Fitem%20wdt%3AP17%20wd%3A' + item.country[0] + '%20.'; }
  else if ( valid( item.country_of_citizenship ) ){ country_condition = '%0A%20%20%3Fitem%20wdt%3AP27%20wd%3A' + item.country_of_citizenship[0] + '%20.'; }
  else if ( valid( item.country_of_origin ) ){ country_condition = '%0A%20%20%3Fitem%20wdt%3AP495%20wd%3A' + item.country_of_origin + '%20.'; }
  else if ( valid( item.country_of_registry ) ){ country_condition = '%0A%20%20%3Fitem%20wdt%3AP8047%20wd%3A' + item.country_of_registry + '%20.'; }

  // instance/subclass specific-conditions
  let industry_condition = '';
  let part_of_condition = '';
  let has_parts_condition = '';
  let studied_by_condition = '';
  let studies_condition = '';
  let genre_condition = '';
  let art_movement_condition = '';
  let admin_condition = '';
  let creator_condition = '';
  let category_condition = '';
  let performer_condition = '';
  let composer_condition = '';
  let author_condition = '';
  let published_in_condition = '';
  let main_subject_condition = '';

  //if ( ! checkTag( item, 0, 'location' ) ){ // exclude from using special-conditions

    if ( valid( item.industry ) ){ industry_condition = '%0A%20%20%3Fitem%20wdt%3AP452%20wd%3A' + item.industry[0] + '%20.'; }
    else if ( valid( item.genre ) ){ genre_condition = '%0A%20%20%3Fitem%20wdt%3AP136%20wd%3A' + item.genre[0] + '%20.'; }
    else if ( valid( item.art_movement ) ){ art_movement_condition = '%0A%20%20%3Fitem%20wdt%3AP135%20wd%3A' + item.art_movement[0] + '%20.'; }
    else if ( valid( item.studied_by ) ){ studied_by_condition = '%0A%20%20%3Fitem%20wdt%3AP2579%20wd%3A' + item.studied_by[0] + '%20.'; }
    else if ( valid( item.studies ) ){ studies_condition = '%0A%20%20%3Fitem%20wdt%3AP2578%20wd%3A' + item.studies[0] + '%20.'; }
    else if ( valid( item.creator ) ){ creator_condition = '%0A%20%20%3Fitem%20wdt%3AP170%20wd%3A' + item.creator[0] + '%20.'; }
    else if ( valid( item.composer ) ){ composer_condition = '%0A%20%20%3Fitem%20wdt%3AP86%20wd%3A' + item.composer[0] + '%20.'; }
    else if ( valid( item.performer ) ){ performer_condition = '%0A%20%20%3Fitem%20wdt%3AP175%20wd%3A' + item.performer[0] + '%20.'; }
    else if ( valid( item.main_subject ) ){ main_subject_condition = '%0A%20%20%3Fitem%20wdt%3AP921%20wd%3A' + item.main_subject[0] + '%20.'; }
    //else if ( valid( item.published_in ) ){ published_in_condition = '%0A%20%20%3Fitem%20wdt%3AP1433%20wd%3A' + item.published_in[0] + '%20.'; }
    //else if ( valid( item.author ) ){ author_condition = '%0A%20%20%3Fitem%20wdt%3AP50%20wd%3A' + item.author[0] + '%20.'; }
    //else if ( valid( item.category ) ){ category_condition = '%0A%20%20%3Fitem%20wdt%3AP910%20wd%3A' + item.category + '%20.'; }
    //else if ( valid( item.admin_entity ) ){ admin_condition = '%0A%20%20%3Fitem%20wdt%3AP131%20wd%3A' + item.admin_entity[0] + '%20.'; } // should only be used for larger areas?
    //else if ( valid( item.part_of ) ){ part_of_condition = '%0A%20%20%3Fitem%20wdt%3AP361%20wd%3A' + item.part_of[0] + '%20.'; }
    //else if ( valid( item.has_parts ) ){ has_parts_condition = '%0A%20%20%3Fitem%20wdt%3AP527%20wd%3A' + item.has_parts[0] + '%20.'; }

  //}

  //if ( checkTag( item, 1, 'music' ) ){ }

  // build query URL

  if ( checkTag( item, 0, 'person' ) ){

    let occupation_condition = '';
    let noble_title_condition = '';

    if ( valid( item.occupations ) ){ occupation_condition = '%0A%20%20%3Fitem%20wdt%3AP106%20wd%3AQ' + item.occupations[0] + '%20.'; }
    //if ( valid( item.noble_title ) ){ noble_title_condition = '%0A%20%20%3Fitem%20wdt%3AP97%20wd%3A' + item.noble_title[0] + '%20.'; }

    url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fdeath%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20' + occupation_condition + country_condition + noble_title_condition + /*genre_condition + art_movement_condition +*/ '%0A%20%20%3Fitem%20wdt%3AP19%20%3Fplace%20.%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirth%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP570%20%3Fdeath%20.%7D%20%20%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fplace%20wdt%3AP625%20%3Fcoord%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0A%20LIMIT%20' + limit + '%0A%23meta%3Asimilar%20topics%0A%23defaultView%3AMap%0A';

  }
  /*
  else if ( valid( item.instance_qid ) && valid( item.subclass_qid ) ){ 

    url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP279%20wd%3AQ' + item.subclass_qid + '%20.' + '%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ' + item.instance_qid + '%20.' + country_condition + studied_by_condition + studies_condition + '%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirth%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0A%20LIMIT%20' + limit + '%0A%20%23meta%3Asimilar%20topics%20%23defaultView%3AMap%0A';

  }
  */
  else if ( valid( item.subclass_qid ) ){

    url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP279%20wd%3AQ' + item.subclass_qid + '%20.' + country_condition + '%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirth%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0A%20LIMIT%20' + limit + '%0A%20%23meta%3Asimilar%20topics%20%23defaultView%3AMap%0A';

  }
  else if ( valid( item.instance_qid ) ){

    url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ' + item.instance_qid + '%20.' + country_condition + industry_condition + part_of_condition + has_parts_condition + studied_by_condition + studies_condition + genre_condition + art_movement_condition + admin_condition + creator_condition + category_condition + performer_condition + composer_condition + author_condition + published_in_condition + main_subject_condition + '%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirth%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0A%20LIMIT%20' + limit + '%0A%20%23meta%3Asimilar%20topics%20%23defaultView%3AMap%0A';

  }

  //console.log( url );

  return url;

}

async function showInlineSimilar( args ){

  let limit = 1000;

  let f     = args.list.split(':') || [];

  // TODO:
  //  - constrain by country-qid if available
  //  - constrain by industry for companies
  //  - choose table-view if non-geo-item-class, example: "Breaking Bad"

  let url = '';
  let country_qid_condition = '';

  //console.log( f );

  if ( valid( f[4] ) ){ // country qid

    country_qid_condition = '%0A%20%20%3Fitem%20wdt%3AP17%20wd%3A' + f[4] + '%20.';

  }
  else if ( valid( f[5] ) ){ // country_of_citizenship qid

    country_qid_condition = '%0A%20%20%3Fitem%20wdt%3AP27%20wd%3A' + f[5] + '%20.';

  }

  // TODO: remove this hack, when the tag works again
  if ( valid( f[3] ) ){ // instance qid

    if ( f[3] === '5' ){ // person

      args.tag = 'person';
    }

  }

  if ( args.tag === 'person' ){ // person

    if ( valid( f[6] ) ){ // with an occupation

      const qid = f[6];

      url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP106%20wd%3AQ' + qid +  '%20.' + country_qid_condition + '%0A%20%20%20%20%3Fitem%20wdt%3AP19%20%3Fplace%20.%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirth%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fplace%20wdt%3AP625%20%3Fcoord%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0A%20LIMIT%20' + limit + '%0A%23meta%3Asimilar%20topics%0A%23defaultView%3AMap%0A';

    }

  }
  else if ( valid( f[2] ) ){ // by subclass-qid

    const qid = f[2];

    url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP279%20wd%3AQ' + qid + '%20.' + country_qid_condition + '%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirth%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0A%20LIMIT%20' + limit + '%0A%20%23meta%3Asimilar%20topics%20%23defaultView%3AMap%0A';


  }
  else if ( valid( f[3] ) ){ // by instance-qid

    const qid = f[3];

    url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ' + qid + '%20.' + country_qid_condition + '%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirth%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0ALIMIT%20' + limit + '%0A%20%23meta%3Asimilar%20topics%20%23defaultView%3AMap%0A';


  }

  const min_height = explore.isMobile ? '300px' : '500px';

  const html = '<ul class="multi-value"><li class="resizer"><iframe class="inline-iframe resized" style="min-height: ' + min_height + '; border:none;" src="' + url + '" width="100%" height="100%" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock title="embedded widget: similar topics" role="application"></iframe></li></ul>'; 

  const sel = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';

  $( sel ).html( html );

}

async function insertSelectMenuDates( args, fields ){

  let html = '<ul class="multi-value"><li><select class="mv-select" name="' + args.target + '">' + explore.date_tag_options + '</select></li></ul> <ul style="display:none;" class="multi-value mv-select-card" name="' + args.target + '"><li></li></ul>'; 

  let sel = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';

  $( sel ).html( html );

  const s2 = 'select[name ="' + args.target + '"]';

  // see: https://select2.org/configuration/options-api
  $( s2 ).select2({

    dropdownPosition: 'below', // see library-extension here: https://jsfiddle.net/byxj73ov/ and https://jsfiddle.net/byxj73ov/ 
    width: '95%',
    //escapeMarku: function (markup) { return markup; },

  });

  $( s2 ).on('select2:select', function(e) {

    let data      = e.params.data;
    let tag       = data.id;
    tag           = encodeURIComponent( tag );

    let new_title = args.topic + ' ' + tag;
    let new_title_quoted = '%22' + args.topic + '%22%20' + tag;

    // create topic html
		let title_link = '<a href="javascript:void(0)" class="mv-extra-topic" title="' + new_title + '" aria-label="' + new_title + '" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: explore.base + `/app/video/?l=${explore.language}#/search/` + new_title_quoted, title: new_title, qid: '', language  : explore.language } ) ) + '> ' + decodeURIComponent( new_title ) + '</a><br>';

    let topic_html = 
      '<ul class="multi-value mv-select-card" name="' + args.target + '"><li>' +
        title_link +
        '<span class="mv-extra-buttons">' +
          '<a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'explore', title: encodeURIComponent( new_title ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
          '<a href="javascript:void(0)" class="mv-extra-icon" title="video" aria-label="video" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: explore.base + `/app/video/?l=${explore.language}#/search/` + new_title_quoted, title: new_title, qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-video" style="position:relative;"></i></span></a>' +
          '<a href="javascript:void(0)" class="mv-extra-icon" title="streaming video" aria-label="streaming video" role="button"' + setOnClick( Object.assign({}, args, { type: 'wander', title: encodeURIComponent( new_title ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-brands fa-youtube" style="position:relative;"></i></span></a>' +
          '<a href="javascript:void(0)" class="mv-extra-icon" title="images" aria-label="images" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', title: encodeURIComponent( new_title ), url: encodeURI( `https://www.bing.com/search?q=${new_title}&search=Submit+Query&form=QBLH&setlang=${explore.language}` ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-regular fa-images" style="position:relative;"></i></span></a>' +
          '<a href="javascript:void(0)" class="mv-extra-icon" title="books" aria-label="books" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', title: encodeURIComponent( new_title ), url: encodeURI( 'https://openlibrary.org/search?q=' + new_title_quoted + '&mode=everything&language=' + explore.lang3 ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-brands fa-mizuni" style="position:relative;"></i></span></a>' +
          '<a href="javascript:void(0)" class="mv-extra-icon" title="Bing web search" aria-label="Bing web search" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: 'https://www.bing.com/search?q=' + new_title_quoted + '&setlang=' + explore.language + '-' + explore.language, title: new_title, qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-brands fa-searchengin" style="position:relative;"></i></span></a>' +
        '</span>' +
      '</li></ul>';

    // remove any possible previous card
    let sel_card = 'details#mv-' + args.target + ' .mv-select-card';
    $( sel_card ).replaceWith( topic_html );

  });

}

function insertQidTopics( args, list ){

	let obj = {};
	let qlist = '';

	$.each( list, function (j, item ) {

    if (  j < 49 ){

		  qlist += item + '|';

    }
    else {
      // skip label, as we are over the query-limit
    }

	});

	qlist = qlist.slice(0, -1);

	// note API limit of 50!
	let lurl = datasources.wikidata.instance_api + '?action=wbgetentities&ids=' + qlist + '&format=json&languages=' + explore.language + '|en&props=labels';

	$.ajax({

			url:      lurl,
			jsonp:    "callback",
			dataType: "jsonp",

			success: function( response ) {

				if ( typeof response.entities === undefined || typeof response.entities === 'undefined' ){

					return 1;
				}

				Object.entries( response.entities ).forEach(([ k , v ]) => {

          let label = '';
          let qid   = v.id;

          if ( typeof v.labels[explore.language] === undefined || typeof v.labels[explore.language] === 'undefined' ){ // no label-language match

            if ( typeof v.labels['en'] === undefined || typeof v.labels['en'] === 'undefined' ){

              label = v.id; // use qid-string as the label

            }
            else{
 
              label = v.labels['en'].value ; // english fallback

            }

          }
          else {

            label = v.labels[explore.language].value;

            obj[ qid ] = {

              title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="' + label + '" aria-label="' + label + '" role="button"' + setOnClick( Object.assign({}, args, { type: 'wikipedia-qid', qid: qid, title: label } ) ) + '>' + label + '</a><br>' ),
              thumb_link:           '',
              explore_link:         encodeURIComponent( getExploreLink( args, label, qid ) ),
              video_link:           encodeURIComponent( getVideoLink( args, label ) ),
              wander_link:          encodeURIComponent( getWanderLink( args, label ) ),
              images_link:          encodeURIComponent( getImagesLink( args, label ) ),
              books_link:           encodeURIComponent( getBooksLink( args, label, qid ) ),
              websearch_link:       encodeURIComponent( getWebsearchLink( args, label, qid ) ),
              compare_link:         encodeURIComponent( getCompareLink( qid ) ),
              website_link:         '', // getExternalWebsiteLink( url ) , getLocalWebsiteLink( args, url )
              custom_links:         '', // custom_links,
              raw_html:             '', // raw_html
              mv_buttons_style:     '',

            };

          }

				});

				insertMultiValuesHTML( args, obj, {} );

			},

	});

}

async function insertMultiValuesHTML( args, obj, meta ){

  let sort_select = '';

  let sel = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';

  // create meta header
  let meta_header = '';

  if ( typeof meta === undefined || typeof meta === 'undefined' ){
    // do nothing

    meta = {};

  }
  else {

    if ( valid( meta.page ) ) {
      // do nothing
    }
    else {

      meta.page = 1;

    }

    if ( valid( meta.sort_select ) ){ // add select form

      sort_select = meta.sort_select;

    }

    if ( valid( meta.source ) ){ // add select form
      // do nothing
    }
    else {

      meta.source = args.title.replace(/_/g, ' ');

    }

    let result_counter_html = '';

    if ( meta.page === 1 ){ // only for the first results

      if ( valid( meta.call ) ){ // fetch-more enabled, dont show counter

        result_counter_html = '( ' + meta.total_results + ' )';

      }
      else if ( valid( meta.total_results ) ){ // no fetching-enabled

        result_counter_html = '( ' + meta.results_shown + ' / ' + meta.total_results + ' )';

      }
      else if ( valid( meta.total_results_shown ) ){

        result_counter_html = '( ' + meta.results_shown + ' )';

      }

      meta_header = '<div class="topic-extra meta"><a href="javascript:void(0)" title="link to query" onclick="openInNewTab( &quot;' + meta.link + '&quot;)">' + meta.source + '</a> <span class="results">' + result_counter_html + '</span></div>' + sort_select;

    }

  }

  let html = meta_header + '<ul class="multi-value">';

  let i = 0;

  // 3) output: html button row for each qid:
  Object.entries( obj ).forEach(([ id , v ]) => {

    v.end_summary = '';

    html +=
      '<li>' +
        decodeURIComponent( v.title_link ) +
        '<span class="mv-extra-buttons" style="' + v.mv_buttons_style + '">' +
          decodeURIComponent( v.custom_links ) +
          decodeURIComponent( v.explore_link ) +
          decodeURIComponent( v.video_link ) +
          decodeURIComponent( v.wander_link ) +
          decodeURIComponent( v.images_link ) +
          decodeURIComponent( v.books_link ) +
          decodeURIComponent( v.websearch_link ) +
          decodeURIComponent( v.compare_link ) +
          decodeURIComponent( v.website_link ) +
        '</span>' +

        decodeURIComponent( v.raw_html ) +
        v.end_summary + // ends detail-summary for presentation-html

        decodeURIComponent( v.thumb_link ) +
        '<a class="go-to-top-detail" title="scroll to top of list" onclick="$(&apos;' + sel + '&apos;)[0].scrollIntoView();"><i class="fa-solid fa-chevron-up"></i></a>' +
      '</li>';

    // fetch-more button
    if ( i === Object.entries( obj ).length - 1 ){

      if ( valid( meta.call ) ){

        let cursor_string = '';

        if ( valid( meta.cursor ) ){ // use cursor

          cursor_string = ', &quot;' + meta.cursor + '&quot;';

        }

        let qid_string = '';

        if ( valid( meta.qid ) ){ // use qid

          qid_string = ', &quot;' + meta.qid + '&quot;';

        }

        html += '<a href="javascript:void(0)" class="mv-extra-topic fetch-more" title="more results" aria-label="more results" role="button" onclick="' + meta.call + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, ' + meta.total_results + ',' +  ( meta.page + 1 )  + ', &quot;' + meta.sortby + '&quot; ' + cursor_string + qid_string + '); $(this).remove();" data-title="' + args.title + '"><i class="fa-solid fa-ellipsis-h"></i></a>';

      }

    }

    i += 1;

  });

  html += '</ul>';

  // remove the fetch-more loading indicator
  $( sel + ' .loaderMV' ).remove();

  // TODO can we merge these two loader-add-remove versions? (see createItemHtml.js)
  $( sel + ' .mv-loader.' + args.id ).remove();

  if ( meta.page === 1 ){ // insert first html

    $( sel ).html( html );

  }
  else { // append extra html

    // append extra results
    $( sel ).append( html );

  }

}

async function renderTopics( inputs ){

  setDisplayForResults();

  //console.log( 'inputs: ',  inputs );

  explore.totalRecords  = 0; // default reset
  let combined_pagesize = 0; // default

  Object.keys( inputs ).forEach(( key, index ) => {

    //console.log( key, inputs[ key ].data.value[0].source.data.query.searchinfo.totalhits, datasources[ key ].pagesize );

    //console.log( key, inputs[ key ].data.value[0].source.data.query );

    explore.totalRecords  += parseInt( inputs[ key ].data.value[0].source.data.query.searchinfo.totalhits );

    combined_pagesize     += parseInt( datasources[ key ].pagesize );

    //console.log( index, explore.totalRecords, combined_pagesize );

  });

  // QQQ
  console.log( 'explore.totalRecords set to: ', explore.totalRecords, ', combined_pagesize: ', combined_pagesize );

  if ( explore.totalRecords === 0 ){

    $('#results-label' ).empty();

  }
  else {

    $('#results-label').html( '<span id="app-guide-page">' + explore.banana.i18n('app-guide-page') + '</span>' + ' ' + explore.page + ' / <span id="total"></span>');

  }

  // non-wikipedia-entry title
  const t = encodeURIComponent( getSearchValue() );

  const title = getSearchValue();

  const args = { 
    id            : 'n00',
    language      : explore.language,
    qid           : '',
    gid           : '',
    pid           : 'p' + explore.page, // page ID
    thumbnail     : '',
    title         : title,
    snippet       : '',
    extra_classes : 'raw-entry',
    item          : '',
    source        : 'raw',
  }

  // set non-wikidata fields
  let item_raw      = { qid : '' };
  setWikidata( item_raw, [ ], true, 'p1' );
  item_raw.title    = title;
 	item_raw.tags[0]  = 'raw-query-string';

	if ( args.id === 'n00' ){

		args.item		= item_raw;

	}

  const raw_entry = createItemHtml( args );

  // append raw-entry
  if ( explore.page === 1 && explore.searchmode === 'string' ){
    $('#results').append( raw_entry );
  }

  if ( explore.totalRecords === 0 ){ // no topics found

    $('.no-wikipedia-entry').show();

	  markArticle('n00', explore.type );

    $( explore.baseframe ).attr({"src": explore.base + '/pages/blank.html' });

  }
	else { // multiple results found

    Object.keys( inputs ).forEach(( key, index ) => {

      //console.log( key, inputs[ key ].data.value[0].source.data.query.search  );

      addTopics( key, inputs[ key ].data.value[0].source.data.query.search );

    });

    // click on the first topic of the first datasource (do this ONLY on the first result page, not later pages)
    if ( explore.page === 1 ){

      let checks = []; // list of bools (one per active datasource), indicating if a topic-element exists

      $.each( explore.datasources, function( index, source ){ // for each active datasource

        if ( $( `#n1-${ explore.datasources[index] }-0` ).length ){ // element exists

          checks.push( true );

        }
        else { // element not found

          checks.push( false );

        }
      
      });

      // get the first "true" element-check
      const firstTrue = checks.findIndex( el => { if ( el === true ) { return true; } return false; });

      // NOTE: the empty-type-case (with results) indicates a structured-query WITHOUT an "explore.q"
      if ( explore.type === 'articles' ){
        // do nothing
      }
      else if ( explore.type === 'string' || explore.type === '' ){

        explore.replaceState = false;

        if ( explore.preventSliding ){
          // do nothing
        }
        else {

          $( `#n1-${ explore.datasources[ firstTrue ] }-0 a:first` ).click(); 

        }

        explore.replaceState = true;

      }
      else {

        markArticle( `n1-${ explore.datasources[ firstTrue ] }-0`, explore.type );

      }

    }

		// calculate total nr of pages (and force to one when no results are found)
	  $('#total-results').html( '<b>' + explore.totalRecords + '</b> <span id="app-topics-found">' + explore.banana.i18n('app-topics-found') + '</span>');;

    //console.log( 'searchmode: ', explore.searchmode, explore.totalRecords, combined_pagesize );

		$('#total').html( Math.max( Math.ceil( explore.totalRecords / combined_pagesize ), 1) );

		// hide next-page-button when there are no other pages available
		if ( explore.totalRecords < combined_pagesize ){
			$('#next').css("display", "none");
      $('#scroll-end').hide();
		}
    else {
      $('#scroll-end').show();
			$('#next').css("display", "inline-block");
    }
 
    // QQQ
    //console.log( 'explore.totalRecords: ', explore.totalRecords, ', combined_pagesize: ', combined_pagesize, ', explore.remaining_topics: ', '...', ', page: ', explore.page );

    // FIXME why does the highlighting not work when the following "instance" line is moved to the to top the function?
    const markjs_instance = new Mark( document.querySelectorAll( '.p' + explore.page ) ) ;

    // highlight the matching search-query words in article-summaries
    const m = explore.q.replace(/[()"“”'‘’]/g, '').replace(/[\-,]/g, ' ');

    markjs_instance.mark( m , {
      'element': 'span',
      'className': 'highlight',
      'accuracy': 'exactly',
      'separateWordSearch' : true,
      'ignoreJoiners' : true,
      'diacritics' : true,
      //'ignorePunctuation' : [ ' ' ],
      //'wildcards' : "withSpaces",
      //'accuracy': {
      //  'value': 'exactly',
      //  'limiters': [',', '.'],
      //},
    });

    if ( valid( explore.tab ) ){
      explore.tabsInstance.select( explore.tab );
      explore.tab = '';
    }
		else if ( explore.isMobile ){
			explore.tabsInstance.select('tab-topics');
		}

    if (explore.page === 1 ){

      const id      = $( ".entry:nth-child(2)" ).attr('id'); // 'n1'
      const q_      = getSearchValue().toLowerCase().replace(/^"|"$/g, '').trim();
      let show_raw  = false; // default
      let show_raw_results = [];

      $.each( explore.datasources, function( index, source ){ // for each active datasource

        let d = datasources[ Object.keys( datasources)[ index ] ];

				if ( valid( d.code_render_mark ) ){

					eval( `${ d.code_render_mark }` );

				}

      })

      // FIXME?
      //console.log( inputs, show_raw_results );
      //else { // mark on the "no-wikipedia-article"
      //  show_raw_results.push( true );
      //  markArticle('n0', explore.type );
      //}

      if ( valid( show_raw_results ) ){ // each datasource check holds true
        $('.no-wikipedia-entry').show();
      }
      else {
        $('.no-wikipedia-entry').hide();
      }

    }

	}

  // auto-close inactive "multi-value detail" elements in the sidebar
  $('details.multi-value').click(function (event) {
    $('details.multi-value').not(this).removeAttr("open");  
  });

  // store URL-query title for future uses
  explore.q_prev        = explore.q;
  explore.type_prev     = explore.type;
  explore.language_prev = explore.language;

  let q     = window.location.pathname.replace(/\/explore\//g, ' ') || ''; 
  q         = q.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, '').trim().replace(/_/g, ' ').replace(/%25/g, '%').replace(/%20/g, ' ');
  explore.q = decodeURIComponent( q );

  $('#pager').show(); // initially hidden, and also temporarily hidden during the next-page-loading phase

  $('#blink').hide();

  // add note to the first detail-element
  $('.entry.articles').not('#n00').first().find('.bt:first').html('<span class="guiding-info"> &nbsp;&nbsp; <i class="fa-solid fa-long-arrow-alt-left"></span></i><span id="app-guide-see-more" class="notbold"> ' + explore.banana.i18n('app-guide-see-more') + '</span>');

  // if there is a fragment parameter: try to open the detail-fragment
  if ( valid( explore.fragment ) ){
    
    let fragment_id  = 'mv-' + $( "div#results a.article-title:contains(" + explore.q + ")" ).first().parent().attr('id') || '';

    // FIXME
    if ( fragment_id === 'mv-n00' ){
      fragment_id = 'mv-n1-0';
    }

    console.log( 'opening detail-fragment: ',  encodeURIComponent( explore.q ), fragment_id , explore.fragment );

    openInline( encodeURIComponent( explore.q ), fragment_id , explore.fragment ); // openInline('Red Robin', 'mv-n1-1', 'taxon_group')

  }

  //console.log('renderTopics: ', explore.q, explore.type, explore.qid, explore.gid, explore.uri );

  if (explore.page === 1 ){

    if ( validAny( [ explore.uri, explore.gid, explore.qid ] ) ){

      handleClick({
        id        : 'n1-0',
        type      : explore.type,
        title     : explore.q,
        language  : explore.language,
        qid       : explore.qid,
        gid       : explore.gid,
        url       : explore.uri,
        tag       : '',
        languages : '',
        custom    : explore.custom,
        target_pane : 'p1',
      });

    }

  }

  $('#loader').hide();

  explore.preventSliding = false;

}

function addTopics( source, list ){

  //console.log( source, list );

  $.each( list, function( i, item ) { // for each topic

    let title         = encodeURIComponent( item.title );
    let q             = encodeURIComponent( item.qid ) || 0;
    let qid           = '';
    let custom        = '';
    let concept_class = '';
    let thumb         = encodeURIComponent( item.thumb ) || '';

    //console.log( item, item.title, title );

    if ( thumb === 'undefined' ){ thumb = ''; }

    let thumbnail = '';

    if ( thumb.length > 0 ){

      if ( item.datasource === 'wikipedia' ){

        thumbnail = '<div class="summary-thumb"><img class="thumbnail" src="' + 'https://'+ explore.language + '.wikipedia.org/wiki/' + explore.language + ':Special:Filepath/' + thumb + '?width=' + explore.thumb_width + '" alt="" /></div>';

      }
      else {

        //console.log( thumb );
        thumbnail = '<div class="summary-thumb"><img class="thumbnail" src="' + decodeURIComponent( thumb ) + '" alt="" /></div>';

      }

    }

    if ( q.length > 1 ){
      qid  = q.substring(1);
    }

    if ( typeof item.lat === undefined || typeof item.lat === 'undefined' ){
      // do nothing
    }
    else {
      custom = { lat: item.lat, lon: item.lon, radius: explore.nearby_radius_limit, limit: explore.nearby_max_results };
    }

    title = title.replace(/%3A/, ':'); // FIXME why is this needed? any other problematic character encodings?

    // cleanup "namespaces" in title (as this is better for some search-services)
    const title_ = minimizeTitle( title );

    const id = 'n' + explore.page + '-' + source + '-' + i; // entry ID

    const scrollTriggerClass = ( i === ( list.length - 1) ) ? 'triggerLoading' : '';


    const args = { 
      id            : id,
      language      : explore.language,
      qid           : qid,
      pid           : 'p' + explore.page,
      thumbnail     : thumbnail,
      title         : item.title,
      gid           : item.gid,
      snippet       : item.snippet,
      extra_classes : '',
      item          : item,
      custom        : custom,
      source        : source,
    }

    const html_result_list = createItemHtml( args );

    // wikipedia article
    $('#results').append( html_result_list );

    //if ( explore.type === 'articles'){
      //explore.type = '';
      //return 0;
    //}

  });

}

async function renderType( args ){

  // args
  let type      = args.type;
  let title     = args.title;  // formal title
  let title_    = args.title_; // minimized title (contains no: namespace, or "[()]"-characters  )
  let title_quoted = args.title_quoted;
  let url       = args.url;
  let qid       = args.qid; // with 'Q' character
  let qid_      = '';       // without 'Q' character
  let gid       = args.gid; // with 'Q' character
  let current_pane = args.current_pane;
  let target_pane = args.target_pane;
  let id        = args.id;
  let ids       = args.ids;
  let tag       = args.tag;
  let tags      = args.tags;
  let languages = args.languages;
  let custom    = args.custom;
  let gbif_id   = args.gbif_id;
  let banner    = args.page_banner;
  let panelwidth= args.panelwidth || '';
  let slide     = args.slide      || '';
  let datasource= args.datasource || '';
  //let gid       = args.gid        || ''; //  TODO QQQ
  // TODO should we also add a "hash" argument?

  //console.log( 'args: ', args );

  explore.curr_title = title;
  explore.curr_article_id = '1';

  let hash_ = explore.hash;

  // FIXME check correctness
  if ( typeof qid === undefined || typeof qid === 'undefined' ){

    if ( typeof explore.qid === undefined || explore.qid === 'undefined' ){
      qid = explore.qid = '';
    }
    else {
      qid = explore.qid || '';
    }
  }

  if ( qid.startsWith('Q') ){
    qid = qid.substring(1); // remove 'Q' from string, which is needed for some types
  }

  if ( ! valid( tag ) ){
    tag = '';
  }

  // reset cache fields
  explore.archive_cached_sentences = '';
  explore.archive_cached_html = '';

  if ( type === 'string' || type === ''){ // RIGHT-side: load new iframe content from wikipedia (default type)

    // FIXME don't do this for known items which lack a qid
    if ( typeof tag === undefined || typeof tag === 'undefined' ){ // try to get a qid first: if the qid exists: we try to fetch its wikidata 

      explore.title = title;

      if ( title.startsWith( explore.lang_talk + ':' ) ||
           title.startsWith( explore.lang_portal + ':' ) ||
           title.startsWith( explore.lang_book + ':' )
          ){ // render without wikidata-info

        resetIframe();

        $( explore.baseframe ).attr({"src": explore.base + '/app/wikipedia/?t=' + title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&dir=' + explore.language_direction  + '&tags=' + tag + '&tutor=' + explore.tutor + '&embedded=' + explore.embedded + '#' + explore.hash });

      }
      else { // render with wikidata-info

        if ( qid === '' ){

          getWikidataFromTitle( title, true, target_pane );

        }
        else {

          getTitleFromQid( 'Q' + qid, target_pane );

        }

      }

    }
    else {

      // determine if we should render someting else than the wikipedia artcle, eg: link
      if ( explore.type === 'link' ){

        if ( explore.uri !== '' ){ // use URL param

          //console.log( 'link is: ', explore.uri );

          if ( explore.uri.startsWith('%25') ){ // is an encoded string

            explore.uri = JSON.parse( decodeURIComponent( explore.uri ) );

          }

          renderToPane( target_pane, explore.uri );

        }

      }
      else { // wikipedia

        if ( languages === '' ){ 

          // no wikidata set yet for this article, so get wikidata and render the article.
          getWikidataFromTitle( title, true, target_pane );

        }
        else { // user is coming from an internal click, which should have the wikidata already

          renderToPane( target_pane, explore.base + '/app/wikipedia/?t=' + title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + qid + '&dir=' + explore.language_direction + '&tags=' + tag + '&tutor=' + explore.tutor + '&embedded=' + explore.embedded + '#' + explore.hash );

        }

      }

    }

  }
	else if ( type === 'wikipedia-qid' ){ // get wikipedia page from a wikidata qid

    if ( explore.firstAction ){

      getTitleFromQid( explore.qid, target_pane );

    }
    else {

      getTitleFromQid( 'Q' + qid, target_pane );

    }

  }
	else if ( type === 'explore' ){ // LEFT + RIGHT-side: search & load new iframe content. Used by the "explore this topic" button

		$('#pager').hide();

    explore.page = 1; // reset active page

    // TODO: make this work for secondary-iframes

    // remove "Category:" string when needed?
    const title_nocat = removeCategoryFromTitle( title ); // TODO: also make this work for RTL-scripts

    // prevent this duplicate (loop-causing) call from happening when the 'explore'-view is triggered by replace State()
    explore.type = 'string';

    $('#srsearch').val( decodeURIComponent( title_nocat ) );

    explore.q = getSearchValue();

    $('.submitSearch').click();

    if ( valid( explore.tab ) ){
      explore.tabsInstance.select( explore.tab );
      explore.tab = '';
    }
    else {
      explore.tabsInstance.select('tab-topics');
    }

    // choose first active datasource as the default topic-marker
    markArticle( `n1-${ explore.datasources[ 0 ] }-0`, explore.type );

	}

	else if ( type === 'articles' ){ // LEFT-side: only show new search results (dont change the iframe window). Used in: geo app

		$('#srsearch').val( decodeURIComponent( title ) );
    explore.q = getSearchValue();

    $('.submitSearch').click();
    explore.type = 'articles';
    explore.tabsInstance.select('tab-topics');

  }
	else if ( type === 'bookmark' ){

		event.data = { 
			data : {
				tags:       valid( tags )? tags : [ tag ],
				datasource: datasource,
				gid:        gid,
			}
		}

    addBookmark( event, 'clicked' );

    // immediately modify items bookmark-icon
    if ( id !== '' ){
      $( '#' + id ).find( '.bookmark-icon' ).removeClass().addClass( 'bookmark-icon fa-solid fa-bookmark bookmarked' ).data( 'bookmarkid', id );;
    }

	}
	else if ( type === 'random' ){ // LEFT + RIGHT-side: search & load new iframe content. Used by the "explore this topic" button

    getRandomPages(); // this will set the type back to "wikipedia" and submit the search also.

    explore.tabsInstance.select('tab-topics');

	}

	else if ( type === 'wander' ){

    let firstAction = explore.firstAction; // due to the async-ajax-call we need to store this value

    explore.vids = [];
    explore.vids_index = 0;

    let custom_param      = '';
    let number_of_results = 10;

    if ( custom === 'long' ){
      custom_param = '&videoDuration=long';
      number_of_results = 4;
    }

    let wander_url = explore.base + '/app/proxy/video/search?part=id&type=video&relevanceLanguage=' + explore.language + '&maxResults=' + number_of_results + '&q=' + encodeURIComponent( title_quoted ) + custom_param;

    $.ajax({

      // videoDuration=long
      url: wander_url,

      dataType: "json",

      success: function ( data ) {

        if ( custom === 'long' ){ // sort array randomly (to prevent the same video from playing each time)
          data.items = shuffleArray( data.items );
        }

        $.each( data.items, function( i, item ){

          explore.vids.push( item.id.videoId );
    
        });	

        if ( explore.vids_mute !== '' ){
          // do nothing
        }
        else { // no value set yet
          explore.vids_mute = firstAction? true : false;
        }

        // TODO
        // add title
        // open-in-tab from correct resume time
        // prevent needless control-menu flickering
        // add skip ahead 30sec?
        let url_ = explore.base + `/app/video/?l=${explore.language}&wide=true&wander=true#/view/` + explore.vids[ explore.vids_index ];

        // target URL: /app/video/?wide=true#/view/zqNTltOGh5c/20/40
        //let url_ = explore.base + '/app/wander/?videoId=' + explore.vids[ explore.vids_index ] + '&mute=' + explore.vids_mute;

        resetIframe();
        $( explore.baseframe ).attr({"src": url_ });
        explore.firstAction = false;

      },

      error: function (xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
        explore.firstAction = false;
      }

    });

	}
	else if ( type === 'nlp-query' ){ // TODO

    resetIframe();

	}
  else if ( type === 'compare' ){

    const url =  encodeURI( explore.base + '/app/compare/?r&lang=' + explore.language + '&i=' + explore.compares.join() );

    resetIframe();
    $( explore.baseframe ).attr({"src": decodeURI( url ) });

  }
  else if ( type === 'link-split' ){

    if ( ! isNaN( panelwidth ) ){

      resetIframe( 'split', panelwidth, 100 - panelwidth );

    }
    else {

      resetIframe( 'split' );

    }

    if ( explore.uri !== '' ){ // use URL param

      if ( explore.isMobile ){

        $('#infoframeSplit1').attr({"src": decodeURI( explore.uri ) });

        $('#infoframeSplit2').attr({"src": explore.base + '/app/wikipedia/?t=' + title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&dir=' + explore.language_direction + '&tags=' + tag + '&tutor=' + explore.tutor + '&embedded=' + explore.embedded + '#' + explore.hash });

      }
      else {

        $('#infoframeSplit1').attr({"src": decodeURI( explore.uri ) });
        $('#infoframeSplit2').attr({"src": explore.base + '/app/wikipedia/?t=' + title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&dir=' + explore.language_direction + '&tutor=' + explore.tutor + '&embedded=' + explore.embedded + '#' + explore.hash });

        // FIXME: This should wait for the HTML-content to be available in the content pane iframes
        $( '#infoframeSplit1, #infoframeSplit2' ).contents().find("body").css('font-size', explore.fontsize + 'px');

        $('.fixed-action-btn.direction-left').hide();

      }

    }

    explore.firstAction = false;

  }

	else if ( type === 'link' ){

    if ( explore.uri !== '' ){ // use URL param

      if ( explore.uri.startsWith('%22') ){ // is an encoded string

        explore.uri = JSON.parse( decodeURIComponent( explore.uri ) );

      }

      renderToPane( target_pane, decodeURIComponent( explore.uri ) );

    }
    else { // use passed URL value

      renderToPane( target_pane, decodeURIComponent( url ) ); // TODO: is the decodeURIComponent() needed here?

    }

    explore.firstAction = false;

  }
	else if ( type === 'url' ){

    // TODO: can back/forward work with "open in new tab" actions?
    if ( explore.uri !== '' ){ // use URL param
      openInNewTab( JSON.parse( decodeURI( explore.uri ) )  );
    }
    else { // use passed URL value

      if ( url !== '' ){
        openInNewTab( JSON.parse( decodeURI( url ) )  );
      }

    }

    // hide loaders
    $('#loader').hide();
    $('#blink').hide();

    explore.firstAction = false;

  }
	else if ( type === 'presentation' ){

    if ( valid( explore.qid ) ){

      makePresentation( explore.qid );

    }

  }

  // store URL-query title for future uses
  explore.q_prev = explore.q;
  explore.type_prev = explore.type;
  explore.language_prev = explore.language;

  if ( explore.type === 'wikipedia-qid' ){
    // keep the explore.qid in the URL
  }
  else { // else remove the explore.qid from the URL

    explore.qid = '';
  }

  explore.uri     = '';
  //explore.direct  = false;

  /*

  ALWAYS RESET:
    explore.qid (unless wikipedia-qid type)
    explore.uri
    explore.custom
    explore.direct
    explore.marks

   PERSIST UNTILL CHANGED REQUESTED:
    explore.language
    explore.type
    explore.viewMode

  */

  let q = window.location.pathname.replace(/\/explore\//g, ' ') || ''; 
  q = q.trim().replace(/_/g, ' ').replace(/%25/g, '%').replace(/%20/g, ' ');
  explore.q = decodeURIComponent( q ).replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "").trim();

  // TODO: handle automatic mobile-page-swipe better
  if ( explore.isMobile ){

    if ( explore.swiper.activeIndex === 0 ){

      const no_sliding_types = [ 'no_slide', 'url', 'dates', 'places', 'nearby', 'random', 'explore', 'bookmark' ];

      if ( custom === 'explore' ){ // hack to prevent panel-sliding on mobile during "explore -> wikipedia"
        type = 'no_slide';
      }

      if ( no_sliding_types.includes( type ) ){
        // do nothing
      }
      else {

        if ( !explore.preventSliding ){

          //explore.swiper.slideTo( 1 ); // ? TODO

        }

      }

    }

    // always reset this value
    explore.preventSliding = false;

  }

}

async function handleClick( args ) {

  //console.log( 'explore.keyboard_ctrl_pressed: ', explore.keyboard_ctrl_pressed );
  //console.log( 'event.ctrlKey: ', event.ctrlKey );
  //console.trace();
  //console.log( args );

  // check for CTRL-key, to open link in new tab
  if ( valid( [ explore.keyboard_ctrl_pressed, event ] ) ){

    event.preventDefault();

    explore.keyboard_ctrl_pressed = false;

    if ( valid( event.target.Window ) ){ // embedded app call

      //console.log('handle embedded-app CTRL-click' );

    }
    else { // main app call

      //console.log('main app CTRL-click: open in new window');
      //console.log( event.target.hasAttribute("onauxclick") );

      const open_in_new_tab_code = event.target.getAttribute('onauxclick');

      if ( valid( open_in_new_tab_code ) ){

        eval( open_in_new_tab_code );

      }

    }

    return 0;

  }

  $('#blink').show();

  if ( typeof args === 'string' ){ // args is a string

    if ( args.startsWith('%7B%') ){ // args is an encoded string

      args = JSON.parse( decodeURIComponent( args ) ); // decode the args-string

    }

  }

  //console.log( 'handleClick() args: ', args );

  // TODO make all args optional, so the caller does not need to use each field
  let id            = args.id;
  let type          = args.type;
  let title         = args.title;
  let lang          = args.language;
  let qid           = args.qid;
  let gid           = valid( args.gid )? args.gid : '';
  let url           = args.url;
  let tag           = args.tag;
  let tags          = valid( args.tags )? args.tags : '';
  let languages     = args.languages;
  let datasource    = valid( args.source )? args.source : '';

  explore.singleuse = valid( args.singleuse )? true : '';

  let current_pane  = '';
  let target_pane   = '';

  let ids           = '';             // any other needed type-specific identifiers
  let custom        = args.custom;    // any other data needed (eg. iso2-country-code, ...)
  let gbif_id       = '';             // used for rendering the GBIF occurence map
  let panelwidth    = args.panelwidth // used for setting the left link-split panel width

  // get current topic ID, to set the topic-cursor
  if ( valid( id ) ){

    if ( id.startsWith('n') ){

      explore.topic_cursor = id;

    }
    else if ( id.startsWith('mv-') ){

      explore.topic_cursor = id.replace( 'mv-', '' );

    }

  }

  if ( typeof args.thumbnail === undefined ){
    // do nothing
  }
  else {

    explore.wallpaper = $( args.thumbnail ).find('img').attr('src') || '';
    const image_size = ( explore.isMobile ) ? '200' : '400';
    explore.wallpaper = explore.wallpaper.replace(/width=.*$/, 'width=' + image_size );
    //console.log( explore.wallpaper );

  }

  if ( typeof args.current_pane === undefined || typeof args.current_pane === 'undefined'){
    // do nothing
  }
  else {
    current_pane = args.current_pane;
  }

  if ( typeof args.target_pane === undefined || typeof args.target_pane === 'undefined'){
    // do nothing
  }
  else {
    target_pane = args.target_pane;
  }

  if ( typeof args.ids === undefined || typeof args.ids === 'undefined'){
    // do nothing
  }
  else {
    ids = args.ids;
  }

  if ( typeof args.gbif_id === undefined || typeof args.gbif_id === 'undefined'){
    // do nothing
  }
  else {
    gbif_id = args.gbif_id;
  }

  if ( lang == '' || lang == undefined ){
    setLanguage ( 'en' ); // FIXME: find out where language was not being set, then fix it.
  }
  else {

    if ( lang.trim() !== explore.language ){ // only updated when different

      console.log( 'language update: ', lang.trim(), explore.language );

      setLanguage ( lang.trim() );

    }

  }

	title = title.replace(/%3A/, ':'); // FIXME why is this needed? any other problematic character encodings?

	// cleanup "namespaces" in title (as this is better for some search-services)
  const title_        = minimizeTitle( title );
  const title_quoted  = quoteTitle( title );

  if ( type !== 'map'){
    markArticle(id, type);
  }

	explore.type  = type; // user clicked for a new type, so store that

  if ( valid( qid ) ){ // a valid "qid" was passed (note: passing a qid is optional!)

	  explore.qid   = qid;

    if ( !explore.qid.startsWith('Q') ){

      explore.qid = 'Q' + explore.qid; // add 'Q' to qid string

    }

  }

	explore.uri     = url;
	explore.custom  = custom;

  //console.log('JSON LD: ', args );

  // set some linked-data fields
  explore.ld = {

    tag           : valid( args.tag ) ? args.tag.replace('-', ' ') : '',
    summary       : valid( args.snippet ) ? args.snippet.replace(/<[^>]+>/g, '') : '',
    imageUrl      : valid( args.thumbnail ) ? 'http' + args.thumbnail.split('http')[1].split('?width')[0] : '',
    thumbnailUrl  : valid( args.thumbnail ) ? 'http' + args.thumbnail.split('http')[1].split('?width')[0] + '?width=150' : '',

  }

  //console.log( explore.ld );

  updatePushState( title, 'add' );

	explore.curr_title = decodeURIComponent( title );

  const renderType_args = {
    type          : explore.type,
    title         : explore.curr_title,
    title_        : title_,
    title_quoted  : title_quoted,
    url           : url,
    qid           : explore.qid,
    gid           : gid,
    current_pane  : current_pane,
    target_pane   : target_pane,
    id            : id,
    tag           : tag,
    tags          : tags,
    languages     : languages,
    ids           : ids,
    custom        : custom,
    gbif_id       : gbif_id,
    datasource    : datasource,
    panelwidth    : panelwidth,
  };

  renderType( renderType_args );

  //explore.hash = ''; // TODO: redesign hash handling

};

function updatePushState( title, mode ){

  title = title.replace( /\?/g, '%3F'); // need to escape "?" for structured form-query URLs

  if ( ! valid( explore.hash ) ){

    explore.hash = '';

  }

  const no_update_types = [ 'bookmark' ];

  // some type-actions should not update the URL
  if ( no_update_types.includes( explore.type ) ){ // no URL update needed

    return 0;

  }

  let title_i = '';

  if ( explore.replaceState ){ // this allows "action-triggering code parts" to prevent updating the URL (needed to not mess with the users firstAction query)

    if ( typeof mode === undefined || typeof mode === 'undefined' ){
      mode = 'add'; // default mode is to add new URLs to the history object
    }

    const p = buildURLParameters();

    //console.log( p );

    if ( title === '' ){

      // TODO: allow for some alternative URL title to be passed when there is no title available (eg. with wdq-queries)?
      document.title = decodeURIComponent( explore.type + ' - conzept');

    }
    else {

      const title_    = decodeURIComponent( title ) + ' - Conzept encyclopedia';

      // title
      document.title  = title_;
      $('title').text( title_ );
      $('meta[property="og:title"]').attr('content', title_ );
      $('meta[property="twitter:title"]').attr('content', title_ );

      // description
      $('meta[name=description]').attr('content', title_ );
      $('meta[property="og:description"]').attr('content', title_ );
      $('meta[property="twitter:description"]').attr('content', title_ );

    }

    // encode any path-influencing (URL-reloading relevant) properties correcly first:
    const t = title.replace('/', '%252F').replace('?', '%253F'); //.replace(' ', '%20');

    const url = 'https://' + explore.host + explore.base + '/explore/' + t + '?l=' + explore.language + p.ds + p.d + '&t=' + explore.type +  p.filterby + p.sortby + p.i + p.u + p.c + p.t2 + p.i2 + p.u2 + p.c2 + p.m + p.v + p.f + '&s=' + explore.show_sidebar + p.query + p.commands + '#' + explore.hash.replace(/#/g, '');

    const linked_url = 'https://' + explore.host + explore.base + '/explore/' + t + '?l=' + explore.language + p.ds + p.d + p.filterby + p.sortby + p.i + '&t=' + explore.type + p.u + p.query;

    $('link[rel=canonical]').attr('href', linked_url );
    $('meta[property="og:url"]').attr('content', linked_url );
    $('meta[name="twitter:url"]').attr('content', linked_url );

    explore.ld.title          = t;
    explore.ld.inLanguage     = explore.voice_code ? explore.voice_code : explore.language || 'en';
    explore.ld.identifier     = explore.qid ? 'http://www.wikidata.org/entity/' + explore.qid : '';
    explore.ld.main_entity    = explore.qid ? 'http://www.wikidata.org/entity/' + explore.qid : '';
    explore.ld.wikidata_link  = explore.qid ? 'http://www.wikidata.org/wiki/' + explore.qid : '';
    explore.ld.wikipedia_link = explore.qid ? 'http://' + explore.language + '.wikipedia.org/wiki/' + t : '';
    explore.ld.dbpedia_link   = explore.language === 'en' ? 'http://dbpedia.org/page/' + t : '';

    explore.ld.url = valid( explore.uri )? linked_url : '';

    // FIXME: can we set these images from an initial-visit and a click on the sidebar?
    //if ( !valid( explore.ld.image ) ){
    //  explore.ld.imageUrl       = '';
    //  explore.ld.thumbnailUrl   = '';
    //}

    //console.log( explore.ld );

    setJSONLD( explore.ld );

    if ( explore.type === 'random' ){

      return 0; // no need to store the URL yet, do this later when the title is set

    }

    if ( mode === 'add' ){

      //console.log( 'add to history: ', document.title, url, title );
      history.pushState({ id: 'home' }, 'conzept explore', url );

    }

  }
  
}

function setJSONLD( ld ){

  //console.log( 'set ld: ', ld );

  // get current "ld-info" DOM ref
  const ld_current = document.querySelector('script#ld-info');

  // create JSON-LD element
  let el  = document.createElement('script');
  el.type = 'application/ld+json';
  el.setAttribute("id", "ld-info");

  //console.log( 'set mainEntity: ', ld.main_entity );

  let obj = {
    "@context": "http://schema.org",      // https://schema.org
    "@type": "WebPage",                   // https://schema.org/WebPage
    "inLanguage": ld.inLanguage,  // https://schema.org/Language
    "name": ld.title,
    "description": ld.summary,
    "teaches" : ld.tag,
    //"speciality" : ld.tag,
    //"thumbnailUrl" : ld.thumbnailUrl,
    //"image": ld.imageUrl,
    "url": ld.url,
    "mainEntityOfPage": ld.main_entity,
    "significantLink": ld.significantLink,
    //"relatedLink": ld.relatedLink,
    //"identifier": ld.identifier,
    "sameAs": [
      ld.wikipedia_link,
      ld.wikidata_link, 
      ld.dbpedia_link, 
    ].filter(Boolean),
    "author": { "@type": "Organization", "name": "Conzept encyclopedia" },
    "publisher": { "@type": "Organization", "name": "Conzept encyclopedia",
      "logo": {
        "@type": "ImageObject",
        "url": `https://${explore.host}/assets/icons/logo.svg`
      }
    },
    //"datePublished": new Date().toISOString(),
    //"dateModified": new Date().toISOString(),
    "license" : 'https://creativecommons.org/licenses/by-sa/4.0/',
    "copyrightNotice" : 'The Wikipedia text is available under the CC BY-SA 4.0 license; additional terms may apply. Images, videos and audio are available under their respective licenses.',
    "copyrightHolder" : 'The Wikipedia article contributors',

  };

  if ( valid( ld.image ) ){ obj.image = ld.imageUrl; } 
  if ( valid( ld.thumbnailUrl ) ){ obj.thumbnailUrl = ld.thumbnailUrl; } 

  el.text = JSON.stringify( obj );

  // replace previous JSON-LD element
  ld_current.parentNode.replaceChild(el, ld_current);

}

function updateJSONLD( ld ){

  // get current "ld-info" DOM ref
  const el = document.querySelector('script#ld-info');

  let jsonld = JSON.parse( el.innerText );

  //console.log( 'update ld: ', jsonld );
  //console.log( 'update mainEntity: ', ld.qid );

  //jsonld.identifier       = ld.qid ? 'http://www.wikidata.org/entity/' + ld.qid : '';
  jsonld.mainEntityOfPage = ld.qid ? 'http://www.wikidata.org/entity/' + ld.qid : '';

  jsonld.sameAs             = [
    ld.title ? 'http://' + explore.language + '.wikipedia.org/wiki/' + ld.title : '',
    ld.qid ? 'http://www.wikidata.org/wiki/' + ld.qid : '',
    ld.title && explore.language === 'en' ? 'http://dbpedia.org/page/' + ld.title : '',
    ld.google_kg ? 'https://g.co/kg' + ld.google_kg : '',
  ].filter(Boolean),

  jsonld.teaches        = valid( ld.tags )? ld.tags.map(n => n.replace('-', ' ') ) : [];
  jsonld.description    = ld.description;
  jsonld.text           = valid( ld.text )? ld.text : '';
  jsonld.significantLink= valid( ld.website )? Object.values( ld.website ) : [];

  if ( valid( ld.image ) ){ jsonld.image = ld.image; } 
  if ( valid( ld.thumbnailUrl ) ){ jsonld.thumbnailUrl = ld.thumbnailUrl; } 

  let newJson = JSON.stringify( jsonld );

  el.innerHTML = newJson;

  document.getElementById('ld-info').textContent = el.innerText;

}

function buildURLParameters(){ // builds a URL state object from the current state

  // QUERY-DATA PARAMETERS
  let p = {};

  p.t2 = '';

  if ( explore.type2 === '' ) { explore.t2 = '' } else {
    p.t2 = '&t2=' + explore.type2;
  }

  // global ID (used for the non-qid, datasource ID)
  p.gid = '';

  if ( explore.gid === '' || explore.gid === 'undefined' || explore.gid === undefined ){ explore.gid = ''; } else {
    p.gid = '&gid=' + explore.gid;
  }

  // ID (used for the qid)
  p.i = '';

  if ( explore.qid === '' || explore.qid === 'undefined' || explore.qid === undefined ){ explore.qid = ''; } else {
    p.i = '&i=' + explore.qid;
  }

  p.i2 = '';

  if ( explore.qid2 === '' || explore.qid2 === 'undefined' || explore.qid2 === undefined ){ explore.qid2 = ''; } else {
    p.i2 = '&i2=' + explore.qid2;
  }

  // URL
  p.u = '';

  if ( explore.uri === '' || explore.uri === undefined ){ explore.uri = ''; } else {

    if ( explore.uri.startsWith('%25') || explore.uri.startsWith('%22') ){ // is an encoded string

      p.u = '&u=' + explore.uri.replace(/^%22/, '').replace(/%22$/, '');

    }
    else {

      //p.u = '&u=' + encodeURIComponent( JSON.stringify( explore.uri ) ).replace(/^%22/, '').replace(/%22$/, '' );

      p.u = '&u=' + encodeURIComponent( explore.uri );

    }

  }

  // url2 parameter
  p.u2 = '';

  if ( explore.uri2 === '' || explore.uri2 === undefined ){ explore.uri2 = ''; } else {

    if ( explore.uri2.startsWith('%25') || explore.uri2.startsWith('%22') ){ // is an encoded string

      p.u2 = '&u=' + explore.uri2;

    }
    else {

      p.u2 = '&u2=' + encodeURIComponent( explore.uri2 ).replace(/"/g, '');

    }

  }


  // CUSTOM DATA (needed for some types)
  p.c = '';

  if ( explore.custom === '' || explore.custom === undefined || explore.custom === 'undefined' || explore.custom === null ){ explore.custom = ''; } else {

    if ( typeof explore.custom === 'object' ){ // found object "lat,lon,dist,radius,limit"

      explore.custom = explore.custom.lat + ',' + explore.custom.lon ; // convert to a string

    }

    p.c = '&c=' + explore.custom;
  }

  p.c2 = '';

  if ( explore.custom2 === '' || explore.custom2 === undefined || explore.custom2 === 'undefined' || explore.custom2 === null ){ explore.custom2 = ''; } else {

    if ( typeof explore.custom2 === 'object' ){ // found object "lat,lon,dist,radius,limit"

      explore.custom2 = explore.custom2.lat + ',' + explore.custom2.lon ; // convert to a string

    }

    p.c2 = '&c2=' + explore.custom2;

  }

  // QUERY-BUILDER DATA (needed for re-using the query-builder state)
  p.query = '';

  if ( explore.query === '' || explore.query === undefined || explore.query === 'undefined' || explore.query === null ){ explore.query = ''; } else {

    p.query = '&query=' + encodeURIComponent( explore.query );

  }

  // EDITOR-COMMAND DATA
  p.commands = '';

  if ( explore.commands === '' || explore.commands === undefined || explore.commands === 'undefined' || explore.commands === null ){ explore.commands = ''; } else {

    //console.log( 'before: ', p.commands );
    p.commands = '&commands=' + encodeURIComponent( explore.commands.replace(/</g, '%3C').replace(/>/g, '%3E') ).replace(/#/g, '%23');
    //console.log( 'after:  ', p.commands );

  }

  // OTHER URL parameters

    p.f = '';

    if ( explore.fragment === '' || explore.fragment === undefined ){ explore.fragment = ''; } else {
      p.f = '&f=' + explore.fragment;
    }

    // datasource parameters
    p.ds  = ''; // datasource-set
    p.d   = ''; // datasource list

    if ( !valid( explore.datasource_set ) || explore.datasource_set === 'none' ){ // no datasource-set

      explore.datasource_set = ''

      if ( explore.datasources.length === 0 ){ // no datasources
        explore.datasources = ''
      }
      else {
        p.d = '&d=' + explore.datasources.join(',');
      }

    }
    else {

      p.ds = '&ds=' + explore.datasource_set;

    }

    // filterby parameter
    p.filterby = '';

    if ( !valid( explore.filterby ) || explore.filterby === 'none' ){ explore.filterby = '' } else {
      p.filterby = '&filterby=' + explore.filterby;
    }

    // sortby parameter
    p.sortby = '';

    if ( !valid( explore.sortby ) || explore.sortby === 'none' ){ explore.sortby = '' } else {
      p.sortby = '&sortby=' + explore.sortby;
    }

    // line marks parameter
    p.m = '';

    if ( explore.marks === '' || explore.marks === undefined ){ explore.marks = ''; } else {
      p.m = '&m=' + explore.marks;
    }

    // viewMode paramater
    p.v = '';

    if ( explore.viewMode === '' || explore.viewMode === undefined ){ explore.viewMode = ''; } else {
      p.v = '&v=' + explore.viewMode;
    }

  return p;

}

function resizeFont() {

  const fontsizable_types = [ 'wikipedia', 'explore', 'map', 'elements', 'link-split' ];

  if ( fontsizable_types.includes( explore.type ) ){

    //$( explore.baseframe ).contents().find('body').css('font-size', explore.fontsize + 'px', 'important');
    $( '#infoframeSplit1, #infoframeSplit2' ).contents().find("body").css('font-size', explore.fontsize + 'px');

    // hack
    $('#infoframeSplit1').contents().find( explore.baseframe ).contents().find('#layout-topdown').click();

		//explore.editor.setFontSize( parseFloat( explore.fontsize ) );

  }

}

function postIframeLoad() {

  setLanguageDirection();
  renderLanguageDirection();

  // hide loaders
  $('#loader').hide();
  $('#blink').hide();

  setBold();
  setUnderline();
  setBgmode();
  setDarkmode();
  setColorFilter();
  setTopicCover();
  setMulticolumn();
  setLinkPreview();
  updateLocale( explore.locale );
  updateLocaleNative();

  $( explore.baseframe ).contents().find('body').css('fontSize', explore.fontsize + 'px' );
  $( explore.baseframe ).contents().find('a.link').css( 'color', explore.linkcolor , 'important');
  $( explore.baseframe ).contents().find('a.link').css( 'background', explore.linkbgcolor , 'important');

  // close inactive details 
  $('details.auto').click(function (event) {
    $('details.auto').not(this).removeAttr("open");  
  });

  resizeFont();

  const iframeEl = document.getElementById( explore.baseframe ); // FIXME for split-iframes

  if ( iframeEl === null ){
    //console.log( 'warning: postIframeLoaded but iframe is null');
    // do nothing
  }
  else {

    // send language child iframe
    iframeEl.contentWindow.postMessage( explore.language , '*');

    // scroll to hash (if needed)
    if ( explore.hash !== '' ){

      const hash_ = explore.hash.replace(/[ %{}|^~\[\]()"'+<>%'&\.\/?:@;=,]/g, '_').toLowerCase(); // NOTE: sync this replace-line with wikipedia-iframe.js
 
      iframeEl.contentWindow.location.hash = hash_;

      //explore.hash = ''; // reset hash
    }


  }

	if ( explore.type === 'dates' ){

    renderTypeDates( '', explore.type );

  }

}

function togglePanel2( ){

	if ( explore.embedded_splitter.position() === 0 ){ // panel 2 is maximized

		explore.show_sidebar = true;

		refreshSplitter( explore.splitterWidth );
		$('div.sticky').css({ 'width' : explore.splitter.position() });
    resizeEmbeddedSplitter();

		explore.embedded_splitter.position( explore.embedded_splitter_left_width + '%');
		explore.panel2_minimized = true;

	}
	else { // panel 2 is minimized

		// minimize sidebar
		explore.show_sidebar = false;
		explore.splitterWidth = 100 * ( explore.splitter.position() / $(window).width() ) ;
		refreshSplitter(0);
		updatePushState( explore.q, 'add' ); 
		resizeEmbeddedSplitter();

		// toggle full width for pane 2
		explore.embedded_splitter.position( '0%');

		explore.panel2_minimized = false;

	}

}

function minimizeLeftPanesToggle( pane_number ){

  if ( pane_number === 1 ){ // 1st content pane

    toggleSidebar();

  }
  else if ( pane_number === 2 ){ // 2nd content pane

		window.parent.postMessage({ event_id: 'toggle-panel2', data: { } }, '*' );

  }

}

function fixSafari(){

  // workaround for Safari bug: sticky-header positioned too high (and out of sight).
  $('swiper-paginaton').css({ 'margin-bottom' : '110px' }); // NOTE: remember to sync this pixel value in "css/main.css"

}

function resetIframe( mode, leftWidth, rightWidth ){

  // make sure to show the hover-menu (which could have been hidden due to a secondary iframe earlier)
  $('.fixed-action-btn.direction-left').show();

  if ( explore.isMobile ){ // mobile

    if ( window.frameElement === null ){
      //console.log( 'inside main window ');
    }
    else {

      return 0;
    }

    if ( mode === 'split' ){ // reset both content frames

      $('#doc').empty();

      $('#doc').append( '<div id="frameWrap">' + '<iframe id="infoframeSplit1" onload="postIframeLoad()" name="infoframeSplit1" title="content pane 1" role="application" width="100%" height="100%" frameBorder="0" src="" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-loc></iframe>' + '</div>');

      $('#doc2').empty();

      $('#doc2').append( '<div id="frameWrap">' + '<iframe id="infoframeSplit2" onload="postIframeLoad()" name="infoframeSplit2" title="content pane 2" role="application" width="100%" height="100%" frameBorder="0" src="" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-loc></iframe>' + '</div>');

    }
    else { // only reset primary content frame

      $('#doc').empty();

      $('#doc').append( '<div id="frameWrap">' + '<iframe id="infoframeSplit1" onload="postIframeLoad()" name="infoframeSplit1" title="content pane" width="100%" role="application" height="100%" frameBorder="0" src="" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-loc></iframe>' + '</div>');

      // TODO: hide "#doc2" on mobile

    }

  }
  else { // desktop

    $('#doc').empty();

    if ( mode === 'split' ){

      if ( typeof leftWidth === undefined || typeof leftWidth === 'undefined' || leftWidth === '' ){
        leftWidth = 50;
      }

      if ( typeof rightWidth === undefined || typeof rightWidth === 'undefined' || rightWidth === '' ){
        rightWidth = 50;
      }

      explore.embedded_splitter_left_width = leftWidth;

      $('#doc').append(

        '<script  src="' + explore.base + '/app/explore2/libs/splitter.js"></script>' +

        '<div id="frameWrap">' +

          '<img id="loader" alt="loading" width="36" height="36" src="' + explore.base + '/app/explore2/assets/images/loading.gif"/>' +

          '<div id="embedded-splitter">' + 
            '<div id="infoframeSplit1-split"><iframe id="infoframeSplit1" onload="postIframeLoad()" name="infoframeSplit1" title="content pane 1" role="application" width="100%" height="100%" frameBorder="0" src="" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-loc></iframe></div>' +

            '<div id="infoframeSplit2-split"><iframe id="infoframeSplit2" onload="postIframeLoad()" name="infoframeSplit2" title="content pane 2" role="application" width="100%" height="100%" frameBorder="0" src="" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock></iframe></div>' +

        '</div>');

      // init splitter
      const w = window.parent.$('#frameWrap').width();
      const h = window.innerHeight;

      // see: https://github.com/jcubic/jquery.splitter
      explore.embedded_splitter = $('#embedded-splitter').width( w ).height( h ).split({

        orientation: 'vertical',
        position: leftWidth + '%',
        limit: 0,

        //onDrag: function(event) {
        //  console.log( 'embedded-splitter drag');
        //}

      });

      // TODO handle screen-resizing for the embedded iframe.
      // ...

    }
    else {

      $('#doc').append('<div id="frameWrap"><img id="loader" alt="loading" width="36" height="36" src="' + explore.base + '/app/explore2/assets/images/loading.gif"/><iframe id="infoframe" onload="postIframeLoad()" name="infoframe" title="content pane" role="application" width="100%" height="100%" frameBorder="0" src="" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock></iframe></div>');

    }

  }

  if ( explore.isMobile && explore.isSafari ){ fixSafari(); }

  if ( ! explore.isMobile ){

    let pane_number         = $('#doc').hasClass('right_panel') ? 1 : 2;
    let iframe_is_external  = false;

   // add minimize-left-panes-toggle
    if ( iframe_is_external ){ // external iframe in pane2

      if ( $('#infoframeSplit2').prev().attr('id') !== 'minimizeLeftPanesToggle' ){

        $('#infoframeSplit2').before('<span id="minimizeLeftPanesToggle" onclick="minimizeLeftPanesToggle( 2 )" title="toggle left panes"><i class="fa-solid fa-angle-left"></i></span>');

      } 

    }
    else { // local iframe in pane1 or pane2

      $('#doc').prepend('<span id="minimizeLeftPanesToggle" onclick="minimizeLeftPanesToggle( ' + pane_number + ' )" title="toggle left panes"><i class="fa-solid fa-angle-left"></i></span>');

    }

  }

  // show loading indicator
  $('#loader').show();
  $('#blink').show();

  // timeout for showing loading indicator
  setTimeout(removeLoader, 20000);

}

function removeLoader() { // remove loading indicator after timeout

  $('#loader').hide();
  $('#blink').hide();

}

function receiveMessage(event){

  //console.log( 'received postMessage() data: ', event.data.event_id, event.data.data );

  if ( event.data.event_id === 'handleClick' ){

		//console.log( 'received iframe data: ', event.data.data.type, event.data.data.title, event.data.data.language );

		explore.hash  = event.data.data.hash;

		let current_pane  = '';
		let target_pane   = '';

		let tag           = '';
		let ids           = '';
		let languages     = '';
		let panelwidth    = '';

    if ( event.data.data.current_pane !== '' ){ current_pane = event.data.data.current_pane }

    if ( event.data.data.target_pane !== '' ){ target_pane = event.data.data.target_pane }

    if ( event.data.data.language !== '' ){

      if ( event.data.data.language !== explore.language ){

        setLanguage( event.data.data.language );

      }

    }

    if ( event.data.data.qid !== '' ){ explore.qid = event.data.data.qid; }

    if ( event.data.data.url !== '' ){ explore.uri = event.data.data.url; }

    if ( event.data.data.tag !== '' ){ tag = event.data.data.tag; }

    if ( event.data.data.panelwidth !== '' ){ panelwidth = event.data.data.panelwidth; }

    if ( event.data.data.ids !== '' ){ ids = event.data.data.ids; } // used by link-graph app (to go to the line of the first link ID)

    if ( event.data.data.languages !== '' ){ languages = event.data.data.languages; }

    if ( event.data.data.type === 'explore' && explore.windowName === 'infoframeSplit2' ){ // request from secondary content iframe

      window.parent.postMessage({ event_id: 'handleClick', data: { type: 'explore', title: event.data.data.title, hash: explore.hash, language: explore.language  } }, '*' );

    }
    else { // normal flow

      if ( explore.isMobile ){

        if ( event.data.data.type === 'explore' ){

          console.log( 'explore language: ', explore.language );

          explore.preventSliding = true;
          explore.swiper.slideTo( 0 ); // go back to sidebar on mobile when 'exploring'

        }    

      }

      if ( event.data.data.hash !== '' ){
        explore.hash = event.data.data.hash;
      }

      // language may have changed also: update voice menu
      reloadVoices(); // TODO: research if we could only do this upon a language-change

      handleClick({
        id            : 'n1-1',
        type          : event.data.data.type,
        title         : event.data.data.title,
        language      : explore.language,
        qid           : explore.qid,
        url           : event.data.data.url,
        tag           : tag,
        languages     : encodeURIComponent( JSON.stringify( languages ) ),
        ids           : ids,
        panelwidth    : panelwidth,
        custom        : '',
        current_pane  : current_pane,
        target_pane   : target_pane,
      });

    }

  }
  else if ( event.data.event_id === 'goto' ){

    let iframeEl = document.getElementById( 'infoframe' );

    console.log( 'passing data: ', event.data.data.value, event.data.data.value );

    if ( valid( iframeEl ) ){

      // use only for self-hosted apps (which have a receivedMessage()-listener containing a "goto"-handler).
      if ( iframeEl.src.startsWith( `https://${CONZEPT_HOSTNAME}` ) ){

        console.log( 'passing data 2: ', event.data.data.value );

        iframeEl.contentWindow.postMessage( { event_id: 'goto', data: [ event.data.data.value ] }, '*' );

      }

    }

  }
  else if ( event.data.event_id === 'run-slide-commands' ){

    // TODO: move this code to a function in "src/command/index.js"

    //$('#presentation').contents().find('div.reveal').focus();

    //stopSpeaking(); // stop global window speaking
    //$('#tts-article').remove(); // stop iframe-article speaking

    //console.log('run-slide-commands for slide: ', event.data.data.slide );
    //console.log( 'run slide commands: ', event.data.data.slide, explore.presentation_commands[ event.data.data.slide ] );

		$.each( explore.presentation_commands[ event.data.data.slide ] , function ( index, c ) {

			//console.log( c );

			const command = c[0];
			const view		= c[1];
			const data		= c[2];
			const first		= valid( c[3] )? c[3] : '';

      //console.log( command, view, data, first );

			if ( command === 'sparqlQueryCommand' ){
      
				//explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'sparqlQueryCommand', view, list, args ] );

        sparqlQueryCommand( first, view, data ); // FIXME: first should be named "args" here

        if ( view === 'sidebar' ){ // Wikidata-results in the sidebar

          explore.tabsInstance.select('tab-topics');

        }

      }
			else if ( command === 'show' ){

				if ( command === 'set' && view === 'language' ){

          setLanguage( data );

        }
        else if ( view === 'audio' || view === 'video' ){

          // do nothing (revealjs takes care of this)
          return 0;

        }
        else if ( view === 'audio-waveform' ){

          handleClick({ 
            id        : 'n1-0',
            type      : 'link',
            title     : explore.q,
            qid       : '',
            language  : explore.language,
            url       : first,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

        }
        else if ( view === 'youtube' ){

          handleClick({ 
            id        : 'n1-0',
            type      : 'link',
            title     : explore.q,
            qid       : '',
            language  : explore.language,
            url       : first,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

        }
				else if ( view === 'chemical' ){

          handleClick({ 
            id        : 'n1-0',
            type      : 'link',
            title     : explore.q,
            language  : explore.language,
            qid       : '',
            url       : `${explore.base}/app/molview/?cid=${ first.toString() }`,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

        }
				else if ( view === 'gdelt-country-news' ){

          // TODO

          // /app/gdelt/#api=geo&query=&sourcecountry=AL,AG&sourcelang=${ explore.language }&geomode=PointData&geotimespan=1d

        }
				else if ( view === 'gapminder-linechart' ){

          let iso3_codes = [];

          // get country iso3 code
          $.each( data, function ( index, qid ) {

            if ( valid( countries[qid] ) ){

              iso3_codes.push( '=' + countries[qid].iso3 + '&' );

            }

          });

          let codes = iso3_codes.join('').slice(0, -1).toLowerCase();

          if ( valid( codes ) ){

            handleClick({ 
              id        : 'n1-0',
              type      : 'link',
              title     : explore.q,
              language  : explore.language,
              qid       : '',
              url       : `https://www.gapminder.org/tools/#$model$markers$line$data$filter$dimensions$geo$/$or@$country$/$in@${ codes };;;;;;;;&encoding$selected$data$filter$markers@${ codes };;;;&y$data$concept=pop&space@=geo&=time;;&scale$type:null&domain:null&zoomed:null;;;;;;&chart-type=linechart&url=v`,
              tag       : '',
              languages : '',
              custom    : '',
              target_pane : 'p1',
            });

          }

        }

				else if ( view === 'topic' ){

          let l = explore.language;

          // check the optional provided language
          if ( valid( first ) ){

            l = first.toString();

            if ( explore.wp_languages.hasOwnProperty( l ) ){ // valid language-code

              setLanguage ( l );

            }

          }

					handleClick({ 
						id        : 'n1-0',
						type      : 'wikipedia-qid',
						title     : explore.q,
						qid       : data.toString(),
						language  : l,
						tag       : '',
						languages : '',
						custom    : '',
						target_pane : 'p1',
					});

				}
				else if ( view === 'link' || view === 'link-split' ){

					handleClick({ 
						id        : 'n1-0',
						type      : view,
						title     : explore.q,
						qid       : '',
						language  : explore.language,
						url       : data[0],
						tag       : '',
						languages : '',
						custom    : '',
						target_pane : 'p1',
					});

				}
				else if ( view === 'url' ){

          console.log('open the external URL: ', view, data );

          openInNewTab( decodeURI( data[0] ) );

				}
				else if ( view === 'pdf' ){

					handleClick({ 
						id        : 'n1-0',
						type      : 'link',
            title     : explore.q,
						qid       : '',
						language  : explore.language,
					  url       : `${explore.base}/app/pdf/?file=https://${ explore.host }/app/cors/raw/?url=${ data[0]  }#page=0&zoom=page-width&phrase=true&pagemode=thumbs`,
						tag       : '',
						languages : '',
						custom    : '',
						target_pane : 'p1',
					});

				}
				else if ( view === 'iiif' ){

					handleClick({ 
						id        : 'n1-0',
						type      : 'link',
            title     : explore.q,
						language  : explore.language,
					  url       : `${explore.base}/app/iiif/#?cv=&c=&m=&s=&manifest=${ encodeURIComponent( data[0] ) }`,
						tag       : '',
						languages : '',
						custom    : '',
						target_pane : 'p1',
					});

				}
				else if ( view === 'map3d' ){

          //console.log('map3d view');

          handleClick({ 
            id        : 'n1-0',
            type      : 'link',
            title     : explore.q,
            language  : explore.language,
            qid       : '',
            url       : `${explore.base}/app/map/?l=${explore.language}&qid=${data}`,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

          $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + first.toString() + '&dir=' + explore.language_direction + '&tags=&tutor=' + explore.tutor + '&embedded=' + explore.embedded + '#' + explore.hash });

        }
				else if ( view === 'linkgraph' ){

          handleClick({ 
            id        : 'n1-0',
            type      : 'link-split',
            title     : explore.q,
            language  : explore.language,
            qid       : '',
            url       : `${explore.base}/app/links/?l=${explore.language}&t=&q=${data}&title=${explore.q}`,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

          $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + first.toString() + '&dir=' + explore.language_direction + '&tags=&tutor=' + explore.tutor + '&embedded=' + explore.embedded + '#' + explore.hash });

        }
				else if ( view === 'ontology' ){

            handleClick({ 
              id        : 'n1-0',
              type      : 'link-split',
              title     : explore.q,
              language  : explore.language,
              qid       : '',
              url       : `${explore.base}/app/ontology/?lang=${explore.language}&q=${list[0].toString()}&rp=P279`,
              tag       : '',
              languages : '',
              custom    : '',
              target_pane : 'p1',
            });

            $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + first.toString() + '&dir=' + explore.language_direction + '&tags=&tutor=' + explore.tutor + '&embedded=' + explore.embedded + '#' + explore.hash });

        }
				else if ( view === 'chemistry' ){

          handleClick({ 
            id        : 'n1-0',
            type      : 'link',
            title     : explore.q,
            language  : explore.language,
            qid       : '',
            url       : `${explore.base}/app/molview/?cid=${first.toString()}`,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

        }
				else if ( view === 'compare' ){

          showCompare();

        }
				else if ( view === 'map3d-instance-of' ){

          showMapCompare();

        }
        else {

          handleClick({ 
            id        : 'n1-0',
            type      : 'link-split',
            title     : explore.q,
            language  : explore.language,
            qid       : '',
            url       : `${explore.base}/app/query/embed.html#SELECT%20%3Fitem%20%3FitemLabel%20%3Fdied%20%3Fborn%20%3Finception%20%3Fstart%20%3Fend%20%20%3Fimg%20%3Fcoordinate%20%3Fgeoshape%20WHERE%20%7B%0A%20%20VALUES%20%3Fitem%20%7B%20${ data }%20%7D%0A%20%20%3Fitem%20wdt%3AP31%20%3Fclass.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP18%20%3Fimg.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP625%20%3Fcoordinate.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP3896%20%3Fgeoshape.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP571%20%3Finception.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP569%20%3Fborn.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP570%20%3Fdied.%20%7D%20%20%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP580%20%3Fstart.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP581%20%3Fend.%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${ explore.language }%2Cen%22.%20%7D%0A%7D%0A%0A%23defaultView%3A${ view.charAt(0).toUpperCase() + view.slice(1) }%0A%23meta%3Alist%20of%20entities`,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

          $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + first.toString() + '&dir=' + explore.language_direction + '&tags=&tutor=' + explore.tutor + '&embedded=' + explore.embedded + '#' + explore.hash });

        }


			}
			else if ( command === 'say' ){

				if ( isQid( data ) ){

					startSpeakingArticle( '', data, explore.language );

				}
				else {

					startSpeaking( data );

				}

			}

		});

  }
  else if ( event.data.event_id === 'update-language-variant' ){

    console.log( 'update-language-variant', event.data.data );

    if ( valid( event.data.data.language_variant ) ){

      console.log( 'updating explore.language_variant to: ', event.data.data.language_variant );

      explore.language_variant = event.data.data.variant;

    }

  }
  else if ( event.data.event_id === 'update-jsonld' ){

    //console.log( 'update-jsonld triggered', event.data.data.fields );
    
    updateJSONLD( event.data.data.fields );

  }
  else if ( event.data.event_id === 'hash-change' ){

    // see also: https://gist.github.com/manufitoussi/7529fa882ff0b737f257
    //console.log('hash change signalled: ', event.data.data.hash );

    explore.hash = event.data.data.hash.replace(/#/g, '');;

    window.location.hash = explore.hash;

  }
  else if ( event.data.event_id === 'uls-close' ){
 
    // allow to hide the active ULS-widget, when clicking the wikipedia-content-pane 
    if( $('.grid.uls-menu').is(':visible') ){
      $('.active.uls-trigger').click();
    }

  }
  else if ( event.data.event_id === 'run-query' ){

    if ( valid( [ event.data.data.url, event.data.data.custom ] ) ){

      doGeospatialSearch( event.data.data.url, event.data.data.custom );

    }

  }
  else if ( event.data.event_id === 'structured-query' ){

    $('#structured-search').prop('checked', true).change();

    // NOTE: use this logging to see the used "Query Builder" data
    //console.log('structure query: ', event.data.data );

    // first-time fetch of SPARQL results
    if ( event.data.data.json_url !== '' ){ 

      //console.log( event.data.data.query_json, event.data.data.json_url );
      runQuery( event.data.data.query_json, event.data.data.json_url  );

    }

  }
  else if ( event.data.event_id === 'toggle-panel2' ){
    
		togglePanel2();

  }
  else if ( event.data.event_id === 'stop-parent-speaking' ){

    $('#tts-article').remove(); // stop iframe-article speaking

  }
  else if ( event.data.event_id === 'stop-all-speaking' ){

    stopSpeaking(); // stop global window speaking
    $('#tts-article').remove(); // stop iframe-article speaking

  }
  else if ( event.data.event_id === 'stop-all-audio' ){

    stopAllAudio();

  }
  else if ( event.data.event_id === 'toggle-wander-mute' ){ // used by the "wander" video app to prevent permanent audio-muting

    explore.vids_mute = explore.vids_mute ? false : true;

  }
  else if ( event.data.event_id === 'next-wander-video' ){

    if ( valid( explore.vids[ explore.vids_index + 1] ) ){ // we have a "next" video
      explore.vids_index += 1;

      resetIframe();
      $( explore.baseframe ).attr({"src": explore.base + `/app/video/?l=${explore.language}&wide=true&wander=true#/view/` + explore.vids[ explore.vids_index ] });

    }

  }
  else if ( event.data.event_id === 'previous-wander-video' ){

    if ( valid( explore.vids[ explore.vids_index - 1] ) ){ // we have a "previous" video

      explore.vids_index -= 1;

      resetIframe();
      $( explore.baseframe ).attr({"src": explore.base + `/app/video/?l=${explore.language}&wide=true&wander=true#/view/` + explore.vids[ explore.vids_index ] });

    }

  }

  else if ( event.data.event_id === 'add-to-compare' ){

    let qid = '';

    if ( event.data.data.qid !== '' ){ qid = event.data.data.qid; }

    if ( qid !== '' ){

      addToCompare( qid );
      showCompare();

    }

  }
  else if ( event.data.event_id === 'page-rendered' ){

    if ( explore.marks !== '' ){

      markSentences( explore.marks );
      explore.marks = ''; // reset marks

    }

		// TODO?: trigger pending fragment command
		// ..

  }
  else if ( event.data.event_id === 'show-loader' ){
    $('#blink').show();
  }
  else if ( event.data.event_id === 'hide-loader' ){
    $('#blink').hide();
  }
  else if ( event.data.event_id === 'next-presentation-slide' ){
    console.log( event.data.event_id );
  }
  //else if ( event.data.event_id === 'go-to-previous-slide' ){ // TODO
  //  console.log( event.data.event_id );
  //}
  //else if ( event.data.event_id === 'go-to-slide-n' ){ // TODO
  //  console.log( event.data.event_id );
  //}

  else if ( event.data.event_id === 'slide-to-previous' ){ // Swiper action (not presentation!)

    if ( explore.isMobile ){
      explore.swiper.slideTo( explore.swiper.activeIndex + 1);
    }

  }
  else if ( event.data.event_id === 'slide-to-next' ){		// Swiper action (not presentation!)

    if ( explore.isMobile ){
      explore.swiper.slideTo( explore.swiper.activeIndex - 1);
    }

  }
	else if ( event.data.event_id === 'move-to-sidebar' ){ // keyboard-navigation from content-pane: move-to-sidebar

  	if ( explore.isMobile === false ){ // this feature only available on desktop

			if ( $( '#' + explore.topic_cursor ).length ){ // topic exists

				if ( $( '#' + explore.topic_cursor ).css('display') === 'block' ){ // and is not hidden

          explore.tabsInstance.select('tab-topics');
					explore.topic_cursor = $( '#' + explore.topic_cursor ).attr('id');
					$( '#' + explore.topic_cursor + ' a').first().focus();

				}

			}

		}

	}
  else if ( event.data.event_id === 'scroll-to' ){

    let id = '';

    // get id
    if ( event.data.data.id !== '' ){
      id = event.data.data.id;
    }

    // show list tab
    //explore.tabsInstance.select('tab-list');

    // highlight id
    markArticle( id );

    // scroll to ID
    $('#' + id).get(0).scrollIntoView({behavior: "auto", block: 'start'});
    //setTimeout(() => { $('#tab-list')[0].scrollBy(0, -120) }, 100); // TODO: the y-value probably needs some adjusting on other platforms

  }
  else if ( event.data.event_id === 'remove-compare-items' ){

    explore.compares = [];

  }
  else if ( event.data.event_id === 'remove-compare-item' ){

    if ( event.data.data.mygid !== '' ){

      const index = explore.compares.indexOf( event.data.data.mygid.trim() );

      if (index !== -1) {
        explore.compares.splice(index, 1);
      }

    }

  }
  else if ( event.data.event_id === 'toggle-sidebar' ){

    toggleSidebar();

  }
  else if ( event.data.event_id === 'add-bookmark' ){

    if ( event.data.data.language !== '' ){

      addBookmark(event, 'clicked', false, event.data.data.language );

    }
    else {

      addBookmark(event, 'clicked', false );

    }

  }
  else if ( event.data.event_id === 'remove-bookmark' ){

    console.log( event.data.data.id );

    if ( event.data.data.id !== '' ){

      removeBookmark( event, event.data.data.id )

    }

  }

}

function setLanguageDirection(){

  const rtl_scripts = [ 'arab', 'hebr', 'syrc', 'nkoo', 'thaa' ];

  // set direction
  if ( rtl_scripts.includes( explore.language_script.trim().toLowerCase() ) ){  // right-to-left

    explore.language_direction = 'rtl';

    if ( explore.language_direction !== explore.splitter_direction ){

      explore.splitter_direction = explore.language_direction;

      // #doc | .vsplitter | #sidebar
      // move "doc" before "sidebar"
      $('#doc').insertBefore(".vsplitter");
      $('#sidebar').insertAfter(".vsplitter");

    }

    // FIXME: temporary style-fix (until a better fix is found)
    $('#clearSearch').hide();
   
  } 
  else { // left-to-right

    explore.language_direction = 'ltr';

    if ( explore.language_direction !== explore.splitter_direction ){

      explore.splitter_direction = explore.language_direction;

      // #sidebar | .vsplitter | #doc
      $('#sidebar').insertBefore(".vsplitter");
      $('#doc').insertAfter(".vsplitter");

    }

    // FIXME: temporary style-fix (until a better fix is found)
    $('#clearSearch').show();

  }

}

function renderLanguageDirection(){

  //console.log('script direction: ', explore.language_script , explore.language_direction,  explore.language );

  if ( explore.language_direction === 'rtl' ){

    updateValueInPanes( 'rtl', true );

  }

  $('body').removeClass( [ 'ltr', 'rtl'] ); // reset
  $('body').addClass( explore.language_direction );

  // TODO: also set the direction in any explore-split-frame
  if ( explore.windowName === 'infoframeSplit2' ){ // request from secondary content iframe

    $('#infoframeSplit2').contents().find('body').addClass( explore.language_direction );
    $('#infoframeSplit2').contents().find('main').css({ 'direction' : explore.language_direction  });
    $('#infoframeSplit2').contents().find('aside').css({ 'direction' : explore.language_direction  });

  }
  else {

    $( 'body').css({ 'direction' : explore.language_direction });

    $( explore.baseframe ).contents().find('body').addClass( explore.language_direction );

    // FIXME this is not yet working
    $( explore.baseframe ).contents().find('main').css({ 'direction' : explore.language_direction });
    $( explore.baseframe ).contents().find('aside').css({ 'direction' : explore.language_direction });
 
  }

  //console.log( 'rendering language direction with: ', explore.language_direction );

}

function setLanguage( language ){

  if ( !valid( language ) || language === explore.language ){ return 0; }

  // change language settings
  explore.language    = window.language = language;
  explore.lang3       = getLangCode3( explore.language );
  explore.voice_code  = getVoiceCode( explore.language );

  // store language settings
  (async () => { await explore.db.set('language', explore.language ); })();

  // set ULS-widget language display
  explore.language_name = ( explore.language === 'en') ? 'English' : getNamefromLangCode2( explore.language )

  updateLocaleNative();

  setLanguageDirection();

  afterLanguageUpdate();

}

async function afterLanguageUpdate(){

  // HTML page
  $('html').attr('lang', explore.language );

  //TODO: do this via some JS API for ULS
  $( '.uls-trigger' ).html( '<span class="icon"><i class="fa-solid fa-caret-right"></i></span> &nbsp; <span title="' + explore.language_name + '" aria-label="' + explore.language_name + '" role="button">' + getNamefromLangCode2( explore.language ) + '</span>' );

  updateQueryBuilder();

  setupOptionActiveDatasources();

  // update show-live-edits link
  // TODO: call function (too avoid code duplication)
  $('li#show-live-edits').html('<a href="https://wikistream.toolforge.org/#namespace=article&wiki=' + explore.language + '.wikipedia" target="infoframe" title="Wikipedia edits liveive" aria-label="Wikipedia edits live" role="button"><i class="fa-solid fa-edit"></i> &nbsp; Wikipedia edits live</a>');

}

function markArticle( id, type ){

  $('.entry.active').removeClass('active'); // remove old highlight
  $('.entry#' + id ).addClass('active');    // make entry active

}

function toggleSidebar() {

  if ( explore.isMobile === false ){ // this feature only available on desktop

    if ( explore.windowName === 'infoframeSplit2' ){ // request from secondary content iframe

      window.parent.postMessage({ event_id: 'toggle-sidebar', data: { } }, '*' );

    }
    else {

      // store previous state, so we can detect URL-history changes for this field
      explore.show_sidebar_prev = explore.show_sidebar;

      if ( explore.splitter.position() <= 2) { // show sidebar

        explore.show_sidebar = true;

        if ( typeof explore.splitterWidth === 'undefined' ){
          explore.splitterWidth = 25;
        }

        refreshSplitter( explore.splitterWidth );
        $('div.sticky').css({ 'width' : explore.splitter.position() });

      }
      else { // hide sidebar

        explore.show_sidebar = false;
        explore.splitterWidth = 100 * ( explore.splitter.position() / $(window).width() ) ;
        refreshSplitter(0);
      }

      updatePushState( explore.q, 'add' );

    }

    resizeEmbeddedSplitter();

  }

}

function toggleFullscreen() {

	if ( screenfull.enabled ) {

    if ( explore.windowName === 'infoframeSplit2' ){ // request from secondary content iframe
      window.parent.postMessage({ event_id: 'toggle-fullscreen', data: { } }, '*' );
    }
    else {
		  screenfull.toggle();
    }

	}

}

function refreshSplitter( perc ){

  explore.splitter.position( perc + '%');
  explore.splitter.refresh();

}

function resizeEmbeddedSplitter( ){

  // if there is a splitframe: send a message for resizing the framewrap
  let iframeEl = window.frames.infoframeSplit1;

  if ( valid( iframeEl ) ){

    explore.embedded_splitter.width('100%');
    explore.embedded_splitter.height('100%');
    explore.embedded_splitter.refresh();
    explore.embedded_splitter.position( explore.embedded_splitter_left_width + '%');

  }

  if ( getGridColumns('#results') === 1 ){ // remove topic-card borders in 1-column mode
    $('.sidebar-grid-item').removeClass( 'bordered' );
  }
  else {
    $('.sidebar-grid-item').addClass( 'bordered' );
  }

}

function setupSplitter( perc ){

	const w = window.innerWidth;
	const h = window.innerHeight;

  // see: https://github.com/jcubic/jquery.splitter
  explore.splitter = $('#splitter').width( w ).height( h ).split({

    orientation: 'vertical',
    position: perc + '%',
    limit: 0,

    onDrag: function(event) {

      $('div.sticky').css({ 'width' : explore.splitter.position() });

      resizeEmbeddedSplitter();
      
    }

  });

}

function identifyOther() {

  /*
  handleClick({ 
    id        : 'n1-0',
    type      : 'link-split',
    title     : '',
    language  : explore.language,
    qid       : '',
    url       : encodeURI( explore.base + '/app/visual-identification/index.php?l=' + explore.language ),
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });
  */

  handleClick({ 
    id        : 'n1-0',
    type      : 'link',
    title     : '',
    language  : explore.language,
    qid       : '',
    //url       : encodeURI( 'https://reverseimage.net' ),
    url       : encodeURI( 'https://www.bing.com/visualsearch' ),
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });

}

function identifyPlant( ) {

  handleClick({ 
    id        : 'n1-0',
    type      : 'link-split',
    title     : '',
    language  : explore.language,
    qid       : '',
    url       : encodeURI( explore.base + '/app/plantnet/index.php?l=' + explore.language ),
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });

}

function identifyOCR( ) {

  handleClick({ 
    id        : 'n1-0',
    type      : 'link-split',
    title     : explore.q,
    language  : explore.language,
    qid       : '',
    url       : encodeURI( explore.base + '/app/ocr/?l=' + explore.language + '&lang3=' + explore.lang3 ),
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });

}


/* bookmark functions */

function createBookmarkId() {
  return 'b' + Math.random().toString(36).substring(6);
};


function bookmarkAllowDrop(event) { // "something is being dragged and could get dropped"
  event.preventDefault();
}

function exploreBookmark(event, id) { 

  event.preventDefault();
  event.stopPropagation();

  let node = $('#tree').tree('getNodeById', id );

  let datasource = valid( node.datasource ) ? node.datasource : '';

  if ( valid( datasource ) ){

    updateActiveDatasources( [ datasource ]  );

  }
  else {

    updateActiveDatasources( [ 'wikipedia' ]  ); // fallback

  }
  

  handleClick({ 
    id        : 'n1-0',
    type      : 'explore',
    title     : node.name,
    language  : node.language,
    source    : datasource,
    qid       : '',
    url       : '',
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });

}

function deselectAllBookmarks( event ){

  event.preventDefault();

  // get selected bookmarks
  let bookmarks = $('#tree').find('a.bookmark-select.selected')

  let nodes = [];

  $.each( bookmarks, function( index, b ){ // for each selected bookmark

    nodes.push( $(b).attr('data-node-id') );

  });

  $.each( nodes, function( index, id ){ // for each node ID

    // mark each child-bookmark with the same state

    let el = $('#bookmarks li#' + id );

    el.find('a.bookmark-select i').removeClass('fa-square-check').addClass('fa-square');
    el.find('a.bookmark-select').removeClass('selected');

    let child_node = $('#tree').tree('getNodeById', id );
    child_node.selected = false;

  });

  // store bookmark state
  (async () => {

    await explore.db.set('bookmarks', $('#tree').tree('toJson') );

    // update current bookmarks data structure
    explore.bookmarks = await explore.db.get('bookmarks');
    explore.bookmarks = JSON.parse( explore.bookmarks );

    // update the bookmark-view in any other Conzept tabs
    explore.broadcast_channel.postMessage('update_bookmark_view');

    updateSelectedBookmarksCounter();

  })();

}

function selectBookmark( event, id ) { 

  event.preventDefault();

	if ( id !== 1 ){

    let bookmark	= $('#tree').tree('getNodeById', id );

    let el				= $('#bookmarks li#' + id );

    // check select status
    if ( valid( bookmark.selected ) ){ // turn off

      bookmark.selected = false; // clicked bookmark

			// mark each child-bookmark with the same state

			el.find('a.bookmark-select i').removeClass('fa-square-check').addClass('fa-square');
      el.find('a.bookmark-select').removeClass('selected');

			el.find('li').each(function( index ) {

				let child_node = $('#tree').tree('getNodeById', $(this).attr('id') );
				child_node.selected = false;

			});

    }
    else { // turn on

      bookmark.selected = true; // clicked bookmark

			// mark each child-bookmark with the same state

			el.find('a.bookmark-select i').removeClass('fa-square').addClass('fa-square-check');
      el.find('a.bookmark-select').addClass('selected');

			el.find('li').each(function( index ) {

				let child_node = $('#tree').tree('getNodeById', $(this).attr('id') );
				child_node.selected = true;

			});

    }

    // store bookmark state
    (async () => {

      await explore.db.set('bookmarks', $('#tree').tree('toJson') );

      // update current bookmarks data structure
      explore.bookmarks = await explore.db.get('bookmarks');
      explore.bookmarks = JSON.parse( explore.bookmarks );

      // update the bookmark-view in any other Conzept tabs
			explore.broadcast_channel.postMessage('update_bookmark_view');

      updateSelectedBookmarksCounter();

    })();

	}

}

function removeBookmark( event, id ) { 

  event.preventDefault();

	if ( id !== 1 ){ // never remove root node
		$('#tree').tree('removeNode', $('#tree').tree('getNodeById', id ) );

    (async () => {

  	  await explore.db.set('bookmarks', $('#tree').tree('toJson') );

      // update current bookmarks data structure
      explore.bookmarks = await explore.db.get('bookmarks');

      updateSelectedBookmarksCounter();

    })();

	}

}

function exportAppendBookmarks( output, b ){

  //console.log( 'data: ',  b );

  if ( valid( b.name ) ){

    let pattern = /^((http|https):\/\/)/;
    let url     = '';

    // detect bookmark type
    if ( pattern.test( b.url ) ) { // url

      url = b.url;

    }
    else { // Conzept search-string

      url = 'https://' + explore.host + explore.base + '/explore/' + encodeURIComponent( b.name ) + '?l=' + b.language + '&t=string' + '#';

    }

    let obj = {

      'id':       b.id,
      'name':     b.name,
      'type':     b.type,
      'url':      url,
      'language': b.language,
      'desc':     '',

    };

    if ( valid( b.geo ) ){

      obj.loc = [ b.geo.split(';')[0], b.geo.split(';')[1] ];

    }

    output.push( obj );

  }

  if ( valid( b.children ) ){

    b.children.forEach(( b2, index ) => {

      exportAppendBookmarks( output, b2 );

    });

  }

}

function outputBookmarksHTML( output ){

  let html = '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8"> <meta http-equiv="Content-Security-Policy" content="default-src "self"; script-src "none"; img-src data: *; object-src "none""></meta><title>Conzept bookmarks</title><DL><p>';

  output.forEach(( b, index ) => {

    html += `<DT><A HREF="${ b.url }">${ b.name }</A></DT>`;

  });

  html += '</DL>';

  return html;

}

function outputBookmarksKML( output ){

  const date = new Date().toISOString();

  let kml = `<?xml version="1.0" encoding="UTF-8"?> <kml xmlns="http://earth.google.com/kml/2.2"> <Document> <Style id="placemark-red"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-red.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-blue"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-blue.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-purple"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-purple.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-yellow"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-yellow.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-pink"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-pink.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-brown"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-brown.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-green"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-green.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-orange"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-orange.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-deeppurple"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-deeppurple.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-lightblue"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-lightblue.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-cyan"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-cyan.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-teal"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-teal.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-lime"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-lime.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-deeporange"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-deeporange.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-gray"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-gray.png</href> </Icon> </IconStyle> </Style> <Style id="placemark-bluegray"> <IconStyle> <Icon> <href>https://omaps.app/placemarks/placemark-bluegray.png</href> </Icon> </IconStyle> </Style> <name>Conzept bookmarks</name> <visibility>1</visibility> <ExtendedData xmlns:mwm="https://omaps.app"> <mwm:name> <mwm:lang code="default">Conzept bookmarks</mwm:lang> </mwm:name> <mwm:annotation> </mwm:annotation> <mwm:description> </mwm:description> <mwm:lastModified>${date}</mwm:lastModified> <mwm:accessRules>Local</mwm:accessRules> </ExtendedData>`;

  output.forEach(( b, index ) => {

    if ( valid( b.loc ) ){

      kml += `
        <DT><A HREF="${ b.url }">${ b.name }</A></DT>`;

      const geo_point = `<Point><coordinates>${ b.loc[1] },${ b.loc[0] }</coordinates></Point>`;

      kml += `
        <Placemark>
          <name>${ b.name }</name>
          <TimeStamp><when>${ date } </when></TimeStamp>
          <styleUrl>#placemark-red</styleUrl>
          ${geo_point}
          <ExtendedData xmlns:mwm="https://omaps.app">
            <mwm:name>
              <mwm:lang code="default">${ b.name }</mwm:lang>
              <mwm:lang code="${ b.language }">${ b.name }</mwm:lang>
            </mwm:name>
            <mwm:featureTypes>
              <mwm:value>tourism-attraction</mwm:value>
            </mwm:featureTypes>
            <mwm:scale>17</mwm:scale>
            <mwm:icon>Sights</mwm:icon>
            <mwm:visibility>1</mwm:visibility>
          </ExtendedData>
        </Placemark>
      `;

    }

  });

  kml += '</Document></kml>';

  kml = kml.replace(/&/g, '&amp;');

  return kml;

}

function outputBookmarksGPX( output ){

  const date = new Date().toISOString();

  let gpx = `<?xml version="1.0" standalone="yes"?>
  <gpx xmlns="http://www.topografix.com/GPX/1/1" creator="KML2GPX.COM" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
    <metadata>
        <name><![CDATA[Conzept bookmarks]]></name>
        <desc><![CDATA[Waypoints export ${date}]]></desc>
                </metadata>
`;

  output.forEach(( b, index ) => {

    let geo_point = '';

    if ( valid( b.loc ) ){

      geo_point = ` lat="${ b.loc[0] }" lon="${ b.loc[1] }"`;

      gpx += `
      <wpt ${geo_point}>
          <ele>0</ele>
          <name><![CDATA[${ b.name }]]></name>
          <cmt><![CDATA[Waypoint no: ${index}]]></cmt>
          <desc><![CDATA[This is waypoint no: ${index} (${ b.language })]]></desc>
      </wpt>
      `

    }

  });

  gpx += '</gpx>';

  gpx = gpx.replace(/&/g, '&amp;');

  return gpx;

}

function handleJSONSubmit(event) {

	// Stop the form from reloading the page
	event.preventDefault();

	let file = document.querySelector('#json-file');

	// If there's no file, do nothing
	if ( !file.value.length ) return;

	// Create a new FileReader() object
	let reader = new FileReader();

	// Read the file
	reader.readAsText( file.files[0] );

  reader.onload = (e) => {

    let json = e.target.result;

		// TODO: check if this is a valid jqTree JSON-bookmark file
		// ...

    const old_json = JSON.parse( $('#tree').tree('toJson') );

    $('#tree').tree('loadData', old_json.concat( JSON.parse( json ) ) );

    (async () => {

      await explore.db.set('bookmarks', $('#tree').tree('toJson') );

      // update the bookmark-view in any other Conzept tabs
			explore.broadcast_channel.postMessage('update_bookmark_view');

    })();

    // update current bookmarks data structure
    explore.bookmarks = json;

    updateSelectedBookmarksCounter();

  };

}

function updateSelectedBookmarksCounter(){

	let topics = []; // list of topics

	const obj = $('#tree').tree('getTree');

	if ( valid( obj.children ) ){

		obj.children.forEach(( b, index ) => {

			exportSelectedBookmarkTopics( topics, b );

		});

	}

  //console.log( topics );

  $('#bookmark-selection-count').text( topics.length );

}

function exportAllBookmarkTopics( output, b ){

  //console.log( 'data: ',  b );

  if ( valid( b.name ) ){

    output.push( b.name );

  }

  if ( valid( b.children ) ){

    b.children.forEach(( b2, index ) => {

      exportAllBookmarkTopics( output, b2 );

    });

  }

}

function exportSelectedBookmarkTopics( output, b ){

  //console.log( 'data: ',  b );

  if ( valid( b.name && valid( b.selected ) ) ){

    output.push( b.name );

  }

  if ( valid( b.children ) ){

    b.children.forEach(( b2, index ) => {

      exportSelectedBookmarkTopics( output, b2 );

    });

  }

}

function exportBookmarkQids( output, b ){

  //console.log( 'data: ',  b );

  if ( valid( b.qid && valid( b.selected ) ) ){

    output.push( b.qid );

  }

  if ( valid( b.children ) ){

    b.children.forEach(( b2, index ) => {

      exportBookmarkQids( output, b2 );

    });

  }

}

function checkSelectedBookmarks( action ){

	let topics = []; // list of topics

	const obj = $('#tree').tree('getTree');

	if ( valid( obj.children ) ){

		obj.children.forEach(( b, index ) => {

			exportSelectedBookmarkTopics( topics, b );

		});

	}

	//console.log( topics.length, topics );

}


function getQidsFromBookmarks(){

  let qids = [];

  const obj = $('#tree').tree('getTree');

  if ( valid( obj.children ) ){

    obj.children.forEach(( b, index ) => {

      exportBookmarkQids( qids, b );

    });

  }

  explore.compares = [];

  qids.forEach(( qid, index ) => {

    qid = qid.trim();

    if ( !qid.startsWith('Q') ){
      qid = 'Q' + qid; // add 'Q' to qid-string
    }

    qids.push( qid );

  });

  return [...new Set( qids )]; // use only the unique values

}

function runBookmarkAction( action ){

  /*
  if ( action === 'compare' ){

    explore.compares = getQidsFromBookmarks();

    showCompare();

  }
  */

  if ( action.startsWith( 'command-' ) ){ // command API action

    action = action.replace('command-', '');

    let qids = getQidsFromBookmarks();

    if ( qids.length > 0 ){

      let command = '';

      if ( action === 'video' || action === 'web' ){ // search-based commands

        command = `(search '${action} '( ${ qids.join(' ') } ) )`;

      }
      else { // default command mode

        command = `(show '${action} '( ${ qids.join(' ') } ) )`;

      }

      console.log( command );

      runLISP( command );

    }
    else { // no qids found

      $.toast({
        heading: 'no Wikidata Qid\'s found for these topics',
        //heading: explore.banana.i18n('app-notification-too-few-compare-topics'),
        text: '',
        hideAfter : 10000,
        stack : 1,
        showHideTransition: 'slide',
        icon: 'info'
      })

    }

  }
  else if ( action.startsWith( 'video' ) ){

    let topics = []; // list of topics

    const obj = $('#tree').tree('getTree');

    if ( valid( obj.children ) ){

      obj.children.forEach(( b, index ) => {

        exportSelectedBookmarkTopics( topics, b );

      });

    }

    //console.log( topics );

    handleClick({ 
      id        : 'n1-0',
      type      : 'link',
      title     : topics.join(', '),
      language  : explore.language,
      qid       : '',
      url       : encodeURI( `https://${explore.host}/app/video/?l=${explore.language}#/search/${ topics.join(', ') }` ),
      tag       : '',
      languages : '',
      custom    : '',
      target_pane : 'p1',
    });

  }
  else if ( action.startsWith( 'openlibrary' ) ){

    let topics = []; // list of topics

    const obj = $('#tree').tree('getTree');

    if ( valid( obj.children ) ){

      obj.children.forEach(( b, index ) => {

        exportSelectedBookmarkTopics( topics, b );

      });

    }

    //console.log( topics );

    handleClick({ 
      id        : 'n1-0',
      type      : 'link',
      title     : topics.join(', '),
      language  : explore.language,
      qid       : '',
      url       : encodeURI( `https://openlibrary.org/search?q=${ topics.join(', ') }&language=${explore.lang3}` ),
      tag       : '',
      languages : '',
      custom    : '',
      target_pane : 'p1',
    });

  }
  else if ( explore.tutors.includes( action ) ){

    // collect bookmark titles
    //const json = $('#tree').tree('toJson');
    //console.log( json );

    let topics = []; // list of topics

    const obj = $('#tree').tree('getTree');

    if ( valid( obj.children ) ){

      obj.children.forEach(( b, index ) => {

        exportSelectedBookmarkTopics( topics, b );

      });

    }

    //console.log( topics );

    let m = JSON.stringify( topics );

    handleClick({ 
      id        : 'n1-0',
      type      : 'link-split',
      title     : topics.join(', '),
      language  : explore.language,
      qid       : '',
      url       : encodeURI( `${explore.base}/app/chat/?m=${m}&l=${explore.language}&t=${action}` ),
      tag       : '',
      languages : '',
      custom    : '',
      target_pane : 'p1',
    });

  }

} 

function exportBookmarks( format ){

  // formats: html, kml, gpx, ...

  let output = [];

  if ( format === 'html' ){

    const obj = $('#tree').tree('getTree');

    if ( valid( obj.children ) ){

      obj.children.forEach(( b, index ) => {

        exportAppendBookmarks( output, b );

      });

      //console.log( output );

      const data = outputBookmarksHTML( output );

      writeToFile( data, format, 'bookmarks.html');

    }

  }
  else if ( format === 'kml' ){

    const obj = $('#tree').tree('getTree');

    if ( valid( obj.children ) ){

      obj.children.forEach(( b, index ) => {

        exportAppendBookmarks( output, b );

      });

      //console.log( output );

      const data = outputBookmarksKML( output );

      writeToFile( data, format, 'bookmarks.kml');

    }

  }
  else if ( format === 'gpx' ){

    const obj = $('#tree').tree('getTree');

    if ( valid( obj.children ) ){

      obj.children.forEach(( b, index ) => {

        exportAppendBookmarks( output, b );

      });

      //console.log( output );

      const data = outputBookmarksGPX( output );

      writeToFile( data, format, 'bookmarks.gpx');

    }

  }
  else if ( format === 'json' ){

    const json = $('#tree').tree('toJson');

    writeToFile( json, format, 'bookmarks.json');

  }

}

const writeToFile = (text, format, fileName) => {

  let textFile = null;

  const makeTextFile = (text) => {

    let type = '';

    if ( format === 'kml' ){
      type = 'application/vnd.google-earth.kml+xml';
    }
    else if ( format === 'html' ){
      type = 'text/html';
    }
    else if ( format === 'gpx' ){
      type = 'application/gpx+xml';
    }
    else if ( format === 'json' ){
      type = 'application/json';
    }
    else {
      type = 'text/plain';
    }

    const data = new Blob( [text], { 'type': type, } );

    if (textFile !== null) {
      window.URL.revokeObjectURL( textFile );
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;

  };

  const link = document.createElement('a');

  link.setAttribute('download', fileName);
  link.href = makeTextFile(text);
  link.click();

};

function updateBookmarks(){ // TODO

	return 0;

	// remove old bookmark tree
	//$('#tree').empty();

	// get new bookmark data
	(async () => {

		// update current bookmarks data structure
		explore.bookmarks = await explore.db.get('bookmarks');
		explore.bookmarks = JSON.parse( explore.bookmarks );

	})();

	// render bookmarks again
  renderBookmarks();

}

function addBookmark( e, action_type, bookmark_current_view, lang ){

  // TODO: implement bookmark-removal (if this bookmark already exists)
  // removeBookmark( event, node.id )

  if ( typeof e === undefined || typeof e === 'undefined' ){
    // do nothing
  }
  else {
    e.preventDefault();
  }

  if ( explore.windowName === 'infoframeSplit2' ){ // request from secondary content iframe
    // TODO
    //window.parent.postMessage({ event_id: 'toggle-fullscreen', data: { } }, '*' );
    //$('#blink').hide();
  }
  else {

    let language_   = valid( lang )? lang : explore.language;

    let link_       = $( explore.baseframe ).attr('src') || ''; // default link-data

    let title_      = decodeURIComponent( explore.curr_title ) || explore.q || '';
    //let display_    = title_ + ' (' + language_ +')';

    let geo_        = '';
    let qid         = ''; // wikidata ID
    let gid         = ''; // general datasource ID
    let datasource  = '';
    let tags        = '';
    let images      = [];

    let type        = explore.type;

    bookmark_current_view = valid( bookmark_current_view )? true : false;

    const video     = '\/video\/';

    if ( link_.match( video, 'g') ){ // video link
      type = 'video';
    }

    if ( explore.custom?.lat ){ // we have a geo-coordinate

      geo_ = explore.custom.lat + ';' + explore.custom.lon;

    }

    if ( event.data?.data?.qid ){

      qid = event.data.data.qid;

    }
    else if ( valid( explore.qid ) ){ // TODO: check if this works correctly

      qid = explore.qid;

    }

    if ( event.data?.data?.gid ){

      gid = event.data.data.gid;

    }

    if ( event.data?.data?.tags ){

      tags = event.data.data.tags;

      //console.log('tag data: ', tags );

    }

    //console.log( event.data );

    if ( event.data?.data?.datasource ){

      datasource = event.data.data.datasource;

    }

    if ( event.data?.data?.images ){

      images = event.data.data.images;

      console.log('bookmark images event data: ', images );

    }

    // override link-data for non-Wikipedia datasource items
    if ( valid( datasources[ datasource ]) && datasource !== 'wikipedia' ){ // some other datasource title / ID

      // URL-substitution variables
      // Note: "qid" and "gid" were already defined above.
      let language    = language_;

      let url_format  = datasources[ datasource ].display_url;
      link_           = eval(`\`${ url_format }\``);

    }

    if ( type === 'string' || type === 'explore' || type === 'articles' || type === 'bookmark' || type === '' ){

      link_     = title_;
      type      = 'string';

    }
    else if ( type === 'video'){

      link_ = $( explore.baseframe )[0].contentWindow.location.href || '';

    }
    else if ( type === 'books' ){
      type = 'book';
    }
    else if ( type === 'music' || type === 'musescore' ){
      type = 'music';
    }
    else if ( type === 'imagescc' ){
      type = 'images';
    }
    else if ( type === 'compare' ){
      type = 'compare';
    }

    // modify data based on action-context
    if ( action_type === 'extension' ){

      // XXX
      const data = JSON.parse( decodeURIComponent( explore.custom ) );

      // URL, text-selection
      // -> https://example.com/#:~:text=for

      console.log( data.url, data.text );

      explore.custom = ''; // reset custom value

      title_    = data.text;
      //display_  = data.text;
      link_     = data.url + '#:~:text=' + data.text;
      type      = 'url';

      console.log( display_, link_ );

    }

    // modify data based on action-context
    if ( bookmark_current_view ){

      link_ = valid( getParameterByName('u') )? getParameterByName('u') : '';

      if ( ! valid( link_ ) ){ // assume Wikipedia topic

        link_ =  'https://' + explore.host + explore.base + '/app/wikipedia/?t=' + title_ + '&l=' + language_ + '&qid=' + qid + '#' + explore.hash;

      }

      if ( ! link_.startsWith('http') ){ // make link fully-qualified

        link_ = 'https://' + explore.host + link_;

      }

    }

    if ( action_type === 'dropped' ){

      const parent_id = event.target.parentNode.id;

      const new_id = createBookmarkId();

      $('#tree').tree( 'appendNode', {
        name:         title_,
        //display:      display_,
        url:          link_,
        id:           new_id,
        language:     language_,
        type:         type,
        geo:          geo_,
        qid:          qid,
        gid:          gid,
        selected:     false,
        datasource:   datasource,
        images:       images,
      }, $('#tree').tree('getNodeById', parent_id  ) );

    }
    else { // default bookmark add

      if ( title_ !== '' && type !== '' ){

        const new_id = createBookmarkId();

        $('#tree').tree( 'appendNode', {
          name:       title_,
          //display:    display_,
          url:        link_,
          id:         new_id,
          language:   language_,
          type:       type,
          geo:        geo_,
          qid:        qid,
          gid:        gid,
          tags:       tags,
          selected:   false,
          datasource: datasource,
          images:     images,
        });

        if ( !explore.isMobile ){

          $.toast({
            heading: '<span class="icon"><i class="fa-solid fa-bookmark" title="bookmarks"></i></span> &nbsp; bookmark added',
            text: type + ' : ' + title_ ,
            hideAfter : 5000,
            showHideTransition: 'slide',
            icon: 'success'
          })

        }

        $('#tab-head-bookmarks').delay(100).fadeOut(500).fadeIn(300).fadeOut(500).fadeIn(300);

      }

    }

    storeCurrentBookmarks();

    $('#blink').hide();
  }

}

function storeCurrentBookmarks(){

  (async () => {

    await explore.db.set('bookmarks', $('#tree').tree('toJson') );

    // update current bookmarks data structure
    explore.bookmarks = await explore.db.get('bookmarks');
    explore.bookmarks = JSON.parse( explore.bookmarks );

    // update the bookmark-view in any other Conzept tabs
    explore.broadcast_channel.postMessage('update_bookmark_view');

  })();

}

function determineWidthSplitter(){

  if ( !explore.show_sidebar && !explore.isMobile ){ // show_sidebar is false AND we are in desktop mode

    if ( explore.windowName === 'infoframeSplit2' ){ // request from secondary content iframe

      // hide left-pane
      $('#sidebar').hide();

      // add a maximize-window-button in the infoframeSplit2 window
      $('body').prepend('<a href="javascript:void(0)" id="fullscreenToggle" onclick="screenfull.toggle()" class="global-actions"><i id="fullscreenIcon" title="fullscreen toggle [f-key]" class="fa-solid fa-expand"></i></span></a>');

      return 0;

    }
    else { // request from primary content iframe

      setupSplitter(0);
      return 0;

    }

  }

	const w = $(window).width();

	if ( w < 700 ) { // TODO: use mobile functionality?
		setupSplitter(50);
	}
	else if ( w < 900 ) {
		setupSplitter(40);
	}
	else if ( w < 1300 ) {
		setupSplitter(33);
	}
	else if ( w < 1650 ) {
		setupSplitter(28);
	}
	else if ( w < 2000 ) {
		setupSplitter(25);
	}
	else if ( w > 3500 ) {
		setupSplitter(10);
	}
	else {
		setupSplitter(20);
	}

}

function refreshArticles(){

	explore.q = getSearchValue();

  // set language to 'en' if none was set: hack to fix 'undefined' language when going back to the explore-homepage
  if ( explore.language === undefined || explore.language === 'undefined' ){
    explore.language = window.language = 'en';
  }

  // store hash from URL, for later use
  const hash_ = ( explore.hash !== '') ? explore.hash : '';
 
  if ( explore.replaceState ){

    // force-merge to 'string' type when refreshing articles, as that is the only type that can output anything in the content-pane later
    if ( explore.type === 'explore' || explore.type === 'articles' || explore.type === '' ){

      explore.type = 'string';

    }

    // build an object of URL-parameters from the current state
    updatePushState( explore.q , 'replace' );

  }

  $('#detail-result-summary').hide();
	$('#results').empty();
  $('#total-results').empty();
  $('#scroll-end').hide();

  loadTopics( false );

}

function loadTopics( nextpage ){

  if ( nextpage ){ // request for the next page of results

    $.each( explore.datasources, function( index, source ){ // for each active datasource

      // check if we should fetch more results
      if ( valid( datasources[ source ].done ) ){ // datasource already marked as "done"

        console.log('datasource already marked as "done"');

        // do nothing
      }
      else if ( valid( datasources[ source ].total ) ){ // total results available

        if ( ( explore.page - 1 ) * datasources[ source ].pagesize < datasources[ source ].total ){ // more to fetch for this datasource

          datasources[ source ].done = false;

        }
        else { // no more to fetch

          console.log( 'loadTopics: no more to fetch...', datasources );

          datasources[ source ].done = true;

        }
    
      }
      else { // without a total count: no more results to fetch

        console.log('hmm, no total count was found');
        datasources[ source ].done = true;

      }

    });
  
  }
  else { // first page

    $.each( explore.datasources, function( index, source ){ // for each active datasource

      datasources[ source ].done = false; // fetch results

    });

  }

  //console.log( datasources );

  // TODO: handle any cases of "no results found"

  fetchDatasources().then(( ret ) => {

    let struct  = ret[0];
    let data    = ret[1];

    let my_promises = [];

    // collect promise functions
    data.forEach(( r, index ) => {

      //console.log( struct[ index ].name, struct[ index ].count );

      if ( struct[ index ].count ){ // skip count-query data
        // do nothing
      }
			else {

				let d = datasources[ struct[ index ].name ];

				if ( valid( d.code_data_collect ) ){

					let topicResults = data[index];

					eval( `${ d.code_data_collect }` );

				}

			}

    });

    let renderObject = {};

    // call and resolve all my promise functions
    Promise.allSettled( my_promises )

      .then( (results) => results.forEach( ( result, index ) => {

        //console.log( 'results: ', results );

        // determine source name
        let name = '';

        if ( valid( result.value[0]?.source ) ){

          name = result.value[0].source.data.continue.source;

        }
        else { // wikipedia struct

          name = 'wikipedia'; // FIXME: can we make the struct the same?

        }

				let d = datasources[ name ];
				//let d = datasources[ struct[ index ].name ];

				if ( valid( d.code_resolve ) ){

					eval( `${ d.code_resolve }` );

				}

      }))
      .then( (value) => {

        renderTopics( renderObject ); // finally render all topics

      	renderResultSummary();

      })
      .catch( error => {

        console.log('some processing request(s) failed: ', error );

      });

  }).catch( error => {

    // TODO: send a notification if a resource is down or not functioning correctly
    console.log('some fetch request(s) failed: ', error );

  });

}

async function getWikidataLabel( qid, language ) {

  try {

    console.log( `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json` );

    const response  = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`);
    const data      = await response.json();

    //console.log( data );

    if (data.entities && data.entities[qid] && data.entities[qid].labels) {

      const label = data.entities[qid].labels[language].value;

      return label;

    }
    else {

      throw new Error('Entity not found or labels not available.');

    }

  }
  catch (error) {
    console.error('Error fetching Wikidata:', error.message);
    throw error;
  }
}

function checkForQid( title, pane ){ // get qid and wikidata data

  return $.ajax({

    // https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&format=json&normalize=&titles=vermeer
    url: datasources.wikidata.instance_api + '?action=wbgetentities&sites=' + explore.language + 'wiki&format=json&normalize=true&true&titles=' + title.replace( /"/gm, '' ),

    dataType: "jsonp",

    success: function( wd ) {

      //console.log( wd );

      if ( typeof wd.entities === undefined || typeof wd.entities === 'undefined' ){
        // do nothing
      }
      else {

        const qid = Object.keys( wd.entities )[0];

			  if ( isQid( qid ) ){

          let d = fetchWikidata( [ qid ], '', 'wikipedia', pane );

        }

      }

    },

  });

}

async function fetchDatasources(){

  let struct  = []; // structure to map the array of fetch results to the datasources
  let fetches = []; // holds all fetch-function calls
  let done    = '';

  let term    = cleanText( explore.q );
  term        = term.replace(/&/g, ' ');

  // create a meta-structure (so we can align the list of fetch-results with the datasource)
  $.each( explore.datasources, async function( index, source ){ // for each active datasource

    let d = datasources[ source ];

    let filterby        = '';
    let skip_datasource = false; // default

    let sortby          = '';

    //console.log('fetchDatasources(): ');

    if ( valid( explore.filterby ) ){ // filter requested

      //console.log( '  filter requested: ', explore.filterby );

      if ( d.media.includes( explore.filterby ) ){ // filter-media-type is supported by the datasource

        //console.log( '  filter-media-type supported by datasource: ', d.name, explore.filterby );

        if ( valid( d.filter_map[ explore.filterby ] ) ){ // specific filter-parameter-mapping found

          filterby = d.filter_map[ explore.filterby ];

          //console.log( '    --> use this specific filter-parameter mapping: ', d.name, filterby );

        }
        else { // just use the datasource _as is_, no

          // do nothing
          //console.log( '    --> use this datasource as is (but no custom "filterby" is needed!): ', d.name, filterby );

        }

      }
      else { // filter-media-type is NOT supported by the datasource

        skip_datasource = true;

      }

    }
    else { // no filter was set

      filterby = d.filter_map[ 'none' ];

      //console.log( '  no filter requested:', d.name, filterby );

    }

    if ( valid( d.sort_map[ explore.sortby ] ) ){

      sortby = d.sort_map[ explore.sortby ];

    }
    else {

      sortby = d.sort_map[ 'none' ];

    }

		if ( explore.page === 1 ){ // on first page

      if ( d.protocol === 'sparql' && !skip_datasource ){ // SPARQL-fetch: first set the "count url"

        struct.push({ name: source, count: true, done: false });

      }

      if ( skip_datasource ){

        d.done = true;

      }
      else {

        d.done = false;

       }

      // always reset the total on the first page
      d.total = 0;

		}
    else { // on following page

      if ( d.done || skip_datasource ){ // done fetching for this datasource

        console.log( 'done fetching for this datasource: ', source );

        done = true;

      }

    }

		struct.push({ name: source, count: false, done: done });

  });

  // setup fetch-calls
  $.each( explore.datasources, function( index, source ){ // for each active datasource

    let d = datasources[ source ];

    let filterby        = '';
    let skip_datasource = false; // default
    let sortby          = '';

    //console.log( 'fetchDatasource() fetch call part: ...' );

    if ( valid( explore.filterby ) ){ // filter requested

      //console.log( '  filter requested: ', explore.filterby );

      if ( d.media.includes( explore.filterby ) ){ // filter-media-type is supported by the datasource

        //console.log( '  filter-media-type supported by datasource: ', d.name, explore.filterby );

        if ( valid( d.filter_map[ explore.filterby ] ) ){ // specific filter-parameter-mapping found

          filterby = d.filter_map[ explore.filterby ];

          //console.log( '    --> use this specific filter-parameter mapping: ', d.name, filterby );

        }
        else { // just use the datasource _as is_, no

          // do nothing
          //console.log( '    --> use this datasource as is (but no custom "filterby" is needed!): ', d.name, filterby );

        }

      }
      else { // filter-media-type is NOT supported by the datasource

        skip_datasource = true;

      }

    }
    else { // no filter was set

      filterby = d.filter_map[ 'none' ];

      //console.log( '  no filter requested:', d.name, filterby );

    }

    if ( valid( d.sort_map[ explore.sortby ] ) ){

      sortby = d.sort_map[ explore.sortby ];

    }

		let qid = '';

		if ( explore.page === 1 && d.protocol === 'sparql' && !skip_datasource ){ // SPARQL-fetch: first set the "count url"

			//console.log( 'count url: ', encodeURI( eval(`\`${ d.count_url }\``) ) );

      fetches.push( $.ajax({

        url:      eval(`\`${ d.count_url }\``),

        dataType: d.connect,

        success:  function( data ) {
          //console.log(data);
        },

        error:  function( jqXHR, status, errorThrown  ) {
          console.log( 'source error: ', source, status, errorThrown );
          return [ [], [] ];
        },

      }) );

		}

    if ( struct[ index ].done || skip_datasource ){ // datasource "done"

     fetches.push( Promise.resolve([]) ); // dummy fetch call

    }
    else { // normal data fetch

      //console.log( 'url: ', encodeURI( eval(`\`${ d.url }\``) ) );

      fetches.push( $.ajax({

        url:      eval(`\`${ d.url }\``),

        dataType: d.connect,

        success:  function( data ) {
          //console.log(data);
        },

        error:  function( jqXHR, status, errorThrown  ) {

            console.log( 'source error: ', source, status, errorThrown );

            $.toast({
              heading: `<b>${ d.name }</b> datasource error`,
              text: 'please temporarily disable this datasource',
              hideAfter : 20000,
              stack : 1,
              showHideTransition: 'slide',
              icon: 'error'
            })

          //return [ [], [] ];

        },

      }) );

    }

	});

  //console.log( 'fetches: ', fetches );

  let res = '';

  [ ...res ] = await Promise.all( fetches );

  //console.log( 'res: ', res, res.length, struct );

  // for the first fetch: set the fetch-result-totals
  if ( explore.page === 1 ){

    res.forEach(( r, index ) => {

      // TODO: also handle "no results" found
      //  --> datasources[ struct[index].name ].done = true;

      if ( struct[index].count ){ // count-query-fetch-result (SPARQL only)

        let d = datasources[ struct[index].name ];

        if ( valid( d.code_count ) ){

          eval( `${ d.code_count }` );

        }

      }
      else { // normal data-fetch

          if ( r.query?.searchinfo?.totalhits ){

            if ( r.query.searchinfo.totalhits > 0 ){

              datasources[ struct[index].name ].total = r.query.searchinfo.totalhits;

            }

          }

      }
        
    });

  }
  //else { // follow-up pages
  //
  //}

  return [ struct, res ];

}

function gotoSentence( ID ){

  document.getElementById( explore.baseframe ).contentWindow.scrollBy(0, -200); // FIXME descrease Y-scrolling for mobile screens

}

function markSentences( IDs ){

  // TODO
  //  - handle case where Id is invalid / negative / non-existing
  //  - handle case where endId is smaller than startId

  let marks = [];

  if ( IDs.indexOf(',') == -1 ){ // no comma found, so assume its a single value
    marks[0] = IDs;
  }
  else { // comma found
    marks = IDs.split(',');
  }

  //console.log( marks );

  // remove old highlights
  $( explore.baseframe ).contents().find('.highlight').removeClass("highlight");

  const content = $( explore.baseframe ).contents();

  $.each( marks , function( index, mark ){

    if ( /[\-]/.test( mark ) ){ // range mark
      let range = mark.split('-');
 
      // mark from range-start to range-end
      for ( let i=range[0]; i <= range[1]; i++ ){

        content.find('#' + i ).addClass('highlight');

      }

    }
    else if ( isNaN(mark) ){ // invalid mark
      //continue; 
    }
    else { // single mark
  
      // mark sentence
      content.find('#' + mark ).addClass('highlight');

      // goto sentence
      document.getElementById( 'infoframe' ).contentWindow.location.hash = mark ;
      document.getElementById( 'infoframe' ).contentWindow.scrollBy(0, -200);

    }

  });

}

function markSentence( t, sid, inSideFrame ){

  //console.log('foo: ', t, sid, inSideFrame, explore.type, explore.marks );

  if ( inSideFrame ){ // in wikipedia side frame

    console.log('sentence mark: ', sid );

    $('#infoframeSplit2').contents().find( explore.baseframe ).contents().find('.highlight').removeClass("highlight");
    $('#infoframeSplit2').contents().find( explore.baseframe ).contents().find('#' + sid ).addClass('highlight');

    $('#infoframeSplit2').contents().find( explore.baseframe ).get(0).contentWindow.location.hash = sid;
    $('#infoframeSplit2').contents().find( explore.baseframe ).get(0).contentWindow.scrollBy(0, -200);

  }
  else { // standard content frame

    // check if we are still on the corresponding page, TODO also add language-check ?
    if ( explore.curr_title !== decodeURIComponent( t ) ){ // incorrect iframe page

      // show the corresponding wikipedia page for the dates again
      handleClick({
        id        : 'n1-0',
        type      : 'dates',
        title     : t,
        language  : '',
        qid       : '',
        url       : '',
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

      //handleClick( id, 'dates', t);

      // FIXME correctly mark sentence again after the iframe was change
      //markSentence(t, sid); // call markSentence() again, since the iframe was changed
    }

    $( explore.baseframe ).contents().find('.highlight').removeClass("highlight"); // remove old highlights
    $( explore.baseframe ).contents().find('#' + sid ).addClass('highlight'); // add current highlight

    // TODO: make the frameID work for mobile
    document.getElementById( 'infoframe' ).contentWindow.location.hash = sid ;
    document.getElementById( 'infoframe' ).contentWindow.scrollBy(0, -200); // FIXME descrease Y-scrolling for mobile screens

    if ( explore.isMobile ){

      if ( explore.swiper.activeIndex === 0 ){

        //explore.swiper.slideTo( 1 ); // ? TODO

      }

    }

  }

}

function getVoiceCode( lang2 ){

  //console.log( explore.language, lang2 );

  let voice_code = undefined;

  if ( valid( lang2) ){

    for ( const [ code , langobj ] of Object.entries( explore.wp_languages )) {

      if ( lang2.trim().toLowerCase() === code.toLowerCase() ){

        voice_code = langobj.voice;

      }

    }

    // check if we should use the user-selected voice (instead of the default one)
    if ( explore.voice_code_selected.startsWith( explore.language ) ){

      voice_code = explore.voice_code_selected;

    }

  }

	return voice_code;
}

function getNamefromLangCode2( lang2 ){

  let name = '';

  if ( explore.wp_languages.hasOwnProperty( lang2 ) ){

    name = explore.wp_languages[ lang2 ].namelocal;

  }

  return name;

}

function getLatinNamefromLangCode2( lang2 ){

  let name = '';

  for ( const [ code , langobj ] of Object.entries( explore.wp_languages )) {

    if ( lang2 === code ){

      name = langobj.title;
      explore.language_script = langobj.script;
      explore.langcode        = langobj.langcode;

      break;
    }

  }

  return name;

}

function getLangCode2fromName( lang_name ){

  let lang2 = undefined;

  for ( const [ code , langobj ] of Object.entries( explore.wp_languages )) {

    if ( lang_name.trim().toLowerCase() === langobj.name.toLowerCase() ){

      lang2 = code;
      explore.language_script = langobj.script;
      explore.langcode        = langobj.langcode;

      break;

    }

  }

  return lang2;

}

function getLangCode2( lang3 ){

  let lang2 = undefined;

  for ( const [ code , langobj ] of Object.entries( explore.wp_languages )) {

    if ( lang3 === langobj.iso3 ){

      lang2 = code;
      explore.language_script = langobj.script;

      break;

    }

  }

  return lang2;

}

function getLangCode3( lang2 ){

  let lang3 = undefined;

  for ( const [ code , langobj ] of Object.entries( explore.wp_languages )) {

    if ( lang2 === code ){

      lang3 = langobj.iso3;

      // TODO DRY this code
      explore.langcode          = langobj.langcode;
      explore.language_script   = langobj.script;
      explore.language_qid      = langobj.qid || '';
      explore.language_name     = langobj.name;
      explore.language_name_capitalized = capitalizeFirstLetter( langobj.name );

      explore.lang_current_events_page = langobj.articles.current_events;

      if ( explore.voice_code_selected.startsWith( explore.language ) ){

        explore.voice_code = explore.voice_code_selected;

      } 
      else {

        explore.voice_code = langobj.voice || 'en-GB';

      }

      explore.langcode_librivox = langobj.librivox || 1;
      setLanguageDirection();

      // "Category" regexes
      explore.lang_category = langobj.namespaces.category;

      // TODO handle RTL-scripts like Arab for category-matching

      if ( explore.language_direction === 'rtl' ){

        const c1 = ':' + explore.lang_category + '$';
        explore.lang_catre1 = new RegExp( c1, "g" );

        const c2 = '%3A' + explore.lang_category + '$';
        explore.lang_catre2 = new RegExp( c2, "g" );

        explore.lang_portal = langobj.namespaces.portal;
        const p1 = ':' + explore.lang_portal + '$';
        explore.lang_porre1 = new RegExp( p1, "g" );

        explore.lang_talk = langobj.namespaces.talk;

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

      }

      break;
    }

  }

  return lang3;

}

async function addToCompare( qid ) {

  qid = qid.trim();

  if ( !qid.startsWith('Q') ){
    qid = 'Q' + qid; // add 'Q' to qid-string
  }

  explore.compares.push( qid );
  explore.compares = [...new Set( explore.compares )]; // use only the unique values

}

async function showCompare(){

  let message = '';

  if ( explore.compares.length >= 2 ){

    explore.custom = explore.compares;

    handleClick({
      id        : 'n1-0',
      type      : 'compare',
      title     : explore.q.trim(),
      language  : explore.language,
      qid       : '',
      url       : '',
      tag       : '',
      languages : '',
      ids       : explore.compares.join(), // TODO should we only pass this data to ONE field?
      custom    : explore.compares.join(),
      target_pane : 'p1',
    });

    explore.custom = '';

    message = 'showing comparison of ' + explore.compares.length + ' topics';

  }
  else {
    message = 'Add at least one other topic to view the comparision';
  }

  $.toast({
    heading: '<span class="icon"><i class="fa-solid fa-plus" title="add to compare"></i></span> &nbsp; topic added to compare list',
    text: message,
    hideAfter : 5000,
    showHideTransition: 'slide',
    icon: 'success',
    stack: 1,
  })

}

async function addToMapCompare( url ) {

  //console.log( url );

  explore.map_compares.push( url );

  //console.log( explore.map_compares.length );

  //explore.map_compares = [...new Set( explore.map_compares )]; // use only the unique values

}

function getSearchValue( string ) {

  if ( string !== undefined ){

    return string.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "").trim() || '';

  }
  else {

    return $( '#srsearch' ).val().replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "").trim() || '';

  }
}

function goExplore( title ){

	handleClick({ 
		id        : 'n1-0',
		type      : 'explore',
		title     : title,
		language  : explore.language,
		qid       : '',
		url       : '',
		tag       : '',
		languages : '',
		custom    : '',
    target_pane : 'p1',
	});

}

function updateSidebar( title ){

	handleClick({ 
		id        : 'n1-0',
		type      : 'articles',
		title     : title,
		language  : explore.language,
		qid       : '',
		url       : '',
		tag       : '',
		languages : '',
		custom    : '',
    target_pane : 'p1',
	});

}

function pauseSpeaking(){

  if ( explore.isChrome ){ // note: Chrome is broken for "synth.paused"

    if ( explore.synth_paused ){

      explore.synth_paused = false;
      explore.synth.resume();

    }
    else {

      explore.synth_paused = true;
      explore.synth.pause();

    }

  }
  else {

    if ( explore.synth.paused ){

      explore.synth.resume();

    }
    else {

      explore.synth.pause();

    }

  }

}

async function hearVoice(){

  stopSpeaking();

  let text = stripHtml( explore.banana.i18n('app-guide-welcome-text') );

  if ( explore.locale !== explore.language ){ // locale not supported yet

    text = '1, 2, 3, 4, 5, 6, 7, 8, 9, 10';

  }

  startSpeaking( text );

}

async function stopSpeaking(){

  if ( valid( explore.synth ) ){

    explore.synth.cancel();

  }

}

function startSpeakingArticle( title, qid, language, section ){

  $('#blink').show();

  const article_title_cur = $('#tts-article').data('title');
  const article_title_new = encodeURIComponent( title );

  const section_title_cur = $('#tts-article').data('section');
  const section_title_new = encodeURIComponent( section );

  //console.log( '  ... article_title_cur: ', article_title_cur, ' article_title_new: ', article_title_new );
  //console.log( '  ... section_title_cur: ', section_title_cur, ' section_title_new: ', section_title_new );

  if ( ! valid( explore.synth_paused ) ){ // not paused

    stopSpeakingArticle();

    const section_speak_param = valid( section )? '&autospeak_section=' + section : '';

    // initiate new speaking iframe
    $('#tts-container').html( '<iframe id="tts-article" class="inline-iframe" title="" data-title="' + article_title_new + '" data-section="' + section_title_new + '" role="application" style="" src="' + explore.base + '/app/wikipedia/?t=' + article_title_new + '&l=' + language + '&qid=' + qid + '&autospeak=true' + section_speak_param + '&embedded=' + explore.embedded + '&tutor=' + explore.tutor + '#' + explore.hash + '" allow="autoplay; fullscreen" allowfullscreen="" allow-downloads="" width="0%" height="0%"></iframe>' );

  }
  // CASE: if TTS is in the paused-state AND another article was requested to be spoken:
  else if ( valid( article_title_cur ) && article_title_cur !== article_title_new ){

    explore.synth_paused = false;

    stopSpeakingArticle();

    const section_speak_param = valid( section )? '&autospeak_section=' + section : '';

    // initiate new speaking iframe
    $('#tts-container').html( '<iframe id="tts-article" class="inline-iframe" title="" data-title="' + article_title_new + '" data-section="' + section_title_new + '" role="application" style="" src="' + explore.base + '/app/wikipedia/?t=' + article_title_new + '&l=' + language + '&qid=' + qid + '&autospeak=true' + section_speak_param + '&embedded=' + explore.embedded + '&tutor=' + explore.tutor + '#' + explore.hash + '" allow="autoplay; fullscreen" allowfullscreen="" allow-downloads="" width="0%" height="0%"></iframe>' );

  }
  else { // resume existing utterence

    explore.synth_paused = false;

    const iframeEl = document.getElementById( 'tts-article' );

    iframeEl.dataset.title    = article_title_new;
    iframeEl.dataset.section  = section_title_new;
    
    iframeEl.contentWindow.postMessage( { event_id: 'resume-speaking', data: '' }, '*' );

    $('#blink').hide();

  }

}

function pauseSpeakingArticle( ){

  // FIXME: "play -> pause -> resume" nor working anymore in the main app?
  explore.synth_paused = true;

  //explore.synth.pause();

  const iframeEl = document.getElementById( 'tts-article' );
  iframeEl.contentWindow.postMessage( { event_id: 'pause-speaking', data: '' }, '*' );

}

function stopSpeakingArticle(){

  explore.synth_paused = false;

  const iframeEl = document.getElementById( 'tts-article' );

  if ( valid( iframeEl ) ){

    iframeEl.contentWindow.postMessage( { event_id: 'stop-speaking', data: '' }, '*' );

  }

}

async function startSpeaking( text ){

  if ( explore.synth?.speaking ){

    stopSpeaking(); // already speaking, so stop speaking first

  }


  if ( valid( text ) ){ // speak full article

    text = cleanText( text );

  }

  //console.log( text );

  if( valid( window['speechSynthesis'] ) ) {

    let utterance = new SpeechSynthesisUtterance( text );

    utterance.lang  = explore.voice_code;
    utterance.rate  = explore.voice_rate;
    utterance.pitch = explore.voice_pitch;

    if ( explore.synth.speaking ){
      // do nothing, already speaking
    }
    else {
      explore.synth.speak( utterance );
    }

  }

}

// category-tree click-handling
$('#tab-topics').on('click', 'h6 > a', function(event) {

  event.preventDefault();

  const link      = $( event.target );
  const category  = link.attr('href').slice(1);
  const heading   = link.parent();

  let  container  = heading.next('.category');

  if ( container.length ) {

    if ( container.is(':visible') ) {

      container.hide();

    }
    else {

      container.show();

    }

    return;

  }

  if ( !container.length ) {

     container = $('<div/>').addClass('category').insertAfter(link.parent());

  }

  const subcats = $.getJSON('https://' + explore.language + '.wikipedia.org/w/api.php?callback=?', {
      'action': 'query',
      'list': 'categorymembers',
      'cmtype': 'subcat',
      'cmlimit': 'max',
      'format': 'json',
      'cmtitle': category,
  });

  const pages = $.getJSON('https://' + explore.language + '.wikipedia.org/w/api.php?callback=?', {
      'action': 'query',
      'list': 'categorymembers',
      'cmtype': 'page',
      'cmlimit': 'max',
      'format': 'json',
      'cmtitle': category,
  });

  const args = { 
    id            : 'cat-item',
    language      : explore.language,
    qid           : '',
    pid           : '',
    thumbnail     : '',
    snippet       : '',
    extra_classes : '',
    item          : '',
  }

  subcats.done(function(data) {

    $.each( data.query.categorymembers, function(index, member) {

      const text = removeCategoryFromTitle( member.title );

      const item = $('<h6/>');

      const link = $('<a/>', {
        href: '#' + member.title.replace(/\s/g, '_'),
        text: text,
      });

      /*
      const buttons =
        '<span href="javascript:void(0)" class="mv-extra-icon catbutton" title="explore" aria-label="explore this topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'explore', title: encodeURIComponent( text ), qid: '', language  : explore.language } ) ) + '"> <span class="icon" style="text-indent: 0em;"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></span>';
        //'<span href="javascript:void(0)" class="mv-extra-icon catbutton" title="wikipedia" aria-label="wikipedia" role="button"' + setOnClick( Object.assign({}, args, { type: 'string', title: encodeURIComponent( text ), qid: '', language  : explore.language } ) ) + '"> <span class="icon" style="text-indent: 0em;"><i class="fa-brands fa-wikipedia-w" style="position:relative;"></i></span></span>';
      */

      item
        //.append( buttons )
        .append( link )
        .appendTo(container);

    });

    pages.done(function(data) {

      $.each( data.query.categorymembers, function( index, member ) {

        const item = $('<span class="catlink"/>');

        const title         = member.title;
        const title_quoted  = quoteTitle( title );

        let more_html = 
          '<ul class="catmore multi-value" name="' + args.target + '">' +
            '<li><span class="mv-extra-buttons noindent">' +
              '<a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'explore', title: encodeURIComponent( title ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
              '<a href="javascript:void(0)" class="mv-extra-icon" title="show article" aria-label="show article" role="button"' + setOnClick( Object.assign({}, args, { type: 'string', title: encodeURIComponent( title ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-align-justify" style="position:relative;"></i></span></a>' +

              '<a href="javascript:void(0)" class="mv-extra-icon" title="video" aria-label="video" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: explore.base + `/app/video/?l=${explore.language}#/search/` + title_quoted, title: title, qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-video" style="position:relative;"></i></span></a>' +

              // hide these buttons on mobile (screen is too narrow)
              ( explore.isMobile ? '' : '<a href="javascript:void(0)" class="mv-extra-icon" title="streaming video" aria-label="streaming video" role="button"' + setOnClick( Object.assign({}, args, { type: 'wander', title: title, qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-brands fa-youtube" style="position:relative;"></i></span></a>' ) +

              ( explore.isMobile ? '' : '<a href="javascript:void(0)" class="mv-extra-icon" title="audio" aria-label="audio" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: 'https://archive.org/search.php?query=' + title_quoted + '&and[]=mediatype%3A%22audio%22&and[]=mediatype%3A%22etree%22', title: title, qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-music" style="position:relative;"></i></span></a>' ) +
              '<a href="javascript:void(0)" class="mv-extra-icon" title="images" aria-label="images" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', title: encodeURIComponent( title_quoted ), url: encodeURI( `https://www.bing.com/images/search?q=${title}&form=HDRSC2&setlang=${explore.language}&first=1` ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-regular fa-images" style="position:relative;"></i></span></a>' +
              '<a href="javascript:void(0)" class="mv-extra-icon" title="books" aria-label="books" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', title: encodeURIComponent( title_quoted ), url: encodeURI( 'https://openlibrary.org/search?q=' + title_quoted + '&mode=everything&language=' + explore.lang3 ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-brands fa-mizuni" style="position:relative;"></i></span></a>' +

              ( explore.isMobile ? '' : '<a href="javascript:void(0)" class="mv-extra-icon" title="AI chat" aria-label="AI chat" role="button"' + setOnClick( Object.assign({}, args, { type: 'link-split', url: `${explore.base}/app/chat/?m=${title}&l=${explore.language}&t=${explore.tutor}`, title: title, qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-wand-sparkles" style="position:relative;"></i></span></a>' ) +

            '</span></li>' +

            '<li><span class="mv-extra-buttons noindent audio-buttons">' +
              '<a href="javascript:void(0)" title="speak article" aria-label="speak article" role="button" onclick="startSpeakingArticle( &apos;' + title + '&apos;, &apos;&apos;, &apos;' + explore.language + '&apos; )"> <span class="icon"><i class="fa-solid fa-play" style="position:relative;"><span class="subtext"></span></i></span> </a>' + 
              '<a href="javascript:void(0)" title="pause speaking" aria-label="pause speaking" role="button" onclick="pauseSpeakingArticle()"> <span class="icon"><i class="fa-solid fa-pause" style="position:relative;"><span class="subtext"></span></i></span> </a>' + 
              '<a href="javascript:void(0)" title="stop speaking" aria-label="stop speaking" role="button" onclick="stopSpeakingArticle()"> <span class="icon"><i class="fa-solid fa-stop" style="position:relative;"><span class="subtext"></span></i></span> </a>' + 
            '</span></li>' +
          '</ul>';

        let more = '<details id="cat-' + hashCode( title ) + '" class="catmore" title="see more links"><summary class="catmore">' + title + '</summary>' + more_html + '</details><br>';

        item.append(more).appendTo(container);

      });

    });

  });

});

function stateResetCheck( event ){

  // discern user-click from synthetic-click
  if ( event instanceof Event ){ // user event

    // reset some state
    explore.hash    = '';
    explore.commands = '';

  }

}

// fetch the list of voices and populate the voice options.
function reloadVoices() {

	if ('speechSynthesis' in window) {

		// get the available voices.
		let voices = window.speechSynthesis.getVoices();

		$('#voices').empty();

		// insert all the available voices.
		$('#voices').append( `<option value="${explore.voice_code}"></option>` ); 

		voices.forEach(function(voice, i) {

			if ( voice.lang.startsWith( explore.language ) ){
        
        if ( voice.lang.split('-').length > 2 ){ // more than two parts -> only use the first two parts (needed for Firefox)

          if ( /\d/.test( voice.lang.split('-')[1] ) ){ // 2nd part contains useless numbers, eg. "en-029" 

            return;

          }
          else { // looks to be a normal voice-code (but only use the first two parts)

            voice = voice.lang.split('-')[0] + '-' + voice.lang.split('-')[1]; 

            voice = voice.replace('+', ' '); // Firefox hack

          }

        }

				$('#voices').append( `<option value="${voice.lang}">${voice.name}</option>` ); 

			}

		});

		// choose a voice

    // first try to select option by "voice name"
    if (valid( [ explore.voice_name_selected ] ) ){

      $.each( $("#voices option"), function(key, item) {

        if ( explore.voice_name_selected === $(this).text() ){

          $(this).attr('selected','selected');

        }

      })

    }
    else { // use "voice_code" _selected"

      // use user-preference if the language matches
      if ( explore.voice_code_selected.startsWith( explore.language ) ){

        $('#voices option[value=' + explore.voice_code_selected + ']').attr('selected','selected');

      }

    }

	}

}

async function setupAmbientAudio(){

	let randomize = true;

	Array.prototype.shuffle = function() {

		let input = this;

		for ( let i = input.length-1; i >=0; i-- ) {

			let randomIndex = Math.floor(Math.random()*(i+1));
			let itemAtIndex = input[randomIndex];

			input[randomIndex] = input[i];
			input[i] = itemAtIndex;

		}

		return input;

	}

  const supportsAudio = !! document.createElement('audio').canPlayType;

  if ( supportsAudio ){

    let keys = [];

    for (let key in PLAYLIST){
      keys.push(key);
    }

    if (randomize){
      keys = keys.shuffle();
    }

    let tracks = [];

    for (let i = 0; i < keys.length; i++) {
      tracks = tracks.concat( PLAYLIST[ keys[i] ] );
    }

    let index = 0,

      playing = false,

      buildPlaylist = $.each(tracks, function(key, value) {

        let trackNumber = key,
          trackName = value.name,
          trackLength = value.length;

        if (trackNumber.toString().length === 1) {
          trackNumber = '0' + trackNumber;
        }
        else {
          trackNumber = '' + trackNumber;
        }

        $('#plList').append('<li><div class="plItem"><div class="plNum">' + trackNumber + '.</div><div class="plTitle" tabindex="0">' + trackName + '</div><div class="plLength">' + trackLength + '</div></div></li>'); 

      }),

      trackCount = tracks.length,
      npAction = $('#npAction'),
      npTitle = $('#npTitle'),

      audio = $('#audio1').bind('play', function() {

        playing = true;
        npAction.text('Now Playing...');

      })

      .bind('pause', function() {

        playing = false;
        npAction.text('Paused...');

      })

      .bind('ended', function() {

        npAction.text('Paused...');

        if ((index + 1) < trackCount) { // still more tracks to play

          if ( explore.autoplay ) {

            index++;
            loadTrack(index);
            audio.play();

          }

        }
        else {

          audio.pause();
          index = 0;
          loadTrack(index);

        }
      })
      .get(0),

      btnPrev = $('#btnPrev').click(function() {

        if ((index - 1) > -1) {

          index--;
          loadTrack(index);

          if (playing) {
            audio.play();
          }

        }
        else {

          audio.pause();
          index = 0;
          loadTrack(index);

        }

      }),

      btnNext = $('#btnNext').click(function() {

        if ((index + 1) < trackCount) {

          index++;
          loadTrack(index);

          if (playing) {

            audio.play();

          }

        }
        else {

          audio.pause();
          index = 0;
          loadTrack(index);

        }

      }),

      li = $('#plList li').click(function() {

        let id = parseInt($(this).index());

        if (id !== index) {

          playTrack(id);

        }

      }),

      loadTrack = function(id) {

        $('.plSel').removeClass('plSel');
        $('#plList li:eq(' + id + ')').addClass('plSel');

        npTitle.text(tracks[id].name);
        index = id;
        audio.src = tracks[id].file;

      },

      playTrack = function(id) {

        loadTrack(id);
        audio.play();

      };

    if ( explore.autoplay ) {

      playTrack(index);

    }
    else {

      loadTrack(index);

    }
  }

}

/*
function getGridLayout( sel ){

  if ( valid( sel ) ){

    const el			= window.getComputedStyle($( sel )[0] );
    const rows		= el.getPropertyValue("grid-template-rows").split(" ").length;
    const columns = el.getPropertyValue("grid-template-columns").split(" ").length;

    return [ rows, columns ];

  }
  else {

    return [];

  }

}
*/

function getGridColumns( sel ){

  let ret = 1; // default

  if ( valid( sel ) ){

    const el = window.getComputedStyle($( sel )[0] );

    if ( valid( el ) ){

      ret = el.getPropertyValue("grid-template-columns").split(" ").length;

    }

  }

  return ret;

}

// Open issues:
//  - How to perma-link to a presentation by URL?
//    - Example URL: https://conze.pt/explore/Netherlands?l=en&d=wikipedia,wikidata&t=presentation&i=Q55&s=true
//    - title=...", type=presentation
//    - refactor the old presentation workflow to use the new "presentation" type
async function makePresentation( input ){ // input options: title-string, Wikidata-qid-string

  //console.log( '--- makePresentation(): ', input );

  let title = '';
  let qid   = '';
  let item  = '';

  if ( isQid( input ) ){ // Wikidata Qid input

    qid           = input;
    explore.q_qid = input;

    let d = await fetchWikidata( [ qid ], '', 'wikipedia', false );

    item = d[0].source.data;

    // TODO: research why no title is being set during fetchWikidata()

    getWikidataLabel( qid, explore.language )
      .then( label => {

        title       = label;
        item.title  = label;

        speakPresentation( item );
        insertPresentationSections( item.title, qid, explore.language )
        showPresentation( item, getPresentationType( item ) );

      })
      .catch( error =>  {
        title       = '';
        item.title  = '';
        console.error('Error fetching Wikidata label: ', qid, error)
      });

  }
  else { // title-string

    title = input;

    // get Wikdiata-data as "item"-structure
    const qid_ = await checkForQid( title, '' );

    if ( qid_.hasOwnProperty('entities') ){

      qid = Object.keys( qid_.entities )[0];

      if ( isQid( qid ) ){

        explore.q_qid = qid;

        let d = await fetchWikidata( [ qid ], '', 'wikipedia', false );

        item = d[0].source.data;
        item.title = title;

        speakPresentation( item );
        insertPresentationSections( item.title, qid, explore.language )
        showPresentation( item, getPresentationType( item ) );

      }
      else {

        console.log('No Wikidata Qid found.');

        return 1;

      }

    }

  }

  //console.log( 'makePresentation(): ', qid, title, explore.type );
  //console.log( title, explore.type, item );

}


function getPresentationType( item ){

  let type  = '';

  // determine the "type" of the item, type options:
  if      ( valid( item.pubchem ) ){ type = 'pubchem'; }
  else if ( listed( item.instances, indicators.art_movement.value ) ){ type = 'art-movement'; }
  else if ( checkTag( item, 0, "cultural-concept") && !valid( item.presentation_art_movement ) ){ type = 'cultural-concept'; }
  else if ( checkTag( item, 0, 'work') ){ type = 'work'; }
  else if ( checkTag( item, 0, 'mathematics') ){ type = 'mathematics'; }
  else if ( checkTag( item, 0, 'organism') ){ type = 'organism'; }
  else if ( checkTag( item, 0, 'location') ){ type = 'location'; }
  else if ( checkTag( item, 0, 'geographical-structure') ){ type = 'geographical-structure'; }
  else if ( checkTag( item, 0, 'time') ){ type = 'time'; }
  else if ( checkTag( item, 0, 'organization') ){ type = 'organization'; }
  else if ( checkTag( item, 0, 'person') ){ type = 'person'; }
  else if ( checkTag( item, 0, 'group') ){ type = 'group'; }
  else { console.log('TODO: implement a general presentation type'); }

  return type;

}



function speakPresentation( item ){

  //console.log( 'speakPresentation(): ', explore.type, explore.language, item.title, item );

  // show presentation
  //showPresentation( item, type );

  // start TTS speaker
  if ( valid( explore.synth ) ){

    explore.synth.cancel();

  }

  startSpeakingArticle( item.title, item.qid, explore.language );

}

async function showBookmarkFiles(){

   const preview = document.getElementById("preview");
   const fileInput = document.getElementById("image-upload");

   for ( let i = 0; i < fileInput.files.length; i++) {

     let reader = new FileReader();
     reader.onload = function(readerEvent) {

       const div = document.createElement("div");

       div.innerHTML =  '<img class="bookmark-thumbnail" src="' + readerEvent.target.result + '" />"';

       preview.append(div);

     }

     reader.readAsDataURL(fileInput.files[i]);

   }

}

function handleBookmarkAddSubmit(event) {

  event.preventDefault();

  const new_id = createBookmarkId();

  //console.log( new_id, $('#bookmark-add-title').val(), $('#bookmark-add-url').val() );

  let title   = $('#bookmark-add-title').val() || '';

  let url     = $('#bookmark-add-url').val() || '';

  let images = $( '#preview .bookmark-thumbnail' ).map((_, { src }) => src).get();

	if ( valid( title ) ){

		$('#tree').tree( 'appendNode', {
			name:         title,
			//display:    display,
			url:          url,
			id:           new_id,
			language:     explore.language,
			type:         'link',
			selected:     false,
			datasource:   '',
			images:       images,
		}, $('#tree').tree('getTree') );

		storeCurrentBookmarks();

		// clear form elements
		clearImagePreview();
		$('#image-upload').replaceWith($('#image-upload').val('').clone(true));
		$('#bookmark-add-title').val('');
		$('#bookmark-add-url').val('');

	}

}


// used when sort-key and sort-param are two separate parameters in a datasource API
function getSortDirection( source ){

  let dir = '';

  if ( valid( explore.sortby ) ){

    if ( explore.sortby.split('-')[1] === 'desc' ){

      dir = 'descending';

    }
    else if ( explore.sortby.split('-')[1] === 'asc' ){

      dir = 'ascending';

    }
    else {

      dir = '';

    }

    return dir;

  }

  return dir;

}

function clearImagePreview(){

	$('#image-upload').replaceWith($('#image-upload').val('').clone(true));
	$('#preview').empty();

}

function checkNetworkStatus(){

  if ( navigator.onLine && explore.internet_available === false ) { // online

    explore.internet_available = true;

  }
  if ( ! navigator.onLine && explore.internet_available === true ) { // offline

    explore.internet_available = false;

    $.toast({
      heading: 'no internet connection',
      text: 'please check your network connection',
      hideAfter : 10000,
      stack : 1,
      showHideTransition: 'slide',
      icon: 'warning'
    })

  }

};

window.addEventListener('online', checkNetworkStatus );
window.addEventListener('offline', checkNetworkStatus );
