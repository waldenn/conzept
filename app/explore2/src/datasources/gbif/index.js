'use strict';

function autocompleteGBIF( results, dataset ){

  const source = 'gbif';

  let list = [];

  //console.log( results );

  if ( Array.isArray( results ) ){

    if ( valid( results.length > 0 ) ){

      $.each( results, function( i, item ){

        if ( valid( item.canonicalName ) ){ // TODO: check if "item.canonicalName" be an array?

          dataset.push( item.canonicalName );

        }

      })

    }

  }

}

function processResultsGBIF( topicResults, struct, index ){

  const source = 'gbif';

  //console.log( topicResults );

  return new Promise(( resolve, reject ) => {

    if ( !valid( topicResults.results ) ){

      resolve( [ [], [] ] );

    }
    else if ( topicResults.results.length === 0 ){

      resolve( [ [], [] ] );

    }
    else if ( ( Math.max( Math.ceil( topicResults.count / ( datasources[ source ].pagesize *  (explore.page - 1) ) ), 1) === 1 ) ){ // no more results

      resolve( [ [], [] ] );

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

      $.each( topicResults.results, function( i, obj ){

        // URL vars
        const gid         = obj.nubKey || obj.key || obj.speciesKey || ''; // obj.nameKey see also: https://discourse.gbif.org/t/understanding-gbif-taxonomic-keys-usagekey-taxonkey-specieskey/3045
        const qid         = '';
        const language    = explore.language;
        const term 				= removebracesTitle( getSearchTerm() );
        const start_date  = '';

        let title 		    = valid( obj.canonicalName )? obj.canonicalName : obj.scientificName;

        let url           = eval(`\`${ datasources[ source ].display_url  }\``);
        let desc          = '';
        let subtag        = '';
        let gbif_id       = '';
        let newtab        = false;

        let vernacular_name = '';

        if ( valid( obj.vernacularNames ) ){

          //console.log( obj.vernacularNames );

          $.each( obj.vernacularNames, function( i, v ){

            if ( v.language === explore.lang3 ){

              vernacular_name = v.vernacularName;

            }

          });

          if ( vernacular_name === '' ){ // still no name found

            $.each( obj.vernacularNames, function( i, v ){

              if ( v.language === 'eng' ){ // fallback to English

                vernacular_name = v.vernacularName;

              }

            });

          };

        }

        //console.log( 'vernacular_name: ', vernacular_name );

        if ( ! valid( title ) ){

          if ( valid( vernacular_name ) ){

            title = vernacular_name;

          }

        }
        //else {
        //  title = gid;
        //}

        // TODO: link to GBIF website
        // https://www.gbif.org/species/${obj.key}

        let parent_key    = valid( obj.parentKey )? obj.parentKey : '';
        let parent_name   = valid( obj.parent )? obj.parent : '';

        let kingdom       = valid( obj.kingdom )? toTitleCase( obj.kingdom ) : '';
        let phylum        = valid( obj.phylum )? toTitleCase( obj.phylum ) : '';
        let order         = valid( obj.order )? toTitleCase( obj.order ) : '';
        let family        = valid( obj.family )? toTitleCase( obj.family ) : '';
        let genus         = valid( obj.genus )? toTitleCase( obj.genus ) : '';
        let species       = valid( obj.species )? toTitleCase( obj.species ) : '';

        let phylo = [ kingdom, phylum, order, family, genus, species ];

        // description
        if ( valid( vernacular_name ) ){

          // TODO: make this clickable 'explore'-links (use some other field than the description, which is already its own linked-text)
          desc += vernacular_name + '<br/><br/>';

        }

        /*
        if ( valid( obj.numOccurrences ) ){

          //console.log( title, gid, obj.numOccurrences );

          //if ( obj.numOccurrences === 0 ){
            //url     = '/pages/blank.html';
            //url     = `https://www.gbif.org/occurrence/search?taxon_key=${gid}`;
            //gbif_id = '';
          //}

        }
        */

        // remove empty phylo's from list
        phylo = phylo.filter(function(e){ return e === 0 || e });

        $.each( phylo, function( i, p ){

            let phylo_url = `/app/wikipedia/?t=${encodeURIComponent( p )}&l=${explore.language}&voice=${explore.voice_code}`;

            // FIXME: the link does not work in openalex-in-presentation-mode
            phylo[ i ] = `<a onclick="openInFrame( &quot;${phylo_url}&quot; )" href="javascript:void(0)" title="phylo link" aria-label="phylo link" aria-role="button">${p}</a>`;

        });

        desc += phylo.join(' / ') + '<br><br>' + obj.key;

        // FIXME: this messes up the existing phylo-html-links
        //desc = highlightTerms( desc );

        // fill fields
				let item = {
          source:       source,
					title:        title,
					description:  desc, //  + '<br/><br/>' + creators.join(', '),
					gid:          url, // gid,
					display_url:  url,
					thumb:        '', // 'https://gbif.org/services/img/' + obj.identifier,
          start_date:   start_date,
					qid:          '',
          countries:    [],
          tags:         [],
          gbif_id:      gbif_id,
          web_url:      `https://www.gbif.org/occurrence/gallery?taxon_key=${gid}`, // `https://www.gbif.org/species/${gid}`,
				};

        // TODO: why does setting the tags here not work?
				//item.tags[0]	= 'organism';
				//item.tags[1]	= subtag;

				setWikidata( item, [ ], true, 'p' + explore.page );

				item.tags[0]	= 'organism';
				item.tags[1]	= subtag;

        result.source.data.query.search.push( item ); 

      });

      resolve( [ result ] );

    }

  });

}

function resolveGBIF( result, renderObject ){

  const source = 'gbif';

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

function renderMarkGBIF( inputs, source, q_, show_raw_results, id ){

  // TODO

}
