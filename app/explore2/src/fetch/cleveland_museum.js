async function fetchCleveland( args, total_results, page, sortby ){

  const fname = 'fetchCleveland';

  args = unpackString( args );

  let page_size = 20;
  let offset    = 0;

  if ( total_results === null ){ // first request

    page = 1;

  }
  else { // fetch more if needed

    if ( ( (page - 1) * page_size ) < total_results ){ // more to fetch

      offset = ( page - 1 ) * page_size;

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
  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' );

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

  // see: https://openaccess-api.clevelandart.org
  const search_url = 'https://openaccess-api.clevelandart.org/api/artworks/?q=' + keyword + '&skip=' + offset + '&limit=' + page_size + '&has_image=1';

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.data || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
          let label_url = '';
					let thumb = '';
					let img   = '';
					let url   = '';
					let date  = '';
					let desc  = '';
					let desc_plain = '';
					let subtitle = '';
					let subtitle2 = '';

					let author= '';

          if ( valid( v.title ) ){
            label  = v.title;
          }
          else {
            label = '---';
          }

          if ( valid( v.url ) ){

            label_url  = v.url;

          }

          if ( valid( v.creation_date ) ){
            date = v.creation_date;

            subtitle = '<div class="mv-extra-desc">' + date + '</div>';
          }

          if ( valid( v.digital_description ) ){

            subtitle2		= '<details class="inline-abstract"><summary><small><i class="fa-solid fa-ellipsis-h"></i></small></summary>' + v.digital_description + '</details>';

            desc_plain	= v.digital_description;

          }

          if ( valid(  v.creators ) ){

            // TODO: make this work for multiple authors!

            subtitle += '<div class="mv-extra-desc"><a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'explore', title: v.creators[0].description, qid: '', language  : explore.language } ) ) + '">' + v.creators[0].description + '</a></div>';

            author = v.creators[0].description;

          }

          if ( v.images?.web?.url ){
            thumb = v.images.web.url;
          }

          if ( v.images?.print?.url ){

              img = v.images.print.url;

              // create IIIF-viewer-link
              let coll = { "images": [ ]};

              // for each image add:
              coll.images.push( [ img, label, encodeURIComponent( desc_plain + ' (' + date  + ')' ), author, 'Cleveland Museum of Art (CC0-licensed)' ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

              if ( coll.images.length > 0 ){ // we found some images

                // create an IIIF image-collection file
                let iiif_manifest_link = '/app/response/iiif-manifest.php?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

                let iiif_viewer_url = '/app/iiif/dist/uv.html#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

                url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

              }

          }

          obj[ 'label-' + i ] = {

            title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="opens in new tab" aria-label="opens in new tab" role="button" onclick="openInNewTab( &quot;' + label_url + '&quot;)" onauxclick="openInNewTab( &quot;' + label_url + '&quot;)"> ' + decodeURIComponent( label ) + '</a>' + subtitle + subtitle2 ),

            thumb_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: url, title: args.topic } ) ) + '><div class="mv-thumb"><img class="thumbnail" src="' + thumb + '" alt="" loading="lazy"></div></a>' ),

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

          source        : 'Cleveland Museum of Art',
          link          : 'https://www.clevelandart.org/art/collection/search?search=' + keyword,
          results_shown : Object.keys( obj ).length, 
          total_results : response.info.total,
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
