// 1) run as: node wikidata2fields.js > /tmp/new_fields.txt
// 2) then include "/tmp/new_fields.txt" into fields.js
// 3) upgrade version
// 4) npm run build

const fs    = require('fs');
const path  = require('path');

let uniq = [];

// get existing fields: grep 'prop: ' fields.js | grep -v "prop: '0'" | grep -v "prop: ''" | sed 's/prop: //' | sed 's/ \+/ /g' | sed "s/'//g" | tr -d '\n' | less
// UPDATE this existing field list as required, before running this script.
const existing_fields = [
  18, 18, 154, 158, 1442, 1944, 1621, 242, 3311, 5555, 1766, 1801, 5775, 15, 2713, 207, 2425, 2716, 2910, 4291, 3383, 1846, 1943, 1543, 94, 8224, 948, 14, 10, 591, 638, 705, 953, 699, 213, 1451, 5305, 233, 17, 297, 298, 402, 957, 212, 818, 1421, 246, 1086, 289, 3716, 97, 1225, 7902, 2671, 6262, 932, 3181, 6179, 245, 650, 350, 7444, 7831, 452, 1278, 9088, 846, 356, 1662, 1154, 1153, 1156, 238, 569, 570, 576, 585, 571, 577, 51, 85, 2534, 274, 1082, 2048, 2043, 2044, 1081, 2139, 2226, 5810, 1813, 2437, 1128, 2124, 2196, 1174, 1661, 2047, 2257, 2896, 1436, 3872, 2250, 2812, 894, 1556, 4955, 3285, 549, 5088, 5559, 8101, 2456, 8978, 8926, 4011, 4012, 6611, 968, 4033, 1581, 1019, 856, 8768, 8934, 1343, 973, 825, 2975, 141, 1441, 509, 1196, 9151, 2037, 9100, 1324, 2078, 1963, 1036, 1149, 236, 7859, 2689, 1628, 2888, 1709, 4900, 5437, 227, 214, 2002, 8672, 2013, 3836, 3984, 3984, 662, 235, 685, 1144, 494, 1461, 715, 1402, 22, 25, 136, 50, 170, 178, 176, 279, 495, 31, 61, 138, 941, 128, 937, 551, 6153, 800, 9714, 1420, 793, 1346, 166, 1411, 1344, 710, 1923, 108, 512, 69, 1066, 184, 123, 144, 1269, 366, 2283, 4510, 1535, 1659, 3780, 3781, 2341, 703, 828, 1542, 84, 149, 610, 35, 1313, 1906, 1304, 190, 36, 1376, 47, 131, 172, 150, 122, 2354, 37, 2936, 2579, 81, 2789, 1056, 159, 264, 1716, 749, 355, 7959, 1013, 2184, 9736, 1584, 4701, 5059, 195, 6379, 195, 1323, 7213, 8707, 2949, 724, 2034, 6366, 3827, 1050, 4327, 8408, 5036, 5473, 5299, 842, 7554, 1482, 3417, 996, 2397, 4419, 8964, 247, 59, 3134, 9157, 8714, 3031, 6061, 815, 961, 4301, 850, 3444, 5200, 5257, 2026, 2426, 6105, 2464, 962, 1391, 6101, 5315, 5125, 16, 4467, 2612, 8060, 2088, 2087, 2327, 1303, 2348, 2408, 140, 9680, 500, 501, 194, 1142, 1387, 102, 5832, 530, 2868, 2596, 2860, 463, 945, 1416, 1268, 2390, 8167, 631, 88, 137, 658, 676, 483, 6116, 175, 57, 1037, 162, 127, 457, 112, 169, 3320, 3450, 6087, 286, 3342, 1454, 1001, 8402, 485, 1151, 8625, 1699, 397, 398, 3083, 5736, 8168, 2167, 680, 681, 3432, 682, 689, 686, 684, 688, 702, 1057, 7704, 1014, 1729, 1728, 6217, 6361, 6839, 4354, 1417, 9526, 5199, 3634, 9061, 8960, 8948, 3040, 2207, 2205, 1902, 3192, 434, 435, 436, 839, 2338, 4097, 345, 1712, 921, 910, 4224, 971, 4195, 3876, 1629, 747, 1811, 9241, 200, 201, 4614, 974, 5998, 403, 1546, 4743, 9030, 155, 156, 1398, 737, 39, 241, 410, 3095, 1552, 1889, 5004, 607, 2950, 180, 101, 674, 840, 2410, 3937, 665, 2175, 1820, 533, 8744, 2633, 706, 7153, 177, 360, 7726, 1568, 186, 4330, 1672, 460, 189, 826, 361, 527, 2670, 86, 4238, 8933, 935, 373, 830, 974, 496, 2477, 4138, 3966, 277, 171, 106, 648, 3847, 3388, 683, 1394, 1627, 5191, 2192, 2355, 4150, 6108, 4640, 4291, 1947, 3151, 7471, 7085, 8711, 1899, 3929, 1816, 9131, 9322, 9300, 9686, 400, 275, 3931, 6216, 135, 135, 53, 40, 3373, 26, 451, 1038, 1327, 5777, 414, 7764
];

