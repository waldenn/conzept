let parentref;
let language;

//let html_undefined = '<li><i class="undefined far fa-window-minimize"></i></li>';

if ( window.parent.name === 'infoframeSplit2' || window.parent.name === 'infoframe_' ){ // request from secondary content iframe
  parentref = parent;
}
else { // primary content frame
  parentref = parent.top;
}

//setupAppKeyboardNavigation();

function removeColumn( gid ) {

  $('th[data-entity="' + gid.trim() + '"]').css({ 'display': 'none' });
  $('td[data-entity="' + gid.trim() + '"]').css({ 'display': 'none' });

  window.top.postMessage({ event_id: 'remove-compare-item', data: { mygid: gid } }, '*' );
}

function removeAllColumns() {

  // hide table
  $('#table-output').css({ 'display' : 'none' });

  window.top.postMessage({ event_id: 'remove-compare-items', data: {  } }, '*' );
}


// CONZEPT PATCH
function setupImageZoom(){ // using OpenSeaDragon

  // see:
  //  https://openseadragon.github.io/docs/
  //  https://openseadragon.github.io/examples/tilesource-image/

  // hack? https://stackoverflow.com/questions/5059596/jquery-css-remove-add-displaynone
  $('#openseadragon').hide;

  window.viewer = OpenSeadragon({

    id: "openseadragon",

    prefixUrl: "",

    tileSources: {
      type: 'image',
      url:  CONZEPT_WEB_BASE + '/app/explore2/assets/images/icon_home.png',
      crossOriginPolicy: 'Anonymous',
      ajaxWithCredentials: false,
    },

  });

  window.viewer.world.addHandler('add-item', function(event) {
    let tiledImage = event.item;
    tiledImage.addHandler('fully-loaded-change', fullyLoadedHandler);
  });

 window.viewer.setVisible(true);
 //window.viewer.setVisible( false );

}

function fullyLoadedHandler() {

  console.log( 'OpenSeaDragon image fully loaded: hide loading indicator...');
  $('#loader-openseadragon').hide();

}

class LabelLoader {

