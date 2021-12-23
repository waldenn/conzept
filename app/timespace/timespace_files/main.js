"use strict";

var vars ;
var wd ;
var base_q ;
var language;
var limited_query = false;
var highlight = '';
var map ;
var timeline ;
var limit = 50;
var primary_items = [] ;
var qs = [] ;
var metadata = {} ;
var pp = {
	start_date : 'P580' ,
	end_date : 'P582' ,
	point_in_time : 'P585' ,
	date_of_foundation : 'P571' ,
	coordinate_location : 'P625' ,
	event_location : 'P766' ,
	image : 'P18' ,
} ;

$(document).ready( function () {

	vars = getUrlVars() ;
  //console.log( vars );

	if ( undefined === vars.q ) return ;

	if ( typeof vars.l === undefined || typeof vars.l === 'undefined' || vars.l === '' ){
    language = 'en';
  }
  else {
    language = vars.l;
  }

  //console.log( language );

	if ( typeof vars.limited === undefined || typeof vars.limited === 'undefined' || vars.limited === '' || vars.limited === 'false' ){
    // do nothing 
  }
  else {
    limited_query = true;
  }

	if ( typeof vars.highlight === undefined || typeof vars.highlight === 'undefined' || vars.highlight === '' || vars.highlight === 'false' ){
    // do nothing 
  }
  else {
    highlight = vars.highlight;
  }



  //console.log( limited_query );

	var base_q_num = vars.q.replace(/\D/g,'') ; // Keep digits only
	base_q = 'Q'+base_q_num ;
	$('#dummy').remove() ;
	wd = new WikiData () ;
	$('#loading').show() ;

  var sparql = '';
  var extra_langs = '';
  //var extra_langs = 'es,fr,de,it,ru,ja,zh,fa,ar,nl,ca,el';
  //var extra_langs = 'ceb,sv,de,fr,nl,ru,it,es,pl,war,vi,ja,zh,arz,ar,uk,pt,fa,ca,sr,id,no,ko,fi,hu,cs,sh,ro,nan,tr,eu,ms,ce,eo,he,hy,bg,da,azb,sk,kk,min,hr,et,lt,be,el,az,sl,gl,ur,nn,nb,hi,ka,th,tt,uz,la,cy,ta,vo,mk,ast,lv,yue,tg,bn,af,mg,oc,bs,sq,ky,nds,new,be-tarask,ml,te,br,tl,vec,pms,mr,su,ht,sw,lb,jv,sco,pnb,ba,ga,szl,is,my,fy,cv,lmo,wuu,bn';

  if ( limited_query ){ // simplify query for some types: centuries, mileniums, ...

	  sparql = 'SELECT DISTINCT ?item WHERE { { ?item wdt:P361 wd:' + base_q + '} UNION { ?item wdt:* wd:' + highlight + '. } SERVICE wikibase:label { bd:serviceParam wikibase:language "' + language + ',en,' + extra_langs + '". } } LIMIT ' + limit/2 ;

  }
  else {

	  sparql = 'SELECT DISTINCT ?item WHERE { { ?item (wdt:P361*|wdt:P155*|wdt:P156*) wd:' + base_q + '} UNION { ?item wdt:* wd:' + highlight + '. } SERVICE wikibase:label { bd:serviceParam wikibase:language "' + language + ',en,' + extra_langs + '". } } LIMIT ' + limit ;

  }

  //console.log( sparql );

	wd.loadSPARQLitems ( sparql , function ( data ) {

		primary_items = [] ;

    //console.log( data );

		$.each ( data , function ( k , v ) {

			v = v.replace(/\D/g,'') * 1 ;

			//if ( v != base_q_num ){

        primary_items.push ( v ) ;

      //}

		} ) ;

    //console.log( primary_items );
		
		wd.getItemBatch ( [ base_q ] , function () {

			wd.getItemBatch ( primary_items , function () {

				var secondary_items = [] ;

				$.each ( primary_items , function ( dummy , q ) {
					var i = wd.getItem ( q ) ;
					if ( typeof i == 'undefined' ) return ;
					var tmp = i.getClaimItemsForProperty ( pp.event_location , true ) ;
					$.each ( tmp , function ( k , v ) { secondary_items.push(v) } ) ;
				} ) ;

        //console.log( secondary_items );

				wd.getItemBatch ( secondary_items , function () {

					$('#loading').hide() ;
					parseMetadata() ;
					showMap() ;
					showItemsTable() ;
					showTimeline() ;

          // highlight user-origin item
          $('#primary_items_table').find(`[data-q=${highlight}]`).addClass('highlight');

          //$('.marker[q=' + highlight + ']').addClass('highlight');
          let m = '.marker[q=' + highlight + ']';
          //console.log( qs );
          //$('.marker[q=Q4549849]').addClass('highlight');
          //$( m ).addClass('highlight');
          //console.log( $( qs ) );
  

				} ) ;

			} ) ;

		} ) ;

	} ) ;

});


