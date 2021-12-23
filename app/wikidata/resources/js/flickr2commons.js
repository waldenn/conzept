
var flickr2commons = {
	flinfo: 'https://fist.toolforge.org/fist/flinfo/flinfo.php' , // '/flickr2commons/flinfo_proxy.php'
	oauth_uploader_base : 'https://tools.wmflabs.org/magnustools/oauth_uploader.php' ,
	oauth_uploader_api : 'https://tools.wmflabs.org/magnustools/oauth_uploader.php?botmode=1&callback=?' ,
	flickr_api_url : 'https://secure.flickr.com/services/rest' ,
	flickr_api_key : '' ,
	is_authorized : false ,
	userinfo : {} ,
	extras : 'description,license,date_taken,geo,tags,url_o,url_l,url_m,url_q,url_s,path_alias,original_format' ,
	licenses : {
		'4' : 'Attribution License' ,
		'5' : 'Attribution-ShareAlike License' ,
//		'7' : 'No known copyright restrictions' ,
		'8' : 'United States Government Work' ,
		'9' : 'Cc-zero' ,
		'10' : 'Flickr-public domain mark'
	} ,
	checkAuth : function ( callback ) {
		var me = this ;
		if ( me.is_authorized ) return callback ( 'OK' ) ;
		$.get ( me.oauth_uploader_api , {
			action:'get_rights'
		} , function ( d ) {
			me.is_authorized = d.error=='OK' ;
			if ( me.is_authorized ) me.userinfo = d.result.query.userinfo ;
			callback ( d.error ) ;
		},'json') ;
	} ,
	generateFilenameForCommons : function ( file , default_prefix = '"Unnamed Flickr file"' ) {
		var t = file.title ;
		t = t.replace ( /_/g , ' ' ) ;
		t = t.replace ( /[\:\/\|]/g , ' ' ) ;
		t = t.replace ( /\s+/g , ' ' ) ;
		t = $.trim ( t ) ;
		t = t.replace ( /\.(JPG|JPEG|PNG|TIF|TIFF)$/i , '' ) ;
		if ( t.length > 230 ) t = t.substr ( 0 , 230 ) ;
		if ( $.trim(t) == '' ) t = default_prefix ;
		t += " (" + file.id + ")" ;
		t += '.' + file.originalformat.toLowerCase() ;
		t = $.trim(t) ; // Paranoia
		return t ;
	} ,
	resolveUsername : function ( user , callback ) {
		var me = this ;
		var params = {
			method : 'flickr.people.findByUsername' ,
			username : user ,
			api_key : me.flickr_api_key ,
			format : 'json'
		} ;
		$.getJSON ( me.flickr_api_url+'/?jsoncallback=?' , params , function ( d ) {
			if ( d.stat == 'ok' && typeof d.user != 'undefined' && typeof d.user.nsid != 'undefined' ) {
				callback ( d.user.nsid ) ;
			} else { // Can't find NSID, probably the NSID already
				callback ( user ) ;
			}
		} ) . fail ( function () {callback(user)} ) ;
	} ,
	getUserInfo : function ( nsid , callback ) {
		var me = this ;
		var params = {
			method : 'flickr.people.getInfo' ,
			user_id : nsid ,
			api_key : me.flickr_api_key ,
			format : 'json'
		} ;
		$.getJSON ( me.flickr_api_url+'/?jsoncallback=?' , params , function ( d ) {
			if ( d.stat == 'ok' && typeof d.person != 'undefined' ) {
				callback ( d.person ) ;
			} else { // Can't find NSID, probably the NSID already
				callback () ;
			}
		} ) . fail ( function () {callback()} ) ;
	} ,
	resolveGroupName : function ( group , callback ) {
		var me = this ;
		var params = {
			method : 'flickr.groups.getInfo' ,
			group_path_alias : group ,
			api_key : me.flickr_api_key ,
			format : 'json'
		} ;
		$.getJSON ( me.flickr_api_url+'/?jsoncallback=?' , params , function ( d ) {
			if ( d.stat == 'ok' && typeof d.group != 'undefined' && typeof d.group.nsid != 'undefined' ) {
				callback ( d.group.nsid ) ;
			} else { // Can't find NSID, probably the NSID already
				callback ( group ) ;
			}
		} ) ;
	} ,
	getFlickrFiles : function ( params , page , max_pics , tags , callback , results ) {
		var me = this ;
		if ( max_pics == 0 ) max_pics = 999999999 ;
		if ( typeof results == 'undefined' ) results = [] ;

		if ( results.length >= max_pics ) {
			callback ( {
				status:'DONE' ,
				results:results
			} ) ;
			return ;
		}
		
		if ( tags != '' ) {
			params.tags = tags ;
			params.tag_mode = 'all' ;
		}

	//	params.safe_search = 2 ;
		params.api_key = me.flickr_api_key ;
		params.extras = me.extras ;
		params.per_page = max_pics<500?max_pics:500 ;
		params.page = page ;
		params.format = 'json' ;

		var other_pages_running = 0 ;
		var pages_loaded = 0 ;
		var total_pages = 0 ;
		function local_callback () {
			pages_loaded++ ;
			callback ( {
				status:'RUNNING',
				page:pages_loaded,
				pages:total_pages,
				so_far:results.length
			} ) ;
			other_pages_running-- ;
			if ( other_pages_running > 0 ) return ;
			callback ( {
				status:'DONE' ,
				results:results
			} ) ;
		}
		
		$.getJSON ( me.flickr_api_url+'/?jsoncallback=?' , params , function ( d ) {
			if ( d.stat == 'fail' ) {
				$('#loading').hide() ;
				callback ( { status:'ERROR' , error:d.message } ) ;
				return ;
			}
			$.each ( d[params.result_key].photo , function ( k , v ) {
				if ( undefined === me.licenses[v.license] ) return ; // No free license
				
				// Here, we compensate for idiotic Flickr restrictions on free accounts
				if ( undefined !== v.url_o ) v.url_best = v.url_o ;
				else if ( undefined !== v.url_l ) v.url_best = v.url_l ;
				else if ( undefined !== v.url_m ) v.url_best = v.url_m ;
				if ( undefined === v.url_best ) return ; // No usable resolution found
				
				results.push ( v ) ;
				if ( results.length >= max_pics ) return false ;
			} ) ;

			// Load the other pages in parallel
			if ( d[params.result_key].page == 1 && d[params.result_key].pages > 1 && results.length < max_pics ) {
				pages_loaded = 1 ;
				total_pages = d[params.result_key].pages ;
				callback ( {
					status:'RUNNING',
					page:pages_loaded,
					pages:total_pages,
					so_far:results.length
				} ) ;
				for ( var i = 2 ; i <= total_pages ; i++ ) {
					other_pages_running++ ;
					me.getFlickrFiles ( params , i , max_pics , tags , local_callback , results ) ;
				}
			} else {
				callback ( {
					status:'DONE' ,
					results:results
				} ) ;
			}
/*
			if ( d[params.result_key].pages > d[params.result_key].page && results.length < max_pics ) { // Get 'em all
				me.getFlickrFiles ( params , page+1 , max_pics , tags , callback , results ) ;
			}
			else callback ( {
				status:'DONE' ,
				results:results
			} ) ;
*/
		} ) ;
	} ,
	getFileInfoFromFlickr : function ( o , callback ) {
		var me = this ;
		var params = {
			method : 'flickr.photos.getInfo' ,
			photo_id : o.photo_id ,
			api_key : me.flickr_api_key ,
			format : 'json'
		} ;
		$.getJSON ( me.flickr_api_url+'/?jsoncallback=?' , params , function ( d ) {
			callback ( d ) ;
		} ) ;
	} ,
	getExistingCommonsFile : function ( o , callback ) {
		var me = this ;
		me.getFileInfoFromFlickr ( o , function ( d ) {
			if ( d.stat != 'ok' ) {
				o.error = d.message ;
				return callback ( o ) ;
			}
			o.photo = d.photo ;

			var urls = [
				'"'+o.photo.owner.nsid+'" '+o.photo.id+' flickr' ,
				'www.flickr.com/photos/'+o.photo.owner.nsid+'/'+o.photo.id
				] ;
			if ( typeof o.photo.owner.path_alias != 'undefined' ) {
				urls.push ( 'www.flickr.com/photos/'+o.photo.owner.path_alias+'/'+o.photo.id ) ;
				urls.push ( '"'+o.photo.owner.path_alias+'" '+o.photo.id+' flickr' ) ;
			}
			$.each ( ((o.photo.urls|{}).url|[]) , function ( k , v ) {
				urls.push ( v._content ) ;
			} ) ;

			var running = 0 ;
			var had_url = {} ;
			var results = {} ;
			function fin () {
				running-- ;
				if ( running > 0 ) return ;
				var files_on_commons = Object.keys(results) ;
				if ( files_on_commons.length > 0 ) {
					o.filename_on_commons = files_on_commons[0].replace(/^File:/,'') ; // Just picking one
				}
				callback ( o ) ;
			}
			$.each ( urls , function ( dummy , url ) {
				url = url.replace ( /^https{0,1}:\/\// , '' ) ;
				if ( typeof had_url[url] != 'undefined' ) return ;
				had_url[url] = 1 ;
				running++ ;
				$.getJSON ( 'https://commons.wikimedia.org/w/api.php?callback=?' , {
					action:'query',
					list:'search',
					srnamespace:6,
					srsearch:url,
					format:'json'
				} , function ( d ) {
					$.each ( d.query.search , function ( k , v ) {
						results[v.title] = v ;
					} ) ;
				} ) . always ( function () { fin() });
			} )

		})
	} ,
	getFileSizes : function ( o , callback ) {
		var me = this ;
		var params = {
			method : 'flickr.photos.getSizes' ,
			photo_id : o.photo_id ,
			api_key : me.flickr_api_key ,
			format : 'json'
		} ;
		$.getJSON ( me.flickr_api_url+'/?jsoncallback=?' , params , function ( d ) {
			callback ( d ) ;
		} ) ;

	} ,
	getBestSize : function ( o , callback ) {
		var me = this ;
		me.getFileSizes ( o , function ( d ) {
			if ( d.stat != 'ok' ) {
				o.error = d.stat ;
				return callback ( o ) ;
			}
			o.sizes = d.sizes.size ;
			$.each ( o.sizes , function ( k , v ) {
				if ( typeof o.best_size == 'undefined' ) {
					o.best_size = v ;
					return ;
				}
				if ( o.best_size.width*1 >= v.width*1 ) return ;
				o.best_size = v ;
			} ) ;
			if ( typeof o.best_size == 'undefined' ) o.error = 'Could not find any file to transfer from Flickr' ;
			callback ( o ) ;
		} ) ;
	} ,
	createNewFilenameForCommons : function ( o , callback , iter = 0 ) {
		var me = this ;
		var name_base = o.photo.title._content ;
		name_base = name_base.replace ( /[\[\]:\/]/ , '-' ) ;
		if ( name_base.length > 200 ) name_base = name_base.substr(0,200) ;
		if ( name_base == '' || /^IMG_\d+$/.test(name_base) ) name_base = 'File from Flickr ' ;
		name_base += ' (' + o.photo.id + ')' ;
		var full_name = name_base ;
		if ( iter > 0 ) full_name += ' ('+iter+')' ;
		full_name += '.' + (o.photo.originalformat||'jpg') ;
		$.getJSON ( 'https://commons.wikimedia.org/w/api.php?callback=?' , {
			action:'query',
			titles:'File:'+full_name,
			prop:'imageinfo',
			format:'json'
		} , function ( d ) {
			if ( typeof d.query.pages['-1'] != 'undefined' ) {
				o.filename_on_commons = full_name ;
				return callback ( o ) ;
			}
			// Iterate one more
			me.createNewFilenameForCommons ( o , callback , iter+1 ) ;
		} ) ;
	} ,
	uploadUnderAnyName : function ( o , callback ) {
		var me = this ;
		me.getBestSize ( o , function ( o ) {
			if ( o.error != '' ) return callback ( o ) ;
			me.createNewFilenameForCommons ( o , function ( o ) {
				callback ( o ) ;
			} ) ;
		} ) ;
	} ,
	generateInformationTemplate : function ( o , callback ) {
		var me = this ;
		var params = {
			id : o.photo.id ,
			raw : 'on' ,
			repo : 'flickr' ,
			categories : ' ' , // No auto categories
			format : 'json'
		} ;

		$.get ( me.flinfo , params , function ( d ) {
			if ( undefined === d.wiki || d.wiki.status != 0 ) {
				if ( d.wiki.status == 1 ) o.error = "Flinfo server failure. Try again." ;
				else if ( d.wiki.status == 3 ) o.error = "Flinfo internal error." ;
				else if ( d.wiki.status == 3 ) o.error = "File license has changed to non-free! Please click the ✘ on the right to remove the entry." ;
				else if ( d.wiki.status == 4 ) o.error = "Flinfo says 'bad user'." ;
				else if ( d.wiki.status == 5 ) o.error = "Flinfo says 'invalid ID'." ;
				else if ( d.wiki.status == 6 ) o.error = "Flinfo says 'missing ID'." ;
				else o.error = 'FLinfo issue: ' + d.wiki.status ;
				return callback ( o ) ;
			}

			var final_desc = ( d.wiki.info.desc || '' ) ;
			if ( typeof o.new_desc != 'undefined' && o.new_desc != '' ) final_desc = o.new_desc ;
			
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
			}
			
			w += "\n=={{int:license-header}}==\n" ;
			$.each ( ( d.wiki.licenses || [] ) , function ( k , v ) {
				w += "{{" + v + "}}\n" ;
			} ) ;
			
			if ( typeof o.auto_categories == 'undefined' || o.auto_categories ) { // Not set => do auto catgegories, otherwise use value
				w += "\n" ;
				$.each ( ( d.wiki.categories || [] ) , function ( k , v ) {
					w += "[[" + v + "]]\n" ;
				} ) ;
			}
			
			w = $.trim ( w ) ;

			o.information_template = w ;
			callback ( o ) ;
			
		} , 'json' ) ;
	} ,
	uploadFileToCommons : function ( o , callback ) {
		var me = this ;
		if ( !me.is_authorized ) return ;

		var params = {
			action:'upload_from_url',
			newfile:o.filename_on_commons,
			url:o.best_size.source,
			desc:o.information_template,
			ignorewarnings:1,
			comment:'Transferred from Flickr via #'+(o.toolname||widar.toolname),
			rand:Math.random(),
			botmode:1
		} ;
		
		$.post ( me.oauth_uploader_base , params , function ( d ) {
			if ( ''+d.error == 'OK' ) {
				o.filename_on_commons = d.res.upload.filename ;
			} else {
				o.error = d.error ;
				if ( typeof d.res.error != 'undefined' ) {
					o.error = d.res.error.info ;
					if ( d.res.error.code == 'fileexists-no-change' ) {
						var m = d.res.error.info.match ( /\[\[:File:(.+?)\]\]/ ) ;
						if ( m !== null ) {
							o.filename_on_commons = m[1] ;
							o.error = '' ;
						}
					}
				}
			}
			callback(o);
		} , 'json' ) . fail ( function () { o.error = 'Upload failed for unknown reasons' ; callback(o) } );

	} ,
	check_statement : function ( mid , property , target , callback ) {
		$.getJSON ( 'https://commons.wikimedia.org/w/api.php?callback=?' , {
			action:'wbgetentities',
			ids:mid,
			format:'json'
		} , function ( d ) {
			d = d.entities[mid] ;
			if ( typeof d.statements == 'undefined' ) return callback ( false ) ;
			if ( typeof d.statements[property] == 'undefined' ) return callback ( false ) ;
			let has_statement = false ;
			$.each ( d.statements[property] , function ( dummy , statement ) {
				if ( typeof statement.mainsnak == 'undefined' ) return ;
				if ( typeof statement.mainsnak.datavalue == 'undefined' ) return ;
				if ( typeof statement.mainsnak.datavalue.value == 'undefined' ) return ;
				if ( typeof statement.mainsnak.datavalue.value.id == 'undefined' ) return ;
				if ( statement.mainsnak.datavalue.value.id != target ) return ;
				has_statement = true ;
			} ) ;
			callback ( has_statement ) ;
		} ) ;
	} ,
	get_sdc_id_from_name : function ( filename_with_prefix , callback ) {
		let params = {
			action:'query',
			prop:'info',
			titles:filename_with_prefix,
			format:'json'
		} ;
		$.getJSON ( 'https://commons.wikimedia.org/w/api.php?callback=?' , params , function(d) {
			let found = false ;
			$.each ( d.query.pages , function ( page_id , dummy ) {
				found = true ;
				callback ( 'M'+page_id ) ;
			} ) ;
			if ( !found ) callback() ;
		} )
	} ,
	set_sdc_prop_q_rank : function ( sdc_id , property , q , rank , callback ) {
		let data = {claims:[{type:"statement",mainsnak:{snaktype:"value",property:property,datavalue:{type:"wikibase-entityid",value:{id:q}}},rank:rank}]} ;
		var params = {
			action:'wbeditentity',
			id:sdc_id,
			data:JSON.stringify ( data ) ,
			format:'json'
		} ;
		this.sdc(params,callback);
	} ,
	sdc : function ( sdc_params , callback ) {
		let me = this ;
		let params = {
			action:'sdc',
			params:JSON.stringify(sdc_params),
			botmode:1
		} ;
		$.post ( me.oauth_uploader_base , params , function ( d ) {
			callback(d)
		} , 'json' ) ;
	}
} ;
