async function fetchSearchCultureGreece( args, total_results, page, sortby ){

  const fname = 'fetchSearchCultureGreece';

  args = unpackString( args );

  let page_size = 50;

  if ( total_results === null ){ // first request

    page = 1;

  }
  else { // fetch more if needed

    if ( ( (page - 1) * page_size ) < total_results ){ // more to fetch

      // insert loader icon
      let sel     = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';
      let loader  = '<img class="loaderMV" alt="loading" width="36" height="36" src="/app/explore2/assets/images/loading.gif"/>';
      $( sel ).append( loader );

    }
    else { // no more results

      $( '.mv-loader.' + args.id ).remove();

      return 0;

    }

  }

  let keyword = args.topic.replace(/\(.*?\)/g, '').trim();
  keyword			= removeCategoryFromTitle( keyword );

  //let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' ); // add some extra spaces to avoid the API error message: "phrase too short".

  // see:
  //  https://www.searchculture.gr/aggregator/swagger-ui.html#/search-api-controller
  //  https://www.searchculture.gr/aggregator/api/search.json?apiKey=c7f39160-17fe-4f03-9bbd-78979033407e&ektFieldsUseURIs=false&ektStrictPeriodsMode=true&general_term=wine&page=1&preferredLanguage=en
  const search_url = 'https://www.searchculture.gr/aggregator/api/search.json?apiKey=c7f39160-17fe-4f03-9bbd-78979033407e&ektFieldsUseURIs=false&ektStrictPeriodsMode=true&general_term=' + keyword + '&page=' + page + '&preferredLanguage=en';

  let sort_select         = '';
  let sort_select_options = '';

  let sort_types          = {
    relevancy   : 'relevance',
    time_asc    : 'oldest first',
    time_desc   : 'newest first',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';

  });
  
  sort_select = '<label for="sortby" title="sort by"><i class="fa-solid fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value );" data-title="' + args.title + '">' + sort_select_options + '</select>';

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.results || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label			= '';
          let subtitle	= '';
          let subtitle2 = '';
					let img  			= '';
					let url  			= '';
					let date 			= '';
					let desc 			= '';

					let abstract_ = '';

          if ( valid( v.ekt_chronology ) ){

            date = ' <div class="mv-extra-date">' + v.ekt_chronology[0] + '</div>';

          }

          if ( valid( v.dc_title ) ){

            label = v.biblio.title;

          }

          if ( valid( v.institution ) ){

            subtitle = '<div class="mv-extra-desc"><a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic"' + setOnClick( Object.assign({}, args, { type: 'explore', title: v.institution, qid: '', language  : explore.language } ) ) + '">' + v.institution + '</a></div>';

          }

          if ( valid( v.uri ) ){

            url = encodeURIComponent( JSON.stringify( v.uri[0] ) );

          }

          // TODO: img = v.fulltext.thumbnail_url;

          obj[ 'label-' + i ] = {

            title_link:						encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: url , title: args.topic } ) ) + '> ' + label + '</a>' + subtitle + subtitle2 + desc ),

            thumb_link:           '',
            explore_link:         '',
            video_link:           '',
            wander_link:          '',
            images_link:         	'',
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

          source        : 'Search Culture Greece',
          link          : search_url,
          results_shown : page_size,
          total_results : response['totalResults'],
          page          : page,
          call          : fname,
          sortby        : sortby,
          sort_select   : sort_select,

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', thrownError);

      }

	});

}
