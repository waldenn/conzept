'use strict';

function autocompleteDPLA( results, dataset ){

  const source = 'dpla';

  //console.log( results );

  let list = [];

  if ( valid( results?.docs) ){

    $.each( results.docs, function( i, item ){

      if ( valid( item?.sourceResource?.title ) ){

        let title = item.sourceResource.title[0];

        dataset.push( title );

      }

    })

  }

}

function processResultsDPLA( topicResults, struct, index ){

  const source = 'dpla';

  return new Promise(( resolve, reject ) => {

    //console.log( topicResults );

    if ( !valid( topicResults.docs ) ){

      resolve( [ [], [] ] );

      datasources[ source ].done = true;

    }
    else if ( topicResults.docs.length === 0 ){

      resolve( [ [], [] ] );

      datasources[ source ].done = true;

    }
    else if ( ( Math.max( Math.ceil( topicResults.count / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

      datasources[ source ].done = true;

    }
    else {

      datasources[ source ].total = topicResults.count;

      // standard result structure (modelled after the Wikipedia API)
      let result = {

        source: {

          data: {

            batchcomplete: '',

            continue: {
              'continue': "-||",
              'sroffset': datasources[ source ].pagesize,
              'source': source,
            },

            query: {

              search : [],

              searchinfo: {
                totalhits: datasources[ source ].total,
              },

            },

          },

        },

      };

      $.each( topicResults.docs, function( i, obj ){

        // URL vars
        let gid           = valid( obj.id )? obj.id : '';

        let url     	 		= valid( obj.isShownAt )? obj.isShownAt : '';

        let doc_url           = '';
        let document_language = 'en'; // default

        let used_languages = [];

        /*
				if ( valid( obj.language ) ){ // languages indication

          // find language match
          $.each( obj.language, function( j, lang ){

            $.each( Object.keys( wp_languages ), function( n, wp_lang ){

              if ( lang === wp_languages[ wp_lang ].name.toLowerCase() ){

                //console.log('language match found: ', lang, wp_lang );

                used_languages.push( wp_lang );

              }

            });

				 	  //... match "english|spanish|etc" with known iso2-languages

          });

          //console.log( 'supported languages: ', used_languages );

          if ( used_languages.length === 1 ){

            document_language = used_languages[0];

            //console.log( 'choosing the first language: ', document_language );

          }
          else {

            document_language = used_languages[0];

            //console.log( 'choosing the first language out of multiple: ', document_language );

          }

				}
        */

        //let document_voice_code = explore.voice_code_selected.startsWith( document_language )? explore.voice_code_selected : 'en';
        //let tts_link     	= '';

        let title         = valid( obj?.sourceResource?.title )? obj.sourceResource.title[0] : '---';

        let description   = valid( obj?.sourceResource?.description )? obj.sourceResource.description[0] : '';

        /*
        if ( !valid( description ) ){

          description   = valid( obj?.item?.summary )? obj.item.summary : '';

        }
        */

        let maintag       = 'work';
        let subtag        = '';

        // TODO: use "sourceResource.type"

        if ( valid( obj.sourceResource?.type ) ){

          let types = obj.sourceResource.type || [];

          console.log( types );

          if ( types.includes('text') ){ subtag = 'written-work' }
          else if ( types.includes('moving image') ){ subtag = 'film' } 
          else if ( types.includes('sound') ){ subtag = 'audio' }
          //else if ( types.includes('map') ){ subtag = 'map' }
          //else if ( types.includes('web page') ){ subtag = 'webpage' }
          //else if ( types.includes('periodical') ){ subtag = 'periodical' }
          //else if ( types.includes('newspaper') ){ subtag = 'newspaper' } 
          else if ( types.includes('image') ){ subtag = 'image' }
          //TODO: handle multiple images as IIIF: else if ( types.includes('manuscript/mixed material') ){ subtag = 'image' }
          //else if ( types.includes('legislation') ){ subtag = 'legislation' } // TODO
          //else if ( types.includes('web archive') ){ subtag = 'archive' } // TODO
          else {
            console.log('no matching tag found for these types: ', types );
          }

        }

        // TODO:
        //  - check "obj.online_format" array
        //    - image --> IIIF viewable image
        //    - ...
        //  - set displayable URL

        let author        = '';

        let start_date    = '';
        let end_date      = '';


        let license_link  = '';
        let license_name  = '';

        let img           = '';
        let thumb  	  = '';

	      if ( valid( obj?.sourceResource?.date?.begin ) ){

	        start_date = obj.sourceResource.date.begin.split('-')[0];

	      }
	      else if ( valid( obj?.sourceResource?.date ) ){

	      	if ( valid( obj?.sourceResource?.date[0] ) ){

		  //console.log( obj.sourceResource.date[0] );

	      	  if ( valid( obj?.sourceResource?.date[0].begin ) ){

	            start_date = obj.sourceResource.date[0].begin.split('-')[0];

            }
            else if ( valid( obj?.sourceResource?.date[0]?.displayDate ) ){

              start_date = obj.sourceResource.date[0].displayDate.split('-')[0];

            }

            if ( valid( obj?.sourceResource?.date[0].end ) ){

              end_date = obj.sourceResource.date[0].end.split('-')[0];

            }

          }

	      }

	      if ( valid( obj?.sourceResource?.date?.end ) ){

	        end_date = obj.sourceResource.date.end.split('-')[0];

	      }

        /*
        if ( obj.image_url ){

          if ( Array.isArray( obj.image_url ) && obj.image_url.length > 0 ){

            thumb = obj.image_url.pop().split("#")[0];

          }
          else { // no image found

            return 0;

          }

        }
	*/

        if ( valid( subtag ) ){ // some media is avaiable

          if ( subtag === 'image' ){

            thumb = valid( obj?.object )? obj.object : '';

	        }
          if ( subtag === 'film' ){

            thumb = valid( obj?.object )? obj.object : '';

	        }

	      }

	/*
        if ( valid( subtag ) ){ // some media is avaiable

           let media_found = false;

              //console.log( obj.resources[0] );

              if ( subtag === 'pdf' ){

								if ( valid( obj.resources[0]?.pdf ) ){

									url         = obj.resources[0].pdf;
									tts_link    = url;
									media_found = true;
                  subtag      = 'book';

                  //console.log( url );

								}

              }
              else if ( subtag === 'video' ){

                if ( valid( obj.resources[0]?.video ) ){

                        url = obj.resources[0].video
                        media_found = true;
                        subtag  = 'film';

                }

              }
              else if ( resource_key === 'audio' ){

                if ( valid( obj.resources[0]?.audio ) ){

                        url = `${explore.base}/app/audio/?url=${ encodeURIComponent( "/app/cors/raw/?url=" + obj.resources[0].audio )}`;
                        media_found = true;
                        subtag  = 'audio';

                }

              }
              else if ( resource_key === 'media' ){

                if ( valid( obj.resources[0]?.media ) ){

                        url = `${explore.base}/app/audio/?url=${ encodeURIComponent( "/app/cors/raw/?url=" + obj.resources[0].media )}`;
                        media_found = true;
                        subtag  = 'audio';

                }

              }

              else if ( resource_key === 'image' ){

								if ( valid( obj.resources[0]?.image ) ){

									media_found = true;
									subtag	= 'image';

								}

              }


						if ( !valid( media_found ) ) {

							console.log( 'no media used: ', obj.resources[0] );

						}


        }
	*/

        const description_plain = ''; // TODO: stripHtml( description.substring(0, explore.text_limit ) + ' (...)';

        if ( valid( description ) ){

          if ( description.length > explore.text_limit ){

            description	= highlightTerms( stripHtml( description.substring(0, explore.text_limit ) + ' (...)' ) );

          }
          else {

            description	= highlightTerms( stripHtml( description ) );

          }

        }

        // fill fields
				let item = {
          source:       source,
					title:        title.substring(0,150),
					description:  ' ' + description + '<br/></br>' + author,
					gid:          url,
					display_url:  url,
					thumb:        thumb,
          start_date:   start_date,
          end_date:     end_date,

          //document_language:    document_language,
          //document_voice_code:  document_voice_code,
          //pdf_tts_link: tts_link,

					qid:          '',
          countries:    [],
          tags:         [],
          web_url:      url,
					// TODO: add fields: license link + license name
				};

        /*
        if ( valid( obj.image_url ) && obj?.image_url.length > 0 ){

          // create IIIF-viewer-link
          let coll = { "images": [ ]};

          let source_name = datasources[ item.source ].name;

          coll.images.push( [ thumb, item.title, encodeURIComponent( description_plain + '<br/><br/>License: ' + license_link + '<br/><br/>' + license_name ), 'author: ' + '-', 'source: ' + source_name ] );

          if ( coll.images.length > 0 ){ // we found some images

            // create an IIIF image-collection file
            let iiif_manifest_link = '/app/response/iiif-manifest.php?l=en&single=true&t=' + encodeURIComponent( item.title ) + '&json=' + JSON.stringify( coll );

            let iiif_viewer_url = `https://${explore.host}${explore.base}/app/iiif/dist/uv.html#?c=&m=&s=&cv=&manifest=${ encodeURIComponent( iiif_manifest_link ) }`;

            item.iiif         = iiif_viewer_url;

            if ( subtag === 'image' ){
              item.display_url  = encodeURIComponent( iiif_viewer_url );
            }

          }

        }
        */

        setWikidata( item, [ ], true, 'p' + explore.page );

				item.tags[0]	= 'work';
				item.tags[1]	= subtag;

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveDPLA( result, renderObject ){

  //console.log( 'resolveDPLA: ', result );

  const source = 'dpla';

  if ( !valid( result.value[0] ) ){ // no results were found

    datasources[ source ].done = true;

  }
  else if ( result.value[0] === 'done' ){ // done fetching results

    datasources[ source ].done = true;

  }
  else {

    renderObject[ source ] = { data : result };

  }

}

function renderMarkDPLA( inputs, source, q_, show_raw_results, id ){

  // TODO

}



