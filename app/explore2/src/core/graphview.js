import cytoscape            from "https://cdn.skypack.dev/cytoscape@3.19.0";
//import cytoscapeCoseBilkent from "https://cdn.skypack.dev/cytoscape-cose-bilkent@4.1.0";
import cytoscapeDomNode     from "https://cdn.skypack.dev/cytoscape-dom-node@1.0.0";

if ( ! isEmbedded() ){

  //cytoscape.use(cytoscapeCoseBilkent);
  cytoscape.use( cytoscapeDomNode );

  // cytoscape instance
  window.cy = cytoscape({

    container: document.getElementById('my-cy'),

    elements: [],

    style: [

      { 
        selector: 'node',
        style: {
          'background-opacity': 0,
        },
      },

      { 
        selector: 'node.selected',
          style: {
            'background-color': 'red'
        },

      },

      { 
        selector: ':selected',
        style: {
          'background-color': 'SteelBlue',
          'background': 'SteelBlue',
          'line-color': 'black',
          'target-arrow-color': 'black',
          'source-arrow-color': 'black'
        }
      },

    ],

    /*
    zoom: 1,

    layout: {
      name: "grid",
      fit: false,
    },
    */

    wheelSensitivity: 0.1,

  });

  // enable extension for instance
  window.cy.domNode();

  window.cy.autoungrabify( false );

  window.cy.on( 'zoom', function( event ){
    // target holds a reference to the originator
    // of the event (core or element)
    var evtTarget = event.target;

    //console.log( evtTarget );

    // updated zoom-level
    //if ( window.cy.zoom() < 0.5 ){

      //console.log( 'zoom is: ', window.cy.zoom() );

      // register zoom-level data on each topic-card
      const zoom_level = Math.min( Math.floor( cy.zoom() * 10 ), 10 );

      if ( valid( zoom_level ) ){

        $('#my-cy').attr( 'data-zoom', zoom_level );
        $('#my-cy div.entry').attr( 'data-zoom', zoom_level );

        // $('#my-cy div.entry').addClass('theme-lattice');

      }

    //}

  });

  window.cy.on('tap', 'node', function(evt){

    let node = evt.target;
    //console.log("tapped " + node.id() );
    window.cy.nodes(node).addClass('selected'); // FIXME

  });

}

/*
// run the layout
function layout() {

  window.cy.layout({
    'name':      'grid', // 'cose-bilkent',
    'randomize': false,
  }).run();

}

// return a definition for a new node, with randomly sized DOM
// element to make it more interesting

function cy_node_def( label, rp ){

  let id = `n${cy.nodes().length}`;
  let div = document.createElement("div");
  div.innerHTML = `node ${id}`;
  div.classList = ['my-cy-node'];
  div.style.width =  '350px'; //`${Math.floor(Math.random() * 40) + 60}px`;
  div.style.height = '350px'; //`${Math.floor(Math.random() * 30) + 50}px`;

  return {

    'data': {

      'id':     id,
      'label':  label || `n${cy.nodes().length}`,
      'dom':    div,

    },

    'renderedPosition': rp,

  };
}

// add node
window.cy.add( cy_node_def() );
layout();

let last_added_id    = 'n0';
let last_extended_id = 'n0';

// add another node
let action = Math.floor(Math.random() * 8);

let cy_n_id = action == 0 ? cy.nodes()[Math.floor(Math.random() * cy.nodes().length)].id()
  : action < 5 ? last_added_id : last_extended_id;

let cy_n = cy.getElementById(cy_n_id);

let new_n_cydef = cy_node_def( undefined, cy_n.renderedPosition() );
console.log( cy_n.renderedPosition() );
let new_n_id    = new_n_cydef.data.id;
//let new_e_cydef = {'data': {'id': new_n_id + '_' + cy_n_id, 'source': new_n_id, 'target': cy_n_id}};

cy.add(new_n_cydef);
//cy.add(new_e_cydef);

last_added_id    = new_n_id;
last_extended_id = cy_n_id;

layout();
*/

