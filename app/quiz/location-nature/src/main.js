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
  else if ( key == 27 ) {

    modal.style.display = "none";

  }

});

// get things from the page
var imageContainer = document.getElementById("imageContainer");
var nextRoundButton = document.getElementById("refreshButton");
var playButton = document.getElementById("playButton");
var scoreContainer = document.getElementById("scoreContainer");
var inatOutwardContainer = document.getElementById("inatOutwardContainer");
var taxonContainer = document.getElementById("taxonContainer");
var placeContainer = document.getElementById("placeContainer");
var scoreFactorContainer = document.getElementById("scoreFactorContainer");

// Declare as global variables
var roundNumber = 1;
var gameScoreTotal = 0;
var scoreFactor = 1;

var roundsPerGame = 5;
var nGames =100;
var secretRevealed = false;
var secretLocation;
var secretMarker;
var map;

// things applied to all queries
var baseParams = `&captive=false&geoprivacy=open&quality_grade=research&photos=true&geo=true&acc_below=150`
//console.log(baseParams)

// Get the input field
var inputField = document.getElementById("fname");


// Get the value of the "seed" parameter from the URL
var urlParams = new URLSearchParams(window.location.search);
var seedValue = urlParams.get("seed");

//console.log(seedValue);

// Get the radio buttons
var dailyRadio = document.getElementById("dailyRadio");
var endlessRadio = document.getElementById("endlessRadio");
var customRadio = document.getElementById("customRadio");

// Check the value of the "seed" parameter and set the radio and input field accordingly
if (seedValue === "daily") {
    dailyRadio.checked = true;
    inputField.value = "";
} else if (seedValue) {
    customRadio.checked = true;
    inputField.value = seedValue;
} else {
    endlessRadio.checked = true;
    inputField.value = "";
}

// get custom user query parameters
function getCustomParams() {
    var urlParams = window.location.search;
    if (urlParams.includes("?")) {
        var getQuery = urlParams.split('?')[1];
        var params = getQuery.split('&');
        //console.log("Custom URL parameters supplied")

        var extra_params = "&"+params.join("&");
    } else {
        extra_params = "";
        console.log("No custom URL parameters supplied")
    }
    return extra_params
}





