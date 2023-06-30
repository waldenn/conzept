'use strict';

function autocompleteSmithsonian3D( results, dataset ){

  const source = 'smithsonian3D';

  let list = [];

  if ( Array.isArray( results.rows ) ){

    if ( valid( results.rowCount > 0 ) ){

      $.each( results.rows, function( i, item ){

        if ( valid( item.title ) ){

          dataset.push( item.title );

        }

      })

    }

  }

}

function processResultsSmithsonian3D( topicResults, struct, index ){

  const source = 'smithsonian3D';

  //console.log( 'smithsonian3D: ', topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.rows ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.rows.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.rowCount / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.rowCount;

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

        //console.log( obj );

        // URL vars
        const gid         = valid( obj.title )? obj.title : ''; // obj.nameKey see also: https://discourse.smithsonian3D.org/t/understanding-smithsonian3D-taxonomic-keys-usagekey-taxonkey-specieskey/3045
        const qid         = '';
        const language    = explore.language;
        const term 				= removebracesTitle( getSearchTerm() );
        const start_date  = '';

        let title 		    = valid( obj.title )? obj.title : '--- ' + i;

        let url           = valid( obj.content.uri )? obj.content.uri : '';
        let url_          = eval(`\`${ datasources[ source ].display_url  }\``);

        let desc          = valid( obj.file_type )? obj.file_type : '';
        let subtag        = '';
        let newtab        = false;

        // TODO: abstract this away into a utility function?
        const keywords_regex  = new RegExp( getSearchTerm(), 'gi');
        desc                  = desc.replace( keywords_regex, '<span class="highlight">' + getSearchTerm() + '</span>' );

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

        // TODO: setting this here does not work?
				//item.tags[0]	= 'work';
				//item.tags[1]	= '3d-model';

				setWikidata( item, [ ], true, 'p' + explore.page );

				item.tags[0]	= 'work';
				item.tags[1]	= '3d-model';

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveSmithsonian3D( result, renderObject ){

  const source = 'smithsonian3D';

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

function renderMarkSmithsonian3D( inputs, source, q_, show_raw_results, id ){

  // TODO

}
