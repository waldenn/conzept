async function fetchWikiSource( args, url ){

  let keyword = args.topic;
  keyword			= removeCategoryFromTitle( keyword );
  keyword			= encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' ); // add some extra spaces to avoid the API error message: "phrase too short".

  const search_url = 'https://' + explore.language + '.wikisource.org/w/api.php?action=query&srlimit=50&format=json&list=search&redirects=1&srsearch=' + keyword + '&srnamespace=0&srenablerewrites=1';

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			jsonp: "callback",

			dataType: "jsonp",

			success: function( response ) {

				let json = response.query.search || [];

        json = sortObjectsArray( json, 'title' );

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
					let img   = '';
					let url   = '';
					let date  = '';
					let subtitle  = '';
					let subtitle2  = '';

					let abstract_ = '';

          if ( typeof v.timestamp === undefined || typeof v.timestamp === 'undefined' ){
            date = '';
          }
          else {

            let d = v.timestamp.split('T')[0];
            date  = ' <div class="mv-extra-date">' + d + '</div>';

          }

          if ( typeof v.title === undefined || typeof v.title === 'undefined' ){

            label = '---';

          }
          else {

            label = v.title;
            url   = encodeURIComponent( JSON.stringify( 'https://' + explore.language + '.wikisource.org/wiki/' + v.title ) );

          }

          if ( typeof v.snippet === undefined || typeof v.snippet === 'undefined' ){
            desc = date;
          }
          else {

            desc = date + '<details class="inline-abstract"><summary><small><i class="fa-solid fa-ellipsis-h"></i></small></summary>' + v.snippet.replace(/searchmatch/g, 'highlight') + '</details>';

          }

          obj[ 'label-' + i ] = {

						title_link:						encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: url , title: args.topic } ) ) + '> ' + label + '</a>' + desc ),

            thumb_link: 					'',

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

          source        : 'WikiSource',
          link          : 'https://' + explore.language + '.wikisource.org/w/index.php?sort=last_edit_desc&search=' + keyword + '&title=Special%3ASearch&profile=advanced&fulltext=1&advancedSearch-current=%7B%7D&ns0=1&ns14=1',
          results_shown : Object.keys(obj).length,
          total_results : response.query.searchinfo.totalhits,

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError) {

				console.log( 'response: hmm...', thrownError);

      }

	});

}
