/* Copyright J. Poulsen */

import "/app/explore2/libs/ol.js";
import "/app/explore2/libs/ol-ext.min.js";

let map           = '';

let gbifId        = '';
let gbifCountry   = '';
let gbifGeometry  = '';
let gbifTitle     = '';
let gbifLanguage  = '';

let month         = 6; // June
let mapLegendElement = '';
let monthElement  = '';

let osm_countries = {
  "AC": null,
  "AD": { "osm_type": "relation", "osm_id": 9407 },
  "AE": { "osm_type": "relation", "osm_id": 307763 },
  "AF": { "osm_type": "relation", "osm_id": 303427 },
  "AG": { "osm_type": "relation", "osm_id": 536900 },
  "AI": { "osm_type": "relation", "osm_id": 2177161 },
  "AL": { "osm_type": "relation", "osm_id": 53292 },
  "AM": { "osm_type": "relation", "osm_id": 364066 },
  "AO": { "osm_type": "relation", "osm_id": 195267 },
  "AQ": { "osm_type": "relation", "osm_id": 2186646 },
  "AR": { "osm_type": "relation", "osm_id": 286393 },
  "AS": { "osm_type": "relation", "osm_id": 2177187 },
  "AT": { "osm_type": "relation", "osm_id": 16239 },
  "AU": { "osm_type": "relation", "osm_id": 80500 },
  "AW": { "osm_type": "relation", "osm_id": 1231749 },
  "AX": { "osm_type": "relation", "osm_id": 1650407 },
  "AZ": { "osm_type": "relation", "osm_id": 364110 },
  "BA": { "osm_type": "relation", "osm_id": 2528142 },
  "BB": { "osm_type": "relation", "osm_id": 547511 },
  "BD": { "osm_type": "relation", "osm_id": 184640 },
  "BE": { "osm_type": "relation", "osm_id": 52411 },
  "BF": { "osm_type": "relation", "osm_id": 192783 },
  "BG": { "osm_type": "relation", "osm_id": 186382 },
  "BH": { "osm_type": "relation", "osm_id": 378734 },
  "BI": { "osm_type": "relation", "osm_id": 195269 },
  "BJ": { "osm_type": "relation", "osm_id": 192784 },
  "BL": { "osm_type": "relation", "osm_id": 537967 },
  "BM": { "osm_type": "relation", "osm_id": 1993208 },
  "BN": { "osm_type": "relation", "osm_id": 2103120 },
  "BO": { "osm_type": "relation", "osm_id": 252645 },
  "BQ": { "osm_type": "relation", "osm_id": 1216720 },
  "BR": { "osm_type": "relation", "osm_id": 59470 },
  "BS": { "osm_type": "relation", "osm_id": 547469 },
  "BT": { "osm_type": "relation", "osm_id": 184629 },
  "BV": { "osm_type": "relation", "osm_id": 2425963 },
  "BW": { "osm_type": "relation", "osm_id": 1889339 },
  "BY": { "osm_type": "relation", "osm_id": 59065 },
  "BZ": { "osm_type": "relation", "osm_id": 287827 },
  "CA": { "osm_type": "relation", "osm_id": 1428125 },
  "CC": { "osm_type": "relation", "osm_id": 82636 },
  "CD": { "osm_type": "relation", "osm_id": 192795 },
  "CF": { "osm_type": "relation", "osm_id": 192790 },
  "CG": { "osm_type": "relation", "osm_id": 192794 },
  "CH": { "osm_type": "relation", "osm_id": 51701 },
  "CI": { "osm_type": "relation", "osm_id": 192779 },
  "CK": { "osm_type": "relation", "osm_id": 2184233 },
  "CL": { "osm_type": "relation", "osm_id": 167454 },
  "CM": { "osm_type": "relation", "osm_id": 192830 },
  "CN": { "osm_type": "relation", "osm_id": 270056 },
  "CO": { "osm_type": "relation", "osm_id": 120027 },
  "CP": null,
  "CR": { "osm_type": "relation", "osm_id": 287667 },
  "CU": { "osm_type": "relation", "osm_id": 307833 },
  "CV": { "osm_type": "relation", "osm_id": 535774 },
  "CW": { "osm_type": "relation", "osm_id": 1216719 },
  "CX": { "osm_type": "relation", "osm_id": 2177207 },
  "CY": { "osm_type": "relation", "osm_id": 307787 },
  "CZ": { "osm_type": "relation", "osm_id": 51684 },
  "DE": { "osm_type": "relation", "osm_id": 51477 },
  "DG": null,
  "DJ": { "osm_type": "relation", "osm_id": 192801 },
  "DK": { "osm_type": "relation", "osm_id": 50046 },
  "DM": { "osm_type": "relation", "osm_id": 307823 },
  "DO": { "osm_type": "relation", "osm_id": 307828 },
  "DZ": { "osm_type": "relation", "osm_id": 192756 },
  "EA": null,
  "EC": { "osm_type": "relation", "osm_id": 108089 },
  "EE": { "osm_type": "relation", "osm_id": 79510 },
  "EG": { "osm_type": "relation", "osm_id": 1473947 },
  "EH": { "osm_type": "relation", "osm_id": 2559126 },
  "ER": { "osm_type": "relation", "osm_id": 296961 },
  "ES": { "osm_type": "relation", "osm_id": 1311341 },
  "ET": { "osm_type": "relation", "osm_id": 192800 },
  "FI": { "osm_type": "relation", "osm_id": 54224 },
  "FJ": { "osm_type": "relation", "osm_id": 571747 },
  "FK": { "osm_type": "relation", "osm_id": 2185374 },
  "FM": { "osm_type": "relation", "osm_id": 571802 },
  "FO": { "osm_type": "relation", "osm_id": 52939 },
  "FR": { "osm_type": "relation", "osm_id": 2202162 },
  "GA": { "osm_type": "relation", "osm_id": 192793 },
  "GB": { "osm_type": "relation", "osm_id": 62149 },
  "GD": { "osm_type": "relation", "osm_id": 550727 },
  "GE": { "osm_type": "relation", "osm_id": 28699 },
  "GF": { "osm_type": "relation", "osm_id": 1260551 },
  "GG": { "osm_type": "relation", "osm_id": 270009 },
  "GH": { "osm_type": "relation", "osm_id": 192781 },
  "GI": { "osm_type": "relation", "osm_id": 1278736 },
  "GL": { "osm_type": "relation", "osm_id": 2184073 },
  "GM": { "osm_type": "relation", "osm_id": 192774 },
  "GN": { "osm_type": "relation", "osm_id": 192778 },
  "GP": { "osm_type": "relation", "osm_id": 1401835 },
  "GQ": { "osm_type": "relation", "osm_id": 192791 },
  "GR": { "osm_type": "relation", "osm_id": 192307 },
  "GS": { "osm_type": "relation", "osm_id": 1983628 },
  "GT": { "osm_type": "relation", "osm_id": 1521463 },
  "GU": { "osm_type": "relation", "osm_id": 306001 },
  "GW": { "osm_type": "relation", "osm_id": 192776 },
  "GY": { "osm_type": "relation", "osm_id": 287083 },
  "HK": { "osm_type": "relation", "osm_id": 913110 },
  "HM": { "osm_type": "relation", "osm_id": 2177227 },
  "HN": { "osm_type": "relation", "osm_id": 287670 },
  "HR": { "osm_type": "relation", "osm_id": 214885 },
  "HT": { "osm_type": "relation", "osm_id": 307829 },
  "HU": { "osm_type": "relation", "osm_id": 21335 },
  "IC": null,
  "ID": { "osm_type": "relation", "osm_id": 304751 },
  "IE": { "osm_type": "relation", "osm_id": 62273 },
  "IL": { "osm_type": "relation", "osm_id": 1473946 },
  "IM": { "osm_type": "relation", "osm_id": 62269 },
  "IN": { "osm_type": "relation", "osm_id": 304716 },
  "IO": { "osm_type": "relation", "osm_id": 1993867 },
  "IQ": { "osm_type": "relation", "osm_id": 304934 },
  "IR": { "osm_type": "relation", "osm_id": 304938 },
  "IS": { "osm_type": "relation", "osm_id": 299133 },
  "IT": { "osm_type": "relation", "osm_id": 365331 },
  "JE": { "osm_type": "relation", "osm_id": 367988 },
  "JM": { "osm_type": "relation", "osm_id": 555017 },
  "JO": { "osm_type": "relation", "osm_id": 184818 },
  "JP": { "osm_type": "relation", "osm_id": 382313 },
  "KE": { "osm_type": "relation", "osm_id": 192798 },
  "KG": { "osm_type": "relation", "osm_id": 178009 },
  "KH": { "osm_type": "relation", "osm_id": 49898 },
  "KI": { "osm_type": "relation", "osm_id": 571178 },
  "KM": { "osm_type": "relation", "osm_id": 535790 },
  "KN": { "osm_type": "relation", "osm_id": 536899 },
  "KP": { "osm_type": "relation", "osm_id": 192734 },
  "KR": { "osm_type": "relation", "osm_id": 307756 },
  "KW": { "osm_type": "relation", "osm_id": 305099 },
  "KY": { "osm_type": "relation", "osm_id": 2185366 },
  "KZ": { "osm_type": "relation", "osm_id": 214665 },
  "LA": { "osm_type": "relation", "osm_id": 49903 },
  "LB": { "osm_type": "relation", "osm_id": 184843 },
  "LC": { "osm_type": "relation", "osm_id": 550728 },
  "LI": { "osm_type": "relation", "osm_id": 1155955 },
  "LK": { "osm_type": "relation", "osm_id": 536807 },
  "LR": { "osm_type": "relation", "osm_id": 192780 },
  "LS": { "osm_type": "relation", "osm_id": 2093234 },
  "LT": { "osm_type": "relation", "osm_id": 72596 },
  "LU": { "osm_type": "relation", "osm_id": 2171347 },
  "LV": { "osm_type": "relation", "osm_id": 72594 },
  "LY": { "osm_type": "relation", "osm_id": 192758 },
  "MA": { "osm_type": "relation", "osm_id": 3630439 },
  "MC": { "osm_type": "relation", "osm_id": 1124039 },
  "MD": { "osm_type": "relation", "osm_id": 58974 },
  "ME": { "osm_type": "relation", "osm_id": 53296 },
  "MF": { "osm_type": "relation", "osm_id": 1891583 },
  "MG": { "osm_type": "relation", "osm_id": 447325 },
  "MH": { "osm_type": "relation", "osm_id": 571771 },
  "MK": { "osm_type": "relation", "osm_id": 53293 },
  "ML": { "osm_type": "relation", "osm_id": 192785 },
  "MM": { "osm_type": "relation", "osm_id": 50371 },
  "MN": { "osm_type": "relation", "osm_id": 161033 },
  "MO": { "osm_type": "relation", "osm_id": 1867188 },
  "MP": { "osm_type": "relation", "osm_id": 306004 },
  "MQ": { "osm_type": "relation", "osm_id": 1891495 },
  "MR": { "osm_type": "relation", "osm_id": 192763 },
  "MS": { "osm_type": "relation", "osm_id": 537257 },
  "MT": { "osm_type": "relation", "osm_id": 365307 },
  "MU": { "osm_type": "relation", "osm_id": 535828 },
  "MV": { "osm_type": "relation", "osm_id": 536773 },
  "MW": { "osm_type": "relation", "osm_id": 195290 },
  "MX": { "osm_type": "relation", "osm_id": 114686 },
  "MY": { "osm_type": "relation", "osm_id": 2108121 },
  "MZ": { "osm_type": "relation", "osm_id": 195273 },
  "NA": { "osm_type": "relation", "osm_id": 195266 },
  "NC": { "osm_type": "relation", "osm_id": 3407643 },
  "NE": { "osm_type": "relation", "osm_id": 192786 },
  "NF": { "osm_type": "relation", "osm_id": 2574988 },
  "NG": { "osm_type": "relation", "osm_id": 192787 },
  "NI": { "osm_type": "relation", "osm_id": 287666 },
  "NL": { "osm_type": "relation", "osm_id": 2323309 },
  "NO": { "osm_type": "relation", "osm_id": 2978650 },
  "NP": { "osm_type": "relation", "osm_id": 184633 },
  "NR": { "osm_type": "relation", "osm_id": 571804 },
  "NU": { "osm_type": "relation", "osm_id": 1558556 },
  "NZ": { "osm_type": "relation", "osm_id": 556706 },
  "OM": { "osm_type": "relation", "osm_id": 305138 },
  "PA": { "osm_type": "relation", "osm_id": 287668 },
  "PE": { "osm_type": "relation", "osm_id": 288247 },
  "PF": { "osm_type": "relation", "osm_id": 3412620 },
  "PG": { "osm_type": "relation", "osm_id": 307866 },
  "PH": { "osm_type": "relation", "osm_id": 443174 },
  "PK": { "osm_type": "relation", "osm_id": 307573 },
  "PL": { "osm_type": "relation", "osm_id": 49715 },
  "PM": { "osm_type": "relation", "osm_id": 3406826 },
  "PN": { "osm_type": "relation", "osm_id": 2185375 },
  "PR": { "osm_type": "relation", "osm_id": 4422604 },
  "PS": { "osm_type": "relation", "osm_id": 1703814 },
  "PT": { "osm_type": "relation", "osm_id": 295480 },
  "PW": { "osm_type": "relation", "osm_id": 571805 },
  "PY": { "osm_type": "relation", "osm_id": 287077 },
  "QA": { "osm_type": "relation", "osm_id": 305095 },
  "RE": { "osm_type": "relation", "osm_id": 1785276 },
  "RO": { "osm_type": "relation", "osm_id": 90689 },
  "RS": { "osm_type": "relation", "osm_id": 1741311 },
  "RU": { "osm_type": "relation", "osm_id": 60189 },
  "RW": { "osm_type": "relation", "osm_id": 171496 },
  "SA": { "osm_type": "relation", "osm_id": 307584 },
  "SB": { "osm_type": "relation", "osm_id": 1857436 },
  "SC": { "osm_type": "relation", "osm_id": 536765 },
  "SD": { "osm_type": "relation", "osm_id": 192789 },
  "SE": { "osm_type": "relation", "osm_id": 52822 },
  "SG": { "osm_type": "relation", "osm_id": 536780 },
  "SH": { "osm_type": "relation", "osm_id": 1964272 },
  "SI": { "osm_type": "relation", "osm_id": 218657 },
  "SJ": { "osm_type": "relation", "osm_id": 3245620 },
  "SK": { "osm_type": "relation", "osm_id": 14296 },
  "SL": { "osm_type": "relation", "osm_id": 192777 },
  "SM": { "osm_type": "relation", "osm_id": 54624 },
  "SN": { "osm_type": "relation", "osm_id": 192775 },
  "SO": { "osm_type": "relation", "osm_id": 192799 },
  "SR": { "osm_type": "relation", "osm_id": 287082 },
  "SS": { "osm_type": "relation", "osm_id": 1656678 },
  "ST": { "osm_type": "relation", "osm_id": 535880 },
  "SV": { "osm_type": "relation", "osm_id": 1520612 },
  "SX": { "osm_type": "relation", "osm_id": 1231790 },
  "SY": { "osm_type": "relation", "osm_id": 184840 },
  "SZ": { "osm_type": "relation", "osm_id": 88210 },
  "TA": null,
  "TC": { "osm_type": "relation", "osm_id": 547479 },
  "TD": { "osm_type": "relation", "osm_id": 2361304 },
  "TF": { "osm_type": "relation", "osm_id": 2186658 },
  "TG": { "osm_type": "relation", "osm_id": 192782 },
  "TH": { "osm_type": "relation", "osm_id": 2067731 },
  "TJ": { "osm_type": "relation", "osm_id": 214626 },
  "TK": { "osm_type": "relation", "osm_id": 2186600 },
  "TL": { "osm_type": "relation", "osm_id": 305142 },
  "TM": { "osm_type": "relation", "osm_id": 223026 },
  "TN": { "osm_type": "relation", "osm_id": 192757 },
  "TO": { "osm_type": "relation", "osm_id": 2186665 },
  "TR": { "osm_type": "relation", "osm_id": 174737 },
  "TT": { "osm_type": "relation", "osm_id": 555717 },
  "TV": { "osm_type": "relation", "osm_id": 2177266 },
  "TW": { "osm_type": "relation", "osm_id": 449220 },
  "TZ": { "osm_type": "relation", "osm_id": 195270 },
  "UA": { "osm_type": "relation", "osm_id": 60199 },
  "UG": { "osm_type": "relation", "osm_id": 192796 },
  "UM": { "osm_type": "relation", "osm_id": 2185386 },
  "US": { "osm_type": "relation", "osm_id": 148838 },
  "UY": { "osm_type": "relation", "osm_id": 287072 },
  "UZ": { "osm_type": "relation", "osm_id": 196240 },
  "VA": { "osm_type": "relation", "osm_id": 36989 },
  "VC": { "osm_type": "relation", "osm_id": 550725 },
  "VE": { "osm_type": "relation", "osm_id": 272644 },
  "VG": { "osm_type": "relation", "osm_id": 285454 },
  "VI": { "osm_type": "relation", "osm_id": 286898 },
  "VN": { "osm_type": "relation", "osm_id": 49915 },
  "VU": { "osm_type": "relation", "osm_id": 2177246 },
  "WF": { "osm_type": "relation", "osm_id": 3412448 },
  "WS": { "osm_type": "relation", "osm_id": 1872673 },
  "XK": { "osm_type": "relation", "osm_id": 2088990 },
  "YE": { "osm_type": "relation", "osm_id": 305092 },
  "YT": { "osm_type": "relation", "osm_id": 1259885 },
  "ZA": { "osm_type": "relation", "osm_id": 87565 },
  "ZM": { "osm_type": "relation", "osm_id": 195271 },
  "ZW": { "osm_type": "relation", "osm_id": 195272 }
}

