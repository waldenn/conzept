var lcnt = 0 ;
var results ;
var dcnt = 0 ;

$(document).ready ( function () {
	if (navigator.userAgent.indexOf('iPhone') != -1) {
		setTimeout(function(){window.scrollTo(0, 1);}, 100);
	}
	
	var lang = navigator.browserLanguage ;
	if ( typeof lang == 'undefined' ) lang = 'en' ;
	lang = getParameterByName ( 'language' , lang ) ;
	var art = getParameterByName ( 'art' , '' ) ;

	$('#language').val ( lang ) ;
	$('#coord_article').val ( art ) ;
	
	$('#dist').val ( getParameterByName ( 'distance' , '10' ) ) ;
	
	var lat = getParameterByName ( 'lat' ) ;
	var lng = getParameterByName ( 'lon' , getParameterByName ( 'lng' ) ) ;
	if ( lat != '' && lng != '' ) {
		var pos = new Object ;
		pos.coords = new Object ;
		pos.coords.latitude = lat ;
		pos.coords.longitude = lng ;
		auto_coords ( pos ) ;
		if ( getParameterByName ( 'autorun' ) != '' ) run () ;
	} else if(geo_position_js.init()){
		geo_position_js.getCurrentPosition(auto_coords,no_auto_coords);
	} else {
		no_auto_coords() ;
	}

} ) ;

function auto_coords ( pos ) {
	$('#lat').val ( pos.coords.latitude ) ;
	$('#lon').val ( pos.coords.longitude ) ;
}

function no_auto_coords ( message) {
	var out = 'Cannot determine your coordinates' ;
	if ( typeof message != 'undefined' ) out += ': ' + messsage ;
	$('#geomessage').html ( out ) ;
}

function run () {
	var art = $('#coord_article').val() ;
	if ( art != '' ) {
		load_from_article ( art ) ;
	} else {
		load_from_umkreis () ;
	}
}

function load_from_article ( article ) {
	var l = $('#language').val() ;
	$.getJSON ( "//" + l + ".wikipedia.org/w/api.php?callback=?" , {
		action : 'query' ,
		prop : 'coordinates' ,
		titles : article ,
		format : 'json'
	} , function ( data ) {
		
		if ( 'undefined' == typeof data || 'undefined' == typeof data.query || 'undefined' == typeof data.query.pages ) {
			alert ( 'No page "' + article + '" on ' + l + '.wikipedia. Please fix the article name or enter coordinates manually.' ) ;
			return ;
		}
		
		

		var key ;
		for ( key in data.query.pages ) { break ; }
		if ( key == -1 ) {
			alert ( 'No page "' + article + '" on ' + l + '.wikipedia. Please fix the article name or enter coordinates manually.' ) ;
			return ;
		}

		if ( 'undefined' == typeof data.query.pages[key].coordinates ) {
			alert ( 'Could not determine coordinates of "' + article + '" on ' + l + '.wikipedia. Please enter coordinates manually.' ) ;
			return ;
		}
		
		var lat = data.query.pages[key].coordinates[0].lat ;
		var lon = data.query.pages[key].coordinates[0].lon ;
		
		
		$('#lat').val ( lat ) ;
		$('#lon').val ( lon ) ;
		load_from_umkreis () ;
	} ) ;
}

function load_from_umkreis () {
	if ( lcnt > 0 ) return ; // Still loading last results
	loading ( 1 ) ;
	$('#loading-text').html ( "Loading list ..." ) ;
	
	var l = $('#language').val() ;
	var lat = $('#lat').val() ;
	var lon = $('#lon').val() ;
	var radius = $('#dist').val() * 1000 ;

	var l = $('#language').val() ;
	$.getJSON ( "//" + l + ".wikipedia.org/w/api.php?callback=?" , {
		action : 'query' ,
		list : 'geosearch' ,
		gscoord : lat + '|' + lon ,
		gsradius : radius ,
		gsnamespace : 0 ,
		gslimit : 500 ,
		gsprop : 'type' ,
		format : 'json'
	} , function ( data ) {
		results = new Object ;
		var loc = data.query.geosearch||[] ;
		$.each ( loc , function ( k , v ) {
			var d = { 
				"title" : v.title , 
				"lat" : v.lat , 
				"lng" : v.lon , 
				"distance" : Math.round(v.dist*1)/1000 , 
				"feature" : v.type||'' , 
				"wikipediaUrl" : "//" + l + ".wikipedia.org/wiki/" + escape ( v.title ) ,
				"summary" : ''
				} ;
			results[d.title] = d ;
		} ) ;
		check4images ( loc.length ) ;
	} ) ;
}

