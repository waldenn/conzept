'use strict';

function autocompleteWikiquote( results, dataset ){

  const source = 'wikiquote';

  let list = [];

  //console.log( results );

  if ( valid( results.query?.searchinfo?.totalhits ) ){

    if ( results.query.searchinfo.totalhits > 0 ){

      $.each( results.query.search, function( i, obj ){

        if ( valid( obj.title ) ){

          dataset.push( obj.title );

        }

      })

    }

  }

}

function processResultsWikiquote( topicResults, struct, index ){

  const source = 'wikiquote';

  //console.log( topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults?.query?.search ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.query.search.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.query.searchinfo.totalhits / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.query.searchinfo.totalhits;

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

      $.each( topicResults.query.search, function( i, obj ){

        let gid         = valid( obj.pageid )? obj.pageid : '';
        let title       = valid( obj.title )? obj.title : '';
        let url         = valid( title )? `https://${explore.language}.m.wikiquote.org/wiki/${obj.title}` : '';

        let maintag     = 'work';
        let subtag      = 'document';

        let start_date  = '';

        let description = valid( obj.snippet )? '<div title="snippet">' + highlightTerms( stripHtml( obj.snippet.substring(0, explore.text_limit ) + ' (...)' ) ) + '</div>': '';

        let thumb       = '';

				// fill fields
				let item = {
          source:       source,
					title:        title,
					description:  description,
					gid:          url,
          qid:          '',
					display_url:  url,
          thumb:        thumb,
          start_date:   start_date,
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

function resolveWikiquote( result, renderObject ){

  const source = 'wikiquote';

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

function renderMarkWikiquote( inputs, source, q_, show_raw_results, id ){

  // TODO

}
