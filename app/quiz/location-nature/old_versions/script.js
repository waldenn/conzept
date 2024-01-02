roundNumber = 1;
gameScoreTotal = 0;
gameId = Math.floor(Math.random() * 1000); // to reset cache on new games

// SCORING FORUMLA
// Constants
const MAX_SCORE = 5000; // Maximum score for a perfect guess


// Calculate the score based on the distance
function calculateScore(distance) {
  if (distance < 100) {
    return MAX_SCORE;
  } else {
    // Calculate a score inversely proportional to the distance
    return Math.floor(MAX_SCORE * Math.exp(-distance/2500));
  }
}

// Calculate the score based on the distance - if a place is specified
function calculateScorePlace(distance,area) {
    // area = between 0 and 5000
    var areaFactor = Math.sqrt(area)/100;

    if (distance < 500*areaFactor) {
      return MAX_SCORE;
    } else {
      // Calculate a score inversely proportional to the distance
      return Math.floor(MAX_SCORE * Math.exp(-distance/2500/areaFactor));
    }
  }

// get extra url parameters
var urlParams = window.location.search;
if (urlParams.includes("?")) {
    console.log(urlParams);
    var getQuery = urlParams.split('?')[1];
    var params = getQuery.split('&');
    console.log("Custom URL parameters supplied:")
    console.log(params);

    if((params.findIndex(params => params.includes("place_id")))>-1){ // get the outer radius
        var place_id = params[params.findIndex(params => params.includes("place_id"))].split("=")[1];
    }
    var extra_params = "&"+params.join("&");
    console.log(extra_params);
} else {
    extra_params = "";
    console.log("No custom URL parameters supplied")
}