class GBIFMap extends HTMLElement {

  async connectedCallback () {

    this.sDOM = this.attachShadow({ mode: 'closed' });

    this.sDOM.innerHTML = `
			<link rel="stylesheet" href="/app/explore2/css/various/openlayers.css">
			<link rel="stylesheet" href="/app/explore2/css/various/ol-ext.css" type="text/css">
			<link rel="stylesheet" href="/app/explore2/css/various/climatemaps.css" type="text/css">
			<link rel="stylesheet" href="/app/explore2/css/conzept/css/common.css?v001" type="text/css">

      <style>

      html, body {
        font-family: Hind;
      }

      canvas {
        height: 100% !important;
      }

      .ol-full-screen {
        width: 1.65em;
        left: .5em;
        top: .5em;
      }

      .ol-zoom {
        top: 3.0em;
        left: 0.5em;
      }

      .ol-control.ol-layerswitcher {
        top: 0.3em;
        background: none;
				z-index: 999999
      }

      .ol-layerswitcher .panel li > div {
        padding-bottom: 0.5em;
      }

      .ol-layerswitcher .layerswitcher-opacity {
        margin-left: 2em;
        padding: 2px;
      }

      .ol-layerswitcher .panel li label {
        color: black;
      }

      .ol-layerswitcher {
        font-family: Hind !important;
      }

      .ol-control.ol-layerswitcher .panel {
        background-color: white;
      }

      .more-info {
        top: 7.0em;
        left: 0.5em;
      }


      .tilt-map {
        top: 0em;
        left: 0.5em;
      }
 
      #title {
        position: absolute;
        top: .8em;
        left: 4em;
        z-index: 9999;
        color: black;
        font-weight: bold;
        background: #fbfaf9c9;
        padding: 0px 0.3em;
        border-radius: 0.3em;
      }

      /* styles used with layer-controls */
      .hideOpacity .layerswitcher-opacity {
        display:none;
      }
      .hideOpacity .ol-layerswitcher .layerup {
        height: 1.5em;
      }
      .showPercent .layerSwitcher .ol-layerswitcher .layerswitcher-opacity-label {
        display: block;
      }

      .ol-header > div {
        width:100%; 
      }
      .toggleVisibility {
        padding-left: 1.6em;
        cursor: pointer;
        border-bottom: 2px solid #369;
        margin-bottom: 1em; 
      }
      .toggleVisibility:before {
        background-color: #fff;
        border: 2px solid #369;
        box-sizing: border-box;
        content: "";
        display: block;
        height: 1.2em;
        left: 0.1em;
        margin: 0;
        position: absolute;
        width: 1.2em;
      }
      .toggleVisibility.show:before {
        background: #369;
      }

      .ol-attribution li {
        text-decoration: none !important;
      }

      /* other styles */
      :host {
        display: block;
        width: 100%;
        height: 100%;
        contain: strict;
        overflow: hidden;
        position: relative;
      }

      #map {
        width: 100%;
        height: 100%;
        display: block;
        position: absolute;
        top: 0;
        left: 0;
				overflow: hidden;
      }

      :host-context(.map--no-controls) #map {
        pointer-events: none;
      }

      /*
      :host-context(.map--no-controls) .leaflet-control  {
        display: none;
      }

      .leaflet-control-attribution {
        display: none;
      }

      */
      </style>

      <div id="map">
        <span id="title"></span>
        <div id="colorbar-legend-container"></div>

				<select id="month-select" name="month" onchange="month = this.selectedIndex + 1">
					<option value="1">Januari</option>
					<option value="2">Februari</option>
					<option value="3">March</option>
					<option value="4">April</option>
					<option value="5">May</option>
					<option value="6" selected>June</option>
					<option value="7">July</option>
					<option value="8">August</option>
					<option value="9">September</option>
					<option value="10">October</option>
					<option value="11">November</option>
					<option value="12">December</option>
				</select>

      </div>

    `;

    const mapWrapperElement = this.sDOM.querySelector('#map');
    mapLegendElement  = this.sDOM.querySelector('#colorbar-legend-container');
    monthElement  = this.sDOM.querySelector('#month-select');

    const titleWrapperElement = this.sDOM.querySelector('#title');
		const monthSelect = this.sDOM.querySelector('#month-select');
    //const moreInfoButton    = this.sDOM.querySelector('#more-info');

		function changeMonth( event ){

			console.log( event );
			console.log( monthSelect );
			month = monthSelect.options[ monthSelect.selectedIndex ].value;
			console.log(month);

		}

    gbifId        = this.getAttribute('gbif-id');
    gbifCountry   = this.getAttribute('gbif-country') || '';
    gbifGeometry  = this.getAttribute('gbif-geometry') || '';
    gbifTitle     = this.getAttribute('gbif-title') || '';
    gbifLanguage  = this.getAttribute('gbif-language') || 'en';

    titleWrapperElement.innerHTML = gbifTitle;

		//console.log( gbifId, gbifCountry, gbifTitle, gbifLanguage );

    //const gbifQuery = this.getAttribute('gbif-query');
    const gbifStyle = this.getAttribute('gbif-style') || 'purpleHeat.point';
    const latitude = parseFloat(this.getAttribute('center-latitude'));
    const longitude = parseFloat(this.getAttribute('center-longitude'));
    const zoom = this.getAttribute('zoom') || 1.5;
    const enableControls = this.hasAttribute('controls');

    if (!enableControls) {
      this.classList.add('map--no-controls');
    }

    if (!gbifId) {
      throw new Error('No GBIF id.');
    }

    //let panel = new ol.control.Panel({defaultControl: btnHiLite});
    //panel.addControls([btnHiLite]);

		// OpenLayers map
		map = new ol.Map({
			target: mapWrapperElement,
			interactions: ol.interaction.defaults({keyboard:false}),  // disable because this moves the map when using the arrow keys to change the slider
      //controls: [ new ol.Control.PanZoom(), panel ],
		});

		/*
		var view = new ol.View({
			center: [0, 0],
			zoom: zoom,
			projection: 'EPSG:3857'
		});
		*/

		var view = new ol.View({
			//center: ol.proj.transform([25, 20], 'EPSG:4326', 'EPSG:3857'),
			center: ol.proj.fromLonLat([ longitude, latitude]),
			zoom: zoom,
      enableRotation: false,
		})

    if ( gbifCountry !== '' ){ // fit zoom to country borders

			//console.log('zoom to country: ', gbifCountry );

			let osm_id = '';

      // get osm_id
			osm_id = osm_countries[ gbifCountry ].osm_id || '';

			//console.log( osm_id );

      // get country borders geojson
			if ( osm_id !== '' ){ // OSM object

				// fetch OSM boundary GeoJSON
				let url = 'https://nominatim.openstreetmap.org/reverse?osm_id=' + osm_id + '&osm_type=R&polygon_geojson=1&format=json&polygon_threshold=0.001';

					$.ajax({
						url: url,
						dataType: "json",

						success: function( data ) {

							//console.log( data );

              // see: https://openlayersbook.github.io/
							let source = new ol.source.Vector({
								features: ( new ol.format.GeoJSON()).readFeatures(
									data.geojson,
									{ featureProjection: 'EPSG:3857' }
								)
							});

							let style = new ol.style.Style({

								 fill: new ol.style.Stroke({
										color: 'transparent'
								 }),

								stroke: new ol.style.Stroke({
									color: 'black',
									width: 3
								}),

							});

							let l = new ol.layer.Vector({
    						title: "country border",
								source: source,
								style: style,
							});

							map.addLayer( l );

							let feature = source.getFeatures()[0];
							let polygon = feature.getGeometry();
							view.fit(polygon, { padding: [ 10, 10, 10, 10 ] });

						},

					});

				}


    }


		map.setView(view);

		map.addControl( new ol.control.FullScreen() );
		//map.addControl( new ol.control.ZoomSlider() );

		//map.setPerspective( 10 );
		//console.log( map );

		// info button
    /*
		let moreInfo = new ol.control.Button ({

			html: 'i',
			className: "more-info",
			title: "see more info",

			handleClick: function(){

				window.top.postMessage({ event_id: 'handleClick', data: { type: 'link-split', title: gbifTitle, hash: '', language: gbifLanguage, url: '/app/species/?l=en&id=' + gbifId , qid: '', ids: '' } }, '*');
			}

		});

		/*
    $( moreInfoButton ).click(function(){
      console.log('click');
      //map.getView().setZoom(map.getView().getZoom()+1); 
    });
		*/

    // see also:
    //  https://viglino.github.io/ol-ext/doc/doc-pages/ol.control.LayerSwitcher.html
    //  https://openlayers.org/en/latest/apidoc/module-ol_layer_Layer-Layer.html
    //  https://viglino.github.io/ol-ext/examples/control/map.switcher.html
		//  slider: https://viglino.github.io/ol-ext/examples/storymap/map.control.timequake.html
    //  https://www.gbif.org/developer/maps
    //  http://climatemaps.romgens.com/

    //addHardinessZones();
    //addLakes();
    //addPopulation();

    addOSM();
    addSatellite();
    addReefs();
    addUrbanizations();

    //addIntactForestLandscapes2016();
    //addLight();
    //addWind();
    //addPrecipitation();
    //addMaxTemp();
    //addMinTemp();
    //addMeanTemp();
    addRivers();
    addGrid();
    addGeographies();
    addMarineGeographies();
    addCountries();
    addGBIF( gbifId );

    //map.invalidateSize();

    // add layer control inside the map
    let layer_control = new ol.control.LayerSwitcher({

      reordering: false,

    });

    map.addControl( layer_control );

    layer_control.on('click', function(e) {
      //console.log('Collapse layerswitcher', e.collapsed);
    });

    // TODO: month-slider

  }

}

