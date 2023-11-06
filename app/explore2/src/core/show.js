'use strict';

function showTopicsNearMe( ){

  $('#blink').show();

  //getLocation();

  //console.log( 'explore.position: ', explore.position );
  
  if ( valid( explore.position?.coords?.latitude ) ){

    // get Qids for this geolocation
    let item_qid    = '';
    let item_label  = '';

    const url = `https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20WHERE%20%7B%0A%20%20%3Fitem%20(wdt%3AP31%2F(wdt%3AP279*))%20wd%3AQ486972.%0A%20%20SERVICE%20wikibase%3Aaround%20%7B%0A%20%20%20%20%3Fitem%20wdt%3AP625%20%3Flocation.%0A%20%20%20%20bd%3AserviceParam%20wikibase%3Acenter%20%22Point(${explore.position.coords.longitude}%20${explore.position.coords.latitude})%22%5E%5Egeo%3AwktLiteral%3B%0A%20%20%20%20%20%20wikibase%3Aradius%20%2210%22%3B%0A%20%20%20%20%20%20wikibase%3Adistance%20%3Fdistance.%0A%20%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${explore.language}%2Cen%2Cceb%2Csv%2Cde%2Cfr%2Cnl%2Cru%2Cit%2Ces%2Cpl%2Cwar%2Cvi%2Cja%2Czh%2Carz%2Car%2Cuk%2Cpt%2Cfa%2Cca%2Csr%2Cid%2Cno%2Cko%2Cfi%2Chu%2Ccs%2Csh%2Cro%2Cnan%2Ctr%2Ceu%2Cms%2Cce%2Ceo%2Che%2Chy%2Cbg%2Cda%2Cazb%2Csk%2Ckk%2Cmin%2Chr%2Cet%2Clt%2Cbe%2Cel%2Caz%2Csl%2Cgl%2Cur%2Cnn%2Cnb%2Chi%2Cka%2Cth%2Ctt%2Cuz%2Cla%2Ccy%2Cta%2Cvo%2Cmk%2Cast%2Clv%2Cyue%2Ctg%2Cbn%2Caf%2Cmg%2Coc%2Cbs%2Csq%2Cky%2Cnds%2Cnew%2Cbe-tarask%2Cml%2Cte%2Cbr%2Ctl%2Cvec%2Cpms%2Cmr%2Csu%2Cht%2Csw%2Clb%2Cjv%2Csco%2Cpnb%2Cba%2Cga%2Cszl%2Cis%2Cmy%2Cfy%2Ccv%2Clmo%2Cwuu%2Cbn%22.%20%7D%0A%7D%0AORDER%20BY%20(%3Fdistance)%0ALIMIT%201`;

    //const url = `https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20WHERE%20%7B%0A%20%20%3Fitem%20(wdt%3AP31%2F(wdt%3AP279*))%20wd%3AQ515.%0A%20%20SERVICE%20wikibase%3Aaround%20%7B%0A%20%20%20%20%3Fitem%20wdt%3AP625%20%3Flocation.%0A%20%20%20%20bd%3AserviceParam%20wikibase%3Acenter%20%22Point(${explore.position.coords.longitude}%20${explore.position.coords.latitude})%22%5E%5Egeo%3AwktLiteral%3B%0A%20%20%20%20%20%20wikibase%3Aradius%20%2210%22%3B%0A%20%20%20%20%20%20wikibase%3Adistance%20%3Fdistance.%0A%20%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${explore.language}%2Cen%22.%20%7D%0A%7D%0AORDER%20BY%20(%3Fdistance)%0ALIMIT%201`;

    //console.log( url );

    $.ajax({ // fetch sparql-data

      url: url,
      jsonp: "callback",
      dataType: "json",

      success: function( response ) {

        // TODO: check that we have valid results
        let json = response.results.bindings || [];

        if ( typeof json === undefined || typeof json === 'undefined' ){
          $('#blink').hide();
          return 1; // no more results
        }
        else if ( json.length === 0 ) { // no more results
          $('#blink').hide();
          return 0;
        }

        json.forEach(( v ) => {

          if ( valid( v.itemLabel.value ) ){
            item_label  = v.itemLabel.value;
            item_qid    = v.item.value.replace( 'http://www.wikidata.org/entity/', '' );
          }

        });

        // show sidebar-results
        handleClick({ 
          id        : 'n1-0',
          type      : 'articles',
          title     : item_label,
          language  : explore.language,
          qid       : item_qid,
          url       : '',
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p0',
        });

        // content pane
        handleClick({ 
          id        : 'n1-0',
          type      : 'link-split',
          title     : item_label,
          language  : explore.language,
          qid       : item_qid,
          url       : `${explore.base}/app/nearby/#lat=${explore.position.coords.latitude}&lng=${explore.position.coords.longitude}&zoom=17&interface_language=${explore.language}&qid=${item_qid}&layers=wikipedia`,
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p1',
        });

      },  
    
    }); 

  }

}

