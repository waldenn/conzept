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

function markupEntities( text ){

  // TODO:
  //  - test non-English entity-linking quality
	//	BUG: prompt: "what is the semantic web with sources", some source-links are broken by the entity-linking

	//console.log( text );

  // skip the first word in the text
  const words			= text.trim().split(' ');

	//console.log( words );
  text						= words.join(' ');

	//console.log( text );

  //             ( lookback and prevent these cases from being used  )                                                              
  const regex = /(?<![\.\?\!:] |<\/p>\n<p>|<\/ol>\n<p>|<\/table>\n<p>)[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœ0-9\-\']*[A-ZÀ-Ü]+[0-9]*[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœ\-\']*[A-Z]*[a-zàáâãäåãæçèéêëìíîïñòóôõöøùúûüýÿßæœ\']*(?:\s+[A-ZÀ-Ü0-9][A-Za-z\'éçáøêëâîôöüïñ\-\']+)*/gm;

  //const regex = /(?<![\.\?\!:] |\&quot;|<\/p>\n<p>|<\/ol>\n<p>|<\/table>\n<p>)[a-z0-9\-\']*[A-ZÀ-Ü]+[0-9]*[a-zéçáøêëâîôöüïñ\-\']*[A-Z]*[a-z\'éçáøêëâîôöüïñ]*(?:\s+[A-ZÀ-Ü0-9][A-Za-z\'éçáøêëâîôöüïñ\-\']+)*/gm;
  //const regex = /(?<![\.\?\!:] |<\/p>\n<p>|<\/ol>\n<p>)[a-z0-9\-\']*[A-ZÀ-Ü]+[0-9]*[a-zéçáøêëâîôôüïñ\-\']*[A-Z]*[a-zéçáøêëâîôôüïñ]*(?:\s+[A-ZÀ-Ü0-9][A-Za-zéçáøêëâîôôüïñ\-\']+)*/gm;
  //const regex = /(?<![\.\?\!] |!(<li>\n<p>))[a-z\-]*[A-ZÀ-Ü]+[a-zéçáøêëâîôôüïñ\-\']*[A-Z]*[a-zéçáøêëâîôôüïñ]*(?:\s+[A-ZÀ-Ü0-9][A-Za-zéçáøêëâîôôüïñ\-\']+)*/g;

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
			let name_ = name.replace( /'s$/gm, ''); // remove "'s"-plurals at the end of words, to improve the Wikipedia link potential

			if (window.top == window.self) { // top window

				return `<a href="https://conze.pt/explore/${ encodeURIComponent( name_ ) }?t=string" target="_blank" title="" onclick="">${name}</a>`;

			}
			else { // embedded window

				return `<a href="javascript:void(0)" title="" onclick="exploreString( &quot;${encodeURIComponent( name_ )}&quot;)">${name}</a>`;

			}

		}

  });

}

const exploreString = (string) => {

  if ( getCurrentPane() === 'ps1' ){ // first split-pane -> open link in second split-pane

    window.parent.postMessage({
      event_id: 'handleClick',
      data: {
        type: 'link',
        url: CONZEPT_WEB_BASE + `/app/wikipedia/?t=${string}&l=${language}&embedded=#`,
        title: string,
        language: language,
        current_pane: getCurrentPane(),
        target_pane: 'ps2'
      }
    }, '*');

  }
  else { // pane 0 or 1

    window.parent.postMessage({
      event_id: 'handleClick',
      data: {
        type: 'explore',
        title: string,
        language: '',
        current_pane: getCurrentPane(),
        target_pane: 'p0'
      }
    }, '*');

  }

}

// ---------

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

window.addEventListener("mousedown", event => {

  if (event.target.className === "toggler") {
    document.body.classList.toggle("show-nav");
  } else if (event.target.className === "overlay") {
    document.body.classList.remove("show-nav");
  } else if (event.target === document.body) {
    document.body.classList.remove("show-nav");
  }

});

const messagsEle = document.getElementsByClassName("messages")[0];
const chatlog = document.getElementById("chatlog");
const stopEle = document.getElementById("stopChat");
const sendBtnEle = document.getElementById("sendbutton");
const textarea = document.getElementById("chatinput");

// set prompt message from URL-parameter
let my_string   = getParameterByName('m') || '';
let language    = getParameterByName('l') || 'en';
let tutor       = getParameterByName('t') || 'default';

let tutor_label = '';
let tutors      = []; // will be filled by the JSON-fetch later

$(document).ready(function() {

  // set system role
  const sel = `#preSetSystem option:contains(\'${tutor}\')`;
  $( sel ).attr('selected', 'selected').trigger('change'); 

  // set user prompt
  if ( valid( my_string ) ) {
    $('#chatinput').val(my_string);
    $('#sendbutton').click();
  }

  scrollToBottom();

});

const settingEle = document.getElementById("setting");
const dialogEle = document.getElementById("setDialog");
const systemEle = document.getElementById("systemInput");
const speechServiceEle = document.getElementById("preSetService");
const newChatEle = document.getElementById("newChat");
const chatListEle = document.getElementById("chatList");
const voiceRecEle = document.getElementById("voiceRecIcon");
const voiceRecSetEle = document.getElementById("voiceRecSetting");

let voiceType = 1;
let voiceRole = [];
let voiceVolume = [];
let voiceRate = [];
let voicePitch = [];
let enableContVoice;
let enableAutoVoice;
let existVoice = 1;
let azureToken;
let azureTokenTimer;
let azureRegion;
let azureKey;
let azureRole = [];
let azureStyle = [];
let isSafeEnv = location.hostname.match(/127.|localhost/) || location.protocol.match(/https:|file:/); // https或本地安全环境
let supportRec = !!window.webkitSpeechRecognition && isSafeEnv; // 是否支持语音识别输入
let recing = false;
let toggleRecEv;

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

