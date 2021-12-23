
async function fetchRadio( args, url ){

	let obj = {};

  args.type = 'link'; // reduce the "wikipedia-qid-sparql' type

	$.ajax({

			url: url,

			dataType: "json",

			success: function( response ) {

				let json = response || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
          let		qid = '';
					let		img = '';
					let		url = '';

          if ( valid(  v.url_resolved ) ){

            //if ( v.url_resolved.startsWith('http://') ){ // skip non-https URLs
            //  console.log('skip non-tls URL: ', v.url_resolved );
            //  return; // go to next item
            //}

						url = encodeURI( JSON.stringify( v.url_resolved.replace('"','') ) );

          }

					label = valid( v.name ) ? v.name : '---';

					img		= valid( v.favicon ) ? v.favicon : '';
 
          obj[ 'label-' + i ] = {

						title_link: encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: JSON.parse( decodeURI( url ) ), title: args.topic } ) ) + '> ' + label + '</a>' ),

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

				insertMultiValuesHTML( args, obj );

			},
      error: function (xhr, ajaxOptions, thrownError){

				if ( typeof response.releases === undefined || typeof response.releases === 'undefined' ){
					return 1;
				}

      }

	});

}