async function showRandomTopicItem( prop, topic ){

  let qid = '';

  // the "topic" can be a Qid or an topic-indicator-string (requiring a lookup)
	if ( isQid( topic ) ){

    qid = topic;

  }
  else { // topic-string

    // TODO: verify the topic-list is valid
    qid = 'Q' + indicators[topic].value[ getRandomInt( indicators[topic].value.length ) ];

  }

  let item_qid    = '';
  let item_label  = '';

	const url = 'https://query.wikidata.org/sparql?format=json&query=SELECT%20%3Fitem%20%3FitemLabel%20(MD5(CONCAT(str(%3Fitem)%2Cstr(RAND())))%20as%20%3Frandom)%20%0AWHERE%20%0A%7B%0A%20%20%3Fitem%20wdt%3A' + prop + '%20wd%3A' + qid + '.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%2Cen%22.%20%7D%0A%7D%0AORDER%20BY%20%3Frandom%0ALIMIT%201';

  $.ajax({ // fetch sparql-data

		url: url,
		jsonp: "callback",
		dataType: "json",

		success: function( response ) {

			console.log( response );

			// TODO: check that we have valid results
			let json = response.results.bindings || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();
				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results
        $('#blink').hide();
				return 0;
			}

			json.forEach(( v ) => {

        if ( valid( v.itemLabel.value ) ){
          item_label  = v.itemLabel.value;
          item_qid    = v.item.value.replace( 'http://www.wikidata.org/entity/', '' );
        }

			});

      // show sidebar-results
			handleClick({ 
        id        : 'n1-0',
				type      : 'explore',
				title     : item_label,
				language  : explore.language,
				qid       : item_qid,
				url       : '',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p0',
			});

		},  
  
  }); 

}

async function showRandomOrganism( ){

  const list = [ 'mammal', 'bird', 'reptile', 'fish', 'amphibian', 'insect', 'spider', 'plant', 'algae', 'fungus', 'protist', 'bacterium', 'archae', 'virus' ];
  const nr  = Math.floor( Math.random() * list.length );

  showRandomListItem( list[ nr ] );

}

