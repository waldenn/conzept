'use strict';

/**
 * conzept video
 *
 * Main module of the application.
 */
var tooglesApp = angular.module('tooglesApp', ['ngAnimate', 'ngAria', 'ngCookies', 'ngMessages', 'ngResource', 'ngRoute', 'ngSanitize', 'ngTouch'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/browse', { templateUrl: 'views/list.html', controller: 'ListCtrl' });
    $routeProvider.when('/browse/:category', { templateUrl: 'views/list.html', controller: 'ListCtrl' });
    $routeProvider.when('/search/:query', { templateUrl: 'views/list.html', controller: 'ListCtrl' });
    $routeProvider.when('/view/:id', { templateUrl: 'views/view.html', controller: 'ViewCtrl' });
    $routeProvider.when('/view/:id/:starttime', { templateUrl: 'views/view.html', controller: 'ViewCtrl' });
    $routeProvider.when('/view/:id/:starttime/:endtime', { templateUrl: 'views/view.html', controller: 'ViewCtrl' });
    $routeProvider.when('/playlist/:id', { templateUrl: 'views/view.html', controller: 'ViewCtrl' });
    $routeProvider.when('/playlist/:id/:start', { templateUrl: 'views/view.html', controller: 'ViewCtrl' });
    $routeProvider.when('/user/:username', { templateUrl: 'views/list.html', controller: 'ListCtrl' });
    $routeProvider.when('/user/:username/:feed', { templateUrl: 'views/list.html', controller: 'ListCtrl' });
    $routeProvider.otherwise({ redirectTo: '/browse' });
  }]);

/*
if ( detectMobile() === true ){
  setupSwipe( 'video-app' );
}
*/
/**
 * The controller used when searching/browsing videos.
 */

