async function fetchMSAcademic( args, total_results, page, sortby, type ){

  const fname = 'fetchMSAcademic';

  args = unpackString( args );

  let f = args.list.split(':') || [];

  let page_size = 20;

  let offset    = 0;

  if ( total_results === null ){ // first request

    page = 1;

  }
  else { // fetch more if needed

    offset = ( page - 1 ) * page_size;

  }

  let keyword = encodeURIComponent( args.topic );

  let keyword_match = args.topic;

  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    'DESC(%3FpaperPubDate)' : 'newest first',
    '%3FpaperPubDate'       : 'oldest first',
    '%3FpaperRank'          : 'relevance',
    '%3FpaperTitle'         : 'title (ascending)',
    'DESC(%3FpaperTitle)'   : 'title (descending)',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';

  });


  sort_select = '<label for="sortby" title="sort by"><i class="fa-solid fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value, &quot;*&quot; );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  let sortby_param = '';

  // see:
  let search_url = 'https://makg.org/sparql?default-graph-uri=&query=++PREFIX+rdf%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0D%0A++PREFIX+mag%3A+%3Chttps%3A%2F%2Fmakg.org%2Fproperty%2F%3E%0D%0A++PREFIX+magc%3A+%3Chttps%3A%2F%2Fmakg.org%2Fclass%2F%3E%0D%0A++PREFIX+dcterms%3A+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%3E%0D%0A++PREFIX+datacite%3A+%3Chttp%3A%2F%2Fpurl.org%2Fspar%2Fdatacite%2F%3E%0D%0A++PREFIX+foaf%3A+%3Chttp%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%3E%0D%0A++PREFIX+fabio%3A+%3Chttp%3A%2F%2Fpurl.org%2Fspar%2Ffabio%2F%3E%0D%0A++PREFIX+prism%3A+%3Chttp%3A%2F%2Fprismstandard.org%2Fnamespaces%2Fbasic%2F2.0%2F%3E%0D%0A++PREFIX+xsd%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E%0D%0A%0D%0A++SELECT+DISTINCT+%3FpaperDOI+%3FpaperURL+%3FpaperTitle+%3FpaperPubDate+%3FpaperAbstract+%3FpaperPublisher+%3FpaperRank%0D%0A++WHERE+%7B%0D%0A++++%3Fpaper+rdf%3Atype+magc%3APaper+.%0D%0A++++%3Fpaper+prism%3Akeyword+%22' + keyword.toLowerCase() + '%22%5E%5Exsd%3Astring+.%0D%0A++++%3Fpaper+prism%3ApublicationDate+%3FpaperPubDate+.%0D%0A++++%3Fpaper+fabio%3AhasDiscipline+%3Ffield+.%0D%0A++++%3Fpaper+fabio%3AhasURL+%3FpaperURL+.%0D%0A++++%3Fpaper+dcterms%3Atitle+%3FpaperTitle+.%0D%0A++++%3Fpaper+dcterms%3Apublisher+%3FpaperPublisher+.%0D%0A++++%3Fpaper+dcterms%3Aabstract+%3FpaperAbstract+.%0D%0A++++%3Fpaper+datacite%3Adoi+%3FpaperDOI+.%0D%0A++++%3Fpaper+mag%3Arank+%3FpaperRank+.%0D%0A++%7D%0D%0A++ORDER+BY+' + sortby + '%0D%0A++LIMIT+' + page_size + '%0D%0A++OFFSET+' + offset + '&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+';

	console.log( search_url );

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "jsonp",

			success: function( response ) {

				if ( typeof response.results === undefined || typeof response.results === 'undefined' || typeof response.results.bindings === undefined ){
					return 1;
				}

				let json = response.results.bindings || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label     = '';
					let subtitle  = '';
					let subtitle2 = '';
					let img       = '';
					let url       = '';
					let date      = '';
					let desc      = '';
					let newtab    = 'true';

          if ( valid( v.paperTitle ) ){

            label = v.paperTitle.value;

          }
          else {

            console.log( 'missing title: ', v );

            label = '---';

          }

          if ( valid( v.paperPublisher ) ){

            subtitle = '<div class="mv-extra-date">' + v.paperPublisher.value + '</div>';

          }

          if ( valid( v.paperURL ) ){

            url   = encodeURIComponent( JSON.stringify( v.paperURL.value ) );

          }

          if ( valid( v.paperPubDate ) ){

            date = '<div class="mv-extra-date">' + v.paperPubDate.value + '</div>';

          }

          if ( valid( v.paperAbstract ) ){

            desc = getAbstract( v.paperAbstract.value, keyword_match );

          }

          // get authors
          /*
          if ( valid ( v.author_display ) ){

				    $.each( v.author_display, function ( j, author ) {

              let author_name = author; 
              let author_url  = encodeURIComponent( JSON.stringify( 'https://journals.plos.org/plosone/search?q=author:' + v.author_display[j] ) );

              subtitle += '<div class="mv-extra-desc">' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author" role="button"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="author works" aria-label="author works" role="button"' + setOnClick( Object.assign({}, args, { type: 'url', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + author + '</a>' +
                '</div>';

            });

          }
          */

          obj[ 'label-' + i ] = {

						title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="opens in new tab" aria-label="opens in new tab" role="button" onclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)" onauxclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)"> ' + decodeURIComponent( label ) + '</a>' + date + subtitle + subtitle2 + desc ),
						thumb_link:           '',

            explore_link:         '',
            video_link:           '',
            wander_link:          '',
            images_link:          '',
            books_link:           '',
            websearch_link:       '',
            compare_link:         '',
            website_link:         '',
            custom_links:         '',
            raw_html:             '',
            mv_buttons_style:			'display:none;',

          };

				});

        let meta = {

          source        : 'Microsoft Academic',
          link          : 'https://academic.microsoft.com/search?q=' + keyword,
          results_shown : Object.keys(obj).length,
          total_results : Object.keys(obj).length + 1, // FIXME
          page          : page,
          call          : fname,
          sortby        : sortby,
          sort_select   : sort_select,

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError) {

				console.log( 'response: hmm...', thrownError);

      }

	});

}
