// Copyright: 2022-2022, Jama Poulsen, License: GNU GPL v3

let app = {
  title:        decodeURIComponent( getParameterByName( 'title' ) ) || '',
  query:        getParameterByName( 'query' ) || '',
  duplicates:   getParameterByName( 'duplicates' ) || false, // by default filterout any duplicate Qids
  language:     getParameterByName( 'l' ) || 'en',
  limit:        0,
  duration_default: 10000,
	duration:			    10000,
  heatmap:      undefined,
  coordinates:  [],
  slider_start_time: '',
  datefix:      1500,
  datefix_used: false,
  layerControl: undefined,
}

let map;

//let options = {};
//let searchList = '';

// TODO: add mark-clustering
//  https://leaflet.github.io/Leaflet.markercluster/example/marker-clustering-realworld.388.html
// var markers = L.markerClusterGroup();

setupMaps();
init();

function updateList( timeline ) {

  let displayed = timeline.getLayers();

  let events = [];

  // add each event to a list
  displayed.forEach(function (d) {

    events.push( {

      date  :  d.feature.properties.start_time,
      lat   :  d._latlng.lat,
      lng   :  d._latlng.lng,
      html  :  `
                <li>
                  <a class="zoom-to-location" title="zoom to location" href="javascript:void(0)" onclick="zoomTo(&quot;${ encodeURIComponent( d.feature.properties.title ) }'&quot;,&quot;${ d.feature.properties.qid }&quot;,&quot;${ d._latlng.lat };${ d._latlng.lng }&quot;)"><i class="fa-solid fa-location-crosshairs"></i></a> &nbsp;
                  <a class="display-list-details" title="pan to location" href="javascript:void(0)" onclick="gotoArticle(&quot;${ encodeURIComponent( d.feature.properties.title ) }&quot;, &quot;${ d.feature.properties.qid }&quot;,&quot;${ d._latlng.lat };${ d._latlng.lng }&quot;)">
                    <span class="display-list-date">${ valid( d.feature.properties.start_time_date ) ? d.feature.properties.start_time_date : '?' }</span> &nbsp;
                    <span class="display-list-duration">${ d.feature.properties.duration_human }</span> &nbsp; <span class="display-list-title">${  d.feature.properties.title }</span>
                    <span class="display-list-place">${ valid( d.feature.properties.place ) ? '(' + d.feature.properties.place + ')' : '' }</span>
                  </a>
                </li>`,

    } );

    //console.log(d);

  });

  // sort the list by date
  if ( app.datefix_used ){
    events = sortObjectsArrayByNestedProperty( events, 'date' ).reverse();
  }
  else {
    events = sortObjectsArrayByNestedProperty( events, 'date' );
  }

  // clear old data
  $('#displayed-list').empty();

  //$('#displayed-list').before( '<div id="test-list"><span class="search"> <input class="search input" type="text" placeholder="search" /> </span></div>' );

  // check if the slider is moved to the start time
  if ( $('.time-slider').val() <= app.slider_start_time ){

    app.heatmap.setLatLngs([]);

  }

  // render the new event list
  events.forEach(function (d) {

    $('#displayed-list').append( d.html );

    app.heatmap.addLatLng( [ d.lat, d.lng ] );

  });

  // search-filter, see: https://listjs.com
  if ( events.length > 0 ){

    var searchList = new List('search-list', { 
      valueNames: [ 'display-list-title', 'display-list-place', 'display-list-date' ]
    });

  }

}

