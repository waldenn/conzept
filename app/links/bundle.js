const isTouchDevice = 'd' in document.documentElement;

window.gotoArticle = function( qid ){
  //console.log( 'qid: ', qid );

	var url = CONZEPT_WEB_BASE + '/app/wikipedia/?t=&l=' + window.getParameterByName('l') + '&qid=' + qid ;

	window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', url: url, current_pane: getCurrentPane(), target_pane: 'ps2' } }, '*' );

	//window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', url: url, current_pane: getCurrentPane(), target_pane: getTargetPane() } }, '*' );
  //window.postMessage({ event_id: 'handleClick', data: { type: 'wikipedia-side', title: '', hash: '', language: 'en', qid: qid } }, '*' );
}

keyboardJS.bind('alt+y', function(e) {
  window.parent.postMessage({ event_id: 'toggle-sidebar', data: { } }, '*' );
});
const endpoint = 'https://' + window.getParameterByName('l') + '.wikipedia.org/w/api.php';

const domParser = new DOMParser();

function queryApi(query) {
  const url = new URL(endpoint);
  const params = { format: 'json', origin: '*', ...query };
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  //console.log( url );
  return fetch(url).then(response => response.json());
}

/**
Get the title of a page from a URL quickly, but inaccurately (no redirects)
TODO: rename this and getPageName to be clearer
*/
const getPageTitle = url => url.split('/').filter(el => el).pop();

/**
Get the name of a Wikipedia page accurately by following redirects (slow)
*/
function getPageName(page) {
  return queryApi({ action: 'query', titles: page, redirects: 1 })
    .then(res => Object.values(res.query.pages)[0].title);
}

/**
Decide whether the name of a wikipedia page is an article, or belongs to another namespace.
See https://en.wikipedia.org/wiki/Wikipedia:Namespace
*/
// Pages outside of main namespace have colons in the middle, e.g. 'WP:UA'
// Remove any trailing colons and return true if the result still contains a colon
const isArticle = name => !(name.endsWith(':') ? name.slice(0, -1) : name).includes(':');


// --- MAIN FUNCTIONS ---

/**
Get a DOM object for the HTML of a Wikipedia page.
*/
function getPageHtml(pageName) {
  //return queryApi({ action: 'parse', page: pageName, prop: 'text', section: 0, redirects: 1 })
  return queryApi({ action: 'parse', page: pageName, prop: 'text', redirects: 1 })
    .then(res => res.parse.text['*']);
    //.then(res => domParser.parseFromString(res.parse.text['*'], 'text/html'));
}

/**
Get a DOM object for the first body paragraph in page HTML.
@param {HtmlElement} element - An HTML element as returned by `getPageHtml`
*/
function getFirstParagraph ( element ){
  // First paragraph that isn't marked as "empty"...
  r = Array.from(element.querySelectorAll('p:not(.mw-empty-elt)')).find(p => !p.querySelector('#coordinates'))
  //console.log( r );

  //s = Array.from(element.querySelectorAll('div'))[0];
  //console.log( s );

  //console.log( element);
  //return [ element.body.innerHTML ];

  //return s;
  return r;
}