customElements.define('gbif-map', GBIFMap);

function lineStyleFunction(feature, resolution) {

  let scaleForPixelDensity = 1.0; //dpi_x/96.0;

  let lineWidth = feature.get('stroke-width') * scaleForPixelDensity * Math.pow(map.getView().getZoom()/2.0, 1.3);

  let lineStyle = new ol.style.Style({

    stroke: new ol.style.Stroke({
      color: feature.get('stroke'),
      width: lineWidth / 4,
      opacity: 0.0 //feature.get('opacity')
      //            width: climateMap.getView().getZoom(),
    })

  });

  return lineStyle;

}

/*
function addPopulation(){

  var populationLayer = new ImageLayer({

    title: 'popuation',

    visible: false,

    source: new Static({
      //attributions: '© <a href="https://neo.sci.gsfc.nasa.gov/view.php?datasetId=SEDAC_POP">NASA</a>',
			url: '/app/explore2/assets/geojson/population.jpg',
      projection: 'EPSG:3857'
      //imageExtent: extent,
    }),

  });

  map.addLayer( populationLayer );

}
*/



function addOSM(){

  var osmSource = new ol.source.OSM('OpenStreetMap');

  osmSource.setUrl('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png');

  var osmLayer = new ol.layer.Tile({

    title: "OpenStreetMap",

    source: osmSource,

  });

  map.addLayer( osmLayer );

}

