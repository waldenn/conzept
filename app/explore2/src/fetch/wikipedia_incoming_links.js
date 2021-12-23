

async function fetchInlinks( args, url ){

  let keyword = args.topic.split(' ').splice(0,5).join(' ');
  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword = encodeURIComponent( keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() );

  const search_url = 'https://' + explore.language + '.wikipedia.org/w/api.php?action=query&format=json&list=backlinks&bltitle=' + args.topic + '&bllimit=max';

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "jsonp",

			success: function( response ) {

				let json = response.query.backlinks || [];

        json = sortObjectsArray( json, 'title');

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = v.title;
          let qid   = '';
					let img   = '';
				  let url   = encodeURIComponent( JSON.stringify( '/app/wikipedia/?t=' + label + '&l=' + explore.language + '&voice=' + explore.voice_code ) );
					let date  = '';
					let desc  = '';

          obj[ 'label-' + i ] = {

            title_link : encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'wikipedia', qid: qid, title: label } ) ) + '>' + label + '</a><br/>' ),

            thumb_link:           '',

            explore_link:         encodeURIComponent( getExploreLink( args, label, qid ) ),
            video_link:           encodeURIComponent( getVideoLink( args, label ) ),
            wander_link:          encodeURIComponent( getWanderLink( args, label ) ),
            images_link:          encodeURIComponent( getImagesLink( args, label ) ),
            books_link:           encodeURIComponent( getBooksLink( args, label ) ),
            websearch_link:       encodeURIComponent( getWebsearchLink( args, label ) ),
            compare_link:         '',
            website_link:         '',
            custom_links:         '',
            raw_html:             '',
            mv_buttons_style:			'',

          };


				});

        let meta = {

          source        : 'incoming links',
          link          : '',
          results_shown : Object.keys( obj ).length, 
          total_results : Object.keys( obj ).length, 

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', response );

      }

	});

}
