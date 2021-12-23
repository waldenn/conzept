//$(document).ready(function(){

  let app = {};

  app.isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|Mobile/i.test(navigator.userAgent) );

  let ul = document.querySelector('#hexGrid');

  for (var i = ul.children.length; i >= 0; i--) {
    ul.appendChild(ul.children[Math.random() * i | 0]);
  }

  //if ( app.isMobile ){
    // show all text in hexagons 
    
    //$('hexLink h1').css( { 'display' : 'block', text-shadow'

    //.hexLink:focus h1,
    //.hexLink:hover p, .hexLink:focus p{
      //display: block;
      //text-shadow: 2px 2px 10px #000;
    //}

  //}

  document.querySelector("body").style.display = "block";

  /*
  let beepOne = $("#beep")[0];

  $('li a').mouseenter(function() {
    beepOne.play();
  });
  */

//});
