const IMG_WIDTH = '800';
const IMG_HEIGHT = '600';
const NUM_RESULTS = 19;
const USER_AGENT = 'View-it! [In Development] (https://view-it.toolforge.org/)';
const ORIGIN = '*';

// CONZEPT PATCH
let lang				= '';
let numResults	= 0;
let offset			= 0;
let qNum				= '';

// CONZEPT PATCH
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

function searchFromTextbox() {
  qNum = document.getElementById('qNumberInput').value;
  //window.location.href = SITE_URL + '?q=' + qNum;
}

function startSearch() {
  hideError();

  // Gather window and URL params
  var url = new URL(window.location.href);
  qNum = url.searchParams.get("q");
  lang = url.searchParams.get("l") || 'en'; // CONZEPT PATCH
  var returnTo = url.searchParams.get("returnTo");

  if (qNum) {
    qNum = qNum.toUpperCase();
    document.getElementById('qNumberInput').value = qNum;
    if (isInt(qNum)) {
      qNum = 'Q' + qNum;
    }
    if (qNum.substring(0, 1) === 'Q' && isInt(qNum.substring(1))) {
      generateHeader(qNum, returnTo);

      getImages(qNum, offset);

      setupImageClicks();
      setupImageZoom();

    } else {
      displayError(qNum + ' is not a valid Q-number.')
    }
  }
}

function displayError(error) {
  document.getElementById('error').style.display = 'block';
  document.getElementById('error').innerHTML = error;
}

function hideError() {
  document.getElementById('error').style.display = 'none';
}

function generateHeader(qNum, returnTo) {
  if (qNum && isInt(qNum.substring(1))) {
    document.getElementById('results').style.display = 'block';

    // Adjust results header
    var resultsHeaderLink = document.getElementById('resultsHeaderLink');
    resultsHeaderLink.href = 'https://www.wikidata.org/wiki/' + qNum;
    resultsHeaderLink.innerHTML = qNum;

    // Get Q-number details
    fetch('https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + qNum + '&props=labels&languages=' + lang + '|en&format=json&origin=' + ORIGIN, { // CONZEPT PATCH
      method: 'GET',
      headers: new Headers({
        'Api-User-Agent': USER_AGENT
      })
    }).then((response) => response.json())
      .then((data) => {
        const label = data['entities']['' + qNum]['labels'][lang]['value']; // CONZEPT PATCH
        const resultsHeader = document.getElementById('imagesDepicting');

        // CONZEPT PATCH
        resultsHeader.innerHTML =
          `<span id="topic-title">${label}</span> &nbsp;
            <span id="topic-link">(
              <a href="javascript:void(0)" title="explore topic" onclick=goExplore(&quot;${ encodeURIComponent( label ) }&quot;,false) onauxclick=goExplore(&quot;${ encodeURIComponent( label )}&quot;,true)><i class="fa-solid fa-retweet"></i></a>
              <a href="https://www.wikidata.org/wiki/${qNum}" target="_blank">${qNum}</a>
            )
          </span>`;

        //resultsHeader.innerHTML = '<a href="https://www.wikidata.org/wiki/' + qNum + '" target="_blank">' + qNum + '</a> (' + label + ')';

      })
      .catch( function () {
        console.log("Promise Rejected");
      });

    // Show "back to article" button
    if (returnTo) {
      var returnToLink = document.getElementById('returnToLink');
      returnToLink.href = returnTo;
      returnToLink.style.display = 'block';
    }
  }
}

