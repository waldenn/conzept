// TODO:
//   - add qid-based datastructure
//   - add the itemLabel to that structure and show it to the user (title hover?)

let   LIMIT       = 10; // default page size, override with param: "&pagesize=5"
const IMG_WIDTH   = '800';
const USER_AGENT  = 'View-it!';
const ORIGIN      = '*';

let lang				= '';
let numResults	= 0;
let offset			= 0;
let qNum				= '';
let title				= '';
let sparql_url	= '';

// keyboard control
$(document).keydown(function(event) {

  let key = (event.keyCode ? event.keyCode : event.which);

  //console.log( event, key );

  if (key == '70') { // "f"

    if ($('textarea, input, select').is(':focus')) {
      // do nothing
    } else {
      document.toggleFullscreen();
    }

  }

});

function isInt(value) {
  return !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !isNaN(parseInt(value, 10));
}

function startSearch() {

  hideError();

  // gather window and URL params
  var url = new URL(window.location.href);

  qNum        = url.searchParams.get('q');
  lang        = url.searchParams.get('l') || 'en';

  // new SPARQL-related fields
  title       = url.searchParams.get('t') || '';
  sparql_url  = url.searchParams.get("url") || '';
  pagesize    = url.searchParams.get('pagesize') || '';

  if ( valid( title) ){

    $('body').prepend( `<div id="custom-title"> <span id="imagesDepicting"><span id="topic-title">${title}</span> &nbsp;` );

  }

  if ( valid( pagesize ) ){

    LIMIT = parseInt( pagesize );

  }

  if ( valid( sparql_url ) ) {

    // add SORT-direction parameter: DESC (default) or ASC
    //  --> modify sparql_url

    // get total amount of hits
  
    // remove any LIMIT condition
    let sparql_count_url = sparql_url.replace(/LIMIT%20[0-9]+/, '');

    // create a COUNT url
    sparql_count_url = sparql_url.replace(/DISTINCT(.*)WHERE/g, '%20%28COUNT%28%3Fitem%29+AS+%3Fcount%29%20');

    //console.log( 'sparql count url: ', sparql_count_url );

    $.ajax({

      url: sparql_count_url,

      dataType: "json",

      success: function( r ) {

        if ( valid( r.results?.bindings[0]?.count?.value ) ){

          numResults = parseInt( r.results.bindings[0].count.value );

          if ( numResults === 0 ){ // no results found
            
            $('#loader').hide();

            $('#custom-title').after('<div style="text-align:center;">0 results found</div>');

          }
          else {

            getImages();
            setupImageClicks();
            setupImageZoom();

          }

        }
        else { // error

          console.log('error fetching SPARQL count: ', sparql_count_url );

          $('#custom-title').after('<div style="text-align:center;">0 results found</div>');

          return 1;

        }

      }

    });

  }
  else {

    console.log('no SPARQL or Qid query-data specified');

  }

}

function displayError(error) {
  document.getElementById('error').style.display = 'block';
  document.getElementById('error').innerHTML = error;
}

function hideError() {
  document.getElementById('error').style.display = 'none';
}

