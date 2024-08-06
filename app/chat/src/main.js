const app = {

  version:              'v0.011',
  chatsData:            [],
  activeChatIdx:        0,

  my_string:            getParameterByName('m') || '',
  tutor:                getParameterByName('t') || 'default',
  language:             getParameterByName('l') || 'en',

  supported_languages:  [ 'en', 'fr', 'nl' ],

  tutors:               [],
  tutor_label:          '',
  tutor_prompt:         '',

  recing:               false,

  data:                 [],

  recognition:     			[],

  tts_enabled  	: false,
  synth_paused  : false,
  tts_removals  : 'table, sub, sup, style, .internal.hash, .rt-commentedText, .IPA, .catlink, .notts, #coordinates',
  autospeak     : getParameterByName('autospeak') || false,
  //synth					: window.speechSynthesis || undefined,

  voice_code    : getParameterByName('voice') || '',
  voice_rate    : getParameterByName('rate')  || '1',
  voice_pitch   : getParameterByName('pitch') || '1',


};

let explore = app;

let current_pane  = '';
let parentref     = '';

if ( detectMobile() ){

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

$(document).ready(function(){

	current_pane = getCurrentPane();

  if ( detectMobile() ){

    $('.message').css( { 'margin-bottom' : '6.5em' } );
    $('.bottom_wrapper').css( { 'bottom' : '4em' } );

  }

  $('#clearConv').click();

  //$('#clearChat').click();

  // always clear the chat-history on the initial page load
  //$('#clearConv').click();

  (async () => {

    db = ImmortalDB.ImmortalDB;

		if ( explore.voice_code === '' ){

      explore.voice_code = await db.get('voice_code_selected');
      explore.voice_code = ( explore.voice_code === null || explore.voice_code === undefined ) ? '' : explore.voice_code;

    }

    darkmode = await db.get('darkmode');
    darkmode = ( darkmode == null || darkmode == 'false' ) ? false : true;

    if ( darkmode ){
      $('body').addClass('dark');
    }
    else { // bright mode
      $('body').removeClass('dark');
    }

  })()

  // set system role
  const sel = `#preSetSystem option:contains(\'${app.tutor}\')`;
  $( sel ).attr('selected', 'selected').trigger('change'); 

  // set user prompt
  if ( valid( app.my_string ) ) {
    $('#chatinput').val(app.my_string);
    $('#sendbutton').click();
  }

  scrollToBottom();

	setupSpeechRecognition();

});

const messagsEle  = document.getElementsByClassName("messages")[0];
const chatlog     = document.getElementById("chatlog");
const stopEle     = document.getElementById("stopChat");
const sendBtnEle  = document.getElementById("sendbutton");
const textarea    = document.getElementById("chatinput");

const startSpeakingEle	= document.getElementById("startSpeaking");
const pauseSpeakingEle	= document.getElementById("pauseSpeaking");
const stopSpeakingEle	= document.getElementById("stopSpeaking");

if ( app.my_string.charAt(0) === '[' ){ // check if message is a JSON stringified array

  //console.log( app.my_string, typeof app.my_string );

  app.my_string = JSON.parse( app.my_string ).join(', ');

}

if ( app.tutor === 'auto-select' ){ // no specific app.tutor was set before this, so fallback to the default app.tutor

  app.tutor = 'default';

}

// see: https://www.dormant.ninja/multiline-regex-in-javascript-with-comments/
const multilineRegex = (...parts) =>
  new RegExp(parts.map(x => (x instanceof RegExp) ? x.source : x).join(''));

var regex2;

function markupEntities( text ){

	//console.log( text );
  const words			= text.trim().split(' ');

	//console.log( words );
  text						= words.join(' ');

	//console.log( text );

	// TODO
  //regex2 = multilineRegex(
  //    /(?<![\.\?\!:] |<\/p>\n<p>|<\/ol>\n<p>|<\/table>\n<p>)/gm,
  //    /[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœ0-9\-\']*[A-ZÀ-Ü]+[0-9]*[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœ\-\']*[A-Z]*[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœ\']*(?:\s+[A-ZÀ-Ü0-9][A-Za-z\'éçáøêëâîôöüïñ\-\']+)*/
  //);

	//regex2.flags = 'gm';

  // TOFIX: dont yet markup:
  //  \d\d\d\d\s
  //  \sAD\s|\sBC\s|\sBCE\s

  //             ( lookback and prevent these cases from being used  )

  const regex = /(?<![\.\?\!:] |<\/p>\n<p>|<\/ol>\n<p>|<\/table>\n<p>|[\d-]{9,13}(\d|X)?|<li><a |<a |<\/a>|rel="noopener">|.+\/.+)[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö0-9\-\']*[A-ZÀ-Ü]+[0-9]*[7a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\-\']*(\sdegli\s|\sdella\s|\sdel\s|\sdes\s|\sdei\s|\sde\s|\sda\s|\sdi\s|\svan\s|\svon\s|\sof\s|\s的\s|\sà\s|\sam\s)*[A-Z]*[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\'\-]*[A-ZÀ-Üa-z]*[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\']*(?:\s+[A-ZÀ-Ü0-9]+[A-Za-z\'àáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\-\']*)*(\s[a-z]+:)*/gm;

  //const regex = /(?<![\.\?\!:] |<\/p>\n<p>|<\/ol>\n<p>|<\/table>\n<p>|[\d-]{9,13}(\d|X)?|<li><a |<a |<\/a>|rel="noopener">|.+\/.+)[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö0-9\-\']*[A-ZÀ-Ü]+[0-9]*[7a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\-\']*(\sdegli\s|\sdella\s|\sdel\s|\sdes\s|\sdei\s|\sde\s|\sda\s|\sdi\s|\svan\s|\svon\s|\sof\s|\s的\s|\sà\s|\sam\s)*[A-Z]*[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\'\-]*[A-ZÀ-Üa-z]*[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\']*(?:\s+[A-ZÀ-Ü0-9]+[A-Za-z\'àáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\-\']*)*(\s[a-z]+:)*/gm;

  //const regex = /(?<![\.\?\!:] |<\/p>\n<p>|<\/ol>\n<p>|<\/table>\n<p>|<li><a |<a |<\/a>|rel="noopener">|.+\/.+)[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö0-9\-\']*[A-ZÀ-Ü]+[0-9]*[7a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\-\']*(\sdegli\s|\sdella\s|\sdel\s|\sdes\s|\sdei\s|\sde\s|\sda\s|\sdi\s|\svan\s|\svon\s|\sof\s|\s的\s|\sà\s|\sam\s)*[A-Z]*[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\'\-]*[A-ZÀ-Üa-z]*[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\']*(?:\s+[A-ZÀ-Ü0-9]+[A-Za-z\'àáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\-\']*)*/gm;

 //<li> <a href="http://Origami.me" target="_blank" rel="noopener">Origami.me</a> - <a href="https://origami.me/" target="_blank" rel="noopener">https://origami.me/ </a> </li>

  //const regex = /(?<![\.\?\!:] |<\/p>\n<p>|<\/ol>\n<p>|<\/table>\n<p>)[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö0-9\-\']*[A-ZÀ-Ü]+[0-9]*[7a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\-\']*(\sdegli\s|\sdella\s|\sdel\s|\sdes\s|\sdei\s|\sde\s|\sda\s|\sdi\s|\svan\s|\svon\s|\sof\s|\s的\s|\sà\s|\sam\s)*[A-Z]*[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\'\-]*[A-ZÀ-Üa-z]*[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\']*(?:\s+[A-ZÀ-Ü0-9]+[A-Za-z\'àáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœžščćđðéíóúýþö\-\']*)*/gm;

	let i = 0;

  return text.replace( regex, match => {

		i = i + 1;

		if ( i === 1 ){ // skip the first word of response

			//console.log( i, match );

			return match;

		}
		else {

			const words = match.split(' ');

			const name = words.join(' ');
			let name_ = name.replace( /'s$/gm, ''); // remove "s"-plurals at the end of words, to improve the Wikipedia link potential
			name_ = name_.replace( /:$/gm, ''); // remove ":" list indicator

			if (window.top == window.self) { // top window

				return `<a href="https://${CONZEPT_HOSTNAME}/explore/${ encodeURIComponent( name_ ) }?t=string" target="_blank" title="" onclick="">${name}</a>`;

			}
			else { // embedded window

				return `<a href="javascript:void(0)" title="" onclick="exploreString( false, &quot;${encodeURIComponent( name_ )}&quot;)" onauxclick="exploreString( true, &quot;${encodeURIComponent( name_ )}&quot;)">${name}</a>`;

			}

		}

  });

}

function markupISBNs( html ){

  const regex = / [\d-]{9,18}[X]*/gm
3
  return html.replace( regex, match => {

			if (window.top == window.self) { // top window

        return ` <a href="https://openlibrary.org/search?q=${ encodeURIComponent( match ) }" target="_blank" title="Open Library ISBN search" onclick="">${match.trim()}</a>`;

			}
			else { // embedded window

        const url = `https://openlibrary.org/search?q=${ match }`;

				return ` <a href="javascript:void(0)" title="" onclick="openlink( &quot;${encodeURIComponent( url )}&quot;)">${match.trim()}</a>`;

			}

  });

}

function markupYears( html ){

  const regex = /\b(\d{4}|\d{4}s)\b/gm;

  return html.replace( regex, match => {

    if (window.top == window.self) { // top window

      return `<a href="https://${CONZEPT_HOSTNAME}/explore/${ encodeURIComponent( match ) }?t=string" target="_blank" title="" onclick="">${match}</a>`;

    }
    else { // embedded window

      return `<a href="javascript:void(0)" title="" onclick="exploreString( false, &quot;${encodeURIComponent( match )}&quot;) onauxclick="exploreString( true, &quot;${encodeURIComponent( name_ )}&quot;)">${match}</a>`;

    }

  });

}

function markupCenturies( html ){

  const regex = /\b\d+(?:st|nd|rd|th)\s+century(?:\s+(?:AD|BC|BCE))?\b/gm;

  return html.replace( regex, match => {

    if (window.top == window.self) { // top window

      return `<a href="https://${CONZEPT_HOSTNAME}/explore/${ encodeURIComponent( match ) }?t=string" target="_blank" title="search Open Library by ISBN" onclick="">${match}</a>`;

    }
    else { // embedded window

      return `<a href="javascript:void(0)" title="" onclick="exploreString( false, &quot;${encodeURIComponent( match )}&quot;) onauxclick="exploreString( true, &quot;${encodeURIComponent( name_ )}&quot;)">${match}</a>`;

    }

  });

}

function markupComplexWords( html ){

	// TODO

  // Use a regular expression to match all unmarked words in the HTML string
  const regex = /<a\b[^>]*>(.*?)<\/a>/gi;
  const unmarkedWords = html.match(regex) || [];

  // Loop through the unmarked words and do something with each one
  unmarkedWords.forEach(word => {
    // Check if the word is not marked up (i.e., it doesn't start with '<' or end with '>')
    if (word.charAt(0) !== '<' && word.charAt(word.length - 1) !== '>') {
      // Do something with the unmarked word here
      console.log(word.length);
    }
  });

	return html;

}

const openlink = (url) => {

  if ( getCurrentPane() === 'ps1' ){ // first split-pane -> open link in second split-pane

    window.parent.postMessage({
      event_id: 'handleClick',
      data: {
        type: 'link',
        url: url,
        title: '',
        language: app.language,
        current_pane: getCurrentPane(),
        target_pane: 'ps2'
      }
    }, '*');

  }
  else { // pane 0 or 1

    window.parent.postMessage({
      event_id: 'handleClick',
      data: {
        type: 'link',
        url: url,
        title: '',
        language: '',
        current_pane: getCurrentPane(),
        target_pane: 'p0'
      }
    }, '*');

  }

}

const exploreString = (newtab, string) => {

  if ( getCurrentPane() === 'ps1' ){ // first split-pane -> open link in second split-pane

    if ( newtab ){ // user wants URL to open in a new tab

      const url = `/explore/${encodeURIComponent( string )}?l=${app.language}&t=string`;

      openInNewTab( url );

    }
    else {

      window.parent.postMessage({
        event_id: 'handleClick',
        data: {
          type: 'link',
          url: CONZEPT_WEB_BASE + `/app/wikipedia/?t=${string}&l=${app.language}&embedded=#`,
          title: string,
          language: app.language,
          current_pane: getCurrentPane(),
          target_pane: 'ps2'
        }
      }, '*');

    }

  }
  else { // pane 0 or 1

    if ( newtab ){ // user wants URL to open in a new tab

      const url = `/explore/${encodeURIComponent( string )}?l=${app.language}&t=string`;

      openInNewTab( url );

    }
    else {

      window.parent.postMessage({
        event_id: 'handleClick',
        data: {
          type: 'explore',
          title: string,
          language: app.language,
          current_pane: getCurrentPane(),
          target_pane: 'p0'
        }
      }, '*');

    }

  }

}

const settingEle = document.getElementById("setting");
const dialogEle = document.getElementById("setDialog");
const systemEle = document.getElementById("systemInput");
const newChatEle = document.getElementById("newChat");
const chatListEle = document.getElementById("chatList");

textarea.focus();

const textInputEvent = () => {

  if (!loading) {

    if (textarea.value.trim().length) {

      sendBtnEle.classList.add("activeSendBtn");

    } else {

      sendBtnEle.classList.remove("activeSendBtn");

    }
  }

  textarea.style.height = "47px";
  textarea.style.height = textarea.scrollHeight + "px";

};

textarea.oninput = textInputEvent;

document.getElementsByClassName("setSwitch")[0].onclick = function(ev) {
  let activeEle = this.getElementsByClassName("activeSwitch")[0];
  if (ev.target !== activeEle) {
    activeEle.classList.remove("activeSwitch");
    ev.target.classList.add("activeSwitch");
    document.getElementById(ev.target.dataset.id).style.display = "block";
    document.getElementById(activeEle.dataset.id).style.display = "none";
  }
}

const API_URL = "v1/chat/completions";

let loading = false;

let presetRoleData = {
  "default": "You are a helpful assistant, try to answer concisely",
  //"normal": "You are a helpful assistant, try to answer concisely",
  //"cat": "You're a cat who ends every sentence with 'meow'",
  //"emoji": "",
  //"image": "When you need to send pictures, please generate them in markdown language, without backslashes or code boxes. When you need to use the unsplash API, follow the format, https://source.unsplash.com/960x640/? ＜English keywords >",
};

let modelVersion; // 模型版本
let apiHost; // api反代地址
let customAPIKey; // 自定义apiKey
let systemRole; // 自定义系统角色
let roleNature; // 角色性格
let roleTemp; // 回答质量
let enableCont; // 是否开启连续对话，默认开启，对话包含上下文信息。
let enableLongReply; // 是否开启长回复，默认关闭，开启可能导致api费用增加。
let longReplyFlag;
let textSpeed; // 打字机速度，越小越快
let voiceIns; // Audio or SpeechSynthesisUtterance
let supportMSE = !!window.MediaSource; // 是否支持MSE（除了ios应该都支持）
let voiceMIME = "audio/mpeg";

const scrollToBottom = () => {

  if (messagsEle.scrollHeight - messagsEle.scrollTop - messagsEle.clientHeight < 128) {
    messagsEle.scrollTo(0, messagsEle.scrollHeight)
  }

  window.scrollTo(0, document.body.scrollHeight);
}

const scrollToBottomLoad = (ele) => {

  if (messagsEle.scrollHeight - messagsEle.scrollTop - messagsEle.clientHeight < ele.clientHeight + 128) {
    messagsEle.scrollTo(0, messagsEle.scrollHeight)
  }

}

const md = markdownit({

  linkify: true, // identity a link
  highlight: function(str, lang) { // markdown
    try {
      return hljs.highlightAuto(str).value;
    } catch (e) {}
    return ""; // use external default escaping
  }
});
md.use(texmath, {
    engine: katex,
    delimiters: "dollars",
    katexOptions: {
      macros: {
        "\\RR": "\\mathbb{R}"
      }
    }
  })
  .use(markdownitLinkAttributes, {
    attrs: {
      target: "_blank",
      rel: "noopener"
    }
  });

const x = {

  getCodeLang(str = "") {
      const res = str.match(/ class="language-(.*?)"/);
      return (res && res[1]) || "";
    },
    getFragment(str = "") {
      return str ? `<span class="u-mdic-copy-code_lang">${str}</span>` : "";
    },
};

const strEncode = (str = "") => {
  if (!str || str.length === 0) return "";
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '\'')
    .replace(/"/g, '&quot;');
};

const getCodeLangFragment = (oriStr = "") => {
  return x.getFragment(x.getCodeLang(oriStr));
};

const copyClickCode = (ele) => {

  const input = document.createElement("textarea");
  input.value = ele.dataset.mdicContent;
  const nDom = ele.previousElementSibling;
  const nDelay = ele.dataset.mdicNotifyDelay;
  const cDom = nDom.previousElementSibling;
  document.body.appendChild(input);
  input.select();
  input.setSelectionRange(0, 9999);
  document.execCommand("copy");
  document.body.removeChild(input);
  if (nDom.style.display === "none") {
    nDom.style.display = "block";
    cDom && (cDom.style.display = "none");
    setTimeout(() => {
      nDom.style.display = "none";
      cDom && (cDom.style.display = "block");
    }, nDelay);
  }

};

const copyClickMd = (idx) => {

  const input = document.createElement("textarea");
  input.value = app.data[idx].content;
  document.body.appendChild(input);
  input.select();
  input.setSelectionRange(0, 9999);
  document.execCommand("copy");
  document.body.removeChild(input);

}

const enhanceCode = (render, options = {}) => (...args) => {

  /* args = [tokens, idx, options, env, slf] */
  const {
    btnText = "copy code", // button text
      successText = "copied", // copy-success text
      successTextDelay = 2000, // successText show time [ms]
      showCodeLanguage = true, // false | show code language
  } = options;
  const [tokens = {}, idx = 0] = args;
  const cont = strEncode(tokens[idx].content || "");
  const originResult = render.apply(this, args);
  const langFrag = showCodeLanguage ? getCodeLangFragment(originResult) : "";
  const tpls = [
    '<div class="m-mdic-copy-wrapper">',
    `${langFrag}`,
    `<div class="u-mdic-copy-notify" style="display:none;">${successText}</div>`,
    '<button ',
    'class="u-mdic-copy-btn j-mdic-copy-btn" ',
    `data-mdic-content="${cont}" `,
    `data-mdic-notify-delay="${successTextDelay}" `,
    `onclick="copyClickCode(this)">${btnText}</button>`,
    '</div>',
  ];
  const LAST_TAG = "</pre>";
  const newResult = originResult.replace(LAST_TAG, `${tpls.join("")}${LAST_TAG}`);

  return newResult;

};

const codeBlockRender = md.renderer.rules.code_block;

const fenceRender = md.renderer.rules.fence;
md.renderer.rules.code_block = enhanceCode(codeBlockRender);
md.renderer.rules.fence = enhanceCode(fenceRender);
md.renderer.rules.image = function(tokens, idx, options, env, slf) {
  let token = tokens[idx];
  token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children, options, env);
  token.attrSet("onload", "scrollToBottomLoad(this);this.removeAttribute('onload');this.removeAttribute('onerror')");
  token.attrSet("onerror", "scrollToBottomLoad(this);this.removeAttribute('onload');this.removeAttribute('onerror')");
  return slf.renderToken(tokens, idx, options)
}

const mdOptionEvent = function(ev) {

  let id = ev.target.dataset.id;

  if (id) {
    let parent = ev.target.parentElement;
    let idxEle = parent.parentElement;
    let idx = Array.prototype.indexOf.call(chatlog.children, this.parentElement);

    if (id === "refreshMd") {

      if (!loading && chatlog.children[idx].dataset.loading !== "true") {
        let className = parent.className;
        if (className == "refreshReq") {
          chatlog.children[idx].children[0].innerHTML = "<br />";
          chatlog.children[idx].dataset.loading = true;
          idx = systemRole ? idx + 1 : idx;
          app.data[idx].content = "";
          loadAction(true);
          refreshIdx = idx;
          streamGen();
        } else {
          chatlog.children[idx].dataset.loading = true;
          idx = sytemRole ? idx + 1 : idx;
          progressData = app.data[idx].content;
          loadAction(true);
          refreshIdx = idx;
          streamGen(true);
        }
      }
    } else if (id === "copyMd") {
      idxEle.classList.add("moreOptionHidden");
      idx = systemRole ? idx + 1 : idx;
      copyClickMd(idx);
      notyf.success("copied");
    } else if (id === "delMd") {
      idxEle.classList.add("moreOptionHidden");
      if (!loading) {
        if (confirmAction("Delete this message?")) {

          chatlog.removeChild(chatlog.children[idx]);
          idx = systemRole ? idx + 1 : idx;
          app.data.splice(idx, 1);
          updateChats();
        }
      }
    }
    else if (id === "speakMd") {

      idx = idx + 1;
			//console.log('speak', idx, app.data[ idx ].content );

			if( valid( app.data[ idx ].content ) ){

				//startSpeaking( app.data[ idx ].content );
    				parentref.postMessage({ event_id: 'start-speaking', data: { text: cleanText( app.data[ idx ].content ) } }, '*' );

			}

		}
    else if (id === "pauseSpeakMd") {
			pauseSpeaking();
		}
    else if (id === "stopSpeakMd") {
			stopSpeaking();
		}

  }

}
const moreOption = (ele) => {
  ele.classList.remove("moreOptionHidden");
}
const formatMdEle = (ele) => {
  let realMd = document.createElement("div");
  realMd.className = "markdown-body";
  ele.appendChild(realMd);
  let mdOption = document.createElement("div");
  mdOption.className = "mdOption";
  ele.appendChild(mdOption);
  if (ele.className !== "request") {
    mdOption.innerHTML = `<div class="refreshReq">
            <svg data-id="refreshMd" width="16" height="16" role="img"><title>refresh</title><use xlink:href="#refreshIcon" /></svg>
            <svg data-id="refreshMd" width="16" height="16" role="img"><title>use</title><use xlink:href="#halfRefIcon" /></svg>
        </div>`
  }
  let optionWidth = "63px"; // "96px" : "63px";
  mdOption.innerHTML += `<div class="moreOption" onmouseenter="moreOption(this)">
    <svg class="optionTrigger" width="16" height="16" role="img"><title>options</title><use xlink:href="#optionIcon" /></svg>
    <div class="optionItems" style="width:${optionWidth};left:-${optionWidth}">` + `<div data-id="delMd" class="optionItem" title="delete"> <svg width="20" height="20"><use xlink:href="#delIcon" /></svg> </div>
    <div data-id="copyMd" class="optionItem" title="copy"> <svg width="20" height="20"><use xlink:href="#copyIcon" /></svg> </div>
    <span data-id="speakMd" class="optionItem" title="start speaking"><i class="fa-solid fa-play"></i></span>&nbsp;
    <span data-id="pauseSpeakMd" class="optionItem" title="pause speaking"><i class="fa-solid fa-pause"></i></span>&nbsp;
    <span data-id="stopSpeakMd" class="optionItem" title="stop speaking"><i class="fa-solid fa-stop"></i></span>&nbsp;
		</div></div>`;

  mdOption.onclick = mdOptionEvent;
}

const chatEleAdd = (idx) => {

  let chat = app.chatsData[idx];
  let chatEle = document.createElement("div");
  chatEle.className = "chatLi";
  chatEle.innerHTML = `<svg width="24" height="24"><use xlink:href="#chatIcon" /></svg>
        <div class="chatName">${chat.name}</div>
        <div class="chatOption"><svg data-type="chatEdit" style="margin-right:4px" width="24" height="24" role="img"><title>edit</title><use xlink:href="#chatEditIcon" /></svg>
        <svg data-type="chatDel" width="24" height="24" role="img"><title>delete</title><use xlink:href="#delIcon" /></svg></div>`
  chatListEle.appendChild(chatEle);
  chatEle.onclick = chatEleEvent;
  return chatEle;
};

const addNewChat = () => {

  let chat = {
    name: "chat",
    data: []
  };
  app.chatsData.push(chat);
  updateChats();

};

const delChat = (idx) => {
  if (confirmAction("delete session?")) {
   endAll();
    if (idx === app.activeChatIdx) {
      if (idx - 1 >= 0) {
        app.activeChatIdx = idx - 1;
      } else if (idx === app.chatsData.length - 1) {
        app.activeChatIdx = app.chatsData.length - 2;
      }
    }
    app.chatsData.splice(idx, 1);
    chatListEle.children[idx].remove();
    if (app.activeChatIdx === -1) {
      addNewChat();
      app.activeChatIdx = 0;
      chatEleAdd(app.activeChatIdx);
    }
    updateChats();
    activeChat();
  }
};

const endEditEvent = (ev) => {
  let activeEle = document.getElementById("activeChatEdit")
  if (!activeEle.contains(ev.target)) {
    let ele = chatListEle.children[app.activeChatIdx];
    app.chatsData[app.activeChatIdx].name = activeEle.value;
    ele.children[1].textContent = activeEle.value;
    ele.lastElementChild.remove();
    updateChats();
    document.body.removeEventListener("mousedown", endEditEvent, true);
  }
};
const toEditChatName = (idx) => {
  let inputEle = document.createElement("input");
  inputEle.id = "activeChatEdit";
  inputEle.value = app.chatsData[idx].name;
  chatListEle.children[idx].appendChild(inputEle);
  inputEle.focus();
  document.body.addEventListener("mousedown", endEditEvent, true);
};

const chatEleEvent = function(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  let idx = Array.prototype.indexOf.call(chatListEle.children, this);
  if (ev.target.className === "chatLi") {
    if (app.activeChatIdx !== idx) {
      endAll();
      app.activeChatIdx = idx;
      activeChat();
    }
    document.body.classList.remove("show-nav");
  } else if (ev.target.dataset.type === "chatEdit") {
    toEditChatName(idx);
  } else if (ev.target.dataset.type === "chatDel") {
    delChat(idx);
  }
};

const updateChats = () => {
  localStorage.setItem("chats", JSON.stringify(app.chatsData));
};

const createConvEle = (className) => {
  let div = document.createElement("div");
  div.className = className;
  chatlog.appendChild(div);
  formatMdEle(div);
  return div;
}
const activeChat = () => {

  app.data = app.chatsData[app.activeChatIdx]["data"] || [];

  //console.log( app.data );

  Array.from(document.getElementsByClassName("activeChatLi")).forEach(item => {
    item.classList.remove("activeChatLi");
  });

  chatListEle.children[app.activeChatIdx].classList.add("activeChatLi");

  if ( app.data[0] && app.data[0].role === "system") {

    //systemRole = app.data[0].content;
    //systemEle.value = systemRole;

    systemRole = app.tutor || '';

    //console.log( app.tutors );

    if ( findObjectByKey( app.tutors, 'act', app.tutor ).length > 0 ){

      let obj = findObjectByKey( app.tutors, 'act', app.tutor );

      systemEle.value = app.data[0].content = app.tutor_prompt = obj[0].prompt;
      app.tutor_label = obj[0].act_label;

    }
    else {

      //systemEle.value = 'Act as a teaching ', app.tutor;
      systemEle.value = '';

    }

    $('#chat-title').text( app.tutor_label );

    localStorage.setItem("system", app.tutor ); // systemRole

    //console.log( 'case1: ', app.tutor, systemRole, 'Act as a teaching ', app.tutor );
    //console.log( 'case1: ', app.tutor, systemRole, systemEle.value );

  }
	else {

    systemRole = app.tutor || '';

    if ( findObjectByKey( app.tutors, 'act', app.tutor ).length > 0 ){

      let obj = findObjectByKey( app.tutors, 'act', app.tutor );

      systemEle.value = app.data[0].content = app.tutor_prompt = obj[0].prompt;
      app.tutor_label = obj[0].act_label;

    }
    else {

      systemEle.value = '';

    }

    //systemRole = "";
    //systemEle.value = "";

    //localStorage.setItem("system", systemRole);

    //console.log( 'case2: ', app.tutor, systemRole, systemEle.value );

  }

  chatlog.innerHTML = "";

  if (systemRole ? app.data.length - 1 : app.data.length) {

    let firstIdx = systemRole ? 1 : 0;

    for (let i = firstIdx; i < app.data.length; i++) {

      if ( valid( app.data[i] ) ){

        let my_html = md.render( app.data[i].content ) || '<br/>';

        //console.log( my_html );

        my_html = markupEntities(my_html);
        my_html = markupISBNs(my_html);
        //my_html = markupComplexWords(my_html);

        createConvEle( app.data[i].role === "user" ? "request" : "response").children[0].innerHTML = my_html;
        //createConvEle(data[i].role === "user" ? "request" : "response").children[0].innerHTML = md.render(data[i].content) || "<br />";

      }

    }

  }

  localStorage.setItem("app.activeChatIdx", app.activeChatIdx);

};

newChatEle.onclick = () => {
  endAll();
  addNewChat();
  app.activeChatIdx = app.chatsData.length - 1;
  chatEleAdd(app.activeChatIdx);
  activeChat();
};

const initChats = () => {

  let localChats = localStorage.getItem("chats");

  let localChatIdx = localStorage.getItem("app.activeChatIdx")

  app.activeChatIdx = (localChatIdx && parseInt(localChatIdx)) || 0;

  if (localChats) {

    app.chatsData = JSON.parse(localChats);

    //console.log( app.chatsData );

    for (let i = 0; i < app.chatsData.length; i++) {
      chatEleAdd(i);
    }

  }
  else {

    addNewChat();
    chatEleAdd(app.activeChatIdx);

  }

};

initChats();

activeChat();

document.getElementById("exportChat").onclick = () => {
  if (loading) {
    stopLoading();
  }
  let blob = new Blob([JSON.stringify(app.chatsData, null, 2)], {
    type: "application/json"
  });
  let date = new Date();
  let fileName = "chats-" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + ".json";
  downBlob(blob, fileName);
};

const blobToText = (blob) => {
  return new Promise((res, rej) => {
    let reader = new FileReader();
    reader.readAsText(blob);
    reader.onload = () => {
      res(reader.result);
    }
    reader.onerror = (error) => {
      rej(error);
    }
  })
};

document.getElementById("importChatInput").onchange = function() {
  let file = this.files[0];
  blobToText(file).then(text => {
    try {
      let json = JSON.parse(text);
      let checked = json.every(item => {
        return item.name !== void 0 && item.data !== void 0;
      });
      if (checked) {
        while (json.length) {
          app.chatsData.push(json.shift());
          chatEleAdd(app.chatsData.length - 1);
        }
        updateChats();
      } else {
        throw new Error("format check failed")
      }
    } catch (e) {
      notyf.error("import failed")
    }
    this.value = "";
  })
};

document.getElementById("clearChat").onclick = () => {

  if (confirmAction("Clear all sessions?")) {
    app.chatsData.length = 0;
    chatListEle.innerHTML = "";
    endAll();
    addNewChat();
    app.activeChatIdx = 0;
    chatEleAdd(app.activeChatIdx);
    updateChats();
    activeChat();
  }

};

const endAll = () => {
  if (loading) stopLoading();
};

const initSetting = () => {

  $('#clearConv').click();

  const modelEle = document.getElementById("preSetModel");
  let localModel = localStorage.getItem("modelVersion");
  if (localModel) {
    modelVersion = localModel;
    modelEle.value = localModel;
  }
  modelEle.onchange = () => {
    modelVersion = modelEle.value;
    localStorage.setItem("modelVersion", modelVersion);
  }
  modelEle.dispatchEvent(new Event("change"));

  const apiHostEle = document.getElementById("apiHostInput");
  let localApiHost = localStorage.getItem("APIHost");
  if (localApiHost) {
    apiHost = localApiHost;
    apiHostEle.value = localApiHost;
  }
  apiHostEle.onchange = () => {
    apiHost = apiHostEle.value;
    localStorage.setItem("APIHost", apiHost);
  }
  apiHostEle.dispatchEvent(new Event("change"));
  const keyEle = document.getElementById("keyInput");
  let localKey = localStorage.getItem('_immortal|api_key_openai'); // CONZEPT PATCH
  //let localKey = localStorage.getItem("APIKey");
  if (localKey) {
    customAPIKey = localKey;
    keyEle.value = localKey;
  }
  keyEle.onchange = () => {
    customAPIKey = keyEle.value;
    //localStorage.setItem("APIKey", customAPIKey);
  }
  keyEle.dispatchEvent(new Event("change"));
  if (systemRole === void 0) {
    let localSystem = localStorage.getItem("system");
    if (localSystem) {
      systemRole = localSystem;
      systemEle.value = localSystem;
      app.data.unshift({
        role: "system",
        content: systemRole
      });
      updateChats();
    } else {
      systemRole = systemEle.value;
    }
  }
  systemEle.onchange = () => {
    systemRole = systemEle.value;
    localStorage.setItem("system", systemRole);
    if (systemRole) {
      if (app.data[0] && app.data[0].role === "system") {
        app.data[0].content = systemRole;
      } else {
        app.data.unshift({
          role: "system",
          content: systemRole
        });
      }
    } else if ( app.data[0] && app.data[0].role === "system") {
      app.data.shift();
    }
    updateChats();
  }

  const preEle = document.getElementById("preSetSystem");

  preEle.onchange = () => {

    let val = preEle.value;

    if (val && presetRoleData[val]) {

      systemEle.value = presetRoleData[val];

      if ( findObjectByKey( app.tutors, 'act', val ).length > 0 ){

        const obj = findObjectByKey( app.tutors, 'act', app.tutor );
        app.tutor_label   = obj[0].act_label;
        app.tutor_prompt = obj[0].prompt; 

      }

    }
    else {

      systemEle.value = "";
      app.tutor_label = '';
      app.tutor_prompt = '';

    }
    systemEle.dispatchEvent(new Event("change"));
    systemEle.focus();

    app.tutor_label = $('#preSetSystem option:selected').text() || '';

    $('#chat-title').text( app.tutor_label );

  }

  const topEle = document.getElementById("top_p");
  let localTop = localStorage.getItem("top_p");
  if (localTop) {
    roleNature = parseFloat(localTop);
   topEle.value = localTop;
  }
  topEle.oninput = () => {
    topEle.style.backgroundSize = (topEle.value - topEle.min) * 100 / (topEle.max - topEle.min) + "% 100%";
    roleNature = parseFloat(topEle.value);
    localStorage.setItem("top_p", topEle.value);
  }
  topEle.dispatchEvent(new Event("input"));
  const tempEle = document.getElementById("temp");
  let localTemp = localStorage.getItem("temp");
  if (localTemp) {
    roleTemp = parseFloat(localTemp);
    tempEle.value = localTemp;
  }
  tempEle.oninput = () => {
    tempEle.style.backgroundSize = (tempEle.value - tempEle.min) * 100 / (tempEle.max - tempEle.min) + "% 100%";
    roleTemp = parseFloat(tempEle.value);
    localStorage.setItem("temp", tempEle.value);
  }
  tempEle.dispatchEvent(new Event("input"));
  const speedEle = document.getElementById("textSpeed");
  let localSpeed = localStorage.getItem("textSpeed");
  if (localSpeed) {
    textSpeed = parseFloat(speedEle.min) + (speedEle.max - localSpeed);
    speedEle.value = localSpeed;
  }
  speedEle.oninput = () => {
    speedEle.style.backgroundSize = (speedEle.value - speedEle.min) * 100 / (speedEle.max - speedEle.min) + "% 100%";
    textSpeed = parseFloat(speedEle.min) + (speedEle.max - speedEle.value);
    localStorage.setItem("textSpeed", speedEle.value);
  }
  speedEle.dispatchEvent(new Event("input"));
  const contEle = document.getElementById("enableCont");
  let localCont = localStorage.getItem("enableCont");
  if (localCont) {
    enableCont = localCont === "true";
    contEle.checked = enableCont;
  }
  contEle.onchange = () => {
    enableCont = contEle.checked;
    localStorage.setItem("enableCont", enableCont);
  }
  contEle.dispatchEvent(new Event("change"));
  const longEle = document.getElementById("enableLongReply");
  let localLong = localStorage.getItem("enableLongReply");
  if (localLong) {
    enableLongReply = localLong === "true";
    longEle.checked = enableLongReply;
  }
  longEle.onchange = () => {
    enableLongReply = longEle.checked;
    localStorage.setItem("enableLongReply", enableLongReply);
  }
  longEle.dispatchEvent(new Event("change"));
};

initSetting();

document.getElementById("loadMask").style.display = "none";

const closeEvent = (ev) => {
  if (settingEle.contains(ev.target)) return;
  if (!dialogEle.contains(ev.target)) {
    dialogEle.style.display = "none";
    document.removeEventListener("mousedown", closeEvent, true);
    settingEle.classList.remove("showSetting");
  }
}
settingEle.onmousedown = () => {
  dialogEle.style.display = dialogEle.style.display === "block" ? "none" : "block";
  if (dialogEle.style.display === "block") {
    document.addEventListener("mousedown", closeEvent, true);
    settingEle.classList.add("showSetting");
  } else {
    document.removeEventListener("mousedown", closeEvent, true);
    settingEle.classList.remove("showSetting");
  }
}

let delayId;

const delay = () => {

  return new Promise((resolve) => delayId = setTimeout(resolve, textSpeed)); //打字机时间间隔

}

const confirmAction = (prompt) => {

 return true;

  /*
  if (window.confirm(prompt)) {
      return true;
  }
  else {
      return false;
  }
  */

};

let autoVoiceIdx = 0;
let autoVoiceDataIdx;
let controller;
let controllerId;
let refreshIdx;
let currentResEle;
let progressData = "";

const streamGen = async(long) => {

  controller = new AbortController();
  controllerId = setTimeout(() => {
    notyf.error('Request timed out, please try again later.');
    stopLoading();
  }, 30000);
  let headers = {
    "Content-Type": "application/json"
  };

  if (customAPIKey) headers["Authorization"] = "Bearer " + customAPIKey;

  let isRefresh = refreshIdx !== void 0;

  if (isRefresh) {

    currentResEle = chatlog.children[systemRole ? refreshIdx - 1 : refreshIdx];

  }
  else if (!currentResEle) {

    currentResEle = createConvEle("response");
    currentResEle.children[0].innerHTML = "<br />";
    currentResEle.dataset.loading = true;
    scrollToBottom();

  }

  let idx = isRefresh ? refreshIdx : app.data.length;

  let dataSlice = [];

  //console.log( 'data: ', app.data, systemRole, app.tutor_prompt );
  //console.log( 'app.data[0]: ', app.data[0] );

  // FIXME: somewhere before this code there is a bug removing the "app.data[0]" object
  if ( !valid( app.data[0] )  ) {

    console.log('fixme');

    app.data[0] = {

      content : app.tutor_prompt,
      role    : 'system',

    }

  }

  if (long) {

    idx = isRefresh ? refreshIdx :  app.data.length - 1;

    dataSlice = [ app.data[idx - 1],  app.data[idx]];

    if (systemRole) {
      dataSlice.unshift( app.data[0] );
    }

  }
  else if (enableCont) {

    dataSlice = app.data.slice(0, idx);

  }
  else {

    dataSlice = [ app.data[idx - 1]];

    if (systemRole) {

      dataSlice.unshift( app.data[0] );

    }

  }

  //console.log( app.data, 'dataSlice: ', dataSlice );

  //console.log('foo1', app.tutors, app.tutor, findObjectByKey( app.tutors, 'act', app.tutor ).length > 0 );

  /*
  if ( findObjectByKey( app.tutors, 'act', app.tutor ).length > 0 ){

    let obj = findObjectByKey( app.tutors, 'act', app.tutor );

    systemEle.value = app.data[0].content = app.tutor_prompt = obj[0].prompt;

    console.log( app.tutor_prompt );

  }
  */

  fetch( `json/prompts-${ app.language }.json?${app.version}`, { }).then(async(response) => {

    let res = await response.json();

    app.tutors = res;

    try {
      apiHost = 'https://api.openai.com/'; // CONZEPT PATCH

      //console.log( 'requested: ', app.tutor, app.tutor_prompt, ' used: ', dataSlice[0].content );

      const res = await fetch(apiHost + API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: dataSlice,
          model: modelVersion,
          stream: true,
          temperature: roleTemp,
          top_p: roleNature
        }),
        signal: controller.signal
      });

      clearTimeout(controllerId);

      controllerId = void 0;

      if (res.status !== 200) {

        if (res.status === 401) {

          notyf.error("Error: Please enter a correct API key in the settings.")
          $('#setDialog').show();
        }
        else if (res.status === 400) {
          notyf.error("Error: The content of the request is too large, please delete part of the conversation or open the settings to close the continuous conversation");
        }
        else if (res.status === 404) {
          notyf.error("Error: Not authorized to use this model. Please open the settings to choose another GPT model.");
        }
        else if (res.status === 429 && !res.statusText) {
          notyf.error("Error: Please check your bill.");
        }
        else {
          notyf.error("Error: API call frequency limit reached, please try again later.");
        }

        stopLoading();

        return;

      }

      const decoder = new TextDecoder();
      const reader = res.body.getReader();
      const readChunk = async() => {

        return reader.read().then(async({
          value, done
        }) => {

          if (!done) {

            value = decoder.decode(value);

            let chunks = value.split(/\n{2}/g);

            chunks = chunks.filter(item => {
              return item.trim();
            });

            for (let i = 0; i < chunks.length; i++) {

              let chunk = chunks[i];

              if (chunk) {

                let payload;

                try {
                  payload = JSON.parse(chunk.slice(6));
                }
                catch (e) {
                  break;
                }

                if (payload.choices[0].finish_reason) {

                  let lenStop = payload.choices[0].finish_reasn === "length";
                  let longReplyFlag = enableLongReply && lenStop;

                  if (!enableLongReply && lenStop) {
                    currentResEle.children[1].children[0].className = "halfRefReq"
                  }
                  else {
                    currentResEle.children[1].children[0].className = "refreshReq"
                  };

                  break;
                }
                else {

                  let content = payload.choices[0].delta.content;

                  if (content) {

                    if (!progressData && !content.trim()) continue;

                    if (progressData) await delay();

                    progressData += content;

                    //console.log( progressData );

                    let my_html = md.render(progressData);
                    my_html = markupEntities(my_html);
                    my_html = markupISBNs(my_html);
                    //my_html = markupYears(my_html);

                    if ( app.language === 'en' ){

                      //my_html = markupCenturies(my_html);

                    }

                    currentResEle.children[0].innerHTML = my_html;

                    //currentResEle.children[0].innerHTML = md.render( progressData );
                    //currentResEle.children[0].innerHTML = markupEntities( progressData );

                    if (!isRefresh) {
                      scrollToBottom();
                    }

                  }
                }
              }
            }

            return readChunk();

          }
          else {

            //console.log('done');

            if (isRefresh) {

              app.data[refreshIdx].content = progressData;

              if (longReplyFlag) return streamGen(true);

            }
            else { // not a refresh

              if (long) { // user asked for a long response

                data[data.length - 1].content = progressData;

              }
              else { // default: user asked for a short response

                //console.log( progressData );

                app.data.push({
                  role: "assistant",
                  content: progressData
                })

              }

              if (longReplyFlag) return streamGen(true);

            }

            stopLoading(false);

          }
        });
      };

      await readChunk();

    }
    catch (e) {

      if (e.message.indexOf("aborted") === -1) {
        notyf.error("access failed!")
      }

      stopLoading();

    }

  }).catch(e => {})

};

