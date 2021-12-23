async function fetchLoCImages( args, total_results, page, sortby ){

  const fname = 'fetchLoCImages';

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
  keyword     = removeCategoryFromTitle( keyword );

  //let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' ); // add some extra spaces to avoid the API error message: "phrase too short".

  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    date_desc   : 'newest first',
    date        : 'oldest first',
    title_s     : 'title (ascending)',
    title_s_desc: 'title (descending)',
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
  //  https://libraryofcongress.github.io/data-exploration/requests.html
  //  https://www.loc.gov/about/general-information/#year-at-a-glance
  const search_url = 'https://www.loc.gov/photos/?sp=' + page + '&c=' + page_size + '&q=' + keyword + '&sb=' + sortby + '&fo=json';

	console.log( search_url  );

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.results || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
          let label_url = '';
					let img   = '';
					let url   = '';
					let date  = '';
					let desc  = '';
					let desc_plain  = '';
					let subtitle = '';
					let subtitle2 = '';
					let author= '';

          if ( v.title ){

            label       = v.title.replace(/['"\[\]]+/gm, ' ');
            desc_plain  = encodeURIComponent( v.title.replace(/[^a-zA-Z ]/gm, ' ') );

          }


          if ( v.id ){

            label_url  = v.id;

          }

          // TODO add author-array from "contributor"
          if ( v.contributor ){

				    $.each( v.contributor, function ( j, author ) {

              if ( typeof author === undefined ){

                return 0;

              }

              let author_name = '';

              let commas = author.match(/,/g) || [];

              if ( commas.length > 1 ){ // string with two comma's, assume a "lastname, firstname, year" format

                author_name = author.replace(/,[^,]+$/, "");  // remove string after last comma
                author_name = author_name.split(/,/).reverse().join(' ').replace(/\s\s+/g, ' ').trim(); // reverse "lastname, firstname

              }
              else if ( commas.length === 1 ){ // string with one comma's, assume a "lastname, firstname" format

                author_name = author.split(/,/).reverse().join(' ').replace(/\s\s+/g, ' ').trim(); // reverse "lastname, firstname

              }
              else {

                author_name = author;

              }

              //console.log( 'to --> ', author_name );

              let name    = author_name;
              author_name = encodeURIComponent( author_name ); 

              let author_url  = '/app/wikipedia/?t=' + author_name + '&l=' + explore.language + '&voice=' + explore.voice_code;

              subtitle2 += '<div class="mv-extra-desc">' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fas fa-retweet" style="position:relative;"></i></span></a>' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="author" aria-label="author"' + setOnClick( Object.assign({}, args, { type: 'link', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + name + '</a>' +
                '</div>';

            });

          }


          // TODO handle group-image items also: https:/static/images/original-format/group-of-images.png

          if ( v.item?.summary ){

            desc_plain = encodeURIComponent( v.item.summary );

          }

          if ( v.date ){

            subtitle  = '<div class="mv-extra-desc">' + v.date.replace(/[\[\]]/g, '') + '</div>';

          }

          if ( v.image_url ){


		        if ( Array.isArray( v.image_url ) && v.image_url.length > 0 ){

              img = v.image_url.pop().split("#")[0];

            }
            else { // no image found

              return 0;

            }

            // create IIIF-viewer-link
            let coll = { "images": [ ]};

            coll.images.push( [ img, label, 'desc: ...', 'author: ...', 'Library of Congress' ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

            if ( coll.images.length > 0 ){ // we found some images

              // create an IIIF image-collection file
              let iiif_manifest_link = '/app/response/iiif-manifest?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

              let iiif_viewer_url = '/app/iiif/#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

              url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

            }

          }

          obj[ 'label-' + i ] = {

            title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="opens in new tab" aria-label="opens in new tab" onclick="openInNewTab( &quot;' + label_url + '&quot;)" onauxclick="openInNewTab( &quot;' + label_url + '&quot;)"> ' + decodeURIComponent( label ) + '</a>' + subtitle + subtitle2 ),

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

        let total_results = 0;

        if ( response.pagination?.of ){

          total_results = response.pagination.of;

        }

        let meta = {

          source        : 'US Library of Congress images',
          link          : 'https://www.loc.gov/photos/?q=' + keyword,
          results_shown : Object.keys( obj ).length, 
          total_results : total_results,
          page          : page,
          call          : fname,
          sortby        : sortby,
          sort_select   : sort_select,
        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', thrownError );

      }

	});

}
