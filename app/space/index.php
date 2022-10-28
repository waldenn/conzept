<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Droid+Sans" type="text/css">
    <link rel="stylesheet" href="./icomoon.css" type="text/css">
    <link rel="stylesheet" href="./perfect-scrollbar.min.css" type="text/css">
    <link rel="stylesheet" href="./style.css" type="text/css">

    <!-- conzept resources -->
    <link href="/assets/fonts/fontawesome/css/all.min.css?v6.01" rel="stylesheet" type="text/css"><link  href="/app/explore2/dist/css/conzept/common.css?v0.51.213" rel="stylesheet" type="text/css"> <script src="/app/explore2/dist/core/env.js?v0.51.213"></script><script src="/app/explore2/dist/core/utils.js?v0.51.213"></script><script src="/app/explore2/node_modules/jquery/dist/jquery.min.js?v3.6.0"></script><a href="javascript:void(0)" id="fullscreenToggle" onclick="document.toggleFullscreen()" class="global-actions"><i id="fullscreenIcon" title="fullscreen toggle" class="fas fa-expand"></i></a><script>document.toggleFullscreen = function() { if (screenfull.enabled) { screenfull.toggle(); } return 0; };</script>

    <script>
      // keyboard control
      $(document).keydown(function(event) {

        let key = (event.keyCode ? event.keyCode : event.which);

        //console.log( event, key );

        if ( key == '70' ){ // "f"

          document.toggleFullscreen();

        }

      });
    </script>

    <script src="./scripts/satellite.min.js"></script>
    <script src="./script-loader.php"></script>
    
    <title>satellites</title>
    
  </head>
  <body>
  <div id="no-webgl">
    Stuff in Space requires <a href="https://caniuse.com/#feat=webgl">WebGL</a> and <a href="https://caniuse.com/#feat=webworkers">Web Worker</a> support. 
  </div>
  <div id="canvas-holder">
    <canvas id="canvas"></canvas>
    <div id="menu-left" class="menubar">
      <div id="search-holder" class="menu-item">
        <span class="icon-search"></span>
        <input type="text" id="search"></input>
      </div>
      <div id="menu-groups" class="menu-item">
        <div class="menu-title">Groups</div>
        <ul id="groups-display" class="dropdown submenu">
          <li data-group="<clear>" class="clear-option">Clear</li>
          <li data-group="GPSGroup">GPS</li>
          <li data-group="IridiumGroup">Iridium</li>
          <li data-group="GlonassGroup">GLONASS</li>
          <li data-group="GalileoGroup">Galileo</li>
          <li data-group="Iridium33DebrisGroup">Iridium 33 Collision Debris</li>
          <li data-group="WestfordNeedlesGroup">Westford Needles</li>
          <li data-group="SpaceXGroup">SpaceX</li>
        </ul>
      </div>
     <!-- <div id="menu-color-schemes" class="menu-item">
        <div class="menu-title">Color Schemes</div>
        <ul id="color-schemes-submenu" class="submenu">
          <li data-color="default">Type</li>
          <li data-color="velocity">Velocity</li>
          <li data-color="apogee">Apogee</li>
        </ul>
      </div>-->
    </div>
    <div id="menu-right" class="menubar">
      <div id="menu-help" class="menu-item">
        <div class="menu-title">?</div>
        <div id="help-box" class="menubox submenu">
          <span class="box-header">Legend</span>
          <ul id="legend">
            <li>
               <img class="dot" src="./dot-red.png"></img>
               Satellite
             </li>
            <li>
              <img class="dot" src="./dot-blue.png"></img>
              Rocket body
            </li>
            <li>
              <img class="dot" src="./dot-grey.png"></img>
              Debris
            </li>
          </ul>
          <ul id="controls-info">
            <li>
              Left/Right click and drag to rotate camera
            </li>
            <li> Mousewheel to scroll </li>
            <li>
              Left click to select an object
            </li>
          </ul>
        
        </div>
      </div>
    </div>
      <div id="search-results"></div>
    <div id="sat-hoverbox">(none)</div>
    <div id="sat-infobox">
      <div id="sat-info-title">This is a title</div>
      <div id="all-objects-link" class="link">Find all objects from this launch...</div>
      <div class="sat-info-row">
        <div class="sat-info-key">Int'l Designator</div>
        <div class="sat-info-value" id="sat-intl-des">1998-067A</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Type</div>
        <div class="sat-info-value" id="sat-type">PAYLOAD</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Apogee</div>
        <div class="sat-info-value" id="sat-apogee">100 km</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Perigee</div>
        <div class="sat-info-value" id="sat-perigee">100 km</div>
      </div>
       <div class="sat-info-row">
        <div class="sat-info-key">Inclination</div>
        <div class="sat-info-value" id="sat-inclination">123.45°</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Altitude</div>
        <div class="sat-info-value" id="sat-altitude">100  km</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Velocity</div>
        <div class="sat-info-value" id="sat-velocity">100  km/s</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Period</div>
        <div class="sat-info-value" id="sat-period">100  min</div>
      </div>
    </div>
    <div id="zoom-controls">
      <div id="zoom-in" class="zoom-button">+</div>
      <div id="zoom-out" class="zoom-button">-</div>
    </div>
    <div id="load-cover">
      <div id="loader">
        <div id="spinner"></div>
        <div id="loader-text">
          Downloading resources...
        </div>
      </div>
    </div>
  </div>
  </body>
</html>

