<?php

require_once 'php/Mobile_Detect.php';

$detect       = new Mobile_Detect;
$user_agent   = getenv("HTTP_USER_AGENT");

$viewMode     = '';
$font         = 'Quicksand';
$ua_string    = '';
$alt_key      = 'Alt';

$window_bottom_margin   = '3rem';
$content_bottom_margin  = '3rem';

$splash       = '<style>body {overflow: hidden} .blink-splash { position: absolute; top: 54.3vh; left: 49.5vw; animation: blinker-splash 2s cubic-bezier(.1,0,.5,1) infinite alternate; color: #b62828; font-size: 300%; } @keyframes blinker-splash { from { opacity: 0.8; } to { opacity: 0; } }</style><span id="splash" style="position: absolute; top: 0; left: 0; height: 100%; width: 100%; background-color: #fbfaf9; background-image: url(../../assets/icons/splash.png); background-repeat:no-repeat; background-position: center center; z-index: 100000;"><span id="blink-splash" class="blink-splash" title="status: loading" style=""><i class="fa fa-circle text-danger blink"></i></span></span>'; 

if ( strpos( $user_agent, "Win") !== FALSE ){
  $os = "Windows";
}
elseif ( strpos( $user_agent, "Mac") !== FALSE ){
  $os = "Mac";
  $alt_key = '&#8997;';
}

//var_dump( $_GET );
if ( isset( $_GET['v'] ) ){

  if ( $_GET["v"] == 'mobile' ){

    $viewMode = 'mobile'; // force mobile view

  }
  elseif ( $_GET["v"] == 'desktop' ){

    $viewMode = 'desktop'; // force desktop view
      
  }

}

if ( $viewMode == '' ){ // no view mode set yet

  if ($detect->isMobile()){

    $viewMode = 'mobile'; // mobile view detected

    $ua_string    = $_SERVER['HTTP_USER_AGENT'];

    $window_bottom_margin   = '20rem';
    $content_bottom_margin  = '20rem';

  }
  else {

    $viewMode = 'desktop'; // desktop view detected
      
  }

}

$locales = array_map('trim', explode(',', 'CONZEPT_LOCALES' ));

$locale_options_html = '';

foreach ($locales as &$loc) {

  $locale_options_html .= '<option value="' . $loc . '">' . $loc . '</option>';

}

$main_css = '
  <link rel="stylesheet" href="../app/explore2/dist/css/various/materialize.min.css" type="text/css">
  <link rel="stylesheet" href="../app/explore2/node_modules/@fortawesome/fontawesome-free/css/all.min.css?v5.14" type="text/css">
  <link rel="stylesheet" href="../app/explore2/dist/css/openmoji/openmoji-black-awesome.css?v13.11" type="text/css"> <!-- contains custom patches to align with fontawesome -->

  <!--link rel="stylesheet" href="../app/explore2/css/various/jqtree.css" type="text/css"--> <!-- TODO: re-append the style overrides from here into the main.css -->
  <link rel="stylesheet" href="../app/explore2/node_modules/jqtree/jqtree.css" type="text/css">

  <link rel="stylesheet" href="../app/explore2/node_modules/jquery.uls/css/jquery.uls.css" type="text/css" >
  <link rel="stylesheet" href="../app/explore2/node_modules/jquery.uls/css/jquery.uls.grid.css" type="text/css">
  <link rel="stylesheet" href="../app/explore2/node_modules/jquery.uls/css/jquery.uls.lcd.css" type="text/css">
  <link rel="stylesheet" href="../app/explore2/node_modules/jquery.uls/css/jquery.uls.mobile.css" type="text/css">
  <link rel="stylesheet" href="../app/explore2/node_modules/jquery-ui-dist/jquery-ui.min.css" type="text/css">
  <link rel="stylesheet" href="../app/explore2/node_modules/select2/dist/css/select2.min.css" type="text/css">
  <link rel="stylesheet" href="../app/explore2/node_modules/katex/dist/katex.min.css" type="text/css">
  <link rel="stylesheet" href="../app/explore2/dist/css/various/flag-icon.min.css" type="text/css">

  <!-- Conzept CSS -->
  <link rel="stylesheet" href="../app/explore2/dist/css/conzept/common.css?vCONZEPT_VERSION" type="text/css">
  <link rel="stylesheet" id="maincss" href="../app/explore2/dist/css/conzept/main.css?vCONZEPT_VERSION"  type="text/css">
  <link rel="stylesheet" id="darkcss" href="../app/explore2/dist/css/conzept/theme_dark.css?vCONZEPT_VERSION"  type="text/css">
';

