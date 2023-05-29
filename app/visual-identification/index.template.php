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
      CONZEPT_COMMON_HTML_INCLUDE

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
