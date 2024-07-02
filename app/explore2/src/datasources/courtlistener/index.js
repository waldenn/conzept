'use strict';

function autocompleteCourtListener( results, dataset ){

  const source = 'courtlistener';

  let list = [];

  //console.log( results );

  if ( valid( results.count > 0 ) ){

    $.each( results.results, function( i, obj ){

      if ( valid( obj.caseName ) ){

        dataset.push( obj.caseName );

      }

    })

  }

}

function processResultsCourtListener( topicResults, struct, index ){

  const source = 'courtlistener';

  //console.log( topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.results ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.results.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.count / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.count;

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

        let gid         = valid( obj.id )? obj.id : '';
        let url         = valid( obj.absolute_url )? 'https://www.courtlistener.com' + obj.absolute_url : '';
        let title       = valid( obj.caseName )? obj.caseName : '';

        let maintag     = 'work';
        let subtag      = '';

        let audio_url   = valid( obj.download_url )? obj.download_url : '';
        let duration    = valid( obj.duration )? '<span style="float:right; font-size: smaller"><i title="duration" aria-label="duration" class="fa-regular fa-clock"></i> ' + new Date( obj.duration * 1000 ).toISOString().slice(11, 19) + '</span>' : '';

        let start_date  = valid( obj.dateFiled )? obj.dateFiled.split('T')[0] : '';

        if ( !valid( start_date) ){ // fallback date

          start_date  = valid( obj.dateArgued )? obj.dateArgued.split('-')[0] : '';

        }

        let docket_number = valid( obj.docketNumber )? '<span title="docket number"><i class="fa-regular fa-folder"></i></i>&nbsp; ' + obj.docketNumber + '</span>': '';

        let citations = valid( obj.cites )? '<div title="citations"><i class="fa-solid fa-quote-left"></i></i>&nbsp; ' + obj.citeCount + '</div>': '';

        let description = valid( obj.snippet )? '<br/><div title="snippet"> <i class="fa-regular fa-file-lines"></i>&nbsp; ' + highlightTerms( stripHtml( obj.snippet.substring(0, explore.text_limit ) + ' (...)' ) ) + '</div><br/>': '';

        let court       = valid( obj.court )? obj.court : '';

        if ( valid( court ) ){

          court         = '<div title="court"><a href="javascript:void(0)" title="court" aria-label="court" role="button"' + setOnClick( Object.assign({}, {}, { type: 'link', title: court, url: `${explore.base}/explore/%22${court}%22?l=${explore.language}&ds=reference&t=string&singleuse=true`, qid: '', language  : explore.language } ) ) + '"><i class="fa-solid fa-landmark"></i>&nbsp ' + court + '</a></div>';

        }

        let judge       = valid( obj.judge )? '<div title="judge"><i class="fa-solid fa-gavel"></i>&nbsp; ' + obj.judge + '</div>': '';
        let person      = valid( obj.name )? '<div title="person"><i class="fa-solid fa-gavel"></i>&nbsp; ' + obj.name + '</div>': '';

        let attorney    = valid( obj.attorney )? '<br/><div title="attorney"><i class="fa-solid fa-user-shield"></i>&nbsp; ' + stripHtml( obj.attorney.substring(0, 600 ) ) + '</div>': '';


        let date_filed  = valid( obj.dateFiled )? '<div title="date filed"><i class="fa-solid fa-clock-rotate-left"></i>&nbsp; ' + obj.dateFiled.split('T')[0] + '<div/>': '';

        let thumb       = '';

        if ( valid( audio_url ) ){ // audio recording

          subtag  = 'audio';

        }
        else if ( valid( person ) ){ // judge

          maintag = 'person';
          subtag  = '';

        }
        else { // legal document

          subtag  = 'document';

        }

				// fill fields
				let item = {
          source:       source,
					title:        title,
					description:  docket_number + duration + '<br/>' + citations + description + court + judge + person + attorney,
					gid:          gid,
          qid:          '',
					display_url:  '/pages/blank.html', // TOFIX: URL CORS loading issues
          web_url:      url,
	  audio_link:	valid( audio_url )? audio_url : '',
          thumb:        thumb,
          start_date:   start_date,
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

function resolveCourtListener( result, renderObject ){

  const source = 'courtlistener';

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

function renderMarkCourtListener( inputs, source, q_, show_raw_results, id ){

  // TODO

}

