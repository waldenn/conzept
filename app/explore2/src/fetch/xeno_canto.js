async function fetchXenoCanto( args, total_results, page, sortby ){

  const fname = 'fetchXenoCanto';

  args = unpackString( args );

  let page_size = 500;

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
  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' );

  /*
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
  
  sort_select = '<label for="sortby" title="sort by"><i class="fa-solid fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value );" data-title="' + args.title + '">' + sort_select_options + '</select>';
  */

  // see:
  //  https://xeno-canto.org/explore/api
  //    https://xeno-canto.org/help/search
  //    https://xeno-canto.org/search
  const search_url = `https://xeno-canto.org/api/2/recordings?query=${keyword}&page=${page}`;

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.recordings || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label			= '';
					let url  			= '';
          let id_url    = valid( v.id )? `https://xeno-canto.org/${v.id}` : '';
					let date			= '';
					let desc 			= '';
					let subtitle	= '';
          let country   = '';
					let author    = '';
					let lon       = valid( v.lng )? v.lng : '';
					let lat       = valid( v.lat )? v.lat : '';
          let map       = '';
          let duration  = '';
          let license   = '';

          if ( ! valid( [ v.gen, v.sp ] ) ){
            label = '---';
          }
          else {

            label  = v.gen + ' ' + v.sp;

          }

          if ( valid( [ lon, lat ] ) ){

            let map_url = `${explore.base}/app/map/?l=${explore.language}&bbox=${getBoundingBox( lon, lat, 0.05 )}&lat=${lat}&lon=${lon}&title=${ encodeURIComponent( label ) }`;
            map = '<a href="javascript:void(0)" class="" title="map" aria-label="map" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: map_url, title: args.topic } ) ) + '><i class="fa-solid fa-location-dot"></i></a>';

          }

          if ( valid( v.en ) ){ subtitle  = '<div class="mv-extra-desc">' + v.en + '</div>'; }

          if ( valid( v.lic ) ){ license  = '&nbsp;(<a href="javascript:void(0)" class="mv-extra-icon" title="topic" aria-label="topic" role="button" onclick="openInNewTab( &quot;' + v.lic + '&quot;)" onauxclick="openInNewTab( &quot;' + v.lic + '&quot;)">license</a>)'; }

          if ( valid( v.rec ) ){ author  = '<div class="mv-extra-desc">' + v.rec + license + '</div>'; }

          if ( valid( v.loc ) ){ desc  = '<div class="mv-extra-desc">' + v.loc + '</div>'; }

          if ( valid( v.date ) ){ date  = '<div class="mv-extra-desc">' + v.date + '</div>'; }

          if ( valid( v.cnt ) ){ country  = '<div class="mv-extra-desc">' + map + '&nbsp;' + v.cnt + '</div>'; }

          if ( valid( v.length ) ){ duration  = '<div class="mv-extra-desc"><i class="fa-regular fa-clock"></i> ' + v.length + '</div>'; }

          if ( valid( v.url ) ){

            url = `${explore.base}/app/audio/?url=/app/cors/raw/?url=${v.file}`;

          }

          obj[ 'label-' + i ] = {

            title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: url , title: args.topic } ) ) + '> ' + label + '</a>' + subtitle + duration + country + desc + date + author ),

            thumb_link:           '',

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

          source        : 'Xeno-canto bird audio',
          link          : 'https://xeno-canto.org/explore?query=' + keyword,
          results_shown : Object.keys( obj ).length, 
          total_results : response.numRecordings,
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