// keyboard control
$(document).keydown(function(event) {

	let key = (event.keyCode ? event.keyCode : event.which);

	//console.log( event, key );

	if ( key == '70' ){ // "f"

		document.toggleFullscreen();

	}

});

function showTimeline() {
	var title = unescape ( vars.title || '' ) ;

	if ( '' == title ){

    title = wd.items[base_q].getLabel( language );

    //console.log( language, title );

  }

	if ( '' == title ){

    title = base_q ;

    //console.log( title );

  }

  //console.log( title );

  // TODO: use the non-"en" labels work if needed

	var desc = unescape ( vars.subtitle || '' ) ;

	if ( '' == desc ) desc = wd.items[base_q].getDesc( language ) ;
	if ( '' != desc ) desc += "<br/>" ;

	//desc += wd.items[base_q].getLink ( { target:'_blank' } ) + ' on Wikidata' ;

	var tl = {
		timeline : {
			headline : title ,
			type : 'default' ,
			text : desc ,
			date : [] ,
//			era : []
		}
	} ;
	
	$.each ( qs , function ( dummy , q ) {
		var d = {} ;
		var from = getFormatDate(metadata[q].from) ;
		var to = getFormatDate(metadata[q].to) ;
		d.startDate = from.replace(/-/g,',') ;
		d.endDate = to.replace(/-/g,',') ;
		d.headline = wd.items[q].getLabel( language ) + ' | ' + q ;
		d.text = '' ;
		var images = wd.items[q].getMultimediaFilesForProperty ( pp.image ) ;
		if ( images.length > 0 ) {
			d.text += "<div class='topic_image' q='" + q + "' data-q='" + q + "'></div>" ;
			loadImage ( images[0] , q ) ;
		}
		d.text += wd.items[q].getDesc( language ) ;
		if ( d.text != '' ) d.text += '<br/>' ;
		if ( metadata[q].location !== undefined && metadata[q].location.q !== undefined ) d.text += "At " + wd.items[metadata[q].location.q].getLink({target:'_blank'}) + "<br/>" ;
		//d.text += wd.items[q].getLink({target:'_blank'}) + " on Wikidata" ;
		
		tl.timeline.date.push ( d ) ;
	} ) ;

	createStoryJS({
		type:       'timeline',
//		width:      '800',
		height:     '400',
		source:     tl,
		embed_id:   'timeline'
	});
	
	addTimelineEvents() ;
}

function loadImage ( img , q ) {
	$.getJSON ( '//commons.wikimedia.org/w/api.php?callback=?' , {
		action : 'query' ,
		titles : 'File:' + img ,
		prop : 'imageinfo' ,
		iiurlwidth : 200 ,
		iiurlheight : 80 ,
		iiprop : 'url' ,
		format : 'json'
	} , function ( data ) {
		$.each ( data.query.pages , function ( k , v ) {
			if ( undefined !== v.missing ) return ;
			var ii = v.imageinfo[0] ;
			var h = "<a target='_blank' href='" + ii.descriptionurl + "'>" ;
			h += "<img src='" + ii.thumburl + "' border=0 title='" + escape ( img.replace(/_/g,' ') ) + "' />" ;
			h += "</a>" ;
			setImage ( q , h ) ;
		} )
	} ) ;
}

