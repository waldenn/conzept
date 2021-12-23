var word  = getParameterByName('q') || '';
var l     = getParameterByName('l') || 'en';  // language
var f     = getParameterByName('f') || false; // fullscreen

/*
if ( screenfull.enabled ) { // change to: isEnabled()

  if ( f ){ // go fullscreen
    screenfull.request();
  }
  else { // exit fullscreen
    screenfull.exit();
  }
}
*/

$( document ).ready( function() {

  // FIXME: hide labels when behind globe
  //        http://bl.ocks.org/tlfrd/raw/df1f1f705c7940a6a7c0dca47041fec8/

  function redraw(){

    $('#search').change(function(){

      $("#searchsubmit").trigger('click');

    }); 

    var ENDPOINT = "https://query.wikidata.org/sparql";

    var encodeQuery = query => {
      return ENDPOINT + "?query=" + encodeURIComponent(query);
    };

    var queryItem = Word => {
      var query = "SELECT ?item  (count(?label) as ?c)  where { " +
        "?item rdfs:label \"" + Word + '\"@' + l + ' . ' +
        "?item rdfs:label ?label . " +
        "FILTER NOT EXISTS { ?item wdt:P31 wd:Q101352 . } " +
        'SERVICE wikibase:label { bd:serviceParam wikibase:language \"' + l + '\" . } ' +
        "} " +
        "group by ?item " +
        "ORDER BY DESC(?c) " +
        "LIMIT 1 ";
      return encodeQuery(query);
    };

    var queryTranslations = item => {
      var query = "SELECT DISTINCT ?label ?langLabel ?lon ?lat { " +
        "<" + item + "> rdfs:label ?label . " +
        "bind(lang(?label) as ?code) . " +
        "?lang wdt:P424 ?code . " + //wikimedia code             
        "?lang p:P625 ?coordinate . " +
        "?coordinate psv:P625 ?coordinate_node . " +
        "?coordinate_node wikibase:geoLongitude ?lon . " +
        "?coordinate_node wikibase:geoLatitude ?lat . " +
        'SERVICE wikibase:label { bd:serviceParam wikibase:language \"' + l + '\" . } ' +
        //"SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\" . } " +
        "}";
      return encodeQuery(query);
    };

    var getXMLHttpRequest = url => {

      //console.log( url );

      return rxjs.Observable.create(observer => {

        const req = new XMLHttpRequest();

        req.open('GET', url);

        req.overrideMimeType('application/sparql-results+json');

        req.onload = () => {
          if (req.status === 200) {
            observer.next(req.responseText);
            observer.complete();
            //console.log( 'success' );
          } else {
            observer.error(new Error(req.statusText));
            //console.log( 'error' );
          }
        };

        req.crossDomain = true;

        req.onerror = () => {
          observer.error(new Error("An error occured"));
          d3.selectAll(".label").remove();
          d3.select("#map")
            .append("text")
            .attr("class", "messagenotfound")
            .attr("x", "50%")
            .attr("y", "50%")
            .html("word not found")
        };

        req.setRequestHeader('Accept', 'application/json, text/javascript');

        req.send();
      });

    };

    //for tooltip 
    var offsetL = document.getElementById("svgdiv").offsetLeft + 30;
    var offsetT = document.getElementById("svgdiv").offsetTop + 30;
    var points; //set of points; each point represents a word

    var tooltip = d3.select("#svgdiv")
      .append("div")
      .attr("class", "tooltip hidden");


    // load geojson   
    d3.json("globe.json", json => {
      //to do: improve display of country names using a voronoi tessellation with d3 v4
      //see https://bl.ocks.org/Fil/b91d97962d99be2145853c0cfb9c115d

      // width and height                
      //var w = document.querySelector('body').clientWidth;
      //var h = document.querySelector('body').clientHeight;

      var w = window.innerWidth;
      var h = window.innerHeight;
      //console.log( w , h);

      var starttooltip = d3.select("#svgdiv");
      //.append("div")
      //.attr("class", "starttooltip")
      //.style("left", "30%")
      //.style("top", "30%")
      //.html("Type an English word in the search bar and see its translations on the map. <br><br>Data is extracted from Wikidata - from item labels in different languages and language coordinate locations.");

      // scale globe to size of window
      var scl = Math.min(w, h) / 2.0,
        currentScl = scl;

      // map projection        
      var projection = d3.geoOrthographic()
        .scale(scl)
        .translate([Math.max(scl, w / 1.9), Math.max(scl, h / 1.9)]);

      var path = d3.geoPath()
        .projection(projection);

      // append svg       
      var svg = d3.select("#svgdiv")
        .append("svg")
        .attr("width", '100vw')
        .attr("height", '100vh');
        //.attr("width", Math.max(scl * 2.5, w))
        //.attr("height", Math.max(scl * 2.5, h));

      // append g element for map                                  
      var map = svg.append("g")
        .attr("id", "map");

      // enable drag         
      var drag = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged);

      var gpos0, o0, gpos1, o1;
      svg.call(drag);

      // enable zoom                   
      var zoom = d3.zoom()
        .scaleExtent([0.75, 50]) //bound zoom                                       
        .on("zoom", zoomed);

      svg.call(zoom);

      function showCountryTooltip(d) {

        var label = "<b>" + d.properties.NAME_ENGL + "</b>";
        if (typeof points !== 'undefined' && points.length > 0) {
          var tooltipArray = points.filter(p => d3.geoContains(d, p.coordinates))
            .map(p => p.label + " (" + p.language + ")");
          if (typeof tooltipArray !== undefined && tooltipArray.length > 0) {
            label += "<hr>";
            label += [...new Set(tooltipArray)].join("<br>");
          }
        }
        var mouse = d3.mouse(svg.node())
          .map(d => parseInt(d));
        tooltip.classed("hidden", false)
          .attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px;")
          .html(label);
      }

      function showArticle( d ){

        console.log('show article: ', d.label, d.iso2 );

        var url = '/app/wikipedia/?t=' + d.label + '&l=' + d.iso2 + '&qid=';
        window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: d.label, url: url, current_pane: getCurrentPane(), target_pane: getTargetPane(), ids: '' } }, '*' );
        
      }

      function showWordTooltip(d) {
        var label = d.label + " (" + d.language + ")";
        var mouse = d3.mouse(svg.node())
          .map(d => parseInt(d));
        tooltip.classed("hidden", false)
          .attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px;")
          .html(label);
      }

      map.append("path")
        .datum({
          type: "Sphere"
        })
        .attr("class", "ocean")
        .attr("d", path)
        .on("mouseover", () => {
          tooltip.classed("hidden", true);
        })
        .on("mouseout", () => {
          tooltip.classed("hidden", true);
        });

      map.selectAll("lands")
        .data(json.features)
        .enter()
        .append("path")
        .attr("class", "land")
        .attr("d", path)
        .on("mouseover", showCountryTooltip)
        .on("mouseout", () => {
          tooltip.classed("hidden", true);
        });

      var labelPadding = 6;

      // the component used to render each label               
      var textLabel = fc.layoutTextLabel()
        .padding(labelPadding)
        .value(d => d.label);

      // a strategy that combines simulated annealing with removal    
      // of overlapping labels            
      var strategy = fc.layoutRemoveOverlaps(fc.layoutGreedy());

      // create the layout that positions the labels                             
      var labels = fc.layoutLabel(strategy)
        .size((_, i, g) => {
          // measure the label and add the required padding          
          var textSize = d3.select(g[i])
            .select('text')
            .node()
            .getBBox();
          /*
          d3.select(g[i])
            .select('text')
            .node().style.fontWeight = "bold";
          d3.select(g[i])
            .select('text')
            .node().style.fontFamily = "Cairo";
          d3.select(g[i])
            .select('text')
            .node().style.textShadow = "2px 2px  0 white";
          d3.select(g[i])
            .select('text')
            .node().style.fontSize = "1.5em";
          */
          return [textSize.width + labelPadding * 2, textSize.height + labelPadding * 2];
        })
        .component(textLabel);

      /*  // render labels                                                       
        map.datum(centroids.filter(d => !(isNaN(d.coordinates[0]) || isNaN(d.coordinates[1]))))
      .call(labels.position(d => d.coordinates));
      */

      /*
      d3.select("#question")
        .on("mouseover", () => {
          var starttooltip = d3.select("#svgdiv")
            .append("div")
            .attr("class", "questiontooltip")
            .style("left", "30%")
            .style("top", "30%")
            .html("Cannot find a translation in a specific language? This visualization uses data available in Wikidata. Check that the label of the selected Wikidata item in that language is available. Still cannot find it? Check that the language has the property \"coordinate location\". Otherwise add missing data to Wikidata, wait some time, and the visualization will update itself!")
        })
        .on("mouseout", () => {
          d3.select(".questiontooltip")
            .remove();
        });
      */

      d3.select("#searchsubmit").on("click", () => {

        newWordSearch();

      })

      // only once: check if we can do a search-by-parameter
      if ( word !== '' ){
        $('#search').val( word ).trigger('change');
      }

      function newWordSearch() {

        d3.select(".starttooltip")
          .remove();

        word = d3.select("#search").node().value;

        getXMLHttpRequest(queryItem(word) + "&origin=*")

          .subscribe(r => {
            var item = JSON.parse(r)
              .results
              .bindings
              .map(p => {
                return p.item.value;
              })[0];

            getXMLHttpRequest(queryTranslations(item) + "&origin=*")
              .subscribe(response => {
                //clean
                d3.selectAll(".label").remove();
                tooltip.classed("hidden", true);
                d3.selectAll(".messagenotfound").remove();

                points = JSON.parse(response)
                  .results
                  .bindings
                  .map(p => {

                    //console.log( p );

                    return {
                      "coordinates": [parseFloat(p.lon.value), parseFloat(p.lat.value)],
                      "label": p.label.value,
                      "iso2": p.label['xml:lang'],
                      "language": p.langLabel.value,
                    }
                  })

                var x = Math.max(scl, w / 1.9);
                var y = Math.max(scl, h / 1.9);

                if (points.length == 0) {
                  d3.select("#map")
                    .append("text")
                    .attr("class", "messagenotfound")
                    .attr("x", x)
                    .attr("y", y)
                    .html("word not found");
                  d3.select("#map")
                    .append("svg:a")
                    .attr("class", "messagenotfound")
                    .attr("xlink:href", "https://www.wikidata.org/wiki/Special:NewItem")
                    .attr("target", "_blank")
                    .append("rect")
                    .attr("class", "messagenotfound")
                    .attr("x", x - (150 / 2))
                    .attr("y", y + (30 / 2))
                    .attr("height", 30)
                    .attr("width", 150)
                    .style("fill", "red")
                    .attr("rx", 10)
                    .attr("ry", 10)
                  d3.select("#map")
                    .append("svg:text")
                    .attr("class", "messagenotfound")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", "2em")
                    .style("fill", "black")
                    .style("text-anchor", "middle")
                    .style("font-size", "20px")
                    .style("pointer-events", "none")
                    .text("add to Wikidata");
                } else {
                  // render labels
                  map.datum(points)
                    .call(labels.position(d => projection(d.coordinates)));
                  map.selectAll("rect")
                    .on("click", showArticle )
                    .on("mouseover", showWordTooltip)
                    .on("mouseout", tooltip.classed("hidden", true));
                }
              });
          })

      }

      // functions for dragging
      function dragstarted() {
        gpos0 = projection.invert(d3.mouse(this));
        o0 = projection.rotate();
      }

      const config = {
        speed: 0.005,
        verticalTilt: -30,
        horizontalTilt: 0
      }

      function dragged() {
        gpos1 = projection.invert(d3.mouse(this));
        o0 = projection.rotate();
        o1 = eulerAngles(gpos0, gpos1, o0);
        projection.rotate(o1);

        map.selectAll("path").attr("d", path);

        d3.selectAll(".label").remove();
        tooltip.classed("hidden", true);

        map.call(labels.position(d => projection(d.coordinates)));

        map.selectAll("rect")
					.on("click", showArticle )
          .on("mouseover", showWordTooltip)
          .on("mouseout", tooltip.classed("hidden", true));

        map.selectAll(".land")
					.on("click", showArticle )
          .on("mouseover", showCountryTooltip)
          .on("mouseout", tooltip.classed("hidden", true));

      }

      // functions for zooming
      function zoomed() {
        currentScl = d3.event.transform.translate(projection).k * scl;
        projection.scale(currentScl);
        map.selectAll("path").attr("d", path);
        d3.selectAll(".label").remove();
        tooltip.classed("hidden", true);

        map.call(labels.position(d => projection(d.coordinates)));

        map.selectAll("rect")
          .on("mouseover", showWordTooltip)
          .on("mouseout", tooltip.classed("hidden", true));

        map.selectAll(".land")
          .on("mouseover", showCountryTooltip)
          .on("mouseout", tooltip.classed("hidden", true));
      }

    });

    document.getElementById("search")

        .addEventListener("keyup", function(event) {
        event.preventDefault();

        if (event.keyCode === 13) {
            document.getElementById("searchsubmit").click();
        }
    });


  } // end of redraw()

  redraw();

  window.onresize = function(){ location.reload(); }

  window.addEventListener("resize", function(event){

    setTimeout(function(){ window.location.reload(); });

  });

}); // end of 'jquery ready'


function getParameterByName(name) {

  //if ( !url ){
    url = window.location.href;
  //}

  //name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec( url );

  if (!results) return undefined;
  if (!results[2]) return '';

  return decodeURIComponent(results[2].replace(/\+/g, " "));

}

function updateWindow(){

    var x = window.innerWidth;
    var y = window.innerHeight;

    //var svg = document.querySelector('svg');
    ///var svg = document.querySelector('svg');
    //$('svg').attr("width", x).attr("height", y);
}

document.toggleFullscreen = function toggleFullscreen() {

  if ( screenfull.enabled ) { // change to: isEnabled()

    /*
    // set fullscreen parameter first
    var url = new URL( window.location );

    if ( f ){
      url.searchParams.set('f', false);
    }
    else {
      url.searchParams.set('f', true);
    }

    window.location = url.href;
    */

    screenfull.toggle(); // triggers rezize event, which triggers a reload event
  }

}


