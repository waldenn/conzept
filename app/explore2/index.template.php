<?php

require_once 'php/Mobile_Detect.php';

$detect       = new Mobile_Detect;
$user_agent   = getenv("HTTP_USER_AGENT");

$viewMode     = '';
$font         = 'Hind'; // IBM Plex Sans Condensed', 'Quicksand';
$ua_string    = '';
$alt_key      = 'Alt';

$url_root     = "https://CONZEPT_HOSTNAMECONZEPT_WEB_BASE";

$window_bottom_margin   = '3rem';
$content_bottom_margin  = '3rem';

$splash       = '<style>body {overflow: hidden} .blink-splash { position: absolute; top: 54.3vh; left: 49.5vw; animation: blinker-splash 2s cubic-bezier(.1,0,.5,1) infinite alternate; color: #b62828; font-size: 300%; } @keyframes blinker-splash { from { opacity: 0.8; } to { opacity: 0; } }</style><span id="splash" style="position: absolute; top: 0; left: 0; height: 100%; width: 100%; background-color: #fbfaf9; background-image: url(../../assets/icons/splash.png); background-repeat:no-repeat; background-position: center center; z-index: 100000;"><span id="blink-splash" class="blink-splash" title="status: loading" style=""><i class="fa-solid fa-circle text-danger blink"></i></span></span>'; 

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

// locales
$locales = array_map('trim', explode(',', 'CONZEPT_LOCALES' ) );
asort( $locales );
$locale_options_html = '';
foreach ($locales as &$loc) {
  $locale_options_html .= '<option value="' . $loc . '">' . $loc . '</option>';
}

// AI tutors
$tutors = array_map('trim', explode(',', 'CONZEPT_AI_TUTORS' ) );
asort( $tutors );
$tutor_options_html = '';
foreach ($tutors as &$tutor) {
  $tutor_options_html .= '
                                          <option value="' . $tutor . '">' . $tutor . '</option>';
}

$main_css = '
  <!-- various 3rd-party CSS -->
  <link rel="stylesheet" href="../app/explore2/dist/css/various/materialize.min.css" type="text/css">
  <link rel="stylesheet" href="../assets/fonts/podcastfont/css/PodcastFont.css?v202306131635" type="text/css">
  <link rel="stylesheet" href="../assets/fonts/fontawesome/css/all.min.css?v6.5.1" type="text/css"> <!-- TODO: use with NPM, then remove fortawesome -->
  <link rel="stylesheet" href="../app/explore2/dist/css/openmoji/openmoji-black-awesome.css?v13.110" type="text/css"> <!-- contains custom patches to align with fontawesome -->
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
  <link rel="stylesheet" href="../app/explore2/node_modules/country-select-js/build/css/countrySelect.min.css" type="text/css">

  <!-- Conzept CSS -->
  <link rel="stylesheet" href="../app/explore2/dist/css/conzept/common.css?vCONZEPT_VERSION" type="text/css">
  <link rel="stylesheet" id="maincss" href="../app/explore2/dist/css/conzept/main.css?vCONZEPT_VERSION" type="text/css">
  <link rel="stylesheet"              href="../app/explore2/dist/css/conzept/theme_lattice.css?vCONZEPT_VERSION" type="text/css">
  <link rel="stylesheet"              href="../app/explore2/dist/css/conzept/theme_masonry.css?vCONZEPT_VERSION" type="text/css">
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
  <script src="../app/explore2/libs/jquery.drawPieChart.js?vCONZEPT_VERSION"></script> <!-- no NPM-package: https://github.com/av01d/fontselect-jquery-plugin -->
  <script src="../app/explore2/node_modules/jqtree/tree.jquery.js"></script>
  <script src="../app/explore2/node_modules/select2/dist/js/select2.min.js"></script>
  <script src="../app/explore2/libs/materialize.min.js?vCONZEPT_VERSION"></script> <!-- no NPM-package -->
  <script src="../app/explore2/node_modules/jquery-ui-dist/jquery-ui.min.js"></script>
  <script src="../app/explore2/node_modules/jquery-toast-plugin/dist/jquery.toast.min.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/node_modules/country-select-js/build/js/countrySelect.min.js?vCONZEPT_VERSION"></script>

  <!-- non-jQuery dependent scripts -->
  <script src="../app/explore2/libs/splitter.js?vCONZEPT_VERSION"></script> <!-- contains some custom code modifications -->
  <script src="../app/explore2/node_modules/urijs/src/URI.min.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/node_modules/immortal-db/dist/immortal-db.min.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/node_modules/banana-i18n/dist/banana-i18n.js"></script>
  <script src="../app/explore2/node_modules/mark.js/dist/mark.min.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/node_modules/numbro/dist/numbro.min.js"></script>
  <script src="../app/explore2/node_modules/katex/dist/katex.min.js" async></script>
  <script src="../app/explore2/node_modules/web-share-wrapper/dist/web-share-wrapper.min.js" async></script>
  <script src="../app/explore2/node_modules/proj4/dist/proj4.js" async></script>
  <script src="../app/explore2/node_modules/marked/marked.min.js" async></script>

  <script src="../app/explore2/libs/wikibase-sdk.min.js"></script> <!-- no dist-bundle in the NPM-package: https://www.npmjs.com/package/wikibase-sdk -->
  <script src="../app/explore2/libs/s-express-beautify.js" async></script> <!-- no dist-bundle in the NPM -->

  <!--script src="../app/explore2/dist/webcomponent/chat.js?vCONZEPT_VERSION" type="module"></script-->
  <!--chat-ai data-message="bla bla"></chat-ai-->

  <!--script src="../app/explore2/libs/weaviate.js?vCONZEPT_VERSION" async></script--> <!-- no NPM dist-package yet -->
  <!--script src="../app/explore2/node_modules/compromise/builds/compromise.js" async></script-->

  <!-- Scheme command-editor -->
  <script src="../app/explore2/node_modules/ace-builds/src-min/ace.js"></script>
  <script src="../app/explore2/node_modules/ace-builds/src-min/ext-language_tools.js"></script>
  <script src="../app/explore2/node_modules/@jcubic/lips/dist/lips.min.js" bootstrap></script>

  <!-- Conzept data scripts -->
  <script src="../app/explore2/dist/data/datasources.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/fields.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/iso2_codes.js"></script>
  <script src="../app/explore2/dist/data/languages.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/indicators.js?vCONZEPT_INDICATORS_VERSION"></script>
  <script src="../app/explore2/dist/data/countries.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/former_countries.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/economic_regions.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/tags.js?vCONZEPT_VERSION"></script>
  <!--script src="../app/explore2/dist/data/tags-ores.js?vCONZEPT_VERSION"></script-->
  <script src="../app/explore2/dist/data/chains.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/cover_data.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/osm_tags.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/playlist.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/music_by_year.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/sections.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/data/sections_init.js?vCONZEPT_VERSION"></script>

  <!-- Conzept core scripts -->
  <script src="../app/explore2/dist/core/env.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/core/show.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/core/utils.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/command/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/wikidata/setWikidata.js?vCONZEPT_VERSION"></script> <!-- NOTE: also used by other apps needing Wikidata-info such as Wikipedia -->

  <!-- TODO: include by PHP foreach datasource from the Conzept settings -->
  <script src="../app/explore2/dist/datasources/wikipedia/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/wikidata/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/gleif/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/ror/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/eu/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/archive/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/openlibrary/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/openalex/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/arxiv/index.js?vCONZEPT_VERSION"></script>
  <!--script src="../app/explore2/dist/datasources/archive_scholar/index.js?vCONZEPT_VERSION"></script-->
  <script src="../app/explore2/dist/datasources/gbif/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/openalex/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/doaj/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/smithsonian3D/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/commons/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/europeana/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/rijksmuseum/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/loc/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/occrp/index.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/datasources/gdelt/index.js?vCONZEPT_VERSION"></script>
  <!--script src="../app/explore2/dist/datasources/inaturalist/index.js?vCONZEPT_VERSION"></script-->
  <!--script src="../app/explore2/dist/datasources/rkd/index.js?vCONZEPT_VERSION"></script-->
  <!--script src="../app/explore2/dist/datasources/snomed/index.js?vCONZEPT_VERSION"></script-->

  <script src="../app/explore2/dist/core/createItemHtml.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/core/fetch_lib.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/core/fetches.js?vCONZEPT_VERSION"></script>
  <script src="../app/explore2/dist/core/lib.js?vCONZEPT_VERSION"></script> <!-- Conzept app core library -->
  <script src="../app/explore2/dist/core/main.js?vCONZEPT_VERSION"></script> <!-- Conzept app entry point -->

  <!-- tracker -->
  CONZEPT_TRACKER_HTML_INCLUDE

