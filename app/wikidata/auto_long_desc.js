/**
 * @author Magnus Manske
 */

if ( typeof exports != 'undefined' ) { // Running in node.js
	jsdom = require("jsdom"); 
	$ = require("jquery")(jsdom.jsdom().defaultView); 
	autodesc_short = require('./short_autodesc.js') ;
	reasonator_base = require('./reasonator.js') ;
	infobox_generator = require('./infobox_generator.js') ;
	reasonator = reasonator_base.reasonator ;
	autodesc_short.ad.wd = reasonator_base.wd ;
}


//________________________________________________________________________________________________________________________________________________________________
// BASE CLASS FOR LANGUAGE RENDERING
function lang_class () {

	var q ;
	var main_title_label ;
	var relations ;
	var render_mode ;
	var lang ;

	// REASONATOR-SPECIFIC WRAPPER FUNCTIONS
	this.getQlink = function ( q , options ) {
		if ( typeof options == 'undefined' ) options = {} ;
		if ( typeof this.render_mode != 'undefined' ) options.render_mode = this.render_mode ;
		if ( typeof this.lang != 'undefined' ) options.lang = this.lang ;
		if ( typeof this.redlinks != 'undefined' ) options.redlinks = this.redlinks ;
		return reasonator.getQlink ( q , options ) ;
	}
	
	this.getMainLang = function () {
		if ( typeof this.lang != 'undefined' ) return this.lang ;
		return reasonator.getMainLang() ;
	}
	
	this.getWD = function () {
		return reasonator.wd ;
	}
	
	this.getMainQ = function () {
		if ( typeof this.q != 'undefined' ) return this.q ;
		return reasonator.q ;
	}

	this.getRelations = function () {
		return this.relations || reasonator.main_type_object.relations ;
	}
	
	this.getParent = function ( p ) {
		var rel = this.getRelations() ;
		if ( rel === undefined ) return ;
		if ( rel.parents === undefined ) return ;
		if ( rel.parents[p] === undefined ) return ;
		var ret ;
		$.each ( rel.parents[p] , function ( k , v ) { ret = k ; return false } ) ;
		return ret ;
	}
	
	this.pad = function ( a , b ) {
		return reasonator.pad ( a , b ) ;
	}
	
	this.getSelfURL = function ( o ) {
		return reasonator.getSelfURL ( o ) ;
	}
	
	this.mainTitleLabel = function () {
		if ( typeof this.main_title_label != 'undefined' ) return this.main_title_label ;
		return $('#main_title_label').text() ;
	}
	
	this.generateRelations = function () {
		if ( typeof reasonator.generateRelations == 'undefined' ) return ;
		this.relations = reasonator.generateRelations(this.getMainQ()) ;
	}
	
	this.getNewline = function () {
		if ( this.render_mode == 'text' ) return "\n" ;
		if ( this.render_mode == 'wiki' ) return "\n\n" ;
		return '<br/>' ; // Default
	}

	this.getBold = function ( o ) {
		if ( this.render_mode == 'text' ) {
			o.after = ' ' + (o.after||'') ;
		} else if ( this.render_mode == 'wiki' ) {
			o.before = (o.before||'') + "'''" ;
			o.after = "''' " + (o.after||'') ;
		} else { // Default
			o.before = (o.before||'') + '<b>' ;
			o.after = '</b> ' + (o.after||'') ;
		}
		return o ;
	}

	this.getNationalityFromCountry = function ( country , claims , hints ) {
		if ( typeof wd_auto_desc != 'undefined' ) return wd_auto_desc.getNationalityFromCountry ( country , claims , hints ) ; // Real Reasonator
		if ( typeof hints == 'undefined' ) hints = {} ;
		hints.lang = this.getMainLang() ;
		return autodesc_short.ad.getNationalityFromCountry ( country , claims , hints ) ;
	}




	// INITIALISE
	this.init = function () {
		this.show_people_dates = false ;
		this.lang = this.getMainLang() ;
		this.wd = this.getWD() ;
		this.h = [] ;
		this.i = this.wd.items[this.getMainQ()] ;
		this.is_dead = this.i.hasClaims ( 'P570' ) ;
	}
	
	this.run_person = function ( callback ) {
		this.setup() ;
		this.generateRelations() ;
		this.addFirstSentence () ;
		this.addBirthText () ;
		this.addWorkText () ;
		this.addFamilyText () ;
		this.addDeathText () ;
		this.renderHTML ( callback ) ;
	}
	
	this.renderDate = function ( claim , o ) {
		var me = this ;
		if ( o === undefined ) o = {} ;
		var ret = { after:' ' } ;
		var d = (claim.time===undefined) ? (claim.datavalue===undefined?this.i.getClaimDate(claim):claim.datavalue.value) : claim ;
		
		if ( typeof d == 'undefined' ) return '???' ;

		var pre = d.time.substr(0,1) == '+' ? 1 : -1 ;
		var dp = d.time.substr(1).split(/[-T:Z]/) ;
		var year = dp[0]*1 ;
		var month = this.pad ( dp[1] , 2 ) ;
		var day = this.pad ( dp[2] , 2 ) ;
		
		var trans = me.renderDateByPrecision ( pre , year , month , day , d.precision , o.no_prefix ) ;
		ret.label = trans.label ;
		ret.before = trans.before ;
	
		if ( o.just_year ) return { label:year } ;

		var iso = d.time ; // Fallback
		var label = d.time ; // Fallback
	
		ret.url = me.getSelfURL ( { date:trans.iso } ) ;

		return ret ;
	}

	this.addPerson = function ( pq , after ) {
		var me = this ;
		me.h.push ( { q:pq } ) ;
	
		var born = me.wd.items[pq].raw.claims['P569'] ;
		var died = me.wd.items[pq].raw.claims['P570'] ;

		if ( me.show_people_dates && ( born !== undefined || died !== undefined ) ) {
			me.h.push ( { label:' (' } ) ;
			if ( born !== undefined ) me.h.push ( me.renderDate ( born[0] , {just_year:true} ) ) ;
			if ( born !== undefined && died !== undefined ) me.h.push ( { label:'&ndash;' } ) ;
			if ( died !== undefined ) me.h.push ( me.renderDate ( died[0] , {just_year:true} ) ) ;
			me.h.push ( { label:')' } ) ;
		}
	
		if ( after !== undefined && after != '' ) me.h.push ( { label:after } ) ;
	}

	this.addPlace = function ( o ) {
		if ( o.before !== undefined ) this.h.push ( { label:o.before } ) ;
		this.h.push ( { q:o.q } ) ; // TODO country, city etc.
		if ( o.after !== undefined ) this.h.push ( { label:o.after } ) ;
	}

	this.getSepAfter = function ( arr , pos ) {
		if ( pos+1 == arr.length ) return ' ' ;
		if ( pos == 0 && arr.length == 2 ) return ' and ' ;
		if ( arr.length == pos+2 ) return ', and ' ;
		return ', ' ;
	}

	this.getQualifierItem = function ( qualifiers , prop ) {
		if ( qualifiers[prop] === undefined ) return ;
		if ( qualifiers[prop][0].datavalue === undefined ) return ;
		if ( qualifiers[prop][0].datavalue.value === undefined ) return ;
		return 'Q' + qualifiers[prop][0].datavalue.value['numeric-id'] ;
	}

	this.getDatesFromQualifier = function ( qualifiers ) {
		var ret = {} ;
		if ( qualifiers === undefined ) return ret ;
		if ( qualifiers['P581'] !== undefined ) {
			ret.from = qualifiers['P581'][0] ;
			ret.to = qualifiers['P581'][0] ;
			ret.pit = true ; // Point In Time
		} else {
			if ( qualifiers['P580'] !== undefined ) ret.from = qualifiers['P580'][0] ;
			if ( qualifiers['P582'] !== undefined ) ret.to = qualifiers['P582'][0] ;
		}
		return ret ;
	}

	this.sortByDate = function ( x ) {
		return x.sort ( function ( a , b ) {
			if ( a.dates.from !== undefined && b.dates.from !== undefined ) {
				return a.dates.from.time == b.dates.from.time ? 0 : ( a.dates.from.time < b.dates.from.time ? -1 : 1 ) ;
			} else if ( a.dates.to !== undefined && b.dates.to !== undefined ) {
				return a.dates.to.time == b.dates.to.time ? 0 : ( a.dates.to.time < b.dates.to.time ? -1 : 1 ) ;
			}
			return a.q == b.q ? 0 : ( a.q < b.q ? -1 : 1 ) ;
		} ) ;
	}

	this.getRelatedItemsWithQualifiers = function ( o ) { // qualifiers need to be item links
		var me = this ;
		if ( o === undefined ) o = {} ;

		var ret = [] ;
		$.each ( (o.properties||[]) , function ( dummy , prop ) {
			$.each ( (me.i.raw.claims[prop]||[]) , function ( k , claim ) {
				var eq = me.i.getClaimTargetItemID(claim) ;
				if ( undefined === eq ) return ;
				var em = { q:eq } ;
				if ( o.dates ) em.dates = me.getDatesFromQualifier(claim.qualifiers) ;
				$.each ( (o.qualifiers||[]) , function ( k , v ) {
					var tmp = [] ;
					$.each ( v , function ( dummy2 , prop2 ) {
						if ( claim.qualifiers === undefined ) return ;
						tmp = tmp.concat ( me.getQualifierItem(claim.qualifiers,prop2) ) ;
					} ) ;
					em[k] = tmp ;
				} ) ;
				ret.push ( em ) ;
			} ) ;
		} ) ;
	
		if ( o.sort == 'date' ) ret = this.sortByDate ( ret ) ;
	
		return ret ;
	}

	this.getRelationsList = function ( k1 , props , use_birth_death ) {
		var me = this ;
		var ret = [] ;
		$.each ( props , function ( dummy0 , prop ) {
			$.each ( (((me.getRelations()||{})[k1]||{})[prop]||[]) , function ( q2 , v ) {
				$.each ( v , function ( dummy , v2 ) {
					if ( me.wd.items[q2] === undefined ) return ;
					var sp = { q:q2 , dates:{} } ;
					if ( use_birth_death ) {
						if ( me.wd.items[q2].hasClaims('P569') ) sp.dates.from = me.wd.items[q2].getClaimDate ( me.wd.items[q2].raw.claims['P569'][0] ) ;
						if ( me.wd.items[q2].hasClaims('P570') ) sp.dates.to = me.wd.items[q2].getClaimDate ( me.wd.items[q2].raw.claims['P570'][0] ) ;
					} else {
						sp.dates = me.getDatesFromQualifier(v2.qualifiers) ;
					}
					ret.push ( sp ) ;
				} ) ;
			} ) ;
		} ) ;
		ret = this.sortByDate ( ret ) ;
		return ret ;
	}

	this.listNationalities = function () {
		var me = this ;
		var countries = me.i.raw.claims['P27'] ;
		$.each ( (countries||[]) , function ( k , claim ) {
			var country = me.i.getClaimTargetItemID(claim) ;
			if ( undefined === country ) return ;
			var country_name = me.wd.items[country].getLabel(me.lang) ;
			var not_last = k+1 != countries.length ;
			var s = me.getNationalityFromCountry ( country_name , me.wd.items[me.getMainQ()].raw.claims , {not_last:not_last} ) ;
			me.h.push ( { label:s , q:country , after:(not_last?'-':' ') } ) ;
		} ) ;
	}

	this.listOccupations = function () {
		var me = this ;
		var occupations = me.i.raw.claims['P106'] ;
		$.each ( (occupations||[]) , function ( k , claim ) {
			var occupation = me.i.getClaimTargetItemID(claim) ;
			if ( occupation === undefined ) return ;
			var not_last = k+1 != occupations.length ;
			me.h.push ( { q:occupation , after:me.getSepAfter(occupations,k) } ) ;
		} ) ;
	}

	this.simpleList = function ( d , start , end ) {
		var me = this ;
		this.listSentence ( {
			data : d ,
			start : function() { me.h.push ( { label:start } ) } ,
			item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
			item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
			end : function() { me.h.push ( { label:end } ) }
		} ) ;
	}

	this.listSentence = function  ( o ) {
		var me = this ;
		if ( o.data === undefined ) o.data = [] ;
		if ( o.data.length == 0 ) return ;
		if ( undefined !== o.start ) o.start() ;
		$.each ( o.data , function ( k , v ) {
			if ( undefined !== o.item_start ) o.item_start ( function(){me.h.push ( { q:v.q })} ) ;
			var dates = v.dates ;
			var show_date = false ;
			$.each ( (o.qualifiers||[]) , function ( qual , cb ) { if ( v[qual] !== undefined ) show_date = true } ) ;
			if ( dates !== undefined && ( dates.from !== undefined || dates.to !== undefined ) ) show_date = true ;
			if ( show_date ) {
				if ( undefined !== o.date_start ) o.date_start() ;
				if ( dates.from !== undefined && undefined !== o.date_from ) o.date_from ( function(o2){me.h.push ( me.renderDate ( dates.from , o2 ) )} ) ;
				if ( dates.to !== undefined && undefined !== o.date_to ) o.date_to ( function(o2){me.h.push ( me.renderDate ( dates.to , o2 ) )} ) ;
				$.each ( (o.qualifiers||[]) , function ( qual , cb ) {
					if ( v[qual] === undefined ) return ;
					if ( v[qual].length == 0 ) return ;
					if ( v[qual][0] === undefined ) return ;
					cb ( v[qual] ) ;
				} ) ;
				if ( undefined !== o.date_end ) o.date_end() ;
			}
			var sep = me.getSepAfter(o.data,k) ;
			if ( undefined !== o.item_end ) o.item_end ( k , sep ) ;
		} ) ;
		if ( undefined !== o.end ) o.end() ;
	}


	this.addWorkText = function () {
		var me = this ;
		var alma = this.getRelatedItemsWithQualifiers ( { dates:true,sort:'date',properties:['P69'] } ) ;
		var field = this.getRelatedItemsWithQualifiers ( { properties:['P136','P101'] } ) ;
		var position = this.getRelatedItemsWithQualifiers ( { dates:true,sort:'date',properties:['P39'],qualifiers:{'of':['P642']} } ) ;
		var member = this.getRelatedItemsWithQualifiers ( { dates:true,sort:'date',properties:['P463'] } ) ;
		var employers = this.getRelatedItemsWithQualifiers ( { dates:true,sort:'date',properties:['P108'],qualifiers:{'job':['P794']} } ) ;
		this.alma ( alma ) ;
		this.field ( field ) ;
		this.position ( position ) ;
		this.member ( member ) ;
		this.employers ( employers ) ;
		this.h.push ( { label:me.getNewline() } ) ;
	}

	this.addFamilyText = function () {
		var me = this ;
		var spouses = this.getRelationsList ( 'other' , [26] , false ) ;
		var children = this.getRelationsList ( 'children' , [40] , true ) ;
		this.spouses ( spouses ) ;
		this.children ( children ) ;
		this.h.push ( { label:me.getNewline() } ) ;
	}


	this.renderHTML = function ( callback ) {
		var me = this ;
		var qs = [] ;
		$.each ( me.h , function ( k , v ) {
			if ( v.q !== undefined ) qs.push ( v.q ) ;
		} ) ;
		me.wd.getItemBatch ( qs , function () {
			var h2 = '' ;

			$.each ( me.h , function ( k , v ) {
				if ( v === undefined ) return ; // Paranoia
				var main = v.label ;
				if ( main === undefined ) {
					if ( typeof me.wd.items[v.q] == 'undefined' ) main = v.q ;
					else main = me.wd.items[v.q].getLabel(me.lang) ;
				}
				if ( v.url !== undefined ) {
					main = "<a href='" + v.url + "'>" + main + "</a>" ;
				} else {
					if ( v.q !== undefined ) main = me.getQlink ( v.q , { label:v.label } ) ;
				}
				h2 += (v.before||'') ;
				h2 += main ;
				h2 += (v.after||'') ;
			} ) ;

			h2 = h2.replace ( / +/g , ' ' ) ; // Excessive spaces
			h2 = h2.replace ( / \n/g , '\n' ) ; // Space before newline
			h2 = h2.replace ( /\s([.])/g , '.' ) ; // Space before punctuation
			h2 = h2.replace ( /\s([,])/g , ',' ) ; // Space before punctuation
			h2 = h2.replace ( /\.+/g , '.' ) ; // Multiple end dots
			h2 = h2.replace ( /(<br\/>\s*)+/g , '<br/>\n' ) ; // Multiple new lines
			callback ( h2 ) ;
		} ) ;
	}
	
}