$main_script = '
  <!-- jQuery dependent scripts -->
  <script src="../app/explore2/node_modules/jquery/dist/jquery.min.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/node_modules/jquery.uls/src/jquery.uls.data.js"></script>
  <script src="../app/explore2/node_modules/jquery.uls/src/jquery.uls.data.utils.js"></script>
  <script src="../app/explore2/node_modules/jquery.uls/src/jquery.uls.lcd.js"></script>
  <script src="../app/explore2/node_modules/jquery.uls/src/jquery.uls.languagefilter.js"></script>
  <script src="../app/explore2/node_modules/jquery.uls/src/jquery.uls.core.js"></script>
  <script src="../app/explore2/libs/jquery.fontselect.js?vCONZEPT_VERSION"></script> <!-- no NPM-package: https://github.com/av01d/fontselect-jquery-plugin -->
  <script src="../app/explore2/node_modules/jqtree/tree.jquery.js"></script>
  <script src="../app/explore2/node_modules/select2/dist/js/select2.min.js"></script>
  <script src="../app/explore2/node_modules/jqtree/tree.jquery.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/libs/materialize.min.js?vCONZEPT_VERSION"></script> <!-- no NPM-package -->
  <script src="../app/explore2/node_modules/jquery-ui-dist/jquery-ui.min.js"></script>
  <script src="../app/explore2/node_modules/jquery-toast-plugin/dist/jquery.toast.min.js?vCONZEPT_VERSION"></script>

  <!-- non-jQuery dependent scripts -->
  <script src="../app/explore2/libs/splitter.js?vCONZEPT_VERSION"></script> <!-- contains some custom code modifications -->
  <script src="../app/explore2/node_modules/urijs/src/URI.min.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/node_modules/immortal-db/dist/immortal-db.min.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/node_modules/banana-i18n/dist/banana-i18n.js"></script>
  <script src="../app/explore2/node_modules/mark.js/dist/mark.min.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/node_modules/numbro/dist/numbro.min.js"></script>
  <script src="../app/explore2/node_modules/katex/dist/katex.min.js" async></script>
  <script src="../app/explore2/libs/wikibase-sdk.min.js"></script> <!-- no dist-bundle in the NPM-package: https://www.npmjs.com/package/wikibase-sdk -->

  <!-- Conzept data scripts -->
  <script src="../app/explore2/dist/data/fields.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/iso2_codes.js"></script>
  <script src="../app/explore2/dist/data/languages.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/indicators.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/countries.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/former_countries.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/tags.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/chains.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/cover_data.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/osm_tags.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/playlist.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/sections.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/sections_init.js?vCONZEPT_VERSION"></script>

  <!-- Conzept core scripts -->
  <script src="../app/explore2/dist/core/env.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/core/utils.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/core/setWikidata.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/core/createItemHtml.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/core/fetch_lib.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/core/fetches.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/core/lib.js?vCONZEPT_VERSION"></script> <!-- Conzept app core library -->
  <script src="../app/explore2/dist/core/main.js?vCONZEPT_VERSION"></script> <!-- Conzept app entry point -->

  <!-- tracker -->
  CONZEPT_TRACKER_HTML_INCLUDE
';