const loadAction = (bool) => {

  loading = bool;
  sendBtnEle.disabled = bool;
  sendBtnEle.className = bool ? " loading" : "loaded";
  stopEle.style.display = bool ? "block" : "none";

  //startSpeakingEle.disabled = bool;
  //pauseSpeakingEle.disabled = bool;
  //stopSpeakingEle.disabled = bool;

  textInputEvent();

	if ( bool === false ){

    if ( valid( app.autospeak ) && app.data[ app.data.length - 1 ].role === "assistant") {

			if ( valid( app.data[ app.data.length - 1 ].content ) ){

				//startSpeaking( app.data[ app.data.length - 1 ].content );
    				parentref.postMessage({ event_id: 'start-speaking', data: { text: cleanText( app.data[ app.data.length - 1 ].content ) } }, '*' );

			}

		}

	}

}

const stopLoading = (abort = true) => {

  stopEle.style.display = "none";

  if (abort) {

    controller.abort();

    if (controllerId) clearTimeout(controllerId);

    if (delayId) clearTimeout(delayId);

    if (refreshIdx !== void 0) {

      app.data[refreshIdx].content = progressData

    }
    else if ( app.data[ app.data.length - 1].role === "assistant") {

      app.data[ app.data.length - 1].content = progressData;

    }
    else {

      app.data.push({
        role: "assistant",
        content: progressData
      })

    }

  }
  updateChats();
  controllerId = delayId = refreshIdx = void 0;
  autoVoiceIdx = 0;
  currentResEle.dataset.loading = false;
  currentResEle = null;
  progressData = "";
  loadAction(false);
}