// TODO make an object of those, one per language, set this to the current language, or fallback
var language_specs = [] ;

//________________________________________________________________________________________________________________________________________________________________

// ENGLISH
language_specs['en'] = new lang_class ;

language_specs['en'].setup = function () {
	this.init() ;
	this.month_label = [ '' , 'January','February','March','April','May','June','July','August','September','October','November','December' ] ; // First one needs to be empty!!

	if ( this.i.hasClaimItemLink('P21','Q6581097') || this.i.hasClaimItemLink('P21','Q2449503') ) {
		this.pronoun_subject = 'He' ;
		this.pronoun_possessive = 'His' ;
		this.be_present = 'is' ;
		this.be_past = 'was' ;
	} else if ( this.i.hasClaimItemLink('P21','Q6581072') || this.i.hasClaimItemLink('P21','Q1052281') ) {
		this.pronoun_subject = 'She' ;
		this.pronoun_possessive = 'Her' ;
		this.be_present = 'is' ;
		this.be_past = 'was' ;
	} else {
		this.pronoun_subject = 'They' ;
		this.pronoun_possessive = 'Their' ;
		this.be_present = 'are' ;
		this.be_past = 'were' ;
	}
}

language_specs['en'].renderDateByPrecision = function ( pre , year , month , day , precision , no_prefix ) {
	var me = this ;
	var ret = {} ;
	if ( precision <= 9 ) {
		ret.iso = year*pre ;
		ret.label = year ;
		if ( !no_prefix ) ret.before = 'in ' ;
	} else if ( precision == 10 ) {
		ret.iso = year*pre + '-' + month ;
		ret.label = me.month_label[month*1] + ' ' + year ;
		if ( !no_prefix ) ret.before = 'in ' ;
	} else if ( precision == 11 ) {
		ret.iso = year*pre + '-' + month + '-' + day ;
		ret.label = me.month_label[month*1] + ' ' + (day*1) + ', ' + year ;
		if ( !no_prefix ) ret.before = 'on ' ;
	}
	if ( pre == -1 ) ret.after = " <small>B.C.E.</small>" + ret.after ;
	return ret ;
}

