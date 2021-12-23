function createPresentationJSON( obj ){

  let p = {};

  // create cover
  p.cover = {

    title:  obj.cover_title,
    text:   obj.cover_text,
    author: obj.cover_author,
    date:   obj.cover_date,

  };

  // create default chapter
  p.chapters = [{

      title: 'intro', // + obj.cover_title,
      text:  ' ',
      slides:  [],

  }];

  // create slides to add to the default chapter
  $.each( obj.slides, function ( i, slide ) {

    //console.log( obj.slides[i][1], obj.slides[i][2] );

    p.chapters[0].slides.push({

      "title": obj.slides[i][0],
      "text": obj.slides[i][1],
      "url": obj.slides[i][2],

    });

  });

  //console.log( p );

  return p;

}

function createSlideHTML( label, presentation ){

  //console.log( 'createSlideHTML(): ', label, presentation );

  //console.log( 'presentation: ', response_presentation );

  //console.log( '  cover: ', presentation.cover );
  let html = '';

  // get cover data
  // ...

  let slide_nr = 0;

  let presentation_id = 'presentation-' + hashCode( label );

  //console.log( presentation, presentation_id );

  $.each( presentation.chapters, function ( chapter_nr , chapter ) {

    //console.log( '  chapter: ', chapter );

    html += '<details id="chapter-' + chapter_nr + '" class="presentation-chapter"><summary>' + chapter.title + '</summary>';

    // get chapters 
    $.each( chapter.slides , function ( k, slide ) {

      //console.log( '    slide: ', slide );

      html +=	'<a id="slide-' + slide_nr + '" class="presentation-slide" data-chapter="' + chapter_nr + '" data-voice="' + slide.text + '" data-url="' + encodeURIComponent( JSON.stringify( slide.url ) ) + '" onclick="playSlide( &quot;' + presentation_id + '&quot;, ' + slide_nr + ' )">' + slide.title + '</a>';

      //'<a id="slide-link-' + slide_nr + '" data-chapter="' + chapter_nr + '" href="javascript:void(0)" title="' + slide.title + '" aria-label="' + slide.title + '"' + setOnClick( Object.assign({}, { type: 'link', title: encodeURIComponent( slide.title ), url: encodeURI( slide.url ) } ) )  + '">' + slide.title + '</a>' +

      slide_nr += 1;

      //console.log( html );

    });

    html += '</details>';

  });

  return html;

}

