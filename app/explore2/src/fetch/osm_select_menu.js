async function insertSelectMenuOSM( args, fields ){

  let html = '<ul class="multi-value"><li><select class="mv-select" name="' + args.target + '">' + explore.osm_tag_options + '</select></li></ul>'; 

  let sel = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';

  $( sel ).html( html );

  const s2 = 'select[name ="' + args.target + '"]';

  // see: https://select2.org/configuration/options-api
  $( s2 ).select2({

    dropdownPosition: 'below', // see library-extension here: https://jsfiddle.net/byxj73ov/ and https://jsfiddle.net/byxj73ov/ 
    width: '95%',
    //escapeMarkup: function (markup) { return markup; },

  });

  $( s2 ).on('select2:select', function(e) {
    
    let data	= e.params.data;

    let tag		= '"' + data.id.replace('=','"="') + '"';
    tag				= encodeURIComponent( tag );

    let area	= 3600000000 + parseInt( fields.replace('osm:','') );

    let url = '/app/overpass/map.html?t=' + args.topic + ' : ' +  data.id.replace('=',' : ').replace('_', ' ') + '&Q=[out%3Ajson][timeout%3A50]%3B%0Aarea(' + area + ')-%3E.searchArea%3B%0A(%0A%20%20node[' + tag + '](area.searchArea)%3B%0A%20%20way[' + tag + '](area.searchArea)%3B%0A%20%20relation[' + tag + '](area.searchArea)%3B%0A)%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B'

    handleClick({ 
      id        : 'n1-0',
      type      : 'link',
      title     : args.topic,
      language  : explore.language,
      qid       : '',
      url       : encodeURI( url ),
      tag       : '',
      languages : '',
      custom    : '',
    });

  });

}
