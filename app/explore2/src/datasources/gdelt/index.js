'use strict';

function autocompleteGDELT( results, dataset ){

  const source = 'gdelt';

  let list = [];

  //console.log( results );

  if ( valid( results.articles > 0 ) ){

    $.each( results.articles, function( i, item ){

      let title = title = stripHtml( item.title );

      if ( title ){

        dataset.push( title );

      }

    })

  }

}

function processResultsGDELT( topicResults, struct, index ){

  const source = 'gdelt';

  const total = 5; // paging is not supported in the GDELT API

  return new Promise(( resolve, reject ) => {

    //console.log( topicResults );

    if ( !valid( topicResults.articles ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.articles.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( total / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = total;

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

      $.each( topicResults.articles, function( i, obj ){

        // URL vars
        let gid           = '';
        let qid           = '';

        let start_date    = '';
        let title         = '';
        let url           = '';
        let thumb         = '';
        let desc          = '';
        let creators      = [];
        let concepts      = [];
        let maintag       = '';
        let subtag        = '';
        let img           = '';
        let language      = '';

        if ( valid( obj.url ) ){

            url = obj.url;

        }

        maintag = 'work';
        subtag  = 'news-article';

        if ( valid( obj?.title ) ){ // name

          title = stripHtml( obj.title );

        }
        else {

          title = '---';

        }

        if ( valid( obj.socialimage ) ){

          thumb = `https://${explore.host}${explore.base}/app/cors/raw/?url=` + encodeURIComponent( obj.socialimage );

        }

        if ( valid( obj?.seendate ) ){

          start_date = obj.seendate.substring(0,4);

        }

        if ( valid( obj?.context ) ){

          desc  += highlightTerms( stripHtml( obj.context.substring(0, 300) + ' (...)' )  );

        }

        // fill fields
				let item = {
          source:       source,
					title:        title,
					description:  desc,
					gid:          gid,
          web_url:      url,
					display_url:  url, // maybe not viewable, due to CORS restriction
					thumb:        thumb,
          start_date:   start_date,
					qid:          '',
          countries:    [],
          tags:         [],
				};

				setWikidata( item, [ ], true, 'p' + explore.page );

				item.tags[0]	= maintag;
				item.tags[1]	= subtag;

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveGDELT( result, renderObject ){

  const source = 'gdelt';

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

function renderMarkGDELT( inputs, source, q_, show_raw_results, id ){

  // TODO

}
