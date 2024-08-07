/* global nodes, edges, isReset, startpages, getSpawnPosition, getNeutralId, wordwrap, unwrap, getColor, getEdgeColor, getEdgeConnecting, getSubPages, colorNodes, edgesWidth */ // eslint-disable-line max-len
// This script contains the big functions that implement a lot of the core
// functionality, like expanding nodes, and getting the nodes for a traceback.


// -- GLOBAL VARIABLES -- //
window.isReset = true;
window.selectedNode = null;
window.traceedges = [];
window.tracenodes = [];
// ---------------------- //


// Callback to add to a node once data is recieved
function expandNodeCallback(page, data) {
  const node = nodes.get(page); // The node that was clicked
  const level = node.level + 1; // Level for new nodes is one more than parent
  const subpages = data;

  // Add all children to network
  const subnodes = [];
  const newedges = [];
  // Where new nodes should be spawned
  const [x, y] = getSpawnPosition(page);
  // Create node objects
  for (let i = 0; i < subpages.length; i += 1) {
    const subpage = subpages[i];
    const subpageID = getNeutralId(subpage);
    if (nodes.getIds().indexOf(subpageID) === -1) { // Don't add if node exists
      subnodes.push({
        id: subpageID,
        label: wordwrap(decodeURIComponent(subpage), 15),
        value: 1,
        level,
        //color: 'red', // TODO allow the clicked node to have a different color AND prevent node-hovering from changing the color permanently
        color: getColor(level),
        parent: page,
        x,
        y,
      });
    }

    if (!getEdgeConnecting(page, subpageID)) { // Don't create duplicate edges in same direction
      newedges.push({
        from: page,
        to: subpageID,
        color: getEdgeColor(level),
        level,
        selectionWidth: 2,
        hoverWidth: 5,
      });
    }
  }

  // Add the stuff to the nodes array
  nodes.add(subnodes);
  edges.add(newedges);
}

// Expand a node without freezing other stuff
function expandNode(page) {

  //page = decodeURIComponent( page );
  //page = page.replace(' ', '%20');
  page = page.replace('%3A', ':');

  //console.log( page );
  //console.log( 'nodes: ', nodes );
  //console.log( 'test: ', page, nodes._data.Crime );
  //console.log( 'test2: ', nodes.get( page ) );

  //if ( nodes.get(page) !== null 
  if ( valid( nodes._data[ page ] ) ){

    //console.log( 'page found in nodes: ', page );
    const label     = nodes.get( page ).label;
    const pagename  = unwrap(label);
    console.log( 'label: ', label);
    console.log( 'pagename: ', pagename);
    getSubPages(pagename).then(data => expandNodeCallback(page, data));

  }
  else { // TOFIX: something prevents the item from being rendered normally, why?
    //console.log( 'page not found in nodes: ', page, nodes );
    console.log('warning: ', page, nodes.get( page ), nodes );
    //console.log( 'page not found in nodes: ', page, decodeURIComponent( page ), nodes );
    getSubPages( unwrap( page ) ).then(data => expandNodeCallback( decodeURIComponent( page ), data));
  }

}

// Get all the nodes tracing back to the start node.
function getTraceBackNodes(node) {
  let currentNode = node;
  let finished = false;
  const path = [];
  while (!finished) { // Add parents of nodes until we reach the start
    path.push(currentNode);
    if (startpages.indexOf(currentNode) !== -1) { // Check if we've reached the end
      finished = true;
    }
    currentNode = nodes.get(currentNode).parent; // Keep exploring with the node above.
  }
  return path;
}

// Get all the edges tracing back to the start node.
function getTraceBackEdges(tbnodes) {
  tbnodes.reverse();
  const path = [];
  for (let i = 0; i < tbnodes.length - 1; i += 1) { // Don't iterate through the last node
    path.push(getEdgeConnecting(tbnodes[i], tbnodes[i + 1]));
  }
  return path;
}

// Reset the color of all nodes, and width of all edges.
function resetProperties() {
  if (!isReset) {
    window.selectedNode = null;
    // Reset node color
    const modnodes = window.tracenodes.map(i => nodes.get(i));
    colorNodes(modnodes, 0);
    // Reset edge width and color
    const modedges = window.traceedges.map((i) => {
      const e = edges.get(i);
      e.color = getEdgeColor(nodes.get(e.to).level);
      return e;
    });
    edgesWidth(modedges, 1);
    window.tracenodes = [];
    window.traceedges = [];
  }
}

// Highlight the path from a given node back to the central node.
function traceBack(node) {
  if (node !== window.selectedNode) {
    window.selectedNode = node;
    resetProperties();
    window.tracenodes = getTraceBackNodes(node);
    window.traceedges = getTraceBackEdges(window.tracenodes);
    // Color nodes yellow
    const modnodes = window.tracenodes.map(i => nodes.get(i));
    colorNodes(modnodes, 1);
    // Widen edges
    const modedges = window.traceedges.map((i) => {
      const e = edges.get(i);
      e.color = { inherit: 'to' };
      return e;
    });
    edgesWidth(modedges, 5);
  }
}
