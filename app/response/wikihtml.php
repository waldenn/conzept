<?php

  // get only the plain HTML-text of a Wikipedia article

  $html = '';

  if ( isset($_GET["t"] ) ){

    // get input
    $t = $_GET["t"];
    $l = $_GET["l"];

    $url = 'https://' . $l . '.wikipedia.org/w/api.php?action=parse&page=' . urlencode( $t ) . '&prop=text&formatversion=2&format=json';

    // get wikipedia JSON
    $json = file_get_contents($url);
    $json = json_decode($json);

    // get wikipedia-html-text
    $html = $json->parse->text;

    // Create a DOM object from a string
    //$html = new Document( $html );

    //$dom->find('meta[property="og:title"]')->content;

    // Create a DOM object from a string
    //$html = new Document();
    //$html->loadHtml('<html><body>Hello!</body></html>');

    // Create a DOM object from a HTML file
    //$html = new Document();
    //$html->loadHtmlFile('test.htm');

    // Create a DOM object from a URL
    //$html = new Document(file_get_contents('https://habrahabr.ru/interesting/'));

    /*
    // strip unwanted tags with their content
    $unwanted = [
      'sub',
    ];

    //$html = preg_replace( "/<([a-z][a-z0-9]*)[^>]*?(\/?)>/si",'<$1$2>', $html );
    //$html = preg_replace( "#(<[a-zA-Z0-9]+)[^\>]+>#", "\\1>", $html );

    foreach ( $unwanted as $tag ) {

      $html = preg_replace( "/(<$tag>.*?<\/$tag>)/is", '', $html );

    }

    unset( $tag );
    */

    //$html = var_dump( $json->parse->text );
    //$html = $url;

  }
  else {

    $html = 'no article found';

  }

  // render HTML to client
  header('Content-type: text/html');

  echo $html;

?>