async function generatePresentation( args ){

  // add default presentation
  // https://archive.org/help/json.php
  // https://archive.org/advancedsearch.php?q=zodiac&fl[]=identifier,title,mediatype,collection&rows=15&output=json&callback=IAE.search_hits
  
  //console.log( args );

	let item = {};

  if ( args.qid !== '' ){

		if ( !args.qid.startsWith('Q') ){

			args.qid = 'Q' + args.qid; // add 'Q' to qid string

      let item = { qid : args.qid };

      const wikidata_url = window.wbk.getEntities({
        ids: [ args.qid ],
        redirections: false,
      })

      //console.log( wikidata_url );

      //wbk.simplify.claims( entity.claims, { keepQualifiers: true })

      // get wikidata json
      fetch( wikidata_url )

        .then( response => response.json() )
        .then( window.wbk.parse.wd.entities )
        //.then( data => window.wbk.simplify.entities(data.entities, { keepQualifiers: true } ))
        .then( entities => {

          //console.log( entities )

          //console.log( 'single item: ', item, entities[ item.qid ] );

          // detect the relevant wikidata-data and put this info into the item
          item = setWikidata( item, entities[ item.qid ], true, 'p0' );

          //console.log( item );

          let title_enc = encodeURIComponent( args.topic );
          let title_quoted_enc = encodeURIComponent( quoteTitle( args.topic ) );

          let default_presentation = {

            //cover_title : args.topic,
            cover_title : 'default',
            cover_text : args.topic,
            cover_url : encodeURIComponent( JSON.stringify( '/app/wikipedia/?t=' + args.topic ) ),
            cover_author : "auto",
            cover_date : new Date().toISOString(),

            slides : [

              [ 'wikipedia', '','/app/wikipedia/?t=' + title_enc + '&l=' + explore.language + '&qid=' + args.qid + '&autospeak=true' ],
              [ 'video (>20min)', '', '/app/video/#/search/' + title_quoted_enc + '?searchduration=long' ],
              [ 'video (4-20min)', '', '/app/video/#/search/' + title_quoted_enc + '?searchduration=medium' ],
              [ 'Archive.org books', '', 'https://archive.org/search.php?query=' + title_quoted_enc + '&sin=TXT' + title_quoted_enc + '&and[]=languageSorter%3A%22' + explore.language_name +'%22&and[]=mediatype%3A%22texts%22']

            ], 
          }

          let commons_url = '';

          if ( valid( item.wikicommons_cat ) ){ // category search on wikicommons

            commons_url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=' + encodeURIComponent( explore.lang_category + ':' + item.wikicommons_cat )  + '&gcmlimit=50&gcmtype=file&prop=imageinfo&&iiprop=url&format=json';

          }
          else {

            commons_url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=images&prop=imageinfo&gimlimit=50&redirects=1&titles=' + title_enc + '&iiprop=timestamp%7Cuser%7Cuserid%7Ccomment%7Ccanonicaltitle%7Curl%7Csize%7Cdimensions%7Csha1%7Cmime%7Cthumbmime%7Cmediatype%7Cbitdepth&format=json';

          }

          // TODO: add ogg & video media support

          //console.log( commons_url );

          $.ajax({

              url: commons_url,

              //jsonp: "callback",

              dataType: "jsonp",

              // Work with the response
              success: function( commons_data ) {

                //console.log( commons_data );

                // add wikiCommons images
                let coll = { "images": [ ]};

                // add slide with an IIIF-image link
                if ( valid( item.image ) ){

                  if ( explore.isMobile ){

                    item.image = item.image.replace( /\d+px$/, '1500px');

                  }
                  else { // desktop

                    item.image = item.image.replace( /\d+px$/, '4500px');

                  }

                  //console.log( item.image );

                  // for each image add:
                  coll.images.push( [ item.image, title_enc, "desc", 'WikiCommons', '...'  ] );
                  //coll.images.push( [ encodeURIComponent( item.image ), "title", "desc" ] );
                  // coll.images.push( [ img, label, encodeURIComponent( v.longTitle ), author, 'Rijksmuseum' ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

                }

                if ( valid( commons_data.query ) ){

                  if ( valid( commons_data.query.pages ) ){

                    let cjson = commons_data.query.pages || [];

                    $.each( cjson, function ( h, img ) {

                      let ctitle  = img.title.substring( img.title.indexOf(":") + 1);
                      ctitle      = encodeURIComponent(  ctitle.split('.').slice(0, -1).join('.') );

                      //console.log( ctitle, img.imageinfo[0].url );

                      // license data retrieval: https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&titles=File%3aBrad_Pitt_at_Incirlik2.jpg&format=json

                      let weburl = encodeURIComponent( img.imageinfo[0].descriptionurl );

                      //coll.images.push( [ img.imageinfo[0].url, ctitle, ctitle, 'attribution: WikiCommons', '<a target="_blank" href="' + weburl + '">' ] );

                      coll.images.push( [ img.imageinfo[0].url, ctitle, ctitle, 'attribution: WikiCommons', '...' ] );

                    });

                  }

                }

                //console.log( coll );

                if ( coll.images.length > 0 ){ // we found some images

                  // create an IIIF image-collection file
                  let iiif_manifest_link = '/app/response/iiif-manifest?l=en&t=' + title_enc + '&json=' + JSON.stringify( coll );

                  let iiif_viewer_url = '/app/iiif/#?c=&m=&s=&cv=0&manifest=' + encodeURIComponent( iiif_manifest_link );

                  default_presentation.slides.push(
                    [ 'images', '', iiif_viewer_url ],
                  );

                }

                // add slide with an IIIF-image link
                if ( valid( item.gbif_id ) ){

                  default_presentation.slides.push(
                    [ 'map', '', '/app/response/gbif-map?l=' + explore.language + '&t=' + title_enc + '&id=' + item.gbif_id ],
                  );

                }

                //console.log( default_presentation );

                let default_html = createSlideHTML( encodeURIComponent( default_presentation.cover_title ), createPresentationJSON( default_presentation ) );

                //console.log( default_html );

                let o = {

                  label: encodeURIComponent( default_presentation.cover_title ),
                  img: '',
                  url: default_presentation.cover_url,
                  desc: encodeURIComponent( default_presentation.cover_text ),
                  html: default_html

                };

                let myobj = {};
                myobj[ 'label-000' ] = o;

                fetchPresentations( args, args.list, myobj );

              },

              error: function (xhr, ajaxOptions, thrownError){

                console.log( 'response: error...', ); // server response

              }

          });

      }) // end of qid entity processing

		}

	}

}

