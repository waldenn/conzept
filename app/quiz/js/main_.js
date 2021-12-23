"use strict";

const app = {};

$(document).ready(function() {

  init();

});

// change URL param
function changeQS(key, value) {

	let urlParams = new URLSearchParams(location.search.substr(1));
	urlParams.set(key, value);
	location.search = urlParams.toString();

	//let newurl = 'https://conze.pt' + window.location.pathname + location.search;
	//console.log( newurl );
	//window.location.href = newurl;

}


function init() {

  $('#country-form').select2();

  //$('#country-form').val( app.country );

  $('#country-form').on('change', function() {

    console.log( this.value );

    // find country by iso2
		for ( const [ code , obj ] of Object.entries( countries )) {

   		if ( this.value === obj.iso2 ){
				//console.log( code, iso2, this.value );
				console.log( code, this.value );
				app.country = code;
				app.country_label = obj.name;

				// goto new URL with country parameter
				changeQS( 'country', app.country );

			}

		}

    //newCountry( this.value );

  });

  app.round = 1;

  newQuiz();

  if ( app.mode === 'location' ){

    mapInitialize();

  }
  else if ( app.mode === 'list' ){

    selectInitialize();

  }
  else if ( app.mode === 'gallery' ){

    galleryInitialize();

  }

  $('#submit').click(function() {
    doGuess();
    newInput();
  });

  $('#result').on('click', '.closeBtn', function() {

    $('#result').fadeOut(500);

    app.round++;

    /*
    $('.round').html('Current Round: <b>' + round + '/5</b>');
    $('.roundScore').html('Last Round Score: <b>' + roundScore + '</b>');
    $('.totalScore').html('Total Score: <b>' + totalScore + '</b>');
    */

    document.body.style.background = 'url("")';

    newQuiz();

    if ( app.mode === 'location' ){

      app.guess.setLatLng({ lat: 0, lng: 0 });
      app.mymap.setView( [ 20, 20], 1);

    }
    else {

      // do nothing?

    }

  });

}

function getWikipediaHtml( t ){

  let title = t.replace(/%20/, '_');

  console.log( title );

  let url = 'https://' + language + '.wikipedia.org/w/api.php?action=parse&page=' +  encodeURIComponent( title ) + '&prop=text&format=json';

  $.ajax({

    url: url,
    jsonp: "callback",
    dataType: "jsonp",
 
    success: function( response ) {

      console.log( response );

    }

  });

}

function newQuiz() {

  //let params = window.location.search.substr(1);

	app.qid           = getParameterByName( 'q' );
	app.qid1          = getParameterByName( 'q1' );
	app.pid           = getParameterByName( 'p' );
	app.pid1          = getParameterByName( 'p1' );
	app.mode          = getParameterByName( 'm' );
	app.language      = getParameterByName( 'l' );
	app.only_label    = getParameterByName( 'o' ); // this will assume 'string' result type and 
	app.depth_query   = getParameterByName( 'd' ); // use a sparql-query-format with depth
	app.tree_depth    = getParameterByName( 'n' );

	app.country       = getParameterByName( 'country' ); // constrain SPARQL query by country
  app.country_label = '';

  if ( app.country !== '' ){

    // find country name by qid
    if ( typeof countries[ app.country ] === undefined || typeof countries[ app.country ] === 'undefined' ){
      // do nothing
    }
    else {

      app.country_label = countries[ app.country ].name;

    }

  }

  app.pid_type  = '';
  app.pid_label = '';

  app.thumbnail_size = '1400';

  app.random_spaces =  ' '.repeat( Math.floor(Math.random() * 100) ); 

  if ( app.mode === '' ){
    app.mode = 'location';
  }

  if ( app.qid && app.pid1 && app.qid1 ) { // double-lookup query
    // gallery quiz
  }
  else if ( app.pid === '' ){
    app.pid = 'P625'; // location quiz
  }

  if ( app.only_label === '' ){ app.only_label = false; } else {
    app.only_label = true;
    //app.pid_type = 'string'; // TODO: could we also support items with depth-queries?
    //app.pid_label = 'name';
  }

  if ( app.depth_query === '' ){
    app.depth_query = false;
  }
  else {
    app.depth_query = true;
  }

  if ( app.tree_depth === '' ){ app.tree_depth = 1; }
  if ( app.language === '' ){ app.language = 'en'; }

  // remove previous markers
  //$('.leaflet-pane.leaflet-shadow-pane').remove()
  //$('.leaflet-pane.leaflet-marker-pane').remove()

	$('#loading').show();

  let name_url = 'https://www.wikidata.org/wiki/Special:EntityData/' + app.qid + '.json';

  $.ajax({

    url: name_url,
 
    dataType: "json",
 
    success: function( response ) {

     //console.log( response );

     app.qid_label = response.entities[ app.qid ].labels[ app.language ].value.toLowerCase() || '';

     getProperties();

    }

  });

};

