#!/bin/bash
uglifyjs --compress --mangle -- js/lc_lightbox.lite.js > js/lc_lightbox.lite.min.js
uglifycss css/lc_lightbox.css > css/lc_lightbox.min.css
