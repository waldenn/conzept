/**
 * Copyright (c) 2016 Frase
 *
 * https://github.com/frase-io/arxiv_api
 *
 * Distributed under MIT license (see LICENSE).
 *
 * Search arXiv via its HTTP API can search the following 1 or more fields:
 *   - author
 *   - title
 *   - abstract
 *   - journal reference
 *   - All fields
 *   journal's referenced, as well as all fields.
 *
 * Searches arXiv for papers/documents that match the supplied parameters
 * @param {string} all
 * @param {string} author
 * @param {string} title
 * @param {string} abstrct
 * @param {string} journal_ref
 * @returns {Promise}
 */

function arxiv_search({ all, author, title, abstrct, journal_ref }, offset_start, offset_end, sort_order ) {

	// see:
	//  https://arxiv.org/help/api/user-manual
	//  https://arxiv.org/help/api/basics
  let baseUrl = "http://export.arxiv.org/api/query?search_query=";

  let first		= true;

  let total 	= 0;

  if (author) {

    if (!first) {
      baseUrl += '+AND+';
    }

    baseUrl += "au:" + author;

    first = false;

  }

  if (title) {

    if (!first) {
      baseUrl += '+AND+';
    }

    baseUrl += "ti:" + title;

    first = false;
  }

  if (abstrct) {

    if (!first) {
      baseUrl += '+AND+';
    }

    baseUrl += "abs:" + abstrct;

    first = false;

  }

  if (all) {

    if (!first) {
      baseUrl += '+AND+';
    }

    baseUrl += "all:" + all;

  }

	//baseUrl += '&start=' + offset_start + '&max_results=' + offset_end;

	baseUrl += '&start=' + offset_start + '&max_results=' + offset_end + '&sortBy=submittedDate&sortOrder=' + sort_order;

  let deferred = $.Deferred();

  $.ajax({

    url: baseUrl,
    type: "get",
    dataType: "xml",
    success: function(xml) {

      let entry = [];

			//console.log( 'xml', $(xml) );
			//console.log( 'total results A: ', $(xml).find('opensearch\\:totalResults').text() );
			total = $(xml).find('opensearch\\:totalResults').text() || 0;

      $(xml).find('entry').each(function(index) {

          let id				= $(this).find('id').text();

          let file      = $( $(this).find('link')[1] ).attr('href');

          //console.log( $(this).find('link')[1] );

          let pub_date	= $(this).find('published').text();
          let title			= $(this).find('title').text();
          let summary		= $(this).find('summary').text();
          let authors		= [];

          $(this).find('author').each(function(index) {

						authors.push($(this).text());

					});

          entry.push({

            'title'   : title,
            'link'    : id,
            'file'    : file,
            'summary' : summary,
            'date'    : pub_date,
            'authors' : authors,

            'total'   : total // total nr. of results

          });

        });

      deferred.resolve(entry);

    },

    error: function(status) {

      console.log("request error " + status + " for url: " + baseUrl);

    }

  });

  return deferred.promise();

}