language_specs['en'].employers = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' worked for ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { me.h.push ( { label:'from ' } ) ; cb({no_prefix:true}) } ,
		date_to : function(cb) { me.h.push ( { label:'until ' } ) ; cb({no_prefix:true}) } ,
		qualifiers : { job:function(qv){me.h.push ( { before:'as ' , q:qv[0] , after:' ' } )} } ,
		item_end : function(num,sep) { me.h.push ( { label:sep+(num+1<d.length?'for ':'') } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['en'].position = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' '+(me.is_dead?'':me.be_present+'/')+me.be_past+' ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { me.h.push ( { label:'from ' } ) ; cb({no_prefix:true}) } ,
		date_to : function(cb) { me.h.push ( { label:'until ' } ) ; cb({no_prefix:true}) } ,
		qualifiers : { of:function(qv){me.h.push ( { before:'for ' , q:qv[0] , after:' ' } )} } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['en'].member = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' '+(me.is_dead?'':me.be_present+'/')+me.be_past+' a member of ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { me.h.push ( { label:'from ' } ) ; cb({no_prefix:true}) } ,
		date_to : function(cb) { me.h.push ( { label:'until ' } ) ; cb({no_prefix:true}) } ,
//					qualifiers : { job:function(qv){me.h.push ( { before:'as ' , q:qv[0] , after:' ' } )} } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['en'].alma = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' studied at ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { me.h.push ( { label:'from ' } ) ; cb({no_prefix:true}) } ,
		date_to : function(cb) { me.h.push ( { label:'until ' } ) ; cb({no_prefix:true}) } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['en'].field = function ( d ) { var me=this; this.simpleList ( d , me.pronoun_possessive+' field of work include'+(me.is_dead?'d':'s')+' ' , '. ' ) ; }
language_specs['en'].cause_of_death = function ( d ) { this.simpleList ( d , 'of ' , ' ' ) ; }
language_specs['en'].killer = function ( d ) { this.simpleList ( d , 'by ' , ' ' ) ; }
language_specs['en'].sig_event = function ( d ) { this.simpleList ( d , this.pronoun_subject+' played a role in ' , '.' ) ; }

language_specs['en'].spouses = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' married ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { cb(); me.h.push ( { label:' ' } ) ; } ,
		date_to : function(cb) { me.h.push ( { label:'(married until ' } ) ; cb() ; me.h.push ( { label:') ' } ) } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['en'].children = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_possessive+' children include ' } ) } ,
		item_start : function(cb) { cb() } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}


