// Try to enforce https
if (location.protocol != 'https:') location.href = 'https:' + window.location.href.substring(window.location.protocol.length);

var flicker_license = {
	'4' : 'Attribution License' ,
	'5' : 'Attribution-ShareAlike License' ,
	'7' : 'No known copyright restrictions' ,
	'8' : 'United States Government Work' ,
	'9' : 'Cc-zero' ,
	'10' : 'Flickr-public domain mark'
}
var flickr_api_key = 'd5abcf21d0111581ce258176f0ff92a1' ;


//________________________________________________________________________________________________

function isMobile () {
	var isMobile = false;
	if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;
	return isMobile ;
}

// Converts a WDQ input box to SPARQL via wdq2sparql, if possible
function wdq2sparql ( wdq_selector , sparql_selector ) {
	var wdq = $.trim ( $(wdq_selector).val() ) ;
	if ( wdq == '' ) {
		alert ( "Please enter a WDQ string to convert!" ) ;
		return false ;
	}
	
	$(wdq_selector).prop('disabled', true);
	$(sparql_selector).prop('disabled', true);
	
	$.get ( '/wdq2sparql/w2s.php' , {
		wdq:wdq
	} , function ( d ) {
		$(wdq_selector).prop('disabled', false);
		$(sparql_selector).prop('disabled', false);
		if ( d.match ( /^<!DOCTYPE/ ) ) {
			alert ( "Sorry, that WDQ conversion is not supported yet. Feel free to bug Stas about it!" ) ;
			return ;
		}
		d = d.replace ( /^prefix.+$/mig , '' ) ;
		d = d.replace ( /\s+/g , ' ' ) ;
		d = $.trim ( d ) ;
		$(sparql_selector).val ( d ) ;
		$(wdq_selector).val ( '' ) ;
	} ) ;
	
	return false ;
}

function ucFirst(string) {
	if ( typeof string == 'undefined' ) return '' ;
	return string.substring(0, 1).toUpperCase() + string.substring(1);
}

