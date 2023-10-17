async function fetchPexels( args, total_results, page, sortby ){

  const fname = 'fetchPexels';

  args = unpackString( args );

  let page_size = 10;

  if ( total_results === null ){ // first request

    page = 1;

  }
  else { // fetch more if needed

    if ( ( (page - 1) * page_size ) < total_results ){ // more to fetch

      // insert loader icon
      let sel     = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';
      let loader  = '<img class="loaderMV" alt="loading" width="36" height="36" src="/app/explore2/assets/images/loading.gif"/>';
      $( sel ).append( loader );

    }
    else { // no more results

      $( '.mv-loader.' + args.id ).remove();

      return 0;

    }

  }

  let keyword = args.topic.replace(/\(.*?\)/g, '').trim();
  keyword			= removeCategoryFromTitle( keyword );

  //let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword			= encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' ); // add some extra spaces to avoid the API error message: "phrase too short".

  /*
  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    relevance   : 'relevance',
    chronologic : 'oldest first',
    achronologic: 'newest first',
    objecttype  : 'object type',
    artist      : 'creator',
    artistdesc  : 'description',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';

  });
  
  sort_select = '<label for="sortby" title="sort by"><i class="fa-solid fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value );" data-title="' + args.title + '">' + sort_select_options + '</select>';
  */

  let lang;

  if ( [ 'en-US', 'pt-BR', 'es-ES', 'ca-ES', 'de-DE', 'it-IT', 'fr-FR', 'sv-SE', 'id-ID', 'pl-PL', 'ja-JP', 'zh-TW', 'zh-CN', 'ko-KR', 'th-TH', 'nl-NL', 'hu-HU', 'vi-VN', 'cs-CZ', 'da-DK', 'fi-FI', 'uk-UA', 'el-GR', 'ro-RO', 'nb-NO', 'sk-SK', 'tr-TR', 'ru-RU' ].includes( explore.voice_code ) ){

    lang = explore.voice_code; 

  }
  else {

    lang = 'en-US';

  }

  // see: https://www.pexels.com/api/documentation/#photos-search
  const search_url = 'https://api.pexels.com/v1/search?&locale=' + lang + '&page=' + page + '&per_page=' + page_size + '&query=' + keyword;

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

      headers: {
        'Authorization': '563492ad6f917000010000014808215632654fea8a525d4270585f00',
      },

			success: function( response ) {

				let json = response.photos || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label			= '';
					let img  			= '';
					let url  			= '';
					let date 			= '';
					let desc 			= '';
					let subtitle	= '';

					let author		= '';
					let thumb 		= '';

          if ( typeof v.photographer === undefined || typeof v.photographer === 'undefined' ){
            // do nothing
          }
          else {

            author  = v.photographer;
            label   = v.photographer;
            label_url  = encodeURIComponent( JSON.stringify( v.photographer_url ) );

          }
  
          if ( typeof v.src === undefined || typeof v.src === 'undefined' ){
            thumb = '---';
          }
          else {

            thumb = v.src.medium;
            img   = v.src.original;

            // create IIIF-viewer-link
            let coll = { "images": [ ]};

            coll.images.push( [ img, label, author, author, 'Pexel' ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

            if ( coll.images.length > 0 ){ // we found some images

              // create an IIIF image-collection file
              let iiif_manifest_link = '/app/response/iiif-manifest.php?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

              let iiif_viewer_url = '/app/iiif/index.html#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

              url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

            }

          }

          obj[ 'label-' + i ] = {

            title_link:						encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: label_url , title: args.topic } ) ) + '> ' + label + '</a>' + desc + subtitle ),

            thumb_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: url, title: args.topic } ) ) + '><div class="mv-thumb"><img class="thumbnail" src="' + img + '" alt="" loading="lazy"></div></a>' ),

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

          source        : 'Pexels',
          link          : 'https://www.pexels.com/search/' + keyword,
          results_shown : Object.keys( obj ).length, 
          total_results : response['total_results'],
          page          : page,
          call          : fname,
          //sortby        : sortby,
          //sort_select   : sort_select,
        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', thrownError);
      }

	});

}
