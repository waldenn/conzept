async function fetchArxiv( args, url ){

  let keyword = args.topic;
  keyword			= removeCategoryFromTitle( keyword );

  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' ); // add some extra spaces to avoid the API error message: "phrase too short".

	let obj = {};

  args.type = 'url';

  $.when( arxiv_search( { all: keyword } ) ).then( function( json ) { 

    json = sortObjectsArray( json, 'date' ).reverse();

    if ( typeof json === undefined || typeof json === 'undefined' ){
      return 1;
    }

    $.each( json, function ( i, v ) {

      let label = '';
      let img   = '';
      let url   = '';
      let date  = '';
      let desc  = '';

      let abstract_ = '';

      if ( typeof v.date === undefined || typeof v.date === 'undefined' ){
        date = '';
      }
      else {

        let d = v.date.split('T')[0];
        date  = ' <div class="mv-extra-date">' + d + '</div>';

      }

      if ( typeof v.title === undefined || typeof v.title === 'undefined' ){
        label = '---';
      }
      else {

        label  = v.title;

      }

      if ( typeof v.summary === undefined || typeof v.summary === 'undefined' ){
        desc = date;
      }
      else {

        desc = getAbstract( v.summary, keyword_match );

      }

      if ( typeof v.link === undefined || typeof v.link === 'undefined' ){
        // do nothing
      }
      else {

        url = encodeURIComponent( JSON.stringify( v.link ) );

      }

      obj[ 'label-' + i ] = {

        title_link:            encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="opens in new tab" aria-label="opens in new tab" onclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)" onauxclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)"> ' + label + '</a>' + desc ),

        thumb_link: 					'',

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

      source        : 'arXiv',
      link          : 'https://arxiv.org/search/?query=' + keyword + '&searchtype=title',
      results_shown : Object.keys( obj ).length,
      total_results : Object.keys( obj ).length, 

    }

    insertMultiValuesHTML( args, obj, meta );

  });

}