function setImage ( q , h ) {
	var o = $('div.topic_image[q="'+q+'"]') ;
	if ( o.length == 0 ) {
		setTimeout ( function () { setImage(q,h) } , 500 ) ;
		return ;
	}
	o.html ( h ) ;
}

function addTimelineEvents () {

	if ( $('#timeline div.marker').length < 1 ) {
		setTimeout ( addTimelineEvents , 100 ) ;
		return ;
	}

	$('#timeline div.marker').each ( function () {

		var o = $(this) ;
		var text = $(o.find('h3')).text() ;
		text = text.split(' | ') ;
		var q = text.pop() ;
		text = text.join(' | ') ;
		$(o.find('h3')).text(text); //.attr('q',q) ;
		o.attr('q',q) ;

	} ) ;

  // detect when the prev/next buttons are pressed
  $( '.nav-next' ).on( "click", function() {

    //$('div.active').text();
    var qid = $('div.marker.active').attr('q');
    gotoPage( qid, '' );

  })

  $( '.nav-prev' ).on( "click", function() {

    //$('div.active').text();
    var qid = $('div.marker.active').attr('q');
    gotoPage( qid, '' );

  });
 
	$('#timeline div.marker').click ( function () {
		var qid = $(this).attr('q') ;

		markerMousoverHandler ( qid ) ;

    //console.log( this.attributes );
    gotoPage( qid, '' );

	} ) ;
}

function showMap () {

	map = new OpenLayers.Map("mapdiv");

  /*
  map = new Map({
    //controls: defaultControls().extend([ new FullScreen({ source: 'fullscreen', }) ]),
    layers: [],
    target: 'mapdiv',
    //view: view,
  });
  */

	map.addLayer(new OpenLayers.Layer.OSM("Simple OSM Map",['https://a.tile.openstreetmap.org/${z}/${x}/${y}.png']));

	var markers = new OpenLayers.Layer.Markers( "Markers" );

	map.addLayer(markers);

	var c_total = 0 ;
	var c_lat = 0 ;
	var c_lon = 0 ;

	$.each ( metadata , function ( q , m ) {

		if ( undefined === m.location ) return ;
		c_total++ ;
		c_lon += m.location.lon ;
		c_lat += m.location.lat ;
		var lonLat = new OpenLayers.LonLat( m.location.lon ,m.location.lat )
			  .transform(
				new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				map.getProjectionObject() // to Spherical Mercator Projection
			  );
		m.marker = new OpenLayers.Marker(lonLat) ;
		markers.addMarker(m.marker);

		m.marker.events.register('click', m.marker, function (evt) {

			//console.log ( q, m ) ;
      //var qid = $('div.marker.active').attr('q');
      gotoPage( q, '' );

		} ) ;

		m.marker.events.register('mouseover', m.marker, function (evt) {
			markerMousoverHandler ( q ) ;
		} ) ;
		
		m.marker.events.register('mouseout', m.marker, resetMarkers ) ;
		
	} ) ;
 
  var zoom=7;

	var lonLat = new OpenLayers.LonLat( c_lon/c_total , c_lat/c_total )
		  .transform(
			  new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
			  map.getProjectionObject() // to Spherical Mercator Projection
		  );

  map.setCenter (lonLat, zoom);
  resetMarkers() ;

}