/**
Get the name of each Wikipedia article linked.
@param {HtmlElement} element - An HTML element as returned by `getFirstParagraph`
*/
function getWikiLinks(html) {

  var element = '';

  var results;

  //console.log( 'html: ', html );

  var doc = $(html);
  var links = [];

  //console.log( doc );

  $('p a, li a', doc).each( function( key, value ) {

    // skip links in tables
    if ( $(this).parents().is('table') ){
      return 0;
    }

    value = $(this).attr('href') || '';

    // skip redirect-links
    if ( $(this).hasClass('mw-redirect')){
      return 0;
    }

    if ( value.startsWith('/wiki/') ){

      // TODO: how to handle these exceptions in all languages?
      // (note: this is also needed for the conzept browser-extension!)
      if (  value.startsWith('/wiki/Special:') ||
            value.startsWith('/wiki/Template:') ||
            value.startsWith('/wiki/Template_talk:') ||
            value.startsWith('/wiki/File:') ||
            value.startsWith('/wiki/File_talk:') ||
            value.startsWith('/wiki/Help:') ||
            value.startsWith('/wiki/Help_talk:') ||
            value.startsWith('/wiki/Wikipedia:') ||
            value.startsWith('/wiki/Wikipedia_talk:') ||
            value.startsWith('/wiki/User:') ||
            value.startsWith('/wiki/User_talk:') ||

            // special cases for this link tool
            //value.startsWith('/wiki/Category:') ||
            value.includes('(identifier)')
        ){

        // do nothing

      }
      else {

        //console.log( value );

        value = value.split('/').filter(el => el).pop(); // page title
        value = value.split('#')[0]; // remove anchor from link
        value = value.replace(/_/g, ' ');

        links.push( value );
      }

    }


  })

  links = links.filter((n, i, self) => self.indexOf(n) === i)
            .filter((i, index) => (index < 18 )) // only use the first X number of links

  //links = links.filter(isArticle).filter((n, i, self) => self.indexOf(n) === i); // Remove duplicates
  //console.log(links);

  /*
  results = links.filter( link => link.startsWith('/wiki/') ) // Only links to Wikipedia articles
    .map(getPageTitle) // Get the title
    .map(link => link.split('#')[0]) // Eliminate anchor links
    .filter(isArticle) // Make sure it's an article and not a part of another namespace
    .map(link => link.replace(/_/g, ' ')) // Replace underscores with spaces for more readable names
    .filter((i, index) => (index < 50 )) // only use the first X number of links
    .filter((n, i, self) => self.indexOf(n) === i); // Remove duplicates
  */


  /*
  if ( Array.from(element.querySelectorAll('a').length < 0 ) ){

    console.log('using DOM query 2');
    element = Array.from(element.querySelectorAll('p')).find(p => !p.querySelector('#coordinates'))
  }
  */

  /*
  results = Array.from(element.querySelectorAll('a'))
    .map(link => link.getAttribute('href'))
    .filter(link => link.startsWith('/wiki/')) // Only links to Wikipedia articles
    .map(getPageTitle) // Get the title
    .map(link => link.split('#')[0]) // Eliminate anchor links
    .filter(isArticle) // Make sure it's an article and not a part of another namespace
    .map(link => link.replace(/_/g, ' ')) // Replace underscores with spaces for more readable names
    .filter((i, index) => (index < 50 )) // only use the first X number of links
    .filter((n, i, self) => self.indexOf(n) === i); // Remove duplicates
  */

  //console.log( results );

  return links;
}


function getSubPages(pageName) {
  return getPageHtml(pageName)
    //.then(getFirstParagraph)
    .then(getWikiLinks);
}

/**
Get the name of a random Wikipedia article
*/
function getRandomArticle() {
  return queryApi({
    action: 'query',
    list: 'random',
    rnlimit: 1,
    rnnamespace: 0, // Limits results to articles
  }).then(res => res.query.random[0].title);
}

/**
Get completion suggestions for a query
*/
function getSuggestions(search) {
  return queryApi({
    action: 'opensearch',
    search,
    limit: 10,
    namespace: 0, // Limits results to articles
  })
    .then(res => res[1]);
}
// This script contains the code necessary to make requests to the python API,
// as well as a more general function which is also used to fetch the README
// for rendering.



// GLOBALS

var api_endpoint = "https://wikipedia-map.now.sh/";

// BASIC METHODS