function fetchDataAndProcess() {
    // STEP 1 get a random focal observation
    

    if (extra_params.includes("place_id") || extra_params.includes("taxon_id")){ // if there's a place ID
        var apiUrl = `https://api.inaturalist.org/v1/observations?order_by=random&page=${roundNumber}&per_page=1&captive=false&geoprivacy=open&quality_grade=research&photos=true&geo=true`+extra_params+"&id_above="+gameId;
    } else { //if global
        var randomLat = Math.random() * 130 - 65;
        var randomlng = Math.random() * 340 - 170;

        function createBoundingBoxString(lat, long) {
            const latRange = 25;
            const longRange = 10;
        
            const neLat = lat + latRange;
            const neLng = long + longRange;
            const swLat = lat - latRange;
            const swLng = long - longRange;
        
            const boundingBoxString = `nelat=${neLat}&nelng=${neLng}&swlat=${swLat}&swlng=${swLng}`;
            
            return boundingBoxString;
        }

        // make url and get the data
        var apiUrl = `https://api.inaturalist.org/v1/observations?order_by=random&per_page=1&captive=false&geoprivacy=open&quality_grade=research&photos=true&geo=true`+extra_params+'&'+createBoundingBoxString(randomLat,randomlng);
    }
    
    
    // get the random observation and then do the rest
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        
        // MAP --------------
        // Initialize the map
        var map = L.map('map').setView([0, 0], 1);

        // Create a tile layer using OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);


        // add a place geometry
        if (urlParams.includes("place_id")) {
            apiUrl3 = `https://api.inaturalist.org/v1/places/${place_id}`;
                    fetch(apiUrl3)
                        .then(response => response.json())
                        .then(data3 => {
                            var locationName = document.getElementById("locationName");
                            locationName.innerHTML = data3.results[0].display_name; // update place name

                            var placeGeojson = L.geoJSON(data3.results[0].geometry_geojson).addTo(map);
                            map.fitBounds(placeGeojson.getBounds());

                            placeArea = data3.results[0].bbox_area;
                        })            
                        
        }
        


        // IMAGES -----
        // attribution
        var attrib = [];
        var obs_ids = [];
        var taxon_ids = [];

        // Get a reference to the image container div
        var imageContainer = document.getElementById("imageContainer");

        // Set the URL of the image you want to display
        var imageUrl = data.results[0].photos[0].url.replace("/square", "/medium");

        var imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.className = "modal-target";
        imageContainer.innerHTML="";
        imageContainer.appendChild(imgElement);

        var focal_lat = data.results[0].geojson.coordinates[1];
        var focal_lon = data.results[0].geojson.coordinates[0];

        // attribution and observation IDs

        attrib.push(data.results[0].user.login);
        obs_ids.push(data.results[0].id);




        // OTHER IMAGES ---------
        // how many observations?
        apiUrlCount = `https://api.inaturalist.org/v1/observations?per_page=200&only_id=true&order_by=random&lat=${focal_lat}&lng=${focal_lon}&radius=10&not_id=${data.results[0].id}&captive=false&geoprivacy=open&quality_grade=research&photos=true&geo=true`+extra_params;

        fetch(apiUrlCount)
            .then(response => response.json())
            .then(data => {

                // how many results will be returned (max 200 normally but might be less)
                var n_results = Math.min(data.total_results,200); 

                // if not enough other photos then click the reset button (this is kinda badly programmed but oh well it works)
                if(n_results <7){
                    document.getElementById("refreshButton").click();
                }

                // create array of 1.. n then shuffle, then get 7 values
                var resultsPageIDs = Array.apply(null, {length: n_results}).map(Number.call, Number).sort(() => 0.5 - Math.random());
                var selected = resultsPageIDs.slice(0, 7);

                // get the observation IDs
                var selectedIDs = [];
                selected.forEach(function(element){
                    selectedIDs.push(data.results[element].id);
                })

                // actually get the data for the selected IDs
                apiUrl2 = 'https://api.inaturalist.org/v1/observations?id='+selectedIDs.join(",");

                fetch(apiUrl2)
                    .then(response => response.json())
                    .then(data2 => {

                        // add data to attribution, add image
                        data2.results.forEach(function(element) {
                            attrib.push(element.user.login);
                            obs_ids.push(element.id);

                            taxon_ids.push(element.taxon.id)
                            var imgElement = document.createElement("img");
                            imgElement.className = "modal-target";
                            imgElement.src = element.photos[0].url.replace("/square", "/medium");
                            imageContainer.appendChild(imgElement);
                        });


                        var obs_url = 'https://www.inaturalist.org/observations?id='+obs_ids.join(",")

                        

                        var attribContainer = document.getElementById("attribContainer");
                        attribContainer.innerHTML = "<p>Observations by " + attrib.join(", ") + "</p>" +`<p>  <a href='${obs_url}' target='_blank'>Explore on iNaturalist</a></p>`; // add attributions
                    })
                })

        // SECRET LOCATION ON MAP -----------
        // Define the secret location (latitude and longitude)
        var secretLocation = L.latLng(focal_lat, focal_lon);

        // Create a marker for the secret location
        var secretMarker = L.marker(secretLocation, {
            opacity: 0, // Initially hide the marker
        }).addTo(map);

        


        secretMarker._icon.classList.add("not-clickable");

        

        // Initialize a variable to keep track of whether the secret is revealed
        var secretRevealed = false;

        var clickedMarker; // To store the user's clicked marker
        var line; // To store the line between the markers


        // enable the map
        var mapContainer = document.getElementById("map");
        mapContainer.classList.remove("disabled");


        // WHAT HAPPENS WHEN YOU CLICK ON THE MAP
        // Function to reveal the secret location and distance on click
        map.on('click', function (e) {
            if (!secretRevealed) {
                // Calculate distance between clicked point and secret location
                var distance = e.latlng.distanceTo(secretLocation);

                // Update the marker opacity to reveal the secret location
                secretMarker.setOpacity(1);

                // Set the secret as revealed
                secretRevealed = true;


                if (clickedMarker) {
                    map.removeLayer(clickedMarker); // Remove previous clicked marker
                    map.removeLayer(line); // Remove previous line
                }

                // Add a marker where the user clicked
                clickedMarker = L.marker(e.latlng).addTo(map);

                // Draw a line between the clicked marker and the secret location
                line = L.polyline([e.latlng, secretLocation], {
                    color: 'blue',
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

                console.log();


                // show attribution
                document.getElementById("attribContainer").style.display = "block";

                // add the taxons to the map
                //L.tileLayer('https://api.inaturalist.org/v1/grid/{z}/{x}/{y}.png?taxon_id='+taxon_ids.join(","),{
                //    maxZoom: 19,
                //    opacity: 0.8,
                //    attribution: 'iNaturalist'
                //}).addTo(map);

                // add the scores to the board
                var scoreContainer = document.getElementById("scoreContainer");
                var roundScore = document.createElement("p");
            
                // Add some text to the <p> element
                if (urlParams.includes("place_id")) {
                    roundScore.innerHTML = `Round ${roundNumber}: <b>${calculateScorePlace(distance,placeArea)}</b> Points (${Math.round(distance)}km)`;
                    gameScoreTotal = gameScoreTotal+calculateScorePlace(distance,placeArea);
                } else {
                    roundScore.innerHTML = `Round ${roundNumber}: <b>${calculateScore(distance)}</b> Points (${Math.round(distance)}km)`;
                    gameScoreTotal = gameScoreTotal+calculateScore(distance);
                }

                scoreContainer.appendChild(roundScore);

                if((roundNumber%5)==0){
                    var gameScore = document.createElement("h4");
                    gameScore.innerHTML = `Game ${roundNumber/5}: <b>${gameScoreTotal}</b> / 25000 Points`;
                    scoreContainer.appendChild(gameScore);
                    gameScoreTotal = 0;
                }


                roundNumber = roundNumber+1;

                // make the button reappear
                document.getElementById("refreshButton").style.display = "inline-block";
            }   
        });

    })
    .catch(error => {
    console.error('Error fetching data:', error);
    });

}


// NEXT ROUND BUTTON
document.addEventListener("DOMContentLoaded", function () {
    var refreshButton = document.getElementById("refreshButton");

    refreshButton.addEventListener("click", function () {
        

        // CLEAN UP --------------
        // Clear the image container before appending new images
        var imageContainer = document.getElementById("imageContainer");
        imageContainer.innerHTML = ''; // Empty the container
        document.getElementById("attribContainer").style.display = "none"; //hide the attribution
        document.getElementById("refreshButton").style.display = "none";

        var mapContainer = document.getElementById("mapContainer");
        mapContainer.innerHTML = '<div id="map" class="disabled"></div>'; // Remove the map

        imageContainer.innerHTML="Loading observations...";
        
        fetchDataAndProcess(); // Call the function to redo the process
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    });

    // Call the function initially to perform the process
    fetchDataAndProcess();
});


// IMAGE MODAL

// Modal Setup
var modal = document.getElementById('modal');

modal.addEventListener('click', function() { 
  modal.style.display = "none";
});

// global handler
document.addEventListener('click', function (e) { 
  if (e.target.className.indexOf('modal-target') !== -1) {
      var img = e.target;
      var modalImg = document.getElementById("modal-content");
      modal.style.display = "block";
      modalImg.src = img.src.replace("medium","large");
   }
});
