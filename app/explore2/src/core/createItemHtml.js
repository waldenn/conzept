'use strict';

function createItemHtml( args ){ // creates the HTML-card for each result

  // FIXME: iOS reports undefined at 5093
  if ( typeof explore.language === undefined || typeof explore.language === 'undefined' ){
    explore.language = window.language = '';
  }

  let sections_struct = JSON.parse(JSON.stringify( explore.sections )); // copy template section-structure
  let dom             = $( explore.section_dom.html() ); // copy the general section-DOM 

  // arguments
  let id            = args.id;
  let language      = args.language;
  let qid           = args.qid;
  let pid           = args.pid;
  let title         = args.title;

  //console.log( id, title, explore.sections );
  //console.log( 'createItemHtml(): ', id, explore.sections  );

  // derives from start/end years and can be used to filter output-renderings
  let filter_year_start   = 2021;
  let filter_year_end     = 2021;

  const topic_id          = 'mv-' + args.id;

  let math_formulas       = [];
  //let math_formula_html = '';
  //let math_formula_link = '';

  let topic_onclick       = '';
  let topic_label         = '';

  let feed_link           = '';
  let audio_link          = '';
  let iiif_link           = '';
  let art_link            = '';
  let paintings_link      = '';
  let semantic_scholar_papers_link = '';
  let depict_link         = '';
  let chain_map_link      = '';
  let coworking_space_map_link = '';
  let wikivoyage_link     = '';
  let filter_link         = '';
  let music_link          = '';
  let timespace_link      = '';
  let map_link            = '';
  let nearby_link         = '';
  let linkgraph_link      = '';
  let mountain_map_link   = '';
  let youtube_channel_link= '';
  let video_link          = '';
  let open_library_link   = '';
  let open_library_author_link = '';
  let occurence_map_link  = '';
  let molview_link        = '';
  let cattree_link        = '';
  let outline_link        = '';
  let taxon_group_link    = '';
  let movement_works_link = '';
  let archive_scholar_link= '';
  let archive_genealogy_link= ''; // could we make this inline?
  let entitree_link       = '';
  let codeview_link       = '';
  let glotto_link         = '';
  let xeno_canto_link     = '';
  let found_in_taxon_link = '';
  let stockprice_link     = '';
  let business_news_link  = '';
  let outlinks_link       = '';
  let archive_game_link   = '';
  let commons_video_link  = '';
  let satellite_link      = '';
  let anatomy_link        = '';
  let panorama_link       = '';
  let wikiversity_link    = '';
  let geo_structure_map_link = '';

  //console.log( args );
  //console.log( id, title );

  // custom-titles
  const title_enc           = encodeURIComponent( title );
  const title_linkgraph     = title.replace(/,/g, '%252C');

  const title_quoted        = quoteTitle( title );

  const title_plus          = removebracesTitle( title ).replace(/ /g, '+');

  const title_              = minimizeTitle( title ); // removes any "namespace-string" and parentheses
  const title_dashed        = title_.replace(/\//g, '').replace(/ /g, '-').toLowerCase();
  const title_lowercase     = title_.toLowerCase(); // for lexeme matching
  const title_no_spaces     = encodeURIComponent( title_.replace(/ /g, '') );

  const title_no_braces     = removebracesTitle( title );

  const date_yyyy_mm_dd     = new Date().toISOString().slice(0,10);

  let snippet       = args.snippet;
  let extra_classes = args.extra_classes;
  //const banner_width = explore.isMobile ? '1200px' : '800px';

  let item          = args.item || {};

  args.languages    = item.languages;

  //console.log( '---> ', item );

  let custom        = '';

  if ( valid ( args.custom ) ){
    custom = args.custom;
  }

  let subtitle     = '';

  if ( valid ( item.subtitle ) ){
    subtitle = args.subtitle;
  }

  let thumbs = [ 'panoramic_image', 'icon_image', 'seal', 'service_ribbon_image', 'grave_view', 'musical_motif', 'molecular_model', 'location_map', 'relief_map', 'distribution_map', 'detail_map', 'commemorative_plaque', 'place_name_sign', 'schematic', 'plan_view', 'interior_view', 'bathymetry_map', 'route_map', 'locator_map', 'sectional_view', 'monogram', 'coat_of_arms', 'image', 'film_poster', 'traffic_sign', 'logo', 'collage_image' ];
  let thumbnail = '';

  if ( args.thumbnail === '' ){ // no thumnail set yet

  	thumbs.forEach(( name, index ) => { // progressively (with increasing priority) try to set the thumbnail-image from any wikidata-image-field

    	if ( valid( item[ name ] ) ){

      	thumbnail = '<div class="summary-thumb"><img class="thumbnail" src="' + item[name] + '" title="' + name + '" alt="' + name + '" /></div>';

			}

		});

	}
	else { // use the standard thumb (coming from the wikipedia search API)

		thumbnail = args.thumbnail;

		//thumbnail_fullsize = item.thumbnail_fullsize;
		//console.log( 'foobar: ', thumbnail_fullsize );


	}

  let type_             = 'wikipedia';

  if ( valid( item.from_sparql ) ){

    type_ = 'wikipedia-qid';

  }

  let headline = '';

  /* ----- BUTTONS START ----- */

  let maintopic_button  = '';
  let nearby_button     = '';
  let similar_items_button  = '';
  let similar_featured_items_button = '';
  let elements_button   = '';
  let quiz_button       = '';

	let dates_button      = '';
	let timespace_button  = '';

  let visual_artwork_iif= '';

  /* ----- BUTTONS END ----- */

  let hide              = '';
  let hide_meta         = ''; // hides actions which are not usable with Category/Book/etc. query-concepts
  let hide_geo          = 'display:block;';
  let hide_medical      = 'display:none;';
  let hide_legal        = 'display:none;';
  let hide_sports       = 'display:none;';
  let hide_food         = 'display:none;';
  let hide_biology      = 'display:none;';
  let hide_chemistry    = 'display:none;';
  let hide_minerology   = 'display:none;';
  let hide_mathematics  = 'display:none;';
  let hide_astronomy    = 'display:none;';
  let hide_quizzes      = 'display:none;';

  let tag_icon          = '';
  let tags              = [ '', '' ];

  // setup some raw-query-string fields (so we can render some of the fields)
  //if ( id === 'n00' ){
    //item.title = title;
    //tags[0] = 'raw-query-string';
  //}

  let languages         = '';

  let url               = '';

  let start_date        = '';
  let end_date          = '';
  let pointintime       = '';
  let dating            = '';

  let motto_text        = '';

  let medical_section   = '';

	let loader = '<img class="mv-loader ' + id + '" alt="loading" width="36" height="36" src="' + explore.base + '/app/explore2/assets/images/loading.gif"/>';

  if ( valid ( item.languages ) ){
    languages = item.languages;
  }

  //console.log( title, item );

  //console.log( item.tags, validAny( item.tags ) );

  if ( validAny( item.tags ) ){
    tags =  item.tags; // use the setWikidata() found tags
    args.tag = tags[0];
  }

  //console.log( 'tags: ', tags );

  let o = {}; // container for HTML buttons

  // for each field
  conzept_field_names.forEach(( val, index ) => {

    let name = val[0];
    let v   = val[1];

    //console.log( '  - field name: ', name );

    //if ( name === 'newspapers_of_country_query' ){

      //console.log( item.title, name, tags );

    //}

    //if ( id === 'n00' ){
      //console.log( item, item.title, name, tags );
    //}

    //console.log( v );

		// TODO prevent these empty button creations for non-buttons
    // Always preset the button HTML to an empty string
    o[ name ] = '';

    //console.log( name, v, item[name] );

    if ( typeof item[name] === undefined || typeof item[name] === 'undefined' || item[name] === 'undefined' || item[name] === '' || item[name] === false ){ // inactive field

      //console.log( name, 'bar', item[name] );

			// set empty derived-symbol-fields (since there was no other value), so we can always use their variables
      if ( v.type === 'symbol-number' ){

				o[ name + '_nr'] = '';

			}
      else if ( v.type === 'symbol-html' ){

				//console.log( name );
				o[ name + '_string'] = '';

			}

    }
    else { // item is described and active

    	//console.log( name, item[name] );

      // check for render-condition
      if ( typeof v.render_condition === undefined || typeof v.render_condition === 'undefined' ){

        // continue, no conditionial found --> we may still render the field

      }
      else { // render-condition found

				let test = eval(`\`${ v.render_condition }\``); // expand condition variables into code

        // to debug buggy eval-strings:
				//console.log( name, test );
        //console.log( name, eval( test ) );

        //if ( name === 'geo' ){
          //console.log( name, v.url, test );
          //console.log( name, '"' + item.map + '"' );
          //console.log( name, eval(`\`${ v.url }\``) );
          //console.log( eval( "'" + test + "'" ) )
        //}

        if ( eval( test ) ){
					// continue to render this field
          // console.log( name, o[ name ] );
        }
				else { // do not render this field

          // check for a render_trigger
					if ( typeof v.render_trigger === undefined || typeof v.render_trigger === 'undefined' || v.render_trigger === false ){
						// continue
					}
					else { // render trigger found

						//if ( v.render_trigger_enabled ){

							if ( typeof v.render_trigger === undefined || typeof v.render_trigger === 'undefined' || v.render_trigger === false ){
								// continue
							}
							else { // render trigger found

								let trigger = eval(`\`${ v.render_trigger }\``); // expand trigger-code variables into code

								console.log( name, 'render_trigger code: ', trigger);
								eval( trigger ); // run trigger code

                //console.log( 'A: item args: ', item.args );
							}

						//}

					}

					// the derived-symbol-field may still be unset, so set it to empty
					if ( v.type === 'symbol-number' ){

						o[ name + '_nr'] = '';

					}
					else if ( v.type === 'symbol-html' ){

						o[ name + '_string'] = '';

					}

          return true;

          // TODO implement fallback, as we might need to do other things here, for some cases

				}

      }

			// handle some special type cases;
      if ( v.type === 'symbol-number' ){ // numberic symbol

        //console.log( item.title, item[name] );

				// TODO: check that the item-value really is a number first
				//console.log( name, 'number symbol: ', item[name] );

				if ( item[name] > 10000 || countDecimals( item[name] ) > 3 ){
					o[name + '_nr'] = '&nbsp;<small title="' + v.title + '" class="nowrap"><i class="' + v.icon + '"></i>&#8239;' + numbro( item[name] ).format({ thousandSeparated: true, totalLength: 3 }) + '</small>';
				}
				else {
					o[name + '_nr'] = '&nbsp;<small title="' + v.title + '" class="nowrap"><i class="' + v.icon + '"></i>&#8239;' + item[name] + '</small>';
				}

				//console.log( o[name + '_nr'] );

        return true;

			}
      else if ( v.type === 'symbol-html' ){ // string symbol

				// TODO: check that the item-value really is a string first
				//console.log( name, 'string symbol: ', item[name] );

				if ( typeof v.string_format === undefined || typeof v.string_format === 'undefined' || v.string_format === '' ){ // plain string
					// do nothing

					o[name + '_string'] = item[name];

				}
				else { // constructed string

          o[name + '_string'] = eval(`\`${ v.string_format }\``);
          //console.log( name, v.string_format, item[name + '_string'] );

				}

        return true;

			}
      else if ( v.type === 'bookmark' ){

        // check if this item was bookmarked (else, use the standard "v.icon" value)
        if ( findObjectByKey( explore.bookmarks, 'name', title ).length > 0 ){
          v.icon = 'bookmark-icon fas fa-bookmark bookmarked';
        }
        else {
          v.icon = 'bookmark-icon far fa-bookmark bookmark'; // FIXME: why cant we use the default value from "v.icon" and skip this else?
        }

      }

      //console.log( name, 'baz' );

      if ( v.type === 'code' && valid( v.code) ){ // custom-code action-button

				let code = eval(`\`${ v.code }\``); // expand condition variables into code

        // TODO:
        //  - test with more complicated code-scripts
        //  - automated &quot; handling
        //  - ...
        //console.log('code button: ', name, code );

        o[ name ] = '<a href="javascript:void(0)" title="' + v.title + '" aria-label="' + v.title + '" onclick="' + code + '"> <span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

      }
      else if ( v.mv ){ // MULTI-value button

        //console.log( name, 'mv' );

        // check what type of multi-value we have
        if ( Array.isArray( item[name] ) || ( v.type === 'wikipedia-qid-sparql' || v.type === 'rest-json' ) ){ // array-mv [ Q20, Q44, ...]

          if ( item[name].length < 2 ){ // check how many values we actually have

            // FIXME: explore-title not updated in URL, when these are clicked
            // issue: currently we don't fetch the label for these single-multi-values, so we can't pass the correct title upon clicking.
            // possible solution: fetch the label upon click and then pass the correct title?
            o[ name ] = '<a href="javascript:void(0)" title="' + v.title + '" aria-label="' + v.title + '"' + setOnClick( Object.assign({}, args, { type: v.type, qid: item[name][0] } ) ) + '> <span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

          }
          else {

            //console.log( name, item[name], v.url, v.type );

            let list = [];

            list = item[name]; // could be: list of qid's | URL | ...

            //console.log( item.title );
            //console.log( v, name );

            o[ name ] = '<details title="' + name + '" id="mv-' + id + '" class="multi-value"' + setOnMultiValueClick( Object.assign({}, args, { topic: item.title, list: list, target: id, title: v.title.replace(/ /g, '_') } ) ) + '><summary class="multi-value"><span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span></summary> <p class="mv-content">' + loader + '</p> </details> ';

            //o[ name ] = '<details title="' + v.title + '" id="mv-' + id + '" class="multi-value"' + setOnMultiValueClick( Object.assign({}, args, { topic: item.title, list: list, target: id, title: v.title.replace(/ /g, '_') } ) ) + '><summary class="multi-value"><span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span></summary> <p class="mv-content">' + loader + '</p> </details> ';

          }

        }
        else { // some other mv-type

          // TODO: also implement simplification, in cases where the mv only has one value.

          if ( v.type === 'link' || v.type === 'url' ){ // object-mv { name : ext-url, ... }

            let mv_html = '';
            let target  = '';
            let newtab  = false;
            let extra_class = '';

            if ( v.type === 'url' ){

              target = '  target="_blank"  ';
              //extra_class = ' title-newtab ';

            }

            if ( Object.keys(item[name]).length < 2 ){ // check how many values we actually have

              let url   = item[name][Object.keys(item[name])[0]];
              let label = Object.keys(item[name])[0];

              if ( v.type === 'url' ){

                url = encodeURI( url );

                o[ name ] = '<a href="javascript:void(0)" class="' + extra_class + '" title="' + v.title + '" aria-label="' + v.title + '" onclick="openInNewTab( &quot;' + url + '&quot;)"> <span class="icon newtab"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

              }
              else { 

                o[ name ] = '<a href="javascript:void(0)" class="' + extra_class + '" title="' + v.title + '" aria-label="' + v.title + '"' + setOnClick( Object.assign({}, args, { type: v.type, url: url, title: label } ) ) + '> <span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

              }

            }
            else {

              $.each( item[name], function( label, url ){

                // remove protocol-string (if needed)
                label = label.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');

                // add newtab-class to external-URLSs
                mv_html += '<li><a class="mv-extra-topic ' + extra_class + '" ' + target + 'href="' + url + '" title="' + label + '" aria-label="' + label + '">' + label + '</a></li>';

              });

              o[ name ]  = '<details title="' + v.title + '" aria-label="' + v.title + '" id="mv-' + id + '" class="multi-value"><summary class="multi-value"><span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span></summary> <p class="mv-content"><ul class="multi-value">' + mv_html + '</ul></p></details> ';

            }

          }

        }

      }
      else { // SINGLE-value button

        // first check the optional-values which need to be set
        if ( v.type === 'link-split' ){

          if ( typeof v.panelwidth === undefined || typeof v.panelwidth === 'undefined' || v.panelwidth === '' ){ // no panelwidth set

            args.panelwidth = 50; // default value

          }
          else { // panelwidth is set -> add it to the arguments

            args.panelwidth = v.panelwidth;

          }

        }

        if ( v.type === 'link' || v.type === 'link-split' || v.type === 'url' ){ // for any link-type

          // detect if URL needs to be constructed
          if ( typeof v.url === undefined || typeof v.url === 'undefined' || v.url === '' ){ // plain URL
            // do nothing

            item.url = item[name];

          }
          else { // constructed URL

            // hmm... a bit scary, but needed to evaluate the named-substitutions AFTER the template-format-declaration

            item.url = eval(`\`${ v.url }\``);

          }

          let newtab = false;

          if ( v.type === 'link' || v.type === 'link-split' ){ // embedded links
            item.url = encodeURI( item.url );
          }
          else { // new-tab-links
            item.url = encodeURI( item.url );
            newtab = true;
          }

          // build button html
          if ( newtab ){

            o[ name ] = '<a href="javascript:void(0)" title="' + v.title + '" aria-label="' + v.title + '" onclick="openInNewTab( &quot;' + item.url + '&quot;)"> <span class="icon newtab"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

          }
          else {

            o[ name ] = '<a href="javascript:void(0)" title="' + v.title + '" aria-label="' + v.title + '"' + setOnClick( Object.assign({}, args, { type: v.type, url: item.url } ) ) + '> <span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

          }

        }
        else { // any non-link-type

          // set any other custom args first

          let custom_args = { type: v.type };

          for (const [key_, value_] of Object.entries( item.args )) {

            custom_args[ key_ ] = value_;

          }
          
          // build button html
          o[ name ] = '<a href="javascript:void(0)" title="' + v.title + '" aria-label="' + v.title + '"' + setOnClick( Object.assign({}, args, custom_args ) ) + '> <span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

          //console.log( item.title, title, name, o[ name ] );

        }

      }

      // add field to section(s)
      if ( valid( v.section) ){ // field has defined a section

        if ( Array.isArray( v.section ) ){ // add to multiple sections

          v.section.forEach(( s, index ) => {

            if ( typeof sections_struct[ s ] === 'object' ){ // section structure exists

              // determine rank value
              let rank = '';

              if ( Array.isArray( v.section ) ){

                if ( valid( v.rank[index] ) ){ // check if that rank-index is valid

                  rank = v.rank[index];

                }
                else { // take last value of array

                  rank = v.rank[ -1 ];

                }

              }
              else { // rank is a singular-value

                rank = v.rank;

              }

              // add to sections structure
              sections_struct[ s ].push({ name: name, rank: rank, html: o[ name ], });

            }

          });

        }
        else { // add to single section

          if ( typeof sections_struct[ v.section ] === 'object' ){ // section structure exists

            // add to sections structure
            sections_struct[ v.section ].push({ name: name, rank: v.rank, html: o[ name ], });

          }

        }

      }

    }

  });

  // set the topic-link values (where possible)
  if ( item.subclass_qid !== '' ){ // TODO: verify if this subclass-preference works well in most cases

    if ( valid( item.qid ) ){
      topic_onclick = ' onclick="queryClassInstances( &quot;' + item.qid + '&quot; );" '; // TODO: add onauxclick()
      topic_label = ' (click to see instances of this class)';
    }

  }

  if ( valid( item.parent_taxon ) ){

    // TODO: check if this works for all "taxon ranks" described in setWikidata.js
    topic_onclick = ' onclick="queryParentTaxonInstances( &quot;' + item.parent_taxon + '&quot; );" '; // TODO: add onauxclick()
    topic_label = ' (click to see the group taxons)';

  }
  else if ( tags[0] === 'location' && valid( [ item.instance_qid, item.country ] ) ){

    topic_onclick = ' onclick="queryLocationTypeInstances( &quot;' + item.instance_qid + '&quot;,&quot;' + item.country + '&quot; );" '; // TODO: add onauxclick()
    topic_label = ' (click to see the same location types in this country)';

  }
  
  // ----


  if ( item.subclass_qid !== '' ){ // TODO: verify if this subclass-preference works well in most cases

    let default_view = '';

    if ( tags[0] === 'location' || tags[1] === 'geographical-structure' ){
      default_view = '%23defaultView%3AMap%0A';
    }

    //console.log( "subclass_qid: ", item.subclass_qid )

    let similar_items_url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP279%20wd%3AQ' + item.subclass_qid + '.%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirt%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0A%20%23meta%3Asimilar%20topics%20' + default_view;

    similar_items_button  = '<a href="javascript:void(0)" title="any type-similar topics" aria-label="any type-similar topics"' + setOnClick( Object.assign({}, args, { type: 'link-split', url: encodeURI( similar_items_url ) } )) + '>  <span class="icon"><i class="fas fa-rainbow" style="position:relative;"><span class="subtext">similar</span></i></span> </a>';

    let similar_featured_items_url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP279%20wd%3AQ' + item.subclass_qid + '.%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%20%20%3Fsitelink%20wikibase%3Abadge%20%3Freviewedstatus.%0A%20%20VALUES%20%3Freviewedstatus%20%7B%0A%20%20%20%20wd%3AQ17437796%20%20%23%20featured%0A%20%20%20%20wd%3AQ17437798%20%20%23%20good%0A%20%20%7D%20%20%20%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirt%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0ALIMIT%201000%0A%20%23meta%3Afeatured%20similar%20topics%20' + default_view;

    similar_featured_items_button  = '<a href="javascript:void(0)" title="featured type-similar topics" aria-label="featured type-similar topics"' + setOnClick( Object.assign({}, args, { type: 'link-split', url: encodeURI( similar_featured_items_url ) } )) + '>  <span class="icon"><i class="fas fa-rainbow" style="position:relative;"><span class="subtext">sim-best</span></i></span> </a>';

  }
  else if ( item.instance_qid !== '' ){

    let default_view = '';

    if ( tags[0] === 'location' || tags[1] === 'geographical-structure' ){
      default_view = '%23defaultView%3AMap%0A';
    }

    if ( typeof item.lat === undefined || typeof item.lat === 'undefined' ){
      // do nothing
    }
    else { // we have geocodes, so assume the map-view is possible
      default_view = '%23defaultView%3AMap%0A';
    }

    if ( item.country_qid !== '' ){ // add country condition

      //console.log( "instance_qid: ", item.instance_qid, item.country_qid );

      let similar_items_url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ' + item.instance_qid + '.%0A%20%20%3Fitem%20wdt%3AP17%20wd%3A' + item.country_qid + '.%20%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirt%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0A%20%23meta%3Asimilar%20topics%20' + default_view;

      similar_items_button  = '<a href="javascript:void(0)" title="any type-similar topics" aria-label="any type-similar topics"' + setOnClick( Object.assign({}, args, { type: 'link-split', url: encodeURI( similar_items_url ) } )) + '>  <span class="icon"><i class="fas fa-rainbow" style="position:relative;"><span class="subtext">similar</span></i></span> </a>';

      //similar_items_map_button = '<a href="javascript:void(0)" title="map of any type-similar topics" aria-label="map of any type-similar topics"' + setOnClick( Object.assign({}, args, { type: 'link-split', url: encodeURI( similar_items_url ) } )) + '>  <span class="icon"><i class="fas fa-rainbow" style="position:relative;"><span class="subtext">similar</span></i></span> </a>';


    }
    else if ( item.country_of_origin !== '' ){ // add country-of-origin condition

      //console.log( "instance_qid: ", item.instance_qid )

      let similar_items_url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ' + item.instance_qid + '.%0A%20%20%3Fitem%20wdt%3AP495%20wd%3A' + item.country_of_origin + '.%20%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirt%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0A%20%23meta%3Asimilar%20topics%20' + default_view;

      similar_items_button  = '<a href="javascript:void(0)" title="any type-similar topics" aria-label="any type-similar topics"' + setOnClick( Object.assign({}, args, { type: 'link-split', url: encodeURI( similar_items_url ) } )) + '>  <span class="icon"><i class="fas fa-rainbow" style="position:relative;"><span class="subtext">similar</span></i></span> </a>';


    }
    else {

      //console.log( item, item.instance_qid );

      let similar_items_url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ' + item.instance_qid + '.%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirt%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0A%20%23meta%3Asimilar%20topics%20' + default_view;

      similar_items_button  = '<a href="javascript:void(0)" title="any type-similar topics" aria-label="any type-similar topics"' + setOnClick( Object.assign({}, args, { type: 'link-split', url: encodeURI( similar_items_url ) } )) + '>  <span class="icon"><i class="fas fa-rainbow" style="position:relative;"><span class="subtext">similar</span></i></span> </a>';


    }


    // TODO: should we limit these to the country too (if country was set)?
    let similar_featured_items_url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ' + item.instance_qid + '.%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%20%20%3Fsitelink%20wikibase%3Abadge%20%3Freviewedstatus.%0A%20%20VALUES%20%3Freviewedstatus%20%7B%0A%20%20%20%20wd%3AQ17437796%20%20%23%20featured%0A%20%20%20%20wd%3AQ17437798%20%20%23%20good%0A%20%20%7D%20%20%20%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirt%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0ALIMIT%201000%0A%20%23meta%3Afeatured%20similar%20topics%20' + default_view;

    similar_featured_items_button  = '<a href="javascript:void(0)" title="featured type-similar topics" aria-label="featured type-similar topics"' + setOnClick( Object.assign({}, args, { type: 'link-split', url: encodeURI( similar_featured_items_url ) } )) + '>  <span class="icon"><i class="fas fa-rainbow" style="position:relative;"><span class="subtext">sim-best</span></i></span> </a>';

  }

  if ( typeof item.maintopic === undefined || typeof item.maintopic === 'undefined' || item.maintopic === '' ){
    // do nothing
  }
  else {

    /* FIXME: "item.maintopic.startsWith is not a function"
    // check type
    if ( item.maintopic.startsWith('Q') ){ // qid

      maintopic_button = '<a href="javascript:void(0)" title="main topic" aria-label="main topic"' + setOnClick( Object.assign({}, args, { type: 'wikipedia-qid', qid: item.maintopic } ) ) + '> <span class="icon"><i class="fas fa-bullseye" style="position:relative;"><span class="subtext">topic</span></i></span> </a>';

    }
    else if ( item.maintopic.startsWith('https') ){ // URL

      maintopic_button = '<a href="javascript:void(0)" title="main topic" aria-label="main topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: item.maintopic } ) ) + '> <span class="icon"><i class="fas fa-palette" style="position:relative;"><span class="subtext">topic</span></i></span> </a>';

    }
    else { // title-string

      // TODO: detect if category or non-category article
      maintopic_button = '<a href="javascript:void(0)" title="main topic" aria-label="main topic"' + setOnClick( Object.assign({}, args, { type: 'wikipedia' } ) ) + '> <span class="icon"><i class="fas fa-bullseye" style="position:relative;"><span class="subtext">topic</span></i></span> </a>';

    }
    */

  }

  // TODO: set hide_sport to true in each field-activiation
  if ( validAny( [ o.winner, o.pcs, o.sport_coach, o.head_coach, o.sports_season ] ) ){
    //console.log( o.winner, o.pcs, o.sport_coach, o.head_coach, o.sports_season );
    hide_sports  = 'display:block;';
  }

  // TODO
  if (  tags[1] === 'dish' || tags[1] === 'beverage' ){
    hide_food  = 'display:block;';
  }
  
  // legal language-dependent setup
  if ( explore.language === 'en'){
    hide_legal  = 'display:block;';
  }

  if ( explore.language === 'de'){
    hide_legal  = 'display:block;';
  }

  if ( explore.language === 'nl'){
    hide_legal  = 'display:block;';
  }

  if ( tags[0] === 'organism' ||
       tags[0] === 'substance' ||
       tags[0] === 'natural-type' ||
       tags[0] === 'natural-concept' ||
       validAny( [ item.ebird_hotspot ] ) 
    ){
    hide_biology  = 'display:block;';
  }

  if ( tags[0] === 'substance' ||
       tags[1] === 'chemistry'
    ){
    hide_chemistry  = 'display:block;';
  }

  if ( tags[0] === 'substance' || 
       tags[1] === 'mineral' // TODO: superfluous, could we improve this?
    ){
    hide_minerology  = 'display:block;';
  }

  if ( tags[1] === 'astronomy' ||
       tags[1] === 'astronomical-object'
    ){
    hide_astronomy  = 'display:block;';
  }

  if ( valid( item.ebird_hotspot ) ){
    hide_quizzes  = 'display:block;';
  }

  if ( tags[1] === 'mathematics' ||
       listed( item.occupations, [ 170790 ] ) // mathematician
    ){
    hide_mathematics  = 'display:block;';
  }

  if ( tags[1] === 'human-disease' ||
       validAny( [ item.icd, item.drugbank, item.afflicts ] ) 
      ){

    hide_medical  = 'display:block;';

  }

  // DATES
  if ( valid( item.start_date ) ){

    start_date = item.start_date;

  }
  else if ( valid( item.date_inception ) ){

    start_date = item.date_inception;

  }

  if ( valid( item.motto_text ) ){

    motto_text = '<div class="topic-description motto">“' + item.motto_text + '”</div>';

  }

  if ( valid( item.end_date) ){

    end_date = item.end_date;

  }
  else { // check any other possible end-date types

    if ( valid( item.dissolved_date ) ){

      end_date = item.dissolved_date;

    }

  }

  // TODO: could we code this n-to-1 pointintime login in de fields file?
  if ( valid( item.date_pointintime ) ){

    pointintime = item.date_pointintime;

  }

  //console.log( 'pointintime: ', pointintime );

  /*
  if ( pointintime === '' ){
    
    if ( valid( item.date_inception ) ){

      pointintime = item.date_inception;

    }

  }
  */

  if ( pointintime === '' ){

    if ( valid( item.date_release ) ){

      pointintime = item.date_release;

    }

  }


  let dash = '&#10143;';

  if ( start_date !== '' && end_date !== '' ){ // case 1) start & end date

    const start = new Date( start_date );
    const end   = new Date( end_date );

    //console.log( start.getFullYear(), end.getFullYear() );

    filter_year_start = start.getFullYear();
    filter_year_end   = end.getFullYear();

    dating = '<a href="javascript:void(0)" ' + setOnClick( Object.assign({}, args, { title: start.getFullYear().toString(), type: 'wikipedia', qid: ''  } ) ) + '>' + start.getFullYear() + '</a>' + dash +
             '<a href="javascript:void(0)" ' + setOnClick( Object.assign({}, args, { title: end.getFullYear().toString(), type: 'wikipedia', qid: '' } ) ) + '>' + end.getFullYear() + '</a>';

    if ( isNaN( start.getFullYear() ) && isNaN( end.getFullYear() ) ){ // probably a complex date string, so just use the original strings

      let s = Math.round( parseInt( item.start_date.split('-01')[0] ) / 1000000 ).toString();
      let e = Math.round( parseInt( item.end_date.split('-01')[0] ) / 1000000 ).toString();
      //let ancient_format = wNumb({ thousand: ',', }); // TODO: use numbro instead?
      //dating = '(' + ancient_format.to( s ) + '  &#8230 ' + ancient_format.to( e ) + ') ';
      dating = s + ' mil.' + dash + e + ' mil.';
      //dating = '(' + s + ' mil. &mdash; ' + e + ' mil.) ';

    }


  }
  else if ( start_date !== '' ){ // case 2) only start date

    const start = new Date( start_date );

    filter_year_start = start.getFullYear();

    // only add "..." to persons
    if ( tags[0] === 'person' ){
      dating = '<a href="javascript:void(0)" ' + setOnClick( Object.assign({}, args, { title: start.getFullYear().toString(), type: 'wikipedia', qid: '' } ) ) + '>' + start.getFullYear() + '</a>' + dash;
      //dating = start.getFullYear() + dash;
    }
    else {

      if ( ! isNaN( start.getFullYear() ) ){ // check to prevent very ancient dates to give a NaN result
        dating = '<a href="javascript:void(0)" ' + setOnClick( Object.assign({}, args, { title: start.getFullYear().toString(), type: 'wikipedia' } ) ) + '>' + start.getFullYear() + '</a>' + dash;

      }
      else { // probably a complex date string, so just use the original string

        let s = Math.round( parseInt( start_date.toString().split('-01')[0] ) / 1000000 );
        dating = s + ' mil.' + dash;
        //dating = '(' + s + ' mil. &mdash;) ';

      }

    }

  }
  else if ( end_date !== '' ){ // case 3: only end date

    const end   = new Date( end_date );
    dating = dash + '<a href="javascript:void(0)" ' + setOnClick( Object.assign({}, args, { title: end.getFullYear().toString(), type: 'wikipedia' } ) ) + '>' + end.getFullYear() + '</a>';
    //dating = dash + end.getFullYear();

  }

  //console.log( 'dating: ', dating );

  if ( dating === '' ){ // no dating set yet

    if ( pointintime !== '' ){

      //console.log( pointintime );

      const date = new Date( pointintime );

      //console.log( date );

      filter_year_start = date.getFullYear();

      if ( ! isNaN( date.getFullYear() ) ){ // check to prevent very ancient dates to give a NaN result
        dating = '<a href="javascript:void(0)" ' + setOnClick( Object.assign({}, args, { title: date.getFullYear().toString(), type: 'wikipedia' } ) ) + '>' + date.getFullYear() + '</a>';
        //dating = date.getFullYear();
      }
    }

  }

  if ( dating !== '' ){ // if any dating was set, style it.
    dating = ' <small title="dating" class="nowrap">' + dating + '</small> ';
  }

  //console.log( 'dating: ', dating, start_date, end_date);

  // add IIIF-link for visual artworks
  if ( item.is_painting || item.is_sculpture ){

    //console.log( item.title, item.is_painting, item.is_sculpture );

		let img = '';

		if ( valid( item.thumbnail_fullsize ) ){

			//console.log( 'thumbnail_fullsize: ', item.thumbnail_fullsize );
			img = item.thumbnail_fullsize;

		}
		else if ( valid( item.image_full ) ){

			//console.log( item.image_full );
			img = item.image_full;

		}

    if ( img !== '' ){
  
      let url = '';

      // create IIIF-viewer-link
      let coll = { "images": [ ]};

      let label = encodeURIComponent( item.title );

      let author	= '';
      let desc		= '';

      //if ( valid ( item.author ){
      //}

      // for each image add:
      coll.images.push( [ img, label, desc, author, 'wikiCommons' ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

      //console.log( coll );

      if ( coll.images.length > 0 ){ // we found some images

        // create an IIIF image-collection file
        // TOFIX: see "goat" depicts (7th  result"Farm scene, Wales?" needs a "?" fix in the PHP code.
        let iiif_manifest_link = explore.base + '/app/response/iiif-manifest?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

        let iiif_viewer_url = explore.base + '/app/iiif/#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

        url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

        visual_artwork_iif = '<a href="javascript:void(0)" title="artwork" aria-label="artwork"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="far fa-image" style="position:relative;"><span class="subtext">view</span></i></span></a>';

        art_link = '&nbsp;<a href="javascript:void(0)" title="artwork" aria-label="artwork"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="far fa-image" style="position:relative;"></i></span></a> ';
 
      }
 
    } 

  } 

  //  FIXME markup raw query, so it can be hidden if needed later
  if ( id === 'n00' ){

    type_         = 'wikipedia-search';
    extra_classes = 'no-wikipedia-entry';
    hide          = 'display:none;';
    item          = { dist: '' };

  }

  if ( title.startsWith( explore.lang_category + ':' ) ){ // category page
    hide_meta  = 'display:none;';
  }

  // set tag_icon
  // check if there is a matching root-class 
  if ( valid( conzept_tags[ tags[0] ] ) ){ // found a matching main-tag, now also check the sub-tags

    let tag = conzept_tags[ tags[0] ];

    //console.log( title, tags[0], tags[1] );

    if ( tags[1] !== '' ){ // a sub-tag is defined

      // check if there is a matching sub-tag object
      if ( valid( tag.sub[ tags[1] ] ) ){ // match

        tag = conzept_tags[ tags[0] ].sub[ tags[1] ];

        //console.log( '  A: ', title, tag, tags );
        tag_icon = ' <i title="' + tag.text + topic_label + '" class="tag-icon ' + tag.icon[0] + '"></i>';

        if ( valid( tag.icon[1] ) ){ // also add the second icon-symbol
          tag_icon += ' <i title="' + tag.text + topic_label + '" class="tag-icon ' + tag.icon[1] + '"></i>';
          //console.log( title, tag.icon[0], tag.icon[1], tag_icon );
        }

      }
      else { // no matching sub-tag object

        //console.log( '  B: ', title, tag, tags );
        tag_icon = ' <i title="' + tag.text + topic_label + '" class="tag-icon ' + tag.icon[0] + '"></i>';

        if ( valid( tag.icon[1] ) ){ // also add the second icon-symbol
          tag_icon += ' <i title="' + tag.text + '" class="tag-icon ' + tag.icon[1] + '"></i>';
          //console.log( title, tag.icon[0], tag.icon[1], tag_icon );
        }

      }

      //console.log( title, tag_icon );

    }
    else { // set icon from root-class

      tag_icon = ' <i title="' + tag.text + topic_label + '" class="tag-icon ' + tag.icon[0] + '"></i>';
      //console.log( '  C: ', title, tag, tags );

      //if ( valid( tag.icon[1] ) ){ // also add the second icon-symbol
      //  tag_icon += ' <i title="' + tag.text + '" class="tag-icon ' + tag.icon[1] + '"></i>';
      //  console.log( title, tag.icon[0], tag.icon[1], tag_icon );
      //}

    }

  }

  //console.log( '  --> ', title, tags[0], tags[1], tag_icon );

  if ( title.startsWith( explore.lang_category + ':' ) ){ // category

    tag_icon = '<i title="category" class="tag-icon far fa-folder-open"></i>';

  }
  else if ( tags[0] === 'list' ||

    // FIXME: cleanup handling strings (and also in another place below)
    title.startsWith( 'List of ' ) || title.startsWith( 'Index of ' ) || title.startsWith( 'Glossary of ' ) ||
    title.endsWith( 'bibliography' ) ||  title.endsWith( 'discography' ) ||   title.endsWith( 'filmography' ) ||
    title.startsWith( 'Portal:') || title.startsWith( 'Book:' ) || title.startsWith( 'Outline of ') ){ // list FIXME use language-indepent-regex

    tag_icon = '<i title="list / overview" class="tag-icon fas fa-list-ul"></i>';

    const topic_title = 'outgoing_links';

    outlinks_link     = '&nbsp;<a href="javascript:void(0)" title="outgoing links list" aria-label="outgoing links" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="outgoing links list" class="icon"><i class="fas fa-link" style="position:relative;"></i></span></a> ';

  }
  else if ( tags[0] === 'time' ){

    dates_button = '<a href="javascript:void(0)" title="article dates" aria-label="article dates"' + setOnClick( Object.assign({}, args, { type: 'dates' } ) ) + '> <span class="icon"><i class="far fa-clock" style="position:relative;"><span class="subtext">dates</span></i></span> </a>';

    // not bullet-proof, but we need some 'relevance'-filters before showing the timspace-button (as most events don't have the required data to show a timeline)
    if (  valid( item.category ) ||
          ( valid( item.followed_by ) || valid( item.part_of ) || valid( item.has_parts ) || valid( item.list_of ) ) // valid( item.list_of
      ){

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

      timespace_button = '<a href="javascript:void(0)" title="event cluster history" aria-label="event cluster history"' + setOnClick( Object.assign({}, args, { type: 'link-split', url: url } ) ) + '> <span class="icon"><i class="far fa-clock" style="position:relative;"><span class="subtext">events</span></i></span> </a>';

      timespace_link = '&nbsp;<a href="javascript:void(0)" title="event cluster history" aria-label="event cluster history"' + setOnClick( Object.assign({}, args, { type: 'link-split', url: url } ) ) + '><span class="icon"><i class="far fa-clock" style="position:relative;"></i></span></a> ';

    }

  }

  if ( tags[0] === 'person' ){
    o.height_nr = '';
  }

  // TODO: create these symbol-nr-links from the field object
  // sparql-query clickable symbols
  let hdi_query = '';
  let population_query = '';
  let employees_query = '';
  let visitors_query = '';
  let patronage_query = '';
  let life_expectancy_query = '';

  if ( tags[0] === 'natural-concept' ||
       tags[1] === 'religion'
      ){ // fulltext ebook search

    const topic_title  = 'OpenLibrary_eBooks_inside_search';

    open_library_link = '&nbsp;<a href="javascript:void(0)" title="Open Library eBook inside-search" aria-label="Open Library eBook inside-search" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="Open Library eBook inside-search" class="icon"><i class="fab fa-mizuni" style="position:relative;"></i></span></a> ';

  }

  if (  valid( item.openlibrary_id ) || // meta-data ebook search
        tags[1] === 'writer' ||
        tags[1] === 'written-work' ||
        tags[1] === 'role' ||
        tags[1] === 'scientist' ||
        tags[0] === 'meta-concept' ||
        //tags[1] === 'periodical' || // TODO: these should be searched on Archive.org instead of the Open Library
        tags[0] === 'group'
      ){

    const topic_title  = 'OpenLibrary_eBooks_meta-data_search';

    open_library_link = '&nbsp;<a href="javascript:void(0)" title="Open Library eBook search" aria-label="Open Library eBook search" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="Open Library eBook search" class="icon"><i class="fab fa-mizuni" style="position:relative;"></i></span></a> ';

  }

  if ( item.is_author && valid( item.openlibrary_id ) ) { // valid( item.ulan_artist )  only show this button for 'well-known' authors

    const topic_title  = 'OpenLibrary_eBooks_author';

    open_library_author_link = '&nbsp;<a href="javascript:void(0)" title="Open Library eBook author" aria-label="Open Library eBook author" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="Open Library eBook author" class="icon"><i class="fas fa-user-edit" style="position:relative;"></i></span></a> ';

  }

  if (  tags[0] === 'organism' ||
        tags[0] === 'substance' ||
        tags[0] === 'natural-concept' ||
        tags[0] === 'meta-concept' ||
        tags[0] === 'group' ||
        tags[1] === 'periodical' ||
        tags[1] === 'scientist'
      ){

    const topic_title  = 'Archive_Scholar';

    archive_scholar_link = '&nbsp;<a href="javascript:void(0)" title="Archive Scholar" aria-label="Archive Scholar" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="archive scholar" class="icon"><i class="far fa-newspaper" style="position:relative;"></i></span></a> ';

  }

  /*
  if ( item.instance_qid === 101352 ){ // family name 

    const url = 'https://archive.org/details/genealogy?query=' + title_no_braces;

    archive_genealogy_link = '&nbsp;<a href="javascript:void(0)" title="Archive.org genealogy" aria-label="Archive.org genealogy"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="fas fa-users" style="position:relative;"></i></span></a> ';

  }
  */

  if ( valid( item.iiif ) ){

    const url = explore.base + '/app/iiif/#?cv=&c=&m=&s=&manifest=' + encodeURIComponent( item.iiif );

    iiif_link = '&nbsp;<a href="javascript:void(0)" title="IIIF view" aria-label="IIIF view"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="far fa-eye" style="position:relative;"></i></span></a> ';

  }

  if ( valid( item.audio ) ){

    const url = explore.base + '/app/audio/?url=' + encodeURIComponent( '/app/cors/raw/?url=' + item.audio );
    //const url = explore.base + '/app/audio/?url=' + encodeURIComponent( 'https://api.allorigins.win/raw?url=' + item.audio );

    audio_link = '&nbsp;<a href="javascript:void(0)" title="audio tool" aria-label="audio tool"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="fas fa-volume-up" style="position:relative;"></i></span></a> ';

  }

  if ( valid( item.wikiversity ) ){

    wikiversity_link = '&nbsp;<a href="javascript:void(0)" title="Wikiversity topic" aria-label="Wikiversity topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: item.wikiversity } ) ) + '><span class="icon"><i class="fas fa-chalkboard-teacher" style="position:relative;"></i></span></a> ';

  }

  if ( valid( item.outline ) ){

    const url = explore.base + '/app/wikipedia/?t=' + title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + item.outline;

    outline_link = '&nbsp;<a href="javascript:void(0)" title="outline" aria-label="outline"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="fas fa-wave-square" style="position:relative;"></i></span></a> ';

  }

  if ( valid( item.gbif_id ) ){

    const url = explore.base + `/app/response/gbif-map?l=${explore.language}&t=${title_enc}&id=${item.gbif_id}`;

    occurence_map_link = '&nbsp;<a href="javascript:void(0)" title="GBIF occurence map" aria-label="GBIF occurence map"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="fas fa-binoculars" style="position:relative;"></i></span></a> ';

  }

  if ( valid( item.feed ) ){

    const url = explore.base + '/app/feed/?t=' + title_enc + '&url=' + encodeURIComponent( item.feed );

    feed_link = '&nbsp;<a href="javascript:void(0)" title="news feed" aria-label="news feed"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="fas fa-rss" style="position:relative;"></i></span></a> ';

  }


  if ( tags[0] === 'disambiguation' ){

    const url = `${explore.base}/app/links/?l=${explore.language}&t=${title_linkgraph}`;

    linkgraph_link = '&nbsp;<a href="javascript:void(0)" title="link graph" aria-label="link graph"' + setOnClick( Object.assign({}, args, { type: 'link-split', url: url } ) ) + '><span class="icon"><i class="fas fa-asterisk" style="position:relative;"></i></span></a> ';

  }

  if ( listed( item.instances, indicators.movement.value ) ){

    const topic_title  = 'movement_works';

    movement_works_link = '&nbsp;<a href="javascript:void(0)" title="movement works" aria-label="movement works" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="movement works" class="icon"><i class="fas fa-stream" style="position:relative;"></i></span></a> ';

  }

  if ( tags[0] === 'organism' ){

    const topic_title  = 'taxon_group';

    taxon_group_link = '&nbsp;<a href="javascript:void(0)" title="taxon group" aria-label="taxon group" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="taxon group" class="icon"><i class="fas fa-stream" style="position:relative;"></i></span></a> ';

  }

  //console.log( item, item.title, isCategory( item.title ) );

  if ( valid( item.category ) || isCategory( item.title ) ){

    //console.log( 'check item: ',  item.category_tree );

    if ( valid( item.category_tree ) ){

      const topic_title = item.category_tree.split(':')[0] || '';
      const label       = topic_title.replace('_', ' ');

      //console.log( 'check item: ',  item.title, topic_id, label );

      if ( valid( topic_id ) ){

        cattree_link = '&nbsp;<a href="javascript:void(0)" title="' + label + '" aria-label="' + label + '" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="' + label + '" class="icon"><i class="far fa-folder-open" style="position:relative;"></i></span></a> ';

      }

    }

  }

  if ( valid( item.stock_exchange ) ){

    const topic_title  = 'stock_price';

    stockprice_link = '&nbsp;<a href="javascript:void(0)" title="stock price" aria-label="stock price" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="stock price" class="icon"><i class="fas fa-chart-line" style="position:relative;"></i></span></a> ';

  }

  if ( valid( item.stock_exchange ) ){

    const topic_title  = 'business_news';

    business_news_link = '&nbsp;<a href="javascript:void(0)" title="business news" aria-label="business news" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="business news" class="icon"><i class="fas fa-industry" style="position:relative;"></i></span></a> ';

  }

  if ( tags[1] === 'video-game' && filter_year_start < 1996 ){

    const url = `https://archive.org/search.php?query=%22${title_no_braces}%22&sin=TXTFrogger&and[]=languageSorter%3A%22English%22&and[]=mediatype%3A%22software%22`;

    archive_game_link = '&nbsp;<a href="javascript:void(0)" title="Archive.org game search" aria-label="Archive.org game search"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span title="Archive.org game search" class="icon"><i class="fas fa-gamepad" style="position:relative;"></i></span></a> ';

  }

  if ( item.is_artistic_theme ){

    const topic_title  = 'view_wikiCommons_depicts';

    depict_link = '&nbsp;<a href="javascript:void(0)" title="wikiCommons depicts" aria-label="wikiCommons depicts" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="wikiCommons depicts" class="icon"><i class="far fa-images" style="position:relative;"></i></span></a> ';

  }


  if (  tags[1] === 'music' ||
        tags[1] === 'music-genre' ||
        item.is_musician === true ||
        tags[1] === 'musician' ||
        tags[1] === 'music-group'
    ){

    //console.log('is musician? ', item.is_musician, tags );

    const topic_title  = 'Archive_audio';

    music_link = '&nbsp;<a href="javascript:void(0)" title="Archive audio" aria-label="Archive audio" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="Archive audio" class="icon"><i class="fas fa-music" style="position:relative;"></i></span></a> ';

  }

  //console.log( item.title, tags, ', painter: ', item.is_painter, ', ULAM: ', valid( item.ulan_artist ) );

  if ( item.is_painter &&
        ( valid( item.ulan_artist ) || valid( item.rkd_artist ) || valid( item.rijksmuseum_authority_id )  )
    ){

    const topic_title  = 'paintings';

    paintings_link = '&nbsp;<a href="javascript:void(0)" title="paintings" aria-label="paintings" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="paintings" class="icon"><i class="fas fa-th-large" style="position:relative;"></i></span></a> ';

  }

  if ( valid( item.panorama ) ){

    let url = '';

    // create IIIF-viewer-link
    let coll = { "images": [ ]};

    //console.log( item.image_full );

    let label = encodeURIComponent( item.title );

    let author	= '';
    let desc		= '';

    let img = explore.base + '/app/cors/raw/?url=https://commons.m.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent( item.panorama ) + '?width=5000px';

    // for each image add:
    coll.images.push( [ img, label, desc, author, 'wikiCommons' ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

    //console.log( coll );

    if ( coll.images.length > 0 ){ // we found some images

      // create an IIIF image-collection file
      // TOFIX: see "goat" depicts (7th  result"Farm scene, Wales?" needs a "?" fix in the PHP code.
      let iiif_manifest_link = explore.base + '/app/response/iiif-manifest?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

      let iiif_viewer_url = explore.base + '/app/iiif/#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

      url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

      panorama_link = '&nbsp;<a href="javascript:void(0)" title="panorama image" aria-label="panorama image"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="far fa-image" style="position:relative;"></i></span></a> ';

    }

  }

 
  if ( valid( item.defining_formula ) ){

    item.defining_formula.forEach(( formula ) => {

      // see: https://katex.org/docs/support_table.html
      //const list = [ '\mbox', '\and', '\ang', '\array', '\bbox', '\bfseries', '\class', '\color', '\colorbox', '\ddddot', '\dddot', '\DeclareMathOperator', '\definecolor', '\trileleft' ];
      const list = [ '\mbox', '\and', '\bbox' ];

      const tex = removeWords( formula, list );

      const formula_html = '<div class="topic-description formula" title="mathematical formula" aria-label="mathematical formula">' + katex.renderToString( tex, { throwOnError: false }) + '</div>';

      math_formulas.push( formula_html );

      //const url = 'https://xr-graph.vercel.app/?function=f(t)%3D[cos(t),sin(t),t]';

      // 1) determine if: argument or range-function
      //    -> IF: argument function: determine number of arguments
      //      -> 

      //math_formula_link = '&nbsp;<a href="javascript:void(0)" title="mathematical formula" aria-label="mathematical formula"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span title="mathematical formula">' + math_formula_html + '</span></a> ';

    });

  }

  if ( valid( item.molview_protein ) ){

    const url = `${explore.base}/app/molview/?pdbid=${item.protein_id}`;

    if ( valid( item.chemical_formula ) ){

      molview_link = '&nbsp;<a href="javascript:void(0)" title="protein structure" aria-label="protein structure"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span title="protein structure">' + item.chemical_formula + '</span></a> ';

    }
    else {

      molview_link = '&nbsp;<a href="javascript:void(0)" title="protein structure" aria-label="protein structure"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span title="protein structure" class="icon"><i class="fas fa-atom" style="position:relative;"></i></span></a> ';

    }

    o.chemical_formula_string = '';

  }
  else if ( valid( item.molview_cid ) ){

    const url = `${explore.base}/app/molview/?cid=${item.pubchem}`;

    if ( valid( item.chemical_formula ) ){

      molview_link = '&nbsp;<a href="javascript:void(0)" class="alter-font" title="molecule structure" aria-label="molecule structure"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span title="molecule structure">' + item.chemical_formula + '</span></a> ';


    }
    else {

      molview_link = '&nbsp;<a href="javascript:void(0)" class="alter-font" title="molecule structure" aria-label="molecule structure"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span title="molecule structure" class="icon"><i class="fas fa-atom" style="position:relative;"></i></span></a> ';

    }

    o.chemical_formula_string = '';

  }

  if ( valid( item.sourcecode ) ){

    if ( item.sourcecode.startsWith("https://github") ){

      const url = item.sourcecode.replace( "github.com", "github1s.com" );

      codeview_link = '&nbsp;<a href="javascript:void(0)" title="source code view" aria-label="source code view"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="fas fa-code" style="position:relative;"></i></span></a> ';

    }

  }

  if ( valid( item.glotto ) ){

    const url = `https://glottolog.org/resource/languoid/id/${item.glotto}`;

    glotto_link = '&nbsp;<a href="javascript:void(0)" title="Glottolog language information" aria-label="Glottolog language information"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="fas fa-language" style="position:relative;"></i></span></a> ';

  }

  if ( valid( item.properties_for_this_type ) ){

    const url = `${explore.base}/app/browse/?c=${item.qid}&lang=${explore.language}`;

    filter_link = '&nbsp;<a href="javascript:void(0)" title="filter by properties" aria-label="filter by properties"' + setOnClick( Object.assign({}, args, { type: 'link-split', url: url, panelwidth: '30' } ) ) + '><span class="icon"><i class="fas fa-filter" style="position:relative;"></i></span></a> ';

  }

  if ( valid( item.xeno_canto ) ){

    const url = `https://www.xeno-canto.org/species/${item.xeno_canto}`

    xeno_canto_link = '&nbsp;<a href="javascript:void(0)" title="Xeno-canto bird sounds" aria-label="Xeno-canto bird sounds"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="fas fa-crow" style="position:relative;"></i></span></a> ';

  }


  if ( valid( item.semantic_scholar_author_id ) ){

    const topic_title  = 'Semantic_Scholar_author_papers';

    semantic_scholar_papers_link = '&nbsp;<a href="javascript:void(0)" title="semantic scholar author papers" aria-label="semantic scholar author papers" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="semantic scholar author papers" class="icon"><i class="fab fa-accusoft" style="position:relative;"></i></span></a> ';

  }

  if ( valid( item.chain_map ) ){

    const url =  encodeURI( explore.base + '/app/overpass/map.html?Q=(node[%22brand%3Awikidata%22%3D%22' + item.qid + '%22]%3B)%3Bout%3B' );

    chain_map_link = '&nbsp;<a href="javascript:void(0)" title="business chain map" aria-label="business chain map"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="fas fa-store" style="position:relative;"></i></span></a> ';

  }

  if ( tags[0] === 'location' && valid( [ explore.personas, item.osm_relation_id ] ) ){

    if ( explore.personas.includes('nomad') ){

      const url =  encodeURI( explore.base + '/app/overpass/map.html?t=' + title + ' : coworking-spaces&Q=[out%3Ajson][timeout%3A60]%3B%0Aarea(' + ( 3600000000 + parseInt( item.osm_relation_id ) ) + ')-%3E.searchArea%3B%0A(%0A%20%20node[%22amenity%22%3D%22coworking_space%22](area.searchArea)%3B%0A%20%20way[%22amenity%22%3D%22coworking_space%22](area.searchArea)%3B%0A%20%20relation[%22amenity%22%3D%22coworking_space%22](area.searchArea)%3B%0A)%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B&s=true' );

      //console.log('coworking space location: ', item.osm_relation_id, explore.personas, url );

      coworking_space_map_link = '&nbsp;<a href="javascript:void(0)" title="coworking-spaces map" aria-label="coworking-spaces map"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '><span class="icon"><i class="fas fa-laptop-house" style="position:relative;"></i></span></a> ';

      wikivoyage_link = o.wikivoyage;

    }

  }

  if ( valid( item.found_in_taxon ) ){

    if ( item.found_in_taxon.length > 1 ){

      const topic_title  = 'found_in';

      found_in_taxon_link = '&nbsp;<a href="javascript:void(0)" title="found in taxon" aria-label="found in taxon" onclick="openInline( &quot;' + encodeURIComponent( item.title ) + '&quot;,&quot;' + topic_id + '&quot;,&quot;' + topic_title + '&quot;)"><span title="found in taxon" class="icon"><i class="oma oma-black-leaf-fluttering-in-wind" style="position:relative;"></i></span></a> ';

    }
    else { // single value

      found_in_taxon_link = '&nbsp;<a href="javascript:void(0)" title="found in taxon" aria-label="found in taxon"' + setOnClick( Object.assign({}, args, { type: 'link', url: explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&qid=' + item.found_in_taxon + '&voice=' + explore.voice_code  } ) ) + '"><span title="found in taxon" class="icon"><i class="oma oma-black-leaf-fluttering-in-wind" style="position:relative;"></i></span></a> ';

    }

  }

  if ( valid( item.is_nobility ) ){

    const type = 'family_tree';

    entitree_link = '&nbsp;<a href="javascript:void(0)" title="EntiTree family tree" aria-label="EntiTree family tree"' + setOnClick( Object.assign({}, args, { type: 'link',  url: 'https://www.entitree.com/' + explore.language + '/' + type + '/' + item.qid, title: title, qid: item.qid } ) ) + '><span class="icon"><i class="fas fa-crown" style="position:relative;"></i></span></a> ';

  }


  if ( valid( item.is_nobility_family ) ){

    const type = 'family';

    entitree_link = '&nbsp;<a href="javascript:void(0)" title="EntiTree family tree" aria-label="EntiTree family tree"' + setOnClick( Object.assign({}, args, { type: 'link',  url: 'https://www.entitree.com/' + explore.language + '/' + type + '/' + item.qid, title: title, qid: item.qid } ) ) + '><span class="icon"><i class="fas fa-crown" style="position:relative;"></i></span></a> ';

  }

  if (  valid( item.lat ) && ( tags[0] === 'location' || tags[0] === 'organization' )){

    hide_quizzes  = 'display:block;';

    //item.lat = parseFloat( custom.lat );
    //item.lon = parseFloat( custom.lon );

    const delta = 0.05;

    const bb1 = item.lon - delta;
    const bb2 = item.lat - delta;
    const bb3 = item.lon + delta;
    const bb4 = item.lat + delta;

    let osm_id = '';

    if ( valid( item.osm_relation_id ) ){

      osm_id = item.osm_relation_id;

    }

    const url = `${explore.base}/app/map/?l=${explore.language}&bbox=${bb1},${bb2},${bb3},${bb4}&lat=${item.lat}&lon=${item.lon}&osm_id=${osm_id}&qid=${qid}&title=` + encodeURIComponent( item.title );

    //console.log( url );

    map_link = '&nbsp;<a href="javascript:void(0)" title="map" aria-label="map"' + setOnClick( Object.assign({}, args, { type: 'link', url: url, title: title, qid: item.qid } ) ) + '><span class="icon"><i class="fas fa-globe-asia" style="position:relative;"></i></span></a> ';

    nearby_link = '&nbsp;<a href="javascript:void(0)" title="Wiki-items nearby map" aria-label="Wiki-items nearby map"' + setOnClick( Object.assign({}, args, { type: 'link-split',  url: '/app/nearby/#lat=' + item.lat + '&lng=' + item.lon + '&zoom=17&interface_language=' + explore.language + '&layers=wikidata_image,wikidata_no_image,wikipedia', title: title, qid: item.qid } ) ) + '><span class="icon"><i class="fas fa-map-pin" style="position:relative;"></i></span></a> ';

    nearby_button = '<a href="javascript:void(0)" title="Wiki-items nearby map" aria-label="Wiki-items nearby map"' + setOnClick( Object.assign({}, args, { type: 'link-split',  url: '/app/nearby/#lat=' + item.lat + '&lng=' + item.lon + '&zoom=17&interface_language=' + explore.language + '&layers=wikidata_image,wikidata_no_image,wikipedia', title: title, qid: item.qid } ) ) + '><span class="icon"><i class="fas fa-map-pin" style="position:relative;"><span class="subtext">nearby</span></i></span>';

    if ( tags[1] === 'mountain' ){

      const url = `${explore.base}/app/map3d/?lat=${item.lat}&lon=${item.lon}`;

      mountain_map_link = '&nbsp;<a href="javascript:void(0)" title="mountain terrain" aria-label="mountain terrain"' + setOnClick( Object.assign({}, args, { type: 'link', url: url, title: title, qid: item.qid } ) ) + '><span class="icon"><i class="fas fa-mountain" style="position:relative;"></i></span></a> ';
    

    }

  }

  if ( tags[1] === 'geographical-structure' ){

    geo_structure_map_link = '&nbsp;<a href="javascript:void(0)" title="geo-object type map" aria-label="geo-object type map"' + setOnClick( Object.assign({}, args, { type: 'link-split',  url: `${explore.base}/app/query/embed.html?l=${explore.language}#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Fimg%20%3Fgeoshape%20%3Fcoords%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3A${item.qid}.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP625%20%3Fcoords.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP18%20%3Fimg.%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${explore.language}%2Cen%22.%20%7D%0A%7D%0AORDER%20BY%20(%3FitemLabel)%0ALIMIT%205000%0A%23meta%3A%20${title_}%20%23defaultView%3AMap%7B%22hide%22%3A%20%22%3Fcoords%22%7D`, title: title, qid: item.qid } ) ) + '><span class="icon"><i class="fas fa-map-marked-alt" style="position:relative;"></i></span></a> ';

    //geo_structure_map_link = '&nbsp;<a href="javascript:void(0)" title="geo-object type map" aria-label="geo-object type map"' + setOnClick( Object.assign({}, args, { type: 'link-split',  url: `${explore.base}/app/query/embed.html?l=${explore.language}#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Fcoords%20%3Fpic%0AWHERE%20%0A%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3A${item.qid}.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP625%20%3Fcoords.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP18%20%3Fpic.%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${explore.language}%2Cen%22.%20%7D%0A%7D%0AORDER%20BY%20ASC%20(%3FitemLabel)%0ALIMIT%205000%0A%23meta%3A%20${title_}%20locations%0A%23defaultView%3AMap%7B%22hide%22%3A%20%22%3Fcoords%22%7D`, title: title, qid: item.qid } ) ) + '><span class="icon"><i class="fas fa-map-marked-alt" style="position:relative;"></i></span></a> ';

  }

  if ( tags[1] === 'satellite' ){

    satellite_link = '&nbsp;<a href="javascript:void(0)" title="satellite" aria-label="satellite"' + setOnClick( Object.assign({}, args, { type: 'link',  url: explore.base + '/app/space/?search=' + item.satellite_cospar, title: title, qid: item.qid } ) ) + '><span class="icon"><i class="fas fa-satellite" style="position:relative;"></i></span></a> ';

  }

  if ( valid( item.term_anatomica_id ) ){

    anatomy_link = '&nbsp;<a href="javascript:void(0)" title="anatomy tree" aria-label="anatomy tree"' + setOnClick( Object.assign({}, args, { type: 'link-split',  url: explore.base + '/app/taviewer/?l=' + explore.language + '&id=' + item.term_anatomica_id, title: title, qid: item.qid, panelwidth: 30 } ) ) + '><span class="icon"><i class="fas fa-brain" style="position:relative;"></i></span></a> ';

  }

  if ( valid( item.commons_video ) ){

    commons_video_link = '&nbsp;<a href="javascript:void(0)" title="wikiCommons video" aria-label="wikiCommons video"' + setOnClick( Object.assign({}, args, { type: 'link',  url: item.commons_video, title: title, qid: item.qid } ) ) + '><span class="icon"><i class="far fa-file-video" style="position:relative;"></i></span></a> ';

  }

  if ( valid( item.youtube_channel ) ){

    youtube_channel_link = '&nbsp;<a href="javascript:void(0)" title="YouTube channel" aria-label="YouTube channel"' + setOnClick( Object.assign({}, args, { type: 'link',  url: explore.base + '/app/video/#/user/' + encodeURIComponent( item.youtube_channel ), title: title, qid: item.qid } ) ) + '><span class="icon"><i class="fab fa-youtube-square" style="position:relative;"></i></span></a> ';

  }

  if (  tags[0] === 'location' ||
        tags[0] === 'time' ||
        tags[0] === 'group' ||
        tags[0] === 'organism' ||
        tags[0] === 'meta-concept' ||
        tags[1] === 'geographical-structure' ||
        tags[1] === 'religion' ||
        tags[1] === 'museum' ||
        tags[1] === 'filmmaker' ||
        tags[1] === 'actor' ||
        tags[1] === 'musician' ||
        ( tags[0] === 'work' && ! valid( item.is_written_work ) && !valid( item.openlibrary_id ) && tags[1] !== 'periodical' ) // show video for works, but not for some types of works
    ){ // TODO how to filter non-cities|countries|provinces|etc.?

    video_link = '&nbsp;<a href="javascript:void(0)" title="videos" aria-label="videos"' + setOnClick( Object.assign({}, args, { type: 'link', url: explore.base + '/app/video/#/search/' + title_quoted, title: title } ) ) + '><span class="icon"><i class="fas fa-video" style="position:relative;"></i></span></a> ';

    //video_link = '&nbsp;<a href="javascript:void(0)" title="videos" aria-label="videos"' + setOnClick( Object.assign({}, args, { type: 'wander', title: title, qid: item.qid } ) ) + '><span class="icon"><i class="fas fa-video" style="position:relative;"></i></span></a> ';

    if ( valid( item.population ) ){

      const url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20%3Fyear%20%3Fpopulation%20%7B%0A%20%20wd%3A' + item.qid + '%20p%3AP1082%20%3Fp%20.%0A%20%20%3Fp%20pq%3AP585%20%3Fyear%20%3B%0A%20%20%20%20%20ps%3AP1082%20%3Fpopulation%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%2Cen%22%20%7D%0A%7D%0AORDER%20BY%20%3Fyear%0A%23defaultView%3AAreaChart%0A%23meta%3Apopulation%20by%20year';

      population_query = '<a href="javascript:void(0)" title="population" aria-label="population"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '>' + o.population_nr + '</a>';

    }
    else { // TODO: is this else-clause needed? HDI always refers to a country

      population_query = o.population_nr;

    }

  }

  if ( tags[1] === 'country' ){

    if ( typeof item.hdi === undefined || typeof item.hdi === 'undefined' || item.hdi === '' ){
      // do nothing
    }
    else {

      const hdi_low   =  parseFloat( item.hdi ) - 0.05;
      const hdi_high  =  parseFloat( item.hdi ) + 0.05;

      const url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20%3Fcountry%20%3FcountryLabel%20%20%3Fhdi_value%20%3Fpopulation%20WHERE%20%7B%0A%20%20%3Fcountry%20wdt%3AP31%20wd%3AQ6256;%0A%20wdt%3AP1082%20%3Fpopulation%20.%20%20OPTIONAL%20%7B%20%3Fcountry%20p%3AP1081%20%3Fhdi_statement.%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%3Fhdi_statement%20ps%3AP1081%20%3Fhdi_value.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%3Fhdi_statement%20pq%3AP585%20%3Fhdi_date.%0A%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20FILTER%20NOT%20EXISTS%20%7B%0A%20%20%20%20%3Fcountry%20p%3AP1081%2Fpq%3AP585%20%3Fhdi_date_%20.%0A%20%20%20%20FILTER%20(%3Fhdi_date_%20%3E%20%3Fhdi_date)%0A%20%20%7D%0A%20%20FILTER%20(%3Fhdi_value%20%3E%20' + hdi_low + '%20)%0A%20%20FILTER%20(%3Fhdi_value%20%3C%20' + hdi_high + '%20)%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%2Cen%22.%20%7D%0A%7D%0AORDER%20BY%20DESC(%3Fhdi_value)%0A%23defaultView%3ATable%0A%23meta%3ACountries%20with%20a%20similar%20Human%20Development%20Index';

      hdi_query = '<a href="javascript:void(0)" title="human development index" aria-label="HDI"' + setOnClick( Object.assign({}, args, { type: 'link-split', url: url } ) ) + '>' + o.hdi_nr + '</a>';

    }

  }
  else { // TODO: is this else-clause needed? HDI always refers to a country

    hdi_query = o.hdi_nr;

  }

  if ( valid( item.employees ) ){

    let url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20%3Fyear%20%3Femployees%20%7B%0A%20%20wd%3A' + item.qid + '%20p%3AP1128%20%3Fp%20.%0A%20%20%3Fp%20pq%3AP585%20%3Fyear%20%3B%0A%20%20%20%20%20ps%3AP1128%20%3Femployees%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%2Cen%22%20%7D%0A%7D%0AORDER%20BY%20%3Fyear%0A%23defaultView%3AAreaChart%0A%23meta%3Aemployees%20by%20year';

    employees_query = '<a href="javascript:void(0)" title="employees" aria-label="employees"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '>' + o.employees_nr + '</a>';

  }
  else {

    employees_query = o.employees_nr;

  }

  if ( valid( item.life_expectancy ) ){

    let url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20%3Fyear%20%3Flife_expectancy%20%7B%0A%20%20wd%3A' + item.qid + '%20p%3AP2250%20%3Fp%20.%0A%20%20%3Fp%20pq%3AP585%20%3Fyear%20%3B%0A%20%20%20%20%20ps%3AP2250%20%3Flife_expectancy%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%2Cen%22%20%7D%0A%7D%0AORDER%20BY%20%3Fyear%0A%23defaultView%3AAreaChart%0A%23meta%3Alife%20expectancy%20by%20year';

    life_expectancy_query = '<a href="javascript:void(0)" title="life expectancy" aria-label="life expectancy"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '>' + o.life_expectancy_nr + '</a>';

  }
  else {

    life_expectancy_query = o.life_expectancy_nr;

  }

  if ( valid( item.visitors ) ){

    let url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20%3Fyear%20%3Fvisitors%20%7B%0A%20%20wd%3A' + item.qid + '%20p%3AP1174%20%3Fp%20.%0A%20%20%3Fp%20pq%3AP585%20%3Fyear%20%3B%0A%20%20%20%20%20ps%3AP1174%20%3Fvisitors%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%2Cen%22%20%7D%0A%7D%0AORDER%20BY%20%3Fyear%0A%23defaultView%3AAreaChart%0A%23meta%3Avisitors%20by%20year';

    visitors_query = '<a href="javascript:void(0)" title="visitors" aria-label="visitors"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '>' + o.visitors_nr + '</a>';

  }
  else {

    visitors_query = o.visitors_nr;

  }

  if ( valid( item.patronage ) ){

    let url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20%3Fyear%20%3Fpatronage%20%7B%0A%20%20wd%3A' + item.qid + '%20p%3AP3872%20%3Fp%20.%0A%20%20%3Fp%20pq%3AP585%20%3Fyear%20%3B%0A%20%20%20%20%20ps%3AP3872%20%3Fpatronage%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%2Cen%22%20%7D%0A%7D%0AORDER%20BY%20%3Fyear%0A%23defaultView%3AAreaChart%0A%23meta%3Apatronage%20by%20year';

    patronage_query = '<a href="javascript:void(0)" title="patronage" aria-label="patronage"' + setOnClick( Object.assign({}, args, { type: 'link', url: url } ) ) + '>' + o.patronage_nr + '</a>';

  }
  else {

    patronage_query = o.patronage_nr;

  }

  let flags = '';

  if ( valid( item.countries ) ){

    // collect all flags
    item.countries.forEach(( country, i ) => {

      //console.log( i, country );

      flags += country.flag;

    });

  }

  let headline_buttons = '<span class="headline-right-half">' +
    ( valid( item.flag ) ? item.flag : '' )  + // flag-image directly set on the item
    flags + // country flags
    '&#8239;' +
    dating +
    o.number_of_seasons_nr +
    o.duration_nr +
    o.event_interval_nr +
    o.publication_interval_nr +
    population_query +
    employees_query +
    o.member_count_nr +
    o.students_count_nr +
    life_expectancy_query +
    hdi_query +
    o.total_revenue_nr +
    o.collection_size_nr +
    o.alexa_rank_nr +
    visitors_query +
    patronage_query +
    o.height_nr +
    o.length_nr +
    o.elevation_nr +
    ' ' + o.website +
    ' ' + o.twitter +
    ' ' + o.mastodon_address +
    linkgraph_link +
    coworking_space_map_link +  // nomad-persona
    wikivoyage_link +           // nomad-persona
    nearby_link +
    map_link +
    mountain_map_link +
    ( valid( explore.personas.includes('tourist') ) ? o.osm_query_hiking_routes : '' )  +
    filter_link +
    cattree_link +
    geo_structure_map_link +
    //archive_genealogy_link +
    archive_scholar_link +
    semantic_scholar_papers_link +
    open_library_author_link +
    open_library_link +
    wikiversity_link +
    audio_link +
    xeno_canto_link +
    taxon_group_link +
    chain_map_link +
    occurence_map_link +
    found_in_taxon_link +
    o.chemical_formula_string +
    molview_link +
    timespace_link +
    entitree_link +
    ( valid( tags[1] === 'tonality' ) ? o.music_tonality_query : '' ) +
    music_link +
    o.photosphere +
    panorama_link +
    commons_video_link +
    video_link +
    youtube_channel_link +
    depict_link +
    paintings_link +
    art_link +
    iiif_link +
    movement_works_link +
    //o.wad_genre +
    glotto_link +
    feed_link +
    stockprice_link +
    business_news_link +
    outline_link +
    outlinks_link +
    codeview_link +
    archive_game_link +
    anatomy_link +
    satellite_link +
  '</span>';

  // check how many icons there are in the headline_buttons
  const headline_button_length = $( $.parseHTML( headline_buttons ) ).find('i').length;

  // if there are no icons, hide the headline
  const hide_headline = ( headline_button_length === 0 ) ? true : false;

  //console.log( title, headline_button_length, hide_headline );

  // ready to set the final identifying icon
  if ( tag_icon !== '' ){ // tag set

    //console.log( title, tag_icon );

    if ( args.id == 'n00' ){ // raw-search-string topic 

      headline = '<a href="javascript:void(0)" class="article-title linkblock" style="margin-left: 3%;" tabindex="-1" title="Bing web search" aria-label="Bing web search"' + setOnClick( Object.assign({}, args, { type: 'link', url : 'https://www.bing.com/search?q=' + title_quoted + '+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-wikipedia.org+-wikimedia.org+-wikiwand.com+-wiki2.org&setlang=' + explore.language + '-' + explore.language } ) ) + '>' + tag_icon + ' <span style="font-weight: normal; font-size: smaller;">(<span id="app-guide-string-search">' + explore.banana.i18n('app-guide-string-search') + '</span>)</a>';

    }
    else {

      if ( hide_headline ){

        headline_buttons = '';

      }

      if ( valid( topic_onclick ) ){ // with topic-class-link

        headline = '<span class="headline-left-half icon"><a href="javascript:void(0)" class="topic-class ' + topic_label + '" aria-label="topic class ' + topic_label + '" ' + topic_onclick + '>' + tag_icon + ' </a></span>' + headline_buttons;

      }
      else { // without topic-class-lik

        headline = '<span class="headline-left-half icon"><span class="topic-class" aria-label="topic class">' + tag_icon + ' </span></span>' + headline_buttons;

      }


    }

  }
  else { // no tags set, only show the other headline-icons

    //console.log( item.title, headline_buttons.length ) ;

    if ( !hide_headline ){

      headline = '<span style="margin-left: 3%;">' + headline_buttons;

    }

  }


  if ( args.id == 'n00' ){ // raw-search-string topic: this is not a wikipedia or wikidata article

    o.mark = '';
    // override the normal wikidata-page-button with a wikidata-search-button
    o.wikidata = '<a href="javascript:void(0)" title="Wikidata search" aria-label="Wikidata search"' + setOnClick( Object.assign({}, args, { type: 'link', url: encodeURI( explore.base + '/app/wikidata/?find=' + title_ + '&lang=' + explore.language ) } ) ) + '"> <span class="icon"><i class="fas fa-hockey-puck" style="position:relative;"><span class="subtext">wData</span></i></span> </a>';

    // reset fields not usable for this raw-type
    o.linkgraph = '';

  }

  if ( valid( item.quizzes ) ){

		if ( item.quizzes.length > 0 ){

      hide_quizzes  = 'display:block;';

			//console.log( 'quiz data: ', item.quizzes );

			// append each item in the "quizzes" array to the quiz-container
			quiz_button += '<details title="quiz" id="mv-' + id + '" class="multi-value"><summary class="multi-value"><span class="icon"><i class="fas fa-puzzle-piece" style="position:relative;"><span class="subtext">&nbsp;quiz</span></i></span></summary><p class="mv-content"><ul class="multi-value">';

      item.quizzes.forEach(( quiz, i ) => {

        console.log( i, quiz );

				quiz_button += quiz;

			});

			//quiz_button += '<li>' + o.streetquiz + '</li>';

			quiz_button += '</ul><br/></p></details> ';

		}

	}

  // FIXME this should be done cleaner, eg. only set these when an instance_qid is present
  if ( id == 'n00' || tags[0] === 'disambiguation' || tags[0] === 'person-disambiguation' || tags[0] === 'list' ){ // only show similar-items buttons for wikidata things (not for raw-string-topics)
     
    similar_items_button = '';
    similar_featured_items_button = '';

  }


  //let current_pane = getCurrentPane();
  let current_pane = 'p0';

  let topic_title = '<a href="javascript:void(0)" class="article-title linkblock sticky-title" aria-label="wikipedia"' + setOnClick( Object.assign({}, args, { type: type_, current_pane: current_pane, target_pane: 'p1', gbif_id: item.gbif_id } ) )  + '>' + title.replace(/:/g, ': ') + '</a>';

  //console.log( 'gbif_id: ', item.gbif_id );

  let description = '';

  if ( args.id == 'n00' ){ // raw-search-string

    topic_title = '<a href="javascript:void(0)" class="article-title linkblock sticky-title" aria-label="Bing web search"' + setOnClick( Object.assign({}, args, { type: 'link', url : 'https://www.bing.com/search?q=' + title_quoted + '+-wikipedia.org&setlang=' + explore.language + '-' + explore.language, current_pane: current_pane, target_pane: 'p1' } ) )  + '> ' + title.replace(/:/g, ': ') + '</a>';

    item.description = '(<span id="app-guide-string-search">' + explore.banana.i18n('app-guide-string-search') + '</span>)';
  }

  if ( typeof item.description === undefined || typeof item.description === 'undefined' || item.description === '' || item.description === 'undefined' ){
    // do nothing
  }
  else {

    description = '<a href="javascript:void(0)" class="summary-link" aria-label="topic description" tabindex="-1" ' + setOnClick( Object.assign({}, args, { type: type_, current_pane: current_pane, target_pane: 'p1', gbif_id: item.gbif_id } ) )  + '><div class="topic-description">' + item.description + '</div></a>'; 

  }

  //console.log( item.title_, o.audio, o.audio_widget_string );


  // for each known section
  Object.keys( explore.sections ).forEach(( sid, i ) => {

    //console.log('  - section: ', sid );

    let html_section = '';

    // sort its field-objects by rank
    const section_sorted = sortObjectsArray( sections_struct[ sid ], 'rank' );

    //console.log( section_sorted );

    section_sorted.forEach(( field, j ) => {

      //console.log( '    - field: ', sid, field.name );

      // append its HTML-value to "html_section"
      html_section += field.html;

    });

    // add "html_section" to the jquery-DOM object at #section-<sectionID>
    dom.find( '#section-' + sid ).append( html_section );

    //console.log( title, i, topic_id, sid, html_section );
    //console.log( title, i, topic_id, sid, dom.html() );

  });

  //console.log( title, dom.length, dom );

  let all_section_html = '';

  dom.each( function( i ) {

    all_section_html += $( this ).html();

  });

  // compose HTML output
  const html_output = '<div id="' + id + '" class="entry articles box ' + extra_classes + '" style="' + hide + '">' + 

    //console.log( o.described_at );
    topic_title +

    '<div class="topic">' + headline + '</div>' +
    math_formulas.join('') +
    description +
    motto_text +

    '<a href="javascript:void(0)" class="summary-link" aria-label="wikipedia" tabindex="-1" ' + setOnClick( Object.assign({}, args, { type: 'wikipedia', current_pane: current_pane, target_pane: 'p1', gbif_id: item.gbif_id } ) )  + '>' +
      thumbnail +
      '<div class="summary ' + pid + '">' +
        //item.dist + 
        snippet +
      '</div>' +
    '</a>' + 

    '<div class="topic-tts-buttons">' +
      o.speak_article +
      o.pause_speaking_article +
      o.stop_speaking_article +
    '</div>' +

    o.audio_widget_string +
    //o.audio_anthem_widget + // TODO: implement claim-property access first to access this value
    '<div style="clear: both;"></div>' +

    explore.minimal_detail_open +

    '<span class="medialinks" style="display:block;">' +

      '<details id="sections" class="more-details" " title="show more links" aria-label="show more links">' +
        '<summary class="more bt"></summary>' +

          all_section_html +

      '</details>' +

    '</span>' +
    explore.minimal_detail_close +
  '</div>';

  return html_output;

}
