import {
  Globe,
  GlobusTerrain,
  XYZ,
  LonLat,
  Popup,
  utils,
  Entity,
  control,
  Vector,
  math
} from "../node_modules/@openglobus/og/lib/@openglobus/og.esm.js";

let parentref = parent;

if ( detectMobile() ){

  parentref = parent;

}
else { // desktop

  if ( window.parent.name === 'infoframeSplit2' || window.parent.name === 'infoframe_' ){ // request from secondary content iframe
    parentref = parent;
  }
  else { // primary content frame
    parentref = parent.top;
  }

}

/*
document.getElementById("btnOSM").onclick = function () {
  osm.setVisibility(true);
};

document.getElementById("btnMQS").onclick = function () {
  sat.setVisibility(true);
};
*/


window.app = {

  language: getParameterByName( 'l' ) || 'en',
  radius:   valid( getParameterByName( 'radius' ) )? getParameterByName( 'radius' ) : $('#radius').val(),
  lat:      getParameterByName( 'lat' ) || '',
  lon:      getParameterByName( 'lon' ) || '',

}

//console.log( 'geosearch app: ', window.app );

$('#radius').val( window.app.radius );

$('#radius').on('change', function() {

  window.app.radius = $('#radius').val();

});

let osm = new XYZ("OpenStreetMap", {
    isBaseLayer: true,
    url: "//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    visibility: true,
    attribution: 'Data @ OpenStreetMap contributors, ODbL',
    iconSrc: "https://tile.openstreetmap.org/8/138/95.png",
});

let pointLayer = new Vector( 'points', {
  'relativeToGround': true,
  'visibility': true
});

function toQuadKey(x, y, z) {

  let index = '';

  for ( let i = z; i > 0; i--) {

    let b = 0;
    let mask = 1 << (i - 1);
    if ((x & mask) !== 0) b++;
    if ((y & mask) !== 0) b += 2;
    index += b.toString();

  }

  return index;

}

let sat = new XYZ("sat", {
    iconSrc: "https://ecn.t0.tiles.virtualearth.net/tiles/a120.jpeg?n=z&g=7146",
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
    nightTextureCoefficient: 2.7
});

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

let globe = new Globe({

  target:       "globus",
  name:         "Earth",
  terrain:      new GlobusTerrain(),
  layers:       [osm, sat, pointLayer ],
  resourcesSrc: "./node_modules/@openglobus/og/lib/@openglobus/res",
  fontsSrc:     "./node_modules/@openglobus/og/lib/@openglobus/res/fonts"

});

globe.planet.addControl(new control.LayerSwitcher());

let myPopup = new Popup({

  planet: globe.planet,
  offset: [0, 0],
  visibility: false

});

globe.planet.renderer.events.on( 'doubletouch', (e) => {

  let loc = globe.planet.getLonLatFromPixelTerrain(e);

  showRadiusMarker( loc );
  showTopics( loc );

});

globe.planet.renderer.events.on( 'lclick', (e) => {

  let loc = globe.planet.getLonLatFromPixelTerrain(e);

  if ( valid( loc ) ){

    showRadiusMarker( loc );
    showTopics( loc );

  }

});

function showRadiusMarker( loc ){

  let lon = parseFloat( loc.lon.toFixed(5) );
  let lat = parseFloat( loc.lat.toFixed(5) );

  function createCircle( ellipsoid, center, radius = parseFloat( window.app.radius ) ){

    let circleCoords = [];

    for (let i = 0; i < 360; i += 5) {

      circleCoords.push( ellipsoid.getGreatCircleDestination( center, i, radius ) );

    }

    return circleCoords;

  };

  function createCircles( outPathLonLat, outPathColors, num = 1 ) {

    let ell = globe.planet.ellipsoid;

    for ( let i = 0; i < num; i++ ) {

      let center = new LonLat( lon, lat );

      let circle = createCircle(ell, center, parseFloat( window.app.radius ) );

      outPathLonLat.push(circle);

      let color = [ 1, 0.1, 0.1 ];
      //let color = [ math.random(), math.random(), math.random() ];

      outPathColors.push([color]);

    }

  }

  let pathLonLat = [];
  let pathColors = [];

  createCircles(pathLonLat, pathColors);

  const polylineEntity = new Entity({

    'polyline': {
      'pathLonLat': pathLonLat,
      'pathColors': pathColors,
      'altitude': 10,
      'thickness': 5,
      'isClosed': true,
    }

  });

  //console.log( polylineEntity );

  pointLayer.addEntities( [ polylineEntity ] );

}

function showTopics( loc ){

  globe.planet.terrain.getHeightAsync(loc, (h) => {

    if ( valid( loc.lon ) ){

      myPopup.setContent(`lon = ${loc.lon.toFixed(5)}<br/>lat = ${loc.lat.toFixed(5)}<br/>height(msl) = ${Math.round(h)} m`);

      // TODO: get the success/fail result of the query (failure modes: 0 results found, query timed out, ...)
      // lat;lon;radius
      let geo = loc.lat.toFixed(5) + ';' + loc.lon.toFixed(5) + ';' + window.app.radius;

      parentref.postMessage({ event_id: 'set-geosearch', data: { geofilter: geo } }, '*' );

    }

  });

  let groundPos = globe.planet.getCartesianFromMouseTerrain();
  myPopup.setCartesian3v(groundPos);

  myPopup.setVisibility(true);

}

if ( valid( [ window.app.lat, window.app.lat, window.app.radius ] ) ){

  //console.log('fly to custom point: ', window.app.lat, window.app.lat, window.app.radius );

  const distance = window.app.radius * 10;

  // FIXME ? hmm. LonLat() takes LonLat(lat, lon) ... where is the mistake located?
  let point = new LonLat( parseFloat( window.app.lon ), parseFloat( window.app.lat ), parseFloat( window.app.radius ) );

  let ell = globe.planet.ellipsoid;

  globe.planet.camera.flyDistance( ell.lonLatToCartesian( point ), distance );

}