function renderMap( data ) {

  //console.log( data );

  let getInterval = function ( item ) {

    return {
      start: item.properties.start_time,
      end: item.properties.end_time,
    };

  };

  let timelineControl = L.timelineSliderControl({

    enableKeyboardControls: true,
    steps:                  app.limit,
    duration:               app.duration,
    showTicks:              true,
    //autoPlay:             true, // does not work?

    formatOutput: function (date) {

      let year = new Date(date).getFullYear();

      if ( app.datefix_used ){
        year = year - app.datefix;        

        year = '-' + year;
      }

      const month = new Date(date).getMonth() + 1;
      const day   = new Date(date).getDay();

      return `<span id="date-year">${year}</span> -<span id="date-month">${month}</span>-<span id="date-day">${day}</span>`;

    },

  });

  let timeline = L.timeline(data, {

    getInterval: getInterval,

    pointToLayer: function( data, latlng ){

      let hue_min = 120;
      let hue_max = 0;
      let hue     = ( 5 / 10) * (hue_max - hue_min) + hue_min;
      //let hue     = ( data.properties.mag / 10) * (hue_max - hue_min) + hue_min;

      //console.log( data );

      const website = valid( data.properties.link ) ? `<a class="popup-link" target="_blank" title="see link" href="${ data.properties.link }"><i class="fa-solid fa-up-right-from-square""></i></a> &nbsp;` : '';

      return L.circleMarker(latlng, {
        radius: 10,
        color: "hsl(" + 231 + ", 80%, 40%)",
        fillColor: "hsl(" + 231 + ", 100%, 10%)",
      }).bindPopup(
				`<a href="javascript:void(0)" onclick="gotoArticle(&quot;${ encodeURIComponent( data.properties.title ) }&quot;, &quot;${ data.properties.qid }&quot;)"> <img class="popup-image" src="${ data.properties.image }" /></img> </a>
			  <a class="popup-title-container" href="javascript:void(0)" onclick="gotoArticle(&quot;${ encodeURIComponent( data.properties.title ) }&quot;, &quot;${ data.properties.qid }&quot;)"> <div class="popup-title">${ data.properties.title }</div> </a>
				<a style="display: block; href="javascript:void(0)" onclick="gotoArticle(&quot;${ encodeURIComponent( data.properties.place ) }&quot;, &quot;${ data.properties.place_qid }&quot;,&quot;&quot;)">
          <span class="popup-place">${ data.properties.place }</span>
        </a>
        <div class="popup-bottom-info">
          <a class="popup-zoom-to-location" title="zoom to location" href="javascript:void(0)" onclick="zoomTo(&quot;${ encodeURIComponent( data.properties.title ) }&quot;,&quot;${ data.properties.qid }&quot;,&quot;${ data.geometry.coordinates[1] };${ data.geometry.coordinates[0] }&quot;)"><i class="fa-solid fa-location-crosshairs"></i></a> &nbsp;
          <a class="popup-images" title="see images" href="javascript:void(0)" onclick="showImages(&quot;${ encodeURIComponent( data.properties.title ) }&quot;,&quot;${ data.properties.qid }&quot;)"><i class="fa-regular fa-images"></i></a> &nbsp;
          ${ website }
        </div>
        <div class="popup-bottom-info">
          <span class="popup-dating">${ data.properties.start_time_date } ⤏ ${ data.properties.end_time_date } &nbsp; ( ${ data.properties.duration_human } )</span>
        </div>
        `
      );

    },

  });

  app.layerControl.addOverlay( timeline, 'markers');

  timelineControl.addTo(map);

  timelineControl.addTimelines(timeline);

  timeline.addTo(map);

  //console.log( data );

  // add start/end dates to slider

  const first_start_date  = valid( data.features[0]?.properties?.start_time_date ) ? data.features[0].properties.start_time_date : '?';
  document.styleSheets[0].addRule('.leaflet-control.leaflet-timeline-control:before','content: "' + first_start_date + '"');

  // TODO: get last end date
  let latest_end_time = -100000000000000; 
  let latest_end_date = '';

  data.features.forEach(function (f) {

      if ( valid( f.properties?.end_time ) ){

        if ( f.properties?.end_time > parseInt( latest_end_time ) ){ // found a new later date

          latest_end_time = f.properties.end_time;
          latest_end_date = f.properties.end_time_date;

          console.log( f.properties.end_time_date, f.properties.end_time );

        }

      }

  });

  console.log( 'last end date: ', latest_end_date );

  if ( latest_end_date !== 0 ){

    document.styleSheets[0].addRule('.leaflet-control.leaflet-timeline-control:after','content: "' + latest_end_date + '"');

  }

  timeline.on("change", function (e) {

    updateList(e.target);

    $('#info').scrollTop($('#info')[0].scrollHeight);

  });

  updateList(timeline);

  // add custom controls
  $('.leaflet-control-zoom').append('<a id="info-toggle" role="button" href="javascript:void(0)" onclick="toggleInfo()"><span aria-hidden="true">&#8505;</span></a>');
  $('.button-container').append('<span id="playback-control-container"><input id="playback-control" name="playback-control" title="playback speed" type="range" min="0.10" value="5" max="10" step="0.10"><i class="fa-regular fa-clock"></i></span>')

	$('#playback-control').on('input', function(){

		$(this).trigger('change');

    setPlayBackSpeed( timelineControl );

	});

  setPlayBackSpeed( timelineControl );

  $('#loader').hide();

}

