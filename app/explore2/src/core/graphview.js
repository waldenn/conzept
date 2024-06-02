import cytoscape            from "https://cdn.skypack.dev/cytoscape@3.19.0";
import cytoscapeCoseBilkent from "https://cdn.skypack.dev/cytoscape-cose-bilkent@4.1.0";
import cytoscapeDomNode     from "https://cdn.skypack.dev/cytoscape-dom-node@1.0.0";

if ( ! isEmbedded() ){

  cytoscape.use(cytoscapeCoseBilkent);
  cytoscape.use( cytoscapeDomNode );

  // cytoscape instance
  cy = cytoscape({

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

    //boxSelectionEnabled: true,
    //autounselectify: true,

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
  cy.domNode();

  cy.autoungrabify( false );

  cy.on( 'zoom', function( event ){

    // target holds a reference to the originator of the event (core or element)
    var evtTarget = event.target;
    //console.log( evtTarget );

    const zoom_level = Math.min( Math.floor( cy.zoom() * 10 ), 10 );

    if ( valid( zoom_level ) ){

      $('#my-cy').attr( 'data-zoom', zoom_level );
      $('#my-cy div.entry').attr( 'data-zoom', zoom_level );

    }

  });

  cy.on('tap', 'node', function(evt){

    let node = evt.target;
    //console.log("tapped " + node.id() );
    cy.nodes(node).addClass('selected'); // FIXME

  });

}
