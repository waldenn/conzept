/*
 See documentation: https://conze.pt/guide/adding_new_wikidata_properties

 Command structure: node json2fields.js “[PROPERTIES-FILE.json]” [PROPERTY-CLASS] > /tmp/output.txt
 Command example  : node json2fields.js "wikidata_properties.json" WikibaseItem > /tmp/new_fields.txt
*/

const fs    = require('fs');
const path  = require('path');
const data  = fs.readFileSync(path.resolve(__dirname, 'wikidata_properties.json'));

const fields = require('../src/data/fields.js');

if ( process.argv.length < 4 ){

  console.log( 'Run as: node json2fields.js "[PROPERTIES-FILE.json]" [PROPERTY-CLASS] > /tmp/output.txt' );
  console.log( 'Example: node json2fields.js "wikidata_properties.json" WikibaseItem > /tmp/new_fields.txt' );

  return;
}

const property_class    = process.argv[3];

let ignore_props        = [ 432, 1424, 1629, 2667, 4329 ]; // These Wikidata properties are not usefull for Conzept.
let ignore_claim_props  = [ 85, 9680 ]; // These Wikidata properties are not usefull untill Conzept supports statement claims.
let existing_props      = [];

Object.values( conzept_fields ).forEach(( f ) => {

  existing_props.push( parseInt( f.prop ));

});

const existing_fields = unique( existing_props ).concat( ignore_props, ignore_claim_props ) ;

let uniq = [];

const new_fields  = JSON.parse( data );

