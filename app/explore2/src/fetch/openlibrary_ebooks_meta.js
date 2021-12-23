async function fetchEbooksMeta( args, total_results, page, sortby, type ){

  const fname = 'fetchEbooksMeta'; // from the Open Library

  args = unpackString( args );

  let openlibrary_id      = '';
  let openlibrary_id_type = '';

  let f = args.list.split(':') || [];

  if ( type === 'author' ){ // make an author-query

    // TODO: also allow for plain-string-author searching

    openlibrary_id = f[3];

    // determing if: author / work / topic ID
    if ( valid( args.tag ) ){

      if ( args.tag === 'person' ){

        openlibrary_id_type = 'person';

      }

    }

  }

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

  let keyword = encodeURIComponent( quoteTitle( args.topic ) );

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

 
  sort_select = '<label for="sortby" title="sort by"><i class="fas fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value, &quot;*&quot; );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  let sortby_param = '&sort=' + sortby;

  if ( sortby === 'relevance' ){ // "relevance" is used when the sort is _omitted_, there is seems to be no other string to set it.

    sortby_param = '';

  }

  // see:
  //  https://openlibrary.org/developers/api
  //  https://openlibrary.org/search.json?has_fulltext=true&mode=ebooks&q=%22jazz%22&
  let search_url = 'https://openlibrary.org/search.json?has_fulltext=true&mode=ebooks&q=' + keyword + '&limit=' + page_size + '&page=' + page + sortby_param; //  '&language=' + explore.lang3

  if ( openlibrary_id_type === 'person' ){

    search_url = 'https://openlibrary.org/search.json?has_fulltext=true&mode=ebooks&author=' + openlibrary_id + '&limit=' + page_size + '&page=' + page + sortby_param; //  '&language=' + explore.lang3

  }

	console.log( search_url );

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				if ( typeof response.docs === undefined || typeof response.docs === 'undefined' ){
					return 1;
				}

				let json = response.docs || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
					let subtitle = '';
					let subtitle2 = '';
					let img   = '';
					let url   = '';
					let date  = '';
					let desc  = '';
					let newtab = 'false';

          if ( valid( v.subject ) ){

				    $.each( v.subject, function ( j, subject ) {

              if ( subject === 'Protected DAISY' ){ // DRM ebook

                newtab = true;

              }

            });

          }

          if ( valid( v.title ) ){

            label = v.title;

          }
          else {

            console.log( 'missing title: ', v );

            label = '---';

          }

          if ( valid( v.first_publish_year ) ){

            date = '<div class="mv-extra-date">' + v.first_publish_year + '</div>';

          }
          //else if ( valid( v.publish_year ) ){

          //  date = '<div class="mv-extra-date">' + v.publish_year[0] + '</div>';

          //}


          // get authors
          if ( valid ( v.author_name ) ){

				    $.each( v.author_name, function ( j, author ) {

              let author_name = author; 
              let author_url  = 'https://openlibrary.org/authors/' + v.author_key[j];

              subtitle += '<div class="mv-extra-desc">' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fas fa-retweet" style="position:relative;"></i></span></a>' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="author works" aria-label="author works"' + setOnClick( Object.assign({}, args, { type: 'link', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + author + '</a>' +
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

              //console.log( 'to --> ', author_name );

              let name    = author_name;

              let author_url  = 'https://openlibrary.org/search/authors?q=' + author_name;

              subtitle += '<div class="mv-extra-desc">' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fas fa-retweet" style="position:relative;"></i></span></a>' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="author works" aria-label="author works"' + setOnClick( Object.assign({}, args, { type: 'link', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + name + '</a>' +
                '</div>';

            });

          }

          if ( valid ( v.key ) ){

            url = encodeURIComponent( JSON.stringify( 'https://openlibrary.org' + v.key ) );

          }

          if ( valid ( v.cover_edition_key ) ){

            img = 'https://covers.openlibrary.org/b/olid/' + v.cover_edition_key + '-L.jpg';

          }

          // determine if we need to "open in new tab" and change the link accordingly
          let title_link = '';
          let thumb_link = '';

          if ( newtab === true ){

            title_link = encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="opens in new tab" aria-label="opens in new tab" onclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)" onauxclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)"> ' + decodeURIComponent( label ) + '</a>' + date + subtitle + subtitle2 + desc );

            thumb_link = encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="opens in new tab" aria-label="opens in new tab" onclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)" onauxclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)"> <div class="mv-thumb"><img class="thumbnail" src="' + img + '" alt="" loading="lazy"></div></a>');

          }
          else {

						title_link = encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: url, title: args.topic } ) ) + '> ' + decodeURIComponent( label ) + '</a>' + date + subtitle + subtitle2 + desc );

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
          link          : 'https://openlibrary.org/search?has_fulltext=true&mode=ebooks&q=' + keyword + '&page=' + page + '&language=' + explore.lang3,
          results_shown : Object.keys(obj).length,
          total_results : response['numFound'],
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