';

$sticky_html = '

  <div class="sticky" role="heading" aria-level="1" aria-label="sticky menu" role="button">

    <div id="logo-header">
      <span id="logox">
        <a href="javascript:void(0)" title="conzept home" onclick="showStartPage()" onauxclick="openInNewTab( &quot;https://conze.pt/explore&quot; );">conzept</a> 
        <span id="blink" title="status: loading"><i class="fa-solid fa-circle text-danger blink"></i></span>
      </span>
      <span class="active uls-trigger" tabindex="0" style="font-family: '. $font .';" title="language select" aria-label="language select" role="button"> <i class="fa-solid fa-caret-right"></i> </span>
    </div>

    <span class="nobreak">
      <label for="srsearch" style="display:none;">srsearch</label>
      <input id="srsearch" title="search input" type="search" enterkeyhint="search" autocomplete="off" class="form-control searchbox" placeholder="search" aria-label="search" role="searchbox">
      <span id="clearSearch"><a class="link clear" title="clear search" aria-label="clear search" role="button" href="javascript:void(0)"><i class="fa-solid fa-times" w=""></i></a></span>
      <span id="submitSearch"><a title="submit search" class="waves-effect waves-light btn-small submitSearch" aria-label="submit search" role="button" tabindex="0"><i class="fa-solid fa-search"></i></a></span>

      <div id="search-options" style="">&nbsp;

        <span class="search-option-label"><span id="app-menu-search-in">search in</span>: </span><select id="search-in" class="browser-default">
          <option value="none" selected></option>
          <option value="reference" id="app-menu-search-in-option-reference">reference works</option>
          <option value="culture" id="app-menu-search-in-option-culture">culture</option>
          <option value="science" id="app-menu-search-in-option-science">science</option>
          <option value="business" id="app-menu-search-in-option-business">business</option>
        </select>

        <span class="search-option-label"><span id="app-menu-filter-by">filter by</span>: </span><select id="filterby" class="browser-default">
          <option value="none" selected></option>
          <option value="text" id="app-menu-filter-by-option-text">text</option>
          <option value="image" id="app-menu-filter-by-option-image">image</option>
          <option value="video" id="app-menu-filter-by-option-video">video</option>
          <option value="audio" id="app-menu-filter-by-option-audio">audio</option>
          <option value="data" id="app-menu-filter-by-option-data">data</option>
          <option value="3D" id="app-menu-filter-by-option-3D">3D</option>
          <option value="software" id="app-menu-filter-by-option-software">software</option>
          <option value="archive" id="app-menu-filter-by-option-archive">archive</option>
          <option value="entity" id="app-menu-filter-by-option-entity">entity</option>
        </select>

        <span class="search-option-label"><span id="app-menu-sort-by">sort by</span>: </span>
          <select id="sortby" class="browser-default">
            <option value="none" selected></option>
            <option value="relevance-desc" id="app-menu-sort-by-option-relevance-desc">relevance ↓ </option>
            <option value="relevance-asc" id="app-menu-sort-by-option-relevance-asc">relevance ↑</option>
            <option value="date-desc" id="app-menu-sort-by-option-date-desc">date ↓</option>
            <option value="date-asc" id="app-menu-sort-by-option-date-asc">date ↑</option>
            <option value="update-desc" id="app-menu-sort-by-option-update-desc">update ↓</option>
            <option value="update-asc" id="app-menu-sort-by-option-update-asc">update ↑</option>
            <option value="random" id="app-menu-sort-by-option-random">random</option>
            <option value="citations-desc" id="app-menu-sort-by-option-citations-desc">citations ↓</option>
            <option value="citations-asc" id="app-menu-sort-by-option-citations-asc">citations ↑</option>
            <option value="title-asc" id="app-menu-sort-by-option-title-asc">title ↑</option>
            <option value="title-desc" id="app-menu-sort-by-option-title-desc">title ↓</option>
            <option value="distance-asc" id="app-menu-sort-by-option-distance-asc">distance ↑</option>
            <option value="distance-desc" id="app-menu-sort-by-option-distance-desc">distance ↓</option>
          </select>

        <span class="search-option-label" style="display:none;"><span id="year-range-test">
          <span id="app-menu-filter-by-year-range">year range</span>: </span>
            <input id="year-range-start" class="browser-default" type="number" step="1" min="-9000" max="2024" value="" onKeyPress="if(this.value.length===5) return false;" />—<input id="year-range-end" class="browser-default" type="number" step="1" min="-9000" max="2024" value="" onKeyPress="if(this.value.length===5) return false;" />
        </span>

      </div>

    </span>

    <ul id="tabs-swipe-demo" class="tabs">
      <!--li class="tab col s3  topics-button" title="topics"><a id="tab-head-topics" href="#swipe-2" aria-label="topics tab" role="button"><i class="fa-solid fa-bars"></i></a></li-->
      <li class="tab col s3" title="topics"><a id="tab-head-concepts" class="active" href="#tab-topics" aria-label="topics tab" role="button"><i class="fa-solid fa-bars"></i></a></li>
      <li class="tab col s3" title="bookmarks"><a id="tab-head-bookmarks" href="#tab-bookmarks" aria-label="bookmarks tab" role="button"><i class="fa-regular fa-note-sticky"></i></a></li>
      <li class="tab col s3" style="display: none;" title="audio chat" onclick="insert_audio_chat_app()"><a id="tab-head-audio-chat" href="#tab-audio-chat" aria-label="audio-chat tab" role="button"><i class="fa-regular fa-comments"></i></a></li>
      <li class="tab col s3" title="tools"><a id="tab-head-tools" href="#tab-tools" aria-label="tools tab" role="button"><i class="fa-solid fa-wrench"></i></a></li>
      <li class="tab col s3" title="settings"><a id="tab-head-settings" href="#tab-settings" aria-label="settings tab" role="button"><i class="fa-solid fa-cog"></i></a></li>
      <li class="tab col s3" title="help"><a id="tab-head-help" href="#tab-help" aria-label="help tab" role="button"><i class="fa-solid fa-question"></i></a></li>

      <li class="tab col s3 global-action" id="toggle-fullscreen" style="float:right; display: inline-block; text-align: center; line-height: 48px; height: 48px; padding: 0; margin: 0; text-transform: uppercase;"><a class="link" tabindex="0" title="toggle fullscreen (main app)" aria-label="toggle fullscreen (main app)" role="button" onclick="toggleFullscreen();"><i class="fa-solid fa-expand"></i>&nbsp; <span id="app-menu-fullscreen-main-app"></span></a></li>

      <li class="tab col s3 global-action" style="float:right; display: inline-block; text-align: center; line-height: 48px; height: 48px; padding: 0; margin: 0; text-transform: uppercase;"><span id="addBookmark2"><a class="link" tabindex="0" title="bookmark current view" aria-label="bookmark current view" role="button" onclick="addBookmark(event, &quot;clicked&quot;, true )"><i class="far fa-bookmark"></i>&nbsp; <span id="app-menu-bookmark-current-url"></span></a></span></li>

    </ul>

  </div>
