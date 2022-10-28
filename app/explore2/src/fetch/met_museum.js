async function fetchMET( args, total_results, page, sortby ){

  const fname = 'fetchMET';

  args = unpackString( args );

  let page_size = 20;

  let from_item;
  let to_item;

  if ( total_results === null ){ // first request

    page = 1;

    from_item = 0;
    to_item   = page_size;

  }
  else { // fetch more if needed

    if ( ( (page - 1) * page_size ) < total_results ){ // more to fetch

      from_item = (page - 1) * page_size;
      to_item   = page * page_size;

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

  // see:
  //  https://metmuseum.github.io/
  //    https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=sunflowers
  //    https://collectionapi.metmuseum.org/public/collection/v1/objects/2032
  const search_url = 'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=' + keyword;

	let obj = {};

  let counter = 0;

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.objectIDs || [];

				if ( !valid( json ) || json.length === 0 ){

          $( '.mv-loader.' + args.id ).remove();

					return 1;

				}
 
        // limit media-file fetching
        json = json.slice( from_item, to_item);

				$.each( json, function ( i, metID ) {

          // fetch the media-data
          const media_url = ' https://collectionapi.metmuseum.org/public/collection/v1/objects/' + metID;

          $.ajax({

              url: media_url,

              dataType: "json",

              success: function( v ) {

                let label			= '';
                let label_url = '';
                let qid 			= '';
                let img  			= '';
                let url  			= '';
                let date 			= '';
                let desc 			= '';
                let desc2			= '';
                let subtitle  = '';
                let subtitle2 = '';

                let author		= '';
                let constituents = '';

                if ( typeof v.title === undefined || typeof v.title === 'undefined' ){
                  label = '---';
                }
                else {

                  label  = v.title;

                }

                if ( typeof v.objectURL === undefined || typeof v.objectURL === 'undefined' ){
                  // do nothing
                }
                else {

                  label_url  = encodeURIComponent( JSON.stringify( v.objectURL ) );

                }

                if ( typeof v.objectDate === undefined || typeof v.objectDate === 'undefined' ){
                  // do nothing
                }
                else {

                  desc  = ' <div class="mv-extra-desc">' + v.objectDate + '</div>';

                  desc2 = v.objectDate;

                }

                if ( valid( v.constituents ) ){

                  // get each linked image-constituent
				          $.each( v.constituents, function ( ci, cv ) {

                    // HACK: always skip first item (TODO: merge correctly with author names)
                    if ( ci === 0 ){ return 0; }

                    let c_qid = '';
                    let c_name = '---';
                    let c_role = '';


                    if ( valid( cv.constituentWikidata_URL ) ){ // get Qid number

                      c_qid = cv.constituentWikidata_URL.replace('https://www.wikidata.org/wiki/Q', '');

                      if ( valid( cv.role ) ){

                        c_role = ' (' + cv.role + ')';

                      }

                      if ( valid( cv.name ) ){

                        c_name = cv.name;

                      }

				              let wiki_url = encodeURIComponent( JSON.stringify( '/app/wikipedia/?t=&qid=' + c_qid + '&l=' + explore.language + '&voice=' + explore.voice_code ) );

                      constituents += '<div class="mv-extra-desc">' +
                          '<a href="javascript:void(0)" class="mv-extra-icon" title="explore constituent" aria-label="explore constituent"' + setOnClick( Object.assign({}, args, { type: 'explore', title: c_name, qid: c_qid, language : explore.language } ) ) + '"><span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
                          '<a href="javascript:void(0)" class="mv-extra-icon" title="constituent info" aria-label="constituent info"' + setOnClick( Object.assign({}, args, { type: 'link', title: c_name, url: wiki_url, qid: c_qid, language : explore.language } ) ) + '">' + c_name + '</a>' + c_role +
                        '</div>';

                    }

                  });

                }

                if ( typeof v.artistDisplayName === undefined || typeof v.artistDisplayName === 'undefined' ){
                  // do nothing
                }
                else {

                  subtitle =
                    '<div class="mv-extra-desc">' +
                      '<a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic"' + setOnClick( Object.assign({}, args, { type: 'explore', title: v.artistDisplayName, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></a> ' +
                     '<a href="javascript:void(0)" class="" title="author" aria-label="author"' + setOnClick( Object.assign({}, args, { type: 'link', url: 'https://www.metmuseum.org/art/collection/search#!?q=' + encodeURIComponent( v.artistDisplayName ) + '&perPage=20&offset=0&pageSize=0&sortBy=Relevance&sortOrder=asc&searchField=ArtistCulture', title: v.artistDisplayName } ) ) + '>' + v.artistDisplayName + '</a>' + 
                    '</div>';

                  desc2 += v.artistDisplayName;

                }

                if ( typeof v.primaryImage === undefined || typeof v.primaryImage === 'undefined' ){
                  // do nothing
                }
                else {

                  img = v.primaryImage;

                  // create IIIF-viewer-link
                  let coll = { "images": [ ]};

                  coll.images.push( [ img, label, encodeURIComponent( desc2 ), author, 'MET museum' ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

                  if ( coll.images.length > 0 ){ // we found some images

                    let iiif_manifest_link = '/app/response/iiif-manifest?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

                    let iiif_viewer_url = '/app/iiif/#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

                    url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

                  }

                }

                //constituents  = '<details class="inline-abstract"><summary><small><i class="fa-solid fa-ellipsis-h"></i></small></summary>' + constituents + '</details>';

                obj[ 'label-' + i ] = {

                  title_link:						encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: label_url , title: args.topic } ) ) + '> ' + label + '</a>' + desc + subtitle ),

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



              },

              complete: function( data ) {

                counter += 1;

                if ( counter === json.length ){ // this was the last fetch

                  let meta = {

                    source        : 'MET museum',
                    link          : '',
                    results_shown : Object.keys( obj ).length, 
                    total_results : response.total,
                    page          : page,
                    call          : fname,

                  }

                  insertMultiValuesHTML( args, obj, meta );

                }

              },

              error: function (xhr, ajaxOptions, thrownError) {

                console.log( 'response: hmm...' );

              }

          });

				});

			},

      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', response );

      }

	});

}