$sticky_html = '

  <div class="sticky" role="heading" aria-level="1" aria-label="sticky menu">

    <div id="logo-header">
      <span id="logox">
        <a href="javascript:void(0)" title="conzept home" onclick="showStartPage()" onauxclick="openInNewTab( &quot;https://conze.pt/explore&quot; );">conzept</a> 
        <span id="blink" title="status: loading"><i class="fa fa-circle text-danger blink"></i></span>
      </span>
      <span class="active uls-trigger" tabindex="0" style="font-family: '. $font .';" title="language select" aria-label="language select"> <i class="fas fa-caret-right"></i> </span>
    </div>

    <span class="nobreak">
      <input title="search input" type="search" enterkeyhint="search" class="form-control searchbox" id="srsearch" placeholder="search" aria-label="search" role="searchbox">
      <label for="srsearch" style="display:none;">srsearch</label>
      <span id="clearSearch"><a class="link clear" title="clear search" aria-label="clear search" href="javascript:void(0)"><i class="fas fa-times" w=""></i></a></span>
      <span id="submitSearch"><a title="submit search" class="waves-effect waves-light btn-small submitSearch" aria-label="submit search" role="button" tabindex="0"><i class="fas fa-search"></i></a></span>
    </span>

    <ul id="tabs-swipe-demo" class="tabs">
      <li class="tab col s3  topics-button" title="topics"><a id="tab-head-topics" href="#swipe-2" aria-label="topics tab"><i class="fa fa-th-large"></i></a></li>
      <li class="tab col s3" title="topics"><a id="tab-head-concepts" class="active" href="#swipe-3" aria-label="topics tab"><i class="fas fa-stream"></i></a></li>
      <li class="tab col s3" style="display:none;" title="lists"><a id="tab-head-lists" href="#swipe-4" aria-label="lists tab"><i class="fas fa-list-ul"></i></a></li>
      <li class="tab col s3" title="bookmarks"><a id="tab-head-bookmarks" href="#swipe-5" aria-label="bookmarks tab"><i class="far fa-bookmark"></i></a></li>
      <li class="tab col s3" title="tools"><a id="tab-head-tools" href="#swipe-7" aria-label="tools tab"><i class="fas fa-wrench"></i></a></li>
      <li class="tab col s3" title="settings"><a id="tab-head-settings" href="#swipe-1" aria-label="settings tab"><i class="fas fa-cog"></i></a></li>
      <li class="tab col s3" title="help"><a id="tab-head-help" href="#swipe-6" aria-label="help tab"><i class="fas fa-question"></i></a></li>
      <li class="tab col s3 global-action" id="toggle-fullscreen" style="float:right; display: inline-block; text-align: center; line-height: 48px; height: 48px; padding: 0; margin: 0; text-transform: uppercase;" title="toggle fullscreen (main app)"><a style="padding: 0 1em !important; font-size: 1em;" tabindex="0" onclick="toggleFullscreen();"><i id="maximizeIcon" class="fas fa-expand-arrows-alt" title="toggle fullscreen (main app)"></i></a></li>
      <!--li class="tab col s3 global-action" id="add-bookmark" style="float:right; display: inline-block; text-align: center; line-height: 48px; height: 48px; padding: 0; margin: 0; text-transform: uppercase;" title="bookmark this page"><a id="add-bookmark" style="padding: 0 1em !important; font-size: 1em;" tabindex="0" onclick="addBookmark(event, &quot;clicked&quot; )"><i id="bookmarkIcon" class="far fa-bookmark" title="bookmark current URL"></i></a></li-->
    </ul>

  </div>
';

