'use strict';

function autocompleteSnomed( results, dataset ){

  const source = 'snomed';

  let list = [];

  console.log( result );

  if ( valid( results.response.numFound > 0 ) ){

    $.each( results.response.docs, function( i, item ){

      dataset.push( item.title );

    })

  }

}

function processResultsSnomed( topicResults, struct, index ){

  const source = 'snomed';

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.response.docs ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.response.docs.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.response.numFound / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.response.numFound;

      // standard result structure (modelled after the Wikipedia API)
      let result = {

        source: {

          data: {

            batchcomplete: '',

            continue: {
              'continue': "-||",
              'sroffset': datasources[ source ].pagesize,
              'source': source,
            },

            query: {

              search : [],

              searchinfo: {
                totalhits: datasources[ source ].total,
              },

            },

          },

        },

      };

      $.each( topicResults.response.docs, function( i, obj ){

        // URL vars
        let gid         = obj.identifier;
        let qid         = '';
        let language    = explore.language;

        let url         = eval(`\`${ datasources[ source ].display_url  }\``);

        let start_date  = '';

        if ( valid( obj.date ) ){

          start_date = obj.date;

        }

        let subtag = '';

        if ( valid( obj.mediatype ) ){

          if ( obj.mediatype === 'texts' ){ subtag = 'written-work' }
          else if ( obj.mediatype === 'audio' || obj.mediatype === 'concert' || obj.mediatype === 'etree' ){ subtag = 'music' }
          else if ( obj.mediatype === 'movies' ){ subtag = 'film' }
          else if ( obj.mediatype === 'tv' ){ subtag = 'tv-series' }
          else if ( obj.mediatype === 'image' ){ subtag = 'image' }
          else if ( obj.mediatype === 'collection' ){ subtag = 'periodical' }
          else if ( obj.mediatype === 'web' ){ subtag = 'website' }
          else if ( obj.mediatype === 'software' ){ subtag = 'software' }
          else if ( obj.mediatype === 'data' ){ subtag = 'data' }
          else { console.log( 'TODO: new snomed.org type: ', obj.mediatype ); }

        }

        // fill fields
				let item = {
          source:       source,
					title:        obj.title,
					description:  valid( obj.description )? obj.description : '',
					gid:          obj.identifier,
					display_url:  url,
					thumb:        'https://snomed.org/services/img/' + obj.identifier,
          start_date:   start_date,
					qid:          '',
          countries:    [],
          tags:         [],
				};

				item.tags[0]	= 'work';
				item.tags[1]	= subtag;

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveSnomed( result, renderObject ){

  const source = 'snomed';

  if ( !valid( result.value[0] ) ){ // no results were found

    datasources[ source ].done = true;

  }
  else if ( result.value[0] === 'done' ){ // done fetching results

    datasources[ source ].done = true;

  }
  else {

    renderObject[ source ] = { data : result };

  }

}

function renderMarkSnomed( inputs, source, q_, show_raw_results, id ){

  // TODO

}
