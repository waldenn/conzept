<html>
    <?php
        // don't forget to run "composer install" first
        require 'vendor/autoload.php';

        if ( isset($_GET['l']) ) {

          $language = $_GET['l'];

        }
        else {

          $language = 'en';
            
        }

        //echo $language

        // CONFIGURATION
        $API_URL = '{...endpoint}/bing/v7.0/images/visualsearch';
        $API_PRIVATE_KEY = '2b10G3OenCdn37PXf3YJbvBMO'; // secret
        $API_SIMSEARCH_OPTION = '&include-related-images=true'; // optional: get most similar images
        $API_LANG = '&lang=' . $language;


    ?>
    <head>
      <meta charset="utf-8">
      <title>plant identification</title>
      <!--base target="_self"-->

      <!-- conzept resources -->
      <link href="/assets/fonts/podcastfont/css/PodcastFont.css?v202306131635" rel="stylesheet" type="text/css"><link href="/assets/fonts/fontawesome/css/all.min.css?v6.5.1" rel="stylesheet" type="text/css"><link href="/app/explore2/dist/css/conzept/common.css?v0.51.4836" rel="stylesheet" type="text/css"> <script src="/app/explore2/dist/core/env.js?v0.51.4836"></script><script src="/app/explore2/dist/core/utils.js?v0.51.4836"></script><script src="/app/explore2/node_modules/jquery/dist/jquery.min.js?v3.6.0"></script><a href="javascript:void(0)" id="fullscreenToggle" onclick="document.toggleFullscreen()" class="global-actions"><i id="fullscreenIcon" title="fullscreen toggle" class="fas fa-expand"></i></a><script>document.toggleFullscreen = function() { if (screenfull.enabled) { screenfull.toggle(); } return 0; };</script><script src="/app/explore2/libs/TinyGesture.js"></script>

      <link rel="stylesheet" href="./css/main.css">

    </head>

    <body>
        <h1>visual identification</h1>

            <?php
              echo '<form method="POST" action="index.php?l=' . $language . '" enctype="multipart/form-data">';
            ?>

            <label>photo: </label>
            <input type="file" name="image" onchange="loadFile(event)">

            <br><br>
            <input id="submit" type="submit" value="visual identify">

            <img id="input"/>

        </form>

        <?php
            // var_dump($_POST);
            // var_dump($_FILES);
            $response = false;

            if ( ! empty($_FILES['image']['name'])) {

              echo '<h2>results</h2>'; 

            }

          echo '<script>let language = "' . $language . '";</script>';

        ?>

      <script src="./js/main.js"></script>

    </body>

</html>
