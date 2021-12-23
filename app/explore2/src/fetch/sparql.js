async function fetchSparql( args, total_results, page, sortby ){

  const fname = 'fetchSparql';

  args = unpackString( args );

	let obj = {};

  args.type = 'wikipedia-qid'; // reduce the "wikipedia-qid-sparql' type

  let page_size = 20;
  let offset    = 0;

  if ( total_results === null ){ // first request

    page = 1;

  }
  else { // fetch more if needed

    offset = ( page - 1 ) * page_size;

  }

  let url = args.list + '%0ALIMIT%20' + page_size + '%0AOFFSET%20' + offset + '%0A';

	$.ajax({

			url: url,

			jsonp: "callback",

			dataType: "json",

			success: function( response ) {

        // TODO: clean this up
				if ( typeof response.results === undefined || typeof response.results === 'undefined' ){
          $( '.mv-loader.' + args.id ).remove();
					return 1;
				}

				if ( typeof response.results.bindings === undefined || typeof response.results.bindings === 'undefined' ){
          $( '.mv-loader.' + args.id ).remove();
					return 1;
				}

				if ( typeof response.results.bindings[0] === undefined || typeof response.results.bindings[0] === 'undefined'  ){
          $( '.mv-loader.' + args.id ).remove();
					return 1;
				}

				if ( response.results.bindings[0].item.value === 'http://www.wikidata.org/entity/undefined' ){
          $( '.mv-loader.' + args.id ).remove();
					return 1;
				}

        if ( response.results.bindings.length === 0 ) { // no more results

          $( '.mv-loader.' + args.id ).remove();

          return 1;

        }

				Object.entries( response.results.bindings ).forEach(([ i , v ]) => {

          let label = '';
          let		qid = '';
					let		img = '';
					let		url = '';

          if ( v.item?.value ) {
            qid = v.item.value.replace('http://www.wikidata.org/entity/', '');
          }

					label = valid( v.itemLabel ) ? v.itemLabel.value : qid;

					img		= valid( v.image ) ? v.image.value.replace('http://commons.wikimedia.org/wiki/Special:FilePath/', 'https://'+ explore.language + '.wikipedia.org/wiki/' + explore.language + ':Special:Filepath/') + '?width=350' : '';

					url = valid( v.url ) ? encodeURI( JSON.stringify( v.url.value ) ) : '';


          obj[ 'label-' + i ] = {

            title_link : encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="' + label + '" aria-label="' + label + '"' + setOnClick( Object.assign({}, args, { type: 'wikipedia-qid', qid: qid, title: label } ) ) + '>' + label + '</a><br/>' ),

            thumb_link: encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" tabIndex="-1" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'wikipedia-qid', qid: qid, title: label } ) ) + '><div class="mv-thumb"><img class="thumbnail" src="' + img + '" alt="" loading="lazy"></div></a>' ),

            explore_link:         encodeURIComponent( getExploreLink( args, label, qid ) ),
            video_link:           encodeURIComponent( getVideoLink( args, label ) ),
            wander_link:          encodeURIComponent( getWanderLink( args, label ) ),
            images_link:          encodeURIComponent( getImagesLink( args, label ) ),
            books_link:           encodeURIComponent( getBooksLink( args, label ) ),
            websearch_link:       encodeURIComponent( getWebsearchLink( args, label ) ),
            compare_link:         encodeURIComponent( getCompareLink( qid ) ),
            website_link:         '',
            custom_links:         '',
            raw_html:             '',
            mv_buttons_style:			'',

          };

				});

        let total_results = 0;

        let meta = {

          source        : 'wikiData',
          link          : '',
          results_shown : Object.keys( obj ).length, 
          total_results : Object.keys( obj ).length, // FIXME: how the get the total results of this SPARQL query (without fetching all)?
          page          : page,
          call          : fname,
          //sortby        : sortby,
          //sort_select   : sort_select,
        }

				insertMultiValuesHTML( args, obj, meta );

			},

	});

}
