async function fetchStocks( args, url ){

  let keyword = args.topic.split(',')[0].split('(')[0].trim();

  // TODO: research this keywork cleaning for better matching against the API.
  keyword = keyword.replace(' Group', ''); // Volkswage Group -> Volkswagen 

  const search_url = 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=' + keyword + '&apikey=9V66ST5SY883CWI1';

	let obj = {};

  args.type = 'link'; // reduce the "wikipedia-qid-sparql' type

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.bestMatches || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
					let img   = '';
					let url   = '';
					let	symbol= '';
					let	place = '';
					let	curr  = '';
					let	name  = '';
					let	qid   = '';

          if ( typeof v['2. name'] === undefined || typeof v['2. name'] === 'undefined' ){
            label = '---';
          }
          else {

            name  = v['2. name'];

          }

          if ( typeof v['1. symbol'] === undefined || typeof v['1. symbol'] === 'undefined' ){
            // do nothing
          }
          else {

            symbol = v['1. symbol'];
            curr = v['8. currency'];
            place  = '(' + v['4. region'] + ')';

            label = symbol + ' ' + place;

						url = encodeURIComponent( JSON.stringify( '/app/stock/?t=' + name + '&l=en&s=' + symbol + '&c=' + curr + '&p=' + place ) );

          }
 
          obj[ 'label-' + i ] = {

						title_link: encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: JSON.parse( decodeURI( url ) ), title: args.topic } ) ) + '> ' + label + '</a><br>' ),

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

				insertMultiValuesHTML( args, obj );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', thrownError);

      }

	});

}

