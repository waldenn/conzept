'use strict';

import {
  Globe,
  GlobusRgbTerrain,
  //GlobusTerrain,
  XYZ,
  LonLat,
  Popup,
  utils,
  control,
  //Entity,
  //Vector,
  //math,

} from "../node_modules/@openglobus/og/lib/@openglobus/og.esm.js";

/*
  Conzept map application based on OpenGlobus

  see:
    https://openglobus.org
    https://openglobus.org/api/

*/

/*
let sat = new XYZ("sat", {

  subdomains:     ['t0', 't1', 't2', 't3'],
  url:            "https://ecn.{s}.tiles.virtualearth.net/tiles/a{quad}.jpeg?n=z&g=7146",
  isBaseLayer:    true,
  maxNativeZoom:  19,
  defaultTextures:[{color: "#001522"}, {color: "#E4E6F3"}],
  attribution:    `<div style="transform: scale(0.8); margin-top:-2px;"><a href="http://www.bing.com" target="_blank"><img style="position: relative; top: 2px;" title="Bing Imagery" src="https://sandbox.openglobus.org/bing_maps_credit.png"></a> © 2021 Microsoft Corporation</div>`,

  urlRewrite: function (s, u) {

    return utils.stringTemplate(u, {

      's':    this._getSubdomain(),
      'quad': toQuadKey(s.tileX, s.tileY, s.tileZoom)

    });
  },

  specular: [0.00063, 0.00055, 0.00032],
  ambient: "rgb(90,90,90)",
  diffuse: "rgb(350,350,350)",
  shininess: 20,
  nightTextureCoefficient: 2.7

});
*/

/*
document.getElementById("btnOSM").onclick = function () {
  osm.setVisibility(true);
};

document.getElementById("btnMQS").onclick = function () {
  sat.setVisibility(true);
};
*/


let app = {
	globus:	      undefined,

	query:		    getParameterByName( 'query' ) || '',

	lat:			    getParameterByName( 'lat' ) || '',
	lon:			    getParameterByName( 'lon' ) || '',
	qid:			    getParameterByName( 'qid' ) || '',  // may also be a list!
	title:		    getParameterByName( 'title' ) || '',
	bbox:			    getParameterByName( 'bbox' ) || undefined,
	gbif:			    getParameterByName( 'gbif' ) || '', // GBIF taxon ID

	language:     '',
	osm_id:       [],

	objects:      {},

	view_extent:  '',

  // see: https://sandbox.openglobus.org/examples/fonts
  label_size:   13,
  //label_offset: [10,30],
  outline:      0.77,
  outline_color:'rgba(255,255,255,.1)',

  colors: [ 'red', 'black', 'orange', 'cyan', 'pink' ],

}

window.app = app;

$('#title').html( app.title );

const osm = new XYZ("OSM", {
  isBaseLayer: true,
  url: "//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  visibility: ( app.language === 'de' || app.language === 'fr' ) ? false : true,
  attribution: 'Data @ OpenStreetMap contributors, ODbL',
  iconSrc: "https://tile.openstreetmap.org/8/138/95.png",
});

