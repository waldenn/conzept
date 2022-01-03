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

function arxiv_search({ all, author, title, abstrct, journal_ref }, offset_start, offset_end ) {

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

	baseUrl += '&start=' + offset_start + '&max_results=' + offset_end;

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
          let pub_date	= $(this).find('published').text();
          let title			= $(this).find('title').text();
          let summary		= $(this).find('summary').text();
          let authors		= [];

          $(this).find('author') .each(function(index) {

						authors.push($(this) .text());

					});

          entry.push({

            'title': title,
            'link': id,
            'summary': summary,
            'date': pub_date,
            'authors': authors,

            'total': total

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

  $.when( arxiv_search( { all: keyword }, offset_start, offset_end ) ).then( function( json ) {

    json = sortObjectsArray( json, 'date' ).reverse();

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

      let abstract_ = '';

      if ( valid( v.date ) ){

        let d = v.date.split('T')[0];
        date  = ' <div class="mv-extra-date">' + d + '</div>';

      }

      if ( valid( v.title ) ){

        label  = v.title;

      }
      else {

        label = '---';

      }

      if ( valid( v.summary ) ){

        desc = getAbstract( v.summary, keyword_match );

      }
      else {

        desc = date;

      }

      if ( valid( v.link ) ){

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
      total_results : total_results,
			page          : page,
     	call          : fname,

    }

    insertMultiValuesHTML( args, obj, meta );

  });

}
