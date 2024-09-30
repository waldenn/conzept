'use strict';

import {
    Globe,
    XYZ,
    control,
    RgbTerrain,
    LonLat,
    quadTreeStrategyType,
    moon,
    Entity,
    Vector
} from "../node_modules/@openglobus/og/lib/@openglobus/og.esm.js";

const mountains = new Vector("Mountains", {
  fading: true,
  minZoom: 10,
  scaleByDistance: [0, 3500000, 3800000],
});

const craters = new Vector("Craters", {
  fading: true,
  minZoom: 4,
  scaleByDistance: [0, 15000000, 25000000],
});

const lacus = new Vector("Lakes", {
  fading: true,
  minZoom: 6,
});

const maria = new Vector("Seas And Oceans", {
  fading: true,
  minZoom: 5,
  scaleByDistance: [0, 15000000, 25000000],
});

const vallis = new Vector("Valleys", {
  fading: true,
  minZoom: 5,
  scaleByDistance: [0, 15000000, 25000000],
});

const sat = new XYZ("moon", {
  isBaseLayer: true,
  url: "https://{s}.terrain.openglobus.org/moon/sat/{z}/{x}/{y}.png",
  visibility: false,
  maxNativeZoom: 10,
  attribution: "Lunar Reconnaissance Orbiter - Global Morphology Mosaic 100m",
  diffuse: [1.1, 1.1, 1.3],
  ambient: [0.01, 0.01, 0.02],
});

const sat2 = new XYZ("Lunar QuickMap", {
  isBaseLayer: true,
  url: "https://lroc-tiles.quickmap.io/tiles/wac_nac_nacroi/lunar-fulleqc/{z}/{x}/{y}.jpg",
  visibility: true,
  attribution: `<a href="https://lunar.quickmap.io">Lunar QuickMap</a>, a collaboration between NASA, Arizona State University & Applied Coherent Technology Corp.`,
  //maxNativeZoom: 10,
  diffuse: [1.1, 1.1, 1.3],
  ambient: [0.01, 0.01, 0.02],
  urlRewrite: (s) => `https://lroc-tiles.quickmap.io/tiles/wac_nac_nacroi/lunar-fulleqc/${s.tileZoom + 1}/${s.tileX}/${s.tileY}.jpg`
});

const appoloSat = new XYZ("APPOLO_SAT", {
  isBaseLayer: false,
  url: "https://{s}.terrain.openglobus.org/moon/sat_appolo/{z}/{x}/{y}.png",
  visibility: true,
  maxNativeZoom: 12,
  extent: [[30.4294, 19.9771], [30.9162, 20.3639]]
});

var highResTerrain = new RgbTerrain(null, {
  geoidSrc: null,
  maxZoom: 7,
  //maxNativeZoom: 7,
  url: "https://{s}.terrain.openglobus.org/moon/dem/{z}/{x}/{y}.png",
  heightFactor: 0.5,
  minHeight: -20000,
  resolution: 0.1021,
  gridSizeByZoom: [
      64, 32, 16, 16, 32, 64, 64, 32, 16, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2
  ]
});

let globe = new Globe({
  ellipsoid: moon,
  name: "mars",
  quadTreeStrategyPrototype: quadTreeStrategyType.equi,
  target: "globus",
  maxAltitude: 5841727,
  terrain: highResTerrain,
  layers: [sat, sat2, appoloSat, mountains, craters, maria, vallis, lacus],
  nightTextureSrc: null,
  specularTextureSrc: null,
  atmosphereEnabled: false,
  gamma: 1.25,
  exposure: 2.195,
  fontsSrc: "./fonts",
  sun: {
      stopped: false,
  }
});

//globe.planet.addControls([new control.DebugInfo()]);

globe.planet.addControl(new control.LayerSwitcher());
globe.planet.addControl(new control.RulerSwitcher({ ignoreTerrain: false }));
//globe.planet.addControl(new control.TimelineControl());
//globe.planet.addControl(new control.ElevationProfileControl());

globe.planet.renderer.controls.SimpleSkyBackground.colorOne = "rgb(0, 0, 0)";
globe.planet.renderer.controls.SimpleSkyBackground.colorTwo = "rgb(0, 0, 0)";

