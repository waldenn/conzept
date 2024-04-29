let app = {};

let parentref = '';

if ( detectMobile() === true ){

  parentref = parent;

}
else { // desktop

  if ( window.parent.name === 'infoframeSplit2' || window.parent.name === 'infoframe_' ){ // request from secondary content iframe
    parentref = parent;
  }
  else { // primary content frame
    parentref = parent.top;
  }

}

let synth = window.speechSynthesis;

if ( typeof synth !== "undefined" ) {

  synth.cancel();

  // also stop any parent-frame speaking (if needed)
  parentref.postMessage({ event_id: 'stop-all-speaking', data: { } }, '*' );

}

let __PDF_DOC,
	__CURRENT_PAGE = 1, //This is the page which is currently being spoken
	__TOTAL_PAGES,
	__PAGE_RENDERING_IN_PROGRESS = 0;

let canvas_width = 1000;
let pageHeight = -1;
let __VIEWING_PAGE = __CURRENT_PAGE;

async function init(){

  $("#pdf-contents").show();
  $("#page-count-container").hide();
  $("button#play-button, button#pause-button, button#resume-button, button#stop-button").hide();

  if ( valid( [ app.language, app.url ] ) ){

    $('#download-button').show();

    let s = setSpeech();

    s.then( async ( voices ) => {

      await populateVoiceList( app.lang );

      app.selectedVoice = setVoice();

      showPDF( app.current_url );

    });

  }

}

function setSpeech() {

    return new Promise(

        function (resolve, reject) {

            let synth = window.speechSynthesis;
            let id;

            id = setInterval(() => {

                if (synth.getVoices().length !== 0) {

                    resolve( synth.getVoices() );
                    clearInterval( id );

                }

            }, 10);
        }
    )
}

function populateVoiceList( l ) {

  new Promise((resolve) => {

    if ( typeof synth === "undefined" || document.getElementById("voiceSelect").childNodes.length > 0) {
      return;
    }

    app.voices = synth.getVoices();

    const voice_code_length = valid( app.voice_code )? 5 : 2; 

    for (const element of app.voices){

      if ( element.lang.substring(0, voice_code_length ) === l ){
        
        const option        = document.createElement("option");

        option.textContent  = `${element.name} (${element.lang})`;

        if (element.default){

          option.textContent += " — DEFAULT";

        }

        option.setAttribute("data-lang", element.lang);
        option.setAttribute("data-name", element.name);

        document.getElementById("voiceSelect").appendChild(option);

      }

    }


  })

}

function setVoice(){

  if ( valid( app.voice_name ) ){ // check "voice name"

    app.voices.forEach( ( element ) => {

      //console.log( element.name, app.voice_name );

      if ( element.name.replace('+', ' ') == app.voice_name ){ // Firefox voice-name needs '+' -> ' '

        app.selectedVoice = element;

        //console.log('found: ', element );

      }

    });

  }
  else if ( valid( app.voice_code ) ){ // fallback to the first "voice-code" option found

    app.selectedVoice = app.voices.filter( (element) =>
      element.lang.substring(0, 5) === app.voice_code )[document.getElementById("voiceSelect").selectedIndex];

  }
  else { // fallback to the first iso2-language-matching option

    app.selectedVoice = app.voices.filter( (element) =>
      element.lang.substring(0, 2) === app.language )[document.getElementById("voiceSelect").selectedIndex];

  }

	if ( valid( app.selectedVoice ) ) {

		app.utterance.voice = app.selectedVoice;

	}
  else { // fallback to the first iso2 language matching option

    app.selectedVoice = app.voices.filter( (element) =>
      element.lang.substring(0, 2) === app.language )[document.getElementById("voiceSelect").selectedIndex];

  }

  return app.selectedVoice;

}

