async function fetchBHL( args, total_results, page, sortby ){

  const fname = 'fetchBHL';

  args = unpackString( args );

  let page_size = 100;

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

  let keyword = args.topic;
  keyword     = removeCategoryFromTitle( keyword );

  //let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' ); // add some extra spaces to avoid the API error message: "phrase too short".

  let title_quoted = quoteTitle( args.topic );

  // see:
  //  https://scholar.archive.org/api/redoc#operation/get_search
  //  https://scholar.archive.org/help
  //  https://scholar.archive.org/api/redoc
  const search_url = 'https://www.biodiversitylibrary.org/api3?op=PublicationSearch&searchterm=' + keyword + '&searchtype=C&page=' + page + '&apikey=19fe2e68-1fa4-482d-8480-a6def4e7a82c&format=json';

  /*
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
  */

	let obj = {};

  args.type = 'url';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.Result || [];

        if ( typeof json === undefined || typeof json === 'undefined' ){
          return 1;
        }

				$.each( json, function ( i, v ) {

          let label     = '';
          let subtitle  = '';
					let img       = '';
					let url       = '';
					let date      = '';
					let desc      = '';

					let abstract_ = '';

          date  = valid( v.Date )? ' <div class="mv-extra-date">' + v.Date + '</div>' : '';

          label = valid( v.Title )? v.Title : '---';

          url   = valid( v.PartUrl )? v.PartUrl : '';

          if ( valid( v.ContainerTitle ) ){

            subtitle  = ' <div class="mv-extra-desc"><small>' + v.ContainerTitle + '</small></div>';

          }

          obj[ 'label-' + i ] = {

            title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="topic" aria-label="topic" onclick="openInNewTab( &quot;' + url + '&quot;)" onauxclick="openInNewTab( &quot;' + url + '&quot;)"> ' + decodeURIComponent( label ) + '</a>' + subtitle + date ),

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

          source        : 'Biodiversity Heritage Library',
          link          : 'https://www.biodiversitylibrary.org/search?searchTerm=' + encodeURIComponent( title_quoted ) + '&stype=C#/titles',
          results_shown : '',
          total_results : Object.keys( obj ).length, 
          page          : page,
          //call          : fname,
          //sortby        : sortby,
          //sort_select   : sort_select,

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', thrownError);

      }

	});

}
