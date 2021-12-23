'use strict';

// ENFORCE HTTPS
//if (location.protocol != 'https:') location.href = 'https:' + window.location.href.substring(window.location.protocol.length);

let vue_components = {
	toolname : window.location.pathname.replace(/(\/|\.php|\.html{0,1})+$/,'').replace(/^.*\//,'') , // Guessing tool name, override if necessary!
	components : {} ,
	template_container_base_id : 'vue_component_templates' ,
	components_base_url : 'https://tools-static.wmflabs.org/magnustools/resources/vue/' ,
	loadComponents : function ( components ) {
		return Promise.all ( components.map ( component => this.fetchComponent ( component ) ) )
			.then (fetched => fetched.map( (html, i) => this.injectComponent ( components[i], html ) ) );
	} ,
	getComponentID ( component ) {
		if ( typeof this.components[component] != 'undefined' ) return this.components[component] ;
		this.components[component] = this.template_container_base_id + '-' + Object.keys(this.components).length ;
		return this.components[component] ;
	} ,
	getComponentURL ( component ) {
		return  /^(http:|https:|\/|\.)/.test(component) || /\.html$/.test(component) ? component : this.components_base_url+component+'.html' ;
	} ,
	loadComponent ( component ) {
		return this.fetchComponent( component ).then(html => this.injectComponent( component, html ));
	} ,
	fetchComponent ( component ) {
		let id = this.getComponentID ( component ) ;
		if ( $('#'+id).length > 0 ) return Promise.resolve() ; // Already loaded/loading
		let component_url = this.getComponentURL(component) ;
		return fetch ( component_url )
			.then ( response => response.text() )
	} ,
	injectComponent ( component, html ) {
		if ( !html ) return;
		let id = this.getComponentID ( component ) ;
		$('body').append($('<div>').attr({id: id}).css({display: 'none'}).html(html));
	}
}
