function fetchSmithsonian( args, total_results, page, sortby ){

  const fname = 'fetchSmithsonian';

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
  keyword			= encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' ); // add some extra spaces to avoid the API error message: "phrase too short".

  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    score         : 'relevance',
    timestamp     : 'newest first',
    COMPLETENESS  : 'completeness',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';

  });
  
  sort_select = '<label for="sortby" title="sort by"><i class="fas fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  let start_item = ( (page - 1) * page_size );

  // see: http://edan.si.edu/openaccess/apidocs/
  const search_url = 'https://api.si.edu/openaccess/api/v1.0/search?q=' + keyword + '&rows=' + page_size + '&start=' + start_item + '&api_key=jWNRrR9oQ2V4mzj5cDdldlYSZbQs3tG22f8aqZTJ';

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			jsonp: "callback",

			dataType: "json",

			success: function( response ) {

				let json = response.response.rows || [];

        json = sortObjectsArray( json, 'title' );

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label     = '';
					let img       = '';
					let url       = '';
					let date      = '';
					let desc      = '';
					let subtitle  = '';
					let subtitle2 = '';

          // TODO: add web-link support also

					let abstract_ = '';

          if ( typeof v.content.freetext.date === undefined || typeof v.content.freetext.date === 'undefined' ){
            date = '';
          }
          else {

            let d = v.content.freetext.date[0].content; // YYYY
            date  = ' <div class="mv-extra-date">' + d + '</div>';

          }

          if ( typeof v.title === undefined || typeof v.title === 'undefined' ){

            label = '---';

          }
          else {

            label = v.title;

          }

          if ( typeof v.content.indexedStructured === undefined || typeof v.content.indexedStructured === 'undefined' ){
            // do nothing
          }
          else {

            if ( typeof v.content.indexedStructured.name === undefined || typeof v.content.indexedStructured.name === 'undefined' ){
              // do nothing
            }
            else {

				      $.each( v.content.indexedStructured.name, function ( j, name_ ) {

                if ( typeof name_ === 'object' ){ // TODO? skip this name within an object for now

                  return;

                }

                let name = name_.split(/,/).reverse().join(' ').replace(/\s\s+/g, ' ');;

                subtitle += '<div class="mv-extra-desc"><a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic"' + setOnClick( Object.assign({}, args, { type: 'explore', title: name, qid: '', language  : explore.language } ) ) + '">' + name + '</a></div>';

              });

            }

          }

          if ( typeof v.content.descriptiveNonRepeating === undefined || typeof v.content.descriptiveNonRepeating === 'undefined' ){
            // do nothing
          }
          else {

            if ( typeof v.content.descriptiveNonRepeating.data_source === undefined || typeof v.content.descriptiveNonRepeating.data_source === 'undefined' ){
              // do nothing
            }
            else {

              subtitle2 = '<div class="mv-extra-desc"><a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic"' + setOnClick( Object.assign({}, args, { type: 'explore', title: v.content.descriptiveNonRepeating.data_source, qid: '', language  : explore.language } ) ) + '"> source: ' + v.content.descriptiveNonRepeating.data_source + '</a></div>';

            }

            if ( typeof v.content.descriptiveNonRepeating.guid === undefined || typeof v.content.descriptiveNonRepeating.guid === 'undefined' ){
              // do nothing
            }
            else {

              url = v.content.descriptiveNonRepeating.guid;

            }

            if ( typeof v.content.descriptiveNonRepeating.record_link === undefined || typeof v.content.descriptiveNonRepeating.record_link === 'undefined' ){

              // do nothing

            }
            else {

              url = v.content.descriptiveNonRepeating.record_link;

            }

            if ( typeof v.content.descriptiveNonRepeating.online_media === undefined || typeof v.content.descriptiveNonRepeating.online_media === 'undefined' ){

              // do nothing

            }
            else {

              img = v.content.descriptiveNonRepeating.online_media.media[0].thumbnail;

            }

          }

          if ( typeof v.content.freetext.physicalDescription === undefined || typeof v.content.freetext.physicalDescription === 'undefined' ){

            // do nothing

          }
          else {

            desc  = date;

          }

          obj[ 'label-' + i ] = {

            title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="opens in new tab" aria-label="opens in new tab" onclick="openInNewTab( &quot;' + url + '&quot;)"> ' + label + '</a>' + subtitle + subtitle2 + desc ),

            thumb_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="opens in new tab" aria-label="opens in new tab" onclick="openInNewTab( &quot;' + url + '&quot;)"> <div class="mv-thumb"><img class="thumbnail" src="' + img + '" alt="" loading="lazy"></div></a>'),

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

          source        : 'Smithsonian',
          link          : 'https://www.si.edu/search?edan_q=' + keyword + '&',
          results_shown : Object.keys(obj).length,
          total_results : response.response.rowCount,
          page          : page,
          call          : fname,
          //sortby        : sortby,
          //sort_select   : sort_select,

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError) {

				console.log( 'response: hmm...', response );

      }

	});

}