// set up seeding
function getFormattedUtcDate() {
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(today.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function timeUntilNextUtcDay() {
    // Get the current UTC date and time
    const now = new Date();
    const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000); // Convert to UTC

    // Calculate the UTC time at midnight of the next day
    const nextDay = new Date(utcNow);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    nextDay.setUTCHours(0, 0, 0, 0);

    // Calculate the time difference in milliseconds
    const timeDifference = nextDay - utcNow;

    // Convert the time difference to hours, minutes, and seconds
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
}



var customParams = "";
var seeded = false;
var obvsIdsSeededParams = [];
var daily = false;

// user supplied parameyers
function getParamsToStartGame() {
    customParams = getCustomParams();
    if (customParams.includes("seed")) {
        seeded= true; // useful variable as to whether a seed is being used
        var maxID = 10000000
        var params = customParams.split('&');
        var seed = params[params.findIndex(params => params.includes("seed"))].split("=")[1]; // get the seed

        // daily special seed
        if (seed.toLowerCase() == "daily"){
            daily=true;
            console.log("DAILY CHALLENGE ACTIVATED!")
            seed = getFormattedUtcDate();
            scoreContainer.innerHTML = "<p>Challenge URL: "+window.location.href+"</p><p>Challenge date: "+seed+"</p>";

            const timeRemaining = timeUntilNextUtcDay();
            console.log(`Time until next UTC day: ${timeRemaining.hours} hours, ${timeRemaining.minutes} minutes, ${timeRemaining.seconds} seconds`);
            
        }

        myrng = new Math.seedrandom(seed);
        

        for (let step = 0; step < 200; step++) {
            obvsIdsSeededParams.push("&id_above="+Math.floor(myrng()*maxID)+"&order_by=id&order=asc");
        }
    } else {

        obvsIdsSeededParamsUnseeded = "&id_above="+Math.floor(Math.random()*5000)+"&order_by=random";
    }
}




// add the image to the board
function addImage(result) {

    var imageURL = result.photos[0].url.replace("/square", "/medium");

    // Create a figure element to contain the image and caption
    var figureElement = document.createElement("figure");

    // Create an img element for the image
    var imgElement = document.createElement("img");
    imgElement.src = imageURL;
    imgElement.className = "modal-target";

    // Append the img element to the figure element
    figureElement.appendChild(imgElement);

    // Create a figcaption element for the caption
    var figcaptionElement = document.createElement("figcaption");

    var conzept_url   = `https://${ location.hostname }/explore/${ encodeURIComponent( result.taxon.name ) }`;
    var observer_url  = `https://www.inaturalist.org/people/${ encodeURIComponent( result.user.login ) }`;
 
    var captionText   = `<i><a href="javascript:void(0)" onclick="openInNewTab( &quot;${conzept_url}&quot; )">${ result.taxon.name }</a></i> by <a href="javascript:void(0)" onclick="openInNewTab( &quot;${observer_url}&quot; )">${ result.user.login }</a>`;

    figcaptionElement.innerHTML = captionText; // Set the caption text
    figcaptionElement.style.display = "none"

    // Append the figcaption element to the figure element
    figureElement.appendChild(figcaptionElement);

    // Append the figure element to the image container
    imageContainer.appendChild(figureElement);
}

// alternative approach for getting a bounding box
// Work in progress TODO
function flngfromgrid(x,z) { return (x/Math.pow(2,z)*360-180); };
function flatfromgrid(y,z) {
    let n = Math.PI-2*Math.PI*y/Math.pow(2,z);
    return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
};

async function createBoundingBoxQueryGrid(){
    var apiUrl = `https://api.inaturalist.org/v1/heatmap/0/0/0.grid.json?per_page=0`+baseParams+customParams;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // GET A ROW
    var rows = []

    // create an array with the row values that contain data
    for (let i = 0; i < 64; i++) {
        var nInRow = data.grid[i].trim().length
        if (nInRow>0){
            rows = rows.concat(Array.from({ length: nInRow }, () => i));
        }
    }

    // select a row with data in it
    if (seeded) {
        var randomRow = rows[Math.floor(myrng() * rows.length)];
    } else {
        var randomRow = rows[Math.floor(Math.random() * rows.length)];
    }


    
    // GET A COL
    var rowData = data.grid[randomRow];
    const nonWhitespacePositions = [];
    for (let ii = 0; ii < rowData.length; ii++) {
        if (rowData[ii] !== ' ') {
          nonWhitespacePositions.push(ii);
        }
    }

    // select a colmn with data in it
    if (seeded) {
        var randomCol = nonWhitespacePositions[Math.floor(myrng() * nonWhitespacePositions.length)];
    } else {
        var randomCol = nonWhitespacePositions[Math.floor(Math.random() * nonWhitespacePositions.length)];
    }

   
    randomRow = Math.floor(randomRow/2);
    randomCol = Math.floor(randomCol/2);

    console.log("x = " + randomCol);
    console.log("y = " + randomRow);

    const z=5;
    const neLat = flatfromgrid(randomRow,z);
    const neLng = flngfromgrid(randomCol+1,z);
    const swLat = flatfromgrid(randomRow+1,z);
    const swLng = flngfromgrid(randomCol,z);

    const boundingBoxString = `&nelat=${neLat}&nelng=${neLng}&swlat=${swLat}&swlng=${swLng}`;
    console.log(boundingBoxString);
    return boundingBoxString;
}

// create boundingbox
function createGlobalBoundingBoxString() {
    if (seeded) {
        var lat = myrng() * 130 - 65;
        var long = myrng() * 340 - 170;
    } else {
        var lat = Math.random() * 130 - 65;
        var long = Math.random() * 340 - 170;
    }

    

    const latRange = 30 + Math.floor(20*(Math.abs(lat)/65)); // bigger lat range nearer the poles
    const longRange = 30;

    const neLat = lat + latRange;
    const neLng = long + longRange;
    const swLat = lat - latRange;
    const swLng = long - longRange;

    const boundingBoxString = `&nelat=${neLat}&nelng=${neLng}&swlat=${swLat}&swlng=${swLng}`;
    

    return boundingBoxString;
}

// function to get a random observation
async function getRandomObvs() {
    //console.log(baseParams);
    //console.log(customParams);

    if(seeded){
        var seedParams = obvsIdsSeededParams[roundNumber-1];
    } else {
        var seedParams = obvsIdsSeededParamsUnseeded;
    }

    var boundingBox = await createGlobalBoundingBoxString()

    // if any custom parameter have been assigned
    if (customParams.includes("place_id")) {
        var apiUrl = `https://api.inaturalist.org/v1/observations?per_page=1&page=${roundNumber}${baseParams}${customParams}${seedParams}`;
    } else {
        var apiUrl = `https://api.inaturalist.org/v1/observations?per_page=1&page=${roundNumber}${baseParams}${customParams}${seedParams}`+boundingBox;
    }
    //console.log( apiUrl);

    const response = await fetch(apiUrl);
    const data = await response.json();
    //console.log(data);
    imageContainer.innerHTML=""
    addImage(data.results[0]);
    
    return data;
}

// shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// get n supporting observations
async function getSupportingObvs(nObvs, lat, lng,idIgnore) {
    var radius = 10;

    if (seeded){ // if there's a seed then we can't rely on order_by=random so we get top 200(or less) ordered by ID then randomly pick 7 from that 200
        // get ids of 200 (not there is a createed at d2 to try to avoid someone uploading an obvservation mid day and messing it up)
        var apiUrl1 = `https://api.inaturalist.org/v1/observations?lat=${lat}&lng=${lng}&radius=${radius}&per_page=200&only_id=true&order_by=id${baseParams}${customParams}&not_id=${idIgnore}&created_d2=2023-09-06&order=asc`;
        var response1 = await fetch(apiUrl1);
        var data1 = await response1.json();

        // get nObvs IDs from the list
        var nResults = data1.results.length;
        var selectedIDs = [];
        for (let i = 0; i < nObvs; i++) {
            selectedIDs.push(data1.results[Math.round(i / nObvs * nResults)].id);
        }

        //console.log(selectedIDs);

        // do another API call for those IDs
        var apiUrl2 = 'https://api.inaturalist.org/v1/observations?id='+selectedIDs.join(",");
        var response2 = await fetch(apiUrl2);
        var data = await response2.json();
        
    } else {
        var apiUrl = `https://api.inaturalist.org/v1/observations?lat=${lat}&lng=${lng}&radius=${radius}&per_page=${nObvs}&order_by=random${baseParams}${customParams}&not_id=${idIgnore}`;
        var response = await fetch(apiUrl);
        var data = await response.json();
    }
    

    data.results.forEach(function(element) {
        addImage(element);
    });

    return data;
}



function clearPage(){
    imageContainer.innerHTML="Loading observations..."
    inatOutwardContainer.style.display = "none";
    nextRoundButton.style.display = "none";
    var mapContainer = document.getElementById("mapContainer");
    mapContainer.innerHTML = '<div id="map" class="disabled"></div>'; // Remove the map
    secretRevealed = false;

    scoreFactorContainer.innerHTML = `<p style="font-size: 16px;">Score guide: 1000km = ${calculateScore(1000)} points, 500km = ${calculateScore(500)} points, <${Math.ceil(100*Math.sqrt(scoreFactor))}km = 5000 points </p>`
}




function createMap(focal_lat,focal_lng,imageUrl){
    // MAP --------------
    // Initialize the map
    map = L.map('map',{minZoom: 1}).setView([0, 0], 1);

    // Create a tile layer using OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // SECRET LOCATION ON MAP -----------
    // Define the secret location (latitude and longitude)
    secretLocation = L.latLng(focal_lat, focal_lng);


    // Create a custom icon for the marker
    const obsvsMarkerIcon = L.icon({
        iconUrl: imageUrl, // URL of the custom image
        iconSize: [32, 32], // Size of the icon image (width, height)
        iconAnchor: [16, 16], // Anchor point of the icon (centered at the bottom)
        popupAnchor: [0, -32] // Popup anchor point relative to the icon (above the icon)
    });


    // Create a marker for the secret location
    secretMarker = L.marker(secretLocation, {
        opacity: 0, // Initially hide the marker
        icon: obsvsMarkerIcon // add the custom marker type
    }).addTo(map);

    secretMarker._icon.style.borderRadius = '50%';
    secretMarker._icon.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.4)'; // Add a drop shadow

    secretMarker._icon.classList.add("not-clickable");

    // Attach a click event listener to the map
    map.on('click', handleMapClick);

    // stop going round and round
    map.setMaxBounds([
        [-90, -270], // South-West corner of the bounding box
        [90, 270],   // North-East corner of the bounding box
    ]);

}


