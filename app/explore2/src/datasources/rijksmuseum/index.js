'use strict';

function autocompleteRijksmuseum( results, dataset ){

  const source = 'rijksmuseum';

  let list = [];

  if ( valid( results.count > 0 ) ){

    $.each( results.artObjects, function( i, item ){

      let title = item.title;

      dataset.push( title );

    })

  }

}

function processResultsRijksmuseum( topicResults, struct, index ){

  const source = 'rijksmuseum';

  //console.log( 'processRijksmuseumResults: ', topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.artObjects ) ){

      resolve( [ [], [] ] );

      datasources[ source ].done = true;

    }
    else if ( topicResults.artObjects.length === 0 ){

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

      $.each( topicResults.artObjects, function( i, obj ){

        //console.log( obj );

        // URL vars
        let gid           = valid( obj.objectNumber )? obj.objectNumber : '';

        const url         = eval(`\`${ datasources[ source ].display_url  }\``);

        let title         = valid( obj.title )? obj.title : gid;

        let description   = valid( obj.longTitle )? obj.longTitle : '';
        let subtag        = 'image';

        let author        = valid( obj.principalOrFirstMaker )? obj.principalOrFirstMaker : '';

        let start_date    = '';

        const license_link= '';
        let license_name  = '';

        let img           = '';
        let thumb         = ''; // valid( obj.headerImage )? obj.headerImage.url : '';

        if ( valid( obj.webImage ) ){

          if ( valid( obj.webImage.url ) ){

            img   = obj.webImage.url;
            thumb = obj.webImage.url;

          }

        }

				// TODO: abstract this away into a utility function?
				const description_plain = description;
				const keywords_regex 		= new RegExp( getSearchTerm(), 'gi');
				description       			= description.replace( keywords_regex, '<span class="highlight">' + getSearchTerm() + '</span>' );

        // fill fields
				let item = {
          source:       source,
					title:        title,
					description:  ' ' + description + '<br/></br>' + author, // `<details class="plain" style="line-height: 100% !important; list-style: none; font-weight: normal;"><summary>license</summary><p>${license_name}</p></details>` + ' ',
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

function resolveRijksmuseum( result, renderObject ){

  //console.log( 'resolveRijksmuseum: ', result );

  const source = 'rijksmuseum';

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

function renderMarkRijksmuseum( inputs, source, q_, show_raw_results, id ){

  // TODO

}
