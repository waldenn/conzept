import "/app/chat/libs/notyf.min.js";
import "/app/chat/libs/markdown-it.min.js";
import "/app/chat/libs/highlight.min.js";
import "/app/chat/libs/katex.min.js";
import "/app/chat/libs/texmath.js";
import "/app/chat/libs/texmath.js";

class Chat extends HTMLElement {

  async connectedCallback () {

    this.sDOM = this.attachShadow({ mode: 'closed' });

    this.sDOM.innerHTML = `

      <link href="/app/chat/css/notyf.min.css" rel="stylesheet">
      <link href="/app/chat/css/github-markdown-light.min.css" rel="stylesheet">
      <link href="/app/chat/css/github.min.css" rel="stylesheet">
      <link href="/app/chat/css/katex.min.css" rel="stylesheet">
      <link href="/app/chat/css/texmath.css" rel="stylesheet">
      <link href="/app/chat/css/embedded.css" rel="stylesheet">

      <!--div id="chat">

        <div style="display: none">
          <svg>
            <symbol viewBox="0 0 24 24" id="optionIcon">
              <path fill="currentColor" d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z"></path>
            </symbol>
            <symbol viewBox="0 0 24 24" id="refreshIcon">
              <path fill="currentColor" d="M18.537 19.567A9.961 9.961 0 0 1 12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10c0 2.136-.67 4.116-1.81 5.74L17 12h3a8 8 0 1 0-2.46 5.772l.997 1.795z"></path>
            </symbol>
            <symbol viewBox="0 0 24 24" id="halfRefIcon">
              <path fill="currentColor" d="M 4.009 12.163 C 4.012 12.206 2.02 12.329 2 12.098 C 2 6.575 6.477 2 12 2 C 17.523 2 22 6.477 22 12 C 22 14.136 21.33 16.116 20.19 17.74 L 17 12 L 20 12 C 19.999 5.842 13.333 1.993 7.999 5.073 C 3.211 8.343 4.374 12.389 4.009 12.163 Z" />
            </symbol>
            <symbol viewBox="-2 -2 20 20" id="copyIcon">
              <path fill="currentColor" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
              <path fill="currentColor" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
            </symbol>
            <symbol viewBox="0 0 24 24" id="delIcon">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7v0a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v0M9 7h6M9 7H6m9 0h3m2 0h-2M4 7h2m0 0v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"></path>
            </symbol>
            <symbol viewBox="0 0 24 24" id="readyVoiceIcon">
              <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
            </symbol>
            <symbol viewBox="0 0 16 16" id="pauseVoiceIcon">
              <path stroke="currentColor" stroke-width="2" d="M5 2v12M11 2v12"></path>
            </symbol>
            <symbol viewBox="0 0 16 16" id="resumeVoiceIcon">
              <path fill="currentColor" d="M4 2L4 14L12 8Z"></path>
            </symbol>
            <symbol viewBox="0 0 24 24" id="stopResIcon">
              <path fill="currentColor" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10zm0-2a8 8 0 1 0 0-16a8 8 0 0 0 0 16zM9 9h6v6H9V9z"></path>
            </symbol>
            <symbol viewBox="0 0 128 128" id="downAudioIcon">
              <path d="M 64.662 1.549 C 56.549 4.524, 46.998 14.179, 45.523 20.895 C 45.041 23.089, 44.073 23.833, 40.433 24.807 C 34.752 26.326, 27.956 32.929, 25.527 39.289 C 24.273 42.574, 23.884 45.715, 24.196 50.034 C 24.620 55.897, 24.528 56.193, 21.836 57.585 C 17.142 60.012, 16 63.617, 16 76 C 16 88.463, 17.137 91.985, 21.967 94.483 C 28.244 97.729, 36.120 95.350, 38.579 89.466 C 39.387 87.532, 40 82.764, 40 78.415 C 40 70.971, 40.060 70.783, 42.250 71.370 C 43.487 71.701, 48.888 71.979, 54.250 71.986 L 64 72 64 76 L 64 80 57.122 80 C 49.420 80, 48.614 80.543, 47.547 86.453 C 46.552 91.964, 43.550 97.473, 40.273 99.803 C 33 104.974, 23.120 105.042, 16.118 99.971 C 11.407 96.558, 9.048 92.484, 8.145 86.205 C 6.963 77.979, 0.794 77.729, 0.191 85.883 C -0.196 91.111, 3.323 99.170, 8.062 103.908 C 11.290 107.136, 20.073 111.969, 22.750 111.990 C 23.540 111.996, 24 113.472, 24 116 C 24 119.740, 23.813 120, 21.122 120 C 17.674 120, 15.727 122.044, 16.173 125.195 C 16.492 127.441, 16.781 127.500, 27.391 127.500 C 36.676 127.500, 38.445 127.242, 39.386 125.750 C 40.993 123.203, 38.986 120.568, 35.149 120.187 C 32.206 119.894, 32 119.617, 32 115.956 C 32 112.509, 32.330 111.959, 34.750 111.377 C 42.181 109.591, 52.157 101.208, 53.575 95.559 C 53.928 94.152, 54.514 93, 54.878 93 C 55.242 93, 59.797 97.275, 65 102.500 C 70.762 108.286, 75.256 112, 76.495 112 C 77.769 112, 83.287 107.231, 91.264 99.236 C 101.113 89.366, 104 85.876, 104 83.843 C 104 80.580, 102.553 80, 94.418 80 L 88 80 88 76.105 L 88 72.211 99.750 71.815 C 113.117 71.364, 117.595 69.741, 122.762 63.473 C 128.159 56.925, 129.673 45.269, 126.134 37.500 C 123.787 32.346, 117.218 26.445, 112.132 24.921 C 108.617 23.868, 107.767 22.968, 105.028 17.405 C 99.364 5.901, 89.280 -0.062, 75.712 0.070 C 71.746 0.109, 66.773 0.774, 64.662 1.549 M 67.885 9.380 C 60.093 12.164, 55.057 17.704, 52.527 26.276 C 51.174 30.856, 50.220 31.617, 44.729 32.496 C 37.017 33.729, 30.917 42.446, 32.374 50.154 C 34.239 60.026, 40.582 63.944, 54.750 63.978 L 64 64 64 57.122 C 64 52.457, 64.449 49.872, 65.396 49.086 C 66.310 48.328, 70.370 48.027, 77.146 48.214 L 87.500 48.500 87.794 56.359 L 88.088 64.218 98.989 63.845 C 108.043 63.535, 110.356 63.125, 112.634 61.424 C 119.736 56.122, 121.911 47.667, 118.097 40.190 C 115.870 35.824, 110.154 32.014, 105.790 31.985 C 102.250 31.961, 101.126 30.787, 99.532 25.443 C 95.580 12.197, 80.880 4.736, 67.885 9.380 M 72 70.800 C 72 80.978, 71.625 85.975, 70.800 86.800 C 70.140 87.460, 67.781 88, 65.559 88 L 61.517 88 68.759 95.241 L 76 102.483 83.241 95.241 L 90.483 88 86.441 88 C 84.219 88, 81.860 87.460, 81.200 86.800 C 80.375 85.975, 80 80.978, 80 70.800 L 80 56 76 56 L 72 56 72 70.800 M 25.200 65.200 C 23.566 66.834, 23.566 85.166, 25.200 86.800 C 27.002 88.602, 29.798 88.246, 30.965 86.066 C 31.534 85.002, 32 80.472, 32 76 C 32 71.528, 31.534 66.998, 30.965 65.934 C 29.798 63.754, 27.002 63.398, 25.200 65.200" stroke="none" fill="currentColor" fill-rule="evenodd" />
            </symbol>
            <symbol viewBox="0 0 24 24" id="chatIcon">
              <path fill="currentColor" d="m18 21l-1.4-1.4l1.575-1.6H14v-2h4.175L16.6 14.4L18 13l4 4l-4 4ZM3 21V6q0-.825.588-1.413T5 4h12q.825 0 1.413.588T19 6v5.075q-.25-.05-.5-.063T18 11q-.25 0-.5.013t-.5.062V6H5v10h7.075q-.05.25-.063.5T12 17q0 .25.013.5t.062.5H6l-3 3Zm4-11h8V8H7v2Zm0 4h5v-2H7v2Zm-2 2V6v10Z" />
            </symbol>
            <symbol viewBox="0 0 24 24" id="chatEditIcon">
              <path fill="currentColor" d="M5 19h1.4l8.625-8.625l-1.4-1.4L5 17.6V19ZM19.3 8.925l-4.25-4.2l1.4-1.4q.575-.575 1.413-.575t1.412.575l1.4 1.4q.575.575.6 1.388t-.55 1.387L19.3 8.925ZM17.85 10.4L7.25 21H3v-4.25l10.6-10.6l4.25 4.25Zm-3.525-.725l-.7-.7l1.4 1.4l-.7-.7Z"></path>
            </symbol>
            <symbol viewBox="0 0 24 24" id="deleteIcon">
              <path fill="currentColor" d="M8 20v-5h2v5h9v-7H5v7h3zm-4-9h16V8h-6V4h-4v4H4v3zM3 21v-8H2V7a1 1 0 0 1 1-1h5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3h5a1 1 0 0 1 1 1v6h-1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"></path>
            </symbol>
            <symbol viewBox="0 0 24 24" id="addIcon" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </symbol>
            <symbol viewBox="0 0 200 100" preserveAspectRatio="xMidYMid" id="loadingIcon">
              <g transform="translate(50 50)">
                <circle cx="0" cy="0" r="15" fill="#e15b64">
                  <animateTransform attributeName="transform" type="scale" begin="-0.3333333333333333s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
                </circle>
              </g>
              <g transform="translate(100 50)">
                <circle cx="0" cy="0" r="15" fill="#f8b26a">
                  <animateTransform attributeName="transform" type="scale" begin="-0.16666666666666666s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
                </circle>
              </g>
              <g transform="translate(150 50)">
                <circle cx="0" cy="0" r="15" fill="#99c959">
                  <animateTransform attributeName="transform" type="scale" begin="0s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
                </circle>
              </g>
            </symbol>
            <symbol viewBox="0 0 24 24" id="exportIcon">
              <path fill="currentColor" d="M4 19h16v-7h2v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-8h2v7zM14 9h5l-7 7l-7-7h5V3h4v6z"></path>
            </symbol>
            <symbol viewBox="0 0 24 24" id="importIcon">
              <path fill="currentColor" d="M4 19h16v-7h2v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-8h2v7zM14 9v6h-4V9H5l7-7l7 7h-5z"></path>
            </symbol>
            <symbol viewBox="0 0 24 24" id="clearAllIcon">
              <path fill="currentColor" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10zm0-2a8 8 0 1 0 0-16a8 8 0 0 0 0 16zm0-9.414l2.828-2.829l1.415 1.415L13.414 12l2.829 2.828l-1.415 1.415L12 13.414l-2.828 2.829l-1.415-1.415L10.586 12L7.757 9.172l1.415-1.415L12 10.586z"></path>
            </symbol>
          </svg>
        </div>

        <div id="loadMask">
          <div>
            <div>ChatGPT</div>
            <svg>
              <use xlink:href="#loadingIcon" />
            </svg>
          </div>
        </div>

        <div class="chat_window">
          <div class="overlay"></div>
          <nav class="nav">
            <div id="newChat">
              <svg width="24" height="24">
                <use xlink:href="#addIcon" />
              </svg>
              <span>new chat</span>
            </div>
            <div id="chatList"></div>
            <div class="navFooter">
              <div class="navFunc">
                <div id="exportChat">
                  <svg width="24" height="24">
                    <use xlink:href="#exportIcon" />
                  </svg>
                  <span>export</span>
                </div>
                <label id="importChat" for="importChatInput">
                  <svg width="24" height="24">
                    <use xlink:href="#importIcon" />
                  </svg>
                  <span>import</span>
                </label>
                <input type="file" style="display: none;" id="importChatInput" accept="application/json" />
                <div id="clearChat">
                  <svg width="24" height="24">
                    <use xlink:href="#clearAllIcon" />
                  </svg>
                  <span>clear all</span>
                </div>
              </div>
              <div class="divider"></div>
              <!--div class="links"><a href="https://github.com/alitrack/gptweb" target="_blank"
                            rel="noopener noreferrer">Github</a></div-->
            </div>
          </nav>
          <div class="top_menu">
            <div class="toggler">
              <div class="button close"></div>
              <div class="button minimize"></div>
              <div class="button maximize"></div>
            </div>
            <div class="title">ChatGPT</div>
            <button id="setting">
              <svg viewBox="0 0 100 100" style="display:block;" role="img" width="30" height="30">
                <title>settings</title>
                <circle cx="50" cy="20" r="10" fill="#e15b64" />
                <circle cx="50" cy="50" r="10" fill="#f8b26a" />
                <circle cx="50" cy="80" r="10" fill="#99c959" />
              </svg>
            </button>
            <div id="setDialog" style="display:none;">
              <div class="setSwitch">
                <div data-id="convOption" class="activeSwitch">chat</div>
                <div data-id="speechOption">speech</div>
                <div data-id="recOption">speech recognition</div>
              </div>
              <div id="convOption">
                <div class="presetSelect presetModelCls">
                  <label for="preSetModel">GPT model</label>
                  <select id="preSetModel">
                    <option value="gpt-3.5-turbo">gpt-3.5</option>
                    <option value="gpt-4">gpt-4</option>
                    <option value="gpt-4-32k">gpt-4-32k</option>
                  </select>
                </div>
                <div>
                  <div>API host</div>
                  <input class="inputTextClass" placeholder="https://example.com/" id="apiHostInput" />
                </div>
                <div>
                  <div>API key</div>
                  <input class="inputTextClass" type="password" placeholder="sk-xxxxxx" id="keyInput" style="-webkit-text-security: disc;" />
                </div>
                <div>
                  <div class="justSetLine presetSelect">
                    <div>system role</div>
                    <div>
                      <label for="preSetSystem">default role</label>
                      <select id="preSetSystem">
                        <option value="">default</option>
                        <option value="normal">normal</option>
                        <option value="cat">cat</option>
                        <option value="emoji">emoji</option>
                        <option value="image">image</option>
                      </select>
                    </div>
                  </div>
                  <textarea class="inputTextClass areaTextClass" placeholder="You are a helpful assistant, try to answer concisely" id="systemInput"></textarea>
                </div>
                <div>
                  <span>character</span>
                  <input type="range" id="top_p" min="0" max="1" value="1" step="0.05" />
                  <div class="selectDef">
                    <span>accurate</span>
                    <span>creative</span>
                  </div>
                </div>
                <div>
                  <span>answer quality</span>
                  <input type="range" id="temp" min="0" max="2" value="1" step="0.05" />
                  <div class="selectDef">
                    <span>repetitive</span>
                    <span>nonsense</span>
                  </div>
                </div>
                <div>
                  <span>writing speed</span>
                  <input type="range" id="textSpeed" min="0" max="100" value="88" step="1" />
                  <div class="selectDef">
                    <span>slow</span>
                    <span>fast</span>
                  </div>
                </div>
                <div>
                  <span class="inlineTitle">continuous dialogue</span>
                  <label class="switch-slide">
                    <input type="checkbox" id="enableCont" checked hidden />
                    <label for="enableCont" class="switch-slide-label"></label>
                  </label>
                </div>
                <div>
                  <span class="inlineTitle">long reply</span>
                  <label class="switch-slide">
                    <input type="checkbox" id="enableLongReply" hidden />
                    <label for="enableLongReply" class="switch-slide-label"></label>
                  </label>
                </div>
              </div>
              <div id="speechOption" style="display: none;">
                <div class="presetSelect presetModelCls">
                  <label for="preSetService">speech synthesis</label>
                  <select id="preSetService">
                    <option value="1" selected>system voice</option>
                    <option value="2">Edge</option>
                    <option value="3">Azure</option>
                  </select>
                </div>
                <div class="presetSelect presetModelCls">
                  <label for="preSetAzureRegion">Azure 区域</label>
                  <select id="preSetAzureRegion"></select>
                </div>
                <div>
                  <div>Azure Access Key</div>
                  <input class="inputTextClass" type="password" placeholder="Azure Key" id="azureKeyInput" style="-webkit-text-security: disc;" />
                </div>
                <div id="checkVoiceLoad" style="display: none;">
                  <svg>
                    <use xlink:href="#loadingIcon" />
                  </svg>
                  <span>load voice</span>
                </div>
                <div id="speechDetail">
                  <div>
                    <div class="justSetLine">
                      <div>voices</div>
                      <div id="voiceTypes">
                        <span data-type="0">question voice</span>
                        <span data-type="1" class="selVoiceType">answer voice</span>
                      </div>
                    </div>
                    <select id="preSetSpeech"></select>
                  </div>
                  <div class="justSetLine presetSelect" id="azureExtra" style="display:none;">
                    <div class="presetModelCls">
                      <label for="preSetVoiceStyle">style</label>
                      <select id="preSetVoiceStyle"></select>
                    </div>
                    <div class="presetModelCls">
                      <label for="preSetVoiceRole">role</label>
                      <select id="preSetVoiceRole"></select>
                    </div>
                  </div>
                  <div>
                    <span>volume</span>
                    <input type="range" id="voiceVolume" min="0" max="1" value="1" step="0.1" />
                    <div class="selectDef">
                      <span>low</span>
                      <span>high</span>
                    </div>
                  </div>
                  <div>
                    <span>rate</span>
                    <input type="range" id="voiceRate" min="0.1" max="2" value="1" step="0.1" />
                    <div class="selectDef">
                      <span>low</span>
                      <span>high</span>
                    </div>
                  </div>
                  <div>
                    <span>pitch</span>
                    <input type="range" id="voicePitch" min="0" max="2" value="1" step="0.1" />
                    <div class="selectDef">
                      <span>low</span>
                      <span>high</span>
                    </div>
                  </div>
                  <div>
                    <span class="inlineTitle">continuous reading</span>
                    <label class="switch-slide">
                      <input type="checkbox" id="enableContVoice" checked hidden />
                      <label for="enableContVoice" class="switch-slide-label"></label>
                    </label>
                  </div>
                  <div>
                    <span class="inlineTitle">automatic reading</span>
                    <label class="switch-slide">
                      <input type="checkbox" id="enableAutoVoice" hidden />
                      <label for="enableAutoVoice" class="switch-slide-label"></label>
                    </label>
                  </div>
                </div>
              </div>
              <div id="recOption" style="display: none;">
                <div id="noRecTip" style="display: block;">Your browser does not support speech recognition</div>
                <div id="yesRec" style="display: none;">
                  <div class="presetSelect presetModelCls">
                    <label for="selectLangOption">language</label>
                    <select id="selectLangOption"></select>
                  </div>
                  <div class="presetSelect presetModelCls">
                    <label for="selectDiaOption">dialect</label>
                    <select id="selectDiaOption"></select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="messages">
            <div id="chatlog"></div>
            <div id="stopChat">
              <svg width="24" height="24">
                <use xlink:href="#stopResIcon" />
              </svg>stop chat
            </div>
          </div>
          <div class="bottom_wrapper clearfix">
            <div class="message_input_wrapper">
              <textarea class="message_input_text" spellcheck="false" placeholder="Ask something..." id="chatinput"></textarea>
              <div id="voiceRec" style="display:none;">
                <div id="voiceRecIcon">
                  <svg viewBox="0 0 48 48" id="voiceInputIcon">
                    <g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4">
                      <rect fill="none" width="14" height="27" x="17" y="4" rx="7" />
                      <rect class="animVoice" x="18" y="4" width="12" height="27" stroke="none" fill="currentColor"></rect>
                      <path stroke-linecap="round" d="M9 23c0 8.284 6.716 15 15 15c8.284 0 15-6.716 15-15M24 38v6" />
                    </g>
                  </svg>
                </div>
                <div id="voiceRecSetting">
                  <select id="select_language" style="margin-bottom: 4px;"></select>
                  <select id="select_dialect"></select>
                </div>
              </div>
            </div>
            <button class="loaded" id="sendbutton">
              <span>send</span>
              <svg style="margin:0 auto;height:40px;width:100%;">
                <use xlink:href="#loadingIcon" />
              </svg>
            </button>
            <button id="clearConv">
              <svg style="margin:0 auto;display:block" role="img" width="20px" height="20px">
                <title>清空会话</title>
                <use xlink:href="#deleteIcon" />
              </svg>
            </button>
          </div>
        </div>

      </div-->

      <script>

        let message     = this.getAttribute('data-message') || '';
        let language    = this.getAttribute('data-language') || 'en';

        if (! message) {
          throw new Error('No message given.');
        }
        else {

          console.log( 'message:', message );

        };

      </script>

      <!--script src="/app/chat/src/main.js"></script-->
      `;

  }

}

customElements.define('chat-ai', Chat);
