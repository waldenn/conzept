'use strict';

function autocompleteLoC( results, dataset ){

  console.log( results );

  const source = 'loc';

  let list = [];

  if ( valid( results?.results > 0 ) ){

    $.each( results.results, function( i, item ){

      let title = item.title;

      dataset.push( title );

    })

  }

}

function processResultsLoC( topicResults, struct, index ){

  const source = 'loc';

  console.log( 'processLoCResults: ', topicResults );

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

        console.log( obj );

        // URL vars
        let gid           = valid( obj.id )? obj.id : '';

        const url         = valid( obj.url )? obj.url : ''; // eval(`\`${ datasources[ source ].display_url  }\``);

        let title         = valid( obj.title )? obj.title : '---';

        let description   = valid( obj?.description[0] )? obj.description[0] : '';

        if ( !valid( description ) ){

          description   = valid( obj?.item?.summary )? obj.item.summary : '';

        }

        let maintag       = '';
        let subtag        = '';

        let author        = '';

        let start_date    = valid( obj.timestamp ) ? obj.timestamp.split('-')[0] : '';

        const license_link= '';
        let license_name  = '';

        let img           = '';
        let thumb         = '';

        if ( obj.image_url ){

          if ( Array.isArray( obj.image_url ) && obj.image_url.length > 0 ){

            thumb = obj.image_url.pop().split("#")[0];

          }
          else { // no image found

            return 0;

          }

        }

				//const description_plain = description;

				description       			= highlightTerms( description );

        // fill fields
				let item = {
          source:       source,
					title:        title,
					description:  ' ' + description + '<br/></br>' + author,
					gid:          gid,
					display_url:  url, // url may get overidden later
					thumb:        thumb,
          start_date:   start_date,
					qid:          '',
          countries:    [],
          tags:         [],
          web_url:      url,
					// TODO: add fields: license link + license name
				};

        /*
        if ( valid( img ) ){

					// create IIIF-viewer-link
					let coll = { "images": [ ]};

          let source_name = datasources[ item.source ].name;

					coll.images.push( [ img, item.title, encodeURIComponent( description_plain + '<br/><br/>License: ' + license_link + '<br/><br/>' + license_name ), 'author: ' + author, 'source: ' + source_name ] );

					if ( coll.images.length > 0 ){ // we found some images

						// create an IIIF image-collection file
						let iiif_manifest_link = '/app/response/iiif-manifest.php?l=en&single=true&t=' + encodeURIComponent( item.title ) + '&json=' + JSON.stringify( coll );

						let iiif_viewer_url = `https://${explore.host}${explore.base}/app/iiif/dist/uv.html#?c=&m=&s=&cv=&manifest=${ encodeURIComponent( iiif_manifest_link ) }`;

						item.iiif         = iiif_viewer_url;
						item.display_url  = encodeURIComponent( iiif_viewer_url );

					}

				}
        */

				item.tags[0]	= 'work';
				item.tags[1]	= subtag;

				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

        //console.log( item );

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