function startTextToSpeech(startWord){

	if (synth.speaking) {

		synth.cancel();

	}

  app.utterance.rate  = app.voice_rate;
  app.utterance.pitch = app.voice_pitch;

	if (prevId !== 0){

		document.getElementById("word-" + __CURRENT_PAGE + "-" + prevId)?.classList.remove("highlight");

  }

	prevId = 0;

	let textContent = "";

	__PDF_DOC
		.getPage(__CURRENT_PAGE)
		.then(function (page) {
			return page.getTextContent();
		})
		.then( function (content) {

			textContent = content.items

				.map(function (item) {
					return item.str;
				})
				.join(" ");

			if (startWord){
				let startIndex = textContent.indexOf(startWord);
				app.utterance.text = refineText(textContent.slice(startIndex));
			}
      else {
				app.utterance.text = refineText(textContent);
			}

			//app.utterance.onerror = (error) => console.log(error);
			//app.utterance.onpause = () => console.log("Paused");
			//app.utterance.onmark = () => console.log("On Mark");

			app.utterance.onboundary = (event) => {
				// console.log(event);
				highlightWord();
			};

			app.utterance.onend = function () {

				//console.log("Ended");

				if (__CURRENT_PAGE != __TOTAL_PAGES) {
					document
						.getElementById("word-" + __CURRENT_PAGE + "-" + prevId)
						.classList.remove("highlight");

					__CURRENT_PAGE++;
					prevId = 0;

					startTextToSpeech();
					scrollTo();
				}

			};

			synth.speak(app.utterance);

			resume();

		})
		.catch(function (error) {

			console.log(error);

		});
}

function loadPage(pageNumber) {

	if (pageNumber > __TOTAL_PAGES) {

		return;

	}

	let canvas    = document.createElement("canvas");
	canvas.id     = "page" + pageNumber;
	canvas.width  = canvas_width;

	let textLayer = document.createElement("div");
	textLayer.id  = "textLayer" + pageNumber;

	let annotationLayer = document.createElement("div");
	annotationLayer.id  = "annotationLayer" + pageNumber;

	canvas.classList.add("canvas");
	textLayer.classList.add("textLayer");
	annotationLayer.classList.add("annotationLayer");

	let pdfContainer = document.getElementById("pdfContainer");
	pdfContainer.appendChild(canvas);
	pdfContainer.appendChild(textLayer);
	pdfContainer.appendChild(annotationLayer);

	showPage(pageNumber, canvas, canvas.getContext("2d"));

	// add click event listeners to each word in the text layer
	$("#textLayer" + pageNumber).on("click", "span", function () {

		if (prevId !== 0) {
			document
				.getElementById("word-" + __CURRENT_PAGE + "-" + prevId)
				.classList.remove("highlight");
		}

		__CURRENT_PAGE = pageNumber;
		prevId = parseInt($(this).attr("id").split("-")[2]) - 1;
		const clickedWord = $(this).text().trim();

		// get the text content of the rest of the page
		const nextPageWords =
			$(this)
				.nextAll("span")
				.map(function () {
					return $(this).text().trim();
				})
				.get()
				.join(" ") +
			" " +
			$(this)
				.parent()
				.nextAll("div")
				.map(function () {
					return $(this).text().trim();
				})
				.get()
				.join(" ");

		if (synth.speaking) {

			synth.cancel();

		}

		//app.utterance.onerror = (error) => console.log(error);
		//app.utterance.onpause = () => console.log("Paused");
		//app.utterance.onmark = () => console.log("On Mark");

		app.utterance.onboundary = (event) => {
			highlightWord();
		};

		app.utterance.text = refineText(clickedWord + " " + nextPageWords);

		// Start the text-to-speech feature
		app.utterance.onend = function () {

			if (__CURRENT_PAGE != __TOTAL_PAGES) {

				try {

					document
						.getElementById("word-" + __CURRENT_PAGE + "-" + prevId)
						.classList.remove("highlight");

				} catch {}

				__CURRENT_PAGE++;
				prevId = 0;
				startTextToSpeech();
				scrollTo();

			}

		};

		synth.speak( app.utterance );

		resume();

	});
}

function showPDF(pdf_url) {

	$("#pdf-loader").show();
  $("button#play-button, button#pause-button, button#resume-button, button#stop-button").show();
  $("#page-count-container").show();

	PDFJS.getDocument({ url: pdf_url }).then( function (pdf_doc){

		__PDF_DOC     = pdf_doc;
		__TOTAL_PAGES = __PDF_DOC.numPages;

		// hide the pdf loader and show pdf container in HTML
		$("#pdf-loader").hide();
		$("#pdf-total-pages").text(__TOTAL_PAGES);

		loadPage(1);

		$(window).on( 'scroll', function(){

			let cont = document.getElementById("pdfContainer");

			if (cont.scrollTop >= (cont.scrollHeight - cont.clientHeight) * 0.9) {

				loadPage(++__VIEWING_PAGE);

			}

		});

    startTextToSpeech();

	})
  .catch( e => {

    console.log( 'Error loading the PDF: ', e);

    $('#pdf-loader').css({ 'color' : '#d06f6f' }).html('<h2><i class="fa-solid fa-circle-xmark"></i>&nbsp; document loading failed, please check the download button</h2>');

  });

}

