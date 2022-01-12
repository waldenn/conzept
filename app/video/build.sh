#!/bin/sh
cd scripts &&
cat app.js controllers/list.js controllers/view.js services/youtube.js filters/htmlify.js directives/scroll.js > ../bundle_.js &&
cd .. && minify bundle_.js > bundle.js && rm bundle_.js
