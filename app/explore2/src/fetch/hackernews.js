async function fetchHackerNews( args, total_results, page, sortby ){

  const fname = 'fetchHackerNews';

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

  let keyword = args.topic.replace(/\(.*?\)/g, '').trim();
  keyword			= removeCategoryFromTitle( keyword );

  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' );

  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    relevance     : 'relevance',
    chronologic   : 'newest first',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';

  });
  
  sort_select = '<label for="sortby" title="sort by"><i class="fa-solid fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  let endpoint_page = 'search';

  if ( sortby === 'chronologic' ){

    endpoint_page = 'search_by_date';

  }

  // see: https://hn.algolia.com/api
  const search_url = 'https://hn.algolia.com/api/v1/' + endpoint_page + '?query=' + keyword + '&page=' + page + '&hitsPerPage=' + page_size;

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.hits || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label			= '';
          let label_url = '';
					let img  			= '';
					let url  			= '';
					let comments_link = '';
					let date			= '';
					let desc 			= '';
					let subtitle	= '';
					let subtitle2 = '';

					let author= '';

          if ( valid( v.title ) ){

            label  = v.title;

          }
          else {

            if ( valid( v.story_title ) ){

              label  = v.story_title;

            }
            else {

              label = '---';

            }

          }

          if ( valid( v.created_at ) ){

            date  = v.created_at.split('T')[0];
            //date  = '<div class="mv-extra-date" title="creation date">' + v.created_at.split('T')[0] + '</div>';

          }


          if ( valid( v.url ) ){

            label_url = v.url;

          }
          else {

            if ( valid( v.story_url ) ){

              label_url = v.story_url;

            }

          }


          if ( valid( v.objectID ) ){

            const comments_url = 'https://news.ycombinator.com/item?id=' + v.objectID;

            comments_link = '<div class="mv-extra-date" title="comments"><a href="javascript:void(0)" class="mv-extra-icon" title="comments" aria-label="comments" onclick="openInNewTab( &quot;' + comments_url + '&quot;)" onauxclick="openInNewTab( &quot;' + label_url + '&quot;)"><i class="fa-brands fa-hacker-news"></i></a> &nbsp;' + date + '<div>';

          }

          /*
					if ( v._highlightResult?.title?.value ){

            desc = '<details class="inline-abstract"><summary><small><i class="fa-solid fa-ellipsis-h"></i></small></summary>' + v._highlightResult.title.value + '</details>';

          }
          */

          obj[ 'label-' + i ] = {

            title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="topic" aria-label="topic" onclick="openInNewTab( &quot;' + label_url + '&quot;)" onauxclick="openInNewTab( &quot;' + label_url + '&quot;)"> ' + label + '</a>' + comments_link + desc ),

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

          source        : 'hackerNews',
          link          : 'https://hn.algolia.com/?q=' + keyword,
          results_shown : Object.keys( obj ).length, 
          total_results : response.nbHits,
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
