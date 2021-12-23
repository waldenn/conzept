async function fetchGTV( args, url ){

  let keyword       = args.topic.split(' ').splice(0,5).join(' ');
  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword           = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' );

  // see:
  //  https://blog.gdeltproject.org/gdelt-2-0-television-api-debuts/
  //  https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
  //  https://api.gdeltproject.org/api/v2/tv/tv?query=tesla%20market:%22International%22&mode=clipgallery&format=json&datanorm=perc&timelinesmooth=0&datacomb=sep&last24=yes&timezoom=yes&TIMESPAN=3y
  const search_url = 'https://api.gdeltproject.org/api/v2/tv/tv?query=' + keyword + '%20market:%22International%22&mode=clipgallery&format=json&datanorm=perc&timelinesmooth=0&datacomb=sep&last24=yes&timezoom=yes&TIMESPAN=3y';

	let obj = {};

  args.type = 'link'; // reduce the "wikipedia-qid-sparql' type

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.clips || [];

        json = sortObjectsArray( json, 'date').reverse();

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
					let img   = '';
					let url   = '';
					let date  = '';
					let desc  = '';


          if ( valid( v.date  ) ){

            date  = ' <div class="mv-extra-date">' + v.date.split('T')[0] + '</div>';

          }
          else {

            date = '';

          }

          if ( valid( v.snippet ) ){

            desc = date + getAbstract( v.snippet, keyword_match );

          }
          else {

            desc = '';

          }


					label = valid( v.station ) ? v.station : '---';

          if ( valid( v.show ) ){

            label  += ' : ' + v.show;

          }

          if ( valid( v.preview_url ) ){

						url = encodeURIComponent( JSON.stringify( v.preview_url ) );

          }
 
          if ( valid( v.preview_thumb ) ){

						img = v.preview_thumb;

          }

          obj[ 'label-' + i ] = {

						title_link: encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: JSON.parse( decodeURI( url ) ), title: args.topic } ) ) + '> ' + decodeURIComponent( label ) + '</a>' + desc ),

            thumb_link: encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: JSON.parse( decodeURI( url ) ), title: args.topic } ) ) + '><div class="mv-thumb"><img class="thumbnail" src="' + img + '" alt="" loading="lazy"></div></a>' ),

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

          source        : 'GDELT TV',
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