language_specs['en'].addFirstSentence = function () {
	var me = this ;
	me.h.push ( me.getBold ( { label:me.mainTitleLabel() } ) ) ;
	me.h.push ( { label:(this.is_dead?'was':'is') , after:' a ' } ) ;
	this.listNationalities() ;
	this.listOccupations() ;
	me.h.push ( { label:'. ' } ) ;
	if ( me.h.length == 3 ) me.h = [] ; // No information, skip it.
	var sig_event = this.getRelatedItemsWithQualifiers ( { properties:['P793'] } ) ;
	me.sig_event ( sig_event ) ;
	me.h.push ( { label:me.getNewline() } ) ;
}

language_specs['en'].addBirthText = function () {
	var me = this ;
	var birthdate = me.i.raw.claims['P569'] ;
	var birthplace = me.i.raw.claims['P19'] ;
	var birthname = me.i.raw.claims['P513'] ;
	if ( birthdate !== undefined || birthplace !== undefined || birthname !== undefined ) {
		me.h.push ( { label:me.pronoun_subject , after:' '+this.be_past+' born ' } ) ;
		if ( birthname !== undefined ) me.h.push ( { label:me.i.getClaimTargetString(birthname[0]) , before:'<i>' , after:'</i> ' } ) ;
		if ( birthdate !== undefined ) me.h.push ( me.renderDate(birthdate[0]) ) ;
		if ( birthplace !== undefined ) me.addPlace ( { q:me.i.getClaimTargetItemID(birthplace[0]) , before:'in ' , after:' ' } ) ;
		var father = me.getParent ( 22 ) ;
		var mother = me.getParent ( 25 ) ;
		if ( father !== undefined || mother !== undefined ) {
			me.h.push ( { label:'to ' } ) ;
			if ( father !== undefined ) me.addPerson ( father , ' ' ) ;
			if ( father !== undefined && mother !== undefined ) me.h.push ( { label:'and ' } ) ;
			if ( mother !== undefined ) me.addPerson ( mother , ' ' ) ;
		}
		me.h.push ( { label:'. ' } ) ;
		me.h.push ( { label:me.getNewline() } ) ;
	}
}


