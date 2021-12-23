var editValueMixin = {
	methods : {
		getString : function () {
			return $(this.$el).find('textarea').val() ;
		}
	}
} ;

Vue.component ( 'edit-string-value' , {
	template : '#edit-string-value-template' ,
	mixins : [ editValueMixin ] ,
	props : [ 'mainsnak' , 'main' , 'statement' ] ,
	data : function () { return { has_focus:false , original_value:'' , changed:false } } ,
	created : function () {
		this.original_value = this.mainsnak.datavalue.value ;
	} ,
	methods : {
		keyUp : function ( ev ) {
			var me = this ;
			var s = me.getString() ;
			me.changed = (s != me.original_value) ;
		}
	}
} ) ;

Vue.component ( 'edit-wbitem-value' , {
	template : '#edit-wbitem-value-template' ,
	mixins : [ wikibaseAPImixin , editValueMixin ] ,
	props : [ 'mainsnak' , 'main' , 'statement' ] ,
	data : function () { return { list:[] , has_focus:false , original_value:'' , changed:false , last_string:'' , current_value:{} } } ,
	created : function () {
		var me = this ;
		var item = me.mainsnak.datavalue.value.id ;
		me.original_value = item ;
		me.current_value = {
			title:me.getItem(item).getLabel()[0] ,
			item:item
		} ;
	} ,
	mounted : function () {
		var me = this ;
		if ( me.main ) {
			me.has_focus = true ;
			$(me.$el).find('textarea').focus() ;
		}
	} ,
	methods : {
		updateList : function () {
			var me = this ;
			var s = me.getString() ;
			if ( me.last_string == s ) return ;
			me.last_string = s ;
			me.list = [] ;
			me.searchEntity ( s , 'item' , function ( d ) {
				var list = [] ;
				$.each ( d.search , function ( k , v ) {
					list.push ( {
						item:v.id ,
						title:v.label ,
						text:(v.description||'')
					} ) ;
				} ) ;
				me.list = list ;
			} ) ;
		} ,
		getsFocus : function () {
			this.has_focus = true ;
		} ,
		lostFocus : function () {
			this.has_focus = false ;
		} ,
		keyUp : function ( ev ) {
			var me = this ;
			me.changed = true ;
			me.statement.changed = ( me.statement.changed || me.changed ) ;
			me.current_value.title = me.getString() ;
			me.updateList() ;
		} ,
	}
} ) ;


Vue.component ( 'dropdown-list' , {
	template : '#dropdown-list-template' ,
	props : [ 'list' ] ,
	mounted : function () {
		var me = this ;
		var input = $($(me.$el).parent().find('textarea').get(0)) ;
		var p = input.position() ;
		var h = input.height() ;
		var x = parseInt(p.left) - 20 ;
		var y = parseInt(p.top) + parseInt(h) ;
		$(me.$el).css({top:y , left:x }) ;
	}
} ) ;




Vue.component ( 'snakview-value' , {
	template : '#snakview-value-template' ,
	props : [ 'mainsnak' , 'editing' , 'main' , 'statement' ]
} ) ;


Vue.component ( 'qualifiers' , {
	template : '#qualifiers-template' ,
	mixins: [wikibaseAPImixin] ,
	props : [ 'statement' , 'editing' ] ,
	methods : {
		addQualifier : function () {
			alert ( 'Not yet implemented' ) ;
		} ,
		removeQualifier : function ( prop , num ) {
			var me = this ;
			me.statement.changed = true ;
			me.statement.qualifiers[prop].splice ( num , 1 ) ;
		}
	}
} ) ;

Vue.component ( 'references' , {
	template : '#references-template' ,
	mixins: [wikibaseAPImixin] ,
	data : function () { return { collapsed:true } } ,
	props : [ 'statement' , 'editing' ] ,
	methods : {
		getReferenceCount : function () {
			if ( typeof this.statement.references == 'undefined' ) return 0 ;
			return this.statement.references.length ;
		} ,
		addReference : function () {
			alert ( 'Not yet implemented' ) ;
		}
	}
} ) ;


Vue.component ( 'reference-group' , {
	template : '#reference-group-template' ,
	mixins: [wikibaseAPImixin] ,
	props : [ 'group' , 'groupnum' , 'statement' , 'editing' ] ,
	methods : {
		addReference : function () {
			alert ( 'Not yet implemented' ) ;
		} ,
		removeReference : function ( prop , num ) {
			var me = this ;
			me.statement.changed = true ;
			me.statement.references[me.groupnum].snaks[prop].splice ( num , 1 ) ;
		} ,
		removeReferenceGroup : function () {
			var me = this ;
			me.statement.changed = true ;
			me.statement.references.splice ( me.groupnum , 1 ) ;
		} ,
	}
} ) ;


