'use strict';

/*
  Conzept map application based on OpenGlobus

	License: GNU GPLv3

  see:
    https://openglobus.org
    https://openglobus.org/api/

*/

let app = {
	globus:	  undefined,

	query:		getParameterByName( 'query' ) || '',

	lat:			getParameterByName( 'lat' ) || '',
	lon:			getParameterByName( 'lon' ) || '',
	qid:			getParameterByName( 'qid' ) || '',
	title:		getParameterByName( 'title' ) || '',
	bbox:			getParameterByName( 'bbox' ) || undefined,

	language: '',
	osm_id:		'',
	view_extent: '',

  label_size: 24,
  label_offset: [10,20],

  colors: [ 'red', 'black', 'orange', 'cyan', 'pink' ],

}

let billboard = {

  src: 'https://' + CONZEPT_HOSTNAME + CONZEPT_WEB_BASE + '/app/map/img/marker-red.png',
  width: 32,
  height: 32,
  offset: [-20, 8],

};

async function init(){

  if ( valid( app.bbox ) ){

    app.bbox = app.bbox.split(',') || [];

    app.view_extent = [ app.bbox[0], app.bbox[1], app.bbox[2], app.bbox[3] ];

  }

  app.language= getParameterByName( 'l' ) || 'en';
	app.osm_id	= getParameterByName( 'osm_id' ) || ''; // OSM object ID

  //console.log( app );

  const osm = new og.layer.XYZ("OpenStreetMap", { 
    isBaseLayer: true, 
    //url: "https://a.tile.openstreetmap.de/{z}/{x}/{y}.png",
    //url: "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", 
    visibility: true, 
    attribution: 'Data @ OpenStreetMap contributors, ODbL', 
    ambient:  [0.80, 0.80, 0.80],
    diffuse:  [0.40, 0.40, 0.40],
    specular: [0, 0, 0],
    //shininess: 100,
   });

  /*
  const osmbuildings = new og.layer.XYZ("OpenStreetMap buildings", { 
    isBaseLayer: true, 
    url: "https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json",
    visibility: true, 
    attribution: 'Data @ OpenStreetMap contributors, ODbL', 
    clampToGround: true,
   });
  */

  app.markerLayer = new og.layer.Vector("Markers", {
    clampToGround: true,
  })

  if ( valid( app.lon ) ){

    app.markerLayer.add(new og.Entity({

			lonlat: [ app.lon, app.lat ],

			label: {
				text: app.title,
				//outline: 0.1,
				outlineColor: "rgba(255, 255, 255, 0.4)",
				size: app.label_size,
				color: "black",
				offsett: app.label_offset,
			},

			billboard,

			properties: {
				title: app.title,
				qid: app.qid,
			}

    }));

  }

	app.markerLayer.events.on("lclick", function (e) {

		//const label = e.pickingObject.label._text || '';
		const label = e.pickingObject.properties.title || '';
		const qid		= e.pickingObject.properties.qid || '';

		console.log( 'picked: ', label, qid );

    const url = 'https://' + CONZEPT_HOSTNAME + CONZEPT_WEB_BASE + '/explore/' + encodeURIComponent( label ) + '?l=' + app.language + '&amp;t=wikipedia-qid&amp;i=' + qid + '&amp;s=false&amp;embedded=true';

		myPopup.setContent('<iframe class="inline-iframe resized" style="min-width: 650px; min-height: 500px; max-width: 60vh; border:none;" src="' + url + '" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen="" allow-downloads="" title="embedded widget: URL-content" role="application" width="100%" height="100%"></iframe>');

		let groundPos = app.globus.planet.getCartesianFromMouseTerrain();
		myPopup.setCartesian3v(groundPos);
		myPopup.setVisibility(true);

	});

	osm.events.on("lclick", function (e) {

		$('div.og-popup').remove(); // remove all popups

	});

  app.globus = new og.Globe({

    target: "globus",

    name: "conzept map",

    terrain: new og.terrain.GlobusTerrain(),

    autoActivated: true,

    viewExtent: app.view_extent,

    layers: [ osm, app.markerLayer ]

  });

	let myPopup = new og.Popup({
		planet: app.globus.planet,
		offset: [0, -400],
		visibility: false,
	});

  app.globus.renderer.gamma         = 0.10;
  app.globus.renderer.exposure      = 3.80;
  app.globus.planet.lightEnabled    = false;

  if ( app.osm_id !== '' ){ // OSM object

    // fetch OSM boundary GeoJSON
    // https://nominatim.org/release-docs/latest/api/Reverse/
    //let url = 'https://nominatim.openstreetmap.org/reverse?osm_id=' + app.osm_id + '&osm_type=R&polygon_geojson=1&format=json&polygon_threshold=0.001';
    let url = 'https://nominatim.openstreetmap.org/reverse?osm_id=' + app.osm_id + '&osm_type=R&polygon_geojson=1&format=json&polygon_threshold=0.001';

    // TODO: parse this relation info into geojson:
    //  - working but not geojson: https://www.openstreetmap.org/api/0.6/relation/3734593.json
    //  - no data: https://nominatim.openstreetmap.org/reverse?osm_id=3734593&osm_type=R&polygon_geojson=1&format=json&polygon_threshold=0.001
    //
    //  - working but ot geojson: https://www.openstreetmap.org/api/0.6/relation/271110.json
    //  - working: https://nominatim.openstreetmap.org/reverse?osm_id=271110&osm_type=R&polygon_geojson=1&format=json&polygon_threshold=0.001
    //let url = 'https://www.openstreetmap.org/api/0.6/relation/' + app.osm_id + '.json';

    //console.log( url );

    // https://wiki.openstreetmap.org/wiki/Types_of_relation
    // https://wiki.openstreetmap.org/wiki/Overpass_turbo/GeoJSON
    // https://wiki.openstreetmap.org/wiki/Relation:route
    //
    // http://ra.osmsurround.org/showRelation?relationId=11166632
    //let url = 'https://nominatim.openstreetmap.org/reverse?osm_id=11166632&osm_type=W&polygon_geojson=1&format=json&polygon_threshold=0.001';
    // https://nominatim.openstreetmap.org/reverse?osm_id=536780&osm_type=R&polygon_geojson=1&format=json&polygon_threshold=0.001
    // https://en.wikipedia.org/wiki/Wikipedia:Creating_route_maps_from_OpenStreetMap_data#Part_2:_Embedding_the_route_into_an_article

    $.ajax({

      url: url,
      dataType: "json",

      success: function( data ) {

        //console.log( data );

        if ( data?.geojson?.type ){

          let annotation = new og.layer.Vector("annotation", {

            'visibility': true,
            'isBaseLayer': false,
            'diffuse': [0, 0, 0],
            'ambient': [1, 1, 1]

          });

          annotation.addTo( app.globus.planet );

          annotation.add( new og.Entity({

            'geometry': {

              'type': data.geojson.type,
              'coordinates': data.geojson.coordinates,
              'style': {
                'lineWidth': 8,
                //'lineColor': "yellow"
                'fillColor': "rgba(0, 0, 0, 0)",

              }
            }

          }));

        }

        if ( valid( data.lon ) ){

          if ( !valid( app.lon ) ){

            app.markerLayer.add(new og.Entity({

                lonlat: [ parseFloat( data.lon ), parseFloat( data.lat ) ],

                label: {
                  text: app.title,
                  //outline: 0.1,
                  outlineColor: "rgba(255, 255, 255, 0.4)",
                  color: "black",
                  size: app.label_size,
				          offsett: app.label_offset,
                },

			          billboard,

								properties: {

									title: app.title,
									qid: app.qid,

								}

            }));

          }

          // see: http://openglobus.org/examples/cameraFly/cameraFly.html
          app.globus.planet.flyExtent(new og.Extent(

            new og.LonLat( data.boundingbox[2], data.boundingbox[0] ),
            new og.LonLat( data.boundingbox[3], data.boundingbox[1] )

          ));

        }

      },

    });

  }
  else if ( valid( app.query ) ){ // SPARQL-query

    if ( app.query.startsWith('[') ){ // list of query objects

      //console.log( app.query );

      app.query = JSON.parse( app.query );

      $.each( app.query, function ( i, q ) {

        //console.log( decodeURIComponent( q.url ) );

        handleQuery( decodeURIComponent( q.url ), app.colors[ i % app.colors.length ] );

      });

    }
    else { // single query URL

      handleQuery( app.query, 'red' );

      //handleQuery( app.query, app.colors[ getRandomInt( app.colors.length ) ] );

    }

  }
  else {

    console.log( 'no OSM ID found' );

    /*
    console.log( app.bbox[0], app.bbox[1], app.bbox[2], app.bbox[3] );

    app.globus.planet.flyExtent( new og.Extent(

      new og.LonLat( app.bbox[0], app.bbox[1] ),
      new og.LonLat( app.bbox[2], app.bbox[3] )

    ));
    */

  }

}

