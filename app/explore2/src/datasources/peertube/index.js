'use strict';

function autocompletePeerTube( results, dataset ){

  const source = 'peertube';

  let list = [];

  if ( valid( results.total > 0 ) ){

    $.each( results.data, function( i, vid ){

      if ( valid( vid.name ) ){

        dataset.push( vid.name );

      }

    })

  }

}

function processResultsPeerTube( topicResults, struct, index ){

  const source = 'peertube';

  //console.log( topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.data ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.data.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.total / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.total;

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

      $.each( topicResults.data, function( i, vid ){

        let gid         = valid( vid.id )? vid.id : '';
        let url         = valid( vid.embedUrl )? vid.embedUrl : '';
        let title       = valid( vid.name )? vid.name : '';

        let start_date  = valid( vid.createdAt )? vid.createdAt.split('-')[0] : '';

        let description = valid( vid.description )? vid.description : '';

        description     = highlightTerms( description );

        let thumb       = valid( vid.thumbnailUrl )? vid.thumbnailUrl : '';

        let duration    = valid( vid.duration )? '<span style="font-size: smaller"><i title="duration" aria-label="duration" class="fa-regular fa-clock"></i> ' + new Date( vid.duration * 1000 ).toISOString().slice(11, 19) + '</span>' : '';

        let channel     = '';

        if ( valid( vid.channel ) ){

          if ( valid( vid.channel.displayName ) ){

            channel= `<span style="float:right"><i title="channel" aria-label="channel" class="fa-solid fa-user"></i> <b><a onclick="openInNewTab( &quot;${vid.channel.url}&quot; )" href="javascript:void(0)" title="channel" aria-label="channel" aria-role="button">${vid.channel.displayName}</a></b></span>`;

         }

        }

        // TODO: license, 

				// fill fields
				let item = {
          source:       source,
					title:        title,
					description:  '<div>' + duration + channel + '</div><br/>' + description,
					gid:          gid,
          qid:          '',
					display_url:  url,
          thumb:        thumb,
          start_date:   start_date,
          countries:    [],
          tags:         [],
				};

				item.tags[0]	= 'work';
				item.tags[1]	= 'video';

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolvePeerTube( result, renderObject ){

  const source = 'peertube';

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

function renderMarkPeerTube( inputs, source, q_, show_raw_results, id ){

  // TODO

}
