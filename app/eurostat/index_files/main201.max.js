var _BIG_=999999;

(function(){
  var
	version="2.0.1",
	datasetsElement=document.querySelector("#datasets ul"),
	//dimElement=document.querySelector("#dimensions"),
	updatedElement=document.querySelector("#updated"),
	uname=test("bio","catalog","fa","estat")+".json",
	searchText = document.querySelector('input[type="search"]')
  ;

  document.querySelector("#version").innerText="v. "+version;

  fetch("https://opendata.marche.camcom.it/data/"+uname).then(function(r){return r.json();}).then(function(json){
	var
	  tree=json.tree,
	  children=function(id){
		return tree.filter(function(e){return e.par === id;});
	  },
	  getTree=function(){
		datasetsElement.innerHTML=li( children("#") );
		events(datasetsElement);
	  }
	;

	getTree();
	document.querySelector("#datasets > details")
	.open=true;

	//"Nodes: " + tree.length.toLocaleString("en-EN") +
	updatedElement.innerHTML="<em>" + json.datasets.toLocaleString("en-EN") + "</em> (list updated on " + json.updated + ")";

	//LOCAL FUNCTIONS
	function dsButton(name, code, obs){
		const
			query={
				dataset: code,
				label: {
					dataset: name,
				}
			},
			big=(obs > _BIG_),
			clss=big ? 'class="big"' : ''
		;

		return '<button '+clss+' onclick="getMeta('+big+','+JSON.stringify(query).replace(/"/g,'&quot;')+')">'+title(name, code)+'</button>';
	}
	function li(arr){
	  var html=[];

	  arr.forEach(function(item){
		var
		  name=item.nam,
		  id=item.id,
		  code=item.cod || null
		;

		//dataset
		if(code){
			html.push('<li>'+dsButton(name, code, item.obs)+'</li>');
		}else{
			html.push('<li><details><summary data-id="'+id+'">'+name+'</summary><ul id="'+"i"+id+'"></ul></details></li>');
		}
	  });

	  return html.join("");
	}

	//autodestroy or condicionat a existÃ¨ncia de <ul> dins de details...
	function events(el){
	  //IE
	  Array.prototype.forEach.call(el.querySelectorAll("details"), function(i){
	  //instead of el.querySelectorAll("details").forEach(function(i){
		i.addEventListener('click', function(event){
		  var
			id=event.target.dataset.id,
			el=document.getElementById("i"+id)
		  ;

		  if(el && el.innerHTML===""){
			el.innerHTML=li( children(id) );
			events(el);
		  }
		});
	  });
	}

	function showResults() {
		//const searchTerm = this.value;
		const searchTerm = searchText.value; // CONZEPT PATCH

		//At least 3 chars
		if(searchTerm.length < 3){
			getTree();
			return;
		}

		const
			results = getMatches(
				searchTerm, 
				tree.filter(d=>d.hasOwnProperty("sch")) //Only unique datasets
			)
		;

		if(!results.length){
			getTree();
			return;
		}

		datasetsElement.innerHTML = results.map(ds => '<li>'+dsButton(ds.nam, ds.cod, ds.obs)+'</li>').join("");
		document.querySelector("#datasets > details")
		.open=true;	
	}

  window.showResults = showResults(); // CONZEPT PATCH

	function getMatches(searchTerm, data){
		return data.filter(ds => {
			return (ds.cod+" "+ds.nam).toLowerCase().includes(searchTerm.toLowerCase());
		});
	}

	searchText.addEventListener("change", showResults);
	searchText.addEventListener("keyup", showResults);
	searchText.addEventListener("search", showResults);

  // CONZEPT PATCH
	const submit = document.querySelector('input[type="submit"]')
	submit.addEventListener("click", showResults);

  });

  function test(b,q,f,e){
	var name=e+"-"+q;

	if(typeof URLSearchParams!=="function"){
	  return name;
	}

	if(new URLSearchParams(document.location.search.substring(1)).get(f+b)!==null){
	  return "test-"+q;
	}

	return name;
  }
})();

function getMeta(big,query){
  /*Currently no used
  var setup={
	lastTimePeriod: false, //true means use the last time period available
	position: "middle", //"first" (default), "middle", "last" category to pick (when lastTimePeriod is true, it will rule in the time dimension; when geo is validly specified it will rule in the geo dimension)
	geo: "FR" //it will only be used if "geo" is present and "FR" is an existing category. Do not specify or use null if you want "position" to rule in the geo dimension.
  };
  */

  document.getElementById("results").style.display="none";

  var details=document.querySelector("#datasets details");

  if(query===null){
	return warn("META", "RESET");
  }

  query.lang=document.querySelector("#languages input[type=radio]:checked").value;

  details.open=false;
  details.querySelector("summary").innerHTML=title(query.label.dataset, query.dataset);

  details.querySelector("summary").className=big ? "big" : "";

  warn("META", "FETCH");

  EuroJSONstat.fetchEmptyDataset({dataset: query.dataset, lang: query.lang}, true)
  .then(function(ds){
	if(ds.class==="error"){
	  return warn("META", "ERROR", ds.status, ds.label);
	}

	dimensions( ds, query );
  });

  function dimensions(ds, query){
	var
	  input=[],
	  sortedId=sortByRole(ds.role)
	;

	sortedId.forEach(function(d){
	  var
		dim=ds.Dimension(d),
		len=dim.length,
		single=(len===1),
		role=dim.role
	  ;

	  input.push('<details class="bar '+role+'">');
	  input.push('<summary>' + ico(role) + dim.label + '</summary><div class="cont"><div id="items">');

	  if(!single){
		input.push(
		  '<label class="all"><input onclick="chkall(&apos;'+d+'&apos;,this)" type="checkbox" />All</label>'
		);
	  }

	  if(role==="time"){
		input.push(period(len));
	  }

	  dim.id.forEach(function(c,i,a){
		var checkbox="";

		if(role!=="time"){
		  if(!single){
			checkbox='<input id="'+d+c+'" class="category filter" type="checkbox" name="'+d+'" value="'+c+'"/>';
		  }
		  input.push(checkbox + '<label for="'+d+c+'" class="category">' + dim.Category(c).label + '</label>');
		}else{ //time desc order
		  var pos=len-i-1;

		  if(!single){
			checkbox='<input id="'+d+a[pos]+'" onclick="timechk(&apos;item&apos;)" class="category filter" type="checkbox" name="'+d+'" value="'+a[pos]+'"/>';
		  }
		  input[input.length+pos]=checkbox +
			'<label class="category" for="'+d+a[pos]+'">' +
			dim.Category(pos).label +
			'</label>'
		  ;
		}
	  });

	  input.push('</div></div></details>');
	});

	input.push('<div id="load"><button class="btn btn-default" id="get">Load Data</button><span id="msg"></span></div>');

	/*dimElement*/ document.querySelector("#dimensions").innerHTML=input.join("");

	warn("DATA", big ? "BIG" : "SELECT", null, ds.n.toLocaleString("en-EN"));
	//console.log(ds);

	document.querySelector("#load button").addEventListener("click", function(){
	  getData(removeFilter(query), ds.id);
	});
  }

  function getData(q, dim){
	//reset function?
	_ESAK_={
	  data: null,
	  needsUpd: { table: true, list: true, api: true },
	  url: null
	};

	//document.getElementById("results").innerHTML="";

	warn("DATA", "FETCH");

	var filter={};
	dim.forEach(function(d){
	  filter[d]=[];
	  //IE
	  Array.prototype.forEach.call(document.querySelectorAll("input.filter[name=" + d + "]"), function(i){
	  //instead of document.querySelectorAll("input.filter[name=" + d + "]").forEach(function(i){
		if(i.checked){
		  filter[d].push(i.value);
		}

		i.addEventListener('change', function(){
		  warn("DATA", "CHANGED");
		});
	  });
	  if(document.querySelector("input[name=lasttime]").checked){
		delete filter.time;
		filter.lastTimePeriod=[ document.querySelector("select[name=lastTimePeriod] option:checked").value ];
	  }
	});

	var query=EuroJSONstat.addParamQuery(q, filter);
	EuroJSONstat.fetchDataset(query).then(function(ds){
	  if(ds.class==="error"){
		if(ds.status==="416"){
		  warn("DATA", "416");
		}else{
		  warn("DATA", "ERROR", ds.status, ds.label);
		}
		return;
	  }

	  //This must be faced by EuroJSONstat
	  //Eurostat does a weird thing: instead of returning regular dataset with no data
	  //it returns an error with status 200!
	  if(ds.class==="bundle" && ds.error && ds.error.status && ds.error.status==="200"){
		warn("DATA", "NODATA");
		return;
	  }

	  var upd=new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(Date.parse(ds.updated)));

	  warn("DATA", "UPDATED", upd ? upd : ds.updated, ds.n.toLocaleString("en-EN"));

	  _ESAK_.data=ds;
	  _ESAK_.url=EuroJSONstat.getURL(query);

	  results();

	  function results(){
		var $results=document.getElementById("results");

		$results.innerHTML='<div class="col-md-12 col-sm-12">'+
			'<div class="panel panel-primary">'+
			  '<h2 class="panel-heading panel-title"><span class="glyphicon glyphicon-save"></span> View &amp; Download</h2>'+
			  '<div class="panel-body">'+
				'<div id="button">'+
				  '<span id="view">'+
					'<button class="btn btn-default" id="listButton" aria-selected="false" aria-controls="list" data-help="Display as a list of data"><span class="glyphicon glyphicon-th-list"></span> List</button>'+
					'<button class="btn btn-default" id="tableButton" aria-selected="false" aria-controls="table" data-help="Display as an interactive table"><span class="glyphicon glyphicon-th-large"></span> Table</button>'+
					'<button class="btn btn-default" id="apiButton" aria-selected="false" aria-controls="api" data-help="Display the API URL for this customized dataset query"><span class="glyphicon glyphicon-cog"></span> API query</button>'+
					//'<button class="btn btn-default" id="barchartButton" aria-selected="false" aria-controls="" data-help="visualize the data"><span class="glyphicon glyphicon-cog"></span> bar chart</button>'+
				  '</span>'+
				  '<button id="jsonstat" class="btn btn-default" data-help="Download as a JSON-stat 2.0 dataset"><span class="glyphicon glyphicon-download-alt"></span> JSON-stat</button>'+
				  '<button id="json" class="btn btn-default" data-help="Download as a JSON array of objects"><span class="glyphicon glyphicon-download-alt"></span> JSON</button>'+
				  '<button id="csvstat" class="btn btn-default" data-help="Download as a comma-delimited CSV-stat"><span class="glyphicon glyphicon-download-alt"></span> CSV-stat (,)</button>'+
				  '<button id="csvstatsemi" class="btn btn-default" data-help="Download as a semicolon-delimited CSV-stat"><span class="glyphicon glyphicon-download-alt"></span> CSV-stat (;)</button>'+
				  '<button id="csv" class="btn btn-default" data-help="Download as a comma-delimited CSV"><span class="glyphicon glyphicon-download-alt"></span> CSV (,)</button>'+
				  '<button id="csvsemi" class="btn btn-default" data-help="Download as a semicolon-delimited CSV"><span class="glyphicon glyphicon-download-alt"></span> CSV (;)</button>'+
				  '<button id="visualize" class="btn btn-default" data-help="Visualize CSV data"><span class="glyphicon glyphicon-signal"></span> visualize</button>'+ // CONZEPT PATCH
				  '<a id="download"></a>'+
				'</div>'+
				'<div class="view" id="list"></div>'+
				'<div class="view" id="table"><div id="tbrowser"></div></div>'+
				'<div id="api"></div>'+
			  '</div>'+
			'</div>'+
		  '</div>'
		;

		$results.style.display="block";

		//IE
		Array.prototype.forEach.call(document.querySelectorAll("#view button"), function(i){
		//instead of el.querySelectorAll("details").forEach(function(i){
		  i.addEventListener('click', view);
		});

		//IE
		Array.prototype.forEach.call(document.querySelectorAll("#jsonstat, #json, #csv, #csvsemi, #csvstat, #csvstatsemi, #visualize"), function(i){
		//instead of el.querySelectorAll("details").forEach(function(i){
		  i.addEventListener('click', download);
		});
	  }

	  function view(){

      var
        nelem=["table", "list", "api"],
        id=this.id,
        elem=id.replace("Button",""),
        $elem=document.querySelector("#"+elem),
        $id=document.querySelector("#"+id),
        nelems=[], nids=[]
      ;

      nelem.splice(nelem.indexOf(elem),1);

      nelem.forEach(function(item){
        var e="#"+item;
        nelems.push(e);
        nids.push(e+"Button");
      });

      var
        $nelem=document.querySelectorAll(nelems.join(",")),
        $nid=document.querySelectorAll(nids.join(","))
      ;

      if($id.getAttribute("aria-selected")==="true"){
        $id.setAttribute("aria-selected", "false");
        $elem.style.display="none";
      }
      else{
        $id.setAttribute("aria-selected", "true");
        $nid.forEach(function(i){i.setAttribute("aria-selected", "false");});
        $nelem.forEach(function(i){i.style.display="none";});
        show(elem);
      }

      //console.log( nelem, this.id, elem );

      if ( elem === 'table' ){

        //updateChart();

      }

	  }

	  function show(e){
			if(_ESAK_.needsUpd[e]){
				switch(e){
					case "table": table(); break;
					case "list": list(); break;
					case "api": api(); break;
				}
			}
		document.querySelector("#"+e).style.display="block";
		}

	  function table(){
			var
		  target=document.querySelector("#tbrowser"),
		  status=(_ESAK_.data.extension.status) ? statusInfo(_ESAK_.data.extension.status.label) : "",
		  statusEl=document.createElement("div")
		;

			JSONstatUtils.tbrowser(
				_ESAK_.data,
				target,
				{
			status: "true",
					preset: "bigger",
					i18n: {
						locale: "en-US",
						msgs: {
						  "urierror": 'tbrowser: A valid JSON-stat input must be specified.',
						  "selerror": 'tbrowser: A valid selector must be specified.',
						  "jsonerror": "The request did not return a valid JSON-stat dataset.",
						  "dimerror": "Only one dimension was found in the dataset. At least two are required.",
						  "dataerror": "Selection returned no data!",
						  "source": "Source",
						  "filters": "Filters",
						  "constants": "Constants",
						  "rc": "Rows &amp; Columns",
						  "na": " "
						}
					}
				}
			);

		statusEl.innerHTML=status;

		//insertAfter
		target.parentNode.insertBefore(statusEl, target.nextSibling);

			_ESAK_.needsUpd.table=false;

      //console.log('render chart');
      //updateChart();
		}

	  function api(){
			var target=document.querySelector("#api");

		target.innerHTML='<div>' + _ESAK_.url.replace(/&/g, "&<wbr>") + ' <span title="Copy to clipboard" target="0" role="button" id="copy" class="glyphicon glyphicon-copy"></span> <span id="copied"></span></div>';

		document.getElementById("copy").addEventListener("click", function(event){
		  var
			el=document.createElement('textarea'),
			copied=document.getElementById("copied")
		  ;

		  el.value=target.innerText.trim();
		  el.setAttribute('readonly', '');
		  el.style.position='absolute';
		  el.style.left='-9999px';
		  document.body.appendChild(el);
		  el.select();
		  document.execCommand('copy');
		  document.body.removeChild(el);
		  copied.innerText="Copied!";
		  window.setTimeout(
			function(e){
			  copied.innerText="";
			},
			2000
		  );
		});

			_ESAK_.needsUpd.api=false;
		}

		function list(){
			var
		  target=document.querySelector("#list"),
		  status=(_ESAK_.data.extension.status) ? statusInfo(_ESAK_.data.extension.status.label) : ""
		;

			target.innerHTML=JSONstatUtils.datalist(_ESAK_.data, {
				counter: true,
				tblclass: "datalist",
				numclass: "number",
				valclass: "value",
				vlabel: "VALUE",
				status: true,
				slabel: "STATUS",
				na: " ",
		  locale: query.lang
			}) +  status;

		addTop();

			_ESAK_.needsUpd.list=false;
		}

	  function download(){
			var
				id=this.id,
				link=document.querySelector("#download"),
		  name=_ESAK_.data.extension && _ESAK_.data.extension.datasetId || "dataset"
			;

		  //If browser supports the html5 download attribute
		  if(typeof link.download!=="undefined"){
				switch (id) {
			case "jsonstat":
						link.download=name+".json";
						link.href="data:application/json;charset=utf-8," + encodeURIComponent(
							_ESAK_.data.Dice(
								null,
								{
									stringify: true,
									ostatus: true
								}
							)
						);
					break;
			case "json":
						link.download=name+".json";
						link.href="data:application/json;charset=utf-8," + encodeURIComponent(
							JSON.stringify(_ESAK_.data.toTable({
  								type: "arrobj",
				  status: true,
				  vlabel: "value",
				  slabel: "status",
				  meta: true,
				  content: "id",
				  field: "id"
							}))
						);
					break;
					case "csvstat":
						link.download=name+".csv";
						link.href="data:text/csv;charset=utf-8," + encodeURIComponent(
							JSONstatUtils.toCSV(
								_ESAK_.data,
								{
									rich: true,
									na: " "
								}
							)
						);
					break;
					case "csvstatsemi":
						link.download=name+".csv";
						link.href="data:text/csv;charset=utf-8," + encodeURIComponent(
							JSONstatUtils.toCSV(
								_ESAK_.data,
								{
									delimiter: ";",
									rich: true,
									na: " "
								}
							)
						);
					break;
					case "csv":
						link.download=name+".csv";
						link.href="data:text/csv;charset=utf-8," + encodeURIComponent(
							JSONstatUtils.toCSV(
								_ESAK_.data,
								{
									status: true,
									slabel: "status",
									vlabel: "value",
									na: " "
								}
							)
						);
					break;
					case "csvsemi":
						link.download=name+".csv";
						link.href="data:text/csv;charset=utf-8," + encodeURIComponent(
							JSONstatUtils.toCSV(
								_ESAK_.data,
								{
									delimiter: ";",
									status: true,
									slabel: "status",
									vlabel: "value",
									na: " "
								}
							)
						);
					break;

          // CONZEPT PATCH
					case "visualize":

            // temporarily store as CSV data
            // see also:
            //  https://www.javascripttutorial.net/web-apis/javascript-sessionstorage/
            //  https://github.com/jsonstat/suite/blob/master/docs/tocsv.md
            sessionStorage.setItem( 'csv', JSONstatUtils.toCSV( _ESAK_.data, { delimiter: ',', rich: false, na: ' ' }) );

            // open RawGraphs
            const url = CONZEPT_WEB_BASE + `/app/rawgraphs/?t=&u=local-csv-data`;
            window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', url: url, current_pane: getCurrentPane(), target_pane: 'ps2' } }, '*' );

					break;

				}

				link.click();
			}else{
				window.alert("Sorry, your browser does not support this kind of downloads.");
			}
		}

	});
  }



  function period(len){
	var options=[];

	for(var i=0; i<len; i++){
	  options.push('<option value="'+(i+1)+'">'+(i+1)+'</option>');
	}
	return '</div><div id="number"><label class="period"><input class="filter" onclick="timechk(&apos;number&apos;)" type="checkbox" name="lasttime">Number of last periods<select onchange="timechk(&apos;select&apos;)" name="lastTimePeriod">' + options.join("") + '</select></label>';
  }

  function sortByRole(role){
	var arr=[];
	
	if(role.geo){
		arr=role.geo;
	}

	if(role.time){
		arr=arr.concat(role.time);
	}

	if(role.metric){
		arr=arr.concat(role.metric);
	}
	if(role.classification){
		arr=arr.concat(role.classification);
	}
	return arr;
  }

  function removeFilter(q){
	delete q.filter;
	return q;
  }


  function ico(r){
	var cls="glyphicon-signal";
	switch (r) {
	  case "geo":
		cls="glyphicon-map-marker";
	  break;
	  case "time":
		cls="glyphicon-time";
	  break;
	  case "metric":
		cls="glyphicon-dashboard";
	  break;
	}

	return '<span title="' + r + '" class="glyphicon ' + cls + '"></span> ';
  }

  function addTop(){
	var
	  tfoot=document.querySelector(".datalist tfoot td"),
	  source=tfoot.innerText
	;

	tfoot.innerHTML=source + '<a title="Top of the table" href="#results">&uarr;</a>';
  }

  function warn(el, id, code, text){
	var
	  element=(el==="META") ? /*dimElement*/ document.querySelector("#dimensions") : document.querySelector("#msg"),
	  s
	;

	switch(id) {
	  case "CHANGED":
		s="Your selection has changed. Press <em>Load Data</em> to update.";
	  break;
	  case "FETCH":
		s=(el==="META") ? '<p id="metadata">Retrieving metadata...</p>': "Retrieving data...";
	  break;
	  case "416":
		s="Too many cells requested. Please, select fewer categories.";
	  break;
	  case "NODATA":
		s="Your selection returned a dataset with no data. Select more categories.";
	  break;
	  case "SELECT":
		s='The full dataset has <span id="n">'+text+"</span>. Select few categories to minimize the data transfer.";
	  break;
	  case "BIG":
		s='The full dataset has <span id="n">'+text+"</span>. <strong>This dataset is very big.</strong> You MUST select few categories to minimize the data transfer.";
	  break;
	  case "ERROR":
		s="Sorry, an error ocurred: " + code + " (" + text + ")";
	  break;
	  case "UPDATED":
		s=text + " observations retrieved. This dataset was last updated on " + code + ".";
	  break;
	  case "RESET":
		s="";
	  break;
	}
	element.innerHTML=s;
  }

  function statusInfo(o){
	var arr=[];

	arr.push('<div id="status">');
	Object.keys(o).forEach(function(s){
	  arr.push("<p><tt>" + s + "</tt> = " + o[s]  + "</p>");
	});
	arr.push("</div>");

	return arr.join("");
  }
}

function chkall(d, that){
  //IE
  Array.prototype.forEach.call(document.querySelectorAll("input[name="+d+"]"), function(e){
  //instead of document.querySelectorAll("input[name="+d+"]").forEach(function(e){
	e.checked=that.checked;
  });

  if(d==="time"){
	document.querySelector("#number input").checked=false;
  }
}


function title(str, id){
  return '<span class="glyphicon glyphicon-th"></span> <span class="glyphicon arrow"></span>'+str.replace(/(\[DB\]|\[T\])/, "")+' [<strong>'+id+'</strong>]';
}

function timechk(s){
  var
	number=document.querySelector(".time #number input")
  ;

  if(s==="select"){
	number.checked=true;
	s="number";
  }

  if(s==="number"){
	//IE
	Array.prototype.forEach.call(document.querySelectorAll(".time #number input.category"), function(e){
	//document.querySelectorAll(".time #items input").forEach(function(e){
	  e.checked=false;
	});
	document.querySelector(".time .all input").checked=false;
  }else{
	document.querySelector(".time #number input").checked=false;
  }
}

function updateChart(){

  $('div.chart').remove();

  $('table').first().attr({ 'class' : 'render-to-bar-chart' });

  HighTables.renderCharts();

}