function addSatellite(){

  let l = new ol.layer.Tile({

    title: "satellite",

    visible: false,

    source: new ol.source.XYZ({
      url: 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY29uemVwdCIsImEiOiJja2N6bHpwZmEwMmlhMnpvMThqaGFodHk1In0.9laZu8QUMwZM4mpzq1x9GA'
      //url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY29uemVwdCIsImEiOiJja2N6bHpwZmEwMmlhMnpvMThqaGFodHk1In0.9laZu8QUMwZM4mpzq1x9GA'
    })

  })

  map.addLayer( l );

}

//function addLightPollution(){

  //var l = new ol.layer.WMS("NASA Global Mosaic", "http://wms.jpl.nasa.gov/wms.cgi", {layers: "modis,global_mosaic"});

  //var l = new ol.Layer.WMS( "OpenLayers WMS", "http://vmap0.tiles.osgeo.org/wms/vmap0", {layers: 'basic'} );

  //map.addLayer( l );

//}

function addRivers(){

	let l = new ol.layer.Vector({

    title: "rivers",

    visible: false,

		source: new ol.source.Vector({
			url: '/app/explore2/assets/geojson/rivers.geojson',
			format: new ol.format.GeoJSON(),
		})

	});

  map.addLayer( l );

}

function addGrid(){

	let l = new ol.layer.Vector({

    title: "grid",

    visible: false,

		source: new ol.source.Vector({
			url: '/app/explore2/assets/geojson/ne_50m_graticules_5.geojson',
			format: new ol.format.GeoJSON(),
		})

	});

  map.addLayer( l );

}



