var gw ;

function initializeFromParameters () {
	var params = getUrlVars() ;
	if ( undefined !== params.q ) {
		gw.load ( params.q ) ;
	}
}

$(document).ready ( function () {
	loadMenuBarAndContent ( { toolname : 'GeneaWiki2' , meta : 'GeneaWiki2' , content : 'form.html' , run : function () {
		document.title = "GeneaWiki" ;
		gw = new GeneaWiki ( 'results' ) ;
		gw.status_id = 'status' ;
		$('#results svg').css ( { width : '100%' } ) ;
		initializeFromParameters() ;
	} } ) ;
} ) ;
