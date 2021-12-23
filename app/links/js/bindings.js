/* global nodes, network, isTouchDevice, shepherd */
/* global expandNode, traceBack, resetProperties, resetNetworkFromInput, randomReset, unwrap */
// This script contains (most of) the code that binds actions to events.


let firstAction = true;

// Functions that will be used as bindings
function expandEvent(params) { // Expand a node (with event handler)

	if (params.edges.length > 0) {// if some edge is selected

    let connected_nodes = network.getConnectedNodes( params.edges[0] );
    //console.log( connected_nodes );

    if ( window.location !== window.parent.location ) { // embedded in an iframe

      //var title = connected_nodes[0] + ' ' + connected_nodes[1];
      var title     = connected_nodes[0];
      title = title.replace(/\{\}/g, '');

      var link_href = connected_nodes[1].replace(/ /g, '_');;
      //var link_href = './' + connected_nodes[1].replace(/ /g, '_');;

      // show wikipedia page and mark the line where the link first occurs
      var url = CONZEPT_WEB_BASE + '/app/wikipedia/?t=' + title + '&l=' + window.getParameterByName('l') + '&qid=';

      window.postMessage({ event_id: 'handleClick', data: { type: 'link', title: title, url: url, current_pane: getCurrentPane(), target_pane: getTargetPane(), ids: link_href } }, '*' );

    }

    firstAction = false;

	}

  if (params.nodes.length) { // Did the click occur on a node?

    const page = params.nodes[0]; // The id of the node clicked

    //console.log( page, params );

    // FIXME: when not embedded: TypeError: nodes.get(...) is nullmain_functions.js:61:23
    expandNode( page );
    firstAction = false;

    if ( window.location !== window.parent.location ) { // embedded in an iframe

      var title = page || '';

      //console.log( title, getParameterByName('t') );

      if ( firstAction && encodeURIComponent( getParameterByName('t') ) === title ){
        // dp nothing: this page should already be shown
      }
      else {

        title = title.replace(/\{\}/g, '');

        var url = CONZEPT_WEB_BASE '/app/wikipedia/?t=' + title + '&l=' + window.getParameterByName('l') + '&qid=';
        window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: title, url: url, current_pane: getCurrentPane(), target_pane: getTargetPane(), ids: '' } }, '*' );

        //window.parent.postMessage({ event_id: 'handleClick', data: { type: 'wikipedia-side', title: title, hash: '', language: '', qid: '', ids: '' } }, '*');
      }

    }

  }

}

function mobileTraceEvent(params) { // Trace back a node (with event handler)
  if (params.nodes.length) { // Was the click on a node?
    // The node clicked
    const page = params.nodes[0];
    // Highlight in blue all nodes tracing back to central node
    traceBack(page);
  } else {
    resetProperties();
  }
}

function openPageEvent(params) {
  if (params.nodes.length) {
    const nodeid = params.nodes[0];
    const page = encodeURIComponent(unwrap(nodes.get(nodeid).label));
    const url = `http://en.wikipedia.org/wiki/${page}`;
    window.open(url, '_blank');
  }
}

// Bind the network events
function bindNetwork() {
  if (isTouchDevice) { // Device has touchscreen
    network.on('hold', expandEvent); // Long press to expand
    network.on('click', mobileTraceEvent); // Highlight traceback on click
  } else { // Device does not have touchscreen
    network.on('click', expandEvent); // Expand on click
    network.on('hoverNode', params => traceBack(params.node)); // Highlight traceback on hover
    network.on('blurNode', resetProperties); // un-traceback on un-hover
  }

  // Bind double-click to open page
  //network.on('doubleClick', openPageEvent);
}

function bind() {
  // Prevent iOS scrolling
  document.addEventListener('touchmove', e => e.preventDefault());

  // Bind actions for search component.

  const cf = document.querySelector('.commafield');
  // Bind go button press
  const submitButton = document.getElementById('submit');
  submitButton.addEventListener('click', () => {
    //shepherd.cancel(); // Dismiss the tour if it is in progress
    resetNetworkFromInput();
  });

  const randomButton = document.getElementById('random');
  randomButton.addEventListener('click', randomReset);

  /*
  // Bind tour start
  const tourbtn = document.getElementById('tourinit');
  tourbtn.addEventListener('click', () => shepherd.start());

  // Bind GitHub button
  const ghbutton = document.getElementById('github');
  ghbutton.addEventListener('click', () => window.open('https://github.com/controversial/wikipedia-map', '_blank'));
  */

}

