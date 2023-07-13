async function fetchElixir( args, total_results, page, sortby ){

  const fname = 'fetchElixir';

  args = unpackString( args );

  let page_size = 20;

  if ( total_results === null ){ // first request

    page = 1;

  }
  else { // fetch more if needed

    //if ( ( (page - 1) * page_size ) < total_results ){ // more to fetch

      // insert loader icon
      let sel     = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';
      let loader  = '<img class="loaderMV" alt="loading" width="36" height="36" src="/app/explore2/assets/images/loading.gif"/>';
      $( sel ).append( loader );

    //}
    /*
    else { // no more results

      $( '.mv-loader.' + args.id ).remove();

      return 0;

    }
    */

  }

  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    //default 		: 'title',
    rel 				: 'relevance',
    new					: 'newest first',
    mod					: 'last modified',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';

  });

  sort_select = '<label for="sortby" title="sort by"><i class="fa-solid fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  let keyword = encodeURIComponent( quoteTitle( args.topic ) );
  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();

  // see: https://tess.elixir-europe.org/api/json_api
  const search_url = `https://tess.elixir-europe.org/materials.json_api?q=${keyword}&page_number=${page}&page_size=${page_size}&sort=${sortby}`;

  //console.log( search_url );

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.data || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          //console.log( v );

          let label			= '';
          let subtitle	= '';
          let subtitle2 = '';
					let img  			= '';
					let url  			= '';
					let date 			= '';
					let desc 			= '';

					let abstract_ = '';

					date	= valid( v.attributes['created-at'] )? ' <div class="mv-extra-date">' + v.attributes['created-at'].split('T')[0] + '</div>' : '';

					label = valid( v.attributes.title )? v.attributes.title : '---';

          if ( valid( v.attributes.keywords ) ){

				    $.each( v.attributes.keywords, function ( i, topic ) {

              subtitle += '<div class="mv-extra-desc"><a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'explore', title: topic, qid: '', language  : explore.language } ) ) + '"><i class="fa-solid fa-retweet"></i> ' + topic + '</a></div>';

            });

          }

          if ( valid( v.attributes.description ) ){

            desc = date + getAbstract( v.attributes.description, keyword_match );

          }
          else {

            desc = date;

          }

          if ( v.attributes.url ){

            url = encodeURIComponent( JSON.stringify( v.attributes.url ) );

          }
     
          obj[ 'label-' + i ] = {

            title_link:						encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'url', url: url , title: args.topic } ) ) + '> ' + label + '</a>' + subtitle + subtitle2 + desc ),

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

          source        : 'Elixir',
          link          : search_url,
          results_shown : page_size,
          total_results : response.meta['results-count'],
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
