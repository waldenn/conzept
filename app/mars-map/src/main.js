'use strict';

import {
    Globe,
    XYZ,
    control,
    RgbTerrain,
    LonLat,
    quadTreeStrategyType
} from "../node_modules/@openglobus/og/lib/@openglobus/og.esm.js";

const osm = new XYZ("Mars-Viking", {
    isBaseLayer: true,
    //'url': "https://astro.arcgis.com/arcgis/rest/services/OnMars/MDIM/MapServer/tile/{z}/{y}/{x}?blankTile=false",
    url: "https://terrain.openglobus.org/public/mars/sat/{z}/{x}/{y}.png",
    'visibility': true,
    maxNativeZoom: 8,
});

var highResTerrain = new RgbTerrain("Mars", {
    geoid: null,
    maxZoom: 6,
    url: "https://{s}.terrain.openglobus.org/public/mars/elv/{z}/{x}/{y}.png",
    heightFactor: 5
});

let globe = new Globe({
    name: "mars",
    quadTreeStrategyPrototype: quadTreeStrategyType.mars,
    target: "globus",
    terrain: highResTerrain,
    layers: [osm],
    nightTextureSrc: null,
    specularTextureSrc: null
});

//globe.planet.addControls([new control.DebugInfo()]);

globe.planet.renderer.controls.SimpleSkyBackground.colorOne = "rgb(183, 133, 135)";
globe.planet.renderer.controls.SimpleSkyBackground.colorTwo = "rgb(41, 41, 41)";

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

window.app = {

  language: getParameterByName( 'l' ) || 'en',
  lat:      getParameterByName( 'lat' ) || '',
  lon:      getParameterByName( 'lon' ) || '',
  dist:     getParameterByName( 'dist' ) || 2000,

}

//console.log( 'geosearch app: ', window.app );
function FlyToPoint( lon, lat, dist ) {

  //console.log( lon, lat, dist );

  let viewPoi = new LonLat( lon, lat, dist );
  let ell     = globe.planet.ellipsoid;

  globe.planet.camera.flyDistance( ell.lonLatToCartesian(viewPoi) , dist );

};

if ( valid( [ window.app.lon, window.app.lat ] ) ){

  FlyToPoint( window.app.lon, window.app.lat, window.app.dist );

}