Vue.component ( 'wikidata-link' , {
	template : '#wikidata-link-template' ,
	mixins: [wikibaseAPImixin] ,
	props : [ 'item' ]
} ) ;



Vue.component ( 'item-label' , {
	template : '#item-label-template' ,
	mixins: [wikibaseAPImixin] ,
	props : [ 'item' , 'linked' , 'small' ]
} ) ;

Vue.component ( 'item-description' , {
	template : '#item-description-template' ,
	mixins: [wikibaseAPImixin] ,
	props : [ 'item' ]
} ) ;

Vue.component ( 'item-aliases' , {
	template : '#item-aliases-template' ,
	mixins: [wikibaseAPImixin] ,
	props : [ 'item'  ]
} ) ;


Vue.component ( 'string-value' , {
	template : '#string-value-template' ,
	props : [ 'mainsnak' ]
} ) ;

Vue.component ( 'external-id-value' , {
	template : '#external-id-value-template' ,
	mixins: [wikibaseAPImixin] ,
	props : [ 'mainsnak' ]
} ) ;

Vue.component ( 'wb-item-value' , {
	template : '#wb-item-value-template' ,
	props : [ 'mainsnak' ]
} ) ;

Vue.component ( 'time-value' , {
	template : '#time-value-template' ,
	props : [ 'mainsnak' ] ,
	methods : {
		render : function () {
			var me = this ;
			var time = me.mainsnak.datavalue.value.time ;
			if ( me.mainsnak.datavalue.value.calendarmodel != 'http://www.wikidata.org/entity/Q1985727' ) return time ;
			var m = time.match ( /^([\+\-]{0,1})(\d+)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)Z$/ ) ;
			if ( m === null ) return time ;
			
			if ( m[1] == '+' ) m[1] = '' ;
			
			if ( me.mainsnak.datavalue.value.precision ==  9 ) return m[1]+m[2] ;
			if ( me.mainsnak.datavalue.value.precision == 10 ) return m[1]+m[2]+'-'+m[3] ;
			if ( me.mainsnak.datavalue.value.precision == 11 ) return m[1]+m[2]+'-'+m[3]+'-'+m[4] ;
			
			return time ;
		}
	}
} ) ;

Vue.component ( 'coordinate-value' , {
	template : '#coordinate-value-template' ,
	props : [ 'mainsnak' ] ,
	methods : {
		render : function () {
			var me = this ;
			if ( me.mainsnak.datavalue.value.globe != 'http://www.wikidata.org/entity/Q2' ) return '???' ;
			
			var ns = me.mainsnak.datavalue.value.latitude > 0 ? 'N' : 'S' ;
			var ew = me.mainsnak.datavalue.value.longitude > 0 ? 'E' : 'W' ;
			
			var ret = 'https://tools.wmflabs.org/geohack/geohack.php?language=en&params='+
				me.mainsnak.datavalue.value.latitude + '_' + ns + '_' +
				me.mainsnak.datavalue.value.longitude + '_' + ew + '_globe:earth' ;
			
			return ret ;
		}
	}
} ) ;

Vue.component ( 'quantity-value' , {
	template : '#quantity-value-template' ,
	props : [ 'mainsnak' ] ,
	methods : {
		addCommas : function (nStr) {
			nStr += '';
			x = nStr.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) {
					x1 = x1.replace(rgx, '$1' + ',' + '$2');
			}
			return x1 + x2;
		} ,
		render : function () {
			var me = this ;
			var ret = me.addCommas ( me.mainsnak.datavalue.value.amount * 1 ) ;
			return ret ;
		}
	}
} ) ;