if (supportRec) {

  noRecTip.style.display = "none";
  yesRec.style.display = "block";

  document.getElementById("voiceRec").style.display = "block";

  textarea.classList.add("message_if_voice");

  let langs = [ // from https://www.google.com/intl/en/chrome/demos/speech.html
    ['中文', ['cmn-Hans-CN', '普通话 (大陆)'],
      ['cmn-Hans-HK', '普通话 (香港)'],
      ['cmn-Hant-TW', '中文 (台灣)'],
      ['yue-Hant-HK', '粵語 (香港)']
    ],
    ['English', ['en-US', 'United States'],
      ['en-GB', 'United Kingdom'],
      ['en-AU', 'Australia'],
      ['en-CA', 'Canada'],
      ['en-IN', 'India'],
      ['en-KE', 'Kenya'],
      ['en-TZ', 'Tanzania'],
      ['en-GH', 'Ghana'],
      ['en-NZ', 'New Zealand'],
      ['en-NG', 'Nigeria'],
      ['en-ZA', 'South Africa'],
      ['en-PH', 'Philippines']
    ]
  ];

  langs.forEach((lang, i) => {
    select_language.options.add(new Option(lang[0], i));
    selectLangOption.options.add(new Option(lang[0], i))
  });

  const updateCountry = function() {

    selectLangOption.selectedIndex = select_language.selectedIndex = this.selectedIndex;
    select_dialect.innerHTML = "";
    selectDiaOption.innerHTML = "";

    let list = langs[select_language.selectedIndex];

    for (let i = 1; i < list.length; i++) {

      select_dialect.options.add(new Option(list[i][1], list[i][0]));
      selectDiaOption.options.add(new Option(list[i][1], list[i][0]));

    }

    select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
    selectDiaOption.parentElement.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
    localStorage.setItem("voiceRecLang", select_dialect.value);

  };

  let localLangIdx = 0;
  let localDiaIdx = 0;
  let localRecLang = localStorage.getItem("voiceRecLang");

  if (localRecLang) {

    let localIndex = langs.findIndex(item => {

      let diaIdx = item.findIndex(lang => {
        return lang instanceof Array && lang[0] === localRecLang
      });

      if (diaIdx !== -1) {
        localDiaIdx = diaIdx - 1;
        return true;
      }

      return false;

    });

    if (localIndex !== -1) {
      localLangIdx = localIndex;
    }

  }

  selectLangOption.onchange = updateCountry;
  select_language.onchange = updateCountry;

  selectDiaOption.onchange = select_dialect.onchange = function() {
    selectDiaOption.selectedIndex = select_dialect.selectedIndex = this.selectedIndex;
    localStorage.setItem("voiceRecLang", select_dialect.value);
  }
  selectLangOption.selectedIndex = select_language.selectedIndex = localLangIdx;
  select_language.dispatchEvent(new Event("change"));
  selectDiaOption.selectedIndex = select_dialect.selectedIndex = localDiaIdx;
  select_dialect.dispatchEvent(new Event("change"));

  let recIns = new webkitSpeechRecognition();

  // prevent some Android bug
  recIns.continuous = !(/\bAndroid\b/i.test(navigator.userAgent));
  recIns.interimResults = true;
  recIns.maxAlternatives = 1;
  let recRes = tempRes = "";
  let oriRes;

  const resEvent = (event) => {

    if (typeof(event.results) === 'undefined') {
      toggleRecEvent();
      return;
    }

    let isFinal;

    for (let i = event.resultIndex; i < event.results.length; ++i) {

      isFinal = event.results[i].isFinal;

      if (isFinal) {
        recRes += event.results[i][0].transcript;
      } else {
        tempRes = recRes + event.results[i][0].transcript;
      }

    }
    textarea.value = oriRes + (isFinal ? recRes : tempRes);
    textInputEvent();
    textarea.focus();
  };

  const endEvent = (event) => {
    if (!(event && event.type === "end")) {
      recIns.stop();
    }
    recIns.onresult = null;
    recIns.onerror = null;
    recIns.onend = null;
    recRes = tempRes = "";
    voiceRecEle.classList.remove("voiceRecing");
    recing = false;
  };

  const errorEvent = (ev) => {

    if (event.error === 'no-speech') {
      notyf.error("未识别到语音，请调整设备后重试！")
    }
    if (event.error === 'audio-capture') {
      notyf.error("未找到麦克风，请确保已安装麦克风！")
    }
    if (event.error === 'not-allowed') {
      notyf.error("未允许使用麦克风的权限！")
    }
    endEvent();
  }

  const closeEvent = (ev) => {

    if (voiceRecSetEle.contains(ev.target)) return;

    if (!voiceRecSetEle.contains(ev.target)) {
      voiceRecSetEle.style.display = "none";
      document.removeEventListener("mousedown", closeEvent, true);
      voiceRecEle.classList.remove("voiceLong");
    }

  }

  const longEvent = () => {
    voiceRecSetEle.style.display = "block";
    document.addEventListener("mousedown", closeEvent, true);
  }

  const toggleRecEvent = () => {

    voiceRecEle.classList.toggle("voiceRecing");
    if (voiceRecEle.classList.contains("voiceRecing")) {
      try {
        oriRes = textarea.value;
        recIns.lang = select_dialect.value;
        recIns.start();
        recIns.onresult = resEvent;
        recIns.onerror = errorEvent;
        recIns.onend = endEvent;
        recing = true;
      } catch (e) {
        endEvent();
      }
    } else {
      endEvent();
    }
  };

  toggleRecEv = toggleRecEvent;

  let timer;

  const voiceDownEvent = (ev) => {
    ev.preventDefault();
    let i = 0;
    voiceRecEle.classList.add("voiceLong");
    timer = setInterval(() => {
      i += 1;
      if (i >= 3) {
        clearInterval(timer);
        timer = void 0;
        longEvent();
      }
    }, 100)
  };

  const voiceUpEvent = (ev) => {

    ev.preventDefault();

    if (timer !== void 0) {
      toggleRecEvent();
      clearInterval(timer);
      timer = void 0;
      voiceRecEle.classList.remove("voiceLong");
    }
  }
  voiceRecEle.addEventListener("mousedown", voiceDownEvent);
  voiceRecEle.addEventListener("touchstart", voiceDownEvent);
  voiceRecEle.addEventListener("mouseup", voiceUpEvent);
  voiceRecEle.addEventListener("touchend", voiceUpEvent);
}

document.getElementsByClassName("setSwitch")[0].onclick = function(ev) {
  let activeEle = this.getElementsByClassName("activeSwitch")[0];
  if (ev.target !== activeEle) {
    activeEle.classList.remove("activeSwitch");
    ev.target.classList.add("activeSwitch");
    document.getElementById(ev.target.dataset.id).style.display = "block";
    document.getElementById(activeEle.dataset.id).style.display = "none";
  }
}

let localVoiceType = localStorage.getItem("existVoice");

if (localVoiceType) {
  existVoice = parseInt(localVoiceType);
  speechServiceEle.value = existVoice;
}

if (!(window.speechSynthesis && window.SpeechSynthesisUtterance)) {
  speechServiceEle.remove(2);
}

const clearAzureVoice = () => {

  azureKey = void 0;
  azureRegion = void 0;

  document.getElementById("azureExtra").style.display = "none";

  azureKeyInput.parentElement.style.display = "none";

  preSetAzureRegion.parentElement.style.display = "none";
  if (azureTokenTimer) {
    clearInterval(azureTokenTimer);
    azureTokenTimer = void 0;
  }
}

speechServiceEle.onchange = () => {

  existVoice = parseInt(speechServiceEle.value);
  localStorage.setItem("existVoice", existVoice);
  toggleVoiceCheck(true);

  if (checkAzureAbort && !checkAzureAbort.signal.aborted) {
    checkAzureAbort.abort();
    checkAzureAbort = void 0;
  }
  if (checkEdgeAbort && !checkEdgeAbort.signal.aborted) {
    checkEdgeAbort.abort();
    checkEdgeAbort = void 0;
  }
  if (existVoice === 3) {
    azureKeyInput.parentElement.style.display = "block";
    preSetAzureRegion.parentElement.style.display = "block";
    loadAzureVoice();
  } else if (existVoice === 2) {
    clearAzureVoice();
    loadEdgeVoice();
  } else if (existVoice === 1) {
    toggleVoiceCheck(false);
    clearAzureVoice();
    loadLocalVoice();
  }
}

let azureVoiceData, edgeVoiceData, systemVoiceData, checkAzureAbort, checkEdgeAbort;

const toggleVoiceCheck = (bool) => {
  checkVoiceLoad.style.display = bool ? "flex" : "none";
  speechDetail.style.display = bool ? "none" : "block";
}