language_specs['en'].addDeathText = function () {
	var me = this ;
	var deathdate = me.i.raw.claims['P570'] ;
	var deathplace = me.i.raw.claims['P20'] ;
	var deathcause = me.i.hasClaims('P509') ;
	var killer = me.i.hasClaims('P157') ;
	if ( deathdate !== undefined || deathplace !== undefined || deathcause || killer ) {
		me.h.push ( { label:me.pronoun_subject , after:' died ' } ) ;
		if ( deathcause !== undefined ) me.cause_of_death ( me.getRelatedItemsWithQualifiers ( { properties:['P509'] } ) ) ;
		if ( killer !== undefined ) me.killer ( me.getRelatedItemsWithQualifiers ( { properties:['P157'] } ) ) ;
		if ( deathdate !== undefined ) me.h.push ( me.renderDate(deathdate[0]) ) ;
		if ( deathplace !== undefined ) me.addPlace ( { q:me.i.getClaimTargetItemID(deathplace[0]) , before:'in ' , after:' ' } ) ;
		me.h.push ( { label:'. ' } ) ;
	}
	var burialplace = me.i.raw.claims['P119'] ;
	if ( burialplace !== undefined ) {
		me.addPlace ( { q:me.i.getClaimTargetItemID(burialplace[0]) , before:me.pronoun_subject+' '+this.be_past+' buried at ' , after:'. ' } ) ;
	}
}


//________________________________________________________________________________________________________________________________________________________________

// Dutch
language_specs['nl'] = new lang_class ;

language_specs['nl'].setup = function () {
	this.init() ;
	this.month_label = [ '' , 'januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december' ] ; // First one needs to be empty!!

	if ( this.i.hasClaimItemLink('P21','Q6581097') || this.i.hasClaimItemLink('P21','Q2449503') ) {
		this.pronoun_subject = 'Hij' ;
		this.pronoun_possessive = 'Zijn' ;
	} else if ( this.i.hasClaimItemLink('P21','Q6581072') || this.i.hasClaimItemLink('P21','Q1052281') ) {
		this.pronoun_subject = 'Zij' ;
		this.pronoun_possessive = 'Haar' ;
	} else {
		this.pronoun_subject = 'Hij/zij' ;
		this.pronoun_possessive = 'Zijn/haar' ;
	}
}

language_specs['nl'].getSepAfter = function ( arr , pos ) {
	if ( pos+1 == arr.length ) return ' ' ;
	if ( pos == 0 && arr.length == 2 ) return ' en ' ;
	if ( arr.length == pos+2 ) return ', en ' ;
	return ', ' ;
}

language_specs['nl'].renderDateByPrecision = function ( pre , year , month , day , precision , no_prefix ) {
	var me = this ;
	var ret = {} ;
	if ( precision <= 9 ) {
		ret.iso = year*pre ;
		ret.label = year ;
		if ( !no_prefix ) ret.before = 'in ' ;
	} else if ( precision == 10 ) {
		ret.iso =  month + '-' + year*pre;
		ret.label = me.month_label[month*1] + ' ' + year ;
		if ( !no_prefix ) ret.before = 'in ' ;
	} else if ( precision == 11 ) {
		ret.iso = day + '-' + month + '-' + year*pre ;
		ret.label = (day*1) + ' ' + me.month_label[month*1] + ' ' + year ;
		if ( !no_prefix ) ret.before = 'op ' ;
	}
	if ( pre == -1 ) ret.after = " <small>v. Chr.</small>" + ret.after ;
	return ret ;
}