$settings_html = '

  <span class="noselect">

    <div id="swipe-1" class="main-container">

      <div class="fixed-container"></div>

      <div class="content-wrapper">

        <div class="overflow-container" tabindex="-1">

          <h4 class="tab-title" id="app-tab-settings-title" style="font-family: ' . $font . ' !important;">settings</h4>

          <div class="overflow-content indent">

            <details class="auto conf" style="" closed>
              <summary><span id="app-menu-font-size"></span></summary>

                <div class="fontsizestyle" style="margin-left: 1.2em;">
                  <label>
                  <div id="fontsize"></div>
                  <input id="fontsizer" type="range" min="10" max="50" step="0.1">
                  </label>
                </div>

            </details>

            <details class="auto conf" style="" closed>
              <summary><span id="app-menu-font-type"></span></summary>

              <div class="style-form">

                <label><input id="font1" class="browser-default" type="text"/> </label> 

              </div>

            </details>

            <details class="auto conf" style="display:none;" closed>
              <summary>links</summary>

              <div class="style-form">

                <div id="bold-setting" class="switch">
                  <label>
                  <input type="checkbox" id="bold" checked="checked">
                  <span class="lever"></span>
                  bold
                  </label>
                  <br/>
                </div>

                <br/>

                <div id="underline-setting" class="switch">
                  <label>
                  <input type="checkbox" id="underline" checked="checked">
                  <span class="lever"></span>
                  underline
                  </label>
                  <br/>
                </div>

                <div class="switch" style="display:none;">
                  <label>
                  link color: <br/>
                  <input id="colorpicker1" type="text" />
                  </label>
                </div>

              </div>

            </details>

            <details class="auto conf" closed>
              <summary><span id="app-menu-theme"></span></summary>

              <div class="style-form">

                <div id="darkmode-setting" class="switch">
                  <label>
                  <input type="checkbox" id="darkmode">
                  <span class="lever"></span>
                  <span id="app-menu-darkmode"></span>
                  </label>
                </div>

                <br/>

                <div id="bgmode-setting" class="switch" style="display:none;">
                  <label>
                  <input type="checkbox" id="bgmode">
                  <span class="lever"></span>
                  cover background
                  </label>
                </div>

                <div id="linkpreview-setting" class="switch">
                  <label>
                  <input type="checkbox" id="linkpreview">
                  <span class="lever"></span>
                  <span id="app-menu-link-preview"></span>
                  </label>
                  <br/>
                </div>

                <br/>

                <div id="multicolumn-setting" class="switch" style="display:none;">
                  <label>
                  <input type="checkbox" id="multicolumn">
                  <span class="lever"></span>
                  multicolumn <span class="tinytext">(beta)</span>
                  </label>
                </div>

                <div id="colorfilter-setting">

                  <label style="display:inline; font-size: larger;" for="colorfilter"><span id="app-menu-color-filter"></span>: &nbsp;</label>
                  <select id="colorfilter" width="20px">
                    <option value="none">none</option>
                    <option value="grayscale">grayscale</option>
                    <option value="sepia">sepia</option>
                    <!--option value="invert">invert</option-->
                    <!--option value="reduced-constrast">reduced-constrast</option-->
                    <!--option value="blur">blur</option-->
                  </select>

                </div>

            </div>

            </details>

            <details class="auto conf" closed>
              <summary><span id="app-menu-interface-language"></span></summary>

              <div class="style-form">

                <div class="switch">

                  <label style="display:inline; font-size: larger;" for="locale"><span id="app-menu-locale"></span>: &nbsp;</label>
                  <select id="locale" width="20px" style="top: 0px !important;">
                    <option value="">select locale</option>' .
                    $locale_options_html .
                  '</select>

               </div>

              </div>

            </details>

            <details class="auto conf" closed>
              <summary><span id="app-menu-voice"></span></summary>

              <div class="style-form">

                <div class="switch">

                  <label style="display:inline; font-size: larger;" for="voices"><span id="app-menu-style"></span>: &nbsp;</label>
                  <select id="voices" class="browser-default" width="20px" style="top: 0px !important;">
                  </select>

                  <br/><br/>

                  <label style="display:inline; font-size: larger;" for="voice-rate"><span id="app-menu-speed"></span>: <span id="voicerate"></span></label>
                  <input id="voice-rate" type="range" min="0.5" max="1.5" step="0.01" value="1">

                  <br/><br/>

                  <label style="display:inline; font-size: larger;" for="voice-pitch"><span id="app-menu-pitch"></span>: <span id="voicepitch"></span></label>
                  <input id="voice-pitch" type="range" min="0.5" max="1.5" step="0.01" value="1">

                </div>

              </div>

            </details>

            <details class="auto conf" closed>
              <summary><span id="app-menu-persona">persona</span></summary>

              <div class="style-form">

                <div id="persona-setting">

                  <label style="display:inline; font-size: larger;" for="persona-select"><!--span id="app-menu-persona-select">personas</span--> &nbsp;</label>
                  <select id="persona-select" width="20px" multiple>
                    <option value="none">none</option>
                    <option value="nomad">nomad</option>
                    <option value="tourist">tourist</option>
                    <option value="student">student</option>
                    <option value="academic">academic</option>
                  </select>

                </div>

                <!--div id="country-setting">

                  <div class="niceCountryInputSelector" style="width: 250px;" data-selectedcountry="" data-showspecial="false" data-showflags="true"
                    data-i18nnofilter="No selection" data-i18nfilter="Filter" data-onchangecallback="setCountry" />
                  </div>

                  <label style="display:inline; font-size: larger;" for="country-select"><!--span id="app-menu-country-select">country</span> &nbsp;</label>
                  <select id="country-select" width="20px" multiple>
                    <option value="...">...</option>
                  </select>

                </div-->

            </div>

            </details>

            <div style="margin-bottom:' . $content_bottom_margin . '"></div>

          </div>

        </div>
      </div>

      <div style="margin-bottom:' . $window_bottom_margin . '"></div>

    </div>

    <div id="swipe-2" class="main-container">
      <!-- unused tab -->
    </div>

    <div id="swipe-3" class="on main-container" role="main">

        <div class="fixed-container"></div>
        <div class="content-wrapper">

          <div class="overflow-container" tabindex="-1">

            <h4 class="tab-title" id="app-tab-topics-title" style="font-family: ' . $font . ' !important; padding-bottom: 0.3em;">topics</h4>

            <div class="overflow-content">

              <details id="detail-structured-search" tabindex="0" title="structured search" style="/*display:none;*/">

                <summary><i title="structured search" class="fas fa-search" title="structured search"></i> <span id="app-structured-search-title"></span></summary>

                <div id="app"></div>
                <span id="query-builder-code">...</span>

              </details>

              <span id="total-results"></span>

              <div id="results" class="inner noselect"></div>

              <div id="scroll-end" style=display:none;></div>

              <div id="results-paging">

                <span id="pager" style="display:none;">
                  &nbsp; &nbsp;
                  <span id="results-label"> </span>
                  <a href="javascript:void(0)" id="next" class="sentinel" aria-label="next result page" class="jscroll-next" tabindex="-1"><i class="fa fa-chevron-right fa-2x"></i></a>
                  <div style="margin-bottom:' . $content_bottom_margin . '"></div>
                <span>

              </div>

            </div>

          </div>
        </div>

      <div style="margin-bottom:' . $window_bottom_margin . '"></div>

    </div>

    <div id="swipe-5" class="main-container">

      <div class="fixed-container"></div>
      <div class="content-wrapper">

        <div class="overflow-container" tabindex="-1">

          <div class="overflow-content">

            <h4 class="tab-title" id="app-tab-bookmarks-title" style="font-family: ' . $font . ' !important;">bookmarks &amp; notes</h4>

            <div id="jsontree" class="jsontree" style="display:none;">...</div>

            <div id="bookmarks" class="noselect">

              <div id="tree" class="block-style droptarget" ondrop="addBookmark(event, &quot;dropped&quot;)" ondragover="bookmarkAllowDrop(event)"></div>
            </div>

            <div style="margin-bottom:' . $content_bottom_margin . '"></div>

          </div>

        </div>
      </div>

      <div style="margin-bottom:' . $window_bottom_margin . '"></div>

    </div>


    <div id="swipe-7" class="main-container">

      <div class="fixed-container"></div>
      <div class="content-wrapper">

        <div class="overflow-container" tabindex="-1">

          <h4 class="tab-title" id="app-tab-tools-title" style="font-family: ' . $font . ' !important;">tools</h4>

          <div class="overflow-content indent">

            <div id="tools" class="noselect">

              <ul class="tool-items no-bullets">

                <li>
                 <details class="auto">
                  <summary><span id="app-menu-actions"></span></summary>
                    <ul class="indent2">
                      <li><span id="randomTopic"><a class="link" title="random topic" aria-label="random topic" onclick="showRandomQuery()" tabindex="0"><i class="fas fa-dice-three"></i>&nbsp; <span id="app-menu-random-topic"></span></a></span></li>
                      <li><span id="compareTopics"><a class="link compare" title="compare topics" aria-label="compare topics" href="javascript:void(0)" tabindex="0"><i class="fas fa-equals"></i>&nbsp; <span id="app-menu-compare-topics"></span></a></span></li>
                      <li><span id="goFullscreen"><a class="link" title="toggle fullscreen" aria-label="toggle fullscreen" onclick="toggleFullscreen()" tabindex="0"><i class="fas fa-expand-arrows-alt"></i>&nbsp; <span id="app-menu-toggle-fullscreen"></span></a></span></li>
                      <li><span id="addBookmark2"><a class="link" title="bookmark current URL" aria-label="bookmark current URL" onclick="addBookmark(event, &quot;clicked&quot; )" tabindex="0"><i class="far fa-bookmark"></i>&nbsp; <span id="app-menu-bookmark-current-url"></span></a></span></li>
                      <li><span id="cloneTab"><a class="link" title="clone tab" aria-label="clone tab" onclick="cloneTab()" tabindex="0"><i class="far fa-clone"></i>&nbsp; <span id="app-menu-clone-tab"></span></a></span></li>
                      <li style="display:none;"><span id="identifyPlant"><a class="link" title="identify a plant using an image" aria-label="identify a plant using an image" onclick="identifyPlant()" tabindex="0"><i class="fas fa-leaf"></i>&nbsp; <span id="app-menu-plant-identification"></span></a></span></li>
                      <li style="display:none;"><span id="identifyOCR"><a class="link" title="identify text using an image" aria-label="identify text using an image" onclick="identifyOCR()" tabindex="0"><i class="far fa-file-alt"></i>&nbsp; <span id="app-menu-text-identification"></span></a></span></li>
                    </ul>
                  </details> 
                </li>

                <li>
                 <details class="auto">
                  <summary><span id="app-menu-background-audio"></span></summary>
                  <div class="ambient-container">
                    <div class="column add-bottom">
                        <div id="mainwrap">
                            <div id="nowPlay">
                                <span class="left" id="npAction">Paused...</span>
                                <span class="right" id="npTitle"></span>
                            </div>
                            <div id="audiowrap">
                                <div id="player" controls>
                                    <audio id="audio1" preload="none" controls="controls">Your browser does not support HTML5 Audio!</audio>
                                </div>
                                <div id="tracks">
                                    <a id="btnPrev" tabindex="0"><i class="far fa-caret-square-left"></i></a>
                                    &nbsp; &nbsp;
                                    <a id="btnNext" tabindex="0"><i class="far fa-caret-square-right"></i></a>
                                </div>
                            </div>
                            <div id="plwrap">
                                <ul id="plList"></ul>
                            </div>
                        </div>
                    </div>
                    <p style="font-size:0.7em; margin-left:2em;">&#169; All rights belong to its creators.</p>
                  </div>
                </details> 
                </li>

                <li style="display:none;">
                 <details class="auto" onclick="insert_MIDI_app()">
                  <summary><span id="app-menu-background-midi"></span></summary>
                    <span id="midi-music-app-container"></span>
                  </details> 
                </li>

                <li style="display:none;">
                  <span id="tts-container"></span>
                </li>

                <li>
                 <details class="auto">
                  <summary><span id="app-menu-topic-lists"></span></summary>
                    <ul id="hexpages"></ul>
                  </details> 
                </li>

                <li>
                 <details class="">
                  <summary><span id="app-menu-various-links"></span></summary>
                    <ul>

                     <li>
                      <details class="auto indent2">
                        <summary><span id="app-menu-digital-libraries"></span></summary>
                        <ul class="indent2">

                          <li><a href="https://openlibrary.org/explore" target="infoframe" title="Open Library explore" aria-label="Open Library explore"><i class="fab fa-mizuni"></i> &nbsp; Open Library explore</a></li>
                          <li><a href="https://galaxy.opensyllabus.org" target="infoframe" title="Open Syllabus Galaxy" aria-label="Open Syllabus Galaxy"><i class="fab fa-mizuni"></i> &nbsp; Open Syllabus Galaxy</a></li>
                        </ul>
                      </details> 
                      </li>

                     <li>
                      <details class="auto indent2">
                        <summary>Wikimedia</summary>
                        <ul class="indent2">

                          <li><a href="https://meta.wikimedia.org/wiki/Wikimedia_projects" target="infoframe" title="Wikimedia projects" aria-label="Wikimedia projects"><i class="fas fa-globe"></i> &nbsp; Wikimedia projects</a></li>
                          <li><a href="https://stats.wikimedia.org/#/all-projects" target="infoframe" title="Wikimedia dashboard" aria-label="Wikimedia dashboard"><i class="fas fa-chart-bar"></i> &nbsp; Wikimedia dashboard</a></li>
                          <li><a href="https://wikidata-analytics.wmcloud.org/app_direct/WikidataAnalytics/" target="infoframe" title="wikiData dashboard" aria-label="wikiData dashboard"><i class="fas fa-chart-bar"></i> &nbsp; Wikidata dashboard</a></li>
                          <li><a href="https://m.wikidata.org/w/index.php?title=Wikidata:Tools&mobileaction=toggle_view_mobile" target="infoframe" title="Wikidata tools" aria-label="Wikidata tools"><i class="fas fa-tools"></i> &nbsp; Wikidata tools</a></li>
                          <li><a href="https://wdprop.toolforge.org/datatypes.html" target="infoframe" title="WDProp: Wikidata properties" aria-label="WDProp: wikidata dashboard"><i class="fas fa-tags"></i> &nbsp; Wikidata properties</a></li>
                          <li><a href="https://pltools.toolforge.org/rech/" target="infoframe" title="Wikidata edits" aria-label="Wikidata edits"><i class="fas fa-edit"></i> &nbsp; Wikidata edits</a></li>
                          <li id="show-live-edits">...</li>

                        </ul>
                      </details> 
                      </li>

                     <li>
                      <details class="auto indent2">
                        <summary><span id="app-menu-geography"></span></summary>
                        <ul class="indent2">

                          <li><a href="https://www.worldometers.info/population/" target="infoframe" title="Worldometer population stats" aria-label="Worldometer population stats"><i class="fas fa-users"></i> &nbsp; Worldometer population</a></li>
                          <li><a href="https://hungermap.wfp.org" target="infoframe" title="HungerMap" aria-label="HungerMap"><i class="fas fa-carrot"></i> &nbsp; UN HungerMap</a></li>
                          <li><a href="https://maps.digitalearth.africa/" target="infoframe" title="Digital Earth Africa" aria-label="Digital Earth: Africa"><i class="fas fa-globe-africa"></i> &nbsp; Digital Earth: Africa</a></li>
                          <li><a href="https://nsw.digitaltwin.terria.io/" target="infoframe" title="Digital Earth: Australia" aria-label="Digital Earth: Australia"><i class="fas fa-globe-africa"></i> &nbsp; Digital Earth: Austrialia</a></li>
                          <li><a href="https://twitter-trends.vercel.app" target="infoframe" title="Twitter-trends map" aria-label="Twitter-trends map"><i class="fab fa-twitter"></i> &nbsp; Twitter-trends map</a></li>
                        </ul>
                      </details> 
                      </li>

                    </ul>
                  </details> 
                </li>

              </ul>

              <div style="margin-bottom:' . $content_bottom_margin . '"></div>

            </div>

          </div>

        </div>
      </div>

      <div style="margin-bottom:' . $window_bottom_margin . '"></div>

    </div>


    <div id="swipe-6" class="main-container">

      <div class="fixed-container"></div>
      <div class="content-wrapper">

        <div class="overflow-container" tabindex="-1">

          <h4 class="tab-title" id="app-tab-help-title" style="font-family: ' . $font . ' !important;">help</h4>

          <div class="overflow-content indent">

            <details class="" closed>
              <summary><span id="app-menu-user-manual"></span></summary>
                <ul>
                  <li> &nbsp; <a href="https://conze.pt/guide" target="infoframe" title="guide" aria-label="docs"><i class="fas fa-book fa-2x"></i></a></li>
                </ul>
            </details>

            <details class="" closed>
              <summary><span id="app-menu-keyboard-shortcuts"></span></summary>
                <ol>
                  <li><kbd>f</kbd> &nbsp; <b><span id="app-menu-fullscreen-active-pane"></span></b></li>
                  <li><kbd>&darr;</kbd> &nbsp; <b><span id="app-menu-goto-next-topic"></span></b></li>
                  <li><kbd>&uarr;</kbd> &nbsp; <b><span id="app-menu-goto-previous-topic"></span></b></li>
                  <li><kbd>&rarr;</kbd> &nbsp; <b><span id="app-menu-goto-next-pane"></span></b></li>
                  <li><kbd>&larr;</kbd> &nbsp; <b><span id="app-menu-goto-previous-pane"></span></b></li>
                  <li><kbd>' . $alt_key . '</kbd> + <kbd>x</kbd> &nbsp; <b><span id="app-menu-new-search"></span></b> <sup>1</sup></li>
                  <li><kbd>' . $alt_key . '</kbd> + <kbd>y</kbd> &nbsp; <b><span id="app-menu-toggle-sidebar"></span></b> <sup>1</sup></li>
                  <li><kbd>' . $alt_key . '</kbd> + <kbd>i</kbd> &nbsp; <b><span id="app-menu-add-bookmark"></span></b> <sup>1</sup></li>
                  <li><kbd>' . $alt_key . '</kbd> + <kbd>r</kbd> &nbsp; <b><span id="app-menu-random-topic-key"></span></b> <sup>1</sup></li>
                </ol>
                &nbsp; <small>- <span id="app-menu-note-1"></span></small> <br/>
            </details>

            <details class="" closed>
              <summary><span id="app-menu-credits"></span></summary>
                  Conzept would not be possible without the integration of many free software components. See the list of <a href="https://conze.pt/guide/used_projects" target="infoframe" title="software integrations" aria-label="docs"><u>integrated software</u></i></a>.<br/>

                  Conzept has received funding through the <a href="https://nlnet.nl/project/Conzept/" target="_blank"><u>NLnet Foundation</u></a> (backed by the <a href="https://www.ngi.eu" target="_blank" title="organization"><u>NGI4eu</u></a> and EU Council vision and funds). Thank you for this support!
            </details>

            <details class="" closed>
              <summary><span id="app-menu-about"></span></span></summary>
                <ul>
                  <li>&nbsp; <span id="app-menu-version"></span>: vCONZEPT_VERSION</li>
                  <li>&nbsp; <span id="app-menu-made-by"></span>:
                  <li>&nbsp; &nbsp; Jama Poulsen</li>
                  <li>&nbsp; &nbsp; <a target="_blank" href="https://twitter.com/conzept__" aria-label="Twitter news">Twitter</a></li>
                  <li>&nbsp; &nbsp; <a target="_blank" href="https://github.com/waldenn/conzept" aria-label="Github">GitHub</a></li>
                </ul>
            </details>

            <!--details id="conzept-twitter-feed" class="">
              <summary>development news</summary>
                <div id="conzept-twitter-feed-container"><a class="twitter-timeline" data-dnt="true" href="https://twitter.com/conzept__?ref_src=twsrc%5Etfw"></a>
                <script src="https://platform.twitter.com/widgets.js" charset="utf-8" async></script></div>
            </details-->

          </div>

          <div style="margin-bottom:' . $content_bottom_margin . '"></div>

        </div>
      </div>

      <div style="margin-bottom:' . $window_bottom_margin . '"></div>

    </div>

  </span>
