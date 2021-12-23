let parentref;
let isMobile = detectMobile();

let app = {
	title:    '',
	url:      '',
};

$().ready( function () {

	init();

	$( '#fullscreenToggle' ).focus();

} );

async function init() {

	setParentRef();

	app.title			= getParameterByName( 't' ) || '';
	app.url	      = getParameterByName( 'url' ) || '';

  console.log( app.url );

  $('h2').html( '<i class="fas fa-rss"></i> &nbsp;' + app.title );

  // API docs jquery-rss: https://github.com/sdepold/jquery-rss

  $("#rss-feeds").rss( app.url , {
    limit: 100,
    entryTemplate:

      '<li>' + 
        '<h3 class="title"><a target="_blank" href="{url}">{title}</a></h3>' +
        '<p class="image">{teaserImage}</p>' +
        '<p class="desc">{shortBodyPlain}</p>' +
        '<p class="author">{author}</p>' + 
        '<p class="date">{date}</p>' +
      '</li>'

  })

}

function setParentRef(){

  if ( isMobile ){

    parentref = parent;

  }
  else { // desktop

    if ( window.parent.name === 'infoframeSplit2' || window.parent.name === 'infoframe_' ){ // request from secondary content iframe
      parentref = parent;
    }
    else { // primary content frame
      parentref = parent.top;
    }

  }

}

function goExplore( title, newtab ){

  if ( newtab ){

    openInNewTab( 'https://conze.pt/explore/' + title + '?l=' + app.language + '&t=wikipedia' );

  }
  else {

    const url = 'https://conze.pt/app/wikipedia/?t=' + encodeURIComponent( title ) + '&l=' + app.language;

    parentref.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', language: app.language, url: url, current_pane: getCurrentPane(), target_pane: 'ps2' } }, '*' );

  }

}
