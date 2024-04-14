'use strict';

/*

  TODO:

  - use promise-chain to dependent async-steps

  - Step 1: get ROR data

  - Step 2: get Wikidata metadata

    let d = await fetchWikidata( [ qid ], '', 'wikipedia', false );
    item = d[0].source.data;

  - Step 3: return final results


*/

function autocompleteROR( results, dataset ){

  const source = 'ror';

  let list = [];

  if ( valid( results.items ) ){

    $.each( results.items, function( i, org ){

      if ( i < 5 && valid( org.names ) ){

        dataset.push( org.names[0].value );

      }

    })

  }

}

function processResultsROR( topicResults, struct, index ){

  const source = 'ror';

  //console.log( topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.items ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.items.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.number_of_results / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.number_of_results;

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

      $.each( topicResults.items, function( i, org ){

        // URL vars
        let gid         = org.id.replace('https://ror.org/', '');
        let qid         = '';
        let language    = explore.language;

        // setup URL
        let url         = eval(`\`${ datasources[ source ].display_url }\``);

        if ( valid( org.external_ids ) ){

          $.each( org.external_ids, function( i, eid ){

            if ( valid( eid.type === 'wikidata') ){

              qid = eid.all[0];

            }

          });

        }

				// fill fields
				let item = {
          source: source,
					title: org.names[0].value,
					gid: gid,         // datasource global-ID
					display_url: url, // link to render for each topic
					qid: qid,
          countries: [],
          tags: [],
				};

        let country_qids = [];

        if ( valid( org?.locations ) ){

          Object.keys( countries ).forEach( (qid) => {

            if ( countries[ qid ].iso2 === org?.locations[0]?.geonames_details?.country_code ){

              country_qids.push( qid );

              if ( !valid( item.lat ) ){

                item.lat = org.locations[0].geonames_details.lat;
                item.lon = org.locations[0].geonames_details.lng;

              }
    
            };

          });

        }

        addItemCountries( item, country_qids, false );

				item.tags[0]	= 'organization';
				//item.tags[1]	= '';

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveROR( result, renderObject ){

  const source = 'ror';

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

function renderMarkROR( inputs, source, q_, show_raw_results, id ){

  // TODO

}