language_specs['nl'].employers = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' werkte voor ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { me.h.push ( { label:'van ' } ) ; cb({no_prefix:true}) } ,
		date_to : function(cb) { me.h.push ( { label:'tot ' } ) ; cb({no_prefix:true}) } ,
		qualifiers : { job:function(qv){me.h.push ( { before:'als ' , q:qv[0] , after:' ' } )} } ,
		item_end : function(num,sep) { me.h.push ( { label:sep+(num+1<d.length?'voor ':'') } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['nl'].position = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' '+(me.is_dead?'':'is/')+'was ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { me.h.push ( { label:'van ' } ) ; cb({no_prefix:true}) } ,
		date_to : function(cb) { me.h.push ( { label:'tot ' } ) ; cb({no_prefix:true}) } ,
//                    qualifiers : { job:function(qv){me.h.push ( { before:'als ' , q:qv[0] , after:' ' } )} } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['nl'].member = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' '+(me.is_dead?'':'is/')+'was een lid van ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { me.h.push ( { label:'van ' } ) ; cb({no_prefix:true}) } ,
		date_to : function(cb) { me.h.push ( { label:'tot ' } ) ; cb({no_prefix:true}) } ,
//                    qualifiers : { job:function(qv){me.h.push ( { before:'als ' , q:qv[0] , after:' ' } )} } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['nl'].alma = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' studeerde op de ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { me.h.push ( { label:'van ' } ) ; cb({no_prefix:true}) } ,
		date_to : function(cb) { me.h.push ( { label:'tot ' } ) ; cb({no_prefix:true}) } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['nl'].field = function ( d ) { var me=this; this.simpleList ( d , me.pronoun_possessive+' werkveld '+(this.is_dead?'omvatte':'omvat')+' ' , '. ' ) ; }
language_specs['nl'].cause_of_death = function ( d ) { this.simpleList ( d , 'ten gevolge van ' , ' ' ) ; }
language_specs['nl'].killer = function ( d ) { this.simpleList ( d , 'door ' , ' ' ) ; }
language_specs['nl'].sig_event = function ( d ) { this.simpleList ( d , this.pronoun_subject+' speelde een rol in ' , '.' ) ; }

language_specs['nl'].spouses = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' trouwde ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { cb(); me.h.push ( { label:' ' } ) ; } ,
		date_to : function(cb) { me.h.push ( { label:'(getrouwd tot ' } ) ; cb() ; me.h.push ( { label:') ' } ) } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['nl'].children = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_possessive+' kinderen zijn ' } ) } ,
		item_start : function(cb) { cb() } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}


language_specs['nl'].addFirstSentence = function () {
	var me = this ;
	me.h.push ( me.getBold ( { label:me.mainTitleLabel() } ) ) ;
	me.h.push ( { label:(this.is_dead?'was':'is') , after:' een ' } ) ;
	this.listNationalities() ;
	this.listOccupations() ;
	me.h.push ( { label:'. ' } ) ;
	if ( me.h.length == 3 ) me.h = [] ; // No information, skip it.
	var sig_event = this.getRelatedItemsWithQualifiers ( { properties:['P793'] } ) ;
	me.sig_event ( sig_event ) ;
	me.h.push ( { label:me.getNewline() } ) ;
}

language_specs['nl'].addBirthText = function () {
	var me = this ;
	var birthdate = me.i.raw.claims['P569'] ;
	var birthplace = me.i.raw.claims['P19'] ;
	var birthname = me.i.raw.claims['P513'] ;
	if ( birthdate !== undefined || birthplace !== undefined || birthname !== undefined ) {
		me.h.push ( { label:me.pronoun_subject , after:' werd geboren ' } ) ;
		if ( birthname !== undefined ) me.h.push ( { label:me.i.getClaimTargetString(birthname[0]) , before:'<i>' , after:'</i> ' } ) ;
		if ( birthdate !== undefined ) me.h.push ( me.renderDate(birthdate[0]) ) ;
		if ( birthplace !== undefined ) me.addPlace ( { q:me.i.getClaimTargetItemID(birthplace[0]) , before:'in ' , after:' ' } ) ;
		var father = me.getParent ( 22 ) ;
		var mother = me.getParent ( 25 ) ;
		if ( father !== undefined || mother !== undefined ) {
			me.h.push ( { label:'als kind van ' } ) ;
			if ( father !== undefined ) me.addPerson ( father , ' ' ) ;
			if ( father !== undefined && mother !== undefined ) me.h.push ( { label:'en ' } ) ;
			if ( mother !== undefined ) me.addPerson ( mother , ' ' ) ;
		}
		me.h.push ( { label:'. ' } ) ;
		me.h.push ( { label:me.getNewline() } ) ;
	}
}


language_specs['nl'].addDeathText = function () {
	var me = this ;
	var deathdate = me.i.raw.claims['P570'] ;
	var deathplace = me.i.raw.claims['P20'] ;
	var deathcause = me.i.hasClaims('P509') ;
	var killer = me.i.hasClaims('P157') ;
	if ( deathdate !== undefined || deathplace !== undefined || deathcause || killer ) {
		me.h.push ( { label:me.pronoun_subject , after:' stierf ' } ) ;
		if ( deathcause !== undefined ) me.cause_of_death ( me.getRelatedItemsWithQualifiers ( { properties:['P509'] } ) ) ;
		if ( killer !== undefined ) me.killer ( me.getRelatedItemsWithQualifiers ( { properties:['P157'] } ) ) ;
		if ( deathdate !== undefined ) me.h.push ( me.renderDate(deathdate[0]) ) ;
		if ( deathplace !== undefined ) me.addPlace ( { q:me.i.getClaimTargetItemID(deathplace[0]) , before:'in ' , after:' ' } ) ;
		me.h.push ( { label:'. ' } ) ;
	}
	var burialplace = me.i.raw.claims['P119'] ;
	if ( burialplace !== undefined ) {
		me.addPlace ( { q:me.i.getClaimTargetItemID(burialplace[0]) , before:me.pronoun_subject+' werd begraven in ' , after:'. ' } ) ;
	}
}

//________________________________________________________________________________________________________________________________________________________________

// FRENCH
language_specs['fr'] = new lang_class ;

language_specs['fr'].setup = function () {
	this.init() ;
	this.month_label = [ '' , 'janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre' ] ; // First one needs to be empty!!
	this.is_male = !(this.i.hasClaimItemLink('P21','Q6581072') || this.i.hasClaimItemLink('P21','Q1052281')) ;
	this.pronoun_subject = (this.is_male?'Il':'Elle') ;
}

language_specs['fr'].getSepAfter = function ( arr , pos ) {
	if ( pos+1 == arr.length ) return ' ' ;
	if ( pos == 0 && arr.length == 2 ) return ' et ' ; // 2 items
	if ( arr.length == pos+2 ) return ' et ' ; //3+ items
	return ', ' ;
}

