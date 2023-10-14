/* global network, makeNetwork, loadGraph, Progress, Modal */
// Load a saved graph if an ID is provided in the query string

var tags = [];

function loadSaved() {

  if (window.location.search) {

		window.language = getParameterByName('l') || 'en';    

    $('#view-title').text( getParameterByName('title') );

		tags = getParameterByName('t') || '';    

    // optional: use Qids -> titles
    let qid_titles = []
		let qids = getParameterByName('q') || '';
		qids = qids.split(',');

    //console.log( qids, qids.length );

		if ( qids.length > 0 && valid( qids[0] ) ){

			// clear any title-tag data, use only Qids now
			tags = '';

			var promiseB = fetchLabel( qids, window.language ).then( function( result ) {

				let label = '';

			  //console.log( result );
        
        Object.values( result.entities ).forEach( value => {

          //console.log( val );

          if ( valid( value.labels[ window.language ] ) ){ // with label

            label = value.labels[ window.language ].value;

            // wrong!
            //qid_titles.push( label.charAt(0).toUpperCase() + label.slice(1) );

            //console.log( 'label: ', label );

            // get the sitelink-data for this language, to get the correct Wikipedia title
            
						let promises = [];

						$.each(qids, function(k, q) {

							promises.push(

								$.ajax({

									url: 'https://www.wikidata.org/wiki/Special:EntityData/' + q + '.json',
									jsonp: "callback",
									dataType: "json",

									success: function( response ) {

										//console.log( response.entities[ q ].sitelinks[ window.language + 'wiki' ] );

										if ( valid( response.entities[ q ].sitelinks[ window.language + 'wiki' ] ) ){

											const wp_title = response.entities[ q ].sitelinks[ window.language + 'wiki' ].title;
											//console.log( wp_title );

											qid_titles.push( wp_title );

											//console.log( qid_titles );

										}

									},

								}),

							);

						});

						$.when.apply($, promises).then(function() {

							//console.log('all promises are done');
              //console.log( qid_titles );

              // set the Qid tags
              tags = qid_titles.join(',');

              //console.log( language, tags );

              doRender();

						});

          }
          else {

            console.log('warning: no label found for Qids: ', qids );

          }

        });

			});

		}
    else { // use non-Qid title tags

      doRender();

    }

    //expandNode( encodeURIComponent( tags[0] );

    /*
    window.progressbar = new Progress('Restoring saved graph...');
    const modalWindow = new Modal(window.progressbar.container, false);
    modalWindow.present();
    // Make the blank network
    makeNetwork();
    window.progressbar.progress(0.02);
    // Set up event listeners for the loading (starting at 2%)
    network.on('stabilizationProgress', (params) => {
      window.progressbar.progress((params.iterations / params.total) + 0.02);
    });

    network.once('stabilizationIterationsDone', () => { modalWindow.close(); });
    loadGraph(window.location.search.substring(1));
    */

  }
}


function doRender() {

  tags = tags.split(',');

  $.each( tags, function( i, tag ){

    addItem( document.getElementById('input'), decodeURIComponent( tag ) )

  });

  $('#submit').trigger('click');

}
