async function fetchEbooksInside( args, total_results, page, sortby ){

  const fname = 'fetchEbooksInside'; // from the Open Library

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
  keyword = removeCategoryFromTitle( keyword );

  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();

  // TODO: query breaks when quotes are used --> file an OpenLibrary GitHub issue
  keyword = encodeURIComponent( quoteTitle( keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() ) );

  /* // NOTE: sort & language params are not yet supported for inside-searches it seems
  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    'relevance' : 'relevance',
    'new'       : 'newest first',
    'old'       : 'oldest first',
    'editions'  : 'nr of editions',
    //'is-referenced-by-count' : 'reference count',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';

  });
 
  sort_select = '<label for="sortby" title="sort by"><i class="fa-solid fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value, &quot;*&quot; );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  let sortby_param = '&sort=' + sortby;

  if ( sortby === 'relevance' ){ // "relevance" is used when the sort is _omitted_, there is seems to be no other string to set it.

    sortby_param = '';

  }
  */

  // see:
  //  https://openlibrary.org/developers/api
  //  https://openlibrary.org/search/inside?has_fulltext=true&q=%22wine%22&mode=ebooks&page=2
  const search_url = 'https://openlibrary.org/search/inside.json?q=' + keyword + '&mode=ebooks&has_fulltext=true&page=' + page + '&language=' + explore.lang3;

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				if ( typeof response.hits === undefined || typeof response.hits === 'undefined' ){
					return 1;
				}
				else if ( typeof response.hits.hits === undefined || typeof response.hits.hits === 'undefined' ){
					return 1;
				}

				let json = response.hits.hits || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
					let subtitle = '';
					let subtitle2 = '';
					let img   = '';
					let url   = '';
					let newtab = 'false';

          if ( v.availability?.status === 'borrow_available' ){

            newtab = true;

          }

          if ( v.edition?.title ){

            label = v.edition.title;

          }
          else if ( v.fields?.meta_title ){

            label = v.fields.meta_title[0];

          }
          else {

            console.log( 'missing title: ', v );

            label = '---';

          }

          if ( v.fields?.meta_year ){

            subtitle = '<div class="mv-extra-date">' + v.fields?.meta_year + '</div>';

          }
          else if ( v.fields?.meta_date ){

            subtitle = '<div class="mv-extra-date">' + v.fields?.meta_date.split('-')[0]  + '</div>';

          }

          // get authors
          if ( v.edition?.authors ){

				    $.each( v.edition.authors, function ( j, author ) {

              let author_name = author.name; 
              let author_url  = 'https://openlibrary.org' + author.key;

              subtitle += '<div class="mv-extra-desc">' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="author works" aria-label="author works"' + setOnClick( Object.assign({}, args, { type: 'link', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + author.name + '</a>' +
                '</div>';

            });

          }
          else if ( v.fields?.meta_creator ){

				    $.each( v.fields.meta_creator, function ( j, author ) {

              if ( typeof author === undefined ){

                console.log('author undefined! skipping...');

                return 0;

              }

              let author_name = '';

              let commas = author.match(/,/g) || [];

              if ( commas.length > 1 ){ // string with two comma's, assume a "lastname, firstname, year" format

                author_name = author.replace(/,[^,]+$/, "");  // remove string after last comma
                author_name = author_name.split(/,/).reverse().join(' ').replace(/\s\s+/g, ' '); // reverse "lastname, firstname

              }
              else if ( commas.length === 1 ){ // string with one comma's, assume a "lastname, firstname" format

                author_name = author.split(/,/).reverse().join(' ').replace(/\s\s+/g, ' '); // reverse "lastname, firstname

              }
              else {

                author_name = author;

              }

              let name    = author_name;

              let author_url  = 'https://openlibrary.org/search/authors?q=' + author_name;

              subtitle += '<div class="mv-extra-desc">' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="author works" aria-label="author works"' + setOnClick( Object.assign({}, args, { type: 'link', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + name + '</a>' +
                '</div>';

            });

          }
          else if ( v.fields?.meta_publisher ){

            let author_name = v.fields.meta_publisher[0]; 

            let author_url  = 'https://openlibrary.org/search/authors?q=' + author_name;

            subtitle += '<div class="mv-extra-desc">' +
                '<a href="javascript:void(0)" class="mv-extra-icon" title="author works" aria-label="author works"' + setOnClick( Object.assign({}, args, { type: 'link', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + v.fields.meta_publisher[0] + '</a>' +
                '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
              '</div>';

          }

          if ( v.edition?.url ){

            url = encodeURIComponent( JSON.stringify( 'https://openlibrary.org' + v.edition?.url ) );

          }
          else { // get the identifier

            if (  valid( v.fields?.identifier ) ){

              url = encodeURIComponent( JSON.stringify( 'https://archive.org/details/' + v.fields.identifier[0] + '?view=theater&q=' + keyword ) );

              newtab = true; // TODO: research if there is a way to check if this ebook is open for all

            }

          }

          if ( v.highlight?.text ){

            let text = v.highlight.text.join().replace( /\{\{\{/g, '<mark>' ).replace( /\}\}\}/g, '</mark> &mdash; ' );

            subtitle2 = '<details class="inline-abstract"><summary><small><i class="fa-solid fa-ellipsis-h"></i></small></summary>' + text + '</details>';

          }

          if ( v.edition?.cover_url ){

            img = 'https:' + v.edition?.cover_url.replace( '-M', '-L' );

          }

          // determine if we need to "open in new tab" and change the link accordingly
          let title_link = '';
          let thumb_link = '';

          if ( newtab === true ){

            title_link = encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="opens in new tab" aria-label="opens in new tab" onclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)" onauxclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)"> ' + decodeURIComponent( label ) + '</a>' + subtitle + subtitle2 );

            thumb_link = encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="opens in new tab" aria-label="opens in new tab" onclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)" onauxclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)"> <div class="mv-thumb"><img class="thumbnail" src="' + img + '" alt="" loading="lazy"></div></a>');

          }
          else {

						title_link = encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: url, title: args.topic } ) ) + '> ' + decodeURIComponent( label ) + '</a>' + subtitle + subtitle2 );

            thumb_link = encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: JSON.parse( decodeURI( url ) ), title: args.topic } ) ) + '><div class="mv-thumb"><img class="thumbnail" src="' + img + '" alt="" loading="lazy"></div></a>' );

          }

          obj[ 'label-' + i ] = {

						title_link:           title_link,
						thumb_link:           thumb_link,
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

          source        : 'OpenLibrary eBooks',
          link          : 'https://openlibrary.org/search/inside?q=' + keyword + '&mode=ebooks&has_fulltext=true',
          results_shown : Object.keys(obj).length,
          total_results : response.hits['total'],
          page          : page,
          call          : fname,
          //sortby        : sortby,
          //sort_select   : sort_select,

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError) {

				console.log( 'response: hmm...', thrownError); // server response

      }

	});

}