async function showRandomRadioStation(){

  $('#blink').show();

  $.ajax({

		url: 'https://nl1.api.radio-browser.info/json/stations/bylanguageexact/' + explore.language_name.toLowerCase(),

		dataType: "json",

		success: function( response ) {

			let json = response || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();

        $.toast({
          heading: 'no results found',
          text: '',
          hideAfter : 2000,
          stack : 1,
          showHideTransition: 'slide',
          icon: 'info'
        })

				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results

        $('#blink').hide();

        $.toast({
          heading: 'no results found',
          text: '',
          hideAfter : 2000,
          stack : 1,
          showHideTransition: 'slide',
          icon: 'info'
        })

				return 0;

			}

      const nr      = Math.floor( Math.random() * json.length );
      const station = json[ nr ];

      // sidebar results
      handleClick({ 
        id        : 'n1-0',
        type      : 'articles',
        title     : station.name,
        language  : explore.language,
        qid       : '',
        url       : '',
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p0',
      });

      // content pane
      handleClick({ 
        id        : 'n1-0',
        type      : 'link',
        title     : station.name,
        language  : explore.language,
        qid       : '',
        url       : station.url_resolved,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

    }

  });

}

async function showRandomListItem( name ){

  $('#blink').show();

  // data creation steps:
  //  wdtaxonomy Q7377 -P P171 --brief -f csv -o /tmp/foo.csv
  //  sed -nr 's/.*,Q([0-9]*),.*$/\1/p' foo.csv | paste -sd "," - > NAME.json
  //  scp -P22000 NAME.js jama@wikischool.org:/var/www/html/conze.pt' + explore.base + '/app/explore2/assets/json/lists/

  let url = '';

  if ( name === 'featured-article' ){ // non-standard URL

    url = explore.base + '/app/explore2/assets/json/lists/featured-article/' + explore.language + '.json';

  }
  else if ( name === 'featured-portal' ){ // non-standard URL

    url = explore.base + '/app/explore2/assets/json/lists/featured-portal/' + explore.language + '.json';

  }
  else { // standard URL

    url = explore.base + '/app/explore2/assets/json/lists/' + name + '.json';

  }

  fetch( url )
    .then(response => response.json())
    .then( list => {

      const nr  = Math.floor( Math.random() * list.length );
      let qid = 'Q' + list[ nr ];
      let other_id = '';

      if ( name === 'country-map' ){ // split QID|OSMID

        const fields = qid.split('|');
        qid = fields[0];
        other_id = fields[1];

      }

      let promiseB = fetchLabel([ qid ], explore.language ).then(function(result) {

        let label = '';

        if ( valid( result.entities ) ){

          if ( result.entities[ qid ]?.labels[ explore.language ] ){

            label = result.entities[ qid ].labels[ explore.language ].value;

            // sidebar results
            handleClick({ 
              id        : 'n1-0',
              type      : 'articles',
              title     : label,
              language  : explore.language,
              qid       : '' + qid,
              url       : '',
              tag       : '',
              languages : '',
              custom    : '',
              target_pane : 'p0',
            });

            // content pane info
            if ( name === 'country-map' ){ // split QID|OSMID

              handleClick({ 
                id        : 'n1-0',
                type      : 'link',
                title     : label,
                language  : explore.language,
                qid       : '' + qid,
                url       : `${explore.base}/app/map/?l=${explore.language}&bbox=&osm_id=${other_id}&qid=${qid}&title=${label}`,
                tag       : '',
                languages : '',
                custom    : '',
                target_pane : 'p1',
              });

            }
            else {

              handleClick({ 
                id        : 'n1-0',
                type      : 'wikipedia-qid',
                title     : label,
                language  : explore.language,
                qid       : '' + qid,
                url       : '',
                tag       : '',
                languages : '',
                custom    : '',
                target_pane : 'p1',
              });

            }

          }
          else {

            handleClick({ 
              id        : 'n1-0',
              type      : 'wikipedia-qid',
              title     : '',
              language  : explore.language,
              qid       : '' + qid,
              url       : '',
              tag       : '',
              languages : '',
              custom    : '',
              target_pane : 'p1',
            });

          }

        }
        else {

          $.toast({
              heading: 'no results found',
              text: '',
              hideAfter : 2000,
              stack : 1,
              showHideTransition: 'slide',
              icon: 'info'
          })

        }

      });

    });

}

async function showRandomLanguage(){

  $('#blink').show();

  const nr  = Math.floor( Math.random() * Object.keys( wp_languages ).length );
  const qid = 'Q' + wp_languages[ Object.keys( wp_languages )[ nr ] ].qid;

  let promiseB = fetchLabel([ qid ], explore.language ).then(function(result) {

    let label = '';

    if ( ! valid( result.entities[ qid ] ) ){

      console.log('missing language-qid for: ', wp_languages[ Object.keys( wp_languages )[ nr ] ] );

      return 1;

    }

    if ( result.entities[ qid ]?.labels[ explore.language ] ){

      label = result.entities[ qid ].labels[ explore.language ].value;

      handleClick({ 
        id        : 'n1-0',
        type      : 'articles',
        title     : label,
        language  : explore.language,
        qid       : '' + qid,
        url       : '',
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p0',
      });

      handleClick({ 
        id        : 'n1-0',
        type      : 'wikipedia-qid',
        title     : label,
        language  : explore.language,
        qid       : '' + qid,
        url       : '',
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

    }
    else {

      handleClick({ 
        id        : 'n1-0',
        type      : 'wikipedia-qid',
        title     : '',
        language  : explore.language,
        qid       : '' + qid,
        url       : '',
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

    }

  });

}

async function showRandomCountry(){

  const nr  = Math.floor( Math.random() * Object.keys( countries ).length );
  const qid = Object.keys( countries )[ nr ];

  let promiseB = fetchLabel([ qid ], explore.language ).then(function(result) {

    const label = result.entities[ qid ].labels[ explore.language ].value;

    // show results
    handleClick({ 
      id        : 'n1-0',
      type      : 'explore',
      title     : label,
      language  : explore.language,
      qid       : '' + qid,
      url       : '',
      tag       : '',
      languages : '',
      custom    : '',
      target_pane : 'p0',
    });

  });

}

async function showRandomDocumentary(){

  $('#blink').show();

  const chance  = 10;
  const rnd     = Math.random() * 100;

  if ( rnd < chance ) {

    showArchiveDocumentary();

  }
  else {

    showRandomYoutubeDocumentary();

  }

}

async function showRandomYoutubeDocumentary(){

  const year = new Date().getFullYear() - getRandomInt( 600 );
  const randomNumber = getRandomInt( 99 ) + 1;

  const randomBCCentury = getRandomInt( 1100 );
  const randomADCentury = getRandomInt( 1500 );

  let explore_string  = 'documentary ';

  const chance  = 10;
  const rnd     = Math.random() * 100;

  // random choice between century and year
  if ( rnd < chance ) {

    explore_string += randomBCCentury + ' BC';

  }
  else if ( rnd < chance * 2) {

    explore_string += randomADCentury + ' AD';

  }
  else {

    explore_string += year;

  }

  // show sidebar-results
  handleClick({ 
    id        : 'n1-0',
    type      : 'articles',
    title     : '' + explore_string.replace('documentary ', ''),
    language  : explore.language,
    qid       : '',
    url       : '',
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p0',
  });

  // open link in content-pane
  handleClick({ 
    id        : '0',
    type      : 'wander',
    title     : explore_string,
    language  : explore.language,
    qid       : '',
    url       : '',
    tag       : '',
    languages : '',
    custom    : 'long',
    target_pane : 'p1',
  });

}

async function showArchiveDocumentary() {

  let id              = '';
  let explore_string  = ''; // author, work title

	const year = new Date().getFullYear() - getRandomInt( 120 );
  const randomNumber = getRandomInt( 99 ) + 1;

	const url = 'https://archive.org/advancedsearch.php?q=(documentary ' + randomNumber + ')+and+mediatype%3Amovies+and+year%3A' + year + '+and+item_size%3A%5B%2250000000%22%20TO%2010000000000%5D' + '&rows=1&page=1&output=json';

	console.log( url );

  $.ajax({ // fetch sparql-data

		url: url,
		jsonp: "callback",
		dataType: "json",

		success: function( response ) {

			let json = response.response.docs || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();
				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results

        showArchiveDocumentary(); // search again
				return 0;

			}

      const item = json[0];

      if ( valid( item ) ){

        // set explore-query-string
        if ( valid( item.creator ) ){ // try creator-field

          if ( Array.isArray( item.creator ) ){

            explore_string = item.creator[0];

          }
          else {

            explore_string = item.creator;

          }

        }

        if ( explore_string === '' ){ // try "subject"-field

          if ( valid( item.subject ) ){

            if ( Array.isArray( item.subject ) ){

              explore_string = item.subject[0];

            }
            else {

              explore_string = item.subject;

            }

          }

        }


        if ( explore_string === '' ){ // try title-field

          if ( valid( item.title ) ){

            explore_string = item.title;

          }

        }

        if ( explore_string === '' ){ // still no title-string

          console.log( 'no usable title string found in this item: ',  item );
          explore_string = 'documentary';

        }

        // set item ID
        if ( valid( item.identifier ) ){

          id = item.identifier;

        }

      }
    
      // show sidebar-results
			handleClick({ 
        id        : 'n1-0',
				type      : 'articles',
				title     : explore_string,
				language  : explore.language,
				qid       : '',
				url       : '',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p0',
			});

			// open link in content-pane
			handleClick({ 
        id        : '0',
				type      : 'link',
				title     : explore_string,
				language  : explore.language,
				qid       : '',
				url       : 'https://archive.org/details/' + id + '&autoplay=1',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p1',
			});

		},  
  
  }); 

}

async function showRandomMusic(){

  $('#blink').show();

  const chance  = 90;
  const rnd     = Math.random() * 100;

  if ( rnd < chance ) {

    showArchiveMusic();

  }
  else {

    showWikidataMusic();

  }

}

async function showArchiveMusic(){

  let id              = '';
  let explore_string  = ''; // author, work title

	const year = new Date().getFullYear() - getRandomInt( 100 );
  const randomNumber = getRandomInt( 99 ) + 1;

	const url = 'https://archive.org/advancedsearch.php?q=(' + randomNumber + ')+and+mediatype%3Aaudio+and+year%3A' + year + '&rows=1&page=1&output=json';

  $.ajax({ // fetch sparql-data

		url: url,
		jsonp: "callback",
		dataType: "json",

		success: function( response ) {

			let json = response.response.docs || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();
				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results

        showRandomMusic(); // search again
				return 0;

			}

      const item = json[0];

      if ( valid( item ) ){

        // set explore-query-string
        if ( valid( item.creator ) ){ // try creator-field

          if ( Array.isArray( item.creator ) ){

            explore_string = item.creator[0];

          }
          else {

            explore_string = item.creator;

          }

        }

        if ( explore_string === '' ){ // try "subject"-field

          if ( valid( item.subject ) ){

            if ( Array.isArray( item.subject ) ){

              explore_string = item.subject[0];

            }
            else {

              explore_string = item.subject;

            }

          }

        }


        if ( explore_string === '' ){ // try title-field

          if ( valid( item.title ) ){

            explore_string = item.title;

          }

        }

        if ( explore_string === '' ){ // still no title-string

          explore_string = 'music';

        }

        // set item ID
        if ( valid( item.identifier ) ){

          id = item.identifier;

        }

      }
    
      // show sidebar-results
			handleClick({ 
        id        : 'n1-0',
				type      : 'articles',
				title     : explore_string,
				language  : explore.language,
				qid       : '',
				url       : '',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p0',
			});

			// open link in content-pane
			handleClick({ 
        id        : '0',
				type      : 'link',
				title     : explore_string,
				language  : explore.language,
				qid       : '',
				url       : 'https://archive.org/details/' + id + '&autoplay=1',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p1',
			});

		},  
  
  }); 

}

async function showWikidataMusic(){

  $('#blink').show();

  let audio_url   = '';

  let title       = '';
  let author      = '';
  let author_qid  = '';

  let item_qid    = '';
  let item_label  = '';

	const upper_year = new Date().getFullYear() - 70 - getRandomInt( 200 );
	const lower_year = upper_year - getRandomInt( 50 );

	const url = datasources.wikidata.endpoint + '?format=json&query=SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3Faudio%20%3Fcreator%20%3FcreatorLabel%20%3Finception%0AWHERE%20%0A%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ105543609%20.%0A%20%20%3Fitem%20wdt%3AP51%20%3Faudio%20.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP86%20%3Fcreator.%20%7D%20%0A%20%20%3Fitem%20wdt%3AP571%20%3Finception.%20%20%0A%20%20FILTER%20(%3Finception%20%3C%20%22' + upper_year + '-12-01T00%3A00%3A00Z%22%5E%5Exsd%3AdateTime)%0A%20%20FILTER%20(%3Finception%20%3E%20%22' + lower_year + '-01-01T00%3A00%3A00Z%22%5E%5Exsd%3AdateTime)%20%20%20%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%2Cen%22.%20%7D%0A%7D%20ORDER%20BY%20%3Finception%0ALIMIT%2010%0A%0A';

  $.ajax({ // fetch sparql-data

		url: url,
		jsonp: "callback",
		dataType: "json",

		success: function( response ) {

			// TODO: check that we have valid results
			let json = response.results.bindings || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();
				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results

        $('#blink').hide();
        showRandomMusic(); // search again
				return 0;

			}

      for (let i = 0; i < json.length; i++){

        const v = json[i];

        if ( valid( v.itemLabel.value ) ){
          item_label  = v.itemLabel.value;
          item_qid    = v.item.value.replace( 'http://www.wikidata.org/entity/', '' );
        }

        // TODO: handle items with multiple authors?
        if ( valid( v.creatorLabel ) ){

          if ( valid( v.creatorLabel.value ) ){

            author_qid  = v.creatorLabel.value.replace( 'http://www.wikidata.org/entity/', '' );
            author      = v.creatorLabel.value;

          }

        }

        if ( valid( v.audio.value ) ){

          let f = v.audio.value;

          if (  f.toLowerCase().endsWith('.mid') || // unsupported audio formats
                f.toLowerCase().endsWith('.midi')
              ){

				    continue;

          }
          else {

            audio_url = encodeURIComponent( f.replace( 'http:', 'https:' ) );

            break;

          }

        }

			};

      // show sidebar-results
			handleClick({ 
        id        : 'n1-0',
				type      : 'articles',
				title     : author,
				language  : explore.language,
				qid       : author_qid,
				url       : '',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p0',
			});

			// open link in content-pane
			handleClick({ 
        id        : '0',
				type      : 'link',
				title     : author,
				language  : explore.language,
				qid       : item_qid,
				url       : explore.base + '/app/audio/?url=' + encodeURIComponent( explore.base + '/app/cors/raw/?url=' + audio_url ),
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p1',
			});

		},  
  
  }); 

}

async function showRandomEuropeanaArtwork(){

  $('#blink').show();

	let view_url    = '';
  let title       = '';
  let item_qid    = '';
  let author      = '';
  let author_qid  = '';

	const url = 'https://www.europeana.eu/api/v2/search.json?wskey=4ZViVZKMe&rows=50&query=' + encodeURIComponent( explore.country_name ) + '&theme=art';

  console.log( url );

  $.ajax({ // fetch sparql-data

		url: url,
		jsonp: "callback",
		dataType: "json",

		success: function( response ) {

      //console.log( response );

			// TODO: check that we have valid results
			let json = response.items || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();
				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results

        $('#blink').hide();
				return 0;

			}

			const v = json.at( 2 );

			console.log( v );

			if ( valid( v.edmPreview ) ){

				console.log( '0: ', v.edmPreview[0] );

				//if ( valid( v.image  ) ){

          let label     = '';
          let label_url = '';
          let img       = '';
          let thumb     = '';
          let view_url 	= '';
          let desc      = '';
          let desc_plain= '';
          let subtitle  = '';

          let authors       = '';
          let authors_plain = '';

          let provider      = '';

					let attribution = '';
  
          if ( typeof v.title === undefined || typeof v.title === 'undefined' ){
            label = '---';
          }
          else {

            label  = v.title[0];

          }

          if ( valid( v.year ) ){

            if ( valid( v.year[0] ) ){

              desc = v.year[0];

            }

          }

          if ( valid( v.edmIsShownAt ) ){

            label_url  = v.edmIsShownAt[0];

          }

          if ( typeof v.dcDescription === undefined || typeof v.dcDescription === 'undefined' ){
            // do nothing
          }
          else {

            desc  += '';

            desc_plain = encodeURIComponent( v.dcDescription[0] );

          }

          if ( typeof v.dcCreator === undefined || typeof v.dcCreator === 'undefined' ){
            // do nothing
          }
          else {

            $.each( v.dcCreator, function ( j, name ) {

              if ( typeof name === undefined ){

                console.log('author undefined! skipping...');

                return 0;

              }
              else if ( name.startsWith( 'http' ) ){

                return 0;

              }

              // TODO: needs more name cleanups
              name = name.replace(/[#]/g, '').replace(/_/g, ' ').replace('Künstler/in', '').trim();

              authors_plain += name;

              let author_name = encodeURIComponent( name );

            });

          }

          if ( typeof v.dataProvider === undefined || typeof v.dataProvider === 'undefined' ){
            // do nothing
          }
          else {

            subtitle = v.dataProvider[0];
            provider = v.dataProvider[0];

          }

					console.log('1');

					if ( valid( v.edmPreview[0] ) ){

						console.log('2');

						img = v.edmPreview[0];

						// create IIIF-viewer-link
						let coll = { "images": [ ]};

						coll.images.push( [ img, label, desc_plain, authors_plain + '<br>', provider ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

						if ( coll.images.length > 0 ){ // we found some images

							// create an IIIF image-collection file
							let iiif_manifest_link = '/app/response/iiif-manifest.php?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

							view_url = '/app/iiif/index.html#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

							console.log( view_url );

							//view_url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

						}

					}

				//}

			};

			// open link in content-pane

			/*
      // show sidebar-results
			handleClick({ 
        id        : 'n1-0',
				type      : 'articles',
				title     : author,
				language  : explore.language,
				qid       : '', //author_qid,
				url       : '',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p0',
			});
			*/

			console.log( view_url );

      // show image in content-pane
			handleClick({ 
				id        : '000',
				type      : 'link',
				title     : '',
				language  : explore.language,
				qid       : '',
				url       : view_url,
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p1',
			});

		},
  
  }); 


}

async function showRandomArtwork(){

  $('#blink').show();

	let view_url    = '';
  let title       = '';
  let item_qid    = '';
  let author      = '';
  let author_qid  = '';

	const upper_year = new Date().getFullYear() - getRandomInt( 250 );
	const lower_year = upper_year - getRandomInt( 20 );

	const url = datasources.wikidata.endpoint + '?format=json&query=SELECT%20DISTINCT%20%3Finception%20%3Fitem%20%3FcreatorLabel%20%3Fcreator%20%3FitemLabel%20%3Fimage%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ3305213.%0A%20%20%3Fitem%20wdt%3AP18%20%3Fimage.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP170%20%3Fcreator.%20%7D%0A%20%20%3Fitem%20wdt%3AP571%20%3Finception.%0A%20%20FILTER%20(%3Finception%20%3C%20%22' + upper_year + '-12-01T00%3A00%3A00Z%22%5E%5Exsd%3AdateTime)%0A%20%20FILTER%20(%3Finception%20%3E%20%22' + lower_year + '-01-01T00%3A00%3A00Z%22%5E%5Exsd%3AdateTime)%20%20%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%2Cen%22%7D%0A%7D%20ORDER%20BY%20%3Finception%0ALIMIT%201%0A%23meta%3Aart%20%0A%23defaultView%3AImageGrid';

  $.ajax({ // fetch sparql-data

		url: url,
		jsonp: "callback",
		dataType: "json",

		success: function( response ) {

			// TODO: check that we have valid results
			let json = response.results.bindings || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();
				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results

        $('#blink').hide();
				return 0;

			}

			json.forEach(( v ) => {

				// use image to create an IIIF-link

				if ( valid( v.image  ) ){

					const img       = v.image.value;

          let file_name   = img.replace( 'http://commons.wikimedia.org/wiki/Special:FilePath/', '' );
					let commons_link= 'https://commons.wikimedia.org/wiki/File:' + file_name;

					let label       = '';
					let date        = '';
					let desc        = '';

					let attribution = '';
  
					if ( valid( v.itemLabel.value ) ){
						label     = title = v.itemLabel.value;
						item_qid  = v.item.value.replace( 'http://www.wikidata.org/entity/', '' );
					}

					if ( valid( v.inception.value ) ){
						date = v.inception.value.split('-')[0];
            label += ' (' + date + ')';
					}

          // TODO: handle items with multiple authors?
					if ( valid( v.creatorLabel.value ) ){

						author_qid  = v.creatorLabel.value.replace( 'http://www.wikidata.org/entity/', '' );
						author      = v.creatorLabel.value;

					}

					// create IIIF-viewer-link
					let coll = { "images": [ ]};

          desc = '';

          attribution = '<br>Source: ' + commons_link;
        
          // TODO: add an extra field to the IIIF-field for "url" using "v.links.web"?
					coll.images.push( [ img, encodeURIComponent( label ), encodeURIComponent( desc ), encodeURIComponent( 'Author: ' + author ), encodeURIComponent( attribution ) ] );

					if ( coll.images.length > 0 ){ // we found some images

						// create an IIIF image-collection file
						let iiif_manifest_link = explore.base + '/app/response/iiif-manifest.php?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

						let iiif_viewer_url = explore.base + '/app/iiif/index.html#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

						view_url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

					}

				}

			});

			// open link in content-pane

      // show sidebar-results
			handleClick({ 
        id        : 'n1-0',
				type      : 'articles',
				title     : author,
				language  : explore.language,
				qid       : '', //author_qid,
				url       : '',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p0',
			});

      // show image in content-pane
			handleClick({ 
				id        : '000',
				type      : 'link',
				title     : author,
				language  : explore.language,
				qid       : '',
				url       : view_url,
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p1',
			});

		},  
  
  }); 

}

async function showCurrentEventsPage(){

  $('#blink').show();

  $('#pager').hide();

  handleClick({ 
    id        : 'n1-0',
    type      : 'wikipedia-qid',
    title     : '',
    language  : explore.language,
    qid       : 'Q4597488',
    url       : '',
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });

}

async function showRandomQuery(){

  $('#blink').show();

  $('#pager').hide();

  handleClick({ 
    id        : 'n1-0',
    type      : 'random',
    title     : '',
    language  : explore.language,
    qid       : '',
    url       : '',
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });

  explore.type = 'string';

}

async function showMapCompare(){

  let message = '';

  if ( explore.map_compares.length >= 1 ){

    let queries = [];

    $.each( explore.map_compares, function( i, url_ ) {

      let item = {
        url   : url_,
        title : 'foo',
      };

      queries.push( item );

    });

    queries = encodeURIComponent( JSON.stringify( queries ) );

    //explore.custom = explore.compares;

    handleClick({
      id        : 'n1-0',
      type      : 'link',
      title     : explore.q.trim(),
      language  : explore.language,
      qid       : '',
      url       : encodeURIComponent( `${explore.base}/app/map/?l=${explore.language}&bbox=&lat=&lon=&osm_id=&qid=&title=&query=${queries}` ),
      tag       : '',
      languages : '',
      //ids     : explore.compares.join(), // TODO should we only pass this data to ONE field?
      //custom  : explore.compares.join(),
      target_pane : 'p1',
    });

    explore.custom = '';

    message = 'showing map comparison of ' + explore.map_compares.length + ' topics';

  }
  //else {
  //  message = 'Add at least one other topic to view the map comparision';
  //}

  $.toast({
    heading: '<span class="icon"><i class="fa-solid fa-plus" title="add to map compare"></i></span> &nbsp; topic added to map compare list',
    text: message,
    hideAfter : 5000,
    showHideTransition: 'slide',
    icon: 'success',
    stack: 1,
  })

}