const generateText = async(message) => {

  loadAction(true);

  let requestEle = createConvEle("request");

  requestEle.children[0].innerHTML = message;
  //requestEle.children[0].innerHTML = md.render(message);

  app.data.push({
    role: "user",
    content: message
  });

  if (app.chatsData[app.activeChatIdx].name === "新的会话") {

    if (message.length > 50) {
      message = message.slice(0, 47) + "...";
    }

    app.chatsData[app.activeChatIdx].name = message;

    chatListEle.children[app.activeChatIdx].children[1].textContent = message;

  }

  updateChats();

  scrollToBottom();

  await streamGen();

};

textarea.onkeydown = (e) => {
  if (e.keyCode === 13 && !e.shiftKey) {
    e.preventDefault();
    genFunc();
  }
};

const genFunc = function() {

  if ( app.recing ) {
    toggleRecEv();
  }

  let message = textarea.value.trim();

  if (message.length !== 0) {
    if (loading === true) return;
    textarea.value = "";
    textarea.style.height = "47px";
    generateText(message);
  }

	if ( valid( app.recognition ) ){

		app.recognition.abort(); // reset speech input by stopping the API

	}

};

sendBtnEle.onclick = genFunc;
stopEle.onclick = stopLoading;

startSpeakingEle.onclick = startSpeaking();
pauseSpeakingEle.onclick = pauseSpeaking();
stopSpeakingEle.onclick = stopSpeaking();

