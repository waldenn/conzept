let jbtnone = `
<div class="jumbotron">
  <h2 style="margin-left:1em;">no results found</h2>
</div>`

function databaseAdding(search, offset, cache) {

  let where = search.match(/where:(\w+|".+"|\((\s*\w+\s*(\s+OR\s+\w+)*\s*)\))/);
  let who = search.match(/who:(\w+|".+"|\((\s*\w+\s*(\s+OR\s+\w+)*\s*)\))/);
  let when = search.match(/when:(\w+|".+"|\((\s*\w+\s*(\s+OR\s+\w+)*\s*)\))/);
  let title = search.match(/title:(\w+|".+"|\((\s*\w+\s*(\s+OR\s+\w+)*\s*)\))/);
  let qf = [];
  let qftext = '';
  if(cache.imagecheck){ qf.push('"IMAGE"'); }
  if(cache.soundcheck){ qf.push('"SOUND"'); }
  if(cache.textcheck){ qf.push('"TEXT"'); }
  if(cache.videocheck){ qf.push('"VIDEO"'); }
  if(cache.threedcheck){ qf.push('"3D"'); }

  for(let i=0; i<qf.length; i++) {
    qftext += qf[i];
    if(i+1 != qf.length) {
      qftext += ' || ';
    }
  }

  let sparqlQuery = `
  PREFIX dc: <http://purl.org/dc/elements/1.1/>
  PREFIX edm: <http://www.europeana.eu/schemas/edm/>
  PREFIX ore: <http://www.openarchives.org/ore/terms/>
  SELECT DISTINCT ?Aggregation ?ProvidedCHO ?title ?type ?creator ?mediaURL ?date ?description ?view ?country
  WHERE {
    ?s edm:country ?country .
    ?Aggregation edm:aggregatedCHO ?ProvidedCHO ;
        edm:isShownBy ?mediaURL.
    ?Proxy ore:proxyFor ?ProvidedCHO ;
        dc:title ?title ;
        dc:date ?date ;
        dc:creator ?creator ;
        edm:type ?type .
    OPTIONAL { ?Proxy dc:description ?description }
  `;

  if ( where != null ) {
    where[1] = where[1].replace(/[()]/g, '');
    search = search.replace(where[0], '');
    where[1] = where[1].replace(/["]/g, '');
    let splitwhere = where[1].split(' OR ');
    let fullwhere =  "";
    for(let i=0; i<splitwhere.length; i++) {
      fullwhere += `.*${splitwhere[i]}.*`;
      if(i+1 != splitwhere.length) {
        fullwhere += '|';
      }
    }
    sparqlQuery += `FILTER regex(?country, "${fullwhere.replace(" ", ".*")}", "i")
    `
  }

  if(who != null) {
    who[1] = who[1].replace(/[()]/g, '');
    search = search.replace(who[0], '');
    who[1] = who[1].replace(/["]/g, '');
    let splitwho = who[1].split(' OR ');
    let fullwho =  "";
    for(let i=0; i<splitwho.length; i++) {
      fullwho += `.*${splitwho[i]}.*`;
      if(i+1 != splitwho.length) {
        fullwho += '|';
      }
    }
    sparqlQuery += `FILTER regex(?creator, "${fullwho.replace(" ", ".*")}", "i")
    `
  }

  if(when != null) {
    when[1] = when[1].replace(/[()]/g, '');
    search = search.replace(when[0], '');
    when[1] = when[1].replace(/["]/g, '');
    let splitwhen = when[1].split(' OR ');
    let fullwhen =  "";
    for(let i=0; i<splitwhen.length; i++) {
      fullwhen += `.*${splitwhen[i]}.*`;
      if(i+1 != splitwhen.length) {
        fullwhen += '|';
      }
    }
    sparqlQuery += `FILTER regex(?date, "${fullwhen.replace(" ", ".*")}", "i")
    `
  }

  if(title != null) {
    title[1] = title[1].replace(/[()]/g, '');
    search = search.replace(title[0], '');
    title[1] = title[1].replace(/["]/g, '');
    let splittitle = title[1].split(' OR ');
    let fulltitle =  "";
    for(let i=0; i<splittitle.length; i++) {
      fulltitle += `.*${splittitle[i]}.*`;
      if(i+1 != splittitle.length) {
        fulltitle += '|';
      }
    }
    sparqlQuery += `FILTER regex(?title, "${fulltitle.replace(" ", ".*")}", "i")
    `
  } else {
    sparqlQuery += `FILTER regex(?title, ".*${search.replace(" ", ".*")}.*", "i")
    `
  }

  sparqlQuery += `FILTER(STR(?type) = ${qftext})

    ORDER BY DESC(?title)   

  }`

  const url = `http://localhost:7200/repositories/Europeana?query=${encodeURIComponent(sparqlQuery)}&queryLn=sparql&infer=false&limit=30&offset=${offset}`;

  return url;
}

function query(search, pag, page, limit, cache) {

  try {document.getElementById("pagnav").remove();} catch {}
  try {document.getElementsByClassName("jumbotron")[0].remove();} catch {}
  let container = document.getElementById("results");
  let fullUrl = "";
  container.innerHTML = "";

  if (cache.mode) {
    fullUrl = databaseAdding(search, (page-1)*limit, cache);
  }
  else {
    fullUrl = `/app/europeana/search?search=${search}&img=${cache.imagecheck}&snd=${cache.soundcheck}&txt=${cache.textcheck}&vdo=${cache.videocheck}&threed=${cache.threedcheck}&page=${page}&limit=${limit}`;
  }

  const headers = { 'Accept': 'application/sparql-results+json' };

  fetch(fullUrl, { headers , method: "GET" }).then(body => body.json()).then(data => {

    let media = "";
    let desc = "";
    let desc_in_language = "";
    let title = "";
    let title_short = "";
    let title_in_language = "";

    let provider    = '';
    let copyrights  = '';
    let source      = '';
    let year        = '';
    let place       = '';
    let map         = '';
    let description_detail = '';

    let ProvidedCHO = "";
    let modalnum = 0;
    let itemlist = null;
    let count = null;
    let idx = 0;

    let creators    = [];
    let creators_html = '';

    itemlist = cache.mode ? data.results.bindings : data.items;
    count = cache.mode ? itemlist.length : data.totalResults;
    count = (count<999) ? count : 959;

    if ( count === 0 ) {
      document.getElementById("cont").innerHTML += jbtnone;
      return false;
    }
    else {

      $('#result-count').text( count );

    }

    let gallery = ` <div class="container">
      <!-- heading text -->
      <ul class="image-gallery">
    `;

    itemlist.forEach( element => {

      //console.log( 'element: ', element );

      ProvidedCHO = element.guid;

      title = element.title.join('; ').replace( '"', '' );

      if ( valid( element.dcTitleLangAware ) ){
        if ( valid( element.dcTitleLangAware[ window.language ] ) ){
        
          // replace with correct language version
          title = element.dcTitleLangAware[ window.language ][0];

        }
      }

      title       = title.toString().replace('"', '' );
      title_short = title.substr(0, 60);

      try { desc = element.dcDescription[0]; } catch {desc = '';}

      if ( valid( element.dcDescriptionLangAware ) ){
        if ( valid( element.dcDescriptionLangAware[ window.language ] ) ){
        
          // replace with correct language version
          desc = element.dcDescriptionLangAware[ window.language ];

        }
      }

      desc = desc.toString().replace(/"/g, '');

      if ( title === desc ){
        desc = ''; // same as title, so dont show
      }

      if ( valid( element.edmPlaceLabelLangAware ) ){
        if ( valid( element.edmPlaceLabelLangAware[ window.language ] ) ){
        
          // replace with correct language version
          place = element.edmPlaceLabelLangAware[ window.language ][0];

        }
      }

      if ( valid( element.year ) ){
        desc += ` (${ valid( place )? place + ', ' : ''}${ element.year[0] })`;
      }
      else if ( valid( place ) ){
        desc += ` (${place})`;
      }

      //console.log( desc );

      if ( valid( element.dcCreator ) ){

        element.dcCreator.forEach( ( c ) => { 

          if ( ! c.startsWith('http') && ! ( c.indexOf('/') > -1 ) ){ // plain author string

            if ( c.indexOf(',') > -1 ){ // name with a comma

              c =  c.split(',')[1] + ' ' + c.split(',')[0]; // flip name

            }

            creators.push( c );
            //console.log( c );

          }

        })


      }

      //console.log( idx, creators );

      /*
      creators.forEach( ( c ) => {
    
        c = c.toString().replace(/"/g, '');

        c = ` <a href="javascript:void(0)" onclick=goExplore(&quot;${ encodeURIComponent(c) }&quot;,false) onauxclick=goExplore(&quot;${ encodeURIComponent(c) }&quot;,true)><span class="item-creator" title="creator">${c}</span></a>, &nbsp;`;

        //creators_html += c;

      });
      */

      if ( creators.length > 0 ){

        const c = creators[0].toString().replace(/"/g, '');
        const c_short = c.substr(0, 40);

        creators_html = `<br><a href="javascript:void(0)" onclick=goExplore(&quot;${ encodeURIComponent(c) }&quot;,false) onauxclick=goExplore(&quot;${ encodeURIComponent(c) }&quot;,true)><span class="item-creator" title="Creator: ${c}">${c_short}</span></a>`;
      }

      //desc += `&nbsp;&nbsp;<a target="blank_" href="">source</a>`;

      let css_class = '';
      let url       = '';
      let image     = '';
      let fallback  = '';
      let target    = '';
      let play_widget = '';
      let is_video  = false;

      if ( element.type === 'IMAGE' ){

        url       = ( valid( element.edmIsShownBy )? element.edmIsShownBy[0] : '' );
        //url     = '/app/cors/raw/?url=' + element.edmIsShownBy[0];

        css_class = 'enlargable';
        fallback  = ( valid( element.edmPreview )? element.edmPreview[0] : '' );

        image     = ( valid( element.edmIsShownBy )? element.edmIsShownBy[0] : '' );

        // replace HTTP-image-cases with a HTTPs-edmPreview URL
        if ( image.startsWith('http:') && valid( element.edmPreview ) ){

          if ( element.edmPreview[0].startsWith('https:' ) ){

            image = element.edmPreview;

          }

        }

        //image   = `https://api.europeana.eu/thumbnail/v2/url.json?type=${element.type}&size=w1200&uri=${element.edmIsShownBy[0]}`;

      }
      else if ( element.type === 'TEXT' ){

        url       = ( valid( element.edmIsShownBy )? element.edmIsShownBy[0] : '' );
        css_class = 'no-enlarge text';
        image     = ( valid( element.edmPreview )? element.edmPreview[0] : '' );
        target    = '_blank';

      }
      else if ( element.type === 'SOUND' ){

        const audio_url = ( valid( element.edmIsShownBy )? element.edmIsShownBy[0] : '' );

        url       = ( valid( element.edmIsShownAt )? element.edmIsShownAt[0] : '' );
        css_class = 'no-enlarge sound';
        image     = ( valid( element.edmPreview )? element.edmPreview[0] : '' );
        target    = '_blank';

        if ( audio_url.endsWith('.mp3') ){
          play_widget = `<audio src="${audio_url}" type="audio/mpeg" preload="none" controls></audio>`;
        }
        else if ( url.endsWith('.ogg') ){
          play_widget = `<audio src="${audio_url}" type="audio/ogg" preload="none" controls></audio>`;
        }
        else if ( url.endsWith('.flac') ){
          play_widget = `<audio src="${audio_url}" type="audio/flac" preload="none" controls></audio>`;
        }

      }
      else if ( element.type === 'VIDEO' ){

        url       = ( valid( element.edmIsShownBy )? element.edmIsShownBy[0] : '' );
        css_class = 'no-enlarge video';
        image     = ( valid( element.edmPreview )? element.edmPreview[0] : '' );
        target    = '_blank';

        /*
        if ( url.endsWith('.mp4') || url.endsWith('.mpg') || url.endsWith('.avi') || url.endsWith('.ogv') ){
          play_widget = `<video src="/app/cors/raw/?url=${url}" poster="${image}" controls></video>`;
          is_video = true;
        }
        */

        if ( url.endsWith('.mp4') || url.endsWith('.mpg') || url.endsWith('.avi') ){
          play_widget = `<video src="${url}" poster="${image}" type="video/mp4" preload="none" controls></video>`;
          is_video = true;
        }
        else if ( url.endsWith('.webm') ){
          play_widget = `<video src="${url}" poster="${image}" type="video/webm" preload="none" controls></video>`;
          is_video = true;
        }
        else if ( url.endsWith('.ogv') || url.endsWith('.ogm') || url.endsWith('.ogg') ){
          play_widget = `<video src="${url}" poster="${image}" type="video/ogg" preload="none" controls></video>`;
          is_video = true;
        }
        else if ( url.endsWith('.mpd') ){ // Dash-video
          console.log('TODO: implement .mpd Dash video support'); // see: https://github.com/Dash-Industry-Forum/dash.js
        }

      }
      else if ( element.type === '3D' ){

        url       = ( valid( element.edmIsShownBy )? element.edmIsShownBy[0] : '' );
        //url       = ( valid( element.edmIsShownAt )? element.edmIsShownAt[0] : '' );
        css_class = 'no-enlarge 3d';
        image     = ( valid( element.edmPreview )? element.edmPreview[0] : '' );
        target    = '_blank';

      }
      else {

        css_class = 'no-enlarge other';
        image     = '';

      }

      if ( valid( element.dcDescription ) ){
        description_detail = `<details class="detail-inline"><summary></summary>${ element.dcDescription[0] }</details>`;
      }

      if ( valid( element.year ) ){
        year = `<span class="item-year">${ element.year[0] }</span>`;
      }

      if ( valid( element.edmPlaceLatitude ) ){

        let map_url = `/app/map/?l=${window.language}&bbox=${getBoundingBox(element.edmPlaceLongitude[0], element.edmPlaceLatitude[0], 0.05 )}&lat=${element.edmPlaceLatitude[0]}&lon=${element.edmPlaceLongitude[0]}&title=${ encodeURIComponent( title )}`;

        map = `<a class="item-map" title="location map" target="_blank" href="${ map_url }">&#9737;</a>`;
      }

      if ( valid( element.edmIsShownAt ) ){
        source = `<a class="item-source" title="source link" target="_blank" href="${ element.edmIsShownAt[0] }">&#9432;</a>`;
      }

      if ( valid( element.dataProvider ) ) {

        let p = element.dataProvider[0].toString().replace(/"/g, '');
        let p_short = p.substr(0, 40);

        provider = `<a href="javascript:void(0)" onclick=goExplore(&quot;${ encodeURIComponent(p) }&quot;,false) onauxclick=goExplore(&quot;${ encodeURIComponent(p) }&quot;,true)><span class="item-provider" title="Data provider: ${p}">${p_short}</span></a>`;

      }
      else if ( valid( element.provider ) ) {

        let p = element.provider[0].toString().replace(/"/g, '');
        let p_short = p.substr(0, 40);

        provider = `<a href="javascript:void(0)" onclick=goExplore(&quot;${ encodeURIComponent(p) }&quot;,false) onauxclick=goExplore(&quot;${ encodeURIComponent(p) }&quot;,true)><span class="item-provider" title="Data provider: ${p} ">${p_short}</span></a>`;
        //provider = `<span class="item-provider" title="data provider">${ element.provider[0] }</span>`;
      }

      if ( valid( element.rights ) ){

        copyrights = `<span class="item-copyright" title="Copyrights"><a target="_blank" href="${ element.rights[0] }">©</a></span>`;
      }

      if ( valid( element.year ) ){
        year = `<span class="item-year" title="Creation year">(${ valid( place )? place + ', ' : ''}${ element.year[0] })</span>`;
      }

      if ( is_video ){

          media = `${play_widget} <div class="item-info"><span class="item-title" title="Title: ${title}">${title_short} ${year}</span><span class="item-creators">${creators_html}</span><br/><span class="item-legal">[ ${provider} ${source} ${map} ${copyrights} ]</span></div>`;

      }
      else { // any other content with an image-thumbnail

        media = `<a title="${title}" class="elem ${element.type.toLowerCase()}" target="${target}" href="${ url }" tabindex="0" data-lcl-txt="${desc}"> <img class="thumbimage ${css_class}" src="${image}" data-index="${idx}" data-fallback="${fallback}" onError="window.setFallback( ${idx}, &quot;${fallback}&quot;)" style="max-width: 100%;max-height: 100%;" alt=""/ decoding="sync" loading="lazy"> </a> ${play_widget} <div class="item-info"><span class="item-title" title="Title: ${title}">${title_short} ${year} ${description_detail}</span><span class="item-creators">${creators_html}</span><br/><span class="item-legal">[ ${provider} ${source} ${map} ${copyrights} ]</span></div>`;

      }

      modalnum += 1;

      gallery += `
        <li>${media}</li>
      `

      idx += 1;

    });

    gallery += `
        </ul>
      </div> 
    `

    container.innerHTML += gallery;

    if (cache.mode) {

      let paginations = `<nav id="pagnav">
          <ul class="pagination justify-content-center">
      `  
      if ( page > 1) {
        paginations += `<li class="page-item">
        <a class="page-link prev" href="#">Previous</a>
        </li>`
      }
      else {
        paginations += `<li class="page-item disabled">
        <a class="page-link prev" href="#"><i class="fa-solid fa-left-long"></i></a>
        </li>`
      }
      paginations += `<li class="page-item" disabled><a class="page-link" href="#">${page}</a></li>`

      if (count >= limit) {
        paginations +=`<li class="page-item">
        <a class="page-link nex" href="#"><i class="fa-solid fa-right-long"></i></a>
        </li>`
      }
      else {
        paginations +=`<li class="page-item disabled">
        <a class="page-link nex" href="#"><i class="fa-solid fa-right-long"></i></a>
        </li>`
      }
      paginations +=`</ul>
      </nav>`
      pag.innerHTML = paginations;

      document.getElementsByClassName('prev')[0].addEventListener("click", function() {
        query(search, pag, page-1, limit, cache );
      });

      document.getElementsByClassName('nex')[0].addEventListener("click", function() {
        query(search, pag, page+1, limit, cache );
      });

  }
  else { 

      if (count > limit) {

        let paginations = `<nav id="pagnav">
          <ul class="pagination justify-content-center">
  `
        let startpage = (page < 3) ? 1 : page - 2;
        let endpage = startpage + 4;
        let totalpage = Math.ceil(count/limit);
        endpage = (totalpage < endpage) ? totalpage : endpage;
        let diff = startpage - endpage + 4;
        startpage -= (startpage - diff > 0) ? diff : 0;
        if (startpage <= 0) {
            endpage -= (startpage - 1);
            startpage = 1;
        }
            
        if (endpage > count) {
          endpage = count;
        }
        if (page > 1) {
          paginations += `<li class="page-item">
          <a class="page-link prev" href="#"><i class="fa-solid fa-left-long"></i></a>
        </li>`
        } else {
          paginations += `<li class="page-item disabled">
          <a class="page-link prev" href="#"><i class="fa-solid fa-left-long"></i></a>
          </li>`
        }

        if( page > 3) {
          paginations += `<li class="page-item"><a class="page-link num" href="#">1</a></li>
          <li class="page-item disabled">...</li>`
        }

        for( let i=startpage; i<=endpage; i++ ){
          paginations += (i === page) ? `<li class="page-item active"><a class="page-link num" href="#">${i}</a></li>` : `<li class="page-item"><a class="page-link num" href="#">${i}</a></li>`
        }

        if( page < totalpage - 3) {
          paginations += `<li class="page-item disabled">...</li>
          <li class="page-item"><a class="page-link num" href="#">${totalpage}</a></li>`
        }

        if (page < totalpage) {
          paginations +=`<li class="page-item">
          <a class="page-link nex" href="#"><i class="fa-solid fa-right-long"></i></a>
        </li>`
        } else {
          paginations +=`<li class="page-item disabled">
          <a class="page-link nex" href="#"><i class="fa-solid fa-right-long"></i></a>
        </li>`
        }
            
        paginations +=`</ul>
        </nav>`
        pag.innerHTML = paginations;

        let e = document.getElementsByClassName('num');

        for (var i = 0, len = e.length; i < len; i++) {
          e[i].addEventListener("click", function() {
            query(search, pag, parseInt(this.textContent), limit, cache)
          });
        }

        document.getElementsByClassName('prev')[0].addEventListener("click", function() {
          query(search, pag, page-1, limit, cache )
        });

        document.getElementsByClassName('nex')[0].addEventListener("click", function() {
          query(search, pag, page+1, limit, cache )
        });

      }
    }

    $('#openseadragon').remove();

    $('body').append('<div id="openseadragon" style="display:none; width: 100vw; height: 100vh;"><img id="loader-openseadragon" class="no-enlarge" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 999999; width: 100px; height: 100px;" alt="loading" src="/app/explore2/assets/images/loading.gif"/></div>');

    window.setupImageClicks();
    window.setupImageZoom();

  });

}

document.getElementById('searchbtn').onclick = function () {

  document.getElementById("bef-click").setAttribute("hidden", true);
  document.getElementById("aft-click").removeAttribute("hidden");

  let pag = document.getElementById('pagination-container');
  let fullUrl = ""
  let search = document.getElementById('searchbox').value;

  // set page info
  document.title = `Conzept Europeana: ${search}`;
  $('#result-count').text( '-' );

  setParameter( 'q', search, '' );

  const cache = {
    mode : document.getElementById('local').checked ,
    imagecheck : document.getElementById('images').checked ,
    soundcheck : document.getElementById('sounds').checked ,
    textcheck : document.getElementById('texts').checked ,
    videocheck : document.getElementById('videos').checked ,
    threedcheck : document.getElementById('3ds').checked
  }
  
  query(search, pag, 1, 30, cache );

  document.getElementById("aft-click").setAttribute("hidden", true);
  document.getElementById("bef-click").removeAttribute("hidden"); 

  return false;

};

var elem = document.querySelector('.grid');

/*
var msnry = new Masonry( elem, {
  // options
  itemSelector: '.grid-item',
  columnWidth: 200
});
*/

// element argument can be a selector string
//   for an individual element
//var msnry = new Masonry( '.grid', {
  // options
//});

// CONZEPT PATCH
//let app = {};

window.addEventListener('DOMContentLoaded', (event) => {

  window.query    = getParameterByName('q') || '';
  window.language = getParameterByName('l') || 'en';
  window.types    = getParameterByName('t') || [];
  //window.sort     = getParameterByName('s') || 'score';
  //window.page     = getParameterByName('p') || 1;

  if ( typeof window.types === 'string' ){
    window.types    = window.types.split(',');
  }

  $('input#images' ).prop('checked', false);
  $('input#sounds' ).prop('checked', false);
  $('input#texts' ).prop('checked', false);
  $('input#videos' ).prop('checked', false);
  $('input#3ds' ).prop('checked', false);

  window.types.forEach( ( t ) => { 

    $('input#' + t ).prop('checked', true);

  })

  $('#searchbox').val( window.query );

  submitQuery();

  $(document).on('change', 'input#images', function() {
    if ( $('input#images' ).prop('checked') ){ window.types.push('images'); }
    else { window.types = window.types.filter(e => e !== 'images'); }
    setParameter( 't', window.types.toString(), '' );
    window.submitQuery();
  });

  $(document).on('change', 'input#sounds', function() {
    if ( $('input#sounds' ).prop('checked') ){ window.types.push('sounds'); }
    else { window.types = window.types.filter(e => e !== 'sounds'); }
    setParameter( 't', window.types.toString(), '' );
    window.submitQuery();
  });

  $(document).on('change', 'input#texts', function() {
    if ( $('input#texts' ).prop('checked') ){ window.types.push('texts'); }
    else { window.types = window.types.filter(e => e !== 'texts'); }
    setParameter( 't', window.types.toString(), '' );
    window.submitQuery();
  });

  $(document).on('change', 'input#videos', function() {
    if ( $('input#videos' ).prop('checked') ){ window.types.push('videos'); }
    else { window.types = window.types.filter(e => e !== 'videos'); }
    setParameter( 't', window.types.toString(), '' );
    window.submitQuery();
  });

  $(document).on('change', 'input#3ds', function() {
    if ( $('input#3ds' ).prop('checked') ){ window.types.push('3ds'); }
    else { window.types = window.types.filter(e => e !== '3ds'); }
    setParameter( 't', window.types.toString(), '' );
    window.submitQuery();
  });

});

window.submitQuery = function(){

  if ( valid( window.query ) ){

    $('#searchbtn').click();

  }

}

window.setupImageClicks = function(){

  $('img')
    .not('.no-enlarge')
    .attr('loading', 'lazy')
    .addClass('enlargable');

  // see: https://lcweb.it/lc-lightbox/documentation
  const LC = lc_lightbox('.elem.image', {
    wrap_class: 'lcl_fade_oc',
    gallery : true,
    thumb_attr: false, // 'data-lcl-thumb', 
    tn_hidden: true,
    thumbs_nav: true,
    download: true,
    skin: 'minimal',
    counter: true,
    touchswipe: true,
    //fullscreen: false,
    //fs_only: true,
  });

}

window.setupImageZoom = function(){ // using OpenSeaDragon

  // see: https://openseadragon.github.io/docs/
  $('#openseadragon').hide;

  window.viewer = OpenSeadragon({

    id: "openseadragon",

    prefixUrl: '/app/explore2/node_modules/openseadragon/build/openseadragon/images/',

    tileSources: {
      type: 'image',
      url:  '/app/explore2/assets/images/icon_home.png',
      crossOriginPolicy: 'Anonymous',
      ajaxWithCredentials: false,
      //maxZoomLevel: 10,
      //maxZoomPixelRatio: 2,
      //visibilityRatio: 0.2,
    },

    showNavigator:  true,
    navigatorSizeRatio: 0.25,

  });

  window.viewer.world.addHandler('add-item', function(event) {

    let tiledImage = event.item;

    tiledImage.addHandler('fully-loaded-change', fullyLoadedHandler);

    window.viewer.navigator.addTiledImage( {
     tileSource: tiledImage,
    });

  });

  window.viewer.setVisible(true);

}

window.fullyLoadedHandler = function() {

  $('#loader-openseadragon').hide();

}

window.setFallback = function( index, url ){

  let sel = `img[data-index=${index}]`;

  $(sel).attr( 'src', url ).parent().attr( 'href', url );;

}

window.goExplore = function( title, newtab ){

  if ( newtab ){

    let url = `https://conze.pt/explore/${title}?l=${window.language}&t=explore`;

    openInNewTab( url );

  }
  else {

    let parentref;

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

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'explore', title: title, hash: '', language: window.language } }, '*' );

  }

}
