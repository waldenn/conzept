
async function fetchMastodon( args, total_results, page, sortby ){

  const fname = 'fetchMastodon';

  args = unpackString( args );

  let page_size = 20;
  let offset    = 0;

  if ( total_results === null ){ // first request

    page = 1;

  }
  else { // fetch more if needed

    if ( ( (page - 1) * page_size ) < total_results ){ // more to fetch

      offset = ( page - 1 ) * page_size;

      // insert loader icon
      let sel     = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';
      let loader  = '<img class="loaderMV" alt="loading" width="36" height="36" src="/app/explore2/assets/images/loading.gif"/>';
      $( sel ).append( loader );

    }
    else { // no more results

      $( '.mv-loader.' + args.id ).remove();

      return 0;

    }

  }

  let keyword = args.topic.replace(/\(.*?\)/g, '').trim();
  keyword = removeCategoryFromTitle( keyword );

  let keyword_match = keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim();

  keyword = encodeURIComponent( keyword.replace(/[."#_()!]/g, '').replace(/[\-]/g, ' ').trim() );

  // see:
  //  https://instances.social/api/doc/
  //  https://instances.social/api/token
  //  Application name: Conzept encyclopedia
  //  Application ID: 583530628
  //
  //  https://instances.social/list.json?q[languages][]=en&q[min_users]=&q[max_users]=&q[search]=linux&strict=false
  const search_url = 'https://instances.social/api/1.0/instances/search?q=' + keyword + '&count=' + page_size;

	let obj = {};

  args.type = 'link';

	$.ajax({

			url: search_url,


      headers: {
        'Authorization': 'Bearer REsjdslHD51dWF1UKFwutSqmCzSb876PmMTrTTCIvrPzRFUJoOymREgn5YHWVFZj3cNoJg4nUlvpJrAzmNIzZQAK4vRWuBdqssQduyaOtqj2Znq77uDcz5WwrO89vOPA',
      },

			success: function( response ) {

				let json = response.instances || [];

				if ( typeof json === undefined || typeof json === 'undefined' ){
					return 1;
				}

				$.each( json, function ( i, v ) {

          let label = '';
					let img   = '';
					let url   = '';
					let date  = '';
					let desc  = '';
					let subtitle = '';

					let author= '';
					let thumb = '';

          if ( valid( v.name ) ){

            label	= v.name;
            url		= encodeURIComponent( JSON.stringify( 'https://' + v.name ) );

          }

          if ( v.info?.full_description ){

            desc = getAbstract( v.info.full_description, keyword_match );

          }

          if ( v.infos?.theme ){

            subtitle += v.infos.theme + ', ';

          }

          if ( v.info?.categories ){

            v.info.categories.forEach( ( cat ) => {

              subtitle += cat + ', ';

            });

          }

          subtitle = '<small>' + subtitle.replace(/,\s*$/, '') + '</small>'; // remove last comma
  
          if ( valid ( v.thumbnail ) ){

            img = v.thumbnail;

          }

          obj[ 'label-' + i ] = {

            title_link:						encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'url', url: url, title: args.topic } ) ) + '> ' + label + '</a>' + subtitle + desc ),

            thumb_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="topic" aria-label="topic" role="button"' + setOnClick( Object.assign({}, args, { type: 'url', url: url, title: args.topic } ) ) + '><div class="mv-thumb"><img class="thumbnail" src="' + img + '" alt="" loading="lazy"></div></a>' ),

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

        let meta = {

          source        : 'Mastodon instances',
          link          : 'https://indieweb.social/explore',
          results_shown : Object.keys( obj ).length, 
          total_results : response.pagination.total,
          page          : page,
          call          : fname,
          //sortby        : sortby,
          //sort_select   : sort_select,
        }

				insertMultiValuesHTML( args, obj, meta );

			},
      error: function (xhr, ajaxOptions, thrownError){

				console.log( 'response error: ', thrownError );

      }

	});

}
