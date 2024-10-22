'use strict';

function autocompleteSearchCode( results, dataset ){

  const source = 'searchcode';

  let list = [];

  if ( valid( results?.total > 0 ) ){

    $.each( results.results, function( i, item ){

      let title = item.name;

      dataset.push( title );

    })

  }

}

function processResultsSearchCode( topicResults, struct, index ){

  const source = 'searchcode';

  console.log( topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.results ) ){

      resolve( [ [], [] ] );

      datasources[ source ].done = true;

    }
    else if ( topicResults.results.length === 0 ){

      resolve( [ [], [] ] );

      datasources[ source ].done = true;

    }

    else if ( ( Math.max( Math.ceil( 100 / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

      datasources[ source ].done = true;

    }
    else {

      datasources[ source ].total = topicResults.results;

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

      $.each( topicResults.results, function( i, obj ){

        console.log( obj );

        // URL vars
        let gid           = '';

        let url           = valid( obj.url )? obj.url : '';

        let title         = valid( obj.name )? obj.name : '';

        let description   = valid( obj.filename )? obj.filename + '<br/><br/>' : '';
        let subtag        = 'software';

        let creators      = [];

        let start_date    = '';

        const license_link= '';
        let license_name  = '';

        let img           = '';
        let thumb         = '';;

				const description_plain = description;

        var url_          = new URL( url );

				description       = highlightTerms( description );

        // fill fields
				let item = {
          source:       source,
					title:        title,
					description:  `${description}`,
					gid:          url,
					display_url:  url,
					thumb:        thumb,
          start_date:   start_date,
					qid:          '',
          countries:    [],
          tags:         [],
          web_url:      url,
					// TODO: add fields: license link + license name
				};

				item.tags[0]	= 'work';
				item.tags[1]	= subtag;

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

        //console.log( item );

      });

      resolve( [ result ] );

    }

  });

}

function resolveSearchCode( result, renderObject ){

  //console.log( 'resolveSearchCode: ', result );

  const source = 'searchcode';

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

function renderMarkSearchCode( inputs, source, q_, show_raw_results, id ){

  // TODO

}
