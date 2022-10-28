var nodes ;
var vars ;
var tree ; // d3
var max_depth = 9999999 ;

function getUrlVars() {
  vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
}

$(document).ready ( function () {
  
  getUrlVars() ;
  if ( vars.q === undefined || ( vars.p === undefined && vars.rp === undefined ) ) return ;

  $('#intro').hide() ;
  //$('#loading').html('Loading data...').show() ;
  
  var roots = (vars.q+'').replace(/[^0-9,]/g,'').split(',') ;
  var props = vars.p===undefined?[]:(vars.p+'').replace(/[^0-9,]/g,'').split(',') ;
  var rprops = vars.rp===undefined?[]:(vars.rp+'').replace(/[^0-9,]/g,'').split(',') ;
  var pref_lang = vars.lang===undefined ? '' : vars.lang ;
  var method = vars.method===undefined ? 'list' : vars.method ;
  max_depth = vars.depth===undefined ? max_depth : vars.depth ;

  var getprops = [] ;
  $.each ( props , function ( k , v ) { getprops.push(v) } ) ;
  $.each ( rprops , function ( k , v ) { getprops.push(v) } ) ;
  getprops = $.unique(getprops) ;
  
//  var query = vars.query || ('tree['+roots.join(',')+']['+props.join(',')+']['+rprops.join(',')+']') ;
  
  
  var sparql = 'SELECT ?item' ;
  $.each ( getprops , function ( k , v ) {
    sparql += ' ?V' + v ;
  } ) ;
  sparql += ' WHERE { VALUES ?roots {wd:Q' + roots.join(' wd:Q') + '} ' ;
  if ( props.length > 0 ) {
    sparql += ' . ?tree0 (wdt:P' + props.join('|wdt:P') + ')* ?item' ;
    if ( rprops.length > 0 ) sparql += ' . ?tree0 (wdt:P' + rprops.join('|wdt:P') + ')* ?roots }' ;
  } else {
    sparql += ' . ?item (wdt:P' + rprops.join('|wdt:P') + ')* ?roots' ;
  }
  $.each ( getprops , function ( k , v ) {
    sparql += ' OPTIONAL { ?item wdt:P' + v + ' ?V' + v + ' }' ;
  } ) ;
  sparql += ' }' ;

  $.get ( 'https://query.wikidata.org/sparql' , {
    query:sparql,
    format:'json'
  } , function ( d ) {

    nodes = {} ;
    $.each ( d.results.bindings , function ( dummy , v ) {
      if ( v.item.type != 'uri' ) return ;
      var q = v.item.value.replace ( /^.+\/Q/ , 'Q' ) ;
      nodes[q] = { parents:[] , children:[] } ;
    } ) ;

    $.each ( roots , function ( dummy , q ) {
      nodes['Q'+q].depth = 0 ;
    } ) ;

    $.each ( getprops , function ( dummy0 , prop ) {
      var is_rp = $.inArray(prop,props)!=-1 ? true : false ;
      $.each ( d.results.bindings , function ( dummy , result ) {
        if ( typeof result['V'+prop] == 'undefined' ) return ;
        if ( result['V'+prop].type != 'uri' ) return ;
        var q1 = result.item.value.replace ( /^.+\/Q/ , 'Q' ) ;
        var q2 = result['V'+prop].value.replace ( /^.+\/Q/ , 'Q' ) ;
        if ( typeof nodes[q1] == 'undefined' ) return ;
        if ( typeof nodes[q2] == 'undefined' ) return ;
        if ( is_rp ) nodes[q2].parents.push ( q1 ) ;
        else nodes[q1].parents.push ( q2 ) ;
      } ) ;
    } ) ;


/*
  } , 'json' ) ;


  $.getJSON ( '//wdq.wmflabs.org/api?callback=?' , {
    q:query ,
    props:getprops.join(',')
  } , function ( d ) {


    nodes = {} ;
    $.each ( d.items , function ( dummy , q ) {
      q = 'Q'+q ;
      nodes[q] = { parents:[] , children:[] } ;
    } ) ;

    $.each ( roots , function ( dummy , q ) {
      nodes['Q'+q].depth = 0 ;
    } ) ;

    $.each ( getprops , function ( dummy0 , prop ) {
      if ( undefined === d.props[prop] ) return ;
      var is_rp = $.inArray(prop,props)!=-1 ? true : false ;
      $.each ( d.props[prop] , function ( dummy , v ) {
        if ( v[1] != 'item' ) return ;
        var q1 = "Q"+v[0] ;
        var q2 = "Q"+v[2] ;
        if ( undefined === nodes[q1] ) return ;
        if ( undefined === nodes[q2] ) return ;
        if ( is_rp ) nodes[q2].parents.push ( q1 ) ;
        else nodes[q1].parents.push ( q2 ) ;
      } ) ;
    } ) ;
*/
    // Init parents
    var number_of_nodes = 0 ;
    $.each ( nodes , function ( q , v ) {
      number_of_nodes++ ;
      if ( v.parents.length == 0 ) v.depth = 0 ; // Parent node(s)
    } ) ;

    // Calculate node depth and main parent
    var again = true ;
    var fallback = false ;
    while ( again ) {
      again = false ;
      var found = false ;
      $.each ( nodes , function ( q , v ) {
        if ( v.depth !== undefined ) return ; // Done this one
        var has_unknown = false ;
        var max_parent_depth = 0 ;
        $.each ( v.parents , function ( dummy , q2 ) {
          if ( nodes[q2].depth !== undefined ) {
            if ( max_parent_depth < nodes[q2].depth ) {
              max_parent_depth = nodes[q2].depth ;
              v.main_parent = q2 ;
            }
          } else if ( !fallback ) {
            has_unknown = true ;
            again = true ;
            return false ;
          }
        } ) ;
        if ( !has_unknown ) {
          found = true ;
          v.depth = max_parent_depth + 1 ;
          if ( undefined === v.main_parent ) v.main_parent = v.parents[0] ;
          nodes[v.main_parent].children.push ( q ) ;
        }
      } ) ;
      if ( !found ) {
        if ( fallback ) break ;
        else fallback = true ;
      }
    }


    if ( method == 'list' ) {
      // Draw tree
      var unlinked = [] ;
      var h = '' ;
      if ( number_of_nodes <= 250 ) h += "<div><a href='" + window.location.href.replace(/&method=[a-z0-9]+/,'') + "&method=d3'>Show this as d3 \"star tree\"</a></div>" ;
      h += '<ol>' ;
      $.each ( nodes , function ( q , v ) {
        if ( v.depth === undefined ) unlinked.push ( q ) ;
        else if ( v.depth == 0 ) h += getNodeHTML ( q ) ;
      } ) ;
      h += '</ol>' ;
    
      if ( unlinked.length > 0 ) {
        h += "<h2>Unlinked items</h2><ol>" ;
        $.each ( unlinked , function ( dummy , q ) {
          h += "<li><span q='" + q + "'>" + q + "</span></li>" ;
        } ) ;
        h += "</ol>" ;
      }
    
      $('#tree').html ( h ) ;

      /*
      $('#loading').html('Loading labels...').show() ;
      var itemlist = [] ;
      $.each ( nodes , function ( q , v ) { itemlist.push(q) } ) ;
    
      $.post ( './get_item_names.php' , {
        items:itemlist.join(','),
        lang:pref_lang
      } , function ( d ) {
        $.each ( d.i2n , function ( q , label ) {
          if ( typeof label != 'string' ) label = q ;
          $('#'+q).html ( label ) ;
        } ) ;
        $('#loading').hide() ;
      } , 'json' ) ;
      */

    } else if ( method == 'd3' ) {
      
      var h = "<div><a href='" + window.location.href.replace(/&method=[a-z0-9]+/,'') + "&method=list'>Show this as list</a></div>" ;
      $('#tree').html ( h ) ;
    
      var num_roots = 0 ;
      $.each ( nodes , function ( q , v ) {
        if ( v.depth == 0 ) num_roots++ ;
      } ) ;
      
      var min_root = 0 ;
      if ( num_roots > 0 ) { // Todo
        min_root = -1 ;
      }

      var itemlist = [] ;
      $.each ( nodes , function ( q , v ) { itemlist.push(q) } ) ;
    
      /*
      $('#loading').html('Loading labels...').show() ;
      $.post ( './get_item_names.php' , {
        items:itemlist.join(','),
        lang:pref_lang
      } , function ( d ) {

        var d3o ;
        $.each ( nodes , function ( q , v ) {
          if ( v.depth == 0 ) d3o = nodes2d3 ( q , nodes , d.i2n ) ;
        } ) ;
      
        $('#loading').hide() ;
      
        render_d3 ( d3o ) ;
      } ) ;
      */
      
    }


  } , 'json' ) ;
} ) ;


