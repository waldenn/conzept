'use strict';

async function sparqlQueryCommand( args, view, list ){

  let conditions = args.toString();
  let sparql_conditions = [];

  let sparql_strings		= [];
  let sparql_filters		= [];

  let sparql_url				= '';

  if ( view === 'sidebar' ){ // wikidata-structured-query URL

    sparql_url  = datasources.wikidata.endpoint + '?format=json&query=SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20WHERE%20%7B%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20%3Fitem';

  }
  else { // Qid-fetching URL

    sparql_url  = datasources.wikidata.endpoint + '?format=json&query=SELECT%20DISTINCT%20%3Fitem%20WHERE%20%7B%20%3Fitem';

  }

  let sparql_url_web		= 'https://query.wikidata.org/embed.html#SELECT%20DISTINCT%20%3Fitem%20WHERE%20%7B%20%3Fitem';

  // split conditions by comma
  conditions = conditions.split(',');

  //console.log( 'SPARQL query: ', conditions  );

  conditions.forEach( ( c ) => {

    //console.log( c.split(' ') );

    sparql_conditions.push( c.replace(/\(|\)/g, '' ).split(' ') );

    // [ "P31", "=", "Q146" ]
    // ?item wdt:P31 wd:Q146 .

  });

  sparql_conditions.forEach( ( c, index ) => {

    const comparator = c[1]; // =, >, <

    // assume a qid for c[2] for now!

    if ( comparator === '='){

      // see also: https://www.w3.org/TR/sparql11-property-paths/
      if ( c[0].includes('/') ){ // property path statement (assume just 1-level for now)

        // P31/P279* Q123  ->  wdt:P31/wdt:P279* Q123

        let property_paths  = c[0].split('/');
        let string_         = '';

        property_paths.forEach( ( p ) => {

          string_ += ( '%20wdt%3A' + p + '%2F' );

        });

        // remove last '/'
        string_ = string_.replace(/%2F$/, '');
        string_ += '%20wd%3A' + c[2] + '%3B%0A%20';

        sparql_strings.push( string_ );

      }
      else { // > or < 

        sparql_strings.push( '%20wdt%3A' + c[0] + '%20wd%3A' + encodeURIComponent( c[2] ) + '%3B%0A%20' );

      }

    }
    else {

      //console.log( 'comparator: ', comparator );

      sparql_strings.push( '%20wdt%3A' + c[0] + '%20' + '%3Fns' + index + '%3B%0A%20' );

      // check type of compare-value
      if ( ['P569', 'P570', 'P571', 'P574', 'P575', 'P576', 'P577', 'P578', 'P580', 'P582', 'P585', 'P606', 'P619', 'P620', 'P621', 'P622', 'P729', 'P730', 'P746', 'P813', 'P1191', 'P1249', 'P1317', 'P1319', 'P1326', 'P1619', 'P1636', 'P1734', 'P2031', 'P2032', 'P2285', 'P2310', 'P2311', 'P2669', 'P2754', 'P2913', 'P2960', 'P3893', 'P3999', 'P4566', 'P4602', 'P5017', 'P5204', 'P6949', 'P7103', 'P7104', 'P7124', 'P7125', 'P7295', 'P7588', 'P7589', 'P8554', 'P8555', 'P8556', 'P9052', 'P9448', 'P9667', 'P9905', 'P9946', 'P10135', 'P10673', 'P10786'].includes( c[0] ) ){ // should be a timestamp

        sparql_filters.push( '%20FILTER(%3Fns' + index + '%20' + encodeURIComponent( comparator ) + '%20%22' + c[2] + '%22%5E%5Exsd%3AdateTime)%20' );

      } 
      else { // number

        sparql_filters.push( '%20FILTER(%3Fns' + index + '%20' + encodeURIComponent( comparator ) + '%20%22' + c[2] + '%22%5E%5Exsd%3Adecimal)%20' );

      }

    }

  })

  sparql_strings.forEach( ( c ) => {

    sparql_url      += c;
    sparql_url_web  += c;

  })

  if ( view === 'sidebar' ){ // show wikidata structured-search results

    // TODO: is an "ORDER BY" useful here?
    //  %20ORDER%20BY%20%3Fitem
    sparql_url      += sparql_filters.join('') + '%7D%20OFFSET%200%20LIMIT%20' + datasources.wikidata.pagesize;
    sparql_url_web  += sparql_filters.join('') + '%7D%20OFFSET%200%20LIMIT%20' + datasources.wikidata.pagesize;

  }
  else {

    sparql_url      += sparql_filters.join('') + '%7D%20LIMIT%20' + explore.sparql_limit;
    sparql_url_web  += sparql_filters.join('') + '%7D%20LIMIT%20' + explore.sparql_limit;

  }

  //console.log( sparql_conditions );
  //console.log( sparql_query );
  //console.log( sparql_strings );
  console.log( sparql_url );
  console.log( sparql_url_web );

  if ( view === 'sidebar' ){ // show wikidata structured-search results

    let query_json = '';

    runQuery( '', sparql_url  );

  }
  else { // execute query (to fetch a list of Qids), then render the Qids as requested

    $.ajax({ // fetch sparql-data

      url: sparql_url,

      // The name of the callback parameter, as specified by the YQL service
      jsonp: "callback",

      // Tell jQuery we're expecting JSONP
      dataType: "json",

      // Work with the response
      success: function( response ) {

        //console.log( response );

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

          //console.log( v );

          list.push( v.item.value.replace( 'http://www.wikidata.org/entity/', '' ) );

        });

        renderShowCommand( view, list );

      },  

    });

  }

}

async function fetchPresentationData( title, language ){

	// see also: https://dmitripavlutin.com/javascript-fetch-async-await/#5-parallel-fetch-requests
  const [q1Response, q2Response] = await Promise.allSettled([

    fetch( `${base}/app/cors/raw?url=${ encodeURIComponent( "https://${language}.wikipedia.org/w/api.php?action=query&titles=${title}&prop=extlinks&format=json" ) }` ),

  ]);

  const q1 = await q1Response.json();
  //const q2 = await q2Response.json();

  return q1;
  //return [q1, q2];

}

