const express = require("express");
const europeana = require("europeana")("4ZViVZKMe"); // "sancesocen" CONZEPT PATCH
const app = express();
const path = require('path');

app.use(express.static('public'))

app.get('/',function(req,res){

    res.sendFile(path.join(__dirname, 'pages/index.html'));

});

app.get('/search',function(req,res){

  //console.log( req );

  let qf = [];
  let qftext = '';
  let limit = parseInt(req.query.limit);
  let page = parseInt(req.query.page);

  let params = {
    query: req.query.search ,
    rows: limit ,
    start: page * limit - (limit - 1),
    media: true ,
    thumbnail: true,
    sort: score,
    //sort: req.query.sort,

    // see sort docs: https://pro.europeana.eu/page/search
		/*
    score             : 'relevance',
    timestamp_created : 'newest first',
    timestamp_update  : 'update time',
    COMPLETENESS      : 'completeness',
    europeana_id      : 'item ID',
    random            : 'random',
    is_fulltext       : 'is_fulltext',
    has_media         : 'has_media',
    has_thumbnails    : 'has_thumbnails',
		*/

  };

  if (req.query.img === 'true'){ qf.push('TYPE:IMAGE'); }
  if (req.query.snd === 'true'){ qf.push('TYPE:SOUND'); }
  if (req.query.txt === 'true'){ qf.push('TYPE:TEXT'); }
  if (req.query.vdo === 'true'){ qf.push('TYPE:VIDEO'); }
  if (req.query.threed === 'true'){ qf.push('TYPE:3D'); }

  for(let i=0; i<qf.length; i++) {
    qftext += qf[i];
    if(i+1 != qf.length) {
      qftext += ' OR ';
    }
  }
  params['qf'] = qftext;

  europeana ('search', params, function(err, data) {

    if (err) {
      res.send("error");
    } else {
      res.send(data);
    }

  });

});

app.listen( process.env.port || 3001, () => console.log(`App available on http://localhost:3001`))
