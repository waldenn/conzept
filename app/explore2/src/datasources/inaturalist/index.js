'use strict';

function autocompleteInaturalist(results, dataset) {

  const source = 'inaturalist';

  let list = [];

  //console.log(results);

  if ( valid (results.total_results > 0 ) ) {

    $.each(results.results, function(i, item) {

      const title = valid( item.matched_term) ? item.matched_term : '';

      if (title) {

        dataset.push(title);

      }

    })

  }

}

async function processResultsInaturalist(topicResults, struct, index) {

	return new Promise(( finalResult, finalReject ) => {

  const source = 'inaturalist';

  let result = {};

    // P1: fetch iNaturalist taxa, process taxa data into an "item", put each item into the "item list"
		function promise1(){

     return new Promise( (resolve, reject) => {

      if ( !valid(  topicResults.results ) ) {

        resolve( [ [], [] ] );

      }
      else if (topicResults.results.length === 0) {

        resolve( [ [], [] ] );

      }
      else if ((Math.max(Math.ceil(topicResults.results.total_results / (datasources[source].pagesize * (explore.page - 1 ) )), 1) === 1 ) ) { // no more results

        resolve( [ [], [] ] );

      }
      else {

        datasources[source].total = topicResults.total_results;

        // standard result structure (modelled after the Wikipedia API)
        result = {

          source: {

            data: {

              batchcomplete: '',

              continue: {
                'continue': "-||",
                'sroffset': datasources[source].pagesize,
                'source': source,
              },

              query: {

                search: [],

                searchinfo: {
                  totalhits: datasources[source].total,
                },

              },

            },

          },

        };

        $.each( topicResults.results, function(i, obj) {

          let qid         = '';
          const gid       = obj.id;
          const language  = explore.language;
          const term      = removebracesTitle( getSearchTerm() );
          const start_date= '';

          let url       = '';
          let doc_url   = '';
          let title     = valid( obj.name) ? obj.name : '---';
          let rank      = valid( obj.rank) ? obj.rank : '';
          let desc      = '';
          let creators  = [];
          let concepts  = [];
          let subtag    = '';
          let img       = '';
          let img_attribution = '';

          if ( valid (obj.default_photo ) ) {

            if ( valid (obj.default_photo ) ) {

              img = obj.default_photo.medium_url;

            }

            if ( valid (obj.default_photo.attribution ) ) {

              img_attribution = obj.default_photo.attribution;

            }

          }

          if ( valid (obj.id ) ) {

            url = `/app/wikipedia/?t=${ encodeURIComponent( title ) }&l=${ explore.language }`;
            //url = encodeURIComponent( JSON.stringify( 'https://www.inaturalist.org/taxa/' + obj.id ) ); // site cant be iframed!

            doc_url = 'https://www.inaturalist.org/observations?place_id=any&subview=map&taxon_id=' + obj.id;

          }

          if ( valid (doc_url ) ) {

            desc = desc + `<div><a target="_blank" title="iNaturalist page" aria-label="iNaturalist page" href="${doc_url}"><i class="fa-solid fa-arrow-up-right-from-square"></i> iNaturalist observations</a></div>`;

          }

          if ( valid (obj.rank ) ) {

            desc += `<br/><div>Rank: <i>${ capitalizeFirstLetter( obj.rank ) }</i></div>`;

          }

          if ( valid(  obj.preferred_common_name ) ) {

            desc += `<br/><div>Common name: ${ obj.preferred_common_name }</div>`;

          }

          //if ( valid(  obj.matched_term ) ){ desc += `<br/><div>${ obj.matched_term }</div>`; }

          if ( valid (img_attribution ) ) {

            desc += `<br/><div><small>${ img_attribution }</small></div>`;

          }

          // fill fields
          let item = {
            source: source,
            title: title,
            description: desc,
            qid: '',
            gid: valid( obj.id) ? obj.id : '---',
            display_url: url,
            thumb: img,
            start_date: '',
            countries: [],
            tags: [],
          };

				 	item.tags[0]  = 'organism';
				 	//item.tags[1]  = '';

          result.source.data.query.search.push( item );

        });

        //console.log('P1 results: ', result);
        resolve( [result] );

      };

    	});

		}

    // #P2: for each "item" match its title to a Qid
		function promise2(){

     return new Promise( async (resolve, reject) => {

					const qid_promises = [];

					result.source.data.query.search.forEach( function (item, i) {

						const qid_promise = getQidFromTitle( item.title, explore.language ).then( qid_ => {

							item.qid = qid_;

							result.source.data.query.search[i] = item; // update the item

							return qid_;

						});

						qid_promises.push( qid_promise );

					});

					// Wait for all promises to resolve
					const r = await Promise.all( qid_promises );
					resolve( [r] );

					// FIXME needed?: handle no-Qid case?

    	});

		}

	  // P3: lookup Wikidata for each item
		function promise3() {

	   return new Promise( async (resolve, reject) => {

					const asyncOperations = result.source.data.query.search.map(async (item) => {

						return await getWikidata( item.qid );

					});

					Promise.all( asyncOperations ).then((results) => {

							results.forEach( ( item, i ) => {

            		result.source.data.query.search[i] = item;

							})

			  			resolve( [ result ] );
						})
						.catch((error) => {

							console.error('Error in async operations:', error);

						});

	  	});

		}
	  
    // execute promises in dependency-order
		promise1()
      .then(result1 => { return promise2(); })
      .then(result2 => { return promise3(); })
      .then(result3 => { finalResult( result3 ); })
      .catch(error => { console.error('error: ', error); });
	})

}

function resolveInaturalist(result, renderObject) {

  const source = 'inaturalist';

  if ( !valid( result.value[0] ) ) { // no results were found

    datasources[source].done = true;

  }
  else if (result.value[0] === 'done') { // done fetching results

    datasources[source].done = true;

  }
  else {

    renderObject[source] = {
      data: result
    };

  }

}

function renderMarkInaturalist(inputs, source, q_, show_raw_results, id) {

  // TODO

}
