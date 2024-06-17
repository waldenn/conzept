const code    = getParameterByName('code') || '';
let language  = getParameterByName('l') || 'en';

valid_languages = [ 'en', 'es', 'zh' ];

if ( !valid_languages.includes( language ) ){

	language = 'en';

}

let json = '';

async function init(){

	const url = '/app/cors/raw/?url=' + encodeURIComponent( 'https://sky.esa.int/esasky-tap/generalresolver?action=bytarget&target=' + code );

  let response = await fetch( url );

  json = await response.text();
  json = JSON.parse( json );

	//console.log( json.simbadResult );

	if ( valid( json?.simbadResult?.simbadMainId ) ){

		//console.log( json.simbadResult.simbadMainId );

		const target_x			= valid( json.simbadResult.simbadRaDeg )? json.simbadResult.simbadRaDeg : '';
		const target_y			= valid( json.simbadResult.userDecDeg )? json.simbadResult.userDecDeg : '';
		const field_of_view = valid( json.simbadResult.foVDeg )? json.simbadResult.foVDeg : '';
		const cooframe			= valid( json.simbadResult.simbadCooFrame )? json.simbadResult.simbadCooFrame : '';

		window.location.href = `https://sky.esa.int/esasky/?target=${target_x}%20${target_y}&hips=DSS2+color&fov=${field_of_view}&cooframe=${cooframe}&sci=true&lang=${language}`;

	}

}

if ( valid( code ) ){
  console.log( code );
  init();
}
