'use strict';

function autocompleteWikipedia( r, dataset ){

  if ( Array.isArray( r ) ){

    if ( valid( r[1] ) ){

      r = r[1];
      dataset.push( r );

    }
    else {

      dataset.push( [] );

    }

  }
  else {

    dataset.push( [] );

  }

}

function processResultsWikipedia( topicResults, struct, index ){

  //console.log( 'processResultsWikipedia' );

  return new Promise(( resolve, reject ) => {

    /* "topicResults" is now a list of these type of results:

      <result nr>:
        ns: 0
        pageid: 47717515
        size: 32590
        snippet: "<span class=\"searchmatch\">Quranism</span> (Arabic: القرآنية‎; al-Qur'āniyya) comprises views that Islamic law and guidance should only be based on the Qur'an, thus opposing the religious"
        timestamp: "2020-04-11T14:19:12Z"
        title: "Quranism"
        wordcount: 3797

    */

    const data_titles = [];

    //console.log('processWikipediaResults: ', topicResults );

    if ( topicResults.query === undefined || topicResults.query === 'undefined' ){

      //console.log('no results found');
      resolve( [ [], [] ] );
    }

    // create a list of titles from the "topicResults"
    $.each( topicResults.query.search, function( i, item ) {

      data_titles.push( item.title );
      //data_titles.push( encodeURIComponent( item.title ) );

      if ( valid( item.snippet )  ){

        item.snippet = highlightTerms( stripHtml( item.snippet ) );

      }

    });

    const data_titles_ = data_titles.join('|');

    // fetch the wikipedia-with-qid data for each of those titles
    $.ajax({

      url: `https://${explore.language}.wikipedia.org/w/api.php?action=query&prop=pageprops&titles=${encodeURIComponent( data_titles_ )}&variant=${explore.language_variant}&format=json`,

      dataType: "jsonp",

      success: function( qdata ) {

          /* "qdata" is a list containing results structured like this:

            36922: (pageid)
              title: "Quran"
              ns: 0
              pageid: 36922
              pageprops:
                page_image_free: "Opened_Qur'an.jpg"
                wikibase-shortdesc: "The central religious text of Islam"
                wikibase_item: "Q428"
          */

          // match the Wikipedia results with the "qdata"

          // create empty qdata structures, if no qdata was found
          if ( typeof qdata.query === undefined || typeof qdata.query === 'undefined' ){
            qdata.query = {};
            qdata.query.pages = [];

            if ( explore.type === 'wikipedia-qid' ){ // TODO: check correctness

              addRawTopicCard( explore.q );

              return 0;
            }

          }

          const qlist = [];
          const qids  = [];

          // add "pageid matching Q-IDs and image-URLs" to topicResults data
          $.each( qdata.query.pages, function( j, item ) {

            if ( typeof item.pageprops !== 'undefined' ){

              const pid   = item.pageid || undefined; 
              const qid   = item.pageprops.wikibase_item || ''; 
              const thumb = item.pageprops.page_image_free || '';

              qlist.push( { pid, qid, thumb } );

              if ( qid !== '' ){

                qids.push( qid );

              }

            }

          });

          // find matching page-IDs
          $.each( topicResults.query.search, function( k, item ) {

            item.datasource = 'wikipedia';

            const matched_obj = findObjectByKey( qlist, 'pid', item.pageid ); //[0].pid;

            if ( typeof matched_obj !== undefined ){

              if ( matched_obj[0] !== undefined ){

                // insert "qid" and "thumb" fields
                item.qid    = matched_obj[0].qid;
                item.thumb  = matched_obj[0].thumb;

                if ( item.thumb !== '' ){

                  item.thumbnail_fullsize =  'https://'+ explore.language + '.wikipedia.org/wiki/' + explore.language + ':Special:Filepath/' + item.thumb + '?width=3000';

                }

              }

            }

          });

          if ( qids.length > 0 ){

            let my_promises = [];

            my_promises.push( fetchWikidata( qids, topicResults, 'wikipedia' ) );

            // resolve my promises
            Promise.allSettled( my_promises ).
              then((results) => results.forEach((result) => {

                // add meta structure
                result.value[0].source.data.continue = { 'continue': "-||", 'sroffset': datasources['wikipedia'].pagesize, 'source': 'wikipedia' },

                // set source in results (so we can distinguish between other sources in the rendering phase)
                //console.log( 'FIXME?: ', result );
                //result.value[0].source.data.continue.source = 'wikipedia';

                //console.log( 'processWikipedia: ', result )

                resolve( [ result ] );

              }));

          }
          else { // no qids found

            //console.log( 'processWikipedia: no Qids found' );
            resolve( [ 'done' ] );

          }

      },

      //timeout: 3000,

    });

  });

}

function resolveWikipedia( result, renderObject ){

  //console.log('resolveWikipedia 1: ', result, datasources );

  if ( ! Array.isArray( result.value[0] ) ){ // TOCHECK: skip this second Wikipedia-result-promise

    if ( !valid( result.value[0] ) ){ // no results were found

      //console.log( 'wikipedia datasource: no results found 1')
      datasources.wikipedia.done = true; // dont fetch more from this datasource

    }
    else if ( result.value[0] === 'done' ){ // no results were found

      //console.log( 'wikipedia datasource: no results found 2')
      datasources.wikipedia.done = true; // dont fetch more from this datasource

    }
    else {

      //console.log( 'wikipedia datasource: results: ', result.value[0] )
      renderObject[ 'wikipedia' ] = { data : result.value[0] };

    }

  }

}

function renderMarkWikipedia( inputs, source, q_, show_raw_results, id ){

	if ( valid( inputs[source] ) ){

    if ( valid( inputs[source]?.data.value[0]?.source?.data?.query?.search[0] ) ){

      // check if the names match of the non-wikipedia and wikipedia article
      const c0 = ( q_ === inputs[source].data.value[0].source.data.query.search[0].title.toLowerCase().trim() );
      const c1 = ( typeof inputs[source].data.value[0].source.data.query.search[1] !== 'undefined' ) ? (q_ === inputs[source].data.value[0].source.data.query.search[1].title.toLowerCase().trim() ) : ''
      const c2 = ( typeof inputs[source].data.value[0].source.data.query.search[2] !== 'undefined' ) ? (q_ === inputs[source].data.value[0].source.data.query.search[2].title.toLowerCase().trim() ) : ''
      const c3 = ( typeof inputs[source].data.value[0].source.data.query.search[3] !== 'undefined' ) ? (q_ === inputs[source].data.value[0].source.data.query.search[3].title.toLowerCase().trim() ) : ''

      // check at least the first four (standard, category, book, portal) articles
      if ( validAny( [c0, c1, c2, c3] ) ){ // matching topic-title
        show_raw_results.push( false );
      }
      else {
        show_raw_results.push( true );
      }

      // only on the INITIAL app visit AND WITH wikipedia results: mark the "id" article
      if ( explore.firstAction ){

        markArticle(id, explore.type );

      }

    }

	}

}