// Add this function to your code to handle map clicks
function handleMapClick(e) {

    if (!secretRevealed) {
        // Calculate distance between clicked point and secret location
        var distance = e.latlng.distanceTo(secretLocation);

        // Update the marker opacity to reveal the secret location
        secretMarker.setOpacity(1);

        // Set the secret as revealed
        secretRevealed = true;


        // move the users guess in longitude if they are far away
        let angularDifference = e.latlng.lng - secretMarker._latlng.lng;
        // Adjust longitude2 to be closer to longitude1 by wrapping around
        if (angularDifference > 180) {
            e.latlng.lng-= 360;
        } else if (angularDifference < -180) {
            e.latlng.lng += 360;
        }

        // Add a marker where the user clicked
        var clickedMarker = L.marker(e.latlng).addTo(map);

        // Draw a line between the clicked marker and the secret location
        var line = L.polyline([e.latlng, secretLocation], {
            color: '#45a049',
        }).addTo(map);

        // Calculate the midpoint between the clicked point and the secret location
        var midpoint = L.latLng(
            (e.latlng.lat + secretLocation.lat) / 2,
            (e.latlng.lng + secretLocation.lng) / 2
        );

        // Display the distance in a popup at the midpoint
        var distance = e.latlng.distanceTo(secretLocation)/1000;
        L.popup({ closeButton: false, offset: [0, -15] })
            .setLatLng(midpoint)
            .setContent('Distance: ' + Math.round(distance) + ' km')
            .openOn(map);

        // zoom to the map
        var group = new L.featureGroup([clickedMarker, secretMarker]);
        map.fitBounds(group.getBounds());

        // Get all figure elements within #imageContainer
        const figureElements = document.querySelectorAll('#imageContainer figure');

        // Loop through each figure and reveal its caption
        figureElements.forEach(function (figureElement) {
            const caption = figureElement.querySelector('figcaption');
            if (caption) {
                caption.style.display = 'block'; // or 'inline' as needed
            }
        });


        addScore(distance);

        // make the button reappear
        if(((roundNumber-1)/roundsPerGame)<nGames){
            nextRoundButton.style.display = "inline-block";
        } else {
            // game finish message
            var gameFinishMessageSpan = document.getElementById("gameFinishMessage");
            var h1Element = document.createElement("h3");
            h1Element.textContent = "Game Finished!";
            gameFinishMessageSpan.appendChild(h1Element);

            if(daily==true){
                var timeUntil = document.createElement("p");
                var timeRemaining2 = timeUntilNextUtcDay();
                timeUntil.textContent = `Time until next game: ${timeRemaining2.hours} hours, ${timeRemaining2.minutes} minutes, ${timeRemaining2.seconds} seconds`;
                gameFinishMessageSpan.appendChild(timeUntil);
            }
            
        }
        inatOutwardContainer.style.display = "inline-block";
    }
}