const loadAzureVoice = () => {

  let checking = false;

  checkVoiceLoad.onclick = () => {

    if (checking) return;

    if (azureKey) {
      checking = true;
      checkVoiceLoad.classList.add("voiceChecking");
      if (azureTokenTimer) {
        clearInterval(azureTokenTimer);
      }
      checkAzureAbort = new AbortController();
      setTimeout(() => {
        if (checkAzureAbort && !checkAzureAbort.signal.aborted) {
          checkAzureAbort.abort();
          checkAzureAbort = void 0;
        }
      }, 15000);
      Promise.all([getAzureToken(checkAzureAbort.signal), getVoiceList(checkAzureAbort.signal)]).then(() => {
        azureTokenTimer = setInterval(() => {
          getAzureToken();
        }, 540000);
        toggleVoiceCheck(false);
      }).catch(e => {}).finally(() => {
        checkVoiceLoad.classList.remove("voiceChecking");
        checking = false;
      })
    }
  }

  const getAzureToken = (signal) => {

    return new Promise((res, rej) => {

      fetch("https://" + azureRegion + ".api.cognitive.microsoft.com/sts/v1.0/issueToken", {
        signal,
        method: "POST",
          headers: {
            'Ocp-Apim-Subscription-Key': azureKey
          }
      }).then(response => {

        response.text().then(text => {
          try {
            let json = JSON.parse(text);
            notyf.error("由于订阅密钥无效或 API 端点错误，访问被拒绝！");
            rej();
          } catch (e) {
            azureToken = text;
            res();
          }
        });

      })
			.catch(e => {
        rej();
      })
    })
  };

  const getVoiceList = (signal) => {

    return new Promise((res, rej) => {

      if (azureVoiceData) {
        initVoiceSetting(azureVoiceData);
        res();
      }
			else {

        let localAzureVoiceData = localStorage.getItem(azureRegion + "voiceData");

        if (localAzureVoiceData) {
          azureVoiceData = JSON.parse(localAzureVoiceData);
          initVoiceSetting(azureVoiceData);
          res();
        }
				else {

          fetch("https://" + azureRegion + ".tts.speech.microsoft.com/cognitiveservices/voices/list", {
            signal,
            headers: {
              'Ocp-Apim-Subscription-Key': azureKey
            }
          }).then(response => {
            response.json().then(json => {
              azureVoiceData = json;
              localStorage.setItem(azureRegion + "voiceData", JSON.stringify(json));
              initVoiceSetting(json);
              res();
            }).catch(e => {
              notyf.error("由于订阅密钥无效或 API 端点错误，访问被拒绝！");
              rej();
            })
          }).catch(e => {
            rej();
          })
        }
      }
    })
  };

  let azureRegionEle = document.getElementById("preSetAzureRegion");

  if (!azureRegionEle.options.length) {

    const azureRegions = ['southafricanorth', 'eastasia', 'southeastasia', 'australiaeast', 'centralindia', 'japaneast', 'japanwest', 'koreacentral', 'canadacentral', 'northeurope', 'westeurope', 'francecentral', 'germanywestcentral', 'norwayeast', 'switzerlandnorth', 'switzerlandwest', 'uksouth', 'uaenorth', 'brazilsouth', 'centralus', 'eastus', 'eastus2', 'northcentralus', 'southcentralus', 'westcentralus', 'westus', 'westus2', 'westus3'];
    azureRegions.forEach((region, i) => {
      let option = document.createElement("option");
      option.value = region;
      option.text = region;
      azureRegionEle.options.add(option);
    });

  }

  let localAzureRegion = localStorage.getItem("azureRegion");

  if (localAzureRegion) {
    azureRegion = localAzureRegion;
    azureRegionEle.value = localAzureRegion;
  }

  azureRegionEle.onchange = () => {
    azureRegion = azureRegionEle.value;
    localStorage.setItem("azureRegion", azureRegion);
    toggleVoiceCheck(true);
  }

  azureRegionEle.dispatchEvent(new Event("change"));

  let azureKeyEle = document.getElementById("azureKeyInput");
  let localAzureKey = localStorage.getItem("azureKey");

  if (localAzureKey) {
    azureKey = localAzureKey;
    azureKeyEle.value = localAzureKey;
  }

  azureKeyEle.onchange = () => {
    azureKey = azureKeyEle.value;
    localStorage.setItem("azureKey", azureKey);
    toggleVoiceCheck(true);
  }

  azureKeyEle.dispatchEvent(new Event("change"));

  if (azureKey) {
    checkVoiceLoad.dispatchEvent(new Event("click"))
  }

}
const loadEdgeVoice = () => {

  let checking = false;

  checkVoiceLoad.onclick = () => {

    if (checking) return;
    checking = true;
    checkVoiceLoad.classList.add("voiceChecking");
    if (edgeVoiceData) {
      initVoiceSetting(edgeVoiceData);
      toggleVoiceCheck(false);
      checkVoiceLoad.classList.remove("voiceChecking");
    } else {
      checkEdgeAbort = new AbortController();
      setTimeout(() => {
        if (checkEdgeAbort && !checkEdgeAbort.signal.aborted) {
          checkEdgeAbort.abort();
          checkEdgeAbort = void 0;
        }
      }, 10000);

      fetch("https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4", {
        signal: checkEdgeAbort.signal
      }).then(response => {
        response.json().then(json => {
          edgeVoiceData = json;
          toggleVoiceCheck(false);
          initVoiceSetting(json);
        });
      }).catch(err => {}).finally(() => {
        checkVoiceLoad.classList.remove("voiceChecking");
        checking = false;
      })
    }
  };

  checkVoiceLoad.dispatchEvent(new Event("click"));

};

const loadLocalVoice = () => {

  if (systemVoiceData) {

    initVoiceSetting(systemVoiceData);

  }
	else {

    let initedVoice = false;

    const getLocalVoice = () => {

      let voices = speechSynthesis.getVoices();

      if (voices.length) {

        if (!initedVoice) {

          initedVoice = true;
          systemVoiceData = voices;
          initVoiceSetting(voices);
        }

        return true;

      }
			else {

        return false;

      }
    }
    let syncExist = getLocalVoice();

    if (!syncExist) {

      if ("onvoiceschanged" in speechSynthesis) {

        speechSynthesis.onvoiceschanged = () => {
          getLocalVoice();
        }

      }
			else if (speechSynthesis.addEventListener) {

        speechSynthesis.addEventListener("voiceschanged", () => {
          getLocalVoice();
        })

      }

      let timeout = 0;

      let timer = setInterval(() => {

        if (getLocalVoice() || timeout > 1000) {
          if (timeout > 1000) {
            existVoice = 0;
          }
          clearInterval(timer);
          timer = null;
        }
        timeout += 300;
      }, 300)

    }

  }

};

