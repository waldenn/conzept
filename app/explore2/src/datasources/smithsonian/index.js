'use strict';

function autocompleteSmithsonian( results, dataset ){

  const source = 'smithsonian';

  let list = [];

  //console.log( results.response );

  if ( valid( results?.response?.rowCount > 0 ) ){

    $.each( results.response.rows, function( i, item ){

      if ( valid( item.title ) ){

        dataset.push( item.title );

      }

    })

  }

}

function processResultsSmithsonian( topicResults, struct, index ){

  const source = 'smithsonian';

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults?.response?.rows ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.response.rows.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.response.rowCount / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.response.rowCount;

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

      $.each( topicResults.response.rows, function( i, obj ){

        //console.log( obj );

        // URL vars
        const gid         = valid( obj.id )? obj.id : '';

				let display_url		= valid( obj.url )? 'https://www.si.edu/object/' + obj.url : '';

        const qid         = '';
        const language    = explore.language;
        const term 				= removebracesTitle( getSearchTerm() );

        let desc          = '';
        let physical_info = '';
        let start_date    = '';
        let thumb 	  = '';
        let img 	  = '';

        let topics  	  	= [];
        let authors  	  	= [];
        let library  	  	= [];
        let subtag        = '';
        let newtab        = false;

	let license_link  = '';
	let license_name  = '';

        const timestamp = valid( obj.timestamp )? obj.timestamp : ''; // Unix timestamp in seconds

        if ( valid( timestamp ) ){

          const milliseconds = timestamp * 1000; // convert timestamp to milliseconds
          const date = new Date(milliseconds); // create a Date object
          start_date = date.getFullYear(); // get the year

        }

        let title 		    = valid( obj.title )? obj.title : '---';

        let url           = '';

        if ( valid( obj?.content?.descriptiveNonRepeating ) ){

          if ( valid( obj.content.descriptiveNonRepeating?.data_source ) ){

            library = `<div><i class="fa-solid fa-building-columns"></i> ${ obj.content.descriptiveNonRepeating.data_source }</div>`;

          }

          if ( valid( obj.content.descriptiveNonRepeating?.guid ) ){

            url = obj.content.descriptiveNonRepeating.guid;

          }

          if ( valid( obj.content.descriptiveNonRepeating?.record_link ) ){

            url = obj.content.descriptiveNonRepeating.record_link;

          }

          if ( valid( obj.content.descriptiveNonRepeating?.online_media ) ){

		if ( valid( obj.content.descriptiveNonRepeating.online_media ) ){

			// TODO: handle multiple images
			// console.log( obj.content.descriptiveNonRepeating.online_media );

			if ( valid( obj.content.descriptiveNonRepeating.online_media.media[0]?.content ) ){
            			img   = obj.content.descriptiveNonRepeating.online_media.media[0].content;
				//console.log('image: ', img );
			}
			if ( valid( obj.content.descriptiveNonRepeating.online_media.media[0]?.thumbnail ) ){
            			thumb = obj.content.descriptiveNonRepeating.online_media.media[0].thumbnail;
				//console.log('thumb: ', thumb );

			}

		}

          }

        }

        if ( valid( obj?.content?.indexedStructured ) ){

          if ( valid( obj.content.indexedStructured?.object_type ) ){

            $.each( obj.content.indexedStructured.object_type, function( k, type ){

              //console.log( 'handle object type: ', type );

								if			( type === 'Pictorial works' ){ subtag = 'image'; }
								else if ( type === 'Books' ){ subtag = 'book'; }
								else {

									subtag = 'article';

								}

						});

					}

          if ( valid( obj?.content?.indexedStructured?.name ) ){

            $.each( obj.content.indexedStructured.name, function( l, name ){

						//console.log( name );
						if ( typeof name === 'object' ){
						  authors.push( '<i class="fa-solid fa-user-pen"></i> ' + name.content );
						}
						else {
						  authors.push( '<i class="fa-solid fa-user-pen"></i> ' + name );
						}

						});

          }

          if ( valid( obj.content.indexedStructured?.topic ) ){

            $.each( obj.content.indexedStructured.topic, function( j, topic ){

              topics.push( '<i class="fa-regular fa-circle-dot" title="topic"></i> ' + topic );

            });

          }

        }

        if ( valid( obj?.content?.freetext?.notes) ){

    			$.each( obj.content.freetext.notes, function( n, note ){

									if ( valid( note?.label === 'Summary' ) ){

										desc += `<div>${ note.content }</div>`;

									}
									else if ( valid( note?.label === 'Contents' ) ){

										desc += `<div>${ note.content }</div>`;

									}

					})

					if ( valid( obj.content?.freetext?.physicalDescription ) ){

						physical_info += `<div><i class="fa-solid fa-ruler-combined"></i> ${ obj.content?.freetext?.physicalDescription[0].content }</div>`;

					}

        }

        // maybe use:
        // topic 
        // date -> label -> content
        // physicalDescription -> [0] -> content

       	if ( desc.length > explore.text_limit ){

       		desc = desc.substring(0, explore.text_limit ) + ' (...)</br>';

       	}

        desc = highlightTerms( desc );

        //console.log( title, url, desc );

        // fill fields
				let item = {
          source:       source,
					title:        title,
					description:  `${ desc }<br/> ${ physical_info }<br/> <div>${ topics.join(', ' ) }</div><br/> <div>${ authors.join(', ') }</div><br/> ${library}`,
					gid:          display_url,
					display_url:  display_url, // url,
					web_url:      display_url, // url,
					thumb:        thumb,
          start_date:   start_date,
					qid:          '',
          countries:    [],
          tags:         [],
          //id:         id,
				};


				if ( valid( img ) ){

				  // create IIIF-viewer-link
				  let coll = { "images": [ ]};

				  let source_name = datasources[ item.source ].name;

				  coll.images.push( [ img, item.title, encodeURIComponent( 'description_plain' + '<br/><br/>License: ' + license_link + '<br/><br/>' + license_name ), 'author: ' + '-', 'source: ' + '-' ] );

				  if ( coll.images.length > 0 ){ // we found some images

				    // create an IIIF image-collection file
				    let iiif_manifest_link = '/app/response/iiif-manifest.php?l=en&single=true&t=' + encodeURIComponent( item.title ) + '&json=' + JSON.stringify( coll );

				    let iiif_viewer_url = `https://${explore.host}${explore.base}/app/iiif/dist/uv.html#?c=&m=&s=&cv=&manifest=${ encodeURIComponent( iiif_manifest_link ) }`;

				    item.iiif         = iiif_viewer_url;
				    //item.display_url  = encodeURIComponent( iiif_viewer_url );

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

function resolveSmithsonian( result, renderObject ){

  const source = 'smithsonian';

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

function renderMarkSmithsonian( inputs, source, q_, show_raw_results, id ){

  // TODO

}


