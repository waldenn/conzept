let app = {};

// server-side API source: https://github.com/winkjs/showcase-serverless
var getTimeline = function (title) {
  fetch('https://showcase-serverless.herokuapp.com/wp-timeline?title='+title)
    .then(function (res) {
      return res.json();
    }).then(function (d) {
      resetUI();
      showResults(d.timeline);
    })
}

var resetUI = function () {
  $('#timeline-button').prop('value', app.title );
  $('.lds-ripple').hide();
  $('.timeline').show();
}

var showResults = function (timeline) {
  $('#error').hide();

  if(timeline.length === 0){
    $('#error').show();
    $('.timeline').hide();
    $('#error').html('no timeline data found for this article.');
    return;
  }

  $('.timeline').show();
  $('.entries').empty();

  var lastYear = '';
  timeline.forEach((t) => {
    if (isNaN(t.date)) {
      className = 'big';
    } else {
      var century = t.date[0]+ ''+ t.date[1];
      var className = '';
      if ( lastYear !== century ) {
          lastYear = century;
          className = 'big'
      }
    }

    $entry = $('<div>').addClass('entry').append(
      $('<div>').addClass('title').addClass(className).text(t.date),
      $('<div>').addClass('body').html(t.sentence),
    )

    $('.entries').append($entry);
  });
}

var loadArticle = function (title) {
  // UI changes
  $('#title').prop('value',title)
  $('#error').hide();
  //$('#timeline-button').prop('value', '…');
  //$('.lds-ripple').show();
  //$('.timeline').hide();

  // Make API call
  getTimeline(title);
}

$(function () {

  app.title     = getParameterByName('t') || '';
  app.language  = getParameterByName('l') || 'en';

  loadArticle( app.title );

  /*
  $('#timeline-button').on('click', function () {
    // Check input string
    var title = $('#title')[0].value;
    if (title.trim() === '' ) return false;

    loadArticle(title);
  });

  $(document).on('click','.js-article-ex',function () {
    var title = $(this).text();
    loadArticle(title);
  })
  */

})
