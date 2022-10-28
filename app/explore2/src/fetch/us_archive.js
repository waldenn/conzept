function fetchUSArchive( args, total_results, page, sortby ){

  const fname = 'fetchUSArchive';

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

  let keyword				= args.topic.replace(/\(.*?\)/g, '').trim();

  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();

  keyword						= encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' ); // add some extra spaces to avoid the API error message: "phrase too short".

  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    relevance     : 'relevance',
    id_asc        : 'ID ascending',
    id_desc       : 'ID descending',
    //timestamp   : 'newest first',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';

  });
  
  sort_select = '<label for="sortby" title="sort by"><i class="fa-solid fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  let sortby_param = '&sort=' + sortby;

  if ( sortby === 'relevance' ){ // "relevance" is used when the sort is _omitted_, there is seems to be no other string to set it.

    sortby_param = '';

  }
  else if ( sortby === 'id_asc' ){

    sortby_param = '&sort=naId%20asc';

  }
  else if ( sortby === 'id_desc' ){

    sortby_param = '&sort=naId%20desc';

  }

  let offset = ( (page - 1) * page_size );

  // see:
  //  https://github.com/usnationalarchives/Catalog-API/blob/master/search_and_export.md
  //  https://github.com/usnationalarchives/Catalog-API
  //
  //  TODO: fetch the "parentDescriptionNaId"-JSON to get metadata for items which have none.
  const search_url = 'https://catalog.archives.gov/api/v1/?q=' + keyword + '&rows=' + page_size + '&offset=' + offset + sortby_param;

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			jsonp: "callback",

			dataType: "json",

			success: function( response ) {

				let json = response.opaResponse.results.result || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label     = '';
					let thumb     = '';
					let img       = '';
					let url       = '';
					let viewer_url= '';
					let date      = '';
					let desc      = '';
					let desc_plain= '';
					let subtitle  = '';
					let subtitle2 = '';
					let newtab    = 'false';
					let title_link= '';

          // TODO: add web-link support also

					let abstract_ = '';

          if ( v.naId ){

            url		= 'https://catalog.archives.gov/id/' + v.naId;
            label = v.naId;

          }
          else if ( valid( v.parentDescriptionNaId ) ){

            url   = 'https://catalog.archives.gov/id/' + v.parentDescriptionNaId;
            label = v.parentDescriptionNaId;

          }

          if ( valid( v.title ) ){ // "archivesWeb"-type

            label = v.title;

            if ( valid( v.url ) ){

              url = encodeURIComponent( JSON.stringify( v.url ) );
              newtab  = true;

            }

            if ( valid( v.teaser ) ){

              desc = '<details class="inline-abstract"><summary><small><i class="fa-solid fa-ellipsis-h"></i></small></summary>' + v.teaser + '</details>';

            }

          }
          else if ( v.description?.item?.title ){

            label = v.description.item.title;

          }
          else if ( v.description?.fileUnit?.title ){

            label = v.description.fileUnit.title;

          }
          else if ( v.description?.series?.title ){

            label = v.description.series.title;

          }
          else if ( v.description?.itemAv?.title ){

            label = v.description.itemAv.title;

            console.log( 'v.description.itemAv.title: ', label );

          }

          label = label.replace('\n', ' ').trim();

          if ( v.description?.fileUnit?.scopeAndContentNote ){

            desc = getAbstract( v.description.fileUnit.scopeAndContentNote, keyword_match );
            desc_plain = v.description.fileUnit.scopeAndContentNote;

          }
          else if ( v.description?.itemAv?.scopeAndContentNote ){

            desc = getAbstract( v.description.itemAv.scopeAndContentNote, keyword_match );
            desc_plain = v.description.itemAv.scopeAndContentNote;

          }
          else if ( v.description?.parentSeries?.title ){

            desc = getAbstract( v.description.parentSeries.title, keyword_match );
            desc_plain = v.description.parentSeries.title;

          }
          else if ( v.publicContributions?.transcription?.text ){

            desc = getAbstract( v.publicContributions.transcription.text, keyword_match );
            desc_plain = v.publicContributions.transcription.text;

          }

          desc_plain = desc_plain.replace('\n', ' ').trim();

          //if ( v.description?.fileUnit?.scopeAndContentNote ){

            //date  = ' <div class="mv-extra-date">' + d + '</div>';

          //}

          if ( v.objects?.object?.thumbnail ){

            thumb = v.objects.object.thumbnail['@url'];

          }

          //else if ( v.objects?.object?.file ){
            //img = v.objects.object.file['@url'];
          //}

          if ( v.objects?.object?.file ){

            file_url = v.objects.object.file['@url'];

            if ( valid( file_url ) ){

              const file_extension = file_url.split('.').pop();
    
              const image_types = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff' ];

              if ( image_types.includes( file_extension.toLowerCase() ) ){ // valid image

                // create IIIF-viewer-link
                let coll = { "images": [ ]};

                // for each image add:
                coll.images.push( [ file_url, label, encodeURIComponent( desc_plain ), '-', 'US Archives' ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

                if ( coll.images.length > 0 ){ // we found some images

                  // create an IIIF image-collection file
                  let iiif_manifest_link = '/app/response/iiif-manifest?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

                  let iiif_viewer_url = '/app/iiif/#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

                  viewer_url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

                }

              }
              else { // non-image media

                viewer_url = encodeURIComponent( JSON.stringify( encodeURIComponent( file_url ) ) );

              }

            }

          }

          if ( newtab === true ){

            title_link = encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="opens in new tab" aria-label="opens in new tab" onclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)" onauxclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)"> ' + decodeURIComponent( label ) + '</a>' + desc );

          }
          else {

						title_link = encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: url , title: args.topic } ) ) + '> ' + label + '</a>' + desc );

          }

          obj[ 'label-' + i ] = {

						title_link:						title_link,

            thumb_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: viewer_url, title: args.topic } ) ) + '><div class="mv-thumb"><img class="thumbnail" src="' + thumb + '" alt="" loading="lazy"></div></a>' ),

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

          source        : 'US Archive',
          link          : 'https://catalog.archives.gov/search?q=' + keyword,
          results_shown : Object.keys(obj).length,
          total_results : response.opaResponse.results.total,
          page          : page,
          call          : fname,
          sortby        : sortby,
          sort_select   : sort_select,

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError) {

				console.log( 'response: hmm...', response );

      }

	});

}
