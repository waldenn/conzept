var wsm_comm = {
	is_app : false,
	api_v3 : 'https://wikishootme.toolforge.org/api_v3.php' ,
	api_autodesc : 'https://tools.wmflabs.org/autodesc' ,
	api_wikidata : 'https://www.wikidata.org/w/api.php' ,
	url_flinfo : 'https://tools.wmflabs.org/flickr2commons/flinfo_proxy.php' ,
	url_flickr_key : 'https://wikishootme.toolforge.org/flickr.key' ,
	
	userinfo : {} ,
	is_logged_in : false ,
	oauth_uploader_login : false ,

	
	getWSM : function ( params , callback ) {
		var me = this ;
		$.getJSON ( me.api_v3+'?callback=?' , params , callback ) ;
		$.get ( me.api_v3 , params , callback , 'json' ) ;
	} ,

	getFlinfo : function ( params , callback ) {
		var me = this ;
		$.get ( me.url_flinfo , params , function ( d ) {
			callback ( d ) ;
		} ) ;
	} ,
	
	getFlickrKey : function ( callback ) {
		var me = this ;
		$.get ( me.url_flickr_key , function ( d ) {
			callback ( d ) ;
		} , 'json' ) ;
	} ,
	
	getAutodesc : function ( params , callback ) {
		var me = this ;
		$.getJSON ( me.api_autodesc+'?callback=?' , params , function ( d ) {
			callback ( d ) ;
		} ) . fail ( function (d) {
			console.log ( 'autodesc failed' , d ) ;
			callback ( {} ) ;
		} ) ;
	} ,

	searchWikidata : function ( params , callback ) {
		var me = this ;
		$.getJSON ( me.api_wikidata+'?callback=?' , params , function ( d ) {
			callback ( d ) ;
		} ) ;
	} ,
	
	checkUserStatus : function ( callback ) {
		var me = this ;
		
		if ( me.is_app ) {
			// TODO
			me.is_logged_in = false ;
			callback() ;
		} else {
			me.getWSM ( {
				action:'check'
			} , function ( d ) {
				if ( typeof d.result.error != 'undefined' ) {
					me.is_logged_in = false ;
				} else {
					me.is_logged_in = true ;
					me.userinfo = d.result.query.userinfo ;
				}
				callback() ;
			} ) ;
		}
	} ,
	
	storeKey : function ( key , value ) {
		var storage = window.localStorage;
		storage.setItem ( key , value ) ;
	} ,
	
	removeKey : function ( key ) {
		var storage = window.localStorage;
		storage.removeItem ( key ) ;
	} ,

	getValue : function ( key ) {
		var storage = window.localStorage;
		return storage.getItem(key);
	} ,
	
	hasKey : function ( key ) {
		var storage = window.localStorage;
		var value = this.getValue ( key ) ;
		return typeof value != 'undefined' ;
	} ,
	
	storeCurrentView : function ( arr ) {
		var me = this ;
		var s = JSON.stringify ( arr ) ;
		me.storeKey ( 'last_view_params' , s ) ;
	} ,
	
	isLoggedIn : function ( callback ) {
		var me = this ;
		if ( typeof callback == 'undefined' ) return me.is_logged_in ; // Just checking
		if ( !me.is_app ) return me.is_logged_in ; // Web browsed: We've already checked
		if ( me.is_logged_in ) return true ; // Yes we are!
		
		if ( typeof callback != 'undefined' ) {
			// open dialog and ask for/check login
			$('#app_login_dialog').modal ( {
			} ) ;
			$('#user_login').submit ( function (evt) {
				evt.preventDefault();
				var name = $('#user_name').val() ;
				var pass = $('#user_pass').val() ;

				// TODO verify
				me.userinfo = { // TODO
					name:name,
					groups:[],
					id:0,
					rights:[]
				} ;
				me.is_logged_in = true ;
				alert ( name + " pseudo-logged in!" ) ;
				callback ( me.is_logged_in ) ;

				$('#app_login_dialog').modal('hide') ;
				return false ;
			} ) ;
		}
		
		return false ;
	} ,
	
	appLogin : function () {
		this.isLoggedIn ( function ( is_logged_in ) {
			if ( is_logged_in ) wikishootme.updateLayers() ;
		} ) ;
		return false ;
	} ,
	
	
	fin : true
}