let prevId = 0;

function highlightWord() {

	let wordId = "word-" + __CURRENT_PAGE + "-";

	if (document.getElementById(wordId + prevId) !== null)
		document.getElementById(wordId + prevId).classList.remove("highlight");

	if (document.getElementById(wordId + ++prevId) !== null)
		document.getElementById(wordId + prevId).classList.add("highlight");

	else {

		prevId = 0;

	}

}

function showPage( page_no, newCanvas, newCtx ) {

	__PAGE_RENDERING_IN_PROGRESS = 1;

	// While page is being rendered hide the canvas and show a loading message
	$("#page" + page_no).hide();
	$("#page-loader").show();

	// fetch the page
	__PDF_DOC.getPage(page_no).then(function (page) {
		// As the canvas is of a fixed width we need to set the scale of the viewport accordingly
		let scale_required = newCanvas.width / page.getViewport(1).width;

		// Get viewport of the page at required scale
		let viewport = page.getViewport(scale_required);
		// Set canvas height
		newCanvas.height = viewport.height;
		let renderContext = {
			canvasContext: newCtx,
			viewport: viewport,
		};
		// Render the page contents in the canvas
		page
			.render(renderContext)
			.then(function () {
				__PAGE_RENDERING_IN_PROGRESS = 0;

				// Show the canvas and hide the page loader
				$("#page" + page_no).show();
				$("#page-loader").hide();

				// Return annotation data of the page after the pdf has been rendered in the canvas
				return page.getAnnotations();
			})
			.then(async function (annotationData) {
				// Get canvas offset
				let canvas_offset = $("#page" + page_no).offset();
				if (annotationData.length !== 0) {
					// Clear HTML for annotation layer and show
					$("#annotationLayer" + page_no)
						.html("")
						.show();

					// Assign the CSS created to the annotation-layer element
					$("#annotationLayer" + page_no).css({
						left: canvas_offset.left + "px",
						top: canvas_offset.top + "px",
						height: newCanvas.height + "px",
						width: newCanvas.width + "px",
					});
					try {
						PDFJS.AnnotationLayer.render({
							viewport: viewport.clone({ dontFlip: true }),
							div: $("#annotationLayer" + page_no).get(0),
							annotations: annotationData,
							page: page,
						});
					} catch {}
				}

				const text = await page.getTextContent();

				// Assign the CSS created to the text-layer element
				$(`#textLayer${page_no}`).css({
					left: canvas_offset.left + "px",
					top: canvas_offset.top + "px",
					height: newCanvas.height + "px",
					width: newCanvas.width + "px",
				});

				PDFJS.renderTextLayer({
					textContent: text,
					container: $(`#textLayer${page_no}`).get(0),
					viewport: viewport,
					textDivs: [],
				});
			})
			.then(function () {

				let allDivs = document.querySelectorAll(`#textLayer${page_no} > div`);
				let sum = 1;

				for (const element of allDivs) {

					const words = element.innerText.split(" ");

					let newSentence = "";

					for (const word of words) {

						if (word.length !== 0 && word.trim()[0] !== "-") {

							const wordId = `word-${page_no}-${sum++}`;
							newSentence += `<span id="${wordId}">${word.trim()} </span>`;

						}

					}
					element.innerHTML = newSentence;

				}

				const currentPageElement = document.getElementById("pdf-current-page");

				pageHeight = parseInt(
					$("#page1")
						.css("height")
						.substring(0, $("#page1").css("height").length - 2)
				);

				$(window).scroll( function(){
					const scrollTop = window.scrollY;
					const currentPage = Math.floor(scrollTop / pageHeight) + 1;
					currentPageElement.textContent = currentPage;
				});

				__PAGE_RENDERING_IN_PROGRESS = 0;

			});
	});
}

// Upon click this should should trigger click on the #file-to-upload file input element
// This is better than showing the not-good-looking file input element
$("#upload-button").on("click", function () {
	$("#file-to-upload").trigger("click");
});

// When user chooses a PDF file
$("#file-to-upload").on("change", async function () {

  // check if its a PDF document
	if ( ["application/pdf"].indexOf($("#file-to-upload").get(0).files[0].type) == -1 ){

		console.log('Error: not a PDF document');

    $('#pdf-loader').css({ 'color' : '#d06f6f' }).html('<h2><i class="fa-solid fa-circle-xmark"></i>&nbsp; not a PDF document</h2>');

		return;

	}

  $('#pdfContainer').empty();

  app.current_url = URL.createObjectURL( $('#file-to-upload').get(0).files[0] );

	showPDF( app.current_url );

});


