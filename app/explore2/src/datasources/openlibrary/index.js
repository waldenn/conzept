'use strict';

function autocompleteOpenLibrary( results, dataset ){

  const source = 'openlibrary';

  let list = [];

  if ( valid( results.num_found > 0 ) ){

    $.each( results.docs, function( i, item ){

      dataset.push( item.title );

    })

  }

}

function processResultsOpenLibrary( topicResults, struct, index ){

  const source = 'openlibrary';

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.docs ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.docs.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.num_found / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.num_found;

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

      $.each( topicResults.docs, async function( i, obj ){

        // URL vars
        const gid         = valid( obj.key )? obj.key : '';
        const qid         = '';
        //const language    = explore.language;
        const term 				= removebracesTitle( getSearchTerm() );

				const title				= valid( obj.title )? obj.title : '';

        const url         = `https://openlibrary.org${obj.key}`; //eval(`\`${ datasources[ source ].display_url  }\``);

        const start_date  = valid( obj.first_publish_year )? obj.first_publish_year : '';

       	const thumb 			= valid ( obj.cover_edition_key )? `https://covers.openlibrary.org/b/olid/${ obj.cover_edition_key }-L.jpg` : '';

        let desc          = '';
        let creators      = [];
        let subtag        = '';
        let newtab        = false;

				// get authors
				if ( valid ( obj.author_name ) ){

					$.each( obj.author_name, function ( j, author ) {

						let author_name = author;
						let author_url  = 'https://openlibrary.org/authors/' + obj.author_key[j];

						creators.push( '<a href="javascript:void(0)" title="author" aria-label="author" role="button"' + setOnClick( Object.assign({}, {}, { type: 'link', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + author_name + '</a>' );

					});

				}

				/*
        // check if PDF file available
        if ( ! drm_book && valid( obj.format ) ){

          if ( obj.format.includes('Text PDF') || obj.format.includes('Additional Text PDF') ){

            tts_link = `https://OpenLibrary.org/download/${gid}/${gid}.pdf`;
            // tts_link = `https://OpenLibrary.org/download/${gid}/${ gid.replace( '_', '%20' ) }.pdf`;

          }

        }
				*/

				/*
        if ( valid( obj.description ) ){

          if ( obj.description.length > explore.text_limit ){

            desc = obj.description.substring(0, explore.text_limit ) + ' (...)';           

          }
          else if ( Array.isArray( obj.description ) ){

            if ( obj.description[0].length > explore.text_limit ){

             desc = obj.description[0].substring(0, explore.text_limit ) + ' (...)';

            }
            else {

              desc = obj.description[0];

            }

          }
          else { // short string

            desc = obj.description;

          }

          desc                  = highlightTerms( desc );

        }
				*/

        // fill fields
				let item = {
          source:       source,
					title:        title,
					description:  creators.join(', '),
					gid:          url,
					display_url:  url ,

					thumb:        thumb,
          start_date:   start_date,
					qid:          '',
          countries:    [],
          tags:         [],
          'newtab':     newtab,
				};

				item.tags[0]	= 'work';
				item.tags[1]	= 'book';

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveOpenLibrary( result, renderObject ){

  const source = 'openlibrary';

  //console.log( 'resolveOpenLibrary(): ', result.value );

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

function renderMarkOpenLibrary( inputs, source, q_, show_raw_results, id ){

  // TODO

}
