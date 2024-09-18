'use strict';

function autocompleteSketchfab( results, dataset ){

  const source = 'sketchfab';

  let list = [];

  if ( results.results.length > 0 ){

    $.each( results.results, function( i, model ){

      if ( valid( model.name ) ){

        dataset.push( model.name );

      }

    })

  }

}

function processResultsSketchfab( topicResults, struct, index ){

  const source = 'sketchfab';

  console.log( topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.results ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.results.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( 100 / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = 100; // FIXME: no "total results" count provided in API!

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

      $.each( topicResults.results, function( i, model ){

        let gid         = valid( model.uid )? model.uid : '';
        let url         = valid( model.embedUrl )? model.embedUrl : '';
        let title       = valid( model.name )? model.name : '';

        let start_date  = valid( model.createdAt )? model.createdAt.split('-')[0] : '';

        let description = valid( model.description )? model.description : '';

        description     = highlightTerms( description );

        let thumb       = ''; // valid( model.thumbnailUrl )? model.thumbnailUrl : '';

        if ( valid( model?.thumbnails?.images ) ){

          if ( valid( model.thumbnails.images[ 2 ] ) ){

            thumb = model.thumbnails.images[ 2 ].url;

          }

        }

        console.log( 'thumb: ', thumb );

        let user        = '';

        if ( valid( model.user ) ){

          if ( valid( model.user.displayName ) ){

            user = `<span style="float:right"><i title="user" aria-label="user" class="fa-solid fa-user"></i> <b><a onclick="openInNewTab( &quot;${model.user.profileUrl}&quot; )" href="javascript:void(0)" title="user" aria-label="user" aria-role="button">${model.user.displayName}</a></b></span>`;

         }

        }

        // TODO: license, 

				// fill fields
				let item = {
          source:       source,
					title:        title,
					description:  '<div>' + user + '</div><br/>' + description,
					gid:          url,
          qid:          '',
					display_url:  url,
          thumb:        thumb,
          start_date:   start_date,
          countries:    [],
          tags:         [],
				};

				item.tags[0]	= 'work';
				item.tags[1]	= '3d-model';

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveSketchfab( result, renderObject ){

  const source = 'sketchfab';

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

function renderMarkSketchfab( inputs, source, q_, show_raw_results, id ){

  // TODO

}
