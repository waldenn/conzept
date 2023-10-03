window.setupImageClicks = function(){

  $('img')
    //.not('.no-enlarge')
    .attr('loading', 'lazy')
    .addClass('enlargable');

  // see: https://lcweb.it/lc-lightbox/documentation
  const LC = lc_lightbox('.elem', {
    wrap_class: 'lcl_fade_oc',
    gallery : true,
    thumb_attr: false, // 'data-lcl-thumb', 
    tn_hidden: true,
    thumbs_nav: true,
    download: true,
    skin: 'minimal',
    counter: true,
    touchswipe: true,
    //fullscreen: false,
    //fs_only: true,
    //on_fs_exit: function(){ console.log('close LC'); close_lb(); }
  });

}

window.setupImageZoom = function(){ // using OpenSeaDragon

  // see: https://openseadragon.github.io/docs/
  $('#openseadragon').hide;

  window.viewer = OpenSeadragon({

    id: "openseadragon",

    prefixUrl: CONZEPT_WEB_BASE + '/app/explore2/node_modules/openseadragon/build/openseadragon/images/',

    tileSources: {
      type: 'image',
      url:  CONZEPT_WEB_BASE + '/app/explore2/assets/images/icon_home.png',
      crossOriginPolicy: 'Anonymous',
      ajaxWithCredentials: false,
      //maxZoomLevel: 10,
      //maxZoomPixelRatio: 2,
      //visibilityRatio: 0.2,
    },

    showNavigator:  true,
    navigatorSizeRatio: 0.25,

  });

  window.viewer.world.addHandler('add-item', function(event) {

    let tiledImage = event.item;

    tiledImage.addHandler('fully-loaded-change', fullyLoadedHandler);

    window.viewer.navigator.addTiledImage( {
     tileSource: tiledImage,
    });

  });

  window.viewer.setVisible(true);

}

window.fullyLoadedHandler = function() {

  $('#loader-openseadragon').hide();

}