// setup wikibase library
/*
window.wbk = WBK({
	instance: 'https://www.wikidata.org',
	sparqlEndpoint: 'https://query.wikidata.org/sparql'
})
*/

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
  /* FIXME
  else if ( valid( [ app.lon, app.lat ] ) ){

    app.bbox = getBoundingBox( app.lon, app.lat, 0.05 ).split(',');

    app.view_extent = [ app.bbox[0], app.bbox[1], app.bbox[2], app.bbox[3] ];

  }
  */

  // good: https://conze.pt/app/map/?l=en&bbox=-70.243611111111,9.1561111111111,-70.143611111111,9.256111111111101&lat=9.2061111111111&lon=-70.193611111111&title=Guaramacal%2520National%2520Park
  // good: https://conze.pt/app/map/?l=en&bbox=4.9894,52.0908,5.0893999999999995,52.190799999999996&lat=52.1408&lon=5.0394&title=Maarssen
  // bad: https://conze.pt/app/map/?l=en&lat=7.1845&lon=125.4161&title=Pithecophaga%20jefferyi
  // bad: https://conze.pt/app/map/?l=en&bbox=4.9894,52.0908,5.0893999999999995,52.190799999999996&lat=7.1845&lon=125.4161&title=Pithecophaga%20jefferyi

  if ( valid( app.qid && app.qid.includes(',') ) ){

    app.qid = app.qid.split(',') || [];

    //console.log( 'qid: ', app.qid );

    app.qid.forEach( function( qid ) {

      app.objects[qid] = {
        title   : '',
        osm_id  : '',
        bbox    : '',
      };

    });

  }
  else if ( valid( app.qid ) ){

    if ( app.qid.startsWith('Q') ){ // clean Qid

      app.qid = app.qid.substring(1);

    }

    let q = app.qid;
    app.qid = [ q ];
    //console.log( app.qid );

    app.objects[ q ] = {
      title   : '',
      osm_id  : '',
      bbox    : '',
    };

  }

  app.language  = getParameterByName( 'l' ) || 'en';
	app.osm_id[0]	= getParameterByName( 'osm_id' ) || ''; // OSM object ID

  //console.log( app );

  /*
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
  */

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
    //? iconSrc: "/assets/icons/mark.svg",
    //clampToGround: true,
  })

  if ( valid( app.lon ) ){

    app.markerLayer.add(new og.Entity({

			lonlat: [ app.lon, app.lat ],

			label: {
				text: app.title,
        //outline: app.outline,
        //outlineColor: app.outline_color,
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

		//console.log( 'picked: ', label, qid );

    const url = 'https://' + CONZEPT_HOSTNAME + CONZEPT_WEB_BASE + '/explore/' + encodeURIComponent( label ) + '?l=' + app.language + '&amp;t=string&amp;i=' + qid + '&amp;s=false&amp;embedded=true';

    //console.log( url );

		myPopup.setContent('<iframe class="inline-iframe resized" style="min-width: 400px; max-width: 60vw; min-height: 400px; max-height: 60vh; border:none;" src="' + url + '" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen="" allow-downloads="" title="embedded widget: URL-content" role="application" width="100%" height="100%"></iframe>');

		let groundPos = app.globus.planet.getCartesianFromMouseTerrain();
		myPopup.setCartesian3v(groundPos);
		myPopup.setVisibility(true);

	});

	osm.events.on("lclick", function (e) {

		$('div.og-popup').remove(); // remove all popups

	});

  const opentopo = new XYZ("OpenTopo", {
    isBaseLayer: true,
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    visibility: false,
    attribution: 'Data @ OpenStreetMap contributors, ODbL',
    iconSrc: "https://c.tile.opentopomap.org/4/9/5.png",
  });

  const osm_french = new XYZ("OSM-FR", {
    isBaseLayer: true,
    url: "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
    visibility: app.language === 'fr' ? true : false,
    attribution: 'Data @ OpenStreetMap France contributors, ODbL',
    iconSrc: "https://a.tile.openstreetmap.fr/osmfr/4/9/5.png",
  });

  const osm_german = new XYZ("OSM-DE", {
    isBaseLayer: true,
    url: "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
    visibility: app.language === 'de' ? true : false,
    attribution: 'Data @ OpenStreetMap France contributors, ODbL',
    iconSrc: "https://tile.openstreetmap.de/4/9/5.png",
  });

  const osm_cycle = new XYZ("OSM-Bicycle", {
    isBaseLayer: true,
    url: "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
    visibility: false,
    attribution: 'Data @ OpenStreetMap France contributors, ODbL',
    iconSrc: "/assets/icons/bicycle.svg",
  });

  const opensea = new XYZ("Nautic", {
    isBaseLayer: false,
    url: "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png",
    visibility: false,
    attribution: 'Data @ OpenStreetMap contributors, ODbL',
    iconSrc: "/assets/icons/ship.svg",
  });

  const openrailway = new XYZ("Railway", {
    isBaseLayer: false,
    url: "https://a.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
    visibility: false,
    attribution: 'Data @ OpenStreetMap contributors, ODbL',
    iconSrc: "/assets/icons/train.svg",
  });

  const hiking = new XYZ("Hiking", {
    isBaseLayer: false,
    url: "https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png",
    visibility: false,
    attribution: 'Data @ OpenStreetMap contributors, ODbL',
    iconSrc: "/assets/icons/hiking.svg",
  });

  let gbif = '';

  if ( valid( app.gbif ) ){

    gbif = new XYZ("GBIF", {
      isBaseLayer: false,
      // see: https://api.gbif.org/v2/map/debug/ol/#
      url: `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?bin=hex&hexPerTile=113&srs=EPSG:3857&style=classic.poly&taxonKey=${app.gbif}`,
      //url: `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@2x.png?bin=square&squareSize=8&srs=EPSG:3857&style=scaled.circles&taxonKey=${app.gbif}`,
      visibility: true,
      attribution: 'Data @ GBIF',
      iconSrc: "/assets/icons/gbif.png",
    });

  }

  const sat_bing = new XYZ("Sat-Bing", {
    subdomains: ['t0', 't1', 't2', 't3'],
    url: "https://ecn.{s}.tiles.virtualearth.net/tiles/a{quad}.jpeg?n=z&g=7146",
    isBaseLayer: true,
    maxNativeZoom: 19,
    defaultTextures: [{ color: "#001522" }, { color: "#E4E6F3" }],
    attribution: `<div style="transform: scale(0.8); margin-top:-2px;"><a href="http://www.bing.com" target="_blank"><img style="position: relative; top: 2px;" title="Bing Imagery" src="https://sandbox.openglobus.org/bing_maps_credit.png"></a> © 2021 Microsoft Corporation</div>`,
    urlRewrite: function (s, u) {
      return utils.stringTemplate(u, {
        's': this._getSubdomain(),
        'quad': toQuadKey(s.tileX, s.tileY, s.tileZoom)
      });
    },
    specular: [0.00063, 0.00055, 0.00032],
    ambient: "rgb(90,90,90)",
    diffuse: "rgb(350,350,350)",
    shininess: 20,
    nightTextureCoefficient: 4.7,
    iconSrc: "https://ecn.t0.tiles.virtualearth.net/tiles/a120.jpeg?n=z&g=7146",
  });

  const sat_esri = new XYZ("Sat-Esri", {
    isBaseLayer: true,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    visibility: false,
    attribution: 'Data @ Esri',
    iconSrc: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/4/9/5",
  });

  let layers = [ osm, osm_french, osm_german, sat_bing, sat_esri, opentopo, osm_cycle, opensea, openrailway, hiking ];

  if ( valid( app.gbif) ){

    layers.push( gbif );

  }

  layers.push( app.markerLayer );

  app.globus = new Globe({

    target:         "globus",
    name:           "Earth",
    terrain:        new GlobusRgbTerrain(),
    resourcesSrc:   "./node_modules/@openglobus/og/lib/@openglobus/res",
    fontsSrc:       "./node_modules/@openglobus/og/lib/@openglobus/res/fonts",
    autoActivated:  true,
    viewExtent:     app.view_extent,
    layers:         layers,
  });

  app.globus.planet.addControl(new control.LayerSwitcher());

	let myPopup = new og.Popup({

		planet:     app.globus.planet,
		offset:     [0, -400],
		visibility: false,

	});

  app.globus.planet.lightEnabled  = false; // OpenGlobus bug?: setting this to "false" causes OSM-map not to render!
  app.globus.renderer.gamma       = 0.20;
  app.globus.renderer.exposure    = 3.50;

  if ( valid( app.query ) ){ // SPARQL-query

    if ( app.query.startsWith('[') ){ // list of query objects

      //console.log( app.query );

      app.query = JSON.parse( app.query );

      $.each( app.query, function ( i, q ) {

        handleQuery( decodeURIComponent( q.url ), app.colors[ i % app.colors.length ] );

      });

    }
    else { // single query URL

      handleQuery( app.query, 'red' );

      //handleQuery( app.query, app.colors[ getRandomInt( app.colors.length ) ] );

    }

  }
  else if ( app.osm_id.length === 1 && app.qid.length === 0 ){ // a single, custom OSM-ID was passed as a LIST

    if ( valid( app.osm_id[0] ) ){

      app.objects[ app.qid[0] ] = {
        title   : app.title,
        osm_id  : app.osm_id[0],
        bbox    : '',
      };

      addOSM();

    }

  }
  else if ( valid( app.osm_id ) ){ // a single, custom OSM-ID was passed as a STRING

    app.objects[ app.qid ] = {
      title   : app.title,
      osm_id  : app.osm_id,
      bbox    : '',
    };

    addOSM();

  }
  else { // render multiple Qids

    getQids();

  }

}

async function addOSM(){

  app.globus.planet.lightEnabled = false;

	let promises = [];

  Object.entries( app.objects ).forEach(( [ qid, item ] ) => {

    //console.log( qid, item );

    if ( valid( item.osm_id ) ){

      // fetch OSM boundary GeoJSON
      // https://nominatim.org/release-docs/latest/api/Lookup/
      let url = `https://nominatim.openstreetmap.org/lookup?osm_ids=R${item.osm_id}&format=json&extratags=1&polygon_geojson=1`;

      // TODO: render roadway geo-line:
      //console.log( `https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=${item.osm_id}&class=highway&addressdetails=1&hierarchy=0&group_hierarchy=1&polygon_geojson=1&format=json` );
      // https://conze.pt/app/overpass/map.html?Q=%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%0A(%0A%20%20relation(190840)%3B%0A)%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B%0A
      /*
        [out:json][timeout:25];
        (
          relation(190840);
        );
        out body;
        >;
        out skel qt;
      */

      //console.log( url );

      // TODO: parse this relation info into geojson:
      //  - working but not geojson: https://www.openstreetmap.org/api/0.6/relation/3734593.json
      //  - no data: https://nominatim.openstreetmap.org/reverse?osm_id=3734593&osm_type=R&polygon_geojson=1&format=json&polygon_threshold=0.001
      //
      //  - working but not geojson: https://www.openstreetmap.org/api/0.6/relation/271110.json
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

		  promises.push(

        $.ajax({

          url: url,
          dataType: "json",

          success: function( data ) {

            data = data[0];

            //console.log( data );

            if ( data.osm_type ){

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
                      text: item.title,
                      //text: app.title,
                      //outline: app.outline,
                      //outlineColor: app.outline_color,
                      color: "black",
                      size: app.label_size,
                      offsett: app.label_offset,
                    },

                    billboard,

                    properties: {

                      //title: app.title,
                      title: item.title,
                      qid: qid,

                    }

                }));

              }

              item.bbox = data.boundingbox;

            }

          },

        }),

      );

    }
    else if ( valid( item.lat ) ){ // valid lat-lon geo-location

      app.markerLayer.add(new og.Entity({

        lonlat: [ parseFloat( item.lon ), parseFloat( item.lat ) ],

        label: {
          text: item.title,
          //text: app.title,
          //outline: app.outline,
          //outlineColor: app.outline_color,
          color: "black",
          size: app.label_size,
          offsett: app.label_offset,
        },

        billboard,

        properties: {

          //title: app.title,
          title: item.title,
          qid: qid,

        }

      }));

    }

  });

  $.when.apply($, promises).then(function() {

    //console.log('all addOSM() promises are done' );

    if ( Object.keys( app.objects ).length === 1 ){

      const bb = app.objects[ Object.keys( app.objects )[0] ].bbox;

      //console.log( app.objects[ Object.keys( app.objects )[0] ].bbox[2] );
      //console.log( 'single qid', app.objects[0].bbox[2] );

      // see: http://openglobus.org/examples/cameraFly/cameraFly.html
      app.globus.planet.flyExtent(new og.Extent(

        new og.LonLat( bb[2], bb[0] ),
        new og.LonLat( bb[3], bb[1] )

        //new og.LonLat( data.boundingbox[2], data.boundingbox[0] ),
        //new og.LonLat( data.boundingbox[3], data.boundingbox[1] )

      ));

    }
    else { // multiple qids

      const bb_list = [];

      // add each qid boundingbox to the list
      app.qid.forEach(function( qid ) {

        if ( app.objects[qid]?.bbox[0] ){

          bb_list.push( new og.LonLat( app.objects[qid].bbox[2], app.objects[qid].bbox[0]  ) );
          bb_list.push( new og.LonLat( app.objects[qid].bbox[3], app.objects[qid].bbox[1]  ) );

        }

      });

      //console.log( bb_list );

      // FIXME: get a list of lon and lat points from the bb_list:
      // see: http://openglobus.org/api/module-og_Extent.Extent.html#.createFromArray
      app.globus.planet.flyExtent( 
        og.Extent.createByCoordinates( bb_list )
      );

    }

  });

}

