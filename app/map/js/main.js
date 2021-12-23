'use strict';

/*
  Conzept map application based on OpenGLobus

  see:
    https://openglobus.org
    https://openglobus.org/api/
*/

let app = {
	globus:	  undefined,

	lat:			0,
	lon:			0,
	qid:			'',
	title:		'',
	bbox:			[],

	language: '',
	osm_id:		'',
	view_extent: '',
}

$().ready(function() {
  
  init();

  setupKeys();

});

async function init(){

  app.lat 		= getParameterByName( 'lat' ) || '';
  app.lon 		= getParameterByName( 'lon' ) || '';
  app.qid			= getParameterByName( 'qid' ) || '';
  app.title		= getParameterByName( 'title' ) || '';
  app.bbox 		= getParameterByName( 'bbox' );

  if ( valid( app.bbox ) ){

    app.bbox = app.bbox.split(',') || [];

    app.view_extent = [ app.bbox[0], app.bbox[1], app.bbox[2], app.bbox[3] ];

  }

  app.language= getParameterByName( 'l' ) || 'en';
	app.osm_id	= getParameterByName( 'osm_id' ) || ''; // OSM object ID

  //console.log( app );

  const osm = new og.layer.XYZ("OpenStreetMap", { 
    isBaseLayer: true, 
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

  const markerLayer = new og.layer.Vector("Markers", {
    clampToGround: true,
  })

  if ( valid( app.lon ) ){

    markerLayer.add(new og.Entity({
        lonlat: [ app.lon, app.lat ],
        label: {
            text: app.title,
            //outline: 0.1,
            outlineColor: "rgba(255, 255, 255, 0.4)",
            size: 15,
            color: "black",
            offset: [10, 17 ]
        },
        billboard: {
            src: 'https://' + CONZEPT_HOSTNAME + CONZEPT_WEB_BASE + '/app/map/img/marker.png',
            width: 32,
            height: 32,
            offset: [0, 32]
        }
    }));

  }

	markerLayer.events.on("lclick", function (e) {

		console.log( 'picked: ', e.pickingObject, e.pickingObject.label._text );

		const label = e.pickingObject.label._text;

		myPopup.setContent('<iframe class="inline-iframe resized" style="min-width: 650px; min-height: 500px; border:none;" src=" https://' + CONZEPT_HOSTNAME + CONZEPT_WEB_BASE + '/app/wikipedia/?t=' + encodeURIComponent( label ) + '&amp;l=' + app.language + '&qid=' + app.qid + '&embedded=true" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen="" allow-downloads="" title="embedded widget: URL-content" role="application" width="100%" height="100%"></iframe>');

		let groundPos = app.globus.planet.getCartesianFromMouseTerrain();
		myPopup.setCartesian3v(groundPos);
		myPopup.setVisibility(true);

		// show popup with Bing images from this location

		/*
		setInfo({
			'name': e.pickingObject.label._text,
			'type': 'place',
			'cname': country,
			'lon': e.pickingObject._lonlat.lon,
			'lat': e.pickingObject._lonlat.lat,
			'extra': true,
			'wikipedia': lon,
		});
		*/

	});

	osm.events.on("lclick", function (e) {

		//console.log('remove popups');

		// remove all popups
		$('div.og-popup').remove();

	});

  /*
  globe.planet.renderer.events.on("lclick", (e) => {
      let lonLat = globe.planet.getLonLatFromPixelTerrain(e);

      globe.planet.terrain.getHeightAsync(lonLat, (h) => {
          myPopup.setContent(`lon = ${lonLat.lon.toFixed(5)}<br/>lat = ${lonLat.lat.toFixed(5)}<br/>height(msl) = ${Math.round(h)} m`);
      });

      let groundPos = globe.planet.getCartesianFromMouseTerrain();
      myPopup.setCartesian3v(groundPos);
      myPopup.setVisibility(true);
  });
  */


  /*
  let sat = new og.layer.XYZ("MapQuest Satellite", {
      shininess: 20,
      specular: [0.00048, 0.00037, 0.00035],
      diffuse: [0.88, 0.85, 0.8],
      ambient: [0.15, 0.1, 0.23],
      isBaseLayer: true,
      url: "//api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY29uemVwdCIsImEiOiJja2N6bHpwZmEwMmlhMnpvMThqaGFodHk1In0.9laZu8QUMwZM4mpzq1x9GA",
      visibility: false,
      attribution: '@2014 MapQuest - Portions @2014 "Map data @ <a target="_blank" href="//www.openstreetmap.org/">OpenStreetMap</a> and contributors, <a target="_blank" href="//opendatacommons.org/licenses/odbl/"> CC-BY-SA</a>"'
  });
  */

  app.globus = new og.Globe({

    target: "globus",

    name: "conzept map",

    terrain: new og.terrain.GlobusTerrain(),

    autoActivated: true,

    viewExtent: app.view_extent,

    layers: [ osm, markerLayer ]
    //layers: [ osmbuildings, osm, markerLayer ]

  });

	let myPopup = new og.Popup({
		planet: app.globus.planet,
		offset: [0, -400],
		visibility: false,
	});

  app.globus.renderer.gamma         = 0.10;
  app.globus.renderer.exposure      = 3.80;
  //app.globus.planet.lightEnabled  = false;

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

        if ( valid( data.boundingbox ) ){

          if ( !valid( app.lon ) ){

            markerLayer.add(new og.Entity({
                lonlat: [ data.lon, data.lat ],
                label: {
                    text: app.title,
                    //outline: 0.1,
                    outlineColor: "rgba(255, 255, 255, 0.4)",
                    size: 15,
                    color: "black",
                    offset: [10, 17 ]
                },
                billboard: {
                    src: 'https://' + CONZEPT_HOSTNAME + CONZEPT_WEB_BASE + '/app/map/img/marker.png',
                    width: 32,
                    height: 32,
                    offset: [0, 32]
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

async function setupKeys(){

  //keyboardJS.bind('a', (e) => {

    //console.log('a is pressed');

    //setLonLat( og.getLonLat(), new Vec3(), new Vec3() );

  //});

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
