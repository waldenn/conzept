const app = {};

var container = document.getElementById( 'container' );

var datasource = {
  elevation: {
    apiKey: '12c27d08882df417c977cf5af64fd84f0'
    //apiKey: '12c27d08882df417c977cf5af64fd84f0'
  },
  imagery: {
    apiKey: 'EIvJ3LPyMVsxeNd3Lyao',
    urlFormat: 'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key={apiKey}',
    attribution: '<a href="https://www.maptiler.com/copyright/">Maptiler</a> <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
}

init();

$( document ).ready(function() {

  setupMap();

	$('#fullscreenToggle').focus();

});

function init( ) {


  document.toggleFullscreen = function() {

    if (screenfull.enabled) {
      screenfull.toggle();
    }

    return 0;

  };

}

// keyboard control
$(document).keydown(function(event) {
  
  let key = (event.keyCode ? event.keyCode : event.which);
  
  //console.log( event, key );
  
  if ( key == '70' ){ // "f"

    //screenfull.toggle();
    document.toggleFullscreen();

  }
  
});

function setupMap(){

  // Initialize the engine with a location and inject into page
  Procedural.init( { container, datasource } );
  Procedural.setCameraModeControlVisible( true );
  Procedural.setCompassVisible( true );
  Procedural.setUserLocationControlVisible( true );
  Procedural.setRotationControlVisible( true );
  Procedural.setZoomControlVisible( true );

  // demo
  var latitude = 42 + 8 * Math.random();
  var longitude = 6 + 8 * Math.random();

  if ( !!location.search.match( 'ober' ) ) {
      latitude = 47.23; longitude = 13.547;
  }
  if ( !!location.search.match( 'last' ) ) {
      latitude = parseFloat( localStorage.getItem( 'latitude' ) );
      longitude = parseFloat( localStorage.getItem( 'longitude' ) );
  } else {
      localStorage.setItem( 'latitude', latitude );
      localStorage.setItem( 'longitude', longitude );
  }
  var params = new URLSearchParams(window.location.search.slice(1));
  if ( params.has( 'lat' ) && params.has( 'lon' ) ) {
      latitude = parseFloat( params.get( 'lat' ) );
      longitude = parseFloat( params.get( 'lon' ) );
  }

  Procedural.displayLocation( {
    latitude:latitude, longitude:longitude
  } );

  Procedural.addBuiltinOverlay(['peaks', 'places']);
  Procedural.onLocationLoaded = undefined;

  var featureCollection = {
    'name': 'marker',
    'type': 'FeatureCollection',
    "features": [ {
        "geometry": {
          "type": "Point",
          "coordinates": [ latitude, longitude ]
        },
        "type": "Feature",
        "id": 0,
        "properties": {
          "color": "white",
          "padding": 10,
          "name": "Example",
          "background": "black"
        }
      }
    ]
  };

  Procedural.addOverlay( featureCollection );

  window.Procedural = Procedural;

}