function sanitizeID ( id ) {
	return escattr ( (''+id).replace(/\s/g,'_').replace(/[,.+&@?:"`\/'\)\(\|]/g,'_') ) ;
}

function escattr ( s ) {
	return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/\//g,'&#x2F;') ;
}

function getBlobBuilder () {
	if ( window.BlobBuilder ) return new window.BlobBuilder() ;
	if ( window.MozBlobBuilder ) return new window.MozBlobBuilder() ;
	if ( window.WebKitBlobBuilder ) return new window.WebKitBlobBuilder() ;
	if ( window.MsBlobBuilder ) return new window.MsBlobBuilder() ;
	return undefined ;
}

// "length" of object
function object_length ( obj ) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function tableSorterExtractPrettyNumbers ( node ) {
	return $(node).text().replace(/,/g,'');
}

function httpsAlert ( id , b4 ) {
	if ( window.location.href.match ( /^https:/ ) ) {
		var url = window.location.href.replace ( /^https:/ , 'http:' ) ;
		var h = '<div id="https_alert" class="alert"><strong>Caveat :</strong> Using https on this page does not work in all browsers, due to downstream http dependencies. ' ;
		h += '<a href="' + url + '">Use http instead</a>.<a class="close" data-dismiss="alert" href="#">&times;</a></div>' ;
		if ( b4 ) $('#'+id).before ( h ) ;
		else $('#'+id).after ( h ) ;
		$('#https_alert').alert() ;
	}
}

function getUrlVars () {
	var vars = {} ;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	$.each ( hashes , function ( i , j ) {
		var hash = j.split('=');
		hash[1] += '' ;
		vars[hash[0]] = decodeURI(hash[1]).replace(/_/g,' ');
	} ) ;
	return vars;
}

function clearSelection () {
	if (document.selection)	document.selection.empty();
	else if (window.getSelection) window.getSelection().removeAllRanges();
}

function prettyNumber(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function prettyTime ( seconds ) {
	seconds = Math.floor ( seconds ) ;
	var ret ;
	if ( seconds < 60 ) {
		ret = seconds + ' sec' ;
	} else {
		var min = Math.floor ( seconds / 60 ) ;
		ret = min + ' min ' + ( seconds - min*60 ) + ' sec' ;
	}
	return ret ;
}

function quote4attr ( s ) {
	return s.replace ( /"/g , '&quot;' ) ;
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

function clone ( o ) {
	return jQuery.extend(true, {}, o);
}


function loadMenuBarAndContent ( o ) {
	var mb = '/resources/html/menubar.html' ;
	if ( typeof o.mb != 'undefined' ) mb = o.mb ;
	$('#menubar').load ( mb , function () {
		if ( undefined !== o.toolname ) $('#toolname').html ( o.toolname ) ;
		if ( undefined !== o.meta ) $('#discuss_link').attr ( 'href' , '//meta.wikimedia.org/wiki/'+o.meta ) ;
		else $('#discuss_link').html('Talk').attr ( 'href' , '//en.wikipedia.org/wiki/User_talk:Magnus_Manske' ) ;
		if ( undefined === o.content ) {
			if ( undefined !== o.run ) o.run() ;
		} else {
			$.ajaxSetup ({cache: false});
			$('#main_content').load ( o.content , function () {
				$.ajaxSetup ({cache: true});
				if ( typeof window.bootstrap4_compatability != 'undefined' ) bootstrap4_compatability() ;
				if ( undefined !== o.run ) o.run() ;
			} ) ;
		}
	} ) ;
}

//________________________________________________________________________________________________

/*
To use :
- In form, put <div id='tusc_container_wrapper'></div>
- In ready(), put wrapper
	tusc.setupLoginBar ( $('#tusc_container_wrapper') , function () {
- Once loaded, run
	tusc.initializeTUSC () ;
	tusc.addTUSC2toolbar() ;
*/

var tusc = {
	onLogInCustom : function () {} , // dummy, overwrite
	
	onLogIn : function () {
		tusc.updateToolbarTitle() ;
		//if ( tusc.onLogInCustom !== undefined ) 
		tusc.onLogInCustom() ;
	} ,
	
	addTUSC2toolbar : function () {
		var h = "<li><span id='tusc_marker' class='label label-important'>TUSC</span></li>" ;
		$('#toolbar-right').prepend ( h ) ;
		$('#tusc_marker').click ( tusc.onClickToolbar ) ;
		tusc.updateToolbarTitle() ;
	} ,
	
	updateToolbarTitle : function () {
		$('#tusc_marker').attr ( 'title' , ( tusc.logged_in ? 'You are logged into TUSC. Click here to log out.' : 'You are not logged into TUSC.' ) ) ;
	} ,
	
	tryTUSC : function ( try_wikis , user , pass ) {
		if ( try_wikis.length == 0 ) {
			$('#tusc_message').addClass('.label-important').html ( "<b>LOGIN FAILED</b>" ) ;
			return ;
		}
		var w = try_wikis.shift() ;
		var parts = w.split ( '.' ) ;
		$.getJSON ( "/tusc/tusc.php?callback=?" , {
			action : 'check_password' ,
			user : user ,
			language : parts[0] ,
			project : parts[1] ,
			password : pass
		} , function ( d ) {
			if ( d.status == 'OK' ) {
				tusc.user = user ;
				tusc.pass = pass ;
				tusc.language = parts[0] ;
				tusc.project = parts[1] ;
				tusc.logged_in = true ;
				if ( $('#tusc_remember').is(':checked') ) {
					var c = {} ;
					$.each ( [ 'user' , 'pass' , 'language' , 'project' , 'logged_in' ] , function ( k , v ) { c[v] = tusc[v] ; } ) ;
					$.cookie('tusc', JSON.stringify ( c ) , { expires: 90, path: '/' });
				}
				$('#tusc_message').addClass('.label-success').html ( "<b>SUCCESSFULLY LOGGED IN</b>" ) ;
				$('#tusc_form').hide() ;
//				setTimeout ( function () { $('#tusc_form').hide() } , 1000 ) ;
				$('#tusc_marker').removeClass('label-important').addClass('label-success') ;
				tusc.onLogIn () ;
			} else {
				tusc.tryTUSC ( try_wikis , user , pass ) ;
			}
	//		console.log ( parts[0] + ' . ' + parts[1] + ' : ' + d ) ;
		} ) ;
	} ,
	
	initializeTUSC : function ( local_wiki ) {
		var try_wikis = [] ;
		try_wikis.push ( 'commons.wikimedia' ) ;
		if ( undefined !== local_wiki ) try_wikis.push ( local_wiki ) ;
		$('#tusc_form').submit ( function (o) {
			o.preventDefault() ;
			$('#tusc_message').removeClass('.label-success').removeClass('.label-important').addClass('label').html ( "<i>Logging in...</i>" ) ;
			var user = $('#tusc_user').val() ;
			var pass = $('#tusc_pass').val() ;
			tusc.tryTUSC ( try_wikis.slice(0) , user , pass ) ;
			return false ;
		} ) ;
		$('#tusc_container').show() ;
		
		var c = $.cookie('tusc') ;
		if ( 'null' != c && null != c ) {
			c = JSON.parse ( c ) ;
			if ( c.logged_in ) {
				$('#tusc_user').val ( c.user ) ;
				$('#tusc_pass').val ( c.pass ) ;
				$('#tusc_form').submit () ;
			}
		}
	} ,
	
	setupLoginBar : function ( wrapper , callback ) {
		$(wrapper).show().load ( 'resources/html/tusc.html' , function () {
//			tusc.addTUSC2toolbar() ;
			if ( callback !== undefined ) callback() ;
		} ) ;
	} ,
	
	onClickToolbar : function () {
		if ( tusc.logged_in ) {
			$('#tusc_form').show() ;
			$('#tusc_form').parents().show() ;
			$('#tusc_message').removeClass('label').html('') ;
			$('#tusc_marker').addClass('label-important').removeClass('label-success') ;
			$.cookie('tusc', null , { expires: 90, path: '/' });
			alert ( "Logged out of TUSC" ) ;
		} else {
			$('#tusc_form').parents().show() ;
		}
	} ,
	
	
	logged_in : false
} ;

//________________________________________________________________________________________________


function MonthRange ( o ) {
	var me = this ;
	$.each ( [ 'dateChangeCallback' , 'buttonCallback' , 'root_id' ] , function ( k , v ) {
		if ( undefined !== o[v] ) me[v] = o[v] ;
	} ) ;
	
	if ( undefined === me.root_id ) {
		console.log ( "MonthRange needs root_id!" ) ;
		return ;
	}
	
	me.id_m1 = me.root_id + '_month1' ;
	me.id_m2 = me.root_id + '_month2' ;
	me.id_button = me.root_id + '_button' ;
	
	var currentTime = new Date() ;
	me.month = currentTime.getMonth() + 1 ;
//	me.day = currentTime.getDate() ;
	me.year = currentTime.getFullYear() ;
	me.months = [ '2007-12' ] ;
	for ( var y = 2008 ; y <= me.year ; y++ ) {
		for ( var m = 1 ; m <= ( y == me.year ? me.month : 12 ) ; m++ ) {
			me.months.unshift ( y + '-' + ( m < 10 ? '0'+m : m ) ) ;
		}
	}
	
	

	var h = '' ;
	h += "<select id='"+me.id_m1+"' class='span2' style='margin-bottom:0px'>" ;
	$.each ( me.months , function (k,v) {
		h += "<option value='"+v+"'" ;
//		if ( v == seed_m1 ) h += " selected" ;
		h += ">" + v + "</option>" ;
	} ) ;
	h += "</select>" ;
	h += " &nbsp; " ;
	h += "<select id='"+me.id_m2+"' class='span2' style='margin-bottom:0px'>" ;
	h += "</select> " ;
	h += "<button id='"+me.id_button+"' class='btn'>Show page views (estimating time...)</button>" ;
	$('#'+me.root_id).html ( h ) ;
	
	me.setKey ( o.seed ) ;
	
	if ( undefined !== me.buttonCallback ) $('#'+me.id_button).click ( function () { me.buttonCallback ( me ) } ) ;
	
	$('#'+me.id_m1).change ( function () {
		me.updateMonth2() ;
		if ( undefined !== me.dateChangeCallback ) me.dateChangeCallback ( me ) ;
	} ) ;
	$('#'+me.id_m2).change ( function () {
		if ( undefined !== me.dateChangeCallback ) me.dateChangeCallback ( me ) ;
	} ) ;

}

MonthRange.prototype.m1 = function () { return $('#'+this.id_m1).val() } ;
MonthRange.prototype.m2 = function () { return $('#'+this.id_m2).val() } ;

MonthRange.prototype.getRange = function () {
	var me = this ;
	var ret = [] ;
	if ( me.m2() == 'none' ) {
		ret.push ( me.m1() ) ;
	} else {
		$.each ( me.months , function ( dummy , month ) {
			if ( month >= me.m1() && month <= me.m2() ) ret.push ( month ) ;
		} ) ;
	}
	return ret ;
}

MonthRange.prototype.getKey = function () {
	var k = this.m1() ;
	if ( this.m2() != 'none' ) k += '|' + this.m2() ;
	return k ;
}

MonthRange.prototype.setKey = function ( seed ) {
	var me = this ;
	
	if ( seed === undefined ) seed = me.year+'-01' ;

	var seed1 ;
	var seed2 = 'none' ;
	var m = seed.match ( /^([0-9-]+)\|([0-9-]+)$/ ) ;
	if ( m == null ) {
		seed1 = seed ;
	} else {
		seed1 = m[1] ;
		seed2 = m[2] ;
	}
	
	$('#'+me.id_m1).val ( seed1 ) ;
	me.updateMonth2 ( seed2 ) ;
}

MonthRange.prototype.updateMonth2 = function ( seed ) {
	var me = this ;
	var m1 = $('#'+me.id_m1).val() ;
	var m2 = seed || $('#'+me.id_m2).val() ;
	if ( undefined !== m2 && m2 < m1 ) m2 = undefined ;
	var h = '' ;
	h += "<option value='none'" ;
	if ( undefined === m2 ) h += " selected" ;
	h += "><i style='color:#DDDDDD'>Single month</i></option>" ;
	$.each ( me.months , function (k,v) {
		if ( v < m1 ) return ;
		h += "<option value='"+v+"'" ;
		if ( v == (m2||'') ) h += " selected" ;
		h += ">" + v + "</option>" ;
	} ) ;
	$('#'+me.id_m2).html ( h ) ;
}


//________________________________________________________________________________________________

var ts2Interface = {

	// Adds an automated page-exists marker on a text input box
	// Mandatory object members : 'input' , 'fieldset' , 'lang' , 'project' , 'ns' 
	// Optional : 'yes'/'no' as callback functions; 'submit' to en-/disable a submit button (FIXME)
	addInputPageExistsVerification : function ( o ) { // <input> needs to be in a fieldset, both with selectors
	
		// Paranoia
		var ok = true ;
		$.each ( [ 'input' , 'fieldset' , 'lang' , 'project' , 'ns' ] , function ( k , v ) {
			if ( undefined === o[v] ) ok = false ;
		} ) ;
		if ( !ok ) {
			console.log ( "Missing object property in addInputPageExistsVerification" ) ;
			return ;
		}
		
		var me = this ;
		var o2 = clone ( o ) ;
		me.late_validated_creator[o2.input] = '' ;
		$(o2.fieldset).addClass('control-group') ;
//		if ( o2.typeahead ) $(o2.input).attr('data-provide',"typeahead").typeahead() ; // FIXME
		$(o2.input).keyup ( function () {
			var text = $(o2.input).val() ;
			if ( text == '' || null !== text.match(/\|/) ) {
				$(o2.fieldset).removeClass('error').removeClass('success') ;
				return ;
			}
			if ( text == me.late_validated_creator[o2.input] ) return ; // Just checked
			me.late_validated_creator[o2.input] = text ;
			var p = new WikiPage ( { title : text , ns : o2.ns , lang : o2.lang , project : o2.project } ) ;
			p.checkExists ( function () {
//				console.log("YAY");
				$(o2.fieldset).removeClass('error') ;
				$(o2.fieldset).addClass('success') ;
				if ( undefined !== o2.yes ) o2.yes ( me ) ;
				if ( undefined !== o2.submit ) $(o2.submit).removeAttr('disabled') ; // FIXME
			} , function () {
//				console.log("NAY");
				$(o2.fieldset).removeClass('success') ;
				$(o2.fieldset).addClass('error') ;
				if ( undefined !== o2.no ) o2.no ( me ) ;
				if ( undefined !== o2.submit ) $(o2.submit).attr('disabled','disabled') ; // FIXME
			} ) ;
		} ) ;
	} ,
	
	late_validated_creator : {}
} ;



//________________________________________________________________________________________________

// Query settings are 'api' and 'ts'

var wikiSettings = {
	ts_catscan_api : 'https://toolserver.org/~magnus/catscan_rewrite.php' ,
	stats_grok : 'stats.grok.se' ,
	accessPreferences : {
		pagesInCategoryTree : 'api'
	} ,
	images : {
		spin : 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Spinning_wheel_throbber.gif'
	}
} ;



//________________________________________________________________________________________________



var wikiDataCache = {
	pagesInCategoryTree : {} ,
	siteInfo : {} ,
	pageViews : {} ,
	pageViewTemp : {} ,
	concurrent : 0 ,
	max_concurrent : 5 , // 500
	pv_proj2stats : {
		wikipedia : '' ,
		wikibooks : '.b' ,
		wiktionary : '.d' ,
		wikisource : '.s' ,
		wikinews : '.n' ,
		wikimedia : '.m' ,
		wikiversity : '.v' ,
		wikivoyage : '' ,
		mediawiki : '.w'
	} ,
	ensureSiteInfo : function ( list , callback ) {
		while ( list.length > 0 ) {
			var p = new WikiPage ( { project : list[0].project , lang : list[0].lang } ) ;
			list.shift() ;
			if ( p.ensureNamespaceName ( function () { wikiDataCache.ensureSiteInfo ( list , callback ) } ) ) return ;
		}
		callback () ;
	}
} ;


//________________________________________________________________________________________________

function WikiPage ( o ) {
	var me = this ;
	me.ns = 0 ; // Necessary?
	if ( undefined !== o ) {
		$.each ( [ 'lang' , 'project' , 'title' , 'ns' , 'pageid' ] , function ( k , v ) {
			if ( undefined !== o[v] ) me[v] = o[v] ;
		} ) ;
		if ( undefined !== me.lang && me.lang == 'commons' ) me.project = 'wikimedia' ;
		if ( undefined !== me.title ) me.title = me.title.replace ( /_/g , ' ' ) ;
	}
}

WikiPage.prototype.parseNamespaceFromTitle = function ( callback ) {
	var me = this ;
	me.ns = -1 ; // Dummy
	if ( !me.isValid() ) return ; // Paranoia
	me.ns = undefined ;
	var m = me.title.match ( /^([^:]+):(.+)$/ ) ;
	if ( m == null || m.length != 3 ) {
		me.ns = 0 ;
		callback ( me ) ;
		return ;
	}
	var nsn = m[1] ;
	var newtitle = m[2] ;
	var k = me.getSiteInfoKey() ;
	if ( me.ensureNamespaceName ( function () { me.parseNamespaceFromTitle ( callback ) ; return ; } ) ) ;
	
	$.each ( wikiDataCache.siteInfo[k].namespaces , function ( ns , name ) {
		if ( name['*'].toLowerCase() != nsn.toLowerCase() ) return ;
		me.ns = ns ;
		me.title = newtitle ;
		return false ;
	} ) ;
	if ( k != 'en.wikipedia' && undefined === me.ns ) {
		$.each ( wikiDataCache.siteInfo['en.wikipedia'].namespaces , function ( ns , name ) {
			if ( name['*'].toLowerCase() != nsn.toLowerCase() ) return ;
			me.ns = ns ;
			me.title = newtitle ;
			return false ;
		} ) ;
	}
	
	if ( undefined !== me.ns ) callback ( me ) ;
}

WikiPage.prototype.getSiteInfoKey = function () {
	return this.lang + '.' + this.project ;
}

WikiPage.prototype.getKey = function () {
	return this.getSiteInfoKey() + ':' + this.getFullTitle() ;
}

WikiPage.prototype.ensureNamespaceName = function ( call ) {
	var me = this ;
	var k = me.getSiteInfoKey() ;
	if ( undefined !== wikiDataCache.siteInfo[k] ) return false ; // Already loaded
	
	// Get site info, then call original function
	$.getJSON ( me.getApiRoot() + "?callback=?" , {
		action : 'query' ,
		meta : 'siteinfo' ,
		siprop : 'general|namespaces|namespacealiases|statistics' ,
		format : 'json'
	} , function ( d ) {
		wikiDataCache.siteInfo[k] = d.query ;
		call ( me ) ;
	} ) ;
	
	return true ;
}

WikiPage.prototype.getLink = function ( o ) {
	if ( !this.isValid() ) return undefined ;
	if ( undefined === o ) o = {} ;
	var url = this.getNiceURL() ;
	var s = o.text ? o.text : ( o.no_namespace ? this.getNiceTitle() : this.getFullNiceTitle() ) ;
	var ret = "<a href='" + url + "'" ;
	ret += ' title="' + quote4attr ( s ) + '"' ;
	if ( o !== undefined && undefined !== o.target ) ret += " target='" + o.target + "'" ;
	ret += ">" + s + "</a>" ;
	return ret ;
}

WikiPage.prototype.getExtendedLink = function ( o ) {
	if ( !this.isValid() ) return undefined ;
	if ( undefined === o ) o = {} ;
	var url = this.getNormalURL ( o ) ;
	var s = o.text || ( o.no_namespace ? this.getNiceTitle() : this.getFullNiceTitle() ) ;
	var ret = "<a href='" + url + "'" ;
	ret += ' title="' + quote4attr ( s ) + '"' ;
	if ( o.target !== undefined && undefined !== o.target ) ret += " target='" + o.target + "'" ;
	ret += ">" + s + "</a>" ;
	return ret ;
}

WikiPage.prototype.getNiceURL = function () {
	if ( !this.isValid() ) return undefined ;
	return '//' + this.lang + '.' + this.project + '.org/wiki/' + encodeURIComponent ( this.getFullTitle() ) . replace ( /'/g , '&#39;' ) ;
}

WikiPage.prototype.getNormalURL = function ( o ) {
	if ( !this.isValid() ) return undefined ;
	var ret = '//' + this.lang + '.' + this.project + '.org/w/index.php?title=' + encodeURIComponent ( this.getFullTitle() ) . replace ( /'/g , '&#39;' ) ;
	if ( undefined !== o.action ) ret += '&action=' + o.action ;
	return ret ;
}

WikiPage.prototype.getNamespaceName = function () {
	if ( undefined !== this.namespace_name ) return this.namespace_name ;
	var k = this.getSiteInfoKey() ;
	if ( undefined === wikiDataCache.siteInfo[k] ) k = 'en.wikipedia' ; // Fallback
	if ( undefined === wikiDataCache.siteInfo[k].namespaces[this.ns] ) console.log ( this.ns + " IN " + k ) ;
	this.namespace_name = wikiDataCache.siteInfo[k].namespaces[this.ns]['*'] ;
	return this.namespace_name ;
}

WikiPage.prototype.getFullTitle = function () {
	var me = this ;
	if ( !me.isValid() ) return undefined ;
	
	var nsn = me.getNamespaceName() ;
	var s = nsn == '' ? me.title : nsn+':'+me.title ;
	return s.replace ( / /g , '_' ) ;
}

WikiPage.prototype.getFullNiceTitle = function () {
	if ( !this.isValid() ) return undefined ;

	var me = this ;
	var nsn = me.getNamespaceName() ;
	var s = nsn == '' ? me.title : nsn+':'+me.title ;
	return s.replace ( /_/g , ' ' ) ;
}

WikiPage.prototype.getNiceTitle = function () {
	if ( !this.isValid() ) return undefined ;
	var ret = this.title ;
	ret = ret.replace ( /_/g , ' ' ) ;
	return ret ;
}

WikiPage.prototype.isValid = function () {
	if ( '' == (this.title||'') ) return false ;
	if ( this.ns === undefined ) return false ;
//	if ( this.ns === undefined || this.ns == '' ) return false ;
	if ( '' == (this.lang||'') ) return false ;
	if ( '' == (this.project||'') ) return false ;
	return true ;
}

WikiPage.prototype.getApiRoot = function () {
	if ( '' == (this.lang||'') ) return undefined ;
	if ( '' == (this.project||'') ) return undefined ;
	return "https://" + this.lang + "." + this.project + ".org/w/api.php" ;
}

WikiPage.prototype.getPagesInCategoryTree = function ( o ) {
	var me = this ;
	if ( !me.isValid() ) return ;
	if ( me.ns != 14 ) return ;

	if ( o.cacheable ) {
		var cacheKey = [ o.depth , me.lang , me.project , me.ns , me.title ] ;
		o.cacheKey = cacheKey.join ( '|' ) ;
		if ( undefined !== wikiDataCache.pagesInCategoryTree[o.cacheKey] ) {
			o.callback ( clone ( wikiDataCache.pagesInCategoryTree[o.cacheKey] ) ) ;
			return ;
		}
	}
	
	if ( wikiSettings.accessPreferences.pagesInCategoryTree == 'api' ) return this.getPagesInCategoryTreeViaAPI ( o ) ;
	else return this.getPagesInCategoryTreeViaToolserver ( o ) ;
}

WikiPage.prototype.getPagesInCategoryTreeViaToolserver = function ( o ) {
	var me = this ;

	$.getJSON ( wikiSettings.ts_catscan_api + "?callback=?" , {
		format : 'json' ,
		depth : o.depth ,
		categories : me.title ,
		doit : 1
	} , function ( d ) {
		var data = {} ;
		if ( undefined !== d['*'] && undefined !== d['*'][0] && undefined !== d['*'][0]['*'] ) {
			$.each ( d['*'][0]['*'] , function ( k , v ) {
				if ( undefined !== data[v.a.id] ) return ; // Paranoia
				var p = new WikiPage ;
				p.lang = me.lang ;
				p.project = me.project ;
				p.title = v.a.title ;
				p.pageid = v.a.id ;
				p.na = v.a.namespace ;
				data[p.pageid] = p ;
			} ) ;
		}
		o.callback ( data ) ;
		if ( o.cacheable ) wikiDataCache.pagesInCategoryTree[o.cacheKey] = clone ( data ) ;
	} ) ;
}

WikiPage.prototype.getPagesInCategoryTreeViaAPI = function ( o , depth , d ) {
	var me = this ;

	if ( undefined === o.initialized ) {
		o.initialized = true ;
		o.data = {} ;
		o.return_subcats = false ;
		var ns = o.namespaces || [] ;
		$.each ( ns , function ( k , v ) {
			if ( v == 14 ) o.return_subcats = true ;
		} ) ;
		ns.push ( 14 ) ;
		o.use_ns = ns ;
		o.checked_categories = {} ;
		o.checked_categories[me.title] = 1 ;
		o.page_counter = 0 ;
		if ( o.depth === undefined ) o.depth = 0 ;
		depth = o.depth ;
		o.running = 0 ;
	}
	
	var params = {
		action : 'query' ,
		list : 'categorymembers' ,
		cmtitle : 'Category:' + me.title ,
		cmnamespace : o.use_ns.join('|') ,
		cmlimit : 500 ,
		redirects : 1 ,
		format : 'json',
		rawcontinue : 1
	} ;
	
	
	if ( undefined !== o.status  ) o.status ( { cat : me , depth : depth||o.depth||0 , data : o , mode : 'query' } ) ;
	
	if ( undefined !== d ) {
		o.running-- ;
		if ( undefined !== d.query.categorymembers ) {

			$.each ( d.query.categorymembers , function ( k , v ) {
				var page = new WikiPage ( v ) ;
				if ( page.ns != 0 ) page.title = page.title.replace ( /^[^:]+:/ , '' ) ; // Remove namespace
				page.lang = me.lang ;
				page.project = me.project ;

				if ( page.ns != 14 || ( page.ns == 14 && o.return_subcats ) ) {
					if ( undefined === o.data[page.pageid] ) {
						o.page_counter++ ;
						o.data[page.pageid] = page ;
					}
				}
				
				if ( page.ns == 14 && depth > 0 && undefined === o.checked_categories[page.title] ) {
					o.checked_categories[page.title] = 1 ;
					page.getPagesInCategoryTreeViaAPI ( o , depth-1 ) ;
				}
				
			} ) ;
		}

		if ( undefined === d['query-continue'] ) {
			if ( o.running == 0 ) {
				if ( undefined !== o.callback ) o.callback ( o.data ) ;
				if ( o.cacheable ) wikiDataCache.pagesInCategoryTree[o.cacheKey] = clone ( o.data ) ;
			}
			return ;
		} else {
			params.cmcontinue = d['query-continue'].categorymembers.cmcontinue ;
		}
		
	}
	
	o.running++ ;
	$.getJSON ( me.getApiRoot() + "?callback=?" , params , function ( d ) { me.getPagesInCategoryTreeViaAPI ( o , depth , d ) } ) ;
}


WikiPage.prototype.getLanguageLinks = function ( callback , data ) {
	var me = this ;

	if ( undefined === data ) {
		if ( !me.isValid() ) return ;
		if ( me.ensureNamespaceName ( function () { me.getLanguageLinks ( callback ) } ) ) return ;
		me.langlinks = {} ;
	}
	
	var params = {
		action : 'query' ,
		prop : 'langlinks' ,
		titles : me.getFullTitle() ,
		lllimit : 500 ,
		redirects : 1 ,
		format : 'json',
		rawcontinue : 1
	} ;

	if ( undefined !== data ) {
		if ( undefined !== data.query.pages ) {
			$.each ( data.query.pages , function ( k1 , v1 ) {
				if ( undefined !== v1.missing ) {
					me.missing = true ;
					callback ( me ) ;
					return ;
				}
				if ( undefined !== v1.langlinks ) {
					$.each ( v1.langlinks , function ( k2 , v2 ) {
						me.langlinks[v2.lang] = v2['*'] ;
					} ) ;
				}
			} ) ;
		}
		
		if ( undefined === data['query-continue'] ) {
			callback ( me ) ;
			return ;
		}
		
		params.llcontinue = data['query-continue'].langlinks.llcontinue ;
	}
	
	$.getJSON ( me.getApiRoot() + "?callback=?" , params , function ( data ) {
		me.getLanguageLinks ( callback , data ) ;
	} ) ;
}

WikiPage.prototype.getGlobalUsage = function ( callback , namespaces , data ) { // namespaces either undefined, or array with namespace IDs to return
	var me = this ;

	if ( undefined === data ) {
		if ( !me.isValid() ) return ;
		if ( me.ns != 6 ) return ; // Not a file
		if ( me.ensureNamespaceName ( function () { me.getGlobalUsage ( callback , namespaces ) } ) ) return ;
		me.globalusage = [] ;
	}
	
	var nsok = {} ;
	if ( undefined !== namespaces ) {
		$.each ( namespaces , function ( k , v ) { nsok[v] = 1 } ) ;
	}
	
	var params = {
		action : 'query' ,
		prop : 'globalusage' ,
		titles : me.getFullTitle() ,
		guprop : 'pageid|namespace' ,
		gulimit : 500 ,
		redirects : 1 ,
		format : 'json',
		rawcontinue : 1
	} ;
	
	if ( undefined !== data ) {
		if ( undefined !== data.query.pages ) {
			$.each ( data.query.pages , function ( k1 , v1 ) {
				if ( undefined !== v1.missing ) {
					me.missing = true ;
					callback ( me ) ;
					return ;
				}
				if ( undefined !== v1.globalusage ) {
					$.each ( v1.globalusage , function ( k2 , v2 ) {
						if ( undefined === namespaces || undefined !== nsok[v2.ns] ) {
							me.globalusage.push ( v2 ) ;
						}
					} ) ;
				}
			} ) ;
		}
		
		if ( undefined === data['query-continue'] ) {
			callback ( me ) ;
			return ;
		}
		
		params.gucontinue = data['query-continue'].globalusage.gucontinue ;
	}
	
	$.getJSON ( me.getApiRoot() + "?callback=?" , params , function ( data ) {
		me.getGlobalUsage ( callback , namespaces , data ) ;
	} ) ;
}

WikiPage.prototype.getImageInfo = function ( o ) {
	var me = this ;
	if ( me.ns != 6 ) return ;
	
	if ( undefined !== me.imageinfo ) {
		if ( undefined !== o.callback ) o.callback ( me ) ;
		return ;
	}

	$.getJSON ( me.getApiRoot() + "?callback=?" , {
		action : 'query' ,
		prop : 'imageinfo' ,
		titles : 'File:' + me.title ,
		iiprop : 'timestamp|user|userid|comment|parsedcomment|url|size|dimensions|sha1|mime|mediatype|metadata|archivename|bitdepth' ,
		iiurlwidth : (o.width||120) ,
		iiurlheight : (o.height||120) ,
		redirects : 1 ,
		format : 'json'
	} , function ( d ) {
		me.imageinfo = {} ;
		$.each ( d.query.pages , function ( k , v ) {
			if ( undefined !== v.imageinfo ) {
				me.imageinfo = v.imageinfo[0] ;
				me.imageinfo.imagerepository = v.imagerepository ;
			}
		} ) ;
		if ( undefined !== o.callback ) o.callback ( me ) ;
	} ) ;
	
}

WikiPage.prototype.getCreationDate = function ( callback ) {
	var me = this ;

	if ( undefined === me.pageid ) {
		if ( me.ensureNamespaceName ( function () { me.getCreationDate ( callback ) } ) ) return ;
	}
	
	if ( undefined !== me.creationdate ) {
		if ( undefined !== callback ) callback ( me ) ;
		return ;
	}
	
	var params = {
		action : 'query' ,
		prop : 'revisions' ,
		rvlimit : 1 ,
		rvprop : 'timestamp' ,
		rvdir : 'newer' ,
		redirects : 1 ,
		format : 'json'
	} ;

	if ( undefined === me.pageid ) params.titles = me.getFullTitle() ;
	else params.pageids = me.pageid ;
	
	$.getJSON ( me.getApiRoot() + "?callback=?" , params , function ( d ) {
		me.creationdate = d.query.pages[me.pageid].revisions[0].timestamp ;
		if ( undefined !== callback ) callback ( me ) ;
	} ) ;
}


WikiPage.prototype.getExternalLinks = function ( callback , data ) {
	var me = this ;

	if ( undefined === data ) {
		if ( !me.isValid() ) return ;
		if ( me.ensureNamespaceName ( function () { me.getExternalLinks ( callback ) } ) ) return ;
		me.extlinks = [] ;
	}
	
	var params = {
		action : 'query' ,
		prop : 'extlinks' ,
		titles : me.getFullTitle() ,
		ellimit : 500 ,
		redirects : 1 ,
		format : 'json',
		rawcontinue : 1
	} ;
	
	if ( undefined !== data ) {
		if ( undefined !== data.query.pages ) {
			$.each ( data.query.pages , function ( k1 , v1 ) {
				if ( undefined !== v1.missing ) {
					me.missing = true ;
					callback ( me ) ;
					return ;
				}
				if ( undefined !== v1.extlinks ) {
					$.each ( v1.extlinks , function ( k2 , v2 ) {
						me.extlinks.push ( v2['*'] ) ;
					} ) ;
				}
			} ) ;
		}
		
		if ( undefined === data['query-continue'] ) {
			callback ( me ) ;
			return ;
		}
		
		params.eloffset = data['query-continue'].langlinks.eloffset ;
	}
	
	$.getJSON ( me.getApiRoot() + "?callback=?" , params , function ( data ) {
		me.getExternalLinks ( callback , data ) ;
	} ) ;
}

WikiPage.prototype.getCategoryInfo = function ( p , depth ) {
	var me = this ;
	
	if ( undefined === depth ) depth = p.depth || 0 ;
	
	// Make sure this page has a pageid
	if ( undefined === me.pageid ) {
		me.checkExists ( function () { me.getCategoryInfo ( p ) } ) ;
		return ;
	}
	
	// Get all subcategories
	if ( undefined === p.running ) {
		if ( depth == 0 ) {
			p.subcats = {} ;
			p.subcats[me.pageid] = me ;
		} else {
			p.running = true ;
			me.getPagesInCategoryTree ( { depth : depth , namespaces : [ 14 ] , cacheable : false , callback : function ( d ) {
				p.subcats = d ;
				p.subcats[me.pageid] = me ;
				me.getCategoryInfo ( p , depth-1 ) ;
			} } ) ;
			return ;
		}
	}
	
	var scg = [ [] ] ;
	$.each ( p.subcats , function ( pid , v ) {
		if ( scg[scg.length-1].length >= 50 ) scg.push ( [] ) ;
		scg[scg.length-1].push ( pid ) ;
	} ) ;

	var running = scg.length ;
	var results = {} ;
	$.each ( scg , function ( k , v ) {
		
		var params = {
			action : 'query' ,
			prop : 'categoryinfo' ,
			pageids : v.join('|') ,
			format : 'json'
		} ;
		
		$.getJSON ( me.getApiRoot() + "?callback=?" , params , function ( data ) {
			$.each ( data.query.pages , function ( k2 , v2 ) {
				$.each ( v2.categoryinfo || [] , function ( k3 , v3 ) {
					if ( k3 == 'hidden' ) return ;
					results[k3] = ( results[k3] || 0 ) + parseInt ( v3 ) ;
				} ) ;
			} ) ;
			running-- ;
			if ( running == 0 ) {
				results.catcount = 0 ;
				$.each ( p.subcats , function () { results.catcount++ } ) ;
				p.callback ( results ) ;
			}
		} ) ;
	} ) ;
}



WikiPage.prototype.checkExists = function ( yes , no ) {
	var me = this ;
	var params = {
		action : 'query' ,
		prop : 'info' ,
		titles : me.getFullTitle() ,
		format : 'json'
	} ;
	
	$.getJSON ( me.getApiRoot() + "?callback=?" , params , function ( data ) {
		$.each ( data.query.pages , function ( k , v ) {
			if ( k == -1 ) {
				if ( undefined !== no ) no ( me ) ;
			} else {
				if ( undefined === me.pageid ) me.pageid = v.pageid ;
				if ( undefined !== yes ) yes ( me ) ;
			}
			return false ; // Paranoia
		} ) ;
	} ) ;	
}

/*
WikiPage.prototype.getViewStats = function  ( o ) {
	var me = this ;
	var wiki = me.lang + wikiDataCache.pv_proj2stats[me.project] ;
	var title = ucFirst ( $.trim ( me.title ) ) .replace ( / /g , '_' ) ;

	$.get ( '/glamtools/viewstats_api.php' , {
		action:'request',
		date:o.date,
		pages:JSON.stringify([ wiki+':'+title ])
	} , function ( d ) {
		if ( d.status != 'OK' ) {
			console.log ( d ) ;
			return ;
		}
		if ( d.views.length == 0 ) {
			setTimeout ( function () { me.getViewStats ( o ) } , 1000+Math.floor(Math.random()*5001) ) ;
			return ;
		}
		
		var nd = { monthly_views:0 , daily_views:{} , month:o.date , project:wiki , title:me.title } ;
		$.each ( d.views , function ( date , pages ) {
			$.each ( pages , function ( page , daily ) { // Only one page
				$.each ( daily , function ( day , v ) {
					nd.monthly_views += v ;
					if ( day < 9 ) day = '0' + day ;
					nd.daily_views[o.date.substr(0,4)+'-'+o.date.substr(4,2)+'-'+day] = v ;
				} ) ;
			} ) ;
		} ) ;
		
		o.callback ( { data : nd , options : o } ) ;
		
	} , 'json' ) ;
}
*/


var view_stats_cache = [] ;
var view_stats_running = 0 ;
var view_stats_running_max = 400 ;

function daysInMonth(month,year) { return new Date(year, month, 0).getDate();}

function getViewStatsCallback () {
//	console.log ( "Trying to run, " + view_stats_running + " left in queue" ) ;
	if ( view_stats_running >= view_stats_running_max ) return ;
	if ( view_stats_cache.length == 0 ) return ;
	view_stats_running++ ;
	
	var m = view_stats_cache.shift() ;
	var me = m.page ;
	var o = m.o ;

//	https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Richard_Dawkins/daily/20150901/20150930


	var year = o.date.substr(0,4) ;
	var month = o.date.substr(4,2) ;
	var use_wmf_api = false ;
	if ( year*1>2015 || (year*1==2015 && month*1>=9 ) ) use_wmf_api = true ;
	
	var url = '' ;
	var get_url = '' ;
	var options = {} ;
	var sg_project = me.lang + wikiDataCache.pv_proj2stats[me.project] ;
	if ( use_wmf_api ) {
		var new_api_project = me.lang + '.' + me.project ;
		// wikidata does not follow this pattern
		if ( me.project === 'wikidata' ) {
			new_api_project = me.project ;
		}
		var days = ''+daysInMonth(month,year) ;
		url = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/' ;
		url += new_api_project ;
		url += '/all-access/user/' ;
		url += encodeURIComponent ( me.title.replace(/ /g,'_') ) ;
		url += '/daily/' + year+month+'01/' + year+month+days ;
		get_url = url ;
	} else {
		get_url = '../proxy.php' ;
		url = 'http://' + wikiSettings.stats_grok + '/json/' ; // jsonp
		url += sg_project + '/' + o.date + '/' ;
		url += encodeURI ( me.title ) .replace ( /\?/g , '%3F' ) ;
		options = { url:url } ;
	}

//	console.log ( '!' , use_wmf_api , year*1 , month*1 , url ) ;

	var k = me.lang + wikiDataCache.pv_proj2stats[me.project] + '|' + me.title + '|' + o.date ;
//	console.log ( "Starting : " + url ) ;
	
	$.get ( get_url , options , function ( d ) {
//			console.log ( "Success!" ) ;
			view_stats_running-- ;
			d.monthly_views = 0 ;
			
			if ( use_wmf_api ) {
				var dummy = { daily_views : {} , monthly_views:0 , project:sg_project , month:year+month , rank:-1 , title:me.title } ;
				$.each ( d.items , function ( k , v ) {
					dummy.monthly_views += v.views*1 ;
					var the_date = v.timestamp.substr(0,4)+'-'+v.timestamp.substr(4,2)+'-'+v.timestamp.substr(6,2) ;
					dummy.daily_views[the_date] = v.views*1 ;
				} ) ;
				d = dummy ;
			} else {
				$.each ( d.daily_views , function ( k , v ) { d.monthly_views += v } ) ;
			}
			d.project = me.project ;
			d.lang = me.lang ;
			o.callback ( { data : d , options : o } ) ;
			getViewStatsCallback() ;
	} , 'json' ) . fail ( function (xOptions, textStatus) {
			view_stats_running-- ;
//			console.log ( "ERROR : " + textStatus ) ;
			var d = { daily_views : {} , monthly_views:0 , project:sg_project , month:year+month , rank:-1 , title:me.title } ;
			for ( var i = 1 ; i < 31 ; i++ ) {
				var the_date = year + '-' + month + '-' + (i<10?'0':'') + i ;
				d.daily_views[the_date] = 0 ;
			}
			d.project = me.project ;
			d.lang = me.lang ;
			o.callback ( { data : d , options : o } ) ;
			getViewStatsCallback() ;
	} ) ;
}


WikiPage.prototype.getViewStats = function  ( o ) {
	var me = this ;
	view_stats_cache.push ( { page:me , o:o } ) ;
	getViewStatsCallback () ;
}

/*
WikiPage.prototype.getViewStats = function  ( o ) {
	var me = this ;
	var url = 'http://' + wikiSettings.stats_grok + '/jsonp/' ;
	url += me.lang + wikiDataCache.pv_proj2stats[me.project] + '/' + o.date + '/' ;
	url += encodeURI ( me.title ) .replace ( /\?/g , '%3F' ) ;

	var k = me.lang + wikiDataCache.pv_proj2stats[me.project] + '|' + me.title + '|' + o.date ;

	if ( wikiDataCache.concurrent >= wikiDataCache.max_concurrent ) {
		setTimeout ( function(){me.getViewStats ( o ) ;} , Math.floor(Math.random()*1001) ) ; // random within-1-seconds restart
		return ;
	}

	wikiDataCache.concurrent++ ;
	$.jsonp ( {
		url : url ,
		callback : 'pageviewsCallback' ,
		timeout : 10000 ,
		success : function ( d , textStatus ) {
			wikiDataCache.concurrent-- ;
			var self = this ;
			d.monthly_views = 0 
			$.each ( d.daily_views , function ( k , v ) { d.monthly_views += v } ) ;
			o.callback ( { data : d , options : o } ) ;
		} ,
		error : function (xOptions, textStatus) {
			wikiDataCache.concurrent-- ;
			console.log ( "ERROR : " + textStatus ) ;
			setTimeout ( function () { me.getViewStats ( o ) } , 500 ) ;
		}
	} ) ;

}
*/

WikiPage.prototype.getText = function ( callback ) {
	var me = this ;
	var params = {
		action : 'query' ,
		prop : 'revisions' ,
		titles : me.getFullTitle() ,
		rvprop : 'content' ,
		format : 'json'
	} ;
	
	$.getJSON ( me.getApiRoot() + "?callback=?" , params , function ( data ) {
		$.each ( data.query.pages , function ( k , v ) {
			me.text = v.revisions[0]['*'] ;
			callback ( me ) ;
		} ) ;
	} ) ;	
}


WikiPage.prototype.getGenericData = function  ( instance , data ) {
	var me = this ;

	if ( undefined === data ) {
		if ( !me.isValid() ) return ;
		if ( me.ensureNamespaceName ( function () { me.getGenericData ( instance ) } ) ) return ;
		if ( undefined === instance.property ) me[instance.queryprop] = [] ;
		else me[instance.property] = [] ;
	}
	
	var params = instance.params ;
	params.format = 'json' ;
	params.rawcontinue = 1 ;

	if ( undefined !== data ) {
		if ( undefined !== data.query[instance.queryprop||'pages'] ) {
			$.each ( data.query[instance.queryprop||'pages'] , function ( k1 , v1 ) {
				if ( undefined !== v1.missing ) {
					me.missing = true ;
					instance.callback ( me ) ;
					return ;
				}
				
				if ( undefined === instance.property ) {
					me[instance.queryprop].push ( undefined === instance.keep ? v1 : instance.keep ( v1 ) ) ;
				} else {
					if ( undefined !== v1[instance.property] ) {
						$.each ( v1[instance.property] , function ( k2 , v2 ) {
							me[instance.property].push ( undefined === instance.keep ? v2 : instance.keep ( v2 ) ) ;
						} ) ;
					}
				}
			} ) ;
		}
		
		if ( undefined === data['query-continue'] || instance.norepeat ) {
			instance.callback ( me ) ;
			return ;
		}
		
		params[instance.k_continue] = data['query-continue'][instance.property||instance.queryprop][instance.k_continue] ;
	}
	
	$.getJSON ( me.getApiRoot() + "?callback=?" , params , function ( data ) {
		me.getGenericData ( instance , data ) ;
	} ) ;

}



WikiPage.prototype.getImages = function ( callback ) {
	var me = this ;
	me.getGenericData ( {
		callback : callback ,
		property : 'images' ,
		k_continue : 'imcontinue' ,
		keep : function ( x ) { return x.title } ,
		params : {
			action : 'query' ,
			prop : 'images' ,
			titles : me.getFullTitle() ,
			imlimit : 500 ,
			redirects : 1
		} 
	} ) ;
}

WikiPage.prototype.getFilesUploadedByUser = function ( callback ) {
	var me = this ;
	me.getGenericData ( {
		callback : callback ,
		queryprop : 'logevents' ,
		k_continue : 'lecontinue' ,
		keep : function ( x ) { return x.title } ,
		params : {
			action : 'query' ,
			list : 'logevents' ,
			letype : 'upload' ,
			leuser : me.getNiceTitle() ,
			lelimit : 500 ,
			redirects : 1
		} 
	} ) ;
}

WikiPage.prototype.getImageUsage = function ( callback , o ) {
	var me = this ;
	var d = {
		callback : callback ,
		queryprop : 'imageusage' ,
		k_continue : 'iucontinue' ,
		params : {
			action : 'query' ,
			list : 'imageusage' ,
			iutitle : me.getFullTitle() ,
			iulimit : 500
		} 
	} ;
	if ( undefined !== o ) {
		if ( undefined !== o.norepeat ) d.norepeat = o.norepeat ;
		if ( undefined !== o.ns ) d.params.iunamespace = o.ns ;
		if ( undefined !== o.iulimit ) d.params.iulimit = o.iulimit ;
	}
	me.getGenericData ( d ) ;
}

WikiPage.prototype.getExtLinkUsage = function ( p ) {
	var me = this ;
	me.getGenericData ( {
		callback : p.callback ,
		queryprop : 'exturlusage' ,
		k_continue : 'euoffset' ,
		keep : function ( x ) { return x } ,
		params : {
			action : 'query' ,
			list : 'exturlusage' ,
			eunamespace : p.ns ,
			euquery : p.query ,
			eulimit : 500
		} 
	} ) ;
}


WikiPage.prototype.getTemplates = function ( callback ) {
	var me = this ;
	me.getGenericData ( {
		callback : callback ,
		property : 'templates' ,
		k_continue : 'tlcontinue' ,
		keep : function ( x ) { return x.title.replace(/^[^:]+:/,'') } ,
		params : {
			action : 'query' ,
			prop : 'templates' ,
			titles : me.getFullTitle() ,
			tllimit : 500
		} 
	} ) ;
}

// UNTESTED
WikiPage.prototype.getLinks = function ( callback ) {
	var me = this ;
	var instance = {
		callback : callback ,
		property : 'links' ,
		k_continue : 'plcontinue' ,
		params : {
			action : 'query' ,
			prop : 'links' ,
			titles : me.getFullTitle() ,
			pllimit : 500 ,
			redirects : 1
		} 
	} ;
	me.getGenericData ( instance ) ;
}

WikiPage.prototype.getBacklinks = function ( callback , o ) {
	var me = this ;
	var d = {
		callback : callback ,
		queryprop : 'backlinks' ,
		k_continue : 'blcontinue' ,
		params : {
			action : 'query' ,
			list : 'backlinks' ,
			bltitle : me.getFullTitle() ,
			bllimit : 500
		} 
	} ;
	if ( undefined !== o ) {
		if ( undefined !== o.blnamespace ) d.blnamespace = o.blnamespace ;
	}
	me.getGenericData ( d ) ;
}

WikiPage.prototype.getCategories = function ( callback ) {
	var me = this ;
	me.getGenericData ( {
		callback : callback ,
		property : 'categories' ,
		k_continue : 'clcontinue' ,
		keep : function ( x ) { return { title:x.title.replace(/^[^:]+:/,'') , timestamp:x.timestamp , hidden:x.hidden } } ,
		params : {
			action : 'query' ,
			prop : 'categories' ,
			titles : me.getFullTitle() ,
			clprop : 'sortkey|timestamp|hidden' ,
			cllimit : 500
		} 
	} ) ;
}

WikiPage.prototype.getRandomPages = function ( o ) {
	var me = this ;
	if ( undefined === o.is_first ) {
		o.is_first = true ;
		o.pages = [] ;
	}
//	console.log ( "RANDOM / " + o.limit + " / " + o.pages.length ) ;
	if ( undefined === o.limit ) o.limit = 10 ; // Default
	var params = {
		action : 'query' ,
		list : 'random' ,
		rnnamespace : o.namespace || 0 ,
		rnlimit : o.limit ,
		format : 'json'
	} ;
	
	$.getJSON ( me.getApiRoot() + "?callback=?" , params , function ( data ) {
		$.each ( data.query.random , function ( k , v ) {
			var p = { pageid : v.id , ns:v.ns , title:v.title , project:me.project , lang:me.lang } ;
			o.pages.push ( new WikiPage ( p ) ) ;
			if ( o.pages.length == o.limit ) return false ;
		} ) ;
		if ( o.pages.length < o.limit ) {
			me.getRandomPages ( o ) ;
		} else {
			o.callback ( o.pages ) ;
		}
	} ) ;	
}
