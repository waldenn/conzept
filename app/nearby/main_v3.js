var lang = 'en';

var wikishootme = {

	sparql_url : 'https://query.wikidata.org/bigdata/namespace/wdq/sparql' ,
	check_reason_no_image : false ,
	zoom_level : 18 ,
	opacity : 0.5 ,
	marker_radius : {

		me : 15,
		wikidata : 6 ,
		wikipedia : 6 ,

		commons : 7 ,
		flickr : 6 ,
		mixnmatch : 5 ,
		mnm_lc : 4 ,
	} ,
	thumb_size : 200 ,
	sparql_filter:'',
	language : 'en' ,
	max_items : 1000 ,
	upload_mode:'upload' ,
	current_tile_layer:'osm',
	tile_layers : {
		osm: {name:'OSM',url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'} ,
		//osm: {name:'OSM (WMF)',url:'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'} ,

		esri_wm: {name:'ESRI 1',url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',attribution:'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'} ,
		esri_topo: {name:'ESRI 2',url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',attribution:'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'} ,
		stamen_terrain: {name:'Stamen',url:'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',subdomains:'abcd',attribution:'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'} ,
	} ,
	colors : {
		me:'#888888',
		wikidata_image:'#2DC800',
		wikidata_no_image:'#2DC800', //'#FF4848',
		no_image_copyright:'#9A03FE',
		flickr:'#FF800D',
		wikipedia: '#3399ff', // '#FFFFAA',
		mixnmatch:'#AE70ED',
		mnm_lc:'#D291BC',
		commons:'#62A9FF'
	} ,
	map_is_set : false ,
	pos : { lat:52 , lng:0 } ,
	entries : {
		wikipedia : {} ,
		wikidata : {} ,
		commons : {}
	} ,
	upload_queue : [] ,
	upload_delay : 100 ,
	worldwide : 0 ,
	json_cache : {} ,

	// Layer stuff
	show_layers : [] ,
	overlays : {} ,
	layer_info : {
		key2name : {
			wikidata_image:'Wikidata (with image, 3K max)',
			wikidata_no_image:'Wikidata (no image, 3K max)',
			//commons:'Commons images (500 max)',
			wikipedia:'Wikipedia (500 max)',
			//mixnmatch:"Mix'n'match (5000 max)",
			//mnm_lc:"Mix'n'match large catalogs (5000 max)",
			//flickr:'Flickr'
		} ,
		name2key : {}
	} ,
	layers : {
		wikipedia : {} ,
		wikidata_image : {} ,
		wikidata_no_image : {} ,
		commons : {}
	} ,

	busy : 0 ,

	escapeHTML : function ( s ) {
		return escattr(s) ;
	} ,
	
	getHashVars : function () {
		var vars = {} ;
		var hashes = window.location.href.slice(window.location.href.indexOf('#') + 1).split('&');
		$.each ( hashes , function ( i , j ) {
			var hash = j.split('=');
			hash[1] += '' ;
			vars[hash[0]] = decodeURIComponent(hash[1]).replace(/_/g,' ');
		} ) ;
		return vars;
	} ,
	
	updatePermalink : function () {
		var me = this ;
		var h = [] ;
		h.push ( 'lat='+me.pos.lat ) ;
		h.push ( 'lng='+me.pos.lng ) ;
		h.push ( 'zoom='+me.map.getZoom() ) ;

		if ( me.language != 'en' ){
      lang = me.language;
      h.push ( 'interface_language='+me.language ) ;
    }
		if ( me.current_tile_layer != 'osm' ) h.push ( 'tiles='+me.current_tile_layer ) ;

		var layers = me.show_layers.join(',') ;
		if ( layers != me.full_layers ) h.push ( 'layers='+layers ) ;

		if ( me.sparql_filter == '' ) {
			$('#is_using_filter').hide() ;
		} else {
			h.push ( 'sparql_filter='+encodeURIComponent(me.sparql_filter) ) ;
			$('#is_using_filter').show() ;
		}
		if ( me.worldwide ) h.push ( 'worldwide=1' ) ;
		
		wsm_comm.storeCurrentView ( h ) ;
		
		h = '#' + h.join('&') ;
		location.hash = h ;
		me.updateSearchLinks() ;
	} ,
	
	updateSearchLinks : function () {
		var me = this ;
		
		// Get area
		var b = me.map.getBounds() ;
		var ne = b.getNorthEast() ;
		var sw = b.getSouthWest() ;
		
		// Update WD-FIST link
		var sparql = '' ;
		sparql += 'SELECT ?q {' ;
		if ( !me.worldwide ) {
			sparql += ' SERVICE wikibase:box { ?q wdt:P625 ?location . ' ;
			sparql += 'bd:serviceParam wikibase:cornerSouthWest "Point('+sw.lng+' '+sw.lat+')"^^geo:wktLiteral . ' ;
			sparql += 'bd:serviceParam wikibase:cornerNorthEast "Point('+ne.lng+' '+ne.lat+')"^^geo:wktLiteral }' ;
		}
		sparql += ' ' + me.sparql_filter + ' }' ;
		var url = "https://fist.toolforge.org/wdfist/index.html?sparql=" ;
		url += encodeURIComponent ( sparql ) ;
		url += '&no_images_only=1&search_by_coordinates=1&remove_multiple=1&prefilled=1' ;
		$('#wdfist').show().attr ( { href : url } ) ;
		
		var distance = ne.distanceTo(sw) ;
		var radius_km = Math.round ( (distance/2) / 1000 ) ;
		if ( radius_km <= 0 ) radius_km = 1 ;
		var center = me.map.getCenter() ;
		url = "https://fist.toolforge.org/fist/check_flickr_geo.php?lat="+center.lat+"&lon="+center.lng+"&radius="+radius_km+"&doit=1" ;
		$('#flickr').show().attr ( { href : url } ) ;
	} ,

	setBusy : function ( d ) {
		var me = this ;
		me.busy += d ;
		if ( me.busy == 0 ) { // All done
			$('#busy').hide() ;
			try { me.layers.wikipedia.bringToFront() ; } catch ( e ) { }
			me.updatePermalink() ;
		} else if ( d == 1 && me.busy == 1 ) { // Starting to be busy...
			$('#busy').show() ;
		}
	} ,
	
	cleanLayers : function () {
		var me = this ;
		$.each ( me.layers , function ( k , v ) {
			v.clearLayers() ;
		} ) ;
		$.each ( me.entries , function ( mode , entries ) {
			me.entries[mode] = {} ;
		} ) ;
	} ,
	
	createImageThumbnail : function ( image, entry ) {

    //console.log( image, entry);

		var me = this ;
		var url = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/'+escattr(encodeURIComponent(image))+'?width='+me.thumb_size+'px&height='+me.thumb_size+'px' ;
		var h = '' ;

    if ( typeof entry === undefined || typeof entry === 'undefined' ){
      // ...
    }
    else {

      //console.log( entry.page );

      h += "<div class='thumb'>" ;
      h += '<a href="javascript:void(0)" onclick="gotoArticle(&quot;' + me.escapeHTML(entry.label) + '&quot;, &quot;' + me.escapeHTML( entry.page ) + '&quot;)">' ;
    }

    //console.log( image, entry );

		//h += '<a href="javascript:void(0)" onclick="gotoUrl(&quot;' + 'https://commons.wikimedia.org/wiki/File:' + escattr(encodeURIComponent(image)) + '&quot;)">' ;
		//h += "<a target='_blank' href='https://commons.wikimedia.org/wiki/File:" + escattr(encodeURIComponent(image)) + "'>" ;

		h += "<img src='" + url + "' border=0 width='"+me.thumb_size+"px' height='"+me.thumb_size+"px' alt='' style='display:block; margin:auto;' />" ;
		h += "</a></div>" ;
		//h += "<div class='smallimgname'>" + me.escapeHTML(image) + "</div>" ;
		return h ;
	} ,
	
	createItemFromImage : function ( a ) {
		var me = wikishootme ;
		var image = $(a).attr ( 'image' ) ;
		var image_pos = { lat:$(a).attr('lat') , lng:$(a).attr('lng') } ;

		me.createNewItem ( {
			pos:image_pos,
			label_default:image.replace(/\.[^.]+$/,'').replace(/ - geograph.org.uk.*$/,''),
			image:image
		} ) ;

		return false ;
	} ,
	
	createPopup : function ( entry ) {
		var me = this ;

    let qid = '';

    //console.log( entry );

    if ( entry.page ){
      qid = entry.page;
    }
    

		var h = '' ;
		h += "<div>" ;
		h += "<div style='text-align:center'>" ;
		h += '<div><a href="javascript:void(0)" onclick="gotoArticle(&quot;' + me.escapeHTML(entry.label) + '&quot;, &quot;' + me.escapeHTML( qid ) + '&quot;)"><b class="title">' + me.escapeHTML(entry.label) + '</b></a>' ;

		//h += "<div><a href='" + escattr(entry.url) + "' target='_blank'><b>" + me.escapeHTML(entry.label) + "</b></a>" ;
		if ( typeof entry.mixnmatch != 'undefined' && entry.mixnmatch.ext_url != '' ) {
			server = me.escapeHTML(entry.mixnmatch.ext_url.replace(/^[a-z]+?:\/\/(.+?)\/.*$/,'$1')) ;
			h += " [<a href='"+me.escapeHTML(entry.mixnmatch.ext_url)+"' target='_blank'>"+server+"</a>]" ;
		}
		h += "</div>" ;
		if ( typeof entry.description != 'undefined' ) h += "<div class=\"description\">" + me.escapeHTML(entry.description) + "</div>" ;
		if ( typeof entry.note != 'undefined' ) h += "<div><i>" + me.escapeHTML(entry.note) + "</i></div>" ;

		if ( typeof entry.street != 'undefined' ) {
			h += "<div>&#127968; <i>" + me.escapeHTML(entry.street) + "</i></div>" ;
		}
		
		if ( typeof entry.mixnmatch != 'undefined' ) {
			if ( entry.mixnmatch.q != null ) {
				var q = entry.mixnmatch.q ;
				var qlink = "<a href='https://www.wikidata.org/wiki/Q" + q + "' target='_blank'>Q" + q + "</a>" ;
				if ( entry.mixnmatch.user == 0 ) h += "<div><i>Preliminarily</i> matched to " + qlink + "</div>" ;
				else h += "<div>Matched to " + qlink + "</div>" ;
			} else {
				h += "<div><i>Not matched to Wikidata</i></div>" ;
			}
		}
		
		if ( entry.mode == 'flickr' ) {
			h += "<div class='popup_section' style='text-align:center'>" ;
			h += "<a href='"+entry.url+"' target='_blank'><img src='" + entry.thumburl + "' border=0 style='max-width:100%' /></a>" ;
			h += "</div>" ;
			h += "<div flickr_id='"+entry.flickr_id+"' class='popup_section transfer2flickr'></div>" ;
		} else if ( entry.mode == 'mixnmatch' ) {
			h += "<div class='popup_section' style='text-align:center'>" ;
			h += "MnM1" ;
//			h += "<a href='"+entry.url+"' target='_blank'><img src='" + entry.thumburl + "' border=0 style='max-width:100%' /></a>" ;
			h += "</div>" ;
//			h += "<div flickr_id='"+entry.flickr_id+"' class='popup_section transfer2flickr'></div>" ;
		} else if ( entry.layer_key == 'mnm_lc' ) {
			h += "<div>" + entry.html + "</div>" ;
//			h += "<div class='popup_section' style='text-align:center'>" ;
//			h += "MnM LC" ;
//			h += "<a href='"+entry.url+"' target='_blank'><img src='" + entry.thumburl + "' border=0 style='max-width:100%' /></a>" ;
//			h += "</div>" ;
		} else if ( typeof entry.image != 'undefined' ) {

      //console.log( entry.image, entry.mode );

			h += me.createImageThumbnail ( entry.image, entry ) ;
			
			if ( entry.mode == 'commons' ) {
				h += "<div class='popup_section'>" ;
		    h += '<a href="javascript:void(0)" title="wikiCommons image" onclick="gotoUrl(&quot;' + 'https://commons.wikimedia.org/wiki/File:' + escattr(encodeURIComponent(image)) + '&quot;)"><i class="far fa-image"></i></a> ' ;
		    //h += '<a href="javascript:void(0)" title="video" onclick="gotoUrl(&quot;' + CONZEPT_WEB_BASE + '/app/video/#/search/' + encodeURIComponent( entry.label ) + '&quot;)"><i class="fab fa-youtube"></i></a> ' ;
				//h += "<a href='#' image='"+escattr(entry.image)+"' lat='"+entry.pos[0]+"' lng='"+entry.pos[1]+"' class='create_item_from_image' onclick='return wikishootme.createItemFromImage($(this));return false'>" + me.tt.t('create_wd_from_image') + "</a>" ;
				h += "</div>" ;
			}
			
		} else if ( entry.mode == 'wikidata' ) { // Wikidata, no image

      //console.log( entry.image, entry.mode );
		
			//h += "<div>" + entry.page + "</div>" ;
		
			if ( entry.no_image ) {
			} else if ( wsm_comm.isLoggedIn() ) {
				var desc = "{{Information\n|Description=[[d:" + entry.page + "|" + entry.label + "]]\n|Source=self-made\n|Date=\n|Author=[[User:"+wsm_comm.userinfo.name+"|]]\n|Permission=\n|other_versions=\n}}\n" ;
				desc += "{{Object location|"+entry.pos[0]+"|"+entry.pos[1]+"}}\n<!--LOC-->\n\n" ;
				desc += "=={{int:license-header}}==\n{{self|cc-by-sa-3.0}}" ;
		
				h += "<div style='margin-top:15px'>" ;
				//h += "<form method='post' enctype='multipart/form-data' action='""' class='form form-inline' target='_blank'>" ;
				h += "<form method='post' enctype='multipart/form-data' action='"+wsm_comm.api_v3+"' class='form form-inline' target='_blank'>" ;
				h += '<label class="btn btn-primary btn-file">' + me.tt.t('upload_file') + ' <input name="file" type="file" accept="image/*;capture=camera" onchange="wikishootme.uploadFileHandler(this)" style="display: none;"></label>' ;
				h += "<input type='hidden' name='action' value='"+me.upload_mode+"' />" ;
				h += "<input type='hidden' name='q' value='"+entry.page+"' />" ;
				h += "<input type='hidden' name='wpDestFile' value='" + escattr(entry.label) + ".jpg' />" ;
				h += "<input type='hidden' name='wpUploadDescription' value='" + escattr(desc) + "' />" ;
				h += "<input type='submit' style='display:none' name='wpUpload' value='" + me.tt.t('upload_file') + "' />" ;
				h += "</form>" ;
				h += "</div>" ;
				
				h += "<div class='add_image2item'>" ;
				h += "<form class='form form-inline' onSubmit='return wikishootme.addImageToItemHandler($(this))'>" ;
				h += "<input type='hidden' name='q' value='"+escattr(entry.page)+"' />" ;
				h += "<input type='text' name='filename' placeholder='"+escattr(me.tt.t('commons_file_name'))+"' />" ;
				h += "<input type='submit' value='"+escattr(me.tt.t('add2item'))+"' />" ;
				h += "</div>" ;
				
			} else {
			
				if ( wsm_comm.is_app ) {
					h += "<div><button class='btn btn-primary' onclick='wsm_comm.appLogin();return false'>Log in!</button></div>" ;
				} else {
					h += "<!--div>" ;
					h += "<form method='post' action='" + wsm_comm.api_v3 + "'>" ;
					h += "<input type='hidden' name='action' value='authorize' />" ;
					h += "<input type='submit' class='btn btn-primary' value='" + me.tt.t('authorize_upload') + "' />" ;
					h += "</form>" ;
					h += "</div-->" ;
				}
			}
			
		} else if ( entry.mode == 'wikipedia' && typeof entry.server != 'undefined' ) {

      //console.log( entry, entry.mode );
      // NOTE: article images can be fetched with: https://en.wikipedia.org/w/api.php?format=json&action=query&prop=info|extracts|pageimages|images&inprop=url&exsentences=1&titles=india
			
			h += "<div class='pageimage_toload' server='" + entry.server + "' page='" + escattr(entry.page) + "'></div>" ;
			
		}
		
		if ( typeof entry.commonscat != 'undefined' ) {
			h += "<div class='popup_section'>" ;
		  h += '<a href="javascript:void(0)" title="wikiCommons category" onclick="gotoUrl(&quot;' + 'https://commons.m.wikimedia.org/wiki/Category:' + escattr(encodeURIComponent(entry.commonscat.replace(/ /g,'_'))) + '&quot;)"><i class="far fa-images"></i></a>';
		  //h += '<a href="javascript:void(0)" title="Bing image search" onclick="gotoUrl(&quot;' + 'https://www.bing.com/images/search?&q=' + encodeURIComponent( entry.label ) + '&qft=+filterui:photo-photo&FORM=IRFLTR&setlang=' + lang + '-' + lang + '&quot;)"><i class="fas fa-search-location"></i></a> ' ;
		  //h += '<a href="javascript:void(0)" title="video" onclick="gotoUrl(&quot;' + CONZEPT_WEB_BASE + '/app/video/#/search/' + encodeURIComponent( entry.label ) + '&quot;)"><i class="fab fa-youtube"></i></a> ' ;
			h += "</div>" ;
		}

    let route_link = '';

		if ( typeof me.marker_me != 'undefined' ) {
			var pos = me.marker_me.getLatLng() ;

			route_link = '<a target="_blank" href="' + encodeURI( 'https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route='+ pos.lat + ',' + pos.lng + ';' + entry.pos[0] + ',' + entry.pos[1] + '#map=14/' + entry.lat + '/' + entry.lng ) + '"><i class="fas fa-directions"></i></a>';

      //console.log( route_url );

			//h += "<div style='font-size:10pt'>" ;
			//h += '<a target="_blank" href="' + encodeURI( 'https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route='+ pos.lat + ',' + pos.lng + ';' + entry.pos[0] + ',' + entry.pos[1] + '#map=14/' + entry.lat + '/' + entry.lng ) + '"><i class="fas fa-directions"></i></a>';
			//h += "</div>" ;
		}

    h += "<div class='popup_section'>" ;
    h += '<a href="javascript:void(0)" title="streetview" onclick="openInNewTab(&quot;' + 'https://maps.google.com/maps?q=&layer=c&cbll=' + entry.pos[0] + ',' + entry.pos[1] + '&cbp=11,0,0,0,0' + '&quot;)"><i class="fas fa-street-view"></i></a>';
    h += "</div>" ;
	
    h += "<div class='popup_section'>" ;
    h +=  route_link ;

    //if ( entry.page !== entry.label ){

      //console.log( entry.label, entry.page );

      h += '<a href="javascript:void(0)" title="Bing image search" onclick="gotoUrl(&quot;' + 'https://www.bing.com/images/search?&q=' + encodeURIComponent( entry.label ) + '&qft=+filterui:photo-photo&FORM=IRFLTR&setlang=' + lang + '-' + lang + '&quot;)"><i class="fas fa-camera-retro"></i></a>' ;
      h += '<a href="javascript:void(0)" title="video" onclick="gotoUrl(&quot;' + CONZEPT_WEB_BASE + '/app/video/#/search/' + encodeURIComponent( entry.label ) + '&quot;)"><i class="fab fa-youtube"></i></a>';
      h += '<a href="javascript:void(0)" title="video" onclick="gotoUrl(&quot;' + 'https://openlibrary.org/search/inside?q=%22' + encodeURIComponent( entry.label ) + '%22' + '&quot;)"><i class="fab fa-mizuni"></i></a>';

    //}

    h += "</div>" ;

		h += "<div class='popup_coords'><span class='coordinates'>" + entry.pos[0] + ", " + entry.pos[1] + "</span>";
		//h += " <a style='user-select:none' href='http://www.instantstreetview.com/@"+entry.pos[0]+","+entry.pos[1]+",0h,0p,1z' tt_title='streetview' target='_blank'>&#127968;</a>" ;

		if ( wsm_comm.isLoggedIn() && typeof entry.mixnmatch == 'undefined' ) {
			h += " [<a href='#' style='user-select:none' onclick='wikishootme.editCoordinates(this,\""+entry.page+"\","+entry.pos[0]+","+entry.pos[1]+");return false' title='edit coordinates'>e</a>]" ;
		}

		h += "</div>" ;
		
	
		h += "</div>" ; // center
		h += "</div>" ;
		
		var ret = L.popup().setContent ( h ) ;
		return ret ;
	} ,

	editCoordinates : function ( a , q , lat , lon ) {
		var me = wikishootme ;
		var ret = prompt ( "Edit coordinates" , lat+'/'+lon ) ;
		if ( ret == null ) return false ; // Cancel
		if ( !ret.match ( /^\s*-?[0-9.]+\s*\/\s*-?[0-9.]+\s*$/ ) ) {
			alert ( "Bad format, not changing coordinates" ) ;
			return false ;
		}
		if ( ret == lat+'/'+lon ) {
			alert ( "New coordinates are the same as the old ones, not changed" ) ;
			return false ;
		}
		
		wsm_comm.getWSM ( {
			action:'changeCoordinates',
			coordinates:ret,
			q:q
		} , function ( d ) {
			if ( d.status != 'OK' ) {
				alert ( "ERROR: " + d.status ) ;
			} else {
				var cs = $($($(a).parents('div.popup_coords').get(0)).find('span.coordinates')) ;
				cs.text ( ret ) ;
			}
		} ) ;
		return false ;
	} ,

	uploadFileHandler : function ( o ) {
		var me = wikishootme ;
		var form = $(o).parents('form').get(0) ;
		
		// Upload as separate tab; fallback for older browsers
		if ( me.upload_mode == 'upload' ) {
			$(form).submit() ;
			return false ;
		}
		
		// Upload in background
		$($(form).parent()).append ( me.tt.t('uploading') ) ;
		var o = {
			data : new FormData($(form)[0]),
			is_uploading:false,
			is_uploaded:false
		}
		me.upload_queue.push ( o ) ;
		me.uploadNext() ;
	} ,
	
	clearUploads : function () {
		var me = this ;
		me.upload_queue = [] ;
		$('#dropdownUploadsLi').hide() ;
		return false ;
	} ,
	
	showUploadStatus : function () {
		var me = this ;
		
		var cnt_uploaded = 0 ;
		$.each ( me.upload_queue , function ( k , v ) {
			if ( v.is_uploaded ) cnt_uploaded++ ;
		} ) ;
		
		var h = '' ;
		if ( cnt_uploaded == me.upload_queue.length ) {
			h += "<a class='dropdown-item clear_uploads' href='#' style='color:blue' tt='clear_upload_list'>clear</a>" ;
		}
		$.each ( me.upload_queue , function ( k , v ) {
			h += "<div class='dropdown-item'>" ;
			if ( v.is_uploaded ) {
				h += "<a href='" + escattr(v.data.file_url) + "' target='_blank'>" + me.escapeHTML(v.data.file) + "</a> &#10003;" ;
//				h += "<span style='color:green' tt='upload_done'>done</span>" ;
			} else if ( v.is_uploading ) h += "<span style='color:blue' tt='uploading'>uploading</span>" ;
			else if ( v.failed ) h += "<span style='color:red' tt='upload_fail_retry'>failed,retry</span>" ;
			else h += "<span tt='queueing'>queue</span>" ;
			h += "</div>" ;
		} ) ;
		$('#upload_list').html ( h ) ;
		$('#upload_list a.clear_uploads').click ( function () {
			me.clearUploads() ;
		} ) ;
		
		h = cnt_uploaded + '/' + me.upload_queue.length ;
		$('#dropdownUploads').html(h) ;
//		me.tt.updateInterface($('#dropdownUploadsLi')) ;
		$('#dropdownUploadsLi').show() ;
	} ,
	
	uploadNext : function () {
		var me = this ;
		if ( me.upload_queue.length == 0 ) return ;

		me.showUploadStatus() ;
		
		// Check if already uploading
		var i ;
		var is_uploading = false ;
		$.each ( me.upload_queue , function ( k , v ) {
			if ( v.is_uploading ) is_uploading = true ;
			else if ( v.is_uploaded == false && typeof i == 'undefined' ) i = k ;
		} ) ;
		if ( is_uploading ) return ;
		if ( typeof i == 'undefined' ) return ; // All done
		
		// Prepare upload
		var o = me.upload_queue[i] ;
		o.is_uploading = true ;

		
		// Uploading new file
		var opts = {
			url: wsm_comm.api_v3,
			data: o.data,
			cache: false,
			contentType: false,
			processData: false,
			dataType:'json',
			type: 'POST',
			success: function(d){
				me.upload_delay = 100 ; // Reset delay
				o.is_uploading = false ;
				if ( d.status == 'OK' ) {
					o.is_uploaded = true ;
					o.data = d.data ;
					me.switchItemToImageLayer ( d.data.q , d.data.file.replace(/_/g,' ') ) ;
				} else {
					o.failed = true ;
				}
			} ,
			error : function () {
				me.upload_delay += 1000 ; // Wait 1 second more after each error
			}
		};
		if(o.data.fake) {
			// Make sure no text encoding stuff is done by xhr
			opts.xhr = function() { var xhr = jQuery.ajaxSettings.xhr(); xhr.send = xhr.sendAsBinary; return xhr; }
			opts.contentType = "multipart/form-data; boundary="+o.data.boundary;
			opts.data = o.data.toString();
		}
		
		$.ajax(opts)
		.then ( function () {
			setTimeout ( function () { me.uploadNext() } , me.upload_delay ) ;

			// Logging
			//$.getJSON ( 'https://tools.wmflabs.org/magnustools/logger.php?tool=wikishootme&method=file uploaded&callback=?' , function(j){} ) ;
		} ) ;

		me.showUploadStatus() ;
	} ,
	
	pingLayer : function ( key ) {
		var me = this ;
		if ( -1 == $.inArray ( key , me.show_layers ) ) return ;
		me.map.removeLayer ( me.layers[key] ) ;
		me.map.addLayer ( me.layers[key] ) ;
	} ,
	
	switchItemToImageLayer : function ( q , image , form ) {
		var me = this ;
		var i = me.entries.wikidata[q] ;
		if ( typeof i == 'undefined'  ) { // Paranoia
			if ( typeof form != 'undefined' ) {
				form.replaceWith("<span>"+me.tt.t('image_added')+"</span>") ;
				$(form.parents('div.leaflet-popup-content').get(0)).find('div.add_image2item').remove() ;
			}
			return ;
		}
		i.image = image ;
		var marker = i.marker ;
		var was_open = true ; // Default
		if ( typeof marker.getPopup().isOpen != 'undefined' ) was_open = marker.getPopup().isOpen() ;
		me.layers.wikidata_image.addLayer(marker);
		me.layers.wikidata_no_image.removeLayer(marker);
		marker.setStyle ( {color:me.colors.wikidata_image,fillColor:me.colors.wikidata_image} ) ;
		me.pingLayer ( 'wikidata_image' ) ;
		marker.closePopup() ;
		marker.unbindPopup() ;
		marker.bindPopup ( me.createPopup ( i ) ) ;
		if ( was_open ) marker.openPopup() ;
	} ,
	
	addImageToItemHandler : function ( form ) {
		var me = this ;
		var q = form.find('input[name="q"]').val() ;
		var image = form.find('input[name="filename"]').val() ;
		wsm_comm.getWSM ( {
			action:'addImageToWikidata',
			image:image,
			q:q
		} , function ( d ) {
			if ( d.status != 'OK' ) {
				alert ( "ERROR: " + d.status ) ;
			} else {
				me.switchItemToImageLayer ( q , image , form ) ;
			}
		} ) ;
		return false ;
	} ,
	
	// Required properties of v:
	// lat, lon, title, ns, pageid
	addWikimediaEntry : function ( mode , server , v ) {
		var me = this ;
		var i = {
			pos : [ v.lat , v.lon ] ,
			label : mode=='commons' ? v.title.replace(/^File:/,'').replace(/\.[^.]+$/,'').replace(/_/g,' ') : v.title ,
			page : v.title ,
			mode : mode ,
			url : 'https://' + server + '/wiki/' + encodeURIComponent(v.title) ,
			server : server ,
			ns : v.ns
		} ;
		
		if ( mode == 'commons' ) i.image = v.title.replace(/^File:/,'') ;

		var bgcol = me.colors[mode] ;
		var scol = bgcol;
		//var scol = mode=='wikipedia' ? '#000' : bgcol ;
		var marker = L.circleMarker ( i.pos , {  stroke:true,color:scol,weight:1,fill:true,fillColor:bgcol,fillOpacity:me.opacity } ) ;
		marker.setRadius ( me.marker_radius[mode] ) ;
		marker.bindPopup ( me.createPopup ( i ) ) ;
		me.layers[mode].addLayer ( marker ) ;
		i.marker = marker ;
		me.entries[mode][''+v.pageid] = i ;
		return i ;
	} ,
	
	loadWikimediaLayer : function ( server , mode ) {
		var me = this ;
		var api = 'https://' + server + '/w/api.php' ;
		var b = me.map.getBounds() ;
		var nw = b.getNorthWest() ;
		var se = b.getSouthEast() ;

		me.loadCachedJSON ( api+'?callback=?' , {
			action:'query',
			list:'geosearch',
			gsbbox:nw.lat+'|'+nw.lng+'|'+se.lat+'|'+se.lng,
			gsnamespace:mode=='commons'?6:0,
			gslimit:500,
			format:'json'
		} , function ( d ) {

			$.each ( ((d.query||{}).geosearch||{}) , function ( dummy , v ) {
				me.addWikimediaEntry ( mode , server , v ) ;
			} ) ;

			if ( mode == 'commons' ) try { me.layers.commons.bringToBack() ; } catch ( e ) { }

		} ) ;

	} ,
	
	loadCachedJSON : function ( url , params , callback_success , callback_always ) {
		var me = this ;
		me.setBusy(1) ;
		
		if ( typeof callback_always == 'undefined' ) callback_always = function() { me.setBusy(-1) } ;
		
		var do_cache = true ;
		var use_callback = false ; //url.match(/flickr/) ? true : false ;
		
		var key = JSON.stringify(params) ;
		
		if ( typeof me.json_cache[url] != 'undefined' ) {
			if ( me.json_cache[url].key == key ) {
				callback_success ( me.json_cache[url].result ) ;
				callback_always() ;
				return ;
			}
			me.json_cache[url] = {} ;
		}

		if ( use_callback ) {
			$.get ( url , params , function ( d ) {
				if ( do_cache ) me.json_cache[url] = { key : key , result : d } ;
				callback_success ( d ) ;
			} ) . always ( callback_always() ) ;
		} else {
			$.get ( url , params , function ( d ) {
				if ( do_cache ) me.json_cache[url] = { key : key , result : d } ;
				callback_success ( d ) ;
			} , 'json' ) . always ( callback_always() ) ;
		}
	} ,
	

	uploadURL2Commons : function ( url , title , desc , comment , pic ) {
		var me = this ;
		var params = {
			action:'upload',
			newfile:title,
			url:url,
			desc:desc,
			comment:comment,
			botmode:1
		} ;
	
	
		$.post ( '/magnustools/oauth_uploader.php?rand='+Math.random() , params , function ( d ) {
			$('#pleaseWaitDialog').modal('hide') ;
			
			if ( d.error == 'OK' ) {

				// Remove marker from original layer
				pic.marker.closePopup() ;
				pic.marker.unbindPopup() ;
				me.layers[pic.layer_key].removeLayer(pic.marker) ;

				// Add marker to Commons layer
				var new_file_name = d.res.upload.filename ;
				var new_pic = me.addWikimediaEntry ( 'commons' , 'commons.wikimedia.org' , {
					lat:pic.pos[0],
					lon:pic.pos[1],
					title:new_file_name,
					ns:6 ,
					pageid:'dummy_'+new_file_name
				} ) ;
				new_pic.marker.openPopup() ;

			} else {
				var s = [ d.error ] ;
				$.each ( (((d.res||{}).upload||{}).warnings||{}) , function ( k3 , v3 ) {
					if ( typeof v2 == 'array' ) {
						s.push ( k3 + ': ' + v3.join('; ') ) ;
					} else {
						s.push ( k3 + ': ' + v3 ) ;
					}
				} ) ;
				if ( typeof (((d.res||{}).error||{}).info) != 'undefined' ) s.push ( d.res.error.info ) ;
				
				alert ( "Transfer failed: " + s.join('; ') ) ;
				console.log ( s ) ;
			}

		} , 'json' )

		.fail(function(x) {
			alert ( "Transfer failed" ) ;
			console.log ( x ) ;
		});		
	
	} ,

	transferFlickr2Commons : function ( popup , flickr_id ) {
		var me = this ;
		var pic_num ;
		$.each ( me.flickr_pics , function ( k , v ) {
			if ( v.flickr_id != flickr_id ) return ;
			pic_num = k ;
			return false ;
		} ) ;
		if ( typeof pic_num == 'undefined' ) {
			console.log ( 'Flickr pic ' + flickr_id + ' not in cache' ) ;
			return false ;
		}
		var pic = me.flickr_pics[pic_num] ;
	
		var params = {
			id : flickr_id ,
			raw : 'on' ,
			format : 'json'
		} ;
	
		params.categories = ' ' ; // No auto categories

		$('#pleaseWaitDialog').modal() ;

		wsm_comm.getFlinfo ( params , function ( d ) {
			if ( undefined === d.wiki || d.wiki.status != 0 ) {
				var err = "Flinfo: " + d.wiki.status ;
				console.log ( err ) ;
				$('#pleaseWaitDialog').modal('hide') ;
				return ;
			}

			var final_desc = ( d.wiki.info.desc || '' ) ;
		
			var w = "== {{int:filedesc}} ==\n" ;
			w += "{{Information\n" ;
			w += "| Description = " + final_desc + "\n" ;
			w += "| Source      = " + ( d.wiki.info.source || '' ) + "\n" ;
			w += "| Date        = " + ( d.wiki.info.date || '' ) + "\n" ;
			w += "| Author      = " + ( d.wiki.info.author || '' ) + "\n" ;
			w += "| Permission  = " + ( d.wiki.info.permission || '' ) + "\n" ;
			w += "| other_versions=\n" ;
			w += "}}\n" ;
		
			if ( undefined !== d.wiki.geolocation && undefined !== d.wiki.geolocation.latitude ) {
				w += "{{Location dec|" + d.wiki.geolocation.latitude + "|" + d.wiki.geolocation.longitude + "|source:" + d.wiki.geolocation.source + "}}\n" ;
			} else {
				w += "{{Location dec|" + pic.pos[0] + "|" + pic.pos[1] + "|source:Flickr}}\n" ;
			}
		
			w += "\n=={{int:license-header}}==\n" ;
			$.each ( ( d.wiki.licenses || [] ) , function ( k , v ) {
				w += "{{" + v + "}}\n" ;
			} ) ;
		
			w += "\n" ;
			$.each ( ( d.wiki.categories || [] ) , function ( k , v ) {
				w += "[[" + v + "]]\n" ;
			} ) ;
		
			w = $.trim ( w ) ;
			
			var title = $.trim(pic.label) ;
			if ( title == '' || title.match(/^(IMG|DSC){0,1}[0-9 _]*$/) ) title = 'Flickr image' ;
			title += ' ' + flickr_id ;
			title += '.jpg' ;
			
			var comment = 'Transferred from Flickr via [https://wikishootme.toolforge.org WikiShootMe] #wikishootme' ;
		
			me.uploadURL2Commons ( pic.url_best , title , w , comment , pic ) ;
		
		} , 'json' ) ;

		return false ;
	} ,

	loadFlickrLayer2 : function () {
		var me = this ;

		var b = me.map.getBounds() ;
		var sw = b.getSouthWest() ;
		var ne = b.getNorthEast() ;

		var params = {
			method:'flickr.photos.search',
			api_key:me.flickr_api_key,
			license:'4,5,7,8,9,10',
			sort:'interestingness-desc',
			bbox:b.toBBoxString(),
			nojsoncallback:1,
			per_page:250,
			extras:'description,geo,url_s,url_o,url_l,url_m',
			format:'json'
		} ;

		var me = this ;
		me.loadCachedJSON ( 'https://api.flickr.com/services/rest/' , params , function ( d ) {
			me.flickr_pics = [] ;
			var bgcol = me.colors['flickr'] ;
			$.each ( d.photos.photo , function ( k , v ) {
				if ( v.ispublic != 1 ) return ;
				var i = {
					flickr_id : v.id ,
					mode:'flickr',
					label:v.title,
					description:v.description['_content'],
					thumburl:v.url_s,
					layer_key:'flickr',
					pos:[v.latitude,v.longitude],
					url:'https://www.flickr.com/photos/'+v.owner+'/'+v.id
				} ;
				if ( undefined !== v.url_o ) i.url_best = v.url_o ;
				else if ( undefined !== v.url_l ) i.url_best = v.url_l ;
				else if ( undefined !== v.url_m ) i.url_best = v.url_m ;
				else return ; // No good resolution available
				var pos = [ v.latitude*1 , v.longitude*1 ] ;
				var marker = L.circleMarker ( pos , { stroke:true,color:bgcol,weight:1,fill:true,fillColor:bgcol,fillOpacity:me.opacity } ) ;
				marker.setRadius ( me.marker_radius['flickr'] ) ;
				marker.bindPopup ( me.createPopup ( i ) ) ;
				me.layers[i.layer_key].addLayer ( marker ) ;
				i.marker = marker ;
				me.flickr_pics.push ( i ) ;
			} ) ;
		} ) ;
	} ,
	
	loadFlickrLayer : function () {
		var me = this ;

		// Load Flickr key, if necessary
		if ( typeof me.flickr_api_key == 'undefined' ) {
			wsm_comm.getFlickrKey ( function ( d ) {
				me.flickr_api_key = $.trim(d) ;
				me.loadFlickrLayer2() ;
			} ) ;
		} else {
			me.loadFlickrLayer2() ;
		}

	} ,
	
	loadMixNMatchLayer : function () {
		var me = this ;

		var b = me.map.getBounds() ;
		var sw = b.getSouthWest() ;
		var ne = b.getNorthEast() ;

		var params = {
			query : 'locations' ,
			bbox:b.toBBoxString()
		} ;
//		console.log ( params ) ;

		me.loadCachedJSON ( 'https://mix-n-match.toolforge.org/api.php?callback=?' , params , function ( d ) {
//			console.log ( d ) ;
			me.mixnmatch_entries = [] ;
			var bgcol = me.colors['mixnmatch'] ;
			$.each ( d.data , function ( k , v ) {
				var i = {
					entry : v.entry_id ,
					catalog : v.catalog ,
					label:v.ext_name,
					layer_key:'mixnmatch',
					description:v.ext_desc,
					pos:[v.lat,v.lon],
					mixnmatch:{q:v.q,user:v.user,ext_url:v.ext_url||''},
					url:'https://mix-n-match.toolforge.org/#/entry/'+v.entry_id
				} ;
				var pos = [ v.lat*1 , v.lon*1 ] ;
				var marker = L.circleMarker ( pos , { stroke:true,color:bgcol,weight:1,fill:true,fillColor:bgcol,fillOpacity:me.opacity } ) ;
				marker.setRadius ( me.marker_radius['mixnmatch'] ) ;
				marker.bindPopup ( me.createPopup ( i ) ) ;
				me.layers[i.layer_key].addLayer ( marker ) ;
				i.marker = marker ;
				me.mixnmatch_entries.push ( i ) ;
			} ) ;
		} ) ;
	} ,

	loadMixNMatchLCLayer : function () {
		var me = this ;
		//if ( me.zoom_level <= 14 ) return ; // Hardcoded max zoom out

		var b = me.map.getBounds() ;
		var sw = b.getSouthWest() ;
		var ne = b.getNorthEast() ;

		var params = {
			action : 'bbox' ,
			slim:1,
			bbox:b.toBBoxString()
		} ;
//		console.log ( params ) ;

		me.loadCachedJSON ( 'https://mix-n-match.toolforge.org/lc_api.php?callback=?' , params , function ( d ) {
//			console.log ( d ) ;
			me.mnm_lc_entries = [] ;
			var bgcol = me.colors['mnm_lc'] ;
			$.each ( d.data , function ( k , v ) {
				let catalog = d.catalogs[v.catalog] ;
				let html = "" ;
				var i = {
					entry : v.ext_id ,
					catalog : v.catalog ,
					label:(v.name||v.title||'Entry '+v.ext_id),
					layer_key:'mnm_lc',
					description:catalog.name,
					html:html,
					pos:[v.latitude,v.longitude],
					url:catalog.formatter_url.replace(/\$1/,v.ext_id)
				} ;
				var pos = [ v.latitude*1 , v.longitude*1 ] ;
				var marker = L.circleMarker ( pos , { stroke:true,color:bgcol,weight:1,fill:true,fillColor:bgcol,fillOpacity:me.opacity } ) ;
				marker.setRadius ( me.marker_radius['mnm_lc'] ) ;
				marker.bindPopup ( me.createPopup ( i ) ) ;
				me.layers[i.layer_key].addLayer ( marker ) ;
				i.marker = marker ;
				me.mnm_lc_entries.push ( i ) ;
			} ) ;
		} ) ;
	} ,
		
	loadWikidataLayer : function () {
		var me = this ;
		var b = me.map.getBounds() ;
		var ne = b.getNorthEast() ;
		var sw = b.getSouthWest() ;
		var sparql = "#TOOL: WikiShootMe\n" ;
		sparql += 'SELECT ?q ?qLabel ?location ?image ?reason ?desc ?commonscat ?street WHERE { ' ;
		if ( me.worldwide ) {
			if ( !me.sparql_filter.match(/\?location\b/) ) sparql += "?q wdt:P625 ?location . " ;
		} else {
			if ( !me.sparql_filter.match(/\?location\b/) ) sparql += 'SERVICE wikibase:box { ?q wdt:P625 ?location . ' ;
			sparql += 'bd:serviceParam wikibase:cornerSouthWest "Point('+sw.lng+' '+sw.lat+')"^^geo:wktLiteral . ' ;
			sparql += 'bd:serviceParam wikibase:cornerNorthEast "Point('+ne.lng+' '+ne.lat+')"^^geo:wktLiteral } ' ;
		}
		sparql += me.sparql_filter ;
		sparql += ' OPTIONAL { ?q wdt:P18 ?image } ' ;
		sparql += ' OPTIONAL { ?q wdt:P373 ?commonscat } ' ;
		sparql += ' OPTIONAL { ?q wdt:P969 ?street } ' ;
		if ( me.check_reason_no_image ) sparql += 'OPTIONAL { ?q p:P18 ?statement . ?statement pq:P828 ?reason } ' ;
		
		if ( me.worldwide ) {
			sparql += ' OPTIONAL { ?q rdfs:label ?qLabel . FILTER(LANG(?qLabel) = "'+me.language+'") } OPTIONAL { ?q schema:description ?desc . FILTER(LANG(?desc) = "'+me.language+'") } ' ;
		} else {
			sparql += ' SERVICE wikibase:label { bd:serviceParam wikibase:language "'+me.language+',en,de,fr,es,it,nl" . ?q schema:description ?desc . ?q rdfs:label ?qLabel } ' ;
		}
		sparql += "} LIMIT " + (me.worldwide?10000:3000) ;


		me.loadCachedJSON ( me.sparql_url , {
			query:sparql
		} , function ( d ) {
			if ( typeof d == 'undefined' || typeof d.results == 'undefined' || typeof d.results.bindings == 'undefined' ) return ;
			$.each ( d.results.bindings , function ( dummy , item ) {
				if ( item.q.type != 'uri' ) return ;
				var q = item.q.value.replace ( /^.+\// , '' ) ;
				if ( typeof me.entries.wikidata[q] != 'undefined' ) return ; // Multiple locations/images; use first one only
				
				var col ;
				var opacity = me.opacity ;
				
				var i = {
					page:q ,
					label:q ,
					mode:'wikidata' ,
					url:'https://www.wikidata.org/wiki/' + q ,
					ns:0
				} ;
			
				if ( typeof item.image != 'undefined' ) {
					if ( item.image.type == 'uri' ) {
						i.image = decodeURIComponent ( item.image.value.replace(/^.+\//,'') ) ;
					}
				} else if ( me.check_reason_no_image && typeof item.reason != 'undefined' && item.reason.type == 'uri' ) {
					var reason = item.reason.value.replace(/^.+\//,'') ;
					if ( reason == 'Q15687022' ) {
						col = me.colors.no_image_copyright ;
						opacity = 1 ;
						i.note = me.tt.t('no_image_copyright') ;
						i.no_image = true ;
					} else {
						return ; // No value for other reasons, don't show (probably futile)
					}
				}

				if ( typeof item.qLabel != 'undefined' && item.qLabel.type == 'literal' ) i.label = item.qLabel.value ;
				if ( typeof item.commonscat != 'undefined' && item.commonscat.type == 'literal' ) i.commonscat = item.commonscat.value ;
				if ( typeof item.street != 'undefined' && item.street.type == 'literal' ) i.street = item.street.value ;
				if ( typeof item.desc != 'undefined' && item.desc.type == 'literal' ) i.description = item.desc.value ;
				if ( typeof item.location != 'undefined' && item.location.type == 'literal' && item.location.datatype == "http://www.opengis.net/ont/geosparql#wktLiteral" ) {
					var m = item.location.value.match ( /^Point\((.+?)\s(.+?)\)$/ ) ;
					if ( m != null ) i.pos = [ m[2]*1 , m[1]*1 ] ;
				}
			
				if ( typeof i.pos == 'undefined' ) return ;
			
				var has_image = ( typeof i.image != 'undefined' ) ;
				if ( typeof col == 'undefined' ) col = has_image ? me.colors.wikidata_image : me.colors.wikidata_no_image ;
				var marker = L.circleMarker ( i.pos , {  stroke:true,color:col,weight:1,fill:true,fillColor:col,fillOpacity:opacity } ) ;
				marker.setRadius ( me.marker_radius.wikidata ) ;
				marker.bindPopup ( me.createPopup ( i ) ) ;
				if ( has_image ) me.layers.wikidata_image.addLayer(marker);
				else me.layers.wikidata_no_image.addLayer(marker);
				i.marker = marker ;
				me.entries.wikidata[q] = i ;
			} ) ;
		
		} ) ;
	} ,

	updateMarkerMe : function ( p ) {
		var me = this ;
		if ( !navigator.geolocation ) return ;
		if ( typeof me.marker_me == 'undefined' ) {
			me.marker_me = L.circleMarker ( [p.lat,p.lng] , {  stroke:true,color:me.colors.me,weight:1,fill:true,fillColor:me.colors.me,fillOpacity:me.opacity } ) ;
			me.marker_me.setRadius ( me.marker_radius.me ) ;
			me.marker_me.bindPopup ( L.popup().setContent(me.tt.t('we_know')) ) ;
			me.marker_me.addTo ( me.map ) ;
			return ;
		}
		me.marker_me.setLatLng ( [ p.lat , p.lng ] ) ;
	} ,
	
	loadLayer : function ( key ) {
		var me = this ;
		var is_visible = (-1 != $.inArray ( key , me.show_layers )) ;
		if ( key == 'wikidata' && !is_visible ) is_visible = (-1!=$.inArray('wikidata_image',me.show_layers )) || (-1!=$.inArray('wikidata_no_image',me.show_layers )) ;
		if ( !is_visible ) {
			me.setBusy(1) ;
			setTimeout ( function () { me.setBusy(-1) } , 10 ) ;
			return ;
		}
		
		if ( key.match(/^wikidata_/) ) key = 'wikidata' ;
		
		if ( key == 'wikidata' ) me.loadWikidataLayer() ;
		if ( key == 'commons' ) me.loadWikimediaLayer ( 'commons.wikimedia.org' , 'commons' ) ;
		if ( key == 'wikipedia' ) me.loadWikimediaLayer ( me.language+'.wikipedia.org' , 'wikipedia' ) ;
		if ( key == 'flickr' ) me.loadFlickrLayer () ;
		if ( key == 'mixnmatch' ) me.loadMixNMatchLayer () ;
		if ( key == 'mnm_lc' ) me.loadMixNMatchLCLayer () ;
		me.updatePermalink() ;
	} ,
	
	updateLayers : function () {
		var me = this ;
		$('#update').hide() ;
		//me.cleanLayers() ;
		
		$.each ( ['commons','wikipedia','wikidata','flickr','mixnmatch','mnm_lc'] , function ( k , v ) {
			me.loadLayer ( v ) ;
		} ) ;
	} ,
	
	updateToCurrent : function () {
		var me = this ;
		var b = me.map.getBounds() ;
		me.pos = b.getCenter() ;
		me.updateLayers() ;
	} ,
	
	updateMaybe : function () {
		var me = this ;
		var z = me.map.getZoom() ;
		if ( z > 12 ) me.updateToCurrent() ;
		else $('#update').show() ;
	} ,
	
	gps2leaflet : function ( gps ) {
		return { lat:gps.latitude , lng:gps.longitude } ;
	} ,
	
	addMarkerMe : function () {
		var me = this ;
		if ( navigator.geolocation ) {
			me.updateMarkerMe ( me.pos ) ;
			navigator.geolocation.watchPosition(function(position) { me.updateMarkerMe ( me.gps2leaflet(position.coords) ) } ) ;
		}
	} ,
	
	addNewWikidataItem : function ( q , label , pos , image ) {
		var me = this ;
		var i = {
			page:q ,
			label:label ,
			mode:'wikidata' ,
			url:'https://www.wikidata.org/wiki/' + q ,
			pos:[pos.lat,pos.lng],
			ns:0
		} ;
		
		var layer = 'wikidata_no_image' ;
		if ( typeof image != 'undefined' && image != '' ) {
			layer = 'wikidata_image' ;
			i.image = image ;
		}

		var col = me.colors[layer] ;
		var marker = L.circleMarker ( i.pos , {  stroke:true,color:col,weight:1,fill:true,fillColor:col,fillOpacity:me.opacity } ) ;
		marker.setRadius ( me.marker_radius.wikidata ) ;
		marker.bindPopup ( me.createPopup ( i ) ) ;
		me.layers[layer].addLayer(marker);

		i.marker = marker ;
		me.entries.wikidata[q] = i ;
		// me.pingLayer ( layer ) ;
		return marker ;
	} ,
	
	createMap : function () {
		var me = this ;
		if ( me.map_is_set ) return false ; // No map created
		
		// Create the map
		me.map_is_set = true ;
		me.map = L.map('map', {
			contextmenu: true,
			contextmenuWidth: 250,
			contextmenuItems: [{
				text:me.tt.t('create_new_item_from_coordinate'),
				callback: function ( ev ) { me.createNewItem ( { pos:ev.latlng, label_default:''} ) }
			},{
				text:me.tt.t('show_coordinates'),
				callback: function ( ev ) { alert(ev.latlng); }
			}]
		}).setView ( [ me.pos.lat , me.pos.lng ] , me.zoom_level ) ;
		
		var tl = me.tile_layers[me.current_tile_layer] ;
		if ( typeof tl == 'undefined' ) tl = me.tile_layers['osm'] ; // Default fallback

		var tlo = {
      attribution: tl.attribution,
      maxZoom: 20,
      maxNativeZoom: 18,
    };

		$.each ( ['subdomains'] , function ( k , v ) {
			if ( typeof tl[v] == 'undefined' ) return ;
			tlo[v] = tl[v] ;
		} ) ;
		L.tileLayer(tl.url, tlo).addTo(me.map);
		me.map.on ( 'viewreset' , function () { me.updateMaybe() } ) ;
		me.map.on ( 'zoomend' , function () {
			var z = me.map.getZoom() ;
			if ( z > me.zoom_level ) {
				me.zoom_level = z ; // No need to reload data
				me.updatePermalink() ;
			} else {
				me.updateMaybe() ;
			}
		} ) ;
		me.map.on ( 'dragend' , function () { me.updateToCurrent() } ) ;
		
		
		// Pop-up open handler, loads pageimage for Wikipedia
		me.map.on ( 'popupopen' , function ( pe ) {

      // TODO: get acces to the entry or popup-label
      //console.log( pe );

			var popup = pe.popup ;
			var c = popup.getContent() ;
			if ( c == me.tt.t('we_know') ) return ;
			c = $(c) ;
			
			c.find('div.transfer2flickr').each ( function () { // Flickr transfer function
				var div = $(this) ;
				var html_do_upload = "<a href='#' onclick='wikishootme.transferFlickr2Commons(this,\""+div.attr('flickr_id')+"\");return false'>Transfer from Flickr to Commons</a>" ;
				if ( wsm_comm.oauth_uploader_login ) {
					div.html ( html_do_upload ) ;
					h = c.html() ;
					popup.setContent ( h ) ;
				} else {
          /*
					$.get ( '/magnustools/oauth_uploader.php?action=checkauth&botmode=1' , function ( d ) {
						if ( d.error == 'OK' ) {
							wsm_comm.oauth_uploader_login = true ;
							div.html ( html_do_upload ) ;
						} else {
							div.html ( d.error ) ;
						}
						h = c.html() ;
						popup.setContent ( h ) ;
					} , 'json' ) ;
          */
				}
			} ) ;

			
			c.find('div.pageimage_toload').each ( function () { // Lazy-load Commons image
				var div = $(this) ;

				var server = div.attr ( 'server' ) ;

        //console.log( server );

				var page = div.attr ( 'page' ) ;
				var url = 'https://'+server+'/w/api.php?callback=?' ;
				$.getJSON ( url , {
					action:'mobileview',
					page:page,
					prop:'image',
					thumbsize:me.thumb_size,
					format:'json'
				} , function ( d ) {
					if ( typeof d.mobileview == 'undefined' || typeof d.mobileview.image == 'undefined' ) return ;

          //console.log( d ); 

					var h = me.createImageThumbnail ( d.mobileview.image.file ) ;
					div.replaceWith ( h ) ;
					h = c.html() ;
					popup.setContent ( h ) ;
				} ) ;
			} ) ;
		} ) ;
		

		// Create layers
		$.each ( me.layer_info.key2name , function ( key , name ) {
			name = "<div style='display:inline-block;background-color:"+me.colors[key]+";border:1px solid "+me.colors[key]+";width:12px;height:12px;padding-top:3px;padding-right:3px;opacity:"+me.opacity+";'></div> " + name ;
			me.layer_info.key2name[key] = name ;
			me.layer_info.name2key[name] = key ;
			me.layers[key] = L.featureGroup() ;
			me.overlays[name] = me.layers[key] ;
			if ( -1 != $.inArray ( key , me.show_layers ) ) {
				me.layers[key].addTo ( me.map ) ;
			}
		} ) ;
		me.layer_control = L.control.layers(null, me.overlays).addTo(me.map);
		
		me.map.on('overlayadd', function(e){me.onOverlayAdd(e)});
		me.map.on('overlayremove', function(e){me.onOverlayRemove(e)});

		me.addMarkerMe() ;
		return true ;
	} ,
	
	createNewItem : function ( o ) {
		var me = this ;
		if ( typeof o.label_default == 'undefined' ) o.label_default = '' ;
		if ( typeof o.image == 'undefined' ) o.image = '' ;
		var rlat = Math.round ( o.pos.lat * 10000 ) / 10000 ;
		var rlng = Math.round ( o.pos.lng * 10000 ) / 10000 ;
		var label = prompt ( me.tt.t ( 'create_new_item' , {params:[rlat,rlng]} ) , o.label_default ) ;
		if ( label == null || label == '' ) return ;
		
		me.getAdminUnit ( o.pos.lat , o.pos.lng , function ( p131 ) {
			wsm_comm.getWSM ( {
				action:'new_item',
				lat:o.pos.lat,
				lng:o.pos.lng,
				p131:p131,
				p18:o.image,
				label:label,
				lang:me.language
			} , function ( d ) {
				if ( d.status != 'OK' ) {
					alert ( "ERROR: " + d.status ) ;
					return ;
				}
				var marker = me.addNewWikidataItem ( d.q , label , o.pos , o.image ) ;
				marker.openPopup() ;
			} ) ;
		} ) ;
	} ,
	
	onOverlayAdd : function ( ev ) {
		var me = this ;
		var key = me.layer_info.name2key[ev.name] ;
		me.show_layers.push ( key ) ;
		me.show_layers = me.show_layers.sort() ;
		me.updatePermalink() ;
		me.loadLayer ( key ) ;
	} ,
	
	onOverlayRemove : function ( ev ) {
		var me = this ;
		var key = me.layer_info.name2key[ev.name] ;
		me.show_layers = $.grep ( me.show_layers , function(value) { return value != key; });
		me.show_layers = me.show_layers.sort() ;
		me.updatePermalink() ;
	} ,
	

	setMap : function () {
		var me = this ;
		if ( !me.createMap() ) {
			me.map.setView ( [ me.pos.lat , me.pos.lng ] , me.zoom_level ) ;
		}
		me.updateLayers() ;
	} ,
	
	setPositionFromQ : function ( q ) {
		var me = this ;
		var sparql = "#TOOL: WikiShootMe\n" ;
		sparql += 'SELECT ?qc ?qcau { wd:'+q+' wdt:P625 ?qc OPTIONAL { wd:'+q+' wdt:P131 ?au . ?au wdt:P625 ?qcau } }'
		$.get ( me.sparql_url , {
			query:sparql
		} , function ( d ) {
			var found = false ;
			if ( typeof d == 'undefined' || typeof d.results == 'undefined' || typeof d.results.bindings == 'undefined' ) return me.setPositionFromCurrentLocation() ;
			$.each ( d.results.bindings , function ( dummy , v ) {
				var m = v.qc.value.match ( /^Point\((.+?)\s(.+?)\)$/ ) ; // Try item coordinates
				if ( m == null ) m = v.qcac.value.match ( /^Point\((.+?)\s(.+?)\)$/ ) ; // No luck, try admin unit coordinates
				if ( m == null ) return ;
				me.pos = { lat:m[2]*1 , lng:m[1]*1 } ;
				found = true ;
				return false ;
			} ) ;
			if ( found ) me.setMap() ;
			else me.setPositionFromCurrentLocation() ;
		} , 'json' ) ;
	} ,

	setPositionToMyLocation : function () {
		var me = this ;
		if ( typeof me.marker_me == 'undefined' ) return ; // Paranoia
		me.pos = me.marker_me.getLatLng() ;
		me.setMap() ;
	} ,
	
	setPositionFromCurrentLocation : function () {
		var me = this ;
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition ( function (p) {
				me.pos = me.gps2leaflet(p.coords) ;
				me.setMap() ;
			} , function ( error ) {
				var msg ;
				switch(error.code) {
					case error.PERMISSION_DENIED:
						msg = "User denied the request for Geolocation."
						break;
					case error.POSITION_UNAVAILABLE:
						msg = "Location information is unavailable."
						break;
					case error.TIMEOUT:
						msg = "The request to get user location timed out."
						break;
					case error.UNKNOWN_ERROR:
						msg = "An unknown error occurred."
						break;
				}
				$('#geo_error').text ( msg ) ;
			} ) ;
		} else {
			me.setMap() ;
		}
	} ,
	
	doSearch : function () {
		var me = this ;
		var query = $('#search_query').val() ;
		$('#search_results_list').html('') ;

		wsm_comm.searchWikidata ( {
			action:'query',
			list:'search',
			srsearch:query,
			srlimit:25,
			srprop:'',
			format:'json'
		} , function ( d ) {
			var qs_all = [] ;
			$.each ( d.query.search , function ( k , v ) { qs_all.push ( v.title ) } ) ;
			
			me.wd.getItemBatch ( qs_all , function () {
				var qs = [] ;
				$.each ( qs_all , function ( dummy , q ) {
					var i = me.wd.getItem ( q ) ;
					if ( typeof i == 'undefined' ) return ;
					if ( !i.hasClaims('P625') && !i.hasClaims('P131') ) return ; // No coords or admin unit, useless
					var p31 = i.getClaimItemsForProperty('P31',true) ;
					if ( -1 != $.inArray ( 'Q13406463' , p31 ) ) return ; // Bad instance
					qs.push ( q ) ;
				} ) ;
				
				var h = '' ;
				$.each ( qs , function ( dummy , q ) {
					h += '<li class="list-group-item sr_result" q="'+q+'" id="sr_'+q+'">' ;
					h += "<div class='sr_title'></div>" ;
					h += "<div class='sr_auto'></div>" ;
					h += "<div class='sr_manual'></div>" ;
					h += '</li>' ;
				} ) ;
			
				$('#search_results_list').html(h) ;
				$('#search_results').show() ;
			
				$('#search_results_list li.sr_result').click ( function () {
					var q = $(this).attr ( 'q' ) ;
					$('#search_dialog').modal ( 'hide' ) ;
					me.setPositionFromQ ( q ) ;
					return false ;
				} ) ;
			
				$.each ( qs , function ( dummy , q ) {
					wsm_comm.getAutodesc ( {
						q:q,
						lang:me.language,
						mode:'short',
						links:'text',
						format:'json'
					} , function ( d ) {
						var id = 'sr_'+q ;
						if ( typeof d.result == 'undefined' ) {
							$('#'+id+' div.sr_title').text ( q ) ;
						} else {
							$('#'+id+' div.sr_title').text ( d.label ) ;
							$('#'+id+' div.sr_manual').text ( d.manual_description ) ;
							$('#'+id+' div.sr_auto').text ( d.result ) ;
						}
					} , 'json' ) ;				
				} ) ;
			} ) ;
			
		} ) ;
	} ,
	
	// Checks the administrative unit of the surrounding items, calls back with the first one (ordered by distance) that reaches 5, or ''
	getAdminUnit : function ( lat , lng , callback ) {
		var me = this ;
		var min_cnt = 5 ;

		var p131 = '' ;
		var radius = 2 ;
		var sparql = "#TOOL: WikiShootMe\n" ;
		sparql += 'SELECT ?dist ?unit WHERE { ?place wdt:P131 ?unit .' ;
		sparql += ' SERVICE wikibase:around { ?place wdt:P625 ?location . bd:serviceParam wikibase:center "Point('+lng+' '+lat+')"^^geo:wktLiteral . bd:serviceParam wikibase:radius "'+radius+'" . bd:serviceParam wikibase:distance ?dist } }' ;
		sparql += ' ORDER BY ASC(?dist) LIMIT 50' ;
		$.get ( me.sparql_url , {
			query:sparql
		} , function ( d ) {
			if ( typeof d == 'undefined' || typeof d.results == 'undefined' || typeof d.results.bindings == 'undefined' ) return ;
			var cnt = {} ;
			$.each ( d.results.bindings , function ( k , v ) {
				if ( v.unit.type != 'uri' ) return ;
				var m = v.unit.value.match ( /^.+\/(Q\d+)$/ ) ;
				if ( m == null ) return ;
				var q = m[1] ;
				if ( typeof cnt[q] == 'undefined' ) cnt[q] = 0 ;
				cnt[q]++ ;
				if ( cnt[q] < min_cnt ) return ;
				p131 = q ;
				return false ;
			} ) ;
		} , 'json' ) . always ( function () {
			callback ( p131 ) ;
		} ) ;
	} ,

	init : function () {
		var me = this ;
		me.wd = new WikiData ;

		if( window.FormData !== undefined ) me.upload_mode = 'upload_background' ;

		// Logging
		//$.getJSON ( 'https://tools.wmflabs.org/magnustools/logger.php?tool=wikishootme&method=loaded&callback=?' , function(j){} ) ;

		var params = me.getHashVars() ;
		if ( params.worldwide == '1' ) me.worldwide = true ;

    //console.log( params );
    lang = params.interface_language;
    me.language = lang ;
    //console.log( lang );

		var running = 2 ;
		function fin () {
			running-- ;
			if ( running > 0 ) return ;
			me.tt.addILdropdown ( $('#interface_language_wrapper') ) ;
			
			if ( isMobile() ) {
				// Larger markers for fat thumbs
				$.each ( me.marker_radius , function ( k , v ) {
					me.marker_radius[k] = v * 3 / 2 ;
				} )
			}
			
			if (navigator.geolocation) {
				$('#center_on_me').click ( function() { me.setPositionToMyLocation() } ) ;
			} else {
				$('#center_on_me').hide() ;
			}
			
			$('#update').click ( function () { me.updateLayers() ; } ) ;
			
			
			// Search dialog things
			$('#search').click ( function () {
				$('#search_dialog').modal ( {
				} ) ;
			} ) ;
			$('#search_form').submit ( function (evt) {
				evt.preventDefault();
				me.doSearch() ;
				return false ;
			} ) ;
			$('#search_dialog').on('shown.bs.modal', function () {
				$('#search_query').focus()
			})


			// Init layers
			$.each ( me.layer_info.key2name , function ( key , name ) {
				me.show_layers.push ( key ) ;
			} ) ;
			me.show_layers = me.show_layers.sort() ;

			me.show_layers = $.grep ( me.show_layers , function(value) { return value != 'flickr' && value != 'mixnmatch' && value != 'mnm_lc' ; }); // Do not show Flickr or Mix'n'match layer by default
			if ( wsm_comm.is_app ) { // Only WIkidata by default for app
				me.show_layers = $.grep ( me.show_layers , function(value) { return value != 'wikipedia' && value != 'commons'; });
			}
			me.show_layers = me.show_layers.sort() ;
			me.full_layers = me.show_layers.join(',') ;
			
			
			// Check URL parameters
			var rewrite_v2_parameters = { // old:new
				lon:'lng',
				item:'q',
				lang:'interface_language',
				language:'interface_language'
			} ;
			$.each ( rewrite_v2_parameters , function ( k , v ) {
				if ( typeof params[k] != 'undefined' && typeof params[v] == 'undefined' ) params[v] = params[k] ;
			} ) ;

			if ( typeof params.tiles != 'undefined' ) me.current_tile_layer = params.tiles.replace(/ /g,'_') ;
			if ( 1 ) {
				var h = '' ;
				h += "<select title='select map type' class='form-control' id='tiles'>" ;
				$.each ( me.tile_layers , function ( k , v ) {
					h += "<option" ;
					h += " value='" + k + "'" ;
					if ( me.current_tile_layer == k ) h += " selected" ;
					h += ">" + v.name + "</option>" ;
				} ) ;
				h += "</select>" ;
				$('#tile_wrapper').html ( h ) ;
				$('#tiles').change ( function () {
					me.current_tile_layer = $(this).val() ;
					me.updatePermalink() ;
					location.reload(); 
					return false ;
				} ) ;
			} ;
			
			if ( typeof params.layers != 'undefined' ) {
				me.show_layers = params.layers.replace(/ /g,'_').split(',') ;
				if ( me.show_layers.length == 1 && me.show_layers[0] == '' ) me.show_layers = [] ;
				me.show_layers = me.show_layers.sort() ;
			}
			if ( typeof params.zoom != 'undefined' ) me.zoom_level = params.zoom*1 ;
			if ( typeof params.sparql_filter != 'undefined' ) me.sparql_filter = params.sparql_filter ;
			if ( typeof params.lat != 'undefined' && typeof params.lng != 'undefined' ) { // Set location from lat/lng
				me.pos.lat = params.lat*1 ;
				me.pos.lng = params.lng*1 ;
				me.setMap() ;
				me.addMarkerMe() ;
			} else if ( typeof params.q != 'undefined' && params.q.match(/^Q\d+$/) ) { // Set location from item parameter
				var q = params.q ;
				me.setPositionFromQ ( q ) ;
			} else {
				me.setPositionFromCurrentLocation() ;
			}
		}
		
		// SPARQL filter
		$('#sparql_filter_button').click ( function () {
			$('#sparql_filter_dialog').modal ( 'show' ) ;
			$('#worldwide').prop('checked', me.worldwide?true:false );
			$('#sparql_filter_p31').val ( '' ) ;
			$('#sparql_filter_query').val ( me.sparql_filter ) ;
			return false ;
		} ) ;
		$('#sparql_simple_form').submit ( function ( evt ) {
			evt.preventDefault();
			var p31 = $('#sparql_filter_p31').val().toUpperCase() ;
			if ( !p31.match ( /^Q\d+$/ ) ) {
				alert ( me.tt.t('bad_q_number') ) ;
				return ;
			}
			var sparql = "?q wdt:P31/wdt:P279* wd:" + p31 ;
			$('#sparql_filter_query').val ( sparql ) ;
			return false ;
		} ) ;
		$('#sparql_filter_use').click ( function () {
			me.sparql_filter = $.trim ( $('#sparql_filter_query').val() ) ;
			me.worldwide = $('#worldwide').is(':checked') && $.trim(me.sparql_filter) != '' ;
			$('#sparql_filter_dialog').modal ( 'hide' ) ;
			me.updateLayers() ;
		} ) ;
		$('#sparql_filter_clear').click ( function () {
			me.sparql_filter = $.trim ( '' ) ;
			$('#sparql_filter_dialog').modal ( 'hide' ) ;
			me.updateLayers() ;
		} ) ;
		
		// Load user status
		wsm_comm.checkUserStatus ( function () {
			if ( !wsm_comm.isLoggedIn() ) $('#li_authorize').show() ;
			fin() ;
		} ) ;
		
		// Load translation
		me.tt = new ToolTranslation ( { tool: 'wikishootme' , fallback:'en' , callback : function () {
			fin() ;
		} , onLanguageChange : function ( new_language ) {
			me.language = new_language ;
			me.updateToCurrent() ;
			$('#busy').hide() ;
		} } ) ;

	}

} ;

document.toggleFullscreen = function() {

  if (screenfull.enabled) {
    screenfull.toggle();
  }

  return 0;

};

window.gotoUrl = function( url ){

  //console.log( url );
  //openInNewTab( url );

  window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', url: url, current_pane: getCurrentPane(), target_pane: 'ps2' } }, '*' );

}

window.gotoArticle = function( title, qid ){

  //console.log( title, qid );

  if ( ! qid.startsWith('Q') ){ // invalid qid

    qid = '';

  }

  var url = CONZEPT_WEB_BASE + '/app/wikipedia/?t=' + encodeURIComponent( title ) + '&l=' + lang + '&qid=' + qid ;

  //console.log( url );

  window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: title, url: url, current_pane: getCurrentPane(), target_pane: 'ps2' } }, '*' );

}

keyboardJS.bind('alt+y', function(e) {
  window.parent.postMessage({ event_id: 'toggle-sidebar', data: { } }, '*' );
});


// keyboard control
$(document).keydown(function(event) {

	let key = (event.keyCode ? event.keyCode : event.which);

	//console.log( event, key );

	if ( key == '70' ){ // "f"

    if ( $("input#search_query"). is(":focus")) {

      // do nothing

    }
    else {

		  document.toggleFullscreen();

    }

	}

});
