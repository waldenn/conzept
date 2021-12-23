//var xWidth = Math.max(window.innerWidth - 150, 1000); // force to 1000 wide, because we want that many years to be possible
var xWidth = 1016;

var barWidth = 1; // should be an integer
var numBars = Math.floor(xWidth/barWidth); // depends on barWidth

var margin = {top: 20, right: 0, bottom: 50, left: 70};
var width = numBars*barWidth // + margin.left + margin.right; // depends on barWidth
var height = Math.max(window.innerHeight - margin.top - margin.bottom - 400, 400); // max of 400

var minDate = new Date("1000-06-01");
var maxDate = new Date("2015-06-01");

var x = d3.time.scale()
                .domain([minDate, maxDate])
                .range([0, width]);

var y = d3.scale.linear()
		.domain([0, 100])
		.range([height, 0]);

var xAxis = d3.svg.axis()
		.scale(x);
                // does not appear to need a format. default orientation is bottom.

var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickFormat(d3.format("d"));

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return d.year;
  })

var untip = d3.tip()
  .attr('class', 'd3-tip')
  .offset(function() {
      return [this.getBBox().height-10, 0] // same position as tip, above
  })
  .html(function(d) {
    return d.year;
  })

var svg = d3.select("#graph").append("svg")
		.attr("id", "svg")
		.attr("width", width + margin.left + margin.right) // depends on barWidth ...
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.attr("id", "transformBox");

svg.call(tip);
svg.call(untip);

// removes placeholder loading text ... most useful so you can immediately see a crash on syntax error
document.getElementById('loadingText').innerHTML = '';
document.getElementById('year').innerHTML = 'click on a year to see details';

var data = [];			// height of bars, representing occurences of match per bucket of x chars
var word;			// matched word (or string) 
var word_sum;			// count of word entries

//0s out data array
resetData();

// create x axis
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height) + ")") // draw this axis on the bottom, instead of default top
    .call(xAxis)
    .append("text")
    .attr("transform", "translate("+(width/2)+","+(45)+")") // note that this transform also gets the above transform applied!
    .style("text-anchor", "middle")
    .attr("font-size",'110%')
    .text("year");

// create y axis
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "translate("+ (-100/2) +","+(height/2)+")rotate(-90)") // changed -80 to -100 to keep label off the digits
    .style("text-anchor", "middle")
    .attr("font-size",'110%')
    .text("count");

// draws initial histogram bars - data is all zeroes
// set up click callback
svg.selectAll('.bar')
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d, i){return (1+i)*barWidth;})
    .attr("width", barWidth)
    .attr("y", height) // starts at bottom
    .attr("height", 0) // height of zero
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .on("click", function(){
	// var cord = d3.mouse(this);
	// var year = x.invert(cord[0]).getUTCFullYear(); // not accurate enough :/
	var actual_year = this.__data__.year; // get it out of the data
	console.log('bar click for year ', actual_year);
	doClick(actual_year);
    });
/*
    .on('mouseover', function(d){
	// var cord = d3.mouse(this);
	// var year = x.invert(cord[0]).getUTCFullYear(); // not accurate enough :/
	var actual_year = this.__data__.year; // get it out of the data
	console.log("mouseover for bar ", actual_year);
	tip.show(d); })
    .on('mouseout', function(d){
	// var cord = d3.mouse(this);
	// var year = x.invert(cord[0]).getUTCFullYear(); // not accurate enough :/
	var actual_year = this.__data__.year; // get it out of the data
	console.log("mouseout for bar ", actual_year);
	tip.hide(d); });
*/

// draws initial inverted histogram bars - data is all zeroes
// set up click callback
svg.selectAll('.unbar')
    .data(data)
    .enter().append("rect")
    .attr("class", "unbar")
    .attr("x", function(d, i){return (1+i)*barWidth;})
    .attr("width", barWidth)
    .attr("y", 0) // starts at top
    .attr("height", height-1) // extends to bottom (initial data is zero) ... minus 1 to not overwrite x axis
    .on("click", function(){
	// var cord = d3.mouse(this);
	// var year = x.invert(cord[0]).getUTCFullYear(); // not accurate enough :/
	var actual_year = this.__data__.year; // get it out of the data
	console.log('unbar click for year ', actual_year);
	doClick(actual_year);
    })
/*
    .on('mouseover', function(d){
	// var cord = d3.mouse(this);
	// var year = x.invert(cord[0]).getUTCFullYear(); // not accurate enough :/
	var actual_year = this.__data__.year; // get it out of the data
	console.log("mouseover for unbar ", actual_year);
	tip.show(d); })
    .on('mouseout', function(d){
	// var cord = d3.mouse(this);
	// var year = x.invert(cord[0]).getUTCFullYear(); // not accurate enough :/
	var actual_year = this.__data__.year; // get it out of the data
	console.log("mouseout for unbar ", actual_year);
	tip.hide(d); });
*/
    .on('mouseover', untip.show)
    .on('mouseout', untip.hide);

