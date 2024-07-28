'use strict';

function autocompleteLoC( results, dataset ){

  const source = 'loc';

  let list = [];

  if ( valid( results?.results ) ){

    $.each( results.results, function( i, item ){

      let title = item.title;

      dataset.push( title );

    })

  }

}

function processResultsLoC( topicResults, struct, index ){

  const source = 'loc';

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.results ) ){

      resolve( [ [], [] ] );

      datasources[ source ].done = true;

    }
    else if ( topicResults.results.length === 0 ){

      resolve( [ [], [] ] );

      datasources[ source ].done = true;

    }
    else if ( ( Math.max( Math.ceil( topicResults.search.hits / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

      datasources[ source ].done = true;

    }
    else {

      datasources[ source ].total = topicResults.search.hits;

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

      $.each( topicResults.results, function( i, obj ){

        // URL vars
        let gid           = valid( obj.id )? obj.id : '';

        let url     	 		= valid( obj.url )? obj.url : ''; // eval(`\`${ datasources[ source ].display_url  }\``);

        let audio_link        = '';
        let video_link        = '';

        let doc_url           = '';
        let document_language = 'en'; // default

        let used_languages = [];

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

        let document_voice_code = explore.voice_code_selected.startsWith( document_language )? explore.voice_code_selected : 'en';
        let tts_link     	= '';
        let pdf_link     	= '';

        let title         = valid( obj.title )? obj.title : '---';

        let description   = valid( obj?.description )? obj.description[0] : '';

        if ( !valid( description ) ){

          description   = valid( obj?.item?.summary )? obj.item.summary : '';

        }

        let maintag       = 'work';
        let subtag        = '';

        if ( valid( obj.original_format ) ){

          //console.log( obj.original_format );

          if ( obj.original_format.includes('book') ){ subtag = 'book' }
          else if ( obj.original_format.includes('film, video') ){ subtag = 'film' }
          else if ( obj.original_format.includes('sound recording') ){ subtag = 'audio' }
          else if ( obj.original_format.includes('media') ){ subtag = 'audio' }
          else if ( obj.original_format.includes('map') ){ subtag = 'map' }
          else if ( obj.original_format.includes('web page') ){ subtag = 'webpage' }
          else if ( obj.original_format.includes('periodical') ){ subtag = 'periodical' }
          else if ( obj.original_format.includes('newspaper') ){ subtag = 'newspaper' }
          else if ( obj.original_format.includes('photo, print, drawing') ){ subtag = 'image' }
          //TODO: handle multiple images as IIIF: else if ( obj.original_format.includes('manuscript/mixed material') ){ subtag = 'image' }
          else if ( obj.original_format.includes('legislation') ){ subtag = 'legislation' } // TODO
          else if ( obj.original_format.includes('web archive') ){ subtag = 'archive' } // TODO
          else {
            console.log('tag missing for this original format: ', obj.original_format );
          }

        }

        // TODO:
        //  - check "obj.online_format" array
        //    - image --> IIIF viewable image
        //    - ...
        //  - set displayable URL

        let author        = '';

        let start_date    = valid( obj.timestamp ) ? obj.timestamp.split('-')[0] : '';

        let license_link  = '';
        let license_name  = '';

        let img           = '';
        let thumb         = '';

        if ( obj.image_url ){

          if ( Array.isArray( obj.image_url ) && obj.image_url.length > 0 ){

            thumb = obj.image_url.pop().split("#")[0];

            // TODO: image not working in IIIF, why?
            img   = obj.image_url.at(-1);
            //console.log( 'HQ image: ', img );

          }
          else { // no image found

            return 0;

          }

        }

        if ( !valid( obj.access_restricted ) && valid( obj.digitized ) ){ // some media is avaiable

          if ( valid( obj.resources ) ){

           let media_found = false;

            $.each( Object.keys( obj.resources[0] ), function( k, resource_key ){

              //console.log( obj.resources[0] );

              if ( resource_key === 'pdf' ){

								if ( valid( obj.resources[0]?.pdf ) ){

									url         = obj.resources[0].pdf;
									tts_link    = url;
									pdf_link    = url;
									media_found = true;
                  subtag      = 'book';

                  //console.log( url );

								}

              }
              else if ( resource_key === 'video' ){

                if ( valid( obj.resources[0]?.video ) ){

                  url         = obj.resources[0].video;
                  video_link  = url;
                  media_found = true;
                  subtag      = 'film';

                }

              }
              else if ( resource_key === 'audio' ){

                if ( valid( obj.resources[0]?.audio ) ){

                  url         = `${explore.base}/app/audio/?url=${ encodeURIComponent( "/app/cors/raw/?url=" + obj.resources[0].audio )}`;
                  audio_link  = obj.resources[0].audio;
                  media_found = true;
                  subtag      = 'audio';

                }

              }
              else if ( resource_key === 'media' ){

                if ( valid( obj.resources[0]?.media ) ){

                  url = `${explore.base}/app/audio/?url=${ encodeURIComponent( "/app/cors/raw/?url=" + obj.resources[0].media )}`;

                  audio_link  = obj.resources[0].media;
                  media_found = true;
                  subtag  = 'audio';

                }

              }
              else if ( resource_key === 'files' ){

								if ( valid( obj.resources[0]?.media ) ){

                  // FIXME: check file suffix: .mp3, .mp4, etc.!

                  url = `${explore.base}/app/audio/?url=${ encodeURIComponent( "/app/cors/raw/?url=" + obj.resources[0].media )}`;

                  audio_link  = obj.resources[0].media;
									media_found = true;
									subtag	= 'audio';

								}

              }
              else if ( resource_key === 'image' ){

								if ( valid( obj.resources[0]?.image ) ){

									media_found = true;
									subtag	= 'image';

								}

              }

            });

						if ( !valid( media_found ) ) {

							console.log( 'no media used: ', obj.resources[0] );

						}

          }

        }

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
					gid:          url, // gid,
					display_url:  url,
          audio_link:   audio_link,
          video_link:   video_link,
					thumb:        thumb,
          start_date:   start_date,

          document_language:    document_language,
          document_voice_code:  document_voice_code,
          pdf_tts_link: tts_link,
          pdf_link:     pdf_link,

					qid:          '',
          countries:    [],
          tags:         [],
          web_url:      url,
					// TODO: add fields: license link + license name
				};

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
              item.gid          = encodeURIComponent( iiif_viewer_url );
            }

          }

        }

        setWikidata( item, [ ], true, 'p' + explore.page );

				item.tags[0]	= 'work';
				item.tags[1]	= subtag;

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveLoC( result, renderObject ){

  //console.log( 'resolveLoC: ', result );

  const source = 'loc';

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

function renderMarkLoC( inputs, source, q_, show_raw_results, id ){

  // TODO

}

