var tt = {} ;

if ( detectMobile() === true ){
  setupSwipe( 'wikidata-app' );
}

const explore = {};

explore.db = ImmortalDB.ImmortalDB;

let current_pane = getCurrentPane();

/**
 * @namespace 
 * @author Magnus Manske
 */
var reasonator = {
	i18n : {} ,
	collapse_item_list : 20 ,
	P_all : {
		entity_type : 107 ,
		audio : 51 ,
		instance_of : 31 ,
		voice_recording : 990 ,
		commons_cat : 373 ,
		commons_gallery : 935 ,
		video : 10 ,
		maic : 301 , // Main article in category
		flag_image : 41 ,
		logo : 154 ,
		wikivoyage_banner : 948 ,
		pronunciation_audio : 443 ,
		coa : 94 ,
		seal : 158 ,
		chemical_structure : 117 ,
		astronomic_symbol : 367 ,
		distribution_map : 1846 ,
		commemorative_plaque : 1801 ,
		place_name_sign : 1766 ,
		grave : 1442 ,
		image : 18 ,
		sandbox_image : 368
	} ,
	P_websites : {
		official_website : 856
	} ,
	P_person : {
		father : 22 ,
		mother : 25 ,
		child : 40 ,
		brother : 7 ,
		sister : 9 ,
		spouse : 26 ,
		uncle : 29 ,
		aunt : 139 ,
		relative : 1038 ,
		stepfather : 43 ,
		stepmother : 44 ,
		grandparent : 45 ,
		nationality : 27 ,
		sex : 21 ,
		occupation : 106 ,
		signature : 109 ,
	} ,
	P_taxon : {
		taxon_name : 225 ,
		taxon_rank : 105 ,
		taxon_author : 405 ,
		taxon_type : 427 ,
		IUCN : 141 ,
		range_map : 181 ,
		endemic_to : 183 ,
		parent_taxon : 171 ,
		basionym : 566 ,
		domain : 273 ,
		kingdom : 75 ,
		phylum : 76 ,
		class_ : 77 ,
		order : 70 ,
		family : 71 ,
		genus : 74 ,
		species : 89
	} ,
	P_location : {
		dialing_code : 473 ,
		country_code : 474 ,
		postal_code : 281 ,
		iso_3361_1_a2 : 297 ,
		iso_3361_1_a3 : 298 ,
		iso_3361_1_num : 299 ,
		iso_3361_2 : 300 ,
		nuts : 605 ,
		gss_2011 : 836 ,
		fips_10_4 : 901 ,
		ioc : 984 ,
		gnd_id : 227
	} ,
	P_url : {} ,
	E : {
		215627 : 'person'
	} ,
	P_researcher : [ 1960,496,1053,1153 ] , 
	Q : {
		human : 5 ,
		male : 6581097 ,
		female : 6581072 ,
		person : 215627 ,
		geographical_feature : 618123 ,
		category_page : 4167836 ,
		template_page : 11266439 ,
		list_page : 13406463 ,
		disambiguation_page : 4167410
	} ,
	extURLs : {} ,
	urlid2prop : {} ,
	taxon_list : [ 171 , 273 , 75 , 76 , 77 , 70 , 71 , 74 , 89 ] ,
	location_props : [30,17,131,376,501] ,
	ofen_used_items_with_media : ['Q5','Q2','Q36180'] ,
	sm_url : {
		'918' : '//twitter.com/$1' , // Twitter
		'866' : '//www.youtube.com/user/$1' , // YouTube
		'213660' : '//www.linkedin.com/profile/view?id=$1' , // LinkedIn
		'103204' : '//www.flickr.com/photos/$1' , // Flickr
		'2013' : '//www.wikidata.org/wiki/User:$1' , // Wikidata
		'754454' : '//www.researchgate.net/profile/$1' , // ResearchGate
		'364' : '//github.com/$1' , // GitHub
		'209330' : '//instagram.com/$1' , // Instagram
		'355' : '//facebook.com/$1' , // Facebook
		'219523' : '//$1.livejournal.com' , // LiveJournal
		'116933' : '//vk.com/$1' , // VK
	} ,
	
	// http://208.80.153.172/api?q=claim[279:56061]
	location_list : [ 515,6256,1763527,
		7688,15284,19576,24279,27002,28575,34876,41156,41386,50201,50202,50218,50231,50464,50513,55292,74063,86622,112865,137413,149621,156772,182547,192287,192498,203323,213918,243669,244339,244836,270496,319796,361733,379817,380230,387917,398141,399445,448801,475050,514860,533309,542797,558330,558941,562061,610237,629870,646728,650605,672490,685320,691899,693039,697379,717478,750277,765865,770948,772123,831889,837766,838185,841753,843752,852231,852446,855451,867371,867606,874821,877127,878116,884030,910919,911736,914262,924986,936955,1025116,1044181,1048835,1051411,1057589,1077333,1087635,1143175,1149621,1151887,1160920,1196054,1229776,1293536,1342205,1344042,1350310,1365122,1434505,1499928,1548518,1548525,1550119,1569620,1631888,1647142,1649296,1670189,1690124,1724017,1753792,1764608,1771656,1779026,1798622,1814009,1850442,2072997,2097994,2115448,2271985,2280192,2311958,2327515,2365748,2487479,2490986,2513989,2513995,2520520,2520541,2533461,2695008,2726038,2824644,2824645,2824654,2836357,2878104,2904292,2916486,3042547,3076562,3098609,3183364,3247681,3253485,3356092,3360771,3395432,3435941,3455524,3491994,3502438,3502496,3507889,3645512,3750285,3917124,3976641,3976655,4057633,4115671,4161597,4286337,4494320,4683538,4683555,4683558,4683562,4976993,5154611,5195043,5284423,5639312,6501447,6594710,6697142,7631029,7631060,7631066,7631075,7631083,7631093,9301005,9305769,10296503,13220202,13220204,13221722,13558886,14757767,14921966,14921981,14925259,15042137,15044083,15044339,15044747,15045746,15046491,15052056,15055297,15055414,15055419,15055423,15055433,15058775,15063032,15063053,15063057,15063111,15063123,15063160,15063167,15063262,15072309,15072596,15092269,15097620,15125829,15126920,15126956,15133451 ] ,
	
	/** Use in-page reload of dates - quicker, but does not update the URL.
	 * @type {boolean}
	 */
	internalCalendarBrowsing : false ,
	
	/** Show images in the search results.
	 * @type {boolean}
	 */
	showSearchImages : false ,
	
	/** Use in-page reload of pages - quicker, but updates the URL in an ugly fashion. Not bug-free.
	 * @type {boolean}
	 */
	use_js_refresh : false ,

	/** WiDaR API URL.
	 * @type {string}
	 */
	widar_url : '/widar/index.php?' ,

	/** Width of top banner from WikiVoyage, in pixel.
	 * @type {number}
	 */
	banner_width : 850 ,

	/** Maximum number of thumbnails in the "related media" section.
	 * @type {number}
	 */
	max_related_media : 50 ,

	/** Whether to show a link to the concept cloud tool in the sidebar.
	 * @type {boolean}
	 */
	showConceptCloudLink : true ,

	/** Whether or not to show a QR code in the sidebar.
	 * @type {boolean}
	 */
	showQRLink : true ,

	/** Whether to offer, in a hoverbox, the setting a missing item label via OAuth (WiDaR). Waiting for Wikidata API bugfix.
	 * @type {boolean}
	 */
	allowLabelOauthEdit : true ,

	/** Whether to show infoboxes when hovering over an item link.
	 * @type {boolean}
	 */
	use_hoverbox : true ,

	/** Whether to show infoboxes when hovering over a wiki(m|p)edia link.
	 * @type {boolean}
	 */
	use_wiki_hoverbox : true ,

	/** Whether to mark labels missing in the current language (red dotted underline).
	 * @type {boolean}
	 */
	mark_missing_labels : true ,

	/** Whether to allow right-to-left layout.
	 * @type {boolean}
	 */
	allow_rtl : true ,

	/** Whether to use autodesc for automatic item descriptions.
	 * @type {boolean}
	 */
	use_autodesc : true ,

	/** Whether to use long automatic descriptions, where available.
	 * @type {boolean}
	 */
	use_long_autodesc : true ,
	
	/** Whether to use Flickr search to find free images.
	 * @type {boolean}
	 */
	use_flickr : false ,
	
	showSearchMapLink : true ,

	use_property_suggest : false , // For now

	max_list_items : 500 ,

	square_thumb_size : 130 ,
	thumbsize : 160 ,

	map_icon_url : 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Eckert4.jpg/32px-Eckert4.jpg' , // https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Earth_clip_art.svg/16px-Earth_clip_art.svg.png

	autodesc_items : [] ,
	imgcnt : 0 ,
	table_block_counter : 0 ,

	
	
	/**
	 * Get interface text in the current language. Fallback to English.
	 * @param {string} k - The key for the translated string.
	 * @returns {string} Interface text in current language.
	 */
	t : function ( k ) {
		return tt.t ( k ) ;
	} ,

	/**
	 * Reset all data. Used in init and for in-page reloading. Incomplete.
	 */
	clear : function () {
		var self = this ;
		var tmp = {} ;
		self.timeline_candidates = {} ;
		$.each ( self.wd.items , function ( q , v ) {
			if ( /^P/.test(q) ) tmp[q] = v ;
		} ) ;
		self.P = $.extend(true, {}, self.P_all);
		self.wd.clear() ;
		self.wd.items = tmp ;
		self.main_type = '' ;
		self.autodesc_items = [] ;
		self.personal_relation_list = [] ;
		self.to_load = [] ;
		$.each ( ['father','mother','child','brother','sister','spouse','uncle','aunt','stepfather','stepmother','grandparent','relative'] , function ( k , v ) {
			self.personal_relation_list.push ( self.P_person[v] ) ;
		} ) ;
	} ,

	/**
	 * Get URL parameters. Prefers hash "#" parameters over GET "?" ones, for using in-page loading.
	 * @returns {hash} URL parameters.
	 */
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

	/**
	 * Initializes the object, loads the root object and interface texts, then runs callback.
	 * @param {function} callback - Callback function.
	 */
	init : function ( callback ) {
		var self = this ;
		self.q = undefined ;
		self.wd = new WikiData ;
		self.wd.max_get_entities = 50 ;
		self.do_maps = undefined ;
		self.clear() ;
		if ( '0' == $.cookie('use_flickr') ) self.use_flickr = false ;
		
		self.params = self.getUrlVars() ;
		
		if ( self.use_js_refresh ) { 		// History change, update page accordingly
			$(window).hashchange( function(){ // http://benalman.com/projects/jquery-hashchange-plugin/
				self.params = self.getUrlVars() ;
				if ( self.params.q !== undefined ) {
					var new_q = 'Q'+self.params.q.replace(/\D/g,'') ;
					if ( new_q != self.q ) {
						self.q = new_q ;
						self.reShow() ;
					}
				}
				return false ;
			} ) ;
		}
		
		self.preferred_languages = ($.cookie('preferred_languages')||'') ;

		var loadcnt = 2 ;
		if ( self.use_flickr ) loadcnt++ ;
		if ( self.params.q !== undefined ) {
			self.q = 'Q'+self.params.q.replace(/\D/g,'') ;
			loadcnt += 3 ;
			self.wd.getItemBatch ( [self.q] , function ( d1 ) {
				self.loadExternalIDs ( function () {
					loadcnt-- ; if ( loadcnt == 0 ) callback() ;
				} ) ;
		
				self.addToLoadLater ( self.q ) ;
//				self.wd.restrict_to_langs = true ;
				loadcnt-- ; if ( loadcnt == 0 ) callback() ;
			} ) ;
			self.getRelatedEntities ( self.q , function () {
				loadcnt-- ; if ( loadcnt == 0 ) callback() ;
			} ) ;
		}
		

		
		
		self.loadInterfaceText ( function () { // Get interface translations
			loadcnt-- ; if ( loadcnt == 0 ) callback() ;
		} ) ;
		$.getJSON ( '//www.wikidata.org/w/api.php?callback=?' , { // Get site info (languages)
			action:'query',
			meta:'siteinfo',
			siprop:'languages',
			format:'json'
		} , function ( d ) {
			self.all_languages = {} ;
			$.each ( d.query.languages , function ( k , v ) { self.all_languages[v.code] = v['*'] } ) ;
			loadcnt-- ; if ( loadcnt == 0 ) callback() ;
		} ) ;
		
		if ( self.use_flickr ) {
			$.get ( '/reasonator/flickr.key' , function ( d ) {
				self.flickr_key = $.trim ( d ) ;
				loadcnt-- ; if ( loadcnt == 0 ) callback() ;
			} ) ;
		}
		
	} ,
	
	escapeHTML : function ( s ) {
		return $('<div/>').text(s).html();
	} ,
	
	loadExternalIDs : function ( callback ) {
		var self = this ;
		var skip_props = [] ; // Commons images etc.
		$.each ( self.P_all , function ( k , v ) { skip_props.push(v) } ) ;
		var i = self.wd.items[self.q] ;

    //console.log( i );

    if ( typeof i === undefined || typeof i === 'undefined' ){
      return 0;
    }

		var tmp = [] ;
		$.each ( i.raw.claims , function ( p , dummy ) {
			tmp.push ( p ) ;
		} ) ;
		self.wd.getItemBatch ( tmp , function () {
			$.each ( tmp , function ( dummy , p ) {
				var i2 = self.wd.items[p] ;
				if ( typeof i2 == 'undefined' ) return ;
				if ( typeof i2.raw.claims == 'undefined' ) return ;
				if ( -1 != $.inArray ( p.replace(/\D/g,'')*1 , skip_props ) ) return ; // Hard-blocked
				var urls = i2.getMultimediaFilesForProperty ( 'P1630' ) ;
				var prop ;
				var urlp ;

				var id = i2.getLabel() ; // Label, needs to be "prettier" through regexp for small columns
				id = id.replace( / (identifier|id|number)+$/i , '' ) ;
				id = id.replace( / (online|index)+$/i , '' ) ;
				id = id.replace ( / \(.+\)/ , '' ) ;
			
				prop = p.replace(/\D/g,'') * 1 ;
				
				if ( urls.length > 0 ) {
					urlp = urls[0] ;
				} else if ( i2.hasClaimItemLink ( 31 , 18614948 ) ) {
					urlp = '' ;
				} else return ;

				self.extURLs[id] = urlp ;
				self.urlid2prop[id] = prop ;
				self.P_url[prop] = id ;
				self.P_person[id] = prop ;
				self.P_location[id] = prop ;
				
			} ) ;
			callback() ;
		} ) ;
	} ,

	addToLoadLater : function ( the_q , qualifiers_only ) {
		var self = this ;
		if ( undefined === qualifiers_only ) qualifiers_only = false ;
		var i = self.wd.items[the_q] ;
		if ( typeof i == 'undefined' ) return ;
		$.each ( i.getPropertyList() , function ( k1 , p ) {
			var proper_p = 'P'+(p+'').replace(/\D/g,'') ;
			self.to_load.push ( proper_p ) ;
			if ( !qualifiers_only ) {
				var qs = i.getClaimItemsForProperty(p,true) ;
				$.each ( qs , function ( k2 , q2 ) {
					self.to_load.push ( q2 ) ;
				} ) ;
			}
			$.each ( self.wd.items[the_q].raw.claims[p] , function ( dummy , c ) {
				$.each ( (c.qualifiers||[]) , function ( p2 , cv ) {
					self.to_load.push ( p2 ) ;
					$.each ( cv , function ( dummy2 , c ) {
						if ( c.datavalue === undefined ) return ;
						if ( c.datavalue.value === undefined ) return ;
						if ( c.datavalue.value['entity-type'] != 'item' ) return ;
						self.to_load.push ( 'Q'+c.datavalue.value['numeric-id'] ) ;
					} ) ;
				} ) ;
			} ) ;
		} ) ;
	} ,
	
	loadInterfaceText : function ( callback ) {
		var self = this ;
		tt.setLanguage ( self.getMainLang() , callback ) ;
	} ,
	
	loadQ : function ( q ) {
		var self = this ;
		self.P = $.extend(true, {}, self.P_all);
		self.q = self.wd.convertToStringArray ( q , 'Q' ) [0] ;
		self.mm_load = [] ;
    $('#wikipedia-menu').show();
		$('#main_content').show() ;
		$('#main_content_sub').show() ;
		$('#top').html ( '<i>'+tt.t('loading')+'</i>' ) ;
		self.detectAndLoadQ ( self.q ) ;
	} ,
	
	detectAndLoadQ : function ( q ) {
		var self = this ;
		if ( q === undefined ) return ; // TODO error "item not found"

		$('head').append('<link href="https://www.wikidata.org/wiki/'+q+'" property="http://schema.org/sameAs" />');
		$('head').append('<link href="https://www.wikidata.org/entity/'+q+'" rel="foaf:primaryTopic" />');
		
		$.each ( reasonator_types , function ( dummy , type ) {
			if ( !type.detect() ) return ;
			self.main_type = type.type ;
			self.main_type_object = type ;
			type.load() ;
			return false ;
		} ) ;
	} ,

	addMissingPropsLinkingToMainItem : function () {
		var self = this ;
		$.each ( self.wd.items , function ( qp , i ) {
			$.each ( ((i.raw||{}).claims||[]) , function ( prop , v0 ) {
				$.each ( i.getClaimItemsForProperty(prop) , function ( dummy , q ) {
					if ( q != self.q ) return ;
					if ( undefined !== self.wd.items[prop] ) return ;
					if ( -1 != $.inArray ( prop , self.to_load ) ) return ;
					self.to_load.push ( prop ) ;
				} ) ;
			} ) ;
		} ) ;
		self.addMissingQualifiers() ;
	} ,
	
	addMissingQualifiers : function () {
		var self = this ;
		$.each ( self.wd.items , function ( qp , i ) {
			$.each ( ((i.raw||{}).claims||[]) , function ( prop , v0 ) {
				$.each ( i.getClaimsForProperty(prop) , function ( dummy , c ) {
					var q = i.getClaimTargetItemID ( c ) ;

					if ( ( q === undefined || q != self.q ) && qp != self.q ) return ; // Main item, or claim linking to main item

					$.each ( (c.qualifiers||[]) , function ( claim_prop , qual_claims ) {

//					if ( prop == 'P1081' ) console.log ( claim_prop ) ;
						
						if ( undefined === self.wd[claim_prop] && -1 == $.inArray(claim_prop,self.to_load) ) self.to_load.push ( claim_prop ) ;
						
/*
						$.each ( qual_claims , function ( dummy2 , qual_claim ) { // TODO find item targets and add them
							
						} ) ;
*/
					} ) ;
					
				} ) ;
			} ) ;
		} ) ;
	} ,
	
	addPropTargetsToLoad : function ( items , props ) {
		var self = this ;
		if ( props === undefined ) props = [] ;
		$.each ( items , function ( dummy0 , q ) {
			q = 'Q'+(q+'').replace(/\D/g,'') ;
			if ( undefined === self.wd.items[q] ) return ; // Paranoia
			$.each ( props , function ( dummy1 , p ) {
				p = 'P'+(p+'').replace(/\D/g,'') ;
				var subitems = self.wd.items[q].getClaimItemsForProperty ( p , true ) ;
				$.each ( subitems , function ( dummy2 , sq ) {
					if ( undefined !== self.wd.items[sq] ) return ; // Had that
					if ( -1 != $.inArray ( sq , self.to_load ) ) return ; // Going to do that
					self.to_load.push ( sq ) ;
				} ) ;
			} ) ;
		} ) ;
	} ,
	
	loadSPARQL : function ( sparql_query , callback ) { // First variable in SELECT /needs/ to be result item!
		var sparql = "PREFIX wdt: <http://www.wikidata.org/prop/direct/>\n" ;
		sparql += "PREFIX wd: <http://www.wikidata.org/entity/>\n" ;
		sparql += "PREFIX wikibase: <http://wikiba.se/ontology#>\n" ;
		sparql += "PREFIX p: <http://www.wikidata.org/prop/>\n" ;
		sparql += "PREFIX v: <http://www.wikidata.org/prop/statement/>\n" ;
		sparql += "PREFIX q: <http://www.wikidata.org/prop/qualifier/>\n" ;
		sparql += "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" ;
		sparql += "PREFIX schema: <http://schema.org/>\n" ;
		sparql += "PREFIX psv: <http://www.wikidata.org/prop/statement/value/>\n" ;
		sparql += sparql_query ;
		
		$.get ( 'https://query.wikidata.org/sparql' , {
			format:'json',
			query:sparql
		} , function ( d ) {
			var varname = d.head.vars[0] ;
			var params = { items:[] } ;
			$.each ( d.results.bindings , function ( k , v ) {
				var q = v[varname].value.replace(/^.+\/entity\/Q/,'') * 1 ;
				if ( q == 0 ) return ;
				params.items.push ( q ) ;
			} ) ;
			callback ( params ) ;
		} , 'json' ) ;
	} ,

	loadBacktrack : function ( o ) {
		var self = this ;
		
		function runWithItems ( d ) {
			var items = [] ;
			$.each ( (d.items||[]) , function ( k , v ) {
				self.to_load.push ( 'Q'+v ) ;
				items.push ( 'Q'+v ) ;
			} ) ;
			var tmp = self.to_load ;
			self.wd.getItemBatch ( tmp , function () {
				self.to_load = [] ;
				self.addPropTargetsToLoad ( items , o.preload ) ;
				self.loadRest ( o.callback ) ;
			} ) ;
		}
		
		if ( typeof o.sparql != 'undefined' ) {
			self.loadSPARQL ( o.sparql , function ( d ) {
				runWithItems ( d ) ;
			} ) ;
		} else {
			var wd2 = new WikiData() ;
			wd2.loadItems ( self.q , {
				follow : o.follow ,
				preload : o.preload ,
				preload_all : true ,
				finished : function ( p ) {
					$.each ( wd2.items , function ( k0 , v0 ) {
						if ( undefined !== self.wd.items[k0] ) return ;
						v0.wd = self.wd ;
						self.wd.items[k0] = v0 ;
					} ) ;
					self.loadRest ( o.callback ) ;
				}
			} ) ;
		}
	} ,

	keys2array : function ( o ) {
		var ret = [] ;
		$.each ( o , function ( k , v ) { ret.push ( k ) } ) ;
		return ret ;
	} ,
	



//__________________________________________________________________________________________

	isCategoryPage : function ( q ) {
		var self = this ;
		if ( self.wd.items[q].hasClaimItemLink ( 31 , self.Q.category_page ) ) return true ;
		return false ;
	} ,
	
	isTemplatePage : function ( q ) {
		var self = this ;
		if ( self.wd.items[q].hasClaimItemLink ( 31 , self.Q.template_page ) ) return true ;
		return false ;
	} ,
	
	isListPage : function ( q ) {
		var self = this ;
		if ( self.wd.items[q].hasClaimItemLink ( 31 , self.Q.list_page ) ) return true ;
		return false ;
	} ,
	
	isDisambiguationPage : function ( q ) {
		var self = this ;
		if ( self.wd.items[q].hasClaimItemLink ( 31 , self.Q.disambiguation_page ) ) return true ;
		return false ;
	} ,
	
	isNonContentPage : function ( q ) {
		var self = this ;
		return self.isCategoryPage(q) || self.isTemplatePage(q) || self.isListPage(q) || self.isDisambiguationPage(q) ;
	} ,
	


	// Used as final stage by all types
	loadRest : function ( callback ) {
		var self = this ;
		self.P = $.extend(true, self.P, self.P_all, self.P_websites);
		self.wd.getItemBatch ( self.to_load , function ( loaded_items ) {
			self.to_load = [] ;
			self.addMissingPropsLinkingToMainItem () ;
			self.wd.getItemBatch ( self.to_load , function ( loaded_items ) {
				callback() ;
			} ) ;
		} ) ;
	} ,




	wrapPanel : function ( h , panel ) {
		var self = this ;
		if ( $.trim(h||'') == '' ) return '' ;
		if ( typeof panel.type == 'undefined' ) panel.type = 'info' ;
		var ret = "<div class='panel panel-" + panel.type + "'>" ;
		var title = panel.title ;
		if ( typeof title == 'undefined' ) title = '' ;
		
		if ( typeof panel.id == 'undefined' ) {
			panel.id = 'auto_panel_' + self.table_block_counter ;
			self.table_block_counter++ ;
		}
		
		if ( panel.collapsible ) {
			title = '<a data-toggle="collapse" data-target="#'+panel.id+'" style="cursor:pointer;cursor:hand">' + title + "</a>" ;
		}
		
		if ( title != '' ) ret += "<div class='panel-heading'><h2 class='panel-title'>" + title + "</h2></div>" ;
		ret += '<div id="'+panel.id+'" class="panel-collapse collapse in" style="overflow:auto">' ;
		ret += h ;
		if ( typeof panel.footer != 'undefined' ) ret += "<div class='panel-footer'>" + panel.footer + "</div>" ;
		ret += "</div>" ;
		ret += "</div>" ;
		return ret ;
	} ,

	
	/**
	 * Follows "subclass of" property to the source, and shows that list.
	 * @param {string} q - The item to start with (usually reasonator.q)
	 */
	renderSubclassChain : function ( q ) {
		var self = this ;
		if ( q === undefined ) q = self.q ;
		var h = '' ;
		if ( self.wd.items[q].hasClaims('P279') ) {
			var chain = self.findLongestPath ( { start:q , props:[279] } ) ;
			var panel = { title:tt.t('subclass_of') , collapsible:true } ;
			var h = '' ;
			h += self.renderChain ( chain , [
//				{ title:tt.t('rank') , prop:279 , default:'<i>(unranked)</i>' } ,
				{ title:tt.t('name') , name:true } ,
				{ title:tt.t('description') , desc:true } ,
	//			{ title:tt.t('taxonomic_name') , prop:225 , default:'&mdash;' , type:'string' , ucfirst:true } ,
			] ) ;
			h = reasonator.wrapPanel ( h , panel ) ;
		}
		$('div.classification').html ( h ) ;
	} ,

	/**
	 * Adds a claim [q:prop=>target] to an item using WiDaR/OAuth. Reloads the page if successful, or shows error message.
	 * @param {string} q : The item to modify (usually reasonator.q).
	 * @param {string} prop p : The property for the claim to be added.
	 * @param {string} target : The target item ID.
	 */
	addClaimItemOauth : function ( q , prop , target , o ) {
		var self = reasonator ;
		if ( o === undefined ) o = {} ;

		$.get ( self.widar_url , {
			action:'set_claims',
			tool_hashtag:'reasonator',
			ids:q,
			prop:prop,
			target:target,
			botmode:1
		} , function ( d ) {
			if ( d.error == 'OK' ) {
				if ( o.live && !/\blive\b/.test(window.location.href) ) {
					window.location = window.location.href + "&live" ;
				} else {
					location.reload();
				}
			} else alert ( d.error ) ;
		} , 'json' ) .fail(function( jqxhr, textStatus, error ) {
			alert ( error ) ;
		} ) ;
	} ,

	

	renderMainPropsTable : function ( props ) {
		var self = this ;
		var q = self.q ;
		var sd = {} ;
		$.each ( props , function ( dummy , p ) {
			self.P['P'+p] = p ; // Don't show in "Other"
			p = 'P' + p ;
			var items = self.wd.items[q].getClaimObjectsForProperty(p) ;
			if ( items.length === 0 ) return ;
			if ( sd[p] === undefined ) sd[p] = {} ;
			$.each ( items , function ( k , v ) {
				if ( sd[p][v.key] === undefined ) sd[p][v.key] = [] ;
				sd[p][v.key].push ( $.extend(true,{type:'item',mode:1},v) ) ;
			} ) ;
		} ) ;
		self.renderPropertyTable ( sd , { id:'div.props',striped:true,title:tt.t(self.main_type+'_props'),ucfirst:true } ) ;
	} ,
	
	/**
	 * In a graph of items linked by properties, finds the longest path from a give item to a root item.
	 * @param {hash} o - Hash with keys "start" (start item ID) and "props" (array of property IDs).
	 * @returns {array} List of item IDs, starting with the "o.start" item, ending with the root item.
	 */
	findLongestPath : function ( o ) {
		var self = this ;
		var props = [] ;
		$.each ( o.props , function ( dummy , p ) { props.push ( 'P'+(p+'').replace(/\D/g,'') ) } ) ;
		
		var tree = {} ;
		
		function preset ( qs ) {
			$.each ( qs , function ( dummy , q ) {
				var new_q = [] ;
				if ( undefined !== tree[q] ) return ;
				tree[q] = [] ;
				$.each ( props , function ( dummy , p ) {
					if ( 'undefined' == typeof self.wd.items[q] ) return ;
					var by_rank = { normal:[] , preferred:[] , deprecated:[] } ;
					var claims = self.wd.items[q].getClaimsForProperty ( p ) ;
					$.each ( claims , function ( dummy , c ) {
						var qx = self.wd.items[q].getClaimTargetItemID ( c ) ;
						if ( qx === undefined ) return ;
						by_rank[c.rank||'normal'].push ( qx ) ;
					} ) ;
					
					var to_process = by_rank.preferred ;
					if ( to_process.length == 0 ) to_process = by_rank.normal ;
//					else console.log ( to_process ) ;
					
					$.each ( to_process , function ( dummy , qx ) {
						if ( -1 != $.inArray ( qx , new_q ) ) return ;
						new_q.push ( qx ) ;
						tree[q].push ( qx ) ;
					} ) ;

				
/*
					var q2 = self.wd.items[q].getClaimItemsForProperty(p) ;
					$.each ( q2 , function ( k , v ) {
						if ( -1 != $.inArray ( v , new_q ) ) return ;
						new_q.push ( v ) ;
						tree[q].push ( v ) ;
					} ) ;*/
				} ) ;
				preset ( new_q ) ;
			} ) ;
		}
		
		preset ( [ o.start ] ) ;
	
		function iterate ( qs ) {
			var nqs = [] ;
			$.each ( qs , function ( dummy , i ) {
				var sub_q = [] ;
				$.each ( tree[i.q] , function ( dummy2 , v ) {
					if ( -1 != $.inArray ( v , i.hist ) ) return ;
					sub_q.push ( v ) ;
				} ) ;
				
				$.each ( sub_q , function ( k , v ) {
					var nh = i.hist.slice() ;
					nh.push ( v ) ;
					nqs.push ( { q:v , hist: nh } ) ;
				} ) ;
				
			} ) ;
			
			if ( nqs.length > 0 ) {
				qs = [] ;
				return iterate ( nqs ) ;
			} else {
				var longest = [] ;
				$.each ( qs , function ( dummy , i ) {
					if ( i.hist.length > longest.length ) longest = i.hist ;
				} ) ;
				return longest ;
			}
			
		}
		
		var ret = iterate ( [ { q:o.start , hist:[o.start] } ] ) ;
		return ret ;
	} ,


	/**
	 * Returns the current URL, with modifications is set.
	 * @param {hash} o - Can have keys "hash" (bool: use hash or "?" to separate parameters), "lang" (string: language)
	 * @returns {string} URL.
	 */
	getCurrentUrl : function ( o ) {
		var self = this ;
		var url = ( o.hash ) ? '#' : '?' ;
		url += "q=" + self.q ;
		var lang = self.wd.main_languages[0] ;

		url += self.getLangParam(o.lang) ;
		
		if ( undefined === o.live ) o.live = self.params.live !== undefined ;
		if ( o.live ) url += "&live" ;
		return url ;
	} ,



//__________________________________________________________________________________________
// Show parts


	adjustSitelinksHeight : function () {
		var self = this ;
		var qr_code_height = 200 ;
		var min_height = parseInt($('div.sitelinks').css('min-height')) ;
		var mainbar = $('.mainbar') ;
		var h = parseInt(mainbar.height())-parseInt($('div.sitelinks').position().top);
		if ( self.showQRLink ) h -= qr_code_height ; // QR code
		if ( h < min_height ) h = min_height ;
		$('div.sitelinks').css({'max-height':h+'px'})
	} ,

	renderChain : function ( chain , columns ) {
		var self = this ;
		var h = '' ;
		h += "<table class='table table-condensed table-striped chaintable'><thead><tr>" ;
		$.each ( columns , function ( k , v ) {
			if ( typeof v.title != 'undefined' ) h += "<th nowrap>" + self.escapeHTML(v.title) + "</th>" ;
			else h += "<th/>" ;
		} ) ;
		h += "</tr></thead><tbody>" ;
		while ( chain.length > 0 ) {
			var q = chain.pop() ;
			if ( undefined === self.wd.items[q] ) continue ;
			h += "<tr>" ;
			$.each ( columns , function ( k , v ) {
				if ( v.name ) {
					h += "<td nowrap>" + self.getItemLink ( { type:'item',q:q } , {ucfirst:true,desc:true,q_desc:true,internal:true} )  + "</td>" ;
				} else if ( v.desc ) {
					h += "<td>" + self.wd.items[q].getDesc() + "</td>" ;
				} else if ( undefined !== v.prop ) {
					var h2 = v.default || '' ;
					var c = self.wd.items[q].getClaimsForProperty('P'+v.prop) ;
					if ( c.length > 0 ) {
						if ( v.type == 'string' ) {
							h2 = [] ;
							$.each ( c , function ( k2 , v2 ) {
								var s = self.wd.items[q].getClaimTargetString(v2) ;
								if ( v.ucfirst ) s = ucFirst ( s ) ;
								if ( undefined !== s && s != '' ) h2.push ( s ) ;
							} ) ;
							h2 = h2.join ( "<br/>" ) ;
							if ( h2 == '' ) h2 = v.default || '' ;
						} else if ( v.type == 'date' ) {
							h2 = [] ;
							$.each ( c , function ( k2 , v2 ) {
								var date = self.wd.items[q].getClaimDate(v2) ;
								if ( date === undefined ) {
									h2.push ( '???' ) ; // Unknown value
									return ;
								}
								var m = date.time.match ( /^([+-])0*(\d{4})-(\d\d)-(\d\d)T/ ) ;
								if ( m == null ) {
									h2.push ( "MALFORMED DATE: " + date.time ) ;
								} else {
									var year = ( m[1] == '-' ) ? '-'+m[2] : ''+m[2] ;
									var s = '???' ;
									if ( date.precision >= 11 ) s = year+'-'+m[3]+'-'+m[4] ;
									else if ( date.precision == 10 ) s = year+'-'+m[3] ;
									else if ( date.precision == 9 ) s = year ;
									else if ( date.precision == 8 ) s = parseInt(year/10)+'0s' ;
									else if ( date.precision == 7 ) s = parseInt(year/100)+'00s' ;
									var url = '?date='+s ;
									url += self.getLangParam() ;
									h2.push ( "<a href='"+url+"'>"+s+"</a>" ) ;
								}
							} ) ;
							h2 = h2.join ( "<br/>" ) ;
							if ( h2 == '' ) h2 = v.default || '' ;
							
						} else if ( v.type == 'quantity' ) {
							h2 = self.renderQuantity ( v ) ;

						} else if ( v.type == 'monolingualtext' ) {
							h2 = self.renderMonolingualText ( v ) ;
							
						} else {
							h2 = [] ;
							$.each ( c , function ( k2 , v2 ) {
								var s = self.wd.items[q].getClaimTargetItemID(v2) ;
								if ( undefined !== self.wd.items[s] ) h2.push ( self.getItemLink ( { type:'item',q:s } , {ucfirst:true,desc:true,q_desc:true} ) ) ;
								else h2.push ( s ) ;
							} ) ;
							h2 = h2.join ( "<br/>" ) ;
							if ( h2 == '' ) h2 = v.default || '' ;
//							c = self.wd.items[q].getClaimTargetItemID(c[0]) ;
//							if ( undefined !== self.wd.items[c] ) h2 = self.getItemLink ( { type:'item',q:c } , {ucfirst:true,desc:true,q_desc:true} ) ;
						}
					}
					h += "<td" ;
					if ( v.prop == 225 ) h += " style='font-style:italic'" ;
					h += ">" + h2 + "</td>" ;
				} else {
					h += "<td>ERROR</td>" ;
				}
			} ) ;
			h += "</tr>" ;
		}
		h += "</tbody></table>" ;
		return h ;
	} ,
	
	getMainLang : function () {
		var self = this ;
		return self.wd.main_languages[0] ;
	} ,


	showAliases : function ( q , include_labels ) {
		var self = this ;
		var h = [] ;
		var title = $('#main_title_label').text() ;
		$.each ( self.wd.items[q].getAliases(include_labels) , function ( k , v ) {
			if ( v == title ) return ;
			h.push ( "<div class='alias'>" + v.replace(/\s/g,'&nbsp;') + "</div>" ) ;
		} ) ;
		h = h.join ( ' | ' ) ;
		$('div.aliases').html ( h ) ;
	} ,

	setTopLink : function () {
/*		var self = this ;
		var h = tt.t('item')+" " + self.getItemLink ( { type:'item',q:self.q } , { show_q:true,desc:true,force_external:true } ) ;
		h = "<div style='float:right'><a target='_blank' style='color:#BBB' href='//meta.wikimedia.org/wiki/Reasonator/interface'>" + tt.t('translate_interface') + "</a></div>" + h ;
		$('#top').html ( h ) ;*/
		$('#top').hide() ;
	} ,
	
	renderName : function () {
		var self = this ;
		var label = self.wd.items[self.q].getLabel() ;
		if ( label == self.q ) { // No "common" label, pick one
			var item = reasonator.wd.getItem(self.q).raw ;
			if ( undefined !== item && undefined !== item.labels ) {
				$.each ( item.labels , function ( k , v ) { label = v.value ; } ) ;
			}
		}
		label = "<span id='main_title_label'>" + self.escapeHTML(label) + "</span>" ;

		label +=
        '<small>' +
          '&nbsp;&nbsp;(<a class="wikidata" title="Wikidata ID" aria-label="Wikidata ID" target="_blank" href="https://www.wikidata.org/wiki/' + self.q + '?uselang=' + self.wd.main_languages[0] + '">' + self.q + '</a>)' +
          '&nbsp;&nbsp;<a class="wikidata" target="_blank" title="incoming links" aria-label="incoming links" style="font-size: small;" href="https://www.wikidata.org/w/index.php?title=Special:WhatLinksHere/' + self.q + '&namespace=0&limit=100&uselang=' + self.wd.main_languages[0] + '"><span class="icon"><i class="fas fa-project-diagram"></i></span></a>' +
        '</small>' ;

		$('h1.main_title').html ( label ) ;
		
		var i = self.wd.items[self.q] ;
		if ( self.hasNoLabelInMainLanguage(i) ) {
			var lang = self.getMainLang() ;
			$('#main_title_label').addClass ( 'missing_label' ) ;
			if ( self.allowLabelOauthEdit ) {
				$('#main_title_label').dblclick ( function () {
					var current_label = $('#main_title_label').text() ;
					current_label = current_label.replace ( /\s*\(.+$/ , '' ) ;
					self.addLabelOauth ( self.q , lang , current_label , function ( new_label ) {
						$('#main_title_label').text ( new_label ) ;
						$('#main_title_label').removeClass ( 'missing_label' ) ;
						$('#main_title_label').unbind('dblclick');
						self.setDocTitle ( new_label ) ;
					} ) ;
				} ) ;
//				$('#main_title_label').attr ( { title:tt.t('edit_title').replace(/\$1/g,self.all_languages[lang]) } ) ;
				$('#main_title_label').attr ( { tt_title:'edit_title' } ) ;
				tt.updateInterface ( $('#main_title_label') ) ;
			}
		}
		
		
		self.setDocTitle ( self.wd.items[self.q].getLabel() ) ;
	} ,
	
	
	showDescription : function () {
		var self = this ;
		$('div.manual_description').html ( self.wd.items[self.q].getDesc() ) ;
	} ,

	setRTL : function () {
		var self = this ;
		self.isRTL = ( self.allow_rtl && -1 < $.inArray ( self.wd.main_languages[0] , [ 'fa','ar','ur','dv','he' ] ) ) ;
		if ( self.isRTL ) {
			$('#main_content').css ( { 'direction':'RTL' } ) ;
			$('div.sidebar').css({'float':'left'}) ;
			$('td,th').css({'text-align':'right'}) ;
			$('div.sidebar th').css({'text-align':'center'}) ;
			setTimeout ( function(){$('table.chaintable td,table.chaintable th').css({'text-align':'right'})} , 100 ) ;
		}
	} ,
	
	finishDisplay : function ( h ) {
		var self = this ;
		var i = self.wd.items[self.q] ;
		$.each ( self.mm_load , function ( k , v ) {
			if ( k >= self.max_related_media && v.secondary_file ) {
				$(v.id).remove() ;
			} else {
				if ( v.id === undefined ) return ;
				$(v.id).html ( "<div class='unloaded_thumbnail' mmid='"+k+"'></div>" ) ;
			}
		} ) ;
		var ts = self.square_thumb_size ;
		$('div.all_images div.unloaded_thumbnail').parent().width(ts).height(ts).css({'text-align':'center'}) ;
		
		self.setRTL() ;

		if ( undefined !== h ) $('.main').html ( h ) ;
		$('#actual_content').show() ;
		$(window).scroll(); // Force-show visible images
		
		if ( self.use_js_refresh ) {
			$('#actual_content a').each ( function ( k , v ) {
				if ( !$(v).hasClass('q_internal') ) return ;
				$(v).click ( function () {
					var a = $(this) ;
					var m = a.attr('href').match ( /\bq=q{0,1}(\d+)/ ) ;
					if ( m == null ) return true ; // Load URL
					var q = 'Q' + m[1] ;
					self.q = q ;
					self.reShow() ;
					return false ;
				} ) ;
			} ) ;
		}

		if ( undefined !== self.do_maps ) {
			setTimeout ( function () {
				$.each ( self.do_maps , function ( k , v ) {
					self.setMap ( v[0] , v[1] , v[2] ) ;
				} ) ;
			} , 100 ) ;

			var lat , lon ;
			$.each ( self.do_maps , function ( k , v ) {
				lon = v[0].longitude ;
				lat = v[0].latitude ;
				return false ;
			} ) ;
			
			var h = [] ;
			h.push ( "<a target='_blank' class='external' href='//tools.wmflabs.org/wikidata-todo/around.html?lat="+lat+"&lon="+lon+"'>Other Wikidata items within 15km</a>" ) ;
			var parts = (lat<0?-lat:lat)+' '+(lat<0?'S':'N')+' '+(lon<0?-lon:lon)+' '+(lon<0?'W':'E') ;
			h.push ( "<a target='_blank' class='external' href='//tools.wmflabs.org/geohack/geohack.php?params="+parts+"'>Geohack</a>" ) ;
			h.push ( "<a target='_blank' class='external' id='taginfo' style='display:none' href='http://taginfo.openstreetmap.org/tags/wikidata="+self.q+"'>TagInfo</a>" ) ;
			//h.push ( "<a target='_blank' class='external' id='overpass' href='http://overpass-turbo.eu/?w=%22wikidata%22%3D%22"+self.q+"%22+global&R'>Overpass</a>" ) ;
			h .push ( lat + " / " + lon ) ;
			h = "<div>" + h.join(' | ') + "</div>" ;
			
			
			$('div.maps div.panel-footer').append ( h ) ;
			
			$.getJSON ( '//taginfo.openstreetmap.org/api/4/search/by_key_and_value?query=wikidata%3D'+self.q+'&page=1&rp=10&callback=?' , function ( d ) {
//				console.log ( "taginfo" , d ) ;
				if ( typeof d.data == 'undefined' || d.data.length == 0 ) {
					$('#taginfo').replaceWith ( '<span>TagInfo</span>' ) ;
				}
				$('#taginfo').show() ;
			} ) ;
			
			
      /*
			$.get ( '//overpass.osm.rambler.ru/cgi/interpreter?data=[out:json];way[wikidata%3D'+self.q+']%3Bout%3B' , function ( d ) {
//				console.log ( "overpass" , d ) ;
				if ( typeof d.elements == 'undefined' || d.elements.length == 0 ) {
					$('#overpass').replaceWith ( '<span>Overpass</span>' ) ;
				}
				$('#overpass').show() ;
			} , 'json' ) ;
      */
			
		}
		
		self.addHoverboxes () ;
		self.addWikiHoverboxes () ;
				
		if ( self.use_autodesc && !self.use_hoverbox ) {
			var x = {} ;
			$.each ( self.autodesc_items , function ( dummy , q ) {
				x[q] = 1 ;
			} ) ;
			
			$.each ( x , function ( q , dummy ) {
				wd_auto_desc.loadItem ( q , { target:$('small.autodesc_'+q) , reasonator_lang:(self.params.lang||'en') , links:'reasonator_local' } ) ;
			} ) ;
		}
		
    /*
		if ( self.showConceptCloudLink ) {
			var h = "<div class='concept_cloud'><a class='external' target='_blank' href='//tools.wmflabs.org/wikidata-todo/cloudy_concept.php?q="+self.q+"&lang="+self.getMainLang()+"'>"+tt.t('concept_cloud')+"</a></div>" ;
			$('#actual_content div.sidebar').append ( h ) ;
		}
    */		

		if ( self.use_property_suggest ) {
			self.suggestProperties() ;
		}

		// All things list
		if ( i.hasClaimItemLink('P31','Q13406463') && !i.hasClaims('P360') && !i.hasClaims('P4224') ) { // "instance of":"Wikimedia list article" / no "list of" / no "category contains"
			$('div.topnote').append ( "<div>" + tt.t('add_listof_topnote') + "</div>" ) ;
		} else if ( !i.hasClaims('P31') && (i.hasClaims('P360') || i.hasClaims('P4224') ) ) { // "list of" or "category contains" / no "instance of"
			var h = tt.t('add_instance_of_list').replace(/\$1/g,"<a href='/widar/' target='_blank' class='external'>WiDaR</a>") ;
			h = h.replace ( /\$2/g , "<a href='#' onclick='reasonator.setAsInstanceOfList();return false'>" ) ;
			$('div.topnote').append ( h ) ;
		} else if ( (i.hasClaims('P360')||i.hasClaims('P4224')) && ( i.hasClaimItemLink('P31','Q13406463') || i.hasClaimItemLink('P31','Q4167836') ) ) {
			self.showListOf() ;
		}
		
		
		self.showQRcode() ;
		self.generateTimelineData() ;
		self.adjustSitelinksHeight() ;
		
		if ( $('div.all_images').html() == '' ) $('#other_media_container').hide() ;
	} ,
	
	setAsInstanceOfList : function () {
		var self = this ;
		self.addClaimItemOauth ( self.q , "P31" , "Q13406463" , {} ) ;
	} ,
	
	showListOf : function () {
		var self = this ;
		var i = self.wd.items[self.q] ;
		
		function tree ( q ) {
			if ( q == 'Q5' ) return '5' ;
			return "(tree["+q.replace(/\D/g,'')+"][][279,131])" ;
		}

		var sparql_count = 0 ;
		function sparql_tree ( prop , q ) {
			var _q = (q+'').replace(/\D/g,'') ;
			var _prop = (prop+'').replace(/\D/g,'') ;
			if ( _q == '5' ) return "?item wdt:P"+_prop+" wd:Q"+_q ;
			sparql_count++ ;
			return "?item wdt:P"+_prop+" ?sub"+sparql_count+" . ?sub"+sparql_count+" (wdt:P279|wdt:P131)* wd:Q"+_q ;
		}
		
		function addListItems ( dummy , claim ) {
			var q = i.getClaimTargetItemID ( claim ) ;
			if ( q === undefined ) return ;

			var sparql_part = sparql_tree ( 31 , q ) ;
			search_main.push ( self.wd.items[q].getLabel() ) ;
			
			// Add conditions for qualifiers
			$.each ( (claim.qualifiers||{}) , function ( qual_prop , qual_list ) {
				if ( self.wd.items[qual_prop]===undefined || self.wd.items[qual_prop].raw===undefined || self.wd.items[qual_prop].raw.datatype!='wikibase-item' ) return ; // Only qualifiers properties that point to an item
				$.each ( qual_list , function ( dummy2 , qual ) {
					var dummy_claim = { mainsnak:qual } ;
					var qual_q = i.getClaimTargetItemID ( dummy_claim ) ;
					search_qual.push ( self.wd.items[qual_q].getLabel() ) ;
					sparql_part += " . " + sparql_tree ( qual_prop , qual_q ) ;
				} ) ;
			} ) ;
			sparql_parts.push ( sparql_part ) ;
		}
		
		var search_main = [] ;
		var search_qual = [] ;
		var sparql_parts = [] ;
		$.each ( i.getClaimsForProperty('P360') , addListItems ) ;
		$.each ( i.getClaimsForProperty('P4224') , addListItems ) ;
		
		if ( sparql_parts.length == 0 ) return ; // Paranoia

		var sparql_query = 'SELECT DISTINCT ?item WHERE {' + sparql_parts.join ( ' . ' ) + '}' ;

		$('div.list_of').html ( "<i>Loading list of items in the 'list of' subclass trees...</i>" ) ;
		
		self.loadSPARQL ( sparql_query+" LIMIT "+self.max_list_items , 
		function ( d ) {
			if ( d.items.length == 0 ) {
				$('div.list_of').hide().html('') ;
				return ;
			}
			var items = [] ;
			$.each ( (d.items||[]) , function ( k , v ) {
				if ( items.length >= self.max_list_items ) return false ;
				items.push ( d.items[items.length] ) ;
			} ) ;
			self.wd.getItemBatch ( items , function () {
				var h = "<h2>" + tt.t("list_of_matching_items") + "</h2>" ;
				h += "<div>" ;
				if ( items.length != d.items.length ) {
					h += tt.t('list_note').replace(/\$1/g,self.max_list_items).replace(/\$2/g,d.items.length) ;
					h += tt.t('list_browse1') ;
				} else {
					h += tt.t('list_browse2') ;
				}
//				h += " <a target='_blank' class='external' href='/autolist/index.php?run=Run&wdqs=" + escape(sparql_query) + "'>" + tt.t('list_here') + "</a>. " ;
				h += " <a target='_blank' class='external' href='https://petscan.wmflabs.org/?sparql=" + escape(sparql_query) + "&interface_language=en&doit='>" + tt.t('list_here') + "</a>. " ;
				h += tt.t('list_search').replace(/\$1/g,"<a href='?find="+escattr([].concat(search_main).concat(search_qual).join(' ').replace(/\bhuman\b/gi,''))+"'>").replace(/\$2/g,"<a href='?find=list "+escattr(search_main.join(' ').replace(/\bhuman\b/gi,''))+"'>") ;
				h += "</div>" ;
				h += "<ol>" ;
				$.each ( items , function ( k , v ) {
					var q = 'Q' + v ;
					h += "<li>" + self.getQlink ( q ) + "</li>" ;
				} ) ;
				h += "</ol>" ;
				$('div.list_of').html ( h ) ;
				self.addHoverboxes ( 'div.list_of' ) ;
			} ) ;

		} ) ;
	} ,
	
	showQRcode : function () {
		var self = this ;
		if ( !self.showQRLink ) return ;
		var sites = self.wd.getItem(self.q).getWikiLinks() || {} ;
		var site ;
		$.each ( self.wd.main_languages , function ( dummy , l ) {
			if ( sites[l+'wiki'] === undefined ) return ;
			site = sites[l+'wiki'] ;
			return false ;
		} ) ;
		if ( site === undefined ) {
			$.each ( sites, function ( k , v ) {
				if ( !k.match(/^.+wiki$/ ) ) return ;
				site = v ;
				return false ;
			} ) ;
		}
		if ( site === undefined ) return ;
		
		var m = site.site.match ( /^(.+)wiki$/ ) ;
		var l = m[1] ;
		var url_title = escape(site.title.replace(/\s/g,'_')) ;
		var qrpedia_url = "http://" + l + ".qrwp.org/" + url_title ;
		var qrp_url = "//qrpedia.org/qr/php/qr.php?size=800&download="+url_title+"%20QRpedia&e=L&d=" + qrpedia_url ;
		var qr_img = "<a title='"+tt.t('qrpedia')+"; if no QR code shows here, the QRpedia https certificate is broken' href='"+qrpedia_url+"' target='_blank'><img width='200px' src='" + qrp_url + "' /></a>" ;
		var h = '<div style="text-align:center; display:none;" class="qrcode"></div>' ;
		$('div.sidebar').append ( h ) ;
		if ( true ) { // Direct QR code show
			$('div.qrcode').html ( qr_img ) ;
			self.adjustSitelinksHeight();
		} else {
			$('div.qrcode').html ( '<a href="#">Show QR code</a>' ) ;
			$('div.qrcode a').click ( function () {
				$('div.qrcode').html ( qr_img ) ;
				return false ;
			} ) ;
		}

	} ,
	
	addWikiHoverboxes : function () {

    return 0;

		var self = this ;
		if ( !self.use_wiki_hoverbox ) return ;
		$('div.sitelinks a.wikipedia').each ( function () {
			var a = $(this) ;
			var m = a.attr('href').match ( /^(.+?)\/wiki\/(.+)$/ ) ;

      // TODO: redirect wikipedia and wikidata clicks to conzept-links for those
      //console.log( m );

			if ( m == null ) {
        //console.log ( "No hover box for " + a.attr('href') );
        return;
      }
			var sitebase = m[1] ;
			var page = m[2] ;

			a.cluetip ( { // http://plugins.learningjquery.com/cluetip/#options
				splitTitle:'|',
				multiple : false,
				sticky : true ,
				mouseOutClose : 'both' ,
				cluetipClass : 'myclue' ,
				leftOffset : 0 ,
				onShow : function(ct, ci) { // Outer/inner jQuery node
					$('div.maps div').css({'z-index':0}) ; // 
					var title = decodeURIComponent(page).replace(/_/g,' ') ;
					ct.css({'background-color':'white'}) ; // TODO use cluetipClass for real CSS
					var title_element = $(ct.find('h3')) ;
					title_element.html ( title ) ;
					ci.html ( '<i>'+tt.t('loading_intro')+'</i>' ) ;
//					if ( self.isRTL ) ci.css ( { 'direction':'RTL' } ) ;

					$.getJSON ( sitebase + '/w/api.php?callback=?' , {
						action:'query',
						prop:'extracts',
						exsentences:3,
						titles:m[2],
						exintro:'',
						format:'json'
					} , function ( d ) {
						var h = '<i>'+tt.t('no_intro')+'</i>' ;
						$.each ( ((d.query||[]).pages||[]) , function ( pageid , pd ) {
							if ( pd.extract === undefined ) return ;
							h = "<div>" + pd.extract + "</div>" ;
						} ) ;
						ci.html ( h ) ;
					} ) ;
				}
			
			} ) ;
		} ) ;
	} ,
	
	hasNoLabelInMainLanguage : function ( item ) {
		var self = this ;
		var ml = self.getMainLang() ;
		if ( item.raw === undefined ) return true ;
		if ( item.raw.labels === undefined ) return true ;
		if ( item.raw.labels[ml] === undefined ) return true ;
		return false ;
	} ,
	
	addHoverboxes : function  ( selector ) {
		if ( selector === undefined ) selector = '' ;
		var self = this ;
		if ( !self.use_hoverbox ) return ;
		var pl = self.getMainLang() ;
		wd_auto_desc.lang = pl ;
		var icons = {
			wiki:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/18px-Wikipedia-logo-v2.svg.png' ,
			wikivoyage:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Wikivoyage-logo.svg/18px-Wikivoyage-logo.svg.png' ,
			wikiquote:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Wikiquote-logo.svg/18px-Wikiquote-logo.svg.png' ,
			wikisource:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Wikisource-logo.svg/18px-Wikisource-logo.svg.png'
		} ;

		$(selector+' a.q_internal').cluetip ( { // http://plugins.learningjquery.com/cluetip/#options
			splitTitle:'|',
			multiple : false,
			sticky : true ,
			mouseOutClose : 'both' ,
			cluetipClass : 'myclue' ,
			leftOffset : 0 ,
//				delayedClose : 500 ,
			onShow : function(ct, ci) { // Outer/inner jQuery node
				$('div.maps div').css({'z-index':0}) ; // 
				var a = $(this) ;
				var qnum = a.attr('q').replace(/\D/g,'') ;
				var q = 'Q'+qnum ;
				var i = reasonator.wd.items[q] ;
				var title = i.getLabel() ;
				var dl = i.getLabelDefaultLanguage() ;
				var rank = a.hasClass('rank_deprecated') ? 'deprecated' : ( a.hasClass('rank_preferred') ? 'preferred' : 'normal' ) ;

				var h = "" ;
				h += "<div><span style='margin-right:10px;font-size:12pt'><a class='wikidata' target='_blank' href='//www.wikidata.org/wiki/Q"+qnum+"'>Q"+qnum+"</a></span>" ;
				
				var sl = i.getWikiLinks() ;
				$.each ( [ 'wiki' , 'wikivoyage' , 'wikisource' , 'wikiquote' ] , function ( dummy , site ) {
					var s2 = site=='wiki'?'wikipedia':site ;
					if ( sl[pl+site] != undefined ) h += "<span style='margin-left:5px'><a title='"+tt.t('sl_'+s2)+" "+self.all_languages[pl]+"' target='_blank' href='//"+pl+"."+s2+".org/wiki/"+escape(sl[pl+site].title)+"'><img border=0 src='"+icons[site]+"'/></a></span>" ;
				} ) ;
				var commons = i.getClaimObjectsForProperty ( 373 ) ;
				if ( commons.length > 0 ) {
					h += "<span style='margin-left:5px'><a title='"+tt.t('commons_cat')+"' target='_blank' href='//commons.wikimedia.org/wiki/Category:"+escape(commons[0].s)+"'><img src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Commons-logo.svg/18px-Commons-logo.svg.png' border=0 /></a></span>" ;
				}


				if ( self.showSearchMapLink && self.wd.items[q].hasClaims('P625') ) {
					var claims = self.wd.items[q].getClaimsForProperty ( 'P625' ) ;
					var lat = claims[0].mainsnak.datavalue.value.latitude ;
					var lon = claims[0].mainsnak.datavalue.value.longitude ;
					var url = '/wikidata-todo/around.html?lat='+lat+'&lon='+lon+'&radius=15&lang=' + self.getMainLang() ;
					h += "<span style='margin-left:5px'><a title='"+tt.t('link_around_title')+"' href='"+url+"' target='_blank'><img border=0 src='"+self.map_icon_url+"'/></a></span>" ;
					
				}

				h += "</div>" ;
				
				
				if ( self.hasNoLabelInMainLanguage(i) ) {
					h += "<div class='internal missing_label'><i>" ;
					h += tt.t('no_label_in').replace(/\$1/g,self.all_languages[pl]||pl) ;
					h += "</i>" ;
					if ( self.allowLabelOauthEdit ) {
						h += "<br/><a href='#' onclick='reasonator.addLabelOauth(\""+q+"\",\""+pl+"\",\""+escattr(i.getLabel())+"\");return false'><b>" ;
						h += tt.t('add_a_label') + "</b></a> (" + tt.t('via_widar').replace(/\$1/,"<a target='_blank' href='/widar/'>WiDaR</a>") + ")" ;
					}
					h += "</div>" ;
				}

				h += "<div>" + i.getDesc() + "</div>" ;
			
				var adid = 'cluetip_autodesc_'+q ;
				if ( self.use_autodesc ) {
					h += "<div id='"+adid+"'>...</div>" ;
				}
				
				// Rank
				if ( rank != 'normal' ) h += "<div>" + tt.t('rank_label') + " : " + tt.t('rank_'+rank) + "</div>" ;
			
			
				ct.css({'background-color':'white'}) ; // TODO use cluetipClass for real CSS
				var title_element = $(ct.find('h3')) ;
				title_element.text ( title ) ;
				ci.attr({q:q}) ;
				ci.html ( h ) ;
				if ( self.isRTL ) ci.css ( { 'direction':'RTL' } ) ;

				var images = i.getMultimediaFilesForProperty(18);
				if ( images.length > 0 ) {
					var img = images[0] ;
					$.getJSON ( '//commons.wikimedia.org/w/api.php?callback=?' , {
						action:'query',
						titles:'File:'+img,
						prop:'imageinfo',
						format:'json',
						iiprop:'url',
						iiurlwidth:120,
						iiurlheight:300
					} , function ( d ) {
						if ( d.query === undefined || d.query.pages === undefined ) return ;
						$.each ( d.query.pages , function ( dummy , v ) {
							if ( v.imageinfo === undefined ) return ;
							var ii = v.imageinfo[0] ;
							var h = "<div style='float:right'><img src='"+ii.thumburl+"' /></div>" ;
							if ( ci.attr('q') != q ) return ;
							$('#cluetip').css({width:'400px'});
							ci.prepend ( h ) ;
						} ) ;
					} ) ;
				}

				if ( self.use_autodesc ) {
					wd_auto_desc.loadItem ( q , { target:$('#'+adid) , reasonator_lang:(self.params.lang||'en') , links:'reasonator_local' } ) ;
				}
			}
		} ) ;
	} ,
		
	
	addLabelOauth : function ( q , lang , basis , callback ) {
		var a = $('a.q_internal[q="'+q.replace(/\D/g,'')+'"]') ;
		var self = reasonator ;
		var label = prompt ( "New label in " + self.all_languages[lang] , (basis||"") ) ;
		
		if(label == "" || label == null) return ;
		
		var oauth_wait_dialog = "<div id='oauth_wait_dialog' style='width: 200px; position: absolute; top: 200px; background-color: #99C7FF; color: white; text-align: center; left: 50%; margin-left: -100px; padding: 5px;'>Editing via WiDaR...</div>" ;
		$('#oauth_wait_dialog').remove() ;
		$('body').append ( oauth_wait_dialog ) ;

		$.get ( self.widar_url , {
			action:'set_label',
			tool_hashtag:'reasonator',
			q:q,
			lang:lang,
			label:label,
			botmode:1
		} , function ( d ) {
			$('#oauth_wait_dialog').remove() ;
			if ( d.error == 'OK' ) {
				a.removeClass ( 'missing_label' ) ; //.css({border:'none'}).text ( label ) ;
				reasonator.wd.items[q].raw.labels[lang] = { language:lang , value:label } ;
				if ( callback !== undefined ) callback ( label ) ;
			} else alert ( d.error ) ;
		} , 'json' ) .fail(function( jqxhr, textStatus, error ) {
			alert ( error ) ;
		} ) ;
	} ,
	
	
	addMiscData : function ( props ) {
		var self = this ;
		var i = self.wd.items[self.q] ;
		var q = self.q ;
		
		var sd = {} ;
		$.each ( props , function ( p , dummy ) {
			if ( self.P_url[p] !== undefined ) return ;
			p = 'P' + p ;
			var items = self.wd.items[q].getClaimObjectsForProperty(p) ;
			if ( items.length === 0 ) return ;
			if ( sd[p] === undefined ) sd[p] = {} ;
			$.each ( items , function ( k , v ) {
				if ( sd[p][v.key] === undefined ) sd[p][v.key] = [] ;
				sd[p][v.key].push ( $.extend(true,{type:'item',mode:1},v) ) ;
			} ) ;
		} ) ;
		
		var id = '.misc_data' ;
		self.renderPropertyTable ( sd , { id:id , striped:true } ) ;
		var h = $(id+" table tbody").html() ;
		h = self.renderSidebarTable ( h , tt.t('external_ids') ) ;
		$(id).html ( h ) ;
		$(id+' th').css({'min-width':''}) ;
		$(id+' td').css({'width':''}) ;
	} ,
	
	showMaps : function () {
		var self = this ;
		var i = self.wd.items[self.q] ;
		var claims = i.getClaimsForProperty ( 242 ) ; // Locator map
		var hide_maps = true ;
		
		var uses_locator_map = false ;
		if ( claims.length > 0 ) {
			hide_maps = false ;
			var s = i.getClaimTargetString ( claims[0] ) ;
			delete self.wd.items[self.q].raw.claims['P242'] ; // Prevent showing up later

			$('div.locator_map').html('') ;
			self.imgcnt++ ;
			var io = { file:s , type:'image' , id:'#imgid'+self.imgcnt , title:self.wd.items['P242'].getLabel() } ;
			io.tw = 300 ;
			io.th = 300 ;
			io.id = 'div.locator_map' ;
			io.append = true ;
			self.mm_load.push ( io ) ;
			uses_locator_map = true ;
		}


		claims = i.getClaimsForProperty ( 625 ) ; // Coordinate location
		
		if ( claims.length > 0 ) {
			hide_maps = false ;
			var v = claims[0].mainsnak.datavalue.value ;
			self.maps = [] ;
			self.do_maps = [
				[ v , 'location_map1' , 3 ] ,
				//[ v , 'location_map2' , 5 ]
			] ;
			if ( !uses_locator_map ) {
				self.do_maps.push ( [ v , 'location_map3' , 9 ] ) ;
				$('.entity .maps div.locator_map').replaceWith ( "<div id='location_map3' class='map map3'></div>" ) ;
			}
		}
		
		if ( hide_maps ) $('.entity .maps').hide() ;
		else $('.entity .maps').show() ;

	} ,

	setMap : function ( v , id , zoom ) {

		var self = this ;
		var map = new OpenLayers.Map(id);
		map.addLayer(new OpenLayers.Layer.OSM());

		var markers = new OpenLayers.Layer.Markers( "Markers" );
		map.addLayer(markers);

		var lonLat = new OpenLayers.LonLat( v.longitude , v.latitude )
			  .transform(
				new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				map.getProjectionObject() // to Spherical Mercator Projection
			  );
			  
		var marker = new OpenLayers.Marker(lonLat) ;
		markers.addMarker(marker);

		var lonLat = new OpenLayers.LonLat( v.longitude , v.latitude )
			  .transform(
				new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				map.getProjectionObject() // to Spherical Mercator Projection
			  );
		map.setCenter (lonLat, zoom);
	} ,
	

	setDocTitle : function ( s ) {
		document.title = s + ' - Reasonator' ;
	} ,
	
	addMedia : function () {
		var self = this ;
		var has_header = false ;

		var main_media = ['image','video'] ;
		var audio_files = ['audio','voice_recording','pronunciation_audio'] ;
		var other_images = ['chemical_structure','astronomic_symbol','sandbox_image','distribution_map','commemorative_plaque','place_name_sign','grave'] ;
		var special_images = ['coa','seal','wikivoyage_banner','flag_image','range_map','logo'] ;
		var media =  main_media.concat(other_images).concat(special_images).concat(audio_files) ;
		$.each ( media , function ( dummy1 , medium ) {
			$.each ( self.wd.items , function ( k , v ) {
				if ( v.isPlaceholder() || !v.isItem() ) return ;
				if ( v.getID() != self.q && medium != 'image' ) return ; // Don't show non-image media from other items; show those inline instead
				if ( v.getID() != self.q && -1 != $.inArray ( v.getID() , self.ofen_used_items_with_media ) ) return ; // No often-used images in related media
				var im = v.getMultimediaFilesForProperty ( self.P[medium] ) ;
				$.each ( im , function ( k2 , v2 ) {

					self.imgcnt++ ;
					var medium2 = medium ;
					if ( -1 != $.inArray ( medium , audio_files ) ) medium2 = 'audio' ;
					var io = { file:v2 , type:medium2 , id:'#imgid'+self.imgcnt , title:v.getLabel() , prop:'P'+(''+self.P[medium]).replace(/\D/g,'') } ;
					var medium_sidebar_div = 'main_'+medium2 ;
					
					if ( -1 != $.inArray ( medium , other_images ) ) {
						medium2 = 'image' ;
						io.type = 'image' ;
						medium_sidebar_div = 'other_sidebar_images' ;
					}
					
					if ( self.q == v.getID() && k2 == 0 ) { // Main item, first file for this property
						io.sidebar = true ;
						io.tw = 260 ;
						io.th = 400 ;
						io.id = 'div.'+medium_sidebar_div ;
						io.append = true ;
						if ( -1 != $.inArray ( medium , special_images ) ) io.type = 'image' ;
						if ( medium == 'wikivoyage_banner' ) {
							io.tw = self.banner_width ;
//							io.classes = [ 'img-responsive' ] ;
						}
					} else {
						if ( !has_header ) {
							$('#other_media_container h2.panel-title').html ( tt.t('related_media') ) ;
							$('div.all_images').append ( "<div id='related_media_meta'></div>" ) ;
							has_header = true ;
						}
						var h3 = "<div class='mythumb' id='imgid" + self.imgcnt + "'>...</div>" ;
						if ( medium2 == 'audio' ) {
							h3 = "<div>" + h3 + " <span style='font-size:9pt'>" + io.file + "</span></div>" ;
						}
						$('div.all_images').append ( h3 ) ;
						if ( self.q == v.getID() ) io.secondary_file = true ;
					}
					self.mm_load.push ( io ) ;
				} ) ;
			} ) ;
		} ) ;

		$.each ( [ 373 , 935 ] , function ( dummy , prop ) {
			if ( self.wd.items[self.q].hasClaims ( prop ) ) { // Commons cat
				if ( self.wd.items['P'+prop] === undefined ) return ;
				var ct = self.wd.items['P'+prop].getLabel()  ;
				if ( !has_header ) {
					$('#other_media_container h2.panel-title').html ( tt.t('related_media') ) ;
					$('div.all_images').append ( "<div id='related_media_meta'></div>" ) ;
					has_header = true ;
				}
				var c = self.wd.items[self.q].getClaimsForProperty ( prop ) ;
				$.each ( c , function ( k , v ) {
					var s = self.wd.items[self.q].getClaimTargetString ( v ) ;
					var h = "<div>" + ct + " : <a target='_blank' title='"+ct+"' class='external' href='//commons.wikimedia.org/wiki/" ;
					if ( prop == 373 ) h += 'Category:' ;
					h += escattr(s)+"'>" + s + "</a></div>" ;
					$('#related_media_meta').append ( h ) ;
				} ) ;
			}
		} ) ;
		
		self.checkWikipediaImages() ;
	} ,
	
	/*
	Parameters:
	- sd : { prop : { q : 1/2 , ... } , ... }
	       q:2 means "of"
	*/
	renderPropertyTable : function ( sd , o ) {
		var self = this ;
		var h = '' ;
		var no = $.extend(true, {}, o);
		no.gender = true ;
		no.desc = true ;
		no.q_desc = true ;
		var internal = (o.internal||false) ;
		var sd_keys = [] ;
		$.each ( sd , function ( k , v ) { sd_keys.push ( k ) } ) ;
		sd_keys = sd_keys.sort () ;
		
		function getTimeFromQualifier ( i ) {
			var qa = (((i||[])[0]||{}).qualifiers||{}) ;
			var qta = ((qa.P585||{})[0]||{}).time ; // Point in time
			if ( undefined === qta ) qta = ((qa.P580||{})[0]||{}).time ; // start time
			return qta||'' ;
		}
		
		$.each ( sd_keys , function ( dummy , op ) {
			var qs = sd[op] ;
			var p = String(op).replace(/\D/g,'') ;
			var ql = [] ;
			$.each ( qs , function ( k , v ) {
				$.each ( v , function ( k2 , v2 ) {
					ql.push ( [ v2 ] ) ;
				} ) ;
			} ) ;

			var num_rows = 0 ;
			$.each ( ql , function ( row , subrow ) { num_rows += subrow.length } ) ;
			
			self.table_block_counter++ ;
			var block_id = 'table_block_'+ self.table_block_counter ;
			var collapse = num_rows >= self.collapse_item_list ;
			var rows = num_rows + (collapse?1:0) ;
			h += "<tr><th style='min-width:20%' valign='top' rowspan='" + rows + "'>" ;
			h += self.getItemLink ( { type:'item',q:'P'+p } , { desc:true } ) ;
			h += "</th>" ;
			var row = 0 ;
			
			if ( o.sort_by_qualifier_time ) {
				ql = ql.sort ( function ( a , b ) {
					var qta = getTimeFromQualifier ( a ) ;
					var qtb = getTimeFromQualifier ( b ) ;
					if ( qta == '' && qtb == '' ) {
						qta = a[0].q ;
						qtb = b[0].q ;
					}
					return (qta==qtb)?0:(qta<qtb?-1:1) ;
				} ) ;
			}
			
			$.each ( ql , function ( dummy , subrow ) {
//				no.add_desc = true ;
				$.each ( subrow , function ( dummy , cq ) {
					if ( row > 0 ) h += "<tr>" ;
					h += "<td name='" + block_id + "' style='width:100%" ;
					if ( collapse ) h += ";display:none" ;
					if ( p == 225 ) h += ";font-style:italic" ;
					h += "'>" ;
					if ( cq.mode == 2 ) h += tt.t('of')+"&nbsp;" ;
					h += self.getItemLink ( cq , $.extend({},no,{main_prop:p}) ) ; // { internal:internal,desc:true,gender:true,q_desc:true }
					h += "</td></tr>" ;
					row++ ;
//					no.add_desc = false ;
				} ) ;
			} ) ;
			if ( collapse ) {
				h += "<tr><td style='width:100%'>" ;
				h += num_rows + " items. " ;
				h += "<a href='#' name='"+block_id+"' onclick='reasonator.toggleItems(\"" + block_id + "\");return false'>"+tt.t('show_items')+"</a>" ;
				h += "<a href='#' name='"+block_id+"' style='display:none' onclick='reasonator.toggleItems(\"" + block_id + "\");return false'>"+tt.t('hide_items')+"</a>" ;
				h += "</td></tr>" ;
			}
		} ) ;
		if ( h != '' ) {
			var h2 = "<table" ;
			if ( o.striped ) h2 += " class='table table-striped table-condensed'" ;
			else h2 += " class='table table-condensed'" ;
			h2 += ">" + h + "</table>" ;
			h = h2 ;
		}

		if ( typeof o.title != 'undefined' && h != '' ) {
			var panel = { title:o.title , collapsible:true } ;
			h = reasonator.wrapPanel ( h , panel ) ;
//			h = "<h2>" + o.title + "</h2>" + h ;
		}
		$(o.id).html(h) ;
	} ,
	
	toggleItems : function ( block_id ) {
		$('a[name="'+block_id+'"]').toggle() ;
		$('td[name="'+block_id+'"]').toggle() ;
	} ,

	addOther : function () {
		var self = this ;
		var sd = {} ;
		var ignore = {} ;
		$.each ( self.P , function ( k , v ) { ignore['P'+v] = 1 } ) ;
		
		var q = self.q ;
		var item = self.wd.items[q] ;
		var props = item.getPropertyList() ;
		$.each ( props , function ( dummy , p ) {
			if ( undefined !== ignore[p] ) return ;
			var ci = item.getClaimObjectsForProperty ( p ) ;
			$.each ( (ci||[]) , function ( dummy2 , ti ) {
				if ( undefined === sd[p] ) sd[p] = {} ;
				if ( sd[p][ti.key] === undefined ) sd[p][ti.key] = [] ;
				sd[p][ti.key].push ( $.extend(true,{p:p,mode:1},ti) ) ;
			} ) ;
		} ) ;
		self.renderPropertyTable ( sd , { id:'.other' , title:tt.t('other_properties') , striped:true , add_desc:true , audio:true , video:true } ) ;
	} ,
	

	addBacklinks : function ( callback ) {
		var self = this ;
		var sd = {} ;
		var ignore = {} ;
		$.each ( self.P , function ( k , v ) { ignore['P'+v] = 1 } ) ;
		$.each ( self.wd.items , function ( q , item ) {
			if ( !item.isItem() ) return ;
			if ( q == self.q ) return ;
			var props = item.getPropertyList() ;
			$.each ( props , function ( dummy , p ) {
				if ( undefined !== ignore[p] ) return ;
				var ci = item.getClaimObjectsForProperty ( p ) ;
				if ( ci.length == 0 ) return ;
				$.each ( ci , function ( dummy2 , ti ) {
					if ( ti.key != self.q ) return ;
					if ( undefined === sd[p] ) sd[p] = {} ;
					var o = {type:'item',mode:1,q:item.getID(),key:item.getID(),qualifiers:ti.qualifiers} ; // 
					self.addToLoadLater ( item.getID() , true ) ;
					if ( sd[p][q] === undefined ) sd[p][q] = [] ;
					sd[p][q].push ( o ) ;
				} ) ;
			} ) ;
		} ) ;
		self.wd.getItemBatch ( self.to_load , function () {
			self.renderPropertyTable ( sd , { id:'.backlinks' , title:tt.t('from_related_items') , striped:true , add_desc:true , audio:true , video:true , sort_by_qualifier_time:true } ) ;
			if ( callback ) callback() ;
//			self.addHoverboxes ( '.backlinks' ) ;
		} ) ;
	} ,
	
	// Sorts an array of binary arrays, and returns an array of only the second elements
	sort12collapse : function ( arr ) {
		function mysort ( a , b ) {
			if ( a[0].toLowerCase() < b[0].toLowerCase() ) return -1 ;
			if ( a[0].toLowerCase() > b[0].toLowerCase() ) return 1 ;
			if ( a[1].toLowerCase() < b[1].toLowerCase() ) return -1 ;
			if ( a[1].toLowerCase() > b[1].toLowerCase() ) return 1 ;
			return 0 ;
		}
		var arr2 = arr.sort ( mysort ) ;
		var ret = [] ;
		$.each ( arr2 , function ( k , v ) { ret.push ( v[1] ) } ) ;
		return ret ;
	} ,

	showSocialMedia : function () {
		var self = this ;
		var h = [] ;
		var i = self.wd.items[self.q] ;
		var p = 553 ;
		if ( !i.hasClaims(p) ) return ;

		var claims = i.getClaimsForProperty ( p ) ;
		self.P.social_media = p ;
		$.each ( claims , function ( dummy , c ) {
			var s ;
			var url = '' ;
			if ( c.qualifiers === undefined || c.qualifiers['P554'] === undefined ) return ;
			s = c.qualifiers['P554'][0].datavalue.value ;
			var smtype = c.mainsnak.datavalue.value['numeric-id'] ;
			var id_type = self.wd.items['Q'+smtype].getLabel();
			
			if ( typeof self.sm_url[smtype] != 'undefined' ) {
				url = self.sm_url[smtype].replace ( /\$1/g , encodeURIComponent(s) ) ;
			}
			
			if ( undefined === s ) return ;
			
			s = s.replace ( /-/g , '-&#8203;' ) ;
			
			var h2 = "<tr><td><a target='_blank' class='wikidata' href='//www.wikidata.org/wiki/Q"+smtype+"'>" + id_type + "</a>&nbsp;</td><td>" ;
			if ( url == '' ) h2 += s ;
			else h2 += "<a target='_blank' href='" + url + "' class='external'>" + s + "</a>" ;
			h2 += "</td></tr>" ;
			h.push ( [ id_type , h2 ] ) ;
		} ) ;

		if ( h.length > 0 ) {
			h = self.sort12collapse ( h ) ;
			h = self.renderSidebarTable ( h.join('') , tt.t('social_media') ) ;
			$('.social_media').html ( h ) ;
		}
	} ,
	
	
	showExternalIDs : function () {
		var self = this ;
		var h = [] ;
		var i = self.wd.items[self.q] ;
		let is_researcher = false ;
		let is_scholarly_article = self.wd.items[self.q].hasClaimItemLink('P31','Q13442814');
		$.each ( self.extURLs , function ( k , v ) {
			var p = self.urlid2prop[k] ;
			if ( p === undefined ) return ;

			var claims = i.getClaimsForProperty ( p ) ;
			if ( claims.length > 0 ) self.P[k] = p ;
			$.each ( claims , function ( dummy , c ) {
				var id_type = k ;
				var s ;
				var url = '' ;
				s = i.getClaimTargetString ( c ) ;
				url = v.replace(/\$1/g,encodeURIComponent(s)) ;
				if ( undefined === s ) return ;
				
				if ( p == 1651 ) {
					var key = encodeURIComponent(s) ;
					var src = 'https://i.ytimg.com/vi/'+key+'/sddefault.jpg' ;
//					var h2 = "<img src='" + src + "' />" ;
					var h2 = "<div class='youtube' style='background-image: url(\"https://i.ytimg.com/vi/"+key+"/sddefault.jpg\");' key='"+key+"' title='" + tt.t('play_youtube') + "'>" ;
					h2 += "<img src='https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Logo_Youtube.svg/50px-Logo_Youtube.svg.png' class='proprietary_logo' />" ;
					h2 += "</div>" ;
					$('div.main_video').append ( h2 ) ;
					return ;
				}
				if ( $.inArray ( p , self.P_researcher ) !== -1 ) is_researcher = true ;
				
				s = s.replace ( /-/g , '-&#8203;' ) ;
				
				
				var h2 = "<tr><td><a target='_blank' class='wikidata' href='//www.wikidata.org/wiki/Property:P"+p+"'>" + id_type + "</a>&nbsp;</td><td>" ;
				if ( url == '' ) h2 += s ;
				else h2 += "<a target='_blank' href='" + url + "' class='external'>" + s + "</a>" ;
				h2 += "</td></tr>" ;
				h.push ( [ id_type , h2 ] ) ;
			} ) ;
		} ) ;

		if ( is_researcher ) {
			let url = 'https://tools.wmflabs.org/scholia/author/' + self.q ;
			let h2 = "<tr><td>Scholia</td><td>" ;
			h2 += "<a target='_blank' href='" + url + "' class='external'>Scholia</a>" ;
			h2 += "</td></tr>" ;
			h.push ( [ 'Scholia' , h2 ] ) ;
		}

		if ( is_scholarly_article ) {
			let url = 'https://tools.wmflabs.org/scholia/work/' + self.q ;
			let h2 = "<tr><td>Scholia</td><td>" ;
			h2 += "<a target='_blank' href='" + url + "' class='external'>Scholia</a>" ;
			h2 += "</td></tr>" ;
			h.push ( [ 'Scholia' , h2 ] ) ;
		}

		$('div.youtube').click ( function () {
			var o = $(this) ;
			var key = o.attr('key') ;
			var url = "https://www.youtube.com/watch?v="+key ;
			window.open(url, '_blank');
			return false ;
		} ) ;

		if ( h.length > 0 ) {
			h = self.sort12collapse ( h ) ;
			h = self.renderSidebarTable ( h.join('') , tt.t('external_sources') ) ;
			$('.external_ids').html ( h ) ;
		}
		
		self.showSocialMedia() ;
	} ,
	
	renderSidebarTable : function ( h , title ) {
		var self = this ;
		if ( typeof h == 'undefined' ) h = '' ;
		var ret = "<table class='sidebar-table table-striped'><tbody>" + h + "</tbody></table>" ;
		ret = self.wrapPanel ( ret , { title:title , collapsible:true } ) ;
		return ret ;
	} ,


	showWebsites : function () {
		var self = this ;
		var h = [] ;
		var i = self.wd.items[self.q] ;
		$.each ( self.P_websites , function ( k , v ) {
			var claims = i.getClaimsForProperty ( v ) ;
			$.each ( claims , function ( dummy , c ) {
				var s = i.getClaimTargetString ( c ) ;
				if ( undefined === s ) return ;
				var url = s ;
				var h2 = "<tr><td><a target='_blank' href='" + url + "' class='external'>" + self.wd.items['P'+v].getLabel() + "</a></td></tr>" ;
				h.push ( h2 ) ;
			} ) ;
		} ) ;
		
		if ( h.length == 0 ) return ;

		h = self.renderSidebarTable ( h.join('') , tt.t('external_sites') ) ;
//		h = "<table class='sidebar-table table-striped'><thead><th>"+tt.t('external_sites')+"</th></thead><tbody>" + h.join('') + "</tbody></table>" ;
		$('.websites').html ( h ) ;
	} ,
	
	addSitelinks : function () {
		var self = this ;
		var i = self.wd.items[self.q] ;
		var links = i.getWikiLinks() ;
		var hadthat = {} ;

		var projects = [ 'current' , 'mainwp' , 'commons' , 'wikisource' , 'wikivoyage' , 'wikiquote' , 'wiki' ] ;
		var groups = {
			current : { title:tt.t('sl_current') , server:'wikipedia.org' , sites:[] } ,
			
			mainwp : { title:tt.t('sl_big_wp') , server:'wikipedia.org' , sites:[] } ,
			commons : { title:tt.t('sl_commons') , server:'wikimedia.org' , sites:[] } ,
			wikisource : { title:tt.t('sl_wikisource') , server:'wikisource.org' , sites:[] } ,
			wikiquote : { title:tt.t('sl_wikiquote') , server:'wikiquote.org' , sites:[] } ,
			wikivoyage : { title:tt.t('sl_wikivoyage') , server:'wikivoyage.org' , sites:[] } ,
			wiki : { title:tt.t('sl_other') , server:'wikipedia.org' , sites:[] } ,
		} ;
		
		var lp = (self.params.lang||'en').split(',');
		$.each ( lp , function ( dummy , l ) {
			var site = l + 'wiki' ;
			if ( undefined === links[site] || undefined !== hadthat[site] ) return ;
			hadthat[site] = true ;
			groups.current.sites.push ( { code:l , page:links[site].title } ) ;
		} ) ;
		

		if ( undefined !== links['commonswiki'] ) {
			$.each ( links , function ( site , dummy ) {
				if ( site != 'commonswiki' ) return ;
				hadthat[site] = true ;
				groups.commons.sites.push ( { code:'commons' , page:links[site].title } ) ;
			} ) ;
		}
		
		$.each ( self.wd.main_languages , function ( dummy , l ) {
			var site = l + 'wiki' ;
			if ( undefined === links[site] || undefined !== hadthat[site] ) return ;
			hadthat[site] = true ;
			groups.mainwp.sites.push ( { code:l , page:links[site].title } ) ;
		} ) ;
		
		$.each ( projects , function ( dummy , project ) {
			if ( project == 'mainwp' || project == 'current' ) return ;
			var re = new RegExp("^(.+)"+project+"$") ;
			$.each ( links , function ( site , dummy ) {
				var m = re.exec ( site ) ;
				if ( m == null ) return ; // Wrong project
				if ( undefined === links[site] || undefined !== hadthat[site] ) return ;
				hadthat[site] = true ;
				groups[project].sites.push ( { code:m[1] , page:links[site].title } ) ;
			} ) ;
		} ) ;
		
//		var h = "<table class='sidebar-table table-striped'>" ; // style='width:100%' border=0 cellspacing=0 cellpadding=1 
//		h += "<thead><th colspan=2>"+tt.t('wikimedia_projects')+"</th></thead><tbody>" ;
		
		var h = '' ;
		
		$.each ( projects , function ( dummy , project ) {
			if ( groups[project].sites.length == 0 ) return ;

      //console.log( project );

			if ( project != 'current' ) {
				groups[project].sites = groups[project].sites.sort ( function ( a , b ) {
					return ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0));
				} ) ;
			} ;
			h += "<tr><th colspan='2'>" + groups[project].title + "</th></tr>" ;
			$.each ( groups[project].sites , function ( dummy , site ) {
				h += "<tr><td>" + site.code + "</td>" ;

        // CONZEPT PATCH
        if ( project === 'current' || project === 'mainwp' || project === 'wiki' ){ // wikipedia -> conzept

          const wikipedia_url = CONZEPT_WEB_BASE + '/app/wikipedia/?t=' + encodeURIComponent( site.page ) + '&l=' + site.code + '&qid=' + qid;
          //const conzept_url = '/explore/' + encodeURIComponent( site.page ) + '?l=' + site.code + '&t=wikipedia-qid&i=' + qid ;

				  h += '<td><a href="javascript:void(0)" onclick="gotoUrl( &quot;' + wikipedia_url + '&quot;, false )" onauxclick="gotoUrl( &quot;' + wikipedia_url + '&quot;, true )" class="wikipedia" target="_blank">' + site.page + '</a></td></tr>';

				  //h += '<td><a href="' + conzept_url + '" class="wikipedia" target="_blank">' + site.page + '</a></td></tr>';

        }
        else { // non-wikipedia link

				  h += "<td><a href='//" + site.code + "."+groups[project].server+"/wiki/" + escattr(site.page) + "' class='wikipedia' target='_blank'>" + site.page + "</a></td></tr>" ;

        }

			} ) ;
		} ) ;

//		h += "</tbody></table>" ;
		h = self.renderSidebarTable ( h , tt.t('wikimedia_projects') ) ;
		$('div.sitelinks').html ( h ) ;
	} ,

	getItemLinks : function ( init_q , o ) {
		var self = this ;
		var ret = [] ;
		if ( o === undefined ) return ret ;
		var q = self.wd.convertToStringArray ( init_q , 'Q' ) [0] ;
		if ( self.wd.items[q] === undefined ) return ret ;
		var ql = self.wd.items[q].getClaimObjectsForProperty ( o.p ) ;
		$.each ( ql , function ( dummy , cq ) {
			ret.push ( self.getItemLink ( cq , o ) ) ;
		} ) ;
		return ret ;
	} ,
	
	getQlink : function ( q , o ) {
		var self = this ;
		if ( o === undefined ) o = {} ;
		if ( undefined === q ) return "UNIDENTIFIED ITEM" ;
		var qnum = q.replace(/\D/g,'') ;
		var item = self.wd.items[q] ;
		if ( item === undefined ) {
			return "ITEM NOT LOADED : " + q ;
		}
		var url = item.getURL() ;
		
		var internal = o.internal ;
		if ( self.wd.items[q].isItem() ) {
			internal = true ;
		}
		if ( o.force_external ) internal = false ;
		
		var h = '' ;
		if ( o.gender ) {
			if ( item.gender == 'M' ) h += '♂&nbsp;' ;
			else if ( item.gender == 'F' ) h += '♀&nbsp;' ;
			else if ( item.gender !== undefined ) h += '?&nbsp;' ;
		}
		
		var label = o.ucfirst ? ucFirst(item.getLabel()) : item.getLabel() ;
		if ( o.label !== undefined ) label = o.label ;
		if ( label == q ) { // No "common" label, pick one
			if ( undefined !== item.raw && undefined !== item.raw.labels ) {
				$.each ( item.raw.labels , function ( k , v ) { label = v.value ; return false } ) ;
			}
		}

		if ( q == self.q ) {
			h += "<b>" + self.escapeHTML(label) + "</b>" ;
		} else {
			var classes = [] ;
			h += "<a" ;
			if ( internal ) {
				classes.push ( 'q_internal' ) ;
				h += " q='"+qnum+"' href='?" + self.getLangParam() + "&q=" + qnum + "'" ;
			} else {
				classes.push ( 'wikidata' ) ;
				h += " target='_blank' href='" + url + "'" ;
			}
			if ( o.rank !== undefined ) classes.push ( 'rank_' + o.rank ) ;
			var title = [] ;
			if ( o.desc ) { title.unshift ( item.getDesc() ) ; if ( title[0] == '' ) title.shift() }
			if ( o.q_desc ) { title.push ( q ) }
			if ( title.length > 0 ) h += " title='" + title.join('; ') + "'" ;
		
			if ( self.mark_missing_labels ) {
				var dl = item.getLabelDefaultLanguage() ;
				var param_lang = self.getMainLang() ;//(self.params.lang||'en').split(',')[0] ;
				if ( self.hasNoLabelInMainLanguage ( item ) ) {
					classes.push ( 'missing_label' ) ;
				}
			}
			if ( classes.length > 0 ) h += " class='" + classes.join ( ' ' ) + "'" ;
			h += ">" ;
			h += self.escapeHTML(label) ;
			h += "</a>" ;
		}
		
		
		if ( internal && !self.use_hoverbox ) {
			h += " <span style='font-size:0.6em'><a href='" + url + "' class='wikidata' target='_blank'>WD</a></span>" ;
		}
		
		if ( o.add_desc ) {
			var d = item.getDesc()  ;
			if ( d != '' ) h += " <span class='inline_desc'>" + d + "</span>" ;
		}
		if ( o.show_q ) h += " <small class='qnumber'>(" + q + ")</small>" ;

		var had_video = false ;
		if ( o.video ) {
			var files = item.getMultimediaFilesForProperty ( 10 ) ;
			if ( files.length > 0 ) h += "<br/>" ;
			$.each ( files , function ( k , v ) {
				had_video = true ;
				self.imgcnt++ ;
				h += " <div style='display:inline' id='imgid" + self.imgcnt + "'></div>" ;
				self.mm_load.push ( { file:v , type:'video' , id:'#imgid'+self.imgcnt } ) ;
			} ) ;
		}

		if ( o.audio ) {
			var files = item.getMultimediaFilesForProperty ( 51 ) ;
			if ( files.length > 0 && !had_video ) h += "<br/>" ;
			$.each ( files , function ( k , v ) {
				self.imgcnt++ ;
				h += " <div style='display:inline' id='imgid" + self.imgcnt + "'></div>" ;
				self.mm_load.push ( { file:v , type:'audio' , id:'#imgid'+self.imgcnt } ) ;
			} ) ;
		}
		
		return h ;
	} ,
	
	pad : function (number, length) {
		var str = '' + number;
		while (str.length < length) {
			str = '0' + str;
		}
		return str;
	} ,
	
	getItemLink : function ( i , o ) {
		var self = this ;
		var ret = "<div style='display:inline'>" ;
		if ( o === undefined ) o = {} ;

		if ( i.type == 'string' ) {
			var h2 ;
			if ( i.p == 'P373' ) h2 = "<a target='_blank' title='Category on Commons' class='external' href='//commons.wikimedia.org/wiki/Category:"+escattr(i.s)+"'>" + self.escapeHTML(i.s) + "</a>" ; // Commons cat
			else if ( typeof self.wd.items[i.p]!='undefined' && self.wd.items[i.p].hasClaims('P3303') ) {
				let pattern = self.wd.items[i.p].getFirstStringForProperty('P3303') ;
				let url = pattern.replace ( /\$1/ , encodeURIComponent(i.s) ) ;
				h2 = "<a target='_blank' class='external' href='"+url+"'>"+self.escapeHTML(i.s)+"</a>" ;
			} else h2 = self.escapeHTML(i.s) ;
			if ( i.rank !== undefined ) h2 = "<span class='rank_" + i.rank + "'>" + h2 + "</span>" ;
			ret += h2 ;
		} else if ( i.type == 'item' ) {
			o.rank = i.rank ;
			ret += self.getQlink ( i.q , o ) ;
		} else if ( i.type == 'time' ) {
			var pre = i.time.substr(0,1) == '+' ? 1 : -1 ;
			var dp = i.time.substr(1).split(/[-T:Z]/) ;

			var year = dp[0]*pre ;
			var month = self.pad ( dp[1] , 2 ) ;
			var day = self.pad ( dp[2] , 2 ) ;
			
			var show = i.time ; // Fallback
			var start , end ;
			if ( i.precision <= 9 ) {
				show = year ;
				start = show + '-00-00' ;
				end = show + '-13-32' ;
			} else if ( i.precision == 10 ) {
				show = year + '-' + month ;
				start = show + '-00' ;
				end = show + '-32' ;
			} else if ( i.precision == 11 ) {
				show = year + '-' + month + '-' + day ;
				start = show ;
				end = show ;
			}
			
			if ( undefined !== start && undefined !== end ) {
				show = self.getSelfLink ( { date:show , title:tt.t('calendar_for').replace(/\$1/,show) , label:show } ) ;
			}
			
			if ( i.rank !== undefined ) show = "<span class='rank_" + i.rank + "'>" + show + "</span>" ;
			ret += show ;

		} else if ( i.type == 'quantity' ) {
			var h2 = self.renderQuantity ( i ) ;
			if ( i.rank !== undefined ) h2 = "<span class='rank_" + i.rank + "'>" + h2 + "</span>" ;
			ret += h2 ;

		} else if ( i.type == 'monolingualtext' ) {
			var h2 = self.renderMonolingualText ( i ) ;
			if ( i.rank !== undefined ) h2 = "<span class='rank_" + i.rank + "'>" + h2 + "</span>" ;
			ret += h2 ;

		} else { // also add in wikidata.js getObject ... something...
			//console.log ( "UNKNOWN : " + i.type + ' / ' ) ;
			//console.log ( i ) ;
			ret += "<i>unknown/no value</i>" ;
		}
		
		var qual = [] ;
		$.each ( (i.qualifiers||[]) , function ( qp , qv ) {
			var prop = { q:qp,type:'item' } ;
			var qpl = self.getQlink(qp) ;//self.getItemLink(qp) ;
			$.each ( qv , function ( dummy , v ) {
				var qi = self.getItemLink(v) ;
				var al = '' ;
				if ( typeof o.main_prop != 'undefined' ) {
					if ( typeof v.q != 'undefined' ) {
						// TODO SPARQL
//						al = " [<a title='"+tt.t('show_same_qualifier_list')+"' href='//tools.wmflabs.org/wikidata-todo/autolist.html?q=claim%5B"+o.main_prop.replace(/\D/g,'')+"%5D%7Bclaim%5B"+qp.replace(/\D/g,'')+"%3A"+v.q.replace(/\D/g,'')+"%5D%7D' target='_blank' class='external'>AL</a>]" ;
					} else if ( typeof v.time != 'undefined' ) {
						// TODO SPARQL
						var base = self.getFormatDate ( v ) ;
						var from = base + '0000-00-00'.substr(base.length);
						var to = base + '9999-13-32'.substr(base.length);
//						al = " [<a title='"+tt.t('show_same_qualifier_list')+"' href='//tools.wmflabs.org/wikidata-todo/autolist.html?q=claim%5B"+o.main_prop.replace(/\D/g,'')+"%5D%7BBETWEEN%5B"+qp.replace(/\D/g,'')+"%2C"+from+"%2C"+to+"%5D%7D' target='_blank' class='external'>AL</a>]" ;
					} else {
//						console.log ( v ) ;
					}
				}
				qual.push ( qpl+' : '+qi + al) ;
			} ) ;
		} ) ;
		if ( qual.length > 0 ) ret += "<br/><div style='padding-left:10px;font-size:80%'><div>" + qual.join('</div><div>') + "</div></div>" ;
		
		ret += "</div>" ;
		return ret ;
	} ,
	
	renderMonolingualText : function ( i ) {
		return this.escapeHTML(i.text) + "&nbsp;<small>[" + i.language + "]</small>" ;
	} ,
	
	renderQuantity : function ( i ) {
		var ret = 'UNKNOWN QUANTITY' ;
		i.amount *= 1 ;
		if ( typeof i.upperBound == 'undefined' ) i.upperBound = i.amount ;
		else i.upperBound *= 1 ;
		if ( typeof i.lowerBound == 'undefined' ) i.lowerBound = i.amount ;
		else i.lowerBound *= 1 ;
		
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
	
	getSelfURL : function ( o ) {
		var self = this ;
		var q = o.q === undefined ? self.q : o.q ;
		var lang = o.lang === undefined ? self.getMainLang() : o.lang ;
		var url = '?' ;
		if ( o.date !== undefined ) {
//			label = o.date ;
			url += "date=" + o.date ;
		} else {
//			if ( label == '' ) label = self.wd.items[q].getLabel() ;
//			if ( label == '' ) title = q ;
			url += "q=" + q ;
		}
		url += self.getLangParam(o.lang) ;
		return url ;
	} ,
	
	getSelfLink : function ( o ) {
		var self = this ;
		var q = o.q === undefined ? self.q : o.q ;
		var lang = o.lang === undefined ? self.getMainLang() : o.lang ;
		var label = o.label||'' ;
		var title = o.title||'' ;
		var cl = '' ;
		var url = self.getSelfURL(o) ;
		
		return "<a class='"+cl+"' title='"+title+"' href='"+url+"'>"+self.escapeHTML(label)+"</a>" ;
	} ,

	multimediaLazyLoad : function ( o ) {
		var self = this ;
		$(o.id).html('') ;
		$.getJSON ( '//commons.wikimedia.org/w/api.php?callback=?' , {
			action : 'query' ,
			titles : 'File:' + o.file ,
			prop : 'imageinfo' ,
			iiurlwidth : o.tw||self.square_thumb_size ,
			iiurlheight : o.th||self.square_thumb_size ,
			iiprop : 'url|size' ,
			format : 'json'
		} , function ( data ) {
			$.each ( data.query.pages , function ( k , v ) {
				if ( undefined !== o.id ) {
					var h ;
					if ( undefined === v.missing ) {
						var maxw = o.tw || 500 ;
						if ( o.type == 'video' ) {
							var url = v.imageinfo[0].url ;
							h = "<video controls style='margin-top:1px;margin-bottom:1px;max-width:"+maxw+"px'><source src='" + url + "' type='video/ogg'><small><i>Your browser <s>sucks</s> does not support HTML5 video.</i></small></video>" ;
						} else if ( o.type == 'audio' ) {
							var url = v.imageinfo[0].url ;
							var type = 'ogg' ;
							if ( null != v.title.match(/\.flac$/i) ) type = 'flac' ;
							if ( type == 'flac' ) { // Hardcoded exception
								h = "<a href='" + url + "' target='_blank'>"+tt.t('download_file')+"</a>" ;
							} else {
								h = "<audio controls style='max-width:"+maxw+"px'><source src='" + url + "' type='audio/"+type+"'><small><i>Your browser <s>sucks</s> does not support HTML5 audio.</i></small></audio>" ;
								if ( o.sidebar ) h = '<div>' + self.getItemLink ( { type:'item',q:o.prop } , { desc:true } ) + "</div>" + h ;
							}
						} else if ( o.type == 'image' ) {
							h = "<img border=0 width='"+v.imageinfo[0].thumbwidth+"px' height='"+v.imageinfo[0].thumbheight+"px' src='" + v.imageinfo[0].thumburl + "' " ;
							if ( typeof o.classes != 'undefined' ) h += "classes='" + o.classes.join(' ') + "' " ;
							if ( o.title !== undefined ) h += "title='" + escattr(o.title) + "' " ; 
							h += "/>" ;
							h = "<a target='_blank' href='" + v.imageinfo[0].descriptionurl + "'>" + h + "</a>" ;
						}
					} else {
						h = '' ;
					}
					$(o.id).html ( h ) ;
					setTimeout ( function(){self.adjustSitelinksHeight()} , 100 ) ;
				}
			} ) ;
		} ) ;
	} ,

	getRelatedEntities : function ( q , callback ) {
		var self = this ;
		$.getJSON ( '//www.wikidata.org/w/api.php?callback=?' , {
			action : 'query' ,
			list : 'backlinks' ,
			bltitle : q ,
			blnamespace : 0 ,
			bllimit : 500 ,
			format : 'json'
		} , function ( data ) {
//			var ql = [] ;
			$.each ( data.query.backlinks||[] , function ( k , v ) {
				var cq = 'Q' + v.title.replace(/\D/g,'') ;
				self.to_load.push ( cq ) ;
			} ) ;
			callback() ;
//			self.wd.loadItems ( ql , { finished : function ( x ) { callback() } } , 0 ) ;
			
		} ) ;
	} ,
	
	
	find : function ( s ) {
		var self = this ;
		var offset = self.params.offset || 0 ;
		$('#find').val ( s ) ;
		self.setRTL() ;
		$.getJSON ( '//www.wikidata.org/w/api.php?callback=?' , {
			action : 'query' ,
			list : 'search' ,
			sroffset : offset ,
			srsearch : s ,
			srnamespace : 0 ,
			srlimit : 50 ,
			format : 'json'
		} , function ( data ) {
			$('#main_content').show() ;
			$('#main_content_sub').show() ;
		
			var items = [] ;
			$.each ( data.query.search||[] , function ( k , v ) {
				items.push ( v.title ) ;
			} ) ;
			
			if ( items.length == 0 ) {
				$('#main').html ( tt.t("no_search_results")+" <i>"+s+"</i>" ) ;
				return ;
			}

			self.wd.getItemBatch ( items , function () {
				var tw = 32 ;
				var thumbs = [] ;
				var qs = [] ;
				var cnt = offset ;
				var h = "<div><table id='search_results' class='table-condensed table-striped' style='width:100%'>" ;
				h += "<tbody>" ;
				$.each ( data.query.search||[] , function ( k , v ) {
					cnt++ ;
					var q = v.title ;
					qs.push ( q ) ;
					h += "<tr><th style='"+(self.isRTL?'':'text-align:right')+"'>" + cnt + "</th>" ;
					h += "<td>" ;
					h += self.getQlink ( q , {} ) ;
					if ( self.showSearchImages ) {
//						h += "<td>" ;
						if ( self.wd.items[q].hasClaims('P18') ) {
							var id = 'search_thumb_' + thumbs.length ;
							var images = self.wd.items[q].getMultimediaFilesForProperty('P18') ;
							thumbs.push ( { id:id , file:images[0] } ) ;
							h += " <img id='"+id+"' />" ;
						}
//						h += "</td>" ;
					}
					h += "</td>" ;
					h += "<td><div id='sr_ad"+q+"'></div><div id='sr_d"+q+"'></div></td>" ;
					h += "</tr>" ;
				} ) ;
				h += "</tbody></table></div>" ;
			
				if ( offset != 0 || data.query.searchinfo.totalhits > cnt ) {
					var x = [] ;
//					var l = self.params.lang || 'en' ;
					for ( var i = 0 ; i < data.query.searchinfo.totalhits ; i += 50 ) {
						var t = (i+50>data.query.searchinfo.totalhits) ? data.query.searchinfo.totalhits : i+50 ;
						t = (i+1) + "&ndash;" + t ;
						if ( i != offset ) t = "<a href='?"+self.getLangParam()+"&offset="+i+"&find="+escape(s)+"'>" + t + "</a>" ;
						else t = "<b>" + t + "</b>" ;
						x.push ( t ) ;
					}
					h += "<div>" + x.join(' | ') + "</div>" ;
				}
			
				$('#main').html ( h ) ;
				$('#search_results td,#search_results th').css({'text-align':''}) ;
			
				self.wd.loadItems ( qs , {
					finished : function ( x ) {
						$.each ( qs , function ( dummy , q ) {
							var i = self.wd.getItem ( q ) ;
							if ( undefined === i ) return ;
							$('#sr_q'+q).text ( i.getLabel() ) ;
							$('#sr_d'+q).text ( i.getDesc(self.getMainLang()) ) ;
							//if ( i.getDesc() == '' ) 
							wd_auto_desc.loadItem ( q , { target:$('#sr_ad'+q) , reasonator_lang:(self.params.lang||'en') , links:'reasonator_local' } ) ;
						} ) ;
					}
				} , 0 ) ;
			
				self.addHoverboxes () ;
				
				$.each ( thumbs , function ( k , v0 ) {
					$.getJSON ( '//commons.wikimedia.org/w/api.php?callback=?' , {
						action:'query',
						titles:'File:'+v0.file,
						prop:'imageinfo',
						format:'json',
						iiprop:'url',
						iiurlwidth:tw*2,
						iiurlheight:tw
					} , function ( d ) {
						if ( d.query === undefined || d.query.pages === undefined ) return ;
						$.each ( d.query.pages , function ( dummy , v ) {
							if ( v.imageinfo === undefined ) return ;
							var ii = v.imageinfo[0] ;
							$('#'+v0.id).attr ( { src:ii.thumburl } ) ;
						} )
					} )
				} ) ;
				
			} ) ;
		} ) ;
	} ,
	
	showGeneawiki : function () {
		var self = this ;
		
		var lang = self.getMainLang() ;
		var id = 'geneawiki' ;
		if ( $('#'+id).is(':visible') ) {
			$('#'+id).toggle() ;
			$('#'+id+'_status').toggle() ;
		} else {
			if ( undefined === self.gw ) {

				$.getScript ( 'geneawiki2/jquery-svgpan.js' , function () {
					$.getScript ( 'geneawiki2/gw.js' , function () {
						self.gw = new GeneaWiki ( id ) ;
						self.gw.languages.unshift ( lang ) ;
						$('#'+id).show() ;
						$('#'+id+'_status').show() ;
						self.gw.status_id = id+'_status' ;
						self.gw.load ( self.q , function () {
							$('#'+id+' svg').css ( { width : '100%' } ) ;
							$('#'+id+' a').each ( function ( dummy , o ) {
								var m = $(o).attr('xlink:href').match ( /\/(Q\d+)$/ ) ;
								if ( m == null ) return ;
								$(o).attr('xlink:href','?q='+m[1]+'&lang='+lang) ;
							} )
						} ) ;
					} ) ;
				} ) ;

			} else {
				$('#'+id).toggle() ;
				$('#'+id+'_status').toggle() ;
			}
		}

		return false ;
	} ,
	
	languageDialog : function () {
		var self = this ;
		$('#languageDialog').remove() ;
		var h = '' ;
		h += '<div id="languageDialog" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="languageDialogLabel" aria-hidden="true">' ;
		h += '<div class="modal-dialog"><div class="modal-content">' ;
		h += '<div class="modal-header">' ;
		h += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' ;
		h += '<h3 id="languageDialogLabel">' + tt.t("choose_language") + '</h3>' ;
		h += '</div>' ;
		h += '<div class="modal-body">' ;
		
		var use_quick_language_switch = false ;
		var url = "?" + ( self.q === undefined ? '' : "q="+self.q ) + ( self.params.find === undefined ? '' : "find="+escape(self.params.find) ) + "&lang=" ;
		var hadthat = {} ;

		h += "<div><h4>" + tt.t("common_languages") + "</h4>" ;
		h += "<div><ul class='list-inline'>" ;
		$.each ( self.wd.main_languages , function ( dummy , l ) {
			if ( hadthat[l] ) return ;
			hadthat[l] = true ;
			h += "<li><div>" ;
			if ( use_quick_language_switch ) {
				h += "<a href='#' class='newlang' lang='"+l+"'>" + (self.all_languages[l]||l) + "</a>" ;
			} else {
				h += "<a href='" + url + l + "'>" + (self.all_languages[l]||l) + "</a>" ;
			}
			h += "</div></li>" ;
		} ) ;
		h += "</ul></div></div>" ;

		h += "<div><h4>"+tt.t('worldwide')+"</h4>" ;
		h += "<div><ul class='list-inline'>" ;
		$.each ( self.all_languages , function ( l , name ) {
			if ( hadthat[l] ) return ;
			hadthat[l] = true ;
			h += "<li><div>" ;
			if ( use_quick_language_switch ) {
				h += "<a href='#' class='newlang' lang='"+l+"'>" + (self.all_languages[l]||l) + "</a>" ;
			} else {
				h += "<a href='" + url + l + "'>" + (self.all_languages[l]||l) + "</a>" ;
			}
			h += "</div></li>" ;
		} ) ;
		h += "</ul></div></div>" ;
		
		
		h += '</div>' ;
		h += '</div></div>' ;
		h += '</div>' ;
		
		$('body').append ( h ) ;
		
		if ( use_quick_language_switch ) {
			$('#languageDialog a.newlang').click ( function () {
				$('#languageDialog').modal('hide') ;
				var l = $(this).attr('lang') ;
				self.wd.main_languages.unshift ( l ) ;
				self.reShow() ;
			} ) ;
		}
		
		$('#languageDialog li').css({'width':'120px'})
		$('#languageDialog li div').css({'background-color':'#FFF','margin':'1px','padding':'1px'})
		
		$('#languageDialog').modal({show:true}) ;
	} ,
	
	reShow : function () { // THIS NEEDS WORK!
		var self = this ;
		$('div.mythumb').remove() ;
		$('#all_images').html('') ;
		$('#main div.entity').hide() ;
		$('div.sidebar div').html('') ;
		$('div.map').html('') ;
		$('div.qrcode').remove() ;
		$('div.concept_cloud').remove() ;
		$('#related_media_container').remove() ;
		self.clear() ;
		var q = self.q ;
		window.location.hash = self.getCurrentUrl ( { hash:true } ) ;

		function reShowSub () {
			self.loadQ ( q ) ;
		}

		var loadcnt  = 2 ;
		self.wd.getItemBatch ( [q] , function ( d1 ) {
			self.addToLoadLater ( q ) ;
			loadcnt-- ; if ( loadcnt == 0 ) reShowSub() ;
		} ) ;
		self.getRelatedEntities ( q , function () {
			loadcnt-- ; if ( loadcnt == 0 ) reShowSub() ;
		} ) ;
	} ,
	
	getLangParam : function ( l ) {
		var self = this ;
		if ( l == undefined ) l = self.getMainLang() ;
		var m = self.preferred_languages.match ( /^([^,]+)/ ) ;
		if ( m != null && l == m[1] ) return '' ;
		if ( l == 'en' ) return '' ;
		return '&lang=' + l ;
	} ,
	
	loadRandomItem : function () {
		var self = this ;
		var pl = self.preferred_languages.split(',') ;
		$.getJSON ( '//www.wikidata.org/w/api.php?callback=?' , { // Get site info (languages)
			action:'query',
			list:'random',
			rnlimit:10,
			rnnamespace:'0',
			format:'json'
		} , function ( d ) {
//			if ( typeof $.cookie === undefined )
//			jQuery.noConflict() ;
			var filter = ($.cookie('random_page_language')||'all') ;
			var qs = [] ;
			$.each ( d.query.random , function ( k , v ) { qs.push ( v.title ) } ) ;

			self.wd.getItemBatch ( qs , function () {
				$.each ( qs , function ( dummy , q ) {

					if ( self.isNonContentPage ( q ) ) return ;
					var i = self.wd.items[q] ;
					
					var usable = false ;
					if ( filter == 'all' ) usable = true ;
					else if ( filter == 'with_lang' ) {
						$.each ( pl , function ( dummy2 , l ) { if ( undefined !== (i.raw.labels||{})[l] ) usable = true ; } ) ;
					} else if ( filter == 'without_lang' ) {
						var cnt = 0 ;
						$.each ( pl , function ( dummy2 , l ) { if ( undefined === (i.raw.labels||{})[l] ) cnt++ ; } ) ;
						if ( cnt == pl.length ) usable = true ;
					}
					if ( !usable ) return ;
					
//					console.log ( i.raw.labels ) ; return ;
					
					var url = "?q=" + q + self.getLangParam() ;
					window.location = url ;
					return false ;
				} ) ;
				
				self.loadRandomItem() ; // Play it again, Sam!
			} ) ;
		} ) ;
	} ,
	
	
	getStatusBarHTML : function ( id ) {
		var h = '<div id="'+id+'" class="progress progress-striped active">' ;
		h += '<div class="progress-bar"  role="progressbar">' ;
//		h += '<span class="sr-only">45% Complete</span>' ;
		h += '</div></div>' ;
		return h ;
	} ,
	
	showDate : function ( new_date ) {
		var self = this ;
		if ( undefined !== new_date ) {
			if ( self.internalCalendarBrowsing ) self.date = new_date+'' ;
			else {
				window.location = self.getSelfURL ( { date:new_date } ) ;
				return ;
			}
		}

		$('#actual_content').show() ;
		$('#main').show() ;
		$('#main_content_sub').show() ;
		$('#main_content').show() ;

		var ymd = self.date.match ( /^(-{0,1}\d{1,4})-(\d\d)-(\d\d)$/ ) ;
		if ( ymd == null ) ymd = self.date.match ( /^(-{0,1}\d{1,4})-(\d\d)$/ ) ;
		if ( ymd == null ) ymd = self.date.match ( /^(-{0,1}\d{1,4})$/ ) ;
		if ( ymd == null || ymd[1] < 0 ) { // TODO show error
		console.log ( ymd ) ;
			$('#main').html ( "Apologies, dates before year 1 C.E. do not work correctly yet." ) ;
			return ;
		}
		
		var precision = ymd[3]===undefined?(ymd[2]===undefined?9:10):11 ;

		$('#actual_content div.main').show().html ( 
			"<table style='width:100%'><tbody><tr><td valign='top'>" + 
			tt.t('loading') + "</td><td>" + 
			"<div style='float:right;width:600px'>" + self.getStatusBarHTML('loading_status') + "</div><span id='cal_perc'></span>"  +
			"</td></tr></tbody></table>"
			) ;
		$('h1.main_title').html ( tt.t('calendar_for').replace(/\$1/,self.date) ) ;
		self.wd.loading_status_callback = function ( cur , total ) {
			$('#loading_status .progress-bar').width ( (100*cur/total)+'%' ) ;
//			$('#cal_perc').html ( parseInt(100*cur/total)+'%' ) ;
//			$('#loading_status').attr ( { 'aria-valuenow':cur , 'aria-valuemax': total} ) ;
//					var msg = "$1 of $2 items loaded" ;
//					$(self.loading_status_selector).html ( msg.replace(/\$1/,self.loaded_count).replace(/\$2/,self.loading_count) ) ;
//			selector = '#loading_status' ;
		} ;
		
		var bracket = 10 ; // Years
		var ongoing = {
			from:(1*ymd[1]-bracket)+'-'+(ymd[2]||'01')+'-'+(ymd[3]||'01') ,
			to:(1*ymd[1]+bracket)+'-'+(ymd[2]||'12')+'-'+(ymd[3]||'31')
		} ;
		
		var dmin = [ ymd[1]*1 , (ymd[2]||'01') , (ymd[3]||'01') ].join('-') ;
		var dmax = [ ymd[1]*1 , (ymd[2]||'12') , (ymd[3]||'31') ].join('-') ;
		
		function sparql_or ( props , min , max ) {
			return 'SELECT DISTINCT ?item { ?item (wdt:P'+props.join('|wdt:P')+') ?time0 . FILTER ( ?time0 >= "'+min+'T00:00:00Z"^^xsd:dateTime && ?time0 <= "'+max+'T23:59:59Z"^^xsd:dateTime ) }' ;
		}

		var sections = [
			{ title:tt.t('event_on') , key:'event' , 
				sparql:'SELECT DISTINCT ?item { ?item wdt:P585 ?time0 . FILTER ( ?time0 >= "'+dmin+'T00:00:00Z"^^xsd:dateTime && ?time0 <= "'+dmax+'T00:00:00Z"^^xsd:dateTime ) }' ,
				sparql:sparql_or([585,606,619,620,621,622,729,1191],dmin,dmax),
				cols:[] , props:[585,606,619,620,621,622,729,1191] } ,
				
			{ title:tt.t('foundation_or_discovery') , key:'found_disc' , 
				sparql:sparql_or([571,575,577,1619],dmin,dmax),
				cols:[] , props:[571,575,577,1619] } ,

			{ title:tt.t('end_of') , key:'end_of' , 
				sparql:sparql_or([730,746],dmin,dmax),
				cols:[] , props:[730,746] } ,
				
			{ title:tt.t('ongoing').replace(/\$1/,bracket) , key:'ongoing' , 
				sparql:'SELECT DISTINCT ?item { ?item (wdt:P580) ?time0 . ?item (wdt:P582) ?time1 '
					+ '. FILTER ( ?time0 >= "'+ongoing.from+'T00:00:00Z"^^xsd:dateTime && ?time0 <= "'+dmax+'T23:59:59Z"^^xsd:dateTime ) '
					+ '. FILTER ( ?time1 >= "'+dmin+'T00:00:00Z"^^xsd:dateTime && ?time1 <= "'+ongoing.to+'T23:59:59Z"^^xsd:dateTime ) }'
					,
				props:[580,582] , cols:[{title:tt.t('cal_from'),prop:580,type:'date'},{title:tt.t('cal_end'),prop:582,type:'date'}] } ,
				
			{ title:tt.t('born_on') , key:'born' , 
				sparql:sparql_or([569],dmin,dmax),
				cols:[{title:tt.t('died_on'),prop:570,type:'date'}] , props:[569]  } ,
				
			{ title:tt.t('died_on') , key:'died' , 
				sparql:sparql_or([570],dmin,dmax),
				cols:[{title:tt.t('born_on'),prop:569,type:'date'}] , props:[570] } ,
		] ;
		
		var more_dates = precision < 11 ;
		if ( more_dates ) {
			sections[0].cols.push ( {title:tt.t('cal_date'),prop:585,type:'date'} ) ;
			sections[1].cols.push ( {title:tt.t('cal_date'),prop:571,type:'date'} ) ;
			sections[1].cols.push ( {title:tt.t('cal_date'),prop:575,type:'date'} ) ;
			sections[3].cols.unshift ( {title:tt.t('born_on'),prop:569,type:'date'} ) ;
			sections[4].cols.push ( {title:tt.t('died_on'),prop:570,type:'date'} ) ;
		}

		var to_load = [] ;
			
		function showResults () {
			var h = '<div id="date">' ;
			
			h += "<div class='row'>" ;
			h += "<div><ul>" ;
			$.each ( sections , function ( k , v ) {
				h += "<li><a href='#cal_" + v.key + "'>" + v.title + "</a></li>" ;
			} ) ;
			h += "</ul></div>" ;
			h += "</div>" ;
			
			$.each ( sections , function ( dummy , o ) {
				if ( o.data === undefined || o.data.items === undefined || o.data.items.length == 0 ) return ;
				
				if ( o.key != 'died' ) h += "<div class='row'>" ;
				
				if ( !more_dates && ( o.key == 'born' || o.key == 'died' ) ) {
					h += '<div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">' ;
				} else {
					h += '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">' ;
				}
				h += '<a name="cal_' + o.key + '"></a>' ;
				
				var items = [] ;
				$.each ( o.data.items , function ( k , v ) {
					var bad = false ;
					var i = self.wd.items['Q'+v] ;
					if ( i == undefined ) return ;
					$.each ( o.props , function ( dummy2 , p ) {
						var claims = i.getClaimsForProperty(p) ;
						if ( claims.length == 0 ) return ; // Paranoia
						var d = i.getClaimDate ( claims[0] ) ;
						if ( d.precision >= precision ) return ; // Depending if we look at year, month, day, this is OK
						bad = true ;
					} ) ;
					if ( o.key == 'ongoing' ) bad = false ; // Hardcoded exception for ongoing events; they can be fuzzy
					if ( !bad ) items.push ( 'Q'+v ) ;
				} ) ;
				
				var style = [ { title:tt.t('item') , name:true } ] ;
				style = style.concat ( o.cols ) ;
				
				var h2 = self.renderChain ( items , style ) . replace ( /\bnowrap\b/g , '' ) ;
				h += self.wrapPanel ( h2 , { title:o.title , collapsible:true } ) ;
				
				h += "</div>" ;
				if ( o.key != 'born' ) h += "</div>" ;
			} ) ;

			h += "</div>" ;
			
			
			$('#actual_content div.main').html ( h ) ;
			self.addHoverboxes ( '#date' ) ;
			$('#other_media_container').hide() ;
		}
		
		var running = sections.length ;
		$.each ( sections , function ( dummy , o ) {
			self.loadSPARQL ( o.sparql , function ( d ) {
				o.data = d ;
				$.each ( (d.items||[]) , function ( k , v ) { to_load.push ( 'Q'+v ) } ) ;
				running-- ;
				if ( running == 0 ) {
					self.wd.getItemBatch ( to_load , function () {
						showResults() ;
					} ) ;
				}
			} ) ;
		} ) ;

		self.showCalendarSidebar([ymd[1],ymd[2],ymd[3]]) ; // dmin.split('-')

	} ,
	
	showCalendarSidebar : function ( ymd ) {
		var self = this ;
		
		var mill = parseInt ( ymd[0] / 1000 ) ;
		var cent = parseInt ( (ymd[0]-mill*1000) / 100 ) ;
		var deca = parseInt ( (ymd[0]-mill*1000-cent*100) / 10 ) ;
		var year = ymd[0]-mill*1000-cent*100-deca*10 ; // LAST DIGIT ONLY!
	
		var h = "<div>" ;
		h += "<div class='cal_sb_header'>Millennium</div>" ;
		h += "<div class='cal_sb_section'>" ;
		for ( var i = -5 ; i <= 2 ; i++ ) {
			var nd = i*1000 ;
			h += "<span style='margin-right:5px'>" ;
			var text = i<0 ? i*-1 + "&nbsp;BCE" : ( i==0?'1st':(i==1?'2nd':'3rd') ) ;
			if ( i == mill ) h += "<b>" + text + "</b>" ;
			else h += "<a href='#' onclick='reasonator.showDate("+nd+");return false'>" + text + "</a>" ;
			h += "</span>" ;
			if ( i == -1 ) h += "<br/>" ;
		}
		h += "</div>" ;

		h += "<div class='cal_sb_header'>Century</div>" ;
		h += "<div class='cal_sb_section'>" ;
		for ( var i = 0 ; i <= 9 ; i++ ) {
			var nd = mill*1000+i*100 ;
			h += "<span style='margin-right:5px'>" ;
			var text = mill+''+i+'00s' ;
			if ( i == cent ) h += "<b>" + text + "</b>" ;
			else h += "<a href='#' onclick='reasonator.showDate("+nd+");return false'>" + text + "</a>" ;
			h += "</span>" ;
			if ( i == 4 ) h += "<br/>" ;
		}
		h += "</div>" ;

		h += "<div class='cal_sb_header'>Decade</div>" ;
		h += "<div class='cal_sb_section'>" ;
		for ( var i = 0 ; i <= 9 ; i++ ) {
			var nd = mill*1000+cent*100+i*10 ;
			h += "<span style='margin-right:5px'>" ;
			var text = mill+''+cent+''+i+'0s' ;
			if ( i == deca ) h += "<b>" + text + "</b>" ;
			else h += "<a href='#' onclick='reasonator.showDate("+nd+");return false'>" + text + "</a>" ;
			h += "</span>" ;
			if ( i == 4 ) h += "<br/>" ;
		}
		h += "</div>" ;


		h += "<div class='cal_sb_header'>Year</div>" ;
		h += "<div class='cal_sb_section'>" ;
		for ( var i = 0 ; i <= 9 ; i++ ) {
			var nd = mill*1000+cent*100+deca*10+i ;
			h += "<span style='margin-right:5px'>" ;
			var text = mill+''+cent+''+deca+''+i ;
			if ( i == year ) h += "<b>" + text + "</b>" ;
			else h += "<a href='#' onclick='reasonator.showDate(\""+nd+"\");return false'>" + text + "</a>" ;
			h += "</span>" ;
			if ( i == 4 ) h += "<br/>" ;
		}
		h += "</div>" ;

		h += "<div class='cal_sb_header'>Month</div>" ;
		h += "<div class='cal_sb_section'>" ;
		for ( var i = 1 ; i <= 12 ; i++ ) {
			var nd = ymd[0]+'-'+(i<10?'0'+i:i) ;
			h += "<span style='margin-right:5px'>" ;
			var text = i < 10 ? '0'+i : i ;
			if ( i == (ymd[1]||0) ) h += "<b>" + text + "</b>" ;
			else h += "<a href='#' onclick='reasonator.showDate(\""+nd+"\");return false'>" + text + "</a>" ;
			h += "</span>" ;
		}
		h += "</div>" ;

		if ( undefined !== ymd[1] ) {
			h += "<div class='cal_sb_header'>Day</div>" ;
			h += "<div>" ;
			var day = new Date ( ymd[0] , ymd[1]-1 , 1 ) ;
			var monthEnd = new Date( ymd[0], ymd[1]-1 + 1, 1);
			var monthLength = (monthEnd - day) / (1000 * 60 * 60 * 24) ;
			var dotw = day.getDay() ;
			h += "<table class='table-striped table-condensed' style='margin-left:auto;margin-right:auto;margin-top:5px'><thead>" ;
			$.each ( ['S','M','T','W','T','F','S'] , function ( k , v ) { h += "<th>"+v+"</th>" } ) ;
			h += "</thead><tbody><tr>" ;
			var since_sunday = 6 ;
			for ( var i = -dotw ; i <= monthLength ; i++ ) {
				var nd = ymd[0]+'-'+ymd[1]+'-'+(i<10?'0'+i:i) ;
				if ( since_sunday == 0 ) h += "<tr>" ;
				h += "<td>" ;
				var text = i <= 0 ? '' : (i<10?'0'+i:i) ;
				if ( i <= 0 ) {}
				else if ( i == ymd[2]*1 ) h += "<b>" + text + "</b>" ;
				else h += "<a href='#' onclick='reasonator.showDate(\""+nd+"\");return false'>" + text + "</a>" ;
				h += "</td>" ;
				if ( since_sunday == 6 ) h += "</tr>" ;
				since_sunday = (since_sunday+1) % 7 ;
			}
			h += "</tbody></table>" ;
			h += "</div>" ;
		}
		
		
		h += "</div>" ;
		$('#actual_content div.sidebar').html ( h ) ;
		
	} ,

	
	initializeFromParameters : function () {
		var self = this ;
		if ( undefined !== self.params.lang ) {
			self.params.lang = self.params.lang.replace(/\#$/,'') ;
			$('input[name="lang"]').val ( self.params.lang ) ;
			var l = self.params.lang.split(',').reverse() ;
			$.each ( l , function ( k , v ) { self.wd.main_languages.unshift(v) ; } ) ;
		} else if ( undefined !== $.cookie('preferred_languages') ) {
//			console.log ( $.cookie('preferred_languages') ) ;
			var l = ($.cookie('preferred_languages')||'').split(',').reverse() ;
			$.each ( l , function ( k , v ) { self.wd.main_languages.unshift(v) ; } ) ;
		}
		
		  tt.setLanguage ( self.getMainLang() , function () {

			$('#btn_search').text(tt.t('find')) ;
			$('#edit_interface_link').text ( tt.t('translate_interface') ) ;
			$('#personal_settings').text ( tt.t('ps_title') ) ;
			$('#aux_dropdown_button_label').text ( 'Other' ) ;
			$('#personal_settings').click ( reasonator.personalSettings ) ;
		
			$.each ( [
				['btn_search','find'] ,
				['edit_interface_link','translate_interface'] ,
				['aux_dropdown_button_label','aux_dropdown_label'] ,
				['about_link','about_link'] ,
				['discuss_link','discuss_link'] ,
				['stringprops_link','stringprops_link'] ,
			] , function ( k , v ) {
				$('#'+v[0]).text ( tt.t(v[1]) ) ;
			} ) ;
		
			$('#btn_search').prepend('<span class="glyphicon glyphicon-search"></span> ');
	//		$('#div.header h3').click ( function () { window.location = "?" } ) ;
		
			$('#find').attr({title:tt.t('find')+' [F]'}) ;
			$('#language_select').click ( function () { reasonator.languageDialog() ; return false } ) ;
			$('#random_item').html(tt.t('random_item')).attr({title:tt.t('random_item')+' [X]'}).click ( function () { reasonator.loadRandomItem() ; return false } ) ;
		
			if ( self.params.q === undefined && self.params.find == undefined && self.params.date == undefined ) {
				$('#language_select').hide() ;
			} else {
				var curlang = self.all_languages[self.getMainLang()] || 'Unknown language' ;
				$('#language_select').text ( curlang ) ;
			}

			wd_auto_desc_wd.init() ;
			wd_auto_desc.lang = self.getMainLang() ;
			if ( undefined !== self.params.q ) {
				self.loadQ ( self.params.q.replace(/\#/g,'') ) ;
			} else if ( undefined !== self.params.find ) {
				self.find ( decodeURIComponent(self.params.find).replace(/\+/g,' ') )
			} else if ( undefined !== self.params.date ) {
				self.date = self.params.date ;
				self.showDate() ;
			} else {
				$('#main_content').show() ;
				$('#intro').show() ;
				var l = self.getMainLang() ;
				if ( l != 'en' ) {
					$('#example_list a').each ( function () {
						var a = $(this) ;
						var url = a.attr('href') ;
						url += "&lang="+l ;
						a.attr({href:url}) ;
					} ) ;
				}
			}
		} ) ;
	} ,
	
	/**
	 * Tries to generate timeline data. If enough data was generated, shows timeline via {@link showTimeline}.
	 */
	generateTimelineData : function () {
		var self = this ;
		self.timeline_data = [] ;
		
		var point_props = ['P577','P585','P571','P574','P746','P622'] ;
		var start_props = ['P580','P569','P729'].concat(point_props) ;
		var end_props = ['P582','P570','P576','P730'].concat(point_props) ;
		var time_props = [].concat(start_props).concat(end_props) ;

		function getTimepointsFromQualifiers () {

			$.each ( self.wd.items , function ( qp , i ) {
				$.each ( ((i.raw||{}).claims||[]) , function ( prop , v0 ) {
					$.each ( i.getClaimsForProperty(prop) , function ( dummy , c ) {
						var q = i.getClaimTargetItemID ( c ) ;
						if ( q != self.q && qp != self.q ) return ; // Main item, or claim linking to main item
						var range = { source_q:qp , target_q:q , prop:prop } ;
						$.each ( (c.qualifiers||[]) , function ( claim_prop , qual_claims ) {
							var qc = { mainsnak : qual_claims[0] } ; // Fake claim
							if ( -1 != $.inArray ( claim_prop , start_props ) ) range.start = i.getClaimDate ( qc ) ;
							if ( -1 != $.inArray ( claim_prop , end_props ) ) range.end = i.getClaimDate ( qc ) ;
						} ) ;
						
						if ( range.start === undefined && range.end === undefined ) return ;
						self.timeline_data.push ( range ) ;
					
					} ) ;
				} ) ;
			} ) ;
		}
		
		function getTimepointsFromItem () {
			self.timeline_candidates[self.q] = 1 ; // Dummy value for self.q
			$.each ( self.timeline_candidates , function ( q , candidate_props ) {
				var i = self.wd.items[q] ;
				if ( i === undefined ) return ; // Paranoia
				$.each ( ((self.wd.items[q].raw||{}).claims||[]) , function ( prop , v0 ) {
					if ( q != self.q && -1 == $.inArray ( prop , candidate_props ) ) return ;
					if ( -1 == $.inArray ( prop , time_props ) ) return ;
					var range = { source_q:q , prop:prop } ;
					if ( q != self.q ) range.from_candidates = true ;
					$.each ( v0 , function ( dummy0 , v1 ) {
						range.start = i.getClaimDate ( v1 ) ;
						range.end = i.getClaimDate ( v1 ) ;
						return false ; // Use first one only
					} ) ;
					if ( range.start === undefined && range.end === undefined ) return ;
					self.timeline_data.push ( range ) ;
				} ) ;
			} ) ;
		}
		
		getTimepointsFromItem() ;
		getTimepointsFromQualifiers() ;
		
//		console.log ( self.timeline_data ) ;
		
		if ( self.timeline_data.length <= 2 ) return ;
		
		self.showTimeline() ;
		
	} ,

	getFormatDate : function ( d ) {
		if ( d === undefined || d.time === undefined || d.precision === undefined ) return '' ;
//		console.log ( d.time.match(/^.(\d+)-(\d+)-(\d+)/) [1] ) ;
		if ( d.precision >= 11 ) return d.time.match(/^.(\d+-\d+-\d+)/) [1] ; //d.time.substr ( 8 , 10 ) ;
		if ( d.precision == 10 ) return d.time.match(/^.(\d+-\d+)/) [1] ; //d.time.substr ( 8 , 7 ) ;
		if ( d.precision <=  9 ) return d.time.match(/^.(\d+)/) [1] ; //d.time.substr ( 8 , 4 ) ;
	} ,
	
	
	/**
	 * Shows a timeline generated by {@link generateTimelineData}.
	 */
	showTimeline : function () {
		var self = this ;
		
		var min = '9999-99-99' ;
		var max = '0000-00-00' ;
		var years = [] ;
		$.each ( self.timeline_data , function ( dummy , range ) {
			if ( undefined !== range.start ) {
				range.start_string = self.getFormatDate ( range.start ) ;
				if ( min > range.start_string ) min = range.start_string ;
			}
			if ( undefined !== range.end ) {
				range.end_string = self.getFormatDate ( range.end ) ;
				if ( undefined !== range.end_string && max < range.end_string ) max = range.end_string ;
			}
			if ( undefined !== range.start_string ) years.push ( range.start_string ) ;
			else years.push ( range.end_string ) ;
		} ) ;

		// Sorting items by date
		self.timeline_data = self.timeline_data.sort ( function ( a , b ) {
			var t1 = a.start_string || a.end_string || '' ;
			var t2 = b.start_string || b.end_string || '' ;
			return t1 == t2 ? 0 : ( t1 < t2 ? -1 : 1 ) ;
		} ) ;

		// Finding middle item
		years = years.sort() ;
		var mid_item = 0 ;
		var mid_date = years[Math.floor(years.length/2)] ;
		$.each ( self.timeline_data , function ( dummy , range ) {
			if ( range.start_string != mid_date ) return ;
			mid_item = dummy ;
			return false ;
		} ) ;

		var tl = {
			timeline : {
				headline : self.wd.items[self.q].getLabel() ,
				type : 'default' ,
				text : self.wd.items[self.q].getDesc() ,
				date : [] ,
				lang : self.getMainLang() ,
				era : [ {
					startDate : min.replace(/-/g,',') ,
					endDate : max.replace(/-/g,',') ,
					headline: self.wd.items[self.q].getLabel()
				}]
			}
		} ;

		$.each ( self.timeline_data , function ( itemid , range ) {
			var d = {} ;
			if ( undefined !== range.start_string ) {
				d.startDate = range.start_string.replace(/-/g,',') ;
			}
			if ( undefined !== range.end_string ) d.endDate = range.end_string.replace(/-/g,',') ;
			
			if ( range.source_q == self.q ) { // Properties of other items
				d.headline = self.wd.items[range.prop].getLabel() ;
				if ( range.target_q !== undefined ) {
					var l2 = self.wd.items[range.target_q].getLabel() ;
//					l2 = l2 + '|' + range.target_q ;
					d.headline += ": <br/>" + l2 ;
					d.text = self.wd.items[range.target_q].getDesc() + '|' + range.target_q;
				} else {
					d.text = self.wd.items[self.q].getLabel() ;
				}
			} else { // For properties of the item itself
				d.headline = self.wd.items[range.prop].getLabel() ;
				if ( range.from_candidates && self.wd.items[range.source_q] !== undefined ) {
					var l2 = self.wd.items[range.source_q].getLabel() ;
//					l2 = l2 + '|' + range.source_q ;
					d.headline += ": <br/>" + l2 ;
					d.text = self.wd.items[range.source_q].getDesc() + '|' + range.source_q;
				} else {
					var l2 = self.wd.items[range.source_q].getLabel() ;
					d.headline += ": <br/>" + l2 ;
					d.text = self.wd.items[range.source_q].getDesc() + '|' + range.source_q;
				}
			}
			
			// TODO add text and images
			tl.timeline.date.push ( d ) ;
		} ) ;

		$('div.timeline').show() ;

		var years = max.substr(0,4) - min.substr(0,4) ;

		createStoryJS({
			type:       'timeline',
	//		width:      '800',
			height:     '400',
			source:     tl,
			start_at_slide : mid_item+1 ,
			
//			start_zoom_adjust : years > 100 ? -2 : -1 ,
			embed_id:   'timeline'
		});

		function fixHeadings () {
//			if ( $('#timeline').length < 0 ) return ;
			if ( $('#timeline div.marker').length < 1 || $('#timeline div.container').length < 1 ) {
				setTimeout ( fixHeadings , 100 ) ;
				return ;
			}

			$('#timeline div.container p').each ( function () {
				var o = $(this) ;
				var m = o.text().match(/\|(Q\d+)$/) ;
				if ( m == null ) return ;
				o.text ( o.text().replace(/\|Q\d+$/,'') ) ;
				var q = m[1] ;
				var h3 = $(o.parent().find('h3')) ;
				var h = h3.html() ;
				m = h.match ( /<br>([^<].*)$/ ) ;
				if ( m == null ) return ;
				var url = self.getSelfURL ( { q:q } ) ;
				h = h.replace ( /<br>[^<].*$/ , " <a href='"+url+"'>"+m[1]+"</a>" ) ;
				h3.html ( h ) ;
			} ) ;
			
			setTimeout ( fixHeadings , 1000 ) ; // Keep going, forever...

		}
		
		fixHeadings() ;

	} ,
	
	/**
	 * Checks is the main item has an image; if not, checks Wikipedias for image candidates; shows link that opens dialog, adds images via WiDaR/OAuth.
	 */
	checkWikipediaImages : function () {
		var self = this ;
		if ( self.isNonContentPage ( self.q ) ) return ; // Don't bother for categories etc.
		var has_main_image = false ;
		$.each ( self.mm_load , function ( k , v ) {
			//console.log( v );
			if ( v.id != 'div.main_image' ) return ;
			has_main_image = true ;
			return false ;
		} ) ;
		if ( has_main_image ){

			// CONZEPT PATCH
			console.log( 'setting up LightBox images...' );

			console.log( $('.main_image img').length );

			$('.main_image img').each(function( index ){

				let caption = 'foo bar baz';

        src = src.replace( /\/\d+px\-/g, image_width_string );

        $(this)[0].src = src;

				console.log( index, src );

        let img_html = $(this).html();

        $(this)
          .wrap( '<figure class="non-thumb-media"></figure>' )
          .after('</span> <figcaption>' + caption + '</figcaption>')
          .wrap('<a href="' + src + '" class="elem" data-lcl-txt="' + caption_plaintext + '" data-articulate-ignore=""></a>');

			});

			// see: https://lcweb.it/lc-lightbox/documentation
			const LC = lc_lightbox('.elem', {
				wrap_class: 'lcl_fade_oc',
				gallery : true,
				thumb_attr: false, // 'data-lcl-thumb', 
				tn_hidden: true,
				thumbs_nav: true,
				download: true,
				skin: 'minimal',
				counter: true,
				touchswipe: true,
				//fullscreen: false,
				//fs_only: true,
				//on_fs_exit: function(){ console.log('close LC'); close_lb(); }
			});


			return ; // Already has image
    }
		
		var i = self.wd.items[self.q] ;
		var links = i.getWikiLinks() ;
		var queries = [] ;
		$.each ( links , function ( k , v ) {
			if ( k == 'commonswiki' ) return ;
			var m = k.match ( /^(.+)wiki$/ ) ;
			if ( m == null ) return ; // Wikipedias only, for now
			queries.push ( { lang:m[1].replace(/_/g,'-') , title:v.title } ) ;
		} ) ;
		
		var image_props = [ 'P18' , 'P94' , 'P41' , 'P242' , 'P158' , 'P109' , 'P154' , 'P10' ] ;
		
		var image_blacklist = [
			'Blue morpho butterfly 300x271.jpg',
			'Copris lunaris. MHNT.jpg',
			'951 Gaspra.jpg',
			'Football France.png',
			'Earth Eastern Hemisphere.jpg',
			'Basketball.png'
		] ;
		
		var min_file_size = 80000 ; // Min bytes for a file to show; excludes many icons
		var images = {} ; // This will become an array later!
		
		var h3 = "<div id='images_commons'></div><div id='images_flickr'></div>" ;
		h3 += "<div id='images_google'><a target='_blank' class='external' href='https://www.google.com/search?q="+escape($('#main_title_label').text())+"&tbm=isch&tbs=sur:fmc' tt='google_image'></a></div>" ;
		$('div.main_image').html ( h3 ) ;
		tt.updateInterface ( $('div.main_image') ) ;
		$('#images_commons').html ( "<small><i>" + tt.t('looking4images_wiki') + "</i></small>" ) ;
		//if ( self.flickr_key ) self.checkFlickr() ;
		
		if ( queries.length == 0 ) $('#images_commons').html ( '' ) ;
		
		function addImage ( iid ) {
			var prop = $("input:radio[name=use_image_prop]:checked").val() ;

			$.get ( self.widar_url , {
				action:'set_string',
				tool_hashtag:'reasonator',
				id:self.q,
				prop:prop,
				text:images[iid].title,
				botmode:1
			} , function ( d ) {
				if ( d.error == 'OK' ) {
					$('div.addimage_thumbnail_container[iid='+iid+']').html(tt.t('image_added')).css({'background-color':'#1FCB4A'}) ;
					$('#reload_page_after_image_added').show() ;
				} else alert ( d.error ) ;
			} , 'json' ) .fail(function( jqxhr, textStatus, error ) {
				alert ( error ) ;
			} ) ;
			return false ;
		}
		
		function showImageCandidatesStage2 () {
			var diag_title = tt.t('add_image') ;
			var diag_desc = tt.t('has_no_image') ;
			diag_desc = diag_desc.replace ( /\$1/ , images.length ) . replace ( /\$2/ , '<a target="_blank" href="/widar/">' ) ;
			
			$('#addImagesDialog').remove() ;
			
			var h = '' ;
			h += '<div id="addImagesDialog" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="languageDialogLabel" aria-hidden="true">' ;
			h += '<div class="modal-dialog"><div class="modal-content">' ;
			h += '<div class="modal-header">' ;
			h += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' ;
			h += '<h3 id="languageDialogLabel">' + diag_title + '</h3>' ;
			h += diag_desc ;
			h += '</div>' ;
			h += '<div class="modal-body" style="max-height:600px;overflow:auto">' ;
			
			$.each ( images , function ( iid , i ) {
        //console.log( i );
				var off = Math.floor((self.thumbsize-i.thumbheight)/2) ;
				h += "<div iid='"+iid+"' style='text-align:center;vertical-align:top;display:inline-block;width:"+self.thumbsize+"px;height:"+(self.thumbsize+20)+"px;margin:5px' class='addimage_thumbnail_container'>" ;
				h += "<div style='padding-top:"+off+"px;padding-bottom:"+(self.thumbsize-off-i.thumbheight)+"px'><a class='add_image' href='#' iid='"+iid+"'>" ;
				h += "<img style='width:"+i.thumbwidth+"px;height:"+i.thumbheight+"px' src='"+i.thumburl+"' border=0 /></a></div>" ;
				h += "<div>"+i.usage_counter+"&times; (<a target='_blank' href='"+i.descriptionurl+"'>"+tt.t('commons')+"</a>)</div>" ;
				h += "</div>" ;
			} ) ;
			
			h += '</div>' ;
			h += '<div class="modal-header">' ;
			h += "Set as: <form class='form-inline'>" ;
			$.each ( image_props , function ( dummy , prop ) {
				h += " <label><input type='radio' name='use_image_prop' value='"+prop+"' " ;
				if ( dummy == 0 ) h += "checked" ;
				h += "/>&nbsp;" + self.wd.items[prop].getLabel() + "</label>" ;
			} ) ;
			h += "<span id='reload_page_after_image_added' style='display:none;font-weight:bold'> | <a href='#' onclick='location.reload();return false'>"+tt.t('reload_page')+"</a></span>" ;
			h += "</form>" ;
			h += '</div>' ;
			h += '</div></div>' ;
			h += '</div>' ;
		
			$('body').append ( h ) ;

			$('#addImagesDialog a.add_image').each ( function () {
				var a = $(this) ;
				var i = images[a.attr('iid')] ;
				a.attr({title:i.title}) ;
				a.click ( function () {
					addImage ( a.attr('iid') ) ;
					return false ;
				} ) ;
			} ) ;
			
			if ( typeof $.modal === undefined ) jQuery.noConflict() ;
			$('#addImagesDialog').modal({show:true,width:700}) ;
			return false ;
		}
		
		function showImageCandidates () {
			self.wd.getItemBatch ( image_props , function () {
				showImageCandidatesStage2() ;
			} ) ;
			return false ;
		}
		
		function allLoaded () {
			var i2 = [] ;
			$.each ( images , function ( k , v ) { i2.push(v) ; } ) ;
			images = i2.sort ( function ( a , b ) {
				if ( a.usage_counter == b.usage_counter ) {
					return a.size == b.size ? 0 : ( a.size < b.size ? 1 : -1 ) ;
				} else {
					return a.usage_counter < b.usage_counter ? 1 : -1 ;
				}
			} ) ;
			if ( images.length == 0 ) {
				$('#images_commons').html ( '' ) ;
				return ;
			}
			
			var txt = tt.t('add_wikipedia_images') ;
			var h = "<div style='text-align:center;margin:20px'><a href='#'>"+txt+"</a></div>" ;
			$('#images_commons').html ( h ) ;
			$('#images_commons a').click ( showImageCandidates ) ;
		}

		
		var loaded = 0 ;
		function loadStatus () {
			return ; // Comment out this line for testing image candidate loading
			var txt = "Checked " + loaded + " of " + queries.length + " Wikipedias for images" ;
			var h = "<div style='text-align:center;margin:20px'>"+txt+"</div>" ;
			$('#images_commons').html ( h ) ;
		}
		
		loadStatus() ;
		$.each ( queries , function ( dummy , v ) {
			$.getJSON ( '//'+v.lang+'.wikipedia.org/w/api.php?callback=?' , {
				action:'query',
				generator:'images',
				prop:'imageinfo',
				titles:v.title,
				gimlimit:20,
				iiprop:'url|size',
				iiurlwidth:self.thumbsize,
				iiurlheight:self.thumbsize,
				format:'json'
			} , function ( d ) {
				$.each ( ((d.query||{}).pages||[]) , function ( dummy , image ) {
					if ( image.imagerepository != 'shared' ) return ; // Commons only
					var o = image.imageinfo[0] ;
					if ( o.size < min_file_size ) return ;
					o.usage_counter = 1 ;
					o.title = image.title.replace ( /^[^:]+:/ , '' ) ;
					if ( null != o.title.match(/\.svg$/i) ) return ; // no SVG
					if ( -1 != $.inArray ( o.title , image_blacklist ) ) return ; // Image on blacklist
					if ( images[o.title] === undefined ) images[o.title] = o ;
					else images[o.title].usage_counter++ ;
				} ) ;
				loaded++ ;
				loadStatus() ;
				if ( loaded == queries.length ) allLoaded() ;
			} ) .fail(function() {
				loaded++ ;
				loadStatus() ;
				if ( loaded == queries.length ) allLoaded() ;
			} ) ;
		} ) ;
		
	} ,
	
	checkFlickr : function () {
		var self = this ;
		var title = $('#main_title_label').text().replace ( /\(.+$/ , '' ) ;
		$('#images_flickr').html ( "<small><i>" + tt.t('looking4images_flickr') + "</i></small>" ) ;

		function showImageCandidates ( images ) {
			var diag_title = tt.t('add_image_flickr') ;
			var diag_desc = tt.t('has_no_image_flickr') ;
			diag_desc = diag_desc.replace ( /\$1/ , images.length ) ;
			
			$('#addImagesDialog').remove() ;
			
			var h = '' ;
			h += '<div id="addImagesDialog" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="languageDialogLabel" aria-hidden="true">' ;
			h += '<div class="modal-dialog"><div class="modal-content">' ;
			h += '<div class="modal-header">' ;
			h += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' ;
			h += '<h3 id="languageDialogLabel">' + diag_title + '</h3>' ;
			h += diag_desc ;
			h += '</div>' ;
			h += '<div class="modal-body" style="max-height:600px;overflow:auto">' ;
			
			$.each ( images , function ( iid , i ) {
			
				if ( i.width_s > self.thumbsize || i.height_s > self.thumbsize ) {
					if ( i.width_s > i.height_s ) {
						i.height_s = Math.floor ( i.height_s * self.thumbsize / i.width_s ) ;
						i.width_s = self.thumbsize ;
					} else {
						i.width_s = Math.floor ( i.width_s * self.thumbsize / i.height_s ) ;
						i.height_s = self.thumbsize ;
					}
				}
			
				var flickr_page = 'https://secure.flickr.com/photos/'+i.owner+'/'+i.id+'/' ;
				var off = Math.floor((self.thumbsize-i.height_s)/2) ;
				h += "<div iid='"+iid+"' style='text-align:center;vertical-align:top;display:inline-block;width:"+self.thumbsize+"px;height:"+(self.thumbsize+20)+"px;margin:5px' class='addimage_thumbnail_container'>" ;
				h += "<div style='padding-top:"+off+"px;padding-bottom:"+(self.thumbsize-off-i.height_s)+"px'><a class='add_image' href='/flickr2commons/?photoid="+i.id+"' target='_blank' iid='"+iid+"'>" ;
				h += "<img style='width:"+i.width_s+"px;height:"+i.height_s+"px' src='"+i.url_s+"' border=0 /></a></div>" ;
				h += "<div>(<a target='_blank' href='"+flickr_page+"'>Flickr</a>)</div>" ;
				h += "</div>" ;
			} ) ;
			
			h += '</div>' ;
/*			h += '<div class="modal-header">' ;
			h += "Set as: <form class='form-inline'>" ;
			$.each ( image_props , function ( dummy , prop ) {
				h += " <label><input type='radio' name='use_image_prop' value='"+prop+"' " ;
				if ( dummy == 0 ) h += "checked" ;
				h += "/>&nbsp;" + self.wd.items[prop].getLabel() + "</label>" ;
			} ) ;
			h += "<span id='reload_page_after_image_added' style='display:none;font-weight:bold'> | <a href='#' onclick='location.reload();return false'>"+tt.t('reload_page')+"</a></span>" ;
			h += "</form>" ;
			h += '</div>' ;*/
			h += '</div></div>' ;
			h += '</div>' ;
		
			$('body').append ( h ) ;

			$('#addImagesDialog a.add_image').each ( function () {
				var a = $(this) ;
				var id = a.attr('iid') ;
				var i = images[id] ;
				a.attr({title:i.title}) ;
/*				a.click ( function () {
					console.log ( images[id] ) ;
					return false ;
				} ) ;*/
			} ) ;
			
			if ( typeof $.modal === undefined ) jQuery.noConflict() ;
			$('#addImagesDialog').modal({show:true,width:700}) ;
			return false ;
		}

		$.getJSON ( 'https://api.flickr.com/services/rest/?jsoncallback=?' , {
			method:'flickr.photos.search',
			api_key:self.flickr_key,
			text:title,
			license:'4,5,7,8',
			extras:'description,url_s',
			format:'json'
		} , function ( d ) {
			if ( d.photos.pages == 0 ) { // No free images on flickr either
				$('#images_flickr').html ( '' ) ;
				return ;
			}
			var txt = tt.t('add_flickr_images') ;
			var h = "<div style='text-align:center;margin:20px'><a href='#'>"+txt+"</a></div>" ;
			$('#images_flickr').html ( h ) ;
			$('#images_flickr a').click ( function () {
				showImageCandidates ( d.photos.photo ) ;
				return false ;
			} ) ;
		} ) ;
	} ,
	
	setupDialog : function ( o ) {
		var self = this ;
		$('#'+o.id).remove() ;
		$('#personalSettingsDialog').remove() ;
		var h = '' ;
		h += '<div id="' + o.id + '" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="languageDialogLabel" aria-hidden="true">' ;
		h += '<div class="modal-dialog"><div class="modal-content">' ;
		h += '<div class="modal-header">' ;
		h += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' ;
		h += '<h3 id="languageDialogLabel">' + o.title + '</h3>' ;
		h += '<div>' + o.desc + '</div>' ;
		h += '</div>' ;
		h += '<div class="modal-body" style="max-height:600px;overflow:auto">' ;
		h += o.h ;
		h += '</div>' ;
		if ( o.footer !== undefined ) {
			h += '<div class="modal-footer">' ;
			h += o.footer ;
			h += '</div>' ;
		}
		h += '</div></div></div>' ;
		$('body').append ( h ) ;
		if ( typeof $.modal === undefined ) jQuery.noConflict() ;
		$('#'+o.id).modal ( { show:true } ) ;
	} ,
	
	personalSettings : function () {
		var self = reasonator ;
		var h = '' ;
		h += "<div><form class='form-inline'><input type='text' id='wikidata_user_name' placeholder='"+tt.t('ps_un_placeholder')+"' style='width:250px' /> <button id='wdun_update'>"+tt.t('ps_update_from_babel')+"</button></form></div>" ;
		h += "<div><form class='form-inline'><input type='text' id='preferred_languages' placeholder='"+tt.t('ps_pl_placeholder')+"' style='width:250px' /> <button id='pl_update'>"+tt.t('ps_update_languages')+"</button></form></div>" ;
		h += "<div><form class='form-inline'>Random page shows " ;
		h += "<label><input type='radio' name='random_page_language' value='all' /> all</label>, <i>or,</i> only " ;
		h += "<label><input type='radio' name='random_page_language' value='with_lang' /> with</label> " ;
		h += "<label><input type='radio' name='random_page_language' value='without_lang' /> without</label> a label in your languages" ;
		h += "</form></div>" ;
		h += "<div><form class='form-inline'><label><input type='checkbox' id='use_flickr' /> "+tt.t('ps_flickr')+"</label></form></div>" ;
		self.setupDialog ( { title:tt.t('ps_title') , desc:tt.t('ps_desc') , h:h , id:'personalSettingsDialog' } ) ;
		
		
		function updatePreferredLanguages () {
			var pl = ($('#preferred_languages').val()+'').replace(/\s/g,'').toLowerCase().replace(/\bauto[a-z]+/g,'').split(/,/g) ;
			pl = pl.join(',') ;
			$.cookie('preferred_languages',pl) ;
			self.preferred_languages = ($.cookie('preferred_languages')||'') ;
			$('#preferred_languages').val(pl) ;
			return false ;
		}
		
		function updateFromUserPage () {
			var username = $('#wikidata_user_name').val() ;
			$.getJSON ( '//www.wikidata.org/w/api.php?callback=?' , {
				action:'parse',
				page:'User:'+username,
				format:'json',
				prop:'wikitext'
			} , function ( d ) {
				if ( undefined !== d.error ) {
					alert ( d.error.info ) ;
					return ;
				}
				$.cookie ( 'wikidata_user_name' , username ) ;
				var text = d.parse.wikitext['*'].replace ( /\s/ , ' ' ) ; // Newlines, just in case...
				var m = text.match ( /\{\{\#babel:(.+?)\}\}/i ) ;
				if ( m == null ) {
					alert ( tt.t('ps_babel_warning') ) ;
					return false ;
				}
				var babel = m[1].replace(/-\d+/g,'').split ( /\|/g ) ;
				$('#preferred_languages').val ( babel.join(',') ) ;
				updatePreferredLanguages() ;
			} ) ;
			return false ;
		}

		
		jQuery.noConflict() ;
		$ = jQuery ;
		$('#wikidata_user_name').val ( $.cookie('wikidata_user_name')||'' ) .focus() ;
		$('#preferred_languages').val ( $.cookie('preferred_languages')||'' ) ;

		$('input:radio[name=random_page_language][value='+($.cookie('random_page_language')||'all')+']').prop('checked', true);
		
		if ( typeof $.cookie('use_flickr') == 'undefined' ) { console.log(self.use_flickr); $.cookie('use_flickr',self.use_flickr?1:0) ; }
		if ( 1 == $.cookie('use_flickr') ) $('#use_flickr').prop('checked', true) ;
		$('#use_flickr').change ( function () { $.cookie('use_flickr',$('#use_flickr').is(":checked")?1:0) } ) ;
		$('input:radio[name=random_page_language]').change ( function () { $.cookie('random_page_language',$(this).attr('value')) } ) ;
		
		$('#wdun_update').click ( updateFromUserPage ) ;
		$('#pl_update').click ( updatePreferredLanguages ) ;
		return false ;
	} ,

	enterQ : function ( o ) {
		var self = this ;
		if ( o === undefined ) o = {} ;
		
		var h = "" ;
		
		h += "<div>" ;
		h += "<form class='form-inline'><input id='eq_search' style='width:400px' /><button id='eq_on_find' class='btn btn-primary'>" + tt.t('find') + "</button></form>" ;
		h += "<div style='max-height:400px;overflow:auto' id='eq_search_results'></div>" ;
		h += "</div>" ;
		
		

		self.setupDialog ( { title:'Set claim' , desc:'Set a claim for property '+o.prop , h:h , id:'enterQDialog' , footer:'Click on a search result to set it as a claim for '+o.prop } ) ;
		
		$('#eq_on_find').click ( function () {
			var query = $('#eq_search').val() ;
			$('#eq_search_results').html('') ;
			$.getJSON ( '//www.wikidata.org/w/api.php?callback=?' , {
				action : 'query' ,
				list : 'search' ,
				sroffset : 0 ,
				srsearch : query ,
				srnamespace : 0 ,
				srlimit : 50 ,
				format : 'json'
			} , function ( d ) {
				var qs = [] ;
				$.each ( ((d.query||{}).search||{}) , function ( k , v ) { qs.push ( v.title ) } ) ;
				self.wd.getItemBatch ( qs , function () {
					var h = "<table class='table-striped table-condensed'><tbody>" ;
					$.each ( ((d.query||{}).search||{}) , function ( k , v ) {
						var i = self.wd.items[v.title] ;
						h += "<tr>" ;
						h += "<td><a href='#' class='eq_result q_internal' q='"+v.title+"'>" + i.getLabel() + "</a></td>" ;
						h += "<td>" + i.getDesc() + "</td>" ;
						h += "</tr>" ;
					} ) ;
					h += "</tbody></table>" ;
					$('#eq_search_results').html(h) ;
					$('#eq_search_results a.eq_result').click ( function () {
						var q = $(this).attr('q') ;
//						console.log ( q ) ;
						self.addClaimItemOauth ( self.q , o.prop , q ) ;
						$('#enterQDialog').modal('hide') ;
						return false ;
					} ) ;
				} ) ;
//				console.log ( d ) ;
				self.addHoverboxes ( '#enterQDialog' ) ;
			} ) ;
			return false ;
		} ) ;
		
		$('#eq_search').focus() ;
		
		return false ;
	} ,

	suggestProperties : function () {
		var self = this ;
		var i = self.wd.items[self.q] ;
		if ( i === undefined || i.raw === undefined || i.raw.claims === undefined ) return ;
		if ( i.raw.claims['P31'] === undefined ) return ;
		var io = i.getClaimItemsForProperty ( 'P31' , true ) ;
		var query = [] ;
		$.each ( io , function ( k , v ) { query.push ( '31:'+v.replace(/\D/g,'') ) } ) ;
		query = 'claim[' + query.join(',') + ']' ;
		$.getJSON ( '//tools.wmflabs.org/wikidata-todo/related_properties.php?callback=?' , {
			q:query,
			botmode:1
		} , function ( d ) {
			var pc = [] ;
			var total ;
			$.each ( (d||[]) , function ( k , v ) { if ( v.property == 'P31' ) total = v.cnt } ) ;
			if ( total == undefined ) return ; // Huh?
			$.each ( (d||[]) , function ( k , v ) {
				if ( v.cnt < 10 ) return ; // Minor
				if ( v.cnt * 100 / total < 10 ) return ; // At least n% of items should have this
				if ( -1 != $.inArray ( v.property , ['P143','P248','P577','P31'] ) ) return ; // Useless/qualifier/source property
				if ( undefined !== i.raw.claims[v.property] ) return ; // Had that
				pc.push ( v.property ) ;
			} ) ;
			if ( pc.length == 0 ) return ; // None found
			
//			pc = pc.sort ( function ( a , b ) { return a.replace(/\D/g,'')*1 < b.replace(/\D/g,'')*1 } ) ;
			self.wd.getItemBatch ( pc , function ( d ) {
			
				var h = "<div id='suggested_properties'>" ;
				h += "<h2>Suggested properties</h2>" ;
				h += "Other items of this instance type also have there properties:" ;
				h += "<ul>" ;
				$.each ( pc , function ( k , v ) {
					h += '<li>' + self.getQlink ( v ) + " (<a href='#' class='suggested_property' p='" + v + "'>add</a> using <a href='/widar/' class='external'>WiDaR</a>)</li>" ;
				} ) ;
				h += "</ul>" ;
				h += "</div>" ;
			
				$('div.backlinks').after ( h ) ;
				$('#suggested_properties a.suggested_property').click ( function () {
					var p = $(this).attr('p') ;
					self.enterQ ( { action:'add' , prop:p } ) ;
				} ) ;
				
			} ) ;
			
		} ) ;
	} ,
	
	loadThumb : function ( thumb ) {
		var self = this ;
		if ( thumb.css('display') === 'none' ) return ; // Hacking around Chrome bug; should be: if ( !img.is(':visible') ) return ;
		if ( $('#actual_content').css('display') === 'none' ) return ; // Hacking around Chrome bug; should be: if ( !img.is(':visible') ) return ;
		
		if ( !self.isOnScreen(thumb) ) return ;
		var mmid = thumb.attr('mmid') ;
		self.multimediaLazyLoad ( self.mm_load[mmid] ) ;
	} ,

	isOnScreen : function ( o ) {
		var win = $(window);
		var viewport = {
			top : win.scrollTop(),
			left : win.scrollLeft()
		};
		viewport.right = viewport.left + win.width();
		viewport.bottom = viewport.top + win.height();
 
		var bounds = o.offset();
		bounds.right = bounds.left + o.outerWidth();
		bounds.bottom = bounds.top + o.outerHeight();
 
		return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
	} ,	


	fin : false
} ;



$(document).ready ( function () {
	
	tt = new ToolTranslation ( { debug:1 , tool: 'reasonator' ,
		language:'en',
		fallback:'en',
//		highlight_missing:true,
		callback : function () {
			$('#emergency').remove() ;
			$('body').show() ;

			// Load thumbnails on demand
			$(window).scroll(function(){
				$('div.unloaded_thumbnail').each ( function () {
					reasonator.loadThumb ( $(this) ) ;
				} ) ;
			} ) ;
      //setupImageClicks();
      //setupImageZoom();
	
			$('#main_content').hide() ;
	//		document.title = 'Reasonator' ;
			reasonator.init ( function () {
				reasonator.initializeFromParameters() ;
			} ) ;
		
	} , onUpdateInterface : function () {
	
			//
	
	} } ) ;

	conzeptInit();

} ) ;


/* CONZEPT PATCH */
   
let parentref		= '';
let qid 				= getParameterByName('q') || '';
let language 		= getParameterByName('lang') || 'en';
let lang3       = getParameterByName('lang3') || '';
let tags        = getParameterByName('tags') || '';
//let title				= '';
//let isMobile		= detectMobile();

setupAppKeyboardNavigation();

function detectMobile(){
	return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Mobile/i.test(navigator.userAgent) );
}

function conzeptInit(){

	//title				= escape($('#main_title_label').text());

  if ( isMobile ){

    parentref = parent;

  }
  else { // desktop

    if ( window.parent.name === 'infoframeSplit2' || window.parent.name === 'infoframe_' ){ // request from secondary content iframe
      parentref = parent;
    }
    else { // primary content frame
      parentref = parent.top;
    }

  }

  // allow any left-click to close the ULS-window in the sidebar
  $(document).click(function(e) {

    parentref.postMessage({ event_id: 'uls-close', data: { } }, '*' );

  });

}

function gotoExplore( newtab ){

	let title = $('#main_title_label').text();

  if ( newtab ){

    openInNewTab( 'https://' + CONZEPT_HOSTNAME + CONZEPT_WEB_BASE + '/explore/' + title + '?l=' + language + '&t=wikipedia&i=' + qid );

  }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'explore', title: title, hash: '', language: language } }, '*' );

  }

}

function gotoUrl( url, newtab ){

  event.preventDefault();

  console.log( 'gotoUrl: ', url, 'newtab: ', newtab );

  if ( newtab ){

    openInNewTab( url );

  }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url , title: '', hash: '', language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function bookmarkToggle(){

	//console.log('bookmark: ', qid, language );

  $('.icon .bookmark-icon').addClass('bookmarked');;
  window.parent.postMessage({ event_id: 'add-bookmark', data: {

    datasource: 'wikidata',
    qid:        qid,
    title:      $('#main_title_label').text(),
    language:   language,
    url:        document.URL,
    tags:       tags,

  } }, '*' );

	//explore.bookmarks = [];

  /*
  (async () => {

    explore.bookmarks = await explore.db.get('bookmarks');

    console.log( explore.bookmarks );

    explore.bookmarks = ( explore.bookmarks === null || explore.bookmarks === undefined ) ? [] : JSON.parse( explore.bookmarks );

    console.log( 'add bookmark' );
		//$('#main_title_label').text();

    $('.icon .bookmark-icon').addClass('bookmarked');;
    window.parent.postMessage({ event_id: 'add-bookmark', data: { } }, '*' );

		console.log('bookmarkToggle(): add-bookmark');

	})
  */

	/*
  if (  $('.icon .bookmark-icon').hasClass('bookmarked') ){ // remove bookmark

    console.log('TODO: implement remove bookmark: ', title );

    var node = findObjectByKey( explore.bookmarks, 'name', title );

    if ( valid( node[0]?.id ) ){

      console.log( node[0].id );

      window.parent.postMessage({ event_id: 'remove-bookmark', data: { id: node[0].id } }, '*' );

    }

    $('.icon .bookmark-icon').removeClass('bookmarked');

  }
  else { // add bookmark

    console.log( 'add bookmark: ', title );

    $('.icon .bookmark-icon').addClass('bookmarked');;
    window.parent.postMessage({ event_id: 'add-bookmark', data: { } }, '*' );

  }
	*/

}

function gotoVideo( newtab ){

  event.preventDefault();

	let title = $('#main_title_label').text();
  const url = CONZEPT_WEB_BASE + `/app/video/?l=${language}#/search/` + title;

  if ( newtab ){

    openInNewTab( url );

  }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url , title: title, hash: '', language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function gotoImages( newtab ){

  event.preventDefault();

	let title = $('#main_title_label').text();

  const url = `https://${CONZEPT_HOSTNAME}/${CONZEPT_WEB_BASE}/app/commons-qid/?q=${qid}&l=${language}`;

  if ( newtab ){

    openInNewTab( url );

  }
  else {

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url, title: title, hash: '', language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function gotoBooks( newtab ){

  event.preventDefault();

  //console.log( explore );

	let title = $('#main_title_label').text();

  // FIXME: when the language is changed by the user we should also update "lang3"
  const url = encodeURI( 'https://openlibrary.org/search?q=' + title + '&mode=everything&language=' + lang3 );

  if ( newtab ){

    openInNewTab( url );

  }
  else {

    window.top.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url, title: title, hash: '', language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );

  }

}

function addToCompare(){

  event.preventDefault();

	let title = $('#main_title_label').text();
  console.log( 'add-to-compare qid: ', qid )

  if ( qid !== '' ){

    window.top.postMessage({ event_id: 'add-to-compare', data: { type: 'compare', title: title, hash: '', language: language, qid: qid } }, '*' );

  }

}

function gotoWikidata( newtab ){

  event.preventDefault();

	let title = $('#main_title_label').text();

  let qid_ = valid( qid.startsWith('Q') ) ? qid : 'Q' + qid;

  const url = encodeURI( 'https://wikidata.org/wiki/' + qid_ + '?uselang=' + language );

  //if ( newtab ){

    openInNewTab( url );

  //}
  //else {
    //window.top.postMessage({ event_id: 'handleClick', data: { type: 'link', url: url, title: title, hash: '', language: language, current_pane: current_pane, target_pane: current_pane } }, '*' );
	//}

}


/*
function getParameterByName(name, url) {

  if ( !url ){
    url = window.location.href;
  }

  //name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec( url );

  if (!results) return undefined;
  if (!results[2]) return '';

  return decodeURIComponent(results[2].replace(/\+/g, " "));

}

function setupImageZoom(){ // using OpenSeaDragon

  // see: https://openseadragon.github.io/docs/
  $('#openseadragon').hide;

  window.viewer = OpenSeadragon({

    id: "openseadragon",

    prefixUrl: CONZEPT_WEB_BASE + '/app/explore2/node_modules/openseadragon/build/openseadragon/images/',

    tileSources: {
      type: 'image',
      url:  CONZEPT_WEB_BASE + '/app/explore2/assets/images/icon_home.png',
      crossOriginPolicy: 'Anonymous',
      ajaxWithCredentials: false,
      //maxZoomLevel: 10,
      //maxZoomPixelRatio: 2,
      //visibilityRatio: 0.2,
    },

    showNavigator:  true,
    navigatorSizeRatio: 0.25,

  });

  window.viewer.world.addHandler('add-item', function(event) {

    let tiledImage = event.item;

    tiledImage.addHandler('fully-loaded-change', fullyLoadedHandler);

    window.viewer.navigator.addTiledImage( {
     tileSource: tiledImage,
    });

  });

  window.viewer.setVisible(true);

}

function fullyLoadedHandler() {

  $('#loader-openseadragon').hide();

}
*/
