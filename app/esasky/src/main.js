let code     	= getParameterByName('code') || '';
let language 	= getParameterByName('l') || 'en';

const valid_languages = [ 'en', 'es', 'zh' ];

code  = code.replace(/[\[\]]/g, '').trim();

if ( valid( code ) ){

  if ( !valid_languages.includes( language ) ){ // unsupported language

    language = 'en'; // fallback language

  }

  init();

}
else {

  $('body').append( `<div class="error">"code" parameter is required</div>` );

}

async function init(){

	const url = '/app/cors/raw/?url=' + encodeURIComponent( 'https://sky.esa.int/esasky-tap/generalresolver?action=bytarget&target=' + code );

  const response = await fetch( url );

  let json  = await response.text();

	try {
  	json = JSON.parse( json );

		if ( valid( json?.simbadResult?.simbadMainId ) ){

    	const d = json.simbadResult;

			const target_x			= valid( d.simbadRaDeg )? d.simbadRaDeg : '';
			const target_y			= valid( d.userDecDeg )? d.userDecDeg : '';
			const field_of_view = valid( d.foVDeg )? d.foVDeg : '';
			const cooframe			= valid( d.simbadCooFrame )? d.simbadCooFrame : '';

			window.location.href = `https://sky.esa.int/esasky/?target=${target_x}%20${target_y}&hips=DSS2+color&fov=${field_of_view}&cooframe=${cooframe}&sci=true&lang=${language}`;

		}
  	else { // show an error message

    	$('body').append( `<div class="error">No ESASky results found for: "${code}"</div>` );

  	}

	}
	catch (error) {

 		$('body').append( `<div class="error">No ESASky results found for: "${code}"</div>` );
    
	}

}