';

// mobile-device content pane structure
$framewrap_html = '
    <div id="frameWrap">
      <img id="loader" alt="loading" width="36" height="36" src="../app/explore2/assets/images/loading.gif"/>
      <iframe id="infoframe" name="infoframe" title="content-pane container" role="application" width="100%" height="99.0%" frameBorder="0" src="" allow="fullscreen"></iframe>
    </div>
 ';

// generate HTML output
echo '
  <!DOCTYPE html>
  <html lang="en">

  <!-- © Copyright 2019-2021 Jama Poulsen. All Rights Reserved. -->

  <head>

    <meta charset="utf-8" />

    <link rel="manifest" href="/manifest.json?vCONZEPT_VERSION">

    <!-- title -->
    <title>conzept encyclopedia</title>
    <meta name="description" content="Conzept is an attempt to create an encyclopedia for the 21st century. A modern topic-exploration tool based on Wikipedia, Wikidata, Open Library and many other information sources.">
    <meta property="og:title"  content="conzept encyclopedia">
    <meta property="twitter:title" content="conzept encyclopedia">
 
    <!-- url -->
    <link rel="canonical" href="https://conze.pt/explore">
    <meta property="og:url"  content="https://conze.pt/explore">
    <meta property="twitter:url" content="https://conze.pt/explore">

    <!-- description -->
    <meta name="description"         content="">
    <meta property="og:description"  content="">
    <meta property="twitter:description" content="">

    <!-- image -->
    <meta property="og:image"  content="../app/explore2/assets/images/front.jpg">
    <meta property="twitter:image" content="../app/explore2/assets/images/front.jpg">
    <meta name="twitter:card" content="summary_large_image"/>

    <!-- icons -->
    <link rel="shortcut icon" href="/favicon.ico" />

    <link rel="apple-touch-icon" sizes="180x180" href="/favs/apple-touch-icon.png">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-750x1294.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-1242x2148.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-1536x2048.png" media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-1668x2224.png" media="(min-device-width: 834px) and (max-device-width: 834px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-2048x2732.png" media="(min-device-width: 1024px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)">

    <!-- other meta tags -->
    <link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="conze.pt"/>
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=1, minimum-scale=1.0, maximum-scale=5.0">
    <meta name="referrer" content="no-referrer">
    <meta name="theme-color" content="#fbfaf9" />
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">

    <link rel="preconnect" href="https://www.wikidata.org" crossorigin>
    <link rel="preconnect" href="https://commons.wikimedia.org" crossorigin>
    <link rel="preconnect" href="https://upload.wikimedia.org" crossorigin>

    <noscript>
      <style type="text/css">
          .splash { display:none !important; }
      </style>
    </noscript>

    <link rel="" href="/fonts/quicksand/quicksand-v20-latin-ext_latin-regular.woff2" as="font" />
    <link rel="" href="/fonts/quicksand/quicksand-v20-latin-ext_latin-500.woff2" as="font" />

    <link id="fontlink">
