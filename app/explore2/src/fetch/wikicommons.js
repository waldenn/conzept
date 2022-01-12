async function fetchWikicommons( args, total_results, page, sortby, qid_ ){

  const fname = 'fetchWikicommons';

  args = unpackString( args );

  let qid = '';

  if ( valid( qid_ ) ){

    qid = qid_ 

  }
  else {

    qid = args.qid;

  }

  //console.log( 'fetchWikicommons: ', args, page );

  let page_size = 20;
  let offset    = 0;

  if ( total_results === null ){ // first request

    page = 1;

  }
  else { // fetch more if needed

    offset = ( page - 1 ) * page_size;

  }

  let keyword = encodeURIComponent( quoteTitle( args.topic ) );

  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    '%3Fdate'             : 'oldest first',
    'DESC(%3Fdate)'       : 'newest first',
    '%3FitemLabel'        : 'title (ascending)',
    'DESC(%3FitemLabel)'  : 'title (descending)',
    '%3Fauthor'           : 'author',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';

  });
  
  sort_select = '<label for="sortby" title="sort by"><i class="fas fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  const search_url = 'https://wcqs-beta.wmflabs.org/sparql?format=json&query=%0A%20%20SELECT%20%3Ffile%20%3FfileLabel%20%3Fthumb%20%3FfileOrig%20%3Fencoding%20%3Fcreator%20%28GROUP_CONCAT%28%3FdepictID%3B%20separator%20%3D%20%27%3B%27%29%20AS%20%3FdepictIDs%29%20%28GROUP_CONCAT%28%3FdepictLabel%3B%20separator%20%3D%20%27%3B%27%29%20AS%20%3FdepictLabels%29%0A%20%20WITH%20%7B%20%20%0A%20%20%20%20%20%20SELECT%20%3Ffile%20%3FfileLabel%20%3Fthumb%20%3FfileOrig%20%3Fencoding%20%3Fcreator%20WHERE%20%7B%0A%20%20%20%20%20%20%20%20%3Ffile%20wdt%3AP180%20wd%3AQ' + qid + '%20.%0A%20%20%20%20%20%20%20%20%3Ffile%20schema%3AcontentUrl%20%3Furl%20.%0A%20%20%20%20%20%20%20%20%3Ffile%20schema%3AencodingFormat%20%3Fencoding%20.%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20OPTIONAL%20%7B%20%3Ffile%20p%3AP170%2Fpq%3AP4174%20%3Fcreator%20.%20%7D%0A%0A%20%20%20%20%20%20%20%20SERVICE%20wikibase%3Alabel%20%7B%0A%20%20%20%20%20%20%20%20%20%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%0A%20%20%20%20%20%20%20%20%20%20%3Ffile%20rdfs%3Alabel%20%3FfileLabel.%0A%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20bind%28iri%28concat%28%22http%3A%2F%2Fcommons.wikimedia.org%2Fwiki%2FSpecial%3AFilePath%2F%22%2C%20wikibase%3AdecodeUri%28substr%28str%28%3Furl%29%2C53%29%29%2C%20%22%3Fwidth%3D200%22%29%29%20AS%20%3Fthumb%29%0A%20%20%20%20%20%20%20%20bind%28iri%28concat%28%22http%3A%2F%2Fcommons.wikimedia.org%2Fwiki%2FSpecial%3AFilePath%2F%22%2C%20wikibase%3AdecodeUri%28substr%28str%28%3Furl%29%2C53%29%29%29%29%20AS%20%3FfileOrig%29%0A%20%20%20%20%20%20%7D%20limit%20500%0A%20%20%7D%20as%20%25files%0A%0A%20%20WITH%20%7B%0A%20%20%20%20SELECT%20%3Ffile%20%3Fdepict%20WHERE%20%7B%0A%20%20%20%20%20%20INCLUDE%20%25files%20.%0A%20%20%20%20%20%20%3Ffile%20wdt%3AP180%20%3Fdepict%20.%0A%20%20%20%20%7D%0A%20%20%7D%20AS%20%25file_depicts%0A%0A%20%20WITH%20%7B%0A%20%20%20%20SELECT%20%3Ffile%20%3Fdepict%20WHERE%20%7B%0A%20%20%20%20%20%20INCLUDE%20%25file_depicts%20.%0A%20%20%20%20%7D%0A%20%20%7D%20AS%20%25top_file_depicts%0A%0A%20%20WITH%20%7B%0A%20%20%20%20SELECT%20DISTINCT%20%3Fdepict%20WHERE%20%7B%0A%20%20%20%20%20%20INCLUDE%20%25file_depicts%20.%0A%20%20%20%20%7D%0A%20%20%7D%20AS%20%25distinct_depicts%0A%20%20%20%20%0A%20%20WITH%20%7B%0A%20%20%20%20SELECT%20%3Fdepict%20%3FdepictLabel%20%3FdepictID%20WHERE%20%7B%0A%20%20%20%20%20%20INCLUDE%20%25distinct_depicts%20.%0A%0A%20%20%20%20%20%20BIND%28%3Fdepict%20as%20%3FdepictURL%29%20.%0A%20%20%20%20%20%20service%20wikibase%3Alabel%20%7B%0A%20%20%20%20%20%20%20%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22%20.%0A%20%20%20%20%20%20%20%20%3FdepictURL%20rdfs%3Alabel%20%3FdepictID%20.%0A%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20service%20%3Chttps%3A%2F%2Fquery.wikidata.org%2Fsparql%3E%20%7B%0A%20%20%20%20%20%20%20%20service%20wikibase%3Alabel%20%7B%0A%20%20%20%20%20%20%20%20%20%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%0A%20%20%20%20%20%20%20%20%20%20%3Fdepict%20rdfs%3Alabel%20%3FdepictLabel.%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%20AS%20%25depictLabels%0A%0A%20%20WHERE%20%7B%0A%20%20%20%20INCLUDE%20%25files%20.%0A%20%20%20%20INCLUDE%20%25top_file_depicts%20.%0A%20%20%20%20INCLUDE%20%25depictLabels%20.%0A%20%20%7D%20GROUP%20BY%20%3Ffile%20%3FfileLabel%20%3Fthumb%20%3FfileOrig%20%3Fencoding%20%3Fcreator%0A%20%0AORDER%20BY%20' + sortby + '%0ALIMIT%20' + page_size + '%0AOFFSET%20' + offset + '%0A';

  //console.log( search_url );

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.results.bindings || [];

        //console.log( json );

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1; // no more results
				}
        else if ( json.length === 0 ) { // no more results

          $( '.mv-loader.' + args.id ).remove();

          return 0;

        }

				$.each( json, function ( i, v ) {

          let label = '';
					let img   = '';
					let thumb = '';
					let file_url = '';
					let url   = '';
					let date  = '';
					let desc  = '';
					let subtitle = '';
					let subtitle2 = '';
					let author= '';
					let desc_plain  = '';
					let title_link = '';

          if ( valid( v.file ) ){

            file_url = v.file.value;

          }

          if ( valid( v.fileLabel ) ){

            label  = v.fileLabel.value.replace(/['"\[\]]+/gm, ' ');

          }

          /*
          // TODO add author-array from "contributor"
          if ( v.author ){

            let name    = v.author.value;
            author      = v.author.value; // used in IIIF field
            author_name = encodeURIComponent( name ); 

            let author_url  = encodeURIComponent( '/app/wikipedia/?t=' + author_name + '&l=' + explore.language + '&voice=' + explore.voice_code );

            subtitle2 += encodeURIComponent(
              '<div class="mv-extra-desc">' +
                '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fas fa-retweet" style="position:relative;"></i></span></a>' +
                '<a href="javascript:void(0)" class="mv-extra-icon" title="author works" aria-label="author works"' + setOnClick( Object.assign({}, args, { type: 'link', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + name + '</a>' +
              '</div>' );

          }
          */

          // TODO handle group-image items also: https:/static/images/original-format/group-of-images.png

          //if ( v.item?.summary ){
          //  desc_plain = encodeURIComponent( v.item.summary );
          //}

          /*
          if ( v.date ){

            subtitle = '<details class="inline-abstract"><summary><small><i class="fas fa-ellipsis-h"></i></small></summary>' + encodeURIComponent( v.date.value.replace(/[\[\]]/g, '') ) + '</details>';
            //subtitle = '<div class="mv-extra-desc">' + encodeURIComponent( v.date.value.replace(/[\[\]]/g, '') ) + '</div>';

            desc_plain = v.date.value.replace(/[\[\]]/g, '');

          }
          */


          if ( valid( v.thumb ) ){

            thumb = v.thumb.value;
            thumb = thumb.replace(/width=200/, 'width=300');

          }

          if ( valid( v.fileOrig ) ){

            img = v.fileOrig.value;

            // create IIIF-viewer-link
            let coll = { "images": [ ]};

            coll.images.push( [ img, encodeURIComponent( label ), '...', author, 'wikiCommons' ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

            if ( coll.images.length > 0 ){ // we found some images

              // create an IIIF image-collection file
              // TOFIX: see "goat" depicts (7th  result"Farm scene, Wales?" needs a "?" fix in the PHP code.
              let iiif_manifest_link = '/app/response/iiif-manifest?l=en&single=true&t=' + encodeURIComponent( label ) + '&json=' + JSON.stringify( coll );

              let iiif_viewer_url = '/app/iiif/#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

              url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

            }

          }

          obj[ 'label-' + i ] = {

            title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="opens in new tab" aria-label="opens in new tab" onclick="openInNewTab( &quot;' + file_url + '&quot;)" onauxclick="openInNewTab( &quot;' + file_url + '&quot;)"> ' + decodeURIComponent( label ) + '</a>' ),

            thumb_link: encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: JSON.parse( decodeURI( url ) ), title: args.topic } ) ) + '><div class="mv-thumb"><img class="thumbnail" src="' + thumb + '" alt="" loading="lazy"></div></a>' ),

            explore_link:         encodeURIComponent( getExploreLink( args, label, qid ) ),
            video_link:           encodeURIComponent( getVideoLink( args, label ) ),
            wander_link:          encodeURIComponent( getWanderLink( args, label ) ),
            images_link:          encodeURIComponent( getImagesLink( args, label ) ),
            books_link:           encodeURIComponent( getBooksLink( args, label ) ),
            websearch_link:       encodeURIComponent( getWebsearchLink( args, label ) ),
            compare_link:         '',
            website_link:         '',
            custom_links:         '',
            raw_html:             '',
            mv_buttons_style:			'display:none;',

          };

				});

        let total_results = 0;

        let meta = {

          source        : 'wikiCommons',
          link          : 'https://commons.wikimedia.org/w/index.php?sort=last_edit_desc&search=haswbstatement%3AP180%3DQ' + qid + '&title=Special:Search&profile=advanced&fulltext=1&advancedSearch-current=%7B%7D&ns0=1&ns6=1&ns12=1&ns14=1&ns100=1&ns106=1',
          results_shown : Object.keys( obj ).length, 
          total_results : Object.keys( obj ).length,
          page          : page,
          call          : fname,
          sortby        : sortby,
          sort_select   : sort_select,
          qid           : qid,
        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError) {

				console.log( 'response: hmm...', thrownError );

      }

	});

}
