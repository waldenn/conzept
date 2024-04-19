'use strict';

function autocompleteDOAJ( results, dataset ){

  const source = 'doaj';

  let list = [];

  if ( valid( results?.results ) ){

    $.each( results.results, function( i, item ){

      if ( valid( item?.bibjson?.title ) ){

        dataset.push( item.bibjson.title );

      }

    });

  }

}

function processResultsDOAJ( topicResults, struct, index ){

  const source = 'doaj';

  console.log( 'processDOAJResults: ', topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.results ) ){

      resolve( [ [], [] ] );

      datasources[ source ].done = true;

    }
    else if ( topicResults.results.length === 0 ){

      resolve( [ [], [] ] );

      datasources[ source ].done = true;

    }
    else if ( ( Math.max( Math.ceil( topicResults.total / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

      datasources[ source ].done = true;

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

      $.each( topicResults.results, function( i, obj ){

        console.log( obj );

        // URL vars
        let gid           = valid( obj.id )? obj.id : '';

        const url         = valid( obj.id )? `https://doaj.org/toc/${obj.id}` : '';

        let title         = valid( item?.bibjson?.title )? item.bibjson.title : '---';

        let description   = '';

        if ( valid( obj.institution ) ){

          description   += `<div>${ obj.institution }</div>`;

        }

        if ( valid( obj.keywords ) ){

          keywords_html = '';

          description   += `<div>${ obj.keywords.join(', ') }</div>`;

        }

        let author        = '';

        let start_date    = valid( item?.bibjson?.oa_start )? item.bibjson.oa_start : '';

				description       = highlightTerms( description );

        // fill fields
				let item = {
          source:       source,
					title:        title,
					description:  ' ' + description + '<br/></br>' + author,
					gid:          gid,
					display_url:  url,
					thumb:        '',
          start_date:   start_date,
					qid:          '',
          countries:    [],
          tags:         [],
          web_url:      url,
				};

				item.tags[0]	= 'work';
				item.tags[1]	= 'periodical';

        let country_qids = [];

        if ( valid( obj?.bibjson?.country ) ){

          Object.keys( countries ).forEach( (qid) => {

            if ( countries[ qid ].iso2 === obj.bibjson.country.toUpperCase() ){

              country_qids.push( qid );

            };

          });

        }

        addItemCountries( item, country_qids, false );

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveDOAJ( result, renderObject ){

  //console.log( 'resolveDOAJ: ', result );

  const source = 'doaj';

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

function renderMarkDOAJ( inputs, source, q_, show_raw_results, id ){

  // TODO

}
