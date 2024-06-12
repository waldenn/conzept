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

window.countries = {};

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

const osm = new XYZ("OpenStreetMap", {
  specular: [0.0003, 0.00012, 0.00001],
  shininess: 20,
  diffuse: [0.89, 0.9, 0.83],
  isBaseLayer: true,
  url: "//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  visibility: true,
  attribution: 'Data @ OpenStreetMap contributors, ODbL'
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



const globe = new Globe({
  target: "globus",
  name: "Earth",
  terrain: new GlobusTerrain(),
  layers: [osm, sat, pointLayer ],
  resourcesSrc: "../../external/og/lib/@openglobus/res",
  fontsSrc: "../../external/og/lib/@openglobus/res/fonts"
});

addCountryLayer();

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

  clickEvent( e );

})

function clickEvent( e ){

  let country       = '';
  let country_name  = '';

  // country
  if ( valid( e?.pickingObject?.geometry ) ){

    //console.log( e.pickingObject.geometry.__id );
    const id = e.pickingObject.geometry.__id;

    country       = window.countries[ id ].properties.postal;
    country_name  = window.countries[ id ].properties.name;

    //globe.planet.flyExtent( e.pickingObject.geometry.getExtent() );

  }

  // geolocation
  let loc = globe.planet.getLonLatFromPixelTerrain(e);

  if ( valid( loc ) ){

    showRadiusMarker( loc, country, country_name );
    showTopics( loc, country, country_name );

  }

}

function showRadiusMarker( loc, country, country_name ){

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

function showTopics( loc, country, country_name ){

  globe.planet.terrain.getHeightAsync(loc, (h) => {

    if ( valid( loc.lon ) ){

      myPopup.setContent(
      `<div>
        <div><span class="prop-name">country</span> <span class="prop-value">${country_name}</span></div>
        <div><span class="prop-name">lon:</span> <span class="prop-value">${loc.lon.toFixed(5)}</span></div>
        <div><span class="prop-name">lat:</span> <span class="prop-value">${loc.lat.toFixed(5)}</span></div>
        <div><span class="prop-name">radius:</span> <span class="prop-value">${ window.app.radius } m</span></div>
        <div><span class="prop-name">height (msl):</span> <span class="prop-value">${Math.round(h)} m</span></div>
      </div>`);

      let geo = loc.lat.toFixed(5) + ';' + loc.lon.toFixed(5) + ';' + window.app.radius + ';' + country;

      parentref.postMessage({ event_id: 'set-geosearch', data: { geofilter: geo } }, '*' );

    }

  });

  let groundPos = globe.planet.getCartesianFromMouseTerrain();
  myPopup.setCartesian3v(groundPos);

  myPopup.setVisibility(true);

}

function hideGeosearch(){

  parentref.postMessage({ event_id: 'hide-geosearch', data: { geofilter: geo } }, '*' );

}

function addCountryLayer() {

  fetch("/app/explore2/assets/geojson/countries.json")

    .then(r => {

      return r.json();

    }).then( data => {

    const countries = new Vector( 'Countries', {
      'visibility': true,
      'isBaseLayer': false,
      'diffuse': [0, 0, 0],
      'ambient': [1, 1, 1]
    });

    countries.addTo(globe.planet);

    const f = data.features;
    window.countries = data.features;

    for ( let i = 0; i < f.length; i++) {

      const fi = f[i];

      countries.add(new Entity({

        'geometry': {
          'type': fi.geometry.type,
          'coordinates': fi.geometry.coordinates,
          'style': {
            'fillColor': "rgba(255,255,255,0.01)"
          }
        }

      }));

    }

    countries.events.on("mouseleave", function (e) {

      //e.pickingObject.geometry.setFillColor(1, 1, 1, 0.6);
      e.pickingObject.geometry.setLineColor(0.2, 0.6, 0.8, 1.0);

    });

    countries.events.on("mouseenter", function (e) {

      e.pickingObject.geometry.bringToFront();
      //e.pickingObject.geometry.setFillColor(1, 0, 0, 0.4);
      e.pickingObject.geometry.setLineColor(1, 0, 0, 1.0);

    });

    //countries.events.on("lclick", function (e) {
    //  globe.planet.flyExtent(e.pickingObject.geometry.getExtent());
    //});

    countries.events.on("touchstart", function (e) {

      globe.planet.flyExtent(e.pickingObject.geometry.getExtent());

    });

  });

}