tooglesApp.controller('ListCtrl', ['$scope', '$routeParams', '$location', 'youtube', function($scope, $routeParams, $location, youtube) {
  $scope.location = $location;
  $scope.routeParams = $routeParams;
  $scope.searchsort = $location.search()['searchsort'] || false;
  $scope.searchduration = $location.search()['searchduration'] || false;
  $scope.searchdefinition = $location.search()['searchdefinition'] || false;
  $scope.searchdimension = $location.search()['searchdimension'] || false;
  $scope.eventtype = $location.search()['eventtype'] || 'completed';
  $scope.type = $location.search()['type'] || 'video';
  $scope.searchtype = $location.search()['searchtype'] || 'videos';
  $scope.section = $location.path().split('/')[1];
  $scope.page = 1;
  $scope.nextPageToken = '';
  $scope.usedTokens = [];
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

  $scope.categoryVideos = function() {
    document.title = 'Popular | video';
    youtube.categoryVideos($scope.nextPageToken, $routeParams.category, function(response) {
      $scope.nextPageToken = response.nextPageToken;
      $scope.videos = $scope.videos.concat(response.items);
    });
  };

  $scope.searchVideos = function() {
    document.title = $routeParams.query + ' | video';
    $scope.query = $routeParams.query;
    var params = {};
    if ($routeParams.searchsort) {
      params.order = $routeParams.searchsort;
    }
    if ($routeParams.searchduration) {
      params.videoDuration = $routeParams.searchduration;
    }
    if ($routeParams.eventtype) {
      params.eventType = $routeParams.eventtype;
      //$routeParams.searchdimension = 'null';
    }

    if ($routeParams.searchdimension) {
      params.videoDimension = $routeParams.searchdimension;
      //$routeParams.eventtype = null;
    }
    if ($routeParams.type) {
      params.Type = $routeParams.type;
    }
    if ($routeParams.searchdefinition) {
      params.videoDefinition = $routeParams.searchdefinition;
    }
    youtube.searchVideos($scope.nextPageToken, $routeParams.query, params, function (response) {
      $scope.nextPageToken = response.nextPageToken;
      var ids = [];
      angular.forEach(response.items, function (item) {
        ids.push(item.id.videoId);
      });
      youtube.fetchVideos(ids, function (response) {
        $scope.videos = $scope.videos.concat(response.items);
      });
    });
  };

  $scope.userVideos = function() {
    youtube.userData($routeParams.username, function(response) {
      $scope.user = response.items[0];
      document.title = $scope.user.snippet.title + ' | video';
      var playlist = response.items[0].contentDetails.relatedPlaylists.uploads;
      youtube.playlistVideos($scope.nextPageToken, playlist, function(response) {
        $scope.nextPageToken = response.nextPageToken;
        var ids = [];
        angular.forEach(response.items, function (item) {
          ids.push(item.contentDetails.videoId);
        });
        youtube.fetchVideos(ids, function(response) {
          $scope.videos = $scope.videos.concat(response.items);
        });
      });
    });
  };

  $scope.popularVideos = function() {
    document.title = 'Popular | video';
    youtube.popularVideos($scope.nextPageToken, function(response) {
      $scope.nextPageToken = response.nextPageToken;
      $scope.videos = $scope.videos.concat(response.items);
    });
  };

  $scope.loadVideos = function() {
    if ($scope.nextPageToken === undefined || $.inArray($scope.nextPageToken, $scope.usedTokens) >= 0 && $scope.nextPageToken !== '') {
      return;
    }
    $scope.usedTokens.push($scope.nextPageToken);
    if ($routeParams.category !== undefined) {
      $scope.categoryVideos();
    } else if ($routeParams.query !== undefined && $routeParams.query !== "" && $routeParams.query !== "0") {
      $scope.searchVideos();
    } else if ($routeParams.username !== undefined) {
      $scope.userVideos();
    } else {
      $scope.popularVideos();
    }
  };

  $scope.loadVideos();

  youtube.videoCategories(function(response) {
    $scope.categories = response.items;
  });

  $scope.getLink = function(video) {
    return '#/view/' + video.id
  };

  $scope.formatDuration = function(seconds) {
    return youtube.formatDuration(seconds);
  };

  $scope.averageRating = function(likeCount, dislikeCount) {
    return youtube.averageRating(likeCount, dislikeCount);
  }

}]);
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
tooglesApp.service('youtube', ['$http', function($http) {

  // needs a google API payment setup for removing the daily view limit
  var urlBase = CONZEPT_WEB_BASE + '/app/proxy/video/';
  var apiKey  = ''; // NOTE: The API key is not needed here, since we use a sever-side json-proxy which has that value

  var count = 12;

  var lang = getParameterByName('l') || 'en';

  this.searchVideos = function(pageToken, query, params, callback) {
    var url = urlBase + 'search?part=id&type=video&maxResults=' + count + '&q=' + query + '&relevanceLanguage=' + lang + '&xkey=' + apiKey;
    if (params) {
      url += '&' + $.param(params);
    }
    if (pageToken) {
      url += "&pageToken=" + pageToken;
    }
    return this.sendRequest(url, callback);
  };

  this.relatedVideos = function(id, callback) {
    var url = urlBase + 'search?part=id&type=video&maxResults=' + count + '&relatedToVideoId=' + id + '&xkey=' + apiKey;
    return this.sendRequest(url, callback);
  };

  this.popularVideos = function(pageToken, callback) {
    var url = urlBase + 'videos?part=statistics,snippet,contentDetails&chart=mostPopular&maxResults=' + count + '&xkey=' + apiKey;
    if (pageToken) {
      url += "&pageToken=" + pageToken;
    }
    return this.sendRequest(url, callback);
  };

  this.fetchVideos = function(ids, callback) {
    if ($.isArray(ids)) {
      ids = ids.join(',');
    }
    var url = urlBase + 'videos?part=statistics,snippet,contentDetails&id=' + ids + '&xkey=' + apiKey;
    return this.sendRequest(url, callback);
  };

  this.categoryVideos = function(pageToken, category, callback) {
    var url = urlBase + 'videos?part=statistics,snippet,contentDetails&chart=mostPopular&maxResults=' + count + '&videoCategoryId=' + category + '&xkey=' + apiKey;
    if (pageToken) {
      url += "&pageToken=" + pageToken;
    }
    return this.sendRequest(url, callback);
  };

  this.videoCategories = function(callback) {
    var url = urlBase + 'videoCategories?part=snippet&regionCode=US&xkey=' + apiKey;
    return this.sendRequest(url, callback);
  };

  this.playlistVideos = function(pageToken, playlist, callback) {
    var url = urlBase + 'playlistItems?part=contentDetails&order=date&maxResults=' + count + '&playlistId=' + playlist + '&xkey=' + apiKey;
    if (pageToken) {
      url += "&pageToken=" + pageToken;
    }
    return this.sendRequest(url, callback);
  };

  this.userData = function(user, callback) {
    var url = urlBase + 'channels?part=contentDetails,snippet,statistics&order=date&maxResults=' + count + '&id=' + user + '&xkey=' + apiKey;
    return this.sendRequest(url, callback);
  };

  this.sendRequest = function(url, callback) {
    return $http.get(url)
      .success(function(data, status, headers, config) {
        callback(data)
      })
      .error(function(data, status, headers, config) {
        // @TODO: Basic error handling
      });
  };

  this.formatDuration = function(duration) {
    var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
    var hours = 0, minutes = 0, seconds = 0, totalsecondsonds;

    if (reptms.test(duration)) {
      var matches = reptms.exec(duration);
      if (matches[1]) { hours = Number(matches[1])}
      if (matches[2]) { minutes = Number(matches[2])}
      if (matches[3]) { seconds = Number(matches[3])}
      var totalseconds = hours * 3600  + minutes * 60 + seconds;
      var hours = parseInt( totalseconds / 3600 ) % 24;
      var minutes = parseInt( totalseconds / 60 ) % 60;
      var seconds = totalseconds % 60;

      var result = '';
      if (hours > 0) {
        result += hours + ':';
      }
      if (hours > 0) {
        result += (minutes < 10 ? '0' + minutes : minutes) + ':';
      } else {
        result += minutes + ':';
      }
      result += (seconds < 10 ? '0' + seconds : seconds);
      return result;
    }
  };

  this.averageRating = function(likes, dislikes) {
    likes = parseInt(likes);
    dislikes = parseInt(dislikes);
    var total = likes + dislikes;
    var average = likes / total;
    return average * 100;
  };
}]);
tooglesApp.filter('htmlify', function() {
  return function(input) {
    if (!input) {
      return "";
    }
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    var out = input.replace(exp,"<a href='$1'>$1</a>"); 
    out = out.replace(/\n/g, '<br />');
    return out;
  }
});
tooglesApp.directive('whenScrolled', function() {
  return function(scope, elm, attr) {
    $(window).scroll(function () {
      if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
        scope.$apply(attr.whenScrolled);
      }
    });
  };
});
