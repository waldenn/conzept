'use strict';

function autocompleteGleif( results, dataset ){

  const source = 'gleif';

  let list = [];

  if ( valid( results.data ) ){

    $.each( results.data, function( i, company ){

      dataset.push( company.attributes.entity.legalName.name );

    })

  }

}

function processResultsGleif( topicResults, struct, index ){

  const source = 'gleif';

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.data ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.data.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.meta.pagination.total / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.meta.pagination.total;

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

      $.each( topicResults.data, function( i, company ){

        // URL vars
        let gid         = company.attributes.lei;
        let qid         = '';
        let language    = explore.language;

        // setup URL
        let url         = eval(`\`${ datasources[ source ].display_url }\``);

				// fill fields
				let item = {
          source: source,
					title: company.attributes.entity.legalName.name,
					lei: company.attributes.lei,
					gid: url, //company.attributes.lei,  // datasource global-ID
					display_url: url,             // link to render for each topic
					qid: qid,
          countries: [],
          tags: [],
				};

        let country_qids = [];

        if ( valid( company.attributes.entity.jurisdiction ) ){

          Object.keys( countries ).forEach( (qid) => {

            if ( countries[ qid ].iso2 === company.attributes.entity.jurisdiction ){

              country_qids.push( qid );
    
            };

          });

        }

        addItemCountries( item, country_qids, false );

				item.tags[0]	= 'organization';
				item.tags[1]	= 'company';

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveGleif( result, renderObject ){

  const source = 'gleif';

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

function renderMarkGleif( inputs, source, q_, show_raw_results, id ){

  // TODO

}