async function showPresentation( item, type ){

  item = unpackString( item ); 
  type = type.trim();

  //console.log( type, item );

  let languages = unpackString( item.languages ); 

  let sources = explore.datasources; // original datasource selection

  // FIXME: "inception" is not used when start_date is missing
  const start_date  = item.start_date ? parseInt( item.start_date ) : new Date().getFullYear() + 1;
  const end_date    = item.end_date ? parseInt( item.end_date ) : new Date().getFullYear() + 1;

  const date_obj = getDatingHTML( item, {} );

  let dating = $('<p>' + date_obj.dating + '</p>').text();
  //console.log( dating );

  //console.log( start_date, end_date, date_obj );

  // create Scheme-code for presentation
  let code      = '( presentation\n';
  let slides    = []; // code for each slide

  let title_    = removebracesTitle( item.title );
	let title_enc = encodeURIComponent( item.title );
	let title     = encodeURIComponent( quoteTitle( item.title ).replace( /"/g, '\"') );

  item.title    = title_.replace( /"/g, '\"').replace( /"/g, '\'');

  //let title_enc = encodeURIComponent( item.title );
  //let title     = encodeURIComponent( quoteTitle( item.title ).replace( /"/g, '\"') );
  //explore.q = item.title;

  explore.q     = item.title;

  let desc      = '';

  if ( valid( item.description ) ){

    desc = `<h3>${ removebracesTitle( item.description ) }</h3>`;

  }

	// set background
  let background= '';

  explore.presentation_text_background_css = '';
  /*
      setup phase:
      - take a list of presentation-slots: organism, ...
      - for each item: first setup the presentation-slot structure (based on the list)
        - item.presentation_slots.organism = {};
      - then when needed: add a presentation-slide to the structure
        - item.presentation_slots.organism = {
            simple_wikipedia: ...
            wikipedia: ...
            taxon_graph: ...
            ...
          };

      rendering phase:
      - check if the requested presentation slot exists
        - if so: check if the slide-elements has content
          - if so: order the slide-elements by rank (low-to-heigh)
            - if so, for each slide-element in the list 
 
  */

  // presentation configuration
  // TODO: use ${explore.base} below
  if ( type === 'substance' ){ background = `https://${explore.host}${explore.base}/app/explore2/assets/svg/backgrounds/003.svg`; }
  //else if ( type === 'mathematics' ){ background = `https://${explore.host}${explore.base}/app/explore2/assets/svg/backgrounds/004.svg`; }
  else { 

    if ( valid( item.image ) ){

      //console.log('before: ', item.image );

      //background = decodeURIComponent( item.image );
      //background = item.image.replace( /width=\d+px/g, 'width=600px' ).replace('(', '%28').replace(')', '%29');
      background = item.image.replace( /width=\d+px/g, 'width=600px' )

      //console.log('after: ', item.background );

      // for text readability 
      explore.presentation_text_background_css = 'background: rgba(0, 0, 0, 0.40) none repeat scroll 0% 0%; border-radius: 0.7em;';
    }
    else {

      // TODO: use these background-defaults from a field-property
			if ( type === 'organism' ){ background = `https://${explore.host}${explore.base}/app/explore2/assets/svg/backgrounds/005.svg`; }
			else if ( type === 'natural-concept' ){ background = "#115699" }
			else if ( type === 'cultural-concept' ){ background = "#115699" }
			else if ( type === 'meta-concept' ){ background = "#115699" }
			else if ( type === 'location' ){ background = `https://${explore.host}${explore.base}/app/explore2/assets/svg/backgrounds/001.svg`; }
			else if ( type === 'time' ){ background = `https://${explore.host}${explore.base}/app/explore2/assets/svg/backgrounds/003.svg`; }
			else if ( type === 'person' ){ background = "#115699" }
			else if ( type === 'group' ){ background = "#115699" }
			else if ( type === 'organization' ){ background = "#115699" }
			else if ( type === 'work' ){ background = "#115699" }

    }

  }

  if ( valid( background ) ){

    code += `  ( set '( 'background \"${background}\" ) )\n`;

  }

	// store initial language, so we can restore after it changes
  let language = explore.language;

	let external_links = [];

	// fetch API data
	// see also: https://dmitripavlutin.com/javascript-fetch-async-await/#5-parallel-fetch-requests
	/*
	fetchPresentationData( item.title, language ).then(( q1 ) => {

		if ( q1.query?.pages ){

			if ( valid( q1.query.pages[ Object.keys( q1.query.pages )[0] ] ) ){

				//console.log( q1.query.pages[ Object.keys( q1.query.pages )[0] ].extlinks );

				external_links = q1.query.pages[ Object.keys( q1.query.pages )[0] ].extlinks;

			}

		}
		*/

    let sub_name                    = '';

    if ( valid( item.taxon_name ) ){

      sub_name = `<h5>${ item.taxon_name }</h5>`;

    }

		// frequently used ready-made slides
		let video_slide                 = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3><i class='fa-solid fa-video' title='videos'></i></h3>"\n    ( show \'link \'( "/app/video/?l=${explore.language}#/search/%22${ title_enc }%22" ) ) )\n`;
		let open_library_meta_slide     = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>Open Library (meta-data)<h3><h3><i class='fa-solid fa-book-open' title='books'></i></h3>"\n    ( show \'link \'( "https://openlibrary.org/search?q=${title}&language=${explore.lang3}" ) ) )\n`;
		let open_library_fulltext_slide = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>Open Library (fulltext)</h3><h3><i class='fa-solid fa-book-open' title='books'></i></h3>"\n    ( show \'link \'( "https://openlibrary.org/search/inside?q=${title}&language=${explore.lang3}&has_fulltext=true" ) ) )\n`;
		let libretext_chemistry         = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>LibreText</h3><h3><i class='fa-solid fa-person-chalkboard'></i></h3>"\n    ( show \'link \'( "https://chem.libretexts.org/Special:Search?query=${ title }&type=wiki&classifications=article%3Atopic-category%2Carticle%3Atopic-guide" ) ) )\n`;
		let oer_commons_slide = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>OER Commons</h3><h3><i class='fa-solid fa-person-chalkboard'></i></h3>"\n    ( show \'link \'( "https://www.oercommons.org/search?f.search=${title}&f.language=${language}" ) ) )\n`;
		let scholia_slide               = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>Scholia</h3><h3><i class='fa-solid fa-graduation-cap' title='science research'></i></h3>"\n    ( show \'link \'( "https://scholia.toolforge.org/topic/${ item.qid }" ) ) )\n`;

		let rijksmuseum_search_slide    = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>Rijksmuseum</h3><h3><i class='fa-solid fa-paintbrush'></i></h3>"\n    ( show \'link \'( "https://${explore.host}${explore.base}/explore/${title_enc}?l=${language}&t=string&d=rijksmuseum&s=true#" ) ) )\n`; // TODO: add an URL parameter, to NOT store the datasource requested

    let commons_sparql_slide_url = encodeURIComponent( `/app/commons-sparql/?t=${title_enc}&l=${language}&url=https%3A%2F%2Fquery.wikidata.org%2Fsparql%3Fformat%3Djson%26query%3DSELECT%2520DISTINCT%2520%3Fitem%2520%3FitemLabel%2520%3Fimage%2520%3Fdate%2520WHERE%2520{%2520%2520{%2520%3Fitem%2520wdt%3AP31%2520wd%3AQ3305213.%2520}%2520%2520UNION%2520%2520{%2520%3Fitem%2520wdt%3AP31%2520wd%3AQ93184.%2520}%2520%2520UNION%2520%2520{%2520%3Fitem%2520wdt%3AP31%2520wd%3AQ11060274.%2520}%2520%2520UNION%2520%2520{%2520%3Fitem%2520wdt%3AP31%2520wd%3AQ15123870.%2520}%2520%2520%3Fitem%2520wdt%3AP170%2520wd%3A${item.qid}.%2520%2520%3Fitem%2520wdt%3AP18%2520%3Fimage.%2520%2520OPTIONAL%2520{%2520%3Fitem%2520wdt%3AP571%2520%3Fdate.%2520}%2520%2520SERVICE%2520wikibase%3Alabel%2520{%2520bd%3AserviceParam%2520wikibase%3Alanguage%2520%2522en%2Cen%2Cceb%2Csv%2Cde%2Cfr%2Cnl%2Cru%2Cit%2Ces%2Cpl%2Cwar%2Cvi%2Cja%2Czh%2Carz%2Car%2Cuk%2Cpt%2Cfa%2Cca%2Csr%2Cid%2Cno%2Cko%2Cfi%2Chu%2Ccs%2Csh%2Cro%2Cnan%2Ctr%2Ceu%2Cms%2Cce%2Ceo%2Che%2Chy%2Cbg%2Cda%2Cazb%2Csk%2Ckk%2Cmin%2Chr%2Cet%2Clt%2Cbe%2Cel%2Caz%2Csl%2Cgl%2Cur%2Cnn%2Cnb%2Chi%2Cka%2Cth%2Ctt%2Cuz%2Cla%2Ccy%2Cta%2Cvo%2Cmk%2Cast%2Clv%2Cyue%2Ctg%2Cbn%2Caf%2Cmg%2Coc%2Cbs%2Csq%2Cky%2Cnds%2Cnew%2Cbe-tarask%2Cml%2Cte%2Cbr%2Ctl%2Cvec%2Cpms%2Cmr%2Csu%2Cht%2Csw%2Clb%2Cjv%2Csco%2Cpnb%2Cba%2Cga%2Cszl%2Cis%2Cmy%2Cfy%2Ccv%2Clmo%2Cwuu%2Cbn%2522.%2520}}ORDER%2520BY%2520DESC(%3Fdate)%0D%0A` );

		let commons_sparql_slide    = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>Commons paintings</h3><h3><i class='fa-solid fa-paintbrush'></i></h3>"\n    ( show \'audio-query \'( "source:conzept;start:${start_date};end:${end_date}" ) )\n    ( show \'link \'( "${commons_sparql_slide_url}" ) ) )\n`;

		let openalex_search_slide       = '';

    if ( valid( item.openalex?.startsWith("C") ) ){ // concept

      openalex_search_slide = `  ( slide "${ item.title } ${ sub_name } <h3>OpenAlex concept</h3> <h3><i class='fa-regular fa-newspaper' title='OpenAlex topic-related works'></i></h3>"\n    ( show \'link \'( "https://openalex.org/works?sort=cited_by_count%3Adesc&column=display_name,publication_year,type,open_access.is_oa,cited_by_count&page=1&filter=concepts.id%3A${ item.openalex },language%3A${language}%2Ben" ) ) )\n`;

    }
    else {

      openalex_search_slide = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>OpenAlex search</h3><h3><i class='fa-regular fa-newspaper'></i></h3>"\n    ( show \'link \'( "https://openalex.org/works?page=1&filter=default.search%3A${title},language%3A${language}%2Ben&sort=relevance_score%3Adesc&group_by=publication_year,open_access.is_oa,authorships.institutions.lineage,type" ) ) )\n`; // datasource link: explore/${title_enc}?l=${language}&t=string&d=openalex&s=true#
    }

    let commons_slide               = '';
    let commons_time_music_slide    = '';
    let commons_country_music_slide = '';

    if ( valid( item.thumbnail ) ){

	    commons_slide = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3><i class='fa-regular fa-image' title='Commons images'></i></h3>"\n    ( show \'link \'( "/app/commons-qid/?q=${ item.qid }" ) ) )\n`;
		  commons_time_music_slide      = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>Commons</h3><h3><i class='fa-regular fa-image' title='Commons images'></i></h3>"\n    ( show \'audio-query \'( "source:conzept;start:${start_date};end:${end_date}" ) )\n    ( show \'link \'( "/app/commons-qid/?q=${ item.qid }" ) ) )\n`;
		  commons_country_music_slide   = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>Commons</h3><h3><i class='fa-regular fa-images' title='images'></i></h3>"\n    ( show \'audio-query \'( "source:conzept;country:${ valid( item.country )? item.country : '' };" ) )\n    ( show \'link \'( "/app/commons-qid/?q=${ item.qid }" ) ) )\n`;

    }

    let ai_chat_slide       = '';

    if ( valid( explore.openai_enabled ) ){

      ai_chat_slide = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3><h3>AI chat</h3><h3><i class='fa-solid fa-wand-sparkles' title='AI chat'></i></h3>"\n    ( show \'link-split \'( "/app/chat/?m=${ title }&l=${explore.language}&t=examinator" ) ) )\n`;
      //ai_chat_slide = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3><h3>AI chat</h3><h3><i class='fa-solid fa-wand-sparkles' title='AI chat'></i></h3>"\n    ( show \'link-split \'( "/app/chat/?m=${ title }&l=${explore.language}&t=${ getTutor( item ) }" ) ) )\n`;

    }

    let similar_slide = '';

    if (  ( checkTag( item, 0, ["location", "person", "group", "organization", "work", "natural-concept", "cultural-concept", "meta-concept"] ) ||
          checkTag( item, 1, "geographical-structure") ) &&
          valid( getSimilarSparqlURL( item ) )
    ){

      // FIXME: getSimilarSparqlURL() produces a non-valid LISP-string
	    //similar_slide = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3><h3>similar topics</h3><h3><i class='fa-solid fa-rainbow' title='similar topics'></i></h3>"\n    ( show \'link-split \'( "${ getSimilarSparqlURL( item ) }" ) ) )\n`;

    }

		let europeana_slide = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3><i class='fa-regular fa-image' title='Europeana images'></i></h3>"\n    ( show \'link \'( "/app/europeana/?q=${ title }&l=${language}&t=images,videos,sounds,3ds" ) ) )\n`;
		let europeana_time_music_slide    = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>Europeana</h3><h3><i class='fa-regular fa-image' title='Europeana images'></i></h3>"\n    ( show \'audio-query \'( "source:conzept;start:${start_date};end:${end_date}" ) )\n    ( show \'link \'( "/app/europeana/?q=${ title }&l=${language}&t=images,videos,sounds,3ds" ) ) )\n`;
		let europeana_country_music_slide = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>Europeana</h3><h3><i class='fa-regular fa-images' title='images'></i></h3>"\n    ( show \'audio-query \'( "source:conzept;country:${ valid( item.country )? item.country : '' };" ) )\n    ( show \'link \'( "/app/europeana/?q=${ title }&l=${language}&t=images,sounds,texts,videos,3ds" ) ) )\n`;

		let bing_images_slide           = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>Bing images</h3><h3><i class='fa-regular fa-image' title='Bing images'></i></h3>"\n    ( show \'link \'( "https://www.bing.com/images/search?q=${item.title}&form=HDRSC2&setlang=${explore.language}&first=1" ) ) )\n`;
		let arxiv_slide = `  ( slide "${ item.title } ${ sub_name } <h3>arXiv</h3> <h3>${ dating }</h3> <h3><i class='fa-regular fa-newspaper' title='science research'></i></h3>"\n    ( show \'link \'( "https://search.arxiv.org/?query=${title}&in=grp_math" ) ) )\n`; // note: only fulltext-search works for embedding the webpage

    //let quiz_location_slide         = `  ( slide "${ item.title } ${ sub_name } <h3></h3> <h3>location quiz</h3> <h3><i class='fa-solid fa-puzzle-piece' title='guess the location'></i></h3>"\n    ( show \'link \'( "/app/quiz/location/?${ item.qid }" ) ) )\n`;

    // conditional common-slides
		let linkgraph_slide   = '';
    let timeline_slide    = '';

		let street_map_slide  = '';
		let nearby_map_slide  = '';
		let satellite_map     = '';

    // Wikipedia requirement
		if ( item.datasource === 'wikipedia' ){
      linkgraph_slide   = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3><i class='fa-solid fa-diagram-project' title='link relations'></i></h3>"\n    ( show \'linkgraph \'( ${ item.qid } ) ) )\n`;
      timeline_slide    = `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>timeline</h3> <h3><i class='fa-solid fa-timeline' title='Wikipedia article timeline'></i></h3>"\n    ( show \'link \'( "/app/timeline-wikipedia/?t=${title_enc}" ) ) )\n`;
    }

    // Geo-location requirement
		if ( valid( item.lat ) ){

			street_map_slide  = `  ( slide "${ item.title } ${ sub_name } <h3>streetmap</h3><h3><i class='fa-regular fa-map' title='map'></i></h3>"\n    ( show \'link \'( "/app/map/?l=${explore.language}&bbox=${getBoundingBox(item.lon, item.lat, 0.05 )}&lat=${item.lat}&lon=${item.lon}&osm_id=${ valid( item.osm_relation_id )? item.osm_relation_id : '' }&qid=${item.qid}&title=${title_enc}" ) ) )\n`;
			nearby_map_slide  = `  ( slide "${ item.title } ${ sub_name } <h3>nearby map</h3><h3><i class='fa-regular fa-map' title='map'></i></h3>"\n    ( show \'link-split \'( "/app/nearby/#lat=${item.lat}&lng=${item.lon}&zoom=17&interface_language=${language}&layers=wikipedia" ) ) )\n`;

			satellite_map     = `  ( slide "${ item.title } ${ sub_name } <h3>satellite map</h3><h3><i class='fa-regular fa-map' title='map'></i></h3>"\n    ( show \'link \'( "/app/map3d/?lat=${item.lat}&lon=${item.lon}" ) ) )\n`;

		}

		// START of slide content

		// COMMON SLIDES

		if ( language === 'en' ){

			if ( valid( languages['simplewiki'] ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } ${ desc } <h3>${ dating }</h3> <h4>(Wikipedia simple)</h4>"\n    ( show \'link \'( "/app/wikipedia/?t=${ title_enc }&l=simple&qid=${ item.qid }&dir=ltr" ) ) )\n` ); }

		}

		// note: we need to set the initial-language again before the next slide (since the previous "simple-language" slide might have changed the language)
		slides.push( `  ( slide "${ item.title } ${ sub_name } ${ desc } <h3>${ dating }</h3> <h4>(Wikipedia)</h4>"\n    ( show \'topic \'( ${ item.qid } ${ language }  ) ) ) \n` );

		if ( valid( item.wikiversity ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>Wikiversity</h3>"\n    ( show \'link \'( "${ item.wikiversity }" ) ) )\n` ); }

    // OpenAlex slide
		if ( valid( item.openalex ) ){

      if ( item.openalex.startsWith("A") ){ // author

        slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>OpenAlex</h3> <h3><i class='fa-regular fa-newspaper' title='OpenAlex institution works'></i></h3>"\n    ( show \'link \'( "https://openalex.org/works?sort=cited_by_count%3Adesc&column=display_name,publication_year,type,open_access.is_oa,cited_by_count&page=1&filter=authorships.institutions.lineage%3A${ item.openalex },language%3A${language}%2Ben" ) ) )\n` );

      }
      else if ( item.openalex.startsWith("I") ){ // institution

        slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>OpenAlex</h3> <h3><i class='fa-regular fa-newspaper' title='OpenAlex author works'></i></h3>"\n    ( show \'link \'( "https://openalex.org/works?sort=cited_by_count%3Adesc&column=display_name,publication_year,type,open_access.is_oa,cited_by_count&page=1&filter=authorships.author.id%3A${ item.openalex },language%3A${language}%2Ben" ) ) )\n` );

      }

    }

    // MAIN-TAG SLIDES

		if ( type === 'substance' ){

      if ( valid( item.chemical_formula ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h2><span class='withborder'><a target='infoframe' style='text-decoration:none !important;' href='/app/wikipedia/?qid=Q83147'>${ ( valid( item.chemical_formula ) ? item.chemical_formula : '' ) }</a></span></h2>"\n    ( show \'chemical \'( ${ item.pubchem } ) ) )\n` ); }

			slides.push( commons_slide );
			slides.push( video_slide );
			slides.push( linkgraph_slide );

			if ( language === 'en' ){ slides.push( libretext_chemistry ); }

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			if ( valid( item.uniprot_protein ) ){  slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>UniProt</h3>"\n    ( show \'link \'( "https://www.uniprot.org/uniprot/${item.uniprot_protein}" ) ) )\n` ); }

			if ( valid( item.pubchem ) ){  slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>PubChem</h3>"\n    ( show \'link \'( "https://pubchem.ncbi.nlm.nih.gov/compound/${ item.pubchem }" ) ) )\n` ); }

			if ( valid( item.chebi ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>ChEBI</h3>"\n    ( show \'link \'( "https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:${ item.chebi }" ) ) )\n` ); }

			slides.push( openalex_search_slide );
			slides.push( scholia_slide );
			//slides.push( arxiv_slide );

		}

		else if ( type === 'organism' ){

			if ( valid( item.gbif_id ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3><i class='fa-solid fa-binoculars' title='GBIF observations'></i></h3>"\n    ( show \'link \'( "/app/response/gbif-map.php?l=${language}&t=${title_enc}&id=${item.gbif_id}" ) ) )\n` ); }

			slides.push( commons_slide );

			slides.push( video_slide );

			if ( valid( item.has_taxon ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3><i class='fa-solid fa-sitemap' title='taxon tree'></i></h3>"\n    ( show \'link-split \'( "/app/tree/${language}/P171/${item.qid}" ) ) )\n` ); }

			//if ( valid( item.has_taxon ) ){ slides.push( `  ( slide "${ item.title } <br><h3><i class='fa-solid fa-sitemap' title='taxon tree'></i></h3>"\n    ( show \'link-split \'( "/app/query/embed.html?l=${explore.language}#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Fpic%20%3FlinkTo%0AWHERE%0A%7B%0A%20%20wd%3A${item.qid}%20wdt%3AP171*%20%3Fitem%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP171%20%3FlinkTo%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP18%20%3Fpic%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7Bbd%3AserviceParam%20wikibase%3Alanguage%20%22${explore.language}%2Cen%22%20%7D%0A%7D%23defaultView%3AGraph%0A%23meta%3A${title_enc}%3Alayout-topdown" ) ) )\n` ); }

			if ( valid( item.inaturalist_taxa ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3><i class='fa-solid fa-puzzle-piece' title='taxon location quiz'></i></h3>"\n    ( show \'link \'( "/app/quiz/location-nature/index.html?taxon_id=${item.inaturalist_taxa}" ) ) )\n` ); }

			slides.push( linkgraph_slide );
			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );
			slides.push( openalex_search_slide );
			slides.push( scholia_slide );

		}
		else if ( type === 'cultural-concept' ){

      if ( checkTag( item, 1, ["art-movement"] ) ){

        slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>Open Art Browser</h3><h3><i class='fa-regular fa-images' title='images'></i></h3>"\n    ( show \'audio-query \'( "source:conzept;start:${start_date};end:${end_date}" ) )\n    ( show \'link \'( "https://openartbrowser.org/en/movement/${item.qid}?tab=artworks&page=0" ) ) )\n` );

      }

			slides.push( commons_time_music_slide );

			//slides.push( europeana_time_music_slide );
			if ( valid( item.influenced_by_entitree ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>influence</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "/app/tree/${language}/P737/${item.qid}" ) ) )\n` ); }
			//slides.push( bing_images_slide );
			slides.push( video_slide );
			slides.push( linkgraph_slide );

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			slides.push( openalex_search_slide );
			slides.push( scholia_slide );

		}
		else if ( type === 'meta-concept' ){

      if ( language === 'en' ){

		    if ( valid( item.iep ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>Internet Encyclopedia of Philosophy</h3>"\n    ( show \'link \'( "https://philpapers.org/browse/${ item.iep }" ) ) )\n` ); }

		    if ( valid( item.stanford_encyclopedia_of_philosophy ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>Stanford Encyclopedia of Philosophy</h3>"\n    ( show \'link \'( "https://plato.stanford.edu/entries/${ item.stanford_encyclopedia_of_philosophy }" ) ) )\n` ); }

		    if ( valid( item.philpapers_topic ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>PhilPapers topic</h3>"\n    ( show \'link \'( "https://philpapers.org/browse/${ item.philpapers_topic }" ) ) )\n` ); }

      }

			slides.push( video_slide );
			slides.push( linkgraph_slide );

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			slides.push( openalex_search_slide );
			slides.push( scholia_slide );

      // mathematics
      if ( checkTag( item, 1, "mathematics") ){

        if ( item.mathworld ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <br><h3>Wolfram MathWorld</h3>"\n    ( show \'link \'( "https://mathworld.wolfram.com/${item.mathworld}.html" ) ) )\n` ) };

        slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>GeoGebra</h3>"\n    ( show \'link \'( "https://www.geogebra.org/search/${ title }" ) ) )\n` );

        if ( language === 'en' ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>LibreText</h3>"\n    ( show \'link \'( "https://math.libretexts.org/Special:Search?query=${ title }&type=wiki&classifications=article%3Atopic-category%2Carticle%3Atopic-guide" ) ) )\n` ); }

        slides.push( oer_commons_slide );

        if ( item.msc2010_id ){ slides.push( `  ( slide "${ item.title } <h3>Mathematics Subject Classification</h3>"\n    ( show \'link \'( "https://mathscinet.ams.org/mathscinet/msc/msc2010.html?t=${ item.msc2010_id }" ) ) )\n` ) };

        slides.push( `  ( slide "${ item.title } <h3>Open Syllabus Galaxy</h3>"\n    ( show \'link \'( "https://galaxy.opensyllabus.org/#!search/courses/${title}" ) ) )\n` );

        slides.push( `  ( slide "${ item.title } <h3>EuDML</h3><h3><i class='fa-solid fa-graduation-cap' title='science research'></i></h3>"\n    ( show \'link \'( "https://eudml.org/search/page?q=sc.general*op*l_0*c_0all_0eq%253A1.${title}&qt=SEARCH" ) ) )\n` );

      }

		}

		else if ( type === 'location' ){

			// FIXME: check if article-language is available
			//if ( valid( item.topic_history ) ){ slides.push( `  ( slide "${ item.title } <h3><i class='fa-regular fa-clock' title='history'></i></h3>"\n    ( show \'link \'( "/app/wikipedia/?t=&l=${language}&qid=${ item.topic_history }&dir=ltr" ) ) )\n` ); }

			// FIXME: There may be an Qid for this location-culture, but we also need to check that the article-language is available for item.culture.
			//  example: NL-language -> "Germany"-article-presentation -> culture-article does not exist in Dutch!
			//if ( valid( item.culture ) ){ slides.push( `  ( slide "${ item.title } <h3><i class='fa-solid fa-hand-holding-heart' title='culture'></i></h3>"\n    ( show \'audio-query \'( "source:conzept;country:${ valid( item.country )? item.country : '' };" ) ) ( show \'link \'( "/app/wikipedia/?t=&l=${language}&qid=${ item.culture }&dir=ltr" ) ) )\n` ); }

			if ( valid( item.wikivoyage ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>Wikivoyage</h3><h3><i class='fa-solid fa-plane-departure' title='travel information'></i></h3>"\n    ( show \'link \'( "${ item.wikivoyage }" ) ) )\n` ); }

			slides.push( street_map_slide );
			slides.push( nearby_map_slide );

			if ( valid( item.lat ) ){ slides.push( satellite_map ) };
			//if ( valid( item.lat ) ){ slides.push( street_map_slide ) };

			slides.push( commons_country_music_slide );
			//slides.push( europeana_country_music_slide );
			//slides.push( bing_images_slide );
			slides.push( video_slide );

			slides.push( linkgraph_slide );

			// FIXME: field-URL required a "\n" before defaultView
			if ( valid( item.country_l1_subdivisions_query ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>L1 admin subdivisions</h3><h3><i class='fa-regular fa-map' title='L1 division map'></i></h3>"\n    ( show \'link-split \'( "/app/query/embed.html?l=${language}#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3A${ item.l1 }.%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%2C${ language }%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirt%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%0A%20%0A%7D%0AORDER%20BY%20%3FitemLabel%20%0ALIMIT%202000\n%0A%23defaultView%3AMap%0A%23meta%3Alevel-1%20subdivisions%20in%20${title_enc}%0A%0A" ) ) )\n` ); }

			// FIXME: field-URL required a "\n" before defaultView
			if ( valid( item.country_l2_subdivisions_query ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>L2 admin subdivisions</h3><h3><i class='fa-regular fa-map' title='L1 division map'></i></h3>"\n    ( show \'link-split \'( "/app/query/embed.html?l=${language}#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3A${ item.l2 }.%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%2C${ language }%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirt%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%0A%20%0A%7D%0AORDER%20BY%20%3FitemLabel%20%0ALIMIT%202000\n%0A%23defaultView%3AMap%0A%23meta%3Alevel-2%20subdivisions%20in%20${title_enc}%0A%0A" ) ) )\n` ); }

		  if ( valid( item.iso2 ) ){ // country

			  slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>Gapminder stats</h3><h3><i class='fa-solid fa-chart-line' title='Gapminder stats'></i></h3>"\n    ( show \'link \'( "https://www.gapminder.org/tools/#$model$markers$line$data$filter$dimensions$geo$/$or@$country$/$in@=${ countries[ item.qid ].iso3.toLowerCase() };;;;;;;;&encoding$selected$data$filter$markers@=${ countries[ item.qid ].iso3.toLowerCase() };;;;&y$data$concept=pop&space@=geo&=time;;&scale$type:null&domain:null&zoomed:null;;;;;;&chart-type=linechart&url=v" ) ) )\n` );

      }

			slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>railway map</h3><h3><i class='fa-solid fa-train' title='railway map'></i></h3>"\n    ( show \'link \'( "https://www.openrailwaymap.org/?style=standard&lat=${item.lat}&lon=${item.lon}&zoom=11" ) ) )\n` );
			//slides.push( `  ( slide "${ item.title } <h3>infrastructure map</h3><h3><i class='fa-regular fa-map' title='map'></i></h3>"\n    ( show \'link \'( "https://openinframap.org/#8/${item.lat}/${item.lon}" ) ) )\n` );

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			slides.push( openalex_search_slide );
			slides.push( scholia_slide );

		}
		else if ( type === 'natural-concept' ){

			slides.push( commons_slide );

			slides.push( video_slide );

			slides.push( linkgraph_slide );

      //slides.push( quiz_location_slide );

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			slides.push( openalex_search_slide );
			slides.push( scholia_slide );

    }
		else if ( type === 'work' ){

      if ( valid( item.github_vscode ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3><h3>GitHub source</h3><h3><i class='fa-solid fa-code' title='GitHub code'></i></h3>"\n    ( show \'link \'( "${ item.sourcecode.replace( 'github.com', 'github1s.com' ) }" ) ) )\n` ) };

			slides.push( commons_slide );

			slides.push( video_slide );

			slides.push( linkgraph_slide );

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			slides.push( openalex_search_slide );
			slides.push( scholia_slide );

    }
		else if ( type === 'organization' ){

			if ( valid( item.subsidiary_organization_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>subsidiaries</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P355/${item.qid}" ) ) )\n` ); }
			if ( valid( item.parent_organization_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>parent</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P749/${item.qid}" ) ) )\n` ); }
			if ( valid( item.member_of_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>member of</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P463/${item.qid}" ) ) )\n` ); }
			if ( valid( item.part_of_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>part of</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P361/${item.qid}" ) ) )\n` ); }
			if ( valid( item.has_parts_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>has parts</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P527/${item.qid}" ) ) )\n` ); }

			if ( valid( item.lat ) ){ slides.push( nearby_map_slide  ) };
			//if ( valid( item.lat ) ){ slides.push( street_map_slide  ) };

      //if ( valid( item.is_museum ) ){

        // FIXME: URL-wrong encoding?
        //slides.push( `  ( slide "${ item.title } ${ sub_name } <h3><i class='fa-brands fa-windows' title='Museum collection'></i></h3>"\n    ( show \'link \'( "${explore.base}/app/commons-sparql/?t=museum%2520collection%2520%253A%2520${title}&l=${language}&url=https%253A%252F%252Fquery.wikidata.org%252Fsparql%253Fformat%253Djson%2526query%253DSELECT%252520DISTINCT%252520%253Fitem%252520%253FitemLabel%252520%253Fimage%252520%253Fdate%252520WHERE%252520%257B%250A%252520%252520%253Fitem%252520wdt%253AP31%252520%253Fwhat%253B%250A%252520%252520%252520%252520(wdt%253AP195%252F(wdt%253AP361*))%252520%253Fcollection.%250A%252520%252520FILTER(%253Fcollection%252520%253D%252520wd%253A${item.qid})%250A%252520%252520%253Fitem%252520wdt%253AP18%252520%253Fimage.%250A%252520%252520OPTIONAL%252520%257B%252520%253Fitem%252520wdt%253AP571%252520%253Fdate.%252520%257D%250A%252520%252520SERVICE%252520wikibase%253Alabel%252520%257B%252520bd%253AserviceParam%252520wikibase%253Alanguage%252520%2522${language}%252Cen%252Cceb%252Csv%252Cde%252Cfr%252Cnl%252Cru%252Cit%252Ces%252Cpl%252Cwar%252Cvi%252Cja%252Czh%252Carz%252Car%252Cuk%252Cpt%252Cfa%252Cca%252Csr%252Cid%252Cno%252Cko%252Cfi%252Chu%252Ccs%252Csh%252Cro%252Cnan%252Ctr%252Ceu%252Cms%252Cce%252Ceo%252Che%252Chy%252Cbg%252Cda%252Cazb%252Csk%252Ckk%252Cmin%252Chr%252Cet%252Clt%252Cbe%252Cel%252Caz%252Csl%252Cgl%252Cur%252Cnn%252Cnb%252Chi%252Cka%252Cth%252Ctt%252Cuz%252Cla%252Ccy%252Cta%252Cvo%252Cmk%252Cast%252Clv%252Cyue%252Ctg%252Cbn%252Caf%252Cmg%252Coc%252Cbs%252Csq%252Cky%252Cnds%252Cnew%252Cbe-tarask%252Cml%252Cte%252Cbr%252Ctl%252Cvec%252Cpms%252Cmr%252Csu%252Cht%252Csw%252Clb%252Cjv%252Csco%252Cpnb%252Cba%252Cga%252Cszl%252Cis%252Cmy%252Cfy%252Ccv%252Clmo%252Cwuu%252Cbn%2522.%252520%257D%250A%257D%250AORDER%252520BY%252520DESC%252520(%253Fdate)';

      //}
      //else {

			  slides.push( commons_slide );

      //}

			slides.push( video_slide );

			//if ( valid( item.has_taxon ) ){ slides.push( `  ( slide "${ item.title } <h3><i class='fa-solid fa-sitemap' title='taxon tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P171/${item.qid}" ) ) )\n` ); }

			slides.push( linkgraph_slide );

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			slides.push( openalex_search_slide );
			slides.push( scholia_slide );

		}
		else if ( type === 'person' ){

			if ( valid( item.nobility_familytree_entitree ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name }<h3>nobility family tree</h3><h3><i class='fa-solid fa-crown' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/all/${item.qid}" ) ) )\n` ); }
			if ( valid( item.nobility_family_entitree ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>nobility family</h3><h3><i class='fa-solid fa-crown' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P53/${item.qid}" ) ) )\n` ); }
			if ( valid( item.familytree_entitree ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>family</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/all/${item.qid}" ) ) )\n` ); }

			if ( valid( item.relatives_entitree ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>relatives</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P1038/${item.qid}" ) ) )\n` ); }
			if ( valid( item.member_of_entitree ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>member of</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P463/${item.qid}" ) ) )\n` ); }
			if ( valid( item.part_of_entitree ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>part of</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P361/${item.qid}" ) ) )\n` ); }
			if ( valid( item.influenced_by_entitree ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>influence</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P737/${item.qid}" ) ) )\n` ); }
			if ( valid( item.author_entitree ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>part of</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P50/${item.qid}" ) ) )\n` ); }

      if ( valid( item.is_painter ) && validAny( [ item.ulan_artist, item.rkd_artist, item.rijksmuseum_authority_id ] ) ){

        slides.push( `  ( slide "${ item.title } ${ sub_name } <h3><i class='fa-solid fa-paintbrush' title='painter works'></i></h3>"\n    ( show \'link \'( "${explore.base}/app/commons-sparql/?t=works%20%3A%20${title}&l=${language}&url=https%3A%2F%2Fquery.wikidata.org%2Fsparql%3Fformat%3Djson%26query%3DSELECT%2520DISTINCT%2520%3Fitem%2520%3FitemLabel%2520%3Fimage%2520%3Fdate%2520WHERE%2520{%2520%2520{%2520%3Fitem%2520wdt%3AP31%2520wd%3AQ3305213.%2520}%2520%2520UNION%2520%2520{%2520%3Fitem%2520wdt%3AP31%2520wd%3AQ93184.%2520}%2520%2520UNION%2520%2520{%2520%3Fitem%2520wdt%3AP31%2520wd%3AQ11060274.%2520}%2520%2520UNION%2520%2520{%2520%3Fitem%2520wdt%3AP31%2520wd%3AQ15123870.%2520}%2520%2520%3Fitem%2520wdt%3AP170%2520wd%3A${item.qid}.%2520%2520%3Fitem%2520wdt%3AP18%2520%3Fimage.%2520%2520OPTIONAL%2520{%2520%3Fitem%2520wdt%3AP571%2520%3Fdate.%2520}%2520%2520SERVICE%2520wikibase%3Alabel%2520{%2520bd%3AserviceParam%2520wikibase%3Alanguage%2520%2522en%2Cen%2Cceb%2Csv%2Cde%2Cfr%2Cnl%2Cru%2Cit%2Ces%2Cpl%2Cwar%2Cvi%2Cja%2Czh%2Carz%2Car%2Cuk%2Cpt%2Cfa%2Cca%2Csr%2Cid%2Cno%2Cko%2Cfi%2Chu%2Ccs%2Csh%2Cro%2Cnan%2Ctr%2Ceu%2Cms%2Cce%2Ceo%2Che%2Chy%2Cbg%2Cda%2Cazb%2Csk%2Ckk%2Cmin%2Chr%2Cet%2Clt%2Cbe%2Cel%2Caz%2Csl%2Cgl%2Cur%2Cnn%2Cnb%2Chi%2Cka%2Cth%2Ctt%2Cuz%2Cla%2Ccy%2Cta%2Cvo%2Cmk%2Cast%2Clv%2Cyue%2Ctg%2Cbn%2Caf%2Cmg%2Coc%2Cbs%2Csq%2Cky%2Cnds%2Cnew%2Cbe-tarask%2Cml%2Cte%2Cbr%2Ctl%2Cvec%2Cpms%2Cmr%2Csu%2Cht%2Csw%2Clb%2Cjv%2Csco%2Cpnb%2Cba%2Cga%2Cszl%2Cis%2Cmy%2Cfy%2Ccv%2Clmo%2Cwuu%2Cbn%2522.%2520}}ORDER%2520BY%2520DESC(%3Fdate)%0D%0A" ) ) )\n` );

        //slides.push( commons_sparql_slide );

        //slides.push( rijksmuseum_search_slide );

        //explore.datasources = sources; // reset datasources again to the original set

      }
      else { // default

			  slides.push( commons_slide );

      }

			slides.push( video_slide );

			slides.push( linkgraph_slide );

			// TODO: requires language-article check: if ( valid( item.place_of_birth ) ){ slides.push( `  ( slide "${ item.title } <h3>place of birth</h3><h3><i class='fa-solid fa-map-pin' title='place of birth'></i></h3>"\n    ( show \'link \'( "" ) ) )\n` ); }
			if ( valid( item.wikiquote ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>quotes</h3><h3><i class='fa-solid fa-quote-right' title='quotes'></i></h3>"\n    ( show \'link \'( "${item.wikiquote}" ) ) )\n` ); }
			if ( valid( item.wikisource ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>WikiSource</h3><h3><i class='fa-solid fa-scroll' title='WikiSource'></i></h3>"\n    ( show \'link \'( "${item.wikisource}" ) ) )\n` ); }

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			slides.push( openalex_search_slide );
			slides.push( scholia_slide );

		}
		else if ( type === 'group' ){

			if ( valid( item.nobility_familytree_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>nobility family tree</h3><h3><i class='fa-solid fa-crown' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/all/${item.qid}" ) ) )\n` ); }
			if ( valid( item.nobility_family_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>nobility family</h3><h3><i class='fa-solid fa-crown' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P53/${item.qid}" ) ) )\n` ); }
			if ( valid( item.familytree_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>family</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/all/${item.qid}" ) ) )\n` ); }

			if ( valid( item.relatives_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>relatives</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P1038/${item.qid}" ) ) )\n` ); }
			if ( valid( item.member_of_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>member of</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P463/${item.qid}" ) ) )\n` ); }
			if ( valid( item.part_of_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>part of</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P361/${item.qid}" ) ) )\n` ); }
			if ( valid( item.influenced_by_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>part of</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P737/${item.qid}" ) ) )\n` ); }
			if ( valid( item.author_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>part of</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P50/${item.qid}" ) ) )\n` ); }

			slides.push( commons_slide );

			slides.push( video_slide );

			slides.push( linkgraph_slide );

			if ( valid( item.wikiquote ) ){ slides.push( `  ( slide "${ item.title } <h3>quotes</h3><h3><i class='fa-solid fa-quote-right' title='quotes'></i></h3>"\n    ( show \'link \'( "${item.wikiquote}" ) ) )\n` ); }
			if ( valid( item.wikisource ) ){ slides.push( `  ( slide "${ item.title } <h3>WikiSource</h3><h3><i class='fa-solid fa-scroll' title='WikiSource'></i></h3>"\n    ( show \'link \'( "${item.wikisource}" ) ) )\n` ); }

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			slides.push( openalex_search_slide );
			slides.push( scholia_slide );

		}
		else if ( type === 'time' ){

			// TODO: put this timespace-link code somewhere central
			// not bullet-proof, but we need some 'relevance'-filters before showing the timespace-button (as most events don't have the required data to show a timeline)
			if (  valid( item.category ) || ( valid( item.followed_by ) || valid( item.part_of ) || valid( item.has_parts ) || valid( item.list_of ) ) ){

				let used_qid = item.qid;

				if ( !valid( item.category ) && valid( item.part_of ) ){ // this is a fallible escape-hatch for using an alternative qid

					//console.log( item.part_of )

					if ( Array.isArray( item.part_of ) ){

						used_qid = item.part_of[0];

					}
					else {

						used_qid = item.part_of;

					}

				}

				let limited_types = [
					'3186692', '577', '578', '39911', '36507', // year, decade, century, milennium, 

					// FIXME: how to better handle these:
					'27020041', '82414', '159821', // sports events
				];

				let limited_query = '&limited=false';

				if ( limited_types.includes( item.instance_qid ) ) { 

					limited_query = '&limited=true';
				}

				let url = explore.base + '/app/timespace/?q=' + used_qid + '&l=' + explore.language + '&highlight=' + item.qid + limited_query;

				slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>${ dating }</h3> <h3>event cluster</h3> <h3><i class='fa-solid fa-hourglass-end' title='time-space view'></i></h3>"\n    ( show \'link-split \'( "${url}" ) ) )\n` );

			}

			if ( valid( item.significant_event_entitree ) ){ slides.push( `  ( slide "${ item.title } ${ sub_name } <h3>significant events</h3><h3><i class='fa-solid fa-sitemap' title='significant event tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P793/${item.qid}" ) ) )\n` ); }

		  if ( language === 'en' && valid( item.wikipedia_timeline ) ){ slides.push( timeline_slide ); }

			slides.push( commons_time_music_slide );
			//slides.push( europeana_time_music_slide );
			slides.push( bing_images_slide );
			slides.push( video_slide );

			slides.push( linkgraph_slide );

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			slides.push( openalex_search_slide );
			slides.push( scholia_slide );

		}

    // common end slides
    slides.push( ai_chat_slide );
    slides.push( similar_slide );

		/*
		external_links.forEach( (l) => {

			const extlink = l['*'];

			slides.push( `  ( slide "${ item.title } <h4><a target='_blank' href='${ extlink }'>${extlink.replace('http://', '').replace('https://', '') }</a></h4><h4>(click on the above link, if it fails to open here)</h4><h3><i class='fa-solid fa-link' title='links'></i></h3>"\n    ( show \'link \'( "${ extlink }" ) ) )\n` );

		});
		*/

		// END of slide content

		//console.log( slides );

		// add each slide-code to code
		$.each( slides, function ( i, slide ) {

			code += slide;

		});

		// finalize presentation code
		code += ')\n';

		// add code to editor
		//explore.editor.setValue( beautify( code ) );
		explore.editor.setValue( code );

		//console.log('code: ', code );
		//explore.commands = code;

		runLISP( code );

    // setup presentation TTS element
    const tts_start = document.getElementById( 'presentation-tts-start' );

    tts_start.onclick = function(){

      const section = $('#presentation-tts-sections').val();

      if ( valid( section ) ){ // speak section

        startSpeakingArticle( item.title, item.qid, explore.language, section );

      }
      else { // speak article

        startSpeakingArticle( item.title, item.qid, explore.language );

      }

    }

    insertPresentationSections( item.title, item.qid, explore.language );

	//}).catch(error => { console.log('error fetching presentation data'); });

}

async function insertPresentationSections( title, qid, language ){

  $('#presentation-tts-sections').empty();

  const url = `https://${ language }.wikipedia.org/w/api.php?action=parse&page=${ encodeURIComponent( title ) }&prop=sections&format=json`;

  $.ajax({

    url:      url,
    jsonp:    "callback",
    dataType: "jsonp",

    success: function( response ) {

      if ( valid( response.parse?.sections ) ){

        let options_html = '<option value="" selected>Wikipedia</option>';

        $.each( response.parse?.sections, function ( i, section ) {

          const anchor = tocTransform( section.anchor );

          const indent = '⠀'.repeat( section.toclevel );

          options_html += `<option value="${ anchor }">${ indent + section.anchor.replaceAll('_', ' ') }</option>`;

        });

        $('#presentation-tts-sections').append( options_html );

      }

    },

  });

  $('#presentation-tts-sections').on('change', function() {

    stopSpeaking();
    //stopSpeakingArticle();
    startSpeakingArticle( title, qid, language, this.value )

  });

  //  TODO: allow for raw-text sections (beyond Wikipedia)

}

async function runEditorCode( code ){

	// run commands
	runLISP( code );

	// go to tools-tab
	explore.tabsInstance.select('tab-tools');

	// open editor detail
	$('#editor-detail').attr( 'open', '' );

	// focus on editor
	explore.editor.focus(); 

}

function getTitlefromImageURL( url ){

	const url_dec = decodeURIComponent( url );

	let name  = url_dec.split('FilePath/')[1] || '';

	if ( name === '' ){ // no name yet

		//console.log( url_dec );

		name  = url_dec.substring( url_dec.lastIndexOf("/") + 1, url_dec.length) || '';

	}

	name = name.replace(/_/g, ' ' );
	name = name.substr(0, name.lastIndexOf('.') ); // remove last file-extension

	return name;

}


let lp;

async function setupLispEnv(){

  // see also: https://www.wikidata.org/wiki/Wikidata:REST_API_feedback_round

  // to allow nested lisp code, to be implemented in JS, we use a "lips.Macro"
  // IN:  scheme code in string form
  // OUT: Lips-structured data
  lips.env.set('query', new lips.Macro('query', function( code, { dynamic_scope, error }) {

    const args = { env: this, error };
    if (dynamic_scope) { args.dynamic_scope = this; }

    //console.log( 'code.car: ', code.car );

    // Take the relevant fields using "code.car" and such calls.
    // In this case we create a new Lips-list from the list-argument supplied
    let wrap = new lips.Pair(new lips.LSymbol('list'), code.car);
  
    // - take the wrapped-code and evaluate it
    // - then return as a Lips-array
    return this.get('list->array')( lips.evaluate(wrap, args));

  }));

  /*
  lips.env.set('vector2', new lips.Macro('vector2', function( code, { dynamic_scope, error }) {

    const args = { env: this, error };
    if (dynamic_scope) { args.dynamic_scope = this; }

    // Take the relevant fields using "code.car" and such calls.
    // In this case we create a new Lips-list from the list-argument supplied
    let wrap = new lips.Pair(new lips.LSymbol('list'), code.car);

    console.log( 'code: ', code );
    console.log( 'wrap: ', wrap );
    console.log( 'lisp eval: ', lips.evaluate(wrap, args)  );
    console.log( 'return: ', this.get('list->array')( lips.evaluate(wrap, args)) );

    // - take the wrapped-code and evaluate it
    // - then return as a Lips-array
    return this.get('list->array')( lips.evaluate(wrap, args));

  }));
  */
  lips.env.set('presentation', new lips.Macro('presentation', function( code, { dynamic_scope, error }) {

    let meta = {};

    meta.toc = true; // show table-of-contents

    explore.presentation_building_mode = true;

    const args = { env: this, error };
    if (dynamic_scope) { args.dynamic_scope = this; }

    //console.log('presentation slides: ', code.length(), code );

    //console.log( 'code.car: ', code.car );

    let i = 0;

    // build slide commands list
    code.map( ( slide, index ) => {

      //console.log( slide, index);

      // dont add "set" elements
      if ( slide.car?.__name__ === 'set' ){

        // parse set-data
        let wrap  = new lips.Pair(new lips.LSymbol('list'), slide );
        let set   = this.get('list->array')( lips.evaluate(wrap, args));

        //console.log( set );
        //lp = set[1];

        let key = set[1].car.cdr.toString().replace(/\(|\)/g, '') || '';
        let val = set[1].cdr.toString().replace( /^\(/, '' ).replace( /\)$/, '') || '';
        //let val = set[1].cdr.toString().replace(/\(|\)/g, '') || '';

        if (
          key === 'background' ||
          key === 'color' ||
          key === 'autoslide'
        ){

          meta[ key ] = val;

        }

        //console.log( 'meta: ', meta );

      }
      else {
      
        // Take the relevant fields using "code.car" and such calls.
        // In this case we create a new Lips-list from the list-argument supplied
        let wrap = new lips.Pair(new lips.LSymbol('list'), slide );

        explore.presentation_building_slide = i;

        // create an empty slide-command-container
        explore.presentation_commands[ explore.presentation_building_slide ]  = [];

        i += 1;

        // - take the wrapped-code and evaluate it
        // - then return as a Lips-array
        return this.get('list->array')( lips.evaluate(wrap, args));

      }

    });

    let text_background_styling = '';
    
    if ( valid( explore.presentation_text_background_css ) ){

      text_background_styling = `<style>.slides section { ${ explore.presentation_text_background_css } }</style>`;

    }

    // create HTML-start
    let html = `<!DOCTYPE html>
      <head>
        <base target="_blank">
        <link rel="stylesheet" href="../app/explore2/node_modules/reveal.js/dist/reveal.css?v4.3.1">
        <link rel="stylesheet" href="../app/explore2/node_modules/reveal.js/dist/theme/black.css?v4.3.1">
        <link rel="stylesheet" href="/assets/fonts/fontawesome/css/all.min.css?v6.01" type="text/css">
        <!--link rel="stylesheet" href="../app/explore2/dist/css/conzept/common.css?v${explore.version}" type="text/css"-->
        <link rel="stylesheet" href="../app/explore2/css/conzept/revealjs_custom.css?v${explore.version}" type="text/css">
        <script type="text/javascript" src="../app/explore2/node_modules/reveal.js/dist/reveal.js?v4.3.1"></script>
        <script src="../app/explore2/node_modules/jquery/dist/jquery.min.js"></script>
        <script src="../app/explore2/dist/core/utils.js"></script>
        ${ text_background_styling }
      </head>
      <body>
        <div class="reveal">
          <div class="slides">
      `;

    let s = 0;

    // add each slide-section HTML
    code.map( ( slide ) => {

      // dont add "set" elements
      if ( slide.car?.__name__ === 'set' ){

        //console.log( 'skip this element');
        
      }
      else {

        //console.log( 'slide title?: ', slide.cdr.car.toString() );

        let title = slide.cdr.car.toString();

        let elements = '';

        // find commands which can be rendered by slide-html (eg. direct audio / video links)
        $.each( explore.presentation_commands[ s ], function ( i, c ) {

          const command = c[0];
          const view		= c[1];
          let   data		= c[2];

          //console.log( 'command: ', command, view, data );

          if ( view === 'audio' ){

            //console.log( 'insert html-audio: ', c[2] );

            elements += '<audio controls src="' + data + '"></audio>';

          }
          else if ( command === 'fragment' ){

            //console.log( command, view, data );

            let autoslide = '';

            if ( valid( meta.autoslide ) ){

              autoslide = ` data-autoslide="${ meta.autoslide }"`;

            }

            // replace markdown-links formatted as "(Q12345)" with: "(//explore/&t=string&i=Q12345)"
            data = data.replace( /\(\s*(Q\d+)\s*\)/g, `(https://${explore.host}${explore.base}/explore/?&t=wikipedia-qid&i=$1)` );

            elements += `<p class="fragment" ${autoslide} data-trigger="${ view }">${ data }</p>`;
            // FIXME: markdown rendering caused all fragments of a slide to show at once
            //elements += `<p class="fragment" ${autoslide} data-trigger="${ view }">${ marked.parse( data ) }</p>`;

          }

        });


        // apply slide meta-data
        //console.log('meta now: ', meta );

        let options = {};

        if ( valid( meta.color ) ){

          options.color = ` color:${ meta.color } !important `;

        }
        else {
          options.color = '';
        }

        if ( valid( meta.background ) ){

          //console.log('using bg, before: ', meta.background );
          //meta.background = decodeURIComponent( meta.background );
          //console.log('using bg, after: ', meta.background );

          let ext = meta.background.split('.');

          if ( ext.length > 1 ){
            ext = ext.pop();
          }
          else {
            ext = '';
          }

          //console.log( meta.background, ext );

          // see: https://revealjs.com/backgrounds/
          if ( ext === 'mp4' ){ // video background

            options.background = `data-background-video="${ meta.background }" data-background-video-loop data-background-video-muted`;

          }
          else if (
            meta.background.startsWith('rgb') ||
            meta.background.startsWith('hsl') ||
            meta.background.startsWith('#')
          ){ // color value

            options.background = `data-background-color="${ meta.background }"`;

          }
          else if ( meta.background.includes( 'gradient' ) ){ // gradient definition

            options.background = `data-background-gradient="${ meta.background }"`;

          }
          else { // image background

            //console.log('final image: ', meta.background );
            options.background = `data-background-image="${ decodeURIComponent( meta.background  ) }"`;

          }

        }

        html += `<section style="${options.color}" ${ options.background }><h1> ${ title } </h1> ${ elements } </section>`;

        s += 1;

      }

    });

    //console.log( html );

    // add HTML-end
    html += `
  <script type="text/javascript">

		let slide_nr = 0;

    let reveal_options = {
      transition: "fade",
      autoPlayMedia: false,
      loop: false,
      progress: true,
      slideNumber: false,
      scrollActivationWidth: null,
    };

    //let reveal_plugins = [];

    if ( valid( ${ meta.autoslide } ) ){

      reveal_options[ 'autoSlide' ] = ${ meta.autoslide };

      //$('p.fragment').addClass('visible'); // show all fragments at once

    }

    /*
    if ( valid( ${ meta.toc } ) ){

      console.log('show ToC'):

      reveal_plugins.push( 'toc'  );

    }
    */

    Reveal.initialize(

      reveal_options,

      //plugins : reveal_plugins,
      
    );

    const parentref = parent; Reveal.on( "slidechanged", event => { parentref.postMessage({ event_id: "run-slide-commands", data: { slide : event.indexh } }, "*" ); });

    Reveal.on( "ready", event => {

      parentref.postMessage({ event_id: "run-slide-commands", data: { slide : 0 } }, "*" );

      //Reveal.nextFragment(); // auto-show the first fragment

    });

    Reveal.on( "fragmentshown", event => {

      //console.log( $( event.fragment ).data("trigger") );
			//console.log( Reveal.getState() );

      let trigger = $( event.fragment ).data("trigger").split(":") || [];

      let trigger_command = trigger[0];

      let goto_args = trigger;
      goto_args.shift();
      goto_args.join(':');

      //console.log( trigger, trigger_command, goto_args );

      if ( trigger_command === 'goto' ){ // trigger command in 'infoframe'

        parent.postMessage({ event_id: 'goto', data: { value: goto_args } }, '*' );

      }

    });

		Reveal.addEventListener( 'slidechanged', function( event ) {

			// only when we go back a slide AND there is a fragment, we replay that last fragment
			if ( ( event.indexh + 1 ) === slide_nr ){ // going back a slide

				let state = Reveal.getState();

				if ( state.indexf > 0 ){ // we are on a fragment (from a slide-change)

					// we are at the end of all fragments, so replay the one before this fragment-position
					let sel		= '.fragment[data-fragment-index="' + ( state.indexf - 1 ) + '"]';

					let trigger = $( sel ).data("trigger").split(":") || [];

          let trigger_command = trigger[0];

          let goto_args = trigger.slice();
          goto_args.shift();
          goto_args.join(':');

          //console.log( trigger, trigger_command, goto_args );

					if ( trigger_command === 'goto' ){ // trigger command in 'infoframe'

						// TODO: we should wait until the iframe has completely loaded, but how?
						parent.postMessage({ event_id: 'goto', data: { value: goto_args } }, '*' );

					}

				}

			}
      else { // going forward a slide

        //Reveal.nextFragment(); // auto-show the first fragment

        //if ( valid( ${ meta.autoslide } ) ){

          //$('p.fragment').addClass('visible'); // show all fragments at once

        //}

      }

			slide_nr = event.indexh; // sync slide number

		} );

		Reveal.on( 'fragmenthidden', event => { // going back a fragment (without a slide-change!)

			// replay the fragment before this one

			let state = Reveal.getState();

			if ( state.indexf >= 0 ){

				let sel		= '.fragment[data-fragment-index="' + ( state.indexf ) + '"]';
				//console.log( sel );

				let trigger = $( sel ).data("trigger").split(":") || [];
        //console.log('TRIGGER: ', trigger );

        const trigger_command = trigger[0];

        let goto_args = trigger.slice();
        goto_args.shift();
        goto_args.join(':');

        //console.log( trigger, trigger_command, goto_args );

				if ( trigger[0] === 'goto' ){ // trigger command in 'infoframe'

					parent.postMessage({ event_id: 'goto', data: { value: goto_args } }, '*' );

				}

			}

		} );

  </script>
</body> </html>`;

    //console.log( html );

    // show presentation
		// insert HTML into iframe-srcdoc
    $('iframe#presentation').attr( 'srcdoc', html );

  	// go to tools-tab
   	explore.tabsInstance.select('tab-tools');

    //console.log('open presentation detail');

    // open presentation detail
   	$('#presentation-detail').attr( 'open', '' );
   	$('#editor-detail').removeAttr( 'open', '' );

    explore.presentation_building_mode  = false;
    explore.presentation_building_slide = undefined;
    explore.presentation_text_background_css = ''; // reset

    $('#blink').hide();

  }));

	lips.env.set('slide', function(...args) {

    explore.keyboard_ctrl_pressed = false;

    console.log('slide ...');

  });


	lips.env.set('show', function(...args) {

    explore.keyboard_ctrl_pressed = false;

    let view      = args.shift().toString();
    let list      = [];

    //console.log( args[0] );
    
    if ( !valid( args[0].car ) ) { // SPARQL-query (has multiple objects, where "car" is located 1-level deeper than for a simple array)

			if ( explore.presentation_building_mode ){ // store command

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'sparqlQueryCommand', view, list, args ] );

			}
			else { // direct command execution

        sparqlQueryCommand( args, view, list );

        if ( view === 'sidebar' ){ // Wikidata-results in the sidebar

          explore.tabsInstance.select('tab-topics');

          return 0;

        }

      }

    }
    else if ( view === 'link' || view === 'link-split' ){ // simple command (no need to fetch any Qid-data with SPARQL)

      list = args.shift().to_array() || [];

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list ] );

			}
			else {

				handleClick({ 
					id        : 'n1-0',
					type      : view,
					title     : '',
					qid       : '',
					language  : explore.language,
					url       : list[0],
					tag       : '',
					languages : '',
					custom    : '',
					target_pane : 'p1',
				});

			}

      return 0;

    }
    else if ( view === 'url' ){ // simple command (no need to fetch any Qid-data with SPARQL)

      list = args.shift().to_array() || [];

			if ( explore.presentation_building_mode ){

        console.log( 'url: ', list, args );

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list ] );

			}
			else {

        //console.log( 'url: ', list[0], list );

        // note: This does not work on first URL-visit, only after an user-interaction (such as a click).
        openInNewTab( decodeURI( list[0] ) );
			}

      return 0;

    }
    else if ( view === 'pdf' ){ // simple command (no need to fetch any Qid-data with SPARQL)

      list = args.shift().to_array() || [];

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list ] );

			}
			else {

				handleClick({ 
					id        : 'n1-0',
					type      : 'link',
					title     : '',
					qid       : '',
					language  : explore.language,
					url       : `https://${explore.host}${explore.base}/app/pdf/?file=https://${explore.host}${explore.base}/app/cors/raw/?url=${ list[0]  }#page=0&zoom=page-width&phrase=true&pagemode=thumbs`,
					tag       : '',
					languages : '',
					custom    : '',
					target_pane : 'p1',
				});

			}

      return 0;

    }
    else if ( view === 'iiif' ){ // simple command (no need to fetch any Qid-data with SPARQL)

      list = args.shift().to_array() || [];

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list ] );

			}
			else {

				handleClick({ 
					id        : 'n1-0',
					type      : 'link',
					title     : '',
					qid       : '',
					language  : explore.language,
					url       : `${explore.base}/app/iiif/index.html#?cv=&c=&m=&s=&manifest=${ encodeURIComponent( list[0] ) }`,
					tag       : '',
					languages : '',
					custom    : '',
					target_pane : 'p1',
				});

			}

      return 0;

    }
    else if ( view === 'audio-query' ){ // fetch audio-file-URLs from Archive.org or Europeana

      // inception, end time, publication, ...

      list = args.shift().to_array() || [];

      //console.log( list );

      list[0] = list[0].replace(/;$/, ''); 
      let data = list[0].split(';');

      let obj = {};

      for ( let el of data ) {

        let key_val = el.split(':');

        if ( valid( key_val[0] && valid( key_val[1] ) ) ){

          obj[key_val[0].trim()] = key_val[1].trim();

        }

      }

      let song = '';

      if ( obj.source === 'conzept' ){

        let year;

        if ( valid( obj.start ) ){ // time-period audio-query

          // list of supported years
          const supported_years = Object.keys( music_by_year ).map( function(item) { return parseInt(item, 10); } );

          // list of requested years
          let requested_years = [];

          for (let y = obj.start; y <= obj.end; y++ ){
            requested_years.push( parseInt( y ) )
          }

          // get the year matches of these two sets
          const matching_years = requested_years.filter( y => supported_years.includes( y ) );

          //console.log( supported_years, requested_years, matching_years, matching_years.length );


          if ( matching_years.length === 0 ){ // no matches found, pick a random instead

            //console.log('no year matches found' );
            return 0;

            //year = supported_years[ Math.floor( Math.random() * supported_years.length ) ];


          }
          else {

            year = matching_years[ Math.floor( Math.random() * matching_years.length ) ];

          }

          // pick a random song from that year
          song = music_by_year[ year ][ Math.floor(Math.random() * music_by_year[ year ].length ) ];

        }
        else if ( valid( obj.country ) ){ // country audio-query

          let music_by_country = {}

          // create a structure for music by country
	        $.each( Object.values( music_by_year ), function( i, yearObj ){
            
            $.each( yearObj, function( j, songObj ){

              if ( valid( music_by_country[ songObj.country ] ) ){  // structure already exists
                // do nothing
              }
              else { // create structure

                music_by_country[ songObj.country ] = [];

              }

              music_by_country[ songObj.country ].push( songObj );

            });

          });

          //console.log( music_by_country, obj.country );

          if ( valid( music_by_country[ obj.country ] ) ){

            // pick a random song from that year
            song = music_by_country[ obj.country ][ Math.floor(Math.random() * music_by_country[ obj.country ].length ) ];

          }

          if ( ! valid(song) ){ // no song found

            return 0;

          }

        }

      }
      else {

        return 0;

      }

      //console.log( song );

      // TODO: Could we use Archive.org or Europeana for finding songs by year-range?
      //
      // create Europeana query:
      //  see: https://pro.europeana.eu/page/search
      //
      //  can we find music in a date-range?
      //  https://www.europeana.eu/api/v2/search.json?wskey=4ZViVZKMe&rows=10&query=music%201933%20mp3&media=true&qf=TYPE%3A%22SOUND%22
      //
      //  http://sparql.europeana.eu/?default-graph-uri=&query=PREFIX+dc%3A+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%3E%0D%0APREFIX+edm%3A+%3Chttp%3A%2F%2Fwww.europeana.eu%2Fschemas%2Fedm%2F%3E%0D%0APREFIX+ore%3A+%3Chttp%3A%2F%2Fwww.openarchives.org%2Fore%2Fterms%2F%3E%0D%0ASELECT+%3Ftitle+%3Fcreator+%3FmediaURL+%3Fdate%0D%0AWHERE+%7B%0D%0A++%3FCHO+edm%3Atype+%22SOUND%22+%3B%0D%0A++++++ore%3AproxyIn+%3Fproxy%3B%0D%0A++++++dc%3Atitle+%3Ftitle+%3B%0D%0A++++++dc%3Acreator+%3Fcreator+%3B%0D%0A++++++dc%3Adate+%3Fdate+.%0D%0A++%3Fproxy+edm%3AisShownBy+%3FmediaURL+.%0D%0A%7D%0D%0ALIMIT+100&should-sponge=&format=text%2Fhtml&timeout=0&debug=on

      // Archive.org query:
      //
      // random 0-10 number (the URL requires a query-string)
      // start time
      // end time
      //
      // https://archive.org/advancedsearch.php?q=1&query=mediatype%3A(audio)%20AND%20date%3A[1920-01-01%20TO%201950-01-01]&output=json&rows=10&
      //
      // -> identifier: mp3.mp3_716
      // -> get identifier file(s): https://archive.org/metadata/mp3.mp3_716
      //   ...
      //   Mp3.mp3
      //   ...
      // -> file URL: https://archive.org/download/IDENTIFIER/FILE 
      //              https://archive.org/download/mp3.mp3_716/Mp3.mp3
      //
      //              https://archive.org/metadata/1-1-5
      //              https://archive.org/download/1-1-5/Ba3th-1-15.ogg

      // get query results

      // use query results
			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', 'audio', [ song.url ] ] );

			}
			else {

				explore.autoplay = false;
				$('.plSel').removeClass('plSel'); // remove fixed-playlist highlight

				// insert audio-URL
				document.getElementById('audio1').src = song.url;

				// play audio
				document.getElementById('audio1').play();

			}

      return 0;

    }
    else if ( view === 'audio' ){

      list = args.shift().to_array() || [];

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list ] );

			}
			else {

				explore.autoplay = false;
				$('.plSel').removeClass('plSel'); // remove fixed-playlist highlight

				// insert audio-URL
				document.getElementById('audio1').src = list[0];

				// play audio
				document.getElementById('audio1').play();

			}

      return 0;

    }
    else if ( view === 'image-set' ){ // simple command (no need to fetch any Qid-data with SPARQL)

      list = args.shift().to_array() || [];
      console.log( list );

      let url = '';

			if ( list.length === 1 ){ // single image

				let img = list[0];

				// create IIIF-link
				let coll = { "images": [ ]};

				let label		= encodeURIComponent( getTitlefromImageURL( img ) );
				let desc    = encodeURIComponent( 'image description' );
				let author  = encodeURIComponent( 'author' );
				let source  = encodeURIComponent( 'source' );

				// for each image add:
				coll.images.push( [ img, label, desc, author, source ] );

				if ( coll.images.length > 0 ){ // we found some images

					// create an IIIF image-collection file
					let iiif_manifest_link = explore.base + '/app/response/iiif-manifest.php?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

					let iiif_viewer_url = explore.base + '/app/iiif/index.html#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

					url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

				}

			}
			else if ( list.length > 1 ) { // multiple images

				let coll = { "images": [ ]};

				$.each( list, function ( index, img ) {

					let ctitle = encodeURIComponent( getTitlefromImageURL( img ) );

					// license data retrieval: https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&titles=File%3aBrad_Pitt_at_Incirlik2.jpg&format=json

					coll.images.push( [ img, ctitle, ctitle, 'attribution: ...', '...' ] );

				});

			 // create an IIIF image-collection file
				let iiif_manifest_link = '/app/response/iiif-manifest.php?l=en&t=' + encodeURIComponent( '...' ) + '&json=' + JSON.stringify( coll );

				let iiif_viewer_url = '/app/iiif/index.html#?c=&m=&s=&cv=0&manifest=' + encodeURIComponent( iiif_manifest_link );

				url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

			}
			else {

				console.log('warning: no image-URLs given');

				return 0;

			}
  
			if ( explore.presentation_building_mode ){

				// note: we force a link view
				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', 'link', [ url ] ] );

			}
			else {

        // open IIIF-url

				handleClick({ 
					id        : 'n1-0',
					type      : 'link',
					title     : '',
					qid       : '',
					language  : explore.language,
					url       : url,
					tag       : '',
					languages : '',
					custom    : '',
					target_pane : 'p1',
				});

			}

      return 0;

    }
    else if ( view === 'audio-waveform' ){

      list = args.shift().to_array() || [];

      let url = `${explore.base}/app/audio/?url=${ encodeURIComponent( "/app/cors/raw/?url=" + list[0] ) }`

      console.log('audio-waveform: ', view, list, url );

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list, url ] );

			}
			else {

				handleClick({ 
					id        : 'n1-0',
					type      : 'link',
					title     : '',
					qid       : '',
					language  : explore.language,
          url       : url,
					tag       : '',
					languages : '',
					custom    : '',
					target_pane : 'p1',
				});

			}

      return 0;

    }
    else if ( view === 'gapminder-linechart' ){

      list = args.shift().to_array() || [];

      let iso3_codes  = [];

      // get country iso3 code
		  $.each( list, function ( index, qid ) {

        if ( valid( countries[qid] ) ){

          iso3_codes.push( '=' + countries[qid].iso3 + '&' );

        }

      });

      let codes = iso3_codes.join('').slice(0, -1).toLowerCase();

      if ( valid( codes ) ){

        let url = `https://www.gapminder.org/tools/#$model$markers$line$data$filter$dimensions$geo$/$or@$country$/$in@${ codes };;;;;;;;&encoding$selected$data$filter$markers@${ codes };;;;&y$data$concept=pop&space@=geo&=time;;&scale$type:null&domain:null&zoomed:null;;;;;;&chart-type=linechart&url=v`;

        if ( explore.presentation_building_mode ){

          explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list, url ] );

        }
        else {

          handleClick({ 
            id        : 'n1-0',
            type      : 'link',
            title     : '',
            qid       : '',
            language  : explore.language,
            url       : url,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

        }

      }

      return 0;

    }
    else if ( view === 'youtube' ){

      list = args.shift().to_array() || [];

      // target URL: /app/video/?l=${explore.language}&wide=true#/view/zqNTltOGh5c/20/40

      let url   = '';
      let vid   = getParameterByName( 'v', list[0] ) || '';
      let start = getParameterByName( 't', list[0] ) || '0';
      let end   = '';

      if ( vid === '' ){ // assume a short url: https://youtu.be/zqNTltOGh5c?t=104

        vid = list[0].split('/').pop();
        vid = vid.split('?')[0]; // remove any params left over in the string

      }

      if ( start === '0' ){ // also check for start/end times
        start = getParameterByName( 'start', list[0] ) || '0';
        end   = getParameterByName( 'end', list[0] ) || '';
      }

      // remove any "s" second-string on timestamps
      start = start.replace('s', '');
      end   = end.replace('s', '');

      if ( valid( end ) ){

        url = `${explore.base}/app/video/?l=${explore.language}&wide=true#/view/${ vid }/${ start }/${ end }`;

      }
      else {

        url = `${explore.base}/app/video/?l=${explore.language}&wide=true#/view/${ vid }/${ start }`;

      }

      console.log('youtube: ', vid, start, end, url );

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list, url ] );

			}
			else {

        //url       : `${explore.base}/app/wander/?videoId=${ list[0] }?&mute=false`,

				handleClick({ 
					id        : 'n1-0',
					type      : 'link',
					title     : '',
					qid       : '',
					language  : explore.language,
          url       : url,
					tag       : '',
					languages : '',
					custom    : '',
					target_pane : 'p1',
				});

			}

      return 0;

    }

    else {

      list = args.shift().to_array() || [];

			renderShowCommand( view, list );

    }

    /*
		args.forEach( (arg) => {

		  const qid = arg.toString();

      if ( isQid( qid ) ){ list.push( qid ); }

		});
    */
    
	});

	lips.env.set('search', function(...args) {

    explore.keyboard_ctrl_pressed = false;

    let view      = args.shift().toString();
    let list      = args.shift().to_array() || [];

    //console.log('view: ', view );
    //console.log('list: ', list );

    if ( view === 'explore' ){ // search Wikipedia by string or Qid

      let promiseB = fetchLabel( list, explore.language ).then(function(result) {

        let labels = [];

        if ( valid( result.entities ) ){

          Object.keys( result.entities ).forEach(( k, index ) => {

            if ( result.entities[ k ]?.labels[ explore.language ] ){

              labels.push( result.entities[ k ].labels[ explore.language ].value );

            }

          });

        }

        labels = labels.join(' ');

        handleClick({ 
          id        : 'n1-0',
          type      : 'explore',
          title     : labels,
          language  : explore.language,
          qid       : '',
          url       : '',
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p0',
        });

      });

    }
    else if ( view === 'web' ){

      let promiseB = fetchLabel( list, explore.language ).then(function(result) {

        let labels = [];

        if ( valid( result.entities ) ){

          Object.keys( result.entities ).forEach(( k, index ) => {

            if ( result.entities[ k ]?.labels[ explore.language ] ){

              labels.push( result.entities[ k ].labels[ explore.language ].value );

            }

          });

        }

        labels = labels.join(' ');

        handleClick({ 
          id        : 'n1-0',
          type      : 'link',
          title     : '',
          language  : explore.language,
          qid       : '',
          url       : `https://www.bing.com/search?q=${labels}&search=Submit+Query&form=QBLH&setlang=${explore.language}`,
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p1',
        });

      });

    }
    if ( view === 'image' ){

      let promiseB = fetchLabel( list, language ).then(function(result) {

        let labels = [];

        if ( valid( result.entities ) ){

          Object.keys( result.entities ).forEach(( k, index ) => {

            if ( result.entities[ k ]?.labels[ explore.language ] ){

              labels.push( result.entities[ k ].labels[ explore.language ].value );

            }

          });

        }

        labels = labels.join(' ');

        handleClick({ 
          id        : 'n1-0',
          type      : 'link',
          title     : '',
          language  : explore.language,
          qid       : '',
          url       : `https://www.bing.com/images/search?&q=${labels}&qft=+filterui:photo-photo&FORM=IRFLTR&setlang=${explore.language}-${explore.language}`,
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p1',
        });

      });

    }
    else if ( view === 'video' ){

      let promiseB = fetchLabel( list, explore.language ).then(function(result) {

        let labels = [];

        if ( valid( result.entities ) ){

          Object.keys( result.entities ).forEach(( k, index ) => {

            if ( result.entities[ k ]?.labels[ explore.language ] ){

              labels.push( result.entities[ k ].labels[ explore.language ].value );

            }

          });

        }

        labels = labels.join(' ');

        handleClick({ 
          id        : 'n1-0',
          type      : 'link',
          title     : '',
          language  : explore.language,
          qid       : '',
          url       : `${explore.base}/app/video/?l=${explore.language}#/search/${labels}`,
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p1',
        });

      });

    }

  });

	lips.env.set('fragment', function(...args) {

    //console.log( 'args: ', args );

    let text		= args.shift().toString();
		let trigger	= '';

		if ( args.length > 0 ){ // action-trigger defined

    	trigger		= args.shift().toString();

			//console.log( 'fragment trigger: ', trigger );

		}

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'fragment', trigger, text ] );

    }
    else {

      // do nothing (not supported outside of presentations?)

    }

  });

	lips.env.set('say', function(...args) {

    let text = args.shift().toString();

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'say', '', text ] );

    }
    else {

      if ( isQid( text ) ){

        startSpeakingArticle( '',  text, explore.language );

      }
      else {

        startSpeaking( text );

      }

    }

	});

	lips.env.set( 'set', function(...args) {

    explore.keyboard_ctrl_pressed = false;

    console.log('set commands: ', args );

    let prop  = args.shift().toString();
    let value = args.shift().toString();

    console.log('set: ', prop, ' to: ', value );

    if ( prop === 'language' ){

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'set', prop, value ] );

			}
			else {

        setLanguage( value );

      }


    }
    else if ( prop === 'darkmode' ){

      if ( value === 'system' ){ // TODO: not yet implemented in the settings
        //... set darkmode to "system setting"
        console.log('system-darkmode not yet supported.');
      }
      else {

        explore.darkmode = valid( value );
        setDarkmode();

      }

    }

    return 0;

	});

}

async function renderShowCommand( view, list ){

	if ( view === 'image' || view === 'images' ){
		view = 'ImageGrid'; 
	}

	//console.log('view: ', view );
	//console.log('list: ', list );

	if ( view === 'topic' ){

    if ( explore.presentation_building_mode ){

      if ( Array.isArray( list ) ){ // the provided second value should be a language

        if ( explore.wp_languages.hasOwnProperty( list[1] ) ){ // valid language-code

          explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list[0], list[1] ] );

        }

      }
      else {

        explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list ] );

      }

      //return 0;

    }
    else {

      // check the optional provided language

      if ( valid( list[1] ) ){

        let l =  list[1].toString();

        console.log( 'set language to: ', l );
        setLanguage ( l );

      }

      handleClick({ 
        id        : 'n1-0',
        type      : 'wikipedia-qid',
        title     : '',
        qid       : list[0].toString(),
        language  : explore.language,
        //url       : explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + list[0].toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.has,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

    }

	}
	else if ( view === 'compare' ){

    list.forEach( ( q ) => {

      addToCompare( q.toString() );

    });

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, [], [] ] );

    }
    else {

      showCompare();

    }

	}
	else if ( view === 'chemical' ){

		const qid_list = []

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, qid_list, list[0] ] );

    }
    else {

      handleClick({ 
        id        : 'n1-0',
        type      : 'link',
        title     : '',
        language  : explore.language,
        qid       : '',
        url       : `${explore.base}/app/molview/?cid=${list[0].toString()}`,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

    }


	}
	else if ( view === 'ontology' ){

		const qid_list = list.map( n => n.replace('', '') ).join('%252C').toString();

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, qid_list, list[0] ] );

    }
    else {

      handleClick({ 
        id        : 'n1-0',
        type      : 'link-split',
        title     : '',
        language  : explore.language,
        qid       : '',
        url       : `${explore.base}/app/ontology/?lang=${explore.language}&q=${list[0].toString()}&rp=P279`,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

      $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + list[0].toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

    }

	}
	else if ( view === 'linkgraph' ){

		const qid_list = list.map( n => n.replace('', '') ).join('%252C').toString();

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, qid_list, list[0] ] );

    }
    else {

      handleClick({ 
        id        : 'n1-0',
        type      : 'link-split',
        title     : '',
        language  : explore.language,
        qid       : '',
        url       : `${explore.base}/app/links/?l=${explore.language}&t=&q=${qid_list}&title=linkgraph`,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

      $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + list[0].toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

    }

	}
	else if ( view === 'map3d' ){

    const qid_list = list.map( n => n.replace('', '') ).join(',').toString();

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, qid_list, list[0] ] );

    }
    else {

      //console.log( qid_list );

      handleClick({ 
        id        : 'n1-0',
        type      : 'link',
        title     : '',
        language  : explore.language,
        qid       : '',
        url       : `${explore.base}/app/map/?l=${explore.language}&qid=${qid_list}`,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

      $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + list[0].toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

     }

	}
	else if ( view === 'map3d-instance-of' ){

    list.forEach(( qid ) => {

      addToMapCompare( `https%3A%2F%2Fquery.wikidata.org%2Fsparql%3Fformat%3Djson%26query%3DSELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Fgeoshape%20%3Flat%20%3Flon%20WHERE%20%7B%0A%20%20%20%3Fitem%20p%3AP31%20%3Fstatement0.%0A%20%20%3Fstatement0%20(ps%3AP31)%20wd%3A${ qid }.%20%20%20%0A%20%20%3Fitem%20p%3AP625%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20psv%3AP625%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3AgeoLatitude%20%3Flat%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3AgeoLongitude%20%3Flon%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3AgeoGlobe%20%3Fglobe%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%5D%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20ps%3AP625%20%3Fcoord%0A%20%20%20%20%20%20%20%20%20%5D%20%20%0A%20%20%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP3896%20%3Fgeoshape.%20%7D%0A%0A%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${ explore.language }%2Cen%2Cceb%2Csv%2Cde%2Cfr%2Cnl%2Cru%2Cit%2Ces%2Cpl%2Cwar%2Cvi%2Cja%2Czh%2Carz%2Car%2Cuk%2Cpt%2Cfa%2Cca%2Csr%2Cid%2Cno%2Cko%2Cfi%2Chu%2Ccs%2Csh%2Cro%2Cnan%2Ctr%2Ceu%2Cms%2Cce%2Ceo%2Che%2Chy%2Cbg%2Cda%2Cazb%2Csk%2Ckk%2Cmin%2Chr%2Cet%2Clt%2Cbe%2Cel%2Caz%2Csl%2Cgl%2Cur%2Cnn%2Cnb%2Chi%2Cka%2Cth%2Ctt%2Cuz%2Cla%2Ccy%2Cta%2Cvo%2Cmk%2Cast%2Clv%2Cyue%2Ctg%2Cbn%2Caf%2Cmg%2Coc%2Cbs%2Csq%2Cky%2Cnds%2Cnew%2Cbe-tarask%2Cml%2Cte%2Cbr%2Ctl%2Cvec%2Cpms%2Cmr%2Csu%2Cht%2Csw%2Clb%2Cjv%2Csco%2Cpnb%2Cba%2Cga%2Cszl%2Cis%2Cmy%2Cfy%2Ccv%2Clmo%2Cwuu%2Cbn%22.%20%7D%0A%7D%0ALIMIT%20500%0A%23meta%3Asimilar%20topics%20%23defaultView%3ATable &quot;)addToMapCompare( &quot; https%3A%2F%2Fquery.wikidata.org%2Fsparql%3Fformat%3Djson%26query%3DSELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Fgeoshape%20%3Flat%20%3Flon%20WHERE%20%7B%0A%20%20%20%3Fitem%20p%3AP31%20%3Fstatement0.%0A%20%20%3Fstatement0%20(ps%3AP31)%20wd%3A${ qid }.%20%20%20%0A%20%20%3Fitem%20p%3AP625%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20psv%3AP625%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3AgeoLatitude%20%3Flat%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3AgeoLongitude%20%3Flon%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3AgeoGlobe%20%3Fglobe%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%5D%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20ps%3AP625%20%3Fcoord%0A%20%20%20%20%20%20%20%20%20%5D%20%20%0A%20%20%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP3896%20%3Fgeoshape.%20%7D%0A%0A%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${ explore.language }%2Cen%2Cceb%2Csv%2Cde%2Cfr%2Cnl%2Cru%2Cit%2Ces%2Cpl%2Cwar%2Cvi%2Cja%2Czh%2Carz%2Car%2Cuk%2Cpt%2Cfa%2Cca%2Csr%2Cid%2Cno%2Cko%2Cfi%2Chu%2Ccs%2Csh%2Cro%2Cnan%2Ctr%2Ceu%2Cms%2Cce%2Ceo%2Che%2Chy%2Cbg%2Cda%2Cazb%2Csk%2Ckk%2Cmin%2Chr%2Cet%2Clt%2Cbe%2Cel%2Caz%2Csl%2Cgl%2Cur%2Cnn%2Cnb%2Chi%2Cka%2Cth%2Ctt%2Cuz%2Cla%2Ccy%2Cta%2Cvo%2Cmk%2Cast%2Clv%2Cyue%2Ctg%2Cbn%2Caf%2Cmg%2Coc%2Cbs%2Csq%2Cky%2Cnds%2Cnew%2Cbe-tarask%2Cml%2Cte%2Cbr%2Ctl%2Cvec%2Cpms%2Cmr%2Csu%2Cht%2Csw%2Clb%2Cjv%2Csco%2Cpnb%2Cba%2Cga%2Cszl%2Cis%2Cmy%2Cfy%2Ccv%2Clmo%2Cwuu%2Cbn%22.%20%7D%0A%7D%0ALIMIT%20500%0A%23meta%3Asimilar%20topics%20%23defaultView%3ATable` );

    });

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, [], [] ] );

    }
    else {

      showMapCompare();

      // TODO: allow the user to reset the data from the map-app
      //explore.map_compares = [];

    }

	}
	else { // use the sparql-query-view tool

		// TODO: check that each item in the list is a valid entity-ID

		const qid_list = list.map( n => n.replace('Q', 'wd%3AQ') ).join('%20').toString();

    const url_ = `https://${explore.host}${explore.base}/app/query/embed.html#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3Fdied%20%3Fborn%20%3Finception%20%3Fpublication%20%3Fstart%20%3Fend%20%20%3Fimg%20%3Fcoordinate%20%3Fgeoshape%20WHERE%20%7B%0A%20%20VALUES%20%3Fitem%20%7B%20${ qid_list }%20%7D%0A%20%20%3Fitem%20wdt%3AP31%20%3Fclass.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP18%20%3Fimg.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP625%20%3Fcoordinate.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP3896%20%3Fgeoshape.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP571%20%3Finception.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP577%20%3Fpublication.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP569%20%3Fborn.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP570%20%3Fdied.%20%7D%20%20%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP580%20%3Fstart.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP581%20%3Fend.%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${ explore.language }%2Cen%22.%20%7D%0A%7D%0A%0A%23defaultView%3A${ view.charAt(0).toUpperCase() + view.slice(1) }%0A%23meta%3Alist%20of%20entities`;

    console.log( url_ );

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, qid_list, list[0] ] );

    }
    else {

      handleClick({ 
        id        : 'n1-0',
        type      : 'link-split',
        title     : '',
        language  : explore.language,
        qid       : '',
        url       : `${explore.base}/app/query/embed.html#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3Fdied%20%3Fborn%20%3Finception%20%3Fpublication%20%3Fstart%20%3Fend%20%20%3Fimg%20%3Fcoordinate%20%3Fgeoshape%20WHERE%20%7B%0A%20%20VALUES%20%3Fitem%20%7B%20${ qid_list }%20%7D%0A%20%20%3Fitem%20wdt%3AP31%20%3Fclass.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP18%20%3Fimg.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP625%20%3Fcoordinate.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP3896%20%3Fgeoshape.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP571%20%3Finception.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP577%20%3Fpublication.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP569%20%3Fborn.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP570%20%3Fdied.%20%7D%20%20%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP580%20%3Fstart.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP581%20%3Fend.%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${ explore.language }%2Cen%22.%20%7D%0A%7D%0A%0A%23defaultView%3A${ view.charAt(0).toUpperCase() + view.slice(1) }%0A%23meta%3Alist%20of%20entities`,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });


      $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + list[0].toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

    }

	}

}

async function setupEditor() {

  let langTools = ace.require("ace/ext/language_tools");

	/*
	// see: https://github.com/ajaxorg/ace/issues/3905#issuecomment-472091655
	let TextHighlightRules = ace.require("ace/mode/text_highlight_rules").TextHighlightRules
	TextHighlightRules.prototype.createKeywordMapper = function(
			 map, defaultToken, ignoreCase, splitChar
	) {
	let keywords  = this.$keywords = Object.create(null);

	explore.editor.session.$mode.$highlightRules.$keywords["foo"] = "variable.language
	*/

	//explore.editor = ace.edit("editor");
	explore.editor.session.setMode("ace/mode/scheme");
	explore.editor.setTheme("ace/theme/chaos");

	//explore.editor.setKeyboardHandler("ace/keyboard/vim");

	// Ace-editor options
	explore.editor.setOptions({
		enableBasicAutocompletion: true,
		enableSnippets: true,
		enableLiveAutocompletion: false,

		//fontFamily: explore.font1,
		fontSize: parseFloat( explore.fontsize ),

		tabSize: 1,
		useSoftTabs: true,
	});

  explore.editor.setShowPrintMargin(false);

	if ( explore.editor.completer) {
		explore.editor.completer.exactMatch = true;
		explore.editor.completer.autoSelect = false;
		//explore.editor.completer.keyboardHandler.removeCommand('Tab');
	}

	// custom autocomplete definition
	let wikidataPropertyCompleter = {
		getCompletions: function(editor, session, pos, prefix, callback) {
			if (prefix.length === 0) { callback(null, []); return }

			$.getJSON(

				datasources.wikidata.instance_api + '?origin=*&action=wbsearchentities&format=json&limit=50&continue=0&language=' + explore.language + '&uselang=' + explore.language + '&search=' + prefix + '&type=property',

				function( item ) {

					callback(null, item.search.map(function( item, index ) {

						//console.log( item, index );

						return {
							value:		item.id,
              caption:	item.label,
							meta:			item.description + ' (' + item.id + ')',
              //score:    0,
						}

					}));

				}

			)
		},

	}

	// custom autocomplete definition
	let wikidataEntityCompleter = {
		getCompletions: function(editor, session, pos, prefix, callback) {
			if (prefix.length === 0) { callback(null, []); return }

			$.getJSON(

        datasources.wikidata.instance_api + '?origin=*&action=wbsearchentities&format=json&limit=50&continue=0&language=' + explore.language + '&uselang=' + explore.language + '&search=' + prefix + '&type=item',

				function( item ) {

					callback(null, item.search.map(function( item, index ) {

						//console.log( item, index );

						return {
							value:		item.id,
              caption:	item.label,
							meta:			item.description + ' (' + item.id + ')',
						}

					}));

				}

			)
		},

	}

	/*
	// custom autocomplete definition
	let rhymeCompleter = {
		getCompletions: function(editor, session, pos, prefix, callback) {
			if (prefix.length === 0) { callback(null, []); return }

			$.getJSON( "http://rhymebrain.com/talk?function=getRhymes&word=" + prefix,

				function(wordList) {
					// wordList like [{"word":"flow","freq":24,"score":300,"flags":"bc","syllables":"1"}]
					callback(null, wordList.map(function(ea) {
						return {name: ea.word, value: ea.word, score: ea.score, meta: "rhyme"}
					}));
				}

			)
		}
	}
	*/

	let conzeptCommandCompleter = {

		getCompletions: function( editor, session, pos, prefix, callback){

			let wordList = ['query', 'set', 'show', 'search'];

			callback( null, wordList.map( function( word ){

				return { caption: word, value: word, meta: "Conzept command function" };

			}));

		}

	}

	// add the custom autocomplete function
	langTools.addCompleter( wikidataEntityCompleter );
	langTools.addCompleter( wikidataPropertyCompleter );
	langTools.addCompleter( conzeptCommandCompleter );

	explore.editor.commands.addCommand({

		name: 'execute',

		bindKey: {
			win: 'Ctrl-ENTER',
			mac: 'Command-ENTER',
		},

		exec: function() {
			runLISP( explore.editor.getValue() );
		}

	});

}

async function highlightLISP(){

  // visually highlight entities
  $('span.ace_identifier:contains("Q")').css({
    'background': '#2e8d41b8',
  });

}

async function runLISP( code ) {

  "use strict";

  //highlightLISP();

  // update URL command-param state
  explore.commands = explore.editor.getValue();
  setParameter( 'commands', encodeURIComponent( explore.commands ), explore.hash );
  //setParameter( 'commands', encodeURIComponent( explore.commands.replace('<', '%253C').replace('>', '%253E') ), explore.hash );
  //setParameter( 'commands', encodeURIComponent( JSON.stringify( explore.commands ) ), explore.hash );

	//console.log( 'explore.commands now: ', explore.commands );
	//console.log( 'commands paramater now: ', getParameterByName('commands') );

	//console.log( 'in: ', code );

  if ( valid( explore.lisp ) ){

    explore.lisp( code, true ).then( function( results ) {

      console.log( 'results: ', results );

      results.forEach( function(result) {

        if ( valid( result ) ){

          console.log( 'out: ', result );
          //console.log( 'out: ', result.toString() );

        }
        else {

          console.log( 'invalid: ', result );

        }

      });

    });

  }

}