new_fields.results.bindings.forEach(( f ) => {

  f.property.value      = parseInt( f.property.value.replace( 'http://www.wikidata.org/entity/P', '' ) );
  f.propertyType.value  = f.propertyType.value.replace( 'http://wikiba.se/ontology#', '' );
  f.propertyLabel.value = f.propertyLabel.value
                      .replace( / ID$/, '' ).replace(' ID ', ' ')
                      .replace( / identifier$/, '' ).replace('  identifier ', ' ');

  if ( property_class !== f.propertyType.value ){ // skip other types

    return 0;

  }

  // parse JSON data into a conzept fields:
  if ( ! existing_fields.includes( f.property.value ) ){ // only use the unused properties

    let id      = '';
    let title   = '';
    let prop    = f.property.value;
    let type    = '';
    let mv      = true;
    let icon    = 'far fa-circle';
    let text    = '';
    let section = 'main';
    let rank    = '';

    if ( f.propertyType.value === 'WikibaseItem' ){

      id      = cleanseString( f.propertyLabel.value.replace(/ /g, '_') ).toLowerCase();
      title   = capitalizeFirstLetter( cleanseString( f.propertyLabel.value ) );
      prop    = f.property.value;
      type    = 'wikipedia-qid';
      mv      = true;
      icon    = 'far fa-circle';
      text    = cleanseString( f.propertyLabel.value.split(' ').splice(0,4).join(' ') );
      section = 'main';
      rank    = 50000 + f.property.value;

      console.log(
`'${id}' : {
  title: '${title}',
  prop: '${prop}',
  type: '${type}',
  mv: ${mv},
  icon: '${icon}',
  text: '${text}',
  section: ['${section}'],
  rank: [${rank}],
  auto: true,
},
`
      );

    }

    if ( f.propertyType.value === 'Url' ){

      id          = cleanseString( f.propertyLabel.value.replace(/ |,/g, '_') ).toLowerCase();
      title       = capitalizeFirstLetter( cleanseString( f.propertyLabel.value ) );
      prop        = f.property.value;
      type        = 'url';
      mv          = false;
      url         = 'item.' + id; // '${Xvalue}';
      icon        = 'fas fa-link';
      text        = cleanseString( f.propertyLabel.value.split(' ').splice(0,4).join(' ') );
      section     = 'main';
      rank        = 90000 + f.property.value;

      if ( uniq.includes( id ) ){ return 0; } else {

       uniq.push( id );

      }

      console.log(
`'${id}' : {
  title: '${title}',
  prop: '${prop}',
  type: '${type}',
  mv: ${mv},
  url: '\${ ${url} }',
  icon: '${icon}',
  text: '${text}',
  section: ['${section}'],
  rank: [${rank}],
  auto: true,
},
`
      );

    }

    else if ( f.propertyType.value === 'GlobeCoordinate' ){

      //console.log( f );

      id          = cleanseString( f.propertyLabel.value.replace(/ |,/g, '_') ).toLowerCase();
      title       = capitalizeFirstLetter( cleanseString( f.propertyLabel.value ) );
      prop        = f.property.value;
      type        = 'coordinate';
      mv          = true;
      url         = '${Xvalue}';
      icon        = 'fas fa-map-pin';
      text        = cleanseString( f.propertyLabel.value.split(' ').splice(0,4).join(' ') );
      section     = 'main';
      rank        = 40000 + f.property.value;

      if ( uniq.includes( id ) ){ return 0; } else {

       uniq.push( id );

      }

      console.log(
`'${id}' : {
  render_condition: false,
  title: '${title}',
  prop: '${prop}',
  type: '${type}',
  mv: true,
  url: '\${Xvalue}',
  icon: '${icon}',
  text: '${text}',
  section: ['${section}'],
  rank: [${rank}],
  auto: true,
},
`
      );

    }

    else if ( f.propertyType.value === 'CommonsMedia' ){

      id          = cleanseString( f.propertyLabel.value.replace(/ |,/g, '_') ).toLowerCase();
      title       = capitalizeFirstLetter( cleanseString( f.propertyLabel.value ) );
      prop        = f.property.value;
      type        = 'coordinate';
      mv          = 'true';
      url         = '${Xvalue}';
      icon        = 'fas fa-map-pin';
      text        = cleanseString( f.propertyLabel.value.split(' ').splice(0,4).join(' ') );
      section     = 'main';
      rank        = 40000 + f.property.value;

      if ( uniq.includes( id ) ){ return 0; } else {

       uniq.push( id );

      }

      console.log(
`'${id}' : {
  render_condition: false,
  title: '${title}',
  prop: '${prop}',
  type: '${type}',
  mv: true,
  url: '\${Xvalue}',
  icon: '${icon}',
  text: '${text}',
  section: ['${section}'],
  rank: [${rank}],
  auto: true,
},
`
      );

    }

    else if ( f.propertyType.value === 'String' ){

      id          = cleanseString( f.propertyLabel.value.replace(/ |,/g, '_') ).toLowerCase();
      title       = capitalizeFirstLetter( cleanseString( f.propertyLabel.value ) );
      prop        = f.property.value;
      type        = 'symbol-string',
      mv          = false,
      url         = '';
      icon        = '';
      text        = cleanseString( f.propertyLabel.value.split(' ').splice(0,4).join(' ') );
      section     = 'info';
      rank        = 300000 + f.property.value;

      if ( uniq.includes( id ) ){ return 0; } else {

       uniq.push( id );

      }

      console.log(
`'${id}' : {
  title: '${title}',
  prop: '${prop}',
  type: '${type}',
  mv: ${mv},
  url: '${url}',
  icon: '${icon}',
  text: '${text}',
  section: '${section}',
  rank: '${rank}',
  auto: true,
},
`
      );


    }

    else if ( f.propertyType.value === 'Quantity' ){

      id          = cleanseString( f.propertyLabel.value.replace(/ |,/g, '_') ).toLowerCase();
      title       = capitalizeFirstLetter( cleanseString( f.propertyLabel.value ) );
      prop        = f.property.value;
      type        = 'symbol-number',
      mv          = false,
      url         = '';
      icon        = '';
      text        = cleanseString( f.propertyLabel.value.split(' ').splice(0,4).join(' ') );
      section     = 'info';
      rank        = 200000 + f.property.value;

      if ( uniq.includes( id ) ){ return 0; } else {

       uniq.push( id );

      }

      console.log(
`'${id}' : {
  title: '${title}',
  prop: '${prop}',
  type: '${type}',
  mv: ${mv},
  url: '${url}',
  icon: '${icon}',
  text: '${text}',
  section: '${section}',
  rank: '${rank}',
  auto: true,
},
`
      );

    }

    else if ( f.propertyType.value === 'ExternalId' ){

      id          = cleanseString( f.propertyLabel.value.replace(/ |,/g, '_') ).toLowerCase();
      title       = capitalizeFirstLetter( cleanseString( f.propertyLabel.value ) );
      prop        = f.property.value;
      type        = 'url';
      mv          = 'false';

      url_format  = f.formatterURL?.value || '';
      url_format  = url_format.replace(/\'/g, '%27');

      url         = '';
      icon        = 'far fa-square';
      text        = cleanseString( f.propertyLabel.value.split(' ').splice(0,4).join(' ') );
      section     = 'library-identity';
      rank        = 20000 + f.property.value;


      if ( uniq.includes( id ) ){ return 0; } else {

       uniq.push( id );

      }

      if ( url_format === '' && url === '' ){ // this is an identifier-code-string (should be linked manually)

        console.log(
`'${id}' : {
  render_condition: false,
  title: '${title}',
  prop: '${prop}',
  type: '',
  mv: true,
  url_format: '${url_format}',
  url: '${url}', // TODO
  icon: '${icon}',
  text: '${text}',
  section: ['${section}'],
  rank: [${rank}],
  auto: true,
},
`
        );

      }
      else {

        console.log(
`'${id}' : {
  title: '${title}',
  prop: '${prop}',
  type: '${type}',
  mv: ${mv},
  url_format: '${url_format}',
  url: '${url}',
  icon: '${icon}',
  text: '${text}',
  section: ['${section}'],
  rank: [${rank}],
  auto: true,
},
`
      );

      }

    }

  }

});

function cleanseString(string) {
  return string.replace(/'|"|`|\./g, '');
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function unique(arr) {

  const u = {}, a = [];

  for ( let i = 0, l = arr.length; i < l; ++i){

    if ( ! u.hasOwnProperty( arr[i] ) ) {

      a.push( arr[i] );

      u[ arr[i] ] = 1;

    }

  }

  return a;
}
