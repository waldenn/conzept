/* global network, makeNetwork, loadGraph, Progress, Modal */
// Load a saved graph if an ID is provided in the query string

var tags = [];

function loadSaved() {

  if (window.location.search) {

		window.language = getParameterByName('l') || 'en';    
		tags = getParameterByName('t') || '';    

		//console.log( language, tags );

		tags = tags.split(',');

		$.each( tags, function( i, tag ){

			addItem( document.getElementById('input'), decodeURIComponent( tag ) )

		});

		$('#submit').trigger('click');

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


