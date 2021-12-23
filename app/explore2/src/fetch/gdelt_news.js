async function fetchGN( args, url ){

  let keyword = args.topic.split(' ').splice(0,5).join(' ');
  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword			= encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '   "' ); // add some extra spaces to avoid the API error message: "phrase too short".

  // see:
  //  https://blog.gdeltproject.org/gdelt-2-0-television-api-debuts/
  //  https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
  //  https://api.gdeltproject.org/api/v2/tv/tv?query=tesla%20market:%22International%22&mode=clipgallery&format=json&datanorm=perc&timelinesmooth=0&datacomb=sep&last24=yes&timezoom=yes&TIMESPAN=3y
  const search_url = 'https://api.gdeltproject.org/api/v2/context/context?format=html&query=' + keyword + '&mode=artlist&maxrecords=50&format=json&isquote=0';

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.articles || [];

        json = sortObjectsArray( json, 'seendate').reverse();

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
					let img   = '';
					let url   = '';
					let date  = '';
					let desc  = '';

          if ( typeof v.seendate === undefined || typeof v.seendate === 'undefined' ){
            date = '';
          }
          else {

            let d = v.seendate.split('T')[0];
            d = [ d.slice(0, 4), d.slice(4,6), d.slice(6,8) ].join('-');
            date  = ' <div class="mv-extra-date">' + d + '</div>';

          }

          desc	= valid( v.context  ) ? date + getAbstract( v.context, keyword_match ) : '';

					label = valid( v.title ) ? v.title : '---';

					url 	= valid( v.url ) ? v.url : '';

					img 	= valid( v.socialimage ) ? v.socialimage : '';

          if ( valid( v.domain ) ){

            label  += ' (' + v.domain + ')';

          }


          obj[ 'label-' + i ] = {

            title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="topic" aria-label="topic" onclick="openInNewTab( &quot;' + url + '&quot;)" onauxclick="openInNewTab( &quot;' + url + '&quot;)"> ' + decodeURIComponent( label ) + '</a>' + desc ),

            thumb_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" onclick="openInNewTab( &quot;' + url + '&quot;)" onauxclick="openInNewTab( &quot;' + url + '&quot;)"> ' + '<div class="mv-thumb"><img class="thumbnail" src="' + img + '" alt="" loading="lazy"></div>' + '</a>' ),

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

          source        : 'GDELT news',
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