function getImages(qNum, offset) {

  // Query Commons API for image titles
  const fetchImagesURL = new URL("https://commons.wikimedia.org/w/api.php");
  fetchImagesURL.searchParams.append("action", "query");
  fetchImagesURL.searchParams.append("cirrusDumpResult", "true");
  fetchImagesURL.searchParams.append("format", "json");
  fetchImagesURL.searchParams.append("generator", "search");
  fetchImagesURL.searchParams.append("gsrlimit", NUM_RESULTS);
  fetchImagesURL.searchParams.append("gsrnamespace", "6");
  fetchImagesURL.searchParams.append("gsroffset", offset);
  fetchImagesURL.searchParams.append("gsrsearch", "filetype:bitmap|drawing -fileres:0 custommatch:depicts_or_linked_from=" + qNum);
  fetchImagesURL.searchParams.append("origin", ORIGIN);
  fetch(fetchImagesURL, {
    method: 'GET',
    headers: new Headers({
      'Api-User-Agent': USER_AGENT
    })
  }).then((response) => response.json())
    .then((data) => {
      // Store number of results:
      numResults = data['__main__']['result']['hits']['total']['value'];

      // Show number of results on DOM:
      const resultsHeaderResults = document.getElementById('numResults');
      resultsHeaderResults.innerHTML = numResults.toLocaleString();

      // Check if no results
      if (numResults > 0) {
        // Built pipe-separated string of image titles
        var imageTitlesArray = [];
        returnedImages = data['__main__']['result']['hits']['hits'];
        for (var i = 0; i < returnedImages.length; i++) {
          imageTitlesArray.push('File:' + returnedImages[i]['_source']['title']);
        }
        var imageTitlesStr = imageTitlesArray.join('|').replace(/ /g, "_");

        // Fetch thumbnails
        const fetchThumbnailsURL = new URL("https://commons.wikimedia.org/w/api.php")
        fetchThumbnailsURL.searchParams.append("action", "query");
        fetchThumbnailsURL.searchParams.append("format", "json");
        fetchThumbnailsURL.searchParams.append("iiprop", "url");
        fetchThumbnailsURL.searchParams.append("iiurlwidth", IMG_WIDTH);
        fetchThumbnailsURL.searchParams.append("origin", ORIGIN);
        fetchThumbnailsURL.searchParams.append("prop", "imageinfo");
        fetchThumbnailsURL.searchParams.append("titles", imageTitlesStr);

        fetch(fetchThumbnailsURL, {
          method: 'GET',
          headers: new Headers({
            'Api-User-Agent': USER_AGENT
          })
        }).then((response) => response.json())
          .then((data) => {
            // Remove pagination button, if it exists
            const existingPaginationButton = document.getElementById('paginationButton');
            if (existingPaginationButton) {
              existingPaginationButton.remove();
            }

            // Output images
            const resultsElement = document.getElementById('results');
            resultsElement.style.display = 'block';

            var pages = data['query']['pages'];
            var images = [];

            for (const image in pages) {

              //console.log( pages[image] );

              images.push({
                'name': pages[image]['title'].replace('File:', ''),
                'thumb': pages[image]['imageinfo']['0']['thumburl'],
                'width': pages[image]['imageinfo']['0']['thumbwidth'],
                'height': pages[image]['imageinfo']['0']['thumbheight'],
                'page': pages[image]['imageinfo']['0']['descriptionurl']
              });

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

              let caption = txt + '&nbsp;&nbsp;<a href="javascript:void(0)" onclick=goExplore(&quot;' + encodeURIComponent( txt ) + '&quot;,false) onauxclick=goExplore(&quot;' + encodeURIComponent( txt ) + '&quot;,true)><i class="fa-solid fa-retweet"></i></a>&nbsp;&nbsp;(<u><a target="blank_" href="' + images[i].page + '">source</a></u>)';

              let a_elem = $('<a>', {
                class: 'elem',
                href : images[i].thumb,
                tabindex : "0",
              }).attr( 'data-lcl-txt', caption );

              a_elem.append( img_elem );

              $('#results').append( a_elem );

              // CONZEPT PATCH END

            }

            $('#loader').hide();

            // Output pagination button as needed
            if (numResults > (offset + NUM_RESULTS)) {

              offset += 20;
              const paginationButton = document.createElement('button');
              paginationButton.id = 'paginationButton';
              paginationButton.title = 'load more images';
              //paginationButton.addEventListener("click", function () { getImages(qNum, offset) }); // CONZEPT PATCH
              paginationButton.innerHTML = '<i title="load more images" class="fa-solid fa-circle-plus"></i>';
              resultsElement.appendChild(paginationButton);

							$('#paginationButton').show();

						  setupInfiniteScroll();

            }
						else { // done

							//console.log('done');
							$('#paginationButton').hide();
              $('#loader').hide();

						}

          });
      }

    });
}

// CONZEPT PATCH START

function loadNextPage(){

	$('#paginationButton').hide();
  $('#loader').show();

	offset += 20;

  getImages( qNum, offset);

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

    let url = `https://conze.pt/explore/${title}?l=${lang}&t=explore`;

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
// CONZEPT PATCH END

window.onload = startSearch;