document.getElementById("clearConv").onclick = () => {

  if (!loading && confirmAction("Clear the session?")) {

    if (systemRole) {
      app.data.length = 1
    }
    else {
      app.data.length = 0
    }

    chatlog.innerHTML = "";
    updateChats();

  }

}

const downRoleController = new AbortController();

setTimeout(() => {
  downRoleController.abort();
}, 10000);

const preEle = document.getElementById("preSetSystem");

if ( app.supported_languages.includes( app.language ) ){

  fetch( `json/prompts-${ app.language }.json?${app.version}`, { signal: downRoleController.signal }).then(async(response) => {

    let res = await response.json();

    app.tutors = res;

    for (let i = 0; i < res.length; i++) {

      let key = "act" + i;

      presetRoleData[key] = res[i].prompt.trim();

      let optionEle = document.createElement("option");
      optionEle.text = res[i].act;
      optionEle.value = key;

      preEle.options.add(optionEle);

    }

    // set system role
    const sel = `#preSetSystem option:contains(\'${app.tutor}\')`;
    $( sel ).attr('selected', 'selected').trigger('change'); 

    // set chat mode title
    const obj         = findObjectByKey( app.tutors, 'act', app.tutor );
    app.tutor_label   = obj[0].act_label;
    app.tutor_prompt  = obj[0].prompt; 

    $('#chat-title').text( app.tutor_label );

  }).catch(e => {})

}