async function handleQuery( url, color ){

  $.ajax({

    url: url,

    dataType: "json",

    success: function( data ) {

      let json = data.results.bindings || [];

      if ( typeof json === undefined || typeof json === 'undefined' ){

        return 1;
      }

      if ( json.length === 0 ) { // no more results

        return 1;

      }

      //console.log( data );

      let markers = [];

      $.each( json, function ( i, v ) {

        let qid = v.item?.value || '';
        qid = qid.replace( 'http://www.wikidata.org/entity/Q', '' );

        markers.push({

          qid: qid,
          title: v.itemLabel?.value || '',
          lat: v.lat?.value || '',
          lon: v.lon?.value || '',
          osmid: v.osmid?.value || '',

        });

      });

      renderMultipleMarkers( markers, color );

    },

  });

}

async function renderMultipleMarkers( markers, color ){

  billboard.src = 'https://' + CONZEPT_HOSTNAME + CONZEPT_WEB_BASE + '/app/map/img/marker-' + color + '.png';

  $.each( markers, function ( i, v ) {

		//console.log( v );

		if ( valid( v.lon ) ){

			app.markerLayer.add(new og.Entity({

        //visibility: false,

				lonlat: [ parseFloat( v.lon ), parseFloat( v.lat ) ],

        /*
				label: {
					text: v.title,
					//outline: 0.1,
					outlineColor: "rgba(255, 255, 255, 0.4)",
					size: app.label_size,
					color: "black",
				  offsett: app.label_offset,
				},
        */

        billboard,

				properties: {

					title: v.title,
					qid: v.qid,

				}

			}));

		}


  });

}

document.toggleFullscreen = function() {

  if (screenfull.enabled) {

    screenfull.toggle();

  }

  return 0;

};

// keyboard control
$(document).keydown(function(event) {
  
  let key = (event.keyCode ? event.keyCode : event.which);
  
  //console.log( event, key );
  
  if ( key == '70' ){ // "f"
  
    document.toggleFullscreen();
  
  }

});

$().ready(function() {
  
  init();

});
