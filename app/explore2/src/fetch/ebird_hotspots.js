async function fetchEbirdHotspots( args, url ){

  let keyword = args.topic;
  keyword = removeCategoryFromTitle( keyword );

  //let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '   "' ); // add some extra spaces to avoid the API error message: "phrase too short".

  let f		= args.list.split(':') || [];

  let lat = '';
  let lon = '';

  if ( valid( [ args.custom.lat, args.custom.lon ] ) ){

    lat = args.custom.lat; 
    lon = args.custom.lon; 

  }

  const search_url = 'https://trogon.onrender.com/proxy/ebird/v2/ref/hotspot/geo?lat=' + lat + '&lng=' + lon + '&fmt=json';

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
					let img   = '';
					let url   = '';
					let date  = '';
					let desc  = '';

					let loc_id= '';

          if ( valid( v.locId ) ){
            
            loc_id = v.locId;

						url = encodeURIComponent( JSON.stringify( 'https://trogon.onrender.com/challenge?location=' + loc_id ) );

          }

          if ( typeof v.locName === undefined || typeof v.locName === 'undefined' ){
            label = '---';
          }
          else {

            label  = v.locName;

          }

          if ( valid( v.countryCode ) ){

            desc  = '<div class="mv-extra-desc">' + v.countryCode + '</div>';

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

        let meta = {

          source        : 'eBird hotspot quizzes',
          link          : '',
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