//Make an asynchronous GET request and execute the onSuccess callback with the data
function requestPage(url, onSuccess) {
  onSuccess = onSuccess || function(){};
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      onSuccess(xhttp.responseText);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

function getJSON(id, onSuccess) {
  //console.log( id );
  requestPage("http://luke.deentaylor.com/wikipedia/graphs/" + id, onSuccess);
}
/* global vis, network, nodes, edges, isReset:writable */
// This script contains helper functions that are used by other scripts to
// perform simple common actions.


// -- MISCELLANEOUS FUNCTIONS -- //

// Get the level of the highest level node that exists in the graph
function maxLevel() {
  const ids = nodes.getIds();
  const levels = ids.map(x => nodes.get(x).level);
  return Math.max.apply(null, levels);
}

// Convert a hex value to RGB
function hexToRGB(hex) {
  // eslint-disable-next-line no-param-reassign
  if (hex.startsWith('#')) hex = hex.slice(1, hex.length); // Remove leading #
  const strips = [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)]; // Cut up into 2-digit strips
  return strips.map(x => parseInt(x, 16)); // To RGB
}
function rgbToHex(rgb) {
  const hexvals = rgb
    .map(x => Math.round(x).toString(16))
    .map(x => (x.length === 1 ? `0${x}` : x));
  // Add leading 0s to make a valid 6 digit hex
  return `#${hexvals.join('')}`;
}

// Lighten a given hex color by %
function lightenHex(hex, percent) {
  const rgb = hexToRGB(hex); // Convert to RGB
  const newRgb = rgb.map(x => x + ((Math.min(percent, 100) / 100) * (255 - x)));
  return rgbToHex(newRgb); // and back to hex
}
// Get the color for a node, lighten a blue based on level. Subtle.
function getColor(level) {
  return lightenHex('#03A9F4', 5 * level); // Gets 5% lighter for each level
}
// Get the highlighted color for a node, lighten a yellow based on level. Subtle.
function getYellowColor(level) {
  return lightenHex('#FFC107', 5 * level); // Gets 5% lighter for each level
}
// Get the color that an edge should be pointing to a certain level
function getEdgeColor(level) {
  const nodecolor = getColor(level);
  return vis.util.parseColor(nodecolor).border;
}


// Break a sentence into separate lines, trying to fit each line within `limit`
// characters. Only break at spaces, never break in the middle of words.
function wordwrap(text, limit) {
  const words = text.split(' ');
  const lines = [words[0]];
  words.slice(1).forEach((word) => {
    // Start a new line if adding this word to the previous line would overflow character limit
    if (lines[lines.length - 1].length + word.length > limit) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  });
  return lines.join('\n'); // Trim because the first line will start with a space
}
// Un-word wrap a sentence by replacing line breaks with spaces.
function unwrap(text) { return text.replace(/\n/g, ' '); }

// Get a "neutral" form of a page name to use as an ID. This is designed to
// minimize the number of duplicate nodes found in the network.
function getNeutralId(id) {
  return id
    //.toLowerCase() // Lowercase
    //.replace(/\s/g, '-') // Remove spaces
    //.replace(/[^A-Za-z\d%]/g, '') // Remove non-alphanumeric characters
    //.replace(/s$/, ''); // Remove trailing s
}

// A cross-browser compatible alternative to Math.sign, because support is atrocious
function sign(x) {
  if (x === 0) return 0;
  return x > 0 ? 1 : -1;
}


// == NETWORK SHORTCUTS == //

// Color nodes from a list based on their level. If color=1, highlight color will be used.
function colorNodes(ns, color) {
  const colorFunc = color ? getYellowColor : getColor;

  for (let i = 0; i < ns.length; i += 1) {
    ns[i].color = colorFunc(ns[i].level);
    // Prevent snapping
    delete ns[i].x;
    delete ns[i].y;
  }
  nodes.update(ns);
  isReset = false;
}

// Set the width of some edges.
function edgesWidth(es, width) {
  for (let i = 0; i < es.length; i += 1) {
    es[i].width = width;
  }
  edges.update(es);
  isReset = false;
}