// see how many grid cells contain results for score scaling
async function scoreScaleFactor(){
    var apiUrl = `https://api.inaturalist.org/v1/heatmap/0/0/0.grid.json?per_page=0`+baseParams+customParams;
    var nGrids = 0;

    const response = await fetch(apiUrl);
    const data = await response.json();

    data.grid.forEach(function(row) {
        nGrids += row.trim().length;
    });

    // no filter = 3060 grids
    return Math.sqrt(Math.min(1,nGrids/3060)); 
}

// trigger it immediately so it'll be cached by inat for later use
async function main() {
    await scoreScaleFactor();
}
main();

// Calculate the score based on the distance
function calculateScore(distance) {
  if (distance < 100*Math.sqrt(scoreFactor)) {
    return 5000;
  } else {
    // Calculate a score inversely proportional to the distance
    return Math.floor(5000 * Math.exp(-distance/2500/scoreFactor));
  }
}

function addScore(distance){
    let score = calculateScore(distance);

    var roundScore = document.createElement("p");
           
    // Add some text to the <p> element
    roundScore.innerHTML = `<a href=${inatOutwardContainer.querySelector('a').getAttribute('href')} target="_blank">Round ${roundNumber}</a>: <b>${score}</b> Points (${Math.round(distance)}km)`;
    gameScoreTotal += score;

    scoreContainer.appendChild(roundScore);

    if((roundNumber%roundsPerGame)==0){
        endGame();
    }

    roundNumber += 1;
}

