async function fetchUnpaywall( args, total_results, page, sortby ){

  const fname = 'fetchUnpaywall';

  args = unpackString( args );

  let page_size = 50;

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

  let keyword = encodeURIComponent( quoteTitle( args.topic ) );

  // see: https://unpaywall.org/products/api
  const search_url = 'https://api.unpaywall.org/v2/search/?query=' + keyword + '&is_oa=true&page=' + page + '&email=info@conze.pt';

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

					date	= valid( v.response.published_date )? ' <div class="mv-extra-date">' + v.response.published_date + '</div>' : '';

					label = valid( v.response.title )? v.response.title : '---';

          if ( valid( v.response.journal_name ) ){

            subtitle = '<div class="mv-extra-desc"><a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'explore', title: v.response.journal_name, qid: '', language  : explore.language } ) ) + '">' + v.response.journal_name + '</a></div>';

          }

          if ( valid( v.snippet ) ){

						// TODO
            //let t = '"' + v._highlights.join() + '"';
            //let text_ = $( t ).text();
            //let term = new RegExp( keyword_match, 'gi');    
            //let text = text_.replace( term, '<span class="highlight">' + keyword_match + '</span>' );
            //desc  = date + ' <div class="mv-extra-desc">' + v.snippet + '</div>';

            desc = date;

          }
          else {

            desc = date;

          }

          if ( v.response.best_oa_location?.url_for_pdf ){

            url = encodeURIComponent( JSON.stringify( v.response.best_oa_location.url_for_pdf ) );

          }
          else {

            if ( valid( v.response.doi_url ) ){

              url = encodeURIComponent( JSON.stringify( v.response.doi_url ) );

            }

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

          source        : 'Unpaywall',
          link          : search_url,
          results_shown : page_size,
          total_results : ( page * page_size ) + 1,
          page          : page,
          call          : fname,
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