function setPlayBackSpeed( timelineControl ){

 const factor = $('#playback-control').val() / 5;

  app.duration = app.duration_default / factor * 10;

  app.heatmap.setLatLngs([]);

  timelineControl.setDuration( app.duration );

}

function toggleInfo(){

  $('#info').toggle();

}

function init(){

  $('#loader').show();

	// hack to make keyboard-control work better
	document.getElementById('fullscreenToggle').focus(); 

	let el = document.getElementsByClassName('leaflet-bottom');
	let leaflet_control = el[0];

	leaflet_control.addEventListener('mouseover', function(){
		map.dragging.disable();
	});

	leaflet_control.addEventListener('mouseout', function(){
		map.dragging.enable();
	});

  $('#view-title').text( app.title );

	setupKeys();

	let sparql_query = 'https://query.wikidata.org/sparql?format=json&query=';

	if ( valid( app.query ) ){

		// fetch sparql-data, then render the map
		handleQuery( sparql_query + app.query );

	}

}

function setupKeys(){

	// keyboard control
	$('body').keydown(function(event) {

		let key = (event.keyCode ? event.keyCode : event.which);

		if ( key == '70' ){ // "f"

			document.toggleFullscreen();

		}

	});


}

async function handleQuery( url ){

  $.ajax({

    url: url,

    dataType: "json",

    success: function( data ) {

      let json = data.results.bindings || [];

      if ( typeof json === undefined || typeof json === 'undefined' ){

        $('#view-title').append('<div class="notification">no data found</div>')
        $('#loader').hide();

        return 1;
      }

      if ( json.length === 0 ) { // no more results

        $('#view-title').append('<div class="notification">no data found</div>')
        $('#loader').hide();

        return 1;

      }

      // show number of items
      $('#view-title').append( ' <span style="font-weight:normal;" title="total number of items" aria-label="total number of items">(' + json.length + ')</span>' );

      //console.log( json );

			// transform SPARQL-data into GeoJSON
      let items       = [];
      let coordinates = [];

      if ( ! app.duplicates ){ // when "duplicates" is false: get the unique values

        json = Array.from( new Set( json.map( v => v.item.value ) ) )
         .map( id => { return json.find( v => v.item.value === id ) });

      }

      $.each( json, function ( i, v ) {

        let qid = v.item?.value || '';
        qid = qid.replace( 'http://www.wikidata.org/entity/', '' );

        let place_qid = v.place?.value || '';
        place_qid = place_qid.replace( 'http://www.wikidata.org/entity/', '' );

        let image = v.pic?.value ? v.pic.value + '?width=300px' : '';

        //console.log( v );

        let start_time      = '';
        let start_time_date = '';

        let end_time        = '';
        let end_time_date   = '';

        let point_in_time   = false;

        let duration        = '';
        let duration_human  = '';

        if ( v.pointintime?.value ){
          point_in_time = true;
        }

       	if ( v.start?.value ){

          // only use dates starting with a number or a negative-sign; don't use any dates of the format: "http://..."
          if ( v.start.value.startsWith('http') ) { // useless date format
            console.log('skipping this bad date value');
            return true;
          }

          // check for negative (ancient) dates
          if ( v.start.value.startsWith('-') ){

            app.datefix_used = true;

            //console.log('ancient date: ', v.start.value );

            let d = v.start.value.split('T')[0];
            d = d.split('-');
            ancient_date = parseInt( d[1].replace(/^0+/, '') ) + app.datefix + '-' + d[2] + '-' + d[3];
            ancient_date_human = '-' + parseInt( d[1].replace(/^0+/, '') ) + '-' + d[2] + '-' + d[3];

            start_time      = Math.floor(new Date( ancient_date ).getTime() );
            start_time_date = ancient_date_human;

          }
          else {

            start_time      = Math.floor(new Date( v.start.value ).getTime() );
            start_time_date = v.start.value.split('T')[0].replace(/^0+/, '');

          }

        }
        else if ( point_in_time ){ // use this as the starting date instead

          if ( v.pointintime.value.startsWith('-') ){

            app.datefix_used = true;

            let d = v.pointintime.value.value.split('T')[0];
            d = d.split('-');
            ancient_date = parseInt( d[1].replace(/^0+/, '') ) + app.datefix + '-' + d[2] + '-' + d[3];
            ancient_date_human = '-' + parseInt( d[1].replace(/^0+/, '') ) + '-' + d[2] + '-' + d[3];

            start_time      = Math.floor(new Date( ancient_date ).getTime() );
            start_time_date = ancient_date_human;

          }
          else {

            start_time      = Math.floor(new Date( v.pointintime.value ).getTime() );
            start_time_date = v.pointintime.value.split('T')[0].replace(/^0+/, '');

          }
 
        }

				if ( !valid( start_time ) ) { // still no start date
          return true; // bail out
				}

        if ( v.end?.value ){

          // check for negative (ancient) dates
          if ( v.end.value.startsWith('-') ){

            app.datefix_used = true;

            let d = v.end.value.split('T')[0];
            d = d.split('-');
            ancient_date = parseInt( d[1].replace(/^0+/, '') ) + app.datefix + '-' + d[2] + '-' + d[3];
            ancient_date_human = '-' +  parseInt( d[1].replace(/^0+/, '') ) + '-' + d[2] + '-' + d[3];

            end_time      = Math.floor(new Date( ancient_date ).getTime() );
            end_time_date = ancient_date_human;

          }
          else {
 
            end_time      = Math.floor(new Date( v.end.value ).getTime() );
            end_time_date = v.end.value.split('T')[0].replace(/^0+/, '');

          }

        }
        else { // no end value found

          if ( point_in_time ){

            // check for negative (ancient) dates
            if ( v.pointintime.value.startsWith('-') ){

              app.datefix_used = true;

              let d = v.pointintime.value.split('T')[0];
              d = d.split('-');
              ancient_date = parseInt( d[1].replace(/^0+/, '') ) + app.datefix + '-' + d[2] + '-' + d[3];
              ancient_date_human = '-' + parseInt( d[1].replace(/^0+/, '') ) + '-' + d[2] + '-' + d[3];

              end_time      = Math.floor(new Date( ancient_date ).getTime() );
              end_time_date = ancient_date_human;

              //console.log( '2: ', v.pointintime.value, end_time, end_time_date );

            }
            else {

              //end_time      = start_time;
              //end_time_date = v.pointintime.value.split('T')[0].replace(/^0+/, '');
              //end_time    = new Date( v.pointintime.value ).getTime() + 86400000; // FIXME: this end_time is not working 
              end_time      = start_time + 86400; // FIXME
              end_time_date = v.pointintime.value.split('T')[0].toString().replace(/^0+/, '');

              //console.log( '3: ', v.pointintime.value, end_time, end_time_date );

            }

          }
          else {

            const date_ = new Date();
            const date  = new Date( date_.setMonth( date_.getMonth() + 1 ) ); // +1 month (to prevent display bugs)

            end_time      = Math.floor( date.getTime() );
            //end_time_date = 'present';
            end_time_date = date.toISOString().split('T')[0];

            //console.log( v.itemLabel, end_time, end_time_date );

          }

        }

        // calculate duration
        if ( valid( end_time ) ){

          duration        = Math.abs( start_time - end_time );
          duration_human  = humanizeDuration( duration, { language: app.language });
          duration_human  = duration_human.split(',')[0]
          //console.log( duration, duration_human );

        }
        else {
          console.log( 'FIXME: no valid end_time');
        }

        //console.log( 'event: ',  v.itemLabel?.value, start_time, end_time, duration_human );
        //console.log( 'event: ',  v.itemLabel?.value, v.lon?.value || 0, start_time, start_time_date, duration_human );

        items.push({

          "type": "Feature",
          "properties": {

              // required fields
              "qid":              qid,
              "title":            v.itemLabel?.value || '',
              "start_time":       start_time,
              "end_time":         end_time,
              "start_time_date":  start_time_date,
              "end_time_date":    end_time_date,
              "url":              v.item.value,         // default URL for an item

              // optional fields
              "image":            image,
              "place":            v.placeLabel?.value || '',
              "place_qid":        place_qid,
              "link":             v.link?.value || '',  // custom URL for an item

              // derived fields
              "duration":         duration,
              "duration_human":   duration_human,

          },
          "geometry": {
              "type": "Point",
              "coordinates": [ v.lon?.value || '', v.lat?.value || '' ]
          },
          "id": '' + i

        });

        if ( v.lon?.value && v.lat?.value ){
          coordinates.push( [ parseFloat( v.lat.value ), parseFloat( v.lon.value ) ] );
        }

      });

      // store the first event time
      app.slider_start_time = items[ items.length - 1 ].properties.start_time;
      //console.log( i, start_time );

      //console.log( coordinates );

      map.fitBounds( coordinates );

      //app.coordinates = coordinates;

      app.limit = items.length;

      let geojson = {
          "type": "FeatureCollection",
          "metadata": {
              "title": "topic timeline",
              "status": 200,
              "api": "1",
              "count": items.length,
          },
          "features": items,
      };

      geojson.bbox = turf.bbox( geojson );

      //console.log( geojson );

      renderMap( geojson );

      if ( detectMobile() ){

        $('.leaflet-control').css({ 'margin-bottom' : '6em !important' });

        $('.leaflet-control-attribution').css({ 'display' : 'none' });

        $('#info').css({
          'width'       : '80%',
          'max-height'  : '60%',
        });

      }

    },

  });

}

