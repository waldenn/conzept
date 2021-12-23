function WiDaR ( callback , api = '/widar/index.php' ) {
	
	this.is_logged_in = false ;
	this.api = api ;
	this.userinfo = {} ;
	this.tool_hashtag = '' ;
	
	this.isLoggedIn = function () {
		return this.is_logged_in ;
	}
	
	this.getInfo = function () {
		var me = this ;
		$.get ( me.api , {
			action:'get_rights',
			botmode:1
		} , function ( d ) {
			me.is_logged_in = false ;
			me.userinfo = {} ;
			if ( typeof (((d||{}).result||{}).query||{}).userinfo == 'undefined' ) {
				callback() ;
				return ;
			}
			me.userinfo = d.result.query.userinfo ;
			if ( typeof me.userinfo.name != 'undefined' ) me.is_logged_in = true ;
			callback() ;
		} , 'json' ) ;
	}
	
	this.getLoginLink = function ( text ) {
		var h = "<a target='_blank' href='" + this.api + "?action=authorize'>" + text + "</a>" ;
		return h ;
	}
	
	this.getUserName = function () {
		if ( !this.isLoggedIn() ) return ;
		return this.userinfo.name ;
	}
	
	this.genericAction = function ( o , callback ) {
		var me = this ;
		$.get ( me.api , {
			action:'generic',
			json:JSON.stringify(o) ,
			tool_hashtag:me.tool_hashtag ,
			botmode:1
		} , function ( d ) {
			if ( typeof callback != 'undefined' ) callback ( d ) ;
		} , 'json' ) . fail ( function () {
			if ( typeof callback != 'undefined' ) callback () ;
		} ) ;
	}
	
	this.escapeAttribute = function ( s ) {
		return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/\//g,'&#x2F;') ;
	}
	
	this.getUserLink = function ( text ) {
		var me = this ;
		if ( me.is_logged_in ) {
			var h = "<a target='_blank' href='//www.wikidata.org/wiki/User:" + me.escapeAttribute ( encodeURIComponent ( me.getUserName() ) ) + "'>" + me.getUserName() + "</a>" ;
			return h ;
		} else {
			return me.getLoginLink ( text ) ;
		}
	}
	
	
	this.getInfo() ;
}
