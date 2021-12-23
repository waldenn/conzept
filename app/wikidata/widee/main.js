var widee = {

	editing : false ,
	widar_url : '/widar/index.php?callback=?' ,
	fade_time : 100 ,
	thumbsize : 110 ,
	sections : [
		[ 'wikibase-item' ] ,
		[ 'commonsMedia' , 'url' , 'globe-coordinate' , 'time' , 'quantity' , 'monolingualtext' , 'string' ]
	] ,
	files : {} ,
	file_cache : {} ,
	files_loaded : false ,

	getUrlVars : function () {
		var vars = {} ;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1) ;
		var hash = window.location.href.slice(window.location.href.indexOf('#') + 1) ;
		if ( hash == window.location.href ) hash = '' ;
		if ( hash.length > 0 ) hashes = hash ;
		else hashes = hashes.replace ( /#$/ , '' ) ;
		hashes = hashes.split('&');
		$.each ( hashes , function ( i , j ) {
			var hash = j.split('=');
			hash[1] += '' ;
			vars[hash[0]] = decodeURI(hash[1]).replace(/_/g,' ');
		} ) ;
		return vars;
	} ,
	
	loadItem : function ( q ) {
		var self = this ;
		self.q = q ;

		self.loading = true ;
		window.location.hash = 'q='+q ;
		
		$('#all_statements').fadeOut(self.fade_time);
		
		if ( typeof self.wd.items[q] != 'undefined' && self.wd.items[q].raw.names_only ) delete self.wd.items[q] ;

		if ( typeof self.wd.items[q] != 'undefined' ) { // Had that loaded as main item once, no need to reload anything
			self.loadStage2() ;
		} else {
//			$.get ( 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids='+q , function ( d ) {
			$.get ( '//www.wikidata.org/wiki/Special:EntityData/'+q+'.json' , function ( d ) {
				$.each ( d.entities , function ( k , v ) {
					self.wd.items[k] = new WikiDataItem ( self.wd , v ) ;
					self.loadStage2() ;
				} ) ;
			} , 'json' ) ;
		}
		

	} ,
	
	loadItemNames : function ( qs , callback ) {
		var self = this ;
		var uniq = [] ;
		var prop = [] ;
		$.each ( qs , function ( dummy , q ) {
			if ( typeof self.wd.items[q] != 'undefined' ) return ; // Have that
			if ( null != q.match(/^[Pp]/) ) prop.push ( q ) ;
			else uniq.push ( q ) ;
		} ) ;
		
		var counter = 0 ;
		function endPoint () {
			counter-- ;
			if ( counter == 0 ) callback() ;
		}

		if ( prop.length > 0 ) { counter++ ; self.loadItemNames2 ( prop , 'P' , endPoint ) ; }
		if ( uniq.length > 0 ) { counter++ ; self.loadItemNames2 ( uniq , 'Q' , endPoint ) ; }
		if ( counter == 0 ) callback() ; // Nothing to do
	} ,
		
	loadItemNames2 : function ( uniq , type , callback ) {
		var self = this ;
		self.wd.getItemBatch(uniq,callback);
	} ,

	loadStage2 : function () {
		var self = this ;
		var i = self.wd.items[self.q] ;
		var to_load = [] ;
		$.each ( (i.raw.claims||[]) , function ( prop , v1 ) {
			
			// Adding property
			if ( -1 == $.inArray ( prop , to_load ) ) to_load.push ( prop ) ;
			
			// Adding target items (for the labels)
			$.each ( i.getClaimItemsForProperty ( prop , true ) , function ( dummy , q ) {
				if ( -1 == $.inArray ( q , to_load ) ) to_load.push ( q ) ;
			} ) ;
			
			// Adding qualifiers
			$.each ( v1 , function ( dummy , co ) {
				$.each ( (co.qualifiers||[]) , function ( qprop , qlist ) {
					if ( -1 == $.inArray ( qprop , to_load ) ) to_load.push ( qprop ) ;
					$.each ( (qlist||[]) , function ( dummy2 , qual ) {
						if ( qual.snaktype != 'value' ) return ;
						if ( qual.datavalue === undefined ) return ;
						if ( qual.datavalue.type !== 'wikibase-entityid' ) return ;
						if ( qual.datavalue.value === undefined ) return ;
						if ( qual.datavalue.value['numeric-id'] === undefined ) return ;
						var qq = 'Q' + qual.datavalue.value['numeric-id'] ;
						if ( -1 == $.inArray ( qq , to_load ) ) to_load.push ( qq ) ;
					} ) ;
				} ) ;
			} ) ;
			
			// Adding sources
			$.each ( v1 , function ( dummy , co ) {
				$.each ( (co.references||[]) , function ( dummy0 , v0 ) {
					$.each ( (v0.snaks||[]) , function ( qprop , v2 ) {
						if ( -1 == $.inArray ( qprop , to_load ) ) to_load.push ( qprop ) ;
						$.each ( (v2||[]) , function ( dummy2 , qual ) {
							if ( qual.snaktype != 'value' ) return ;
							if ( qual.datavalue === undefined ) return ;
							if ( qual.datavalue.type !== 'wikibase-entityid' ) return ;
							if ( qual.datavalue.value === undefined ) return ;
							if ( qual.datavalue.value['numeric-id'] === undefined ) return ;
							var qq = 'Q' + qual.datavalue.value['numeric-id'] ;
							if ( -1 == $.inArray ( qq , to_load ) ) to_load.push ( qq ) ;
						} )
					} )
				} )
			} ) ;
			
		} ) ;
		
		self.loadItemNames ( to_load , function () {
//		self.wd.getItemBatch ( to_load , function () {
			self.showItem () ;
		} ) ;
	} ,
	
	showItem : function () {
		var self = this ;
		var i = self.wd.items[self.q] ;
		self.files_loaded = false ;
		self.files = {} ;
		
		document.title = i.getLabel() + ' - Widee' ;
		
		var h = "" ;
		h += "<div class='row'>" ;

		h += "<div class='heading'><h1>" + i.getLabel() + "</h1></div>" ;

		h += "<div class='heading_container2'>" ;
		h += "<div class='wd_main_link'>" + i.getLink ( { target:'_blank','class':'wikidata editable_text',title:self.q } ) + "</div>" ;
		h += "<div class='reasonator_link'><a class='external' target='_blank' href='/reasonator?q="+self.q+"' title='Show in Reasonator'>Reasonator</a></div>" ;
		h += "</div>" ;
		
		h += "<div class='heading_container2'>" ;
		h += "<div class='aliases'>" ;
		$.each ( (((i.raw||{}).aliases||{})[self.lang()]||[]) , function ( k , v ) {
			h += "<span class='alias editable_text' isa='alias' num='"+k+"'>" ;
			h += v.value ;
			h += "</span>" ;
		} ) ;
		h += "</div>" ;
		h += "<div class='desc editable_text' isa='desc'>" + i.getDesc() + "</div>" ;
		h += "</div>" ;
		
		h += "</div>" ; // Row
		
		
		h += "<div class='row' id='all_statements'>" ;
		h += "<div class='col-xs-12 col-sm-12 col-md-6 col-lg-6' id='statements_1'></div>" ;
		h += "<div class='col-xs-12 col-sm-12 col-md-6 col-lg-6' id='statements_2'><div id='files' class='row'></div></div>" ;
		h += "</div>" ;
		$('#main').html ( h ) ;
		
		$('#wd_main_link a.editable_text').attr({isa:'title'}) ;

		// Sort claim keys
		var order = {} ;
		var order_count = 0 ;
		var type2section = {} ;
		$.each ( self.sections , function ( section , sc ) {
			$.each ( sc , function ( dummy , type ) {
				order[type] = order_count++ ;
				type2section[type] = section+1 ;
			} ) ;
		} )
		var keys = [] ;
		$.each ( (i.raw.claims||[]) , function ( prop , statements ) { keys.push ( prop ) } ) ;
		keys = keys.sort ( function ( a , b ) {
			var ta = self.wd.items[a].raw.datatype ;
			var tb = self.wd.items[b].raw.datatype ;
//			console.log ( order[ta] + " <=> " + order[tb] + " : " + ta + "/" + tb ) ;
			if ( undefined === order[ta] ) return -1 ;
			if ( undefined === order[tb] ) return 1 ;
			if ( order[ta] == order[tb] ) {
//				if ( order[ta] == 0 ) return 0 ; // Don't sort item props
				var la = (propstats[a]||0)*1 ; //self.wd.items[a].getLabel() ;
				var lb = (propstats[b]||0)*1 ; //self.wd.items[b].getLabel() ;
			if ( a=='P1429' || b=='P1429' ) console.log ( a,b,la,lb ) ;
				return la > lb ? -1 : 1 ;
			}
			return order[ta] < order[tb] ? -1 : 1 ;
		} ) ;

		
		// Show claims
		$.each ( keys , function ( dummy , prop ) {
			var statements = i.raw.claims[prop] ;
			self.showProperty ( prop , statements , type2section[self.wd.items[prop].raw.datatype] ) ;
		} ) ;
		
		self.fixInternalLinks() ;
		self.addDoubleClickHandlers() ;
		self.loading = false ;
		$('#all_statements').fadeIn(self.fade_time);
	} ,
	
	addDoubleClickHandlers : function () {
		var self = this ;
		$('div.needs_dblclick').dblclick ( function () {
			var target = this ;
			self.editStatement ( target ) ;
		} ).removeClass('needs_dblclick') ;
		self.applyRefQual() ;
	} ,
	
	fixInternalLinks : function () {
		var self = this ;
		$('#all_statements a.internal').each ( function () {
			var a = $(this) ;
			var q = a.attr('q') ;
			a.attr ( { href:'#q='+q } ) ;
			a.click ( function () { self.loadItem ( q ) ; return false } ) ;
		} ) ;
	} ,
	
	showProperty : function ( prop , statements , section ) {
		var self = this ;
		var h = "<div class='property_container row' id='prop" + prop + "'>" ;
		
		h += "<div class='property_box col-xs-4 col-sm-4 col-md-4'>" ;
		h += self.wd.items[prop].getLink ( {target:'_blank','class':'wikidata',desc:true} ) ;
		h += " <a href='#' onclick='widee.addNewClaimForProp(\""+prop+"\");return false'>[+]</a>" ;
		h += "</div>" ;
		
		h += "<div class='statement_list_container col-xs-8 col-sm-8 col-md-8'>" ;
		$.each ( statements , function ( num , statement ) {
			h += self.renderStatement ( {statement:statement,prop:prop,num:num} ) ;
		} ) ;
		h += "</div>" ;
//		h += '<div class="clearfix visible-md-block visible-lg-block"></div>' ;
		
		h += "</div>" ;
		
		$('#statements_'+section).append ( h ) ;
	} ,
	
	renderStatement : function ( o ) {
		var self = this ;
		var h = "" ;
		
		h += "<div class='statement_container' prop='"+o.prop+"' num='"+o.num+"' sid='"+o.id+"'>" ;
		h += self.renderStatementInner ( o ) ;
		h += "</div>" ;
		
		return h ;
	} ,
	
	renderStatementInner : function ( o ) {
		var self = this ;
		var h = '' ;
		h += "<div class='statement_value'>" ;
		h += "<div class='statement_value_inner needs_dblclick'>" ;
		h += self.renderSnak ( o.prop , o.statement.mainsnak ) ;
		h += "</div>" ;
//		h += self.renderStatementEditBox ( o ) ;
		h += "</div>" ;
		h += self.renderQualifiers ( o ) ;
		h += self.renderReferences ( o ) ;
		return h ;
	} ,
	
	
	renderQualifiers : function ( o ) {
		var self = this ;
		if ( o.statement === undefined ) return '' ;
		var quals = o.statement.qualifiers ;
		if ( quals === undefined ) return '' ;
		var order = o.statement['qualifiers-order'] || [] ;
		if ( order.length == 0 ) { console.log ( "NO ORDER!" ) ; return "NO ORDER" ; }
		
		var h = '' ;
		$.each ( order , function ( dummy , prop ) {
			if ( quals[prop] === undefined ) return ;
			$.each ( quals[prop] , function ( qual_num , qual ) {
				h += "<div class='row qualifier_container'>" ;
				h += "<div class='col-xs-4 qualifier_prop'>" ;
				h += self.wd.items[prop].getLink ( {target:'_blank','class':'wikidata',desc:true} ) ;
				h += "</div>" ;
				h += "<div class='col-xs-8 qualifier_value'>" ;
				h += self.renderSnak ( prop , qual ) ;
				h += "</div>" ;
				h += "</div>" ;
			} ) ;
		} ) ;
		
		return h ;
	} ,

	renderReferences : function ( o ) {
		var self = this ;
		if ( o.statement === undefined ) return '' ;
		var refs = o.statement.references ;
		if ( refs === undefined ) return '' ;
		
		var h = '' ;
		$.each ( refs , function ( dummy0 , v0 ) {
			$.each ( (v0.snaks||[]) , function ( prop , v1 ) {
				$.each ( (v1||[]) , function ( dummy2 , v2 ) {
					h += "<div class='row reference_container'>" ;
					h += "<div class='col-xs-4 reference_prop'>" ;
					h += self.wd.items[prop].getLink ( {target:'_blank','class':'wikidata',desc:true} ) ;
					h += "</div>" ;
					h += "<div class='col-xs-8 reference_value'>" ;
					h += self.renderSnak ( prop , v2 ) ;
					h += "</div>" ;
					h += "</div>" ;
				} ) ;
			} ) ;
		} ) ;

		return h ;
	} ,

/*	
	renderStatementEditBox : function ( o ) {
		var self = this ;
		var h = "" ;
		
		h += "<div class='edit_statement_container'>" ;
		h += "<a href='#' class='edit_link' onclick='widee.editStatement(this);return false'>Edit</a>" ;
		h += "</div>" ;
		
		return h ;
	} ,
*/	
	renderSnak : function ( prop , snak ) {
		var self = this ;
		var h = '' ;
		if ( snak === undefined ) return h ;
		if ( snak.datavalue === undefined ) return h ;
		var dv = snak.datavalue ;
		if ( dv.type === undefined ) return h ;

		if ( dv.value === undefined ) return "Undefined " + dv.type + " value" ;
		var v = dv.value ;
		
		if ( self.wd.items[prop].raw.datatype == 'commonsMedia' ) {
			self.files[v] = { title:v } ;
		}

		if ( dv.type == 'wikibase-entityid' ) {
			var q = v['numeric-id'] ;
			if ( q === undefined ) return h ;
			q = 'Q' + q ;
			if ( self.wd.items[q] === undefined ) return "Undefined item: "+q ;
			h += self.wd.items[q].getLink ( {desc:true,'class':'internal',add_q:true} ) ;
/*		} else if ( snak.datatype == 'external-id' ) {
			h += "<span class='extid'>" + self.renderExternalID ( prop , v ) + "</span>" ;
		} else if ( snak.datatype == 'math' ) {
			h += "<span class='math'>" + self.renderMath ( prop , v ) + "</span>" ;*/
		} else if ( dv.type == 'string' ) {
			h += "<span class='string'>" + self.renderString ( prop , v ) + "</span>" ;
		} else if ( dv.type == 'time' ) {
			h += "<span class='time'>" + self.renderTime ( v ) + "</span>" ;
		} else if ( dv.type == 'quantity' ) {
			h += "<span class='quantity'>" + self.renderQuantity ( v ) + "</span>" ;
		} else if ( dv.type == 'globecoordinate' ) {
			h += "<span class='coord'>" + v.latitude + "/" + v.longitude + "</span>" ;
		} else if ( dv.type == 'monolingualtext' ) {
			h += "<span class='monolingualtext'>" + v.language + ": " + v.text + "</span>" ;
		} else {
			console.log ( snak ) ;
			h += "TODO : type " + dv.type ;
		}
		
		return h ;
	} ,
	
	getExtLink : function ( url , text ) {
		return "<a href='" + url + "' target='_blank' class='external'>" + text + "</a>" ;
	} ,
	
	renderMath : function ( prop , s ) {
		return this.renderString ( prop , s ) ;
	} ,
	
	renderExternalID : function ( prop , s ) {
		return this.renderString ( prop , s ) ;
	} ,
	
	renderString : function ( prop , s ) {
		var self = this ;
		var display_text = self.entities ( s ) ;
		if ( display_text.length > 40 ) display_text = display_text.substr(0,40)+'&hellip;' ;
		if ( self.wd.items[prop].raw.datatype == 'url' ) {
			display_text = display_text.replace ( /^https{0,1}:\/\// , '' ) .replace (/\/+$/,'') ;
			return self.getExtLink ( s , display_text ) ;
		}
		if ( typeof ext_ids[prop] == 'undefined' ) return display_text ;
		return self.getExtLink ( ext_ids[prop].replace(/!ID!/g,encodeURIComponent(s)) , display_text ) ;
	} ,

	renderQuantity : function ( i ) {
		var ret = 'UNKNOWN QUANTITY' ;
		i.amount *= 1 ;
		i.upperBound *= 1 ;
		i.lowerBound *= 1 ;
		
		var fixJavaScriptFloatingPointBug = 1000000000 ;
		var diff1 = i.upperBound-i.amount ;
		var diff2 = i.amount-i.lowerBound ;
		if ( diff1 == diff2 ) {
			ret = i.amount ;
			var pm = (parseInt(diff1*fixJavaScriptFloatingPointBug)/fixJavaScriptFloatingPointBug) ;
			if ( pm != 0 ) ret += "&nbsp;&plusmn;&nbsp;" + pm ;
		} else {
			ret = i.amount + " (" + i.lowerBound + "&ndash;" + i.upperBound + ")" ;
		}
		return ret ;
	} ,
	
	renderTime : function ( date ) {
		var self = this ;
		var h = '' ;
		var m = date.time.match ( /^([+-])0*(\d{4,})-(\d\d)-(\d\d)T/ ) ;
		if ( m == null ) {
			h = "MALFORMED DATE: " + date.time ;
		} else {
			var year = ( m[1] == '-' ) ? '-'+m[2] : ''+m[2] ;
			var s = '???' ;
			if ( date.precision >= 11 ) s = year+'-'+m[3]+'-'+m[4] ;
			else if ( date.precision == 10 ) s = year+'-'+m[3] ;
			else if ( date.precision == 9 ) s = year ;
			else if ( date.precision == 8 ) s = parseInt(year/10)+'0s' ;
			else if ( date.precision == 7 ) s = parseInt(year/100)+'00s' ;
			h = s ;
//			var url = '?date='+s ;
//			url += self.getLangParam() ;
//			h2.push ( "<a href='"+url+"'>"+s+"</a>" ) ;
		}
		return h ;
	} ,


	lang : function () {
		return this.wd.main_languages[0] ;
	} ,
	
	applyRefQual : function () {
		var self = this ;
		self.changeShowSources() ;
		self.changeShowQualifiers() ;
		self.changeShowFiles() ;
	} ,
	
	entities : function ( s ) {
		return s.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
	} ,
	
	showFile : function ( o , d ) {
		var self = this ;
		var thumbsize = self.thumbsize ;
		o.done = true ;
		o.loading = false ;
		o.d = d ;
		if ( typeof self.file_cache[o.title] == 'undefined' ) {
			self.file_cache[o.title] = o ;
		}
		$.each ( ((d.query||{}).pages||{}) , function ( iid , v ) {
			var i = v.imageinfo[0] ;
			if ( i.width == 0 && i.height == 0 ) i.thumbheight = thumbsize ;
			var h = "<div class='col-xs-3' style='margin:2px;width:" + thumbsize + "px;height:" + thumbsize + "px;" ; // display:inline-block;
			h += "padding-left:" + Math.floor((thumbsize-i.thumbwidth)/2) + "px;"
//						h += "padding-right:" + Math.floor(thumbsize-i.thumbwidth-(thumbsize-i.thumbwidth)/2) + "px;"
			h += "padding-top:" + Math.floor((thumbsize-i.thumbheight)/2) + "px;"
//						h += "padding-bottom:" + Math.floor(thumbsize-i.thumbheight-(thumbsize-i.thumbheight)/2) + "px;"
			h += "'>" ;
			h += "<a href='" + i.descriptionurl + "' title='" + self.entities(o.title) + "' target='_blank'><img border=0 src='" + i.thumburl + "' /></a>" ;
			h += "</div>" ;
			$('#files').append ( h ) ;
		} ) ;
	} ,
	
	changeShowFiles : function () {
		var self = widee ;
		var o = $('#show_files') ;
		var checked = o.is(':checked') ;
		if ( checked ) {
			$('#files').show() ;
			if ( self.files_loaded ) return ;
			self.files_loaded = true ;

			$('#files').html('') ;

			$.each ( (self.files||{}) , function ( key , o ) {
				if ( o.loading || o.done ) return ;
				o.loading = true ;
				if ( typeof self.file_cache[key] != 'undefined' ) {
					self.showFile ( o , self.file_cache[key].d ) ;
					return ;
				}
				$.getJSON ( '//commons.wikimedia.org/w/api.php?callback=?' , {
					action:'query',
					titles:'File:'+o.title,
					prop:'imageinfo',
					iiurlwidth:self.thumbsize,
					iiurlheight:self.thumbsize,
					iiprop:'url|size',
					format:'json'
				} , function ( d ) {
					self.showFile ( o , d ) ;
				} ) ;
			} ) ;



		} else $('#files').hide() ;
	} ,
	
	changeShowSources : function () {
		var o = $('#show_sources') ;
		var checked = o.is(':checked') ;
		if ( checked ) $('.reference_container').show() ;
		else $('.reference_container').hide() ;
	} ,
	
	changeShowQualifiers : function () {
		var o = $('#show_qualifiers') ;
		var checked = o.is(':checked') ;
		if ( checked ) $('.qualifier_container').show() ;
		else $('.qualifier_container').hide() ;
	} ,

	run : function () {
		var self = this ;
		self.wd = new WikiData ;
		self.params = self.getUrlVars() ;
		self.loading = false ;
		
		$('#show_sources').change ( self.changeShowSources ) ;
		$('#show_qualifiers').change ( self.changeShowQualifiers ) ;
		$('#show_files').change ( self.changeShowFiles ) ;

		$(window).on('hashchange', function() {
			if ( self.loading ) return ;
			self.params = self.getUrlVars() ;
			self.loadItem ( 'Q' + self.params.q.replace(/\D/g,'') ) ;
		} ) ;
		
		if ( undefined !== self.params.lang && self.params.lang != 'en' ) {
			self.wd.main_languages.unshift ( self.params.lang ) ;
		}
		
		if ( undefined !== self.params.q ) {
			self.loadItem ( 'Q' + self.params.q.replace(/\D/g,'') ) ;
		}
	} ,
/*	
	editString : function ( o ) {
		var self = this ;
		self.editing = true ;
		var dv = o.statement.mainsnak.datavalue ;
		var s = dv.value ; // Current value
		var siv = $(o.div.find('div.statement_value_inner')) ;
		
		var h = '' ;
		h += "<div>" ;
		h += "<form class='form-inline'>" ;
		h += "<input type='text' id='editing' />" ;
		h += " <a href='#' id='edit_save'>save</a>" ;
		h += " <a href='#' id='edit_cancel'>cancel</a>" ;
		h += "</form>" ;
		h += "</div>" ;
		
		siv.html ( h ) ;
		$('#editing').val ( s ) ;
		
		
		$('#edit_save').click ( function () {
			console.log ( "SAVE" ) ;
		} ) ;

		$('#edit_cancel').click ( function () {
			console.log ( "CANCEL" ) ;
		} ) ;
	} ,
*/	

	addClaimItemOauth : function ( q , prop , target , o ) {
		var self = widee ;
		if ( o === undefined ) o = {} ;
		if ( o.ok === undefined ) o.error = function () { alert ( "OAuth edit successful!" ) } ;
		if ( o.error === undefined ) o.error = function (s) { alert ( s ) } ;

		$.getJSON ( self.widar_url , {
			action:'set_claims',
			ids:q,
			prop:prop,
			target:target,
			botmode:1
		} , function ( d ) {
			if ( d.error == 'OK' ) {
				o.ok() ;
			} else o.error ( d.error ) ;
		} ) .fail(function( jqxhr, textStatus, error ) {
			o.error ( error ) ;
		} ) ;
	} ,

	editItemLink : function ( o ) {
		var self = this ;
		self.editing = true ;
		var dv = o.statement.mainsnak.datavalue ;
		var s = 'Q'+dv.value['numeric-id'] ; // Current Q ID
		var div = $(o.div.find('div.statement_value_inner')) ;
		
		var h = '' ;
		h += "<div>" ;
		h += "<form id='edit_form' class='form-inline'>" ;
		h += "<input type='text' id='editing' />" ;
		h += " <a href='#' id='edit_save'>save</a>" ;
		h += " <a href='#' id='edit_cancel'>cancel</a>" ;
		h += "</form>" ;
		h += "</div>" ;
		
		div.html ( h ) ;
		$('#editing').val ( s ) ;
		$('#editing').focus() ;
		$('#edit_form').submit ( function ( e ) {
			$('#edit_save').click() ;
			return false ;
		} ) ;
		
		var container = $(div.parents('div.statement_container')[0]) ;
		
		$('#edit_save').click ( function () {
			var q = 'Q' + $('#editing').val().replace(/\D/g,'') ;
			
			if ( o.is_new ) {
				self.addClaimItemOauth ( self.q , o.prop , q , { ok:function () {
					dv.value['numeric-id'] = q.replace(/\D/g,'') ;
					// TODO Oauth edit
					self.wd.getItemBatch ( [ q ] , function () {
						var h = self.renderStatementInner ( {statement:o.statement,prop:o.prop,num:o.num} ) ;
						container.html ( h ) ;
						self.addDoubleClickHandlers() ;
						self.editing = false ;
					} ) ;
				} , error:function(s){alert(s);$('#edit_cancel').click()} } ) ;
			}
			// TODO update existing statement
			return false ;
		} ) ;

		$('#edit_cancel').click ( function () {
			if ( o.is_new ) {
				container.remove() ;
				self.wd.items[self.q].raw.claims[o.prop].pop() ; // Can only be last one
			} else {
				var h = self.renderStatementInner ( {statement:o.statement,prop:o.prop,num:o.num} ) ;
				container.html ( h ) ;
				self.addDoubleClickHandlers() ;
			}
			self.editing = false ;
			return false ;
		} ) ;
	} ,
	
	editStatement : function ( me ) {
		var a = $(me) ;
		var self = widee ;
		if ( self.editing ) return ;
		var div = $(a.parents('div.statement_container')[0]) ;
		var prop = div.attr('prop') ;
		var num = div.attr('num') ;
		var i = self.wd.items[self.q] ;
		var statement = i.raw.claims[prop][num] ;
		if ( statement.mainsnak === undefined ) return ;
		if ( statement.mainsnak.datavalue === undefined ) return ;
		var dv = statement.mainsnak.datavalue ;
		if ( dv.type == 'wikibase-entityid' ) {
			self.editItemLink ( {statement:statement,prop:prop,num:num,div:div,is_new:a.hasClass('is_new')} ) ;
//			self.editString ( {statement:statement,prop:prop,num:num,div:div} ) ;
		} else {
			alert ( "Sorry, can't edit type " + dv.type + " - yet!" ) ;
		}
//		console.log ( statement ) ;
//		console.log ( prop + ' : ' + num ) ;
	} ,
	
	addNewClaimForProp : function ( prop ) {
		var self = widee ;
		var i = self.wd.items[self.q] ;
		var type = self.wd.items[prop].raw.datatype ; // TODO somehow get the real type...
		console.log ( type ) ;
//		if ( i.raw.claims[prop] === undefined ) i.raw.claims[prop] = [] ;// TODO Not supported yet

		var value ;
		if ( type == 'wikibase-item' ) {
			value = { 'numeric-id':'' , 'entity-type':'item' } ;
			type = 'wikibase-entityid' ;
		} else {
			console.log ( 'Cannot process type '+type ) ;
			return ;
		}

		var statement = {
			mainsnak : {
				datavalue:{
					type:type,
					value:value
				} ,
				property:prop,
				snaktype:'value'
			} ,
			rank:'normal',
			type:'statement'
		} ;

		var num = i.raw.claims[prop].length ;
		i.raw.claims[prop].push ( statement ) ;
		
		var div = $('#prop'+prop+' > div.statement_list_container') ;
		var h = self.renderStatement ( {statement:i.raw.claims[prop][num],prop:prop,num:num} ) ;
		div.append ( h ) ;
		var inner = div.find('div.statement_value_inner') ;
		inner.addClass ( 'is_new' ) ;
		self.editStatement ( inner ) ;
	} ,
	
} ;

$(document).ready ( function () {
	widee.run() ;
} ) ;
;
