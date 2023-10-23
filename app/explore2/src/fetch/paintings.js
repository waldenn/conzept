async function fetchPaintings( args, total_results, page, sortby ){

  const fname = 'fetchPaintings';

  args = unpackString( args );

  let keyword = args.topic;
  keyword			= removeCategoryFromTitle( keyword );

  //let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();

  keyword = encodeURIComponent( '"' + keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() + '"' ); // add some extra spaces to avoid the API error message: "phrase too short".

  if ( !args.qid.startsWith('Q') ){

			args.qid = 'Q' + args.qid; // add 'Q' to qid string

  }

  let sort_select         = '';
  let sort_select_options = '';
  let sort_types          = {
    'DESC(%3Fdate)'       : 'newest first',
    '%3Fdate'             : 'oldest first',
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

  let page_size = 20;
  let offset    = 0;

  if ( total_results === null ){ // first request

    page = 1;

  }
  else { // fetch more if needed

    offset = ( page - 1 ) * page_size;

  }

  const search_url = `https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3Fimage%20%3Fdate%20WHERE%20%7B%0A%20%20%7B%20%3Fitem%20wdt%3AP31%20wd%3AQ3305213.%20%7D%0A%20%20UNION%0A%20%20%7B%20%3Fitem%20wdt%3AP31%20wd%3AQ93184.%20%7D%0A%20%20UNION%0A%20%20%7B%20%3Fitem%20wdt%3AP31%20wd%3AQ11060274.%20%7D%0A%20%20UNION%0A%20%20%7B%20%3Fitem%20wdt%3AP31%20wd%3AQ15123870.%20%7D%0A%20%20%3Fitem%20wdt%3AP170%20wd%3A${args.qid}.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP18%20%3Fimage.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP571%20%3Fdate.%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${explore.language}%2Cen%2Cceb%2Csv%2Cde%2Cfr%2Cnl%2Cru%2Cit%2Ces%2Cpl%2Cwar%2Cvi%2Cja%2Czh%2Carz%2Car%2Cuk%2Cpt%2Cfa%2Cca%2Csr%2Cid%2Cno%2Cko%2Cfi%2Chu%2Ccs%2Csh%2Cro%2Cnan%2Ctr%2Ceu%2Cms%2Cce%2Ceo%2Che%2Chy%2Cbg%2Cda%2Cazb%2Csk%2Ckk%2Cmin%2Chr%2Cet%2Clt%2Cbe%2Cel%2Caz%2Csl%2Cgl%2Cur%2Cnn%2Cnb%2Chi%2Cka%2Cth%2Ctt%2Cuz%2Cla%2Ccy%2Cta%2Cvo%2Cmk%2Cast%2Clv%2Cyue%2Ctg%2Cbn%2Caf%2Cmg%2Coc%2Cbs%2Csq%2Cky%2Cnds%2Cnew%2Cbe-tarask%2Cml%2Cte%2Cbr%2Ctl%2Cvec%2Cpms%2Cmr%2Csu%2Cht%2Csw%2Clb%2Cjv%2Csco%2Cpnb%2Cba%2Cga%2Cszl%2Cis%2Cmy%2Cfy%2Ccv%2Clmo%2Cwuu%2Cbn%22.%20%7D%0A%7D%0AORDER%20BY%20${sortby}%0ALIMIT%20${page_size}%0AOFFSET%20${offset}`;

  //const search_url = 'https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20(SAMPLE(%3Fimage)%20AS%20%3Fimage)%20(SAMPLE(%3Fauthor)%20AS%20%3Fauthor)%20%3FauthorLabel%20(SAMPLE(%3Fdate)%20AS%20%3Fdate)%20(SAMPLE(%3Fgenre)%20AS%20%3Fgenre)%20%3FgenreLabel%20(SAMPLE(%3Fmovement)%20AS%20%3Fmovement)%20%3FmovementLabel%20(SAMPLE(%3Flocation)%20AS%20%3Flocation)%20%3FlocationLabel%20(SAMPLE(%3Fcollection)%20AS%20%3Fcollection)%20%3FcollectionLabel%20(SAMPLE(%3Fcopyright)%20AS%20%3Fcopyright)%20%3FcopyrightLabel%20WHERE%20%7B%0A%20%20%7B%20%3Fitem%20wdt%3AP31%20wd%3AQ3305213.%20%7D%0A%20%20UNION%0A%20%20%7B%20%3Fitem%20wdt%3AP31%20wd%3AQ93184.%20%7D%0A%20%20UNION%0A%20%20%7B%20%3Fitem%20wdt%3AP31%20wd%3AQ11060274.%20%7D%0A%20%20UNION%0A%20%20%7B%20%3Fitem%20wdt%3AP31%20wd%3AQ15123870.%20%7D%0A%20%20%3Fitem%20wdt%3AP170%20wd%3A' + args.qid + '.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP18%20%3Fimage.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP170%20%3Fauthor.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP195%20%3Fcollection.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP571%20%3Fdate.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP136%20%3Fgenre.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP135%20%3Fmovement.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP276%20%3Flocation.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP6216%20%3Fcopyright.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP275%20%3Flicense.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP973%20%3Furl.%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%2Cen%2Cceb%2Csv%2Cde%2Cfr%2Cnl%2Cru%2Cit%2Ces%2Cpl%2Cwar%2Cvi%2Cja%2Czh%2Carz%2Car%2Cuk%2Cpt%2Cfa%2Cca%2Csr%2Cid%2Cno%2Cko%2Cfi%2Chu%2Ccs%2Csh%2Cro%2Cnan%2Ctr%2Ceu%2Cms%2Cce%2Ceo%2Che%2Chy%2Cbg%2Cda%2Cazb%2Csk%2Ckk%2Cmin%2Chr%2Cet%2Clt%2Cbe%2Cel%2Caz%2Csl%2Cgl%2Cur%2Cnn%2Cnb%2Chi%2Cka%2Cth%2Ctt%2Cuz%2Cla%2Ccy%2Cta%2Cvo%2Cmk%2Cast%2Clv%2Cyue%2Ctg%2Cbn%2Caf%2Cmg%2Coc%2Cbs%2Csq%2Cky%2Cnds%2Cnew%2Cbe-tarask%2Cml%2Cte%2Cbr%2Ctl%2Cvec%2Cpms%2Cmr%2Csu%2Cht%2Csw%2Clb%2Cjv%2Csco%2Cpnb%2Cba%2Cga%2Cszl%2Cis%2Cmy%2Cfy%2Ccv%2Clmo%2Cwuu%2Cbn%22.%20%7D%0A%7D%0AGROUP%20BY%20%3Fitem%20%3FitemLabel%20%3FauthorLabel%20%3FgenreLabel%20%3FmovementLabel%20%3FlocationLabel%20%3FcollectionLabel%20%3FmaterialLabel%20%3FcopyrightLabel%20%0AORDER%20BY%20' + sortby + '%0ALIMIT%20' + page_size + '%0AOFFSET%20' + offset;

	console.log( search_url  );

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,

			dataType: "json",

			success: function( response ) {

				let json = response.results.bindings || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){

          $( '.mv-loader.' + args.id ).remove();

					return 1;
				}

        if ( json.length === 0 ) { // no more results

          $( '.mv-loader.' + args.id ).remove();

          return 1;

        }

				$.each( json, function ( i, v ) {

          let label = '';
          let subtitle = '';
          let subtitle2 = '';
          let qid   = '';
					let img   = '';
					let thumb = '';
					let url   = '';
					let date  = '';
					let desc  = '';
					let desc_plain  = '';

					let author    = '';
					let author_qid= '';

          if ( typeof v.itemLabel === undefined || typeof v.itemLabel === 'undefined' ){
            label = '---';
          }
          else {

            label = v.itemLabel.value;

          }

          if ( typeof v.item === undefined || typeof v.item === 'undefined' ){
            // do nothing
          }
          else {

            qid = v.item.value.replace('http://www.wikidata.org/entity/', '');

          }

          if ( typeof v.itemDescription === undefined || typeof v.itemDescription === 'undefined' ){
            // do nothing
          }
          else {

            if ( typeof v.itemDescription.value === undefined || typeof v.itemDescription.value === 'undefined' ){
              // do nothing
            }
            else {

              desc = '<details class="inline-abstract"><summary><small><i class="fa-solid fa-ellipsis-h"></i></small></summary>' + v.itemDescription.value + '</details>';

              desc_plain = v.itemDescription.value;

            }

          }

          if ( typeof v.date === undefined || typeof v.date === 'undefined' ){
            // do nothing
          }
          else {

            date = new Date( v.date.value ).getFullYear();

            subtitle = '<div class="mv-extra-desc"><a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: '/app/wikipedia/?t=' + date.toString() + '&l=' + explore.language + '&voice=' + explore.voice_code  } ) ) + '">' + date + '</a></div>';

          }

          if ( valid( v.author ) ){

            author_qid = v.author.value.replace('http://www.wikidata.org/entity/', '');

          }
  
          if ( typeof v.authorLabel === undefined || typeof v.authorLabel === 'undefined' ){
            // do nothing
          }
          else {

            author = v.authorLabel.value;

            subtitle2 =
              '<div class="mv-extra-desc">' +
                '<a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'explore', title: author, qid: author_qid, language : explore.language } ) ) + '"><span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></a> ' +
               '<a href="javascript:void(0)" class="" title="author" aria-label="author" role="button"' + setOnClick( Object.assign({}, args, { type: 'wikipedia-qid', qid: author_qid, title: author } ) ) + '>' + author + '</a>' + 
              '</div>';

          }
  
          if ( v.image === null || typeof v.image === undefined || typeof v.image === 'undefined' ){
            // do nothing
          }
          else {

            img		= v.image.value;
            thumb = v.image.value + '?width=300px';

            // create IIIF-viewer-link
            let coll = { "images": [ ]};

            coll.images.push( [ img, label, encodeURIComponent( desc_plain ), author, 'Wikipedia' ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

            if ( coll.images.length > 0 ){ // we found some images

              let iiif_manifest_link = '/app/response/iiif-manifest.php?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

              let iiif_viewer_url = '/app/iiif/index.html#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

              url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

            }

          }

          obj[ 'label-' + i ] = {

            title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'wikipedia-qid', qid: qid, title: label } ) ) + '> ' + label + '</a>' + subtitle + subtitle2 ),

            thumb_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'link', url: url, title: args.topic } ) ) + '><div class="mv-thumb"><img class="thumbnail" src="' + thumb + '" alt="" loading="lazy"></div></a>' ),

            explore_link:         '',
            video_link:           '',
            wander_link:          '',
            images_link:         	'',
            books_link:           '',
            websearch_link:       '',
            compare_link:         '',
            website_link:         '',
            custom_links:         '',
            raw_html:             '',
            mv_buttons_style:			'display:none;',

          };

				});

        let total_results = 0;

        let meta = {

          source        : 'paintings',
          link          : search_url,
          results_shown : Object.keys( obj ).length, 
          total_results : Object.keys( obj ).length, // FIXME: how the get the total results of this SPARQL query (without fetching all)?
          page          : page,
          call          : fname,
          sortby        : sortby,
          sort_select   : sort_select,
        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response: hmm...', thrownError);

      }

	});

}
