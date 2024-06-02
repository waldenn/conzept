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

      // search for nearby Wikidata entities
      let url = `https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3Flocation%20%3Fdistance%20WHERE%20%7B%0A%20%20SERVICE%20wikibase%3Aaround%20%7B%0A%20%20%20%20%3Fitem%20wdt%3AP625%20%3Flocation.%0A%20%20%20%20bd%3AserviceParam%20wikibase%3Acenter%20%22Point(${ loc.lon.toFixed(5) }%2C${ loc.lat.toFixed(5) })%22%5E%5Egeo%3AwktLiteral%3B%0A%20%20%20%20%20%20wikibase%3Aradius%20%22${ window.app.radius }%22%3B%0A%20%20%20%20%20%20wikibase%3Adistance%20%3Fdistance.%0A%20%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${ window.app.language}%2Cen%2Cceb%2Csv%2Cde%2Cfr%2Cnl%2Cru%2Cit%2Ces%2Cpl%2Cwar%2Cvi%2Cja%2Czh%2Carz%2Car%2Cuk%2Cpt%2Cfa%2Cca%2Csr%2Cid%2Cno%2Cko%2Cfi%2Chu%2Ccs%2Csh%2Cro%2Cnan%2Ctr%2Ceu%2Cms%2Cce%2Ceo%2Che%2Chy%2Cbg%2Cda%2Cazb%2Csk%2Ckk%2Cmin%2Chr%2Cet%2Clt%2Cbe%2Cel%2Caz%2Csl%2Cgl%2Cur%2Cnn%2Cnb%2Chi%2Cka%2Cth%2Ctt%2Cuz%2Cla%2Ccy%2Cta%2Cvo%2Cmk%2Cast%2Clv%2Cyue%2Ctg%2Cbn%2Caf%2Cmg%2Coc%2Cbs%2Csq%2Cky%2Cnds%2Cnew%2Cbe-tarask%2Cml%2Cte%2Cbr%2Ctl%2Cvec%2Cpms%2Cmr%2Csu%2Cht%2Csw%2Clb%2Cjv%2Csco%2Cpnb%2Cba%2Cga%2Cszl%2Cis%2Cmy%2Cfy%2Ccv%2Clmo%2Cwuu%2Cbn%22.%20%7D%0A%7D%0AORDER%20BY%20(%3Fdistance%29%0A%20OFFSET%200%20LIMIT%2010`;

       // let url = `https://qlever.cs.uni-freiburg.de/api/wikidata?query=PREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0APREFIX+wd%3A+%3Chttp%3A%2F%2Fwww.wikidata.org%2Fentity%2F%3E%0APREFIX+wdt%3A+%3Chttp%3A%2F%2Fwww.wikidata.org%2Fprop%2Fdirect%2F%3E%0APREFIX+geof%3A+%3Chttp%3A%2F%2Fwww.opengis.net%2Fdef%2Ffunction%2Fgeosparql%2F%3E%0ASELECT+%3Fitem+%3FitemLabel+%3Fdistance+%3Flocation+WHERE+%7B%0A++%3Fitem+wdt%3AP625+%3Flocation+.%0A++%3Fitem+rdfs%3Alabel+%3FitemLabel+.%0A++FILTER+%28LANG%28%3FitemLabel%29+%3D+%22${ window.app.language}%22%29+.%0A++BIND+%28geof%3Adistance%28%3Flocation%2C+%22POINT%28${ loc.lon.toFixed(5) }+${ loc.lat.toFixed(5) }%29%22%29+AS+%3Fdistance%29%0A++FILTER+%28%3Fdist+%3C%3D+${ window.app.radius }%29%0A%7D%0AORDER+BY+ASC%28%3Fdist%29`;

        // FIX COUNT URL: https://qlever.cs.uni-freiburg.de/api/wikidata?query=PREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0APREFIX+wd%3A+%3Chttp%3A%2F%2Fwww.wikidata.org%2Fentity%2F%3E%0APREFIX+wdt%3A+%3Chttp%3A%2F%2Fwww.wikidata.org%2Fprop%2Fdirect%2F%3E%0APREFIX+geof%3A+%3Chttp%3A%2F%2Fwww.opengis.net%2Fdef%2Ffunction%2Fgeosparql%2F%3E%0ASELECT+%3Fitem+%3FitemLabel+%3Fdistance+%3Flocation+WHERE+%7B%0A++%3Fitem+wdt%3AP625+%3Flocation+.%0A++%3Fitem+rdfs%3Alabel+%3FitemLabel+.%0A++FILTER+%28LANG%28%3FitemLabel%29+%3D+%22en%22%29+.%0A++BIND+%28geof%3Adistance%28%3Flocation%2C+%22POINT%284.17416+19.20677%29%22%29+AS+%3Fdistance%29%0A++FILTER+%28%3Fdist+%3C%3D+1000%29%0A%7D%0AORDER+BY+ASC%28%3Fdist%29

      console.log( url );

      // render topics
      // TODO: get the success/fail result of the query (failure modes: 0 results found, query timed out, ...)
      // lat;lon;radius
      let custom = loc.lat.toFixed(5) + ';' + loc.lon.toFixed(5) + ';' + window.app.radius;

      //parentref.postMessage({ event_id: 'run-query', data: { url: url, custom: custom } }, '*' );

      // TODO: send back "lat;lon;radius" to explore-app 
      parentref.postMessage({ event_id: 'set-geosearch', data: { custom: custom } }, '*' );

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