	constructor(requestsQueue) {
		this.autoRequest = false;
		this.cache = {};
		this.queue = {};
		this.queueRequesting = [];
		this.queueToRequest = [];
		this.requestQueue = requestsQueue;
	}
	static getLabel(wikidataLabels) {
		if(typeof wikidataLabels[Settings.getLanguage()] == "object") {
			return wikidataLabels[Settings.getLanguage()].value;
		} else if(typeof wikidataLabels["en"] == "object") {
			return wikidataLabels["en"].value;
		} else if(typeof Object.keys(wikidataLabels).length > 0) {
			return wikidataLabels[Object.keys(wikidataLabels)[0]];
		} else {
			return null;
		}
	}
	enqueue(wikidataId, callbackSuccess, callbackError) {
		if(typeof this.cache[wikidataId] == "object") {
			callbackSuccess(this.cache[wikidataId]);
		} else {
			if(typeof this.queue[wikidataId] == "undefined") this.queue[wikidataId] = [];
			
			this.queue[wikidataId].push(new LabelLoader.QueueItem(callbackSuccess, callbackError));

			if(this.queueRequesting.includes(wikidataId) && this.autoRequest) {
				this._enqueueRequest(wikidataId);
			} else {
				if(!this.queueToRequest.includes(wikidataId)) this.queueToRequest.push(wikidataId);
			}
		}
	}
	enqueueAndReplace(wikidataId, elem, fallback, forceLabel) {
		if(typeof elem == "function") elem = elem();
		if(typeof fallback != "string") fallback = wikidataId;
		if(typeof forceLabel != "boolean") forceLabel = false;

		this.enqueue(wikidataId, function(wikidataLabels) {
			if(forceLabel || !$("#setting-ui-displaywdid").prop("checked")) {
				if(!Array.isArray(elem)) elem = [elem];

				var label = LabelLoader.getLabel(wikidataLabels);
				if(label != null || typeof fallback == "string") {
					$.each(elem, function(i, val) {
						val.textContent = label || fallback;
					});
				}
			}
		});
	}
	startWork() {
		var _this = this;

		this._enqueueRequest(this.queueToRequest);
		$.each(this.queueToRequest, function(i, val) {
			if(!_this.queueRequesting.includes(val)) _this.queueRequesting.push(val);
		});
		
		this.queueToRequest = [];
	}
	_enqueueRequest(wikidataIds) {
		if(typeof wikidataIds == "string") wikidataIds = [wikidataIds];

		var ids = wikidataIds.slice(0);
		var _this = this;
		while(ids.length > 0) {
			this.requestQueue.enqueueRequest(function(requestQueue, data) {
				$.ajax({
					data: {
						"action": "wbgetentities",
						"props": "labels",
						"format": "json",
						"languages": `${Settings.getLanguage()}|en`,
						"origin": "*",
						"ids": data.idsSegment.join("|")
					},
					url: "https://www.wikidata.org/w/api.php"
				}).always(function(e) {
					requestQueue._finishRequest();
				}).done(function(e) {
					//console.debug(e);
					$.each(data.idsSegment, function(i, wikidataId) {
						_this.queueRequesting.pop(wikidataId);
						$.each(_this.queue[wikidataId], function(j, val) {
							if(typeof e.entities == "object" && typeof e.entities[wikidataId] == "object") {
								val.callbackSuccess(e.entities[wikidataId].labels);
							} else {
								if(typeof val.callbackError == "function") val.callbackError();
							}
						});
						delete _this.queue[wikidataId];
					});
				}).fail(function(e) {
					$.each(data.idsSegment, function(i, wikidataId) {
						_this.queueRequesting.pop(wikidataId);
						$.each(_this.queue[wikidataId], function(i, val) {
							if(typeof val.callbackError == "function") val.callbackError();
						});
						delete _this.queue[wikidataId];
					});
				});
			}, {
				idsSegment: ids.slice(0,50)
			});
			ids = ids.slice(50);
		}
	}
}
LabelLoader.QueueItem = class {
	constructor(callbackSuccess, callbackError) {
		this.callbackSuccess = callbackSuccess;
		this.callbackError = callbackError;
	}
}
class Permalink {
	static generatePermalink() {
		var parameters = [];

		// Options
		var label = $("#permalink-label").val();
		var includedItems = $("#permalink-includeditems").prop("checked");
		var filterProperties = $("#permalink-filterproperties").prop("checked");
		var displayedProperties = [];
		$("#permalink-displayedproperties").find(":checked").each(function(i, val) {
			displayedProperties.push($(this).val());
		});
		var autoload = $("#permalink-queryonloaded").prop("checked");
		var fullscreen = $("#permalink-fullscreen").prop("checked");
		var settings = $("#permalink-settings").prop("checked");

		if(label !== null) parameters.push(`l=${encodeURIComponent(label)}`);
		if(includedItems) parameters.push(`i=${encodeURIComponent(elements.join(","))}`);
		if(filterProperties) parameters.push(`p=${encodeURIComponent(displayedProperties.join(","))}`)
		if(autoload) parameters.push("r");
		if(fullscreen) parameters.push("f");
		if(settings) parameters.push(`settings=${encodeURIComponent(Settings.export())}`);

		return `${document.location.protocol}//${document.location.host}${document.location.pathname}?${parameters.join("&")}`;
	}
	static getFilteredProperties() {
		var urlParams = new URLSearchParams(window.location.search);
		if(urlParams.get("p") != null) {
			return urlParams.get("p").split(",");
		} else {
			return null;
		}
	}
	static initialize() {

		$("#button-permalink").click(function(e) {
			Permalink.uiShown();
		});
		Permalink.load();

	}
	static load() {
		var urlParams = new URLSearchParams(window.location.search);
		if(urlParams.get("i") != null) {
			$("#commands").val(urlParams.get("i").split(",").join("\n"));
	
			// Auto-execute?
			if(urlParams.has("r")) {
				$("#button-parse").click();
	
				if(urlParams.has("f")) {
					$("#table-container").toggleClass("fullscreen");
				}
			}

			if(urlParams.has("lang")) {
        // language-label
        $("#setting-language-label").val( urlParams.get("lang") );
        language = urlParams.get("lang") || 'en';
      }
		}
	}
	static uiShown() {
		$("#permalink-displayedproperties").empty();
		$.each(properties, function(i, val) {
			$("#permalink-displayedproperties").append(`<option selected>${val}</option>`);
		});
		$("#modal-permalink input, #modal-permalink select").on("change keyup paste", function(e) {
			Permalink.uiUpdate();
		});
		Permalink.uiUpdate();
	}
	static uiUpdate() {
		if($("#permalink-includeditems").prop("checked")) {
			$("#permalink-queryonloaded").removeAttr("disabled")
		} else {
			$("#permalink-queryonloaded").attr("disabled", "disabled");
		}
		if($("#permalink-filterproperties").prop("checked")) {
			$("#permalink-displayedproperties").removeAttr("disabled");
		} else {
			$("#permalink-displayedproperties").attr("disabled", "disabled");
		}
		Permalink.uiUpdateUrl();
	}
	static uiUpdateUrl() {
		var permalink = Permalink.generatePermalink();
		$("#button-permalink-open").attr("href", permalink);
		$("#permalink-output").val(permalink);
	}
}
class Settings {
	static attachLiveHandler() {
		$("#setting-ui-stickyheaderrow").change(function(e) {
			if(this.checked) {
				Settings.enableConditionalStyle("stickyheaderrow", `#table-output thead th {
					position: sticky;
					top: 0;
					z-index: 1;
          background: rgba(152, 169, 194, 0.98);
				}`);
			} else {
				Settings.disableConditionalStyle("stickyheaderrow");
			}
		});
		$("#setting-ui-stickyheaderrow").change();
		$("#setting-ui-stickyheadercolumn").change(function(e) {
			if(this.checked) {
				Settings.enableConditionalStyle("stickyheadercolumn", `#table-output tbody th {
					position: sticky;
					left: 0;
				}`);
			} else {
				Settings.disableConditionalStyle("stickyheadercolumn");
			}
		});
		$("#setting-ui-stickyheadercolumn").change();
		$("#setting-ui-visitedlinks").change(function(e) {
			if(this.checked) {
				Settings.enableConditionalStyle("visitedlinks", `a[href^="https://www.wikidata.org/wiki/"]:visited {
					color: purple;
				}`);
			} else {
				Settings.disableConditionalStyle("visitedlinks");
			}
		});
		$("#setting-ui-visitedlinks").change();
	}
	static disableConditionalStyle(name) {
		var element = $(`style[data-setting='${name}']`);
		if(element.length != 0) element.remove();
	}
	static enableConditionalStyle(name, style) {
		if($(`style[data-setting='${name}']`).length == 0) $("head").append(`<style data-setting="${name}">${style}</style>`);
	}
	static export() {
		var settings = {
			"language-label": $("#setting-language-label").val(),
			"ui-collapsealiases": $("setting-ui-collapsealiases").prop("checked"),
			"ui-collapsedescriptions": $("setting-ui-collapsedescriptions").prop("checked"),
			"ui-collapsesitelinks": $("#setting-ui-collapsesitelinks").prop("checked"),
			"ui-displayimages": $("#setting-ui-displayimages").prop("checked"),
			"ui-displaylangalias": $("#setting-ui-displaylangalias").val(),
			"ui-displaylangdescription": $("#setting-ui-displaylangdescription").val(),
			"ui-displaywdid": $("#setting-ui-displaywdid").prop("checked"),
			"ui-stickyheadercolumn": $("#setting-ui-stickyheadercolumn").prop("checked"),
			"ui-stickyheaderrow": $("#setting-ui-stickyheaderrow").prop("checked"),
			"ui-visitedlinks": $("#setting-ui-visitedlinks").prop("checked")
		};
		return JSON.stringify(settings);
	}
	static getLanguage() {
		return $("#setting-language-label").val().toLowerCase();
	}
	static initialize() {
		$("#button-settings-geturl").click(function(e) {
			e.preventDefault();
			if($("#button-settings-geturl").hasClass("mode-ready")) {
				window.location.search = `?settings=${encodeURIComponent(Settings.export())}`;
			} else {
				$("#button-settings-geturl").tooltipster({
					content: "Clicking again on this button will redirect you to a new url which has your settings stored. This url can be bookmarked. However, your current entries in the input textbox will be gone once redirected.",
					functionAfter: function() {
						$("#button-settings-geturl").removeClass("mode-ready");
					},
					functionBefore: function() {
						$("#button-settings-geturl").addClass("mode-ready");
					},
					side: "left",
					theme: ["tooltipster-light", "tooltipster-error"],
					timer: 10000,
					trigger: "custom"
				}).tooltipster("open");
			}
		});

		Settings.loadLanguages();
		Settings.load();
		Settings.attachLiveHandler();
	}
	static load() {
		var query = (new URL(window.location.href)).searchParams.get("settings");
		if(query != null) {
			try {
				var settings = JSON.parse(query);

				assign(settings, "language-label", x => $("#setting-language-label").val(x));
				assign(settings, "ui-collapsealiases", x => $("setting-ui-collapsealiases").val(x));
				assign(settings, "ui-collapsedescriptions", x => $("setting-ui-collapsedescriptions").prop("checked", x));
				assign(settings, "ui-collapsesitelinks", x => $("#setting-ui-collapsesitelinks").prop("checked", x));
				assign(settings, "ui-displayimages", x => $("#setting-ui-displayimages").prop("checked", x));
				assign(settings, "ui-displaylangalias", x => $("#setting-ui-displaylangalias").val(x));
				assign(settings, "ui-displaylangdescription", x => $("#setting-ui-displaylangdescription").val(x));
				assign(settings, "ui-displaywdid", x => $("#setting-ui-displaywdid").prop("checked", x));
				assign(settings, "ui-stickyheadercolumn", x => $("#setting-ui-stickyheadercolumn").prop("checked", x));
				assign(settings, "ui-stickyheaderrow", x => $("#setting-ui-stickyheaderrow").prop("checked", x));
				assign(settings, "ui-visitedlinks", x => $("#setting-ui-visitedlinks").prop("checked", x));
			} catch(ex) {
				console.warn(ex);
			}
		}

		function assign(settings, key, assignFunction) {
			if(typeof settings[key] != "undefined") assignFunction(settings[key]);
		}
	}
	static loadLanguages() {	// https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities
		var lang = ["aa","ab","ace","ady","ady-cyrl","aeb","aeb-arab","aeb-latn","af","ak","aln","als","am","an","ang","anp","ar","arc","arn","arq","ary","arz","as","ase","ast","atj","av","avk","awa","ay","az","azb","ba","ban","bar","bat-smg","bbc","bbc-latn","bcc","bcl","be","be-tarask","be-x-old","bg","bgn","bh","bho","bi","bjn","bm","bn","bo","bpy","bqi","br","brh","bs","bto","bug","bxr","ca","cbk-zam","cdo","ce","ceb","ch","cho","chr","chy","ckb","co","cps","cr","crh","crh-cyrl","crh-latn","cs","csb","cu","cv","cy","da","de","de-at","de-ch","de-formal","din","diq","dsb","dtp","dty","dv","dz","ee","egl","el","eml","en","en-ca","en-gb","eo","es","es-formal","et","eu","ext","fa","ff","fi","fit","fiu-vro","fj","fo","fr","frc","frp","frr","fur","fy","ga","gag","gan","gan-hans","gan-hant","gcr","gd","gl","glk","gn","gom","gom-deva","gom-latn","gor","got","grc","gsw","gu","gv","ha","hak","haw","he","hi","hif","hif-latn","hil","ho","hr","hrx","hsb","ht","hu","hu-formal","hy","hz","ia","id","ie","ig","ii","ik","ike-cans","ike-latn","ilo","inh","io","is","it","iu","ja","jam","jbo","jut","jv","ka","kaa","kab","kbd","kbd-cyrl","kbp","kea","kg","khw","ki","kiu","kj","kk","kk-arab","kk-cn","kk-cyrl","kk-kz","kk-latn","kk-tr","kl","km","kn","ko","ko-kp","koi","kr","krc","kri","krj","krl","ks","ks-arab","ks-deva","ksh","ku","ku-arab","ku-latn","kum","kv","kw","ky","la","lad","lb","lbe","lez","lfn","lg","li","lij","liv","lki","lmo","ln","lo","loz","lrc","lt","ltg","lus","luz","lv","lzh","lzz","mai","map-bms","mdf","mg","mh","mhr","mi","min","mk","ml","mn","mo","mr","mrj","ms","mt","mus","mwl","my","myv","mzn","na","nah","nan","nap","nb","nds","nds-nl","ne","new","ng","niu","nl","nl-informal","nn","no","nod","nov","nrm","nso","nv","ny","nys","oc","olo","om","or","os","ota","pa","pag","pam","pap","pcd","pdc","pdt","pfl","pi","pih","pl","pms","pnb","pnt","prg","ps","pt","pt-br","qu","qug","rgn","rif","rm","rmy","rn","ro","roa-rup","roa-tara","ru","rue","rup","ruq","ruq-cyrl","ruq-latn","rw","rwr","sa","sah","sat","sc","scn","sco","sd","sdc","sdh","se","sei","ses","sg","sgs","sh","shi","shi-latn","shi-tfng","shn","si","simple","sje","sk","skr","skr-arab","sl","sli","sm","sma","smj","sn","so","sq","sr","sr-ec","sr-el","srn","srq","ss","st","stq","sty","su","sv","sw","szl","ta","tay","tcy","te","tet","tg","tg-cyrl","tg-latn","th","ti","tk","tl","tly","tn","to","tpi","tr","tru","ts","tt","tt-cyrl","tt-latn","tum","tw","ty","tyv","tzm","udm","ug","ug-arab","ug-latn","uk","ur","uz","uz-cyrl","uz-latn","ve","vec","vep","vi","vls","vmf","vo","vot","vro","wa","war","wo","wuu","xal","xh","xmf","yi","yo","yue","za","zea","zh","zh-classical","zh-cn","zh-hans","zh-hant","zh-hk","zh-min-nan","zh-mo","zh-my","zh-sg","zh-tw","zh-yue","zu"];

		$("#languages").html("");
		$.each(lang, function(index, langcode) {
			$("#languages").append(`<option value="${langcode}"></option>`);
		})
	}
}
class Ui {
	static getIdLabel(wdId, label) {
		return `<span class="idlabel" ${label == null ? "" : `data-label="${label}" `} data-wdid="${_e(wdId)}">${($("#setting-ui-displaywdid").prop("checked") || label == null) ? _e(wdId) : label}</span>`;
	}
}

