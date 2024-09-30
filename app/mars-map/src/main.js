import {
  Globe,
  XYZ,
  control,
  RgbTerrain,
  LonLat,
  quadTreeStrategyType,
  mars,
} from "../node_modules/@openglobus/og/lib/@openglobus/og.esm.js";

const sat = new XYZ("Mars-Viking", {
  isBaseLayer: true,
  //'url': "https://astro.arcgis.com/arcgis/rest/services/OnMars/MDIM/MapServer/tile/{z}/{y}/{x}?blankTile=false",
  url: "https://terrain.openglobus.org/mars/sat/{z}/{x}/{y}.png",
  maxNativeZoom: 8,
});

const highResTerrain = new RgbTerrain("Mars", {
  geoidSrc: null,
  maxZoom: 8,
  maxNativeZoom: 8,
  url: "https://{s}.terrain.openglobus.org/mars/dem/{z}/{x}/{y}.png",
  heightFactor: 2
});

let globe = new Globe({
    ellipsoid: mars,
    name: "Mars",
    quadTreeStrategyPrototype: quadTreeStrategyType.equi,
    target: "globus",
    terrain: highResTerrain,
    layers: [sat],
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