async function fetchArxiv( args, total_results, page, sortby ){

  const fname = 'fetchArxiv';

  args = unpackString( args );

  let page_size = 20;

  let keyword = args.topic;
  keyword			= removeCategoryFromTitle( keyword );

  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();
  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' ); // add some extra spaces to avoid the API error message: "phrase too short".

	let obj = {};

	//let total_results = 0; // initial value

  args.type = 'url';

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

	let offset_start	= (page - 1) * page_size; 
	let offset_end		= page * page_size;

  let sort_select         = '';
  let sort_select_options = '';

  let sort_types          = {
    descending	: 'newest first',
    ascending  	: 'oldest first',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';
  
  });

  sort_select = '<label for="sortby" title="sort by"><i class="fa-solid fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  $.when( arxiv_search( { all: keyword }, offset_start, offset_end, sortby ) ).then( function( json ) {

    //json = sortObjectsArray( json, 'date' ).reverse();

    if ( ! valid( json ) ){

			$( '.mv-loader.' + args.id ).remove();

      return 1;

    }

		total_results = json[0].total;

    $.each( json, function ( i, v ) {

      let label = '';
      let img   = '';
      let url   = '';
      let date  = '';
      let desc  = '';
      let pdf_html_link = '';

      let authors_html  = '';
      let authors 			= '';

      let abstract_ = '';

      // TODO: handle empty items without PDF-URLs
      if ( valid( v.file ) ){

        let url_tmp = v.file.replace('/abs/', '/pdf/');

        url = url_tmp + '#search=' + keyword;

        // see:
        //  https://ar5iv.org
        //  https://github.com/dginev/ar5iv
        let pdf_html_url = 'https://conze.pt/app/cors/raw/?url=' + encodeURIComponent( url_tmp.replace('/arxiv\.org/', '/ar5iv.org/') );

        pdf_html_link = '&nbsp;&nbsp;<a href="javascript:void(0)" class="mv-extra-icon" title="view PDF as HTML" aria-label="view PDF as HTML"' + setOnClick( Object.assign({}, args, { type: 'link', url: pdf_html_url, title: '', qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fa-brands fa-html5" style="position:relative;"></i></span></a>';

      }

      if ( valid( v.date ) ){

        let d = v.date.split('T')[0];
        date  = ' <div class="mv-extra-date">' + d + pdf_html_link + '</div>';

      }

      if ( valid( v.title ) ){

        label  = v.title;

      }
      else {

        label = '---';

      }

			if ( valid( v.authors ) ){

				$.each( v.authors, function ( j, name ) {

					if ( typeof name === undefined ){

						//console.log('author undefined! skipping...');

						return 0;

					}
					else if ( name.startsWith( 'http' ) ){

						return 0;

					}

					// TODO: needs more name cleanups
					name = name.replace(/[#]/g, '').replace(/_/g, ' ').replace('Künstler/in', '').trim();
					name = name.replace(/(\r\n|\n|\r)/gm, '');

					let author_name = encodeURIComponent( name );

					let author_url  = 'https://arxiv.org/search/?query=%22' + author_name + '%22&searchtype=author&source=header';
					//let author_url  = '/app/wikipedia/?t=' + author_name + '&l=' + explore.language + '&voice=' + explore.voice_code;

					authors_html += '<div class="mv-extra-desc">' +

							'<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +

							'<a href="javascript:void(0)" class="mv-extra-icon" title="author search" aria-label="author search" onclick="openInNewTab( &quot;' + author_url + '&quot;)" onauxclick="openInNewTab( &quot;' + author_url + '&quot;)"> ' + decodeURIComponent( author_name ) + '</a>' +

						'</div>';

				});

        authors = getAbstract( authors_html, 'XYZ', 'authors' );

			}

      if ( valid( v.summary ) ){

        desc = getAbstract( v.summary, keyword_match, 'abstract' );

      }
      else {

        desc = date;

      }

      //if ( valid( v.link ) ){
        //url = encodeURIComponent( JSON.stringify( v.link ) );
      //}

      obj[ 'label-' + i ] = {

        title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="document" aria-label="document"' + setOnClick( Object.assign({}, args, { type: 'link', url: url, title: args.topic } ) ) + '> ' + label + '</a>' + date + desc + authors ),

        //title_link:            encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-icon" title="opens in new tab" aria-label="opens in new tab" onclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)" onauxclick="openInNewTab( &quot;' + JSON.parse( decodeURI( url ) ) + '&quot;)"> ' + label + '</a>' + date + desc + authors ),

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
      total_results : total_results,
			page          : page,
     	call          : fname,
      sortby        : sortby,
      sort_select   : sort_select,

    }

    insertMultiValuesHTML( args, obj, meta );

  });

}