var elements;
var properties;
var queue = new RequestQueue();
var labelLoader = new LabelLoader(queue);

jQuery(document).ready(function($) {

	var toggle_wdid = false;

	$("#button-parse").removeAttr("disabled").click(function(e) {
		e.preventDefault();
		$(this).attr("disabled", "disabled");

		var userInput_entities = parseUserInput();

		// Reset table
		if (userInput_entities.length > 0) {
			$("#table-output thead tr").html("<th></th>");
			$("#table-output tbody").html("");
		}
    else {
			$("#table-output thead tr").html(`<th scope="col">&nbsp;</th>`);
			$("#table-output tbody tr").html(`<td>No data</td>`);
			$(this).removeAttr("disabled", "disabled");
			return;
		}

		generateTable(userInput_entities);
	});

	$("a[href='#fullscreen']").click(function(e) {
		e.preventDefault();
		$("#table-container").toggleClass("fullscreen");
	});

	$("a[href='#toggle_wdid']").click(function(e) {
		e.preventDefault();
		var $_this = $(this);
		$("*[data-wdid]").each(function(i, val) {
			if(typeof $(val).attr("data-label") != "string") $(val).attr("data-label", $(val).text());
			if(toggle_wdid) {
				$_this.text("Display Wikidata IDs");
				$(val).text($(val).attr("data-label"));
			} else {
				$_this.text("Display labels");
				$(val).text($(val).attr("data-wdid"));
			}
		});
		toggle_wdid = !toggle_wdid;
	});

	Settings.initialize();
	Permalink.initialize();

  
  // PATCH
  // see: https://lcweb.it/lc-lightbox/documentation
  const LC = lc_lightbox('.elem:visible', {
    wrap_class: 'lcl_fade_oc',
    gallery : true,
    thumb_attr: false, // 'data-lcl-thumb', 
    tn_hidden: true,
    thumbs_nav: true,
    download: true,
    skin: 'minimal',
    counter: true,
    touchswipe: true,
    fullscreen: false,
    //fs_only: true,
    //on_fs_exit: function(){ console.log('close LC'); close_lb(); }
    on_fs_exit: function(){ window.viewer.setVisible(false); }
  });

	// PATCH
	setupImageZoom();

});

