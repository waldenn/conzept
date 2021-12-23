function GeneaWiki ( id ) {

	// Constructor
	this.column_spacing = 40 ;
	this.line_height = 20 ;
	this.char_multiplier = 8 ;
	this.group_id = 'geneawiki_base_group' ;
	this.id = id ;
	this.languages = [ 'en' ] ;
	this.people = {} ;

	this.load = function ( q , callback ) {
		this.callback = callback ;
		this.root_q = q.replace(/\D/g,'') ;
		this.running = 0 ;
		this.loadPerson ( [this.root_q] ) ;
	}


	this.initializePerson = function ( q ) {
		var self = this ;
		if ( self.people[q] !== undefined ) {
			console.log ( "PANIC : " + q + " is already initialized" ) ;
			return ;
		}
		self.people[q] = {
			childOf : {} ,
			parentOf : {} ,
			gender : '?' ,
			placeholder : true
		} ;
	}

	this.loadPerson = function ( ql ) {
		var self = this ;
		while ( ql.length > 0 ) {
			var ids = [] ;
			while ( ids.length < 50 && ql.length > 0 ) {
				var q = ql.shift() ;
				if ( self.people[q] !== undefined && !self.people[q].placeholder ) return ; // Done that
				if ( self.people[q] === undefined ) self.initializePerson ( q ) ; // For root_q
				ids.push ( 'Q'+q ) ;
			}
			if ( ids.length === 0 ) return ;
			self.running++ ;
			self.updateStatus() ;
			$.getJSON ( '//www.wikidata.org/w/api.php?callback=?' , {
				action : 'wbgetentities' ,
				ids : ids.join('|') ,
				languages : self.languages.join('|') ,
				props : 'info|aliases|labels|descriptions|claims' ,
				format : 'json'
			} , function ( data ) {
				self.load_next = {} ;
				$.each ( data.entities , function ( k , v ) {
					var q = k.replace(/\D/g,'') ;
					self.people[q].raw = data.entities['Q'+q] ;
					self.people[q].placeholder = false ;
					self.parsePerson ( q ) ;
				} ) ;
				var nql = [] ;
				$.each ( self.load_next , function ( nq , dummy ) {
					nql.push ( nq ) ;
				} ) ;
//				console.log ( nql ) ;
				if ( nql.length > 0 ) self.loadPerson ( nql ) ;
				self.running-- ;
				self.updateStatus() ;
				self.doLayout() ;
			} ) ;
		}
	}


	this.updateStatus = function () {
		if ( this.status_id === undefined ) return ;
		var pc = 0 ;
		$.each ( this.people , function(){pc++} ) ;
		$('#'+this.status_id).html ( pc+" people loaded, "+this.running+" queries to go" ) ;
	}

	this.parsePerson = function ( q ) {
		var self = this ;
		var person = self.people[q] ;
		
		// Get a name
		person.name = 'Q'+q ;
		if ( undefined !== person.raw.labels ) {
			$.each ( self.languages , function ( k , v ) {
				if ( undefined === person.raw.labels[v] ) return ;
				person.name = person.raw.labels[v].value ;
				return false ;
			} ) ;
		}
		
		// Get a description
		person.desc = '' ;
		if ( undefined !== person.raw.descriptions ) {
			$.each ( self.languages , function ( k , v ) {
				if ( undefined === person.raw.descriptions[v] ) return ;
				person.desc = person.raw.descriptions[v].value ;
				return false ;
			} ) ;
		}

		// TODO get image
		
		// Link and search relatives
		$.each ( person.raw.claims||[] , function ( property , v ) {
			if ( v === undefined || v[0].mainsnak === undefined || v[0].mainsnak.datavalue === undefined ) return ;
			var p = property.replace ( /\D/g , '' ) ;
			if ( p == '21' ) { // Sex
				var q2 = v[0].mainsnak.datavalue.value['numeric-id'] ;
				if ( q2 == 44148 || q2 == 6581097 ) self.setGender ( q , 'M' ) ;
				else if ( q2 == 43445 || q2 == 6581072 ) self.setGender ( q , 'F' ) ;
			} else if ( p == '22' || p == '25' || p == '40' ) {
				$.each ( v , function ( k2 , v2 ) {
					var q2 = v2.mainsnak.datavalue.value['numeric-id'] ;
					if ( p == '40' ) self.addParentToChild ( q , q2 ) ; // Child
					else if ( p == '22' ) { self.addParentToChild ( q2 , q ) ; self.setGender(q2,'M') ; } // Father
					else if ( p == '25' ) { self.addParentToChild ( q2 , q ) ; self.setGender(q2,'F') ; } // Mother
				} ) ;
			}
		} ) ;
		
	}
	
	this.ensurePerson = function ( q ) {
		if ( this.people[q] !== undefined ) return ;
		this.load_next[q] = 1 ;
		this.initializePerson ( q ) ;
	}
	
	this.addParentToChild = function ( parent , child ) {
		this.ensurePerson ( parent ) ;
		this.ensurePerson ( child ) ;
		this.people[parent].parentOf[child] = (this.people[parent].parentOf[child]||0) + 1 ;
		this.people[child].childOf[parent] = (this.people[child].childOf[parent]||0) + 1 ;
	}
	
	this.setGender = function ( q , gender ) {
		this.people[q].gender = gender ; // TODO some warning message for conflicting gender reports
	}
	
	this.doLayout = function () {
		var self = this ;
		if ( self.running > 0 ) return ;

		self.acquireColumns ( self.root_q , 0 ) ;
		var min = 0 ;
		self.max_column = 0 ;
		$.each ( self.people , function ( k , v ) { if ( min > v.column ) min = v.column } ) ;
		$.each ( self.people , function ( k , v ) {
			v.column += -min ;
			if ( v.column > self.max_column ) self.max_column = v.column ;
			v.est_col_width = v.name.length * self.char_multiplier ;
		} ) ;
		self.finishLayout() ;
	}
	
	this.finishLayout = function () {
		var self = this ;
		
		var people_by_column = {} ;
		$.each ( self.people , function ( k , v ) {
			if ( people_by_column[v.column] === undefined ) people_by_column[v.column] = [] ;
			people_by_column[v.column].push ( k ) ;
		} ) ;
		
		$.each ( people_by_column , function ( column , qs ) {
		
			// Initialize
			var in_column = {} ;
			$.each ( qs , function ( k , v ) {
				in_column[v] = 1 ;
				self.people[v].sortkey1 = 'Z' ;
				self.people[v].sortkey2 = 'Z'+v ;
			} ) ;
			
			// Primary sort key
			$.each ( qs , function ( k , q ) {
				$.each ( self.people[q].parentOf , function ( cq , dummy1 ) {
					var had_sex = [] ;
					$.each ( self.people[cq].childOf , function ( pq , dummy2 ) {
						if ( undefined !== in_column[pq] ) had_sex.push ( pq ) ;
					} ) ;
					had_sex = had_sex.sort() ;
					if ( had_sex.length > 0 ) self.people[q].sortkey1 = "A" + (9-had_sex.length) + "/" + had_sex.join(',') + "/" + self.people[q].gender ;//+ ":" + q ;
				} ) ;
			} ) ;
			
			// Secondary sort key
			$.each ( qs , function ( k , q ) {
				var parents = [] ;
				$.each ( self.people[q].childOf , function ( pq , dummy1 ) {
					parents.push ( pq ) ;
				} ) ;
				if ( parents.length == 0 ) return ;
				parents = parents.sort() ;
				self.people[q].sortkey2 = "B" + parents.join(',') + ":" + q ;
			} ) ;
			
			// Sort by keys
			qs = qs.sort ( function ( a , b ) {
				if ( self.people[a].sortkey1 < self.people[b].sortkey1 ) return -1 ;
				if ( self.people[a].sortkey1 > self.people[b].sortkey1 ) return 1 ;
				if ( self.people[a].sortkey2 < self.people[b].sortkey2 ) return -1 ;
				if ( self.people[a].sortkey2 > self.people[b].sortkey2 ) return 1 ;
				return b - a ;
			} ) ;
			
		} ) ;
		
		
		// Assining rows
		$.each ( people_by_column , function ( column , qs ) {
			var row = 0 ;
			$.each ( qs , function ( k , q ) {
//				console.log ( self.people[q].name + " : " + self.people[q].sortkey1 + " / " + self.people[q].sortkey2 ) ;
				self.people[q].row = row++ ;
			} ) ;
		} ) ;
		
		self.assignCoordinates() ;
	}
		
	this.assignCoordinates = function () {
		var self = this ;

		self.est_col_width = [] ;
		self.est_col_xoff = [] ;
		for ( var c = 0 ; c <= self.max_column ; c++ ) {
			self.est_col_width[c] = 0 ;
			$.each ( self.people , function ( k , v ) {
				if ( v.column != c ) return ;
				if ( v.est_col_width > self.est_col_width[c] ) self.est_col_width[c] = v.est_col_width ;
			} ) ;
			if ( c == 0 ) self.est_col_xoff[c] = 0 ;
			else self.est_col_xoff[c] = self.est_col_xoff[c-1] + self.est_col_width[c-1] + self.column_spacing ;
		}

		var xoff = 10 ;
		var yoff = 10 ;
		var vb = { x1:0 , x2:0 , y1:0 , y2:0 } ;
		$.each ( self.people , function ( k , v ) {
			v.rect = {
				x1 : self.est_col_xoff[v.column] + xoff ,
				y1 : self.line_height * v.row + yoff ,
				x2 : self.est_col_xoff[v.column] + self.est_col_width[v.column] + xoff ,
				y2 : self.line_height * (v.row+1) - 5 + yoff 
			} ;
			v.rect.w = v.rect.x2 - v.rect.x1 + 1 ;
			v.rect.h = v.rect.y2 - v.rect.y1 + 1 ;
			if ( vb.x1 > v.rect.x1 ) vb.x1 = v.rect.x1 ;
			if ( vb.x2 < v.rect.x2 ) vb.x2 = v.rect.x2 ;
			if ( vb.y1 > v.rect.y1 ) vb.y1 = v.rect.y1 ;
			if ( vb.y2 < v.rect.y2 ) vb.y2 = v.rect.y2 ;
		} ) ;
		self.view_box = vb ;
		
		self.render() ;
	}
	
	this.acquireColumns = function ( q , column ) {
		var self = this ;
		if ( self.people[q].column !== undefined ) return ; // Had that
		self.people[q].column = column ;
		$.each ( self.people[q].childOf , function ( q2 , dummy ) { self.acquireColumns ( q2 , column-1 ) ; } ) ;
		$.each ( self.people[q].parentOf , function ( q2 , dummy ) { self.acquireColumns ( q2 , column+1 ) ; } ) ;
	}
	
	this.render = function () {
		var self = this ;
		if ( self.running > 0 ) return ;

		var h = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" >' ;
		h += '<g id="' + self.group_id + '">' ;
		
		// Connections
		h += "<g>" ;
		var parents_color_index = {} ;
		var parents_color_index_count = 0 ;
		var parents_colors = [ 'dodgerblue' , 'crimson' , 'forestgreen' , 'darkorange' , 'darkviolet' , 'lightcoral' ] ;
		$.each ( self.people , function ( k , v ) {
			var parents = [] ;
			$.each ( v.childOf , function ( k2 , v2 ) { parents.push ( k2 ) ; } ) ;
			if ( parents.length == 1 ) {
				var xa = self.people[parents[0]].rect.x2 ;
				var ya = Math.floor ( self.people[parents[0]].rect.y1 + self.people[parents[0]].rect.h/2 ) ;
				var x = Math.floor ( xa + self.column_spacing / 3 ) ;
				var y = ya ;

				var xc = v.rect.x1 ;
				var yc = Math.floor ( v.rect.y1 + v.rect.h/2 ) ;
				
				var linestyle = 'stroke:grey;stroke-width:1' ;
				h += "<line x1="+xa+" y1="+ya+" x2="+x+" y2="+y+" style='"+linestyle+"'/>" ;
				h += "<line x1="+xc+" y1="+yc+" x2="+x+" y2="+y+" style='"+linestyle+"'/>" ;

			} else if ( parents.length == 2 ) {
				var xa = self.people[parents[0]].rect.x2 ;
				var xb = self.people[parents[1]].rect.x2 ;
				var x = xa > xb ? xa : xb ;
				x += Math.floor ( self.column_spacing / 3 ) ;
				
				var ya = Math.floor ( self.people[parents[0]].rect.y1 + self.people[parents[0]].rect.h/2 ) ;
				var yb = Math.floor ( self.people[parents[1]].rect.y1 + self.people[parents[1]].rect.h/2 ) ;
				var y = Math.floor ( ya + yb ) / 2 ;

				var xc = v.rect.x1 ;
				var yc = Math.floor ( v.rect.y1 + v.rect.h/2 ) ;
				
				var cid = parents[0] < parents[1] ? parents[0]+'/'+parents[1] : parents[1]+'/'+parents[0] ;
				if ( undefined === parents_color_index[cid] ) {
					parents_color_index[cid] = parents_colors[parents_color_index_count % parents_colors.length] ;
					parents_color_index_count++ ;
				}
				
				var linestyle = 'stroke:' + parents_color_index[cid] + ';stroke-width:1' ;
				h += "<line x1="+xa+" y1="+ya+" x2="+x+" y2="+y+" style='"+linestyle+"'/>" ;
				h += "<line x1="+xb+" y1="+yb+" x2="+x+" y2="+y+" style='"+linestyle+"'/>" ;
				h += "<line x1="+xc+" y1="+yc+" x2="+x+" y2="+y+" style='"+linestyle+"'/>" ;
				
			} else return ;
		} ) ;
		h += "</g>" ;
		
		// People boxes
		$.each ( self.people , function ( k , v ) {
			var x = v.rect.x1 + 2 ;
			var y = v.rect.y2 - 2 ;
			var col = '#888888' ;
			var gi = '&nbsp;' ;
			if ( v.gender == 'M' ) { col = 'blue' ; gi = '♂' ; }
			else if ( v.gender == 'F' ) { col = 'red' ; gi = '♀' ; }
			var sw = 1 ;
			var stroke_col = 'grey' ;
			if ( k == self.root_q ) { sw = 2 ; stroke_col = 'black' ; }
			h += "<g>" ;
			h += "<title>" + v.desc + "</title>" ;
			h += '<rect x="'+v.rect.x1+'" y="'+v.rect.y1+'" width="'+v.rect.w+'" height="'+v.rect.h+'"' ;
			h += 'style="fill:'+col+';stroke:'+stroke_col+';stroke-width:'+sw+';fill-opacity:0.5"/>' ;
			h += '<a xlink:href="//www.wikidata.org/wiki/Q' + k + '" target="new">' ;
			h += '<text x="'+x+'" y="'+y+'" fill="white">'  + v.name + '</text>' ; // + gi + "&nbsp;"
			h += "</a>" ;
			h += "</g>" ;
		} ) ;
		h += '</g></svg>' ;
		$('#'+this.id).html ( h ) ;
		
		$('#'+this.id+' svg').svgPan(self.group_id);
		self.zoomFull() ;
		$('#'+self.id+' svg').css ( { width : '100%' , height : '100%' } ) ;
		if ( self.callback !== undefined ) self.callback() ;
	}
	
	this.zoomFull = function () {
		var vb = this.view_box ;
		var z = ($('#'+this.id).width()) / (vb.x2-vb.x1+7) ;
		$('#'+ this.group_id).attr('transform','scale('+z+')');
	}

}