function getProperties(){

  if ( app.only_label ){

    if ( app.language === 'en' ){ // skip "name" localization for english app.language

      app.pid_label = 'name';
      getPropertyName();

    }
    else {

      let name_url = 'https://www.wikidata.org/wiki/Special:EntityData/Q82799.json';

      $.ajax({

        url: name_url,
     
        dataType: "json",
     
        success: function( response ) {

          app.pid_label = response.entities.Q82799.labels[ app.language ].value.toLowerCase();

          getPropertyName();

        }

      });

    }

  }
  else { // NOT only-label property

    getPropertyName();
  }

}


function getPropertyName(){

  let restriction1 = '';
  let restriction2 = '';
  let purl = '';

  console.log( app.qid1, app.pid1 );


  // QQQ
  if ( app.qid && app.pid1 && app.qid1 ) { // double-lookup query
    console.log('double query');
    restriction1 = ' wdt:P31 wd:' + app.qid + ' ; wdt:' + app.pid1 + ' wd:' + app.qid1 + ' . ';
    restriction2 = ' wdt:P31 wd:' + app.qid + ' . ';
    purl = 'https://www.wikidata.org/wiki/Special:EntityData/' + app.pid1 + '.json' // get property info
  }
  else if ( app.qid ) { // simple property query
    restriction1 = ' wdt:P31 wd:' + app.qid + ' . ';
    purl = 'https://www.wikidata.org/wiki/Special:EntityData/' + app.pid + '.json' // get property info
  }
  else {
    restriction1 = '';
    purl = 'https://www.wikidata.org/wiki/Special:EntityData/' + app.pid + '.json' // get property info
  }


  $.ajax({

    url: purl,
 
    dataType: "json",
 
    success: function( response ) {

      //console.log( response );
      //console.log( response.entities[ app.pid ].datatype );

      if ( !app.only_label ){

        if ( app.qid && app.pid1 && app.qid1 ) { // double-lookup query

          app.pid_type  = response.entities[ app.pid1 ].datatype;
          app.pid_label = response.entities[ app.pid1 ].labels[ app.language ].value.toLowerCase();

          if ( app.pid_type === 'commonsMedia' ){ // commonsMedia-type --> audio / image / ...
            app.pid_type  = response.entities[ app.pid1 ].labels['en'].value;
          }

          console.log('--- data type: ', app.pid_type );

          // image (default?)
          // wikibase-item (default?)
          // string
          // audio

        }
        else { // simple property query

          app.pid_type  = response.entities[ app.pid ].datatype;
          app.pid_label = response.entities[ app.pid ].labels[ app.language ].value.toLowerCase();

        }

      }

      console.log( app.pid_type, app.pid_label );

      if ( app.mode === 'location' ){

        locationQuery( restriction1 );

      }
      else if ( app.mode === 'list' ){

        listQuery( restriction1 );

      }
      else if ( app.mode === 'gallery' ){

        galleryQuery( restriction1, restriction2 );

      }


      if ( app.mode === 'gallery' ){

        // also lookup Qid  translation
        let name_url = 'https://www.wikidata.org/wiki/Special:EntityData/' + app.qid1 + '.json';

        $.ajax({

          url: name_url,
       
          dataType: "json",
       
          success: function( res ) {

           //console.log( 'find qid label: ', res );

           let find_label = res.entities[ app.qid1 ].labels[ app.language ].value.toLowerCase() || '';

           $('#title').text( app.qid_label + ' : ' + app.pid_label + ' : ' + find_label + ( app.country_label === '' ? '' : ' : ' + app.country_label ) );

          }

        });

      }
      else {

        $('#title').text( app.qid_label + ' : ' + app.pid_label + ( app.country_label === '' ? '' : ' : ' + app.country_label ) );

      }

      //console.log( 'query qids: ', app.mode, app.qid, app.qid1 );
      //console.log( 'query properties: ', app.pid, app.pid1, app.pid_type, app.pid_label, app.only_label, app.depth_query, app.language );

    }

  });

}