async function fetchPresentations( args, url, obj ){

	//console.log( url , obj );

	// reset presentation state
  //explore.current_presentation_id			= '';
  //explore.current_presentation_slide	= 0;

  let keyword = args.topic.split(' ').splice(0,5).join(' ');
  keyword			= removeCategoryFromTitle( keyword );

  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword = encodeURIComponent( keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() );

  const search_url = '/app/explore2/assets/json/presentations/list.json';

	//console.log( url, search_url  );

  args.type = 'link';

  // find and parse user-made presentations 
	$.ajax({

			url: search_url,

			//jsonp: "callback",

			dataType: "json",

			// Work with the response
			success: function( response ) {

        //console.log( response );

				let json = response.presentations || [];

        json = sortObjectsArray( json, 'title');

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

        //console.log( 'presentation json: ', json );

        if ( json.length > 0 ){ // multiple presentations

          // 1: for each presentation URL
          $.each( json, function ( i, v ) {

            //console.log( v );

            let label = v.title;
            let img   = ''; // v.image;
            let url   = encodeURIComponent( JSON.stringify( v.url ) );
            let date  = '';
            let desc  = '';
            let html  = '';

            // 2: - fetch the presentation JSON (TODO?: later we could make this only trigger upon a title click by the user)
            //    - process and add it as a detail-element (containing all the chapters + slides)
            $.ajax({

                url: v.url,

                //jsonp: "callback",

                dataType: "json",

                // Work with the response
                success: function( presentation ) {

                  html += createSlideHTML( label, presentation );

                  //obj[ 'label-' + i ] = { label: label, img: img, url: url, desc: desc, html: html } ;

                  // FIXME
                  /*
                  obj[ 'label-' + i ] = {

                    title_link:						encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: url , title: args.topic } ) ) + '> ' + label + '</a>' ),

                    thumb_link:           '',

                    explore_link:         '',
                    video_link:           '',
                    wander_link:          '',
                    images_link:         	'',
                    books_link:           '',
                    websearch_link:       '',
                    compare_link:         '', // getCompareLink( qid )
                    website_link:         '', // getExternalWebsiteLink( url ) , getLocalWebsiteLink( args, url )
                    custom_links:         '', // custom_links,
                    raw_html:             '', // raw_html
                    mv_buttons_style:			'display:none;',

                  };
                  */

                  //console.log( obj[ 'label-' + i ] );

                },

                complete: function( data ) {

                  //console.log('complete');

                  if ( i === json.length - 1 ){ // this was the last fetch

                    //console.log('done: all json items fetched');

                    //console.log( Object.keys(obj).length );

                    //console.log( obj[ 'label-default' ] );

                    //console.log( obj.html );

                    //console.log( 'completed: ', data );

                    //console.log( obj );

                    /*
                    let meta = {

                      source        : 'presentations',
                      link          : '',
                      results_shown : Object.keys( obj ).length, 
                      total_results : Object.keys( obj ).length, 

                    }

                    insertMultiValuesHTML( args, obj, meta );
                    */

										// insert raw-html
										let sel = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';

										//console.log( args, obj );
										//console.log( sel );

										// remove the fetch-more loading indicator
										$( sel + ' .loaderMV' ).remove();

										// TODO can we merge these two loader-add-remove versions? (see createItemHtml.js)
										$( sel + ' .mv-loader.' + args.id ).remove();

										$( sel ).html( html );

                  }

                },

                error: function (xhr, ajaxOptions, thrownError) { // NOTE: this always responds with an error, why? because of the ".m3u" mediatype?

                  console.log( 'response: hmm...', response_presentation ); // server response

                }

            });

          });

        }
        else { // only one presentation

					/*
          let meta = {

            source        : 'presentations',
            link          : '',
            results_shown : Object.keys( obj ).length, 
            total_results : Object.keys( obj ).length, 

          }

          insertMultiValuesHTML( args, obj, meta );
					*/

					// insert raw-html
					let sel = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';

					//console.log( args, obj );
					//console.log( sel );

					// remove the fetch-more loading indicator
					$( sel + ' .loaderMV' ).remove();

					// TODO can we merge these two loader-add-remove versions? (see createItemHtml.js)
					$( sel + ' .mv-loader.' + args.id ).remove();

					$( sel ).html( obj['label-000'].html );

        }

			},
      error: function (xhr, ajaxOptions, thrownError) { // NOTE: this always responds with an error, why? because of the ".m3u" mediatype?

				console.log( 'response: hmm...', response ); // server response

      }

	});

}