// Get the id of the edge connecting two nodes a and b
function getEdgeConnecting(a, b) {
  const edge = edges.get({
    filter: e => e.from === a && e.to === b,
  })[0];

  return (edge instanceof Object ? edge : {}).id;
}

// Get the network's center of gravity
function getCenter() {
  const nodePositions = network.getPositions();
  const keys = Object.keys(nodePositions);

  // Find the sum of all x and y values
  let xsum = 0; let ysum = 0;

  Object.values(nodePositions).forEach((pos) => {
    xsum += pos.x;
    ysum += pos.y;
  });

  return [xsum / keys.length, ysum / keys.length]; // Average is sum divided by length
}

// Get the position in which nodes should be spawned given the id of a parent node.
// This position is in place so that nodes begin outside the network instead of at the center,
// leading to less chaotic node openings in large networks.
function getSpawnPosition(parentID) {
  // Get position of the node with specified id.
  const { x, y } = network.getPositions(parentID)[parentID];
  const cog = getCenter();
  // Distances from center of gravity to parent node
  const dx = cog[0] - x; const dy = cog[1] - y;

  let relSpawnX; let relSpawnY;

  if (dx === 0) { // Node is directly above center of gravity or on it, so slope will fail.
    relSpawnX = 0;
    relSpawnY = -sign(dy) * 100;
  } else {
    // Compute slope
    const slope = dy / dx;
    // Compute the new node position.
    const dis = 200; // Distance from parent (keep equal to network.options.physics.springLength)
    relSpawnX = dis / Math.sqrt((slope ** 2) + 1);
    relSpawnY = relSpawnX * slope;
  }
  return [Math.round(relSpawnX + x), Math.round(relSpawnY + y)];
}
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
/* global vis, bindNetwork, getNeutralId, wordwrap, getColor, noInputDetected, getItems, clearItems, addItem, getPageName, getRandomArticle, networkFromJson */ // eslint-disable-line max-len
// This script contains the code that creates the central network, as well as
// a function for resetting it to a brand new page.

let nodes;
let edges;
let network; // Global variables

let startpages = [];
// Tracks whether the network needs to be reset. Used to prevent deleting nodes
// when multiple nodes need to be created, because AJAX requests are async.
let needsreset = true;

let darkmode    = $( 'body' ).hasClass( 'dark' );
let font_color  = darkmode? 'white' : '#121212';
let bg_color    = darkmode? '#121212' : '#fbfaf942';

const container = document.getElementById('container');
// Global options
const options = {
  nodes: {
    shape: 'dot',
    scaling: {
      min: 20,
      max: 30,
      label: { min: 14, max: 25, drawThreshold: 9, maxVisible: 100 },
    },
    font: { size: 14, color: font_color, face:'sans', background: bg_color },
    //font: { size: 14, face: 'Helvetica Neue, Helvetica, Arial' },
  },
  interaction: {
    hover: true,
    hoverConnectedEdges: false,
    selectConnectedEdges: true,
  },
  //maxFontSize: 1000,
};

nodes = new vis.DataSet();
edges = new vis.DataSet();
let data = { nodes, edges };
let initialized = false;


// Make the network
function makeNetwork() {
  network = new vis.Network(container, data, options);
  bindNetwork();
  initialized = true;
}


// Reset the network to be new each time.
function resetNetwork(start) {
  if (!initialized) makeNetwork();
  const startID = getNeutralId(start);
  startpages = [startID]; // Register the page as an origin node
  window.tracenodes = [];
  window.traceedges = [];

  // Change "go" button to a refresh icon
  //document.getElementById('submit').innerHTML = '<i class="icon ion-refresh"> </i>';

  // -- CREATE NETWORK -- //
  // Make a container
  nodes = new vis.DataSet([
    {
      id: startID,
      label: wordwrap(decodeURIComponent(start), 20),
      value: 2,
      level: 0,
      color: getColor(0),
      x: 0,
      y: 0,
      parent: startID,
    }, // Parent is self
  ]);
  edges = new vis.DataSet();
  // Put the data in the container
  data = { nodes, edges };
  network.setData(data);

  if ( firstAction ){

    //console.log('auto-opening node with id: ', tags[0] );
    //console.log( tags );

    tags.forEach((element) => { 

      //console.log( element );

      expandNode( encodeURIComponent( element ) ); 

      firstAction = false;

    })

  }

}


