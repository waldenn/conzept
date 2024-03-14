'use strict';

function autocompleteEuropeana( results, dataset ){

  //console.log( results );

  const source = 'europeana';

  let list = [];

  if ( valid( results.total > 0 ) ){

    $.each( results.items, function( i, item ){

      let title = '';

      if ( valid( item.prefLabel[ explore.language ] ) ){ // requested language

        title = item.prefLabel[ explore.language ];

      }
      else if ( valid( item.prefLabel[ 'def' ] ) ){ // 1st fallback language

        title = item.prefLabel[ 'def' ];

      }
      else if ( valid( item.prefLabel[ 'en' ] ) ){ // 2nd fallback language

        title = item.prefLabel[ 'en' ];

      }

      dataset.push( title );

    })

  }

}

function processResultsEuropeana( topicResults, struct, index ){

  const source = 'europeana';

  //console.log( 'processEuropeanaResults: ', topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.items ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.items.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.totalResults / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.totalResults;

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

      $.each( topicResults.items, function( i, obj ){

        // URL vars
        const gid         = obj.id;
        let qid       		= '';
        const language    = explore.language;

        const url         = eval(`\`${ datasources[ source ].display_url  }\``);

        let title       = '';
        let description = '';
        let subtag      = '';

        const start_date  = valid( obj.year )? obj.year[0] : '';

        const license_link = valid( obj.rights )? obj.rights[0] : '';

        let license_name   = '';

        if ( valid( obj.edmConcept ) ){

					// TODO: show these concept URLs  (use as a list of "ID" links?)

					//$.each( obj.edmConcept, function( i, id_url ){ related_concept_urls.push( id_url ); });

				}

        if ( valid( obj.type ) ){

          if ( obj.type === 'TEXT' ){ subtag = 'written-work' }
          else if ( obj.type === 'SOUND' ){ subtag = 'music' }
          else if ( obj.type === 'VIDEO' ){ subtag = 'film' }
          else if ( obj.type === 'IMAGE' ){ subtag = 'image' }
          else if ( obj.type === '3D' ){ subtag = '3d-model' }
          else { obj.type = 'unkown type'; console.log( 'TODO: new europeana.org type: ', obj.type ); }

        }

        if ( valid( obj.dcTitleLangAware ) ){

          if ( valid( obj.dcTitleLangAware[ explore.language ] ) ){ // requested language

            title = obj.dcTitleLangAware[ explore.language ][0];

          }
          else if ( valid( obj.dcTitleLangAware[ 'def' ] ) ){ // 1st fallback language

            title = obj.dcTitleLangAware[ 'def' ][0];

          }
          else if ( valid( obj.dcTitleLangAware[ 'en' ] ) ){ // 2nd fallback language

            title = obj.dcTitleLangAware[ 'en' ][0];

          }
          else if ( valid( Object.keys( obj.dcTitleLangAware ).length > 0 ) ){ // final fallback language (non-requested language)

            title = obj.dcTitleLangAware[ Object.keys( obj.dcTitleLangAware )[0] ][0];

          }

        }

        if ( ! valid( title ) ){ // still no title set

          if ( valid( obj.title ) ){ // use another fallback title

            if ( Array.isArray( obj.title ) ){

              title = obj.title[0].toString();

            }

          }

        }

        if ( valid( obj.dcDescriptionLangAware ) ){

          if ( valid( obj.dcDescriptionLangAware[ explore.language ] ) ){ // requested language

            description = obj.dcDescriptionLangAware[ explore.language ][0];

          }
          else if ( valid( obj.dcDescriptionLangAware[ 'def' ] ) ){ // 1st fallback language

            description = obj.dcDescriptionLangAware[ 'def' ][0];

          }
          else if ( valid( obj.dcDescriptionLangAware[ 'en' ] ) ){ // 2nd fallback language

            description = obj.dcDescriptionLangAware[ 'en' ][0];

          }
          else if ( valid( Object.keys( obj.dcDescriptionLangAware ).length > 0 ) ){ // final fallback language (a non-requested language)

            description = obj.dcDescriptionLangAware[ Object.keys( obj.dcDescriptionLangAware )[0] ][0];

          }

        }
        else {

          if ( valid( obj.dcDescription ) ){ // another fallback description

            description = obj.dcDescription.join(', ');

          }

        }

        if ( description.length > 300 ){

          description = description.substring(0, 300) + ' (...)';

        }

        // TODO: create an utility function for this text-cleaning
        // clean some text values
        title = title.replace( /[`']/g , '"');
        description = description.replace( /[`']/g, '"');

				// TODO: abstract this away into a utility function?
				const description_plain = description;
				const keywords_regex 		= new RegExp( getSearchTerm(), 'gi');
				description       			= description.replace( keywords_regex, '<span class="highlight">' + getSearchTerm() + '</span>' );

        if ( valid( obj.dataProvider ) ){

          description += ' - ' + obj.dataProvider.join(', ');

        }

        // fill fields
				let item = {
          source:       source,
					title:        title,
					description:  description,
					gid:          obj.id,
					display_url:  url,
					thumb:        valid( obj.edmPreview )? obj.edmPreview[0] : '',
          start_date:   start_date,
					qid:          '',
          countries:    [],
          tags:         [],
					// TODO: add fields: license link + license name
				};

        let country_qids = [];

        if ( valid( obj.country ) ){

          $.each( obj.country, function( i, c ){ // for each country name

            //console.log( typeof c );

            Object.keys(countries).forEach( (qid) => { // find its qid

              if ( countries[ qid ].name.toLowerCase() === c.toLowerCase() ){ // found a match

                //console.log( c, qid );
                country_qids.push( qid );

              };

            });

          });

        }

        addItemCountries( item, country_qids, false );

        if ( valid( obj.edmIsShownAt ) ){
          item.web_url = obj.edmIsShownAt[0];
        }
        
				if ( obj.type === 'IMAGE' && valid( obj.edmIsShownBy ) ){

					//console.log( obj.edmIsShownBy );

					const img = obj.edmIsShownBy[0];

					// create IIIF-viewer-link
					let coll = { "images": [ ]};

          let source_name = datasources[ item.source ].name;

					coll.images.push( [ img, item.title, encodeURIComponent( description_plain + '<br/><br/>License: ' + license_link ), 'author: ...', 'source: ' + source_name ] );

					if ( coll.images.length > 0 ){ // we found some images

						// create an IIIF image-collection file
						let iiif_manifest_link = '/app/response/iiif-manifest.php?l=en&single=true&t=' + encodeURIComponent( item.title ) + '&json=' + JSON.stringify( coll );

						let iiif_viewer_url = `https://${explore.host}${explore.base}/app/iiif/dist/uv.html#?c=&m=&s=&cv=&manifest=${ encodeURIComponent( iiif_manifest_link ) }`;

						//console.log( img );
						//console.log( iiif_viewer_url );

						item.iiif = iiif_viewer_url;

					}

				}
				else if ( obj.type === 'SOUND' && valid( obj.edmIsShownBy ) ){

					console.log( obj.edmIsShownBy );

					item.audio_link = obj.edmIsShownBy[0].replace('http://','https://');

        }
				else if ( obj.type === '3D' && valid( obj.edmIsShownBy ) ){

					//console.log( obj.edmIsShownAt );
					item.model_view_url = obj.edmIsShownAt[0];

        }

        if ( valid( obj.edmPlaceLatitude ) ){
          item.lat = obj.edmPlaceLatitude[0].toString();
        }

        if ( valid( obj.edmPlaceLongitude ) ){
          item.lon = obj.edmPlaceLongitude[0].toString();
        }

				item.tags[0]	= 'work';
				item.tags[1]	= subtag;

        // FIXME: https://conze.pt/explore/Die%20Bach%20Kantate?l=en&t=string&d=europeana&s=true# fails in the setWikidata() call, why?
				setWikidata( item, [ ], true, 'p' + explore.page );

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveEuropeana( result, renderObject ){

  const source = 'europeana';

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

function renderMarkEuropeana( inputs, source, q_, show_raw_results, id ){

  // TODO

}
