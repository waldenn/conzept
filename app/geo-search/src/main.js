import {
  Globe,
  GlobusTerrain,
  XYZ,
  Popup,
  utils
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

document.getElementById("btnOSM").onclick = function () {
  osm.setVisibility(true);
};

document.getElementById("btnMQS").onclick = function () {
  sat.setVisibility(true);
};


window.app = {

  language: getParameterByName( 'l' ) || 'en',
  radius:   $('#radius').val() || '10000', // meters

}

$('#radius').on('change', function() {

  window.app.radius = $('#radius').val();

});


let osm = new XYZ("OpenStreetMap", {

  isBaseLayer: true,
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  visibility: true,
  attribution: 'Data @ OpenStreetMap contributors, ODbL'

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

let globe = new Globe({

  target:       "globus",
  name:         "Earth",
  terrain:      new GlobusTerrain(),
  layers:       [osm, sat],
  resourcesSrc: "./node_modules/@openglobus/og/lib/@openglobus/res",
  fontsSrc:     "./node_modules/@openglobus/og/lib/@openglobus/res/fonts"
});

let myPopup = new Popup({

  planet: globe.planet,
  offset: [0, 0],
  visibility: false

});

globe.planet.renderer.events.on( 'doubletouch', (e) => {

  let loc = globe.planet.getLonLatFromPixelTerrain(e);

  showTopics( loc );

});

globe.planet.renderer.events.on( 'lclick', (e) => {

  let loc = globe.planet.getLonLatFromPixelTerrain(e);

  showTopics( loc );

});

function showTopics( loc ){

  globe.planet.terrain.getHeightAsync(loc, (h) => {

    if ( valid( loc.lon ) ){

      myPopup.setContent(`lon = ${loc.lon.toFixed(5)}<br/>lat = ${loc.lat.toFixed(5)}<br/>height(msl) = ${Math.round(h)} m`);

      // search for nearby Wikidata entities
      let url = `https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3Flocation%20%3Fdistance%20WHERE%20%7B%0A%20%20SERVICE%20wikibase%3Aaround%20%7B%0A%20%20%20%20%3Fitem%20wdt%3AP625%20%3Flocation.%0A%20%20%20%20bd%3AserviceParam%20wikibase%3Acenter%20%22Point(${ loc.lon.toFixed(5) }%2C${ loc.lat.toFixed(5) })%22%5E%5Egeo%3AwktLiteral%3B%0A%20%20%20%20%20%20wikibase%3Aradius%20%22${ window.app.radius }%22%3B%0A%20%20%20%20%20%20wikibase%3Adistance%20%3Fdistance.%0A%20%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${ window.app.language}%2Cen%2Cceb%2Csv%2Cde%2Cfr%2Cnl%2Cru%2Cit%2Ces%2Cpl%2Cwar%2Cvi%2Cja%2Czh%2Carz%2Car%2Cuk%2Cpt%2Cfa%2Cca%2Csr%2Cid%2Cno%2Cko%2Cfi%2Chu%2Ccs%2Csh%2Cro%2Cnan%2Ctr%2Ceu%2Cms%2Cce%2Ceo%2Che%2Chy%2Cbg%2Cda%2Cazb%2Csk%2Ckk%2Cmin%2Chr%2Cet%2Clt%2Cbe%2Cel%2Caz%2Csl%2Cgl%2Cur%2Cnn%2Cnb%2Chi%2Cka%2Cth%2Ctt%2Cuz%2Cla%2Ccy%2Cta%2Cvo%2Cmk%2Cast%2Clv%2Cyue%2Ctg%2Cbn%2Caf%2Cmg%2Coc%2Cbs%2Csq%2Cky%2Cnds%2Cnew%2Cbe-tarask%2Cml%2Cte%2Cbr%2Ctl%2Cvec%2Cpms%2Cmr%2Csu%2Cht%2Csw%2Clb%2Cjv%2Csco%2Cpnb%2Cba%2Cga%2Cszl%2Cis%2Cmy%2Cfy%2Ccv%2Clmo%2Cwuu%2Cbn%22.%20%7D%0A%7D%0AORDER%20BY%20(%3Fdistance%29%0A%20OFFSET%200%20LIMIT%2010`;
    
      console.log( url );

      // render topics
      parentref.postMessage({ event_id: 'run-query', data: { url: url, } }, '*' );

    }

  });

  let groundPos = globe.planet.getCartesianFromMouseTerrain();
  myPopup.setCartesian3v(groundPos);

  myPopup.setVisibility(true);

}
