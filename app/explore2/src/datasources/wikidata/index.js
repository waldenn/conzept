'use strict';

function autocompleteWikidata( r, dataset ){

  let json  = [];
  let wd    = [];

  if ( valid( r.results ) ){

    json = r.results.bindings;

    json.forEach(( v ) => {

      //console.log( v );

      if ( valid( v.itemLabel.value ) ){

        wd.push( v.itemLabel.value );

      }

    });

    dataset.push( [...new Set( wd )] ); // use only the unique values

  }

}

function countWikidata( r, struct, index ){

  if ( r.results?.bindings[0]?.count?.value ){ 

    if ( r.results.bindings[0].count.value > 0 ){

      datasources[ struct[index].name ].total = r.results.bindings[0].count.value;

    }

  }

}

function processResultsWikidata( my_promises, topicResults, struct, index ){

  if ( topicResults.length === 0 ){ // no results found

    datasources.wikidata.done = true; // dont fetch more from this datasource

  }
  else if ( !valid( topicResults.results.bindings.length ) ){
    datasources.wikidata.done = true; // dont fetch more from this datasource
  }
  else if ( topicResults.results.bindings.length === 0 ){
    datasources.wikidata.done = true; // dont fetch more from this datasource
  }
  else { // results found
  
    let [ qids, results_ ] = prepareWikidata( topicResults, struct[ index ].name );

    my_promises.push( fetchWikidata( qids, results_, struct[ index ].name, 'p1' ) );

    $('details#detail-structured-search').removeAttr("open");

  }

}

function resolveWikidata( result, renderObject ){

  if ( ! valid( result.value[0] ) ){ // no results were found

    datasources.wikidata.done = true; // dont fetch more from this datasource

  }
  else if ( result.value[0] === 'done' ){ // no results were found

    datasources.wikidata.done = true; // dont fetch more from this datasource

  }
  else {

    renderObject[ result.value[0].source.data.continue.source ] = { data : result };

  }

}

function renderMarkWikidata( inputs, source, q_, show_raw_results, id  ){

  if ( valid( inputs[source] ) ){

    if ( q_ === inputs[source].data.value[0].source.data.query.search[0].title.toLowerCase().trim() ){ // matching topic-title
      show_raw_results.push( false );
    }
    else {
      show_raw_results.push( true );
    }

    if ( explore.firstAction ){
      markArticle(id, explore.type );
    }

  }

}

function getTitleFromQid( qid, target_pane ){

  if ( ! valid( qid ) ){

    return 1;

  }
  else {

    fetchWikidata( [ qid ], '', 'wikidata', target_pane );

  }

}

async function getQidFromTitle( title, language ) {

  const apiUrl = 'https://www.wikidata.org/w/api.php';

  const params = new URLSearchParams({

    action:		'wbsearchentities',
    format:		'json',
    language: language,
    search:		title,

  });

  const fullUrl = `${apiUrl}?${params.toString()}&origin=*`;

  try {

    const response  = await fetch(fullUrl);
    const data      = await response.json();

    if (data.search && data.search.length > 0) { // results found

      //console.log( 'Qid: ', data.search[0].id );

      return data.search[0].id; // return the first QID

    }
		else { // no results found

      return ''; //throw new Error('no Qid found for: ', title, language );

    }

  } catch (error) {

    return ''; //console.error( 'Error fetching Wikidata Qid data:', error.message, title, language );

    //throw error;

  }
 
}

