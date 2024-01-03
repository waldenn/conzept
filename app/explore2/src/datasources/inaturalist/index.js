'use strict';

function autocompleteInaturalist( results, dataset ){

  const source = 'inaturalist';

  let list = [];

  console.log( results );

  if ( valid( results.total_results > 0 ) ){

    $.each( results.results, function( i, item ){

      const title = valid( item.matched_term )? item.matched_term : '';

      if ( title ){

        dataset.push( title );

      }

    })

  }

}

function processResultsInaturalist( topicResults, struct, index ){

  const source = 'inaturalist';

  return new Promise(( resolve, reject ) => {

    console.log( topicResults );

    if ( !valid( topicResults.results ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.results.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.results.total_results / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {
      console.log('foo1');

      datasources[ source ].total = topicResults.total_results;

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

        const gid         = obj.id;
        const qid         = '';
        const language    = explore.language;
        const term                              = removebracesTitle( getSearchTerm() );
        const start_date  = '';

        let url           = '';
        let doc_url       = '';
        let desc          = '';
        let creators      = [];
        let concepts      = [];
        let subtag        = '';
        let img           = '';
        let img_attribution = '';

        // URL vars

        if ( valid( obj.default_photo ) ){

          if ( valid( obj.default_photo ) ){

            img = obj.default_photo.medium_url;

          }

          if ( valid( obj.default_photo.attribution ) ){

            img_attribution = obj.default_photo.attribution;

          }


        }

        if ( valid( obj.id ) ){

            url = encodeURIComponent( JSON.stringify( 'https://www.inaturalist.org/taxa/' + obj.id ) );

            doc_url = 'https://www.inaturalist.org/observations?place_id=any&subview=map&taxon_id=' + obj.id;

        }

        if ( valid( doc_url ) ){

          desc = desc + `<div><a target="_blank" title="iNaturalist page" aria-label="iNaturalist page" href="${doc_url}"><i class="fa-solid fa-arrow-up-right-from-square"></i></a></div>`;

        }

        if ( valid( obj.rank ) ){

	  			desc += `<div><i>${ capitalizeFirstLetter( obj.rank ) }</i></div>`;

				}

        if ( valid( obj.preferred_common_name ) ){

	  			desc += `<br/><div>${ obj.preferred_common_name }</div>`;

				}

        //if ( valid( obj.matched_term ) ){ desc += `<br/><div>${ obj.matched_term }</div>`; }

        if ( valid( img_attribution ) ){

	  			desc += `<br/><div>${ img_attribution }</div>`;

				}


	let title = valid( obj.name, obj.rank )? stripHtml( obj.name ) : '---';

        // fill fields
				let item = {
          source:       source,
					title:        title,
					description:  desc,
					gid:          valid( obj.id )? obj.id : '---',
					display_url:  url,
					thumb:        img,
          start_date:   '',
					qid:          '',
          countries:    [],
          tags:         [],
				};


				item.tags[0]	= 'organism';
				item.tags[1]	= subtag;

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveInaturalist( result, renderObject ){

  const source = 'inaturalist';

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

function renderMarkInaturalist( inputs, source, q_, show_raw_results, id ){

  // TODO

}
