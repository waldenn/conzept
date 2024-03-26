'use strict';

function autocompleteArchiveScholar( results, dataset ){

  const source = 'archive_scholar';

  let list = [];

  if ( valid( results.count_found > 0 ) ){

    $.each( results.results, function( i, item ){

      const title = valid( item.biblio?.title )? item.biblio.title : '';

      if ( title ){

        dataset.push( title );

      }

    })

  }

}

function processResultsArchiveScholar( topicResults, struct, index ){

  const source = 'archive_scholar';

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

      datasources[ source ].total = topicResults.count_found;

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
        const gid         = obj.identifier;
        const qid         = '';
        const language    = explore.language;
        const term 				= removebracesTitle( getSearchTerm() );

        let url           = ''; // eval(`\`${ datasources[ source ].display_url  }\``);
        let pdf_url       = '';

        if ( valid( obj.access ) ){

          if ( valid( obj.access[0].access_url ) ){

            let source_link = obj.access[0].access_url;

            if (  source_link.startsWith( 'https://archive.org' ) ){ // add search-keyword parameter for Archive.org works

              source_link += '?q=%22' + term + '%22#' + term;

            }

            url     = encodeURIComponent( JSON.stringify( source_link ) );
            pdf_url = 'http' + source_link.split('\/http')[1];

          }

        }

        const start_date  = '';

        let desc          = '';
        let creators      = [];
        let subtag        = 'science-article';
        let img           = '';

        let document_language   = explore.language;
        let document_voice_code = explore.voice_code_selected.startsWith( document_language )? explore.voice_code_selected : '';
        let tts_link      = pdf_url;

        if ( valid( obj.fulltext ) ){

          if ( valid( obj.fulltext.thumbnail_url ) ){

            img = obj.fulltext.thumbnail_url;

          }

        }

        if ( valid( obj.biblio?.contrib_names ) ){

          $.each( obj.biblio.contrib_names, function( i, name ){

            const author_name       = name;
            const author_search_url = `https://openalex.org/authors?page=1&filter=default.search%3A${ encodeURIComponent( author_name ) }&sort=relevance_score%3Adesc`;

            // FIXME: the link does not work in openalex-in-presentation-mode
            creators.push( `<a onclick="openInFrame( &quot;${author_search_url}&quot; )" href="javascript:void(0)" title="OpenAlex author search" aria-label="OpenAlex author search" aria-role="button">${author_name}</a>`);

          });

        }

        if ( valid( obj._highlights ) ){

          //console.log( obj._highlights[0] );
          desc = obj._highlights[0].replace(/<em>/g, '<mark>').replace(/<\/em>/g, '</mark>');

        }

        // fill fields
				let item = {
          source:       source,
					title:        valid( obj.biblio?.title )? obj.biblio.title : '---',
					description:  desc  + '<br/><br/>' + creators.join(', '),
					gid:          valid( obj.work_ident )? obj.work_ident : '---',
					display_url:  url,
					thumb:        img,
          start_date:   valid( obj.biblio?.release_year )? ( obj.biblio.release_year ).toString() : '',

          document_language:    document_language,
          document_voice_code:  document_voice_code,
          pdf_tts_link: tts_link,

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

function resolveArchiveScholar( result, renderObject ){

  const source = 'archive_scholar';

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

function renderMarkArchiveScholar( inputs, source, q_, show_raw_results, id ){

  // TODO

}
