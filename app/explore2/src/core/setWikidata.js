'use strict';

async function setTags( item, tags ){

  if ( ! Array.isArray( tags ) || tags.length === 0 ){

    return;

  }
  else { // we have some tags

    if ( valid( tags[0] ) ){
      item.tags[0] = tags[0];
    }

    if ( valid( tags[1] ) ){
      item.tags[1] = tags[1];
    }

  }

}

function checkTag( item, level, name ){

  if ( Number.isInteger( level ) ){

    if ( item.tags[ level ] === name ){

      return true;

    }

  }

  return false

}

function addItemCountries( item, prop, former ){

  if ( former ){ // check for former-countries instead

    // add each country to the item.countries array
    prop.forEach(( country_qid ) => { // for each country-qid

      if ( valid( former_countries[ country_qid ] ) ){ // get former-country metadata

        const country_name  = former_countries[ country_qid ].name || '';

        // check if main country was set yet
        if ( ! valid( item.country_qid ) ) { // no main country set yet

          item.country_qid  = country_qid;
          item.country_name = country_name;

        }

        const args = {
          id        : '000',
          type      : 'wikipedia-qid',
          title     : '',
          language  : explore.language,
          qid       : country_qid,
          url       : '',
          c1        : '',
          languages : '',
          ids       : '',
          custom    : '',
        };

        item.countries.push({

          qid   : country_qid,
          name  : country_name,
          iso2  : '',
					flag 	: '<a href="javascript:void(0)" title=""' + setOnClick( Object.assign({}, args, { } ) ) + '><img title="' + country_name + '" class="flag-icon" src="' + explore.base + '/app/explore2/assets/svg/flags-former/' + country_qid + '.svg"></img></a>',

        });

      }

    });

  }
  else {

    // add each country to the item.countries array
    prop.forEach(( country_qid ) => { // for each country-qid

      // look for existing countries
      if ( valid( countries[ country_qid ] ) ){ // get country metadata

        const country_iso2  = countries[ country_qid ].iso2.toLowerCase();
        const country_name  = countries[ country_qid ].name || '';

        // check if main country was set yet
        if ( ! valid( item.country_qid ) ) { // no main country set yet

          item.country_qid  = country_qid;
          item.country_name = country_name;
          item.country_iso2 = country_iso2;

        }

        /*
        if ( !valid( item.country_name ) ){
          console.log( 'missing country name: ', item.country_qid, item.country_name );
          console.log( countries[ country_qid ] );
        }
        */

        const args = {
          id        : '000',
          type      : 'wikipedia-qid',
          title     : '',
          language  : explore.language,
          qid       : country_qid,
          url       : '',
          c1        : '',
          languages : '',
          ids       : '',
          custom    : '',
        };

        item.countries.push({

          qid   : country_qid,
          name  : country_name,
          iso2  : country_iso2,
          flag  : '<a href="javascript:void(0)" title=""' + setOnClick( Object.assign({}, args, { } ) ) + '><span title="' + country_name + '" class="flag-icon flag-icon-' + country_iso2 + '"></span></a>',

        });

      }

    });

  }

}

