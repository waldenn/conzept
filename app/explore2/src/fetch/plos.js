async function fetchPLOS( args, total_results, page, sortby, type ){

  const fname = 'fetchPLOS';

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

  let keyword = encodeURIComponent( quoteTitle( args.topic ) );

  let keyword_match = args.topic;


  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    // TODO: check for other useful sort-options
    'relevance' : 'relevance',    // --> make an empty sort-param!
    'new'       : 'newest first', // publication_date desc
    'old'       : 'oldest first', // publication_date asc
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

  if ( sortby === 'new' ){
    sortby_param = '&sort=field(publication_date) desc';
  }
  else if ( sortby === 'old' ){
    sortby_param = '&sort=field(publication_date) asc';
  }
  else {
    sortby_param = ''; // default is relevance
  }

  // see:
  //  http://api.plos.org/solr/search-fields/
  //  https://solr.apache.org/guide/7_6/common-query-parameters.html
  //
  //  https://api.plos.org/search?q=DNA
  //  http://api.plos.org/solr/faq/#what_is_the_plos_search_api
  //  https://solr.apache.org/guide/6_6/the-standard-query-parser.html
  let search_url = '/app/cors/raw/?url=' + encodeURIComponent( 'https://api.plos.org/search?q=' + keyword + sortby_param + '&start=' + offset + '&rows=' + page_size );

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				if ( typeof response.response.docs === undefined || typeof response.response.docs === 'undefined' ){
					return 1;
				}

				let json = response.response.docs || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label			= '';
					let subtitle	= '';
					let subtitle2 = '';
					let img  			= '';
					let url  			= '';
					let date			= '';
					let desc 			= '';
					let newtab		= 'true';

          if ( valid( v.title_display ) ){

            label = v.title_display;

          }
          else {

            label = '---';

          }

          if ( valid( v.journal ) ){

            subtitle = '<div class="mv-extra-date">' + v.journal + '</div>';

          }

          if ( valid( v.id ) ){

            url   = encodeURIComponent( JSON.stringify( 'https://journals.plos.org/plosone/article?id=' + v.id ) );

          }

          if ( valid( v.publication_date ) ){

            date = '<div class="mv-extra-date">' + v.publication_date.split('T')[0] + '</div>';

          }

          if ( valid( v.abstract ) ){

            desc = getAbstract( v.abstract[0], keyword_match );

          }

          // get authors
          if ( valid ( v.author_display ) ){

				    $.each( v.author_display, function ( j, author ) {

              let author_name = author; 
              let author_url  = encodeURIComponent( JSON.stringify( 'https://journals.plos.org/plosone/search?q=author:' + v.author_display[j] ) );

              subtitle += '<div class="mv-extra-desc">' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="author works" aria-label="author works"' + setOnClick( Object.assign({}, args, { type: 'url', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + author + '</a>' +
                '</div>';

            });

          }

          obj[ 'label-' + i ] = {

						title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="opens in new tab" aria-label="opens in new tab" onclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)" onauxclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)"> ' + decodeURIComponent( label ) + '</a>' + date + subtitle + subtitle2 + desc ),
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

          source        : 'Public Library of Science',
          link          : 'https://journals.plos.org/plosone/search?q=' + keyword + '&sortOrder=DATE_NEWEST_FIRST&page=' + page,
          results_shown : Object.keys(obj).length,
          total_results : response.response['numFound'],
          page          : page,
          call          : fname,
          sortby        : sortby,
          sort_select   : sort_select,

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', response );

      }

	});

}