fetch("./data/mountains.json").then((r) => r.json()).then((data) => {

  let entities = data.features.map((f) => createLabelEntity(
    new LonLat(f.geometry.coordinates[0], f.geometry.coordinates[1]),
    f.properties["Feature Name"],
    0,
    0,
    30 + 3,
    "Ephesis-Regular",
    30,
    true,
    /*"rgb(144,245,455)"*/
    "rgb(355,355,355)")
  );

  mountains.setEntities(entities);

});

fetch("./data/craters.json").then((r) => r.json()).then((data) => {

  let entities = data.features.map((f) => createLabelEntity(
    new LonLat(f.geometry.coordinates[0], f.geometry.coordinates[1]),
    `${f.properties.name} ${f.properties.diameter} km`,
    0,
    0.12,
    0,
    "Karla-Medium",
    16,
    false,
    "rgba(255,165,48,1.0)")
  );

  craters.setEntities(entities);

});

fetch("./data/lacus.json").then((r) => r.json()).then((data) => {

  let entities = data.features.map((f) => createLabelEntity(
    new LonLat(f.geometry.coordinates[0], f.geometry.coordinates[1]),
    f.properties.name,
    0,
    0,
    26 + 3,
    "Karla-Light",
    26,
    false,
    "rgba(155,155,355,0.85)",
    15000)
  );

  lacus.setEntities(entities);

});

fetch("./data/mare.json").then((r) => r.json()).then((data) => {

  let entities = data.features.map((f) => createLabelEntity(
    new LonLat(f.geometry.coordinates[0], f.geometry.coordinates[1]),
    f.properties.description.toUpperCase(),
    0.2,
    0,
    35 + 3,
    "Karla-Light",
    35,
    false,
    "rgba(155,155,355,0.65)",
    15000)
  );

  maria.setEntities(entities);

});

fetch("./data/vallis.json").then((r) => r.json()).then((data) => {

  let entities = data.features.map((f) => createLabelEntity(
    new LonLat(f.geometry.coordinates[0], f.geometry.coordinates[1]),
    f.properties.name,
    0,
    0,
    21 + 3,
    "Karla-Italic",
    21,
    false,
    "rgba(255,196,137,1.0)",
    12000)
  );

  vallis.setEntities(entities);
});

function createLabelEntity(
    lonlat,
    text,
    letterSpacing = 0,
    outline = 0,
    offsetY = 0,
    fontFace = "Ephesis-Regular",
    fontSize = 21,
    showSpin = true,
    color = "white",
    forceHeight
  )
{
  const ell = globe.planet.ellipsoid;

  let ll = new LonLat(lonlat.lon, lonlat.lat, forceHeight != undefined ? forceHeight : 15000);

  let res = new Entity({

    lonlat: ll,
    label: {
      size: fontSize,
      face: fontFace,
      letterSpacing: letterSpacing,
      outline: outline,
      outlineColor: "rgba(0,0,0,0.89)",
      text: text,
      align: "center",
      offset: [0, offsetY],
      color: color
    }
  });

  if (!forceHeight) {
    highResTerrain.getHeightAsync(ll, (h) => {

      ll.height = h + 10000;

      if (showSpin) {

        let ray = new Entity({

          ray: {
            startPosition: ell.lonLatToCartesian(new LonLat(ll.lon, ll.lat, h)),
            endPosition: ell.lonLatToCartesian(ll),
            //startColor: "rgba(144,245,455,0.7)",
            //endColor: "rgba(144,245,455,0.0)",
            startColor: "rgba(255,255,255,0.7)",
            endColor: "rgba(255,255,255,0.0)",
            thickness: 3
          }

        });

        res.appendChild(ray);

      }

      res.setLonLat(ll);
    });
  }

  return res;
}


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

function FlyToPoint( lon, lat, dist ) {

  //console.log( lon, lat, dist );

  let viewPoi = new LonLat( lon, lat, dist * 2);
  let ell = globe.planet.ellipsoid;
  globe.planet.camera.flyDistance(ell.lonLatToCartesian(viewPoi), dist);

};

if ( valid( [ window.app.lon, window.app.lat ] ) ){

  //console.log( 'moon app: ', window.app );

  FlyToPoint( window.app.lon, window.app.lat, window.app.dist );

}