function getWikidataFromTitle( title, allow_recheck, target_pane ){

  explore.item = '';

  // get qid and wikidata data
  // https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&format=json&titles=Karachi

  $.ajax({
    url: datasources.wikidata.instance_api + '?action=wbgetentities&sites=' + explore.language + 'wiki&format=json&normalize=true&titles=' + title,
    dataType: "jsonp",

    success: function( wd ) {

      if ( typeof wd.entities === undefined || typeof wd.entities === 'undefined' ){
        // do nothing
      }
      else {
        const qid = Object.keys( wd.entities )[0];

        if ( qid.startsWith('Q') ){

          fetchWikidata( [ qid ], '', 'wikipedia', target_pane );

        }
        else {

          // determine if we should render someting else than the wikipedia artcle, eg: link
          if ( explore.type === 'link' ){

            if ( explore.uri !== '' ){ // use URL param

              if ( document.getElementById('infoframeSplit2') === null ){ // single-content-frame
                resetIframe();
                $( explore.baseframe ).attr({"src": decodeURI( explore.uri ) });
              }
              else { // dual-content-frame

		            if ( explore.isMobile ){

                  $( explore.baseframe ).attr({"src": decodeURI( explore.uri ) });

                }
                else {

                  $( '#infoframeSplit2' ).attr({"src": decodeURI( explore.uri ) });

                }

              }

            }

          }
          else {

            if ( target_pane === 'p0' || target_pane === 'p1' || document.getElementById('infoframeSplit2') === null ){ // single-content-frame

              resetIframe();

              $( explore.baseframe ).attr({"src": explore.base + '/app/wikipedia/?t=' + title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + qid + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

            }
            else { // dual-content-frame

              $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=' + title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + qid + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

            }

          }
        }

      }

    },

  });

}

function insertQidTopics( args, list ){

	let obj = {};
	let qlist = '';

	$.each( list, function (j, item ) {

    if (  j < 49 ){

		  qlist += item + '|';

    }
    else {
      // skip label, as we are over the query-limit
    }

	});

	qlist = qlist.slice(0, -1);

	// note API limit of 50!
	let lurl = datasources.wikidata.instance_api + '?action=wbgetentities&ids=' + qlist + '&format=json&languages=' + explore.language + '|en&props=labels';

	$.ajax({

			url: lurl,

			jsonp: "callback",
			dataType: "jsonp",

			success: function( response ) {

				if ( typeof response.entities === undefined || typeof response.entities === 'undefined' ){

					return 1;
				}

				Object.entries( response.entities ).forEach(([ k , v ]) => {

          let label = '';
          let qid   = v.id;

          if ( typeof v.labels[explore.language] === undefined || typeof v.labels[explore.language] === 'undefined' ){ // no label-language match

            if ( typeof v.labels['en'] === undefined || typeof v.labels['en'] === 'undefined' ){

              label = v.id; // use qid-string as the label

            }
            else{
 
              label = v.labels['en'].value ; // english fallback

            }

          }
          else {

            label = v.labels[explore.language].value;

            obj[ qid ] = {

              title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="' + label + '" aria-label="' + label + '" role="button"' + setOnClick( Object.assign({}, args, { type: 'wikipedia-qid', qid: qid, title: label } ) ) + '>' + label + '</a><br>' ),
              thumb_link:           '',
              explore_link:         encodeURIComponent( getExploreLink( args, label, qid ) ),
              video_link:           encodeURIComponent( getVideoLink( args, label ) ),
              wander_link:          encodeURIComponent( getWanderLink( args, label ) ),
              images_link:          encodeURIComponent( getImagesLink( args, label ) ),
              books_link:           encodeURIComponent( getBooksLink( args, label, qid ) ),
              websearch_link:       '', //encodeURIComponent( getWebsearchLink( args, label, qid ) ),
              compare_link:         encodeURIComponent( getCompareLink( qid ) ),
              presentation_link:    encodeURIComponent( getPresentationLink( qid ) ),
              website_link:         '', // getExternalWebsiteLink( url ) , getLocalWebsiteLink( args, url )
              custom_links:         '', // custom_links,
              raw_html:             '', // raw_html
              mv_buttons_style:     '',

            };

          }

				});

				insertMultiValuesHTML( args, obj, {} );

			},

	});

}

async function fetchWikidata( qids, topicResults, source, target_pane ){

  return new Promise((resolve, reject) => {

    let item_ = ''; // used for the single return value

    const wikidata_url = window.wbk.getEntities({
      ids: qids,
      redirections: false,
    })

    //wbk.simplify.claims( entity.claims, { keepQualifiers: true })

    // get wikidata json
    fetch( wikidata_url )

      .then( response => response.json() )
      .then( window.wbk.parse.wd.entities )
      //.then( data => window.wbk.simplify.entities(data.entities, { keepQualifiers: true } )) // TODO
      .then( entities => {

        //console.log( 'nr of wikidata results: ', topicResults.query.search.length );

        if ( topicResults !== '' ){ // multiple results found with a matching qid

          //if ( source === 'wikidata' ){
            //console.log( 'more wikidata results?: ', topicResults );
          //}

          // add wikidata to respective wikiresult item
          $.each( topicResults.query.search, function( k, item ) {
 
            item.datasource = source;

            // make sure the item has a qid
            if ( typeof item.qid === undefined || typeof item.qid === 'undefined'){
              // do nothing
            }
            // AND make sure that there is an entity with this qid
            else if ( typeof entities[ item.qid ] === undefined || typeof entities[ item.qid ] === 'undefined'){
              // do nothing
            }
            else { // item with qid

              if ( item.qid === entities[ item.qid ].id ){ // matching qid

                // detect the relevant wikidata-data and put this info into each item
                setWikidata( item, entities[ item.qid ], false, target_pane );

              }

            }

          });

          resolve( [ { source : { data: topicResults } } ] );

        }
        else { // single result

          let item = { qid : qids[0] };

          // detect the relevant wikidata-data and put this info into the item
          setWikidata( item, entities[ item.qid ], true, target_pane );

          // FIXME: how should we handle this? 
          //console.log('fetchWikidata: single: ', source, ' fix needed?' );

          resolve( [ { source : { data: item } } ] );

        }

    }) // end of qid entitie processing

    //return item_;

  });

}

function tryFallbackToQid(){

  if ( explore.type === 'wikipedia-qid' ){

    if ( explore.qid.startsWith('Q') ){
      explore.qid = explore.qid.substring(1); // always remove 'Q' from string
    }

    if ( document.getElementById('infoframeSplit2') === null ){ // single-content-frame

      $( explore.baseframe ).attr({"src": explore.base + '/app/wikidata/?q=Q' + explore.qid + '&lang=' + explore.language });

    }
    else { // dual-content-frame

      $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikidata/?q=Q' + explore.qid + '&lang=' + explore.language });

    }

  }

}

async function runQuery( json, json_url ){

  //console.log( 'runQuery: ', json, json_url );

  let paging_mode = true; // default

  const output_type = $('#structured-query-output').val() || '';

  if ( valid( output_type ) && output_type !== 'sidebar' ){

    paging_mode = false; // fetch all results at once (with a limit)

  }

  explore.searchmode    = 'wikidata';
  explore.query         = json;
  explore.topic_cursor  = 'n1-1';

  updatePushState( explore.q , 'add' );

  explore.page = 1;

  $('#pager').hide();

  explore.wikidata_query = json_url;

  runWikidataQuery( paging_mode );

}

async function runWikidataQuery( paging_mode ){

  $('#blink').show();
  $('#pager').hide();
  $('#results-label' ).empty();
  $('#total-results').empty();
  $('#scroll-end').hide();
  $('#results').empty();
  clearGraph();

 if ( explore.page === 1 ){ // first time fetch

    explore.totalRecords = 0;

    let count_query = explore.wikidata_query;
    count_query = count_query.replace( /(.*)%20WHERE%20%7B/, 'SELECT%20%28COUNT%28%2a%29%20AS%20%3Fcount%29%7B');
    count_query = count_query.replace( /ORDER%20BY(.*)/, '');

    let count_url = datasources.wikidata.endpoint + '?format=json&query=' + count_query;
    console.log( 'count URL: ', count_url );
    
    // get total amount of results
    fetch( count_url )
      .then( response2 => response2.json() )
      .then( async count_json => {

        if ( valid( count_json.results.bindings[0].count.value ) ){

          if ( count_json.results.bindings[0].count.value > 0 ){

            explore.totalRecords = count_json.results.bindings[0].count.value;

            if ( ! paging_mode ){ // dont page results, but fetch as one batch, then render using the provided command.

              const output_type = $('#structured-query-output').val() || '';

              const limit       = 1000;

              // change fetch URL
              explore.wikidata_query = explore.wikidata_query.replace( /LIMIT%20[\d]*/, `LIMIT%20${limit}` );

              let qids = await fetchWikidataBatchQuery();

              // render output_type using the Command API
						 	if ( qids.length > 0 ){

								let command = '';

  							const action = $('#structured-query-output').val() || '';

								if ( action === 'video' || action === 'web' ){ // search-based commands

									command = `(search '${action} '( ${ qids.join(' ') } ) )`;

								}
								else { // default command mode

									command = `(show '${action} '( ${ qids.join(' ') } ) )`;

								}

								//console.log( command );

								runLISP( command );

							}
							else { // no qids found

								$.toast({
									heading: 'no Wikidata Qid\'s found for these topics',
									//heading: explore.banana.i18n('app-notification-too-few-compare-topics'),
									text: '',
									hideAfter : 10000,
									stack : 1,
									showHideTransition: 'slide',
									icon: 'info'
								})

							}

            }
            else { // render topics into sidebar

              let topicResults = await fetchWikidataQuery();

              topicResults[0].value[0].source.data.query.searchinfo.totalhits = explore.totalRecords;

              renderTopics( { 'wikidata' : { data: topicResults[0] } } );

              $('#loader').hide();

            }

          }
          else {

            $('#loader').hide();
            $('#blink').hide();
            $('#results-label' ).html('no results found');
            $('#pager').show();

          }

        }
        else {

          $('#loader').hide();
          $('#blink').hide();
          $('#results-label' ).html('no results found');
          $('#pager').show();

        }

    });

  }

}

async function fetchWikidataQuery(){

  return new Promise(( resolve, reject ) => {

    // fetch results
    fetch( explore.wikidata_query )

      .then( response => response.json() )
      .then( entities => {

        if ( entities.results.length === 0 ){ // no results found

          $('#scroll-end').hide();
          $('#loader').hide();
          $('#blink').hide();
          $('#results-label').html('no results found');

        }
        else { // results found

          let [ qids, topicResults ] = prepareWikidata( entities );

          let my_promises = [];

          my_promises.push( fetchWikidata( qids, topicResults, 'wikipedia', 'p1' ) );

          // resolve my promises
          Promise.allSettled( my_promises ).
            then((results) => results.forEach((result) => {

              // set source in results (so we can distinguish between other sources in the rendering phase)
              result.value[0].source.data.continue.source = 'wikidata';

              resolve( [ result ] );

            }));

          //fetchWikidata( qids, topicResults, 'wikidata', 'p1' );

          $('details#detail-structured-search').removeAttr("open");

        }

      })

  });

}

async function fetchWikidataBatchQuery(){

  return new Promise(( resolve, reject ) => {

    // fetch results
    fetch( explore.wikidata_query )

      .then( response => response.json() )
      .then( entities => {

        if ( entities.results.length === 0 ){ // no results found

          $('#scroll-end').hide();
          $('#loader').hide();
          $('#blink').hide();
          $('#results-label').html('no results found');

        }
        else { // results found

          let [ qids, topicResults ] = prepareWikidata( entities );

          //$('details#detail-structured-search').removeAttr("open");

          resolve( qids );

        }

      })

  });

}

function prepareWikidata( entities, source ){

  let qids = [];

  let topicResults = {

    batchcomplete : '',
    'continue' : {
      'continue': "-||",
      'sroffset': datasources.wikidata.pagesize,
      'source': source,
    },

    query : {
      search : [],
      searchinfo : {
        totalhits : datasources.wikidata.total,
      },
    }

  };

  $.each( entities.results.bindings , function( index, entity ){

    qids.push( entity.item.value.substring( entity.item.value.lastIndexOf("/") + 1) );

    let title = '';
    let desc  = '';

    if ( valid( entity.itemLabel.value ) ){

      title = entity.itemLabel.value;

    }

    topicResults.query.search.push({

      title: entity.itemLabel.value,
      qid: entity.item.value.substring( entity.item.value.lastIndexOf("/") + 1),
      ns: 0,
      pageid: '',
      size: 0,
      snippet: desc,
      timestamp: "2020-04-11T14:19:12Z",
      wordcount: 0,
      from_sparql: true,

    });

  });

  return [ qids, topicResults ];

}

async function queryLocationTypeInstances( qid, country_qid ) {

  qid = qid.trim();
  country_qid = country_qid.trim();

  if ( !qid.startsWith('Q') ){ qid  = 'Q' + qid; }
  if ( !country_qid.startsWith('Q') ){ country_qid    = 'Q' + country_qid; }

  let query_json = '{"conditions"%3A[{"propertyId"%3A"P31"%2C"propertyDataType"%3A"wikibase-item"%2C"propertyValueRelation"%3A"matching"%2C"referenceRelation"%3A"regardless"%2C"value"%3A"' + qid + '"%2C"subclasses"%3Atrue%2C"conditionRelation"%3Anull%2C"negate"%3Afalse}%2C{"propertyId"%3A"P17"%2C"propertyDataType"%3A"wikibase-item"%2C"propertyValueRelation"%3A"matching"%2C"referenceRelation"%3A"regardless"%2C"value"%3A"' + country_qid + '"%2C"subclasses"%3Atrue%2C"conditionRelation"%3A"and"%2C"negate"%3Afalse}]%2C"limit"%3A10%2C"useLimit"%3Atrue%2C"omitLabels"%3Afalse}';

  let json_url = 'https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20?item%20?itemLabel%20?itemDescription%20WHERE%20%7B%0A%20%20SERVICE%20wikibase:label%20%7B%20bd:serviceParam%20wikibase:language%20%22en%2Cen%2Ces%2Cfr%2Cde%2Cit%2Cru%2Cja%2Czh%2Cfa%2Car%2Cnl%2Cca%2Cel%22.%20%7D%0A%20%20%7B%0A%20%20%20%20SELECT%20DISTINCT%20?item%20WHERE%20%7B%0A%20%20%20%20%20%20?item%20p:P31%20?statement0.%0A%20%20%20%20%20%20?statement0%20(ps:P31/(wdt:P279*))%20wd:' + qid + '.%0A%20%20%20%20%20%20?item%20p:P17%20?statement1.%0A%20%20%20%20%20%20?statement1%20(ps:P17)%20wd:' + country_qid + '.%0A%20%20%20%20%7D%0A%20%20%20%20ORDER%20BY%20%3FitemLabel%0A%20OFFSET%200%20LIMIT%2010%0A%20%20%7D%0A%7D';

  //console.log( json_url );

  runQuery( query_json, json_url  );

}

async function queryParentTaxonInstances( qid ) {

  qid = qid.trim();

  if ( !qid.startsWith('Q') ){

    qid = 'Q' + qid;

  }

  let query_json = '{\"conditions\":[{\"propertyId\":\"P171\",\"propertyDataType\":\"wikibase-item\",\"propertyValueRelation\":\"matching\",\"referenceRelation\":\"regardless\",\"value\":\"Q185194\",\"subclasses\":true,\"conditionRelation\":null,\"negate\":false}],\"limit\":10,\"useLimit\":true,\"omitLabels\":false}';

  let json_url = 'https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20?item%20?itemLabel%20?itemDescription%20WHERE%20%7B%0A%20%20SERVICE%20wikibase:label%20%7B%20bd:serviceParam%20wikibase:language%20%22' + explore.language + '%2Cen%2Ces%2Cfr%2Cde%2Cit%2Cru%2Cja%2Czh%2Cfa%2Car%2Cnl%2Cca%2Cel%22.%20%7D%0A%20%20%7B%0A%20%20%20%20SELECT%20DISTINCT%20?item%20WHERE%20%7B%0A%20%20%20%20%20%20?item%20p:P171%20?statement0.%0A%20%20%20%20%20%20?statement0%20(ps:P171/(wdt:P171*))%20wd:' + qid + '.%0A%20%20%20%20%7D%0A%20%20%20%20ORDER%20BY%20%3FitemLabel%0A%20OFFSET%200%20LIMIT%2010%0A%20%20%7D%0A%7D';

  runQuery( query_json, json_url  );

}

async function queryClassInstances( qid ) {

  qid = qid.trim();

  if ( !qid.startsWith('Q') ){

    qid = 'Q' + qid;

  }

  let query_json = '{\"conditions\":[{\"propertyId\":\"P31\",\"propertyDataType\":\"wikibase-item\",\"propertyValueRelation\":\"matching\",\"referenceRelation\":\"regardless\",\"value\":\"' + qid + '\",\"subclasses\":true,\"conditionRelation\":null,\"negate\":false}],\"limit\":10,\"useLimit\":true,\"omitLabels\":false}';

  let json_url = 'https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20?item%20?itemLabel%20?itemDescription%20WHERE%20%7B%0A%20%20SERVICE%20wikibase:label%20%7B%20bd:serviceParam%20wikibase:language%20%22' + explore.language + '%2Cen%2Ces%2Cfr%2Cde%2Cit%2Cru%2Cja%2Czh%2Cfa%2Car%2Cnl%2Cca%2Cel%22.%20%7D%0A%20%20%7B%0A%20%20%20%20SELECT%20DISTINCT%20?item%20WHERE%20%7B%0A%20%20%20%20%20%20?item%20p:P31%20?statement0.%0A%20%20%20%20%20%20?statement0%20(ps:P31)%20wd:' + qid + '.%0A%20%20%20%20%7D%0A%20%20%20%20ORDER%20BY%20%3FitemLabel%0A%20OFFSET%200%20LIMIT%2010%0A%20%20%7D%0A%7D';

  runQuery( query_json, json_url  );

}

async function getQidsFromTitles( titles ){

  let qids = [];
  let titles_param = '';

  titles.forEach(function( title ) {

    titles_param += '|' + encodeURIComponent( title );

  });

  console.log( titles_param.substring(1) );
  
  // TODO
  /*
  const url = 'https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&titles=' + title + '&format=json';

  try {

    const data = await $.ajax({
        url: url,
        type: 'GET',
        jsonp: "callback",
        dataType: "jsonp",
    });

		if ( typeof data.query.pages[ Object.keys( data.query.pages)[0] ] === undefined ){

			console.log( 'no Qid found for this title: ', title );

		}
		else {

			qid = data.query.pages[ Object.keys( data.query.pages)[0] ].pageprops.wikibase_item;

			//console.log( qid );

		}

    return qid;

  }
  catch ( error ) {

		console.error('Qid fetch error: ' + title, error );

  }
  */

}

// TODO remove?
function afterSetWikidata( item ){

	console.log( item );

	return 0;

}

function setWikidataQueryFilter(){

  let filter = ''; // default, include Wikipedia items

  if ( explore.datasources.includes('wikipedia') ){ // Wikipedia data already being used, so avoid duplicate items from Wikidata.

    filter = `FILTER NOT EXISTS { ?article schema:about ?item; schema:isPartOf <https://${explore.language}.wikipedia.org/>. }`;

  }

  return filter;

}