document.toggleFullscreen = function() {

  if (screenfull.enabled) {

    screenfull.toggle();

  }

  return 0;

};

// keyboard control
$(document).keydown(function(event) {

  let key = (event.keyCode ? event.keyCode : event.which);

  //console.log( event, key );

  if (key == '70') { // "f"

    if ($('textarea, input, select').is(':focus')) {
      // do nothing
    } else {
      document.toggleFullscreen();
    }

  }

});

document.body.addEventListener("mousedown", event => {

  if (event.target.className === "toggler") {
    document.body.classList.toggle("show-nav");
  } else if (event.target.className === "overlay") {
    document.body.classList.remove("show-nav");
  } else if (event.target === document.body) {
    document.body.classList.remove("show-nav");
  }

});

const notyf = new Notyf({
  position: {
    x: 'center',
    y: 'top'
  },
  types: [{
    type: 'success',
    background: '#99c959',
    duration: 2000,
  }, {
    type: 'error',
    background: '#e15b64',
    duration: 3000,
  }]
});

function setupSpeechRecognition(){

	// Speech Recognition API: https://caniuse.com/speech-recognition
	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

	if ( SpeechRecognition ) {

		$('#speechInput').show();

		const searchFormInput = document.querySelector('#chatinput');

		app.recognition							= new SpeechRecognition();
		app.recognition.continuous	= true;
		app.recognition.lang				= app.language;

		const micBtn = document.querySelector('#microphone-icon');
		const micIcon = micBtn.firstElementChild;

		window.micBtnClick = function(){

			if( micIcon.classList.contains('fa-microphone') ){

				app.recognition.start();

			}
			else {

				app.recognition.stop();

			}
		}

		app.recognition.addEventListener('start', startSpeechRecognition );

		function startSpeechRecognition(){

			micIcon.classList.remove('fa-microphone');
			micIcon.classList.add('fa-microphone-slash');
			searchFormInput.focus();

		}

		app.recognition.addEventListener('end', endSpeechRecognition );

		function endSpeechRecognition(){

			micIcon.classList.remove('fa-microphone-slash');
			micIcon.classList.add('fa-microphone');
			searchFormInput.focus();
			//console.log('Speech recognition service disconnected');

		}

		// triggered when user stops talking
		app.recognition.addEventListener('result', resultOfSpeechRecognition);

		function resultOfSpeechRecognition(event) {

			const current			= event.resultIndex;
			const transcript	= event.results[current][0].transcript; // latest spoken text

			//console.log( event.results );
			
			if (
				transcript.toLowerCase().trim() === 'stop recording' ||
				transcript.toLowerCase().trim() === 'stop'
			){

				app.recognition.stop();

			}
			else if ( !searchFormInput.value ){ // user stopped speaking, insert spoken text

				let spoken_text = '';

				Object.entries( event.results ).forEach(([key, value]) => {

					spoken_text += value[0].transcript;

				});

				//console.log( spoken_text );
				searchFormInput.value = spoken_text.replace(/(\r\n|\n|\r)/gm, '');;

			}
			else {

				if (
					transcript.toLowerCase().trim() === 'go' ||
					transcript.toLowerCase().trim() === 'ask' ||
					transcript.toLowerCase().trim() === 'submit' ||
					transcript.toLowerCase().trim() === 'search'
				){

    			$('#sendbutton').click();

				}
				else if (
					transcript.toLowerCase().trim() === 'reset input' ||
					transcript.toLowerCase().trim() === 'reset' ||
					transcript.toLowerCase().trim() === 'clear input' ||
					transcript.toLowerCase().trim() === 'clear'
				){

					searchFormInput.value = '';

					app.recognition.abort(); // reset speech input by stopping the API

				}
				else { // use spoken text

					let spoken_text = '';

					Object.entries( event.results ).forEach(([key, value]) => {

						spoken_text += value[0].transcript;

					});

					searchFormInput.value = spoken_text.replace(/(\r\n|\n|\r)/gm, '');;

				}

			}

		}
		
	}
	else { // no speech recognition support

		//console.log('Your Browser does not support speech Recognition');

	}

}


