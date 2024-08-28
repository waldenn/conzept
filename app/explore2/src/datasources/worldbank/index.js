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

        // API bug ("facets" is part of the results)
        if ( i === 'facets' ){
          return true;
        }

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

        let document_language = explore.language; // default
        let document_voice_code = explore.voice_code.startsWith( document_language )? explore.voice_code : explore.language;
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

        if ( valid( obj.owner ) ){

          desc += '&nbsp; - <a href="javascript:void(0)" class="mv-extra-icon" title="explore owner" aria-label="explore owner" role="button"' + setOnClick( Object.assign({}, {}, { type: 'explore', title: '%22' + encodeURIComponent( obj.owner ) + '%22', qid: '', language  : explore.language } ) ) + '"><b>' + obj.owner + '</b></a>';

        }

        if ( valid( obj.colti ) ){

          desc += '<br/><br/><i class="fa-solid fa-lines-leaning"></i>&nbsp; <a href="javascript:void(0)" class="mv-extra-icon" title="explore series" aria-label="explore series" role="button"' + setOnClick( Object.assign({}, {}, { type: 'explore', title: '%22' + encodeURIComponent( obj.colti ) + '%22', qid: '', language  : explore.language } ) ) + '">' + obj.colti + '</a>';

				}

        if ( valid( obj.subtopic ) ){

					let topic_html = '';

					let topics = obj.subtopic.split(',');

					$.each( topics, function( k, topic ){

            const isLastElement = ( k === topics.length -1 );

            topic_html += '<a href="javascript:void(0)" class="mv-extra-icon" title="explore topic" aria-label="explore topic" role="button"' + setOnClick( Object.assign({}, {}, { type: 'explore', title: '%22' + encodeURIComponent( topic ) + '%22', qid: '', language  : explore.language } ) ) + '">' + topic + '</a>' + ( valid( !isLastElement )? ', &nbsp;' : '' );

          });

					desc += '<br/><br/><div> <i class="fa-solid fa-diagram-project"></i>&nbsp; ' + topic_html + '</div>';

				}

        let owner       = valid( obj.owner )? obj.owner : '';;

        desc  = highlightTerms( desc );

				// fill fields
				let item = {
          source:             source,
					title:              title,
					description:        desc,
					gid:                url,
					display_url:        url,
					start_date:	        start_date,
          document_language:  document_language,
          document_voice_code:  document_voice_code,
          pdf_tts_link:       tts_link,
          pdf_link:           pdf_link,

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

