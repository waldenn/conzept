<?php

  $version  = 'v001';

  $language = $_GET['l'];
  $title    = $_GET['t'];
  $id       = $_GET['id'];

  $html   = '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>GBIF map: ' . $title . '</title>

    <link rel="preload" as="style" href="https://fonts.googleapis.com/css?family=Quicksand:400,500&display=swap" type="text/css">
    <script src="../explore2/dist/core/utils.js?'. $version .'"></script>

    <script>
      setupAppKeyboardNavigation();
    </script>

    <script src="../explore2/dist/webcomponent/gbif-map.js?'. $version .'" type="module"></script>

    <style>
      html, body {
        padding: 0;
        margin: 0;
        font-family: "Quicksand", sans-serif !important;
      }
    </style>
  </head>
  <body>
    <gbif-map style="resize: both; overflow: auto; width:100%;height:100vh;" gbif-id="' . $id . '" gbif-title="' . $title . '" gbif-language="' . $language . '" gbif-style="scaled.circles" center-latitude="30.0" center-longitude="13.6" controls ></gbif-map>
  </body>
</html>';

  header('Content-type: text/html');

  echo $html;

?>