';

// Any mobile device (phones or tablets).
if ( $viewMode == 'mobile' ){

  // iOS Safari style-fixes
  if ( strstr($ua_string, " AppleWebKit/") && strstr($ua_string, " Safari/") && !strstr($ua_string, " CriOS") ){

      echo '<link rel="stylesheet" href="../app/explore2/dist/css/conzept/mobile_safari.css?vCONZEPT_VERSION">';

  };

  echo '
    <link rel="stylesheet" href="../app/explore2/dist/css/various/swiper.min.css">
    <link rel="stylesheet" href="../app/explore2/dist/css/conzept/mobile_mode.css?vCONZEPT_VERSION">
  </head>

  <body class="mobile">

    ' . $splash . '

    <noscript>
      <div class="noscript-message">You dont have javascript enabled.</div>
    </noscript>

    <div class="swiper-container">

      <div class="swiper-wrapper">

        ' . $sticky_html . '

        <div class="swiper-slide s0"> <!-- menu --> ' . $settings_html . ' </div>

        <div id="doc" class="swiper-slide s1"> <!-- primary content frame --> ' . $framewrap_html . ' </div>

        <div id="doc2" class="swiper-slide s2"> <!-- secondary content frame 2 --> </div>

      </div>

      <div class="swiper-pagination"></div>

    </div>

    <script src="../app/explore2/libs/swiper.min.js?vCONZEPT_VERSION"></script>

    ' . $main_css . '
    ' . $main_script . '

  <body>';

}
else {

  echo '

  </head>

  <body>

    ' . $splash . '

    <noscript>
      <div class="noscript-message">You dont have javascript enabled.</div>
    </noscript>

    <div id="splitter">

      <div id="sidebar"> ' . $sticky_html . ' ' . $settings_html . ' </div>

      <div id="doc" style="-webkit-overflow-scrolling: touch!important;"> ' . $framewrap_html . ' </div>

    </div>

    ' . $main_css . '
    ' . $main_script . '

  </body>

  </html>
  ';

}

?>
