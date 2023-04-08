async function fetchCurrentsAPI( args, url ){

  let keyword       =  args.topic.split(',')[0].split('(')[0].trim();
  let keyword_match = keyword.replace(/["#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword           = encodeURIComponent( keyword.replace(/["#_()!]/g, '').replace(/[\-]/g, ' ').trim() );

  // see:
  //  https://currentsapi.services/api/docs/
  //  free restrictions: 600 req/day, max. max. 6 month history
  //
  // TODO: research news-API alternatives:
  //  https://en.wikipedia.org/wiki/List_of_news_media_APIs
  //  https://www.microsoft.com/en-us/bing/apis/pricing
  const search_url = 'https://api.currentsapi.services/v1/search?keywords=' + keyword + '&language=' + explore.language + '&apiKey=b4okvEUPkOGWqr_Ti9iNObQraQdNuvoFUIBqyBXgXII3EKFF';

	let obj = {};

  args.type = 'url';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.news || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
					let img   = '';
					let url   = '';
					let date  = '';
					let desc  = '';

          if ( valid( v.published ) ){

            date  = ' <div class="mv-extra-date">' + v.published.split(' ')[0] + '</div>'; // strip any date info after first space

          }

          if ( valid( v.description ) ){

            desc = date + getAbstract( v.description, keyword_match );

          }

					label = valid( v.title ) ? v.title : '---';
					url		= valid( v.url ) ? v.url : '';
					img		= valid( v.image ) ? v.image : '';

          obj[ 'label-' + i ] = {

            title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="topic" aria-label="topic" onclick="openInNewTab( &quot;' + url + '&quot;)" onauxclick="openInNewTab( &quot;' + url + '&quot;)"> ' + label + '</a>' + desc ),

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

				insertMultiValuesHTML( args, obj );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', thrownError);

      }

	});

}