function addGeographies(){

  /*
  let style = new Style({

    fill: new ol.style.Stroke({
      color: 'grey'
    }),

    stroke: new Stroke({
      color: '#333',
      width: 2,
    }),
  });
  */

  //let myStyle = {
  //  "color": "#333"
  //};

  // The styling function for the vector layer, will return an array of styles
  // which either contains the aboove gradient or pattern.
  let getStackedStyle = function (feature) {
    var id = feature.getId();
    fill.setColor(id > 'J' ? gradient : pattern);
    return style;
  };

	let l = new ol.layer.Vector({

    title: "geographic zones",

    visible: false,

		source: new ol.source.Vector({
			url: '/app/explore2/assets/geojson/ne_50m_geography_regions_polys.geojson',
			format: new ol.format.GeoJSON(),
		}),

    //style: myStyle,

	});

  map.addLayer( l );

}

function addHardinessZones(){

	let l = new ol.layer.Vector({

    title: "hardiness zones",

    visible: false,

		source: new ol.source.Vector({
			url: '/app/explore2/assets/geojson/hardiness_zones.geojson',
			format: new ol.format.GeoJSON(),
		})

	});

  map.addLayer( l );

}



function addMarineGeographies(){

	let l = new ol.layer.Vector({

    title: "marine zones",

    visible: false,

		source: new ol.source.Vector({
			url: '/app/explore2/assets/geojson/ne_50m_geography_marine_polys.geojson',
			format: new ol.format.GeoJSON(),
		})

	});

  map.addLayer( l );

}


