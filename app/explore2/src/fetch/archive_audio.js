async function fetchArchiveAudio( args, total_results, page, sortby ){

  const fname = 'fetchArchiveAudio';

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

  let keyword = args.topic;

  // default title handling
  keyword = keyword.replace(/\(.*?\)/g, '').trim();
  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').replace(/\//g, ' ').trim() + '"' );

  // custom title handling (to correctly deal with audio-work-titles and their braces)
  let f = args.list.split(':') || [];

  if ( valid( f[3] ) ){ // topic is a "work"

    // cleanup useless title-strings
    // TOFIX: make this work for other languages (if possible)
    let t = args.topic
      .replace(/\//g, ' ')
      .replace('(song)', '')
      .replace('(album)', '') 
      .replace(' song)', ')')
      .replace(' album)', ')')
      ;

    console.log();

    if ( t.startsWith('(') ){ // (foo)-bar baz -> "foo-bar baz"

      keyword = '"' + t.replace(/ *\([^)]*\) */g, '') + '"';
      keyword = encodeURIComponent( keyword.replace(/[.#_()!]/g, '').replace(/[\-]/g, ' ').trim() );

    }
    else if ( t.includes('(') ) { // foo bar (baz) -> "foo bar" baz

      keyword = '"' + t.replace(/ *\(/, '" (').replace(/[()]/g, '"').trim();
      keyword = encodeURIComponent( keyword.replace(/[.#_()!]/g, '').replace(/[\-]/g, ' ').trim() );

    }

  }

  // TODO: see values from "sort results" field here: https://archive.org/advancedsearch.php
  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    'month+desc'        : 'most views',
    'month+asc'         : 'least views',
    'year+desc'         : 'newest first',
    'year+asc'          : 'oldest first',
    'creatorSorter+asc' : 'creator (ascending)',
    'creatorSorter+desc': 'creator (descending)',
    'titleSorter+asc'   : 'title (ascending)',
    'titleSorter+desc'  : 'title (descending)',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';

  });
  
  sort_select = '<label for="sortby" title="sort by"><i class="fa-solid fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value, &quot;*&quot; );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  // see:
  //
  //  https://archive.org/advancedsearch.php
  //
  //  search for IDs: https://archive.org/advancedsearch.php?q=(J.S.+Bach)%20AND%20mediatype%3A(audio)&fl[]=collection&fl[]=creator&fl[]=date&fl[]=description&fl[]=downloads&fl[]=format&fl[]=genre&fl[]=identifier&fl[]=publisher&fl[]=title&fl[]=year&sort[]=titleSorter+asc&sort[]=&sort[]=&rows=20&page=1&output=json&callback=
  //
  //  ID -> metadata: https://archive.org/metadata/podcast_megalodon-friends_ep-11-paranormal-podcast_1000336041792
  const search_url = 'https://archive.org/advancedsearch.php?q=%28' + keyword + '%29%20AND%20-collection%3A%28samples_only%29%20AND%20mediatype%3A%28audio%29&fl%5B%5D=collection&fl%5B%5D=creator&fl%5B%5D=date&fl%5B%5D=description&fl%5B%5D=downloads&fl%5B%5D=format&fl%5B%5D=genre&fl%5B%5D=identifier&fl%5B%5D=publisher&fl%5B%5D=title&fl%5B%5D=year&sort%5B%5D=' + sortby + '&sort%5B%5D=&sort%5B%5D=&rows=' + page_size + '&page=' + page + '&output=json';

	console.log( search_url );

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				if ( typeof response.response === undefined || typeof response.response === 'undefined' ){

          console.log('no results found');

					return 1;
				}

				let json = response.response.docs || [];

        // TODO:
        //  filter out items with a collection value matching "samples_only"

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

          if ( v.availability?.status === 'borrow_available' ){

            newtab = true;

          }

          if ( v.title ){

            label = v.title;

          }
          else {

            label = '---';

          }

          if ( v.year ){

            date = '<div class="mv-extra-date">' + v.year + '</div>';

          }

          if ( v.description ){

            // TODO: align detail-element left, add line breaks between tracks
            //desc = '<div class="mv-extra-desc"><details class="info"><summary>tracks</summary>' + encodeURIComponent( v.description  ) + '</details></div>';

          }

          // get authors
          if ( v.creator ){

            let author_name = '';
            let author_url  = '';

		        if ( Array.isArray( v.creator ) ){

              $.each( v.creator, function ( j, author ) {

                author_name = author; 
                author_url  = 'https://archive.org/search.php?query=creator%3A%28' + author_name + '%29';

                subtitle += '<div class="mv-extra-desc">' +
                    '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
                    '<a href="javascript:void(0)" class="mv-extra-icon" title="author works" aria-label="author works"' + setOnClick( Object.assign({}, args, { type: 'link', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + author + '</a>' +
                  '</div>';

              });

            }
            else { // is a simple string

              let author  = v.creator;
              author_name = author; 
              author_url  = 'https://archive.org/search.php?query=creator%3A%28' + author_name + '%29';

              subtitle += '<div class="mv-extra-desc">' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="author works" aria-label="author works"' + setOnClick( Object.assign({}, args, { type: 'link', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + author + '</a>' +
                '</div>';


            }

          }

          if ( v.identifier ){

            url = encodeURIComponent( JSON.stringify( 'https://archive.org/details/' + v.identifier + '&autoplay=1') );

            img = 'https://archive.org/services/img/' + v.identifier;

          }

          obj[ 'label-' + i ] = {

						title_link: encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: JSON.parse( decodeURI( url ) ), title: args.topic } ) ) + '> ' + decodeURIComponent( label ) + '</a>' + subtitle + subtitle2 + desc ),

            thumb_link: encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: JSON.parse( decodeURI( url ) ), title: args.topic } ) ) + '><div class="mv-thumb"><img class="thumbnail" src="' + img + '" alt="" loading="lazy"></div></a>' ),

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

          source        : 'Archive audio',
          link          : 'https://archive.org/search.php?query=' + keyword + '&and[]=mediatype%3A"audio"',
          results_shown : Object.keys(obj).length,
          total_results : response.response['numFound'],
          page          : page,
          call          : fname,
          sortby        : sortby,
          sort_select   : sort_select,

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError) {

				console.log( 'response: hmm...', thrownError);

      }

	});

}

