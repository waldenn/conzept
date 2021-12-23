<?php

  /*

    fields:
      0: image URL
      1: title
      2: description
      3: attribution / author
      4: license

  */

  $json = $_GET["json"];

  //var_dump(json_decode( $json, true));

  $root     = json_decode( $json, true);

  $single   = false;

  if (isset($_GET["single"]) ){
    $single = true;
  }

  $title    = $_GET["t"];
  $language = $_GET["l"];

  //header('Content-type: text/html');
  //echo $single . '</br>';

  if ( $single ){

    // $array[1]["suitability"][0]["species_name"];
    //echo var_dump( $root ) . '</br>';
    //echo $root['images'][0][0];

    $json = '
    {
      "@context": "http://iiif.io/api/presentation/2/context.json",
      "@id": "http://conze.pt/data/manifests/RomanCoins/bb853kn3021/manifest.json",
      "@type": "sc:Manifest",
      "label": "'.$title.'", 
      "metadata": [
        {
          "label": "'.$title.'", 
          "value": "'. $root['images'][0][2] . '"
        }
      ],
      "attribution": "'. $root['images'][0][3] . ' <br/> ' . $root['images'][0][4]  .'",
      "sequences": [
        {
          "@id": "http://conze.pt/data/manifests/RomanCoins/bb853kn3021/normal",
          "@type": "sc:Sequence",
          "label": "Current page order",                                                                                                                                                                                     "canvases": [

                  {
                    "@id": "http://conze.pt/data/manifests/RomanCoins/bb853kn3021/canvas/canvas-0",
                    "@type": "sc:Canvas",
                    "label": "'. $root['images'][0][1] .'",
                    "images": [
                      {
                        "@id": "http://conze.pt/data/manifests/RomanCoins/bb853kn3021/imageanno/anno-0",
                        "@type": "oa:Annotation",
                        "motivation": "sc:painting",
                        "resource": {
                          "@id": "'. str_replace(' ', '%20', $root['images'][0][0] ) .'",
                          "@type": "dctypes:Image"
                        },
                        "on": "http://conze.pt/data/manifests/RomanCoins/bb853kn3021/canvas/canvas-0"
                      }
                    ]
                  }



            ]
          }
        ]
      }';

  }
  else {

    $json   = '
      {
        "@context": "http://iiif.io/api/presentation/2/context.json", 
        "@id": "http://conze.pt/data/manifests/RomanCoins/bb853kn3021/manifest.json", 
        "@type": "sc:Manifest", 
        "label": "'.$title.'", 
        "metadata": [
          {
            "label": "'.$title.'", 
            "value": "..."
          }
        ], 
        "attribution": "'. $root['images'][0][3] . ' <br/> ' . $root['images'][0][4]  .'",
        "sequences": [
          {
            "@id": "http://conze.pt/data/manifests/RomanCoins/bb853kn3021/normal", 
            "@type": "sc:Sequence", 
            "label": "Current page order", 
            "canvases": [
        ';

        // add each image
        foreach( $root as $k => $v) {

          $i = 0;

          foreach( $v as $key => $value) { // row with image-data
            //echo $key . " => " . $value . "<br>";
            //echo $value[1] . "<br>";

            $json .= '
                    {
                      "@id": "http://conze.pt/data/manifests/RomanCoins/bb853kn3021/canvas/canvas-'.$i.'", 
                      "@type": "sc:Canvas", 
                      "label": "'.$value[1].'",
                      "images": [
                        {
                          "@id": "http://conze.pt/data/manifests/RomanCoins/bb853kn3021/imageanno/anno-'.$i.'", 
                          "@type": "oa:Annotation", 
                          "motivation": "sc:painting",
                          "resource": {
                            "@id": "'. str_replace(' ', '%20', $value[0] ) .'",
                            "@type": "dctypes:Image"
                          }, 
                          "on": "http://conze.pt/data/manifests/RomanCoins/bb853kn3021/canvas/canvas-'.$i.'"
                        }
                      ]
                    }

            ';

                    /*
                    {
                      "@type": "sc:Canvas",
                      "@id": "' . $value[0] . '",
                      "label": "' . $value[1] . '",
                      "width": 600,
                      "height": 600,
                      "images": [
                        {
                          "@type": "oa:Annotation",
                          "motivation": "sc:painting",
                          "on": "' . $value[0] . '",
                          "resource": {
                            "@type": "dctypes:Image",
                            "@id": "' . $value[0] . '"
                          }
                        }
                      ]
                    }
                    */


            if ( $i < count( $v ) - 1 ){ // not last item, so add a comma

              $json .= ',';

            }

            $i++;

          }

        }

        $json .= '

              ]
            }
          ]
        }
        ';

  }

  header('Content-type: application/json');

  echo $json;

?>