function addUrbanizations(){

  let style = new ol.style.Style({

    fill: new ol.style.Stroke({
      color: 'grey'
    }),

    stroke: new ol.style.Stroke({
      color: 'grey',
      width: 1
    }),

  });


	let l = new ol.layer.Vector({

    title: "urbanization",

    visible: false,

		source: new ol.source.Vector({
			url: '/app/explore2/assets/geojson/ne_50m_urban_areas.geojson',
			format: new ol.format.GeoJSON(),
		}),

    style: style,

	});

  map.addLayer( l );

}

function addReefs(){

  let style = new ol.style.Style({

    fill: new ol.style.Stroke({
      color: '#da1abcd1'
    }),

    stroke: new ol.style.Stroke({
      color: '#da1abcd1',
      width: 3
    }),

  });


	let l = new ol.layer.Vector({

    title: "reefs",

    visible: false,

		source: new ol.source.Vector({
			url: '/app/explore2/assets/geojson/ne_10m_reefs.geojson',
			format: new ol.format.GeoJSON(),
		}),

    style: style,

	});

  map.addLayer( l );

}

function addLakes(){

  let style = new ol.style.Style({

    fill: new ol.style.Stroke({
      color: '#aad3dfe3'
    }),

    stroke: new ol.style.Stroke({
      color: '#aad3dfe3',
      width: 1
    }),

  });


	let l = new ol.layer.Vector({

    title: "lakes",

    visible: false,

		source: new ol.source.Vector({
			url: '/app/explore2/assets/geojson/ne_10m_lakes.geojson',
			format: new ol.format.GeoJSON(),
		}),

    style: style,

	});

  map.addLayer( l );

}

function addCountries(){

  let style = new ol.style.Style({

    fill: new ol.style.Stroke({
      color: 'transparent'
    }),

    stroke: new ol.style.Stroke({
      color: 'black',
      width: 1
    }),

  });


	let l = new ol.layer.Vector({

    title: "country borders",

    visible: false,

		source: new ol.source.Vector({
			url: '/app/explore2/assets/geojson/ne_50m_admin_0_countries.geojson',
			format: new ol.format.GeoJSON(),
		}),

    style: style,

	});

  map.addLayer( l );

}

