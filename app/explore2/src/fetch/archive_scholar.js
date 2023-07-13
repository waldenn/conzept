async function fetchArchiveScholar( args, total_results, page, sortby ){

  const fname = 'fetchArchiveScholar';

  args = unpackString( args );

  let page_size = 20;

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

  let keyword       = encodeURIComponent( quoteTitle( args.topic ) );
  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();

  // see:
  //  https://scholar.archive.org/api/redoc#operation/get_search
  //  https://scholar.archive.org/help
  //  https://scholar.archive.org/api/redoc
  const search_url = 'https://scholar.archive.org/search/?sort_order=' + sortby + '&limit=' + page_size + '&offset=' + ( (page - 1) * page_size ) + '&q=lang%3A' + explore.language + '+' + keyword;

  let sort_select         = '';
  let sort_select_options = '';

  let sort_types          = {
    relevance   : 'relevance',
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

          if ( valid( v.biblio ) ){

            if ( typeof v.biblio.release_date === undefined || typeof v.biblio.release_date === 'undefined' ){
              date = '';
            }
            else {

              //let d = v.biblio.release_year.split('T')[0];
              //d = [ d.slice(0, 4), d.slice(4,6), d.slice(6,8) ].join('-');
              date  = ' <div class="mv-extra-date">' + v.biblio.release_date + '</div>';

            }

						label = valid( v.biblio.title )? v.biblio.title : '---';

            if ( valid( v.biblio.container_name ) ){

              subtitle = '<div class="mv-extra-desc"><a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'explore', title: v.biblio.container_name, qid: '', language  : explore.language } ) ) + '">' + v.biblio.container_name + '</a></div>';

            }

          }

          /* // TODO: add abstract info from v.abstracts[0].body
          if ( typeof v._highlights === undefined || typeof v._highlights === 'undefined' ){
            abstract_ = ;
          }
          else {
          }
          */

          if ( valid( v._highlights ) ){

            desc = date + '<details class="inline-abstract"><summary><small><i class="fa-solid fa-ellipsis-h"></i></small></summary>' + v._highlights.join() + '</details>';

          }
          else {

            desc = date;

          }

          if ( valid( v.access ) ){

            if ( valid( v.access[0].access_url ) ){

              let source_link = v.access[0].access_url;

              if (  source_link.startsWith( 'https://archive.org' ) ){ // add search-keyword parameter for Archive.org works

                source_link += '?q=' + keyword;

              }

              url = encodeURIComponent( JSON.stringify( source_link ) );

            }

          }
   
          if ( valid( v.fulltext ) ){

            if ( valid( v.fulltext.thumbnail_url ) ){

              img = v.fulltext.thumbnail_url;

            }

          }

          obj[ 'label-' + i ] = {

            title_link:						encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: url , title: args.topic } ) ) + '> ' + label + '</a>' + subtitle + subtitle2 + desc ),

            thumb_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: url, title: args.topic } ) ) + '><div class="mv-thumb"><img class="thumbnail allow-invert" src="' + img + '" alt="" loading="lazy"></div></a>' ),

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

          source        : 'Archive Scholar',
          link          : search_url,
          results_shown : response.count_returned,
          total_results : response.count_found,
          page          : page,
          call          : fname,
          sortby        : sortby,
          sort_select   : sort_select,

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', thrownError );

      }

	});

}
