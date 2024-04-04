'use strict';

function autocompleteOCCRP( results, dataset ){

  const source = 'occrp';

  let list = [];

  //console.log( results );

  if ( valid( results.total > 0 ) ){

    $.each( results.results, function( i, item ){

      let title = '';

      if ( valid( item?.properties?.name ) ){ // name

        if ( Array.isArray( item.properties.name ) ){ // name list

          title = stripHtml( item.properties.name[0] );

        }
        else { // name string

          title = stripHtml( item.properties.name );

        }

      }
      else if ( !valid( item?.properties?.alias ) ){ // alias

        if ( Array.isArray( item.properties.alias ) ){ // alias list

          title = stripHtml( item.properties.alias[0] );

        }
        else { // alias string

          title = stripHtml( item.properties.alias );

        }

      }

      if ( title ){

        dataset.push( title );

      }

    })

  }

}

function processResultsOCCRP( topicResults, struct, index ){

  const source = 'occrp';

  return new Promise(( resolve, reject ) => {

    //console.log( topicResults );

    if ( !valid( topicResults.results ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.results.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.total / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

    }
    else {

      datasources[ source ].total = topicResults.total;

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
        let gid           = '';
        let qid           = '';

        let start_date    = '';
        let title         = '';
        let url           = '';
        let desc          = '';
        let creators      = [];
        let concepts      = [];
        let maintag       = '';
        let subtag        = '';
        let img           = '';

        if ( valid( obj.id ) ){

            gid = obj.id;
            url = `https://aleph.occrp.org/entities/${obj.id}`;

        }

        if ( valid( obj.schema ) ){

          if ( Array.isArray( obj.schema ) ){

            console.log( 'TODO: handle this OCCRP list type: ', obj.schema );

          }
          else {

            if ( obj.schema.toLowerCase() === 'person' ){
              maintag = 'person';
            }
            else if ( obj.schema.toLowerCase() === 'company' ){
              maintag = 'organization';
              subtag = 'company';
            }
            else if ( obj.schema.toLowerCase() === 'organization' ){
              maintag = 'organization';
            }
            else if ( obj.schema.toLowerCase() === 'address' ){
              maintag = 'cultural-concept';
              subtag  = 'address';
            }
            else if (
              obj.schema.toLowerCase() === 'document' ||
              obj.schema.toLowerCase() === 'note' ||
              obj.schema.toLowerCase() === 'assessment'
            ){
              maintag = 'work';
              subtag  = 'document';
            }
            else {
              console.log( 'TODO: handle this OCCRP type: ', obj.schema );
            }

          }

        }

        if ( valid( obj?.properties?.name ) ){ // name

          if ( Array.isArray( obj.properties.name ) ){

            title = stripHtml( obj.properties.name[0] );

          }
          else {

            title = stripHtml( obj.properties.name );

          }

        }
        else if ( !valid( obj?.properties?.alias ) ){ // alias

          if ( Array.isArray( obj.properties.alias ) ){

            title = stripHtml( obj.properties.alias[0] );

          }
          else {

            title = stripHtml( obj.properties.alias );

          }

        }
        else {

          title = '---';

        }

        if ( valid( obj?.collection?.created_at ) ){

          start_date = obj.collection.created_at.split('-')[0];

        }

        if ( valid( obj?.collection?.label ) ){

            desc += obj.collection.label;

        }

        let country_qids = [];

        if ( valid( obj?.collection?.countries ) ){

					obj.collection.countries.forEach( ( iso ) => {

						Object.keys( countries ).forEach( ( qid ) => {

							if ( countries[ qid ].iso2 === iso.toUpperCase() ){

								country_qids.push( qid );

							};

						});

					});

        }

        // fill fields
				let item = {
          source:       source,
					title:        title,
					description:  desc,
					gid:          gid,
          web_url:      url,
					display_url:  '', // not viewable, due to CORS restriction
					thumb:        '',
          start_date:   start_date,
					qid:          '',
          countries:    [],
          tags:         [],
				};

       	addItemCountries( item, country_qids, false );

				setWikidata( item, [ ], true, 'p' + explore.page );

				item.tags[0]	= maintag;
				item.tags[1]	= subtag;

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveOCCRP( result, renderObject ){

  const source = 'occrp';

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

function renderMarkOCCRP( inputs, source, q_, show_raw_results, id ){

  // TODO

}
