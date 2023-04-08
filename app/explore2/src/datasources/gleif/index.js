'use strict';

function autocompletePreGleif( results, dataset ){

  let list = [];

  if ( valid( results.data ) ){

    $.each( results.data, function( i, company ){

      dataset.push( company.attributes.entity.legalName.name );

    })

  }

}

function processGleifResults( topicResults, struct, index ){

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.data ) ){

      console.log('done 1');

      //datasources.gleif.done        = true;
      //datasources[ 'gleif' ].total  = 0;
      resolve( [ [], [] ] );

    }
    else if ( topicResults.data.length === 0 ){

      console.log('done 2');

      //datasources.gleif.done        = true;
      //datasources[ 'gleif' ].total  = 0;
      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.meta.pagination.total / ( datasources[ 'gleif' ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more restults

      console.log( 'total: ', datasources[ 'gleif' ].total , datasources[ 'gleif' ].pagesize *  explore.page );

      //datasources.gleif.done        = true;
      //datasources[ 'gleif' ].total  = 0;
      resolve( [ [], [] ] );

    }
    else {

      datasources[ 'gleif' ].total = topicResults.meta.pagination.total;

      console.log('more...');

      // setup the standard datasource-result structure (modelled after the Wikipedia API)
      let result = {

						source: {
							data: {
								batchcomplete: '',
								continue: {
									'continue': "-||",
									'sroffset': datasources['gleif'].pagesize,
									'source': 'gleif',
								},

								query: {
									search : [],
									searchinfo: {
										totalhits: topicResults.meta.pagination.total,
									},
								},

							},

						},

					};

      $.each( topicResults.data, function( i, company ){

				// fill any useful fields
				let item = {
          source: 'gleif',
					title: company.attributes.entity.legalName.name,
					lei: company.attributes.lei,
					display_url: `https://www.lei-lookup.com/record/${company.attributes.lei}`, // link to render for each topic
					qid: '',
          countries: [],
          tags: [],
				};

        let country_qids = [];

        if ( valid( company.attributes.entity.jurisdiction ) ){

          Object.keys(countries).forEach( (qid) => {

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

  if ( !valid( result.value[0] ) ){ // no results were found

    datasources.gleif.done = true;

  }
  else if ( result.value[0] === 'done' ){ // done fetching results

    datasources.gleif.done = true;

  }
  else {

    //console.log( datasources[ 'gleif' ].total,  explore.page * datasources[ 'gleif' ].pagesize, explore.page * datasources[ 'gleif' ].pagesize >= datasources[ 'gleif' ].total )
    if ( explore.page * datasources[ 'gleif' ].pagesize >= datasources[ 'gleif' ].total ){ // done fetching, no more results

      console.log('resolveGleif(): rendering, but done fetching, no more results');

      //datasources.gleif.done = true;

    }

    renderObject[ 'gleif' ] = { data : result };

  }

}

function renderMarkGleif( inputs, source, q_, show_raw_results, id ){

  // TODO

}
