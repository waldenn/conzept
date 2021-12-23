async function fetchRijksmuseum( args, total_results, page, sortby ){

  const fname = 'fetchRijksmuseum';

  args = unpackString( args );

  let page_size = 20;

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
  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' ); // add some extra spaces to avoid the API error message: "phrase too short".

  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    relevance   : 'relevance',
    achronologic: 'newest first',
    chronologic : 'oldest first',
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
  
  sort_select = '<label for="sortby" title="sort by"><i class="fas fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  let lang;

  if ( ['en', 'nl'].includes( explore.languages ) ){

    lang = explore.lang; 

  }
  else {

    lang = 'en';

  }

  // see:
  //  https://data.rijksmuseum.nl/user-generated-content/api/
  //  https://www.rijksmuseum.nl/en/rijksstudio/my/profile
  const search_url = 'https://www.rijksmuseum.nl/api/' + lang + '/collection?key=8MT2OLE3&imgonly=true&s=' + sortby + '&p=' + page + '&ps=' + page_size + '&q=' + keyword;

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.artObjects || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label			= '';
          let label_url = '';
					let img  			= '';
					let url  			= '';
					let date			= '';
					let desc 			= '';
					let subtitle	= '';
					let subtitle2 = '';

					let author= '';

          if ( valid( v.title ) ){

            label  = v.title;

          }
          else {

            label = '---';


          }

          if ( v.links?.web ){

            label_url  = v.links.web;

          }

					if ( valid( v.longTitle ) ){

            desc = '<details class="inline-abstract"><summary><small><i class="fas fa-ellipsis-h"></i></small></summary>' + v.longTitle + '</details>';

          }

          if ( valid( v.principalOrFirstMaker ) ){

            subtitle = '<div class="mv-extra-desc"><a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic"' + setOnClick( Object.assign({}, args, { type: 'explore', title: v.principalOrFirstMaker, qid: '', language  : explore.language } ) ) + '">' + v.principalOrFirstMaker + '</a></div>';

          }

  
          if ( valid( v.webImage ) ){

            if ( valid( v.webImage.url ) ){

              img = v.webImage.url;

              // create IIIF-viewer-link
              let coll = { "images": [ ]};

              coll.images.push( [ img, label, encodeURIComponent( v.longTitle ), author, 'Rijksmuseum' ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

              if ( coll.images.length > 0 ){ // we found some images

                // create an IIIF image-collection file
                let iiif_manifest_link = '/app/response/iiif-manifest?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

                let iiif_viewer_url = '/app/iiif/#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

                url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

              }

            }

          }

          obj[ 'label-' + i ] = {

            title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="topic" aria-label="topic" onclick="openInNewTab( &quot;' + label_url + '&quot;)" onauxclick="openInNewTab( &quot;' + label_url + '&quot;)"> ' + decodeURIComponent( label ) + '</a>' + subtitle + subtitle2 ),

            thumb_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: url, title: args.topic } ) ) + '><div class="mv-thumb"><img class="thumbnail" src="' + img + '" alt="" loading="lazy"></div></a>' ),

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

          source        : 'Rijksmuseum',
          link          : 'https://www.rijksmuseum.nl/en/content-search?q=' + keyword,
          results_shown : Object.keys( obj ).length, 
          total_results : response.count,
          page          : page,
          call          : fname,
          sortby        : sortby,
          sort_select   : sort_select,
        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', response );

      }

	});

}