const initVoiceSetting = (voices) => {

  let isOnline = existVoice >= 2;
  let voicesEle = document.getElementById("preSetSpeech");

  // support Chinese and English
  voices = isOnline ? voices.filter(item => item.Locale.match(/^(zh-|en-)/)) : voices.filter(item => item.lang.match(/^(zh-|en-)/));

  if (isOnline) {

    voices.map(item => {
      item.name = item.FriendlyName || ''; // (`${item.DisplayName} Online (${item.VoiceType}) - ${item.LocaleName}`);
      item.lang = item.Locale;
    })

  }

  voices.sort((a, b) => {
    if (a.lang.slice(0, 2) === b.lang.slice(0, 2)) return 0;
    return (a.lang < b.lang) ? 1 : -1; // 中文在前"z"
  });

  voices.map(item => {

    if (item.name.match(/^(Google |Microsoft )/)) {
      item.displayName = item.name.replace(/^.*? /, "");
    } else {
      item.displayName = item.name;
    }

  });

  voicesEle.innerHTML = "";

  voices.forEach((voice, i) => {

    let option = document.createElement("option");
    option.value = i;
    option.text = voice.displayName;
    voicesEle.options.add(option);

  });

  voicesEle.onchange = () => {

    voiceRole[voiceType] = voices[voicesEle.value];
    localStorage.setItem("voice" + voiceType, voiceRole[voiceType].name);

    if (voiceRole[voiceType].StyleList || voiceRole[voiceType].RolePlayList) {

      document.getElementById("azureExtra").style.display = "block";
      let voiceStyles = voiceRole[voiceType].StyleList;
      let voiceRoles = voiceRole[voiceType].RolePlayList;

      if (voiceRoles) {

        preSetVoiceRole.innerHTML = "";
        voiceRoles.forEach((role, i) => {
          let option = document.createElement("option");
          option.value = role;
          option.text = role;
          preSetVoiceRole.options.add(option);
        });

        let localRole = localStorage.getItem("azureRole" + voiceType);

        if (localRole && voiceRoles.indexOf(localRole) !== -1) {
          preSetVoiceRole.value = localRole;
          azureRole[voiceType] = localRole;
        }
				else {
          preSetVoiceRole.selectedIndex = 0;
          azureRole[voiceType] = voiceRole[0];
        }
        preSetVoiceRole.onchange = () => {
          azureRole[voiceType] = preSetVoiceRole.value;
          localStorage.setItem("azureRole" + voiceType, preSetVoiceRole.value);
        }
        preSetVoiceRole.dispatchEvent(new Event("change"));
      }
			else {
        azureRole[voiceType] = void 0;
        localStorage.removeItem("azureRole" + voiceType);
      }

      preSetVoiceRole.style.display = voiceRoles ? "block" : "none";
      preSetVoiceRole.previousElementSibling.style.display = voiceRoles ? "block" : "none";

      if (voiceStyles) {
        preSetVoiceStyle.innerHTML = "";
        voiceStyles.forEach((style, i) => {
          let option = document.createElement("option");
          option.value = style;
          option.text = style;
          preSetVoiceStyle.options.add(option);
        });
        let localStyle = localStorage.getItem("azureStyle" + voiceType);
        if (localStyle && voiceStyles.indexOf(localStyle) !== -1) {
          preSetVoiceStyle.value = localStyle;
          azureStyle[voiceType] = localStyle;
        } else {
          preSetVoiceStyle.selectedIndex = 0;
          azureStyle[voiceType] = voiceStyles[0];
        }
        preSetVoiceStyle.onchange = () => {
          azureStyle[voiceType] = preSetVoiceStyle.value;
          localStorage.setItem("azureStyle" + voiceType, preSetVoiceStyle.value)
        }
        preSetVoiceStyle.dispatchEvent(new Event("change"));
      }
			else {
        azureStyle[voiceType] = void 0;
        localStorage.removeItem("azureStyle" + voiceType);
      }
      preSetVoiceStyle.style.display = voiceStyles ? "block" : "none";
      preSetVoiceStyle.previousElementSibling.style.display = voiceStyles ? "block" : "none";
    }
		else {
			/*
      document.etElementById("azureExtra").style.display = "none";
      azureRole[voiceType] = void 0;
      localStorage.removeItem("azureRole" + voiceType);
      azureStyle[voiceType] = void 0;
      localStorage.removeItem("azureStyle" + voiceType);
			*/
    }

  };

  const loadAnother = (type) => {

    type = type ^ 1;

    let localVoice = localStorage.getItem("voice" + type);

    if (localVoice) {

      let localIndex = voices.findIndex(item => {
        return item.name === localVoice
      });

      if (localIndex === -1) localIndex = 0;

      voiceRole[type] = voices[localIndex];

    }
		else {
      voiceRole[type] = voices[0];
    }

    if (existVoice === 3) {

      let localStyle = localStorage.getItem("azureStyle" + type);
      azureStyle[type] = localStyle ? localStyle : void 0;

      let localRole = localStorage.getItem("azureRole" + type);
      azureRole[type] = localRole ? localRole : void 0;

    }

  }
  const voiceChange = () => {

    let localVoice = localStorage.getItem("voice" + voiceType);

    if (localVoice) {

      let localIndex = voices.findIndex(item => {
        return item.name === localVoice
      });

      if (localIndex === -1) localIndex = 0;

      voiceRole[voiceType] = voices[localIndex];
      voicesEle.value = localIndex;

    }

    voicesEle.dispatchEvent(new Event("change"));

  }

  voiceChange();
  loadAnother(voiceType);

  let volumeEle = document.getElementById("voiceVolume");
  let localVolume = localStorage.getItem("voiceVolume0");

  voiceVolume[0] = parseFloat(localVolume ? localVolume : volumeEle.value);

  const voiceVolumeChange = () => {

    let localVolume = localStorage.getItem("voiceVolume" + voiceType);

    if (localVolume) {

      voiceVolume[voiceType] = parseFloat(localVolume);
      volumeEle.value = localVolume;
      volumeEle.style.backgroundSize = (volumeEle.value - volumeEle.min) * 100 / (volumeEle.max - volumeEle.min) + "% 100%";

    }
		else {
      volumeEle.dispatchEvent(new Event("input"));
    }
  }
  volumeEle.oninput = () => {
    volumeEle.style.backgroundSize = (volumeEle.value - volumeEle.min) * 100 / (volumeEle.max - volumeEle.min) + "% 100%";
    voiceVolume[voiceType] = parseFloat(volumeEle.value);
    localStorage.setItem("voiceVolume" + voiceType, volumeEle.value);
  }
  voiceVolumeChange();
  let rateEle = document.getElementById("voiceRate");
  let localRate = localStorage.getItem("voiceRate0");
  voiceRate[0] = parseFloat(localRate ? localRate : rateEle.value);
  const voiceRateChange = () => {
    let localRate = localStorage.getItem("voiceRate" + voiceType);
    if (localRate) {
      voiceRate[voiceType] = parseFloat(localRate);
      rateEle.value = localRate;
      rateEle.style.backgroundSize = (rateEle.value - rateEle.min) * 100 / (rateEle.max - rateEle.min) + "% 100%";
    } else {
      rateEle.dispatchEvent(new Event("input"));
    }
  }
  rateEle.oninput = () => {
    rateEle.style.backgroundSize = (rateEle.value - rateEle.min) * 100 / (rateEle.max - rateEle.min) + "% 100%";
    voiceRate[voiceType] = parseFloat(rateEle.value);
    localStorage.setItem("voiceRate" + voiceType, rateEle.value);
  }
  voiceRateChange();
  let pitchEle = document.getElementById("voicePitch");
  let localPitch = localStorage.getItem("voicePitch0");
  voicePitch[0] = parseFloat(localPitch ? localPitch : pitchEle.value);
  const voicePitchChange = () => {
    let localPitch = localStorage.getItem("voicePitch" + voiceType);
    if (localPitch) {
      voicePitch[voiceType] = parseFloat(localPitch);
      pitchEle.value = localPitch;
      pitchEle.style.backgroundSize = (pitchEle.value - pitchEle.min) * 100 / (pitchEle.max - pitchEle.min) + "% 100%";
    } else {
      pitchEle.dispatchEvent(new Event("input"));
    }
  }
  pitchEle.oninput = () => {
    pitchEle.style.backgroundSize = (pitchEle.value - pitchEle.min) * 100 / (pitchEle.max - pitchEle.min) + "% 100%";
    voicePitch[voiceType] = parseFloat(pitchEle.value);
    localStorage.setItem("voicePitch" + voiceType, pitchEle.value);
  }
  voicePitchChange();
  document.getElementById("voiceTypes").onclick = (ev) => {
    lettype = ev.target.dataset.type;
    if (type !== void 0) {
      type = parseInt(type);
      if (type != voiceType) {
        voiceType = type;
        ev.target.classList.add("selVoiceType");
        ev.target.parentElement.children[type ^ 1].classList.remove("selVoiceType");
        voiceChange();
        voiceVolumeChange();
        voiceRateChange();
        voicePitchChange();
      }
    };
  };
  const contVoiceEle = document.getElementById("enableContVoice");
  let localCont = localStorage.getItem("enableContVoice");
  if (localCont) {
    enableContVoice = localCont === "true";
    contVoiceEle.checked = enableContVoice;
  }
  contVoiceEle.onchange = () => {
    enableContVoice = contVoiceEle.checked;
    localStorage.setItem("enableContVoice", enableContVoice);
  }
  contVoiceEle.dispatchEvent(new Event("change"));
  const autoVoiceEle = document.getElementById("enableAutoVoice");
  let localAuto = localStorage.getItem("enableAutoVoice");
  if (localAuto) {
    enableAutoVoice = localAuto === "true";
    autoVoiceEle.checked = enableAutoVoice;
  }
  autoVoiceEle.onchange = () => {
    enableAutoVoice = autoVoiceEle.checked;
    localStorage.setItem("enableAutoVoice", enableAutoVoice);
  }
  autoVoiceEle.dispatchEvent(new Event("change"));
};
speechServiceEle.dispatchEvent(new Event("change"));

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
  input.value = data[idx].content;
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
    if (id === "voiceMd") {
      let className = parent.className;
      if (className == "readyVoice") {
        if (chatlog.children[idx].dataset.loading !== "true") {
          idx = systemRole ? idx + 1 : idx;
          speechEvent(idx);
        }
      } else if (className == "pauseVoice") {
        if (existVoice >= 2) {
          if (voiceIns) voiceIns.pause();
        } else {
          speechSynthesis.pause();
        }
        parent.className = "resumeVoice";
      } else {
        if (existVoice >= 2) {
          if (voiceIns) voiceIns.play();
        } else {
          speechSynthesis.resume();
        }
        parent.className = "pauseVoice";
      }
    } else if (id === "refreshMd") {
      if (!loading && chatlog.children[idx].dataset.loading !== "true") {
        let className = parent.className;
        if (className == "refreshReq") {
          chatlog.children[idx].children[0].innerHTML = "<br />";
          chatlog.children[idx].dataset.loading = true;
          idx = systemRole ? idx + 1 : idx;
          data[idx].content = "";
          if (idx === currentVoiceIdx) {
            endSpeak()
          };
          loadAction(true);
          refreshIdx = idx;
          streamGen();
        } else {
          chatlog.children[idx].dataset.loading = true;
          idx = sytemRole ? idx + 1 : idx;
          progressData = data[idx].content;
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
          if (currentVoiceIdx) {
            if (currentVoiceIdx === idx) {
              endSpeak()
            } else if (currentVoiceIdx > idx) {
              currentVoiceIdx -= 1
            }
          }
          chatlog.removeChild(chatlog.children[idx]);
          idx = systemRole ? idx + 1 : idx;
          data.splice(idx, 1);
          updateChats();
        }
      }
    } else if (id === "downAudio") {
      idxEle.classList.add("moreOptionHidden");
      if (chatlog.children[idx].dataset.loading !== "true") {
        idx = systemRole ? idx + 1 : idx;
        downloadAudio(idx);
      }
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
  let optionWidth = existVoice >= 2 ? "96px" : "63px";
  mdOption.innerHTML += `<div class="moreOption" onmouseenter="moreOption(this)">
    <svg class="optionTrigger" width="16" height="16" role="img"><title>options</title><use xlink:href="#optionIcon" /></svg>
    <div class="optionItems" style="width:${optionWidth};left:-${optionWidth}">` + (existVoice >= 2 ? `<div data-id="downAudio" class="optionItem" title="下载语音">
        <svg width="20" height="20"><use xlink:href="#downAudioIcon" /></svg>
    </div>` : "") + `<div data-id="delMd" class="optionItem" title="delete">
        <svg width="20" height="20"><use xlink:href="#delIcon" /></svg>
    </div>
    <div data-id="copyMd" class="optionItem" title="copy">
        <svg width="20" height="20"><use xlink:href="#copyIcon" /></svg>
    </div></div></div>`;
  if (existVoice) {
    mdOption.innerHTML += `<div id="pronMd" class="readyVoice">
        <svg width="16" height="16" data-id="voiceMd" role="img"><title>play</title><use xlink:href="#readyVoiceIcon" /></svg>
        <svg width="16" height="16" data-id="voiceMd" role="img"><title>pause</title><use xlink:href="#pauseVoiceIcon" /></svg>
        <svg width="16" height="16" data-id="voiceMd" role="img"><title>resume</title><use xlink:href="#resumeVoiceIcon" /></svg>
        </div>`
  }
  mdOption.onclick = mdOptionEvent;
}
let chatsData = [];
let activeChatIdx = 0;
let data;
const chatEleAdd = (idx) => {
  let chat = chatsData[idx];
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
  chatsData.push(chat);
  updateChats();
};
const delChat = (idx) => {
  if (confirmAction("delete session?")) {
   endAll();
    if (idx === activeChatIdx) {
      if (idx - 1 >= 0) {
        activeChatIdx = idx - 1;
      } else if (idx === chatsData.length - 1) {
        activeChatIdx = chatsData.length - 2;
      }
    }
    chatsData.splice(idx, 1);
    chatListEle.children[idx].remove();
    if (activeChatIdx === -1) {
      addNewChat();
      activeChatIdx = 0;
      chatEleAdd(activeChatIdx);
    }
    updateChats();
    activeChat();
  }
};
const endEditEvent = (ev) => {
  let activeEle = document.getElementById("activeChatEdit")
  if (!activeEle.contains(ev.target)) {
    let ele = chatListEle.children[activeChatIdx];
    chatsData[activeChatIdx].name = activeEle.value;
    ele.children[1].textContent = activeEle.value;
    ele.lastElementChild.remove();
    updateChats();
    document.body.removeEventListener("mousedown", endEditEvent, true);
  }
};
const toEditChatName = (idx) => {
  let inputEle = document.createElement("input");
  inputEle.id = "activeChatEdit";
  inputEle.value = chatsData[idx].name;
  chatListEle.children[idx].appendChild(inputEle);
  inputEle.focus();
  document.body.addEventListener("mousedown", endEditEvent, true);
};
const chatEleEvent = function(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  let idx = Array.prototype.indexOf.call(chatListEle.children, this);
  if (ev.target.className === "chatLi") {
    if (activeChatIdx !== idx) {
      endAll();
      activeChatIdx = idx;
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
  localStorage.setItem("chats", JSON.stringify(chatsData));
};
const createConvEle = (className) => {
  let div = document.createElement("div");
  div.className = className;
  chatlog.appendChild(div);
  formatMdEle(div);
  return div;
}
const activeChat = () => {

  data = chatsData[activeChatIdx]["data"] || [];

  //console.log( data );


  Array.from(document.getElementsByClassName("activeChatLi")).forEach(item => {
    item.classList.remove("activeChatLi");
  });

  chatListEle.children[activeChatIdx].classList.add("activeChatLi");

  if (data[0] && data[0].role === "system") {

    //systemRole = data[0].content;
    //systemEle.value = systemRole;

    systemRole = tutor || '';

    //console.log( tutors );

    if ( findObjectByKey( tutors, 'act', tutor ).length > 0 ){

      let obj = findObjectByKey( tutors, 'act', tutor );

      systemEle.value = obj[0].prompt;
      tutor_label = obj[0].act_label;

    }
    else {

      //systemEle.value = 'Act as a teaching ', tutor;
      systemEle.value = '';

    }

    $('#chat-title').text( tutor_label );

    localStorage.setItem("system", tutor ); // systemRole

    //console.log( 'case1: ', tutor, systemRole, 'Act as a teaching ', tutor );
    //console.log( 'case1: ', tutor, systemRole, systemEle.value );

  }
	else {

    systemRole = tutor || '';

    if ( findObjectByKey( tutors, 'act', tutor ).length > 0 ){

      let obj = findObjectByKey( tutors, 'act', tutor );

      systemEle.value = obj[0].prompt;
      tutor_label = obj[0].act_label;

    }
    else {

      systemEle.value = '';

    }

    //systemRole = "";
    //systemEle.value = "";

    //localStorage.setItem("system", systemRole);

    //console.log( 'case2: ', tutor, systemRole, systemEle.value );

  }

  chatlog.innerHTML = "";

  if (systemRole ? data.length - 1 : data.length) {

    let firstIdx = systemRole ? 1 : 0;

    for (let i = firstIdx; i < data.length; i++) {

      let my_html = md.render( data[i].content ) || '<br/>';

      //console.log( my_html );

      let my_marked_html = markupEntities(my_html);
      //my_marked_html = markupComplexWords(my_html);

      createConvEle(data[i].role === "user" ? "request" : "response").children[0].innerHTML = my_marked_html;
      //createConvEle(data[i].role === "user" ? "request" : "response").children[0].innerHTML = md.render(data[i].content) || "<br />";

    }

  }

  localStorage.setItem("activeChatIdx", activeChatIdx);

};

newChatEle.onclick = () => {
  endAll();
  addNewChat();
  activeChatIdx = chatsData.length - 1;
  chatEleAdd(activeChatIdx);
  activeChat();
};

const initChats = () => {

  let localChats = localStorage.getItem("chats");

  let localChatIdx = localStorage.getItem("activeChatIdx")

  activeChatIdx = (localChatIdx && parseInt(localChatIdx)) || 0;

  if (localChats) {

    chatsData = JSON.parse(localChats);

    //console.log( chatsData );

    for (let i = 0; i < chatsData.length; i++) {
      chatEleAdd(i);
    }

  }
  else {

    addNewChat();
    chatEleAdd(activeChatIdx);

  }

};

initChats();

activeChat();

document.getElementById("exportChat").onclick = () => {
  if (loading) {
    stopLoading();
  }
  let blob = new Blob([JSON.stringify(chatsData, null, 2)], {
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
          chatsData.push(json.shift());
          chatEleAdd(chatsData.length - 1);
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
    chatsData.length = 0;
    chatListEle.innerHTML = "";
    endAll();
    addNewChat();
    activeChatIdx = 0;
    chatEleAdd(activeChatIdx);
    updateChats();
    activeChat();
  }
};
const endAll = () => {
  endSpeak();
  if (loading) stopLoading();
};
const initSetting = () => {
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
  let localKey = localStorage.getItem("APIKey");
  if (localKey) {
    customAPIKey = localKey;
    keyEle.value = localKey;
  }
  keyEle.onchange = () => {
    customAPIKey = keyEle.value;
    localStorage.setItem("APIKey", customAPIKey);
  }
  keyEle.dispatchEvent(new Event("change"));
  if (systemRole === void 0) {
    let localSystem = localStorage.getItem("system");
    if (localSystem) {
      systemRole = localSystem;
      systemEle.value = localSystem;
      data.unshift({
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
      if (data[0] && data[0].role === "system") {
        data[0].content = systemRole;
      } else {
        data.unshift({
          role: "system",
          content: systemRole
        });
      }
    } else if (data[0] && data[0].role === "system") {
      data.shift();
    }
    updateChats();
  }

  const preEle = document.getElementById("preSetSystem");

  preEle.onchange = () => {

    let val = preEle.value;

    if (val && presetRoleData[val]) {

      systemEle.value = presetRoleData[val];

      if ( findObjectByKey( tutors, 'act', val ).length > 0 ){

        const obj = findObjectByKey( tutors, 'act', tutor );
        tutor_label = obj[0].act_label;

      }

    }
    else {

      systemEle.value = "";
      tutor_label = '';

    }
    systemEle.dispatchEvent(new Event("change"));
    systemEle.focus();

    tutor_label = $('#preSetSystem option:selected').text() || '';

    $('#chat-title').text( tutor_label );

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
const uuidv4 = () => {
  let uuid = ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
  return existVoice === 3 ? uuid.toUpperCase() : uuid;
}
const getTime = () => {
  return existVoice === 3 ? new Date().toISOString() : new Date().toString();
}
const getWSPre = (date, requestId) => {
  let osPlatform = (typeof window !== "undefined") ? "Browser" : "Node";
  osPlatform += "/" + navigator.platform;
  let osName = navigator.userAgent;
  let osVersion = navigator.appVersion;
  return `Path: speech.config\r\nX-RequestId: ${requestId}\r\nX-Timestamp: ${date}\r\nContent-Type: application/json\r\n\r\n{"context":{"system":{"name":"SpeechSDK","version":"1.26.0","build":"JavaScript","lang":"JavaScript","os":{"platform":"${osPlatform}","name":"${osName}","version":"${osVersion}"}}}}`
}
const getWSAudio = (date, requestId) => {
  return existVoice === 3 ? `Path: synthesis.context\r\nX-RequestId: ${requestId}\r\nX-Timestamp: ${date}\r\nContent-Type: application/json\r\n\r\n{"synthesis":{"audio":{"metadataOptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":false},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}` : `X-Timestamp:${date}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`
}
const getWSText = (date, requestId, lang, voice, volume, rate, pitch, style, role, msg) => {
  let fmtVolume = volume === 1 ? "+0%" : volume * 100 - 100 + "%";
  let fmtRate = (rate >= 1 ? "+" : "") + (rate * 100 - 100) + "%";
  let fmtPitch = (pitch >= 1 ? "+" : "") + (pitch - 1) + "Hz";
  if (existVoice === 3) {
    let fmtStyle = style ? ` style="${style}"` : "";
    let fmtRole = role ? ` role="${role}"` : "";
    let fmtExpress = fmtStyle + fmtRole;
    return `Path: ssml\r\nX-RequestId: ${requestId}\r\nX-Timestamp: ${date}\r\nContent-Type: application/ssml+xml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='${lang}'><voice name='${voice}'><mstts:express-as${fmtExpress}><prosody pitch='${fmtPitch}' rate='${fmtRate}' volume='${fmtVolume}'>${msg}</prosody></mstts:express-as></voice></speak>`;
  } else {
    return `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${date}Z\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='${lang}'><voice name='${voice}'><prosody pitch='${fmtPitch}' rate='${fmtRate}' volume='${fmtVolume}'>${msg}</prosody></voice></speak>`;
  }
}
const getAzureWSURL = () => {
  return `wss://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/websocket/v1?Authorization=bearer%20${azureToken}`
}
const edgeTTSURL = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4";
let currentVoiceIdx;
const resetSpeakIcon = () => {
  if (currentVoiceIdx !== void 0) {
    chatlog.children[systemRole ? currentVoiceIdx - 1 : currentVoiceIdx].children[1].lastChild.className = "readyVoice";
  }
}
const endSpeak = () => {
  resetSpeakIcon();
  if (existVoice >= 2) {
    if (voiceIns) {
      voiceIns.pause();
      voiceIns.currentTime = 0;
      URL.revokeObjectURL(voiceIns.src);
      voiceIns.removeAttribute("src");
      voiceIns.onended = voiceIns.onerror = null;
    }
    sourceBuffer = void 0;
    speechPushing = false;
    if (voiceSocket && voiceSocket["pending"]) {
      voiceSocket.close()
    }
    if (autoVoiceSocket && autoVoiceSocket["pending"]) {
      autoVoiceSocket.close()
    }
    speechQuene.length = 0;
    autoMediaSource = void 0;
    voiceContentQuene = [];
    voiceEndFlagQuene = [];
    voiceBlobURLQuene = [];
    autoOnlineVoiceFlag = false;
  } else {
    speechSynthesis.cancel();
  }
  currentVoiceIdx = void 0;
}
const speakEvent = (ins, force = true, end = false) => {
  return new Promise((res, rej) => {
    ins.onerror = () => {
      if (end) {
        endSpeak();
      } else if (force) {
        resetSpeakIcon();
      }
      res();
    }
    if (existVoice >= 2) {
      ins.onended = ins.onerror;
      ins.play();
    } else {
      ins.onend = ins.onerror;
      speechSynthesis.speak(voiceIns);
    }
  })
};
let voiceData = [];
let voiceSocket;
let speechPushing = false;
let speechQuene = [];
let sourceBuffer;
speechQuene.push = function(buffer) {
  if (!speechPushing && !sourceBuffer.updating) {
    speehPushing = true;
    sourceBuffer.appendBuffer(buffer);
  } else {
    Array.prototype.push.call(this, buffer)
  }
}
const initSocket = () => {
  return new Promise((res, rej) => {
    if (!voiceSocket || voiceSocket.readyState > 1) {
      voiceSocket = new WebSocket(existVoice === 3 ? getAzureWSURL() : edgeTTSURL);
      voiceSocket.binaryType = "arraybuffer";
      voiceSocket.onopen = () => {
        res();
      };
      voiceSocket.onerror = () => {
        rej();
      }
    } else {
      return res();
    }
  })
}
const initStreamVoice = (mediaSource) => {
  return new Promise((r, j) => {
    Promise.all([initSocket(), new Promise(res => {
      mediaSource.onsourceopen = () => {
        res();
      };
    })]).then(() => {
      r();
    })
  })
}
let downQuene = {};
let downSocket;
const downBlob = (blob, name) => {
  let a = document.createElement("a");
  a.download = name;
  a.href = URL.createObjectURL(blob);
  a.click();
}
const initDownSocket = () => {
  return new Promise((res, rej) => {
    if (!downSocket || downSocket.readyState > 1) {
      downSocket = new WebSocket(existVoice === 3 ? getAzureWSURL() : edgeTTSURL);
      downSocket.binaryType = "arraybuffer";
      downSocket.onopen = () => {
        res();
      };
      downSocket.onmessage = (e) => {
        if (e.data instanceof ArrayBuffer) {
          let text = new TextDecoder().decode(e.data.slice(0, 130));
          let reqIdx = text.indexOf(":");
          let uuid = text.slice(reqIdx + 1, reqIdx + 33);
          downQuene[uuid]["blob"].push(e.data.slice(130));
        } else if (e.data.indexOf("Path:turn.end") !== -1) {
          let reqIdx = e.data.indexOf(":");
          let uuid = e.data.slice(reqIdx + 1, reqIdx + 33);
          let blob = new Blob(downQuene[uuid]["blob"], {
            type: voiceMIME
          });
          let key = downQuene[uuid]["key"];
          let name = downQuene[uuid]["name"];
          voiceData[key] = blob;
          downBlob(blob, name.slice(0, 16) + ".mp3");
        }
      }
      downSocket.onerror = () => {
        rej();
      }
    } else {
      return res();
    }
  })
}
const downloadAudio = async(idx) => {
  if (existVoice < 2) {
    return;
  }
  let type = data[idx].role === "user" ? 0 : 1;
  let voice = existVoice === 3 ? voiceRole[type].ShortName : voiceRole[type].Name;
  let volume = voiceVolume[type];
  let rate = voiceRate[type];
  let pitch = voicePitch[type];
  let style = azureStyle[type];
  let role = azureRole[type];
  let content = data[idx].content;
  let key = content + voice + volume + rate + pitch + (style ? style : "") + (role ? role : "");
  let blob = voiceData[key];
  if (blob) {
    downBlob(blob, content.slice(0, 16) + ".mp3");
  } else {
    await initDownSocket();
    let currDate = getTime();
    let lang = voiceRole[type].lang;
    let uuid = uuidv4();
    if (existVoice === 3) {
      downSocket.send(getWSPre(currDate, uuid));
    }
    downSocket.send(getWSAudio(currDate, uuid));
    downSocket.send(getWSText(currDate, uuid, lang, voice, volume, rate, pitch, style, role, content));
    downSocket["pending"] = true;
    downQuene[uuid] = {};
    downQuene[uuid]["name"] = content;
    downQuene[uuid]["key"] = key;
    downQuene[uuid]["blob"] = [];
  }
}
const NoMSEPending = (key) => {
  return new Promise((res, rej) => {
    let bufArray = [];
    voiceSocket.onmessage = (e) => {
      if (e.data instanceof ArrayBuffer) {
        bufArray.push(e.data.slice(130));
      } else if (e.data.indexOf("Path:turn.end") !== -1) {
        voiceSocket["pending"] = false;
       voiceData[key] = new Blob(bufArray, {
          type: voiceMIME
        });
        res(voiceData[key]);
      }
    }
  })
}
const speechEvent = async(idx) => {
  if (!data[idx]) return;
  endSpeak();
  currentVoiceIdx = idx;
  if (!data[idx].content && enableContVoice) {
    if (currentVoiceIdx !== data.length - 1) {
      return speechEvent(currentVoiceIdx + 1)
    } else {
      return endSpeak()
    }
  };
  let type = data[idx].role === "user" ? 0 : 1;
  chatlog.children[systemRole ? idx - 1 : idx].children[1].lastChild.className = "pauseVoice";
  let content = data[idx].content;
  let volume = voiceVolume[type];
  let rate = voiceRate[type];
  let pitch = voicePitch[type];
  let style = azureStyle[type];
  let role = azureRole[type];
  if (existVoice >= 2) {
    if (!voiceIns) {
      voiceIns = new Audio();
    }
    let voice = existVoice === 3 ? voiceRole[type].ShortName : voiceRole[type].Name;
    let key = content + voice + volume + rate + pitch + (style ? style : "") + (role ? role : "");
    let currData = voiceData[key];
    if (currData) {
      voiceIns.src = URL.createObjectURL(currData);
    } else {
      let mediaSource;
      if (supportMSE) {
        mediaSource = new MediaSource;
        voiceIns.src = URL.createObjectURL(mediaSource);
        await initStreamVoice(mediaSource);
        if (!sourceBuffer) {
          sourceBuffer = mediaSource.addSourceBuffer(voiceMIME);
        }
        sourceBuffer.onupdateend = function() {
          speechPushing = false;
          if (speechQuene.length) {
            let buf = speechQuene.shift();
            if (buf["end"]) {
              mediaSource.endOfStream();
            } else {
              speechPushing = true;
              sourceBuffer.appendBuffer(buf);
            }
          }
        };
        let bufArray = [];
        voiceSocket.onmessage = (e) => {
          if (e.data instanceof ArrayBuffer) {
            let buf = e.data.slice(130);
            bufArray.push(buf);
            speechQuene.push(buf);
          } else if (e.data.indexOf("Path:turn.end") !== -1) {
            voiceSocket["pending"] = false;
            voiceData[key] = new Blob(bufArray, {
              type: voiceMIME
            });
            if (!speechQuene.length && !speechPushing) {
              mediaSource.endOfStream();
            } else {
              let buf = new ArrayBuffer();
              buf["end"] = true;
              speechQuene.push(buf);
            }
          }
        }
      } else {
        await initSocket();
      }
      let currDate = getTime();
      let lang = voiceRole[type].lang;
      let uuid = uuidv4();
      if (existVoice === 3) {
        voiceSocket.send(getWSPre(currDate, uuid));
      }
      voiceSocket.send(getWSAudio(currDate, uuid));
      voiceSocket.send(getWSText(currDate, uuid, lang, voice, volume, rate, pitch, style, role, content));
      voiceSocket["pending"] = true;
      if (!supportMSE) {
        let blob = await NoMSEPending(key);
        voiceIns.src = URL.createObjectURL(blob);
      }
    }
  } else {
    if (!voiceIns) {
      voiceIns = new SpeechSynthesisUtterance();
    }
    voiceIns.voice = voiceRole[type];
    voiceIns.volume = volume;
    voiceIns.rate = rate;
    voiceIns.pitch = pitch;
    voiceIns.text = content;
  }
  await speakEvent(voiceIns);
  if (enableContVoice) {
    if (currentVoiceIdx !== data.length - 1) {
      return speechEvent(currentVoiceIdx + 1)
    } else {
      endSpeak()
    }
  }
};
let autoVoiceSocket;
let autoMediaSource;
let voiceContentQuene = [];
let voiceEndFlagQuene = [];
let voiceBlobURLQuene = [];
let autoOnlineVoiceFlag = false;
const autoAddQuene = () => {
  if (voiceContentQuene.length) {
    let content = voiceContentQuene.shift();
    let currDate = getTime();
    let uuid = uuidv4();
    let voice = voiceRole[1].Name;
    if (existVoice === 3) {
      autoVoiceSocket.send(getWSPre(currDate, uuid));
      voice = voiceRole[1].ShortName;
    }
    autoVoiceSocket.send(getWSAudio(currDate, uuid));
    autoVoiceSocket.send(getWSText(currDate, uuid, voiceRole[1].lang, voice, voiceVolume[1], voiceRate[1], voicePitch[1], azureStyle[1], azureRole[1], content));
    autoVoiceSocket["pending"] = true;
    autoOnlineVoiceFlag = true;
  }
}
const autoSpeechEvent = (content, ele, force = false, end = false) => {
  if (ele.children[1].lastChild.className === "readyVoice") {
    ele.children[1].lastChild.className = "pauseVoice";
  }
  if (existVoice >= 2) {
    voiceContentQuene.push(content);
    voiceEndFlagQuene.push(end);
    if (!voiceIns) {
      voiceIns = new Audio();
    }
    if (!autoVoiceSocket || autoVoiceSocket.readyState > 1) {
      autoVoiceSocket = new WebSocket(existVoice === 3 ? getAzureWSURL() : edgeTTSURL);
      autoVoiceSocket.binaryType = "arraybuffer";
      autoVoiceSocket.onopen = () => {
        autoAddQuene();
      };

      autoVoiceSocket.onerror = () => {
        autoOnlineVoiceFlag = false;
      };
    };
    let bufArray = [];
    autoVoiceSocket.onmessage = (e) => {
      if (e.data instanceof ArrayBuffer) {
        (supportMSE ? speechQuene : bufArray).push(e.data.slice(130));
      } else {
        if (e.data.indexOf("Path:turn.end") !== -1) {
          autoVoiceSocket["pending"] = false;
          autoOnlineVoiceFlag = false;
          if (!supportMSE) {
            let blob = new Blob(bufArray, {
              type: voiceMIME
            });
            bufArray = [];
            if (blob.size) {
              let blobURL = URL.createObjectURL(blob);
              if (!voiceIns.src) {
                voiceIns.src = blobURL;
                voiceIns.play();
              } else {
                voiceBlobURLQuene.push(blobURL);
              }
            }
            autoAddQuene();
          }
          if (voiceEndFlagQuene.shift()) {
            if (supportMSE) {
              if (!speechQuene.length && !speechPushing) {
                autoMediaSource.endOfStream();
              } else {
                let buf = new ArrayBuffer();
                buf["end"] = true;
                speechQuene.push(buf);
              }
            } else {
              if (!voiceBlobURLQuene.length && !voiceIns.src) {
                endSpeak();
              } else {
                voiceBlobURLQuene.push("end");
              }
            }
          };
          if (supportMSE) {
            autoAddQuene();
          }
        }
      }
    };
    if (!autoOnlineVoiceFlag && autoVoiceSocket.readyState) {
      autoAddQuene();
    }
    if (supportMSE) {
      if (!autoMediaSource) {
        autoMediaSource = new MediaSource();
        autoMediaSource.onsourceopen = () => {
          if (!sourceBuffer) {
            sourceBuffer = autoMediaSource.addSourceBuffer(voiceMIME);
            sourceBuffer.onupdateend = () => {
              speechPushing = false;
              if (speechQuene.length) {
                let buf = speechQuene.shift();
                if (buf["end"]) {
                  autoMediaSource.endOfStream();
                } else {
                  speechPushing = true;
                  sourceBuffer.appendBuffer(buf);
                }
              }
            };
          }
        }
      }
      if (!voiceIns.src) {
        voiceIns.src = URL.createObjectURL(autoMediaSource);
        voiceIns.play();
        voiceIns.onended = voiceIns.onerror = () => {
          endSpeak();
        }
      }
    } else {
      voiceIns.onended = voiceIns.onerror = () => {
        if (voiceBlobURLQuene.length) {
          let src = voiceBlobURLQuene.shift();
          if (src === "end") {
            endSpeak();
          } else {
            voiceIns.src = src;
            voiceIns.currentTime = 0;
            voiceIns.play();
          }
        } else {
          voiceIns.currentTime = 0;
          voiceIns.removeAttribute("src");
        }
      }
    }
  } else {
    voiceIns = new SpeechSynthesisUtterance(content);
    voiceIns.volume = voiceVolume[1];
    voiceIns.rate = voiceRate[1];
    voiceIns.pitch = voicePitch[1];
    voiceIns.voice = voiceRole[1];
    speakEvent(voiceIns, force, end);
  }
};
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

  let idx = isRefresh ? refreshIdx : data.length;

  if (existVoice && enableAutoVoice && !long) {

    if (isRefresh) {

      endSpeak();
      autoVoiceDataIdx = currentVoiceIdx = idx;

    }
    else if (currentVoiceIdx !== data.length) {

      endSpeak();
      autoVoiceDataIdx = currentVoiceIdx = idx;

    }
  }

  let dataSlice = [];

  //console.log( 'data: ', data );

  if (long) {

    idx = isRefresh ? refreshIdx : data.length - 1;

    dataSlice = [data[idx - 1], data[idx]];

    if (systemRole) {
      dataSlice.unshift(data[0]);
    }

  }
  else if (enableCont) {

    dataSlice = data.slice(0, idx);

  }
  else {

    dataSlice = [data[idx - 1]];

    if (systemRole) {

      dataSlice.unshift(data[0]);

    }

  }

  //console.log( 'dataSlice: ', dataSlice );

  try {
    apiHost = 'https://api.openai.com/'; // CONZEPT PATCH
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
      } else if (res.status === 400) {
        notyf.error("Error: The content of the request is too large, please delete part of the conversation or open the settings to close the continuous conversation");
      } else if (res.status === 404) {
        notyf.error("Error: Not authorized to use this model. Please open the settings to choose another GPT model.");
      } else if (res.status === 429 && !res.statusText) {
        notyf.error("Error: Please check your bill.");
      } else {
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
              } catch (e) {
                break;
              }
              if (payload.choices[0].finish_reason) {
                let lenStop = payload.choices[0].finish_reasn === "length";
                let longReplyFlag = enableLongReply && lenStop;
                if (!enableLongReply && lenStop) {
                  currentResEle.children[1].children[0].className = "halfRefReq"
                } else {
                  currentResEle.children[1].children[0].className = "refreshReq"
                };
                if (existVoice && enableAutoVoice && currentVoiceIdx === autoVoiceDataIdx) {
                  let voiceText = longReplyFlag ? "" : progressData.slice(autoVoiceIdx),
                    stop = !longReplyFlag;
                  autoSpeechEvent(voiceText, currentResEle, false, stop);
                }
                break;
              } else {
                let content = payload.choices[0].delta.content;

                if (content) {
                  if (!progressData && !content.trim()) continue;
                  if (existVoice && enableAutoVoice && currentVoiceIdx === autoVoiceDataIdx) {
                    let spliter = content.match(/\.|\?|!|。|？|！/);
                    if (spliter) {
                      let voiceText = progressData.slice(autoVoiceIdx) + content.slice(0, spliter.index + 1);
                      autoVoiceIdx += voiceText.length;
                      autoSpeechEvent(voiceText, currentResEle);
                    }
                  }
                  if (progressData) await delay();

                  progressData += content;

                  //console.log( progressData );

                  let my_html = md.render(progressData);
                  let my_marked_html = markupEntities(my_html);

                  currentResEle.children[0].innerHTML = my_marked_html;

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

        } else {

          //console.log('done');

          if (isRefresh) {
            data[refreshIdx].content = progressData;
            if (longReplyFlag) return streamGen(true);
          } else { // not a refresh

            if (long) { // user asked for a long response

              data[data.length - 1].content = progressData;

            } else { // default: user asked for a short response

              //console.log( progressData );

              data.push({
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

  } catch (e) {

    if (e.message.indexOf("aborted") === -1) {
      notyf.error("access failed!")
    }
    stopLoading();
  }
};
const loadAction = (bool) => {
  loading = bool;
  sendBtnEle.disabled = bool;
  sendBtnEle.className = bool ? " loading" : "loaded";
  stopEle.style.display = bool ? "flex" : "none";
  textInputEvent();
}

const stopLoading = (abort = true) => {

  stopEle.style.display = "none";

  if (abort) {

    controller.abort();

    if (controllerId) clearTimeout(controllerId);

    if (delayId) clearTimeout(delayId);

    if (refreshIdx !== void 0) {
      data[refreshIdx].content = progressData
    } else if (data[data.length - 1].role === "assistant") {
      data[data.length - 1].content = progressData
    } else {
      data.push({
        role: "assistant",
        content: progressData
      })
    }

    if (existVoice && enableAutoVoice && currentVoiceIdx === autoVoiceDataIdx && progressData.length) {
      let voiceText = progressData.slice(autoVoiceIdx);
      autoSpeechEvent(voiceText, currentResEle, false, true);
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
  requestEle.children[0].innerHTML = md.render(message);
  data.push({
    role: "user",
    content: message
  });
  if (chatsData[activeChatIdx].name === "新的会话") {
    if (message.length > 50) {
      message = message.slice(0, 47) + "...";
    }
    chatsData[activeChatIdx].name = message;
    chatListEle.children[activeChatIdx].children[1].textContent = message;
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

  if (recing) {
    toggleRecEv();
  }

  let message = textarea.value.trim();

  if (message.length !== 0) {
    if (loading === true) return;
    textarea.value = "";
    textarea.style.height = "47px";
    generateText(message);
  }
};

sendBtnEle.onclick = genFunc;
stopEle.onclick = stopLoading;
document.getElementById("clearConv").onclick = () => {
  if (!loading && confirmAction("Clear the session?")) {
    endSpeak();
    if (systemRole) {
      data.length = 1
    } else {
      data.length = 0
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

const supported_languages = [ 'en', 'fr'];

if ( supported_languages.includes( language ) ){

  fetch( `json/prompts-${ language }.json`, { signal: downRoleController.signal }).then(async(response) => {

    let res = await response.json();

    tutors = res;

    for (let i = 0; i < res.length; i++) {

      let key = "act" + i;

      presetRoleData[key] = res[i].prompt.trim();

      let optionEle = document.createElement("option");
      optionEle.text = res[i].act;
      optionEle.value = key;

      preEle.options.add(optionEle);

    }

    // set system role
    const sel = `#preSetSystem option:contains(\'${tutor}\')`;
    $( sel ).attr('selected', 'selected').trigger('change'); 

    // set chat mode title
    const obj   = findObjectByKey( tutors, 'act', tutor );
    tutor_label = obj[0].act_label;

    $('#chat-title').text( tutor_label );


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