function addIntactForestLandscapes2016(){

  let style = new ol.style.Style({

    fill: new ol.style.Stroke({
      color: 'transparent'
    }),

    stroke: new ol.style.Stroke({
      color: 'black',
      width: 1
    }),

  });


	let l = new ol.layer.Vector({

    title: "intact forests (2016)",

    visible: false,

		source: new ol.source.Vector({
			url: '/app/explore2/assets/geojson/intact_forest_landscapes_2016.geojson',
			format: new ol.format.GeoJSON(),
		}),

    style: style,

	});

  map.addLayer( l );

}


function addGBIF( gbifId ){

  let gbif_country_param = '';
  let gbif_geometry_param = '';

  if ( gbifCountry !== '' ){
    gbif_country_param = '&country=' + gbifCountry;
  }

  if ( gbifGeometry !== '' ){
    gbif_country_param = '';

    // TODO:
    //gbif_geometry_param = '&geometry=' + gbifGeometry;
  }

  //console.log( gbif_geometry_param );

  let gbif_url = 'https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?bin=square&squareSize=48&srs=EPSG:3857&style=purpleYellow.poly&taxonKey=' + gbifId + gbif_country_param + gbif_geometry_param;

  //console.log( gbif_url );

  var gbif_layer = new ol.layer.Tile({
    title: "GBIF observations",
    source: new ol.source.TileImage({ url: gbif_url }),
    projection: 'EPSG:3857'
  });

  map.addLayer( gbif_layer);

}

function addMeanTemp(){

  // meantemp contour-lines layer
  let contourLayer = new ol.layer.VectorTile({

    title: "mean-temp contours",

    visible: false,

    source: new ol.source.VectorTile({

      url: '/app/climate-data/data/meantemp/' + month + '/tiles/{z}/{x}/{y}.geojson',
      
      format: new ol.format.GeoJSON(),

      projection: 'EPSG:3857',

      tileGrid: ol.tilegrid.createXYZ({
        maxZoom: 5,
        minZoom: 1,
        tileSize: [256, 256],
        crossOrigin: 'anonymous'
      }),
    
       tileOptions: {crossOriginKeyword: 'anonymous'},
       transitionEffect: null
   
    }),

    style: lineStyleFunction

  });

  contourLayer.setZIndex(99);

  contourLayer.on('change:visible', function( event ){

    if ( event.oldValue ){ // off

      mapLegendElement.style.backgroundImage = 'url()';

    }
    else { // on

      let imageUrl = '/app/climate-data/data/meantemp/legend.png';
      mapLegendElement.style.backgroundImage = 'url(' + imageUrl + ')';

			//monthElement.style.display = 'none';
			//monthElement.style.display = 'block';

    }

  });



  map.addLayer(contourLayer);


  // meantemp image-tile layer
  let my_layer = new ol.layer.Tile({

    title: "mean-temp",

    visible: false,
                   
    source: new ol.source.XYZ({
        
        url: '/app/climate-data/data/meantemp/' + month + '/maptiles/{z}/{x}/{-y}.png'
        
    }),

    opacity:0.50,

  });

  my_layer.on('change:visible', function( event ){

    if ( event.oldValue ){ // off

      mapLegendElement.style.backgroundImage = 'url()';

    }
    else { // on

      let imageUrl = '/app/climate-data/data/meantemp/legend.png';
      mapLegendElement.style.backgroundImage = 'url(' + imageUrl + ')';

    }

  });

  map.addLayer( my_layer );

}


function addPrecipitation(){

  // precipitation contour-lines layer
  let contourLayer = new ol.layer.VectorTile({

    title: "precipitation contours",

    visible: false,

    source: new ol.source.VectorTile({

      url: '/app/climate-data/data/precipitation/' + month + '/tiles/{z}/{x}/{y}.geojson',
      
      format: new ol.format.GeoJSON(),

      projection: 'EPSG:3857',

      tileGrid: ol.tilegrid.createXYZ({
        maxZoom: 5,
        minZoom: 1,
        tileSize: [256, 256],
        crossOrigin: 'anonymous'
      }),
    
       tileOptions: {crossOriginKeyword: 'anonymous'},
       transitionEffect: null
   
    }),

    style: lineStyleFunction

  });

  contourLayer.setZIndex(99);

  contourLayer.on('change:visible', function( event ){

    if ( event.oldValue ){ // off

      mapLegendElement.style.backgroundImage = 'url()';

    }
    else { // on

      let imageUrl = '/app/climate-data/data/precipitation/legend.png';
      mapLegendElement.style.backgroundImage = 'url(' + imageUrl + ')';

    }

  });

  map.addLayer(contourLayer);

  // precipitation image-tile layer
  let my_layer = new ol.layer.Tile({

    title: "precipitation",

    visible: false,
                   
    source: new ol.source.XYZ({
        
        url: '/app/climate-data/data/precipitation/' + month + '/maptiles/{z}/{x}/{-y}.png'
        
    }),

    opacity:0.50,

  });

  my_layer.on('change:visible', function( event ){

    if ( event.oldValue ){ // off

      mapLegendElement.style.backgroundImage = 'url()';

    }
    else { // on

      let imageUrl = '/app/climate-data/data/precipitation/legend.png';
      mapLegendElement.style.backgroundImage = 'url(' + imageUrl + ')';

    }

  });

  map.addLayer( my_layer );

}


