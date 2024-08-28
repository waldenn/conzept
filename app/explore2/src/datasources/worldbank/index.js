'use strict';

function autocompleteWorldBank( results, dataset ){

  const source = 'world_bank';

  let list = [];

  if ( valid( results.total && results.total > 0 ) ){

    $.each( results.documents, function( i, obj ){

      if ( valid( obj.display_title )	){

        dataset.push( obj.display_title );

      }

    })

  }

}

function processResultsWorldBank( topicResults, struct, index ){

  //console.log( topicResults );

  const source = 'world_bank';

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.documents ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.documents.length === 0 ){

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

      $.each( topicResults.documents, function( i, obj ){

        // URL vars
        let gid         = obj.id;
        let qid         = '';
        let language    = explore.language;

        // setup URL
        let url         = valid( obj.pdfurl )? obj.pdfurl	: ''; // eval(`\`${ datasources[ source ].display_url }\``);

        let title       = valid( obj.display_title )? obj.display_title : '';;
        let desc        = '';

        let start_date    = valid( obj.modified )? obj.modified : '';
        start_date        = valid( obj.docdt )? obj.docdt.split('T')[0] : '';

        let tts_link    = url;
        let pdf_link    = url;

        // description
        if ( valid( obj.abstracts	) ){

          if ( valid( obj.abstracts['cdata!'] ) ){

            desc = obj.abstracts['cdata!'];

            if ( desc.length > explore.text_limit ){

              desc = desc.substring(0, explore.text_limit ) + ' (...)';

            }

          }

        }

        if ( valid( obj.subtopic ) ){

          desc += '<br/><br/><div>' + obj.subtopic.replace(',', ', ') + '</div>';

        }

        desc  = highlightTerms( desc );

				// fill fields
				let item = {
          source:             source,
					title:              title,
					description:        desc,
					gid:                url,
					display_url:        url,
					start_date:	        start_date,
          //document_language:    document_language,
          //document_voice_code:  document_voice_code,
          pdf_tts_link: tts_link,
          pdf_link:     pdf_link,

					web_url:            url,
					qid:                qid,
          countries:          [],
          tags:               [],
				};

        let country_qids = [];

        if ( valid( obj.count ) ){

          Object.keys( countries ).forEach( (qid) => {

            if ( countries[ qid ].name.toLowerCase() === obj.count.toLowerCase() ){

              country_qids.push( qid );
    
            };

          });

        }

        addItemCountries( item, country_qids, false );

				item.tags[0]	= 'work';
				item.tags[1]	= 'document';

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveWorldBank( result, renderObject ){

  const source = 'world_bank';

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

function renderMarkWorldBank( inputs, source, q_, show_raw_results, id ){

  // TODO

}