//$('#footer').css('margin-left', xWidth/2 - 180);

d3.select("#container").style("display", "block");
d3.select("#footerInfo").style("display", "block");

window.onpopstate = function(event) {
    console.log("onpopstate fired");
    if (event.state && event.state.q) {
	word = event.state.q; // modifies our global
	updateWord(event.state.q, event.state.y);
    }
};

var urlParams = {}; // global variable, needed to preserve debugging args

if (history.state && history.state.q) {
    // this state is entered when a user clicks on a book and then hits the back button
    word = history.state.q; // global variable
    updateWord(word, history.state.y);
} else {
    // new arrival. Parse q and y out of url, if present.
    parseArgs();
    if (urlParams.q) {
	console.log("q and y are:", urlParams.q, urlParams.y);
	word = urlParams.q; // modifies our global
	updateWord(word, parseInt(urlParams.y));
    }
}

function parseArgs() {
    // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript?lq=1
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
	urlParams[decode(match[1])] = decode(match[2]);
    if (urlParams.q) // treat this specially
        urlParams.q = urlParams.q.trim().replace('+', ' ');
};

function formatArgs() {
    if (urlParams.q)
	urlParams.q = urlParams.q.trim();
    return $.param(urlParams).replace(/%20/g, '+');
}

$('#autocomplete').focus();

function doClick(year){
    console.log("click event, year=", year);

    var xx = year-1000; // XXX

    if( ! data[xx].count ) {
	// if there's no data for this year, find a nearby year that has data - biggest count wins
	if ( data[xx+1].count )
	    if ( data[xx-1].count ) {
		if ( data[xx+1].count > data[xx-1].count )
		    year += 1;
		else
		    year -= 1;
	    } else
		year += 1;
	else if ( data[xx-1].count )
	    year -= 1;
	else if ( data[xx+2].count )
	    if ( data[xx-2].count ) {
		if ( data[xx+2].count > data[xx-2].count )
		    year += 2;
		else
		    year -= 2;
	    } else
		year += 2;
	else if ( data[xx-2].count )
	    year -= 2;
	else {
	    document.getElementById('year').innerHTML = 'click on a year to see details';
	    document.getElementById("context").innerHTML = '<br><br><br><br><br>';
	    updateGraph(word); // needed to reset the url to not have the year
	    return;
	}
	console.log('XXX adjusted year to year=', year);
    }

    urlParams.q = word;
    if (year)
	urlParams.y = year;
    else
	delete urlParams.y;

    var newargs = formatArgs();
    if (newargs)
	newargs = '?' + newargs;
    console.log("XXX replacestate, formatted params are "+newargs);
    history.replaceState( { q: word, y: year }, "", newargs);

    document.getElementById('year').innerHTML = year;

    $.getJSON("https://books.archivelab.org/dateviz/sentences", {
	q: word, // global variable
	year: year
    }, function(sdata) {
	console.log("sentences callback fired");
	var sentences = sdata.error ? [] : sdata.sentences;

	var formatted_text = $.map(sentences, function(m) {
	    //var url_view = 'https://archive.org/stream/' + m.ia_id + '/#page/n' + m.leaf + '/mode/2up" target="_blank' // correct leaf
	    var url_details = 'https://archive.org/details/' + m.ia_id // XXX no way to specify a leaf here?

//	    var rl = ' (rank='+ m.rank + ' leaf=' + m.leaf + ')';
//	    var blank = ' target="_blank"';
	    var blank = '';
	    var rl = '';
	    var t = '<a target="_blank" href="' + url_details + '?q=' + word + '"' + blank + '>' + m.title.replace('/','') + '</a>' + rl + '<p class="indent">';
	    var s = m.s.replace(new RegExp('(' + word  + ')', 'gi'), "<b class=\"match\">$1</b>"); // this may double-bold, but that's not a big deal
	    s = s.replace(new RegExp('(' + year  + ')', 'gi'), "<b class=\"year\">$1</b>"); // this is still needed

	    return t + s + '<p class="foo">'
	});
	document.getElementById("context").innerHTML = formatted_text.join('\n');
    });
};

