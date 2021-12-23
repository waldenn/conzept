async function fetchSemanticScholarQuery( args, total_results, page, sortby ){

  const fname = 'fetchSemanticScholarQuery';

  args = unpackString( args );

  let keyword = args.topic;
  keyword = removeCategoryFromTitle( keyword );

  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '   "' ); // add some extra spaces to avoid the API error message: "phrase too short".

  let f = args.list.split(':') || [];
 
  let page_size = 20;
  let offset    = 0;

  if ( total_results === null ){ // first request

    page = 1;

  }
  else { // fetch more if needed

    offset = ( page - 1 ) * page_size;

  }

  // see: https://api.semanticscholar.org/graph/v1
  const search_url = 'https://api.semanticscholar.org/graph/v1/paper/search?query=' + keyword + '&fields=url,title,year,abstract,authors,venue&limit=' + page_size + '&offset=' + offset;

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

        if ( json.length === 0 ) { // no more results

          $( '.mv-loader.' + args.id ).remove();

          return 1;

        }

				$.each( json, function ( i, v ) {

          let label = '';
					let img   = '';
					let url   = '';
					let date  = '';
					let desc  = '';
					let venue  = '';
					let authors  = '';

          if ( valid( v.year ) ){

            date  = '<div class="mv-extra-desc">' + v.year + '</div>';

          }

          if ( valid( v.venue ) ){

            venue  = '<div class="mv-extra-desc">' + v.venue + '</div>';

          }

          if ( typeof v.title === undefined || typeof v.title === 'undefined' ){
            label = '---';
          }
          else {

            label  = v.title;

          }

          if ( typeof v.url === undefined || typeof v.url === 'undefined' ){
            // do nothing
          }
          else {

						url = encodeURIComponent( JSON.stringify( v.url ) ); // TODO: is there are way to avoid the "%22 replaces()" ?

          }

          if ( typeof v.authors === undefined || typeof v.authors === 'undefined' ){
            // do nothing
          }
          else {

				    $.each( v.authors, function ( j, author ) {

              if ( typeof name === undefined ){

                return 0;

              }

              // TODO: needs more name cleanups
              //name = name.replace(/[#]/g, '').replace(/_/g, ' ').replace('Künstler/in', '').trim();

              //authors_plain += name;

              //console.log( 'author: ', author.name );

              let author_name = encodeURIComponent( author.name ); 

              // https://www.semanticscholar.org/author/V.-Govindarajan/50660512
              let author_url = encodeURIComponent( JSON.stringify( 'https://www.semanticscholar.org/author/' + author_name + '/' + author.authorId ) );

              authors += '<div class="mv-extra-desc">' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fas fa-retweet" style="position:relative;"></i></span></a>' +
                  '<a href="javascript:void(0)" class="mv-extra-icon" title="author works" aria-label="author works"' + setOnClick( Object.assign({}, args, { type: 'url', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + author.name + '</a>' +
                '</div>';

            });

          }

          if ( typeof v.abstract === undefined || typeof v.abstract === 'undefined' || v.abstract === null ){
            desc = '';
          }
          else {

            desc = getAbstract( v.abstract, keyword_match );

          }
 
          obj[ 'label-' + i ] = {

						title_link:						encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'url', url: url , title: args.topic } ) ) + '> ' + label + '</a>' + date + venue + authors + desc ),

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

          source        : 'Semantic Scholar papers',
          link          : 'https://www.semanticscholar.org/search?q=' + keyword + '&sort=relevance',
          results_shown : Object.keys(obj).length,
          total_results : response.total,
          page          : page,
          call          : fname,

        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', response ); // server response

      }

	});

}