// detect the relevant wikidata-data and put this info into each item
function setWikidata( item, wd, single, target_pane, callback ){

  // initialize fields that have a "default_value"
  conzept_field_names.forEach(( val, index ) => {

    let name = val[0];
    let v   = val[1];

    if ( valid( v.default_value ) ){ // set default value

      item[ name ] = v.default_value;

    }

  });

  item.qid_ = item.qid.replace(/^Q/g, '');

  // memoization of often needed conditions
  item.is_instance_of = false;
  item.is_subclass_of = false;
  item.has_only_subclass = false;
  item.instances      = []; // will be filled by P31
  item.subclasses     = []; // will be filled by P279
  item.tags           = [ '', '' ];
  item.quizzes        = []; // will be filled by fields setting quizzes

  item.country_qid    = '';

  item.flag           = ''; // FIXME: should be moved to fields?

  item.countries   		= [];

  item.args           = {}; // used for setting custom-arguments

  item.occupations    = []; // will be filled by P105 occupations

  if ( valid( wd.claims ) ){

    if ( valid( wd.claims.P106 ) ){

      item.occupations    = wd.claims.P106.map( s => parseInt( s.substring(1) ) ); // create a clean list of ID's

    }

    if ( valid( wd.claims.P31 ) ){

      if ( valid( wd.claims.P31[0] ) ){

        item.is_instance_of = true;

        item.instances_   = wd.claims.P31;
        item.instances    = wd.claims.P31.map( s => parseInt( s.substring(1) ) ); // create a clean list of ID's

        item.instance_qid = item.instances[0];

      }

    } 

    if ( valid( wd.claims.P279 ) ){

      if ( valid( wd.claims.P279[0] ) ){

        item.is_subclass_of = true;
 
        if ( item.instances.length < 1 ){

          item.has_only_subclass = true;

        }

        item.subclasses_  = wd.claims.P279;
        item.subclasses   = wd.claims.P279.map( s => parseInt( s.substring(1) ) ); // create a clean list of ID's

        item.subclass_qid = item.subclasses[0];

      }

    } 

    // set item description
    if ( !valid( wd.descriptions ) ){

      item.description = '';

    }
    else { // we found some descriptions

      if ( valid( wd.descriptions[ explore.language ] ) ){ // we have a language-matching description

        if ( wd.descriptions[ explore.language] === 'undefined' ){

          item.description = '';

        }
        else {

          item.description = wd.descriptions[ explore.language ] || '';

        }

      }

    }

    item.languages = '';

    // set item wikimedia-sitelinks & languages
    if ( valid( wd.sitelinks ) ){

      item.languages = encodeURIComponent( JSON.stringify( wd.sitelinks ) );

      // Wiki-project links
      const wq = explore.language + 'wikiquote';
      const wb = explore.language + 'wikibooks';
      const wn = explore.language + 'wikinews';
      const ws = explore.language + 'wikisource';
      const wu = explore.language + 'wikiversity';
      const wv = explore.language + 'wikivoyage';
      const wc = 'commonswiki';
      const sw = 'specieswiki';

      if ( valid( wd.sitelinks[ wu ] ) ){
        item.wikiversity = 'https://' + explore.language + '.m.wikiversity.org/wiki/' + wd.sitelinks[wu];
      }

      if ( valid( wd.sitelinks[ wq ] ) ){
        item.wikiquote = 'https://' + explore.language + '.m.wikiquote.org/wiki/' + wd.sitelinks[wq];
      }

      if ( valid( wd.sitelinks[ wb ] ) ){
        item.wikibooks = 'https://' + explore.language + '.m.wikibooks.org/wiki/' + wd.sitelinks[wb];
      }

      if ( valid( wd.sitelinks[ wn ] ) ){
        item.wikinews = 'https://' + explore.language + '.m.wikinews.org/wiki/' + wd.sitelinks[wn];
      }

      if ( valid( wd.sitelinks[ wc ] ) ){
        item.wikicommons = 'https://commons.m.wikimedia.org/wiki/' + wd.sitelinks[wc] + '?uselang=' + explore.language;
      }

      if ( valid( wd.sitelinks[ ws ] ) ){
        item.wikisource = 'https://' + explore.language + '.m.wikisource.org/wiki/' + wd.sitelinks[ws];
      }

      if ( valid( wd.sitelinks[ wv ] ) ){
        item.wikivoyage = 'https://' + explore.language + '.m.wikivoyage.org/wiki/' + wd.sitelinks[wv];
      }

      if ( valid( wd.sitelinks[ sw ] ) ){

        item.wikispecies = 'https://species.m.wikimedia.org/wiki/' + wd.sitelinks[sw] + '?uselang=' + explore.language;

      }

    }

  }

  // set item-tags and run item-triggers
  indicator_field_names.forEach(( val, index ) => {

    let name = val[0];
    let v   = val[1];

    // first-round of setting the tags by matching "instance IDs" to indicators
    if ( item.instances.length > 0 ){

      if ( item.instances.some( function( nr ) { return indicators[ name ].value.includes( nr )  } ) ) {

        if ( item.tags[0] === '' ){ // still no main-tag set so far...

          if ( valid( v.trigger ) ){ // trigger-code found

            eval( v.trigger ); // run "trigger" code

          }

          if ( valid( v.tags ) ){ // tags-code found

            eval( v.tags ); // run "tags" code

          }

        }
        else { // done setting the main-tag(s)

          return 0;

        }

      }

    }

    // optional second-round of setting the tags by matching "sublclass IDs" to indicators
    if ( item.tags[0] === '' ){ // still no main-tag set so far...

      if ( item.subclasses.length > 0 ){

        if ( item.tags[0] === '' ){ // still no main-tag set so far...

          if ( item.subclasses.some( function( nr ) { return indicators[ name ].value.includes( nr )  } ) ) {

            if ( valid( v.trigger ) ){ // trigger-code found

              eval( v.trigger ); // run "trigger" code

            }

            if ( valid( v.tags ) ){ // tags-code found

              eval( v.tags ); // run "tags" code

            }

          }

        }
        else { // done setting the main-tags

          return 0;

        }

      }

    }

  });

	// create-phase: set field-values for the fields with a wikidata-property
  conzept_field_names.forEach(( val, index ) => {

    let name = val[0];
    let v   = val[1];

    // set triggers to default value (false)
    v.create_trigger_enabled = false;
    v.render_trigger_enabled = false;

		// check if this fields has a wikidata-property value
    if ( ( typeof v.prop === undefined || typeof v.prop === 'undefined' || v.prop === '' ) && !(v.type === 'wikipedia-qid-sparql') && !(v.type === 'rest-json')  ){ // no property found
      // do nothing
    }
    else { // wikidata property found

      //console.log('not skipping: ', name, v.type, v.value );

		  //console.log( name, v, item[name] );
			let pid = 'P' + v.prop;

			// check that the wikidata-property is declared
			if ( ( typeof wd.claims === undefined || typeof wd.claims === 'undefined' || typeof wd.claims[pid] === undefined || typeof wd.claims[pid] === "undefined" ) && !(v.type === 'wikipedia-qid-sparql') && !(v.type === 'rest-json') ){
				// do nothing
			}
			else { // wikidata property found

				// check if there is a value-condition
				if ( ! valid( v.value_condition ) ){ // no value-condition found

          // ------------------------------------------
          // check if we have a "value" field
          if ( ! valid( v.value ) ){ // no value-string defined

            if ( v.mv ){ // multi-value

              if ( v.type === 'wikipedia-qid-sparql' || v.type === 'rest-json' ){

                let _url      = eval(`\`${ v.url }\``);
                item[ name ]  = _url; // expand value variables of the URL

              }
              else if ( v.type === 'link' || v.type === 'url' ){ // URL multi-value

                let urls_obj  = {};
                let strings   = wd.claims[pid];

                strings.sort( (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }) )
                  .forEach( ( string_val, string_index ) => { // for each URL string 

                    let X       = string_val;
                    let mv_url  = eval(`\`${ v.url }\``);

                    urls_obj[ string_val ] = mv_url;

                });

                item[ name ] = urls_obj;

              }
              else {

                item[ name ] = wd.claims[pid];

              }

            }
            else { // single-value

              item[ name ] = wd.claims[pid][0]; // only get the first value

            }

            v.create_trigger_enabled = true;

          }
          else { // found a value-string

            // set wikidata value
            let myvalue   = eval(`\`${ v.value }\``); // expand value variables into code
            item[ name ]  = eval(`\`${ myvalue }\`` );// get the executed-string value

            v.create_trigger_enabled = true;

          }
          // ------------------------------------------

				}
				else { // value-condition found

					// evaluate the custom "value_condition"
					let test = eval(`\`${ v.value_condition }\``); // expand condition variables into code

					if ( eval( test ) ){ // value-condition-is-true

				    if ( valid( v.value_trigger ) ){ // value-trigger found

              eval( v.value_trigger );

            }

            // ------------------------------------------
            // TODO: refactor this duplicate code (note: fix eval() variable--context-issue)
            //
						// also check if we have a "value" field
						if ( ! valid( v.value ) ){ // no value-string defined

              if ( v.mv ){ // multi-value

                if ( v.type === 'wikipedia-qid-sparql' || v.type === 'rest-json' ){ // SPARQL-based-query for a list of qid's + labels

                  let _url      = eval(`\`${ v.url }\``);
                  item[ name ]  = _url; // expand value variables of the URL

                }
                else if ( v.type === 'link' || v.type === 'url' ){ // URL multi-value

                  let urls_obj  = {};
                  let strings   = wd.claims[pid];

                  strings.sort( (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }) )
                    .forEach( ( string_val, string_index ) => { // for each URL string 

                    let X       = string_val;
                    let mv_url  = eval(`\`${ v.url }\``);

                    urls_obj[ string_val ] = mv_url;

                  });

                  item[ name ] = urls_obj;

                }
                else {

                  item[ name ] = wd.claims[pid];

                }

              }
              else { // single-value

                item[ name ] = wd.claims[pid][0]; // only get the first value

              }

              v.create_trigger_enabled = true;

						}
						else { // found a value-string

							let myvalue   = eval(`\`${ v.value }\``); // expand value variables into code
							item[ name ]  = eval( myvalue ); // get the executed-string value

              v.create_trigger_enabled = true;

						}
            // ------------------------------------------

					}
					//else { // value-condition-is-false

            //console.log( item.title, ', value-condition is false: no value set.');    

					//}

				}

			}

    }

  });

  // condition: "instance of" P31 is defined
  if ( valid( item.instances ) ){ // we have "instance of" values

    if ( item.instances.some( function( nr ) { return indicators.person.value.includes( nr  )  } ) ) {

      //if ( item.tags[0] === '' ){ // no class set so far

        item.tags[0] = 'person';

      //}

      // country name of citizenship
      if ( valid( wd.claims.P27 ) ){

        item.country_qid = wd.claims.P27[0];

        addItemCountries( item, wd.claims.P27, false );

				if ( item.countries.length  === 0 ){ // still no countries found, check for former countries

          addItemCountries( item, wd.claims.P27, true );

				}


      }

    }

    let chain_ids = []; 

    if ( item.instances.some( function( nr ) {

      if ( indicators.chain.value.includes( nr ) ){

        chain_ids.push( nr );

        return true;
      }
      else {

        return false;

      }
      

    } ) ) {

      item.is_business  = true;
      item.subsidiaries_query = true; // activation: subsidiaries_query

      item.chain_map  = true;
      item.osm_wd_id  = chain_ids[0];

      item.osm_tag    = chains[ chain_ids[0].tag ];
      item.osm_label  = chains[ chain_ids[0].label ];

    }

    // check if geo-object (this is a geographical object TYPE - should not have a specific location or country property! eg. "windmill", "arch", etc.)
    if ( item.instances.some( function( nr ) { return indicators.geo_object.value.includes( nr  )  } ) ) {

      if ( valid( wd.claims.P625 ) && valid( wd.claims.P17 ) ){

        if ( item.tags[0] === '' ){ // no class set so far

          item.tags[0] = 'location';

        }

      }
      else {

        if ( item.tags[0] === '' ){ // no class set so far

          item.tags[0] = 'natural-concept';
          item.tags[1] = 'geographical-structure';

        }

      }

    }

  }

  if ( valid( wd.claims ) ){

    if ( valid( wd.claims.P17 ) ){ // country

      addItemCountries( item, wd.claims.P17, false );
      addItemCountries( item, wd.claims.P17, true );

      item.country_qid = wd.claims.P17[0];

    }

    // check if it has a country of origin
    if ( valid( wd.claims.P495 ) ){ // country of origin

     	addItemCountries( item, wd.claims.P495, false );

      item.country_qid = wd.claims.P495[0];

			if ( item.countries.length === 0 ){ // no countries found yet, check for former countries

				addItemCountries( item, wd.claims.P495, true );

			}

    }

    if ( valid( wd.claims.P463 ) ){ // members

      addItemCountries( item, wd.claims.P463, false );
      addItemCountries( item, wd.claims.P463, true );

    }

    if ( valid( wd.claims.P527 ) ){ // has parts

      addItemCountries( item, wd.claims.P527, false );
      addItemCountries( item, wd.claims.P527, true );

    }

    // detect "subclass of" concepts
    if ( valid( item.subclasses ) ){ // we have P279 (subclass of) data

      if ( valid( item.subclasses[0] ) ){

        // check if geo-object (this is a geographical object TYPE - should not have a location! eg. "windmill", "arch", etc.)
        if ( item.subclasses.some( function( nr ) { return indicators.geo_object.value.includes( nr  )  } ) ) {

          if ( valid( wd.claims.P625 ) ){

            if ( item.tags[0] === '' ){ // no class set so far

              item.tags[0] = 'natural-concept';
              item.tags[1] = 'geographical-structure';

            }

          }

        }

      }

    }

    // 3rd-round of setting the tags
    if ( item.tags[0] === '' ){ // still no base class set so far...

      if ( valid( wd.claims.P2812 ) ){ // MathWorld identifier found
        item.tags[0] = 'meta-concept';
        item.tags[1] = 'mathematics';
      }

      if ( valid( wd.claims.P829 ) ){ // "Encyclopedia of Integer Sequences" identifier found
        item.tags[0] = 'meta-concept';
        item.tags[1] = 'mathematics';
      }
   
      // detect time concepts
      if ( valid( wd.claims.P580 ) ){ // time ("start time")
        item.tags[0] = 'time';
      }

      if ( valid( wd.claims.P585 ) ){ // time ("point in time")
        item.tags[0] = 'time';
      }

      if ( valid( wd.claims.P577 ) ){ // found a publication date
        item.tags[0] = 'work';
      }

      // disease detection
      if ( valid( wd.claims.P494 ) ){ // ICD-10
        item.tags[1] = 'human-disease';
      }

      if ( valid( wd.claims.P1461 ) ){ // Patientplus disease ID

        if ( item.tags[1] === '' ){ // only assume a "disease" if no other subclass was set
          item.tags[1] = 'human-disease';
        }

      }

    }

    if ( valid( wd.claims.P8047 ) ){ // country registry (used with ships, etc.)

      addItemCountries( item, wd.claims.P8047, false );

      item.country_qid = wd.claims.P8047[0];

    }

    // location(s)
    if ( valid( wd.claims.P276 ) ){

      item.location = wd.claims.P276;

      if ( item.countries.length  === 0 ){ // if still no countries found

        addItemCountries( item, wd.claims.P276, false );

      }

    }

    // check for participant countries
    if ( valid( wd.claims.P710 ) ){

      addItemCountries( item, wd.claims.P710, false );
      addItemCountries( item, wd.claims.P710, true );

    }

    // link from work to main topic
    if ( valid( wd.claims.P921 ) ){

      item.maintopic = wd.claims.P921[0];

    }

    // flag image on item
    if ( valid( wd.claims.P41 ) && item.flag !== '' ){

      const args = {
        id        : '000',
        type      : 'wikipedia-qid',
        title     : '',
        language  : explore.language,
        qid       : item.qid,
        url       : '',
        c1        : '',
        languages : '',
        ids       : '',
        custom    : '',
      };

      let thumb = encodeURIComponent( wd.claims.P41[0] ) || '';

      if ( thumb === 'undefined' ){ thumb = ''; }

      const src_image = 'https://'+ explore.language + '.wikipedia.org/wiki/' + explore.language + ':Special:Filepath/' + thumb + '?width=50';
      //console.log( src_image );

      item.flag = ( thumb.length > 0 )? '<a href="javascript:void(0)" title=""' + setOnClick( Object.assign({}, args, { } ) ) + '><img title="' + item.title + '" class="flag-icon" src="' + src_image + '"></img></a>' : '';

    }

    // taxon rank
    if ( valid( wd.claims.P105 ) ){

      item.taxon_rank_qid = wd.claims.P105[0];
      item.taxon_rank_name = taxon_ranks[ item.taxon_rank_qid ] || '';

    }

    // subclass: language with glotto reference
    if ( valid( wd.claims.P1394 ) ){
      item.tags[1]  =  'human-language';
    }

    // subclass: language with EOL reference
    if ( valid( wd.claims.P830 ) ){
      item.tags[0]  =  'organism';
    }

    // geo-location
    if ( valid( wd.claims.P625 ) ){

      item.lat = wd.claims.P625[0][0];
      item.lon = wd.claims.P625[0][1];

      //console.log('P625: ', item.title, item.lat, item.lon );

      // create bounding-box coordinates from lat-lon coordinates
      //
      // see: https://wiki.openstreetmap.org/wiki/Bounding_Box
      //
      //      Latitude is a decimal number between -90.0 and 90.0.
      //      Longitude is a decimal number between -180.0 and 180.0.
      //
      // bbox = |  left, _ bottom, right | , - top
      // bbox = min Longitude , min Latitude , max Longitude , max Latitude 
      //
      // TODO: how to adjust the bounding-box according to the object scale?
      const delta = 0.05;
      let bb1 = item.lon - delta;
      let bb2 = item.lat - delta;
      let bb3 = item.lon + delta;
      let bb4 = item.lat + delta;

      // OSM boundary map detection
      if ( ! valid( wd.claims.P402 ) ){

        item.map  = `${explore.base}/app/map/?l=${explore.language}&bbox=${bb1},${bb2},${bb3},${bb4}&lat=${item.lat}&lon=${item.lon}&title=` + encodeURIComponent( item.title );

      }
      else {

        item.osm_id         = wd.claims.P402[0];

        // single point
        item.map  = `${explore.base}/app/map/?l=${explore.language}&bbox=${bb1},${bb2},${bb3},${bb4}&lat=${item.lat}&lon=${item.lon}&osm_id=${item.osm_id}&title=` + encodeURIComponent( item.title );

      }

    }

    if ( item.is_genre === false && valid( item.subclasses ) ){

      if ( item.subclasses.some( function( nr ) { return indicators.genre.value.includes( nr  )  } ) ) {

        item.is_genre = true;
        item.tags[0]  = 'cultural-concept';
        item.tags[1]  = 'genre';

      }

    }


    // subsidiaries detection
    if ( valid( wd.claims.P355 ) ){

      item.holds_subsidiaries = true; 
      item.subsidiaries_query = true; // activation: subsidiaries_query

    }

    // owners detection
    if ( valid( wd.claims.P749 ) ){

      item.has_owners = true; 

    }

    if ( valid( wd.claims.P699 ) ){ // Disease Ontology ID
      item.tags[0] = 'natural-concept';
      item.tags[1] = 'human-disease';
    }

    // anatomy detection

    // NOTE: this gives false-positives, like for "glucose"
    if ( valid( wd.claims.P1402 ) ){ // Foundational Model of Anatomy ID

      if ( item.tags[0] !== 'substance' ){ // filter substances, to try and prevent "anatomy" false-positives

        item.tags[1] = 'anatomy';

      }

    }

    if ( valid( wd.claims.P1323 ) ) { // Terminologia Anatomica 98 ID
      item.tags[1] = 'anatomy';
    }

    if ( valid( wd.claims.P3982 ) ){ // TA98 Latin term
      item.tags[1] = 'anatomy';
    }

    if ( valid( wd.claims.P1343 ) ){ // Gray's Anatomy (20th edition) 

      if ( wd.claims.P1343[0] === 'Q19558994' ){
        item.tags[1] = 'anatomy';
      }
    }

    // link from artist-genre-field to genre
    // TODO: handle multiple genres too?
    if ( valid( wd.claims.P136 ) ){ // genre

      item.show_genre = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20*%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP136%20wd%3A' + wd.claims.P136[0] +'%3B%0A%20%20%20%20wdt%3AP18%20%3Fpic.%0A%7D%20%23defaultView%3AImageGrid%0A';

      // TODO: add suclass: music-genre (which needs label-resolving)
      //  -> with that we can show the radio-genre for a "person with a genre"
    }

    if ( valid( wd.claims.P247 ) ){ // COSPAR ID - satellite designation
      item.tags[1]  = 'satellite';
    }

    if ( valid( wd.claims.P5299 ) ){ // AntWeb ID
      item.tags[0] = 'organism';
      item.tags[1] = 'insect';
    }


    if ( valid( wd.claims.P3444 ) ){ // eBird ID
      item.tags[0] = 'organism';
      item.tags[1] = 'bird';
    }

    if ( valid( wd.claims.P5257  ) ){ // BirdLife
      item.tags[0] = 'organism';
      item.tags[1] = 'bird';
    }

    if ( valid( wd.claims.P2426 )){ // Xeno-canto bird species song
      item.tags[0] = 'organism';
      item.tags[1] = 'bird';
    }

    if ( valid( wd.claims.P2026 ) ){ // Avibase ID
      item.tags[0] = 'organism';
      item.tags[1] = 'bird';
    }

    if ( valid( wd.claims.P2464 ) ){ // Bugguide
      item.tags[0] = 'organism';
      item.tags[1] = 'insect';
    }
   
   
    // plant
    if ( valid( wd.claims.P961 ) ){ // IPNI plant
      item.tags[0] = 'organism';
      item.tags[1] = 'plant';
    }

    if ( valid( wd.claims.P5037 ) ){ // Plants of the World online ID
      item.tags[0] = 'organism';
      item.tags[1] = 'plant';
    }

    if ( valid( wd.claims.P5945  ) ){ // VicFlora ID
      item.tags[0] = 'organism';
      item.tags[1] = 'plant';
    }

    if ( valid( wd.claims.P3105 ) ){ //   Tela Botanica ID
      item.tags[0] = 'organism';
      item.tags[1] = 'plant';
    }

    if ( valid( wd.claims.P3101 ) ){ // FloraBase ID
      item.tags[0] = 'organism';
      item.tags[1] = 'plant';
    }


    // TODO
    if ( valid( wd.claims.P569 ) ){ // date of birth
      item.start_date  = wd.claims.P569[0];
    }

    if ( valid( wd.claims.P570 ) ){ // date of death
      item.end_date  = wd.claims.P570[0];
    }

    if ( valid( wd.claims.P580 ) ){ // start time
      item.start_date  = wd.claims.P580[0];
    }

    if ( valid( wd.claims.P582 ) ){ // end time
      item.end_date  = wd.claims.P582[0];
    }

    if ( item.start_date === '' ){ // still no start date

      if ( valid( wd.claims.P571 ) ){ // inception
        item.start_date  = wd.claims.P571[0];
      }

    }

    if ( item.start_date === '' ){ // still no start date

      if ( valid( wd.claims.P575 ) ){ // time of discovery or invention
        item.start_date  = wd.claims.P575[0];
      }

    }

    if ( valid( wd.claims.P5282 ) ){ // virtual tour URLs

      if (  wd.claims.P5282[0].includes('matterport') ||
            wd.claims.P5282[0].includes('360stories') ||
            wd.claims.P5282[0].includes('zygote') ||
            wd.claims.P5282[0].includes('museobilbao') ||
            wd.claims.P5282[0].includes('openanatomy') ){ // these sites can be embedded

        item.virtual_tour_embed = wd.claims.P5282[0];

      }
      else {

        item.virtual_tour_nonembed =  wd.claims.P5282[0];

      }
    }

    if ( valid( wd.claims.P963 ) ){ // streaming media URLs

      if ( valid( wd.claims.P963[0] ) ){

        if (  wd.claims.P963[0].includes('youtube') ||
              wd.claims.P963[0].includes('presstv')
            ){ // can be embedded

          item.stream_media_embed = explore.base + '/app/video/#/view/' + wd.claims.P963[0].split('?v=').pop();

        }
        else if ( wd.claims.P963[0].includes('balticlivecam')
            ){ // can be embedded

          item.stream_media_embed = wd.claims.P963[0];

        }
        else {

          item.stream_media_nonembed =  wd.claims.P963[0];

        }

      }

    }

    // category-main-topic-string
    // FIXME also check if the corresponsing language-wiki-article exists, NOT just this field
    if ( valid( wd.claims.P301 ) ){

      if ( item.maintopic === '' ){ // ONLY fill this field if it was not filled before by a more important maintopic

        item.maintopic  = encodeURIComponent( wd.claims.P301[0] );

      }
    }

  }

  // 4rd-round of setting the tags
  if ( item.tags[0] === '' ){ // still no base class set so far...

    if ( valid( item.lat ) ){ // we can assume this is likely location

      item.tags[0] = 'location';

    }

  }

  // do post-creation-setup condition checks 
  conzept_field_names.forEach(( val, index ) => {

    let name = val[0];
    let v   = val[1];

    if ( valid( v.prop ) ){ // wikidata property found

      // we might need to run a "create_trigger" here (even for wikidata fields!)
      if ( valid( v.create_trigger ) ){ // create trigger found

        if ( v.create_trigger_enabled ){

          let trigger = eval(`\`${ v.create_trigger }\``); // expand trigger-code variables into code

          eval( trigger ); // run trigger code

        }

      }

      if ( valid( v.default_value ) ){ // a default value was already set earlier

        return true;

      }

    }

    // for the derived-fields (which are the fields without a default_value),
    // check if we need to activate this field using the "create_condition"
    if ( ! valid( v.create_condition ) ){

      return true; // no create-condition found

    }
    else { // create-condition found

      let test = eval(`\`${ v.create_condition }\``); // expand condition variables into code

      if ( eval( test ) ){ // condition-is-true

        item[ name ] = true;

        if ( valid( v.create_trigger ) ){ // create trigger found

          let trigger = eval(`\`${ v.create_trigger }\``); // expand trigger-code variables into code

          eval( trigger ); // run trigger code

        }

      }
      else { // condition-is-false

        return true;

      }

    }

  });


  // ------ post processing of fields

  item.countries = getUnique( item.countries, 'qid' );

  // ------ optionally render a single-item

  if ( single ){

    // no title has been set yet when coming from a "qid" to "wikipedia title" action
    if ( ! valid( item.title ) ){

      const wp = explore.language + 'wiki'; // get title from sitelinks (eg. "enwiki")

      if (  ! valid( wd.sitelinks ) || ! valid( wd.sitelinks[ wp ] ) || Object.keys(wd.sitelinks).length === 0 ){

        if (  target_pane === 'ps2' ||
              explore.type === 'wikipedia' ||
              explore.type === 'wikidata' ||
              explore.type === 'wikipedia-qid' ){

          if ( ! valid( item.id ) ){

            if ( valid( item.qid ) ){

              renderWikidata( target_pane );

            }

          }
          else {

            renderWikidata( target_pane );

          }

        }

        return 1;

      }
      else {

        item.title = wd.sitelinks[wp];

        renderToPane( target_pane, explore.base + '/app/wikipedia/?t=' + explore.title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + item.qid + '&dir=' + explore.language_direction );

      }

    }

    // get the new title for this single item
    if ( explore.type === 'wikipedia-qid' ){

      explore.title = item.title;

    }
    else {

      explore.title = explore.q;

    }

		if ( typeof resetIframe === 'function' ) { // call from the explore-app

			if ( explore.type === 'wikipedia-qid' && explore.title === '' ){ // no wikipedia-language article found, we'll show the wikidata page

				renderWikidata( target_pane );

			}
			else {

				if ( typeof resetIframe === 'function'  ) { // call from the explore-app

          if ( explore.isMobile ){

            // FIXME: why does this overwrite the main sidebar??
            //$('#infoframeSplit1').attr({"src": explore.base + '/app/wikipedia/?t=' + explore.title + '&l=' + explore.language + '&qid=' + item.qid });

          }
          else {

            renderToPane( target_pane, explore.base + '/app/wikipedia/?t=' + explore.title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + item.qid + '&dir=' + explore.language_direction );

          }

				}
				else { // from wikipedia-app

					window.location.href = explore.base + '/app/wikipedia/?t=' + explore.title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + item.qid + '&dir=' + explore.language_direction;

				}

			}
      
      return item;

		}
		else { // call from the wikipedia-app or show-topic-card-click

      if ( typeof callback === 'function' ) { // ...and the callback funtion exists

			  callback( item ); // return the Wikidata-item to the wikipedia-app

      }

		}

  }

}