function pauseSpeaking(){

  explore.synth_paused = true;
  //explore.synth.pause();

  parentref.postMessage({ event_id: 'pause-speaking', data: { } }, '*' );

}

function stopSpeaking(){

  //if ( valid( explore.synth ) ){

    //explore.synth.cancel();

  //}

  // also stop parent-frame speaking (if needed)
  parentref.postMessage({ event_id: 'stop-all-speaking', data: { } }, '*' );

}

function cleanText( text ){

  if ( typeof text === undefined || typeof text === 'undefined' ){

    return '';

  }
  else {

    text = text.replace(/(\r\n|\n|\r|'|"|`|\(|\)|\[|\]|\*|#)/gm, '');

    while (text != (text = text.replace(/\{[^\{\}]*\}/gm, ''))); // remove math-element-noise
    //.replace(/ {displaystyle.*?} /gm, '');

    //console.log( text );

    return text;

  }

}

function resumeSpeaking(){

  explore.synth_paused = false;

  parentref.postMessage({ event_id: 'resume-speaking', data: { } }, '*' );

}

function startSpeaking( text ){

  parentref.postMessage({ event_id: 'show-loader', data: { } }, '*' );

  //if ( ! valid( explore.synth ) ){ return 1; }

  if ( explore.synth_paused ){

    resumeSpeaking();

    return 0;

  }
  //else if ( explore.synth.speaking ){ // something else is currently speaking

    //console.log('already speaking, so cancelling first');
    //stopSpeaking();
    //parentref.postMessage({ event_id: 'stop-parent-speaking', data: { } }, '*' );

  //}

  explore.synth_paused = false;

  //console.log( text );

	if ( typeof text === undefined || typeof text === 'undefined' || text === '' ){ // speak full article

    text  = $('.mw-parser-output h2, h3, h4, h5, h6, p:not(table p), ul:not(table ul), li:not(table li), dl, dd').clone()
          .find( explore.tts_removals ).remove()
          .end().text()

    //console.log( text );

    text = $('h2:first').text() + text;

	}
	else { // speak article section

	}

  //text = cleanText( text );

	//console.log( text );

  //let utterance   = new SpeechSynthesisUtterance( text );

	//utterance.lang  = explore.voice_code;
	//utterance.rate  = explore.voice_rate;
	//utterance.pitch = explore.voice_pitch;

	//if ( explore.synth.speaking ){
		// do nothing, already speaking
	//}
	//else {
	//	explore.synth.speak( utterance );
	//}

	parentref.postMessage({ event_id: 'start-speaking', data: { text: cleanText( text ) } }, '*' );
  parentref.postMessage({ event_id: 'hide-loader', data: { } }, '*' );

}