function check4images ( num_pages ) {
	$('#loading-text').html ( "Checking " + num_pages + " pages for images..." ) ;
	
	var input_data = "" ;
	$.each ( results , function ( k , v ) {
		input_data += v.title + "\n" ;
	} ) ;
	
	if ( input_data == '' ) {
		$('#results').html ( "No articles without images found." ) ;
		return ;
	}
	
	$.post ( "./quick_fist.php" ,
		{
			'doit' : 1 ,
			'language' : $('#language').val() ,
			'project' : 'wikipedia' ,
			'data' : input_data ,
			'datatype' : 'articles' ,
			'params[output_format]' : 'out_json' ,
			'params[forarticles]' : 'all' ,
			'params[jpeg]' : 1
		} ,
		function ( data ) {
			var collection = [] ;
			$.each ( data['*'] , function ( k , v ) {
				var title = v.a.title ;
				var o = results[title] ;
				if ( typeof o == 'undefined' ) return ; // Paranoia
				o.has_images = v.a.has_images ;
				o.request_url = v.a.request_url ;
//				if ( o.has_images > 0 ) return ; // This is the secret ingredient!
				collection.push ( o ) ;
			} ) ;
			loading ( -1 ) ;
			collection = collection.sort ( sort_collection ) ;
			$('#results').html ( "<h3 name='res_header'>" + collection.length + " articles without images</h3>" ) ;
			$.each ( collection , function ( k , v ) { add2results ( v ) ; } ) ;
			
			var html = "<div class='description'><a target='_blank' href=\"//toolserver.org/~kolossos/openlayers/kml-on-ol.php?photo=no&lang=de&zoom=12" ;
			html += "&lat=" + $('#lat').val() ;
			html += "&lon=" + $('#lon').val() ;
			html += "\">See a map with candidates</a></div>" ;
			$('#results').append ( html ) ;
			
			var art = $('#coord_article').val() ;
			
			html = "<div class='description'><a href=\"./?" ;
			html += "?autorun=1" ;
			html += "&language=" + $('#language').val() ;
			html += "&lat=" + $('#lat').val() ;
			html += "&lng=" + $('#lon').val() ;
			html += "&distance=" + $('#dist').val() ;
			if ( art != '' ) html += "&art=" + art ;
			html += "\">Copy this URL for a prefilled run</a></div>" ;
			$('#results').append ( html ) ;
	} , 'json' ) ;
}

function sort_collection ( a , b ) {
	return a.distance - b.distance ;
}

function add2results ( o ) {
	var html = "<div style='border-bottom:1px solid #AAAAAA;margin-bottom:3px'>" ;
	html += "<a target='_blank' href=\"//" + o.wikipediaUrl + "\"><b>" + o.title + "</b></a>" ;
	
	var lat = parseFloat ( $('#lat').val() ) ;
	var lon = parseFloat ( $('#lon').val() ) ;
	o.lat = parseFloat ( o.lat ) ;
	o.lng = parseFloat ( o.lng ) ;
	var qad = "" ;
	if ( o.lat > lat && o.lng < lon ) qad = "&#9700;" ; // "&#9712;" ; // UL Upper Left
	if ( o.lat > lat && o.lng > lon ) qad = "&#9701;" ; // "&#9715;" ; // UR
	if ( o.lat < lat && o.lng > lon ) qad = "&#9698;" ; // "&#9714;" ; // LR
	if ( o.lat < lat && o.lng < lon ) qad = "&#9699;" ; // "&#9713;" ; // LL
	html += " <span style='border:1px solid #999999'>" + qad + "</span> " ;
	
	if ( o.has_images > 0 ) {
		html += "<br/>Article has " + o.has_images + " images" ;
		if ( o.request_url != '' ) html += "; see <a target='_blank' target='_blank' href='" + o.request_url + "'>special request</a>" ;
	}
	html += "<br/>" ;
	if ( o.feature != '' ) html += o.feature.ucFirst() + " / " ;
	
	html += "<a target='_blank' target='_blank' href=\"//maps.google.co.uk/maps?dirflg=w" ;
	html += "&saddr=" + $('#lat').val() + "," + $('#lon').val() ;
	html += "&daddr=" + o.lat + "," + o.lng ;
	html += "\">" + o.distance + "</a> km / " + o.lat + " " + o.lng ;
//	if ( o.elevation != '0' ) html += " / Elev " + o.elevation + "m" ;
//	html += " / <a href=\"http://maps.google.com/maps?q=" + o.lat + "," + o.lng + "\">on map</a>" ;
	html += "<br/>" ;
	var cnt = 0 ;
	if ( o.summary != '' ) {
		html += "<div class='description'>" + o.summary + "</div>" ;
		html += "</div>" ;
		$('#results').append ( html ) ;
	} else {
		dcnt++ ;
		var id = "desc_" + dcnt ;
		html += "<div class='description' id='" + id + "'><i>Loading description…</i></div>" ;
		html += "</div>" ;
		$('#results').append ( html ) ;

		var l = $('#language').val() ;
		$.getJSON ( "//" + l + ".wikipedia.org/w/api.php?callback=?" , {
			action : 'query' ,
			prop : 'extracts' ,
			exintro : '' ,
			explaintext : '' ,
			exsentences : 3 ,
			titles : o.title ,
			format : 'json'
		} , function ( data ) {
			var s ;
			if ( 'undefined' == typeof data || 'undefined' == typeof data.query || 'undefined' == typeof data.query.pages ) {
				s = 'No description available' ;
			} else {
				$.each ( data.query.pages , function ( k , v ) {
					s = v.extract.replace ( /^Coordinates:\s*/i , '' ) ;
					return false ;
				} ) ;
			}
			$('#'+id).text ( s ) ;
		} ) ;

/*
		var t = encodeURIComponent ( o.title ) ;
		var url = "http://toolserver.org/~magnus/get_article_intro.php?language=" + $('#language').val() + "&title=" + t + "&callback=?" ;		
		$.getJSON ( url,
			function ( data ) {
				var s = String ( data ) ;
				$('#'+id).text ( s ) ;
		} ) ;
*/
	}
}

function loading ( l ) {
	lcnt += l ;
	if ( lcnt == 0 ) $('#loading').hide() ;
	else if ( lcnt == 1 && l == 1 ) $('#loading').show() ;
}

String.prototype.ucFirst = function()
{
    return this.charAt(0).toUpperCase() + this.substring(1);
}

function getParameterByName( name , def ) {
	if ( typeof def == 'undefined' ) def = '' ;
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if( results == null ) return def;
	else return decodeURIComponent(results[1].replace(/\+/g, " "));
}
