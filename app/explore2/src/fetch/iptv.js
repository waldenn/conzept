async function fetchIPTV( args, url ){

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: url,

			dataType: "json",

			success: function( response ) {

				if ( typeof response.releases === undefined || typeof response.releases === 'undefined' ){
					return 1;
				}

			},
      error: function (xhr, ajaxOptions, thrownError) { // NOTE: this always responds with an error, why? because of the ".m3u" mediatype?

				let json = parseIPTV( xhr.responseText ) || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
          let		qid = '';
					let		img = '';
					let		url = '';

					label = valid( v.channel_name ) ? v.channel_name : '---';
					img		= valid( v.img ) ? v.img : '';
					url		= valid( v.video_url ) ? encodeURI( JSON.stringify( '/app/tv/build/?url=' + v.video_url ) ) : '';

          obj[ 'label-' + i ] = {

						title_link: encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: JSON.parse( decodeURI( url ) ), title: args.topic } ) ) + '> ' + label + '</a>' ),

            thumb_link: encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: JSON.parse( decodeURI( url ) ), title: args.topic } ) ) + '><div class="mv-thumb"><img class="thumbnail" src="' + img + '" alt="" loading="lazy"></div></a>' ),

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

      }

	});

}

async function parseIPTV( list = '' ){

  let lista = list

  if (!lista.includes('#EXTM3U')){
    return 'getJsonList error: this is not a IPTV list'
  }

  lista = lista + " SENYDE";
  lista = lista.split("#EXTINF").join("SENYDEEXTINF");
  lista = lista.split('",').join('"SCNLGME ')

  let channels = []

  let lista_em_array = lista.match(/EXTINF([\S\s]*?)SENYDE/g);

  lista_em_array.forEach((ch) => {

    let img = null;

    if (ch.match(/tvg-logo="([\S\s]*?)"/i)) {
      img = ch.match(/tvg-logo="([\S\s]*?)"/i)[1];
    }

    //console.log( ch );

    let nome = '---';

    let nome_check = ch.match(/"SCNLGME([\S\s]*?)http/i);

    if ( nome_check === null ){ // TODO: figure out why some regex-matches fail

      //console.log( t1 );
      //console.log( 'foo');

    }
    else {

      nome = ch.match(/"SCNLGME([\S\s]*?)http/i)[1];
      nome = nome.replace("\r", "");
      nome = nome.replace("\n", "");

    }

    let grupo = null;

    if (ch.match(/group-title="([\S\s]*?)"/i)) {
      grupo = ch.match(/group-title="([\S\s]*?)"/i)[1];
    }

    let link = "null";

    if (ch.match(/https?:\/\/[^\s]+/gi).length == 1) {
      link = ch.match(/https?:\/\/[^\s]+/gi)[0];
    }
		else {
      link = ch.match(/https?:\/\/[^\s]+/gi)[1];
    }

    channels.push({
      channel_name: nome,
      img: img,
      group: grupo,
      video_url: link,
    });

  });

  return channels;
}