$("#download-button").on( 'click', function(){
	
  openInNewTab( app.url.replace( `https://${CONZEPT_HOSTNAME}${CONZEPT_WEB_BASE}/app/cors/raw/?url=`, '' ) );

});

function resume(){

	$("#filler-button").hide();
	$("#resume-button").hide();
	$("#pause-button").show();

	if (!synth.paused) synth.resume();
}

function pause(){

	$("#filler-button").hide();
	$("#pause-button").hide();
	$("#resume-button").show();

	if (synth.speaking) synth.pause();
}

function stop(){

	$("#resume-button").hide();
	$("#pause-button").hide();
	$("#filler-button").show();

	synth.cancel();
}

window.onbeforeunload = function () {
	synth.cancel();
};

function refineText(text) {
	let newText = text.replace(/\x00/g, "").replace(/\s+/g, " ").trim();
	return newText;
}

function toggleAutoScroll(){

  app.auto_scroll_enabled = app.auto_scroll_enabled? false : true;

  if ( app.auto_scroll_enabled ){ // setup auto-scrolling

    clearInterval( app.timerID );
    app.timerID = setInterval( scrollTo, app.scroll_update_time );

    $( '#auto-scroll-button' ).html( '<i class="fa-solid fa-toggle-on"></i>' );

  }
  else { // stop auto-scrolling

    clearInterval( app.timerID );

    $( '#auto-scroll-button' ).html( '<i class="fa-solid fa-toggle-off"></i>' );

  }

}

$("#scroll-to-button").on("click", function () {

	scrollTo();

});

function scrollTo(){

  $('html').animate({

    scrollTop: $('.highlight').offset()?.top - ( window.innerHeight / 3 )

  }, 1000);

}

$( document ).bind('beforeunload', function(event) {

  if ( typeof synth !== "undefined" ) {

    synth.cancel();

  }

});

$( window, document ).bind('unload', function(event) {

  if ( typeof synth !== "undefined" ) {

    synth.cancel();

    parentref.postMessage({ event_id: 'stop-all-speaking', data: { } }, '*' );

  }

});

function checkVoiceSettings(){

  return new Promise(

      async function (resolve, reject) {

        app.voice_code = await app.db.get('voice_code_selected');
        app.voice_code = ( app.voice_code === null || app.voice_code === undefined ) ? getParameterByName( 'voice_code' ) : app.voice_code;

        app.voice_name = await app.db.get('voice_name_selected');
        app.voice_name = ( app.voice_name === null || app.voice_name === undefined ) ? getParameterByName( 'voice_name' ) : app.voice_name;

        app.voice_rate = await app.db.get('voice_rate');
        app.voice_rate = ( app.voice_rate === null || app.voice_rate === undefined ) ? getParameterByName( 'voice_rate' ) : app.voice_rate;

        app.voice_pitch = await app.db.get('voice_pitch');
        app.voice_pitch = ( app.voice_pitch === null || app.voice_pitch === undefined ) ? getParameterByName( 'voice_pitch' ) : app.voice_pitch;

        if ( !valid( app.voice_rate ) ){

          app.voice_rate = 1.00;

        }

        if ( !valid( app.voice_pitch ) ){

          app.voice_pitch = 1.00;

        }

        resolve();

      }

  )

}



$( document ).ready( async function() {

  // main app config
  app = {

    language:             getParameterByName( 'l' )           || 'en',

    url:                  getParameterByName( 'u' )           || '',
    current_url:          getParameterByName( 'u' )           || '', // used for page reloads

    voices:               [],

    timerID:              '',
    scroll_update_time:   7000,
    auto_scroll_enabled:  false,

    utterance:            new SpeechSynthesisUtterance(),

    selectedVoice:        '',
  }

  // first try get the voice-settings from web storage
  app.db = ImmortalDB.ImmortalDB;

  // final language
  app.lang = valid( app.voice_code )? app.voice_code : app.language;

  let check = checkVoiceSettings();

  check.then( async ( ) => {

    init();

  });

});

function receiveMessage(event){

  if ( event.data.event_id === 'set-value' ){

    app[ event.data.data[0] ] = event.data.data[1];

  }

}

window.addEventListener("message", receiveMessage, false);
