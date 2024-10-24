/**
 * The controller used when viewing an individual video.
 */

let player = '';

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event){

  //console.log('receiveMessage() called: ', event.data.data );

  if ( event.data.event_id === 'goto' ){ // move video-cursor to this point

    const start = event.data.data[0];

    player.seekTo( start );

  }

}

tooglesApp.controller('ViewCtrl', ['$scope', '$routeParams', '$location', 'youtube', function($scope, $routeParams, $location, youtube) {

  $scope.location = $location; // Access $location inside the view.
  $scope.showSidebar = true;
  $scope.showRelated = false;
  $scope.section = $location.path().split('/')[1];
  $scope.videoTab = $scope.section === 'view' ? 'Related' : 'Playlist';
  $scope.videos = [];

  /*
  if (localStorage.tooglesDarkMode === "true") {
    $scope.$parent.darkmode = true;
  }
  $scope.$watch('darkmode', function (newVal, oldVal, scope) {
    if (typeof newVal !== "undefined" && newVal !== "undefined") {
      localStorage.tooglesDarkMode = newVal;
    }
  });
  */

  youtube.fetchVideos($routeParams.id, function(response) {
    $scope.video = response.items[0];
    onYouTubeIframeAPIReady($scope.video.id, $scope.section);
    document.title = $scope.video.snippet.title + " | Toogles";
  });

  $scope.fetchRelated = function() {
    $scope.showRelated = true;
    youtube.relatedVideos($routeParams.id, function(response) {
      var ids = [];
      angular.forEach(response.items, function (item) {
        ids.push(item.id.videoId);
      });
      youtube.fetchVideos(ids, function (response) {
        $scope.videos = response.items;
      });
    });
  };

  $scope.formatDuration = function(seconds) {
    return youtube.formatDuration(seconds);
  };

  var started = false;

  if ($scope.$parent.darkmode) {
    var theme = 'dark';
    var color = 'black';
  } else {
    var theme = 'light';
    var color = 'white';
  }

  var onYouTubeIframeAPIReady = function(id, section) {

    var starttime = $routeParams.starttime || 0;

    var endtime = $routeParams.endtime || '';

    if ( typeof starttime === undefined || typeof starttime === 'undefined' || starttime === 0 ){

      // do nothing

    }
    else {

      // if the time-mark contains a colon ":": treat it as a hh:mm:ss time (and auto-convert to seconds)
      if ( starttime.includes( ':') ){

        starttime = starttime.split(':').reduce((acc,time) => (60 * acc) + +time);

      }

    }

    if ( typeof endtime === undefined || typeof endtime === 'undefined' || endtime === 0 ){

      // do nothing

    }
    else {

      if ( endtime.includes( ':') ){

        endtime = endtime.split(':').reduce((acc,time) => (60 * acc) + +time);

      }

    }

    //console.log( starttime, endtime );

      player = new YT.Player('player', {
      'videoId': id,
      'playerVars': {
        'autoplay': 1,
        'theme': theme,
        'color': color,
        'iv_load_policy': 3,
        'origin': 'https://conze.pt',
        'start': starttime,
        'end': endtime,
      },
      'events': {
        'onError': function(event) {
          if (event.data == 101 || event.data == 150) {
            $scope.video.restricted = 1;
          } else {
            $scope.video.deleted = 1;
          }
          $scope.$apply();
        },
        'onStateChange': function (event) {

          if (event.data === 0) {

            // console.log('video play ended');

            goWander = getParameterByName('wander') || false;

            if ( goWander ){

              //console.log('video ended: go to next topic-stream video');

              parent.postMessage({ event_id: 'next-wander-video', data: {  } }, '*' );

            }
            else { // check for next presentation-slide (may not be needed)

              parent.postMessage({ event_id: 'next-presentation-slide', data: { } }, '*' );

            }

          }

          if (event.data == 1) {
            started = true;
          }

          if (started && event.data == -1) {
            // When a new video is started in an existing player, open up its dedicated page.
            if (section === 'view') {
              var video_url = event.target.getVideoUrl();
              var video_id = video_url.replace('http://', '').replace('https://', '').replace('www.youtube.com/watch?v=', '').replace('&feature=player_embedded', '');
              window.location = '#/view/' + video_id;
            } else if (section === 'playlist') {
              window.location = '#/playlist/' + event.target.getPlaylistId() + '/' + event.target.getPlaylistIndex();
            }
          }
          else if (started && event.data == 0 && section === 'playlist') {
            var pathParts = $location.path().split('/');
            var playlistId = pathParts[2];
            if (pathParts[3]) {
              var videoNum = pathParts[3];
            } else {
              var videoNum = 0;
            }
            videoNum++;

            window.location = '#/playlist/' + playlistId + '/' + videoNum;
          }

        }
      }
    });

  };

  $scope.getLink = function(video) {
    return '#/view/' + video.id
  };

  $scope.averageRating = function(likeCount, dislikeCount) {
    return youtube.averageRating(likeCount, dislikeCount);
  }

}]);
