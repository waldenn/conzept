// generate the main HTML-structure for each topic-card section

function createSectionDOM(){

  const section_names = Object.entries( sections );

  // for each root-section
  for ( var i = 0; i < section_names.length; i++ ){

    const sid	= section_names[i][0];
    const s  	= section_names[i][1];

    const hide_style = valid( s.hide ) ? 'display:none;' : '';

    let level = 0;

    if ( valid( s.sub ) ){ // found sub-section(s)

      // create a DOM-structure (with an element ID)
      explore.section_dom.append( '<div style="' + hide_style + '"><details style="' + hide_style + '"><summary><span class="section" id="app-section-' + sid + '">' + sid + '</span></summary><span id="section-' + sid + '" class="indent2"></span></details></div>');

      level = 1;

      // recursively add sub-sections
      processSubSections( level, s.sub, sid );

    }
    else { // leaf-section

      // create a DOM-structure (with an element ID)
      explore.section_dom.append( '<div style="' + hide_style + '"><details style="' + hide_style + '"><summary><span class="section" id="app-section-' + sid + '">' + sid + '</span></summary><span id="section-' + sid + '" class="indent2 grid"></span></details></div>');

    }

    explore.sections[ sid ] = [];

  }

  //console.log( explore.sections  );

}

async function processSubSections( level, s, sid ){

	Object.keys( s ).forEach( ( key, index ) => {

    const hide_style = valid( s[key].hide ) ? 'display:none;' : '';
    //console.log( key, s[key].hide, hide_style );

    //console.log( key, index );

    const icon = valid( s[key].icon )? '<i class="section-icon ' + s[key].icon + '"></i> ' : '';

    //console.log( key, icon );

		if ( valid( s[key].sub ) ){ // branching-section

			explore.section_dom.find( '#section-' + sid ).append( '<div style="' + hide_style + '"><details style="' + hide_style + '"><summary>' + icon + '<span class="section" id="app-section-' + key + '" class="indent2">' + key + '</span></summary><span id="section-' + key + '" class="indent2"></span></details></div>');

      // recursively check if there are more sub-sections
			level += 1;
			sid = key; // new parent-id

			processSubSections( level, s[key].sub, sid );

		}
		else { // leaf-section 

			explore.section_dom.find( '#section-' + sid ).append( '<div style="' + hide_style + '"><details style="' + hide_style + '"><summary>' + icon + '<span class="section" id="app-section-' + key + '" class="indent2 grid">' + key + '</span></summary><span id="section-' + key + '" class="indent2 grid"></span></details></div>');

      explore.sections[ key ] = [];

		}

	});

  explore.sections[ sid ] = [];

}
