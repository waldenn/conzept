async function fetchEuropeana( args, total_results, page, sortby ){

  const fname = 'fetchEuropeana';

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

  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();

  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' ); // add some extra spaces to avoid the API error message: "phrase too short".

  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = { // see: https://pro.europeana.eu/page/search
    score             : 'relevance',
    timestamp_created : 'newest first',
    timestamp_update  : 'update time',
    COMPLETENESS      : 'completeness',
    europeana_id      : 'item ID',
    random            : 'random',
    is_fulltext       : 'is_fulltext',
    has_media         : 'has_media',
    has_thumbnails    : 'has_thumbnails',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';

  });
  
  sort_select = '<label for="sortby" title="sort by"><i class="fa-solid fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  let start_item = ( (page - 1) * page_size ) + 1;

  /*
  let lang;

  if ( ['en', 'nl'].includes( explore.languages ) ){

    lang = explore.lang; 

  }
  else {

    lang = 'en';

  }
  */

  // see:
  //
  //  https://pro.europeana.eu/page/search
  //    https://pro.europeana.eu/page/api-rest-console
  //    https://pro.europeana.eu/page/intro
  //    https://groups.google.com/g/europeanaapi
  //    https://docs.google.com/document/d/1XHqkK1CevIdZq-SLY0T9MiBKLd7w98e4Qy4hIHwEal4/edit
  //
  //  https://pro.europeana.eu/page/record
  //
  //  https://pro.europeana.eu/page/sparql
  //    http://sparql.europeana.eu
  //    https://pro.europeana.eu/page/sparql#examples
  //    http://www.snee.com/bobdc.blog/2013/01/finding-europeana-audio-with-s.html
  //
  //  example frontend:
  //    http://search.linbi.ait.co.at
  //    https://euscreen.eu/
  //
  //  https://github.com/europeana?q=&type=&language=javascript&sort=
  //
  //  language filter: &qf=LANGUAGE:"nl"
  //
  //  text:
  //    https://api.europeana.eu/record/9200401/BibliographicResource_1000056711928.json?wskey=nLbaXYaiH
  //      webResources -> about -> https://api.europeana.eu/record/9200401/BibliographicResource_1000056711928.json?wskey=nLbaXYaiH
  //
  //  video:
  //    edmIsShownAt link to a remote-video
  //    edmIsShownBy link to media file (or just an image of the video)
  //
  //    https://api.europeana.eu/api/v2/search.json?profile=standard&query=%22wine%22&qf=TYPE%3A%22VIDEO%22&rows=3&start=1&sort=score&media=true&thumbnail=true&wskey=4ZViVZKMe
  //      edmIsShownBy : "http://data.nfa.cz/video/mp4/efg/film/0064428.mp4"
  //
  //    https://api.europeana.eu/api/v2/search.json?profile=standard&query=%22Amsterdam%22&qf=TYPE%3A%22VIDEO%22&rows=3&start=1&sort=score&media=true&thumbnail=true&wskey=4ZViVZKMe
  //      edmIsShownBy : https://5ad4b00cebcc2.streamlock.net/vod/archivioluce/MpegKA300/KA168701.mp4/manifest.mpd
  //        https://videojs.github.io/videojs-contrib-dash/ 
  //        ...
	//
  const search_url = 'https://api.europeana.eu/api/v2/search.json?profile=standard&query=' + keyword + '&rows=' + page_size + '&start=' + start_item + '&sort=' + sortby + '&media=true&thumbnail=true&wskey=4ZViVZKMe';

	console.log( search_url  );

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.items || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label			= '';
          let label_url = '';
					let img  			= '';
					let thumb			= '';
					let url  			= '';
					let desc			= '';
					let desc_plain= '';
					let subtitle	= '';

					let authors       = '';
					let authors_plain = '';

					let provider      = '';

          if ( typeof v.title === undefined || typeof v.title === 'undefined' ){
            label = '---';
          }
          else {

            label  = v.title[0];

          }

          if ( valid( v.year ) ){

            if ( valid( v.year[0] ) ){

              desc = '<div class="mv-extra-desc"><a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'explore', title: v.year[0], qid: '', language  : explore.language } ) ) + '">' + v.year[0] + '</a></div>';

            }

          }

          if ( valid( v.edmIsShownAt ) ){

            label_url  = v.edmIsShownAt[0];

          }

          if ( typeof v.dcDescription === undefined || typeof v.dcDescription === 'undefined' ){
            // do nothing
          }
          else {

            desc += getAbstract( v.dcDescription[0], keyword_match, 'abstract' );

            desc_plain = encodeURIComponent( v.dcDescription[0] );

          }

          if ( typeof v.dcCreator === undefined || typeof v.dcCreator === 'undefined' ){
            // do nothing
          }
          else {
            
				    $.each( v.dcCreator, function ( j, name ) {

              if ( typeof name === undefined ){

                console.log('author undefined! skipping...');

                return 0;

              }
              else if ( name.startsWith( 'http' ) ){

                return 0;

              }

              // TODO: needs more name cleanups
              name = name.replace(/[#]/g, '').replace(/_/g, ' ').replace('Künstler/in', '').trim();

              authors_plain += name;

              let author_name = encodeURIComponent( name ); 

              let author_url  = '/app/wikipedia/?t=' + author_name + '&l=' + explore.language + '&voice=' + explore.voice_code;

              authors += '<div class="mv-extra-desc">' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author" role="button"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="author works" aria-label="author works" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + name + '</a>' +
                '</div>';

            });

          }


          if ( typeof v.dataProvider === undefined || typeof v.dataProvider === 'undefined' ){
            // do nothing
          }
          else {

            subtitle = '<div class="mv-extra-desc"><a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'explore', title: v.dataProvider[0], qid: '', language  : explore.language } ) ) + '"> &nbsp;@ ' + v.dataProvider[0] + '</a></div>';

            provider = v.dataProvider[0];

          }

          if ( v.edmPreview === null || typeof v.edmPreview === undefined || typeof v.edmPreview === 'undefined' ){
            // do nothing
          }
          else {

            if ( valid( v.edmIsShownBy ) ){

              img = v.edmIsShownBy[0];

              // create IIIF-viewer-link
              let coll = { "images": [ ]};

              coll.images.push( [ img, label, desc_plain, authors_plain + '<br>', provider ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

              if ( coll.images.length > 0 ){ // we found some images

                // create an IIIF image-collection file
                let iiif_manifest_link = '/app/response/iiif-manifest.php?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

                let iiif_viewer_url = '/app/iiif/dist/uv.html#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

                url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

              }

            }

          }

          obj[ 'label-' + i ] = {

            title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="opens in new tab" aria-label="opens in new tab" role="button" onclick="openInNewTab( &quot;' + label_url + '&quot;)" onauxclick="openInNewTab( &quot;' + label_url + '&quot;)"> ' + decodeURIComponent( label ) + '</a>' + desc + authors + subtitle ),

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

          source        : 'Europeana',
          link          : 'https://www.europeana.eu/en/search?page=1&view=grid&query=' + keyword,
          results_shown : Object.keys( obj ).length, 
          total_results : response['totalResults'],
          page          : page,
          call          : fname,
          sortby        : sortby,
          sort_select   : sort_select,
        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', thrownError);

      }

	});

}
