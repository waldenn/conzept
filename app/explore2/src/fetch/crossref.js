async function fetchCrossRef( args, total_results, page, sortby, cursor ){

  const fname = 'fetchCrossRef';

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

  let keyword = args.topic;
  keyword = removeCategoryFromTitle( keyword );

  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' ); // add some extra spaces to avoid the API error message: "phrase too short".

  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    relevance   : 'relevance',
    published   : 'published',
    issued      : 'issued',
    updated     : 'updated',
    //'is-referenced-by-count' : 'reference count',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';

  });
  
  sort_select = '<label for="sortby" title="sort by"><i class="fa-solid fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value, &quot;*&quot; );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  // see: https://github.com/CrossRef/rest-api-doc
  const search_url = 'https://api.crossref.org/works?query=' + keyword + '&rows=' + page_size + '&cursor=' + cursor + '&sort=' + sortby + '&order=desc';

	let obj = {};

  args.type = 'url';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				if ( typeof response.message === undefined || typeof response.message === 'undefined' ){
					return 1;
				}
				else if ( typeof response.message.items === undefined || typeof response.message.items === 'undefined' ){
					return 1;
				}

				let json = response.message.items || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				if ( typeof response.message === undefined || typeof response.message === 'undefined' ){

          cursor = '*';

        }
        else { // we have a cursor-value

          cursor = response.message['next-cursor'];

        }

				$.each( json, function ( i, v ) {

          let label			= '';
					let subtitle	= '';
					let subtitle2 = '';
					let img 			= '';
					let url 			= '';
					let date 			= '';
					let desc 			= '';

					let abstract_ = '';

          if ( typeof v.indexed['date-time'] === undefined || typeof v.indexed['date-time'] === 'undefined' ){
            date = '';
          }
          else {

            let d = v.indexed['date-time'].split('T')[0];
            date  = ' <div class="mv-extra-date">' + d + '</div>';

          }


          if ( typeof v.title === undefined || typeof v.title === 'undefined' ){

            label = '---';

          }
          else {

            if ( typeof v.title[0] === undefined || typeof v.title[0] === 'undefined' ){

              label = '---';

            }
            else {

              label = v.title[0];

            }

          }

          if ( typeof v.publisher === undefined || typeof v.publisher === 'undefined' ){
            //label = '';
          }
          else {

            subtitle = '<div class="mv-extra-desc"><a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic"' + setOnClick( Object.assign({}, args, { type: 'explore', title: v.publisher, qid: '', language  : explore.language } ) ) + '">' + v.publisher + '</a></div>';

          }

          /* // TODO: add abstract info from v.abstracts[0].body
          if ( typeof v._highlights === undefined || typeof v._highlights === 'undefined' ){
            abstract_ = ;
          }
          else {
          }
          */

          if ( typeof v.abstract === undefined || typeof v.abstract === 'undefined' ){
            desc = date;
          }
          else {

            desc = date + getAbstract( $( v.abstract ).text(), keyword_match );

          }

          if ( typeof v.URL === undefined || typeof v.URL === 'undefined' ){
            // do nothing
          }
          else {

            url = encodeURIComponent( JSON.stringify( v.URL ) );

          }

          /*
          if ( typeof v.fulltext.thumbnail_url === undefined || typeof v.fulltext.thumbnail_url === 'undefined' ){
            // do nothing
          }
          else {

            img = v.fulltext.thumbnail_url;

          }
          */

          obj[ 'label-' + i ] = {

            title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="opens in new tab" aria-label="opens in new tab" onclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)" onauxclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)"> ' + decodeURIComponent( label ) + '</a>' + subtitle + subtitle2 + desc ),

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

          source        : 'CrossRef',
          link          : 'https://search.crossref.org/?from_ui=yes&q=' + keyword,
          results_shown : Object.keys(obj).length,
          total_results : response.message['total-results'],
          page          : page,
          call          : fname,
          sortby        : sortby,
          sort_select   : sort_select,
          cursor        : cursor,

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', thrownError);

      }

	});

}