// Add a new start node to the map.
function addStart(start, index) {
  if (needsreset) {
    // Delete everything only for the first call to addStart by tracking needsreset
    resetNetwork(start);
    needsreset = false;
  } else {
    const startID = getNeutralId(start);
    startpages.push(startID);
    nodes.add([
      {
        id: startID,
        label: wordwrap(decodeURIComponent(start), 20),
        value: 2,
        level: 0,
        color: getColor(0),
        x: 0,
        y: 0,
        parent: startID, // Parent is self
      },
    ]);
  }
}


// Reset the network with the content from the input box.
function resetNetworkFromInput() {
  // Network should be reset
  needsreset = true;
  const cf = document.getElementsByClassName('commafield')[0];
  // Items entered.
  const inputs = getItems(cf);
  // If no input is given, prompt user to enter articles
  if (!inputs[0]) {
    noInputDetected();
    return;
  }

  inputs.forEach(inp => getPageName(encodeURI(inp)).then(addStart));
}


// Reset the network with one or more random pages.
function randomReset() {
  needsreset = true;
  const cf = document.getElementsByClassName('commafield')[0];
  clearItems(cf);
  // Function to add a single random page to the network as a start.
  const addRandomStart = () => {
    getRandomArticle().then((ra) => {
      addStart(ra);
      addItem(cf, decodeURIComponent(ra));
    });
  };

  if (Math.random() < 0.3) { // 3 in 10 chance of creating multiple nodes
    // Add multiple nodes (2 or 3)
    for (let i = 0; i <= Math.ceil(Math.random() * 2); i += 1) {
      // Unfortunately, random calls need to be at least 1 second apart due to
      // what looks like crappy random algorithms on Wikimedia's end. Even with
      // 1 second, duplicates still occasionally happen, hence the try / catch.
      // I may eventually be able to fix it by implementing my own page
      // randomizer.
      try {
        setTimeout(addRandomStart, i * 1000);
      } catch (e) {}
    }
  } else {
    // Add a single random node (most likely)
    addRandomStart();
  }
}

// Reset the network with content from a JSON string
function resetNetworkFromJson(j) {
  if (!initialized) makeNetwork();
  const obj = networkFromJson(j);
  nodes = obj.nodes;
  edges = obj.edges;
  startpages = obj.startpages;
  // Fill the network
  network.setData({ nodes, edges });
  // Populate the top bar
  startpages.forEach((sp) => {
    addItem(document.getElementById('input'), nodes.get(sp).label);
  });
  // Transform the "go" button to a "refresh" button
  //document.getElementById('submit').innerHTML = '<i class="icon ion-refresh"> </i>';
}
/* global vis, nodes, edges, startpages, getJSON, storeJSON, resetNetworkFromJson, getEdgeColor, getColor, getNeutralId */ // eslint-disable-line max-len
// Functions for the serialization of a vis.js network. This allows for storing
// a network as JSON and then loading it back later.


// SERIALIZATION METHODS //

// Get all the edges that are not directly from a node to its parent. These
// are formed at all cases in which expanding a node links it to a pre-existing
// node.
function getFloatingEdges() {
  const floatingEdges = [];
  edges.forEach((edge) => {
    if (nodes.get(edge.to).parent !== edge.from) {
      floatingEdges.push(edge);
    }
  });
  return floatingEdges;
}

