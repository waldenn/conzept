const isTouchDevice = 'd' in document.documentElement;

window.gotoArticle = function( qid ){
  //console.log( 'qid: ', qid );

	var url = CONZEPT_WEB_BASE + '/app/wikipedia/?t=&l=' + window.getParameterByName('l') + '&qid=' + qid ;

	window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', url: url, current_pane: getCurrentPane(), target_pane: getTargetPane() } }, '*' );
 
  //window.postMessage({ event_id: 'handleClick', data: { type: 'wikipedia-side', title: '', hash: '', language: 'en', qid: qid } }, '*' );
}

keyboardJS.bind('alt+y', function(e) {
  window.parent.postMessage({ event_id: 'toggle-sidebar', data: { } }, '*' );
});
