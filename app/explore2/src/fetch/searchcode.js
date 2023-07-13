async function fetchSearchCode( args, url ){

  let keyword = args.topic.split(' ').splice(0,5).join(' ');
  keyword			= removeCategoryFromTitle( keyword );

  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword			= encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '   "' ); // add some extra spaces to avoid the API error message: "phrase too short".

  // see:  https://searchcode.com/api/
  const search_url = 'https://searchcode.com/api/codesearch_I/?q=' + keyword;

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.results || [];

        json = sortObjectsArray( json, 'name');

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
					let img   = '';
					let url   = '';
					let date  = '';
					let desc  = '';

          if ( typeof v.repo === undefined || typeof v.repo === 'undefined' ){
            desc = '';
          }
          else {

            desc  = '<div class="mv-extra-desc">' + v.repo + '</div>';

          }

          if ( typeof v.name === undefined || typeof v.name === 'undefined' ){
            label = '---';
          }
          else {

            label  = v.name;

          }

          if ( typeof v.url === undefined || typeof v.url === 'undefined' ){
            // do nothing
          }
          else {

						url = encodeURIComponent( JSON.stringify( v.url ) ); // TODO: is there are way to avoid the "%22 replaces()" ?

          }
 
          obj[ 'label-' + i ] = {

						title_link:						encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: url , title: args.topic } ) ) + '> ' + label + '</a>' + desc ),

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

				insertMultiValuesHTML( args, obj );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', thrownError);

      }

	});

}