// Remove all properties from a node Object which can easily be reconstructed
function abbreviateNode(node) {
  /* Omits the following properties:
  - node.id, which is inferred from `label` through `getNeutralId`
  - node.color, which is inferred from `level` through `getColor`
  - node.value, which is inferred from `startpages` (included separately)
  - node.x, which doesn't matter at all for reconstruction
  - node.y, which also doesn't matter at all

  This leaves us with:
  - node.label, which is used to reconstruct node.id
  - node.level, which is used to reconstruct node.color
  - node.parent, which is used to reconstruct the network's edges */

  const newnode = { a: node.label,
    b: node.level,
    c: node.parent };
  return newnode;
}

// Remove all properties from an edge Object which can be easily reconstructed
function abbreviateEdge(edge) {
  /* Omits the following properties:
  - edge.color, which is inferred from nodes.get(edge.to).color
  - edge.selectionWidth, which is always 2
  - edge.hoverWidth, which is always 0
  */
  const newedge = { a: edge.from,
    b: edge.to,
    c: edge.level };
  return newedge;
}

// Concisely JSON-ize the data needed to quickly reconstruct the network
function networkToJson() {
  const out = {};

  // Store nodes
  const data = nodes._data; // Retreive an object representing nodes data
  const vals = Object.keys(data).map(k => data[k]);
  const abbv = vals.map(abbreviateNode); // Process it
  out.nodes = abbv; // Store it

  // Store startpages
  out.startpages = startpages;

  // Store floating edges
  out.edges = getFloatingEdges();

  return JSON.stringify(out);
}


// DESERIALIZATION METHODS //

// Unabbreviate a node Object
function unabbreviateNode(node, startpgs) {
  // Make quick substitutions
  const newnode = {
    label: node.a,
    level: node.b,
    parent: node.c,
  };
  // Infer omitted properties
  newnode.id = getNeutralId(newnode.label);
  newnode.color = getColor(newnode.level);
  newnode.value = startpgs.indexOf(newnode.id) === -1 ? 1 : 2;

  return newnode;
}

// Unabbreviate an edge Object.
function unabbreviateEdge(edge) {
  const newedge = { from: edge.a,
    to: edge.b,
    level: edge.c };
  newedge.color = getEdgeColor(newedge.level);
  newedge.selectionWidth = 2;
  newedge.hoverWidth = 0;

  return newedge;
}

// Reconstruct edges given a list of nodes
function buildEdges(nds) {
  const edgs = new vis.DataSet();
  nds.forEach((node) => {
    if (node.parent !== node.id) {
      edgs.add({
        from: node.parent,
        to: node.id,
        color: getEdgeColor(node.level),
        level: node.level,
        selectionWidth: 2,
        hoverWidth: 0,
      });
    }
  });

  return edgs;
}

// Take consise JSON and use it to reconstruct `nodes` and `edges`
function networkFromJson(data) {
  // Get data
  const d = JSON.parse(data);

  const out = {};

  // Store startpages
  out.startpages = d.startpages;
  // Store nodes
  const nds = d.nodes;
  const expandedNodes = nds.map(x => unabbreviateNode(x, out.startpages));
  out.nodes = new vis.DataSet();
  out.nodes.add(expandedNodes);
  // Store edges
  out.edges = buildEdges(expandedNodes);
  out.edges.add(d.edges);

  return out;
}


// MAIN FUNCTIONS

//function storeGraph(callback) {
//  storeJSON(networkToJson(), callback);
//}

function loadGraph(id) {
  getJSON(id, resetNetworkFromJson);
}


// DEBUGGING FUNCTIONS //