//redraws graph for new match
function updateGraph(match, year){
        console.log("entering updateGraph, making years json outcall");

        // clear off the bottom stuff
        document.getElementById('year').innerHTML = 'click on a year to see details';
        document.getElementById("context").innerHTML = '<br><br><br><br><br>';

        // set state so that the back button does something reasonable
        state = {};
        if (match) {
            match = match.trim()
	    state.w = match;
	    urlParams.q = match;
	} else {
	    delete urlParams.q;
	}
        if (year) {
	    state.y = year;
	    urlParams.y = year;
	} else {
	    delete urlParams.y;
	}
        console.log("calling replaceState with state=", JSON.stringify(state));
        var newargs = formatArgs();
        if (newargs)
	    newargs = '?' + newargs;
        else
	    newargs = "/dateviz/"; // replaceState bug: empty string does nothing. so this path leaks into the code. XXX

        console.log("calling replaceState with newargs=", newargs);
        history.replaceState(state, "", newargs);

	$.getJSON("https://books.archivelab.org/dateviz/years", {
	    q: match
	}, function(ydata) {

	    console.log("years callback fired");
	    resetData();
	    word_sum = 0;
	    biggest_count = 0;
	    biggest_year = -100000;

	    var years = ydata.error ? [] : ydata.years;

	    console.log("filling in years from callback values");
	    for (var p in years) {	
		var position = p - 1000;
		if (position < 0 || position > 1015)
		    continue;
		data[position] = {};
		data[position].count = years[p];
		if (years[p] > biggest_count) {
		    biggest_count = years[p]
		    biggest_year = p
		}
		data[position].year = p;
		word_sum += years[p];
	    }
	    console.log("after filling in years data, length is", data.length);
	    console.log("word_sum is now", word_sum);

	    datamax = Math.max.apply(Math, data.map(function(o){return o.count ? o.count : 0;})); // * 1.1 -- caused bug clicking inside tall bars ?!

	    for( var i = 0, l = data.length; i < l; i++ ) {
		if ( data[i].count > 0 ) {
		    data[i].count = Math.max(data[i].count, datamax / (height/2.)); // if non-zero, min height is 3 pixels
		}
	    }

	    d3.select("#wordNum").text(word_sum.toLocaleString()); // sets count in visible label, prettyprinted with commas

	    if ( word_sum > 1 ) {
		document.getElementById('loadingText').innerHTML = '';
	    } else {
		if (word) // only show if the user has typed something
		    document.getElementById('loadingText').innerHTML = 'Tip: Pick something out of the autocomplete dropdown!<br>This demo is limited to "things" with Wikipedia articles.';
	    }

	    console.log("telling d3 about the new data");

	    x.domain([new Date("1000-06-01"), new Date("2015-06-01")]);
	    svg.select(".x.axis").call(xAxis);
	    y.domain([0, datamax]);
	    svg.select(".y.axis").call(yAxis);

	    console.log("starting drawing, height is", height);

	    // Alter the existing bars to new heights, with an animation
	    svg.selectAll('.bar')
		.data(data)
		.transition()
		.duration(500)
		.attr("y", function(d){return y(d.count)}) // replaces a constant 0
		.attr("height", function(d){ return height - y(d.count);}); // y + height = bottom

	    // Alter the existing unbars to new heights, with an animation
	    svg.selectAll('.unbar')
		.data(data)
		.transition()
		.duration(500)
		.attr("y", function(d){return 0;}) // starts at top
		.attr("height", function(d){ return y(d.count)-1;});

	    if (history.state && history.state.y)
		doClick(history.state.y);
	    else if (biggest_year > -100000)
		doClick(biggest_year);
	});
};

// zeros out bar height array
function resetData(){
        data = []; // seems to fix my max problem
	for (var i = 0; i < numBars; i++){
		data[i] = { count: 0, year: i+1000 };
	}
}

function updateWord(w, y){
        if (w) {
	    word = w.trim();
            $("#autocomplete").val(word);
	} else {
	    word = $("#autocomplete").val(); // changes global
        }

	if (word.length > 0){
		updateGraph(word, y); // changes the graph
		//d3.select("#wordText").text(word); // sets term in visible label
		d3.select("#title").style("visibility", "visible");
	}
	else{
		d3.select("#title").style("visibility", "hidden");
	        updateGraph(); // empties it out
	}
}

var autoclose = false;

//update graph and close autocomplete
$('#autocomplete').keyup(function(e){
	if(e.keyCode == 13)
	{
	        console.log("autocomplete keyup: saw carriage return");
		updateWord();
		$(this).autocomplete("close");
		setTimeout(function(){$('#autocomplete').autocomplete("close");}, 100);
	}
});


$( "#autocomplete" ).autocomplete({
	minLength: 0,
        delay: 100,
	select: function( event, ui ) {
		setTimeout(function(){updateWord();}, 10);
	},
	source: function( request, response ) {
	    console.log("autocomplete json outcall, q=", request.term);
	    $.getJSON("https://books.archivelab.org/dateviz/autocomplete", {
		q: request.term
	    }, function(adata) {
		// adata is an array of objects and must be transformed for autocomplete to use
		console.log("autocomplete json completion called");
		var array = adata.error ? [] : $.map(adata.autocomplete, function(m) {
		    return {
			label: m.label,
			number: m.number
		    };
		});
		response(array);
	    });
	}
}).data('ui-autocomplete')._renderItem = function(ul, item){
		return $( "<li>" )
//        	.append( "<a class = 'dropDown'>" + item.value + " (" + item.number + ")</a>" ) // with popularity
        	.append( "<a class = 'dropDown'>" + item.value + "</a>" )
        	.appendTo( ul );
	};

document.toggleFullscreen = function() {

  if (screenfull.enabled) {
    screenfull.toggle();
  }

  return 0;

};

