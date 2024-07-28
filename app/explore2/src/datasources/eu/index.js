'use strict';

function autocompleteEU( results, dataset ){

  const source = 'eu';

  let list = [];

  if ( valid( results.result && results.result.count > 0 ) ){

    $.each( results.result.results, function( i, obj ){

      if ( valid( obj.title[ explore.language ] ) ){ // requested language

        dataset.push( obj.title[ explore.language ] );

      }
      else if ( valid( obj.title['en'] ) ){ // fallback language

        dataset.push( obj.title['en'] );

      }

    })

  }

}

function processResultsEU( topicResults, struct, index ){

  //console.log( topicResults );

  const source = 'eu';

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.result?.results ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.result.results.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.result.count / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.result.count;

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

      $.each( topicResults.result.results, function( i, obj ){

        //console.log( obj );

        // URL vars
        let gid         = obj.id;
        let qid         = '';
        let language    = explore.language;

        // setup URL
        let url         = eval(`\`${ datasources[ source ].display_url }\``);

        let title       = '';
        let desc        = '';

        let start_date    = valid( obj.modified )? obj.modified : '';
        start_date        = start_date.split('-')[0];

        // title
        if ( valid( obj.title[ explore.language ] ) ){ // requested language

          title = obj.title[ explore.language ];

        }
        else if ( valid( obj.title['en'] ) ){ // fallback language

          title = obj.title['en'];

        }

        // description
        if ( valid( obj.description ) ){ // requested language

          if ( valid( obj.description[ explore.language ] ) ){ // requested language

            desc = obj.description[ explore.language ];

            if ( desc.length > explore.text_limit ){

              desc = desc.substring(0, explore.text_limit ) + ' (...)';

            }


          }
          else if ( valid( obj.description['en'] ) ){ // fallback language

            title = obj.description['en'].substring(0, explore.text_limit );

          }

        }


        // TODO: create an utility function for this text-cleaning
        // clean some text values
        title = title.replace( /[`']/g , '"');
        desc  = desc.replace( /[`']/g, '"');
        desc  = highlightTerms( desc );

        let csv_url_list      = [];
        let jsonstat_url_list = [];
        let json_url_list     = [];

        if ( valid( obj.distributions ) ){

          $.each( obj.distributions, function( i, d ){

            if ( valid( d.format?.id ) ){

              if ( d.format.id === 'CSV' ){

                let file_title = '';

                if ( valid( d.title ) ){

                  if ( valid( d.title[ explore.language ] ) ){ // requested language

                    file_title = d.title[ explore.language ];

                  }
                  else if ( valid( d.title['en'] ) ){ // fallback language

                    file_title = d.title[ 'en' ];

                  }

                }
                else {

                  file_title = title + ' --- ' + i;

                }

                if ( d.access_url.length > 1 ){ console.log( 'TODO: Handle more than one data-file per title: ', title, file_title, d.access_url  ); }

                //console.log( title, d.format.id, d.access_url );
                csv_url_list.push( { type: 'CSV', title: file_title, url: d.access_url[0] } );

              }
              else if ( d.format.id === 'json-stat' ){

                let file_title = '';

                if ( valid( d.title ) ){

                  if ( valid( d.title[ explore.language ] ) ){ // requested language

                    file_title = d.title[ explore.language ];

                  }
                  else if ( valid( d.title['en'] ) ){ // fallback language

                    file_title = d.title[ 'en' ];

                  }

                  if ( d.access_url.length > 1 ){ console.log( 'TODO: Handle more than one data-file per title: ', title, file_title, d.access_url  ); }

                  //console.log( title, d.format.id, d.access_url );
                  jsonstat_url_list.push( { type: 'JSONSTAT', title: file_title, url: d.access_url[0] } );

                }
                else {

                  file_title = title + ' --- ' + i;

                }

              }
              else if ( d.format.id === 'JSON' ){

                let file_title = '';

                if ( valid( d.title ) ){

                  if ( valid( d.title[ explore.language ] ) ){ // requested language

                    file_title = d.title[ explore.language ];

                  }
                  else if ( valid( d.title['en'] ) ){ // fallback language

                    file_title = d.title[ 'en' ];

                  }

                }
                else {

                  file_title = title + ' --- ' + i;

                }

                if ( d.access_url.length > 1 ){ console.log( 'TODO: Handle more than one data-file per title: ', title, file_title, d.access_url  ); }

                //console.log( title, d.format.id, d.access_url );
                json_url_list.push( { type: 'JSON', title: file_title, url: d.access_url[0] } );

              }
              else {

                console.log('TODO: implement handling: ', d.format.id );

              }

            }

          });

        }

        //console.log( csv_url_list );

				// fill fields
				let item = {
          source:             source,
					title:              title,
					description:        desc,
					gid:                url,
					display_url:        url,
					start_date:	        start_date,
					web_url:            url,
					csv_file_urls:      csv_url_list,
					jsonstat_file_urls: jsonstat_url_list,
					json_file_urls:     json_url_list,
					//atom_file_urls:     atom_url_list,
					qid:                qid,
          countries:          [],
          tags:               [],
				};

        let country_qids = [];

        if ( valid( obj.country ) ){

          Object.keys( countries ).forEach( (qid) => {

            if ( countries[ qid ].iso2 === obj.country.id.toUpperCase() ){

              country_qids.push( qid );
    
            };

          });

        }

        addItemCountries( item, country_qids, false );

				item.tags[0]	= 'work';
				item.tags[1]	= 'data';

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveEU( result, renderObject ){

  const source = 'eu';

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

function renderMarkEU( inputs, source, q_, show_raw_results, id ){

  // TODO

}
