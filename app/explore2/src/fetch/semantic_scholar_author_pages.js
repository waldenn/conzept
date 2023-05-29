async function fetchSemanticScholarAuthorPapers( args, url ){

  let keyword = args.topic;
  keyword			= removeCategoryFromTitle( keyword );

  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();

  keyword			= encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '   "' ); // add some extra spaces to avoid the API error message: "phrase too short".

  let f = args.list.split(':') || [];
  let author_id = '';

  if ( valid( f[1] ) ){

    author_id = f[1]; 

  }

  // see:  https://api.semanticscholar.org
  const search_url = 'https://api.semanticscholar.org/v1/author/' + author_id;

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.papers || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
					let img   = '';
					let url   = '';
					let date  = '';
					let desc  = '';

          if ( typeof v.year === undefined || typeof v.year === 'undefined' ){
            date = '';
          }
          else {

            date  = '<div class="mv-extra-desc">' + v.year + '</div>';

          }

          if ( typeof v.title === undefined || typeof v.title === 'undefined' ){
            label = '---';
          }
          else {

            label  = v.title;

          }

          if ( typeof v.url === undefined || typeof v.url === 'undefined' ){
            // do nothing
          }
          else {

						url = encodeURIComponent( JSON.stringify( v.url ) ); // TODO: is there are way to avoid the "%22 replaces()" ?

            //console.log( url );

          }
 
          obj[ 'label-' + i ] = {

						title_link:						encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'url', url: url , title: args.topic } ) ) + '> ' + label + '</a>' + desc + date ),

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

          source        : 'Semantic Scholar author papers',
          link          : 'https://www.semanticscholar.org/author/' + encodeURIComponent( keyword ) + '/' + author_id,
          results_shown : Object.keys(obj).length,
          total_results : Object.keys(obj).length,

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', thrownError);

      }

	});

}