';

$settings_html = '

  <span class="noselect">

    <div id="tab-settings" class="main-container">

      <div class="fixed-container"></div>

      <div class="content-wrapper">

        <div class="overflow-container" tabindex="-1">

          <div class="tab-title" id="app-tab-settings-title" style="font-family: ' . $font . ' !important;">settings</div>

          <div class="overflow-content indent">

            <details class="auto conf" closed>
              <summary><span id="app-menu-datasources">datasources</span>
                <a class="doclink" target="infoframe" title="help" aria-label="help" href="/guide/user_manual#datasources" onclick="resetIframe()"><i class="fa-regular fa-circle-question"></i></a>
              </summary>

              <div class="style-form">
                <span id="datasources-setting">...</span>
              </div>

            </details>

            <details class="auto conf" closed>
              <summary><span id="app-menu-features">features</span></summary>

              <div class="style-form">

                <div id="structured-search-setting" class="switch">
                  <label for="structured-search" style="display:none;">structured search</label> 
                  <label>
                  <input type="checkbox" id="structured-search">
                  <span class="lever"></span>
                  <span id="app-menu-structured-search">structured search</span> (Wikidata)
                  </label>
                  <br/>
                </div>

                <div id="geospatial-search-setting" class="switch">
                  <label for="geospatial-search" style="display:none;">geospatial search</label> 
                  <label>
                  <input type="checkbox" id="geospatial-search">
                  <span class="lever"></span>
                  <span id="app-menu-geospatial-search">geospatial search</span>
                  </label>
                  <br/>
                </div>

                <div id="aichat-setting" class="switch">
                  <label for="aichat" style="display:none;">AI chat</label> 
                  <label>
                  <input type="checkbox" id="aichat">
                  <span class="lever"></span>
                  <span id="app-menu-aichat">AI chat</span>
                  </label>
                  <br/>
                </div>

              </div>

            </details>

            <details class="auto conf" closed>
              <summary><span id="app-menu-api-keys">API keys</span>
                <!--a class="doclink" target="infoframe" title="help" aria-label="help" href="/guide/user_manual#api_keys" onclick="resetIframe()"><i class="fa-regular fa-circle-question"></i></a-->
              </summary>

              <div class="style-form">

                <div class="switch">

                  <label style="display:inline;" for="openai_api_key">OpenAI:</label>
                  <input type="text" id="openai_api_key" class="validate apikey" name="openai_api_key" minlength="8" required />

                </div>

              </div>

            </details>



            <details class="auto conf" closed>
              <summary><span id="app-menu-theme"></span>
                <a class="doclink" target="infoframe" title="help" aria-label="help" href="/guide/user_manual#theme" onclick="resetIframe()"><i class="fa-regular fa-circle-question"></i></a>
              </summary>

              <div class="style-form">

                <div id="theme-setting">
                  <label style="display:inline;" for="theme"><span id="app-menu-theme">theme</span>: &nbsp;</label>
                  <select id="theme" width="20px">
                    <option value="none">none</option>
                    <option value="pillar">pillar</option>
                    <option value="lattice">lattice</option>
                    <option value="masonry">masonry</option>
                  </select>

                </div>

                <div id="cover-topic-setting">
                  <label style="display:inline;" for="covertopic"><span id="app-menu-cover-topic">cover topic</span>: &nbsp;</label>
                  <select id="covertopic" width="20px">
                    <option value="none">none</option>
                  </select>

                </div>

                <div id="darkmode-setting" class="switch">
                  <label for="darkmode" style="display:none;">darkmode</label> 
                  <label>
                  <input type="checkbox" id="darkmode">
                  <span class="lever"></span>
                  <span id="app-menu-darkmode"></span>
                  </label>
                </div>

                <div id="linkpreview-setting" class="switch">
                  <label for="linkpreview" style="display:none;">linkpreview</label> 
                  <label>
                  <input type="checkbox" id="linkpreview">
                  <span class="lever"></span>
                  <span id="app-menu-link-preview"></span>
                  </label>
                  <br/>
                </div>

            </div>

            </details>

            <details class="auto conf" style="" closed>
              <summary><span id="app-menu-font-size"></span></summary>

                <div class="fontsizestyle" style="margin-left: 1.2em;">
                  <div id="fontsize"></div>
                  <label for="fontsizer" style="display:none;">fontsizer</label>
                  <input id="fontsizer" type="range" min="1" max="50" step="0.1">
                </div>

            </details>

            <details class="auto conf" style="" closed>
              <summary><span id="app-menu-font-type"></span></summary>

              <div class="style-form">
                <label for="font1" style="display:none;">font1</label> 
                <input id="font1" class="browser-default" type="text"/>
              </div>

            </details>

            <details class="auto conf" closed>
              <summary><span id="app-menu-interface-language"></span></summary>

              <div class="style-form">

                <div class="switch">

                  <label style="display:inline;" for="locale"><span id="app-menu-locale"></span>: &nbsp;</label>
                  <select id="locale" width="20px" style="top: 0px !important;">
                    <option value="">select locale</option>' .
                    $locale_options_html .
                  '</select>

               </div>

              </div>

            </details>

            <details class="auto conf" closed>
              <summary><span id="app-menu-voice"></span>
                <a class="doclink" target="infoframe" title="help" aria-label="help" href="/guide/user_manual#voice" onclick="resetIframe()"><i class="fa-regular fa-circle-question"></i></a>
              </summary>

              <div class="style-form">

                <div class="switch">

                  <label style="display:inline;" for="voices"><span id="app-menu-style"></span>: &nbsp;</label>
                  <select id="voices" class="browser-default" width="20px" style="top: 0px !important;">
                  </select>

                  <br/><br/>

                  <label style="display:inline;" for="voice-rate"><span id="app-menu-speed"></span>: <span id="voicerate"></span></label>
                  <input id="voice-rate" type="range" min="0.5" max="1.5" step="0.01" value="1">

                  <br/><br/>

                  <label style="display:inline;" for="voice-pitch"><span id="app-menu-pitch"></span>: <span id="voicepitch"></span></label>
                  <input id="voice-pitch" type="range" min="0.5" max="1.5" step="0.01" value="1">

                  <br/><br/>

                  <label style="display:inline;" for="hear-voice"><span id="app-menu-hear-voice">hear voice</span>: &nbsp;</label>
                  <a class="waves-effect waves-light btn" id="hear-voice-button" tabindex="0" title="hear voice" aria-label="hear voice" role="button" onclick="hearVoice()"><i class="fa-solid fa-ear-listen fa-2x"></i></a> &nbsp;
                  <a class="waves-effect waves-light btn" id="stop-voice-button" tabindex="0" title="stop speaking" aria-label="stop speaking" role="button" onclick="stopSpeaking()"><i class="fa-solid fa-stop fa-2x"></i></a>

                </div>

              </div>

            </details>

            <details class="auto conf" closed>
              <summary><span id="app-menu-reading-assistance">reading assistance</span></summary>

              <div class="style-form">

                <div id="colorfilter-setting">

                  <label style="display:inline;" for="colorfilter"><span id="app-menu-color-filter"></span>: &nbsp;</label>
                  <select id="colorfilter" width="20px">
                    <option value="none">none</option>
                    <option value="grayscale">grayscale</option>
                    <option value="sepia">sepia</option>
                    <!--option value="invert">invert</option-->
                    <!--option value="reduced-constrast">reduced-constrast</option-->
                    <!--option value="blur">blur</option-->
                  </select>

                </div>

                <br/>

                <div id="bread-setting" class="switch">
                  <label for="bread" style="display:none;">bread</label> 
                  <label>
                  <input type="checkbox" id="bread">
                  <span class="lever"></span>
                  <span id="app-menu-bread">word-start bolding</span>
                  </label>
                </div>

                <br/>

              </div>

            </details>

            <details class="auto conf" closed>
              <summary><span id="app-menu-persona"></span>
                <a class="doclink" target="infoframe" title="help" aria-label="help" href="/guide/user_manual#persona" onclick="resetIframe()"><i class="fa-regular fa-circle-question"></i></a>
              </summary>

              <div class="style-form">

                <div id="tutor-setting">
                  <label style="display:inline;" for="tutor"><span id="app-menu-ai-tutor">AI tutor</span> &nbsp;</label></br>
                  <span class="indent-select-widget">
                    <select id="tutor" width="20px" style="top: 0px !important;">
                      <option value="">select AI tutor</option>' .
                      $tutor_options_html .
                    '</select>
                  </span>
                </div>
                <br/>

                <div id="country-setting">
                  <label style="display:inline;" for="country-select"><span id="app-menu-country-select"></span> &nbsp;</label></br>
                  <input type="text" id="country-select">
                </div>
                <br/>

                <div id="persona-setting">
                  <label style="display:inline;" for="persona-select"><span id="app-menu-interests"></span> </br>&nbsp;</label>
                  <span class="indent-select-widget persona-indent-fix">
                    <select id="persona-select" width="20px" multiple>
                      <option value="none">none</option>
                      <option value="nomad">nomad</option>
                      <option value="tourist">tourist</option>
                      <option value="student">student</option>
                      <option value="academic">academic</option>
                    </select>
                  </span>
                </div>
                <br/>

              </div>

            </details>

            <div style="margin-bottom:' . $content_bottom_margin . '"></div>

          </div>

        </div>
      </div>

      <div style="margin-bottom:' . $window_bottom_margin . '"></div>

    </div>

    <!--div id="swipe-2" class="main-container">
    </div-->

    <div id="tab-topics" class="on main-container" role="main">

        <div class="fixed-container"></div>
        <div class="content-wrapper">

          <div class="overflow-container" tabindex="-1">

            <div class="tab-title" id="app-tab-topics-title" style="font-family: ' . $font . ' !important; padding-bottom: 0.3em;">topics</div>

            <div class="overflow-content">

              <details id="detail-structured-search" class="special-detail" title="structured search" style="display:none;">

                <summary>
                  <i title="structured search" class="fa-solid fa-search fa-flip-horizontal" title="structured search"></i> <span id="app-menu-structured-search-title">structured search</span>
                  <a class="doclink" target="infoframe" title="help" aria-label="help" href="/guide/user_manual#structured_search" onclick="resetIframe()"><i class="fa-regular fa-circle-question"></i></a>
                </summary>

                <div id="structured-query-output-type">
                  <label style="display:inline;" for="structured-query-output"><span id="app-menu-structured-query-output"></span>output as: &nbsp;</label>
                  <select id="structured-query-output" width="20px">
                    <option value=""></option>
                    <option value="sidebar" selected>sidebar topics</option>
                    <option value="table">table</option>
                    <option value="map">2D map</option>
                    <option value="map3d">3D map</option>
                    <option value="timeline">timeline</option>
                    <option value="geo-timeline">geo-timeline</option>
                    <option value="image">images</option>
                    <option value="graph">graph</option>
                    <option value="linkgraph">link-graph</option>
                  </select>
                </div>

                <div id="app"></div>
                <span id="query-builder-code">...</span>

              </details>

              <details id="detail-geospatial-search" class="special-detail" title="geospatial search" style="display:none;">

                <summary>
                  <i title="geospatial search" class="fa-solid fa-search fa-flip-horizontal" title="geospatial search"></i> <span id="app-menu-geospatial-search-title">geospatial search</span>
                  <a class="doclink" target="infoframe" title="help" aria-label="help" href="/guide/user_manual#geospatial_search" onclick="resetIframe()"><i class="fa-regular fa-circle-question"></i></a>
                </summary>

                  <div id="geospatial-search-container" class="resizer"></div>

              </details>

              <details id="detail-ai-chat" class="special-detail" title="AI chat" style="display:none;">

                <summary><i title="AI chat" class="fa-solid fa-wand-sparkles" title="AI chat"></i> <span id="app-ai-chat-title">AI chat</span></summary>

                  <div id="ai-chat-container" class="resizer"></div>

              </details>

              <span id="total-results"></span>

              <details id="detail-result-summary" class="special-detail" style="display:none;">
                <summary>
                  <i title="result summary" class="fa-solid fa-chart-pie"></i> <span id="app-menu-result-summary"></span>
                  <!--a class="doclink" target="infoframe" title="help" aria-label="help" href="/guide/user_manual#result_summary" onclick="resetIframe()"><i class="fa-regular fa-circle-question"></i></a-->
                </summary>

                <div id="pieChart" class="pieChart"></div>
              </details>

              <div id="results" class="inner noselect"></div>

              <div id="scroll-end" style=display:none;></div>

              <div id="results-paging">

                <span id="pager" style="display:none;">
                  &nbsp; &nbsp;
                  <span id="results-label"> </span>
                  <a href="javascript:void(0)" id="next" class="sentinel" aria-label="next result page" role="button" class="jscroll-next" tabindex="-1"><i class="fa-solid fa-chevron-right fa-2x"></i></a>
                  <div style="margin-bottom:' . $content_bottom_margin . '"></div>
                <span>

              </div>

            </div>

          </div>
        </div>

      <div style="margin-bottom:' . $window_bottom_margin . '"></div>

    </div>

    <div id="tab-bookmarks" class="main-container">

      <div class="fixed-container"></div>
      <div class="content-wrapper">

        <div class="overflow-container" tabindex="-1">

          <div class="overflow-content">

            <div class="tab-title" id="app-tab-bookmarks-title" style="font-family: ' . $font . ' !important;">bookmarks &amp; notes</div>

            <div id="bookmark-add" class="noselect">

              <details class="auto">
                <summary><span id="app-menu-add-bookmark">add bookmark</span></summary>

                <label for="bookmark-add-title"><span id="app-menu-add-bookmark-title"></span>:</label>
                <input type="text" id="bookmark-add-title" name="bookmark-add-title"><br><br>

                <label for="bookmark-add-url"><span id="app-menu-add-bookmark-url"></span>:</label>
                <input type="text" id="bookmark-add-url" name="bookmark-add-url"><br><br>

                <label for="bookmark-image-upload"><span id="app-menu-add-bookmark-images"></span>:</label>
                <div id="bookmark-image-upload" class="image-upload">
                  <input id="image-upload" type="file" multiple onchange="showBookmarkFiles()" accept="image/*">
                </div>
                <ul id="clear-preview" onclick="clearImagePreview()"><i class="fa-solid fa-xmark"></i> <span id="app-menu-add-bookmark-clear-files">clear files</span></ul>

                <ul id="preview"></ul>

                <button><span id="app-menu-bookmark-submit">add bookmark</span></button>

              </detail>

            </div>

            <div id="bookmarks-export" class="noselect">

              <details class="auto">
                <summary><span id="app-menu-export-as">export bookmarks</span></summary>

                &nbsp;<i class="fa-solid fa-file-export"></i>
                <a title="export bookmarks to JSON" tabindex="0" onclick="exportBookmarks(&quot;json&quot;)"><kbd>JSON</kbd></a>
                <a title="export bookmarks to HTML" tabindex="0" onclick="exportBookmarks(&quot;html&quot;)"><kbd>HTML</kbd></a>
                <a title="export location bookmarks to KML" tabindex="0" onclick="exportBookmarks(&quot;kml&quot;)"><kbd>KML</kbd></a>
                <a title="export location bookmarks to GPX" tabindex="0" onclick="exportBookmarks(&quot;gpx&quot;)"><kbd>GPX</kbd></a>

              </detail>

            </div>


            <div id="bookmarks-import" class="noselect">

              <details class="auto">
                <summary><span id="app-menu-import-as">import bookmarks</span></summary>

                  <form id="json-upload" style="margin-left:1em;">
                    <label for="json-file" style="display:none;">json-file</label> 
                    <input type="file" id="json-file" accept=".json">
                    <button><span id="app-menu-upload-json">upload</span> JSON</button>
                  </form>

              </detail>

            </div>

            <div id="bookmarks-actions-container" class="noselect">
              <details class="auto" style="" closed="">
                <summary>
                  <span id="app-menu-bookmark-actions">bookmark-selection actions</span>
                  <a class="doclink" target="infoframe" title="help" aria-label="help" href="/guide/user_manual#bookmark_selection_actions" onclick="resetIframe()"><i class="fa-regular fa-circle-question"></i></a>
                </summary>

                <div id="bookmarks-actions-reasoning" class="noselect">
                  <details class="frontpage" style="" closed=""><summary><span id="app-menu-bookmark-actions-reasoning">reasoning</span></summary>
                    <div class="frontpage-grid-container">

                      <div class="bookmark-action"><a class="" title="teach me about these bookmark topics" aria-label="teach me about these bookmark topics" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;professor&quot;)"><span class="icon"><i class="fa-solid fa-graduation-cap fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-teach-topics">teach me</span></span></a></div>
                      <div class="bookmark-action"><a class="" title="quiz me on these bookmark topics" aria-label="quiz me on these bookmark topics" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;examinator&quot;)"><span class="icon"><i class="fa-regular fa-circle-question fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-quiz-topics">quiz me</span></span></a></div>
                      <div class="bookmark-action"><a class="" title="find bookmark related topics" aria-label="find bookmark related topics" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;advisor-related-topics&quot;)"><span class="icon"><i class="fa-solid fa-diagram-project fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-related-topics">related topics</span></span></a></div>
                      <div class="bookmark-action"><a class="" title="explain bookmark differences" aria-label="explain bookmark differences" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;advisor-topic-differences&quot;)"><span class="icon"><i class="fa-solid fa-circle-half-stroke fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-topic-differences">differences</span></span></a></div>
                      <div class="bookmark-action"><a class="" title="find bookmark commonalities" aria-label="find bookmark commonalities" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;advisor-topic-commonality&quot;)"><span class="icon"><i class="fa-solid fa-arrows-to-circle fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-commonalities">commonalities</span></span></a></div>
                      <div class="bookmark-action"><a class="" title="find bookmark similarities" aria-label="find bookmark c similarities" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;advisor-topic-similarity&quot;)"><span class="icon"><i class="fa-solid fa-rainbow fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-similarities">similarities</span></span></a></div>
                      <div class="bookmark-action"><a class="" title="find bookmark implications" aria-label="find bookmark implications" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;advisor-topic-implications&quot;)"><span class="icon"><i class="fa-solid fa-arrows-split-up-and-left fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-implications">implications</span></span></a></div>
                      <div class="bookmark-action"><a class="" title="explain bookmark history" aria-label="explain bookmark history" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;historian&quot;)"><span class="icon"><i class="fa-solid fa-clock-rotate-left fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-history">history</span></span></a></div>

                    </div>
                  </detail>
                </div>

                <div id="bookmarks-actions-media" class="noselect">
                  <details class="frontpage" style="" closed=""><summary><span id="app-menu-bookmark-actions-media">media</span></summary>
                    <div class="frontpage-grid-container">

                      <div class="bookmark-action"><a class="" title="show bookmark videos" aria-label="show bookmark videos" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;video&quot;)"><span class="icon"><i class="fa-solid fa-video fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-video">video</span></span></a></div>

                      <div class="bookmark-action"><a class="" title="search the Open Library" aria-label="search the Open Library" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;openlibrary&quot;)"><span class="icon"><i class="fa-brands fa-mizuni fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-openlibrary">Open Library</span></span></a></div>


                      <div class="bookmark-action"><a class="" title="recommended books" aria-label="recommended books" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;advisor-related-books&quot;)"><span class="icon"><i class="fa-solid fa-book-open fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-recommended-books">books</span></span></a></div>

                      <div class="bookmark-action"><a class="" title="find bookmark recommended science articles" aria-label="find bookmark recommended science articles" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;advisor-related-science-articles&quot;)"><span class="icon"><i class="fa-solid fa-graduation-cap fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-recommended-science-articles">research</span></span></a></div>

                      <div class="bookmark-action"><a class="" title="find bookmark related websites" aria-label="find bookmark related websites" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;advisor-related-websites&quot;)"><span class="icon"><i class="fa-solid fa-link fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-related-websites">related websites</span></span></a></div>

                      <div class="bookmark-action"><a class="" title="compare bookmarks as Wikidata topics" aria-label="compare bookmarks as Wikidata topics" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;command-compare&quot;)"><span class="icon"><i class="fa-solid fa-table-columns fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-compare-wikidata">Wikidata compare</span></span></a></div>

                      <div class="bookmark-action"><a class="" title="show bookmark linkgraph relations" aria-label="show bookmark linkgraph relations" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;command-linkgraph&quot;)"><span class="icon"><i class="fa-solid fa-link fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-linkgraph-relations">linkgraph</span></span></a></div>

                      <div class="bookmark-action"><a class="" title="show bookmark locations on a map" aria-label="show bookmark locations on a map" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;command-map&quot;)"><span class="icon"><i class="fa-regular fa-map fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-location-map">2D location map</span></span></a></div>

                      <div class="bookmark-action"><a class="" title="show bookmark locations on a 3D map" aria-label="show bookmark locations on a 3D map" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;command-map3d&quot;)"><span class="icon"><i class="fa-solid fa-globe-americas fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-location-map3d">3D location map</span></span></a></div>

                      <div class="bookmark-action"><a class="" title="show bookmark images" aria-label="show bookmark images" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;command-image&quot;)"><span class="icon"><i class="fa-regular fa-images fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-images">images</span></span></a></div>

                      <div class="bookmark-action"><a class="" title="search Bing" aria-label="search Bing" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;command-web&quot;)"><span class="icon"><i class="fa-brands fa-searchengin fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-web-search">web search</span></span></a></div>

                      <div class="bookmark-action"><a class="" title="Gapminder country linechart" aria-label="Gapminder country linechart" role="button" href="javascript:void(0)" onclick="runBookmarkAction(&quot;command-gapminder-linechart&quot;)"><span class="icon"><i class="fa-solid fa-chart-line fa-2x"></i></span><br><span class="frontpage-icon"><span id="app-guide-bookmark-gapminder-country-trend">country trend</span></span></a></div>

                    </div>
                  </detail>
                </div>

              </detail>
            </div>

            <hr class="menu-separator">

            <!--input id="bookmark-search" placeholder="bookmark search..." /-->

            <div id="bookmark-selection-info-container">
              &nbsp;<span id="bookmark-selection-count"></span> <span id="app-guide-bookmarks-selected">selected</span>
              &nbsp;<span id="bookmark-deselect-all-container">(<a class="" title="deselect all bookmarks" aria-label="deselect all bookmarks" role="button" href="javascript:void(0)" onclick="deselectAllBookmarks( event )"><span id="app-guide-bookmarks-deselect-all">deselect all</span></span></a>)</span>
              </span>
            </div>

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


    <div id="tab-tools" class="main-container">

      <div class="fixed-container"></div>
      <div class="content-wrapper">

        <div class="overflow-container" tabindex="-1">

          <div class="tab-title" id="app-tab-tools-title" style="font-family: ' . $font . ' !important;">tools</div>

          <div class="overflow-content indent">

            <div id="tools" class="noselect">

              <ul class="tool-items no-bullets">

                <li id="presentation-container">
                 <details id="presentation-detail" class="auto" onclick="" style="">
                  <summary>
                    <span id="app-menu-presentation"></span>
                    <a class="doclink" target="infoframe" title="help" aria-label="help" href="/guide/user_manual#topic_presentations" onclick="resetIframe()"><i class="fa-regular fa-circle-question"></i></a>
                  </summary>

                    <select id="presentation-tts-sections" class="browser-default"></select>

                    <div class="topic-tts-buttons" style="text-align:left;"><a id="presentation-tts-start" href="javascript:void(0)" title="speak article" aria-label="speak article" role="button" onclick=""> <span class="icon"><i class="fa-solid fa-play" style="position:relative;"><span class="subtext"></span></i></span> </a><a href="javascript:void(0)" title="pause speaking" aria-label="pause speaking" role="button" onclick="pauseSpeakingArticle()"> <span class="icon"><i class="fa-solid fa-pause" style="position:relative;"><span class="subtext"></span></i></span> </a><a href="javascript:void(0)" title="stop speaking" aria-label="stop speaking" role="button" onclick="stopSpeakingArticle()"> <span class="icon"><i class="fa-solid fa-stop" style="position:relative;"><span class="subtext"></span></i></span> </a></div>

                    <div class="resizer">

                      <iframe id="presentation" class="resized" title="presentation" role="application" loading="lazy" style="min-height: 401px" srcdoc="" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen="" allow-downloads="" width="95%" height="100%" loading="lazy">