function galleryQuery( restriction1, restriction2 ){

  // types: wikidata-item, string

  let limit = 9;

  if ( app.pid_type === 'string' ){

    limit = 10;

  }

  let query_broad = `
    SELECT ?item ?itemLabel ?itemDescription ?prop ?photo WHERE { 
        { 
            SELECT ?item ?photo ?prop
            WHERE { 
                ?item wdt:P18 ?photo ;          
                ${restriction2}
            } ORDER BY STRUUID() ${app.random_spaces} LIMIT ${limit}
        } 
        SERVICE wikibase:label { bd:serviceParam wikibase:language "${app.language},en". } 
    } 
    `;



  let query_narrow = `
    SELECT ?item ?itemLabel ?itemDescription ?prop ?photo WHERE { 
        { 
            SELECT ?item ?photo ?prop
            WHERE { 
                ?item wdt:P18 ?photo ;          
                ${restriction1}
            } ORDER BY STRUUID() ${app.random_spaces} LIMIT ${limit}
        } 
        SERVICE wikibase:label { bd:serviceParam wikibase:language "${app.language},en". } 
    } 
    `;


  // items with an image
  // with property pid (defaults to P625 - geocode), eg. paintings: "wdt:P31 wd:Q3305213;"
  // add more statements to filter better

  const url_broad   = `https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=${query_broad}`;
  const url_narrow  = `https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=${query_narrow}`;

  //console.log( query_broad ); // query without filter
  console.log( query_narrow ); // query with filter
  //console.log( encodeURI( url_broad ) );

  window.fetch( url_broad )
    .then(

      function( r1 ) {

        window.fetch( url_narrow )
          .then(

            function( r2 ) {

              //console.log( 'results broad: ', r2 );
              createGallery( r1, r2 );

            }

        )
        .catch(function(err) {
          console.warn('Fetch Error :-S', err);
        });


      }

    )
    .catch(function(err) {
      console.warn('Fetch Error :-S', err);
    });

}