function addMinTemp(){

  // min-temp contour-lines layer
  let contourLayer = new ol.layer.VectorTile({

    title: "min-temp contours",

    visible: false,

    source: new ol.source.VectorTile({

      url: '/app/climate-data/data/mintemp/' + month + '/tiles/{z}/{x}/{y}.geojson',
      
      format: new ol.format.GeoJSON(),

      projection: 'EPSG:3857',

      tileGrid: ol.tilegrid.createXYZ({
        maxZoom: 5,
        minZoom: 1,
        tileSize: [256, 256],
        crossOrigin: 'anonymous'
      }),
    
       tileOptions: {crossOriginKeyword: 'anonymous'},
       transitionEffect: null
   
    }),

    style: lineStyleFunction

  });

  contourLayer.setZIndex(99);

  contourLayer.on('change:visible', function( event ){

    if ( event.oldValue ){ // off

      mapLegendElement.style.backgroundImage = 'url()';

    }
    else { // on

      let imageUrl = '/app/climate-data/data/mintemp/legend.png';
      mapLegendElement.style.backgroundImage = 'url(' + imageUrl + ')';

    }

  });

  map.addLayer(contourLayer);


  // min-temp image-tile layer
  let my_layer = new ol.layer.Tile({

    title: "min-temp",

    visible: false,
                   
    source: new ol.source.XYZ({
        
        url: '/app/climate-data/data/mintemp/' + month + '/maptiles/{z}/{x}/{-y}.png'
        
    }),

    opacity:0.50,

  });

  my_layer.on('change:visible', function( event ){

    if ( event.oldValue ){ // off

      mapLegendElement.style.backgroundImage = 'url()';

    }
    else { // on

      let imageUrl = '/app/climate-data/data/mintemp/legend.png';
      mapLegendElement.style.backgroundImage = 'url(' + imageUrl + ')';

    }

  });

  //let group = new ol.layer.Group();
  //group.layer.push(...)

  map.addLayer( my_layer );

}

function addMaxTemp(){

  // min-temp contour-lines layer
  let contourLayer = new ol.layer.VectorTile({

    title: "max-temp contours",

    visible: false,

    source: new ol.source.VectorTile({

      url: '/app/climate-data/data/maxtemp/' + month + '/tiles/{z}/{x}/{y}.geojson',
      
      format: new ol.format.GeoJSON(),

      projection: 'EPSG:3857',

      tileGrid: ol.tilegrid.createXYZ({
        maxZoom: 5,
        minZoom: 1,
        tileSize: [256, 256],
        crossOrigin: 'anonymous'
      }),
    
       tileOptions: {crossOriginKeyword: 'anonymous'},
       transitionEffect: null
   
    }),

    style: lineStyleFunction

  });

  contourLayer.setZIndex(99);

  contourLayer.on('change:visible', function( event ){

    if ( event.oldValue ){ // off

      mapLegendElement.style.backgroundImage = 'url()';

    }
    else { // on

      let imageUrl = '/app/climate-data/data/maxtemp/legend.png';
      mapLegendElement.style.backgroundImage = 'url(' + imageUrl + ')';

    }

  });



  map.addLayer(contourLayer);


  // max-temp image-tile layer
  let my_layer = new ol.layer.Tile({

    title: "max-temp",

    visible: false,
                   
    source: new ol.source.XYZ({
        
        url: '/app/climate-data/data/maxtemp/6/maptiles/{z}/{x}/{-y}.png'
        
    }),

    opacity:0.50,

  });

  my_layer.on('change:visible', function( event ){

    if ( event.oldValue ){ // off

      mapLegendElement.style.backgroundImage = 'url()';

    }
    else { // on

      let imageUrl = '/app/climate-data/data/maxtemp/legend.png';
      mapLegendElement.style.backgroundImage = 'url(' + imageUrl + ')';

    }

  });

  //let group = new ol.layer.Group();
  //group.layer.push(...)

  map.addLayer( my_layer );

}

function addLight(){

  let my_layer = new ol.layer.Tile({

    title: "light",

    visible: false,
                   
    source: new ol.source.XYZ({
        
        url: '/app/climate-data/data/light/3/{x}/{-y}.png'
        
    }),

    opacity:0.50,

  });

  my_layer.on('change:visible', function( event ){

    if ( event.oldValue ){ // off

      mapLegendElement.style.backgroundImage = 'url()';

    }
    else { // on

      //let imageUrl = '/app/climate-data/data/maxtemp/legend.png';
      //mapLegendElement.style.backgroundImage = 'url(' + imageUrl + ')';

    }

  });

  //let group = new ol.layer.Group();
  //group.layer.push(...)

  map.addLayer( my_layer );

}


function addWind(){

  // wind contour-lines layer
  let contourLayer = new ol.layer.VectorTile({

    title: "wind contours",

    visible: false,

    source: new ol.source.VectorTile({

      url: '/app/climate-data/data/wind/' + month + '/tiles/{z}/{x}/{y}.geojson',
      
      format: new ol.format.GeoJSON(),

      projection: 'EPSG:3857',

      tileGrid: ol.tilegrid.createXYZ({
        maxZoom: 5,
        minZoom: 1,
        tileSize: [256, 256],
        crossOrigin: 'anonymous'
      }),
    
       tileOptions: {crossOriginKeyword: 'anonymous'},
       transitionEffect: null
   
    }),

    style: lineStyleFunction

  });

  contourLayer.setZIndex(99);

  contourLayer.on('change:visible', function( event ){

    if ( event.oldValue ){ // off

      mapLegendElement.style.backgroundImage = 'url()';

    }
    else { // on

      let imageUrl = '/app/climate-data/data/wind/legend.png';
      mapLegendElement.style.backgroundImage = 'url(' + imageUrl + ')';

    }

  });

  map.addLayer(contourLayer);

  // min-temp image-tile layer
  let my_layer = new ol.layer.Tile({

    title: "wind",

    visible: false,
                   
    source: new ol.source.XYZ({
        
        url: '/app/climate-data/data/wind/6/maptiles/{z}/{x}/{-y}.png'
        
    }),

    opacity:0.50,

  });

  my_layer.on('change:visible', function( event ){

    if ( event.oldValue ){ // off

      mapLegendElement.style.backgroundImage = 'url()';

    }
    else { // on

      let imageUrl = '/app/climate-data/data/wind/legend.png';
      mapLegendElement.style.backgroundImage = 'url(' + imageUrl + ')';

    }

  });

  map.addLayer( my_layer );

}