function markerMousoverHandler ( q ) {
	$('tr.itemtablerow').css({'border-left':'5px solid white'});
	$('tr[q="'+q+'"]').css({'border-left':'5px solid black'});
	
	var cnt_before = 0 ;
	var before = true ;
	$.each ( qs , function ( dummy , q2 ) {
		if ( before ) cnt_before++ ;
		if ( undefined === metadata[q2].marker ) return ;
		metadata[q2].marker.setOpacity ( before ? 1 : 0.4 ) ;
		if ( q == q2 ) before = false ;
	} ) ;
	
	var h = "<b>" + wd.items[q].getLabel( language )+"</b>" ;
	if ( metadata[q].location !== undefined && metadata[q].location.q !== undefined ) h += " [" + wd.items[metadata[q].location.q].getLabel( language ) + "]" ;
	h += ". Event " + cnt_before + " of " + qs.length + ". Events with transparent markers occur after this event."
	$('#map_comment').html ( h ) ;
}

function resetMarkers () {
	$('tr.itemtablerow').css({'border-left':'5px solid white'});
	var cnt = 0 ;
	$.each ( qs , function ( dummy , q2 ) {
		cnt++ ;
		if ( undefined === metadata[q2].marker ) return ;
		metadata[q2].marker.setOpacity ( 0.2 + (0.8*cnt/qs.length) ) ;
	} ) ;
	$('#map_comment').html ( qs.length + " events. Markers on map are shaded according to time, with earlier events more transparent." ) ;
}

function gotoPage( qid, title ) {

  //console.log( qid, title );
  //console.log( 'gotoPage(): ', language );

  var url = CONZEPT_WEB_BASE + '/app/wikipedia/?t=' + title + '&l=' + language + '&type=wikipedia-qid&qid=' + qid ;

  //console.log( url );

  window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', language: language, url: url, current_pane: getCurrentPane(), target_pane: 'ps2' } }, '*' );

}

function showItemsTable () {
	var h = '' ;
	
	h += "<table id='items-table' class='table table-condensed sortable table-sort table-arrows'>" ;
  //h += "<table class='table table-condensed table-striped'>" ;

	h += "<thead><tr><th>Item</th><th>Time</th></tr></thead><tbody>" ;
	//h += "<thead><tr><th>Item</th><th>Time</th><th>Location</th></tr></thead><tbody>" ;

	$.each ( qs , function ( dummy , q ) {
		var m = metadata[q] ;
		h += "<tr class='itemtablerow' q='" + q + "' data-q='" + q + "'>" ;
		//h += "<td>" + wd.items[q].getLink ( { target:'_blank' } ) + "</td>" ;

    //console.log( wd.items[q].getID(), wd.items[q].getLabel( language ) );

    var qid   = wd.items[q].getID(); 

    var title = wd.items[q].getLabel( language );
    //console.log( 'showItemsTable(): ', language, title );

    // check other language-labels if needed
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'en' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'es' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'fr' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'de' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'pt' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'it' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'ja' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'zh' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'fa' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'ar' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'ru' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'nl' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'ca' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'el' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'ca' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'zh' ); }
    if ( isQid( title ) ){ title = wd.items[q].getLabel( 'fa' ); }

    if ( isQid( title ) ){ console.log('no label found for: ', title ); }

    h += '<td><a href="javascript:void(0)" onclick="gotoPage( &quot;' +  qid + '&quot;,  &quot;' + encodeURIComponent( title ) + '&quot;)" >' + title + '</a></td>' ;

		var from = getFormatDate ( m.from ) ;
		var to = getFormatDate ( m.to ) ;
		
		if ( from == to ) {
			h += "<td nowrap>" + from + "</td>" ;
		} else {
			h += "<td nowrap>" + from + ' &mdash; ' + to + "</td>" ;
		}

		//if ( undefined === m.location ) h += "<td>???</td>" ;
		//else h += "<td>" + getFormatLocation ( m.location ) + "</td>" ;

		h += "</tr>" ;
	} ) ;
	h += "<tbody></table>" ;
	
	$('#primary_items_table').html ( h ) ;
}

function getFormatLocation ( loc ) {
	var ret = '' ;
	if ( undefined !== loc.q ) ret += wd.items[loc.q].getLink({target:'_blank'}) + " " ;
	ret += "(" + Math.round(loc.lat*1000)/1000 + "/" + Math.round(loc.lon*1000)/1000 + ")" ;
	return ret ;
}