function render_d3 ( root ) {
  var diameter = 960;

  tree = d3.layout.tree()
    .size([360, diameter / 2 - 120])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

  var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

  var svg = d3.select("#d3_tree").append("svg")
    .attr("width", diameter)
    .attr("height", diameter - 150)
    .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    var nodes = tree.nodes(root),
      links = tree.links(nodes);

    var link = svg.selectAll(".link")
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);

    var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

    node.append("circle")
      .attr("r", 4.5);

    node.append("text")
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
      .text(function(d) { return d.name; })
      .on('click',function(d){window.open('//www.wikidata.org/wiki/'+d.q,'_blank');});

  d3.select(self.frameElement).style("height", diameter - 150 + "px");
}


function nodes2d3 ( q , nodes , i2n ) {
  var ret = { name:i2n[q] , q:q } ;
  if ( nodes[q].children.length > 0 ) {
    ret.children = [] ;
    $.each ( nodes[q].children , function ( dummy , qc ) {
      ret.children.push ( nodes2d3 ( qc , nodes , i2n ) ) ;
    } ) ;
  }
  return ret ;
}

window.gotoArticle = function( q ){

  //console.log( q );

  var url = CONZEPT_WEB_BASE + '/app/wikipedia/?t=&l=' + window.getParameterByName('lang') + '&qid=' + q;
  window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', url: url, current_pane: getCurrentPane(), target_pane: getTargetPane(), ids: '' } }, '*' );
  
}


function getNodeHTML ( q ) {
  var col = nodes[q].depth ;
  if ( col > 15 ) col = 15 ;
  col = 15 - col ;
  if ( col < 5 ) col = 5 ;
  col = col.toString(16);
  col = col+''+col ;
  col = '#'+col+col+col ;

  var h = "" ;

  h += '<li style="background:'+col+'"><a onclick=gotoArticle(&quot;' + q + '&quot;)><span id="' + q + '">' + q + '</span></a>' ;
  //h += "<li style='background:"+col+"'><a target='_blank' href='//www.wikidata.org/wiki/" + q + "'><span id='" + q + "'>" + q + "</span></a>" ;

//  h += " <small>["+nodes[q].depth+"]</small>" ;
  h += "</li>" ;
  if ( nodes[q].children.length > 0 && nodes[q].depth < max_depth ) {
    h += "<ol>" ;
    $.each ( nodes[q].children , function ( dummy , qc ) {
      h += getNodeHTML ( qc ) ;
    } ) ;
    h += "</ol>" ;
  }
  return h ;
}