window.zoomTo = function( title, qid, loc ){

  if ( valid( loc ) ){

    loc = loc.split(';');

    map.flyTo( loc, 15 );

  }

  if ( ! qid.startsWith('Q') ){ // invalid qid

    qid = '';

  }

  const url = CONZEPT_WEB_BASE + '/app/wikipedia/?t=&l=' + window.getParameterByName('l') + '&qid=' + qid ;

  window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', url: url, current_pane: getCurrentPane(), target_pane: 'ps2' } }, '*' );

}


window.showImages = function( title, qid ){

  const url = CONZEPT_WEB_BASE + '/app/commons-qid/?q=' + qid + '&l=' + app.language;

  window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', url: url, current_pane: getCurrentPane(), target_pane: 'ps2' } }, '*' );

}

window.gotoArticle = function( title, qid, loc ){

  //console.log( title, qid, loc );

  if ( valid( loc ) ){

    loc = loc.split(';');

    map.panTo( loc );

  }

  if ( ! qid.startsWith('Q') ){ // invalid qid

    qid = '';

  }

  const url = CONZEPT_WEB_BASE + '/app/wikipedia/?t=&l=' + window.getParameterByName('l') + '&qid=' + qid ;

  window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', url: url, current_pane: getCurrentPane(), target_pane: 'ps2' } }, '*' );

}