// Debugging function to see the number of characters saved by only including
// select values in the JSON output. This helps me assess the efficiency of my
// abbreviation method.
function howConcise() {
  // Length of all the data if no abbre
  const unAbbreviatedLength = JSON.stringify(nodes._data).length +
                            JSON.stringify(edges._data).length +
                            JSON.stringify(startpages).length;
  const abbreviatedLength = networkToJson().length;
  const bytesSaved = unAbbreviatedLength - abbreviatedLength;
  const percentSaved = (bytesSaved / unAbbreviatedLength) * 100;
  const averageSize = abbreviatedLength / nodes.length;
  console.log(`Abbreviation takes JSON size from ${unAbbreviatedLength} bytes (unabbreviated) to ${abbreviatedLength} bytes (abbreviated)`);
  console.log(`Saves a total of ${bytesSaved} bytes (${percentSaved} percent)`);
  console.log(`Average size of ${averageSize} bytes per node`);
}
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

      window.postMessage({ event_id: 'handleClick', data: { type: 'link', title: title, url: url, current_pane: getCurrentPane(), target_pane: 'ps2', ids: link_href } }, '*' );

    }

    firstAction = false;

	}

  if (params.nodes.length) { // Did the click occur on a node?

    //console.log( params.nodes );

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

        var url = CONZEPT_WEB_BASE + '/app/wikipedia/?t=' + title + '&l=' + window.getParameterByName('l') + '&qid=';
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

/* This contains the JavaScript code for the 'commafield,' which is basically
a tag input. It just gives visual feedback that inputs were 'registered' when a
user is inputting multiple elements. Running this script will transform all
elements with the 'commafield' class name to comma separated input field.
*/

// == HELPER FUNCTIONS == //

// An onclick function that removes the element clicked
function removeThis() {
  this.parentElement.removeChild(this);
}

// Turn placeholder on for a commafield
function onPlaceholder(cf) {
  if (cf.hasAttribute('data-placeholder')) {
    const inp = cf.getElementsByTagName('input')[0];
    inp.setAttribute('placeholder', cf.getAttribute('data-placeholder'));
  }
}

// Turn placeholder off for a commafield
function offPlaceholder(cf) {
  if (cf.hasAttribute('data-placeholder')) {
    const inp = cf.getElementsByTagName('input')[0];
    inp.removeAttribute('placeholder');
  }
}

// == PUBLIC API == //

// Return a list of the text in each item of an element (specified by either the node or an id)

function getRegisteredItems(inp) {
  // Get the element if a string id was provided
  const cf = typeof inp === 'string' ? document.getElementById(inp) : inp;
  const items = Array.from(cf.getElementsByClassName('item'));
  return items.map(i => i.textContent);
}

function getItems(inp) {
  const itemtexts = getRegisteredItems(inp);
  // Add the input box's text if anything is entered
  const cf = typeof inp === 'string' ? document.getElementById(inp) : inp;
  if (cf.getElementsByTagName('input')[0].value.trim().length) {
    itemtexts.push(cf.getElementsByTagName('input')[0].value);
  }
  return itemtexts;
}


// Back to inner workings

// Add an item to an input
function addItem(cf, itemtext) {
  const item = document.createElement('div');
  const text = document.createTextNode(itemtext);
  item.appendChild(text);
  item.className = 'item';
  item.onclick = removeThis;
  cf.insertBefore(item, cf.getElementsByTagName('input')[0]);
  // Turn off the placeholder
  offPlaceholder(cf);
}

// Remove the last item from a commafield
function removeLast(cf) {
  const items = cf.getElementsByClassName('item');
  if (items.length) cf.removeChild(items[items.length - 1]);
  // Turn the placeholder back on only if no tags are entered
  if (!getRegisteredItems(cf).length) onPlaceholder(cf);
}

// Clear all items from a commafield
function clearItems(cf) {
  // Clear input
  cf.getElementsByTagName('input')[0].value = '';
  while (cf.getElementsByClassName('item').length) {
    removeLast(cf);
  }
}

// == Keybindings function == //
function cfKeyDown(e = window.event) {
  // Check key codes
  const keycode = e.which || e.keyCode;
  const inp = e.target;

  switch (keycode) {
    // Comma was pressed. Insert comma if 'Alt' was held, otherwise continue
    case 188:
      if (e.altKey) {
        e.preventDefault(); // Don't insert a '≤'
        inp.value += ',';
        break;
      }
    // Comma (sans-Alt), Enter, or Tab was pressed.
    case 13:
    case 9:
      e.preventDefault(); // Stop normal action
      // Add item and clear input if anything besides whitespace was entered
      if (inp.value.trim().length &&
          // Prevent duplicates
          getRegisteredItems(this).indexOf(inp.value) === -1) {
        addItem(this, inp.value.trim());
        inp.value = '';
      }
      break;
    // Delete was pressed.
    case 8:
      // If we're at the beginning of text insertion, delete last item
      if (inp.value === '') {
        removeLast(this);
      }
      break;
    default:
      break;
  }
}

// == CONVERT ALL ELEMENTS WITH APPROPRIATE CLASS == //

const cfs = Array.from(document.getElementsByClassName('commafield'));

cfs.forEach((cf) => {
  // Create the input box
  const input = '<input class="cfinput" type="text"/>';
  cf.innerHTML = input;

  // If the element specified a placeholder, display that in the input.
  // Placeholder will show only if the input is blank and there are no tags
  // entered. This is designed to mimic the way a normal input works.
  onPlaceholder(cf); // Turn placeholder on (if applicable)

  // Bind key events
  cf.onkeydown = cfKeyDown;
});

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
// Tiny library for presenting modal dialogs. Example usage:
/*
<div id="popup">
  Hello!
</div>

<script>
  Modal("<div>Hello!</div>").present()
</script>
*/

function Modal(element, clickToDismiss) {
  // Allow clicking to dismiss by default
  this.clickToDismiss = (clickToDismiss === undefined ? true : clickToDismiss);

  // Construct a centered floating box
  this.elem = document.createElement('div');
  if (typeof element === 'string') {
    this.elem.innerHTML = element;
  } else {
    this.elem.appendChild(element);
  }
  this.elem.className = 'centered';

  this.backdrop = document.createElement('div');
  this.backdrop.className = 'modal-background transparent-blur';

  this.backdrop.appendChild(this.elem);

  // Allow dismissing the modal with a click on the background
  this.backdrop.parent = this;
  this.backdrop.addEventListener('click', (event) => {
    // Clicking on modal content won't hide it, only clicking the background will.
    if ((event.target.className.indexOf('modal-background') !== -1) && this.parent.clickToDismiss) {
      this.parent.close();
    }
  });

  // Expose API

  this.present = () => { document.body.appendChild(this.backdrop); };
  this.close = () => { document.body.removeChild(this.backdrop); };
}
// Tiny library for progress bars. Example usage:
/*
<div id="progressbar">
  <div></div>
</div>

<script>
  var p_elem = document.getElementById("#progressbar")
  var p = new Progress(p_elem)
  p.progress(0.5)
</script>
*/

function Progress(title = '', mainclass = '', barclass = '') {
  this.container = document.createElement('div');
  // Create the progress bar
  this.elem = document.createElement('div');
  this.elem.className = `${mainclass} progressbar`;
  this.bar = document.createElement('div');
  this.bar.className = `${barclass} progressbar-indicator`;
  // Create the title
  this.title = document.createElement('h1');
  // this.title.className = "progressbar-title";
  this.title.textContent = title;

  // Create the label
  this.label = document.createElement('div');
  this.label.className = 'progressbar-label';
  this.label.textContent = '0';

  this.elem.appendChild(this.bar);
  this.container.appendChild(this.title);
  this.container.appendChild(this.elem);
  this.container.appendChild(this.label);

  // Start at 0%
  this.bar.style.width = '0px';
  // Function to set progress
  this.progress = (amount) => {
    if (amount !== undefined) {
      this.bar.style.width = `${amount * 100}%`;
      this.label.textContent = Math.floor(amount * 100);
      return amount;
    }
    return this.bar.offsetWidth / this.elem.offsetWidth;
  };
}