function getFormatDate ( d ) {
	if ( d === undefined ) return '' ;
	var month = d.getUTCMonth()+1 ;
	var day = d.getUTCDate() ;
	var ret = d.getUTCFullYear() + '-' ;
	ret += (month<10?'0':'') + month + '-' ;
	ret += (day<10?'0':'') + day ;
	return ret ;
}

function parseMetadata () {
	$.each ( primary_items , function ( dummy , item ) {
		var q = "Q"+item ;
		qs.push ( q ) ;
		metadata[q] = {} ;
		var claims = wd.items[q].raw.claims ;

		// Time
		if ( claims === undefined ) {
		} else if ( undefined !== claims[pp.point_in_time] ) {
			metadata[q].from = extractDate ( claims[pp.point_in_time][0] ) ;
			metadata[q].to = extractDate ( claims[pp.point_in_time][0] ) ;
		} else if ( undefined !== claims[pp.date_of_foundation] ) {
			metadata[q].from = extractDate ( claims[pp.date_of_foundation][0] ) ;
			metadata[q].to = extractDate ( claims[pp.date_of_foundation][0] ) ;
		} else if ( undefined !== claims[pp.start_date] && undefined !== claims[pp.end_date] ) {
			metadata[q].from = extractDate ( claims[pp.start_date][0] ) ;
			metadata[q].to = extractDate ( claims[pp.end_date][0] ) ;
		} else {
//			console.log ( "No time for " + q ) ;
		}
		
		// Place
		if ( claims === undefined ) {
		} else if ( undefined !== claims[pp.coordinate_location] ) {
			metadata[q].location = extractLocation ( claims[pp.coordinate_location][0] ) ;
		} else if ( undefined !== claims[pp.event_location] ) {
			var items = wd.items[q].getClaimItemsForProperty ( pp.event_location ) ;
			$.each ( items , function ( dummy2 , q2 ) {
				if ( undefined === wd.items[q2] ) {
					console.log ( "No such item " + q2 ) ;
					return ;
				}
				var claims2 = wd.items[q2].raw.claims ;
				if ( undefined === claims2 || undefined === claims2[pp.coordinate_location] ) return ;
				metadata[q].location = extractLocation ( claims2[pp.coordinate_location][0] ) ;
				metadata[q].location.q = q2 ;
				return false ;
			} ) ;
		} else {
//			console.log ( "No place for " + q ) ;
		}
		
	} ) ;

	qs.sort(function(a, b) {
		if ( metadata[a].from === undefined && metadata[b].from === undefined ) return 0 ;
		if ( metadata[a].from === undefined ) return 1 ;
		if ( metadata[b].from === undefined ) return -1 ;
		return metadata[a].from.getTime() - metadata[b].from.getTime() ;
	} ) ;
}

function extractLocation ( claim ) {

	if ( claim?.mainsnak?.datavalue?.type != 'globecoordinate' ) { // Paranoia
		console.log ( "No globecoordinate : " + JSON.stringify ( claim ) ) ;
		return ;
	}

	return { lat:claim.mainsnak.datavalue.value.latitude , lon:claim.mainsnak.datavalue.value.longitude } ;

}

function extractDate ( claim ) {

	if ( claim?.mainsnak?.datavalue?.type != 'time' ) { // Paranoia
		console.log ( "No time : " + JSON.stringify ( claim ) ) ;
		return ;
	}

	var t = claim.mainsnak.datavalue.value.time ;
	var m = t.match(/^([\+\-])0*(\d+)-(\d\d)-(\d\d)/) ;
	var d = new Date ( Date.UTC ( m[2]*(m[1]=='+'?1:-1) , m[3]-1 , m[4] ) ) ;
	return d ;
}

function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
	});
	return vars;
}

document.toggleFullscreen = function() {
  if (screenfull.enabled) {
    screenfull.toggle();
  }
  return 0;
};