function setupMaps(){

  // TODO: check if this can be used: https://github.com/Leaflet/Leaflet.markercluster

  const mbAttr    = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
  const mbUrl     = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY29uemVwdCIsImEiOiJja2N6bHpwZmEwMmlhMnpvMThqaGFodHk1In0.9laZu8QUMwZM4mpzq1x9GA';
  const satellite = L.tileLayer(mbUrl, {id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr});
  //const street    = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});

  const osm_stamen_toner = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.{ext}', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
     subdomains: 'abcd',
     minZoom: 0,
     maxZoom: 20,
     ext: 'png'
  });

  const esri_worldimagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  const opentopomap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  const osm_de = L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var osm_fr = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  const osmUrl    = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const osmAttrib = '&copy; <a href="https://openstreetmap.org/copyright">' + "OpenStreetMap</a> contributors";

  const osm       = L.tileLayer(osmUrl, {
    maxZoom: 18,
    attribution: osmAttrib,
    noWrap: true,
  });

  app.heatmap   = L.heatLayer([], {
    maxZoom: 12, 
    radius: 25,
    blur:   25,
    gradient : {1: 'blue'}
  });

  let basemap = osm; // default

  if ( app.language === 'de' ){
    basemap = osm_de;
  }
  else if (  app.language === 'fr' ){
    basemap = osm_fr;
  }

  map = L.map("map", {
    layers    : [ basemap, app.heatmap],
    center    : new L.LatLng(0, 0),
    wheelPxPerZoomLevel: 90,
    zoomSnap  : 0.5,
    zoomDelta : 0.5,
  });

  const baseLayers= {
    'OSM default'           : osm,
    'OSM (DE)'              : osm_de,
    'OSM (FR)'              : osm_fr,
    'OSM Toner'             : osm_stamen_toner,
    'OpenTopo'              : opentopomap,
    'Satellite (MapBox)'    : satellite,
    'Satellite (ESRI)'      : esri_worldimagery,
  };

  const overlays  = {
    'heatmap': app.heatmap,
  };

  app.layerControl = L.control.layers(baseLayers, overlays).addTo(map);

}
