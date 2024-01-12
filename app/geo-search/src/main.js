import {
  Globe,
  GlobusTerrain,
  XYZ,
  utils
} from "../node_modules/@openglobus/og/lib/@openglobus/og.esm.js";

document.getElementById("btnOSM").onclick = function () {
  osm.setVisibility(true);
};

document.getElementById("btnMQS").onclick = function () {
  sat.setVisibility(true);
};

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

let globus = new Globe({

  target:       "globus",
  name:         "Earth",
  terrain:      new GlobusTerrain(),
  layers:       [osm, sat],
  resourcesSrc: "./node_modules/@openglobus/og/lib/@openglobus/res",
  fontsSrc:     "./node_modules/@openglobus/og/lib/@openglobus/res/fonts"
});
