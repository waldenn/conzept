"use strict";

let params = URLSearchParams && new URLSearchParams(document.location.search.substring(1));
let url = params && params.get("url") && decodeURIComponent(params.get("url"));
let currentSectionIndex = (params && params.get("loc")) ? params.get("loc") : undefined;

// Load the opf
let book = ePub( url );

let rendition = book.renderTo("viewer", {
  width: "100%",
  height: 600,
  spread: "always"
});

rendition.display(currentSectionIndex);

book.ready.then(() => {

  let next = document.getElementById("next");

  next.addEventListener("click", function(e){
    book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
    e.preventDefault();
  }, false);

  let prev = document.getElementById("prev");
  prev.addEventListener("click", function(e){
    book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
    e.preventDefault();
  }, false);

  let keyListener = function(e){

    // Left Key
    if ((e.keyCode || e.which) == 37) {
      book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
    }

    // Right Key
    if ((e.keyCode || e.which) == 39) {
      book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
    }

  };

  rendition.on("keyup", keyListener);
  document.addEventListener("keyup", keyListener, false);

})

let title = document.getElementById("title");

rendition.on("rendered", function(section){
  let current = book.navigation && book.navigation.get(section.href);

  if (current) {
    let $select = document.getElementById("toc");
    let $selected = $select.querySelector("option[selected]");
    if ($selected) {
      $selected.removeAttribute("selected");
    }

    let $options = $select.querySelectorAll("option");
    for (var i = 0; i < $options.length; ++i) {
      let selected = $options[i].getAttribute("ref") === current.href;
      if (selected) {
        $options[i].setAttribute("selected", "");
      }
    }
  }

});

rendition.on("relocated", function(location){
  console.log(location);

  let next = book.package.metadata.direction === "rtl" ?  document.getElementById("prev") : document.getElementById("next");
  let prev = book.package.metadata.direction === "rtl" ?  document.getElementById("next") : document.getElementById("prev");

  if (location.atEnd) {
    next.style.visibility = "hidden";
  } else {
    next.style.visibility = "visible";
  }

  if (location.atStart) {
    prev.style.visibility = "hidden";
  } else {
    prev.style.visibility = "visible";
  }

});

rendition.on("layout", function(layout) {
  let viewer = document.getElementById("viewer");

  if (layout.spread) {
    viewer.classList.remove('single');
  } else {
    viewer.classList.add('single');
  }
});

window.addEventListener("unload", function () {
  console.log("unloading");
  this.book.destroy();
});

book.loaded.navigation.then(function(toc){
  let $select = document.getElementById("toc"),
      docfrag = document.createDocumentFragment();

  toc.forEach(function(chapter) {
    let option = document.createElement("option");
    option.textContent = chapter.label;
    option.setAttribute("ref", chapter.href);

    docfrag.appendChild(option);
  });

  $select.appendChild(docfrag);

  $select.onchange = function(){
      let index = $select.selectedIndex,
          url = $select.options[index].getAttribute("ref");
      rendition.display(url);
      return false;
  };

});