function generateTable(elements) {

	generateColumns(elements);
	getEntities(elements, [], function(e) {
		var allProperties = [];
		if(Object.keys(e).length > 0) {

			// Update entities on UI
			updateEntities(e);
			$("#table-output tbody").html("");

			// Add aliases-rows on UI
			var cells = "";
			var maxlength = 0;
			elements.forEach(function(wdId, i) {
				
				if(typeof e[wdId].aliases != "undefined") {
					var length = 0;
					cells += `<td data-entity="${wdId}"><div><ul class="reordableList">`;
					$.each(e[wdId].aliases, function(i, lang) {
						$.each(lang, function(i, val) {
							cells += `<li class="${val.language == Settings.getLanguage() ? "highlight" : ""}">${wdDisplayAlias(val)}</li>`;
							length++;
						});
					});
					cells += `</ul></div></td>`;
					maxlength = length > maxlength ? length : maxlength;
				} else {
					cells += `<td class="snak-undefined" data-entity="${wdId}"> <li><i class="undefined far fa-window-minimize"></i></li> </td>`;
				}
			});
			$("#table-output tbody").append(generateRow("Aliases", null, cells, maxlength, null, $("#setting-ui-collapsealiases")[0].checked));

			// Add description-rows on UI
			cells = "";
			maxlength = 0;
			elements.forEach(function(wdId, i) {
				if(typeof e[wdId].descriptions != "undefined") {
					var length = 0;
					cells += `<td data-entity="${wdId}"><div><ul class="reordableList">`;
					$.each(e[wdId].descriptions, function(i, val) {
						cells += `<li class="${val.language == Settings.getLanguage() ? "highlight" : ""}"><span class="bubble">${val.language}</span> ${val.value}</li>`;
						length++;
					});
					cells += `</ul></div></td>`;
					maxlength = length > maxlength ? length : maxlength;
				} else {
					cells += `<td class="snak-undefined" data-entity="${wdId}"> <li><i class="undefined far fa-window-minimize"></i></li> </td>`;
				}
			});
			$("#table-output tbody").append(generateRow("Descriptions", null, cells, maxlength, null, true));

			// Add sitelink-rows on UI
			cells = "";
			maxlength = 0;
			elements.forEach(function(wdId, i) {
				if(typeof e[wdId].sitelinks != "undefined") {
					var length = 0;
					cells += `<td data-entity="${wdId}"><div><ul>`;
					$.each(e[wdId].sitelinks, function(i, val) {
						cells += `<li>${wdDisplaySitelink(val)}</li>`;
						length++;
					});
					cells += `</ul></div></td>`;
					maxlength = length > maxlength ? length : maxlength;
				} else {
					cells += `<td class="snak-undefined" data-entity="${wdId}"> <li><i class="undefined far fa-window-minimize"></i></li> </td>`;
				}
			});
			$("#table-output tbody").append(generateRow("Sitelinks", null, cells, maxlength, null, $("#setting-ui-collapsesitelinks")[0].checked));

			// Add property-rows on UI
			properties = listProperties(e);
			var whitelist = Permalink.getFilteredProperties();
			var whitelistedProperties = (whitelist == null ? properties : properties.filter(function(el) {
				return whitelist.includes(el);
			}));
			whitelistedProperties.forEach(function(property, i) {
				cells = "";
				maxlength = 0;

				var row = generateRow(`<a href="https://www.wikidata.org/wiki/Property:${property}" target="_blank" title="${property}" data-wdid="${property}">${property}</a>`, property, null, maxlength);

				elements.forEach(function(wdId, i) {
					if(typeof e[wdId].claims != "undefined" && typeof e[wdId].claims[property] != "undefined") {
						var length = 0;
						var listCell = $(`<td data-entity="${wdId}"><div><ul></ul></div></td>`);
						$.each(e[wdId].claims[property], function(i, val) {
							var listItem = $(`<li data-entity="${property}"></li>`);

              //console.log( wdDisplayValue(val) );

							listItem.append(wdDisplayValue(val));
							listCell.find("ul").append(listItem);
							length++;
						});
						row.append(listCell);
						maxlength = length > maxlength ? length : maxlength;
					} else {
						row.append(`<td class="snak-undefined" data-entity="${wdId}"> <li><i class="undefined far fa-window-minimize"></i></li> </td>`);
					}
				});
				$("#table-output tbody").append(row);
			});

			// Add collapse event handler
			$("#table-container a[href='#collapse']").click(function(e) {
				e.preventDefault();
				$(this).parent().parent().toggleClass("collapsed");
				if($(this).text() == "–") {
					$(this).text("+");
				} else {
					$(this).text("–");
				}
			});
			updateProperties(allProperties);
			labelLoader.startWork();

			// Enable permalink-button
			$("#button-permalink").removeClass("disabled");
		} else {
			console.warn("No results");
		}
	});
	function generateColumns(elements) {

		$.each(elements, function(colIndex, wdId) {

			var cell = $(`<th scope="col" ${colIndex == 0 ? `class="reference-item" ` : ""} data-entity="${wdId}"> <a href="javascript:void(0)" onclick="gotoWikipediaQid( &quot;${wdId}&quot; )" title="${wdId}">${Ui.getIdLabel(wdId, null)}</a> <span class="buttonRemoveColumn" title="remove this topic" onclick="removeColumn( &quot;${wdId}&quot; )">&nbsp;<i class="far fa-times-circle fa-sm"></i></span> </th>`);

			//var cell = $(`<th scope="col" ${colIndex == 0 ? `class="reference-item" ` : ""} data-entity="${wdId}"> <a href="https://www.wikidata.org/wiki/${wdId}" target="_blank" title="${wdId}">${Ui.getIdLabel(wdId, null)}</a> <span class="buttonRemoveColumn" title="remove this topic" onclick="removeColumn(&quot;${wdId}&quot;)">&nbsp;&nbsp;<i class="far fa-times-circle fa-sm"></i></span> </th>`);

			$("#table-output thead tr").append(cell);
		});

	}
	function generateRow(title, property, cells, maxElementsInCell, classes, collapsed) {
		collapsed = typeof collapsed == "boolean" && collapsed && maxElementsInCell >= 3;
		var out =  $(`<tr class="${collapsed ? "collapsed " : ""}${typeof classes == "string" ? classes : ""}"><th scope="row" ${property != null ? `data-entity="${property}"` : ""}><span>${title}</span>${getCollapseButton()}</th>${cells || ""}</tr>`);
		if(property != null) {
			labelLoader.enqueueAndReplace(property, out.find("span a").toArray(), null);
		}
		return out;

		function getCollapseButton() {
			if(maxElementsInCell >= 3) {
				if(collapsed) {
					return `<a class="openclose" href="#collapse">+</a>`;
				} else {
					return `<a class="openclose" href="#collapse">–</a>`;
				}
			} else {
				return "";
			}
		}
	}
	
	function updateEntities(entities) {
		Object.keys(entities).forEach(function(val, i) {
			var thisEntity = entities[val];
			//console.debug(thisEntity);
			var label = LabelLoader.getLabel(thisEntity.labels);

			$(`th[scope="col"][data-entity="${val}"] a`).html( Ui.getIdLabel(val, label) ).data('label', label );;

		});
	}
	function updateProperties(properties) {
		$.each(properties, function(i, property) {
			labelLoader.enqueueAndReplace(property, $(`th[scope="row"][data-entity="${property}"] a[href^='https://www.wikidata.org/']`).toArray(), null)
		});
	}
	function listProperties(entities) {
		var properties = [];
		Object.keys(entities).forEach(function(wdId, i) {
			var thisEntity = entities[wdId];
			if(typeof thisEntity.claims != "undefined") {
				properties = properties.concat(Object.keys(thisEntity.claims));
			} else {
				console.warn(`Id ${wdId} not found`);
			}					
		});
		return Utils.arrayUnique(properties).sort(function(firstEl, secondEl) {
			var firstNum = parseInt(firstEl.substr(1));
			var secondNum = parseInt(secondEl.substr(1));
			
			if(firstNum < secondNum) {
				return -1;
			} else if(firstNum == secondNum) {
				return 0;
			} else {
				return 1;
			}
		});
	}
}
function getEntities(ids, props, callback, callbackEr, requireFinishAll) {
	idsCopy = ids.slice(0);
	numberOfRequests = Math.ceil(ids.length / 50);
	finishedRequests = 0;
	if(typeof requireFinishAll == "undefined") requireFinishAll = true;
	allResults = {};

	while(idsCopy.length > 0) {
		var data = {
			"action": "wbgetentities",
			"format": "json",
			"origin": "*",
			"ids": idsCopy.slice(0,50).join("|")
		};
		if(props.length > 0) data.props = props.join("|");
		$.ajax({
			data: data,
			url: "https://www.wikidata.org/w/api.php"
		}).done(function(e) {
			finishedRequests++;
			if(!requireFinishAll && typeof e.entities != "undefined") {
				callback(e.entities);
			} else {
				if(typeof e.entities != "undefined") {
					allResults = mergeResults(e.entities, allResults);
				}
				if(numberOfRequests <= finishedRequests) {
					callback(allResults);
				}
			}
		}).fail(function(e) {
			if(typeof callbackEr != "undefined") callbackEr(e);
			console.error(e);
		});
		idsCopy = idsCopy.slice(50);
	}

	function mergeResults(resNew, resAll) {
		Object.keys(resNew).forEach(function(key) {
			resAll[key] = resNew[key];
		});
		return resAll;
	}
}
function parseUserInput() {
	elements = [];
	$.each($("#commands").val().split("\n"), function(a, b) {
		b = b.replace(/ /, "");
		if(/^Q[0-9]+$/.test(b)) {
			elements.push(b);
		} else {
			console.warn("Invalid user input");
		}
	});
	return elements;
}
function wdDisplayAlias(alias) {
	return `<span class="bubble">${alias.language}</span> ${alias.value}`;
}
function wdDisplaySitelink(sitelink) {
	if(sitelink.site == "commonswiki") {
		return getLink(`commons.wikimedia.org`);
	} else if(sitelink.site.match(/^(.{2,})wiki$/) != null) { // wikipedia

		var matches = sitelink.site.match(/^(.{2,})wiki$/);
		return getLinkExplore(`${matches[1]}`);
		//return getLink(`${matches[1]}.wikipedia.org`);

	} else if(sitelink.site.match(/^(.{2,})(wikibooks|wikinews|wikiquote|wikisource|wikivoyage)$/) != null) {
		var matches = sitelink.site.match(/^(.{2,})(wikibooks|wikinews|wikiquote|wikisource|wikivoyage)$/);
		return getLink(`${matches[1]}.${matches[2]}.org`);		
	} else {
		// @TODO: Fix
		console.warn(`Unknown site ${sitelink.site}`);
		return getLink("example.org");
	}


	function getLinkExplore( l ) {
    //console.log( l );
    //language = l;
		return `<a href="javascript:void(0)" onclick="gotoTitle( &quot;${_e(sitelink.title)}&quot;)" title="${_e(sitelink.title)}"><span class="bubble">${l}</span> &nbsp; ${_e(sitelink.title)}</a>`;
	}

	function getLink(host) {
		return `<a href="https://${host}/wiki/${encodeURIComponent(sitelink.title)}" target="_blank">${sitelink.site} <small>(${_e(sitelink.title)})</small></a>`;
	}
}

