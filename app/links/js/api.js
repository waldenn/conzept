// This script contains the code necessary to make requests to the python API,
// as well as a more general function which is also used to fetch the README
// for rendering.



// GLOBALS

var api_endpoint = "https://wikipedia-map.now.sh/";

// BASIC METHODS

//Make an asynchronous GET request and execute the onSuccess callback with the data
function requestPage(url, onSuccess) {
  onSuccess = onSuccess || function(){};
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      onSuccess(xhttp.responseText);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

function getJSON(id, onSuccess) {
  //console.log( id );
  requestPage("http://luke.deentaylor.com/wikipedia/graphs/" + id, onSuccess);
}