/* get property data ('en' only at first), download in non-verbose JSON format (save as "data.json") from:

  See also:
    https://rawgit.com/johnsamuelwrites/wdprop/master/datatypes.html
    https://query.wikidata.org

    SELECT DISTINCT ?property ?propertyType ?propertyLabel ?propertyDescription ?propertyAltLabel ?formatterURL WHERE {
      ?property wikibase:propertyType ?propertyType .

      OPTIONAL  { ?property wdt:P1630 ?formatterURL; }
                         
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    }
    ORDER BY ASC(xsd:integer(STRAFTER(STR(?property), 'P')))

*/

const data = fs.readFileSync(path.resolve(__dirname, 'wikidata_properties.json'));

const new_fields  = JSON.parse(data);

new_fields.forEach(( f ) => {

  f.property      = parseInt( f.property.replace( 'http://www.wikidata.org/entity/P', '' ) );
  f.propertyType  = f.propertyType.replace( 'http://wikiba.se/ontology#', '' );
  f.propertyLabel  = f.propertyLabel
                      .replace( / ID$/, '' ).replace(' ID ', ' ')
                      .replace( / identifier$/, '' ).replace('  identifier ', ' ');

  //console.log( f.property, f.propertyType );

  //return 0;

  if ( ! existing_fields.includes( f.property ) ){ // only use the unused properties

    /*
    parse JSON data into a conzept fields:

      id:     propertyLabel -> convert to lowercase -> replace spaces with an underscore
      title:  'propertyLabel',
      prop:   propery -> remove 'wd:P' from string start
      type:   propertyType -> remove "wikibase:"
              - WikibaseItem
                - default to multi-value (manual check for single-value?)
              - 'ExternalId'
                - use urlFormat and id to fill in the url-value
                - default to single-value
              - Url
                - default to single-value
              - String
                - default to single-value
              - Quantity
                - default to single-value
              - GlobeCoordinate
                - default to single-value
              - CommonsMedia
                - default to single-value
      url:    '', (set when Url-type and )
      mv:     true | false (depends on type)
      icon:   'far fa-question-circle',
      text:   propertyLabel -> make an smart string-reduction function
      section:['main'], (if type === 'ExternalId' -> add section "library-identity")
      rank:   [ 15000 + id ], (if type === 'ExternalId' -> add rank 15000 + id )

    */

    let id      = '';
    let title   = '';
    let prop    = f.property;
    let type    = '';
    let mv      = 'true';
    let icon    = 'far fa-circle';
    let text    = '';
    let section = 'main';
    let rank    = '';


    /*
    if ( f.propertyType === 'WikibaseItem' ){

      //console.log( f );

      id      = cleanseString( f.propertyLabel.replace(/ /g, '_') ).toLowerCase();
      title   = capitalizeFirstLetter( cleanseString( f.propertyLabel ) );
      prop    = f.property;
      type    = 'wikipedia-qid';
      mv      = 'true';
      icon    = 'far fa-circle';
      text    = cleanseString( f.propertyLabel.split(' ').splice(0,4).join(' ') );
      section = 'main';
      rank    = 50000 + f.property;

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
    */

    if ( f.propertyType === 'Url' ){

      console.log( f.propertyType );

    }

    /*
    if ( f.propertyType === 'ExternalId' ){


      //console.log('ExternalId');

      id          = cleanseString( f.propertyLabel.replace(/ |,/g, '_') ).toLowerCase();
      title       = capitalizeFirstLetter( cleanseString( f.propertyLabel ) );
      prop        = f.property;
      type        = 'url';
      mv          = 'false';

      url_format  = f.formatterURL || '';
      url_format  = url_format.replace(/\'/g, '%27');

      url         = '';
      icon        = 'oma oma-black-card-index-dividers';
      text        = cleanseString( f.propertyLabel.split(' ').splice(0,4).join(' ') );
      section     = 'library-identity';
      rank        = 20000 + f.property;


      if ( uniq.includes( id ) ){

        //console.log('duplicate key: ', id );

        return 0;

      }
      else {

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
    */

  }

});


function cleanseString(string) {
  return string.replace(/'|"|`|\./g, '');
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// insert these new into fields.js

//console.log( 'total new fields: ', new_fields.length );

/* 
 Open questions:
  * How to use the propertyLabel translations for all available languages?
  * How to reduce the title-string for these translations for the icon-text? (as there is not much space with the icons)
  * How to choose better icons?
  * How to detect if the link-URL could be embedded?
  * fix ID-field-links with: url: '' // todo 

*/