function wdDisplayValue(claim) {

	if(claim.mainsnak.snaktype == "somevalue") {
		return $(`<i class="snak-somevalue">Some value</i>`);
	} else if(claim.mainsnak.snaktype == "novalue") {
		return $(`<i class="snak-novalue">No value</i>`);
	} else if(claim.mainsnak.snaktype == "value") {

		if(typeof claim.mainsnak.datatype == "undefined") {
			console.warn(`Errornous mainsnak ${claim.mainsnak}`, claim);
			return $(`<i class="snak-errornous">Errornous</i>`);
		} else if(claim.mainsnak.datatype == "commonsMedia") {


      // check media type
      //console.log( `${_e(claim.mainsnak.datavalue.value)}` );
      let filename = `${_e(claim.mainsnak.datavalue.value)}` || '';
      let filetype = filename.split('.').pop().toLowerCase();
      //console.log( filetype );
      let media =  'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent( `${_e(claim.mainsnak.datavalue.value)}` );
      //let media2 =  'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent( `${_e(claim.mainsnak.datavalue.value)}` ).replace( "%27s");
      //media = media.replace("'", "%27s");
      // FIXME: files with single-quotes don't load in the LightBox, why?
      // ' --> %27s
      // example: https://conze.pt/app/compare/?r&lang=en&i=Q179333,Q749577
      //console.log( media + '?width=700px' );

      // https://commons.wikimedia.org/wiki/Commons:File_types
      // TODO: .pdf, .djvu, .map, .tab, 

      if ( filetype.match(/^(ogg|mp3)$/)) {
        return '<audio controls><source src="' + media + '"> </audio>';
      }
      if ( filetype.match(/^(ogv|webm)$/)) {
        if ( filetype === 'ogv'){
          filetype = 'ogg';
        }
        return '<video width="320" height="240" controls> <source src="' + media + '" type="video/'+filetype+'"></video>';
      }
      else {

        //var img_url_thumb =  ki/Special:FilePath/' + encodeURIComponent( `${_e(claim.mainsnak.datavalue.value)}` ) + '?width=300px';
        //var img_url_large =  'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent( `${_e(claim.mainsnak.datavalue.value)}` ) + '?width=700px';
        return $(`<a class="elem" href="${media}?width=700px" target="_blank" data-lcl-txt=""><img class="enlargable" src="${media}?width=300px"></a>`);
      }


			//return $(`<a href="https://commons.wikimedia.org/wiki/File:${_e(claim.mainsnak.datavalue.value)}" target="_blank"><img class="enlargable" src="${ img_url }"></a>`);

		} else if(claim.mainsnak.datatype == "external-id") {

      // GBIF occurence map
      if ( claim.mainsnak.property === 'P846' ) {

        return '<gbif-map style="resize: both; overflow: auto; width:100%;height:' + '400px' + ';" gbif-id="' + _e(claim.mainsnak.datavalue.value)  + '" gbif-title="" gbif-style="scaled.circles" center-latitude="30.0" center-longitude="13.6" controls ></gbif-map>';

      }
      else {

			  return $(`<span>${_e(claim.mainsnak.datavalue.value)}</span>`);

      }

		} else if(claim.mainsnak.datatype == "globe-coordinate") {
			return $(`<span>${_e(`${claim.mainsnak.datavalue.value.latitude},${claim.mainsnak.datavalue.value.longitude}`)}</span>`);
		} else if(claim.mainsnak.datatype == "monolingualtext") {
			return $(`<span>${_e(claim.mainsnak.datavalue.value.text)} <small>(${_e(claim.mainsnak.datavalue.value.language)})</small></span>`);
		} else if(claim.mainsnak.datatype == "quantity") {

			// @TODO: Get display name
			if( claim.mainsnak.datavalue.value.unit.startsWith("http://www.wikidata.org/entity/") ) {

				var wdId = claim.mainsnak.datavalue.value.unit.replace("http://www.wikidata.org/entity/", "");

				var out = $(`<span>${_e(claim.mainsnak.datavalue.value.amount)} <small>(<a href="javascript:void(0)" onclick="gotoArticle()" title="${wdId}" data-wdid="${wdId}">${_e(wdId)}</a>)</small></span>`);
				//var out = $(`<span>${_e(claim.mainsnak.datavalue.value.amount)} <small>(<a href="https://www.wikidata.org/wiki/${_e(wdId)}" target="_blank" title="${wdId}" data-wdid="${wdId}">${_e(wdId)}</a>)</small></span>`);
				labelLoader.enqueueAndReplace(wdId, out.find("small a").toArray(), null);
				return out;
			} else {
				if(claim.mainsnak.datavalue.value.unit == "1") {
					return $(`<span>${_e(claim.mainsnak.datavalue.value.amount)}</span>`);
				} else {
					return $(`<span>${_e(claim.mainsnak.datavalue.value.amount)} <small>(${claim.mainsnak.datavalue.value.unit})</small></span>`);
				}
			}
		} else if(claim.mainsnak.datatype == "string") {

			return $(`<span>${_e(claim.mainsnak.datavalue.value)}</span>`);

		} else if(claim.mainsnak.datatype == "time") {

			return $(`<span>${_e(`${claim.mainsnak.datavalue.value.time}/${claim.mainsnak.datavalue.value.precision}`)}</span>`);

		} else if(claim.mainsnak.datatype == "url") {

			return $(`<a href="${_e(claim.mainsnak.datavalue.value)}" target="_blank">${_e(claim.mainsnak.datavalue.value)}</a>`);

		} else if(claim.mainsnak.datatype == "wikibase-property") {

			var wdId = claim.mainsnak.datavalue.value.id;

			var out = $(`<a href="https://www.wikidata.org/wiki/Property:${_e(wdId)}" target="_blank" title="${_e(wdId)}">${Ui.getIdLabel(wdId, null)}</a>`);

			labelLoader.enqueueAndReplace(wdId, out.find(".idlabel").toArray(), null);
			return out;

		} else if(claim.mainsnak.datatype == "wikibase-item") {

			var wdId = claim.mainsnak.datavalue.value.id;

			var out = $(`<a href="javascript:void(0)" onclick="gotoWikipediaQid( &quot;${_e(wdId)}&quot; )" title="${_e(wdId)}">${Ui.getIdLabel(wdId, null)}</a>`);


			//var out = $(`<a href="https://www.wikidata.org/wiki/${_e(wdId)}" target="_blank" title="${_e(wdId)}">${Ui.getIdLabel(wdId, null)}</a> &nbsp; <a href="https://conze.pt/explore/${Ui.getIdName(wdId, null)}" target="_blank"> <i class="fas fa-retweet"></i> </a>`);

			labelLoader.enqueueAndReplace(wdId, out.find(".idlabel").toArray(), null);
			return out;
		} else {
			console.warn(`Unknown datatype ${claim.mainsnak.datatype}`, claim);
			return $(`<i>Present</i>`);
		}
	} else {
		console.warn(`Unknown snaktype ${claim.snaktype}`, claim);
		return $(`<i>Unknown snaktype</i>`);
	}
}


function gotoWikipediaQid( qid ) {

  if ( window.location !== window.parent.location ) { // embedded in an iframe

    //console.log( qid );
    window.parent.postMessage({ event_id: 'handleClick', data: { type: 'wikipedia-qid', title: '', hash: '', language: language, qid: qid, ids: '' } }, '*');

  }

}

function gotoTitle( title ) {

  console.log( title );

 	window.parent.postMessage({ event_id: 'handleClick', data: { type: 'wikipedia', title: title, hash: '', language: language, qid: '', ids: '' } }, '*');
	//parentref.postMessage({ event_id: 'handleClick', data: { type: 'wikipedia', title: title, hash: '', language: language, } }, '*' );

}
