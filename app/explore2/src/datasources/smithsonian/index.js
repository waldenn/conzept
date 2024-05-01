'use strict';

function autocompleteSmithsonian( results, dataset ){

  const source = 'smithsonian';

  let list = [];

  console.log( results.response );

  if ( valid( results?.response?.rowCount > 0 ) ){

    $.each( results.response.rows, function( i, item ){

      if ( valid( item.title ) ){

        dataset.push( item.title );

      }

    })

  }

}

function processResultsSmithsonian( topicResults, struct, index ){

  const source = 'smithsonian';

  console.log( 'smithsonian: ', topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults?.response?.rows ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.response.rows.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.response.rowCount / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.response.rowCount;

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

      $.each( topicResults.rows, function( i, obj ){

        console.log( obj );

        // URL vars
        const gid         = valid( obj.id )? obj.id : '';
        const qid         = '';
        const language    = explore.language;
        const term 				= removebracesTitle( getSearchTerm() );
        let start_date    = '';
        let subtitle      = '';

        const timestamp = valid( obj.timestamp )? obj.timestamp : ''; // Unix timestamp in seconds

        if ( valid( timestamp ) ){

          const milliseconds = timestamp * 1000; // convert timestamp to milliseconds
          const date = new Date(milliseconds); // create a Date object
          start_date = date.getFullYear(); // get the year

        }

        let title 		    = valid( obj.title )? obj.title : '---';

        let url           = '';

        if ( valid( obj?.content?.descriptiveNonRepeating ) ){

          if ( valid( obj.content.descriptiveNonRepeating?.data_source ) ){

            subtitle = obj.content.descriptiveNonRepeating.data_source;

          }

          if ( valid( obj.content.descriptiveNonRepeating?.guid ) ){

            url = obj.content.descriptiveNonRepeating.guid;

          }

          if ( valid( obj.content.descriptiveNonRepeating?.record_link ) ){

            url = obj.content.descriptiveNonRepeating.record_link;

          }

          if ( valid( obj.content.descriptiveNonRepeating?.online_media ) ){

            img = obj.content.descriptiveNonRepeating.online_media.media[0].thumbnail;

          }

        }

        let desc          = '';
        let subtag        = '';
        let newtab        = false;

        if ( valid( obj.indexedStructured ) ){

          if ( valid( obj.indexedStructured.object_type ) ){

            console.log( 'handle object type: ', obj.indexedStructured.object_type );

            if ( obj.indexedStructured.object_type === 'image' ){

              subtag = 'photo';

            }
            else {

              subtag = 'article';

            }

          }

          if ( valid( obj.indexedStructured.topic ) ){

            $.each( obj.indexedStructured.topic, function( j, topic ){

              desc += topic + ', ';

            });

          }

        }

        /*
        if ( valid( obj?.content?.freetext?.notes) ){

          if ( valid( obj.content.freetext?.notes[0]?.content ) ){

            desc = obj.content.freetext.notes[0].content;

          }

        }
        */

        // maybe use:
        // topic 
        // date -> label -> content
        // physicalDescription -> [0] -> content

        desc              = highlightTerms( desc );

        //console.log( title, url_ );

        // fill fields
				let item = {
          source:       source,
					title:        title,
					description:  desc,
					gid:          gid,
					display_url:  url_,
					thumb:        '',
          start_date:   start_date,
					qid:          '',
          countries:    [],
          tags:         [],
          //id:         id,
				};

				setWikidata( item, [ ], true, 'p' + explore.page );

				item.tags[0]	= 'work';
				item.tags[1]	= '';

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveSmithsonian( result, renderObject ){

  const source = 'smithsonian';

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

function renderMarkSmithsonian( inputs, source, q_, show_raw_results, id ){

  // TODO

}
