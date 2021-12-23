'use strict';

let router ;
let app ;
let wd = new WikiData() ;

let config = {} ;
let prop_map = {} ;
let site_info = {} ;

$(document).ready ( function () {
    vue_components.toolname = 'reasonator_v2' ;
//    vue_components.components_base_url = 'https://tools.wmflabs.org/magnustools/resources/vue/' ; // For testing; turn off to use tools-static
    Promise.all ( [
            vue_components.loadComponents ( ['widar','wd-date','wd-link','tool-translate','tool-navbar','commons-thumbnail',
                'main-page.html',
                'classifier.html',
                'property-list.html',
                'coordinates.html',
                'claim.html',
                'snak.html',
                'hierarchy.html',
                'wd-hovercard.html',
                'reasonator-link.html',
                'sidebar.html'
                ] ) ,
            new Promise(function(resolve, reject) {
                $.get ( './config.json' , function (d) {
                    config = d ;
                    $.getJSON(d.wikibase_api+'?callback=?',{
                        action:'query',
                        meta:'siteinfo',
                        siprop:'general|namespaces|namespacealiases|libraries|extensions|statistics',
                        format:'json'
                    } ,function(d){
                        site_info = d.query;
                        resolve() ;
                    })
                } , 'json' ) ;
            } )
    ] ) .then ( () => {
        prop_map = config.prop_map ;
        wd_link_base = config.wikibase_page_url ;
        wd_link_wd = wd ;
        wd.api = config.wikibase_api + '?callback=?' ;

        // Get namespace prefixes from site_info
        wd_ns_prefixes = {} ;
        $.each ( site_info.namespaces , function ( ns_num , v) {
            if ( v.defaultcontentmodel == "wikibase-item" ) wd_ns_prefixes.Q = v['*']==''?'':v['*']+':' ;
            if ( v.defaultcontentmodel == "wikibase-property" ) wd_ns_prefixes.P = v['*']==''?'':v['*']+':' ;
            if ( v.defaultcontentmodel == "wikibase-lexeme" ) wd_ns_prefixes.L = v['*']==''?'':v['*']+':' ;
            // No mediainfo on Commons yet...
        } ) ;

        if ( typeof config.sparql_server_url != 'undefined' ) wd.sparql_url = config.sparql_server_url ;

        const routes = [
          { path: '/', component: MainPage , props:true },
              { path: '/:q', component: MainPage , props:true },
        ] ;
        router = new VueRouter({routes}) ;
        app = new Vue ( { router } ) .$mount('#app') ;
    } ) ;
} ) ;