function createGallery( response, response_narrow ){

  //console.log( 'narrow results: ', response_narrow );

  response.json().then(function(data) {

    response_narrow.json().then(function(data_narrow) {

      let i = Math.floor(Math.random() * data.results.bindings.length)

      let results = data.results.bindings[i];

      //console.log( data.results );
      //console.log( results.photo.value );

      //console.log( data_narrow.results)

      //loadImage( results.photo.value );
      $('body').css('background-image', 'none');
      $('#loading').hide();
      $('body').css('background', 'black');

      //window.geocode = { lat: place.lat.value, lon: place.lon.value };
      window.locID = results.item.value;

      app.qid = results.item.value.replace(/http:\/\/www.wikidata.org\/entity\//, '');
      window.itemName = results.itemLabel.value;

      console.log( app.pid );

      // get list of all props
      let itemProps = [];
      window.itemPropsObj = {};
      let qlist = '';

      //window.itemProp = results.prop.value;
      console.log( results );

      //window.itemProp = results.prop.value.replace(/http:\/\/www.wikidata.org\/entity\//, '').split('-').shift();
      //console.log( 'https://www.wikidata.org/wiki/' + window.itemProp );

      let html = '';

      console.log( data_narrow.results.bindings.length );
      let z = data_narrow.results.bindings[0];

      let correct_item_img = z.photo.value.replace(/http:/,'https:') + '?width=' + 300 + 'px';
      let correct_item_title = z.itemLabel.value || '';

      let correct_item_desc = '';

      if ( typeof z.itemDescription === undefined || typeof z.itemDescription === 'undefined' ){ } else { correct_item_desc = z.itemDescription.value || ''; }

      let correct_item_qid = z.item.value.replace(/http:\/\/www.wikidata.org\/entity\//, '').split('-').shift();

      let correct_item_html = '' + 
        '<figure class="' + correct_item_qid + '"><img src="' + correct_item_img + '" alt="-" width="300" height="100%">' +
          '<figcaption>' +
            '<a href="javascript:void(0)" onclick="revealGalleryDetails(&quot;' + correct_item_qid + '&quot;)"><i class="fas fa-check-circle fa-3x"></i></a>' +
            '<span id="' + correct_item_qid + '" class="gallery-image-details correct" style="visibility:hidden;"></a>' +
              //'&nbsp;<a target="_blank" href="https://conze.pt/explore/?l=' + app.language + '&t=wikipedia-qid&s=true&i=' + correct_item_qid + '"><i class="fas fa-info-circle fa-2x"></i></a><br/>' +
              '&nbsp;<span class="gallery-item-title">"<a target="_blank" href="https://conze.pt/explore/?l=' + app.language + '&t=wikipedia-qid&s=true&i=' + correct_item_qid + '">' + correct_item_title + '</a>"</span><br/>' +
              '<span class="gallery-item-description">' + correct_item_desc + '</span>' +
            '</span>' + 
          '</figcaption>' +
        '</figure>'; 

      // render the images into a html-gallery
      $.each( data.results.bindings, function( i, v ) {

        //let item = {};

        //app.qid_ = v.prop.value.replace(/http:\/\/www.wikidata.org\/entity\//, '').split('-').shift();

        //let img = url.replace(/http:/,'https:');
        //img = img + '?width=' + app.thumbnail_size + 'px';

        //console.log( v.photo.value );
        let item_img = v.photo.value.replace(/http:/,'https:') + '?width=' + 300 + 'px';
        let item_title = v.itemLabel.value || '';
  
        let item_desc = '';

        if ( typeof v.itemDescription === undefined || typeof v.itemDescription === 'undefined' ){ } else { item_desc = v.itemDescription.value || ''; }

        let item_qid = v.item.value.replace(/http:\/\/www.wikidata.org\/entity\//, '').split('-').shift();

        html += '' +
          '<figure class="' + item_qid + '"><img src="' + item_img + '" alt="-" width="300" height="100%">' +
            '<figcaption>' +
              '<a href="javascript:void(0)" onclick="revealGalleryDetails(&quot;' + item_qid + '&quot;)"><i class="fas fa-check-circle fa-3x"></i></a>' +
              '<span id="' + item_qid + '" class="gallery-image-details incorrect" style="visibility:hidden;"></a>' +
                //'&nbsp;<a target="_blank" href="https://conze.pt/explore/?l=' + app.language + '&t=wikipedia-qid&s=true&i=' + item_qid + '"><i class="fas fa-info-circle fa-2x"></i></a><br/>' +
                '&nbsp;<span class="gallery-item-title">"<a target="_blank" href="https://conze.pt/explore/?l=' + app.language + '&t=wikipedia-qid&s=true&i=' + item_qid + '">' + item_title + '</a>"</span><br/>' +
                '<span class="gallery-item-description">' + item_desc + '</span>' +
              '</span>' + 
            '</figcaption>' +
          '</figure>'; 

        //<a id="image-source" title="source" aria-label="source" target="_blank" href="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Vermeer_-_Woman_with_a_Lute_near_a_window.jpg/600px-Vermeer_-_Woman_with_a_Lute_near_a_window.jpg"><i class="far fa-copyright fa-2x"></i></a>

        //html += '<a target="_blank" href="' + item_img + '"> <img src="' + item_img + '" alt="Foo Bar Baz" width="300" height="100%"> </a> <div class="desc">' + item_desc + '</div>';

        /*
        if ( app.qid_.startsWith('Q') ){ // TODO: figure out why there are some weird values like "t459412380" coming in.
          itemProps.push( app.qid_ );
          window.itemProps = Array.from(new Set( itemProps ));
        }
        */

      });

      // insert gallery html
      $('span.gallery').html( html + correct_item_html );

      let container = document.querySelector('span.gallery');

      for (var k = container.children.length; k >= 0; k--) {
        container.appendChild( container.children[Math.random() * k | 0] );
      }

      $('span.gallery').append( '<br/><br/><br/><br/>' );

      // unhide the next-gallery button
      $('#next-gallery-button').show();

      /*
      if ( results.itemDescription) {

        window.itemDescription = results.itemDescription.value;

      }
      else {

        window.itemDescription = undefined;

      }
      */

    });

  });

}

function revealGalleryDetails( qid ){

  console.log( qid );

  if ( $('#' + qid).hasClass('incorrect') ){ // wrong anser

    $('figure.' + qid + ' i:first' ).css('color', 'red');

  }
  else {

    //$('figure.' + qid + ' i:first' ).css('color', 'white');
    $('figure.' + qid ).css('background', '#237033');

  }


  // reveal item details
  $('#' + qid ).css('visibility', 'visible');

  // reveal all details
  //$('span.gallery-image-details').show();

}

function listQuery( restriction ){

  // types: wikidata-item, string

  let limit = 10;

  if ( app.pid_type === 'string' ){

    limit = 10;

  }

  let query = '';

  if ( app.depth_query ){

    query = `

      SELECT ?item ?itemLabel ?itemDescription ?prop ?photo WHERE {
       SELECT DISTINCT ?item ?itemLabel ?itemDescription ?prop ?photo ?linkTo {
        SERVICE gas:service {
          gas:program gas:gasClass "com.bigdata.rdf.graph.analytics.SSSP" ;
          gas:in wd:${app.qid} ;
          gas:traversalDirection "Reverse" ;
          gas:out ?item ;
          gas:maxIterations ${app.tree_depth};
          gas:linkType wdt:${app.pid} .
        }
        ?item wdt:P18 ?photo

        SERVICE wikibase:label {bd:serviceParam wikibase:language "${app.language},en" }
       } ORDER BY STRUUID() ${app.random_spaces} LIMIT ${limit}  
      }

    `;

  } 
  else {

    query = `
      SELECT ?item ?itemLabel ?itemDescription ?prop ?photo WHERE { 
          { 
              SELECT ?item ?photo ?prop
              WHERE { 
                  ?item wdt:P18 ?photo ;          
                        wdt:${app.pid} ?prop ;
                        ${restriction}
              } ORDER BY STRUUID() ${app.random_spaces} LIMIT ${limit}
          } 
          SERVICE wikibase:label { bd:serviceParam wikibase:language "${app.language},en". } 
      } 
      `;

  }

  // items with an image
  // with property pid (defaults to P625 - geocode), eg. paintings: "wdt:P31 wd:Q3305213;"
  // add more statements to filter better

  const url = `https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=${query}`;

  console.log( query );
  console.log( encodeURI( url ) );

  window.fetch(url)
    .then(

      function(response) {

        response.json().then(function(data) {

          let i = Math.floor(Math.random() * data.results.bindings.length)

          let results = data.results.bindings[i];

          //console.log( data.results );
          //console.log( results.photo.value );

          loadImage( results.photo.value );

          //window.geocode = { lat: place.lat.value, lon: place.lon.value };
          window.locID = results.item.value;

          app.qid = results.item.value.replace(/http:\/\/www.wikidata.org\/entity\//, '');
          window.itemName = results.itemLabel.value;


          console.log( app.pid );

          if ( app.pid === 'P171' ){

            // TODO: fetch GBIF-ID from wikidata for this taxon
            // add GBIF occurence map for taxon item
            //$('#gbifMap').html( '<gbif-map style="position: absolute; z-index: 2000; right: 2em; top: 400px; width: 490px; border: 2px solid black; height: 500px !important;" gbif-id="3120060" gbif-style="blue.marker" center-latitude="30.0" center-longitude="13.6" controls ></gbif-map>' );

          }

          // get list of all props
          let itemProps = [];
          window.itemPropsObj = {};
          let qlist = '';

          if ( app.only_label ){ // only use itemLabel as prop-value, ignore given-prop-values

            app.pid_type = 'string';

            window.itemProp = results.itemLabel.value;

            $.each( data.results.bindings, function( i, v ) {
              
              app.qid_ = v.itemLabel.value;
              //console.log( v.prop.value );
              itemProps.push( app.qid_ );
              window.itemProps = Array.from(new Set( itemProps ));

            });
 
          }
          else {

            //window.itemProp = results.prop.value;
            //console.log( results.prop );
            window.itemProp = results.prop.value.replace(/http:\/\/www.wikidata.org\/entity\//, '').split('-').shift();
            //console.log( 'https://www.wikidata.org/wiki/' + window.itemProp );

            $.each( data.results.bindings, function( i, v ) {
              
              app.qid_ = v.prop.value.replace(/http:\/\/www.wikidata.org\/entity\//, '').split('-').shift();
              //console.log( v.prop.value );

              if ( app.qid_.startsWith('Q') ){ // TODO: figure out why there are some weird values like "t459412380" coming in.
                itemProps.push( app.qid_ );
                window.itemProps = Array.from(new Set( itemProps ));
              }

            });
 
          }
         
          if ( results.itemDescription) {

            window.itemDescription = results.itemDescription.value;

          }
          else {

            window.itemDescription = undefined;

          }


          if ( app.pid_type === 'string' ){

            //console.log( window.itemProps );

            $.each( window.itemProps, function (j, item_) {

              $('#myChoices').append($('<option>', { value: item_, text : item_ }));

            });

            $('#myChoices').append($('#myChoices option').remove().sort(function(a, b) {
                let at = $(a).text().toLowerCase(), bt = $(b).text().toLowerCase();
                return (at > bt)?1:((at < bt)?-1:0);
            }));

            $('#myTitle').html( app.pid_label + ' <a id="learnmore" title="learn more about this topic" target="_blank" href="https://conze.pt/explore/' + app.qid_label + '?l=' + app.language + '&t=wikipedia-qid&s=true&i=' + app.qid + '"><i class="fab fa-leanpub"></i></a>' );
            $('#myChoices').prepend($('<option>', { 'value': '', 'text' : '...' }));
            $('#myChoices').val('');

          }
          else { // "wikidata-item"

            $.each( window.itemProps, function (j, item_) {

              qlist += item_ + '|';

            });

            qlist = qlist.slice(0, -1);

            // note API limit of 50!
            let lurl = 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + qlist + '&format=json&languages=' + app.language + '|en&props=labels';

            console.log( lurl );

            $.ajax({
                url: lurl,
             
                // The name of the callback parameter, as specified by the YQL service
                jsonp: "callback",
             
                // Tell jQuery we're expecting JSONP
                dataType: "jsonp",
             
                // Work with the response
                success: function( response ) {
                  //console.log( response.entities ); // server response

                  if ( typeof response.entities === undefined || typeof response.entities === 'undefined' ){

                    //console.log( lurl, response );

                    return 1;
                  }

                  Object.entries( response.entities ).forEach(([ k , v ]) => {

                    if ( typeof v.labels.en === undefined || typeof v.labels.en === 'undefined' ){

                      // hmm...

                    }
                    else {

                      //window.itemPropsObj[ k ] = v.labels.en.value;

                      if ( typeof v.labels[app.language] === undefined || typeof v.labels[app.language] === 'undefined' ){

                        //console.log( 'en, ', v.labels.en.value );
                        window.itemPropsObj[ k ] = v.labels.en.value;

                      }
                      else { // localized label available

                        //console.log( app.language, v.labels[app.language].value );
                        window.itemPropsObj[ k ] = v.labels[app.language].value;

                      }

                    }

                    //console.log( v.labels );

                    /*
                    if ( typeof v.labels[app.language] === undefined ){
                    }
                    else {
                      window.itemPropsObj[ k ] = v.labels.en.value;
                    }
                    */

                  });


                  // insert some prop-choices into select-form 
                  Object.entries( window.itemPropsObj ).forEach(([ k , v ]) => {

                    //console.log( k, v );
                    $('#myChoices').append($('<option>', { value: k, text : v.toLowerCase() }));

                  });

                  $('#myChoices').append($('#myChoices option').remove().sort(function(a, b) {
                      let at = $(a).text().toLowerCase(), bt = $(b).text().toLowerCase();
                      return (at > bt)?1:((at < bt)?-1:0);
                  }));

                  $('#myTitle').html( app.pid_label + ' <a title="learn more about this topic" target="_blank" href="https://conze.pt/explore/' + app.qid_label + '?l=' + app.language + '&t=wikipedia-qid&s=true&i=' + app.qid + '"><i class="fab fa-leanpub"></i></a>' );

                  $('#result').html('<div id="newmap"></div><h1><i class="fas fa-arrows-alt-h"></i> ' + app.distance + '</strong>km</h1> <br/><h2><a target="_blank" href="https://conze.pt/explore/' + encodeURIComponent(window.itemName) + '?l=' + app.language + '&t=wikipedia-qid&s=true&i=' + window.qid + '">' + window.itemName + '</a>' + (window.itemDescription ? ', ' + window.itemDescription : '') + '.</h2> <br/><button class="btn btn-info closeBtn submit" type="button"><i class="fas fa-long-arrow-alt-right"></i></button></p>');

                  $('#myChoices').prepend($('<option>', { 'value': '', 'text' : '...' }));
                  $('#myChoices').val('');

                  //$('#myChoices').select2();

              }

            });

          }

        });
      }

    )
    .catch(function(err) {
      console.warn('Fetch Error :-S', err);
    });

}

function locationQuery( restriction ){

  let limit = 50;

  let country_label = '';
  let country_constraint = '';

  if ( app.country !== '' ){ // set country constraint

    country_constraint = ' wdt:P17 wd:' + app.country + ' ; '; 
    country_label = ' ?place ';

  }

  const query = `
    SELECT ?item ?itemLabel ?itemDescription ?lat ?lon ?photo ${country_label} WHERE { 
        { 
            SELECT ?item ?photo ?lat ?lon ${country_label}
            WHERE { 
                ?item wdt:P18 ?photo ;
                    p:${app.pid} ?statement ; 
                    ${country_constraint}
                    ${restriction} 
                    ?statement psv:${app.pid} ?coords . 
                    ?coords wikibase:geoLatitude ?lat . 
                    ?coords wikibase:geoLongitude ?lon . 
            } ORDER BY STRUUID() ${app.random_spaces} LIMIT ${limit}
        } 
        SERVICE wikibase:label { bd:serviceParam wikibase:language "${app.language},en". } 
    } 
    `;

  const url = `https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=${query}`;

  //console.log( url );

  window.fetch(url)
    .then(

      function(response) {

        if (response.status !== 200) {
          console.warn(`Error: Status Code: ${response.status}`);
          return;
        }

        response.json().then(function(data) {

          //console.log( data.results );

          let i = Math.floor(Math.random() * data.results.bindings.length)
          let results = data.results.bindings[i];

          loadImage( results.photo.value );

          window.geocode = {
            lat: results.lat.value,
            lon: results.lon.value
          };

          window.locID = results.item.value;
          window.qid = results.item.value.replace(/http:\/\/www.wikidata.org\/entity\//, '');
          window.itemName = results.itemLabel.value;

          if ( results.itemDescription) {
            window.itemDescription = results.itemDescription.value;
          }
          else {
            window.itemDescription = undefined;
          }
        });
      }

    )
    .catch(function(err) {
      console.warn('Fetch Error :-S', err);
    });

}


function loadImage( url ) {

  let img = url.replace(/http:/,'https:');
  img = img + '?width=' + app.thumbnail_size + 'px';

  //console.log( img );

  // see: https://stackoverflow.com/a/5058336
  $('<img/>').attr('src', img ).on('load', function() {

    $(this).remove(); // prevent memory leaks

    $('body').css('background-image', 'url("' + img + '")');
    $('#loading').hide();

  });

}



function stripHtml(s) {

  if (typeof s === undefined || typeof s === 'undefined') {} else {

    return s.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "") || '';

  }

}

function getParameterByName(name, url) {

  if (!url) {
    url = window.location.href;
  }

  // const stripHtml = html => (new DOMParser().parseFromString(html, 'text/html')).body.textContent || '';

  //name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec(url);

  //if (!results) return undefined;
  if (!results) return '';
  if (!results[2]) return '';

  return stripHtml(decodeURIComponent(results[2].replace(/\+/g, " ")));

}

// minimap
function mapInitialize() {

  app.mymap = L.map("map");

  app.mymap.setView([30, 10], 1);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 18
  }).addTo(app.mymap);

  app.guess = L.marker([-999, -999]).addTo(app.mymap);
  app.guess.setLatLng({lat: -999, lng: -999});

  app.mymap.on("click", function(e) {
    app.guess.setLatLng(e.latlng);
    window.geocode_guess = e.latlng;
  })

  app.mymap.addControl(new L.Control.Fullscreen());

};

function selectInitialize() {

  $('#map').html('<label id="myTitle" for="myChoices"></label><select name="myChoices" id="myChoices"></select>');

}

function galleryInitialize() {

  $('#panel, .global-actions').css('display', 'none');
  console.log('todo: initialize gallery');

  //$('#map').html('<label id="myTitle" for="myChoices"></label><select name="myChoices" id="myChoices"></select>');

}

// reset map
function newInput() {

  if ( app.mode === 'location' ){

    let roundmap = L.map("newmap").setView([30, 10], 1);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(roundmap);

    let guessIcon = L.icon({
        iconUrl: "img/guess.png",
        iconAnchor: [25, 41],
    });

    let actualIcon = L.icon({
        iconUrl: "img/actual.png",
        iconAnchor: [25, 41],
    });

    let guess = L.marker([0, 0], {
        icon: guessIcon
    }).addTo(roundmap)

    //app.guess.remove();
    //markers.clearLayers();

    //for( var i = 0; i < this.mapMarkers.length; i++){
    //    this.map.removeLayer(this.mapMarkers[i]);
    //}

    let actual = L.marker([0, 0], {
        icon: actualIcon
    }).addTo(roundmap)

    guess.setLatLng(window.geocode_guess);
    actual.setLatLng(window.geocode);

    roundmap.fitBounds(L.latLngBounds(guess.getLatLng(), actual.getLatLng()), {
        padding: [50, 50]
    });

    roundmap.addControl(new L.Control.Fullscreen());

    /*
    app.guess = L.marker([-999, -999]).addTo(app.mymap);
    app.guess.setLatLng({lat: -999, lng: -999});

    app.mymap.on("click", function(e) {
      app.guess.setLatLng(e.latlng);
      window.geocode_guess = e.latlng;
    })
    */



  }
  else if ( app.mode === 'list' ){

    $('#map').html('<label id="myTitle" for="myChoices"></label><select name="myChoices" id="myChoices"></select>');

  }

  else if ( app.mode === 'gallery' ){

    console.log('todo: gallery reset');

  }

};

// Calculate distance between points function
function calculateDistance(lat1, lon1, lat2, lon2) {

  let dLat = toRadians(lat2 - lat1);
  let dLon = toRadians(lon2 - lon1);

  lat1 = toRadians(lat1);
  lat2 = toRadians(lat2);

  let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  let R = 6371; // km
  let d = R * c;

  return d;

}

// Converts numeric degrees to radians
function toRadians(Value) {
  return Value * Math.PI / 180;
}

function doGuess() {

  if ( app.mode === 'list' ){

		// get guessed value
		let guess = $('#myChoices').val();

		if ( guess === window.itemProp ){ // answer is correct
				
			app.correct_answer = true;

		}
		else {

			app.correct_answer = false;

		}

    //console.log( guess, app.correct_answer );

  }
  else if ( app.mode === 'gallery' ){

    console.log('todo: check gallery answer');

  }
  else if ( app.mode === 'location' ){

    // Reset marker function
    //function resetMarker() {
      //Reset marker
      //if (guessMarker != null) {
      //  guessMarker.setMap(null);
      //}
    //};

    // Calculate distance between points, and convert to kilometers
    app.distance = Math.ceil( calculateDistance( window.geocode.lat, window.geocode.lon, window.geocode_guess.lat, window.geocode_guess.lng) );

    // Calculate points awarded via guess proximity
    function inRange(x, min, max) {
      return (min <= x && x <= max);
    };

    let earthCircumference = 40075;
    let x = 2.00151 - ( app.distance / (earthCircumference / 4));

    //points = Math.round(2100 * ((1 / (1 + Math.exp(-4 * x + 5.2))) + (1 / (Math.exp(-8 * x + 17.5))) + (1 / (Math.exp(-30 * x + 61.2))) + (500 / (Math.exp(-250 * x + 506.7)))));
    //roundScore = points;

  }

  endRound();

};

function endRound() {

  if ( app.mode === 'location' ){

    $('#result').html('<div id="newmap"></div><h1><i class="fas fa-arrows-alt-h"></i> ' + app.distance + '</strong>km</h1> <br/><h2><a id="learnmore" target="_blank" href="https://conze.pt/explore/' + encodeURIComponent(window.itemName) + '?l=' + app.language + '&t=wikipedia-qid&s=true&i=' + window.qid + '">' + window.itemName + '</a>' + (window.itemDescription ? ', ' + window.itemDescription : '') + '.</h2> <br/><button class="btn btn-info closeBtn submit" type="button"><i class="fas fa-long-arrow-alt-right"></i></button></p>');


  }
  else if ( app.mode === 'gallery' ){
    console.log('todo: reset gallery endRound');
  }
  else if ( app.mode === 'list' ){

		let mesg = '';

    if ( app.pid_type === 'string' ){

      if ( app.correct_answer ){

        mesg = '<i class="far fa-check-circle fa-3x" style="color: green;"></i> <br/> <a target="_blank" href="https://conze.pt/explore/' + encodeURIComponent( window.itemProp ) + '?l=' + app.language + '&t=wikipedia&s=true&">' + window.itemProp + '</a>';

      }
      else {

        mesg = '<i class="far fa-times-circle fa-3x" style="color: red;"></i> <br/> <a target="_blank" href="https://conze.pt/explore/' + encodeURIComponent( window.itemProp ) + '?l=' + app.language + '&t=wikipedia&s=true">' + window.itemProp + '</a>';

      }

      $('#result').html( '<h2>' + mesg + '</h2> <h2>' + (window.itemDescription ? window.itemDescription : '') + '</h2><br/><button class="btn btn-info closeBtn submit" type="button"><i class="fas fa-long-arrow-alt-right"></i></button>');

    }
    else {

      if ( app.correct_answer ){

        mesg = '<i class="far fa-check-circle fa-3x" style="color: green;"></i> <br/> <a target="_blank" href="https://conze.pt/explore/' + encodeURIComponent( window.itemPropsObj[ window.itemProp ] ) + '?l=' + app.language + '&t=wikipedia-qid&s=true&i=' + window.itemProp + '">' + window.itemPropsObj[ window.itemProp ] + '</a>';

      }
      else {

        mesg = '<i class="far fa-times-circle fa-3x" style="color: red;"></i> <br/> <a target="_blank" href="https://conze.pt/explore/' + encodeURIComponent( window.itemPropsObj[ window.itemProp ] ) + '?l=' + app.language + '&t=wikipedia-qid&s=true&i=' + window.itemProp + '">' + window.itemPropsObj[ window.itemProp ] + '</a>';

      }

      $('#result').html( '<h2>' + mesg + '</h2> <br/><h2><a target="_blank" href="https://conze.pt/explore/' + encodeURIComponent(window.itemName) + '?l=' + app.language + '&t=wikipedia-qid&s=true&i=' + window.qid + '">' + window.itemName + '</a>' + (window.itemDescription ? ', ' + window.itemDescription : '') + '.</h2><br/><button class="btn btn-info closeBtn submit" type="button"><i class="fas fa-long-arrow-alt-right"></i></button>');

    }

  }

  $('#result').fadeIn();

};



document.toggleFullscreen = function() {

  if (screenfull.enabled) {
    screenfull.toggle();
  }

  return 0;

};

