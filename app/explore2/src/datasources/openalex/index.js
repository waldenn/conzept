'use strict';

function autocompleteOpenAlex( results, dataset ){

  const source = 'openalex';

  let list = [];

  //console.log( results );

  if ( valid( results.meta.count > 0 ) ){

    $.each( results.results, function( i, item ){

      const title = valid( item.title )? item.title : '';

      if ( title ){

        dataset.push( title );

      }

    })

  }

}

function processResultsOpenAlex( topicResults, struct, index ){

  const source = 'openalex';

  return new Promise(( resolve, reject ) => {

    //console.log( topicResults );

    if ( !valid( topicResults.results ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.results.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.count_found / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.meta.count;

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

        // URL vars
        const gid         = obj.id;
        const qid         = '';
        const language    = explore.language;
        const term 				= removebracesTitle( getSearchTerm() );

        let url           = '';
        let doc_url       = '';

        if ( valid( obj.id ) ){

            url = encodeURIComponent( JSON.stringify( obj.id ) );
            doc_url = obj.id;

        }

        if ( valid( obj.open_access?.oa_url ) ){

          doc_url = obj.open_access.oa_url;

        }
        else if ( valid( obj.doi ) ){

          doc_url = obj.doi;

        }

        const start_date  = '';

        let desc          = '';
        let creators      = [];
        let concepts      = [];
        let subtag        = 'science-article';
        let img           = '';

        if ( valid( doc_url ) ){

            desc = desc + `<a target="_blank" title="source document" aria-label="aria-label" href="${doc_url}"><i class="fa-regular fa-file"></i> source</a><br/><br/>`;

        }

        // get authors
        if ( valid( obj.authorships ) ){

          if ( Array.isArray( obj.authorships ) ){

            $.each( obj.authorships, function ( j, a ) {

							if ( valid( a.author.display_name ) ){

              	creators.push( a.author.display_name );

							}

            });

          }

          if ( creators.length > 0 ){

            desc = desc + '<i class="fa-solid fa-users-line"></i> ' + creators.join(', ');

          }

        }

        // get concepts
        if ( valid( obj.concepts ) ){

          if ( Array.isArray( obj.concepts ) ){

            $.each( obj.concepts, function ( j, concept ) {

							if ( valid( concept.display_name ) ){

                if ( valid( concept.wikidata ) ){

                  let qid = concept.wikidata.split('/').pop() || '';

                  let concept_url = '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + qid.replace(/^Q/g, '');

              	  concepts.push( `<a onclick="openInFrame( &quot;${concept_url}&quot; )" href="javascript:void(0)" title="concept link" aria-label="concept link" aria-role="button">${concept.display_name}</a>` );

              	  //concepts.push( `<a target="infoframe" onclick="resetIframe()" href="${concept_url}" title="concept link" aria-label="concept link">${concept.display_name}</a>` );

                }
                else {

              	  concepts.push( concept.display_name );

                }

							}

            });

          }

          if ( concepts.length > 0 ){

            desc = desc + '<br/><br/><i class="fa-solid fa-diagram-project"></i> ' + concepts.join(', ');

          }

        }

        // fill fields
				let item = {
          source:       source,
					title:        valid( obj.title )? obj.title : '---',
					description:  desc,
					gid:          valid( obj.id )? obj.id : '---',
					display_url:  url ,
					thumb:        img,
          start_date:   valid( obj.publication_year )? obj.publication_year.toString() : '',
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

function resolveOpenAlex( result, renderObject ){

  const source = 'openalex';

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

function renderMarkOpenAlex( inputs, source, q_, show_raw_results, id ){

  // TODO

}