async function getQids(){

  //console.log( 'render multiple Qids from the JSON-data' );

	let promises = [];

	$.each( app.qid, function(k, q) {

		promises.push(

			$.ajax({

				url: 'https://www.wikidata.org/wiki/Special:EntityData/' + q + '.json',
				jsonp: "callback",
				dataType: "json",

				success: function( response ) {

					//console.log( 'fetching JSON for: ', q );

          if ( response.entities[ q ]?.claims ){

            if ( response.entities[ q ]?.claims?.P402 ){
              app.objects[ q ].osm_id = response.entities[ q ].claims.P402[0].mainsnak.datavalue.value;
            }

            if ( response.entities[ q ]?.claims?.P625 ){
              //console.log( response.entities[ q ].claims?.P625[0] );
              app.objects[ q ].lat      = response.entities[ q ].claims.P625[0].mainsnak.datavalue.value.latitude;
              app.objects[ q ].lon      = response.entities[ q ].claims.P625[0].mainsnak.datavalue.value.longitude;
              app.objects[ q ].altitude = response.entities[ q ].claims.P625[0].mainsnak.datavalue.value.altitude;
            }

            if ( response.entities[ q ]?.labels[ app.language ]?.value ){
              app.objects[ q ].title = response.entities[ q ].labels[ app.language ].value;
            }

          }
          else {

            console.log( 'no OSM ID found');

          }

				},  

				error: function( err ) {

          console.log( 'error fetching value: ', q );

        },

			}),

		);

	});

	$.when.apply($, promises).then(function() {

		console.log('all promises are done: ', app.objects );

    addOSM();

	});

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

      let markers     = [];
      let coordinates = [];

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

        //coordinates.push( [ v.lat?.value, v.lon?.value ] );
				//coordinates.push( [ parseFloat( v.lat?.value ), parseFloat( v.lon?.value ), 0 ] );

        coordinates.push( [ new og.LonLat( parseFloat( v.lat?.value ), parseFloat( v.lon?.value ) ) ] );

      });

      // get extent of coordinates and fly to it
      const extent = new og.Extent();
      extent.setByCoordinates( coordinates );

      //console.log( coordinates );
      //console.log( extent );

      //app.globus.planet.flyExtent( extent );

      //console.log( markers );

      app.globus.planet.lightEnabled = false;

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

        //visibility: true,

				lonlat: [ parseFloat( v.lon ), parseFloat( v.lat ) ],

        /*
				label: {
					text: v.title,
          outline: app.outline,
          outlineColor: app.outline_color,
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

function toQuadKey(x, y, z) {

    var index = '';

    for (let i = z; i > 0; i--) {
        var b = 0;
        var mask = 1 << (i - 1);
        if ((x & mask) !== 0) b++;
        if ((y & mask) !== 0) b += 2;
        index += b.toString();
    }

    return index;
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