function getImages() {

  let image_qids = [];

  // check if a LIMIT condition needs to be added or modified
  const r1 = /LIMIT%20\d+/;

  if ( valid( sparql_url.match( r1 ) ) ){ // modify existing LIMIT

    sparql_url = sparql_url.replace(/LIMIT%20[0-9]*/g, `LIMIT%20${LIMIT}`);

  }
  else { // add a LIMIT

    sparql_url = sparql_url + '%0ALIMIT%20' + LIMIT;

  }

  // check if an OFFSET condition needs to be added or modified
  const r2 = /OFFSET%20\d+/;

  if ( valid( sparql_url.match( r2 ) ) ){ // modify existing OFFSET

    sparql_url = sparql_url.replace(/OFFSET%20[0-9]*/g, `OFFSET%20${offset}`);

  }
  else { // add an OFFSET

    sparql_url = sparql_url + '%0AOFFSET%20' + offset;

  }

  // modify URL OFFSET

  //console.log( url );

  // Query Commons API for image titles
  fetch( sparql_url, {
    method: 'GET',
    //headers: new Headers({ 'Api-User-Agent': USER_AGENT })
  }).then((response) => response.json())
    .then((data) => {

      const resultsHeaderResults = document.getElementById('numResults');

      resultsHeaderResults.innerHTML = numResults.toLocaleString();

      if (numResults > 0){ // results found

        // built pipe-separated string of image titles
        let imageTitlesArray = [];

        returnedImages = data.results.bindings;

        for (let i = 0; i < returnedImages.length; i++) {

          if ( valid( returnedImages[i].image?.value ) ){

            imageTitlesArray.push('File:' + returnedImages[i].image.value.split('/').pop() );

            if ( valid( returnedImages[i].item?.value ) ){ // store the Wikidata Qid

              image_qids.push( returnedImages[i].item.value.split('/').pop() );

            }

          }

        }

        const imageTitlesStr = decodeURIComponent( imageTitlesArray.join('|').replace(/%20/g, '_') );

        // fetch thumbnails
        const fetchThumbnailsURL = new URL("https://commons.wikimedia.org/w/api.php")

        fetchThumbnailsURL.searchParams.append("action", "query");
        fetchThumbnailsURL.searchParams.append("format", "json");
        fetchThumbnailsURL.searchParams.append("iiprop", "url");
        fetchThumbnailsURL.searchParams.append("iiurlwidth", IMG_WIDTH);
        fetchThumbnailsURL.searchParams.append("origin", ORIGIN);
        fetchThumbnailsURL.searchParams.append("prop", "imageinfo");
        fetchThumbnailsURL.searchParams.append("titles", imageTitlesStr);

        //console.log( fetchThumbnailsURL );

        fetch(fetchThumbnailsURL, {
          method: 'GET',
          headers: new Headers({ 'Api-User-Agent': USER_AGENT })
        }).then((response) => response.json())

          .then( (data) => {

            // remove pagination button, if it exists
            const existingPaginationButton = document.getElementById('paginationButton');

            if (existingPaginationButton) {
              existingPaginationButton.remove();
            }

            // Output images
            const resultsElement = document.getElementById('results');
            resultsElement.style.display = 'block';

            var pages = data['query']['pages'];
            let images = [];

            var j = 0;

            for (const image in pages) {

              if ( valid( pages[image] ) ){

                //console.log( image_qids[ j ] );

                images.push({
                  'name': pages[image]['title'].replace('File:', ''),
                  'thumb': pages[image]['imageinfo']['0']['thumburl'],
                  'width': pages[image]['imageinfo']['0']['thumbwidth'],
                  'height': pages[image]['imageinfo']['0']['thumbheight'],
                  'page': pages[image]['imageinfo']['0']['descriptionurl'],
                  'qid': image_qids[ j ],
                });

              }

              j++;

            }

            // Display images on DOM
            for (var i = 0; i < images.length; i++) {

              // CONZEPT PATCH START
              let img_elem = $('<img>', {
                class: 'thumbimage enlargable',
                src : images[i].thumb,
                //srcset : images[i].thumb,
                decoding : "async",
                loading: "lazy"
              });

              let txt = images[i]['name'].split('.').slice(0, -1).join('.')

              let article_url = `/explore/?l=${lang}&t=wikipedia-qid&i=${ images[i].qid }&s=true#`;

              let caption = txt + '&nbsp;&nbsp;<a target="_blank" href="' + article_url + '"><i class="fa-solid fa-circle-info"></i></a>&nbsp;&nbsp;(<u><a target="blank_" href="' + images[i].page + '">source</a></u>)';

              //let caption = txt + '&nbsp;&nbsp;<a href="javascript:void(0)" onclick=goExplore(&quot;' + encodeURIComponent( txt ) + '&quot;,false) onauxclick=goExplore(&quot;' + encodeURIComponent( txt ) + '&quot;,true)><i class="fa-solid fa-retweet"></i></a>&nbsp;&nbsp;(<u><a target="blank_" href="' + images[i].page + '">source</a></u>)';

              let a_elem = $('<a>', {
                class: 'elem',
                href : images[i].thumb,
                tabindex : "0",
              }).attr( {
                 'data-qid'     : images[i].qid,
                 'data-lcl-txt' : caption,
              } );

              a_elem.append( img_elem );

              var counter = 1;

              img_elem[0].addEventListener("load", function () {

                counter++

                if ( counter === LIMIT ){

                  delay(2000).then( () => toggleSentinel() );

                }

              });

              $('#results').append( a_elem );

            }

            $('#loader').hide();

      });
    }

  });
}

function toggleSentinel(){

  //console.log( numResults, LIMIT, offset );

  // create a new pagination-sentinel if needed
  if (numResults > (offset + LIMIT )) {

    const paginationButton      = document.createElement('button');

    paginationButton.id         = 'paginationButton';
    paginationButton.title      = 'load more images';
    paginationButton.innerHTML  = '<i title="load more images" class="fa-solid fa-circle-plus"></i>';

    const resultsElement = document.getElementById('results');
    resultsElement.appendChild(paginationButton);

    $('#paginationButton').show();

    setupInfiniteScroll();

  }
  else { // done

    //console.log('no more images');

    $('#paginationButton').hide();
    $('#loader').hide();

  }

}

function loadNextPage(){

	$('#paginationButton').hide();
  $('#loader').show();

  //console.log( offset > LIMIT )

  offset += LIMIT;

  if ( offset >= LIMIT ){

    getImages();

  }

}

async function setupInfiniteScroll(){

  const sentinel = document.querySelector('#paginationButton'); // intersection-observer sensor

  // see: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
  let intersectionObserver = new IntersectionObserver( entries => {

    if ( entries[0].intersectionRatio <= 0 ) { // sentinel out of view
      return;
    }

    loadNextPage(); // load in more results (if any)

  });

  intersectionObserver.observe( sentinel );

}


function goExplore( title, newtab ){

  if ( newtab ){

    let url = `//explore/${title}?l=${lang}&t=explore`;

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

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'explore', title: title, hash: '', language: lang } }, '*' );

  }

}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

window.onload = startSearch;
