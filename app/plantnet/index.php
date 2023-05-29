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
        $API_URL = 'https://my-api.plantnet.org/v2/identify/all?api-key=';
        $API_PRIVATE_KEY = '2b10G3OenCdn37PXf3YJbvBMO'; // secret
        $API_SIMSEARCH_OPTION = '&include-related-images=true'; // optional: get most similar images
        $API_LANG = '&lang=' . $language;

    ?>
    <head>
      <meta charset="utf-8">
      <title>plant identification</title>
      <!--base target="_self"-->

      <!-- conzept resources -->
      <link href="/assets/fonts/fontawesome/css/all.min.css?v6.01" rel="stylesheet" type="text/css"><link  href="/app/explore2/dist/css/conzept/common.css?v0.51.340" rel="stylesheet" type="text/css"> <script src="/app/explore2/dist/core/env.js?v0.51.340"></script><script src="/app/explore2/dist/core/utils.js?v0.51.340"></script><script src="/app/explore2/node_modules/jquery/dist/jquery.min.js?v3.6.0"></script><a href="javascript:void(0)" id="fullscreenToggle" onclick="document.toggleFullscreen()" class="global-actions"><i id="fullscreenIcon" title="fullscreen toggle" class="fas fa-expand"></i></a><script>document.toggleFullscreen = function() { if (screenfull.enabled) { screenfull.toggle(); } return 0; };</script><script src="/app/explore2/libs/TinyGesture.js"></script>

      <link rel="stylesheet" href="./css/main.css">

    </head>

    <body>
        <h1>plant identification</h1>

            <?php
              echo '<form method="POST" action="index.php?l=' . $language . '" enctype="multipart/form-data">';
            ?>

            <label>photo: </label>
            <input type="file" name="image" onchange="loadFile(event)">

            <br><br>
            <label>database scope: </label>
            <select name="project">
                <option value="the-plant-list">World flora</option>
                <option value="weurope">Western Europe</option>
                <option value="weeds">Weeds of Europe</option>
                <option value="prosea">South East Asia</option>
                <option value="prota">Tropical Africa</option>
                <option value="useful">Ornamental plants</option>
                <option value="invasion">Invasive plants</option>
                <!--option value=""></option-->
            </select>

            <br><br>
            <label>plant organ: </label>
            <select name="organ">
                <option value="flower">Flower</option>
                <option value="leaf">Leaf</option>
                <option value="fruit">Fruit</option>
                <option value="bark">Bark</option>
            </select>

            <br><br>
            <input id="submit" type="submit" value="identify plant">

            <img id="input"/>

        </form>

        <?php
            // var_dump($_POST);
            // var_dump($_FILES);
            $response = false;

            if (
                ! empty($_POST['project'])
                && ! empty($_POST['organ'])
                && ! empty($_FILES['image']['name'])
            ) {
                // ----------- THIS IS A COPY OF examples/post/run.php -------------------

                $client = new GuzzleHttp\Client();
                try {
                    $apiRequest = $client->request('POST', $API_URL . $API_PRIVATE_KEY . $API_SIMSEARCH_OPTION . $API_LANG, 
                        [
                            'multipart' => [
                                [
                                    'name'     => 'images',
                                    'contents' => fopen($_FILES['image']['tmp_name'], 'r')
                                ],
                                [
                                    'name'     => 'organs',
                                    'contents' => $_POST['organ']
                                ]
                            ]
                        ]
                    );

                    $response = json_decode($apiRequest->getBody(), true);

                    // display identification results if any
                    if (! empty($response['results'])) {

                        $results = array_slice($response['results'], 0, 3); // keep 3 best results

                        echo '<h2>results</h2>';

                        foreach($results as $res) {

                          echo '<b>' . $res['score'] . '</b> : <i> <a class="link" title="explore this plant" onclick="goExplore( &quot;' . rawurlencode( $res['species']['scientificNameWithoutAuthor'] ) . '&quot;)" onauxclick="goExplore(&quot;' . rawurlencode( $res['species']['scientificNameWithoutAuthor'] ) . '&quot; , true)"> ' . $res['species']['scientificNameWithoutAuthor'] . '</a> (family: <a class="link" title="explore this plant family" onclick="goExplore( &quot;' . rawurlencode( $res['species']['family']['scientificNameWithoutAuthor'] ) . '&quot;)" onauxclick="goExplore(&quot;' . rawurlencode( $res['species']['family']['scientificNameWithoutAuthor'] ) . '&quot; , true)"> ' . $res['species']['family']['scientificNameWithoutAuthor'] . '</a>) <br>';

                          //echo '<b>' . $res['score'] . '</b> : <i> <a class="link" title="explore this plant" onclick="goExplore( &quot;' . rawurlencode( $res['species']['scientificNameWithoutAuthor'] ) . '&quot;)" onauxclick="goExplore(&quot;' . rawurlencode( $res['species']['scientificNameWithoutAuthor'] ) . '&quot; , true)"> ' . $res['species']['scientificNameWithoutAuthor'] . '</a>, author: ' . $res['species']['scientificNameAuthorship'] . '</i>' . ' ( family: ' . $res['species']['family']['scientificNameWithoutAuthor'] . ')<br>';

                          foreach ($res['images'] as $img) {
                              echo '<img class="gallery" title="' . $img['license'] . ' - ' . $img['author'] . ' - ' . $img['date']['string'] . '" src="' . $img['url']['s'] . '">';

                          }

                          echo '<br>';

                        }
                    }
                } catch (GuzzleHttp\Exception\ClientException $e) {
                    echo '<h2>Error</h2>';
                    echo $e->getResponse()->getBody();
                }
            }

          echo '<script>let language = "' . $language . '";</script>';

        ?>

      <script src="./js/main.js"></script>

    </body>

</html>