// end game
function endGame(){
    var gameScore = document.createElement("p");
    if (seeded){
        gameScore.innerHTML = `<b>Game: ${gameScoreTotal} / 25000 Points</b>`;
    } else {
        gameScore.innerHTML = `<b>Game ${roundNumber/roundsPerGame}: ${gameScoreTotal} / 25000 Points</b>`;
    }
    
    scoreContainer.appendChild(gameScore);
    gameScoreTotal = 0;
}

//
function addCustomPlace(){
    // get place names
    var params = customParams.split('&');
    if((params.findIndex(params => params.includes("place_id")))>-1){ // get the outer radius
        var place_id = params[params.findIndex(params => params.includes("place_id"))].split("=")[1];

        // set bounds
        var bounds = L.latLngBounds([]);

        placeContainer.innerHTML = "Selected place(s): ";
        
        // get each of the places
        place_id.split(",").forEach(function (place) { 
            apiUrl3 = `https://api.inaturalist.org/v1/places/${place}`;
                        fetch(apiUrl3)
                            .then(response => response.json())
                            .then(data3 => {
                                //var locationName = document.getElementById("locationName");
                                //locationName.innerHTML = data3.results[0].display_name; // update place name

                                var placeGeojson = L.geoJSON(data3.results[0].geometry_geojson).addTo(map);
                                placeContainer.innerHTML += data3.results[0].name

                                // Update the map bounds with the GeoJSON layer's bounds
                                bounds.extend(placeGeojson.getBounds());
                                map.fitBounds(bounds);
                            })   
        })
    } else {
        placeContainer.innerHTML = "";
    }
}

// doesn't work for iconic taxa so have removed
function addCustomTaxon(){
    // get place names
    var params = customParams.split('&');
    if((params.findIndex(params => params.includes("taxon_id")))>-1){ // get the outer radius
        var taxon_id = params[params.findIndex(params => params.includes("taxon_id"))].split("=")[1];

        taxonContainer.innerHTML = "Selected taxonomic group(s): "
       
        // get each of the places
        taxon_id.split(",").forEach(function (taxon) { 
            apiUrl= `https://api.inaturalist.org/v1/taxa/${taxon}`;
                        fetch(apiUrl)
                            .then(response => response.json())
                            .then(data => {
                                taxonContainer.innerHTML += data.results[0].name
                            })   
        })
    } else {
        taxonContainer.innerHTML = "Selected taxonomic group(s): All species";
    }



}

