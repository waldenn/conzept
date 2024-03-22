const app = {};

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

  // TODO:
  // also stop parent-frame speaking (if needed)
  parentref.postMessage({ event_id: 'stop-all-speaking', data: { } }, '*' );

}

let utterance = new SpeechSynthesisUtterance();
let __PDF_DOC,
	__CURRENT_PAGE = 1, //This is the page which is currently being spoken
	__TOTAL_PAGES,
	__PAGE_RENDERING_IN_PROGRESS = 0;
let canvas_width = 1000;
let pageHeight = -1;
let __VIEWING_PAGE = __CURRENT_PAGE;

app.language            = getParameterByName( 'l' ) || 'en';
app.url                 = getParameterByName( 'u' ) || '';
app.voice               = getParameterByName( 'voice' ) || ''; // TODO: rate and pitch parameters

app.current_url         = app.url; // used for page reloads
app.scroll_update_time  = 7000;
app.auto_scroll_enabled = false;
//app.timerID = setInterval( scrollTo, app.scroll_update_time );

const lang = valid( app.voice )? app.voice : app.language;

async function init(){

  $("#pdf-contents").show();
  $("#page-count-container").hide();
  $("button#play-button, button#pause-button, button#resume-button, button#stop-button").hide();

  if ( valid( [ app.language, app.url ] ) ){

    $('#download-button').show();

    await populateVoiceList( lang );

    showPDF( app.current_url );

  }

}

function populateVoiceList( lang ) {

  new Promise((resolve) => {

    if ( typeof synth === "undefined" || document.getElementById("voiceSelect").childNodes.length > 0) {
      return;
    }

    const voices = synth.getVoices();

    const voice_code_length = valid( app.voice )? 5 : 2; 

    for (const element of voices){

      if ( element.lang.substring(0, voice_code_length ) === lang ){
        
           // element.lang.substring(0, 2 ) === 'en' ) { // use "en" as the default fallback language

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


function startTextToSpeech(startWord){

	if (synth.speaking) {
		synth.cancel();
	}

	let voices = synth.getVoices();

	if (prevId !== 0){

		document.getElementById("word-" + __CURRENT_PAGE + "-" + prevId)?.classList.remove("highlight");

  }

	prevId = 0;

	let selectedVoice = '';

  if ( valid( app.voice ) ){

    selectedVoice = voices.filter( (element) => element.lang.substring(0, 5) === app.voice )[document.getElementById("voiceSelect").selectedIndex];

  }
  else {

    selectedVoice = voices.filter( (element) => element.lang.substring(0, 2) === app.language )[document.getElementById("voiceSelect").selectedIndex];

  }

	if (selectedVoice !== null) {

    //console.log( 'selected voice: ', selectedVoice );

		utterance.voice = selectedVoice;

	}

	let textContent = "";
	__PDF_DOC
		.getPage(__CURRENT_PAGE)
		.then(function (page) {
			return page.getTextContent();
		})
		.then(function (content) {
			textContent = content.items
				.map(function (item) {
					return item.str;
				})
				.join(" ");
			if (startWord) {
				let startIndex = textContent.indexOf(startWord);
				utterance.text = refineText(textContent.slice(startIndex));
			} else {
				utterance.text = refineText(textContent);
			}
			//utterance.onerror = (error) => console.log(error);
			//utterance.onpause = () => console.log("Paused");
			//utterance.onmark = () => console.log("On Mark");
			utterance.onboundary = (event) => {
				// console.log(event);
				highlightWord();
			};

			utterance.onend = function () {
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
			synth.speak(utterance);

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
	let canvas = document.createElement("canvas");
	canvas.id = "page" + pageNumber;
	canvas.width = canvas_width;
	let textLayer = document.createElement("div");
	textLayer.id = "textLayer" + pageNumber;
	let annotationLayer = document.createElement("div");
	annotationLayer.id = "annotationLayer" + pageNumber;

	canvas.classList.add("canvas");
	textLayer.classList.add("textLayer");
	annotationLayer.classList.add("annotationLayer");

	let pdfContainer = document.getElementById("pdfContainer");
	pdfContainer.appendChild(canvas);
	pdfContainer.appendChild(textLayer);
	pdfContainer.appendChild(annotationLayer);

	showPage(pageNumber, canvas, canvas.getContext("2d"));

	// Add click event listeners to each word in the text layer
	$("#textLayer" + pageNumber).on("click", "span", function () {
		if (prevId !== 0) {
			document
				.getElementById("word-" + __CURRENT_PAGE + "-" + prevId)
				.classList.remove("highlight");
		}
		__CURRENT_PAGE = pageNumber;
		prevId = parseInt($(this).attr("id").split("-")[2]) - 1;
		const clickedWord = $(this).text().trim();
		// Get the text content of the rest of the page
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
		// Set the text to the utterance
		if (synth.speaking) {
			synth.cancel();
		}
		let voices = synth.getVoices();

    let selectedVoice = '';

    if ( valid( app.voice ) ){

      selectedVoice = voices.filter( (element) => element.lang.substring(0, 5) === app.voice )[document.getElementById("voiceSelect").selectedIndex];

    }
    else {

		  selectedVoice = voices.filter( (element) => element.lang.substring(0, 2) === app.language )[document.getElementById("voiceSelect").selectedIndex];

    }

    if (selectedVoice !== null) {

      //console.log( 'selected voice: ', selectedVoice );

	    utterance.voice = selectedVoice;

		}

		//utterance.onerror = (error) => console.log(error);
		//utterance.onpause = () => console.log("Paused");
		//utterance.onmark = () => console.log("On Mark");

		utterance.onboundary = (event) => {
			highlightWord();
		};

		utterance.text = refineText(clickedWord + " " + nextPageWords);
		// Start the text-to-speech feature
		utterance.onend = function () {

			//console.log("Ended");

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
		synth.speak(utterance);
		resume();
	});
}

function showPDF(pdf_url) {

  console.log( 'PDF url: ', pdf_url );

	$("#pdf-loader").show();
  $("button#play-button, button#pause-button, button#resume-button, button#stop-button").show();
  $("#page-count-container").show();

	PDFJS.getDocument({ url: pdf_url }).then( function (pdf_doc){

		__PDF_DOC = pdf_doc;
		__TOTAL_PAGES = __PDF_DOC.numPages;

    //console.log( __TOTAL_PAGES );

		// hide the pdf loader and show pdf container in HTML
		$("#pdf-loader").hide();
		$("#pdf-total-pages").text(__TOTAL_PAGES);

		loadPage(1);

		$(window).on( 'scroll', function(){

      //console.log('scroll event');

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
		//console.log("Null id", prevId);
		prevId = 0;
	}

}

function showPage( page_no, newCanvas, newCtx ) {

	__PAGE_RENDERING_IN_PROGRESS = 1;

	// While page is being rendered hide the canvas and show a loading message
	$("#page" + page_no).hide();
	$("#page-loader").show();

	// Fetch the page
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

  await populateVoiceList( lang );

  app.current_url = URL.createObjectURL( $('#file-to-upload').get(0).files[0] );

	showPDF( app.current_url );

});


$("#download-button").on( 'click', function(){
	
  openInNewTab( app.url.replace( `https://${CONZEPT_HOSTNAME}${CONZEPT_WEB_BASE}/app/cors/raw/?url=`, '' ) );

  /*
  var link = document.createElement('a');
  link.href = url;
  link.download = 'file.pdf';
  link.dispatchEvent(new MouseEvent('click'));
  */

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

	//document.getElementById("page" + __CURRENT_PAGE).scrollIntoView();

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

$( document ).ready(function() {

  init();

});
