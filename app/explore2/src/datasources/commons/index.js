'use strict';

function autocompleteCommons( results, dataset ){

  //console.log( results );

  const source = 'commons';

  console.log( source, ' autocomplete not implemented');

  /*
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
  */

}

function processResultsCommons( topicResults, struct, index ){

  const source = 'commons';

  //console.log( 'processCommonsResults: ', topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults['__main__'] ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults['__main__'].result?.hits?.hits?.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults['__main__'].result.hits.total.value / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults['__main__'].result.hits.total.value;

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

      $.each( topicResults['__main__'].result.hits.hits, function( i, obj ){

        //console.log( obj );

        // URL vars
        const gid         = '';
        let qid       		= explore.q_qid;
        const language    = explore.language;

        let file          = valid( obj._source.title )? obj._source.title : '';
        file              = file.replace(/ /g, '_' );

        //console.log( file );

        let url       		= eval(`\`${ datasources[ source ].display_url  }\``);

        let title         = valid( obj._source.title )? obj._source.title : '';
        title             = title.split('.').slice(0, -1).join('.');

        let file_suffix   = valid( file )? file.split('.').pop() : '';

        let description   = '';
        let subtag        = 'image';

        let start_date    = valid( obj._source.timestamp )? obj._source.timestamp : '';
        start_date        = start_date.split('-')[0];

        const license_link= '';
        let license_name  = valid( obj.highlight.text )? obj.highlight.text[0] : '';

        let img           = '';
        let thumb         = '';

        if ( valid( obj._source.title ) ){

          let base_img  = `https://commons.wikimedia.org/wiki/Special:FilePath/${ encodeURIComponent( obj._source.title.replace(/ /g, '_' ) ) }`;
          img           = base_img + '?width=2000px';
          thumb         = base_img + '?width=300px';

          //console.log( thumb );

        }

        //console.log( thumb );
        //console.log( file_suffix );

				// http://commons.wikimedia.org/wiki/Special:FilePath/PogledNaZid.pdf?width=300px

        if ( valid( file_suffix ) ){

          if ( file_suffix === 'pdf' || file_suffix === 'djvu' ){

            subtag = 'written-work';

						//console.log( 'http://commons.wikimedia.org/wiki/Special:FilePath/' + file );

						url =  'http://commons.wikimedia.org/wiki/Special:FilePath/' + file;

          }
          else if (
						file_suffix === 'ogg'		||
						file_suffix === 'opus'		||
						file_suffix === 'flac'	||
						file_suffix === 'mp3'		||
						file_suffix === 'midi'  ||
						file_suffix === 'wav'
						){

            subtag = 'music';

						url =  'http://commons.wikimedia.org/wiki/Special:FilePath/' + file;

						console.log( url );

          }
          else if ( file_suffix === 'ogv' || file_suffix === 'webm' ){

            subtag = 'film'

						url =  'http://commons.wikimedia.org/wiki/Special:FilePath/' + file;

          }
          else { // default to image

            subtag = 'image';

						// image media already being handled

          }

        }

				// TODO: abstract this away into a utility function?
				const description_plain = description;
				description       			= highlightTerms( description );

        //if ( valid( obj.dataProvider ) ){
        //  description += ' - ' + obj.dataProvider.join(', ');
        //}

        // fill fields
				let item = {
          source:       source,
					title:        title,
					description:  ' ' + description, // `<details class="plain" style="line-height: 100% !important; list-style: none; font-weight: normal;"><summary>license</summary><p>${license_name}</p></details>` + ' ',
					gid:          url,
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

					coll.images.push( [ img, item.title, encodeURIComponent( description_plain + '<br/><br/>License: ' + license_link + '<br/><br/>' + license_name ), 'author: ...', 'source: ' + source_name ] );

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

        /*
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

function resolveCommons( result, renderObject ){

  const source = 'commons';

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

function renderMarkCommons( inputs, source, q_, show_raw_results, id ){

  // TODO

}