language_specs['fr'].renderDateByPrecision = function ( pre , year , month , day , precision , jusque ) {
	var me = this ;
	var ret = {} ;
	if ( precision <= 9 ) {
		ret.iso = year*pre ;
		ret.label = year ;
		ret.before = 'en '
		if ( jusque ) ret.before = 'jusqu\'en ' ;
	} else if ( precision == 10 ) {
		ret.iso = year*pre + '-' + month ;
		ret.label = me.month_label[month*1] + ' ' + year ;
		ret.before = 'en ' ;
		if ( jusque ) ret.before = 'jusqu\'en ' ;
	} else if ( precision == 11 ) {
		ret.iso = year*pre + '-' + month + '-' + day ;
		ret.label = (day*1) + ' ' + me.month_label[month*1] + ' ' + year ;
		ret.before = 'le ' ;
		if ( jusque ) ret.before = 'jusqu\'au ' ;
	}
	if ( pre == -1 ) ret.after = " <small>av. J.-C.</small>" + ret.after ;
	return ret ;
}

language_specs['fr'].employers = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' a travaillé pour ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { me.h.push ( { label:'depuis ' } ) ; cb() } ,
		date_to : function(cb) { me.h.push ( { label:'jusque ' } ) ; cb({jusque:true}) } ,
		qualifiers : { job:function(qv){me.h.push ( { before:'en tant que ' , q:qv[0] , after:' ' } )} } ,
		item_end : function(num,sep) { me.h.push ( { label:sep+(num+1<d.length?'pour ':'') } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['fr'].position = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' '+(me.is_dead?'':'est/')+'était ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { me.h.push ( { label:'depuis ' } ) ; cb() } ,
		date_to : function(cb) { me.h.push ( { label:'jusque ' } ) ; cb({jusque:true}) } ,
		qualifiers : { of:function(qv){me.h.push ( { before:'pour ' , q:qv[0] , after:' ' } )} } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['fr'].member = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' '+(me.is_dead?'':'est/')+'était membre de ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { me.h.push ( { label:'depuis ' } ) ; cb() } ,
		date_to : function(cb) { me.h.push ( { label:'jusque ' } ) ; cb({jusque:true}) } ,
//					qualifiers : { job:function(qv){me.h.push ( { before:'en tant que ' , q:qv[0] , after:' ' } )} } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['fr'].alma = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' a étudié à ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { me.h.push ( { label:'depuis ' } ) ; cb() } ,
		date_to : function(cb) { me.h.push ( { label:'jusque ' } ) ; cb({jusque:true}) } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['fr'].field = function ( d ) { var me=this; this.simpleList ( d , 'Son domaine de travail '+(me.is_dead?'comprend':'comprenait')+' ' , '. ' ) ; }
language_specs['fr'].cause_of_death = function ( d ) { this.simpleList ( d , 'de ' , ' ' ) ; }
language_specs['fr'].killer = function ( d ) { this.simpleList ( d , 'par ' , ' ' ) ; }
language_specs['fr'].sig_event = function ( d ) { this.simpleList ( d , this.pronoun_subject+' a joué un rôle important dans ' , '.' ) ; }

language_specs['fr'].spouses = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:me.pronoun_subject+' a épousé ' } ) } ,
		item_start : function(cb) { cb(); me.h.push ( { label:' ' } ) } ,
		date_from : function(cb) { cb(); me.h.push ( { label:' ' } ) ; } ,
		date_to : function(cb) { me.h.push ( { label:'(mariés ' } ) ; cb({jusque:true}) ; me.h.push ( { label:')' } ) } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}

language_specs['fr'].children = function ( d ) {
	var me = this ;
	this.listSentence ( {
		data : d ,
		start : function() { me.h.push ( { label:(me.is_male?'Il est le père de ':'Elle est la mère de ') } ) } ,
		item_start : function(cb) { cb() } ,
		item_end : function(num,sep) { me.h.push ( { label:sep } ) } ,
		end : function() { me.h.push ( { label:'. ' } ) }
	} ) ;
}


language_specs['fr'].addFirstSentence = function () {
	var me = this ;
	me.h.push ( me.getBold ( { label:me.mainTitleLabel() } ) ) ;
	me.h.push ( { label:(this.is_dead?'est':'est') , after:(this.is_male?' un ':' une ') } ) ;
	this.listOccupations() ;
	this.listNationalities() ;
	me.h.push ( { label:'. ' } ) ;
	if ( me.h.length == 3 ) me.h = [] ; // No information, skip it.
	var sig_event = this.getRelatedItemsWithQualifiers ( { properties:['P793'] } ) ;
	me.sig_event ( sig_event ) ;
	me.h.push ( { label:me.getNewline() } ) ;
}

language_specs['fr'].addBirthText = function () {
	var me = this ;
	var birthdate = me.i.raw.claims['P569'] ;
	var birthplace = me.i.raw.claims['P19'] ;
	var birthname = me.i.raw.claims['P513'] ;
	if ( birthdate !== undefined || birthplace !== undefined || birthname !== undefined ) {
		me.h.push ( { label:me.pronoun_subject , after:(me.is_male?' est né ':' est née ') } ) ;
		if ( birthname !== undefined ) me.h.push ( { label:me.i.getClaimTargetString(birthname[0]) , before:'<i>' , after:'</i> ' } ) ;
		if ( birthdate !== undefined ) me.h.push ( me.renderDate(birthdate[0]) ) ;
		if ( birthplace !== undefined ) me.addPlace ( { q:me.i.getClaimTargetItemID(birthplace[0]) , before:'à ' , after:' ' } ) ;
		var father = me.getParent ( 22 ) ;
		var mother = me.getParent ( 25 ) ;
		if ( father !== undefined || mother !== undefined ) {
			me.h.push ( { label:(me.is_male?'. Il est le fils de ':'. Elle est la fille de ') } ) ;
			if ( father !== undefined ) me.addPerson ( father , ' ' ) ;
			if ( father !== undefined && mother !== undefined ) me.h.push ( { label:'et ' } ) ;
			if ( mother !== undefined ) me.addPerson ( mother , ' ' ) ;
		}
		me.h.push ( { label:'. ' } ) ;
		me.h.push ( { label:me.getNewline() } ) ;
	}
}