async function renderWikidata( target_pane ){

	if ( typeof resetIframe === 'function'  ) { // call from the explore-app

    renderToPane( target_pane, explore.base + '/app/wikidata/?q=' + explore.qid + '&lang=' + explore.language  );

	}
	else { // call from the wikipedia-app

    window.location.href = explore.base + '/app/wikidata/?q=' + explore.qid + '&lang=' + explore.language;

	}

}

// taxon rank lookup table
const taxon_ranks = {
  'Q22666877' : 'superdomain',
  'Q146481'   : 'domain',
  'Q3491996'  : 'subdomain',
  'Q19858692' : 'superkingdom',
  'Q36732'    : 'kingdom',
  'Q2752679'  : 'subkingdom',
  'Q3418438'  : 'branch',
  'Q23760204' : 'superdivision',
  'Q334460'   : 'division',
  'Q3491997'  : 'subdivision',
  'Q3978005'  : 'superphylum',
  'Q38348'    : 'phylum',
  'Q1153785'  : 'subphylum',
  'Q3504061'  : 'superclass',
  'Q37517'    : 'class',
  'Q5867051'  : 'subclass',
  'Q2007442'  : 'infraclass',
  'Q5868144'  : 'superorder',
  'Q6462265'  : 'grandorder',
  'Q7506274'  : 'mirorder',
  'Q36602'    : 'order',
  'Q5867959'  : 'suborder',
  'Q2889003'  : 'infraorder',
  'Q6311258'  : 'parvorder ',
  'Q9281160'  : 'group',
  'Q2136103'  : 'superfamily',
  'Q10296147' : 'epifamily',
  'Q35409'    : 'family',
  'Q164280'   : 'subfamily',
  'Q5481039'  : 'intrafamily',
  'Q14817220' : 'supertribe',
  'Q227936'   : 'tribe',
  'Q3965313'  : 'subtribe',
  'Q34740'    : 'genus',
  'Q3238261'  : 'subgenus',
  'Q7432'     : 'species',
  'Q68947'    : 'subspecies',
}


