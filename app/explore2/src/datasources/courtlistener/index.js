'use strict';

function autocompleteCourtListener( results, dataset ){

  const source = 'courtlistener';

  let list = [];

  console.log( results );

  if ( valid( results.count > 0 ) ){

    $.each( results.results, function( i, obj ){

      if ( valid( obj.caseName ) ){

        dataset.push( obj.caseName );

      }

    })

  }

}

function processResultsCourtListener( topicResults, struct, index ){

  const source = 'courtlistener';

  console.log( topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.results ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.results.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.count / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.count;

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

      $.each( topicResults.data, function( i, obj ){

        let gid         = valid( obj.id )? obj.id : '';
        let url         = valid( obj.absolute_url )? obj.absolute_url : '';
        let title       = valid( obj.caseName )? obj.caseName : '';

        let start_date  = valid( obj.timestamp )? obj.timestamp.split('-')[0] : '';

        let description = valid( obj.court )? obj.court : '';

        let attorney    = valid( obj.attorney )? obj.attorney + '<br/>': '';
        let date_filed  = valid( obj.dateFiled )? obj.dateFiled + '<br/>': '';

        let thumb       = '';

        description     = highlightTerms( description );

        // TODO: license, 

				// fill fields
				let item = {
          source:       source,
					title:        title,
					description:  description + '<br/><div>' + attorney + date_filed + '</div>',
					gid:          gid,
          qid:          '',
					display_url:  url,
          thumb:        thumb,
          start_date:   start_date,
          countries:    [],
          tags:         [],
				};

				item.tags[0]	= 'work';
				item.tags[1]	= 'document';

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveCourtListener( result, renderObject ){

  const source = 'courtlistener';

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

function renderMarkCourtListener( inputs, source, q_, show_raw_results, id ){

  // TODO

}
