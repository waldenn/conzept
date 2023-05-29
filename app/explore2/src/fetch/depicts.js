async function fetchDepicts( args, total_results, page, sortby, qid_ ){

  const fname = 'fetchDepicts';

  args = unpackString( args );

  let qid = '';

  if ( valid( qid_ ) ){

    qid = qid_ 

  }
  else {

    qid = args.qid;

  }

  let page_size = 20;
  let offset    = 0;

  if ( total_results === null ){ // first request

    page = 1;

  }
  else { // fetch more if needed

    offset = ( page - 1 ) * page_size;

  }

  let keyword = encodeURIComponent( quoteTitle( args.topic ) );

  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    '%3Fdate'             : 'oldest first',
    'DESC(%3Fdate)'       : 'newest first',
    '%3FitemLabel'        : 'title (ascending)',
    'DESC(%3FitemLabel)'  : 'title (descending)',
    '%3Fauthor'           : 'author',
  };

  $.each( Object.keys( sort_types ), function ( i, type ) {

    let selected = '';

    if ( sortby === type ){

      selected = 'selected';

    }

    sort_select_options += '<option value="' + type + '" ' + selected + '>' + sort_types[ type ] + '</option>';

  });
  
  sort_select = '<label for="sortby" title="sort by"><i class="fa-solid fa-sort"></i></label><select name="sortby" class="sortby browser-default" title="sort by" onchange="' + fname + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, null, 1, this.value );" data-title="' + args.title + '">' + sort_select_options + '</select>';

  const search_url = 'https://query.wikidata.org/sparql?format=json&query=SELECT%20distinct%20%3Fitem%20%3FitemLabel%20%3Fcoord%20(GROUP_CONCAT(distinct%20%3FcreatorLabel%3B%20separator%3D%22%20-%20%22)%20as%20%3Fauthor)%0A(GROUP_CONCAT(distinct%20STR(%3FcollLabel)%3B%20separator%3D%22%20-%20%22)%20as%20%3Fcollection)%20(SAMPLE(year(%3Fd))as%20%3Fdate)(SAMPLE(%3Fimage)%20as%20%3Fimage)%20%0AWHERE%7B%0A%20%3Fitem%20wdt%3AP180%2Fwdt%3AP279*%20wd%3AQ' + qid + '%20.%0A%20%3Fitem%20p%3AP180%20%3FDeclarationDepeint.%0A%20%3FDeclarationDepeint%20ps%3AP180%2Fwdt%3AP279*%20wd%3AQ' + qid + '.%0A%20OPTIONAL%7B%3FDeclarationDepeint%20pq%3AP2677%20%3Fcoord.%7D%0A%20%3Fitem%20wdt%3AP18%20%3Fimage.%0A%20OPTIONAL%7B%3Fitem%20wdt%3AP571%20%3Fd_crea.%7D%0A%20OPTIONAL%7B%3Fitem%20wdt%3AP577%20%3Fd_publi.%7D%0A%20BIND(COALESCE(%3Fd_crea%2C%20%3Fd_publi)%20AS%20%3Fd)%0A%20OPTIONAL%7B%3Fitem%20wdt%3AP170%20%3Fcreator.%7D%0A%20OPTIONAL%7B%3Fitem%20wdt%3AP195%20%3Fcoll.%7D%0A%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%2Cen%22.%0A%20%20%3Fitem%20rdfs%3Alabel%20%3FitemLabel.%0A%20%20%3Fcreator%20rdfs%3Alabel%20%3FcreatorLabel.%0A%20%20%3Fcoll%20rdfs%3Alabel%20%3FcollLabel.%0A%20%7D%0A%7D%0AGROUP%20BY%20%3Fitem%20%3FitemLabel%20%3Fcoord%20%0AORDER%20BY%20' + sortby + '%0ALIMIT%20' + page_size + '%0AOFFSET%20' + offset + '%0A';

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.results.bindings || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1; // no more results
				}
        else if ( json.length === 0 ) { // no more results

          $( '.mv-loader.' + args.id ).remove();

          return 0;

        }

        //console.log( json );

				$.each( json, function ( i, v ) {

          let qid   = '';
          let label = '';
					let img   = '';
					let thumb = '';
					let url   = '';
					let date  = '';
					let desc  = '';
					let subtitle = '';
					let subtitle2 = '';
					let author= '';
					let desc_plain  = '';
					let title_link = '';

          if ( v.item?.value ){

            qid = v.item.value.replace('http://www.wikidata.org/entity/', '');

          }

          if ( v.itemLabel ){

            label  = v.itemLabel.value.replace(/['"\[\]]+/gm, ' ');

          }

          // TODO add author-array from "contributor"
          if ( v.author ){

            let name    = v.author.value;
            author      = v.author.value; // used in IIIF field
            author_name = encodeURIComponent( name ); 

            let author_url  = encodeURIComponent( '/app/wikipedia/?t=' + author_name + '&l=' + explore.language + '&voice=' + explore.voice_code );

            subtitle2 += encodeURIComponent(
              '<div class="mv-extra-desc">' +
                '<a href="javascript:void(0)" class="mv-extra-icon" title="explore author" aria-label="explore author"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author_name, qid: '', language : explore.language } ) ) + '"><span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
                '<a href="javascript:void(0)" class="mv-extra-icon" title="author works" aria-label="author works"' + setOnClick( Object.assign({}, args, { type: 'link', title: author_name, url: author_url, qid: '', language : explore.language } ) ) + '">' + name + '</a>' +
              '</div>' );

          }

          // TODO handle group-image items also: https:/static/images/original-format/group-of-images.png

          //if ( v.item?.summary ){
          //  desc_plain = encodeURIComponent( v.item.summary );
          //}

          if ( v.date ){

            subtitle = '<details class="inline-abstract"><summary><small><i class="fa-solid fa-ellipsis-h"></i></small></summary>' + encodeURIComponent( v.date.value.replace(/[\[\]]/g, '') ) + '</details>';
            //subtitle = '<div class="mv-extra-desc">' + encodeURIComponent( v.date.value.replace(/[\[\]]/g, '') ) + '</div>';

            desc_plain = v.date.value.replace(/[\[\]]/g, '');

          }

          if ( v.image ){

            img = v.image.value;

            let coord = '';

            if ( v.coord ){

              coord = v.coord.value;

              thumb = img.replace('http://commons.wikimedia.org/wiki/Special:FilePath/', '');
              thumb = 'https://tools.wmflabs.org/zoomviewer/proxy.php?iiif=' + thumb + '/' + coord + '/full/0/default.jpg';

            }
            else {

              thumb = img.replace('http://commons.wikimedia.org/wiki/Special:FilePath/', 'https://'+ explore.language + '.wikipedia.org/wiki/' + explore.language + ':Special:Filepath/') + '?width=350';
              //console.log( thumb );

            }

            // TODO add annotation-box
            // https://www.youtube.com/watch?v=gFNWWIe5QpM
            //  https://iiif.github.io/training/iiif-5-day-workshop/day-three/annotations-and-annotation-lists.html
            //
            // https://ncsu-libraries.github.io/annona/imageviewer/
            //  single annotation:  https://ncsu-libraries.github.io/annona/webannotations/annotation1.json
            //  multiple annotions: http://sas.gdmrdigital.com/annotation/list/b5b0eaf2a2cee5ff1ab156b88b0c9a26.json
            // https://preview.iiif.io/api/content-state-0.3/api/cookbook/segment-image-part/

            //console.log(thumb);

            // create IIIF-viewer-link
            let coll = { "images": [ ]};

            coll.images.push( [ img, encodeURIComponent( label ), desc_plain, author, 'wikiCommons' ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

            if ( coll.images.length > 0 ){ // we found some images

              // create an IIIF image-collection file
              // TOFIX: see "goat" depicts (7th  result"Farm scene, Wales?" needs a "?" fix in the PHP code.
              let iiif_manifest_link = '/app/response/iiif-manifest?l=en&single=true&t=' + encodeURIComponent( label ) + '&json=' + JSON.stringify( coll );

              let iiif_viewer_url = '/app/iiif/#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

              url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

            }

          }

          obj[ 'label-' + i ] = {

            title_link : encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'wikipedia-qid', qid: qid, title: label } ) ) + '>' + label + '</a>' ),

            thumb_link: encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic"' + setOnClick( Object.assign({}, args, { type: 'link', url: JSON.parse( decodeURI( url ) ), title: args.topic } ) ) + '><div class="mv-thumb"><img class="thumbnail" src="' + img + '" alt="" loading="lazy"></div></a>' ),

            explore_link:         encodeURIComponent( getExploreLink( args, label, qid ) ),
            video_link:           encodeURIComponent( getVideoLink( args, label ) ),
            wander_link:          encodeURIComponent( getWanderLink( args, label ) ),
            images_link:          encodeURIComponent( getImagesLink( args, label, qid ) ),
            books_link:           encodeURIComponent( getBooksLink( args, label ) ),
            websearch_link:       encodeURIComponent( getWebsearchLink( args, label ) ),
            compare_link:         '',
            website_link:         '',
            custom_links:         '',
            raw_html:             '',
            mv_buttons_style:			'display:none;',

          };

				});

        let total_results = 0;

        let meta = {

          source        : 'wikiCommons',
          link          : 'https://commons.wikimedia.org/w/index.php?sort=last_edit_desc&search=haswbstatement%3AP180%3DQ' + qid + '&title=Special:Search&profile=advanced&fulltext=1&advancedSearch-current=%7B%7D&ns0=1&ns6=1&ns12=1&ns14=1&ns100=1&ns106=1',
          results_shown : Object.keys( obj ).length, 
          total_results : Object.keys( obj ).length,
          page          : page,
          call          : fname,
          sortby        : sortby,
          sort_select   : sort_select,
          qid           : qid,
        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError) {

				console.log( 'response: hmm...', thrownError );

      }

	});

}