Vue.component ( 'statement' , {
	template : '#statement-template' ,
	mixins: [wikibaseAPImixin] ,
	props : [ 'statement' , 'item' ] ,
	data : function () { return { editing:false , saved_statement:{} } } ,
	mounted : function () {
		if ( typeof this.statement.changed == 'undefined' ) Vue.set ( this.statement , 'changed' , false ) ;
		if ( typeof this.statement.editing == 'undefined' ) Vue.set ( this.statement , 'changed' , false ) ;
	} ,
	methods : {
		setEditMode : function ( state ) {
			var me = this ;
			me.statement.editing = state ;
			me.editing = state ;
		} ,
		editStatement : function () {
			var me = this ;
			if ( !me.editing ) me.saved_statement = $.extend ( true , {} , me.statement ) ;
			me.setEditMode ( true ) ;
		} ,
		removeStatement : function () {
			var me = this ;
			var i = me.getItem(me.item) ;
			
			// TODO this should probably become a function in the mixin
			$.each ( i.json.claims[me.statement.mainsnak.property] , function ( k , v ) {
				if ( v.id != me.statement.id ) return ;
				me.setEditMode ( false ) ;
				i.json.claims[me.statement.mainsnak.property].splice ( k , 1 ) ;
				// TODO make edit online
				return false ;
			} ) ;
		} ,
		cancelEditStatement : function () {
			var me = this ;
			if ( me.editing ) me.statement = me.saved_statement ;
			me.statement.changed = false ;
			this.setEditMode ( false ) ;
		}
	} ,
	watch : {
		statements: {
			handler: function (val, oldVal) {
				console.log ( "statement changed" ) ;
			},
			deep: true
		}
	}
} ) ;


Vue.component ( 'statements' , {
	template : '#statements-template' ,
	props : [ 'statements' , 'item' ] ,
	data : function () { return { editing:false } } ,
	methods : {
		getProperty : function () {
			return this.statements[0].mainsnak.property ;
		} ,
		addNewStatement : function () {
			alert ( 'Not yet implemented' ) ;
		}
	} ,
	watch : {
		statements: {
			handler: function (val, oldVal) {
				var me = this ;
				var state = editing = false ;
				$.each ( this.statements , function ( k , v ) {
					if ( v.editing ) state = true ;
				} ) ;
				me.editing = state ;
			},
			deep: true
		}
	}
} ) ;



var MainPage = Vue.extend ( {
	template : '#main-page-template' ,
} ) ;

var ItemPage = Vue.extend ( {
	template : '#item-page-template' ,
	mixins: [wikibaseAPImixin] ,
	props : [ 'item' ] ,
	data : function () { return { loaded:false , i:{} , statements:[] } } ,
	created : function () { this.loadItem() } ,
	methods : {
		orderStatements : function () {
			var me = this ;
			var statements = [ {label:'Statements',list:[]} , {label:'Identifiers',list:[]} ] ;
			$.each ( (me.i.json.claims||{}) , function ( prop , claims ) {
				if ( claims[0].mainsnak.datatype == 'external-id' ) statements[1].list.push ( claims ) ;
				else statements[0].list.push ( claims ) ;
			} ) ;
			me.statements = statements ;
		} ,
		preloadRelatedItems : function ( callback ) {
			var me = this ;
			var to_load = [] ;
			$.each ( (me.i.json.claims||{}) , function ( prop , statements ) {
				to_load.push ( prop ) ;
				$.each ( statements , function ( dummy , statement ) {
					if ( statement.mainsnak.datatype == 'wikibase-item' ) to_load.push ( statement.mainsnak.datavalue.value.id ) ;
					if ( typeof statement.qualifiers != 'undefined' ) {
						$.each ( statement.qualifiers , function ( k1 , v1 ) {
							$.each ( v1 , function ( k2 , v2 ) {
								to_load.push ( v2.property ) ;
								if ( v2.datatype == 'wikibase-item' ) to_load.push ( v2.datavalue.value.id ) ;
							} ) ;
						} ) ;
					}
					if ( typeof statement.references != 'undefined' ) {
						$.each ( statement.references , function ( k1 , v1 ) {
							$.each ( v1.snaks , function ( k2 , v2 ) {
								$.each ( v2 , function ( k3 , v3 ) {
									to_load.push ( v3.property ) ;
									if ( v3.datatype == 'wikibase-item' ) to_load.push ( v3.datavalue.value.id ) ;
								} ) ;
							} ) ;
						} ) ;
					}
				} ) ;
			} ) ;
			me.loadItems ( to_load , callback ) ;
		} ,
		loadItem : function () {
			var me = this ;
			me.loaded = false ;
			me.loadItems ( [ me.item ] , function () {
				me.i = me.getItem ( me.item ) ;
				me.preloadRelatedItems ( function () {
					me.orderStatements() ;
					me.loaded = true ;
				} ) ;
			} ) ;
		}
	} ,
	watch: {
		'$route' (to, from) {
			this.loadItem() ;
		}
	}
} ) ;

var router ;
var app ;


const routes = [
  { path: '/', component: MainPage },
  { path: '/item/:item', component: ItemPage , props:true },
] ;

$(document).ready ( function () {
	router = new VueRouter({routes}) ;
	app = new Vue ( { router } ) .$mount('#app') ;
} ) ;