// generate a new round
async function generateNewRound() {
    scoreFactor = await scoreScaleFactor();
    //console.log("Score factor:"+scoreFactor);

    clearPage();

    // get main observation
    var focalObvs = await getRandomObvs();

    // create the map
    createMap(
        focalObvs.results[0].location.split(",")[0],
        focalObvs.results[0].location.split(",")[1],
        focalObvs.results[0].photos[0].url
        )

    // get supporting observations
    var supportObvs = await getSupportingObvs(
        7, 
        focalObvs.results[0].location.split(",")[0], 
        focalObvs.results[0].location.split(",")[1],
        focalObvs.results[0].id
        );

    addCustomPlace();
    addCustomTaxon();

    window.scrollTo(0, 0); // move to top of page

    // build a list of IDs for outward URL
    var obs_ids = [focalObvs.results[0].id];
    supportObvs.results.forEach(function(element) {
        obs_ids.push(element.id);
    })

    var obs_url = 'https://www.inaturalist.org/observations?place_id=any&id='+obs_ids.join(",");
    
    inatOutwardContainer.innerHTML = `<a href='${obs_url}' target='_blank'>View observations on iNaturalist</a>`;
    
}


function updateUrl() {
    // Get the value of the text input
    const customSeedValue = document.getElementById("fname").value;

    // Remove any existing "seed=" parameter from the URL
    let url = window.location.href.replace(/(\?|&)seed=[^&]*(&|$)/, "$2");

    // Check which radio button is selected
    if (document.getElementById("dailyRadio").checked) {
        // Add "seed=daily" to the URL
        url += (url.includes("?") ? "&" : "?") + "seed=daily";
        nGames=1;
    } else if (document.getElementById("customRadio").checked && customSeedValue) {
        // Add "seed=XYZ" to the URL where XYZ is the custom seed value
        url += (url.includes("?") ? "&" : "?") + "seed=" + customSeedValue;
    } 

    // Update the browser's URL without reloading the page
    window.history.replaceState({}, document.title, url);
}


// play game button
playButton.addEventListener("click", function () {
    updateUrl();
    getParamsToStartGame();
    document.getElementById("game").style.display="flex";
    playButton.style.display="none";
    document.getElementById("tutorial").style.display="none";
    document.getElementById("tutorial2").style.display="none";


    // Call the function initially to perform the process
    generateNewRound();    
})

// next round
nextRoundButton.addEventListener("click", function () {
    generateNewRound();
})

// next game
// nextGameButton.addEventListener("click", function () {
//     generateNewRound();
// })


// IMAGE MODAL
// Modal Setup
var modal = document.getElementById('pictureModal');

// close the modal
modal.addEventListener('click', function() { 
  modal.style.display = "none";
});

// global handler
document.addEventListener('click', function (e) { 

  if ( valid( e.target.className.indexOf ) ){

    if (e.target.className.indexOf('modal-target') !== -1) {
        var img = e.target;
        var modalImg = document.getElementById("modal-content");
        modal.style.display = "block";
        modalImg.src = img.src.replace("medium","large");
    }

  }

});


// copy to clipboard
// Function to copy the content of scoreContainer to the clipboard
function copyToClipboard() {
    const scoreContainer = document.getElementById('scoreContainer');

    // Create a range and select the contents of scoreContainer
    const range = document.createRange();
    range.selectNodeContents(scoreContainer);

    // Get the current selection and remove any previous selections
    const selection = window.getSelection();
    selection.removeAllRanges();

    // Add the new range to the selection
    selection.addRange(range);

    // Copy the selected content to the clipboard
    document.execCommand('copy');

    // Deselect the text (optional)
    selection.removeAllRanges();
}

// Attach an event listener to the copyButton
document.getElementById('copyButton').addEventListener('click', copyToClipboard);

$( document ).ready(function() {

   const taxon_id     = getParameterByName('taxon_id') || '';
   const place_id     = getParameterByName('place_id') || '';
   //const iconic_taxa  = getParameterByName('iconic_taxa') || ''; // not really neeed?

  //if ( validAny( [ taxon_id, place_id ] ) ){

    $('#playButton').click();

  //}

});