language_specs['fr'].addDeathText = function () {
	var me = this ;
	var deathdate = me.i.raw.claims['P570'] ;
	var deathplace = me.i.raw.claims['P20'] ;
	var deathcause = me.i.hasClaims('P509') ;
	var killer = me.i.hasClaims('P157') ;
	if ( deathdate !== undefined || deathplace !== undefined || deathcause || killer ) {
		me.h.push ( { label:me.pronoun_subject , after:(me.is_male?' est mort ':' est morte ') } ) ;
		if ( deathcause !== undefined ) me.cause_of_death ( me.getRelatedItemsWithQualifiers ( { properties:['P509'] } ) ) ;
		if ( killer !== undefined ) me.killer ( me.getRelatedItemsWithQualifiers ( { properties:['P157'] } ) ) ;
		if ( deathdate !== undefined ) me.h.push ( me.renderDate(deathdate[0]) ) ;
		if ( deathplace !== undefined ) me.addPlace ( { q:me.i.getClaimTargetItemID(deathplace[0]) , before:'à ' , after:' ' } ) ;
		me.h.push ( { label:'. ' } ) ;
	}
	var burialplace = me.i.raw.claims['P119'] ;
	if ( burialplace !== undefined ) {
		me.addPlace ( { q:me.i.getClaimTargetItemID(burialplace[0]) , before:me.pronoun_subject+(this.is_male?' est enterré à ':' est enterrée à ') , after:'. ' } ) ;
	}
}

//________________________________________________________________________________________________________________________________________________________________
// IGNORE THE REST OF THIS FILE FOR REASONATOR WEB TOOL!

if ( typeof exports != 'undefined' ) { // Running in node.js

	function toObject(_Array){
		   var _Object = new Object();
		   for(var key in _Array){
				  _Object[key] = _Array[key];
		   }
		   return _Object;
	}


	exports.al = toObject(language_specs) ;
	exports.wd = reasonator_base.wd ;
	exports.defaults = {
		language : 'en'
	} ;
	
	infobox_generator.ig.wd = reasonator_base.wd ;
	infobox_generator.ig.init() ;
	exports.infobox_generator = infobox_generator.ig ;
	
	exports.addInfobox = function ( text , o ) {
		var self = this ;
		if ( o.links == 'wiki' && typeof o.infobox_text != 'undefined' ) text = o.infobox_text + text ;
		return text ;
	}

	exports.getShortDesc = function ( o , callback ) {
		var self = this ;
		var params = {
			q : 'Q'+(''+o.q).replace(/\D/g,'') ,
			links : o.links ,
			linktarget : o.linktarget ,
			lang : o.lang||self.defaults.language ,
			callback : function ( q , html , opt ) {
				callback ( self.addInfobox(html,o) ) ;
			}
		} ;
		autodesc_short.ad.loadItem ( o.q , params ) ;
	}

	exports.getDescription = function ( o , callback ) {
		var self = this ;
		if ( typeof o.lang == 'undefined' ) o.lang = self.defaults.language ;

		if ( o.links == 'wiki' && (o.get_infobox||'') != '' && typeof o.infobox_done == 'undefined' ) {
			var o2 = $.extend ( true , {} , o ) ;
			o2.infobox_done = true ;
			infobox_generator.ig.getFilledInfobox ( { q:o2.q , template:o2.infobox_template , lang:o2.lang , callback:function (s) {
				o2.infobox_text = s ;
				return self.getDescription ( o2 , callback ) ;
			} } ) ;
			return ;
		}

		if ( o.mode != 'long' ) {
			return self.getShortDesc ( o , callback ) ;
		}
		if ( typeof self.al[o.lang] == 'undefined' ) {
	//		console.log ( "Language " + o.lang + " not available for long description, using short description instead" ) ;
			return self.getShortDesc ( o , callback ) ;
		}
		self.wd.getItemBatch ( [o.q] , function () {
	
			var call_function = reasonator.getFunctionName ( o.q ) ;
			if ( typeof call_function == 'undefined' ) {
	//			console.log ( "No long description function available for " + o.q + ", using short description instead" ) ;
				return self.getShortDesc ( o , callback ) ;
			}
	
			var ret = $.extend ( true , {} , self.al[o.lang] ) ;
			ret.wd = self.wd ;
			ret.q = o.q ;
			ret.lang = o.lang ;
			ret.redlinks = o.redlinks ;
		
			if ( typeof o.links == 'undefined' ) {
				ret.render_mode = 'text' ;
			} else if ( o.links == 'wiki' ) {
				ret.render_mode = 'wiki' ;
			} else if ( o.links == 'wikidata' ) {
				// Default
			} else if ( o.links == 'wikipedia' ) {
				ret.render_mode = 'wikipedia' ;
			}
		
		
			var to_load = reasonator.addToLoadLater ( o.q ) ;
			ret.wd.getItemBatch ( to_load , function () {
				ret.init() ;
				ret.main_title_label = ret.wd.items[o.q].getLabel() ;
				ret[call_function] ( function ( html ) {
					callback ( self.addInfobox(html,o) ) ;
				} ) ;
			} ) ;
		} ) ;
	}
}