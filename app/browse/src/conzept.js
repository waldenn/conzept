function gotoArticle( qid, language ) {

  qid = qid.replace('http://www.wikidata.org/entity/Q', '') || '';

  var url = CONZEPT_WEB_BASE + '/app/wikipedia/?t=&l=' + language + '&qid=' + qid ;
  window.parent.postMessage({ event_id: 'handleClick', data: { type: 'link', title: '', url: url, current_pane: getCurrentPane(), target_pane: 'ps2' } }, '*' );

}