></iframe>
                    </div>
                  </details> 

                </li>

                <li id="editor-container">
                 <details id="editor-detail" class="auto" onclick="" style="">
                  <summary>
                    <span id="app-menu-editor"></span>
                    <a class="doclink" target="infoframe" title="help" aria-label="help" href="/guide/command_api" onclick="resetIframe()"><i class="fa-regular fa-circle-question"></i></a>
                  </summary>
                    <div class="editor-buttons">
                      <a id="editor-run" href="javascript:void(0)" title="run code" aria-label="run code" role="button" onclick="if ( screenfull.isFullscreen ){ screenfull.exit(); } runLISP( explore.editor.getValue() )"><i class="fa-solid fa-play"></i> <span id="app-menu-run-code"></spam></a> 
                      <a id="editor-clear" href="javascript:void(0)" title="clear code" aria-label="clear code" role="button" onclick="runLISP( explore.editor.setValue(&quot;&quot;) )"><i class="fa-regular fa-trash-can"></i> <span id="app-menu-clear-editor"></span></a> &nbsp;
                      <a id="editor-fullscreen" href="javascript:void(0)" title="toggle fullscreen editor" aria-label="toggle fullscreen editor" role="button" onclick="if ( screenfull.isFullscreen ){ screenfull.exit(); } else { screenfull.request( document.getElementById(&quot;editor-detail&quot;) ); }"><i class="fa-solid fa-expand"></i></a> &nbsp;
                    </div>
                    <pre id="editor"></pre>
                  </details> 
                </li>

                <li>
                 <details class="auto">
                  <summary><span id="app-menu-actions"></span></summary>
                    <ul class="indent2">
                      <li><span id="cloneTab"><a class="link" title="clone tab" aria-label="clone tab" role="button" onclick="cloneTab()" tabindex="0"><i class="fa-regular fa-clone"></i>&nbsp; <span id="app-menu-clone-tab"></span></a></span></li>
                      <li><span id="randomTopic"><a class="link" title="random topic" aria-label="random topic" role="button" onclick="showRandomQuery()" tabindex="0"><i class="fa-solid fa-dice-three"></i>&nbsp; <span id="app-menu-random-topic"></span></a></span></li>
                      <li><span id="compareTopics"><a class="link compare" title="compare topics" aria-label="compare topics" role="button" href="javascript:void(0)" tabindex="0"><i class="fa-solid fa-equals"></i>&nbsp; <span id="app-menu-compare-topics"></span></a></span></li>
                      <li><span id="goFullscreen"><a class="link" title="toggle fullscreen" aria-label="toggle fullscreen" role="button" onclick="toggleFullscreen()" tabindex="0"><i class="fa-solid fa-expand"></i>&nbsp; <span id="app-menu-toggle-fullscreen"></span></a></span></li>

                      <!--li><span id="visualSearch"><a class="link" href="https://www.bing.com/visualsearch" target="infoframe" onclick="resetIframe()" title="Bing visual search" aria-label="Bing visual search" role="button" tabindex="0"><i class="fa-solid fa-camera"></i>&nbsp; <span id="app-menu-visual-search">visual search</span></a> <small>(Bing)</small></span></li-->

                      <!--li><span id="tldraw"><a class="link" href="/app/tldraw/apps/examples/dist/" target="infoframe" onclick="resetIframe()" title="tldraw drawing tool" aria-label="tldraw drawing tool" role="button" tabindex="0"><i class="fa-solid fa-paintbrush"></i> drawing</a> <small></small></span></li-->

                      <li><span id="nature location quiz"><a class="link" href="/app/quiz/location-nature/index.html" target="infoframe" onclick="resetIframe()" title="nature location quiz" aria-label="nature location quiz" role="button" tabindex="0"><i class="fa-solid fa-puzzle-piece"></i> <span id="app-menu-nature-location-quiz">visual search</span></a> <small></small></span></li>

                      <!--li><span id="transcribe-speech"><a class="link" href="/app/speech/dist/" target="infoframe" onclick="resetIframe()" title="Speech audio transcribing tool" aria-label="Speech audio transcribing tool" role="button" tabindex="0"><i class="fa-solid fa-microphone"></i> speech transcription</a> <small>(experiment)</small></span></li-->

                      <!--li style="display:none;"><span id="identifyPlant"><a class="link" title="identify a plant using an image" aria-label="identify a plant using an image" role="button" onclick="identifyPlant()" tabindex="0"><i class="fa-solid fa-leaf"></i>&nbsp; <span id="app-menu-plant-identification"></span></a></span></li>
                      <li style="display:none;"><span id="identifyOCR"><a class="link" title="identify text using an image" aria-label="identify text using an image" role="button" onclick="identifyOCR()" tabindex="0"><i class="fa-regular fa-file-alt"></i>&nbsp; <span id="app-menu-text-identification"></span></a></span></li-->

                      <li> <web-share-wrapper text="share" sharetext="share this"> <!--a href="https://twitter.com/intent/tweet/?text=Check%20out%20%40philnashs%20web-share-wrapper%20web%20component&amp;url=https%3A%2F%2Fgithub.com%2Fphilnash%2Fweb-share-wrapper">Share on Twitter</a--> </web-share-wrapper> </li>

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
                                    <a id="btnPrev" tabindex="0"><i class="fa-regular fa-caret-square-left"></i></a>
                                    &nbsp; &nbsp;
                                    <a id="btnNext" tabindex="0"><i class="fa-regular fa-caret-square-right"></i></a>
                                </div>
                            </div>
                            <details class="audio-list-container">
                              <summary title="default audio tracks"><i class="fa-solid fa-list"></i></summary>
                              <div id="plwrap">
                                  <ul id="plList"></ul>
                              </div>
                              <p style="font-size:0.7em; margin-left:2em;">&#169; All rights belong to its creators.</p>
                            </details>
                        </div>
                    </div>
                  </div>
                </details> 
                </li>

                <li style="display:none;">
                  <span id="tts-container"></span>
                </li>

              </ul>

              <div style="margin-bottom:' . $content_bottom_margin . '"></div>

            </div>

          </div>

        </div>
      </div>

      <div style="margin-bottom:' . $window_bottom_margin . '"></div>

    </div>


    <div id="tab-audio-chat" class="main-container">

      <div class="fixed-container"></div>
      <div class="content-wrapper">

        <div class="overflow-container" tabindex="-1">

          <div class="tab-title" id="app-tab-audio-chat-title" style="font-family: ' . $font . ' !important;">audio chat</div>

          <div class="overflow-content indent">

            <span id="audio-chat-app-container"><span>

          </div>

          <div style="margin-bottom:' . $content_bottom_margin . '"></div>

        </div>
      </div>

      <div style="margin-bottom:' . $window_bottom_margin . '"></div>

    </div>


    <div id="tab-help" class="main-container">

      <div class="fixed-container"></div>
      <div class="content-wrapper">

        <div class="overflow-container" tabindex="-1">

          <div class="tab-title" id="app-tab-help-title" style="font-family: ' . $font . ' !important;">help</div>

          <div class="overflow-content indent">

            <details class="auto conf" closed>
              <summary><span id="app-menu-inline-help">inline help</span></summary>

                <div id="showhelp-setting" class="switch">
                  <label for="showhelp" style="display:none;">show help</label>
                  <label>
                  <input type="checkbox" id="showhelp">
                  <span class="lever"></span>
                  <span id="app-menu-show-inline-help">show inline help</span>
                  </label>
                </div>

            </details>

            <details class="" closed>
              <summary><span id="app-menu-user-manual"></span></summary>
                <ul>
                  <li> &nbsp; <a href="https://CONZEPT_HOSTNAME/guide/user_manual" target="infoframe" onclick="resetIframe()" title="guide" aria-label="guide" role="button"><i class="fa-solid fa-book fa-2x"></i></a></li>
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
              <summary><span id="app-menu-about"></span></span></summary>

                <ul>
                  <li>&nbsp; <span id="app-menu-license"></span>: GNU Public License v3, <a target="infoframe" href="https://conze.pt/guide/used_projects"><i class="fa-solid fa-circle-plus"></i></a></li>
                  <!--li>&nbsp; <span id="app-menu-license"></span>: <a href="https://github1s.com/waldenn/conzept/blob/master/LICENSE" target="infoframe" onclick="resetIframe()" title="license" aria-label="docs" role="button">GNU GPL v3</a></li-->
                  <li>&nbsp; <span id="app-menu-version"></span>: vCONZEPT_VERSION</li>
                  <li>&nbsp; <span id="app-menu-made-by"></span>:
                  <li>&nbsp; &nbsp; Jama Poulsen</li>
                  <li>&nbsp; &nbsp; <a target="_blank" href="https://twitter.com/conzept__" aria-label="Twitter news" role="button"><i class="fa-brands fa-twitter"></i> Twitter</a></li>
                  <li>&nbsp; &nbsp; <a target="_blank" href="https://github.com/waldenn/conzept" aria-label="GitHub" role="button"><i class="fa-brands fa-github"></i> GitHub</a></li>
                  <li>&nbsp; &nbsp; <a target="_blank" href="https://github.com/sponsors/waldenn?o=esb" aria-label="GitHub sponsor" role="button"><i class="fa-solid fa-heart"></i> sponsor</a></li>
                  <li>&nbsp; &nbsp; <a target="infoframe" onclick="resetIframe()" href="/privacy_policy.html" title="privacy policy" aria-label="privacy policy" role="button"><i class="fa-solid fa-section"></i> privacy policy</a></li>
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
  <!-- © Copyright 2019-2024 Jama Poulsen -->

  <head>
    <meta charset="utf-8" />

    <link rel="manifest" href="/manifest.json?vCONZEPT_VERSION">

    <!-- title -->
    <title>Conzept encyclopedia</title>
    <meta name="description" content="Conzept is an attempt to create an encyclopedia for the 21st century. A modern topic-exploration tool based on Wikipedia, Wikidata, Open Library and many other information sources."/>
    <meta property="og:title"  content="Conzept encyclopedia"/>
    <meta property="twitter:title" content="Conzept encyclopedia"/>
 
    <!-- url -->
    <link rel="canonical" href="https://conze.pt/explore" />
    <meta property="og:url"  content="https://conze.pt/explore" />
    <meta property="twitter:url" content="https://conze.pt/explore" />

    <!-- description -->
    <meta name="description"         content="conzept" />
    <meta property="og:description"  content="conzept" />
    <meta property="twitter:description" content="conzept" />

    <!-- image -->
    <meta property="og:image"  content="'. $url_root . '/app/explore2/assets/images/front.jpg" />
    <meta property="twitter:image" content="'. $url_root . '/app/explore2/assets/images/front.jpg" />
    <meta name="twitter:card" content="summary" />

    <!-- other -->
    <meta name="twitter:site" content="@conzept" />

    <!-- icons -->
    <link rel="shortcut icon" href="/favicon.ico" />

    <link rel="apple-touch-icon" sizes="180x180" href="/assets/favs/apple-touch-icon.png">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-750x1294.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-1242x2148.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-1536x2048.png" media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-1668x2224.png" media="(min-device-width: 834px) and (max-device-width: 834px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)">
    <link rel="apple-touch-startup-image" href="../../assets/icons/apple-2048x2732.png" media="(min-device-width: 1024px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)">

    <script id="ld-info" type="application/ld+json"></script>

    <!-- other meta tags -->
    <link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="conze.pt"/>
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=1, minimum-scale=1.0, maximum-scale=5.0">
    <meta name="referrer" content="no-referrer">
    <meta name="theme-color" content="#fbfaf9" />
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">

    <link rel="preconnect" href="https://www.wikidata.org" crossorigin />
    <link rel="preconnect" href="https://commons.wikimedia.org" crossorigin />
    <link rel="preconnect" href="https://upload.wikimedia.org" crossorigin />

    <noscript>
      <style type="text/css">
          .splash { display:none !important; }
      </style>
    </noscript>

    <link id="fontlink">
';

// Any mobile device (phones or tablets).
if ( $viewMode == 'mobile' ){

  // iOS Safari style-fixes
  if ( strstr($ua_string, " AppleWebKit/") && strstr($ua_string, " Safari/") && !strstr($ua_string, " CriOS") ){

      echo '<link rel="stylesheet" href="../app/explore2/dist/css/conzept/mobile_safari.css?vCONZEPT_VERSION">';

  };

  echo '
    <link rel="stylesheet" href="../app/explore2/dist/css/various/swiper.min.css?vCONZEPT_VERSION">
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
