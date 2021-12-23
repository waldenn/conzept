const osm_tags = [

  /*
  {
    "item": "Q214833",
    "label": "four-wheel drive",
    "value": "Key:4wd_only"
  },
  {
    "item": "P1216",
    "label": "National Heritage List for England number",
    "value": "Key:HE_ref"
  },
  {
    "item": "P300",
    "label": "ISO 3166-2 code",
    "value": "Key:ISO3166-2"
  },
  {
    "item": "Q63065035",
    "label": "abandoned",
    "value": "Key:abandoned:"
  },
  {
    "item": "Q81068910",
    "label": "COVID-19 pandemic",
    "value": "Key:access:covid19"
  },
  {
    "item": "Q319608",
    "label": "postal address",
    "value": "Key:addr"
  },
  {
    "item": "P4856",
    "label": "conscription number",
    "value": "Key:addr:conscriptionnumber"
  },
  {
    "item": "Q877895",
    "label": "conscription number",
    "value": "Key:addr:conscriptionnumber"
  },
  {
    "item": "P17",
    "label": "country",
    "value": "Key:addr:country"
  },
  {
    "item": "Q358378",
    "label": "house name",
    "value": "Key:addr:housename"
  },
  {
    "item": "P670",
    "label": "street number",
    "value": "Key:addr:housenumber"
  },
  {
    "item": "P281",
    "label": "postal code",
    "value": "Key:addr:postcode"
  },
  {
    "item": "Q19376249",
    "label": "provisional house number",
    "value": "Key:addr:provisionalnumber"
  },
  {
    "item": "Q79007",
    "label": "street",
    "value": "Key:addr:street"
  },
  {
    "item": "Q1640962",
    "label": "street or road name",
    "value": "Key:addr:street"
  },
  {
    "item": "P669",
    "label": "located on street",
    "value": "Key:addr:street"
  },
  {
    "item": "Q18915527",
    "label": "street number",
    "value": "Key:addr:streetnumber"
  },
  {
    "item": "P670",
    "label": "street number",
    "value": "Key:addr:streetnumber"
  },
  {
    "item": "Q3491994",
    "label": "subdistrict",
    "value": "Key:addr:subdistrict"
  },
  {
    "item": "Q4057633",
    "label": "hierarchy of administrative territorial entities",
    "value": "Key:admin_level"
  },
  {
    "item": "Q37038",
    "label": "advertising",
    "value": "Key:advertising"
  },
  {
    "item": "Q1054650",
    "label": "cable transport",
    "value": "Key:aerialway"
  },
  {
    "item": "Q20977775",
    "label": "air transport infrastructure",
    "value": "Key:aeroway"
  },
  {
    "item": "Q97408605",
    "label": "agricultural motor vehicle",
    "value": "Key:agricultural"
  },
  {
    "item": "Q173725",
    "label": "air conditioning",
    "value": "Key:air_conditioning"
  },
  {
    "item": "P912",
    "label": "has facility",
    "value": "Key:amenity"
  },
  {
    "item": "Q13226383",
    "label": "facility",
    "value": "Key:amenity"
  },
  {
    "item": "Q42973",
    "label": "architect",
    "value": "Key:architect"
  },
  {
    "item": "Q42973",
    "label": "architect",
    "value": "Key:architect:wikidata"
  },
  {
    "item": "Q11500",
    "label": "area",
    "value": "Key:area"
  },
  {
    "item": "P170",
    "label": "creator",
    "value": "Key:artist:wikidata"
  },
  {
    "item": "Q483501",
    "label": "artist",
    "value": "Key:artist_name"
  },
  {
    "item": "Q1406161",
    "label": "artistic theme",
    "value": "Key:artwork_subject"
  },
  {
    "item": "Q210988",
    "label": "all-terrain vehicle",
    "value": "Key:atv"
  },
  {
    "item": "Q16938807",
    "label": "backwards",
    "value": "Key:backward"
  },
  {
    "item": "Q187456",
    "label": "bar",
    "value": "Key:bar"
  },
  {
    "item": "Q853185",
    "label": "barbecue grill",
    "value": "Key:barbecue_grill"
  },
  {
    "item": "Q264661",
    "label": "obstacle",
    "value": "Key:barrier"
  },
  {
    "item": "Q81715",
    "label": "barricade",
    "value": "Key:barrier"
  },
  {
    "item": "Q853185",
    "label": "barbecue grill",
    "value": "Key:bbq"
  },
  {
    "item": "Q1374561",
    "label": "B-Train",
    "value": "Key:bdouble"
  },
  {
    "item": "Q204776",
    "label": "bench",
    "value": "Key:bench"
  },
  {
    "item": "Q11442",
    "label": "bicycle",
    "value": "Key:bicycle"
  },
  {
    "item": "Q216530",
    "label": "waste container",
    "value": "Key:bin"
  },
  {
    "item": "Q35872",
    "label": "boat",
    "value": "Key:boat"
  },
  {
    "item": "Q1410110",
    "label": "branch",
    "value": "Key:branch"
  },
  {
    "item": "Q431289",
    "label": "brand",
    "value": "Key:brand"
  },
  {
    "item": "P1716",
    "label": "brand",
    "value": "Key:brand:wikidata"
  },
  {
    "item": "Q15075508",
    "label": "beer brand",
    "value": "Key:brewery"
  },
  {
    "item": "Q131734",
    "label": "brewery",
    "value": "Key:brewery"
  },
  {
    "item": "Q12280",
    "label": "bridge",
    "value": "Key:bridge"
  },
  {
    "item": "Q7814330",
    "label": "toll bridge",
    "value": "Key:bridge"
  },
  {
    "item": "Q17644823",
    "label": "bridge by structural type",
    "value": "Key:bridge:structure"
  },
  {
    "item": "Q41176",
    "label": "building",
    "value": "Key:building"
  },
  {
    "item": "P149",
    "label": "architectural style",
    "value": "Key:building:architecture"
  },
  {
    "item": "Q831691",
    "label": "storey",
    "value": "Key:building:levels"
  },
  {
    "item": "P1101",
    "label": "floors above ground",
    "value": "Key:building:levels"
  },
  {
    "item": "P186",
    "label": "material used",
    "value": "Key:building:material"
  },
  {
    "item": "Q66310902",
    "label": "buried here",
    "value": "Key:buried:wikidata"
  },
  {
    "item": "Q5638",
    "label": "bus",
    "value": "Key:bus"
  },
  {
    "item": "Q353659",
    "label": "call sign",
    "value": "Key:callsign"
  },
  {
    "item": "Q171529",
    "label": "canoe",
    "value": "Key:canoe"
  },
  {
    "item": "P1083",
    "label": "maximum capacity",
    "value": "Key:capacity"
  },
  {
    "item": "Q81068910",
    "label": "COVID-19 pandemic",
    "value": "Key:capacity:covid19"
  },
  {
    "item": "Q1306755",
    "label": "administrative centre",
    "value": "Key:capital"
  },
  {
    "item": "Q5119",
    "label": "capital",
    "value": "Key:capital"
  },
  {
    "item": "Q847201",
    "label": "carsharing",
    "value": "Key:car_sharing"
  },
  {
    "item": "Q216040",
    "label": "caravan",
    "value": "Key:caravan"
  },
  {
    "item": "Q319224",
    "label": "cargo",
    "value": "Key:cargo"
  },
  {
    "item": "Q235356",
    "label": "carriage",
    "value": "Key:carriage"
  },
  {
    "item": "Q1780834",
    "label": "changing table",
    "value": "Key:changing_table"
  },
  {
    "item": "P813",
    "label": "retrieved",
    "value": "Key:check_date"
  },
  {
    "item": "Q50231",
    "label": "administrative territorial entity of the People's Republic of China",
    "value": "Key:china_class"
  },
  {
    "item": "Q843905",
    "label": "circumference",
    "value": "Key:circumference"
  },
  {
    "item": "P2547",
    "label": "perimeter",
    "value": "Key:circumference"
  },
  {
    "item": "P1336",
    "label": "territory claimed by",
    "value": "Key:claimed_by"
  },
  {
    "item": "Q12334006",
    "label": "coach",
    "value": "Key:coach"
  },
  {
    "item": "Q1075",
    "label": "color",
    "value": "Key:colour"
  },
  {
    "item": "Q1141067",
    "label": "comment",
    "value": "Key:comment"
  },
  {
    "item": "Q875267",
    "label": "necessity and sufficiency",
    "value": "Key:conditional"
  },
  {
    "item": "Q12377751",
    "label": "under construction",
    "value": "Key:construction"
  },
  {
    "item": "Q12377751",
    "label": "under construction",
    "value": "Key:construction:building"
  },
  {
    "item": "Q2996679",
    "label": "contact information",
    "value": "Key:contact"
  },
  {
    "item": "P968",
    "label": "e-mail address",
    "value": "Key:contact:email"
  },
  {
    "item": "P2013",
    "label": "Facebook ID",
    "value": "Key:contact:facebook"
  },
  {
    "item": "Q355",
    "label": "Facebook",
    "value": "Key:contact:facebook"
  },
  {
    "item": "P2900",
    "label": "fax number",
    "value": "Key:contact:fax"
  },
  {
    "item": "P1968",
    "label": "Foursquare venue ID",
    "value": "Key:contact:foursquare"
  },
  {
    "item": "P2847",
    "label": "Google+ ID",
    "value": "Key:contact:google_plus"
  },
  {
    "item": "P2003",
    "label": "Instagram username",
    "value": "Key:contact:instagram"
  },
  {
    "item": "Q213660",
    "label": "LinkedIn",
    "value": "Key:contact:linkedin"
  },
  {
    "item": "P4033",
    "label": "Mastodon address",
    "value": "Key:contact:mastodon"
  },
  {
    "item": "Q214995",
    "label": "telephone number",
    "value": "Key:contact:phone"
  },
  {
    "item": "P1329",
    "label": "phone number",
    "value": "Key:contact:phone"
  },
  {
    "item": "P3836",
    "label": "Pinterest username",
    "value": "Key:contact:pinterest"
  },
  {
    "item": "P3789",
    "label": "Telegram username",
    "value": "Key:contact:telegram"
  },
  {
    "item": "P3134",
    "label": "TripAdvisor ID",
    "value": "Key:contact:tripadvisor"
  },
  {
    "item": "P2002",
    "label": "Twitter username",
    "value": "Key:contact:twitter"
  },
  {
    "item": "P4238",
    "label": "webcam page URL",
    "value": "Key:contact:webcam"
  },
  {
    "item": "P856",
    "label": "official website",
    "value": "Key:contact:website"
  },
  {
    "item": "P3108",
    "label": "Yelp ID",
    "value": "Key:contact:yelp"
  },
  {
    "item": "Q770135",
    "label": "conveyor belt",
    "value": "Key:conveying"
  },
  {
    "item": "P17",
    "label": "country",
    "value": "Key:country"
  },
  {
    "item": "Q64779666",
    "label": "sending state or organization",
    "value": "Key:country"
  },
  {
    "item": "Q2207288",
    "label": "craft",
    "value": "Key:craft"
  },
  {
    "item": "P101",
    "label": "field of work",
    "value": "Key:craft"
  },
  {
    "item": "Q98163019",
    "label": "OpenStreetMap editor",
    "value": "Key:created_by"
  },
  {
    "item": "Q235352",
    "label": "crop",
    "value": "Key:crop"
  },
  {
    "item": "Q62059481",
    "label": "crossing",
    "value": "Key:crossing"
  },
  {
    "item": "Q1778821",
    "label": "cuisine",
    "value": "Key:cuisine"
  },
  {
    "item": "P2012",
    "label": "cuisine",
    "value": "Key:cuisine"
  },
  {
    "item": "Q8142",
    "label": "currency",
    "value": "Key:currency"
  },
  {
    "item": "Q16068",
    "label": "Deutsche Mark",
    "value": "Key:currency:DEM"
  },
  {
    "item": "Q15377916",
    "label": "Dogecoin",
    "value": "Key:currency:DOGE"
  },
  {
    "item": "Q4916",
    "label": "euro",
    "value": "Key:currency:EUR"
  },
  {
    "item": "Q131473",
    "label": "Icelandic króna",
    "value": "Key:currency:ISK"
  },
  {
    "item": "Q8146",
    "label": "Japanese yen",
    "value": "Key:currency:JPY"
  },
  {
    "item": "Q4043030",
    "label": "Litecoin",
    "value": "Key:currency:LTC"
  },
  {
    "item": "Q41044",
    "label": "Russian ruble",
    "value": "Key:currency:RUB"
  },
  {
    "item": "Q4917",
    "label": "United States dollar",
    "value": "Key:currency:USD"
  },
  {
    "item": "Q131723",
    "label": "bitcoin",
    "value": "Key:currency:XBT"
  },
  {
    "item": "Q55290870",
    "label": "Tezos",
    "value": "Key:currency:XTZ"
  },
  {
    "item": "Q27148141",
    "label": "Zcash",
    "value": "Key:currency:ZEC"
  },
  {
    "item": "Q1308978",
    "label": "cut",
    "value": "Key:cutting"
  },
  {
    "item": "Q1249483",
    "label": "cyclestreet",
    "value": "Key:cyclestreet"
  },
  {
    "item": "P439",
    "label": "German municipality key",
    "value": "Key:de:amtlicher_gemeindeschluessel"
  },
  {
    "item": "Q46042059",
    "label": "German regional key",
    "value": "Key:de:regionalschluessel"
  },
  {
    "item": "Q2334804",
    "label": "delivery",
    "value": "Key:delivery"
  },
  {
    "item": "Q81068910",
    "label": "COVID-19 pandemic",
    "value": "Key:delivery:covid19"
  },
  {
    "item": "Q19860854",
    "label": "destroyed building or structure",
    "value": "Key:demolished"
  },
  {
    "item": "P140",
    "label": "religion",
    "value": "Key:denomination"
  },
  {
    "item": "Q1191753",
    "label": "vehicle garage",
    "value": "Key:depot"
  },
  {
    "item": "Q1200750",
    "label": "description",
    "value": "Key:description"
  },
  {
    "item": "Q81068910",
    "label": "COVID-19 pandemic",
    "value": "Key:description:covid19"
  },
  {
    "item": "Q19860854",
    "label": "destroyed building or structure",
    "value": "Key:destroyed"
  },
  {
    "item": "Q1931528",
    "label": "Nominal Pipe Size",
    "value": "Key:diameter"
  },
  {
    "item": "Q743988",
    "label": "Fruitarianism",
    "value": "Key:diet:fruitarian"
  },
  {
    "item": "Q85536643",
    "label": "halal diet",
    "value": "Key:diet:halal"
  },
  {
    "item": "Q177823",
    "label": "halal",
    "value": "Key:diet:halal"
  },
  {
    "item": "Q1076110",
    "label": "kosher foods",
    "value": "Key:diet:kosher"
  },
  {
    "item": "Q3496076",
    "label": "lacto vegetarianism",
    "value": "Key:diet:lacto_vegetarian"
  },
  {
    "item": "Q3543760",
    "label": "ovo vegetarianism",
    "value": "Key:diet:ovo_vegetaria"
  },
  {
    "item": "Q1500138",
    "label": "pescetarianism",
    "value": "Key:diet:pescetarian"
  },
  {
    "item": "Q513532",
    "label": "raw foodism",
    "value": "Key:diet:raw"
  },
  {
    "item": "Q181138",
    "label": "veganism",
    "value": "Key:diet:vegan"
  },
  {
    "item": "Q1889",
    "label": "diplomacy",
    "value": "Key:diplomatic"
  },
  {
    "item": "Q170404",
    "label": "visa",
    "value": "Key:diplomatic:services:immigrant_visas"
  },
  {
    "item": "Q170404",
    "label": "visa",
    "value": "Key:diplomatic:services:non-immigrant_visas"
  },
  {
    "item": "Q43812",
    "label": "passport",
    "value": "Key:diplomatic:services:passport=yes"
  },
  {
    "item": "Q15239622",
    "label": "disputed territory",
    "value": "Key:disputed"
  },
  {
    "item": "Q1741425",
    "label": "linear referencing",
    "value": "Key:distance"
  },
  {
    "item": "Q126017",
    "label": "distance",
    "value": "Key:distance"
  },
  {
    "item": "Q47519700",
    "label": "vacant shop",
    "value": "Key:disused:shop"
  },
  {
    "item": "Q144",
    "label": "dog",
    "value": "Key:dog"
  },
  {
    "item": "Q36794",
    "label": "door",
    "value": "Key:door"
  },
  {
    "item": "Q7892",
    "label": "drinking water",
    "value": "Key:drinking_water"
  },
  {
    "item": "Q1195412",
    "label": "drive-in",
    "value": "Key:drive_in"
  },
  {
    "item": "Q14253958",
    "label": "drive-through",
    "value": "Key:drive_through"
  },
  {
    "item": "Q81068910",
    "label": "COVID-19 pandemic",
    "value": "Key:drive_through:covid19"
  },
  {
    "item": "P2044",
    "label": "elevation above sea level",
    "value": "Key:ele"
  },
  {
    "item": "Q6452016",
    "label": "height above mean sea level",
    "value": "Key:ele:local"
  },
  {
    "item": "Q6452016",
    "label": "height above mean sea level",
    "value": "Key:ele:regional"
  },
  {
    "item": "Q388201",
    "label": "railway electrification system",
    "value": "Key:electrification"
  },
  {
    "item": "Q388201",
    "label": "railway electrification system",
    "value": "Key:electrified"
  },
  {
    "item": "Q9158",
    "label": "email",
    "value": "Key:email"
  },
  {
    "item": "P968",
    "label": "e-mail address",
    "value": "Key:email"
  },
  {
    "item": "Q892168",
    "label": "causeway",
    "value": "Key:embankment"
  },
  {
    "item": "Q7623056",
    "label": "street running",
    "value": "Key:embedded"
  },
  {
    "item": "Q7623056",
    "label": "street running",
    "value": "Key:embedded_rails"
  },
  {
    "item": "Q5070802",
    "label": "emergency",
    "value": "Key:emergency"
  },
  {
    "item": "P576",
    "label": "dissolved, abolished or demolished date",
    "value": "Key:end_date"
  },
  {
    "item": "P582",
    "label": "end time",
    "value": "Key:end_date"
  },
  {
    "item": "Q1137365",
    "label": "entrance",
    "value": "Key:entrance"
  },
  {
    "item": "Q143",
    "label": "Esperanto",
    "value": "Key:esperanto"
  },
  {
    "item": "P2815",
    "label": "ESR station code",
    "value": "Key:esr:user"
  },
  {
    "item": "Q779608",
    "label": "exception",
    "value": "Key:except"
  },
  {
    "item": "P1011",
    "label": "excluding",
    "value": "Key:except"
  },
  {
    "item": "P240",
    "label": "FAA airport code",
    "value": "Key:faa"
  },
  {
    "item": "Q355",
    "label": "Facebook",
    "value": "Key:facebook"
  },
  {
    "item": "Q2483038",
    "label": "FastPass",
    "value": "Key:fastpass"
  },
  {
    "item": "P2900",
    "label": "fax number",
    "value": "Key:fax"
  },
  {
    "item": "Q132744",
    "label": "fax",
    "value": "Key:fax"
  },
  {
    "item": "P2555",
    "label": "fee",
    "value": "Key:fee"
  },
  {
    "item": "Q11765",
    "label": "fee",
    "value": "Key:fee"
  },
  {
    "item": "Q14373",
    "label": "fishing",
    "value": "Key:fishing"
  },
  {
    "item": "Q994972",
    "label": "FIXME",
    "value": "Key:fixme"
  },
  {
    "item": "Q103204",
    "label": "Flickr",
    "value": "Key:flickr"
  },
  {
    "item": "Q221488",
    "label": "pedestrian",
    "value": "Key:foot"
  },
  {
    "item": "Q3352369",
    "label": "footpath",
    "value": "Key:footway"
  },
  {
    "item": "Q12743",
    "label": "ford",
    "value": "Key:ford"
  },
  {
    "item": "P1419",
    "label": "shape",
    "value": "Key:format"
  },
  {
    "item": "Q16938806",
    "label": "forwards",
    "value": "Key:forwards"
  },
  {
    "item": "Q483453",
    "label": "fountain",
    "value": "Key:fountain"
  },
  {
    "item": "Q11652",
    "label": "frequency",
    "value": "Key:frequency"
  },
  {
    "item": "Q388201",
    "label": "railway electrification system",
    "value": "Key:frequency"
  },
  {
    "item": "Q3314483",
    "label": "fruit",
    "value": "Key:fruit"
  },
  {
    "item": "Q14745",
    "label": "furniture",
    "value": "Key:furniture"
  },
  {
    "item": "Q11416",
    "label": "gambling",
    "value": "Key:gambling"
  },
  {
    "item": "Q214519",
    "label": "track gauge",
    "value": "Key:gauge"
  },
  {
    "item": "P1064",
    "label": "track gauge",
    "value": "Key:gauge"
  },
  {
    "item": "Q34740",
    "label": "genus",
    "value": "Key:genus"
  },
  {
    "item": "P590",
    "label": "GNIS ID",
    "value": "Key:gnis:feature_id"
  },
  {
    "item": "Q1431095",
    "label": "golf cart",
    "value": "Key:golf_cart"
  },
  {
    "item": "Q2666883",
    "label": "light commercial vehicle",
    "value": "Key:goods"
  },
  {
    "item": "Q2659904",
    "label": "government organization",
    "value": "Key:government"
  },
  {
    "item": "Q958314",
    "label": "grape variety",
    "value": "Key:grape_variety"
  },
  {
    "item": "Q16980762",
    "label": "Fingerpost",
    "value": "Key:guidepost"
  },
  {
    "item": "Q1364401",
    "label": "Happy hour",
    "value": "Key:happy_hours"
  },
  {
    "item": "P3877",
    "label": "HappyCow restaurant ID",
    "value": "Key:happycow:id"
  },
  {
    "item": "Q283202",
    "label": "harbor",
    "value": "Key:harbour"
  },
  {
    "item": "P2572",
    "label": "hashtag",
    "value": "Key:hashtags"
  },
  {
    "item": "Q757138",
    "label": "hazardous substances",
    "value": "Key:hazmat"
  },
  {
    "item": "Q31207",
    "label": "health care",
    "value": "Key:healthcare"
  },
  {
    "item": "Q208826",
    "label": "height",
    "value": "Key:height"
  },
  {
    "item": "P2048",
    "label": "height",
    "value": "Key:height"
  },
  {
    "item": "Q210272",
    "label": "cultural heritage",
    "value": "Key:heritage"
  },
  {
    "item": "Q1188075",
    "label": "office for the preservation of historical monuments",
    "value": "Key:heritage:operator"
  },
  {
    "item": "Q2449732",
    "label": "large goods vehicle",
    "value": "Key:hgv"
  },
  {
    "item": "Q1936841",
    "label": "semi-trailer truck",
    "value": "Key:hgv_articulated"
  },
  {
    "item": "Q57977870",
    "label": "highway",
    "value": "Key:highway"
  },
  {
    "item": "Q34442",
    "label": "road",
    "value": "Key:highway"
  },
  {
    "item": "Q12014035",
    "label": "hiking",
    "value": "Key:hiking"
  },
  {
    "item": "Q1081138",
    "label": "historic site",
    "value": "Key:historic"
  },
  {
    "item": "Q51369558",
    "label": "historic geographical object",
    "value": "Key:historic"
  },
  {
    "item": "Q309",
    "label": "history",
    "value": "Key:historic"
  },
  {
    "item": "Q8432",
    "label": "civilization",
    "value": "Key:historic:civilization"
  },
  {
    "item": "Q255135",
    "label": "changelog",
    "value": "Key:history"
  },
  {
    "item": "Q179226",
    "label": "equestrianism",
    "value": "Key:horse"
  },
  {
    "item": "Q285496",
    "label": "high-occupancy vehicle lane",
    "value": "Key:hov"
  },
  {
    "item": "Q192824",
    "label": "IATA airport code",
    "value": "Key:iata"
  },
  {
    "item": "P238",
    "label": "IATA airport code",
    "value": "Key:iata"
  },
  {
    "item": "P239",
    "label": "ICAO airport code",
    "value": "Key:icao"
  },
  {
    "item": "Q13233",
    "label": "ice cream",
    "value": "Key:ice_cream"
  },
  {
    "item": "Q182555",
    "label": "ice road",
    "value": "Key:ice_road"
  },
  {
    "item": "Q779272",
    "label": "ice skating",
    "value": "Key:ice_skates"
  },
  {
    "item": "Q478798",
    "label": "image",
    "value": "Key:image"
  },
  {
    "item": "P18",
    "label": "image",
    "value": "Key:image"
  },
  {
    "item": "Q59154760",
    "label": "data import",
    "value": "Key:import"
  },
  {
    "item": "P4184",
    "label": "slope",
    "value": "Key:incline"
  },
  {
    "item": "Q1299240",
    "label": "interior space",
    "value": "Key:indoor"
  },
  {
    "item": "Q6027980",
    "label": "industrial region",
    "value": "Key:industrial"
  },
  {
    "item": "Q616765",
    "label": "inline skates",
    "value": "Key:inline_skates"
  },
  {
    "item": "P1684",
    "label": "inscription",
    "value": "Key:inscription"
  },
  {
    "item": "Q1640824",
    "label": "inscription",
    "value": "Key:inscription"
  },
  {
    "item": "Q39508083",
    "label": "intermittent body of water",
    "value": "Key:intermittent"
  },
  {
    "item": "Q1043562",
    "label": "service set",
    "value": "Key:internet_access:ssid"
  },
  {
    "item": "Q1788454",
    "label": "road junction",
    "value": "Key:junction"
  },
  {
    "item": "Q1777515",
    "label": "junction",
    "value": "Key:junction"
  },
  {
    "item": "Q37442",
    "label": "curb",
    "value": "Key:kerb"
  },
  {
    "item": "P1077",
    "label": "KOATUU identifier",
    "value": "Key:koatuu"
  },
  {
    "item": "Q96337207",
    "label": "Use",
    "value": "Key:landuse"
  },
  {
    "item": "Q1165944",
    "label": "land use",
    "value": "Key:landuse"
  },
  {
    "item": "Q3222002",
    "label": "lane",
    "value": "Key:lanes"
  },
  {
    "item": "Q34770",
    "label": "language",
    "value": "Key:language"
  },
  {
    "item": "Q188",
    "label": "German",
    "value": "Key:language:de"
  },
  {
    "item": "Q143",
    "label": "Esperanto",
    "value": "Key:language:eo"
  },
  {
    "item": "Q1321",
    "label": "Spanish",
    "value": "Key:language:es"
  },
  {
    "item": "Q150",
    "label": "French",
    "value": "Key:language:fr"
  },
  {
    "item": "Q809",
    "label": "Polish",
    "value": "Key:language:pl"
  },
  {
    "item": "Q7913",
    "label": "Romanian",
    "value": "Key:language:ro"
  },
  {
    "item": "Q7737",
    "label": "Russian",
    "value": "Key:language:ru"
  },
  {
    "item": "Q256",
    "label": "Turkish",
    "value": "Key:language:tr"
  },
  {
    "item": "Q34027",
    "label": "latitude",
    "value": "Key:latitude"
  },
  {
    "item": "Q40348",
    "label": "lawyer",
    "value": "Key:lawyer"
  },
  {
    "item": "Q13196750",
    "label": "left",
    "value": "Key:left"
  },
  {
    "item": "Q47520921",
    "label": "leisure facility",
    "value": "Key:leisure"
  },
  {
    "item": "P2043",
    "label": "length",
    "value": "Key:length"
  },
  {
    "item": "Q36253",
    "label": "length",
    "value": "Key:length"
  },
  {
    "item": "P5423",
    "label": "floor number",
    "value": "Key:level"
  },
  {
    "item": "Q17884",
    "label": "LGBT",
    "value": "Key:lgbtq"
  },
  {
    "item": "Q5828876",
    "label": "Longer Heavier Vehicle",
    "value": "Key:lhv"
  },
  {
    "item": "P275",
    "label": "copyright license",
    "value": "Key:license"
  },
  {
    "item": "Q210064",
    "label": "lighting",
    "value": "Key:lit"
  },
  {
    "item": "Q9392675",
    "label": "loading gauge",
    "value": "Key:loading_gauge"
  },
  {
    "item": "Q2221906",
    "label": "geographic location",
    "value": "Key:location"
  },
  {
    "item": "Q105731",
    "label": "lock",
    "value": "Key:lock"
  },
  {
    "item": "Q36477",
    "label": "longitude",
    "value": "Key:longitude"
  },
  {
    "item": "Q189409",
    "label": "lottery",
    "value": "Key:lottery"
  },
  {
    "item": "Q12896105",
    "label": "lunch",
    "value": "Key:lunch"
  },
  {
    "item": "Q16686448",
    "label": "artificial entity",
    "value": "Key:man_made"
  },
  {
    "item": "Q532998",
    "label": "manhole",
    "value": "Key:manhole"
  },
  {
    "item": "Q42855995",
    "label": "fabricator",
    "value": "Key:manufacturer"
  },
  {
    "item": "Q41362222",
    "label": "type of map",
    "value": "Key:map_type"
  },
  {
    "item": "P1947",
    "label": "Mapillary ID",
    "value": "Key:mapillary"
  },
  {
    "item": "Q3089219",
    "label": "maritime boundary",
    "value": "Key:maritime"
  },
  {
    "item": "Q13580385",
    "label": "geographical marker",
    "value": "Key:marker"
  },
  {
    "item": "Q179415",
    "label": "massage",
    "value": "Key:massage"
  },
  {
    "item": "Q214609",
    "label": "material",
    "value": "Key:material"
  },
  {
    "item": "P4135",
    "label": "maximum age",
    "value": "Key:max_age"
  },
  {
    "item": "Q1077350",
    "label": "speed limit",
    "value": "Key:maxspeed"
  },
  {
    "item": "Q99773426",
    "label": "traffic weight restriction",
    "value": "Key:maxweight"
  },
  {
    "item": "Q5003624",
    "label": "memorial",
    "value": "Key:memorial"
  },
  {
    "item": "P1684",
    "label": "inscription",
    "value": "Key:memorial:text"
  },
  {
    "item": "Q8473",
    "label": "military",
    "value": "Key:military"
  },
  {
    "item": "Q18691599",
    "label": "military facility",
    "value": "Key:military"
  },
  {
    "item": "Q98158660",
    "label": "building camouflage",
    "value": "Key:mimics"
  },
  {
    "item": "P2899",
    "label": "minimum age",
    "value": "Key:min_age"
  },
  {
    "item": "Q946479",
    "label": "minibus",
    "value": "Key:minibus"
  },
  {
    "item": "Q1942420",
    "label": "mofa",
    "value": "Key:mofa"
  },
  {
    "item": "Q10464329",
    "label": "bicycle counter",
    "value": "Key:monitoring:bicycle"
  },
  {
    "item": "Q190107",
    "label": "weather station",
    "value": "Key:monitoring:weather"
  },
  {
    "item": "Q22713653",
    "label": "mooring",
    "value": "Key:mooring"
  },
  {
    "item": "Q201783",
    "label": "moped",
    "value": "Key:moped"
  },
  {
    "item": "Q752870",
    "label": "motor vehicle",
    "value": "Key:motor_vehicle"
  },
  {
    "item": "Q622416",
    "label": "motorboat",
    "value": "Key:motorboat"
  },
  {
    "item": "Q1420",
    "label": "motor car",
    "value": "Key:motorcar"
  },
  {
    "item": "Q34493",
    "label": "motorcycle",
    "value": "Key:motorcycle"
  },
  {
    "item": "Q24455483",
    "label": "motorcycle rental",
    "value": "Key:motorcycle:rental"
  },
  {
    "item": "Q98844712",
    "label": "motor bike repair shop",
    "value": "Key:motorcycle:repair"
  },
  {
    "item": "Q746448",
    "label": "recreatonal vehicle",
    "value": "Key:motorhome"
  },
  {
    "item": "Q223705",
    "label": "mountain bike",
    "value": "Key:mtb"
  },
  {
    "item": "Q33506",
    "label": "museum",
    "value": "Key:museum"
  },
  {
    "item": "Q82799",
    "label": "name",
    "value": "Key:name"
  },
  {
    "item": "Q20482247",
    "label": "Esperantization of toponyms",
    "value": "Key:name:eo"
  },
  {
    "item": "Q204335",
    "label": "eponym",
    "value": "Key:name:etymology"
  },
  {
    "item": "Q21204",
    "label": "International Phonetic Alphabet",
    "value": "Key:name:pronunciation"
  },
  {
    "item": "P882",
    "label": "FIPS 6-4 (US counties)",
    "value": "Key:nist:fips_code"
  },
  {
    "item": "P1889",
    "label": "different from",
    "value": "Key:not:name"
  },
  {
    "item": "Q1619873",
    "label": "note",
    "value": "Key:note"
  },
  {
    "item": "Q81068910",
    "label": "COVID-19 pandemic",
    "value": "Key:note:covid19"
  },
  {
    "item": "Q857525",
    "label": "annotation",
    "value": "Key:notes"
  },
  {
    "item": "P6082",
    "label": "NYC Building Identification Number (BIN)",
    "value": "Key:nycdoitt:bin"
  },
  {
    "item": "Q1021645",
    "label": "office building",
    "value": "Key:office"
  },
  {
    "item": "P1448",
    "label": "official name",
    "value": "Key:official_name"
  },
  {
    "item": "Q47526250",
    "label": "OpenBenches",
    "value": "Key:openbenches:id"
  },
  {
    "item": "P1619",
    "label": "date of official opening",
    "value": "Key:opening_date"
  },
  {
    "item": "P3027",
    "label": "open period from",
    "value": "Key:opening_hours"
  },
  {
    "item": "P3025",
    "label": "open days",
    "value": "Key:opening_hours"
  },
  {
    "item": "P8626",
    "label": "opening time",
    "value": "Key:opening_hours"
  },
  {
    "item": "Q99518990",
    "label": "opening hours",
    "value": "Key:opening_hours"
  },
  {
    "item": "P8627",
    "label": "closing time",
    "value": "Key:opening_hours"
  },
  {
    "item": "P3028",
    "label": "open period to",
    "value": "Key:opening_hours"
  },
  {
    "item": "Q81068910",
    "label": "COVID-19 pandemic",
    "value": "Key:opening_hours:covid19"
  },
  {
    "item": "Q23018437",
    "label": "Open Plaques",
    "value": "Key:openplaques:id"
  },
  {
    "item": "P1893",
    "label": "OpenPlaques plaque ID",
    "value": "Key:openplaques:id"
  },
  {
    "item": "Q29933786",
    "label": "operator",
    "value": "Key:operator"
  },
  {
    "item": "P137",
    "label": "operator",
    "value": "Key:operator:wikidata"
  },
  {
    "item": "Q29358",
    "label": "orienteering",
    "value": "Key:orienteering"
  },
  {
    "item": "Q98642678",
    "label": "outdoor seating",
    "value": "Key:outdoor_seating"
  },
  {
    "item": "Q738031",
    "label": "park and ride",
    "value": "Key:park_ride"
  },
  {
    "item": "Q319604",
    "label": "passenger",
    "value": "Key:passenger"
  },
  {
    "item": "Q1148747",
    "label": "payment",
    "value": "Key:payment"
  },
  {
    "item": "Q60989078",
    "label": "Line Pay",
    "value": "Key:payment:LINE_Pay"
  },
  {
    "item": "Q2550595",
    "label": "OV-chipkaart",
    "value": "Key:payment:OV-Chipkaart"
  },
  {
    "item": "Q493556",
    "label": "Alipay",
    "value": "Key:payment:alipay"
  },
  {
    "item": "Q24228273",
    "label": "American Express credit card",
    "value": "Key:payment:american_express"
  },
  {
    "item": "Q18010990",
    "label": "Apple Pay",
    "value": "Key:payment:apple_pay"
  },
  {
    "item": "Q1961559",
    "label": "Bancomat",
    "value": "Key:payment:bancomat"
  },
  {
    "item": "Q17749859",
    "label": "BankAxept",
    "value": "Key:payment:bankaxept"
  },
  {
    "item": "Q131723",
    "label": "bitcoin",
    "value": "Key:payment:bitcoin"
  },
  {
    "item": "Q3335910",
    "label": "Clipper card",
    "value": "Key:payment:clipper"
  },
  {
    "item": "Q625903",
    "label": "contactless payment",
    "value": "Key:payment:contactless"
  },
  {
    "item": "Q161380",
    "label": "credit card",
    "value": "Key:payment:credit_cards"
  },
  {
    "item": "Q13479982",
    "label": "cryptocurrency",
    "value": "Key:payment:cryptocurrencies"
  },
  {
    "item": "Q13499",
    "label": "debit card",
    "value": "Key:payment:debit_cards"
  },
  {
    "item": "Q50612448",
    "label": "Diners Club credit card",
    "value": "Key:payment:diners_club"
  },
  {
    "item": "Q1228562",
    "label": "Discover Card",
    "value": "Key:payment:discover_card"
  },
  {
    "item": "Q15377916",
    "label": "Dogecoin",
    "value": "Key:payment:dogecoin"
  },
  {
    "item": "Q800074",
    "label": "E-ZPass",
    "value": "Key:payment:e_zpass"
  },
  {
    "item": "Q5358217",
    "label": "Electronic Benefit Transfer",
    "value": "Key:payment:ebt"
  },
  {
    "item": "Q20313208",
    "label": "Beep",
    "value": "Key:payment:ep_beep"
  },
  {
    "item": "Q2792191",
    "label": "Geldkarte",
    "value": "Key:payment:ep_geldkarte"
  },
  {
    "item": "Q11202882",
    "label": "Monedero",
    "value": "Key:payment:ep_monedero"
  },
  {
    "item": "Q806096",
    "label": "FasTrak",
    "value": "Key:payment:fastrak"
  },
  {
    "item": "Q554910",
    "label": "gift card",
    "value": "Key:payment:gift_card"
  },
  {
    "item": "Q1406930",
    "label": "Girocard",
    "value": "Key:payment:girocard"
  },
  {
    "item": "Q830705",
    "label": "Good To Go!",
    "value": "Key:payment:good_to_go"
  },
  {
    "item": "Q19834616",
    "label": "Google Pay",
    "value": "Key:payment:google_pay"
  },
  {
    "item": "Q1034948",
    "label": "I-Pass",
    "value": "Key:payment:i-pass"
  },
  {
    "item": "Q10863852",
    "label": "iPASS",
    "value": "Key:payment:ipass"
  },
  {
    "item": "Q50612088",
    "label": "JCB credit card",
    "value": "Key:payment:jcb"
  },
  {
    "item": "Q4043030",
    "label": "Litecoin",
    "value": "Key:payment:litecoin"
  },
  {
    "item": "Q1350133",
    "label": "Maestro",
    "value": "Key:payment:maestro"
  },
  {
    "item": "Q24228272",
    "label": "Mastercard credit card",
    "value": "Key:payment:mastercard"
  },
  {
    "item": "Q1449340",
    "label": "meal voucher",
    "value": "Key:payment:meal_voucher"
  },
  {
    "item": "Q52008245",
    "label": "Mi-Pay",
    "value": "Key:payment:mipay"
  },
  {
    "item": "Q99110458",
    "label": "NC Quick Pass",
    "value": "Key:payment:nc_quick_pass"
  },
  {
    "item": "Q249400",
    "label": "Oyster card",
    "value": "Key:payment:oyster"
  },
  {
    "item": "Q483959",
    "label": "PayPal",
    "value": "Key:payment:paypal"
  },
  {
    "item": "Q56348149",
    "label": "PayPay",
    "value": "Key:payment:paypay"
  },
  {
    "item": "Q28407514",
    "label": "Peach Pass",
    "value": "Key:payment:peach_pass"
  },
  {
    "item": "Q99105580",
    "label": "Pikepass",
    "value": "Key:payment:pikepass"
  },
  {
    "item": "Q17591173",
    "label": "Q17591173",
    "value": "Key:payment:postfinance_card"
  },
  {
    "item": "Q22328294",
    "label": "Samsung Pay",
    "value": "Key:payment:samsung_pay"
  },
  {
    "item": "Q2160381",
    "label": "Service voucher",
    "value": "Key:payment:service_voucher"
  },
  {
    "item": "Q43024",
    "label": "Short Message Service",
    "value": "Key:payment:sms"
  },
  {
    "item": "Q556318",
    "label": "Supplemental Nutrition Assistance Program",
    "value": "Key:payment:snap"
  },
  {
    "item": "Q7394941",
    "label": "SUBE card",
    "value": "Key:payment:sube"
  },
  {
    "item": "Q7638154",
    "label": "SunPass",
    "value": "Key:payment:sunpass"
  },
  {
    "item": "Q1301892",
    "label": "Q1301892",
    "value": "Key:payment:szep"
  },
  {
    "item": "Q1122035",
    "label": "telephone card",
    "value": "Key:payment:telephone_cards"
  },
  {
    "item": "Q751944",
    "label": "token coin",
    "value": "Key:payment:token_coin"
  },
  {
    "item": "Q15145883",
    "label": "Troika card",
    "value": "Key:payment:troika"
  },
  {
    "item": "Q7862905",
    "label": "U-Key",
    "value": "Key:payment:u-key"
  },
  {
    "item": "Q2507012",
    "label": "V PAY",
    "value": "Key:payment:v_pay"
  },
  {
    "item": "Q24228271",
    "label": "VISA credit card",
    "value": "Key:payment:visa"
  },
  {
    "item": "Q3521248",
    "label": "Visa Debit",
    "value": "Key:payment:visa_debit"
  },
  {
    "item": "Q2993698",
    "label": "Visa Electron",
    "value": "Key:payment:visa_electron"
  },
  {
    "item": "Q59426035",
    "label": "WeChat Pay",
    "value": "Key:payment:wechat"
  },
  {
    "item": "Q620463",
    "label": "WIC",
    "value": "Key:payment:wic"
  },
  {
    "item": "Q334501",
    "label": "wire transfer",
    "value": "Key:payment:wire_transfer"
  },
  {
    "item": "P1329",
    "label": "phone number",
    "value": "Key:phone"
  },
  {
    "item": "Q756",
    "label": "plant",
    "value": "Key:plant"
  },
  {
    "item": "Q1613416",
    "label": "population",
    "value": "Key:population"
  },
  {
    "item": "P1082",
    "label": "population",
    "value": "Key:population"
  },
  {
    "item": "Q14565197",
    "label": "relative direction",
    "value": "Key:position"
  },
  {
    "item": "P281",
    "label": "postal code",
    "value": "Key:postal_code"
  },
  {
    "item": "Q37447",
    "label": "postal code",
    "value": "Key:postal_code"
  },
  {
    "item": "Q383973",
    "label": "electricity generation",
    "value": "Key:power"
  },
  {
    "item": "Q21280825",
    "label": "priority",
    "value": "Key:priority"
  },
  {
    "item": "Q1913301",
    "label": "produce",
    "value": "Key:produce"
  },
  {
    "item": "Q2424752",
    "label": "product",
    "value": "Key:product"
  },
  {
    "item": "Q811683",
    "label": "proposed building or structure",
    "value": "Key:proposed"
  },
  {
    "item": "Q178512",
    "label": "public transport",
    "value": "Key:public_transport"
  },
  {
    "item": "Q2245442",
    "label": "water pump",
    "value": "Key:pump"
  },
  {
    "item": "Q378445",
    "label": "rack railway",
    "value": "Key:rack"
  },
  {
    "item": "Q350783",
    "label": "rail guided transport",
    "value": "Key:railway"
  },
  {
    "item": "Q1741425",
    "label": "linear referencing",
    "value": "Key:railway:position"
  },
  {
    "item": "P296",
    "label": "station code",
    "value": "Key:railway:ref"
  },
  {
    "item": "P5105",
    "label": "Deutsche Bahn station category",
    "value": "Key:railway:station_category"
  },
  {
    "item": "Q2271554",
    "label": "point heating",
    "value": "Key:railway:switch:heated"
  },
  {
    "item": "Q661343",
    "label": "ramp",
    "value": "Key:ramp"
  },
  {
    "item": "Q19683138",
    "label": "Ramsar site",
    "value": "Key:ramsar"
  },
  {
    "item": "Q1532594",
    "label": "power rating",
    "value": "Key:rating"
  },
  {
    "item": "Q19860854",
    "label": "destroyed building or structure",
    "value": "Key:razed"
  },
  {
    "item": "Q13557414",
    "label": "recording",
    "value": "Key:recording"
  },
  {
    "item": "Q184358",
    "label": "reef",
    "value": "Key:reef"
  },
  {
    "item": "Q1334113",
    "label": "referene data type",
    "value": "Key:ref"
  },
  {
    "item": "P2951",
    "label": "Cultural heritage database in Austria ObjektID",
    "value": "Key:ref:AT:bda"
  },
  {
    "item": "P8414",
    "label": "AlloCiné theater ID",
    "value": "Key:ref:FR:Allocine"
  },
  {
    "item": "P4058",
    "label": "FINESS ID",
    "value": "Key:ref:FR:FINESS"
  },
  {
    "item": "Q25387536",
    "label": "MémorialGenWeb",
    "value": "Key:ref:FR:MemorialGenWeb"
  },
  {
    "item": "P3918",
    "label": "Répertoire national des associations identifier",
    "value": "Key:ref:FR:RNA"
  },
  {
    "item": "P1616",
    "label": "SIREN number",
    "value": "Key:ref:FR:SIREN"
  },
  {
    "item": "P3215",
    "label": "SIRET number",
    "value": "Key:ref:FR:SIRET"
  },
  {
    "item": "P539",
    "label": "Museofile",
    "value": "Key:ref:FR:museofile"
  },
  {
    "item": "P374",
    "label": "INSEE municipality code",
    "value": "Key:ref:INSEE"
  },
  {
    "item": "P1937",
    "label": "UN/LOCODE",
    "value": "Key:ref:LOCODE"
  },
  {
    "item": "P1764",
    "label": "Flemish Heritage Object ID",
    "value": "Key:ref:OnroerendErfgoed"
  },
  {
    "item": "P3202",
    "label": "UAI code",
    "value": "Key:ref:UAI"
  },
  {
    "item": "P3562",
    "label": "Admiralty number",
    "value": "Key:ref:admiralty"
  },
  {
    "item": "P2980",
    "label": "ARLHS lighthouse ID",
    "value": "Key:ref:arlhs"
  },
  {
    "item": "P2951",
    "label": "Cultural heritage database in Austria ObjektID",
    "value": "Key:ref:at:bda"
  },
  {
    "item": "P964",
    "label": "Austrian municipality key",
    "value": "Key:ref:at:gkz"
  },
  {
    "item": "Q21040879",
    "label": "Q21040879",
    "value": "Key:ref:at:wis"
  },
  {
    "item": "P5208",
    "label": "BAG building ID",
    "value": "Key:ref:bag"
  },
  {
    "item": "P3920",
    "label": "Canadian Coastguard Lighthouse ID",
    "value": "Key:ref:ccg"
  },
  {
    "item": "P4755",
    "label": "UK railway station code",
    "value": "Key:ref:crs"
  },
  {
    "item": "P2253",
    "label": "DfE URN",
    "value": "Key:ref:edubase"
  },
  {
    "item": "P3863",
    "label": "Italian Navy Lighthouses and Beacons ID",
    "value": "Key:ref:ef"
  },
  {
    "item": "P836",
    "label": "GSS code (2011)",
    "value": "Key:ref:gss"
  },
  {
    "item": "Q21013851",
    "label": "Historic Site or Monument (Antarctica)",
    "value": "Key:ref:hmsaq"
  },
  {
    "item": "Q207529",
    "label": "ICAO airport code",
    "value": "Key:ref:icao"
  },
  {
    "item": "P791",
    "label": "ISIL",
    "value": "Key:ref:isil"
  },
  {
    "item": "P380",
    "label": "Mérimée ID",
    "value": "Key:ref:mhs"
  },
  {
    "item": "P3563",
    "label": "NGA Lighthouse ID",
    "value": "Key:ref:nga"
  },
  {
    "item": "P649",
    "label": "NRHP reference number",
    "value": "Key:ref:nrhp"
  },
  {
    "item": "P359",
    "label": "Rijksmonument ID",
    "value": "Key:ref:rce"
  },
  {
    "item": "P7526",
    "label": "Czech cadastral area ID",
    "value": "Key:ref:ruian"
  },
  {
    "item": "P7606",
    "label": "Czech municipality ID",
    "value": "Key:ref:ruian"
  },
  {
    "item": "P4533",
    "label": "Czech street ID",
    "value": "Key:ref:ruian:street"
  },
  {
    "item": "P1717",
    "label": "Sandre river ID",
    "value": "Key:ref:sandre"
  },
  {
    "item": "P296",
    "label": "station code",
    "value": "Key:ref:train"
  },
  {
    "item": "P3723",
    "label": "USCG Lighthouse ID",
    "value": "Key:ref:uscg"
  },
  {
    "item": "Q2319042",
    "label": "VATidentification number",
    "value": "Key:ref:vatin"
  },
  {
    "item": "P3608",
    "label": "EU VAT number",
    "value": "Key:ref:vatin"
  },
  {
    "item": "P757",
    "label": "World Heritage Site ID",
    "value": "Key:ref:whc"
  },
  {
    "item": "Q3279650",
    "label": "World Heritage Centre",
    "value": "Key:ref:whc"
  },
  {
    "item": "P8430",
    "label": "Wien Kulturgut: Kunstwerke im öffentlichen Raum ID",
    "value": "Key:ref:wien:kultur"
  },
  {
    "item": "P4136",
    "label": "WIGOS station ID",
    "value": "Key:ref:wigos"
  },
  {
    "item": "P981",
    "label": "BAG residence ID",
    "value": "Key:ref:woonplaatscode"
  },
  {
    "item": "P7625",
    "label": "WPI ID",
    "value": "Key:ref:wpi"
  },
  {
    "item": "Q323678",
    "label": "Regelbau",
    "value": "Key:regelbau"
  },
  {
    "item": "P457",
    "label": "foundational text",
    "value": "Key:related_law"
  },
  {
    "item": "Q9174",
    "label": "religion",
    "value": "Key:religion"
  },
  {
    "item": "P140",
    "label": "religion",
    "value": "Key:religion"
  },
  {
    "item": "Q2144962",
    "label": "repair",
    "value": "Key:repair"
  },
  {
    "item": "Q18699055",
    "label": "repetition",
    "value": "Key:repeat_on"
  },
  {
    "item": "Q64883416",
    "label": "booking",
    "value": "Key:reservation"
  },
  {
    "item": "Q188460",
    "label": "natural resource",
    "value": "Key:resource"
  },
  {
    "item": "Q11707",
    "label": "restaurant",
    "value": "Key:restaurant"
  },
  {
    "item": "Q14565199",
    "label": "right",
    "value": "Key:right"
  },
  {
    "item": "Q1392287",
    "label": "road surface marking",
    "value": "Key:road_marking"
  },
  {
    "item": "Q58878",
    "label": "road train",
    "value": "Key:roadtrain"
  },
  {
    "item": "Q1156686",
    "label": "roof shape",
    "value": "Key:roof:shape"
  },
  {
    "item": "Q180516",
    "label": "room",
    "value": "Key:room"
  },
  {
    "item": "Q2739328",
    "label": "royal cypher",
    "value": "Key:royal_cypher"
  },
  {
    "item": "Q90416196",
    "label": "face masks during the COVID-19 pandemic",
    "value": "Key:safety:mask:covid19"
  },
  {
    "item": "Q1075310",
    "label": "sailboat",
    "value": "Key:sailboat"
  },
  {
    "item": "Q57036",
    "label": "sauna",
    "value": "Key:sauna"
  },
  {
    "item": "Q98272210",
    "label": "sea mark",
    "value": "Key:seamark"
  },
  {
    "item": "P587",
    "label": "MMSI",
    "value": "Key:seamark:radio_station:mmsi"
  },
  {
    "item": "P587",
    "label": "MMSI",
    "value": "Key:seamark:virtual_aton:mmsi"
  },
  {
    "item": "Q2111082",
    "label": "seasonality",
    "value": "Key:seasonal"
  },
  {
    "item": "Q7406919",
    "label": "service",
    "value": "Key:service"
  },
  {
    "item": "Q1047163",
    "label": "auto detailing",
    "value": "Key:service:vehicle:detailing"
  },
  {
    "item": "Q842389",
    "label": "share taxi",
    "value": "Key:share_taxi"
  },
  {
    "item": "Q11446",
    "label": "ship",
    "value": "Key:ship"
  },
  {
    "item": "Q213441",
    "label": "shop",
    "value": "Key:shop"
  },
  {
    "item": "P1813",
    "label": "short name",
    "value": "Key:short_name"
  },
  {
    "item": "Q1408712",
    "label": "shoulder",
    "value": "Key:shoulder"
  },
  {
    "item": "Q177749",
    "label": "sidewalk",
    "value": "Key:sidewalk"
  },
  {
    "item": "Q130949",
    "label": "skiing",
    "value": "Key:ski"
  },
  {
    "item": "Q186222",
    "label": "alpine skiing",
    "value": "Key:ski:alpine"
  },
  {
    "item": "Q18544844",
    "label": "cross-country skiing",
    "value": "Key:ski:nordic"
  },
  {
    "item": "Q50620",
    "label": "Telemark skiing",
    "value": "Key:ski:telemark"
  },
  {
    "item": "Q662860",
    "label": "smoking",
    "value": "Key:smoking"
  },
  {
    "item": "Q17240",
    "label": "snowmobile",
    "value": "Key:snowmobile"
  },
  {
    "item": "Q725252",
    "label": "satellite imagery",
    "value": "Key:source:imagery"
  },
  {
    "item": "Q79719",
    "label": "license",
    "value": "Key:source:license"
  },
  {
    "item": "P854",
    "label": "reference URL",
    "value": "Key:source:url"
  },
  {
    "item": "Q7432",
    "label": "species",
    "value": "Key:species"
  },
  {
    "item": "P225",
    "label": "taxon name",
    "value": "Key:species:wikidata"
  },
  {
    "item": "P641",
    "label": "sport",
    "value": "Key:sport"
  },
  {
    "item": "Q349",
    "label": "sport",
    "value": "Key:sport"
  },
  {
    "item": "Q1642648",
    "label": "star rating",
    "value": "Key:stars"
  },
  {
    "item": "P571",
    "label": "inception",
    "value": "Key:start_date"
  },
  {
    "item": "P580",
    "label": "start time",
    "value": "Key:start_date"
  },
  {
    "item": "Q3406134",
    "label": "date of establishment",
    "value": "Key:start_date"
  },
  {
    "item": "Q99196274",
    "label": "stop line",
    "value": "Key:stop"
  },
  {
    "item": "Q30004987",
    "label": "baby carriage",
    "value": "Key:stroller"
  },
  {
    "item": "Q26256810",
    "label": "matter",
    "value": "Key:subject"
  },
  {
    "item": "P921",
    "label": "main subject",
    "value": "Key:subject:wikidata"
  },
  {
    "item": "Q928830",
    "label": "metro station",
    "value": "Key:subway"
  },
  {
    "item": "Q1175042",
    "label": "supervision",
    "value": "Key:supervised"
  },
  {
    "item": "Q1058733",
    "label": "support",
    "value": "Key:support"
  },
  {
    "item": "Q1049667",
    "label": "road surface",
    "value": "Key:surface"
  },
  {
    "item": "Q334401",
    "label": "surveillance",
    "value": "Key:surveillance"
  },
  {
    "item": "Q80071",
    "label": "symbol",
    "value": "Key:symbol"
  },
  {
    "item": "Q884259",
    "label": "tactile paving",
    "value": "Key:tactile_paving"
  },
  {
    "item": "Q154383",
    "label": "take-out",
    "value": "Key:takeaway"
  },
  {
    "item": "Q81068910",
    "label": "COVID-19 pandemic",
    "value": "Key:takeaway:covid19"
  },
  {
    "item": "Q14970",
    "label": "tanker ship",
    "value": "Key:tanker"
  },
  {
    "item": "Q64779710",
    "label": "receiving state or organization",
    "value": "Key:target"
  },
  {
    "item": "Q82650",
    "label": "taxi",
    "value": "Key:taxi"
  },
  {
    "item": "Q16521",
    "label": "taxon",
    "value": "Key:taxon"
  },
  {
    "item": "Q7777573",
    "label": "theatrical genre",
    "value": "Key:theatre:genre"
  },
  {
    "item": "Q1398201",
    "label": "tidal range",
    "value": "Key:tidal"
  },
  {
    "item": "Q2384319",
    "label": "Topologically Integrated Geographic Encoding and Referencing",
    "value": "Key:tiger"
  },
  {
    "item": "Q12143",
    "label": "time zone",
    "value": "Key:timezone"
  },
  {
    "item": "Q1566",
    "label": "tobacco",
    "value": "Key:tobacco"
  },
  {
    "item": "Q813966",
    "label": "public toilet",
    "value": "Key:toilets"
  },
  {
    "item": "Q381885",
    "label": "tomb",
    "value": "Key:tomb"
  },
  {
    "item": "Q49389",
    "label": "tourism",
    "value": "Key:tourism"
  },
  {
    "item": "Q1198538",
    "label": "traffic calming",
    "value": "Key:traffic_calming"
  },
  {
    "item": "Q170285",
    "label": "traffic sign",
    "value": "Key:traffic_sign"
  },
  {
    "item": "Q654068",
    "label": "visibility",
    "value": "Key:trail_visibility"
  },
  {
    "item": "Q216146",
    "label": "trailer",
    "value": "Key:trailer"
  },
  {
    "item": "Q870",
    "label": "train",
    "value": "Key:train"
  },
  {
    "item": "Q91764",
    "label": "military trench",
    "value": "Keytrench"
  },
  {
    "item": "Q5639",
    "label": "trolleybus",
    "value": "Key:trolleybus"
  },
  {
    "item": "Q44377",
    "label": "tunnel",
    "value": "Key:tunnel"
  },
  {
    "item": "P2002",
    "label": "Twitter username",
    "value": "Key:twitter"
  },
  {
    "item": "Q918",
    "label": "Twitter",
    "value": "Key:twitter"
  },
  {
    "item": "P722",
    "label": "UIC station code",
    "value": "Key:uic_ref"
  },
  {
    "item": "P2699",
    "label": "URL",
    "value": "Key:url"
  },
  {
    "item": "Q42253",
    "label": "Uniform Resource Locator",
    "value": "Key:url"
  },
  {
    "item": "Q97406579",
    "label": "non-rail vehicle",
    "value": "Key:vehicle"
  },
  {
    "item": "Q7339573",
    "label": "road verge",
    "value": "Key:verge"
  },
  {
    "item": "P2436",
    "label": "voltage",
    "value": "Key:voltage"
  },
  {
    "item": "Q388201",
    "label": "railway electrification system",
    "value": "Key:voltage"
  },
  {
    "item": "Q45701",
    "label": "waste",
    "value": "Key:waste"
  },
  {
    "item": "Q1267889",
    "label": "waterway",
    "value": "Key:waterway"
  },
  {
    "item": "Q22137024",
    "label": "official website",
    "value": "Key:website"
  },
  {
    "item": "P856",
    "label": "official website",
    "value": "Key:website"
  },
  {
    "item": "P2614",
    "label": "World Heritage criteria",
    "value": "Key:whc:criteria"
  },
  {
    "item": "P2846",
    "label": "wheelchair accessibility",
    "value": "Key:wheelchair"
  },
  {
    "item": "Q35059",
    "label": "width",
    "value": "Key:width"
  },
  {
    "item": "P2049",
    "label": "width",
    "value": "Key:width"
  },
  {
    "item": "Q43649390",
    "label": "Wikidata Q identifier",
    "value": "Key:wikidata"
  },
  {
    "item": "P373",
    "label": "Commons category",
    "value": "Key:wikimedia_commons"
  },
  {
    "item": "Q565",
    "label": "Wikimedia Commons",
    "value": "Key:wikimedia_commons"
  },
  {
    "item": "P18",
    "label": "image",
    "value": "Key:wikimedia_commons"
  },
  {
    "item": "Q78757683",
    "label": "winding",
    "value": "Key:windings"
  },
  {
    "item": "P1281",
    "label": "WOEID",
    "value": "Key:woeid"
  },
  {
    "item": "Q43501",
    "label": "zoo",
    "value": "Key:zoo"
  },
  {
    "item": "Q5119",
    "label": "capital",
    "value": "Role:admin_centre"
  },
  {
    "item": "Q1306755",
    "label": "administrative centre",
    "value": "Role:admin_centre"
  },
  {
    "item": "Q5161710",
    "label": "connector",
    "value": "Role:connection"
  },
  {
    "item": "Q104642575",
    "label": "map label",
    "value": "Role:label"
  },
  {
    "item": "Q61427164",
    "label": "subarea",
    "value": "Role:subarea"
  },
  */
  {
    "item": "Q57830222",
    "label": "Strategic Highway Network",
    "value": "Tag:NHS=STRAHNET"
  },
  {
    "item": "Q703941",
    "label": "private road",
    "value": "Tag:access=private"
  },
  {
    "item": "Q654810",
    "label": "dating",
    "value": "Tag:activity:dating=yes"
  },
  {
    "item": "Q515",
    "label": "city",
    "value": "Tag:addr=city"
  },
  {
    "item": "Q817477",
    "label": "tehsil",
    "value": "Tag:admin_level=6"
  },
  {
    "item": "Q769603",
    "label": "non-metropolitan county",
    "value": "Tag:admin_level=6"
  },
  {
    "item": "Q623149",
    "label": "billboard",
    "value": "Tag:advertising=billboard"
  },
  {
    "item": "Q13964",
    "label": "advertising column",
    "value": "Tag:advertising=column"
  },
  {
    "item": "Q1093798",
    "label": "poster box",
    "value": "Tag:advertising=poster_box"
  },
  {
    "item": "Q498002",
    "label": "aerial tramway",
    "value": "Tag:aerialway=cable_car"
  },
  {
    "item": "Q850767",
    "label": "chairlift",
    "value": "Tag:aerialway=chair_lift"
  },
  {
    "item": "Q1576693",
    "label": "gondola lift",
    "value": "Tag:aerialway=gondola"
  },
  {
    "item": "Q2367733",
    "label": "material ropeway",
    "value": "Tag:aerialway=goods"
  },
  {
    "item": "Q6103826",
    "label": "J-bar lift",
    "value":"Tag:aerialway=j-bar"
  },
  {
    "item": "Q6730907",
    "label": "magic carpet",
    "value": "Tag:aerialway=magic_carpet"
  },
  {
    "item": "Q3546684",
    "label": "hybrid lift",
    "value": "Tag:aerialway=mixed_lift"
  },
  {
    "item": "Q17136481",
    "label": "surface lift",
    "value": "Tag:aerialway=platter"
  },
  {
    "item": "Q1975677",
    "label": "ski tow",
    "value": "Tag:aerialway=rope_tow"
  },
  {
    "item": "Q17144502",
    "label": "T-bar lift",
    "value": "Tag:aerialway=t-bar"
  },
  {
    "item": "Q1154882",
    "label": "zip-line",
    "value": "Tag:aerialway=zip_line"
  },
  {
    "item": "Q62447",
    "label": "aerodrome (airport)",
    "value": "Tag:aeroway=aerodrome"
  },
  {
    "item": "Q573970",
    "label": "apron",
    "value": "Tag:aeroway=apron"
  },
  {
    "item": "Q247739",
    "label": "gate (airport)",
    "value": "Tag:aeroway=gate"
  },
  {
    "item": "Q192375",
    "label": "hangar",
    "value": "Tag:aeroway=hangar"
  },
  {
    "item": "Q534159",
    "label": "helipad",
    "value": "Tag:aeroway=helipad"
  },
  {
    "item": "Q502074",
    "label": "heliport",
    "value": "Tag:aeroway=heliport"
  },
  {
    "item": "Q782667",
    "label": "highway strip",
    "value": "Tag:aeroway=highway_strip"
  },
  {
    "item": "Q1353183",
    "label": "launch pad",
    "value": "Tag:aeroway=launchpad"
  },
  {
    "item": "Q475111",
    "label": "approach lighting system",
    "value": "Tag:aeroway=navigationaid"
  },
  {
    "item": "Q184590",
    "label": "runway",
    "value": "Tag:aeroway=runway"
  },
  {
    "item": "Q194188",
    "label": "spaceport",
    "value": "Tag:aeroway=spaceport"
  },
  {
    "item": "Q910386",
    "label": "taxiway",
    "value": "Tag:aeroway=taxiway"
  },
  {
    "item": "Q849706",
    "label": "airport terminal",
    "value": "Tag:aeroway=terminal"
  },
  {
    "item": "Q216346",
    "label": "windsock",
    "value": "Tag:aeroway=windsock"
  },
  {
    "item": "Q2655381",
    "label": "animal boarding",
    "value": "Tag:amenity=animal_boarding"
  },
  {
    "item": "Q1411287",
    "label": "animal shelter",
    "value": "Tag:amenity=animal_shelter"
  },
  {
    "item": "Q166118",
    "label": "archives",
    "value": "Tag:amenity=archive"
  },
  {
    "item": "Q2190251",
    "label": "arts centre",
    "value": "Tag:amenity=arts_centre"
  },
  {
    "item": "Q81235",
    "label": "automated teller machine",
    "value": "Tag:amenity=atm"
  },
  {
    "item": "Q1644347",
    "label": "audiologist",
    "value": "Tag:amenity=audiologist"
  },
  {
    "item": "Q745455",
    "label": "baby hatch",
    "value": "Tag:amenity=baby_hatch"
  },
  {
    "item": "Q36539",
    "label": "oven",
    "value": "Tag:amenity=baking_oven"
  },
  {
    "item": "Q18761864",
    "label": "bank building",
    "value": "Tag:amenity=bank"
  },
  {
    "item": "Q21073937",
    "label": "bank branch",
    "value": "Tag:amenity=bank"
  },
  {
    "item": "Q187456",
    "label": "bar",
    "value": "Tag:amenity=bar"
  },
  {
    "item": "Q853185",
    "label": "barbecue grill",
    "value": "Tag:amenity=bbq"
  },
  {
    "item": "Q1546788",
    "label": "barbecue",
    "value": "Tag:amenity=bbq"
  },
  {
    "item": "Q204776",
    "label": "bench",
    "value": "Tag:amenity=bench"
  },
  {
    "item": "Q16243822",
    "label": "bicycle parking",
    "value": "Tag:amenity=bicycle_parking"
  },
  {
    "item": "Q61663696",
    "label": "bicycle-sharing station",
    "value": "Tag:amenity=bicycle_rental"
  },
  {
    "item": "Q47519912",
    "label": "bicycle repair station",
   "value": "Tag:amenity=bicycle_repair_station"
  },
  {
    "item": "Q857909",
    "label": "beer garden",
    "value": "Tag:amenity=biergarten"
  },
  {
    "item": "Q25384001",
    "label": "boat rental",
    "value": "Tag:amenity=boat_rental"
  },
  {
    "item": "Q4931514",
    "label": "boat sharing",
    "value": "Tag:amenity=boat_sharing"
  },
  {
    "item": "Q131295",
    "label": "brothel",
    "value": "Tag:amenity=brothel"
  },
  {
    "item": "Q17005322",
    "label": "base transceiver station",
    "value": "Tag:amenity=bts"
  },
  {
    "item": "Q2002539",
    "label": "bureau de change",
    "value": "Tag:amenity=bureau_de_change"
  },
  {
    "item": "Q1191753",
    "label": "vehicle garage",
    "value": "Tag:amenity=bus_garage"
  },
  {
    "item": "Q494829",
    "label": "bus station",
    "value": "Tag:amenity=bus_station"
  },
  {
    "item": "Q30022",
    "label": "coffeehouse",
    "value": "Tag:amenity=cafe"
  },
  {
    "item": "Q47525548",
    "label": "car pooling facility",
    "value": "Tag:amenity=car_pooling"
  },
  {
    "item": "Q291240",
    "label": "car rental company",
    "value": "Tag:amenity=car_rental"
  },
  {
    "item": "Q847201",
    "label": "carsharing",
    "value": "Tag:amenity=car_sharing"
  },
  {
    "item": "Q1139861",
    "label": "car wash",
    "value": "Tag:amenity=car_wash"
  },
  {
    "item": "Q133215",
    "label": "casino",
    "value": "Tag:amenity=casino"
  },
  {
    "item": "Q15026",
    "label": "chair",
    "value": "Tag:amenity=chair"
  },
  {
    "item": "Q2140665",
    "label": "electric vehicle charging station",
    "value": "Tag:amenity=charging_station"
  },
  {
    "item": "Q1455871",
    "label": "child care",
    "value": "Tag:amenity=childcare"
  },
  {
    "item": "Q41253",
    "label": "movie theater",
    "value": "Tag:amenity=cinema"
  },
  {
    "item": "Q1774898",
    "label": "clinic",
    "value": "Tag:amenity=clinic"
  },
  {
    "item": "Q853854",
    "label": "clock tower",
    "value": "Tag:amenity=clock"
  },
  {
    "item": "Q188298",
    "label": "turret clock",
    "value": "Tag:amenity=clock"
  },
  {
    "item": "Q376",
    "label": "clock",
    "value": "Tag:amenity=clock"
  },
  {
    "item": "Q21822439",
    "label": "further education college",
    "value": "Tag:amenity=college"
  },
  {
    "item": "Q189004",
    "label": "college",
    "value": "Tag:amenity=college"
  },
  {
    "item": "Q77115",
    "label": "community center",
    "value": "Tag:amenity=community_centre"
  },
  {
    "item": "Q367885",
    "label": "village hall",
    "value": "Tag:amenity=community_centre"
  },
  {
    "item": "Q143746",
    "label": "compressed air",
    "value": "Tag:amenity=compressed_air"
  },
  {
    "item": "Q1060829",
    "label": "concert hall",
    "value": "Tag:amenity=concert_hall"
  },
  {
    "item": "Q1378975",
    "label": "convention center",
    "value": "Tag:amenity=conference_centre"
  },
  {
    "item": "Q1137809",
    "label": "courthouse",
    "value": "Tag:amenity=courthouse"
  },
  {
    "item": "Q869457",
    "label": "coworking",
    "value": "Tag:amenity=coworking_space"
  },
  {
    "item": "Q157570",
    "label": "crematorium",
    "value": "Tag:amenity=crematorium"
  },
  {
    "item": "Q192619",
    "label": "crypt",
    "value": "Tag:amenity=crypt"
  },
  {
    "item": "Q2979300",
    "label": "dental clinic",
    "value": "Tag:amenity=dentist"
  },
  {
    "item": "Q27349",
    "label": "dentist",
    "value": "Tag:amenity=dentist"
  },
  {
    "item": "Q3664857",
    "label": "dive center",
    "value": "Tag:amenity=dive_centre"
  },
  {
    "item": "Q718966",
    "label": "doctor's office",
    "value": "Tag:amenity=doctors"
  },
  {
    "item": "Q203609",
    "label": "dōjō",
    "value": "Tag:amenity=dojo"
  },
  {
    "item": "Q1630622",
    "label": "drinking fountain",
    "value": "Tag:amenity=drinking_water"
  },
  {
    "item": "Q1340098",
    "label": "driver's education",
    "value": "Tag:amenity=driving_school"
  },
  {
    "item": "Q3917681",
    "label": "embassy",
    "value": "Ta:amenity=embassy"
  },
  {
    "item": "Q641226",
    "label": "arena",
    "value": "Tag:amenity=events_centre"
  },
  {
    "item": "Q18674739",
    "label": "event venue",
    "value": "Tag:amenity=events_venue"
  },
  {
    "item": "Q57305",
    "label": "trade fair",
    "value": "Tag:amenity=exhibition_centre"
  },
  {
    "item": "Q81799",
    "label": "fast food",
    "value": "Tag:amenity=fast_food"
  },
  {
    "item": "Q1814211",
    "label": "friterie",
    "value": "Tag:amenity=fast_food"
  },
  {
    "item": "Q1751429",
    "label": "fast food restaurant",
    "value": "Tag:amenity=fast_food"
  },
  {
    "item": "Q25207165",
    "label": "feeder",
    "value": "Tag:amenity=feeding_place"
  },
  {
    "item": "Q2673976",
    "label": "manger",
    "value": "Tag:amenity=feeding_place"
  },
  {
    "item": "Q1478783",
    "label": "ferry port",
    "value": "Tag:amenity=ferry_terminal"
  },
  {
    "item": "Q873442",
    "label": "asset management",
    "value": "Tag:amenity=financial_advice"
  },
  {
    "item": "Q1195942",
    "label": "fire station",
    "value": "Tag:amenity=fire_station"
  },
  {
    "item": "Q869381",
    "label": "flowerpot",
    "value": "Tag:amenity=flowerpot"
  },
  {
    "item": "Q1192284",
    "label": "food court",
    "value": "Tag:amenity=food_court"
  },
  {
    "item": "Q483453",
    "label": "fountain",
    "value": "Tag:amenity=fountain"
  },
  {
    "item": "Q205495",
    "label": "gas station",
    "value": "Tag:amenity=fuel"
  },
  {
    "item": "Q98785614",
    "label": "funeral hall",
    "value": "Tag:amenity=funeral_hall"
  },
  {
    "item": "Q47520173",
    "label": "gambling facility",
    "value": "Tag:amenity=gambling"
  },
  {
    "item": "Q5500199",
    "label": "free box",
    "value": "Tag:amenity=give_box"
  },
  {
    "item": "Q2878124",
    "label": "grit bin",
    "value": "Tag:amenity=grit_bin"
  },
  {
    "item": "Q1065656",
    "label": "health club",
    "value": "Tag:amenity=gym"
  },
  {
    "item": "Q1489454",
    "label": "harbourmaster",
    "value": "Tag:amenity=harbourmaster"
  },
  {
    "item": "Q608152",
    "label": "hospice",
    "value": "Tag:amenity=hospice"
  },
  {
    "item": "Q16917",
    "label": "hospital",
    "value": "Tag:amenity=hospital"
  },
  {
    "item": "Q1279822",
    "label": "shooting stand",
    "value": "Tag:amenity=hunting_stand"
  },
  {
    "item": "Q1311064",
    "label": "ice cream parlor",
    "value": "Tag:amenity=ice_cream"
  },
  {
    "item": "Q272399",
    "label": "internet café",
    "value": "Tag:amenity=internet_cafe"
  },
  {
    "item": "Q261362",
    "label": "employment agency",
    "value": "Tag:amenity=jobcentre"
  },
  {
    "item": "Q910635",
    "label": "karaoke box",
    "value": "Tag:amenity=karaoke_box"
  },
  {
    "item": "Q126807",
    "label": "kindergarten",
    "value": "Tag:amenity=kindergarten"
  },
  {
    "item": "Q47520281",
    "label": "public kitchen",
    "value": "Tag:amenity=kitchen"
  },
  {
    "item": "Q1750760",
    "label": "Kneipp Cure",
    "value": "Tag:amenity=kneipp_water_cure"
  },
  {
    "item": "Q897403",
    "label": "language school",
    "value": "Tag:amenity=language_school"
  },
  {
    "item": "Q1587360",
    "label": "letter box",
    "value": "Tag:amenity=letter_box"
  },
  {
    "item": "Q7075",
    "label": "library",
    "value": "Tag:amenity=library"
  },
  {
    "item": "Q587334",
    "label": "lifebuoy",
    "value": "Tag:amenity=life_ring"
  },
  {
    "item": "Q11997323",
    "label": "lifeboat station",
    "value": "Tag:amenity=lifeboat_station"
  },
  {
    "item": "Q1799919",
    "label": "loading dock",
    "value": "Tag:amenity=loading_dock"
  },
  {
    "item": "Q971929",
    "label": "sex hotel",
    "value": "Tag:amenity=love_hotel"
  },
  {
    "item": "Q186685",
    "label": "marae",
    "value": "Tag:amenity=marae"
  },
  {
    "item": "Q330284",
    "label": "marketplace",
    "value": "Tag:amenity=marketplace"
  },
  {
    "item": "Q720920",
    "label": "bookmobile",
    "value": "Tag:amenity=mobile_library"
  },
  {
    "ite": "Q44613",
    "label": "monastery",
    "value": "Tag:amenity=monastery"
  },
  {
    "item": "Q6451172",
    "label": "morgue",
    "value": "Tag:amenity=mortuary"
  },
  {
    "item": "Q47520009",
    "label": "motorcycle parking",
    "value": "Tag:amenity=motorcycle_parking"
  },
  {
    "item": "Q1021290",
    "label": "music school",
    "value": "Tag:amenity=music_school"
  },
  {
    "item": "Q8719053",
    "label": "music venue",
    "value": "Tag:amenity=music_venue"
  },
  {
    "item": "Q622425",
    "label": "nightclub",
    "value": "Tag:amenity=nightclub"
  },
  {
    "item": "Q837142",
    "label": "nursing home",
    "value": "Tag:amenity=nursing_home"
  },
  {
    "item": "Q6501349",
    "label": "parking lot",
    "value": "Tag:amenity=parking"
  },
  {
    "item": "Q47520013",
    "label": "parking entrance",
    "value": "Tag:amenity=parking_entrance"
  },
  {
    "item": "Q1433633",
    "label": "parking space",
    "value": "Tag:amenity=parking_space"
  },
  {
    "item": "Q7138926",
    "label": "parliament building",
    "value": "Tag:amenity=parliament"
  },
  {
    "item": "Q13107184",
    "label": "pharmacy",
    "value": "Tag:amenity=pharmacy"
  },
  {
    "item": "Q494312",
    "label": "photo booth",
    "value": "Tag:amenity=photo_booth"
  },
  {
    "item": "Q1370598",
    "label": "place of worship",
    "value": "Tag:amenity=place_of_worship"
  },
  {
    "item": "Q148319",
    "label": "planetarium",
    "value": "Tag:amenity=planetarium"
  },
  {
    "item": "Q861951",
    "label": "police station",
    "value": "Tag:amenity=police"
  },
  {
    "item": "Q49844",
    "label": "post box",
    "value": "Tag:amenity=post_box"
  },
  {
    "item": "Q35054",
    "label": "post office",
    "value": "Tag:amenity=post_office"
  },
  {
    "item": "Q82",
    "label": "printer",
    "value": "Tag:amenity=printer"
  },
  {
    "item": "Q40357",
    "label": "prison",
    "value": "Tag:amenity=prison"
  },
  {
    "item": "Q212198",
    "label": "pub",
    "value": "Tag:amenity=pub"
  },
  {
    "item": "Q785952",
    "label": "public bath",
    "value": "Tag:amenity=public_bath"
  },
  {
    "item": "Q294297",
    "label": "public bookcase",
    "value": "Tag:amenity=public_bookcase"
  },
  {
    "item": "Q294422",
    "label": "public building",
    "value": "Tag:amenity=public_building"
  },
  {
    "item": "Q36728566",
    "label": "ranger station",
    "value": "Tag:amenity=ranger_station"
  },
  {
    "item": "Q47520309",
    "label": "recycling facility",
    "value": "Tag:amenity=recycling"
  },
  {
    "item": "Q98820128",
    "label": "rescue station",
    "value": "Tag:amenity=rescue_station"
  },
  {
    "item": "Q11707",
    "label": "restaurant",
    "value": "Tag:amenity=restaurant"
  },
  {
    "item": "Q47520332",
    "label": "sanitary dump station",
    "value": "Tag:amenity=sanitary_dump_station"
  },
  {
    "item": "Q57036",
    "label": "sauna",
    "value": "Tag:amenity=sauna"
  },
  {
    "item": "Q3914",
    "label": "school",
    "value": "Tag:amenity=school"
  },
  {
    "item": "Q1976594",
    "label": "science park",
    "value": "Tag:amenity=science_park"
  },
  {
    "item": "Q2207370",
    "label": "seat",
    "value": "Tag:amenity=seat"
  },
  {
    "item": "Q7493941",
    "label": "shelter",
    "value": "Tag:amenity=shelter"
  },
  {
    "item": "Q7863",
    "label": "shower",
    "value": "Tag:amenity=shower"
  },
  {
    "item": "Q7863",
    "label": "shower",
    "value": "Tag:amenity=showers"
  },
  {
    "item": "Q8536775",
    "label": "social center",
    "value": "Tag:amenity=social_center"
  },
  {
    "item": "Q8536775",
    "label": "social center",
    "value": "Tag:amenity=social_centre"
  },
  {
    "item": "Q837142",
    "label": "nursing home",
    "value": "Tag:amenity=social_facility"
  },
  {
    "item": "Q22908",
    "label": "retirement home",
    "value": "Tag:amenity=social_facility"
  },
  {
    "item": "Q47520019",
    "label": "social facility",
    "value": "Tag:amenity=social_facility"
  },
  {
    "item": "Q915063",
    "label":"sorting office",
    "value": "Tag:amenity=sorting_office"
  },
  {
    "item": "Q214252",
    "label": "stable",
    "value": "Tag:amenity=stables"
  },
  {
    "item": "Q11691",
    "label": "stock exchange",
    "value": "Tag:amenity=stock_exchange"
  },
  {
    "item": "Q15026",
    "label": "chair",
    "value": "Tag:amenity=stool"
  },
  {
    "item": "Q6586445",
    "label": "strip club",
    "value": "Tag:amenity=stripclub"
  },
  {
    "item": "Q3661265",
    "label": "hall of residence",
    "value": "Tag:amenity=student_accommodation"
  },
  {
    "item": "Q19364326",
    "label": "media studio facility",
    "value": "Tag:amenity=studio"
  },
  {
    "item": "Q1501",
    "label": "swimming pool",
    "value": "Tag:amenity=swimming_pool"
  },
  {
    "item": "Q336078",
    "label": "sex club",
    "value": "Tag:amenity=swingerclub"
  },
  {
    "item": "Q14748",
    "label": "table",
    "value": "Tag:amenity=table"
  },
  {
    "item": "Q1395196",
    "label": "taxicab stand",
    "value": "Tag:amenity=taxi"
  },
  {
    "item": "Q11035",
    "label": "telephone",
    "value": "Tag:amenity=telephone"
  },
  {
    "item": "Q900977",
    "label": "payphone",
    "value": "Tag:amenity=telephone"
  },
  {
    "item": "Q11635",
    "label": "theater",
    "value": "Tag:amenity=theatre"
  },
  {
    "item": "Q24354",
    "label": "theater",
    "value": "Tag:amenity=theatre"
  },
  {
    "item": "Q1345575",
    "label": "ticket validator",
    "value": "Tag:amenity=ticket_validator"
  },
  {
    "item": "Q813966",
    "label": "public toilet",
    "value": "Tag:amenity=toilets"
  },
  {
    "item": "Q543654",
    "label": "city hall",
    "value": "Tag:amenity=townhall"
  },
  {
    "item": "Q1143018",
    "label": "toy library",
    "value": "Tag:amenity=toy_library"
  },
  {
    "item": "Q98643064",
    "label": "shopping cart shelter",
    "value": "Tag:amenity=trolley_bay"
  },
  {
    "item": "Q3918",
    "label": "university",
    "value": "Tag:amenity=university"
  },
  {
    "item": "Q978659",
    "label": "vehicle inspection",
    "value": "Tag:amenity=vehicle_inspection"
  },
  {
    "item": "Q211584",
    "label": "vending machine",
    "value": "Tag:amenity=vending_machine"
  },
  {
    "item": "Q202883",
    "label": "veterinarian",
    "value": "Tag:amenity=veterinary"
  },
  {
    "item": "Q216530",
    "label": "waste container",
    "value": "Tag:amenity=waste_basket"
  },
  {
    "item": "Q47520407",
    "label": "waste transfer station",
    "value": "Tag:amenity=waste_transfer_station"
  },
  {
    "item": "Q47520398",
    "label": "water point",
    "value": "Tag:amenity=water_point"
  },
  {
    "item": "Q7617920",
    "label": "stock tank",
    "value": "Tag:amenity=watering_place"
  },
  {
    "item": "Q932689",
    "label": "abreuvoir",
    "value": "Tag:amenity=watering_place"
  },
  {
    "item": "Q11412052",
    "label": "truck scale",
    "value": "Tag:amenity=weighbridge"
  },
  {
    "item": "Q7171565",
    "label": "pet adoption",
    "value": "Tag:animal_shelter:adoption=yes"
  },
  {
    "item": "Q69676094",
    "label": "animal release",
    "value": "Tag:animal_shelter:release=yes"
  },
  {
    "item": "Q1533036",
    "label": "animal sanctuary",
    "value": "Tag:animal_shelter:sanctuary=yes"
  },
  {
    "item": "Q4378237",
    "label": "Trivision",
    "value": "Tag:animated=trivision_blades"
  },
  {
    "item": "Q928357",
    "label": "bronze sculpture",
    "value": "Tag:artwork:material=bronze"
  },
  {
    "item": "Q12271",
    "label": "architecture",
    "value": "Tag:artwork_type=architecture"
  },
  {
    "item": "Q3179385",
    "label": "azulejo",
    "value": "Tag:artwork_type=azulejo"
  },
  {
    "item": "Q17489160",
    "label": "bust",
    "value": "Tag:artwork_type=bust"
  },
  {
    "item": "Q241045",
    "label": "portrait at bust length",
    "value": "Tag:artwork_type=bust"
  },
  {
    "item": "Q17514",
    "label": "graffiti",
    "value": "Tag:artwork_type=graffiti"
  },
  {
    "item": "Q20437094",
    "label": "installation",
    "value": "Tag:artwork_type=installation"
  },
  {
    "item": "Q219423",
    "label": "mural",
    "value": "Tag:artwork_type=mural"
  },
  {
    "item": "Q3305213",
    "label": "painting",
    "value": "Tag:artwork_type=painting"
  },
  {
    "item": "Q245117",
    "label": "relief sculpture",
    "value": "Tag:artwork_type=relief"
  },
  {
    "item": "Q860861",
    "label": "sculpture",
    "value": "Tag:artwork_type=sculpture"
  },
  {
    "item": "Q179700",
    "label": "statue",
    "value": "Tag:artwork_type=statue"
  },
  {
    "item": "Q468402",
    "label": "tile",
    "value": "Tag:artwork_type=tilework"
  },
  {
    "item": "Q2920296",
    "label": "captivity",
    "value": "Tag:attraction=animal"
  },
  {
    "item": "Q1934961",
    "label": "dark ride",
    "value": "Tag:attraction=dark_ride"
  },
  {
    "item": "Q204832",
    "label": "roller coaster",
    "value": "Tag:attraction=roller_coaster"
  },
  {
    "item": "Q3266345",
    "label": "alpine slide",
    "value": "Tag:attraction=summer_toboggan"
  },
  {
    "item": "Q1148389",
    "label": "bollard",
    "value": "Tag:barrier=bollard"
  },
  {
    "item": "Q218719",
    "label": "border control",
    "value": "Tag:barrier=border_control"
  },
  {
    "item": "Q4997309",
    "label": "bump gate",
    "value": "Tag:barrier=bump_gate"
  },
  {
    "item": "Q251013",
    "label": "bus trap",
    "value": "Tag:barrier=bus_trap"
  },
  {
    "item": "Q2520860",
    "label": "cable barrier",
    "value": "Tag:barrier=cable_barrier"
  },
  {
    "item": "Q2164694",
    "label": "cattle grid",
    "value": "Tag:barrier=cattle_grid"
  },
  {
    "item": "Q16748868",
    "label": "city walls",
    "value": "Tag:barrier=city_wall"
  },
  {
    "item": "Q1661732",
    "label": "Pedestrian chicane",
    "value": "Tag:barrier=cycle_barrier"
  },
  {
    "item": "Q148571",
    "label": "fence",
    "value": "Tag:barrier=fence"
  },
  {
    "item": "Q53060",
    "label": "gate",
    "value": "Tag:barrier=gate"
  },
  {
    "item": "Q1344551",
    "label": "traffic barrier",
    "value": "Tag:barrier=guard_rail"
  },
  {
    "item": "Q867269",
    "label": "ha-ha",
    "value": "Tag:barrier=haha"
  },
  {
    "item": "Q235779",
    "label": "hedge",
    "value": "Tag:barrier=hedge"
  },
  {
    "item": "Q91975076",
    "label": "height barrier",
    "value": "Tag:barrier=height_restrictor"
  },
  {
    "item": "Q2300314",
    "label": "Jersey barrier",
    "value": "Tag:barrier=jersey_barrier"
  },
  {
    "item": "Q37442",
    "label": "curb",
    "value": "Tag:barrier=kerb"
  },
  {
    "item": "Q1521153",
    "label": "kissing gate",
    "value": "Tag:barrier=kissing_gate"
  },
  {
    "item": "Q852010",
    "label": "boom barrier",
    "value": "Tag:barrier=lift_gate"
  },
  {
    "item": "Q808926",
    "label": "barrier free",
    "value": "Tag:barrier=no"
  },
  {
    "item": "Q1076291",
    "label": "retaining wall",
    "value": "Tag:barrier=retaining_wall"
  },
  {
    "item": "Q15930902",
    "label": "sally port",
    "value": "Tag:barrier=sally_port"
  },
  {
    "item": "Q1698460",
    "label": "spike strip",
    "value": "Tag:barrier=spikes"
  },
  {
    "item": "Q53996838",
    "label": "step",
    "value": "Tag:barrier=step"
  },
  {
    "item": "Q166557",
    "label": "stile",
    "value": "Tag:barrier=stile"
  },
  {
    "item": "Q7638033",
    "label": "Sump buster",
    "value": "Tag:barrier=sump_buster"
  },
  {
    "item": "Q1364150",
    "label": "toll booth",
    "value": "Tag:barrier=toll_booth"
  },
  {
    "item": "Q1146283",
    "label": "turnstile",
    "value": "Tag:barrier=turnstile"
  },
  {
    "item": "Q42948",
    "label": "wall",
    "value": "Tag:barrier=wall"
  },
  {
    "item": "Q171038",
    "label": "softball",
    "value": "Tag:baseball=softball"
  },
  {
    "item": "Q3500933",
    "label": "detention basin",
    "value": "Tag:basin=detention"
  },
  {
    "item": "Q2137499",
    "label": "Infiltration basin",
    "value": "Tag:basin=infiltration"
  },
  {
    "item": "Q1413117",
    "label": "retention basin",
    "value": "Tag:basin=retention"
  },
  {
    "item": "Q28077",
    "label": "hammam",
    "value": "Tag:bath:type=hammam"
  },
  {
    "item": "Q66361472",
    "label": "bikes not allowed",
    "value": "Tag:bicycle=no"
  },
  {
    "item": "Q1151556",
    "label": "bicycle parking station",
    "value": "Tag:bicycle_parking=building"
  },
  {
    "item": "Q1392526",
    "label": "bicycle stand",
    "value": "Tag:bicycle_parking=stands"
  },
  {
    "item": "Q42523",
    "label": "atoll",
    "value": "Tag:biotic_reef:type=atoll"
  },
  {
    "item": "Q4078911",
    "label": "barrier reef",
    "value": "Tag:biotic_reef:type=barrier"
  },
  {
    "item": "Q1999990",
    "label": "fringing reef",
    "value": "Tag:biotic_reef:type=fringing"
  },
  {
    "item": "Q128033",
    "label": "Esperanto literature",
    "value": "Tag:books:language:eo=yes"
  },
  {
    "item": "Q28575",
    "label": "county",
    "value": "Tag:border_type=county"
  },
  {
    "item": "Q1839674",
    "label": "lands inhabited by indigenous peoples",
    "value": "Tag:boundary=aboriginal_lands"
  },
  {
    "item": "Q56061",
    "label": "administrative territorial entity",
    "value": "Tag:boundary=administrative"
  },
  {
    "item": "Q15042037",
    "label": "statistical territorial entity",
    "value": "Tag:boundary=census"
  },
  {
    "item": "Q498162",
    "label": "census-designated place",
    "value": "Tag:boundary=census"
  },
  {
    "item": "Q180673",
    "label": "ceremonial county of England",
    "value": "Tag:boundary=ceremonial"
  },
  {
    "item": "Q4976993",
    "label": "civil parish",
    "value": "Tag:boundary=civil_parish"
  },
  {
    "item": "Q15239622",
    "label": "disputed territory",
    "value": "Tag:boundary=disputed"
  },
  {
    "item": "Q3089219",
    "label": "maritime boundary",
    "value": "Tag:boundary=maritime"
  },
  {
    "item": "Q921099",
    "label": "boundary marker",
    "value": "Tag:boundary=marker"
  },
  {
    "item": "Q46169",
    "label": "national park",
    "value": "Tag:boundary=national_park"
  },
  {
    "item": "Q192611",
    "label": "electoral district",
    "value": "Tag:boundary=political"
  },
  {
    "item": "Q473972",
    "label": "protected area",
    "value": "Tag:boundary=protected_area"
  },
  {
    "item": "Q494978",
    "label": "special economic zone",
    "value": "Tag:boundary=special_economic_zone"
  },
  {
    "item": "Q7925010",
    "label": "vice-county",
    "value": "Tag:boundary=vice_county"
  },
  {
    "item": "Q96758296",
    "label": "SB-Tank",
    "value": "Tag:brand=SB_Tank"
  },
  {
    "item": "Q911663",
    "label": "bascule bridge",
    "value": "Tag:bridge:movable=bascule"
  },
  {
    "item": "Q1898246",
    "label": "vertical-lift bridge",
    "value": "Tag:bridge:movable=lift"
  },
  {
    "item": "Q1758233",
    "label": "retractable bridge",
    "value": "Tag:bridge:movable=retractable"
  },
  {
    "item": "Q1143769",
    "label": "submersible bridge",
    "value": "Tag:bridge:movable=submersible"
  },
  {
    "item": "Q144492",
    "label": "tilt bridge",
    "value":"Tag:bridge:movable=tilt"
  },
  {
    "item": "Q506412",
    "label": "transporter bridge",
    "value": "Tag:bridge:movable=transporter"
  },
  {
    "item": "Q950431",
    "label": "swing bridge",
    "value": "Tag:bridge:moveable=swing"
  },
  {
    "item": "Q158438",
    "label": "arch bridge",
    "value": "Tag:bridge:structure=arch"
  },
  {
    "item": "Q158626",
    "label": "beam bridge",
    "value": "Tag:bridge:structure=beam"
  },
  {
    "item": "Q158555",
    "label": "cable-stayed bridge",
    "value": "Tag:bridge:structure=cable-stayed"
  },
  {
    "item": "Q2104072",
    "label": "pontoon bridge",
    "value": "Tag:bridge:structure=floating"
  },
  {
    "item": "Q5941243",
    "label": "Humpback bridge",
    "value": "Tag:bridge:structure=humpback"
  },
  {
    "item": "Q3916505",
    "label": "simple suspension bridge",
    "value": "Tag:bridge:structure=simple-suspension"
  },
  {
    "item": "Q12570",
    "label": "suspension bridge",
    "value": "Tag:bridge:structure=suspension"
  },
  {
    "item": "Q158218",
    "label": "truss bridge",
    "value": "Tag:bridge:structure=truss"
  },
  {
    "item": "Q18870689",
    "label": "aqueduct",
    "value": "Tag:bridge=aqueduct"
  },
  {
    "item": "Q11111030",
    "label": "boardwalk",
    "value": "Tag:bridge=boardwalk"
  },
  {
    "item": "Q1429218",
    "label": "cantilever bridge",
    "value": "Tag:bridge=cantilever"
  },
  {
    "item": "Q1825472",
    "label": "covered bridge",
    "value": "Tag:bridge=covered"
  },
  {
    "item": "Q787417",
    "label": "moveable bridge",
    "value": "Tag:bridge=movable"
  },
  {
    "item": "Q653401",
    "label": "trestle bridge",
    "value": "Tag:bridge=trestle"
  },
  {
    "item": "Q181348",
    "label": "viaduct",
    "value": "Tag:bridge=viaduct"
  },
  {
    "item": "Q2502622",
    "label": "bicycle bridge",
    "value": "Tag:bridge=yes"
  },
  {
    "item": "Q12720942",
    "label": "Art Deco architecture",
    "value": "Tag:building:architecture=art_deco"
  },
  {
    "item": "Q34636",
    "label": "Art Nouveau",
    "value": "Tag:building:architecture=art_nouveau"
  },
  {
    "item": "Q330369",
    "label": "Arts and Crafts movement",
    "value": "Tag:building:architecture=arts_and_crafts"
  },
  {
    "item": "Q840829",
    "label": "baroque architecture",
    "value": "Tag:building:architecture=barocco"
  },
  {
    "item": "Q840829",
    "label": "baroque architecture",
    "value": "Tag:building:architecture=baroque"
  },
  {
    "item": "Q911397",
    "label": "Baroque Revival architecture",
    "value": "Tag:building:architecture=baroque_revival"
  },
  {
    "item": "Q124354",
    "label": "Bauhaus",
    "value": "Tag:building:architecture=bauhaus"
  },
  {
    "item": "Q1268134",
    "label": "Beaux-Arts",
    "value": "Tag:building:architecture=beaux-arts"
  },
  {
    "item": "Q1268134",
    "label": "Beaux-Arts",
    "value": "Tag:building:architecture=beaux_arts"
  },
  {
    "item": "Q468050",
    "label": "Brick Expressionism",
    "value": "Tag:building:architecture=brick_expressionism"
  },
  {
    "item": "Q47591",
    "label": "Byzantine architecture",
    "value": "Tag:building:architecture=byzantine"
  },
  {
    "item": "Q5148367",
    "label": "Colonial Revival architecture",
    "value": "Tag:building:architecture=colonial_revival"
  },
  {
    "item": "Q238255",
    "label": "deconstructivism",
    "value": "Tag:building:architecture=deconstructivism"
  },
  {
    "item": "Q5317261",
    "label": "Dutch Colonial architecture",
    "value": "Tag:building:architecture=dutch_colonial"
  },
  {
    "item": "Q5317260",
    "label": "Dutch Colonial Revival architecture",
    "value": "Tag:building:architecture=dutch_colonial_revival"
  },
  {
    "item": "Q1148060",
    "label": "expressionist architecture",
    "value": "Tag:building:architecture=expressionism"
  },
  {
    "item": "Q1400086",
    "label": "Federal architecture",
    "value": "Tag:building:architecture=federal"
  },
  {
    "item": "Q174419",
    "label": "Napoleon III style",
    "value": "Tag:building:architecture=french_second_empire"
  },
  {
    "item": "Q47942",
    "label": "functionalism",
    "value": "Tag:building:architecture=functionalism"
  },
  {
    "item": "Q1125300",
    "label": "Georgian architecture",
    "value": "Tag:building:architecture=georgian"
  },
  {
    "item": "Q20897878",
    "label": "Georgian Revival architecture",
    "value": "Tag:building:architecture=georgian_revival"
  },
  {
    "item": "Q186363",
    "label": "Gothic Revival architecture",
    "value": "Tag:building:architecture=gothic_revival"
  },
  {
    "item": "Q1513688",
    "label": "Greek Revival architecture",
    "value": "Tag:building:architecture=greek_revival"
  },
  {
    "item": "Q1595728",
    "label": "Heimatstil",
    "value": "Tag:building:architecture=heimatstil"
  },
  {
    "item": "Q845318",
    "label": "high-tech architecture",
    "value": "Tag:building:architecture=high-tech"
  },
  {
    "item": "Q5757358",
    "label": "High Victorian Gothic",
    "value": "Tag:building:architecture=high_victorian_gothic"
  },
  {
    "item": "Q51879601",
    "label": "historicist architecture",
    "value": "Tag:building:architecture=historicism"
  },
  {
    "item": "Q162324",
    "label": "International Style",
    "value": "Tag:building:architecture=international_style"
  },
  {
    "item": "Q212940",
    "label": "Islamic architecture",
    "value": "Tag:building:architecture=islamic"
  },
  {
    "item": "Q1404472",
    "label": "Italian Renaissance",
    "value": "Tag:building:architecture=italian_renaissance"
  },
  {
    "item": "Q28179",
    "label": "Joseon",
    "value": "Tag:building:architecture=joseon"
  },
  {
    "item": "Q1294605",
    "label": "Jugendstil",
    "value": "Tag:building:architecture=jugendstil"
  },
  {
    "item": "Q10924220",
    "label": "late Gothic",
    "value": "Tag:building:architecture=late_gothic"
  },
  {
    "item": "Q7937337",
    "label": "Mediterranean Revival architecture",
    "value": "Tag:building:architecture=mediterranean_revival"
  },
  {
    "item": "Q911397",
    "label": "Baroque Revival architecture",
    "value": "Tag:building:architecture=neo-baroque"
  },
  {
    "item": "Q966571",
    "label": "Byzantine Revival architecture",
    "value": "Tag:building:architecture=neo-byzantine"
  },
  {
    "item": "Q54111",
    "label": "Neoclassical architecture",
    "value": "Tag:building:architecture=neo-classicism"
  },
  {
    "item": "Q186363",
    "label": "Gothic Revival architecture",
    "value": "Tag:building:architecture=neo-gothic"
  },
  {
    "item": "Q502163",
    "label": "Renaissance Revival architecture",
    "value": "Tag:building:architecture=neo-renaissance"
  },
  {
    "item": "Q744373",
    "label": "Romanesque Revival architecture",
    "value": "Tag:building:architecture=neo-romanesque"
  },
  {
    "item": "Q17012219",
    "label": "neo-futurism",
    "value": "Tag:building:architecture=neo_futurism"
  },
  {
    "item": "Q614624",
    "label": "Neo-Mudéjar",
    "value": "Tag:building:architecture=neo_mudejar"
  },
  {
    "item": "Q911397",
    "label": "Baroque Revival architecture",
    "value": "Tag:building:architecture=neobarocco"
  },
  {
    "item": "Q54111",
    "label": "Neoclassical architecture",
    "value": "Tag:building:architecture=neoclassical"
  },
  {
    "item": "Q54111",
    "label": "Neoclassical architecture",
    "value": "Tag:building:architecture=neoclassicism"
  },
  {
    "item": "Q14378",
    "label": "neoclassicism",
    "value": "Tag:building:architecture=neoclassicism"
  },
  {
    "item": "Q2600188",
    "lael": "Russian architecture",
    "value": "Tag:building:architecture=oldrussian"
  },
  {
    "item": "Q74156",
    "label": "Moorish Revival architecture",
    "value": "Tag:building:architecture=orientalist"
  },
  {
    "item": "Q527449",
    "label": "Ottoman architecture",
    "value": "Tag:building:architecture=ottoman"
  },
  {
    "item": "Q595448",
    "label": "Postmodern architecture",
    "value": "Tag:building:architecture=post_modern"
  },
  {
    "item": "Q1967635",
    "label": "Postconstructivism",
    "value": "Tag:building:architecture=postconstructivism"
  },
  {
    "item": "Q595448",
    "label": "Postmodern architecture",
    "value": "Tag:building:architecture=postmodern"
  },
  {
    "item": "Q595448",
    "label": "Postmodern architecture",
    "value": "Tag:building:architecture=postmodernism"
  },
  {
    "item": "Q529819",
    "label": "Queen Anne style architecture",
    "value": "Tag:building:architecture=queen_anne"
  },
  {
    "item": "Q2535546",
    "label": "rationalism",
    "value": "Tag:building:architecture=rationalism"
  },
  {
    "item": "Q236122",
    "label": "Renaissance architecture",
    "value": "Tag:building:architecture=renaissance"
  },
  {
    "item": "Q502163",
    "label": "Renaissance Revival architecture",
    "value": "Tag:building:architecture=renaissance_revival"
  },
  {
    "item": "Q122960",
    "label": "Rococo",
    "value": "Tag:building:architecture=rococo"
  },
  {
    "item": "Q744373",
    "label": "Romanesque Revival architecture",
    "value": "Tag:building:architecture=romanesque_revival"
  },
  {
    "item": "Q174419",
    "label": "Napoleon III style",
    "value": "Tag:building:architecture=second_empire"
  },
  {
    "item": "Q12069738",
    "label": "Spanish Colonial architecture",
    "value": "Tag:building:architecture=spanish_colonial"
  },
  {
    "item": "Q1134824",
    "label": "Stalinist architecture",
    "value": "Tag:building:architecture=stalinist_neoclassicism"
  },
  {
    "item": "Q928960",
    "label": "Streamline Moderne",
    "value": "Tag:building:architecture=streamline_moderne"
  },
  {
    "item": "Q509364",
    "label": "Tudor architecture",
    "value": "Tag:building:architecture=tudor"
  },
  {
    "item": "Q7851317",
    "label": "Tudor Revival architecture",
    "value": "Tag:building:architecture=tudor_revival"
  },
  {
    "item": "Q19311731",
    "label": "Q19311731",
    "value": "Tag:building:architecture=wilhelminian_style"
  },
  {
    "item": "Q41955438",
    "label": "brick building",
    "value": "Tag:building:material=brick"
  },
  {
    "item": "Q40089",
    "label": "brick",
    "value": "Tag:building:material=brick"
  },
  {
    "item": "Q22657",
    "label": "concrete",
    "value": "Tag:building:material=concrete"
  },
  {
    "item": "Q12020836",
    "label": "timber-framed house",
    "value": "Tag:building:material=timber_framing"
  },
  {
    "item": "Q1791429",
    "label": "conservatory",
    "value": "Tag:building:part=conservatory"
  },
  {
    "item": "Q47525299",
    "label": "allotment house",
    "value": "Tag:building=allotment_house"
  },
  {
    "item": "Q13402009",
    "label": "apartment building",
    "value": "Tag:building=apartments"
  },
  {
    "item": "Q798436",
    "label": "bakehouse",
    "value": "Tag:building=bakehouse"
  },
  {
    "item": "Q1303167",
    "label": "barn",
    "value": "Tag:building=barn"
  },
  {
    "item": "Q200334",
    "label": "bell tower",
    "value": "Tag:building=bell_tower"
  },
  {
    "item": "Q1777951",
    "label": "boathouse",
    "value": "ag:building=boathouse"
  },
  {
    "item": "Q57778855",
    "label": "brewery building",
    "value": "Tag:building=brewery"
  },
  {
    "item": "Q850107",
    "label": "bungalow",
    "value": "Tag:building=bungalow"
  },
  {
    "item": "Q91122",
    "label": "bunker",
    "value": "Tag:building=bunker"
  },
  {
    "item": "Q695207",
    "label": "joined-log structure",
    "value": "Tag:building=cabin"
  },
  {
    "item": "Q1044817",
    "label": "carport",
    "value": "Tag:building=carport"
  },
  {
    "item": "Q2977",
    "label": "cathedral",
    "value": "Tag:building=cathedral"
  },
  {
    "item": "Q108325",
    "label": "chapel",
    "value": "Tag:building=chapel"
  },
  {
    "item": "Q16970",
    "label": "church building",
    "value": "Tag:building=church"
  },
  {
    "item": "Q52177058",
    "label": "civic building",
    "value": "Tag:building=civic"
  },
  {
    "item": "Q189004",
    "label": "college",
    "value": "Tag:building=college"
  },
  {
    "item": "Q655686",
    "label": "commercial building",
    "value": "Tag:building=commercial"
  },
  {
    "item": "Q161851",
    "label": "condominium",
    "value": "Tag:building=condominium"
  },
  {
    "item": "Q1791429",
    "label": "conservatory",
    "value": "Tag:building=conservatory"
  },
  {
    "item": "Q12377751",
    "label": "under construction",
    "value": "Tag:building=construction"
  },
  {
    "item": "Q1128503",
    "label": "container building",
    "value": "Tag:building=container"
  },
  {
    "item": "Q681337",
    "label": "cowshed",
    "value": "Tag:building=cowshed"
  },
  {
    "item": "Q671224",
    "label": "data center",
    "value": "Tag:building=data_center"
  },
  {
    "item": "Q1307276",
    "label": "single-family detached home",
    "value": "Tag:building=detached"
  },
  {
    "item": "Q65464996",
    "label": "biogas plant",
    "value": "Tag:building=digester"
  },
  {
    "item": "Q847950",
    "label": "dormitory",
    "value": "Tag:building=dormitory"
  },
  {
    "item": "Q1137365",
    "label": "entrance",
    "value": "Tag:building=entrance"
  },
  {
    "item": "Q489357",
    "label": "farmhouse",
    "value": "Tag:building=farm"
  },
  {
    "item": "Q10480682",
    "label": "agricultural structure",
    "value": "Tag:building=farm_auxiliary"
  },
  {
    "item": "Q210077",
    "label": "baptistery",
    "value": "Tag:building=font"
  },
  {
    "item": "Q22733",
    "label": "garage",
    "value": "Tag:building=garage"
  },
  {
    "item": "Q22733",
    "label": "garage",
    "value": "Tag:building=garages"
  },
  {
    "item": "Q47525060",
    "label": "garbage shed",
    "value": "Tag:building=garbage_shed"
  },
  {
    "item": "Q1796966",
    "label": "grandstand",
    "value": "Tag:building=grandstand"
  },
  {
    "item": "Q165044",
    "label": "greenhouse",
    "value": "Tag:building=greenhouse"
  },
  {
    "item": "Q1349167",
    "label": "ground station",
    "value": "Tag:building=ground_station"
  },
  {
    "item": "Q192375",
    "label": "hangar",
    "value": "Tag:building=hangar"
  },
  {
    "item": "Q39364723",
    "label": "hospital building",
    "value": "Tag:building=hospital"
  },
  {
    "item": "Q63099748",
    "label": "hotel building",
    "value": "Tag:building=hotel"
  },
  {
    "item": "Q3947",
    "label": "house",
    "value": "Tag:building=house"
  },
  {
    "item": "Q1321309",
    "label": "houseboat",
    "value": "Tag:building=houseboat"
  },
  {
    "item": "Q5784097",
    "label": "hut",
    "value": "Tag:building=hut"
  },
  {
    "item": "Q12144897",
   "label": "industrial building",
    "value": "Tag:building=industrial"
  },
  {
    "item": "Q126807",
    "label": "kindergarten",
    "value": "Tag:building=kindergarten"
  },
  {
    "item": "Q693369",
    "label": "kiosk",
    "value": "Tag:building=kiosk"
  },
  {
    "item": "Q856584",
    "label": "library building",
    "value": "Tag:building=library"
  },
  {
    "item": "Q380342",
    "label": "manufactory",
    "value": "Tag:building=manufacture"
  },
  {
    "item": "Q1409050",
    "label": "pole marquee",
    "value": "Tag:building=marquee"
  },
  {
    "item": "Q32815",
    "label": "mosque",
    "value": "Tag:building=mosque"
  },
  {
    "item": "Q1021645",
    "label": "office building",
    "value": "Tag:building=office"
  },
  {
    "item": "Q199451",
    "label": "pagoda",
    "value": "Tag:building=pagoda"
  },
  {
    "item": "Q16560",
    "label": "palace",
    "value": "Tag:building=palace"
  },
  {
    "item": "Q13218805",
    "label": "multistorey car park",
    "value": "Tag:building=parking"
  },
  {
    "item": "Q7138926",
    "label": "parliament building",
    "value": "Tag:building=parliament"
  },
  {
    "item": "Q47525089",
    "label": "sports pavilion",
    "value": "Tag:building=pavilion"
  },
  {
    "item": "Q294422",
    "label": "public building",
    "value": "Tag:building=public"
  },
  {
    "item": "Q11755880",
    "label": "residential building",
    "value": "Tag:building=residential"
  },
  {
    "item": "Q18760388",
    "label": "retail building",
    "value": "Tag:building=retail"
  },
  {
    "item": "Q3503155",
    "label": "riding hall",
    "value": "Tag:building=riding_hall"
  },
  {
    "item": "Q47525110",
    "label": "roof",
    "value": "Tag:building=roof"
  },
  {
    "item": "Q109607",
    "label": "ruins",
    "value": "Tag:building=ruins"
  },
  {
    "item": "Q1244442",
    "label": "school building",
    "value": "Tag:building=school"
  },
  {
    "item": "Q7419624",
    "label": "semi-detached house",
    "value": "Tag:building=semi"
  },
  {
    "item": "Q7419624",
    "label": "semi-detached house",
    "value": "Tag:building=semidetached_house"
  },
  {
    "item": "Q30310841",
    "label": "service building",
    "value": "Tag:building=service"
  },
  {
    "item": "Q721931",
    "label": "shed",
    "value": "Tag:building=shed"
  },
  {
    "item": "Q697295",
    "label": "shrine",
    "value": "Tag:building=shrine"
  },
  {
    "item": "Q1560125",
    "label": "slurry pit",
    "value": "Tag:building=slurry_tank"
  },
  {
    "item": "Q214252",
    "label": "stable",
    "value": "Tag:building=stable"
  },
  {
    "item": "Q483110",
    "label": "stadium",
    "value": "Tag:building=stadium"
  },
  {
    "item": "Q1434998",
    "label": "mobile home",
    "value": "Tag:building=static_caravan"
  },
  {
    "item": "Q33565",
    "label": "stilt house",
    "value": "Tag:building=stilt_house"
  },
  {
    "item": "Q1651566",
    "label": "pigsty",
    "value": "Tag:building=sty"
  },
  {
    "item": "Q76211894",
    "label": "supermarket building",
    "value": "Tag:building=supermarket"
  },
  {
    "item": "Q34627",
    "label": "synagogue",
    "value": "Tag:building=synagogue"
  },
  {
    "item": "Q44539",
    "label": "temple",
    "value": "Tag:building=temple"
  },
  {
    "item": "Q842402",
    "label": "Hindu temple",
    "value": "Tag:building=temple"
  },
  {
    "item": "Q18814858",
    "label": "terrace of houses",
    "value": "Tag:building=terrace"
  },
  {
    "item": "Q875016",
    "label": "terrace house",
    "value": "Tag:building=terrace"
  },
  {
    "item": "Q12518",
    "label": "tower",
    "value": "Tag:building=tower"
  },
  {
    "item": "Q1339195",
    "label": "station building",
    "value": "Tag:building=train_station"
  },
  {
    "item": "Q2461128",
    "label": "transformer tower",
    "value": "Tag:building=transformer_tower"
  },
  {
    "item": "Q47524577",
    "label": "public transportation building",
    "value": "Tag:building=transportation"
  },
  {
    "item": "Q19844914",
    "label": "university buildig",
    "value": "Tag:building=university"
  },
  {
    "item": "Q1362225",
    "label": "warehouse",
    "value": "Tag:building=warehouse"
  },
  {
    "item": "Q274153",
    "label": "water tower",
    "value": "Tag:building=water_tower"
  },
  {
    "item": "Q41176",
    "label": "building",
    "value": "Tag:building=yes"
  },
  {
    "item": "Q91939",
    "label": "hardened aircraft shelter",
    "value": "Tag:bunker_type=hardened_aircraft_shelter"
  },
  {
    "item": "Q2311847",
    "label": "single person bunker",
    "value": "Tag:bunker_type=personnel_shelter"
  },
  {
    "item": "Q92069",
    "label": "pillbox",
    "value": "Tag:bunker_type=pillbox"
  },
  {
    "item": "Q814499",
    "label": "disabled parking permit",
    "value": "Tag:capacity:disabled=yes"
  },
  {
    "item": "Q5119",
    "label": "capital",
    "value": "Tag:capital=yes"
  },
  {
    "item": "Q180174",
    "label": "folly",
    "value": "Tag:castle=folly"
  },
  {
    "item": "Q263274",
    "label": "kremlin",
    "value": "Tag:castle_type=kremlin"
  },
  {
    "item": "Q92026",
    "label": "Japanese castle",
    "value": "Tag:castle_type=shiro"
  },
  {
    "item": "Q4919932",
    "label": "stately home",
    "value": "Tag:castle_type=stately"
  },
  {
    "item": "Q173387",
    "label": "grave",
    "value": "Tag:cemetery=grave"
  },
  {
    "item": "Q1707610",
    "label": "war cemetery",
    "value": "Tag:cemetery=war_cemetery"
  },
  {
    "item": "Q13100073",
    "label": "village-level division in China",
    "value": "Tag:china_class=cun"
  },
  {
    "item": "Q986065",
    "label": "subdistrict of China",
    "value": "Tag:china_class=jiedao"
  },
  {
    "item": "Q13100073",
    "label": "village-level division in China",
    "value": "Tag:china_class=village"
  },
  {
    "item": "Q1500350",
    "label": "township of the People's Republic of China",
    "value": "Tag:china_class=xiang"
  },
  {
    "item": "Q735428",
    "label": "town in China",
    "value": "Tag:china_class=zhen"
  },
  {
    "item": "Q852989",
    "label": "bouldering",
    "value": "Tag:climbing:boulder=yes"
  },
  {
    "item": "Q17152912",
    "label": "infant clothing",
    "value": "Tag:clothes=babies"
  },
  {
    "item": "Q2471487",
    "label": "children's clothing",
    "value": "Tag:clothes=children"
  },
  {
    "item": "Q9053464",
    "label": "costume",
    "value": "Tag:clothes=costumes"
  },
  {
    "item": "Q652698",
    "label": "denim",
    "value": "Tag:clothes=denim"
  },
  {
    "item": "Q197204",
    "label": "fur",
    "value": "Tag:clothes=fur"
  },
  {
    "item": "Q80151",
    "label": "hat",
    "value": "Tag:clothes=hats"
  },
  {
    "item": "Q286",
    "label": "leather",
    "value": "Tag:clothes=leather"
  },
  {
    "item": "Q10522713",
    "label": "men's clothing",
    "value": "Tag:clothes=men"
  },
  {
    "item": "Q7205582",
    "label": "plus-size clothing",
    "value": "Tag:clothes=oversize"
  },
  {
    "item": "Q862633",
    "label": "school uniform",
    "value": "Tag:clothes=schoolwear"
  },
  {
    "item": "Q7223116",
    "label": "swimwear",
    "value": "Tag:clothes=swimwear"
  },
  {
    "item": "Q3172759",
    "label": "traditional costume",
    "value": "Tag:clothes=traditional"
  },
  {
    "item": "Q4375404",
    "label": "wedding clothing",
    "value": "Tag:clothes=wedding"
  },
  {
    "item": "Q4179400",
    "label": "women's clothing",
    "value": "Tag:clothes=women"
  },
  {
    "item": "Q17148672",
    "label": "social club",
    "value": "Tag:club=social"
  },
  {
    "item": "Q847017",
    "label": "sports club",
    "value": "Tag:club=sport"
  },
  {
    "item": "Q62603260",
    "label": "parachute club",
    "value": "Tag:club=sport"
  },
  {
    "item": "Q2814066",
    "label": "comedy club",
    "value": "Tag:comedy=yes"
  },
  {
    "item": "Q11166728",
    "label": "TV tower",
    "value": "Tag:communication:television=yes"
  },
  {
    "item": "Q6501028",
    "label": "water tank",
    "value": "Tag:content=water"
  },
  {
    "item": "Q847580",
    "label": "Moving walkway",
    "value": "Tag:conveying=yes"
  },
  {
    "item": "Q2072285",
    "label": "atelier",
    "value": "Tag:craft=atelier"
  },
  {
    "item": "Q798436",
    "label": "bakehouse",
    "value": "Tag:craft=bakery"
  },
  {
    "item": "Q160131",
    "label": "baker",
    "value": "Tag:craft=bakery"
  },
  {
    "item": "Q976015",
    "label": "basket weaver",
    "value": "Tag:craft=basket_maker"
  },
  {
    "item": "Q852389",
    "label": "beekeeper",
    "value": "Tag:craft=beekeeper"
  },
  {
    "item": "Q1639825",
    "label": "blacksmith",
    "value": "Tag:craft=blacksmith"
  },
  {
    "item": "Q548031",
    "label": "boat builder",
    "value": "Tag:craft=boatbuilder"
  },
  {
    "item": "Q1413170",
    "label": "bookbinder",
    "value": "Tag:craft=bookbinder"
  },
  {
    "item": "Q131734",
    "label": "brewery",
    "value": "Tag:craft=brewery"
  },
  {
    "item": "Q811930",
    "label": "construction business",
    "value": "Tag:craft=builder"
  },
  {
    "item": "Q154549",
    "label": "carpenter",
    "value": "Tag:craft=carpenter"
  },
  {
    "item": "Q28869945",
    "label": "caterer",
    "value": "Tag:craft=caterer"
  },
  {
    "item": "Q506126",
    "label": "chimney sweep",
    "value": "Tag:craft=chimney_sweeper"
  },
  {
    "item": "Q2700922",
    "label": "clockmaker",
    "value": "Tag:craft=clockmaker"
  },
  {
    "item": "Q47505416",
    "label": "Konditorei",
    "value": "Tag:craft=confectionery"
  },
  {
    "item": "Q1251750",
    "label": "distillery",
    "value": "Tag:craft=distillery"
  },
  {
    "item": "Q2034021",
    "label": "dressmaker",
    "value": "Tag:craft=dressmaker"
  },
  {
    "item": "Q165029",
    "label": "electrician",
    "value": "Tag:craft=electrician"
  },
  {
    "item": "Q889574",
    "label": "Floorer",
    "value": "Tag:craft=floorer"
  },
  {
    "item": "Q758780",
    "label": "gardener",
    "value": "Tag:craft=gardener"
  },
  {
    "item": "Q1529413",
    "label": "glaziery",
    "value": "Tag:craft=glaziery"
  },
  {
    "item": "Q19101121",
    "label": "handicrafter",
    "value": "Tag:craft=handicraft"
  },
  {
    "item": "Q336221",
    "label": "jeweler",
    "value": "Tag:craft=jeweller"
  },
  {
    "item": "Q3479990",
    "label": "locksmith",
    "value": "Tag:craft=locksmith"
  },
  {
    "item": "Q838566",
    "label": "metalsmith",
    "value": "Tag:craft=metal_construction"
  },
  {
    "item": "Q1996635",
    "label": "optician",
    "value": "Tag:craft=optician"
  },
  {
    "item": "Q288728",
    "label": "painter and varnisher",
    "value": "Tag:craft=painter"
  },
  {
    "item": "Q33231",
    "label": "photographer",
    "value": "Tag:craft=photographer"
  },
  {
    "item": "Q656208",
    "label": "photographic laboratory",
    "value": "Tag:craft=photographic_laboratory"
  },
  {
    "item": "Q1191329",
    "label": "piano tuner",
    "value": "Tag:craft=piano_tuner"
  },
  {
    "item": "Q15284879",
    "label": "plasterer",
    "value": "Tag:craft=plasterer"
  },
  {
    "item": "Q252924",
    "label": "plumber",
    "value": "Tag:craft=plumber"
  },
  {
    "item": "Q3400050",
    "label": "potter",
    "value": "Tag:craft=pottery"
  },
  {
    "item": "Q2152783",
    "label": "rigger",
    "value": "Tag:craft=rigger"
  },
  {
    "item": "Q552378",
    "label": "roofer",
    "value": "Tag:craft=roofer"
  },
  {
    "item": "Q1760988",
    "label": "saddler",
    "value": "Tag:craft=saddler"
  },
  {
    "item": "Q549237",
    "label": "sailmaker",
    "value": "Tag:craft=sailmaker"
  },
  {
    "item": "Q505213",
    "label": "swmill",
    "value": "Tag:craft=sawmill"
  },
  {
    "item": "Q1516054",
    "label": "scaffolder",
    "value": "Tag:craft=scaffolder"
  },
  {
    "item": "Q1281618",
    "label": "sculptor",
    "value": "Tag:craft=sculptor"
  },
  {
    "item": "Q152355",
    "label": "cobbler",
    "value": "Tag:craft=shoemaker"
  },
  {
    "item": "Q1924077",
    "label": "exhibition stand builder",
    "value": "Tag:craft=stand_builder"
  },
  {
    "item": "Q328325",
    "label": "stonemason",
    "value": "Tag:craft=stonemason"
  },
  {
    "item": "Q242468",
    "label": "tailor",
    "value": "Tag:craft=tailor"
  },
  {
    "item": "Q878295",
    "label": "tiler",
    "value": "Tag:craft=tiler"
  },
  {
    "item": "Q852718",
    "label": "whitesmith",
    "value": "Tag:craft=tinsmith"
  },
  {
    "item": "Q1716419",
    "label": "turner",
    "value": "Tag:craft=turner"
  },
  {
    "item": "Q23754740",
    "label": "upholsterer",
    "value": "Tag:craft=upholsterer"
  },
  {
    "item": "Q157798",
    "label": "watchmaker",
    "value": "Tag:craft=watchmaker"
  },
  {
    "item": "Q897317",
    "label": "winegrower",
    "value": "Tag:craft=winery"
  },
  {
    "item": "Q156362",
    "label": "winery",
    "value": "Tag:craft=winery"
  },
  {
    "item": "Q475354",
    "label": "gantry crane",
    "value": "Tag:crane:type=gantry_crane"
  },
  {
    "item": "Q15968492",
    "label": "GNOME Maps",
    "value": "Tag:created_by=gnome-maps_3.22.2"
  },
  {
    "item": "Q15968492",
    "label": "GNOME Maps",
    "value": "Tag:created_by=gnome-maps_3.33.3"
  },
  {
    "item": "Q156354",
    "label": "Coffea",
    "value": "Tag:crop=coffee"
  },
  {
    "item": "Q153697",
    "label": "coffee bean",
    "value": "Tag:crop=coffee"
  },
  {
    "item": "Q886167",
    "label": "flowering plant",
    "value": "Tag:crop=flowers"
  },
  {
    "item": "Q13158",
    "label": "Fragaria × ananassa",
    "value": "Tag:crop=strawberry"
  },
  {
    "item": "Q101815",
    "label": "Camellia sinensis",
    "value": "Tag:crop=tea"
  },
  {
    "item": "Q70780172",
    "label": "tea plantation",
    "value": "Tag:crop=tea"
  },
  {
    "item": "Q15645384",
    "label": "wheat",
    "value": "Tag:crop=wheat"
  },
  {
    "item": "Q568719",
    "label": "Q568719",
    "value": "Tag:crossing:on_demand=yes"
  },
  {
    "item": "Q7161439",
    "label": "pelican crossing",
    "value": "Tag:crossing_ref=pelican"
  },
  {
    "item": "Q7258882",
    "label": "puffin crossing",
    "value": "Tag:crossing_ref=puffin"
  },
  {
    "item": "Q7828547",
    "label": "toucan crossing",
    "value": "Tag:crossing_ref=toucan"
  },
  {
    "item": "Q7328304",
    "label": "zebra crossing",
    "value": "Tag:crossing_ref=zebra"
  },
  {
    "item": "Q623970",
    "label": "Arab cuisine",
    "value": "Tag:cuisine=arab"
  },
  {
    "item": "Q579500",
    "label": "Argentine cuisine",
    "value": "Tag:cuisine=argentinian"
  },
  {
    "item": "Q728206",
    "label": "Asian cuisine",
    "value": "Tag:cuisine=asian"
  },
  {
    "item": "Q783010",
    "label": "Australian cuisine",
    "value": "Tag:cuisine=australian"
  },
  {
    "item": "Q272502",
    "label": "bagel",
    "value": "Tag:cuisine=bagel"
  },
  {
    "item": "Q805060",
    "label": "Balkan cuisine",
    "value": "Tag:cuisine=balkan"
  },
  {
    "item": "Q24439113",
    "label": "barbecue restaurant",
    "value": "Tag:cuisine=barbecue"
  },
  {
    "item": "Q3006895",
    "label": "Bolivian cuisine",
    "value": "Tag:cuisine=bolivian"
  },
  {
    "item": "Q614394",
    "label": "Brazilian cuisine",
    "value": "Tag:cuisine=brazilian"
  },
  {
    "item": "Q715858",
    "label": "bubble tea",
    "value": "Tag:cuisine=bubble_tea"
  },
  {
    "item": "Q6663",
    "label": "hamburger",
    "value": "Tag:cuisine=burger"
  },
  {
    "item": "Q63878756",
    "label": "fast-food hamburger restaurant",
    "value": "Tag:cuisine=burger"
  },
  {
    "item": "Q1729345",
    "label": "Caribbean cuisine",
    "value": "Tag:cuisine=caribbean"
  },
  {
    "item": "Q27477249",
    "label": "Chinese cuine",
    "value": "Tag:cuisine=chinese"
  },
  {
    "item": "Q1789628",
    "label": "Croatian cuisine",
    "value": "Tag:cuisine=croatian"
  },
  {
    "item": "Q816851",
    "label": "cupcake",
    "value": "Tag:cuisine=cupcake"
  },
  {
    "item": "Q63869420",
    "label": "cupcake bakery",
    "value": "Tag:cuisine=cupcake"
  },
  {
    "item": "Q871595",
    "label": "Czech cuisine",
    "value": "Tag:cuisine=czech"
  },
  {
    "item": "Q1196267",
    "label": "Danish cuisine",
    "value": "Tag:cuisine=danish"
  },
  {
    "item": "Q16980934",
    "label": "fish and chip shop",
    "value": "Tag:cuisine=fish_and_chips"
  },
  {
    "item": "Q203925",
    "label": "fish and chips",
    "value": "Tag:cuisine=fish_and_chips"
  },
  {
    "item": "Q6661",
    "label": "French cuisine",
    "value": "Tag:cuisine=french"
  },
  {
    "item": "Q1814211",
    "label": "friterie",
    "value": "Tag:cuisine=friture"
  },
  {
    "item": "Q18396676",
    "label": "frozen yogurt shop",
    "value": "Tag:cuisine=frozen_yogurt"
  },
  {
    "item": "Q47629",
    "label": "German cuisine",
    "value": "Tag:cuisine=german"
  },
  {
    "item": "Q744027",
    "label": "Greek cuisine",
    "value": "Tag:cuisine=greek"
  },
  {
    "item": "Q264327",
    "label": "Hungarian cuisine",
    "value": "Tag:cuisine=hungarian"
  },
  {
    "item": "Q192087",
    "label": "Indian cuisine",
    "value": "Tag:cuisine=indian"
  },
  {
    "item": "Q1342397",
    "label": "Iranian cuisine",
    "value": "Tag:cuisine=iranian"
  },
  {
    "item": "Q192786",
    "label": "Italian cuisine",
    "value": "Tag:cuisine=italian"
  },
  {
    "item": "Q234138",
    "label": "Japanese cuisine",
    "value": "Tag:cuisine=japanese"
  },
  {
    "item": "Q284288",
    "label": "Jewish cuisine",
    "value": "Tag:cuisine=jewish"
  },
  {
    "item": "Q647500",
    "label": "Korean cuisine",
    "value": "Tag:cuisine=korean"
  },
  {
    "item": "Q11262318",
    "label": "Obanzai",
    "value": "Tag:cuisine=kyo_ryouri"
  },
  {
    "item": "Q929239",
    "label": "Lebanese cuisine",
    "value": "Tag:cuisine=lebanese"
  },
  {
    "item": "Q934309",
    "label": "Mediterranean cuisine",
    "value": "Tag:cuisine=mediterranean"
  },
  {
    "item": "Q207965",
    "label": "Mexican cuisine",
    "value": "Tag:cuisine=mexican"
  },
  {
    "item": "Q10262188",
    "label": "cuisine of Minas Gerais",
    "value": "Tag:cuisine=mineira"
  },
  {
    "item": "Q7010123",
    "label": "New Mexican cuisine",
    "value": "Tag:cuisine=new_mexican"
  },
  {
    "item": "Q41927",
    "label": "Okinawan cuisine",
    "value": "Tag:cuisine=okinawa_ryori"
  },
  {
    "item": "Q749847",
    "label": "Peruvian cuisine",
    "value": "Tag:cuisine=peruvian"
  },
  {
    "item": "Q1501212",
    "label": "pizzeria",
    "value": "Tag:cuisine=pizza"
  },
  {
    "item": "Q756020",
    "label": "Polish cuisine",
    "value": "Tag:cuisine=polish"
  },
  {
    "item": "Q180817",
    "label": "Portuguese cuisine",
    "value": "Tag:cuisine=portuguese"
  },
  {
    "item": "Q94951",
    "label": "regional cuisine",
    "value": "Tag:cuisine=regional"
  },
  {
    "item": "Q2147761",
    "label": "Rhenish cuisine",
    "value": "Tag:cuisine=rhenish"
  },
  {
    "item": "Q12505",
    "label": "Russian cuisine",
    "value": "Tag:cuisine=russian"
  },
  {
    "item": "Q622512",
    "label": "Spanish cuisine",
    "value": "Tag:cuisine=spanish"
  },
  {
    "item": "Q3109696",
    "label": "steakhouse",
    "value": "Tag:cuisine=steak_house"
  },
  {
    "item": "Q46383",
    "labe": "sushi",
    "value": "Tag:cuisine=sushi"
  },
  {
    "item": "Q841984",
    "label": "Thai cuisine",
    "value": "Tag:cuisine=thai"
  },
  {
    "item": "Q654493",
    "label": "Turkish cuisine",
    "value": "Tag:cuisine=turkish"
  },
  {
    "item": "Q826059",
    "label": "Vietnamese cuisine",
    "value": "Tag:cuisine=vietnamese"
  },
  {
    "item": "Q2565249",
    "label": "Westphalian cuisine",
    "value": "Tag:cuisine=westphalian"
  },
  {
    "item": "Q262160",
    "label": "EuroVelo",
    "value": "Tag:cycle_network=EuroVelo"
  },
  {
    "item": "Q99963807",
    "label": "Georgia State Bicycle Routes",
    "value": "Tag:cycle_network=US:GA"
  },
  {
    "item": "Q99963527",
    "label": "North Carolina Bicycle Routes",
    "value": "Tag:cycle_network=US:NC"
  },
  {
    "item": "Q97931266",
    "label": "New Mexico State Bicycle Routes",
    "value": "Tag:cycle_network=US:NM"
  },
  {
    "item": "Q99963338",
    "label": "New York State Bicycle Routes",
    "value": "Tag:cycle_network=US:NY"
  },
  {
    "item": "Q99485363",
    "label": "Ohio State Bicycle Route System",
    "value": "Tag:cycle_network=US:OH"
  },
  {
    "item": "Q99955787",
    "label": "BicyclePA",
    "value": "Tag:cycle_network=US:PA"
  },
  {
    "item": "Q7890846",
    "label": "United States Bicycle Route System",
    "value": "Tag:cycle_network=US:US"
  },
  {
    "item": "Q1378400",
    "label": "bike lane",
    "value": "Tag:cycleway=lane"
  },
  {
    "item": "Q54913746",
    "label": "Bicycle contraflow lanes",
    "value": "Tag:cycleway=opposite"
  },
  {
    "item": "Q289429",
    "label": "Dennert Fir Tree",
    "value": "Tag:dennert_fir_tree=yes"
  },
  {
    "item": "Q104319",
    "label": "Seventh-day Adventist Church",
    "value": "Tag:denomination=adventist"
  },
  {
    "item": "Q171764",
    "label": "Ahmadiyya",
    "value": "Tag:denomination=ahmadiyya"
  },
  {
    "item": "Q137097",
    "label": "Alevism",
    "value": "Tag:denomination=alevi"
  },
  {
    "item": "Q2272897",
    "label": "Alliance World Fellowship",
    "value": "Tag:denomination=alliance"
  },
  {
    "item": "Q193312",
    "label": "Anglican Communion",
    "value": "Tag:denomination=anglican"
  },
  {
    "item": "Q6423963",
    "label": "Anglicanism",
    "value": "Tag:denomination=anglican"
  },
  {
    "item": "Q3357705",
    "label": "Apostolic Faith Church",
    "value": "Tag:denomination=apostolic_faith"
  },
  {
    "item": "Q683724",
    "label": "Armenian Apostolic Church",
    "value": "Tag:denomination=armenian_apostolic"
  },
  {
    "item": "Q64842",
    "label": "Armenian Catholic Church",
    "value": "Tag:denomination=armenian_catholic"
  },
  {
    "item": "Q285441",
    "label": "Heathenry",
    "value": "Tag:denomination=asatru"
  },
  {
    "item": "Q494890",
    "label": "Assemblies of God",
    "value": "Tag:denomination=assemblies_of_god"
  },
  {
    "item": "Q203179",
    "label": "Assyrian Church of the East",
    "value": "Tag:denomination=assyrian"
  },
  {
    "item": "Q93191",
    "label": "Baptists",
    "value": "Tag:denomination=baptist"
  },
  {
    "item": "Q467692",
    "label": "Bektashi Order",
    "value": "Tag:denomination=bektashi"
  },
  {
    "item": "Q9592",
    "label": "Catholic Church",
    "value": "Tag:denomination=catholic"
  },
  {
    "item": "Q204405",
    "label": "Catholic Apostolic Church",
    "value": "Tag:denomination=catholic_apostolic"
  },
  {
    "item": "Q1736372",
    "label": "Catholic Mariavite Church",
    "value": "Tag:denomination=catholic_mariavite"
  },
  {
    "item": "Q263031",
    "label": "Celtic polytheism",
    "value": "Tag:denomination=celtic"
  },
  {
    "item": "Q64868",
    "label": "Chaldean Catholic Church",
    "value": "Tag:denomination=chaldean_catholic"
  },
  {
    "item": "Q324640",
    "label": "Charismatic Movement",
    "value": "Tag:denomination=charismatic"
  },
  {
    "item": "Q11682820",
    "label": "Church of Christ, Scientist",
    "value": "Tag:denomination=christ_scientist"
  },
  {
    "item": "Q666614",
    "label": "The Christian Community",
    "value": "Tag:denomination=christian_community"
  },
  {
    "item": "Q391499",
    "label": "Church of God in Christ",
    "value": "Tag:denomination=church_of_god_in_christ"
  },
  {
    "item": "Q922480",
    "label": "Church of Scotland",
    "value": "Tag:denomination=church_of_scotland"
  },
  {
    "item": "Q749243",
    "label": "Church of Sweden",
    "value": "Tag:denomination=church_of_sweden"
  },
  {
    "item": "Q1272775",
    "label": "Churches of Christ",
    "value": "Tag:denomination=churches_of_christ"
  },
  {
    "item": "Q205644",
    "label": "Conservative Judaism",
    "value": "Tag:denomination=conservative"
  },
  {
    "item": "Q49378",
    "label": "Coptic Catholic Church",
    "value": "Tag:denomination=coptic_catholic"
  },
  {
    "item": "Q198998",
    "label": "Coptic Orthodox Church of Alexandria",
    "value": "Tag:denomination=coptic_orthodox"
  },
  {
    "item": "Q2060869",
    "label": "Czechoslovak Hussite Church",
    "value": "Tag:denomination=czechoslovak_hussite"
  },
  {
    "item": "Q9436",
    "label": "digambara",
    "value": "Tag:denomination=digambara"
  },
  {
    "item": "Q1541206",
    "label": "Christian Church (Disciples of Christ)",
    "value": "Tag:denomination=disciples_of_christ"
  },
  {
    "item": "Q3586152",
    "label": "Episcopal Church",
    "value": "Tag:denomination=episcopal"
  },
  {
    "item": "Q18813575",
    "label": "Eritrean Catholic Church",
    "value": "Tag:denomination=eritrean_catholic"
  },
  {
    "item": "Q844083",
    "label": "Eritrean Orthodox Tewahedo Church",
    "value": "Tag:denomination=eritrean_orthodox"
  },
  {
    "item": "Q64849",
    "label": "Ethiopian Catholic Church",
    "value": "Tag:denomination=ethiopian_catholic"
  },
  {
    "item": "Q179829",
    "label": "Ethiopian Orthodox Tewahedo Church",
    "value": "Tag:denomination=ethiopian_orthodox"
  },
  {
    "item": "Q194253",
    "label": "Evangelicalism",
    "value": "Tag:denomination=evangelical"
  },
  {
    "item": "Q5415672",
    "label": "Evangelical Covenant Church",
    "value": "Tag:denomination=evangelical_covenant"
  },
  {
    "item": "Q5415680",
    "label": "Evangelical Free Church of America",
    "value": "Tag:denomination=evangelical_free_church_of_america"
  },
  {
    "item": "Q1429373",
    "label": "Exclusive Brethren",
    "value": "Tag:denomination=exclusive_brethren"
  },
  {
    "item": "Q163218",
    "label": "The Foursquare Church",
    "value": "Tag:denomination=foursquare"
  },
  {
    "item": "Q319218",
    "label": "Gelug",
    "value": "Tag:denomination=gelug"
  },
  {
    "item": "Q7970362",
    "label": "Greek Orthodox Church",
    "value": "Tag:denomination=greek_orthodox"
  },
  {
    "item": "Q171201",
    "label": "Hasidism",
    "value": "Tag:denomination=hasidic"
  },
  {
    "item": "Q1198075",
    "label": "Huayan school",
    "value": "Tag:denomination=huayan"
  },
  {
    "item": "Q950310",
    "label": "Hungarian Greek Catholic Church",
    "value": "Tag:denomination=hungarian_greek_catholic"
  },
  {
    "item": "Q243551",
    "label": "Ibadi",
    "value": "Tag:denomination=ibadi"
  },
  {
    "item": "Q1138908",
    "label": "Iglesia ni Cristo",
    "value": "Tag:denomination=iglesia_ni_cristo"
  },
  {
    "item": "Q230386",
    "label": "Isma'ilism",
    "value": "Tag:denomination=ismaili"
  },
  {
    "item": "Q35269",
    "label": "Jehovah's Witnesses",
    "value": "Tag:denomination=jehovahs_witness"
  },
  {
    "item": "Q696966",
    "label": "Ji-shū",
    "value": "Tag:denomination=jishu"
  }
  ,
  {
    "item": "Q912221",
    "label": "Jōdo Shinshū",
    "value": "Tag:denomination=jodo_shinshu"
  },
  {
    "item": "Q912208",
    "label": "Jodo shu",
    "value": "Tag:denomination=jodo_shu"
  },
  {
    "item": "Q1549204",
    "label": "Kimbanguism",
    "value": "Tag:denomination=kimbanguist"
  },
  {
    "item": "Q1468349",
    "label": "Liberal Catholic Church",
    "value": "Tag:denomination=liberal_catholic"
  },
  {
    "item": "Q75809",
    "label": "Lutheranism",
    "value": "Tag:denomination=lutheran"
  },
  {
    "item": "Q1128669",
    "label": "Lutheran Church of Australia",
    "value": "Tag:denomination=lutheran"
  },
  {
    "item": "Q819290",
    "label": "Mariavite Church",
    "value": "Tag:denomination=mariavite"
  },
  {
    "item": "Q64900",
    "label": "Maronite Church",
    "value": "Tag:denomination=maronite"
  },
  {
    "item": "Q110223",
    "label": "Mennonites",
    "value": "Tag:denomination=mennonite"
  },
  {
    "item": "Q216952",
    "label": "Messianic Judaism",
    "value": "Tag:denomination=messianic_jewish"
  },
  {
    "item": "Q33203",
    "label": "Methodism",
    "value": "Tag:denomination=methodist"
  },
  {
    "item": "Q677704",
    "label": "Mission Covenant Church of Sweden",
    "value": "Tag:denomination=mission_covenant_church_of_sweden"
  },
  {
    "item": "Q747802",
    "label": "Mormonism",
    "value": "Tag:denomination=mormon"
  },
  {
    "item": "Q1189165",
    "label": "Church of the Nazarene",
    "value": "Tag:denomination=nazarene"
  },
  {
    "item": "Q512232",
    "label": "New Apostolic Church",
    "value": "Tag:denomination=new_apostolic"
  },
  {
    "item": "Q2711949",
    "label": "Newfrontiers",
    "value": "Tag:denomination=new_frontiers"
  },
  {
    "item": "Q871371",
    "label": "Nichiren Buddhism",
    "value": "Tag:denomination=nichiren"
  },
  {
    "item": "Q30262805",
    "label": "International Network of Churches",
    "value": "Tag:denomination=nondenominational"
  },
  {
    "item": "Q848771",
    "label": "Nyingma",
    "value": "Tag:denomination=nyingma"
  },
  {
    "item": "Q384728",
    "label": "Ōbaku",
    "value": "Tag:denomination=obaku"
  },
  {
    "item": "Q223710",
    "label": "Old Believers",
    "value": "Tag:denomination=old_believers"
  },
  {
    "item": "Q5169816",
    "label": "Old Catholic Church",
    "value": "Tag:denomination=old_catholic"
  },
  {
    "item": "Q35032",
    "label": "Eastern Orthodox Church",
    "value": "Tag:denomination=orthodox"
  },
  {
    "item": "Q80970",
    "label": "Orthodox Judaism",
    "value": "Tag:denomination=orthodox"
  },
  {
    "item": "Q782613",
    "label": "Orthodox Presbyterian Church",
    "value": "Tag:denomination=orthodox_presbyterian_church"
  },
  {
    "item": "Q483978",
    "label": "Pentecostalism",
    "value": "Tag:denomination=pentecostal"
  },
  {
    "item": "Q324640",
    "label": "Charismatic Movement",
    "value": "Tag:denomination=pentecostal"
  },
  {
    "item": "Q771902",
    "label": "Philippine Independent Church",
    "value": "Tag:denomination=philippine_independent"
  },
  {
    "item": "Q391951",
    "label": "Protestant Church in the Netherlands",
    "value": "Tag:denomination=pkn"
  },
  {
    "item": "Q1777360",
    "label": "Polish Catholic Church",
    "value": "Tag:denomination=polish_catholic"
  },
  {
    "item": "Q32731",
    "label": "Polish National Catholic Church",
    "value": "Tag:denomination=polish_national_catholic"
  },
  {
    "item": "Q178169",
    "label": "Presbyterianism",
    "value": "Tag:denomination=presbyterian"
  },
  {
    "item": "Q23540",
    "label": "Protestantism",
    "value": "Tag:denomination=protestant"
  },
  {
    "item": "Q262244",
    "label": "Pure Land Buddhism",
    "value": "Tag:denomination=pure_land"
  },
  {
    "item": "Q170208",
    "label": "Religious Society of Friends",
    "value": "Tag:denomination=quaker"
  },
  {
    "item": "Q339284",
    "label": "Reconstructionist Judaism",
    "value": "Tag:denomination=reconstructionist"
  },
  {
    "item": "Q101849",
    "labe": "Calvinism",
    "value": "Tag:denomination=reformed"
  },
  {
    "item": "Q27712",
    "label": "Jewish Renewal",
    "value": "Tag:denomination=renewal"
  },
  {
    "item": "Q639625",
    "label": "Rinzai school",
    "value": "Tag:denomination=rinzai"
  },
  {
    "item": "Q1351551",
    "label": "Risshū",
    "value": "Tag:denomination=risshu"
  },
  {
    "item": "Q9592",
    "label": "Catholic Church",
    "value": "Tag:denomination=roman_catholic"
  },
  {
    "item": "Q856349",
    "label": "Romanian Greek Catholic Church",
    "value": "Tag:denomination=romanian_catholic"
  },
  {
    "item": "Q181901",
    "label": "Romanian Orthodox Church",
    "value": "Tag:denomination=romanian_orthodox"
  },
  {
    "item": "Q60995",
    "label": "Russian Orthodox Church",
    "value": "Tag:denomination=russian_orthodox"
  },
  {
    "item": "Q188307",
    "label": "The Salvation Army",
    "value": "Tag:denomination=salvation_army"
  },
  {
    "item": "Q182651",
    "label": "Samaritan",
    "value": "Tag:denomination=samaritan"
  },
  {
    "item": "Q2032421",
    "label": "Santo Daime",
    "value": "Tag:denomination=santo_daime"
  },
  {
    "item": "Q1205829",
    "label": "Scottish Episcopal Church",
    "value": "Tag:denomination=scottish_episcopal"
  },
  {
    "item": "Q188814",
    "label": "Serbian Orthodox Church",
    "value": "Tag:denomination=serbian_orthodox"
  },
  {
    "item": "Q104319",
    "label": "Seventh-day Adventist Church",
    "value": "Tag:denomination=seventh_day_adventist"
  },
  {
    "item": "Q234953",
    "label": "Shaivism",
    "value": "Tag:denomination=shaivism"
  },
  {
    "item": "Q849345",
    "label": "Shaktism",
    "value": "Tag:denomination=shaktism"
  },
  {
    "item": "Q9585",
    "label": "Shia Islam",
    "value": "Tag:denomination=shia"
  },
  {
    "item": "Q550182",
    "label": "Shingon Buddhism",
    "value": "Tag:denomination=shingon_shu"
  },
  {
    "item": "Q201571",
    "label": "Slavic mythology",
    "value": "Tag:denomination=slavic"
  },
  {
    "item": "Q558585",
    "label": "Smartha Tradition",
    "value": "Tag:denomination=smartism"
  },
  {
    "item": "Q749085",
    "label": "Sōtō",
    "value": "Tag:denomination=soto"
  },
  {
    "item": "Q214255",
    "label": "spiritism",
    "value": "Tag:denomination=spiritist"
  },
  {
    "item": "Q9603",
    "label": "Sufism",
    "value": "Tag:denomination=sufi"
  },
  {
    "item": "Q483654",
    "label": "Sunni Islam",
    "value": "Tag:denomination=sunni"
  },
  {
    "item": "Q280522",
    "label": "Śvētāmbara",
    "value": "Tag:denomination=svetambara"
  },
  {
    "item": "Q64871",
    "label": "Syro-Malabar Catholic Church",
    "value": "Tag:denomination=syro-malabar_catholic"
  },
  {
    "item": "Q668188",
    "label": "Tiantai",
    "value": "Tag:denomination=tiantai"
  },
  {
    "item": "Q483889",
    "label": "Tibetan Buddhism",
    "value": "Tag:denomination=tibetan"
  },
  {
    "item": "Q472189",
    "label": "Ukrainian Greek Catholic Church",
    "value": "Tag:denomination=ukrainian_greek_catholic"
  },
  {
    "item": "Q212912",
    "label": "Haredi Judaism",
    "value": "Tag:denomination=ultra_orthodox"
  },
  {
    "item": "Q198745",
    "label": "United Church of Canada",
    "value": "Tag:denomination=united"
  },
  {
    "item": "Q426316",
    "label": "United Church of Christ",
    "value": "Tag:denomination=united_church_of_christ"
  },
  {
    "item": "Q2495176",
    "label": "United Free Church of Scotland",
    "value": "Tag:denomination=united_free_church_of_scotlnd"
  },
  {
    "item": "Q329646",
    "label": "United Methodist Church",
    "value": "Tag:denomination=united_methodist"
  },
  {
    "item": "Q1458238",
    "label": "United Reformed Church",
    "value": "Tag:denomination=united_reformed"
  },
  {
    "item": "Q523620",
    "label": "Uniting Church in Australia",
    "value": "Tag:denomination=uniting"
  },
  {
    "item": "Q45584",
    "label": "Vaishnavism",
    "value": "Tag:denomination=vaishnavism"
  },
  {
    "item": "Q172175",
    "label": "Vajrayana",
    "value": "Tag:denomination=vajrayana"
  },
  {
    "item": "Q59774",
    "label": "Wicca",
    "value": "Tag:denomination=wicca"
  },
  {
    "item": "Q562984",
    "label": "Won Buddhism",
    "value": "Tag:denomination=won"
  },
  {
    "item": "Q349849",
    "label": "East Asian Yogācāra",
    "value": "Tag:denomination=yogacara"
  },
  {
    "item": "Q578719",
    "label": "Yuzu Nembutsu",
    "value": "Tag:denomination=yuzu_nembutsu"
  },
  {
    "item": "Q7953",
    "label": "Zen",
    "value": "Tag:denomination=zen"
  },
  {
    "item": "Q390490",
    "label": "Dynamic passenger information",
    "value": "Tag:departures_board=realtime"
  },
  {
    "item": "Q174945",
    "label": "Area of Outstanding Natural Beauty",
    "value": "Tag:designation=area_of_outstanding_natural_beauty"
  },
  {
    "item": "Q4976993",
    "label": "civil parish",
    "value": "Tag:designation=civil_parish"
  },
  {
    "item": "Q2259176",
    "label": "common land",
    "value": "Tag:designation=common"
  },
  {
    "item": "Q2630741",
    "label": "community",
    "value": "Tag:designation=community"
  },
  {
    "item": "Q1002812",
    "label": "metropolitan borough",
    "value": "Tag:designation=metropolitan_district"
  },
  {
    "item": "Q769603",
    "label": "non-metropolitan county",
    "value": "Tag:designation=non_metropolitan_county"
  },
  {
    "item": "Q1187580",
    "label": "non-metropolitan district",
    "value": "Tag:designation=non_metropolitan_district"
  },
  {
    "item": "Q7245071",
    "label": "principal area",
    "value": "Tag:designation=principal_area"
  },
  {
    "item": "Q61960067",
    "label": "vegan eatery",
    "value": "Tag:diet:vegan=only"
  },
  {
    "item": "Q47163308",
    "label": "ambassador's residence",
    "value": "Tag:diplomatic=ambassadors_residence"
  },
  {
    "item": "Q7843791",
    "label": "consulate",
    "value": "Tag:diplomatic=consulate"
  },
  {
    "item": "Q372690",
    "label": "consulate general",
    "value": "Tag:diplomatic=consulate_general"
  },
  {
    "item": "Q61874990",
    "label": "delegation",
    "value": "Tag:diplomatic=delegation"
  },
  {
    "item": "Q18414273",
    "label": "high commission",
    "value": "Tag:diplomatic=high_commission"
  },
  {
    "item": "Q23891529",
    "label": "honorary consulate",
    "value": "Tag:diplomatic=honorary_consulate"
  },
  {
    "item": "Q64779402",
    "label": "liaison office",
    "value": "Tag:diplomatic=liaison"
  },
  {
    "item": "Q2360219",
    "label": "permanent mission",
    "value": "Tag:diplomatic=permanent_mission"
  },
  {
    "item": "Q10373548",
    "label": "whisky distillery",
    "value": "Tag:distillery=whisky"
  },
  {
    "item": "Q4663385",
    "label": "former railway station",
    "value": "Tag:disused:railway=station"
  },
  {
    "item": "Q4663385",
    "label": "former railway station",
    "value": "Tag:disused=station"
  },
  {
    "item": "Q811177",
    "label": "dry dock",
    "value": "Tag:dock=drydock"
  },
  {
    "item": "Q66361287",
    "label": "dogs on leash",
    "value": "Tag:dog=leashed"
  },
  {
    "item": "Q786922",
    "label": "drive-in theater",
    "value": "Tag:drive_in=yes"
  },
  {
    "item": "Q1415234",
    "label": "15 kV, 16.7 Hz AC railway electrification",
    "value": "Tag:electrified=contact_line"
  },
  {
    "item": "Q110701",
    "label": "overhead line",
    "value": "Tag:electrified=contact_line"
  },
  {
    "item": "Q2312102",
    "label": "Ground-level power supply",
    "value": "Tag:electrified=ground-level_power_supply"
  },
  {
    "item": "Q748825",
    "label": "third rail",
    "value": "Tag:electrified=rail"
  },
  {
    "item": "Q10505824",
    "label": "embankment",
    "value": "Tag:embankment=yes"
  },
  {
    "item": "Q1333922",
    "label": "emergency access point",
    "value": "Tag:emergency=access_point"
  },
  {
    "item": "Q927519",
    "label": "ambulance station",
    "value": "Tag:emergency=ambulance_station"
  },
  {
    "item": "Q2217279",
    "label": "emergency assembly point",
    "value": "Tag:emergency=assembly_point"
  },
  {
    "item": "Q1450682",
    "label": "defibrillator",
    "value": "Tag:emergency=defibrillator"
  },
  {
    "item": "Q787407",
    "label": "automated external defibrillator",
    "value": "Tag:emergency=defibrillator"
  },
  {
    "item": "Q1295316",
    "label": "emergency department",
    "value": "Tag:emergency=emergency_ward_entrance"
  },
  {
    "item": "Q190672",
    "label": "fire extinguisher",
    "value": "Tag:emergency=fire_extinguisher"
  },
  {
    "item": "Q352466",
    "label": "Fire flapper",
    "value": "Tag:emergency=fire_flapper"
  },
  {
    "item": "Q1410061",
    "label": "fire hose",
    "value": "Tag:emergency=fire_hose"
  },
  {
    "item": "Q634299",
    "label": "fire hydrant",
    "value": "Tag:emergency=fire_hydrant"
  },
  {
    "item": "Q815867",
    "label": "first aid kit",
    "value": "Tag:emergency=first_aid_kit"
  },
  {
    "item": "Q587334",
    "label": "lifebuoy",
    "value": "Tag:emergency=life_ring"
  },
  {
    "item": "Q259327",
    "label": "lifeguard",
    "value": "Tag:emergency=lifeguard"
  },
  {
    "item": "Q98837942",
    "label": "lifeguard station",
    "value": "Tag:emergency=lifeguard"
  },
  {
    "item": "Q6545380",
    "label": "lifeguard tower",
    "value": "Tag:emergency=lifeguard_tower"
  },
  {
    "item": "Q2146388",
    "label": "Refuge Beacon",
    "value": "Tag:emergency=marine_refuge"
  },
  {
    "item": "Q349967",
    "label": "mountain rescue",
    "value": "Tag:emergency=mountain_rescue"
  },
  {
    "item": "Q1613929",
    "label": "emergency telephone",
    "value": "Tag:emergency=phone"
  },
  {
    "item": "Q40049164",
    "label": "stretcher box",
    "value": "Tag:emergency=rescue_box"
  },
  {
    "item": "Q205234",
    "label": "siren",
    "value": "Tag:emergency=siren"
  },
  {
    "item": "Q6501028",
    "label": "water tank",
    "value": "Tag:emergency=water_tank"
  },
  {
    "item": "Q1543615",
    "label": "gratis",
    "value": "Tag:fee=no"
  },
  {
    "item": "Q24202480",
    "label": "paid",
    "value": "Tag:fee=yes"
  },
  {
    "item": "Q74051479",
    "label": "commercial flag",
    "value": "Tag:flag:type=advertising"
  },
  {
    "item": "Q602300",
    "label": "war flag",
    "value": "Tag:flag:type=military"
  },
  {
    "item": "Q21850100",
    "label": "municipal flag",
    "value": "Tag:flag:type=municipal"
  },
  {
    "item": "Q186516",
    "label": "national flag",
    "value": "Tag:flag:type=national"
  },
  {
    "item": "Q22807280",
    "label": "flag of a country subdivision",
    "value": "Tag:flag:type=regional"
  },
  {
    "item": "Q84429248",
    "label": "access aisle",
    "value": "Tag:footway=access_aisle"
  },
  {
    "item": "Q177749",
    "label": "sidewalk",
    "value": "Tag:footway=sidewalk"
  },
  {
    "item": "Q1415899",
    "label": "stepping stones",
    "value": "Tag:ford=stepping_stones"
  },
  {
    "item": "Q12743",
    "label": "ford",
    "value": "Tag:ford=yes"
  },
  {
    "item": "Q91285",
    "label": "martello tower",
    "value": "Tag:fortification=martello_tower"
  },
  {
    "item": "Q744099",
    "label": "hillfort",
    "value": "Tag:fortification_type=hill_fort"
  },
  {
    "item": "Q1630622",
    "label": "drinking fountain",
    "value": "Tag:fountain=bubbler"
  },
  {
    "item": "Q3336209",
    "label": "nasone",
    "value": "Tag:fountain=nasone"
  },
  {
    "item": "Q250840",
    "label": "nozzle",
    "value": "Tag:fountain=nozzle"
  },
  {
    "item": "Q7578390",
    "label": "Splash pad",
    "value": "Tag:fountain=splash_pad"
 },
  {
    "item": "Q3993741",
    "label": "Torèt",
    "value": "Tag:fountain=toret"
  },
  {
    "item": "Q1415234",
    "label": "15 kV, 16.7 Hz AC railway electrification",
    "value": "Tag:frequency=16.7"
  },
  {
    "item": "Q32350958",
    "label": "bingo hall",
    "value": "Tag:gambling=bingo"
  },
  {
    "item": "Q836661",
    "label": "pachinko",
    "value": "Tag:gambling=pachinko"
  },
  {
    "item": "Q47692",
    "label": "Chinese garden",
    "value": "Tag:garden:style=chinese"
  },
  {
    "item": "Q12783",
    "label": "English garden",
    "value": "Tag:garden:style=english"
  },
  {
    "item": "Q3522256",
    "label": "herb garden",
    "value": "Tag:garden:style=herb_garden"
  },
  {
    "item": "Q15835",
    "label": "Japanese garden",
    "value": "Tag:garden:style=japanese"
  },
  {
    "item": "Q624114",
    "label": "kitchen garden",
    "value": "Tag:garden:style=kitchen"
  },
  {
    "item": "Q291177",
    "label": "rose garden",
    "value": "Tag:garden:style=rosarium"
  },
  {
    "item": "Q244226",
    "label": "Japanese rock garden",
    "value": "Tag:garden:style=zen"
  },
  {
    "item": "Q167346",
    "label": "botanical garden",
    "value": "Tag:garden:type=botanical"
  },
  {
    "item": "Q251958",
    "label": "community garden",
    "value": "Tag:garden:type=community"
  },
  {
    "item": "Q56478984",
    "label": "urban garden",
    "value": "Tag:garden:type=community"
  },
  {
    "item": "Q1776417",
    "label": "monastic garden",
    "value": "Tag:garden:type=monastery"
  },
  {
    "item": "Q24609",
    "label": "1000 mm track gauge",
    "value": "Tag:gauge=1000"
  },
  {
    "item": "Q1193463",
    "label": "1067 mm track gauge",
    "value": "Tag:gauge=1067"
  },
  {
    "item": "Q10397058",
    "label": "1093 mm track gauge",
    "value": "Tag:gauge=1093"
  },
  {
    "item": "Q26270021",
    "label": "1100 mm track gauge",
    "value": "Tag:gauge=1100"
  },
  {
    "item": "Q7831510",
    "label": "1432 mm track gauge",
    "value": "Tag:gauge=1432"
  },
  {
    "item": "Q1999572",
    "label": "1435 mm track gauge",
    "value": "Tag:gauge=1435"
  },
  {
    "item": "Q30106213",
    "label": "1445 mm track gauge",
    "value": "Tag:gauge=1445"
  },
  {
    "item": "Q97148237",
    "label": "1450 mm gauge",
    "value": "Tag:gauge=1450"
  },
  {
    "item": "Q97148958",
    "label": "1458 mm gauge",
    "value": "Tag:gauge=1458"
  },
  {
    "item": "Q1197451",
    "label": "1520 mm track gauge",
    "value": "Tag:gauge=1520"
  },
  {
    "item": "Q21062105",
    "label": "1522 mm track gauge",
    "value": "Tag:gauge=1522"
  },
  {
    "item": "Q19750814",
    "label": "1524 mm track gauge",
    "value": "Tag:gauge=1524"
  },
  {
    "item": "Q6071527",
    "label": "5 ft 3 in gauge",
    "value": "Tag:gauge=1600"
  },
  {
    "item": "Q3319112",
    "label": "1668 mm track gauge",
    "value": "Tag:gauge=1668"
  },
  {
    "item": "Q1493335",
    "label": "1676 mm track gauge",
    "value": "Tag:gauge=1676"
  },
  {
    "item": "Q52330131",
    "label": "1-foot 11½-inch track gauge",
    "value": "Tag:gauge=597"
  },
  {
    "item": "Q10676739",
    "label": "600 mm track gauge",
    "value": "Tag:gauge=600"
  },
  {
    "item": "Q4032352",
    "label": "750 mm track gauge",
    "value": "Tag:gauge=750"
  },
  {
    "item": "Q13218963",
    "label": "762 mm track gauge",
    "value": "Tag:gauge=762"
  },
  {
    "item": "Q10397424",
    "label": "900 mm track gauge",
    "value": "Tag:gauge=900"
  },
  {
    "item": "Q1003207",
    "label": "photovoltaic power station",
    "value": "Tag:generator:method=photovoltaic"
  },
  {
    "item": "Q200297",
    "label": "thermal power station",
    "value": "Tag:generator:method=thermal"
  },
  {
    "item": "Q49833",
    "label": "wind turbine",
    "value": "Tag:generator:method=wind_turbine"
  },
  {
    "item": "Q2944640",
    "label": "gas-fired power station",
    "value": "Tag:generator:source=gas"
  },
  {
    "item": "Q2298412",
    "label": "solar power station",
    "value": "Tag:generator:source=solar"
  },
  {
    "item": "Q49833",
    "label": "wind turbine",
    "value": "Tag:generator:source=wind"
  },
  {
    "item": "Q900729",
    "label": "combined cycle power station",
    "value": "Tag:generator:type=combined_cycle"
  },
  {
    "item": "Q217817",
    "label": "Francis turbine",
    "value": "Tag:generator:type=francis_turbine"
  },
  {
    "item": "Q193470",
    "label": "gas turbine",
    "value": "Tag:generator:type=gas_turbine"
  },
  {
    "item": "Q213947",
    "label": "Kaplan turbine",
    "value": "Tag:generator:type=kaplan_turbine"
  },
  {
    "item": "Q745900",
    "label": "Pelton wheel",
    "value": "Tag:generator:type=pelton_turbine"
  },
  {
    "item": "Q2610088",
    "label": "moraine",
    "value": "Tag:geological=moraine"
  },
  {
    "item": "Q531953",
    "label": "outcrop",
    "value": "Tag:geological=outcrop"
  },
  {
    "item": "Q9096832",
    "label": "paleontological site",
    "value": "Tag:geological=palaeontological_site"
  },
  {
    "item": "Q17505024",
    "label": "space agency",
    "value": "Tag:government=aerospace"
  },
  {
    "item": "Q635719",
    "label": "archives",
    "value": "Tag:government=archive"
  },
  {
    "item": "Q10983451",
    "label": "Court of Audit",
    "value": "Tag:government=audit"
  },
  {
    "item": "Q218719",
    "label": "border control",
    "value": "Tag:government=border_control"
  },
  {
    "item": "Q1469645",
    "label": "cadastral office",
    "value": "Tag:government=cadaster"
  },
  {
    "item": "Q182290",
    "label": "customs",
    "value": "Tag:government=customs"
  },
  {
    "item": "Q55499415",
    "label": "data protection supervisory authority",
    "value": "Tag:government=data_protection"
  },
  {
    "item": "Q1312371",
    "label": "health department",
    "value": "Tag:government=healthcare"
  },
  {
    "item": "Q47913",
    "label": "intelligence agency",
    "value": "Tag:government=intelligence"
  },
  {
    "item": "Q10553309",
    "label": "legislative house",
    "value": "Tag:government=legislative"
  },
  {
    "item": "Q192350",
    "label": "ministry",
    "value": "Tag:government=ministry"
  },
  {
    "item": "Q169180",
    "label": "ombudsman",
    "value": "Tag:government=ombudsperson"
  },
  {
    "item": "Q35749",
    "label": "parliament",
    "value": "Tag:government=parliament"
  },
  {
    "item": "Q481289",
    "label": "official residence",
    "value": "Tag:government=presidency"
  },
  {
    "item": "Q600751",
    "label": "prosecutor",
    "value": "Tag:government=prosecutor"
  },
  {
    "item": "Q745221",
    "label": "register office",
    "value": "Tag:government=register_office"
  },
  {
    "item": "Q12055245",
    "label": "social services",
    "value": "Tag:government=social_services"
  },
  {
    "item": "Q66306401",
    "label": "social welfare",
    "value": "Tag:government=social_welfare"
  },
  {
    "item": "Q480242",
    "label": "statistical service",
    "value": "Tag:government=statistics"
  },
  {
    "item": "Q573607",
    "label": "revenue service",
    "value": "Tag:government=tax"
  },
  {
    "item": "Q7834360",
    "label": "transportation authority",
    "value": "Tag:government=transportation"
  },
  {
    "item": "Q80800782",
    "label": "treasury",
    "value": "Tag:government=treasury"
  },
  {
    "item": "Q98668992",
    "label": "youth welfare department",
    "value": "Tag:government=youth_welfare_department"
  },
  {
    "item": "Q67207179",
    "label": "animal crossing",
    "value": "Tag:hazard=animal_crossing"
  },
  {
    "item": "Q121713",
    "label": "acupuncture",
    "value": "Tag:healthcare:speciality=acupuncture"
  },
  {
    "item": "Q1046686",
    "label": "allergology",
    "value": "Tag:healthcare:speciality=allergology"
  },
  {
    "item": "Q615057",
    "label": "anaesthesiology",
    "value": "Tag:healthcare:speciality=anaesthetics"
  },
  {
    "item": "Q514",
    "label": "anatomy",
    "value": "Tag:healthcare:speciality=anatomy"
  },
  {
    "item": "Q574514",
    "label": "Anthroposophical medicine",
    "value": "Tag:healthcare:specality=anthroposophical"
  },
  {
    "item": "Q913842",
    "label": "Applied kinesiology",
    "value": "Tag:healthcare:speciality=applied_kinesiology"
  },
  {
    "item": "Q206202",
    "label": "aromatherapy",
    "value": "Tag:healthcare:speciality=aromatherapy"
  },
  {
    "item": "Q132325",
    "label": "ayurveda",
    "value": "Tag:healthcare:speciality=ayurveda"
  },
  {
    "item": "Q16262180",
    "label": "behavior therapy",
    "value": "Tag:healthcare:speciality=behavior"
  },
  {
    "item": "Q7094",
    "label": "biochemistry",
    "value": "Tag:healthcare:speciality=biochemistry"
  },
  {
    "item": "Q18500556",
    "label": "clinical biology",
    "value": "Tag:healthcare:speciality=biology"
  },
  {
    "item": "Q1416259",
    "label": "body psychotherapy",
    "value": "Tag:healthcare:speciality=body"
  },
  {
    "item": "Q235007",
    "label": "cardiac surgery",
    "value": "Tag:healthcare:speciality=cardiac_surgery"
  },
  {
    "item": "Q10379",
    "label": "cardiology",
    "value": "Tag:healthcare:speciality=cardiology"
  },
  {
    "item": "Q1741745",
    "label": "child and adolescent psychiatry",
    "value": "Tag:healthcare:speciality=child_psychiatry"
  },
  {
    "item": "Q658096",
    "label": "Chiropractic",
    "value": "Tag:healthcare:speciality=chiropractic"
  },
  {
    "item": "Q189603",
    "label": "public health",
    "value": "Tag:healthcare:speciality=community"
  },
  {
    "item": "Q504033",
    "label": "oral and maxillofacial surgery",
    "value": "Tag:healthcare:speciality=dental_oral_maxillo_facial_surgery"
  },
  {
    "item": "Q171741",
    "label": "depth psychology",
    "value": "Tag:healthcare:speciality=depth"
  },
  {
    "item": "Q171171",
    "label": "dermatology",
    "value": "Tag:healthcare:speciality=dermatology"
  },
  {
    "item": "Q25543366",
    "label": "dermatovenereologist",
    "value": "Tag:healthcare:speciality=dermatovenereology"
  },
  {
    "item": "Q931309",
    "label": "medical imaging",
    "value": "Tag:healthcare:speciality=diagnostic_radiology"
  },
  {
    "item": "Q2861470",
    "label": "emergency medicine",
    "value": "Tag:healthcare:speciality=emergency"
  },
  {
    "item": "Q162606",
    "label": "endocrinology",
    "value": "Tag:healthcare:speciality=endocrinology"
  },
  {
    "item": "Q5445579",
    "label": "fertility clinic",
    "value": "Tag:healthcare:speciality=fertility"
  },
  {
    "item": "Q120569",
    "label": "gastroenterology",
    "value": "Tag:healthcare:speciality=gastroenterology"
  },
  {
    "item": "Q3505712",
    "label": "family medicine",
    "value": "Tag:healthcare:speciality=general"
  },
  {
    "item": "Q10384",
    "label": "geriatrics",
    "value": "Tag:healthcare:speciality=geriatrics"
  },
  {
    "item": "Q80015",
    "label": "obstetrics and gynaecology",
    "value": "Tag:healthcare:speciality=gynaecology"
  },
  {
    "item": "Q103824",
    "label": "hematology",
    "value": "Tag:healthcare:speciality=haematology"
  },
  {
    "item": "Q668064",
    "label": "hepatology",
    "value": "Tag:healthcare:speciality=hepatology"
  },
  {
    "item": "Q861699",
    "label": "herbalism",
    "value": "Tag:healthcare:speciality=herbalism"
  },
  {
    "item": "Q81058",
    "label": "homeopathy",
    "value": "Tag:healthcare:speciality=homeopathy"
  },
  {
    "item": "Q23364",
    "label": "humanistic psychology",
    "value": "Tag:healthcare:speciality=humanistic"
  },
  {
    "item": "Q622676",
    "label": "hydrotherapy",
    "value": "Tag:healthcare:speciality=hydrotherapy"
  },
  {
   "item": "Q8609",
    "label": "hypnosis",
    "value": "Tag:healthcare:speciality=hypnosis"
  },
  {
    "item": "Q101929",
    "label": "immunology",
    "value": "Tag:healthcare:speciality=immunology"
  },
  {
    "item": "Q788926",
    "label": "infectious disease",
    "value": "Tag:healthcare:speciality=infectious_diseases"
  },
  {
    "item": "Q679690",
    "label": "intensive care medicine",
    "value": "Tag:healthcare:speciality=intensive"
  },
  {
    "item": "Q11180",
    "label": "internal medicine",
    "value": "Tag:healthcare:speciality=internal"
  },
  {
    "item": "Q7193",
    "label": "microbiology",
    "value": "Tag:healthcare:speciality=microbiology"
  },
  {
    "item": "Q213403",
    "label": "naturopathy",
    "value": "Tag:healthcare:speciality=naturopathy"
  },
  {
    "item": "Q177635",
    "label": "nephrology",
    "value": "Tag:healthcare:speciality=nephrology"
  },
  {
    "item": "Q83042",
    "label": "neurology",
    "value": "Tag:healthcare:speciality=neurology"
  },
  {
    "item": "Q660910",
    "label": "neurophysiology",
    "value": "Tag:healthcare:speciality=neurophysiology"
  },
  {
    "item": "Q2699874",
    "label": "neuropsychiatry",
    "value": "Tag:healthcare:speciality=neuropsychiatry"
  },
  {
    "item": "Q188449",
    "label": "neurosurgery",
    "value": "Tag:healthcare:speciality=neurosurgery"
  },
  {
    "item": "Q214963",
    "label": "nuclear medicine",
    "value": "Tag:healthcare:speciality=nuclear"
  },
  {
    "item": "Q628764",
    "label": "occupational medicine",
    "value": "Tag:healthcare:speciality=occupational"
  },
  {
    "item": "Q162555",
    "label": "oncology",
    "value": "Tag:healthcare:speciality=oncology"
  },
  {
    "item": "Q161437",
    "label": "ophthalmology",
    "value": "Tag:healthcare:speciality=ophthalmology"
  },
  {
    "item": "Q118301",
    "label": "orthodontics",
    "value": "Tag:healthcare:speciality=orthodontics"
  },
  {
    "item": "Q216685",
    "label": "orthopedics",
    "value": "Tag:healthcare:speciality=orthopaedics"
  },
  {
    "item": "Q325253",
    "label": "osteopathy",
    "value": "Tag:healthcare:speciality=osteopathy"
  },
  {
    "item": "Q189553",
    "label": "otolaryngology",
    "value": "Tag:healthcare:speciality=otolaryngology"
  },
  {
    "item": "Q1430816",
    "label": "pediatric surgery",
    "value": "Tag:healthcare:speciality=paediatric_surgery"
  },
  {
    "item": "Q123028",
    "label": "paediatrics",
    "value": "Tag:healthcare:speciality=paediatrics"
  },
  {
    "item": "Q29483",
    "label": "palliative care",
    "value": "Tag:healthcare:speciality=palliative"
  },
  {
    "item": "Q683455",
    "label": "anatomical pathology",
    "value": "Tag:healthcare:speciality=pathology"
  },
  {
    "item": "Q128406",
    "label": "pharmacology",
    "value": "Tag:healthcare:speciality=pharmacology"
  },
  {
    "item": "Q2678675",
    "label": "physical medicine and rehabilitation",
    "value": "Tag:healthcare:speciality=physiatry"
  },
  {
    "item": "Q182442",
    "label": "plastic surgery",
    "value": "Tag:healthcare:speciality=plastic_surgery"
  },
  {
    "item": "Q11865729",
    "label": "podiatry",
    "value": "Tag:healthcare:speciality=podiatry"
  },
  {
    "item": "Q1413084",
    "label": "colorectal surgery",
    "value": "Tag:healthcare:speciality=proctology"
  },
  {
    "item": "Q7867",
    "label": "psychiatry",
    "value": "Tag:healthcare:speciality=psychiatry"
  },
  {
    "item": "Q203337",
    "label": "pulmonology",
    "value": "Tag:healthcare:speciality=pulmonology"
  },
  {
    "item": "Q77604",
    "label": "radiology",
    "value": "Tag:healthcare:speciality=radiology"
  },
  {
    "item": "Q180507",
    "label": "radiation therapy",
    "value": "Tag:healthcare:speciality=radiotherapy"
  },
  {
    "item": "Q449058",
    "label": "reflexology",
    "value": "Tag:healthcare:speciality=reflexology"
  },
  {
    "item": "Q183057",
    "label": "Reiki",
    "value": "Tag:healthcare:speciality=reiki"
  },
  {
    "item": "Q327657",
    "label": "rheumatology",
    "value": "Tag:healthcare:speciality=rheumatology"
  },
  {
    "item": "Q833228",
    "label": "Shiatsu",
    "value": "Tag:healthcare:speciality=shiatsu"
  },
  {
    "item": "Q3673891",
    "label": "oral medicine",
    "value": "Tag:healthcare:speciality=stomatology"
  },
  {
    "item": "Q40821",
    "label": "surgery",
    "value": "Tag:healthcare:speciality=surgery"
  },
  {
    "item": "Q3545481",
    "label": "surgical oncology",
    "value": "Tag:healthcare:speciality=surgical_oncology"
  },
  {
    "item": "Q1929812",
    "label": "systemic therapy",
    "value": "Tag:healthcare:speciality=systemic"
  },
  {
    "item": "Q2964004",
    "label": "thoracic surgery",
    "value": "Tag:healthcare:speciality=thoracic_surgery"
  },
  {
    "item": "Q200253",
    "label": "traditional Chinese medicine",
    "value": "Tag:healthcare:speciality=traditional_chinese_medicine"
  },
  {
    "item": "Q1049976",
    "label": "transplantology",
    "value": "Tag:healthcare:speciality=transplant"
  },
  {
    "item": "Q338379",
    "label": "trauma surgery",
    "value": "Tag:healthcare:speciality=trauma"
  },
  {
    "item": "Q1365243",
    "label": "tropical medicine",
    "value": "Tag:healthcare:speciality=tropical"
  },
  {
    "item": "Q1399328",
    "label": "Tui na",
    "value": "Tag:healthcare:speciality=tuina"
  },
  {
    "item": "Q1520176",
    "label": "unani",
    "value": "Tag:healthcare:speciality=unani"
  },
  {
    "item": "Q105650",
    "label": "urology",
    "value": "Tag:healthcare:speciality=urology"
  },
  {
    "item": "Q192995",
    "label": "vaccination",
    "value": "Tag:healthcare:speciality=vaccination"
  },
  {
    "item": "Q1498222",
    "label": "vascular surgery",
    "value": "Tag:healthcare:speciality=vascular_surgery"
  },
  {
    "item": "Q1784782",
    "label": "venereology",
    "value": "Tag:healthcare:speciality=venereology"
  },
  {
    "item": "Q188504",
    "label": "alternative medicine",
    "value": "Tag:healthcare=alternative"
  },
  {
    "item": "Q1644347",
    "label": "audiologist",
    "value": "Tag:healthcare=audiologist"
  },
  {
    "item": "Q1752787",
    "label": "birthing center",
    "value": "Tag:healthcare=birthing_center"
  },
  {
    "item": "Q763244",
    "label": "blood bank",
    "value": "Tag:healthcare=blood_bank"
  },
  {
    "item": "Q29982375",
    "label": "blood collection centre",
    "value": "Tag:healthcare=blood_donation"
  },
  {
    "item": "Q1774898",
    "label": "clinic",
    "value": "Tag:healthcare=clinic"
  },
  {
    "item": "Q27349",
    "label": "dentist",
    "value": "Tag:healthcare=dentist"
  },
  {
    "item": "Q718966",
    "label": "doctor's office",
    "value": "Tag:healthcare=doctor"
  },
  {
    "item": "Q39631",
    "label": "physician",
    "value": "Tag:healthcare=doctor"
  },
  {
    "item": "Q16917",
    "label": "hospital",
    "value": "Tag:healthcare=hospital"
  },
  {
    "item": "Q185196",
    "label": "midwife",
    "value": "Tag:healthcare=midwife"
  },
  {
    "item": "Q631193",
    "label": "occupational therapist",
    "value": "Tag:healthcare=occupational_therapist"
  },
  {
    "item": "Q9052719",
    "label": "optometrist",
    "value": "Tag:healthcare=optometrist"
  },
  {
    "item": "Q694748",
    "label": "physiotherapist",
    "value": "Tag:healthcare=physiotherapist"
  },
  {
    "item": "Q186005",
    "label": "physiotherapy",
    "value": "Tag:healthcare=physiotherapist"
  },
  {
    "item": "Q3393065",
    "label": "podiatrist",
    "value": "Tag:healthcare=podiatrist"
  },
  {
    "item": "Q1900167",
    "label": "psychotherapist",
    "value": "Tag:healthcare=psychotherapist"
  },
  {
    "item": "Q11762416",
    "label": "speech and language therapist",
    "value": "Tag:healthcare=speech_therapist"
  },
  {
    "item": "Q1188447",
    "label": "Denkmalgeschütztes Objekt",
    "value": "Tag:heritage:operator=bda"
  },
  {
    "item": "Q19558910",
    "label": "place listed on the National Register of Historic Places",
    "value": "Tag:heritage:operator=nrhp"
  },
  {
    "item": "Q64959476",    "label": "Pittsburgh History and Landmarks Foundation Historic Landmark",
    "value": "Tag:heritage:operator=phlf"
  },
  {
    "item": "Q916333",
    "label": "Rijksmonument",
    "value": "Tag:heritage:operator=rce"
  },
  {
    "item": "Q9259",
    "label": "UNESCO World Heritage Site",
    "value": "Tag:heritage:operator=whc"
  },
  {
    "item": "Q916333",
    "label": "Rijksmonument",
    "value": "Tag:heritage=2"
  },
  {
    "item": "Q1639395",
    "label": "bridle path",
    "value": "Tag:highway=bridleway"
  },
  {
    "item": "Q42775781",
    "label": "guided busway",
    "value": "Tag:highway=bus_guideway"
  },
  {
    "item": "Q953806",
    "label": "bus stop",
    "value": "Tag:highway=bus_stop"
  },
  {
    "item": "Q1135449",
    "label": "corridor",
    "value": "Tag:highway=corridor"
  },
  {
    "item": "Q8010",
    "label": "crosswalk",
    "value": "Tag:highway=crossing"
  },
  {
    "item": "Q221722",
    "label": "bike path",
    "value": "Tag:highway=cycleway"
  },
  {
    "item": "Q132911",
    "label": "elevator",
    "value": "Tag:highway=elevator"
  },
  {
    "item": "Q1333922",
    "label": "emergency access point",
    "value": "Tag:highway=emergency_access_point"
  },
  {
    "item": "Q268756",
    "label": "Runaway truck ramp",
    "value": "Tag:highway=escape"
  },
  {
    "item": "Q13634881",
    "label": "walkway",
    "value": "Tag:highway=footway"
  },
  {
    "item": "Q3352369",
    "label": "footpath",
    "value": "Tag:highway=footway"
  },
  {
    "item": "Q1628979",
    "label": "living street",
    "value": "Tag:highway=living_street"
  },
  {
    "item": "Q13222303",
    "label": "Highway location marker",
    "value": "Tag:highway=milestone"
  },
  {
    "item": "Q12037720",
    "label": "mini roundabout",
    "value": "Tag:highway=mini_roundabout"
  },
  {
    "item": "Q46622",
    "label": "controlled-access highway",
    "value": "Tag:highway=motorway"
  },
  {
    "item": "Q785486",
    "label": "three-way interchange",
    "value": "Tag:highway=motorway_junction"
  },
  {
    "item": "Q785658",
    "label": "motorway forks",
    "value": "Tag:highway=motorway_junction"
  },
  {
    "item": "Q353070",
    "label": "junction",
    "value": "Tag:highway=motorway_junction"
  },
  {
    "item": "Q2924561",
    "label": "ramp",
    "value": "Tag:highway=motorway_link"
  },
  {
    "item": "Q2091725",
    "label": "passing place",
    "value": "Tag:highway=passing_place"
  },
  {
    "item": "Q5004679",
    "label": "path",
    "value": "Tag:highway=path"
  },
  {
    "item": "Q369730",
    "label": "pedestrian zone",
    "value": "Tag:highway=pedestrian"
  },
  {
    "item": "Q7540841",
    "label": "slip lane",
    "value": "Tag:highway=primary_link"
  },
  {
    "item": "Q1777138",
    "label": "race track",
    "value": "Tag:highway=raceway"
  },
  {
    "item": "Q2338524",
    "label": "auto racing track",
    "value": "Tag:highway=raceway"
  },
  {
    "item": "Q97674120",
    "label": "residential street",
    "value": "Tag:highway=residential"
  },
  {
    "item": "Q786014",
    "label": "rest area",
    "value": "Tag:highway=rest_area"
  },
  {
    "item": "Q34442",
    "label": "road",
    "value": "Tag:highway=road"
  },
  {
    "item": "Q896009",
    "label": "Landesstraße",
    "value": "Tag:highway=secondary"
  },
  {
    "item": "Q7540841",
    "label": "slip lane",
    "value": "Tag:highway=secondary_link"
  },
  {
    "item": "Q786014",
    "label": "rest area",
    "value": "Tag:highway=services"
  },
  {
    "item": "Q33709",
    "label": "traffic enforcement camera",
    "value": "Tag:highway=speed_camera"
  },
  {
    "item": "Q12511",
    "label": "stairs",
    "value": "Tag:highway=steps"
  },
  {
    "item": "Q250429",
    "label": "stop sign",
    "value": "Tag:highway=stop"
  },
  {
    "item": "Q503958",
    "label": "streetlight",
    "value": "Tag:highway=street_lamp"
  },
  {
    "item": "Q7540841",
    "label": "slip lane",
    "value": "Tag:highway=tertiary_link"
  },
  {
    "item": "Q628179",
    "label": "trail",
    "value": "Tag:highway=track"
  },
  {
    "item": "Q700143",
    "label": "dirt road",
    "value": "Tag:highway=track"
  },
  {
    "item": "Q2516427",
    "label": "traffic mirror",
    "value": "Tag:highway=traffic_mirror"
  },
  {
    "item": "Q8004",
    "label": "traffic light",
    "value": "Tag:highway=traffic_signals"
  },
  {
    "item": "Q2145163",
    "label": "trunk road",
    "value": "Tag:highway=trunk"
  },
  {
    "item": "Q2924561",
    "label": "ramp",
    "value": "Tag:highway=trunk_link"
  },
  {
    "item": "Q12731",
    "label": "cul-de-sac",
    "value": "Tag:highway=turning_circle"
  },
  {
    "item": "Q98592963",
    "label": "turning circle",
    "value": "Tag:highway=turning_loop"
  },
  {
    "item": "Q648116",
    "label": "via ferrata",
    "value": "Tag:highway=via_ferrata"
  },
  {
    "item": "Q630276",
    "label": "Ancient China",
    "value": "Tag:historic:civilization=ancient_chinese"
  },
  {
    "item": "Q11768",
    "label": "Ancient Egypt",
    "value": "Tag:historic:civilization=ancient_egyptian"
  },
  {
    "item": "Q11772",
    "label": "Ancient Greece",
    "value": "Tag:historic:civilization=ancient_greece"
  },
  {
    "item": "Q1747689",
    "label": "Ancient Rome",
    "value": "Tag:historic:civilization=ancient_roman"
  },
  {
    "item": "Q32768",
    "label": "Anglo-Saxons",
    "value": "Tag:historic:civilization=anglo-saxon"
  },
  {
    "item": "Q12544",
    "label": "Byzantine Empire",
    "value": "Tag:historic:civilization=byzantine"
  },
  {
    "item": "Q35966",
    "label": "Ancient Celts",
    "value": "Tag:historic:civilization=celtic"
  },
  {
    "item": "Q318144",
    "label": "Cycladic civilization",
    "value": "Tag:historic:civilization=cycladic"
  },
  {
    "item": "Q17161",
    "label": "Etruschi",
    "value": "Tag:historic:civilization=etruscan"
  },
  {
    "item": "Q253482",
    "label": "Falisci",
    "value": "Tag:historic:civilization=faliscan"
  },
  {
    "item": "Q2320005",
    "label": "Ptolemaic Kingdom",
    "value": "Tag:historic:civilization=greek_egyptian"
  },
  {
    "item": "Q937774",
    "label": "Helladic period",
    "value": "Tag:historic:civilization=helladic"
  },
  {
    "item": "Q45813",
    "label": "Huns",
    "value": "Tag:historic:civilization=hun"
  },
  {
    "item": "Q190992",
    "label": "Iberians",
    "value": "Tag:historic:civilization=iberian"
  },
  {
    "item": "Q12060881",
    "label": "Chinese Empire",
    "value": "Tag:historic:civilization=imperial_chinese"
  },
  {
    "item": "Q28573",
    "label": "Inca Empire",
    "value": "Tag:historic:civilization=inca"
  },
  {
    "item": "Q123559",
    "label": "al-Andalus",
    "value": "Tag:historic:civilization=islamic_iberia"
  },
  {
    "item": "Q28567",
    "label": "Maya civilization",
    "value": "Tag:historic:civilization=mayan"
  },
  {
    "item": "Q12554",
    "label": "Middle Ages",
    "value": "Tag:historic:civilization=middle-ages"
  },
  {
    "item": "Q134178",
    "label": "Minoan civilization",
    "value": "Tag:historic:civilization=minoan"
  },
  {
    "item": "Q181264",
    "label": "Mycenaean Greece",
    "value": "Tag:historic:civilization=mycenaean"
  },
  {
    "item": "Q1421436",
    "label": "nuragic civilization",
    "value": "Tag:historic:civilization=nuragic"
  },
  {
    "item": "Q11756",
    "label": "prehistory",
    "value": "Tag:historic:civilization=prehistoric"
  },
  {
    "item": "Q202311",
    "label": "Egypt",
    "value": "Tag:historic:civilization=roman_and_byzantine_egyptian"
  },
  {
    "item": "Q144964",
    "label": "Thracans",
    "value": "Tag:historic:civilization=thracian"
  },
  {
    "item": "Q1307407",
    "label": "Tiwanaku Empire",
    "value": "Tag:historic:civilization=tiahuanacota"
  },
  {
    "item": "Q12567",
    "label": "Vikings",
    "value": "Tag:historic:civilization=vikingian"
  },
  {
    "item": "Q126936",
    "label": "Visigothic Kingdom",
    "value": "Tag:historic:civilization=visigothic_kingdom"
  },
  {
    "item": "Q42834",
    "label": "Western Roman Empire (395-476 AD)",
    "value": "Tag:historic:civilization=western_roman"
  },
  {
    "item": "Q5986345",
    "label": "Ichma culture",
    "value": "Tag:historic:civilization=ychsma"
  },
  {
    "item": "Q157956",
    "label": "Nineteenth Dynasty of Egypt",
    "value": "Tag:historic:era=dynasty_XIX"
  },
  {
    "item": "Q44155",
    "label": "Mesolithic",
    "value": "Tag:historic:era=mesolithic"
  },
  {
    "item": "Q36422",
    "label": "Neolithic",
    "value": "Tag:historic:era=neolithic"
  },
  {
    "item": "Q40203",
    "label": "paleolithic",
    "value": "Tag:historic:era=paleolithic"
  },
  {
    "item": "Q8409",
    "label": "Alexander the Great",
    "value": "Tag:historic:period=alexander_the_great"
  },
  {
    "item": "Q271834",
    "label": "Archaic Greece",
    "value": "Tag:historic:period=archaic_greece"
  },
  {
    "item": "Q319531",
    "label": "Azuchi-Momoyama period",
    "value": "Tag:historic:period=azuchi-momoyama"
  },
  {
    "item": "Q11761",
    "label": "Bronze Age",
    "value": "Tag:historic:period=bronze-age"
  },
  {
    "item": "Q843745",
    "label": "Classical Greece",
    "value": "Tag:historic:period=classical_greece"
  },
  {
    "item": "Q238399",
    "label": "Dominate",
    "value": "Tag:historic:period=dominate"
  },
  {
    "item": "Q187979",
    "label": "Early Dynastic Period of Egypt",
    "value": "Tag:historic:period=early_dynastic_period"
  },
  {
    "item": "Q184963",
    "label": "Edo period",
    "value": "Tag:historic:period=edo"
  },
  {
    "item": "Q232211",
    "label": "First Intermediate Period of Egypt",
    "value": "Tag:historic:period=first_intermediate_period"
  },
  {
    "item": "Q926624",
    "label": "Twenty-seventh Dynasty of Egypt",
    "value": "Tag:historic:period=first_persian_period"
  },
  {
    "item": "Q210443",
    "label": "Greek Dark Ages",
    "value": "Tag:historic:period=greek_dark_ages"
  },
  {
    "item": "Q193292",
    "label": "Heian period",
    "value": "Tag:historic:period=heian"
  },
  {
    "item": "Q15155713",
    "label": "Hellenistic Greece",
    "value": "Tag:historic:period=hellenistic_greece"
  },
  {
    "item": "Q11764",
    "label": "Iron Age",
    "value": "Tag:historic:period=iron-age"
  },
  {
    "item": "Q52824",
    "label": "Jōmon period",
    "value": "Tag:historic:period=jomon"
  },
  {
    "item": "Q28179",
    "label": "Joseon",
    "value": "Tag:historic:period=joseon"
  },
  {
    "item": "Q236205",
    "label": "Kamakura period",
    "value": "Tag:historic:period=kamakura"
  },
  {
    "item": "Q28370",
    "label": "Goguryeo",
    "value": "Tag:historic:period=koguryo"
  },
  {
    "item": "Q621917",
    "label": "Late Period of ancient Egypt",
    "value": "Tag:historic:period=late_period"
  },
  {
    "item": "Q191324",
    "label": "Middle Kingdom of Egypt",
    "value": "Tag:historic:period=middle_kingdom"
  },
  {
    "item": "Q334845",
    "label": "Muromachi period",
    "value": "Tag:historic:period=muromachi"
  },
  {
    "item": "Q180568",
    "label": "New Kingdom of Egypt",
    "value": "Tag:historic:period=new_kingdom"
  },
  {
    "item": "Q177819",
    "label": "Old Kingdom of Egypt",
    "value": "Tag:historic:period=old_kingdom"
  },
  {
    "item": "Q714601",
    "label": "Predynastic Period of Egypt",
    "value": "Tag:historic:period=predynastic_egypt"
  },
  {
    "item": "Q206414",
    "label": "principate",
    "value": "Tag:historic:period=principate"
  },
  {
    "item": "Q1484140",
    "label": "Protodynastic Period of Egypt",
    "value": "Tag:historic:period=protodynastic_egypt"
  },
  {
    "item": "Q2320005",
    "label": "Ptolemaic Kingdom",
    "value": "Tag:historic:period=ptolemaic_egypt"
  },
  {
    "item": "Q2497438",
    "label": "Roman Greece",
    "value": "Tag:historic:period=roman_greece"
  },
  {
    "item": "Q201038",
    "label": "Roman Kingdom",
    "value": "Tag:historic:period=roman_kingdom"
  },
  {
    "item": "Q17167",
    "label": "Roman Republic",
    "value": "Tag:historic:period=roman_republic"
  },
  {
    "item": "Q206715",
    "label": "Second Intermediate Period of Egypt",
    "value": "Tag:historic:period=second_intermediate_period"
  },
  {
    "item": "Q978071",
    "label": "Thirty-first Dynasty of Egypt",
    "value": "Tag:historic:period=second_persian_period"
  },
  {
    "item": "Q28456",
    "label": "Silla",
    "value": "Tag:historic:period=silla"
  },
  {
    "item": "Q11759",
    "label": "Stone Age",
    "value": "Tag:historic:period=stone-age"
  },
  {
    "item": "Q212728",
    "label": "Third Intermediate Period of Egypt",
    "value": "Tag:historic:period=third_intermediate_period"
  },
  {
    "item": "Q207858",
    "label": "Yayoi period",
    "value": "Tag:historic:period=yayoi"
  },
  {
    "item": "Q839954",
    "label": "archaeological site",
    "value": "Tag:historic=archaeological_site"
  },
  {
    "item": "Q10971470",
    "label": "ward",
    "value": "Tag:historic=bailey"
  },
  {
    "item": "Q718893",
    "label": "theater",
    "value": "Tag:historic=battlefield"
  },
  {
    "item": "Q81103",
    "label": "cannon",
    "value": "Tag:historic=cannon"
  },
  {
    "item": "Q751876",
    "label": "château",
    "value": "Tag:historic=castle"
  },
  {
    "item": "Q23413",
    "label": "castle",
    "value": "Tag:historic=castle"
  },
  {
    "item": "Q82117",
    "label": "city gate",
    "value": "Tag:historic=city_gate"
  },
  {
    "item": "Q16748868",
    "label": "city walls",
    "value": "Tag:historic=citywalls"
  },
  {
    "item": "Q1785071",
    "label": "fort",
    "value": "Tag:historic=fort"
  },
  {
    "item": "Q210272",
    "label": "cultural heritage",
    "value": "Tag:historic=heritage"
  },
  {
    "item": "Q879050",
    "label": "manor house",
    "value": "Tag:historic=manor"
  },
  {
    "item": "Q5003624",
    "label": "memorial",
    "value": "Tag:historic=memorial"
  },
  {
    "item": "Q84163056",
    "label": "Royal Saxon milestone",
    "value": "Tag:historic=milestone"
  },
  {
    "item": "Q10145",
    "label": "milestone",
    "value": "Tag:historic=milestone"
  },
  {
    "item": "Q4989906",
    "label": "monument",
    "value": "Tag:historic=monument"
  },
  {
    "item": "Q16560",
    "label": "palace",
    "value": "Tag:historic=palace"
  },
  {
    "item": "Q241212",
    "label": "pillory",
    "value": "Tag:historic=pillory"
  },
  {
    "item": "Q109607",
    "label": "ruins",
    "value": "Tag:historic=ruins"
  },
  {
    "item": "Q24566025",
    "label": "Norse runestone",
    "value": "Tag:historic=rune_stone"
  },
  {
    "item": "Q815241",
    "label": "runestone",
    "value": "Tag:historic=rune_stone"
  },
  {
    "item": "Q575727",
    "label": "museum ship",
    "value": "Tag:historic=ship"
  },
  {
    "item": "Q381885",
    "label": "tomb",
    "value": "Tag:historic=tomb"
  },
  {
    "item": "Q65954323",
    "label": "tree shrine",
    "value": "Tag:historic=tree_shrine"
  },
  {
    "item": "Q2309609",
    "label": "wayside cross",
    "value": "Tag:historic=wayside_cross"
  },
  {
    "item": "Q3395121",
    "label": "wayside shrine",
    "value": "Tag:historic=wayside_shrine"
  },
  {
    "item": "Q85290",
    "label": "shipwreck",
    "value": "Tag:historic=wreck"
  },
  {
    "item": "Q44396585",
    "label": "aluminium smelter",
    "value": "Tag:industrial=aluminium_smelting"
  },
  {
    "item": "Q274393",
    "label": "bakery",
    "value": "Tag:industrial=bakery"
  },
  {
    "item": "Q198632",
    "label": "brickyard",
    "value": "Tag:industrial=brickyard"
  },
  {
    "item": "Q1191753",
    "label": "vehicle garage",
    "value": "Tag:industrial=depot"
  },
  {
    "item": "Q66490764",
    "label": "vehicle depot",
    "value": "Tag:industrial=depot"
  },
  {
    "item": "Q60614978",
    "label": "distributor",
    "value": "Tag:industrial=distributor"
  },
  {
    "item": "Q83405",
    "label": "factory",
    "value": "Tag:industrial=factory"
  },
  {
    "item": "Q540912",
    "label": "food industry",
    "value": "Tag:industrial=food_industry"
  },
  {
    "item": "Q60077401",
    "label": "furniture factory",
    "value": "Tag:industrial=furniture"
  },
  {
    "item": "Q44494",
    "label": "mill",
    "value": "Tag:industrial=grinding_mill"
  },
  {
    "item": "Q55121639",
    "label": "district heating station",
    "value": "Tag:industrial=heating_station"
  },
  {
    "item": "Q2771395",
    "label": "ice factory",
    "value": "Tag:industrial=ice_factory"
  },
  {
    "item": "Q2111762",
    "label": "machine shop",
    "value": "Tag:industrial=machine_shop"
  },
  {
    "item": "Q820477",
    "label": "mine",
    "value": "Tag:industrial=mine"
  },
  {
    "item": "Q862571",
    "label": "petroleum industry",
    "value": "Tag:industrial=oil"
  },
  {
    "item": "Q297163",
    "label": "oil mill",
    "value": "Tag:industrial=oil_mill"
  },
  {
    "item": "Q96401858",
    "label": "rice mill",
    "value": "Tag:industrial=rice_mill"
  },
  {
    "item": "Q244326",
    "label": "salt evaporation pond",
    "value": "Tag:industrial=salt_pond"
  },
  {
    "item": "Q505213",
    "label": "sawmill",
    "value": "Tag:industrial=sawmill"
  },
  {
    "item": "Q1230600",
    "label": "wrecking yard",
    "value": "Tag:industrial=scrap_yard"
  },
  {
    "item": "Q190928",
    "label": "shipyard",
    "value": "Tag:industrial=shipyard"
  },
  {
    "item": "Q385557",
    "label": "slaughterhouse",
    "value": "Tag:industrial=slaughterhouse"
  },
  {
    "item": "Q98161482",
    "label": "steelmaking factory",
    "value": "Tag:industrial=steelmaking"
  },
  {
    "item": "Q181623",
    "label": "warehouse",
    "value": "Tag:industrial=warehouse"
  },
  {
    "item": "Q758877",
    "label": "audio tour",
    "value": "Tag:information=audioguide"
  },
  {
    "item": "Q76419950",
    "label": "information board",
    "value": "Tag:information=board"
  },
  {
    "item": "Q22812402",
    "label": "signpost",
    "value": "Tag:information=guidepost"
  },
  {
    "item": "Q12059912",
    "label": "tourist map",
    "value": "Tag:information=map"
  },
  {
    "item": "Q884257",
    "label": "tactile map",
    "value": "Tag:information=tactile_map"
  },
  {
    "item": "Q25382084",
    "label": "tactile model",
    "value": "Tag:information=tactile_model"
  },
  {
    "item": "Q18411786",
    "label": "visitor centre",
    "value": "Tag:information=visitor_centre"
  },
  {
    "item": "Q216640",
    "label": "computer terminal",
    "value": "Tag:internet_access=terminal"
  },
  {
    "item": "Q1294471",
    "label": "cable Internet access",
    "value": "Tag:internet_access=wired"
  },
  {
    "item": "Q2744831",
    "label": "Center pivot irrigation",
    "value": "Tag:irrigation=pivot"
  },
  {
    "item": "Q9842",
    "label": "primary school",
    "value": "Tag:isced:level=1"
  },
  {
    "item": "Q149566",
    "label": "middle school",
    "value": "Tag:isced:level=2"
  },
  {
    "item": "Q14545633",
    "label": "IUCN category III: Natural Monument or Feature",
    "value": "Tag:iucn_level=I"
  },
  {
    "item": "Q14545628",
    "label": "IUCN category II: National Park",
    "value": "Tag:iucn_level=II"
  },
  {
    "item": "Q14545633",
    "label": "IUCN category III: Natural Monument or Feature",
    "value": "Tag:iucn_level=III"
  },
  {
    "item": "Q13586568",
    "label": "diverging diamond interchange",
    "value": "Tag:junction=ddi"
  },
  {
    "item": "Q7882923",
    "label": "Uncontrolled intersection",
    "value": "Tag:junction=filter"
  },
  {
    "item": "Q2642279",
    "label": "jughandle",
    "value": "Tag:junction=jughandle"
  },
  {
    "item": "Q1525",
    "label": "roundabout",
    "value": "Tag:junction=roundabout"
  },
  {
    "item": "Q5350656",
    "label": "Single-point urban interchange",
    "value": "Tag:junction=spui"
  },
  {
    "item": "Q1788454",
    "label": "road junction",
    "value": "Tag:junction=yes"
  },
  {
    "item": "Q59772",
    "label": "lime kiln",
    "value": "Tag:kiln=lime"
  },
  {
    "item": "Q25391",
    "label": "dune",
    "value": "Tag:landform=dune_system"
  },
  {
    "item": "Q89021074",
    "label": "dune system",
    "value": "Tag:landform=dune_system"
  },
  {
    "item": "Q332784",
    "label": "esker",
    "value": "Tag:landform=esker"
  },
  {
    "item": "Q17155155",
    "label": "raised beach",
    "value": "Tag:landform=raised_beach"
  },
  {
    "item": "Q8054653",
    "label": "allotment",
    "value": "Tag:landuse=allotments"
  },
  {
    "item": "Q813672",
    "label": "basin",
    "value": "Tag:landuse=basin"
  },
  {
    "item": "Q896586",
    "label": "brownfield land",
    "value": "Tag:landuse=brownfield"
  },
  {
    "item": "Q39614",
    "label": "cemetery",
    "value": "Tag:landuse=cemetery"
  },
  {
    "item": "Q338313",
    "label": "business park",
    "value": "Tag:landuse=commercial"
  },
  {
    "item": "Q1133961",
    "label": "commercial district",
    "value": "Tag:landuse=commercial"
  },
  {
    "item": "Q360418",
    "label": "construction site",
    "value": "Tag:landuse=construction"
  },
  {
    "item": "Q188869",
    "label": "field",
    "value": "Tag:landuse=farmland"
  },
  {
    "item": "Q3395383",
    "label": "agricultural land",
    "value": "Tag:landuse=farmland"
  },
  {
    "item": "Q42811590",
    "label": "farmyard",
    "value": "Tag:landuse=farmyard"
  },
  {
    "item": "Q2586008",
    "label": "commercial forest",
    "value": "Tag:landuse=forest"
  },
  {
    "item": "Q643352",
    "label": "grass",
    "value": "Tag:landuse=grass"
  },
  {
    "item": "Q207766",
    "label": "lawn",
    "value": "Tag:landuse=grass"
  },
  {
    "item": "Q12018455",
    "label": "greenfield land",
    "value": "Tag:landuse=greenfield"
  },
  {
    "item": "Q48803",
    "label": "horticulture",
    "value": "Tag:landuse=greenhouse_horticulture"
  },
  {
    "item": "Q329683",
    "label": "industrial park",
    "value": "Tag:landuse=industrial"
  },
  {
    "item": "Q6027980",
    "label": "industrial region",
    "value": "Tag:landuse=industrial"
  },
  {
    "item": "Q1662024",
    "label": "industrial district",
    "value": "Tag:landuse=industrial"
  },
  {
    "item": "Q152810",
    "label": "landfill",
    "value": "Tag:landuse=landfill"
  },
  {
    "item": "Q7777019",
    "label": "meadow",
    "value": "Tag:landuse=meadow"
  },
  {
    "item": "Q236371",
    "label": "orchard",
    "value": "Tag:landuse=orchard"
  },
  {
    "item": "Q155511",
    "label": "plant nursery",
    "value": "Tag:landuse=plant_nursery"
  },
  {
    "item": "Q188040",
    "label": "quarry",
    "value": "Tag:landuse=quarry"
  },
  {
    "item": "Q88941642",
    "label": "millstones of Valmeriana",
    "value": "Tag:landuse=quarry"
  },
  {
    "item": "Q800279",
    "label": "railway facility",
    "value": "Tag:landuse=rilway"
  },
  {
    "item": "Q55493",
    "label": "goods station",
    "value": "Tag:landuse=railway"
  },
  {
    "item": "Q2063507",
    "label": "recreation area",
    "value": "Tag:landuse=recreation_ground"
  },
  {
    "item": "Q811600",
    "label": "sacred grove",
    "value": "Tag:landuse=religious"
  },
  {
    "item": "Q131681",
    "label": "reservoir",
    "value": "Tag:landuse=reservoir"
  },
  {
    "item": "Q674950",
    "label": "residential area",
    "value": "Tag:landuse=residential"
  },
  {
    "item": "Q12104567",
    "label": "housing estate",
    "value": "Tag:landuse=residential"
  },
  {
    "item": "Q5152545",
    "label": "retail area",
    "value": "Tag:landuse=retail"
  },
  {
    "item": "Q27095213",
    "label": "shopping district",
    "value": "Tag:landuse=retail"
  },
  {
    "item": "Q39659371",
    "label": "retail environment",
    "value": "Tag:landuse=retail"
  },
  {
    "item": "Q244326",
    "label": "salt evaporation pond",
    "value": "Tag:landuse=salt_pond"
  },
  {
    "item": "Q57743",
    "label": "village green",
    "value": "Tag:landuse=village_green"
  },
  {
    "item": "Q22715",
    "label": "vineyard",
    "value": "Tag:landuse=vineyard"
  },
  {
    "item": "Q1131316",
    "label": "deciduous plant",
    "value": "Tag:leaf_cycle=deciduous"
  },
  {
    "item": "Q190489",
    "label": "evergreen plant",
    "value": "Tag:leaf_cycle=evergreen"
  },
  {
    "item": "Q738961",
    "label": "Semi-deciduous",
    "value": "Tag:leaf_cycle=semi_deciduous"
  },
  {
    "item": "Q1211122",
    "label": "deciduous forest",
    "value": "Tag:leaf_type=broadleaved"
  },
  {
    "item": "Q16237489",
    "label": "coniferous forest",
    "value": "Tag:leaf_type=needleleaved"
  },
  {
    "item": "Q47521258",
    "label": "adult gaming centre",
    "value": "Tag:leisure=adult_gaming_centre"
  },
  {
    "item": "Q260676",
    "label": "amusement arcade",
    "value": "Tag:leisure=amusement_arcade"
  },
  {
    "item": "Q3126170",
    "label": "bandstand",
    "value": "Tag:leisure=bandstand"
  },
  {
    "item": "Q1021711",
    "label": "seaside resort",
    "value": "Tag:leisure=beach_resort"
  },
  {
    "item": "Q2244608",
    "label": "bird hide",
    "value": "Tag:leisure=bird_hide"
  },
  {
    "item": "Q27106471",
    "label": "bowling alley",
    "value": "Tag:leisure=bowling_alley"
  },
  {
    "item": "Q2259176",
    "label": "common land",
    "value": "Tag:leisure=common"
  },
  {
    "item": "Q23005232",
    "label": "dance school",
    "value": "Tag:leisure=dance"
  },
  {
    "item": "Q1188223",
    "label": "dance hall",
    "value": "Tag:leisure=dance"
  },
  {
    "item": "Q47521078",
    "label": "disc golf course",
    "value": "Tag:leisure=disc_golf_course"
  },
  {
    "item": "Q38516",
    "label": "dog park",
    "value": "Tag:leisure=dog_park"
  },
  {
    "item": "Q17015069",
    "label": "escape room",
    "value": "Tag:leisure=escape_game"
  },
  {
    "item": "Q7111942",
    "label": "outdoor fireplace",
    "value": "Tag:leisure=firepit"
  },
  {
    "item": "Q187317",
    "label": "fire pit",
    "value": "Tag:leisure=firepit"
  },
  {
    "item": "Q5451647",
    "label": "Fire ring",
    "value": "Tag:leisure=firepit"
  },
  {
    "item": "Q47521850",
    "label": "fishing spot",
    "value": "Tag:leisure=fishing"
  },
  {
    "item": "Q1065656",
    "label": "health club",
    "value": "Tag:leisure=fitness_centre"
  },
  {
    "item": "Q692630",
    "label": "outdoor gym",
    "value": "Tag:leisure=fitness_station"
  },
  {
    "item": "Q1107656",
    "label": "garden",
    "value": "Tag:leisure=garden"
  },
  {
    "item": "Q1048525",
    "label": "golf course",
    "value": "Tag:leisure=golf_course"
  },
  {
    "item": "Q1032372",
    "label": "hackerspace",
    "value": "Tag:leisure=hackerspace"
  },
  {
    "item": "Q1621657",
    "label": "equestrian facility",
    "value": "Tag:leisure=horse_riding"
  },
  {
    "item": "Q1282870",
    "label": "ice rink",
    "value": "Tag:leisure=ice_rink"
  },
  {
    "item": "Q47524429",
    "label": "miniature golf course",
    "value": "Tag:leisure=miniature_golf"
  },
  {
    "item": "Q179049",
    "label": "nature reserve",
    "value": "Tag:leisure=nature_reserve"
  },
  {
    "item": "Q759421",
    "label": "nature reserve",
    "value": "Tag:leisure=nature_reserve"
  },
  {
    "item": "Q22698",
    "label": "park",
    "value": "Tag:leisure=park"
  },
  {
    "item": "Q2466395",
    "label": "picnic table",
    "value": "Tag:leisure=picnic_table"
  },
  {
    "item": "Q2310214",
    "label": "pitch",
    "value": "Tag:leisure=pitch"
  },
  {
    "item": "Q891698",
    "label": "Q891698",
    "value": "Tag:leisure=pitch"
  },
  {
    "item": "Q8524",
    "label": "football pitch",
    "value": "Tag:leisure=pitch"
  },
  {
    "item": "Q741118",
    "label": "tennis court",
    "value": "Tag:leisure=pitch"
  },
  {
    "item": "Q11875349",
    "label": "playground",
    "value": "Tag:leisure=playground"
  },
  {
    "item": "Q2063507",
    "label": "recreation area",
    "value": "Tag:leisure=recreation_ground"
  },
  {
    "item": "Q272888",
    "label": "red-light district",
    "value": "Tag:leisure=red_light_district"
  },
  {
    "item": "Q875157",
    "label": "resort",
    "value": "Tag:leisure=resort"
  },
  {
    "item": "Q57036",
    "label": "sauna",
    "value": "Tag:leisure=sauna"
  },
  {
    "item": "Q206809",
    "label": "schoolyard",
    "value": "Tag:leisure=schoolyard"
  },
  {
    "item": "Q521839",
    "label": "shooting range",
    "value": "Tag:leisure=shooting_ground"
  },
  {
    "item": "Q361945",
    "label": "slipway",
    "value": "Tag:leisure=slipway"
  },
  {
    "item": "Q14092",
    "label": "gymnasium",
    "value": "Tag:leisure=sports_hall"
  },
  {
    "item": "Q483110",
    "label": "stadium",
    "value": "Tag:leisure=stadium"
  },
  {
    "item": "Q876852",
    "label": "summer camp",
    "value": "Tag:leisure=summer_camp"
  },
  {
    "item": "Q47524436",
    "label": "swimming area",
    "value": "Tag:leisure=swimming_area"
  },
  {
    "item": "Q1501",
    "label": "swimming pool",
    "value": "Tag:leisure=swimming_pool"
  },
  {
    "item": "Q995634",
    "label": "sunless tanning",
    "value": "Tag:leisure=tanning_salon"
  },
  {
    "item": "Q646347",
    "label": "indoor tanning",
    "value": "Tag:leisure=tanning_salon"
  },
  {
    "item": "Q1004435",
    "label": "athletics track",
    "value": "Tag:leisure=track"
  },
  {
    "item": "Q28077",
    "label": "hammam",
    "value": "Tag:leisure=turkish_bath"
  },
  {
    "item": "Q740326",
    "label": "water park",
    "value": "Tag:leisure=water_park"
  },
  {
    "item": "Q47524435",
    "label": "wildlife hide",
    "value": "Tag:leisure=wildlife_hide"
  },
  {
    "item": "Q47520921",
    "label": "leisure facility",
    "value": "Tag:leisure=yes"
  },
  {
    "item": "Q24698748",
    "label": "ground floor",
    "value": "Tag:level=0"
  },
  {
    "item": "Q64364539",
    "label": "LGBT place",
    "value": "Tag:lgbtq=primary"
  },
  {
    "item": "Q1030817",
    "label": "busbar",
    "value": "Tag:line=busbar"
  },
  {
    "item": "Q10729054",
    "label": "category A listed building",
    "value": "Tag:listed_status=Category_A"
  },
  {
    "item": "Q10729125",
    "label": "category B listed building",
    "value": "Tag:listed_status=Category_B"
  },
  {
    "item": "Q10729142",
    "label": "category C listed building",
    "value": "Tag:listed_status=Category_C"
  },
  {
    "item": "Q15700818",
    "label": "Grade I listed building",
    "value": "Tag:listed_status=Grade_I"
  },
  {
    "item": "Q97819899",
    "label": "Grade II listed park",
    "value": "Tag:listed_status=Grade_II"
  },
  {
    "item": "Q15700834",
    "label": "Grade II listed building",
    "value": "Tag:listed_status=Grade_II"
  },
  {
    "item": "Q15700831",
    "label": "Grade II* listed building or structure",
    "value": "Tag:listed_status=Grade_II*"
  },
  {
    "item": "Q2151232",
    "label": "townland",
    "value": "Tag:locality=townland"
  },
  {
    "item": "Q16886316",
    "label": "indoors",
    "value": "Tag:loction=indoor"
  },
  {
    "item": "Q16889140",
    "label": "outdoors",
    "value": "Tag:location=outdoor"
  },
  {
    "item": "Q863404",
    "label": "subterranea",
    "value": "Tag:location=underground"
  },
  {
    "item": "Q58917",
    "label": "adit",
    "value": "Tag:man_made=adit"
  },
  {
    "item": "Q17484395",
    "label": "beacon",
    "value": "Tag:man_made=beacon"
  },
  {
    "item": "Q165107",
    "label": "beehive",
    "value": "Tag:man_made=beehive"
  },
  {
    "item": "Q215635",
    "label": "breakwater",
    "value": "Tag:man_made=breakwater"
  },
  {
    "item": "Q12280",
    "label": "bridge",
    "value": "Tag:man_made=bridge"
  },
  {
    "item": "Q7321974",
    "label": "cairn",
    "value": "Tag:man_made=cairn"
  },
  {
    "item": "Q1864226",
    "label": "campanile",
    "value": "Tag:man_made=campanile"
  },
  {
    "item": "Q170477",
    "label": "chimney",
    "value": "Tag:man_made=chimney"
  },
  {
    "item": "Q1721219",
    "label": "clearcutting",
    "value": "Tag:man_made=clearcut"
  },
  {
    "item": "Q193886",
    "label": "cooling tower",
    "value": "Tag:man_made=cooling_tower"
  },
  {
    "item": "Q309250",
    "label": "courtyard",
    "value": "Tag:man_made=courtyard"
  },
  {
    "item": "Q178692",
    "label": "crane",
    "value": "Tag:man_made=crane"
  },
  {
    "item": "Q361665",
    "label": "summit cross",
    "value": "Tag:man_made=cross"
  },
  {
    "item": "Q17172602",
    "label": "monumental cross",
    "value": "Tag:man_made=cross"
  },
  {
    "item": "Q392371",
    "label": "Christian cross",
    "value": "Tag:man_made=cross"
  },
  {
    "item": "Q487843",
    "label": "cutline",
    "value": "Tag:man_made=cutline"
  },
  {
    "item": "Q105190",
    "label": "levee",
    "value": "Tag:man_made=dyke"
  },
  {
    "item": "Q1971570",
    "label": "flagpole",
    "value": "Tag:man_made=flagpole"
  },
  {
    "item": "Q962715",
    "label": "gas holder",
    "value": "Tag:man_made=gasometer"
  },
  {
    "item": "Q45791",
    "label": "geoglyph",
    "value": "Tag:man_made=geoglyph"
  },
  {
    "item": "Q577998",
    "label": "Conveyor system",
    "value": "Tag:man_made=goods_conveyor"
  },
  {
    "item": "Q153084",
    "label": "groyne",
    "value": "Tag:man_made=groyne"
  },
  {
    "item": "Q1664398",
    "label": "insect hotel",
    "value": "Tag:man_made=insect_hotel"
  },
  {
    "item": "Q1724341",
    "label": "kiln",
    "value": "Tag:man_made=kiln"
  },
  {
    "item": "Q1353183",
    "label": "launch pad",
    "value": "Tag:man_made=launch_pad"
  },
  {
    "item": "Q39715",
    "label": "lighthouse",
    "value": "Tag:man_made=lighthouse"
  },
  {
    "item": "Q25043590",
    "label": "plunge dip",
    "value": "Tag:man_made=livestock_dip"
  },
  {
    "item": "Q1068623",
    "label": "transmitter mast",
    "value": "Tag:man_made=mast"
  },
  {
    "item": "Q556186",
    "label": "mine shaft",
    "value": "Tag:man_made=mineshaft"
  },
  {
    "item": "Q1924376",
    "label": "monitoring station",
    "value": "Tag:man_made=monitoring_station"
  },
  {
    "item": "Q1993885",
    "label": "nesting aids",
    "value": "Tag:man_made=nesting_site"
  },
  {
    "item": "Q62832",
    "label": "observatory",
    "value": "Tag:man_made=observatory"
  },
  {
    "item": "Q689880",
    "label": "oil platform",
    "value": "Tag:man_made=offshore_platform"
  },
  {
    "item": "Q587682",
    "label": "oil well",
    "value": "Tag:man_made=petroleum_well"
  },
  {
    "item": "Q863454",
    "label": "pier",
    "value": "Tag:man_made=pier"
  },
  {
    "item": "Q3679502",
    "label": "piping",
    "value": "Tag:man_made=pipeline"
  },
  {
    "item": "Q828909",
    "label": "wharf",
    "value": "Tag:man_made=quay"
  },
  {
    "item": "Q253843",
    "label": "satellite dish",
    "value": "Tag:man_made=satellite_dish"
  },
  {
    "item": "Q213643",
    "label": "silo",
    "value": "Tag:man_made=silo"
  },
  {
    "item": "Q3203939",
    "label": "snow fence",
    "value": "Tag:man_made=snow_fence"
  },
  {
    "item": "Q4827510",
    "label": "Avalanche net",
    "value": "Tag:man_made=snow_fence"
  },
  {
    "item": "Q1756525",
    "label": "storage tank",
    "value": "Tag:man_made=storage_tank"
  },
  {
    "item": "Q334415",
    "label": "security camera",
    "value": "Tag:man_made=surveillance"
  },
  {
    "item": "Q1161707",
    "label": "benchmark",
    "value": "Tag:man_made=survey_point"
  },
  {
    "item": "Q352956",
    "label": "survey marker",
    "value": "Tag:man_made=survey_point"
  },
  {
    "item": "Q4135668",
    "label": "geodesic point",
    "value": "Tag:man_made=survey_point"
  },
  {
    "item": "Q131862",
    "label": "triangulation station",
    "value": "Tag:man_made=survey_point"
  },
  {
    "item": "Q4213",
    "label": "telescope",
    "value": "Tag:man_made=telescope"
  },
  {
    "item": "Q234731",
    "label": "torii",
    "value": "Tag:man_made=torii"
  },
  {
    "item": "Q12518",
    "label": "tower",
    "value": "Tag:man_made=tower"
  },
  {
    "item": "Q11166728",
    "label": "TV tower",
    "value": "Tag:man_made=tower"
  },
  {
    "item": "Q15242449",
    "label": "wastewater treatment plant",
    "value": "Tag:man_made=wastewater_plant"
  },
  {
    "item": "Q4114147",
    "label": "standpipe",
    "value": "Tag:man_made=water_tap"
  },
  {
    "item": "Q274153",
    "label": "water tower",
    "value": "Tag:man_made=water_tower"
  },
  {
    "item": "Q43483",
    "label": "well",
    "value": "Tag:man_made=water_well"
  },
  {
    "item": "Q11849395",
    "label": "waterworks",
    "value": "Tag:man_made=water_works"
  },
  {
    "item": "Q185187",
    "label": "watermill",
    "value": "Tag:man_made=watermill"
  },
  {
    "item": "Q1077135",
    "label": "wildlife crossing",
    "value": "Tag:man_made=wildlife_crossing"
  },
  {
    "item": "Q38720",
    "label": "windmill",
    "value": "Tag:man_made=windmill"
  },
  {
    "item": "Q1730505",
    "label": "windpump",
    "value": "Tag:man_made=windpump"
  },
  {
    "item": "Q83405",
    "label": "factory",
    "value": "Tag:man_made=works"
  },
  {
    "item": "Q936",
    "label": "OpenStreetMap",
    "value": "Tag:map_source=OpenStreetMap"
  },
  {
    "item": "Q216526",
    "label": "topographic map",
    "value": "Tag:map_type=topo"
  },
  {
    "item": "Q3512784",
    "label": "toposcope",
    "value": "Tag:map_type=toposcope"
  },
  {
    "item": "Q3089219",
    "label": "maritime boundary",
    "value": "Tag:maritime=yes"
  },
  {
    "item": "Q1579049",
    "label": "utility location",
    "value": "Tag:marker=plate"
  },
  {
    "item": "Q3033223",
    "label": "acupressure",
    "value": "Tag:massage=acupressure"
  },
  {
    "item": "Q1399328",
    "label": "Tui na",
    "value": "Tag:massage=chinese"
  },
  {
    "item": "Q658096",
    "label": "Chiropractic",
    "value": "Tag:massage=chiropractic"
  },
  {
    "item": "Q833228",
    "label": "Shiatsu",
    "value": "Tag:massage=shiatsu"
  },
  {
    "item": "Q965389",
    "label": "Thai massage",
    "value": "Tag:massage=thai"
  },
  {
    "item": "Q1193753",
    "label": "stone row",
    "value": "Tag:megalith_type=alignment"
  },
  {
    "item": "Q17044308",
    "label": "Chamber tumulus",
    "value": "Tag:megalith_type=chamber"
  },
  {
    "item": "Q1399576",
    "label": "cist",
    "value": "Tag:megalith_type=cist"
  },
  {
    "item": "Q101659",
    "label": "dolmen",
    "value": "Tag:megalith_type=dolmen"
  },
  {
    "item": "Q1652352",
    "label": "long barrow",
    "value": "Tag:megalith_type=long_barrow"
  },
  {
    "item": "Q193475",
    "label": "menhir",
    "value": "Tag:megalith_type=menhir"
  },
  {
    "item": "Q688292",
    "label": "nuraghe",
    "value": "Tag:megalith_type=nuraghe"
  },
  {
    "item": "Q1426772",
    "label": "passage grave",
    "value": "Tag:megalith_type=passage_grave"
  },
  {
    "item": "Q1330749",
    "label": "ring cairn",
    "value": "Tag:megalith_type=ring_cairn"
  },
  {
    "item": "Q2046325",
    "label": "round barrow",
    "value": "Tag:megalith_type=round_barrow"
  },
  {
    "item": "Q1935728",
    "label": "stone circle",
    "value": "Tag:megalith_type=stone_circle"
  },
  {
    "item": "Q1433492",
    "label": "stone ship",
    "value": "Tag:megalith_type=stone_ship"
  },
  {
    "item": "Q261201",
    "label": "beehive tomb",
    "value": "Tag:megalith_type=tholos"
  },
  {
    "item": "Q3909778",
    "label": "nuragic holy well",
    "value": "Tag:megalith_type=well"
  },
  {
    "item": "Q26703203",
    "label": "stumbling stone",
    "value": "Tag:memorial:type=stolperstein"
  },
  {
    "item": "Q17489160",
    "label": "bust",
    "value": "Tag:memorial=bust"
  },
  {
    "item": "Q1497483",
    "label": "memorial cross",
    "value": "Tag:memorial=cross"
  },
  {
    "item": "Q937114",
    "label": "ghost bike",
    "value": "Tag:memorial=ghost_bike"
  },
  {
    "item": "Q170980",
    "label": "obelisk",
    "value": "Tag:memorial=obelisk"
  },
  {
    "item": "Q721747",
    "label": "commemorative plaque",
    "value": "Tag:memorial=plaque"
  },
  {
    "item": "Q179700",
    "label": "statue",
    "value": "Tag:memorial=statue"
  },
  {
    "item": "Q178743",
    "label": "stele",
    "value": "Tag:memorial=stele"
  },
  {
    "item": "Q26703203",
    "label": "stumbling stone",
    "value": "Tag:memorial=stolperstein"
  },
  {
    "item": "Q11734477",
    "label": "memorial stone",
    "value": "Tag:memorial=stone"
  },
  {
    "item": "Q575759",
    "label": "war memorial",
    "value": "Tag:memorial=war_memorial"
  },
  {
    "item": "Q5487333",
    "label": "microbrewery",
    "value": "Tag:microbrewery=yes"
  },
  {
    "item": "Q3640372",
    "label": "brewpub",
    "value": "Tag:microbrewery=yes"
  },
  {
    "item": "Q695850",
    "label": "airbase",
    "value": "Tag:military=airfield"
  },
  {
    "item": "Q131263",
    "label": "barracks",
    "value": "Tag:military=barracks"
  },
  {
    "item": "Q91122",
    "label": "bunker",
    "value": "Tag:military=bunker"
  },
  {
    "item": "Q1324633",
    "label": "naval base",
    "value": "Tag:military=naval_base"
  },
  {
    "item": "Q933851",
    "label": "obstacle course",
    "value": "Tag:military=obstacle_course"
  },
  {
    "item": "Q42811873",
    "label": "military obstacle course",
    "value": "Tag:military=obstacle_course"
  },
  {
    "item": "Q1778846",
    "label": "proving ground",
    "value": "Tag:military=range"
  },
  {
    "item": "Q1778846",
    "label": "proving ground",
    "value": "Tag:military=training_area"
  },
  {
    "item": "Q91764",
    "label": "military trench",
    "value": "Tag:military=trench"
  },
  {
    "item": "Q19890860",
    "label": "agricultural museum",
    "value": "Tag:museum=agriculture"
  },
  {
    "item": "Q3329412",
    "label": "archaeological museum",
    "value": "Tag:museum=archaeological"
  },
  {
    "item": "Q4828724",
    "label": "aviation museum",
    "value": "Tag:museum=aviation"
  },
  {
    "item": "Q842478",
    "label": "children's museum",
    "value": "Tag:museum=children"
  },
  {
    "item": "Q16735822",
    "label": "history museum",
    "value": "Tag:museum=history"
  },
  {
    "item": "Q10333872",
    "label": "language museum",
    "value": "Tag:museum=language"
  },
  {
    "item": "Q1595639",
    "label": "local museum",
    "value": "Tag:museum=local"
  },
  {
    "item": "Q1863818",
    "label": "maritime museum",
    "value": "Tag:museum=maritime"
  },
  {
    "item": "Q2772772",
    "label": "military museum",
    "value": "Tag:museum=military"
  },
  {
    "item": "Q756102",
    "label": "open-air museum",
    "value": "Tag:museum=open_air"
  },
  {
    "item": "Q10624527",
    "label": "iographical museum",
    "value": "Tag:museum=person"
  },
  {
    "item": "Q18704634",
    "label": "railway museum",
    "value": "Tag:museum=railway"
  },
  {
    "item": "Q588140",
    "label": "science museum",
    "value": "Tag:museum=science"
  },
  {
    "item": "Q2398990",
    "label": "technology museum",
    "value": "Tag:museum=technology"
  },
  {
    "item": "Q2516357",
    "label": "transport museum",
    "value": "Tag:museum=transport"
  },
  {
    "item": "Q2327632",
    "label": "city museum",
    "value": "Tag:museum_type=municipal"
  },
  {
    "item": "Q17431399",
    "label": "national museum",
    "value": "Tag:museum_type=national"
  },
  {
    "item": "Q614316",
    "label": "private museum",
    "value": "Tag:museum_type=private"
  },
  {
    "item": "Q259340",
    "label": "7-Eleven",
    "value": "Tag:name=7-Eleven"
  },
  {
    "item": "Q806693",
    "label": "Bank of Montreal",
    "value": "Tag:name=BMO Bank of Montreal"
  },
  {
    "item": "Q1334383",
    "label": "arête",
    "value": "Tag:natural=arete"
  },
  {
    "item": "Q570309",
    "label": "bedrock",
    "value": "Tag:natural=bare_rock"
  },
  {
    "item": "Q39594",
    "label": "bay",
    "value": "Tag:natural=bay"
  },
  {
    "item": "Q40080",
    "label": "beach",
    "value": "Tag:natural=beach"
  },
  {
    "item": "Q885499",
    "label": "blowhole",
    "value": "Tag:natural=blowhole"
  },
  {
    "item": "Q185113",
    "label": "cape",
    "value": "Tag:natural=cape"
  },
  {
    "item": "Q35509",
    "label": "cave",
    "value": "Tag:natural=cave_entrance"
  },
  {
    "item": "Q67166646",
    "label": "cave entrance",
    "value": "Tag:natural=cave_entrance"
  },
  {
    "item": "Q107679",
    "label": "cliff",
    "value": "Tag:natural=cliff"
  },
  {
    "item": "Q1701967",
    "label": "coastal line",
    "value": "Tag:natural=coastline"
  },
  {
    "item": "Q8514",
    "label": "desert",
    "value": "Tag:natural=desert"
  },
  {
    "item": "Q5421955",
    "label": "fell",
    "value": "Tag:natural=fell"
  },
  {
    "item": "Q35666",
    "label": "glacier",
    "value": "Tag:natural=glacier"
  },
  {
    "item": "Q1006733",
    "label": "grassland",
    "value": "Tag:natural=grassland"
  },
  {
    "item": "Q27590",
    "label": "heath",
    "value": "Tag:natural=heath"
  },
  {
    "item": "Q93267",
    "label": "isthmus",
    "value": "Tag:natural=isthmus"
  },
  {
    "item": "Q1092661",
    "label": "moorland",
    "value": "Tag:natural=moor"
  },
  {
    "item": "Q207326",
    "label": "summit",
    "value": "Tag:natural=peak"
  },
  {
    "item": "Q8502",
    "label": "mountain",
    "value": "Tag:natural=peak"
  },
  {
    "item": "Q54050",
    "label": "hill",
    "value": "Tag:natural=peak"
  },
  {
    "item": "Q34763",
    "label": "peninsula",
    "value": "Tag:natural=peninsula"
  },
  {
    "item": "Q184358",
    "label": "reef",
    "value": "Tag:natural=reef"
  },
  {
    "item": "Q740445",
    "label": "ridge",
    "value": "Tag:natural=ridge"
  },
  {
    "item": "Q1429491",
    "label": "stream bed",
    "value": "Tag:natural=riverbed"
  },
  {
    "item": "Q8063",
    "label": "rock",
    "value": "Tag:natural=rock"
  },
  {
    "item": "Q10862618",
    "label": "saddle",
    "value": "Tag:natural=saddle"
  },
  {
    "item": "Q1133195",
    "label": "scree",
    "value": "Tag:natural=scree"
  },
  {
    "item": "Q879641",
    "label": "shrubland",
    "value": "Tag:natural=scrub"
  },
  {
    "item": "Q1059407",
    "label": "shingle beach",
    "value": "Tag:natural=shingle"
  },
  {
    "item": "Q42295",
    "label": "shrub",
    "value": "Tag:natural=shrub"
  },
  {
    "item": "Q188734",
    "label": "sinkhole",
    "value": "Tag:natural=sinkhole"
  },
  {
    "item": "Q124714",
    "label": "spring",
    "value": "Tag:natural=spring"
  },
  {
    "item": "Q581776",
    "label": "boulder",
    "value": "Tag:natural=stone"
  },
  {
    "item": "Q37901",
    "label": "strait",
    "value": "Tag:natural=strait"
  },
  {
    "item": "Q965847",
    "label": "termite mound",
    "value": "Tag:natural=termite_mound"
  },
  {
    "item": "Q10884",
    "label": "tree",
    "value": "Tag:natural=tree"
  },
  {
    "item": "Q491700",
    "label": "roadside tree",
    "value": "Tag:natural=tree_row"
  },
  {
    "item": "Q39816",
    "label": "valley",
    "value": "Tag:natural=valley"
  },
  {
    "item": "Q8072",
    "label": "volcano",
    "value": "Tag:natural=volcano"
  },
  {
    "item": "Q15324",
    "label": "body of water",
    "value": "Tag:natural=water"
  },
  {
    "item": "Q170321",
    "label": "wetland",
    "value": "Tag:natural=wetland"
  },
  {
    "item": "Q4421",
    "label": "forest",
    "value": "Tag:natural=wood"
  },
  {
    "item": "Q811600",
    "label": "sacred grove",
    "value": "Tag:natural=wood"
  },
  {
    "item": "Q25712298",
    "label": "Federal Roads in Brazil",
    "value": "Tag:network=BR"
  },
  {
    "item": "Q98596739",
    "label": "regional highways in Espírito Santo",
    "value": "Tag:network=BR:ES"
  },
  {
    "item": "Q98596748",
    "label": "regional highways in Minas Gerais",
    "value": "Tag:network=BR:MG"
  },
  {
    "item": "Q98596751",
    "label": "regional highways of Paraíba",
    "value": "Tag:network=BR:PB"
  },
  {
    "item": "Q1847533",
    "label": "China National Highways",
    "value": "Tag:network=CN:national"
  },
  {
    "item": "Q18516630",
    "label": "Docklands Light Railway station",
    "value": "Tag:network=DLR"
  },
  {
    "item": "Q90409686",
    "label": "FordPass Bike",
    "value": "Tag:network=Ford_Pass"
  },
  {
    "item": "Q926383",
    "label": "national highway of Japan",
    "value": "Tag:network=JP:national"
  },
  {
    "item": "Q1537326",
    "label": "prefectural road",
    "value": "Tag:network=JP:prefectural"
  },
  {
    "item": "Q98599251",
    "label": "Gunma prefectural roads",
    "value": "Tag:network=JP:prefectural:gunma"
  },
  {
    "item": "Q98599286",
    "label": "Nagano prefectural roads",
    "value": "Tag:network=JP:prefectural:nagano"
  },
  {
    "item": "Q84163056",
    "label": "Royal Saxon milestone",
    "value": "Tag:network=Königlich_sächsischer_Meilenstein"
  },
  {
    "item": "Q800055",
    "label": "Appalachian Development Highway System",
    "value": "Tag:network=US:ADHS"
  },
  {
    "item": "Q97453755",
    "label": "Alaska Routes",
    "value": "Tag:network=US:AK"
  },
  {
    "item": "Q97940065",
    "label": "Alabama State Route System",
    "value": "Tag:network=US:AL"
  },
  {
    "item": "Q97940143",
    "label": "Arkansas state highways",
    "value": "Tag:network=US:AR"
  },
  {
    "item": "Q97940193",
    "label": "Arizona State Highway System",
    "value": "Tag:network=US:AZ"
  },
  {
    "item": "Q97400332",
    "label": "California state routes",
    "value": "Tag:network=US:CA"
  },
  {
    "item": "Q97940295",
    "label": "Colorado state highways",
    "value": "Tag:network=US:CO"
  },
  {
    "item": "Q97940315",
    "label": "Connecticut state routes",
    "value": "Tag:network=US:CT"
  },
  {
    "item": "Q98776282",
    "label": "District of Columbia Routes",
    "value": "Tag:network=US:DC"
  },
  {
    "item": "Q98397305",
    "label": "Delaware State Routes",
    "value": "Tag:network=US:DE"
  },
  {
    "item": "Q98399543",
    "label": "Florida State Roads",
    "value": "Tag:network=US:FL"
  },
  {
    "item": "Q98941746",
    "label": "Florida Toll State Roads",
    "value": "Tag:network=US:FL:Toll"
  },
  {
    "item": "Q98399730",
    "label": "Georgia state routes",
    "value": "Tag:network=US:GA"
  },
  {
    "item": "Q98399838",
    "label": "rimary and secondary routes in Hawaii",
    "value": "Tag:network=US:HI"
  },
  {
    "item": "Q94247",
    "label": "Interstate Highway System",
    "value": "Tag:network=US:I"
  },
  {
    "item": "Q98399883",
    "label": "Iowa state highways",
    "value": "Tag:network=US:IA"
  },
  {
    "item": "Q98399978",
    "label": "Idaho state highways",
    "value": "Tag:network=US:ID"
  },
  {
    "item": "Q98581926",
    "label": "Illinois Routes",
    "value": "Tag:network=US:IL"
  },
  {
    "item": "Q97364777",
    "label": "Indiana state roads",
    "value": "Tag:network=US:IN"
  },
  {
    "item": "Q98582062",
    "label": "Kansas state highways",
    "value": "Tag:network=US:KS"
  },
  {
    "item": "Q97365173",
    "label": "Kentucky state highways",
    "value": "Tag:network=US:KY"
  },
  {
    "item": "Q97437203",
    "label": "Louisiana state highways",
    "value": "Tag:network=US:LA"
  },
  {
    "item": "Q98582164",
    "label": "Massachusetts Routes",
    "value": "Tag:network=US:MA"
  },
  {
    "item": "Q98596703",
    "label": "Maryland state highways",
    "value": "Tag:network=US:MD"
  },
  {
    "item": "Q98599313",
    "label": "State Routes in Maine",
    "value": "Tag:network=US:ME"
  },
  {
    "item": "Q98600770",
    "label": "state trunkline highways in Michigan",
    "value": "Tag:network=US:MI"
  },
  {
    "item": "Q98601319",
    "label": "Minnesota state highways",
    "value": "Tag:network=US:MN"
  },
  {
    "item": "Q98601390",
    "label": "Missouri state highways",
    "value": "Tag:network=US:MO"
  },
  {
    "item": "Q98601509",
    "label": "Mississippi Highways",
    "value": "Tag:network=US:MS"
  },
  {
    "item": "Q98601572",
    "label": "Montana primary state highways",
    "value": "Tag:network=US:MT"
  },
  {
    "item": "Q98601577",
    "label": "Montana secondary state highways",
    "value": "Tag:network=US:MT:secondary"
  },
  {
    "item": "Q98643631",
    "label": "North Carolina state highways",
    "value": "Tag:network=US:NC"
  },
  {
    "item": "Q98671121",
    "label": "state highways in North Dakota",
    "value": "Tag:network=US:ND"
  },
  {
    "item": "Q98671545",
    "label": "state highways in Nebraska",
    "value": "Tag:network=US:NE"
  },
  {
    "item": "Q98672916",
    "label": "state routes in New Hampshire",
    "value": "Tag:network=US:NH"
  },
  {
    "item": "Q98674117",
    "label": "New Jersey State Highway Routes",
    "value": "Tag:network=US:NJ"
  },
  {
    "item": "Q98693562",
    "label": "state roads in New Mexico",
    "value": "Tag:network=US:NM"
  },
  {
    "item": "Q98695192",
    "label": "state routes in Nevada",
    "value": "Tag:network=US:NV"
  },
  {
    "item": "Q99194438",
    "label": "Clark County routes",
    "value": "Tag:network=US:NV:Clark"
  },
  {
    "item": "Q98696173",
    "label": "New York State touring routes",
    "value": "Tag:network=US:NY"
  },
  {
    "item": "Q96348143",
    "label": "Ohio state routes",
    "value": "Tag:network=US:OH"
  },
  {
    "item": "Q99632659",
    "label": "Ashland County roads",
    "value": "Tag:network=US:OH:ASD"
  },
  {
    "item": "Q99632727",
    "label": "Athens County roads",
    "value": "Tag:network=US:OH:ATH"
  },
  {
    "item": "Q99658706",
    "label": "Auglaize County roads",
    "value": "Tag:network=US:OH:AUG"
  },
  {
    "item": "Q99632795",
    "label": "Belmont County roads",
    "value": "Tag:network=US:OH:BEL"
  },
  {
    "item": "Q99638013",
    "label": "Carroll County routes",
    "value": "Tag:network=US:OH:CAR"
  },
  {
    "item": "Q99638214",
    "label": "Columbiana County roads",
    "value": "Tag:network=US:OH:COL"
  },
  {
    "item": "Q99638410",
    "label": "Coshocton County roads",
    "value": "Tag:network=US:OH:COS"
  },
  {
    "item": "Q99658729",
    "label": "Fairfield County roads",
    "value": "Tag:network=US:OH:FAI"
  },
  {
    "item": "Q99638597",
    "label": "Fayette County routes",
    "value": "Tag:network=US:OH:FAY"
  },
  {
    "item": "Q99638649",
    "label": "Fulton County routes",
    "value": "Tag:network=US:OH:FUL"
  },
  {
    "item": "Q99658889",
    "label": "Gallia County roads",
    "value": "Tag:network=US:OH:GAL"
  },
  {
    "item": "Q99638782",
    "label": "Guernsey County routes",
    "value": "Tag:network=US:OH:GUE"
  },
  {
    "item": "Q99658559",
    "label": "Hamilton County roads",
    "value": "Tag:network=US:OH:HAM"
  },
  {
    "item": "Q99638852",
    "label": "Hardin County roads",
    "value": "Tag:network=US:OH:HAR"
  },
  {
    "item": "Q99638854",
    "label": "Harrison County routes",
    "value": "Tag:network=US:OH:HAS"
  },
  {
    "item": "Q99638856",
    "label": "Henry County roads",
    "value": "Tag:network=US:OH:HEN"
  },
  {
    "item": "Q99638861",
    "label": "Hocking County roads",
    "value": "Tag:network=US:OH:HOC"
  },
  {
    "item": "Q99638865",
    "label": "Holmes County routes",
    "value": "Tag:network=US:OH:HOL"
  },
  {
    "item": "Q99638871",
    "label": "Jefferson County routes",
    "value": "Tag:network=US:OH:JEF"
  },
  {
    "item": "Q99671184",
    "label": "Knox County highways",
    "value": "Tag:network=US:OH:KNO"
  },
  {
    "item": "Q99678140",
    "label": "Lawrence County roads",
    "value": "Tag:network=US:OH:LAW"
  },
  {
    "item": "Q99638880",
    "label": "Licking County roads",
    "value": "Tag:network=US:OH:LIC"
  },
  {
    "item": "Q99638906",
    "label": "Logan County routes",
    "value": "Tag:network=US:OH:LOG"
  },
  {
    "item": "Q99639078",
    "label": "Lucas County routes",
    "value": "Tag:network=US:OH:LUC"
  },
  {
    "item": "Q99768055",
    "label": "Madison County roads",
    "value": "Tag:network=US:OH:MAD"
  },
  {
    "item": "Q99639089",
    "label": "Mahoning County roads",
    "value": "Tag:network=US:OH:MAH"
  },
  {
    "item": "Q99646960",
    "label": "Medina County routes",
    "value": "Tag:network=US:OH:MED"
  },
  {
    "item": "Q99646973",
    "label": "Monroe County roads",
    "value": "Tag:network=US:OH:MOE"
  },
  {
    "item": "Q101251405",
    "label": "Morgan County roads",
    "value": "Tag:network=US:OH:MRG"
  },
  {
    "item": "Q99646989",
    "label": "Morrow County roads",
    "value": "Tag:network=US:OH:MRW"
  },
  {
    "item": "Q99647012",
    "label": "Ottawa County routes",
    "value": "Tag:network=US:OH:OTT"
  },
  {
    "item": "Q99647020",
    "label": "Paulding County routes",
    "value": "Tag:network=US:OH:PAU"
  },
  {
    "item": "Q99647025",
    "label": "Perry County roads",
    "value": "Tag:network=US:OH:PER"
  },
  {
    "item": "Q99647032",
    "label": "Portage County highways",
    "value": "Tag:network=US:OH:POR"
  },
  {
    "item": "Q99678821",
    "label": "Scioto County roads",
    "value": "Tag:network=US:OH:SCI"
  },
  {
    "item": "Q99647168",
    "label": "Seneca County roads",
    "value": "Tag:network=US:OH:SEN"
  },
  {
    "item": "Q99647276",
    "label": "Stark County routes",
    "value": "Tag:network=US:OH:STA"
  },
  {
    "item": "Q99647321",
    "label": "Summit County highways",
    "value": "Tag:network=US:OH:SUM"
  },
  {
    "item": "Q99658434",
    "label": "Tuscarawas County routes",
    "value": "Tag:network=US:OH:TUS"
  },
  {
    "item": "Q99658440",
    "label": "Union County routes",
    "value": "Tag:network=US:OH:UNI"
  },
  {
    "item": "Q99658446",
    "label": "Vinton County roads",
    "value": "Tag:network=US:OH:VIN"
  },
  {
    "item": "Q99658458",
    "label": "Wayne County routes",
    "value": "Tag:network=US:OH:WAY"
  },
  {
    "item": "Q99658495",
    "label": "Williams County routes",
    "value": "Tag:network=US:OH:WIL"
  },
  {
    "item": "Q99658503",
    "label": "Wood County routes",
    "value": "Tag:network=US:OH:WOO"
  },
  {
    "item": "Q99658533",
    "label": "Wyandot County roads",
    "value": "Tag:network=US:OH:WYA"
  },
  {
    "item": "Q98720072",
    "label": "Oklahoma state highways",
    "value": "Tag:network=US:OK"
  },
  {
    "item": "Q98756109",
    "label": "state highway routes in Oregon",
    "value": "Tag:network=US:OR"
  },
  {
    "item": "Q98756512",
    "label": "Pennsylvania Routes",
    "value": "Tag:network=US:PA"
  },
  {
    "item": "Q98806967",
    "label": "Pennsylvania Turnpike System",
    "value": "Tag:network=US:PA:Turnpike"
  },
  {
    "item": "Q98775470",
    "label": "Rhode Island Routes",
    "value": "Tag:network=US:RI"
  },
  {
    "item": "Q98776654",
    "label": "South Carolina state highways",
    "value": "Tag:network=US:SC"
  },
  {
    "item": "Q98779148",
    "label": "South Dakota Highways",
    "value": "Tag:network=US:SD"
  },
  {
    "item": "Q98791713",
    "label": "Tennessee State Routes",
    "value": "Tag:network=US:TN"
  },
  {
    "item": "Q97452239",
    "label": "Texas state highways",
    "value": "Tag:network=US:TX"
  },
  {
    "item": "Q97452540",
    "label": "Texas state highway beltways",
    "value": "Tag:network=US:TX:Beltway"
  },
  {
    "item": "Q97452889",
    "label": "Texas Farm to Market Roads",
    "value": "Tag:network=US:TX:FM"
  },
  {
    "item": "Q97452546",
    "label": "Texas state highway loops",
    "value": "Tag:network=US:TX:Loop"
  },
  {
    "item": "Q97452801",
    "label": "Texas state highway NASA roads",
    "value": "Tag:network=US:TX:NASA"
  },
  {
    "item": "Q97453533",
    "label": "Texas Park Roads",
    "value": "Tag:network=US:TX:Park"
  },
  {
    "item": "Q97453357",
    "label": "Texas Ranch to Market Roads",
    "value": "Tag:network=US:TX:RM"
  },
  {
    "item": "Q97453574",
    "label": "Texas Recreational Roads",
    "value": "Tag:network=US:TX:Recreational"
  },
  {
    "item": "Q97452609",
    "label": "Texas state highway spurs",
    "value": "Tag:network=US:TX:Spur"
  },
  {
    "item": "Q408192",
    "label": "United States Numbered Highway System",
    "value": "Tag:network=US:US"
  },
  {
    "item": "Q98793236",
    "label": "Utah State Routes",
    "value": "Tag:network=US:UT"
  },
  {
    "item": "Q98807352",
    "label": "primary state routes in Virginia",
    "value": "Tag:network=US:VA"
  },
  {
    "item": "Q98807365",
    "label": "secondary state routes in Virginia",
    "value": "Tag:network=US:VA:Secondary"
  },
  {
    "item": "Q98938620",
    "label": "Vermont Routes",
    "value": "Tag:network=US:VT"
  },
  {
    "item": "Q98939901",
    "label": "Washington state routes",
    "value": "Tag:network=US:WA"
  },
  {
    "item": "Q98940046",
    "label": "Wisconsin State Trunk Highways",
    "value": "Tag:network=US:WI"
  },
  {
    "item": "Q98940059",
    "label": "West Virginia Routes",
    "value": "Tag:network=US:WV"
  },
  {
    "item": "Q98940069",
    "label": "Wyoming Highways",
    "value": "Tag:network=US:WY"
  },
  {
    "item": "Q1060525",
    "label": "Call a Bike",
    "value": "Tag:network=call-a-bike"
  },
  {
    "item": "Q106123",
    "label": "international E-road network",
    "value": "Tag:network=e-road"
  },
  {
    "item": "Q2351279",
    "label": "nextbike",
    "value": "Tag:network=nextbike"
  },
  {
    "item": "Q2326366",
    "label": "StadtRAD Hamburg",
    "value": "Tag:network=stadtradhamburg"
  },
  {
    "item": "Q3955523",
    "label": "without housenumber",
    "value": "Tag:noousenumber=yes"
  },
  {
    "item": "Q42503289",
    "label": "untitled entity",
    "value": "Tag:noname=yes"
  },
  {
    "item": "Q15906149",
    "label": "Digital Society",
    "value": "Tag:office=association"
  },
  {
    "item": "Q48204",
    "label": "voluntary association",
    "value": "Tag:office=association"
  },
  {
    "item": "Q1428011",
    "label": "bail bondsman",
    "value": "Tag:office=bail_bond_agent"
  },
  {
    "item": "Q869457",
    "label": "coworking",
    "value": "Tag:office=coworking"
  },
  {
    "item": "Q213283",
    "label": "diplomatic mission",
    "value": "Tag:office=diplomatic"
  },
  {
    "item": "Q261362",
    "label": "employment agency",
    "value": "Tag:office=employment_agency"
  },
  {
    "item": "Q81096",
    "label": "engineer",
    "value": "Tag:office=engineer"
  },
  {
    "item": "Q519076",
    "label": "real estate broker",
    "value": "Tag:office=estate_agent"
  },
  {
    "item": "Q327333",
    "label": "government agency",
    "value": "Tag:office=government"
  },
  {
    "item": "Q27038992",
    "label": "insurance agency",
    "value": "Tag:office=insurance"
  },
  {
    "item": "Q40348",
    "label": "lawyer",
    "value": "Tag:office=lawyer"
  },
  {
    "item": "Q877558",
    "label": "consignor",
    "value": "Tag:office=logistics"
  },
  {
    "item": "Q688576",
    "label": "tax advisor",
    "value": "Tag:office=tax_advisor"
  },
  {
    "item": "Q2401749",
    "label": "telecommunication company",
    "value": "Tag:office=telecommunication"
  },
  {
    "item": "Q694748",
    "label": "physiotherapist",
    "value": "Tag:office=therapist"
  },
  {
    "item": "Q217107",
    "label": "travel agency",
    "value": "Tag:office=travel_agent"
  },
  {
    "item": "Q2141946",
    "label": "travel agent",
    "value": "Tag:office=travel_agent"
  },
  {
    "item": "Q10883023",
    "label": "bidirectional traffic",
    "value": "Tag:oneway=no"
  },
  {
    "item": "Q786886",
    "label": "one-way traffic",
    "value": "Tag:oneway=yes"
  },
  {
    "item": "Q55570340",
    "label": "closed to the public",
    "value": "Tag:opening_hours:covid19=closed"
  },
  {
    "item": "Q55570340",
    "label": "closed to the public",
    "value": "Tag:opening_hours:covid19=off"
  },
  {
    "item": "Q1571749",
    "label": "24/7",
    "value": "Tag:opening_hours=24/7"
  },
  {
    "item": "Q55570340",
    "label": "closed to the public",
    "value": "Tag:opening_hours=off"
  },
  {
    "item": "Q88963788",
    "label": "organized community",
    "value": "Tag:operator:type=community"
  },
  {
    "item": "Q194166",
    "label": "consortium",
    "value": "Tag:operator:type=consortium"
  },
  {
    "item": "Q4539",
    "label": "cooperative",
    "value": "Tag:operator:type=cooperative"
  },
  {
    "item": "Q2659904",
    "label": "government organization",
    "value": "Tag:operator:type=government"
  },
  {
    "item": "Q79913",
    "label": "non-governmental organization",
    "value": "Tag:operator:type=ngo"
  },
  {
    "item": "Q3248417",
    "label": "private",
    "value": "Tag:operator:type=private"
  },
  {
    "item": "Q2388316",
    "label": "public",
    "value": "Tag:operator:type=public"
  },
  {
    "item": "Q1530022",
    "label": "religious organization",
    "value": "Tag:operator:type=religious"
  },
  {
    "item": "Q1410668",
    "label": "National Wildlife Refuge",
    "value": "Tag:ownership=national"
  },
  {
    "item": "Q35800652",
    "label": "state beach",
    "value": "Tag:park:type=state_beach"
  },
  {
    "item": "Q1761072",
    "label": "state park",
    "value": "Tag:park:type=state_park"
  },
  {
    "item": "Q13218805",
    "label": "multistorey car park",
    "value": "Tag:parking=multi-storey"
  },
  {
    "item": "Q2431970",
    "label": "underground parking space",
    "value": "Tag:parking=underground"
  },
  {
    "item": "Q337912",
    "label": "pilgrims' way",
    "value": "Tag:pilgrimage=yes"
  },
  {
    "item": "Q33837",
    "label": "archipelago",
    "value": "Tag:place=archipelago"
  },
  {
    "item": "Q5195043",
   "label": "borough",
    "value": "Tag:place=borough"
  },
  {
    "item": "Q515",
    "label": "city",
    "value": "Tag:place=city"
  },
  {
    "item": "Q1348006",
    "label": "city block",
    "value": "Tag:place=city_block"
  },
  {
    "item": "Q5107",
    "label": "continent",
    "value": "Tag:place=continent"
  },
  {
    "item": "Q6256",
    "label": "country",
    "value": "Tag:place=country"
  },
  {
    "item": "Q28575",
    "label": "county",
    "value": "Tag:place=county"
  },
  {
    "item": "Q149621",
    "label": "district",
    "value": "Tag:place=district"
  },
  {
    "item": "Q131596",
    "label": "farm",
    "value": "Tag:place=farm"
  },
  {
    "item": "Q5084",
    "label": "hamlet",
    "value": "Tag:place=hamlet"
  },
  {
    "item": "Q23442",
    "label": "island",
    "value": "Tag:place=island"
  },
  {
    "item": "Q207524",
    "label": "islet",
    "value": "Tag:place=islet"
  },
  {
    "item": "Q3257686",
    "label": "locality",
    "value": "Tag:place=locality"
  },
  {
    "item": "Q15284",
    "label": "municipality",
    "value": "Tag:place=municipality"
  },
  {
    "item": "Q123705",
    "label": "neighborhood",
    "value": "Tag:place=neighbourhood"
  },
  {
    "item": "Q683595",
    "label": "land lot",
    "value": "Tag:place=plot"
  },
  {
    "item": "Q2983893",
    "label": "quarter",
    "value": "Tag:place=quarter"
  },
  {
    "item": "Q174782",
    "label": "square",
    "value": "Tag:place=square"
  },
  {
    "item": "Q107390",
    "label": "federated state",
    "value": "Tag:place=state"
  },
  {
    "item": "Q188509",
    "label": "suburb",
    "value": "Tag:place=suburb"
  },
  {
    "item": "Q3957",
    "label": "town",
    "value": "Tag:place=town"
  },
  {
    "item": "Q19610511",
    "label": "township",
    "value": "Tag:place=township"
  },
  {
    "item": "Q532",
    "label": "village",
    "value": "Tag:place=village"
  },
  {
    "item": "Q1411996",
    "label": "run-of-the-river power station",
    "value": "Tag:plant:method=run-of-the-river"
  },
  {
    "item": "Q6558431",
    "label": "coal-fired power station",
    "value": "Tag:plant:source=coal"
  },
  {
    "item": "Q2944640",
    "label": "gas-fired power station",
    "value": "Tag:plant:source=gas"
  },
  {
    "item": "Q15911738",
    "label": "hydroelectric power station",
    "value": "Tag:plant:source=hydro"
  },
  {
    "item": "Q134447",
    "label": "nuclear power station",
    "value": "Tag:plant:source=nuclear"
  },
  {
    "item": "Q23583615",
    "label": "waste-to-energy power station",
    "value": "Tag:plant:source=waste"
  },
  {
    "item": "Q194356",
    "label": "wind farm",
    "value": "Tag:plant:source=wind"
  },
  {
    "item": "Q99192206",
    "label": "activity panel",
    "value": "Tag:playground=activitypanel"
  },
  {
    "item": "Q99189742",
    "label": "aerial rotator",
    "value": "Tag:playground=aerialrotator"
  },
  {
    "item": "Q89579852",
    "label": "balance beam",
    "value": "Tag:playground=balancebeam"
  },
  {
    "item": "Q99189791",
    "label": "basket rotator",
    "value": "Tag:playground=basketrotator"
  },
  {
    "item": "Q99189792",
    "label": "basket swing",
    "value": "Tag:playground=basketswing"
  },
  {
    "item": "Q1207703",
    "label": "jungle gym",
    "value": "Tag:playground=climbingframe"
  },
  {
    "item": "Q99189268",
    "label": "climbing wall",
    "value": "Tag:playground=climbingwall"
  },
  {
    "item": "Q99189640",
    "label": "bouncy cushion",
    "value": "Tag:playground=cushion"
  },
  {
    "item": "Q692630",
    "label": "outdoor gym",
    "value": "Tag:playground=exercise"
  },
  {
    "item": "Q5509335",
    "label": "Funnel ball",
    "value": "Tag:playground=funnel_ball"
  },
  {
    "item": "Q27981",
    "label": "hopscotch",
    "value": "Tag:playground=hopscotch"
  },
  {
    "item": "Q623270",
    "label": "horizontal bar",
    "value": "Tag:playground=horizontal_bar"
  },
  {
    "item": "Q91985448",
    "label": "playground map",
    "value": "Tag:playground=map"
  },
  {
    "item": "Q4349682",    "label": "wendy house",
    "value": "Tag:playground=playhouse"
  },
  {
    "item": "Q1315915",
    "label": "roundabout",
    "value": "Tag:playground=roundabout"
  },
  {
    "item": "Q213454",
    "label": "sandpit",
    "value": "Tag:playground=sandpit"
  },
  {
    "item": "Q19793",
    "label": "seesaw",
    "value": "Tag:playground=seesaw"
  },
  {
    "item": "Q3266340",
    "label": "sledding",
    "value": "Tag:playground=sledding"
  },
  {
    "item": "Q334747",
    "label": "playground slide",
    "value": "Tag:playground=slide"
  },
  {
    "item": "Q7578390",
    "label": "Splash pad",
    "value": "Tag:playground=splash_pad"
  },
  {
    "item": "Q2181709",
    "label": "spring rider",
    "value": "Tag:playground=springy"
  },
  {
    "item": "Q188688",
    "label": "swing",
    "value": "Tag:playground=swing"
  },
  {
    "item": "Q99189798",
    "label": "teenshelter",
    "value": "Tag:playground=teenshelter"
  },
  {
    "item": "Q633923",
    "label": "tetherball",
    "value": "Tag:playground=tetherball"
  },
  {
    "item": "Q327911",
    "label": "trampoline",
    "value": "Tag:playground=trampoline"
  },
  {
    "item": "Q99192101",
    "label": "water play equipment",
    "value": "Tag:playground=water"
  },
  {
    "item": "Q99189795",
    "label": "youth bench",
    "value": "Tag:playground=youth_bench"
  },
  {
    "item": "Q99189561",
    "label": "zipwire",
    "value": "Tag:playground=zipwire"
  },
  {
    "item": "Q2311958",
    "label": "canton",
    "value": "Tag:political_division=canton"
  },
  {
    "item": "Q17166756",
    "label": "United States congressional district",
    "value": "Tag:political_division=congressional_district"
  },
  {
    "item": "Q89934",
    "label": "community of Belgium",
    "value": "Tag:political_division=linguistic_community"
  },
  {
    "item": "Q589282",
    "label": "ward or electoral division of the United Kingdom",
    "value": "Tag:political_division=ward"
  },
  {
    "item": "Q1195098",
    "label": "ward",
    "value": "Tag:political_division=ward"
  },
  {
    "item": "Q42804670",
    "label": "underground or at-grade power line",
    "value": "Tag:power=cable"
  },
  {
    "item": "Q188447",
    "label": "electrical cable",
    "value": "Tag:power=cable"
  },
  {
    "item": "Q7236480",
    "label": "power box",
    "value": "Tag:power=cable_distribution_cabinet"
  },
  {
    "item": "Q2010240",
    "label": "catenary mast",
    "value": "Tag:power=catenary_mast"
  },
  {
    "item": "Q839922",
    "label": "static VAR compensator",
    "value": "Tag:power=compensator"
  },
  {
    "item": "Q5636221",
    "label": "HVDC converter",
    "value": "Tag:power=converter"
  },
  {
    "item": "Q42045754",
    "label": "electric power converter",
    "value": "Tag:power=converter"
  },
  {
    "item": "Q131502",
    "label": "electric generator",
    "value": "Tag:power=generator"
  },
  {
    "item": "Q1347279",
    "label": "heliostat",
    "value": "Tag:power=heliostat"
  },
  {
    "item": "Q178150",
    "label": "insulator",
    "value": "Tag:power=insulator"
  },
  {
    "item": "Q2144320",
    "label": "overhead power line",
    "value": "Tag:power=line"
  },
  {
    "item": "Q1939150",
    "label": "power cable",
    "value": "Tag:power=line"
  },
  {
    "item": "Q159719",
    "label": "power station",
    "value": "Tag:power=plant"
  },
  {
    "item": "Q1144084",
    "label": "utility pole",
    "value": "Tag:power=pole"
  },
  {
    "item": "Q174814",
    "label": "electrical substation",
    "value": "Tag:power=substation"
  },
  {
    "item": "Q478986",
    "label": "distribution substation",
    "value": "Tag:power=substation"
  },
  {
    "item": "Q5320",
    "label": "switch",
    "value": "Tag:power=switch"
  },
  {
    "item": "Q1273786",
    "label": "switchgear",
    "value": "Tag:power=switchgear"
  },
  {
    "item": "Q182610",
    "label": "Terminal",
    "value": "Tag:power=terminal"
  },
  {
    "item": "Q914711",
    "label": "transmission tower",
    "value": "Tag:power=tower"
  },
  {
    "item": "Q11658",
    "label": "transformer",
    "value": "Tag:power=transformer"
  },
  {
    "item": "Q1503784",
    "label": "pickle",
    "value": "Tag:product=pickles"
  },
  {
    "item": "Q179049",
    "label": "nature reserve",
    "value": "Tag:protected_area=nature_reserve"
  },
  {
    "item": "Q23712",
    "label": "Bien de Interés Cultural",
    "value": "Tag:protection_title=Bien de Interés Cultural"
  },
  {
    "item": "Q15812085",
    "label": "Gesamtanlage",
    "value": "Tag:protection_title=Gesamtanlage"
  },
  {
    "item": "Q1410668",
    "label": "National Wildlife Refuge",
    "value": "Tag:protection_title=National Wildlife Refuge"
  },
  {
    "item": "Q893775",
    "label": "National Monument of the United States",
    "value": "Tag:protection_title=National_Monument"
  },
  {
    "item": "Q759421",
    "label": "nature reserve",
    "value": "Tag:protection_title=Naturschutzgebiet"
  },
  {
    "item": "Q21100463",
    "label": "natural monument in the Czech Republic",
    "value": "Tag:protection_title=Přírodní památka (PP)"
  },
  {
    "item": "Q7603683",
    "label": "state forest",
    "value": "Tag:protection_title=State_Forest"
  },
  {
    "item": "Q8001184",
    "label": "wilderness study area",
    "value": "Tag:protection_title=Wilderness Study Area"
  },
  {
    "item": "Q2445527",
    "label": "wilderness area",
    "value": "Tag:protection_title=Wilderness_Area"
  },
  {
    "item": "Q759882",
    "label": "protected landscape area",
    "value": "Tag:protection_title=landskapsvernområde"
  },
  {
    "item": "Q64896574",
    "label": "platform",
    "value": "Tag:public_transport=platform"
  },
  {
    "item": "Q12819564",
    "label": "station",
    "value": "Tag:public_transport=station"
  },
  {
    "item": "Q548662",
    "label": "transport stop",
    "value": "Tag:public_transport=stop_position"
  },
  {
    "item": "Q350169",
    "label": "Gauntlet track",
    "value": "Tag:railway:interlaced=yes"
  },
  {
    "item": "Q60982147",
    "label": "ETCS Stop Marker",
    "value": "Tag:railway:signal:train_protection=DE-ESO:ne14"
  },
  {
    "item": "Q2008263",
    "label": "relay interlocking",
    "value": "Tag:railway:signal_box=electric"
  },
  {
    "item": "Q15807769",
    "label": "Computer-based interlocking",
    "value": "Tag:railway:signal_box=electronic"
  },
  {
    "item": "Q914057",
    "label": "lever frame",
    "value": "Tag:railway:signal_box=mechanical"
  },
  {
    "item": "Q630950",
    "label": "interlocking",
    "value": "Tag:railway:signal_box=track_diagram"
  },
  {
    "item": "Q18681579",
    "label": "category 1 railway station",
    "value": "Tag:railway:station_category=1"
  },
  {
    "item": "Q18681660",
    "label": "category 2 railway station",
    "value": "Tag:railway:station_category=2"
  },
  {
    "item": "Q18681688",
    "label": "category 3 railway station",
    "value": "Tag:railway:station_category=3"
  },
  {
    "item": "Q18681690",
    "label": "category 4 railway station",
    "value": "Tag:railway:station_category=4"
  },
  {
    "item": "Q18681691",
    "label": "category 5 railway station",
    "value": "Tag:railway:station_category=5"
  },
  {
    "item": "Q18681692",
    "label": "category 6 railway station",
    "value": "Tag:railway:station_category=6"
  },
  {
    "item": "Q18681693",
    "label": "category 7 railway station",
    "value": "Tag:railway:station_category=7"
  },
  {
    "item": "Q334561",
    "label": "abt\'s switch",
    "value": "Tag:railway:switch=abt"
  },
  {
    "item": "Q340774",
    "label": "Axle counter",
    "value": "Tag:railway:vacancy_detection=axle_counter"
  },
  {
    "item": "Q357685",
    "label": "abandoned railway",
    "value": "Tag:railway=abandoned"
  },
  {
    "item": "Q2116321",
    "label": "rail trail",
    "value": "Tag:railway=abandoned"
  },
  {
    "item": "Q350114",
    "label": "block post",
    "value": "Tag:railway=blockpost"
  },
  {
    "item": "Q12162",
    "label": "buffer stop",
    "value": "Tag:railway=buffer_stop"
  },
  {
    "item": "Q1928330",
    "label": "crossover",
    "value": "Tag:railway=crossover"
  },
  {
    "item": "Q10283556",
    "label": "motive power depot",
    "value": "Tag:railway=depot"
  },
  {
    "item": "Q996850",
    "label": "derail",
    "value": "Tag:railway=derail"
  },
  {
    "item": "Q357685",
    "label": "abandoned railway",
    "value": "Tag:railway=disused"
  },
  {
    "item": "Q4663385",
    "label": "former railway station",
    "value": "Tag:railway=disused_station"
  },
  {
    "item": "Q142031",
    "label": "funicular",
    "value": "Tag:railway=funicular"
  },
  {
    "item": "Q55678",
    "label": "railway halt",
    "value": "Tag:railway=halt"
  },
  {
    "item": "Q2141822",
    "label": "hump",
    "value": "Tag:railway=hump_yard"
  },
  {
    "item": "Q171448",
    "label": "level crossing",
    "value": "Tag:railway=level_crossing"
  },
  {
    "item": "Q1268865",
    "label": "light rail",
    "value": "Tag:railway=light_rail"
  },
  {
    "item": "Q2355237",
    "label": "railway kilometre sign",
    "value": "Tag:railway=milestone"
  },
  {
    "item": "Q20820102",
    "label": "rideable miniature railway",
    "value": "Tag:railway=miniature"
  },
  {
    "item": "Q187934",
    "label": "monorail",
    "value": "Tag:railway=monorail"
  },
  {
    "item": "Q1112477",
    "label": "narrow-gauge railway",
    "value": "Tag:railway=narrow_gauge"
  },
  {
    "item": "Q1693573",
    "label": "Q1693573",
    "value": "Tag:railway=phone"
  },
  {
    "item": "Q325358",
    "label": "railway platform",
    "value": "Tag:railway=platform"
  },
  {
    "item": "Q420962",
    "label": "heritage railway",
    "value": "Tag:railway=preserved"
  },
  {
    "item": "Q28109475",
    "label": "proposed railway line",
    "value": "Tag:railway=proposed"
  },
  {
    "item": "Q728937",
    "label": "railway line",
    "value": "Tag:railway=rail"
  },
  {
    "item": "Q46995345",
    "label": "flat crossing",
    "value": "Tag:railway=railway_crossing"
  },
  {
    "item": "Q357685",
    "label": "abandoned railway",
    "value": "Tag:railway=razed"
  },
  {
    "item": "Q497426",
    "label": "Rolling highway",
    "value": "Tag:railway=rolling_highway"
  },
  {
    "item": "Q1365704",
    "label": "railway roundhouse",
    "value": "Tag:railway=roundhouse"
  },
  {
    "item": "Q831844",
    "label": "staff halt",
    "value": "Tag:railway=service_station"
  },
  {
    "item": "Q862562",
    "label": "railway signal",
    "value": "Tag:railway=signal"
  },
  {
    "item": "Q910597",
    "label": "signalling control",
    "value": "Tag:railway=signal_box"
  },
  {
    "item": "Q39015397",
    "label": "signal box",
    "value": "Tag:railway=signal_box"
  },
  {
    "item": "Q12104949",
    "label": "Q12104949",
    "value": "Tag:railway=spur"
  },
  {
    "item": "Q55488",
    "label": "railway station",
    "value": "Tag:railway=station"
  },
  {
    "item": "Q55678",
    "label": "railway halt",
    "value": "Tag:railway=stop"
  },
  {
    "item": "Q5503",
    "label": "rapid transit",
    "value": "Tag:railway=subway"
  },
  {
    "item": "Q82818",
    "label": "railroad switch",
    "value": "Tag:railway=switch"
  },
  {
    "item": "Q15640053",
    "label": "tram system",
    "value": "Tag:railway=tram"
  },
  {
    "item": "Q2175765",
    "label": "tram stop",
    "value": "Tag:railway=tram_stop"
  },
  {
    "item": "Q1082925",
    "label": "railway traverser",
    "value": "Tag:railway=traverser"
  },
  {
    "item": "Q730493",
    "label": "railway turntable",
    "value": "Tag:railway=turntable"
  },
  {
    "item": "Q1530516",
    "label": "railwayvacancy detection",
    "value": "Tag:railway=vacancy_detection"
  },
  {
    "item": "Q55493",
    "label": "goods station",
    "value": "Tag:railway=yard"
  },
  {
    "item": "Q12072818",
    "label": "wheelchair ramp",
    "value": "Tag:ramp:wheelchair=yes"
  },
  {
    "item": "Q1130322",
    "label": "land reclamation",
    "value": "Tag:reclaimed=yes"
  },
  {
    "item": "Q27106436",
    "label": "recycling center",
    "value": "Tag:recycling_type=centre"
  },
  {
    "item": "Q4743886",
    "label": "recycling bin",
    "value": "Tag:recycling_type=container"
  },
  {
    "item": "Q11292",
    "label": "coral reef",
    "value": "Tag:reef=coral"
  },
  {
    "item": "Q43004",
    "label": "animism",
    "value": "Tag:religion=animist"
  },
  {
    "item": "Q22679",
    "label": "Bahá\'í Faith",
    "value": "Tag:religion=bahai"
  },
  {
    "item": "Q748",
    "label": "Buddhism",
    "value": "Tag:religion=buddhist"
  },
  {
    "item": "Q470364",
    "label": "Caodaism",
    "value": "Tag:religion=caodaism"
  },
  {
    "item": "Q5043",
    "label": "Christianity",
    "value": "Tag:religion=christian"
  },
  {
    "item": "Q9581",
    "label": "Confucianism",
    "value": "Tag:religion=confucian"
  },
  {
    "item": "Q11456201",
    "label": "Fujikō",
    "value": "Tag:religion=fujiko"
  },
  {
    "item": "Q9089",
    "label": "Hinduism",
    "value": "Tag:religion=hindy"
  },
  {
    "item": "Q9232",
    "label": "Jainism",
    "value": "Tag:religion=jain"
  },
  {
    "item": "Q9268",
    "label": "Judaism",
    "value": "Tag:religion=jewish"
  },
  {
    "item": "Q6934683",
    "label": "multifaith space",
    "value": "Tag:religion=multifaith"
  },
  {
    "item": "Q432",
    "label": "Islam",
    "value": "Tag:religion=muslim"
  },
  {
    "item": "Q189753",
    "label": "modern paganism",
    "value": "Tag:religion=pagan"
  },
  {
    "item": "Q14397660",
    "label": "Pastafarianism",
    "value": "Tag:religion=pastafarian"
  },
  {
    "item": "Q131036",
    "label": "Scientology",
    "value": "Tag:religion=scientologist"
  },
  {
    "item": "Q812767",
    "label": "Shinto",
    "value": "Tag:religion=shinto"
  },
  {
    "item": "Q9316",
    "label": "Sikhism",
    "value": "Tag:religion=sikh"
  },
  {
    "item": "Q829348",
    "label": "spiritualism",
    "value": "Tag:religion=spiritualist"
  },
  {
    "item": "Q9598",
    "label": "Taoism",
    "value": "Tag:religion=taoist"
  },
  {
    "item": "Q1622507",
    "label": "Unitarian Universalism",
    "value": "Tag:religion=unitarian_universalist"
  },
  {
    "item": "Q302729",
    "label": "Haitian Vodou",
    "value": "Tag:religion=voodoo"
  },
  {
    "item": "Q200885",
    "label": "Yazidis",
    "value": "Tag:religion=yazidi"
  },
  {
    "item": "Q9601",
    "label": "Zoroastrianism",
    "value": "Tag:religion=zoroastrian"
  },
  {
    "item": "Q3238502",
    "label": "construction aggregate",
    "value": "Tag:resource=aggregate"
  },
  {
    "item": "Q102078",
    "label": "bauxite",
    "value": "Tag:resource=bauxite"
  },
  {
    "item": "Q42302",
    "label": "clay",
    "value": "Tag:resource=clay"
  },
  {
    "item": "Q24489",
    "label": "coal",
    "value": "Tag:resource=coal"
  },
  {
    "item": "Q753",
    "label": "copper",
    "value": "Tag:resource=copper"
  },
  {
    "item": "Q40858",
    "label": "natural gas",
    "value": "Tag:resource=gas"
  },
  {
    "item": "Q897",
    "label": "gold",
    "value": "Tag:resource=gold"
  },
  {
    "item": "Q133833",
    "label": "gravel",
    "value": "Tag:resource=gravel"
  },
  {
    "item": "Q191552",
    "label": "iron ore",
    "value": "Tag:resource=iron_ore"
  },
  {
    "item": "Q23757",
    "label": "limestone",
    "value": "Tag:resource=limestone"
  },
  {
    "item": "Q22656",
    "label": "petroleum",
    "value": "Tag:resource=oil"
  },
  {
    "item": "Q184624",
    "label": "peat",
    "value": "Tag:resource=peat"
  },
  {
    "item": "Q34679",
    "label": "sand",
    "value": "Tag:resource=sand"
  },
  {
    "item": "Q29053744",
    "label": "liquid water",
    "value": "Tag:resource=water"
  },
  {
    "item": "Q283",
    "label": "water",
    "value": "Tag:resource=water"
  },
  {
    "item": "Q99196274",
    "label": "stop line",
    "value": "Tag:road_marking=solid_stop_line"
  },
  {
    "item": "Q484000",
    "label": "unmanned aerial vehicle",
    "value": "Tag:robot:type=drone"
  },
  {
    "item": "Q1128980",
    "label": "industrial robot",
    "value": "Tag:robot:type=factory"
  },
  {
    "item": "Q584529",
    "label": "humanoid robot",
    "value": "Tag:robot:type=humanoid"
  },
  {
    "item": "Q2131895",
    "label": "robotic lawn mower",
    "value": "Tag:robot:type=lawn_mower"
  },
  {
    "item": "Q2310405",
    "label": "toy robots",
    "value": "Tag:robot:type=toy"
  },
  {
    "item": "Q168577",
    "label": "robotic vacuum cleaner",
    "value": "Tag:robot:type=vacuum"
  },
  {
    "item": "Q12493",
    "label": "dome",
    "value": "Tag:roof:shape=dome"
  },
  {
    "item": "Q674251",
    "label": "waiting room",
    "value": "Tag:room=waiting"
  },
  {
    "item": "Q359309",
    "label": "detour",
    "value": "Tag:route=detour"
  },
  {
    "item": "Q606332",
    "label": "emergency evacuation",
    "value": "Tag:route=evacuation"
  },
  {
    "item": "Q2143825",
    "label": "hiking trail",
    "value": "Tag:route=hiking"
  },
  {
    "item": "Q1281105",
    "label": "piste",
    "value": "Tag:route=piste"
  },
  {
    "item": "Q22667",
    "label": "railway",
    "value": "Tag:route=railway"
  },
  {
    "item": "Q34442",
    "label": "road",
    "value": "Tag:route=road"
  },
  {
    "item": "Q17240",
    "label": "snowmobile",
    "value": "Tag:route=snowmobile"
  },
  {
    "item": "Q15079663",
    "label": "rapid transit railway line",
    "value": "Tag:route=subway"
  },
  {
    "item": "Q3238851",
    "label": "main line",
    "value": "Tag:route=train"
  },
  {
    "item": "Q4657754",
    "label": "transhumance",
    "value": "Tag:route=transhumance"
  },
  {
    "item": "Q97933005",
    "label": "face mask mandatory",
    "value": "Tag:safety:mask:covid19=yes"
  },
  {
    "item": "Q15301073",
    "label": "hanjeungmak",
    "value": "Tag:sauna=hanjeungmak"
  },
  {
    "item": "Q498629",
    "label": "infrared sauna",
    "value": "Tag:sauna=infrared"
  },
  {
    "item": "Q1579009",
    "label": "smoke sauna",
    "value": "Tag:sauna=smoke"
  },
  {
    "item": "Q1110689",
    "label": "special education school",
    "value": "Tag:school:de=Förderschule"
  },
  {
    "item": "Q682697",
    "label": "comprehensive school",
    "value": "Tag:school:de=Gesamtschule"
  },
  {
    "item": "Q667471",
    "label": "Realschule",
    "value": "Tag:school:de=Realschule"
  },
  {
    "item": "Q1357601",
    "label": "offshore wind farm",
    "value": "Tag:seamark:production_area:category=wind_farm"
  },
  {
    "item": "Q66361359",
    "label": "no diving",
    "value": "Tag:seamark:restricted_area:restriction=no_diving"
  },
  {
    "item": "Q98642741",
    "label": "no fishing",
    "value": "Tag:seamark:restricted_area:restriction=no_fishing"
  },
  {
    "item": "Q361945",
    "label": "slipway",
    "value": "Tag:seamark:small_craft_facility:category=slipway"
  },
  {
    "item": "Q12280",
    "label": "bridge",
    "value": "Tag:seamark:type=bridge"
  },
  {
    "item": "Q283202",
    "label": "harbor",
    "value": "Tag:seamark:type=harbour"
  },
  {
    "item": "Q1191982",
    "label": "mariculture",
    "value": "Tag:seamark:type=marine_farm"
  },
  {
    "item": "Q22713653",
    "label": "mooring",
    "value": "Tag:seamark:type=mooring"
  },
  {
    "item": "Q8063",
    "label": "rock",
    "value": "Tag:seamark:type=rock"
  },
  {
    "item": "Q96983545",
    "label": "cycle repair shop",
    "value": "Tag:service:bicycle:repair=yes"
  },
  {
    "item": "Q918324",
    "label": "control tower",
    "value": "Tag:service=aircraft_control"
  },
  {
    "item": "Q1251403",
    "label": "alleyway",
    "value": "Tag:service=alley"
  },
  {
    "item": "Q2251535",
    "label": "driveway",
    "value": "Tag:service=driveway"
  },
  {
    "item": "Q786014",
    "label": "rest area",
    "value": "Tag:service=rest_area"
  },
  {
    "item": "Q8253692",
    "label": "siding",
    "value": "Tag:service=siding"
  },
  {
    "item": "Q21683257",
    "label": "siding",
    "value": "Tag:service=siding"
  },
  {
    "item": "Q1891817",
    "label": "industrial spur",
    "value": "Tag:service=spur"
  },
  {
    "item": "Q19563580",
    "label": "rail yard",
    "value": "Tag:service=yard"
  },
  {
    "item": "Q1797440",
    "label": "lean-to",
    "value": "Tag:shelter_type=lean_to"
  },
  {
    "item": "Q65532949",
    "label": "picnic shelter",
    "value": "Tag:shelter_type=picnic_shelter"
  },
  {
    "item": "Q47508913",
    "label": "agrarian shop",
    "value": "Tag:shop=agrarian"
  },
  {
    "item": "Q22995",
    "label": "wine cellar",
    "value": "Tag:shop=alcohol"
  },
  {
    "item": "Q2632011",
    "label": "liquor store",
    "value": "Tag:shop=alcohol"
  },
  {
    "item": "Q11284331",
    "label": "anime shop",
    "value": "Tag:shop=anime"
  },
  {
    "item": "Q3267025",
    "label": "antique shop",
    "value": "Tag:shop=antiques"
  },
  {
    "item": "Q43156919",
    "label": "appliance store",
    "value": "Tag:shop=appliance"
  },
  {
    "item": "Q56856618",
    "label": "commercial art gallery",
    "value": "Tag:shop=art"
  },
  {
    "item": "Q47516482",
    "label": "quad shop",
    "value": "Tag:shop=atv"
  },
  {
    "item": "Q47507911",
    "label": "baby goods shop",
    "value": "Tag:shop=baby_goods"
  },
  {
    "item": "Q47507924",
    "label": "bag shop",
    "value": "Tag:shop=bag"
  },
  {
    "item": "Q274393",
    "label": "bakery",
    "value": "Tag:shop=bakery"
  },
  {
    "item": "Q47508983",
    "label": "bathroom furnishing store",
    "value": "Tag:shop=bathroom_furnishing"
  },
  {
    "item": "Q1195245",
    "label": "beauty salon",
    "value": "Tag:shop=beauty"
  },
  {
    "item": "Q47516331",
    "label": "bed shop",
    "value": "Tag:shop=bed"
  },
  {
    "item": "Q47504516",
    "label": "beverage shop",
    "value": "Tag:shop=beverages"
  },
  {
    "item": "Q26721034",
    "label": "bike shop",
    "value": "Tag:shop=bicycle"
  },
  {
    "item": "Q47516516",
    "label": "boat shop",
    "value": "Tag:shop=boat"
  },
  {
    "item": "Q664702",
    "label": "bookmaker",
    "value": "Tag:shop=bookmaker"
  },
  {
    "item": "Q200764",
    "label": "bookstore",
    "value": "Tag:shop=books"
  },
  {
    "item": "Q1068824",
    "label": "boutique",
    "value": "Tag:shop=boutique"
  },
  {
    "item": "Q47504642",
    "label": "brewing supply",
    "value": "Tag:shop=brewing_supplies"
  },
  {
    "item": "Q13164546",
    "label": "butcher shop",
    "value": "Tag:shop=butcher"
  },
  {
    "item": "Q47517150",
    "label": "camera shop",
    "value": "Tag:shop=camera"
  },
  {
    "item": "Q47516343",
    "label": "candle shop",
    "value": "Tag:shop=candles"
  },
  {
    "item": "Q774861",
    "label": "cannabis coffee shop",
    "value": "Tag:shop=cannabis"
  },
  {
    "item": "Q786803",
    "label": "car dealership",
    "value": "Tag:shop=car"
  },
  {
    "item": "Q47516524",
    "label": "car parts shop",
    "value": "Tag:shop=car_parts"
  },
  {
    "item": "Q1310967",
    "label": "automobile repair shop",
    "value": "Tag:shop=car_repair"
  },
  {
    "item": "Q47516346",
    "label": "carpet shop",
    "value": "Tag:shop=carpet"
  },
  {
    "item": "Q2235104",
    "label": "ship chandler",
    "value": "Tag:shop=chandler"
  },
  {
    "item": "Q153551",
    "label": "charity shop",
    "value": "Tag:shop=charity"
  },
  {
    "item": "Q3088348",
    "label": "cheesery",
    "value": "Tag:shop=cheese"
  },
  {
    "item": "Q1260046",
    "label": "drugstore",
    "value": "Tag:shop=chemist"
  },
  {
    "item": "Q47504660",
    "label": "chocolate shop",
    "value": "Tag:shop=chocolate"
  },
  {
    "item": "Q2090555",
    "label": "clothing store",
    "value": "Tag:shop=clothes"
  },
  {
    "item": "Q47517090",
    "label": "collector\'s items store",
    "value": "Tag:shop=collector"
  },
  {
    "item": "Q43182520",
    "label": "computer shop",
    "value": "Tag:shop=computer"
  },
  {
    "item": "Q3574069",
    "label": "confectionery store",
    "value": "Tag:shop=confectionery"
  },
  {
    "item": "Q7361709",
    "label": "convenience store",
    "value": "Tag:shop=convenience"
  },
  {
    "item": "Q23745600",
    "label": "Alfamart",
    "value": "Tag:shop=convenience"
  },
  {
    "item": "Q1131628",
    "label": "copy shop",
    "value": "Tag:shop=copyshop"
  },
  {
    "item": "Q47508166",
    "label": "cosmetic shop",
    "value": "Tag:shop=cosmetics"
  },
  {
    "item": "Q1244860",
    "label": "general store",
    "value": "Tag:shop=country_store"
  },
  {
    "item": "Q47517111",
    "label": "art and crafts shop",
    "value": "Tag:shop=craft"
  },
  {
    "item": "Q47516347",
    "label": "curtain shop",
    "value": "Tag:shop=curtain"
  },
  {
    "item": "Q17009758",
    "label": "dairy store",
    "value": "Tag:shop=dairy"
  },
  {
    "item": "Q3231410",
    "label": "delicatessen",
    "value": "Tag:shop=deli"
  },
  {
    "item": "Q216107",
    "label": "department store",
    "value": "Tag:shop=department_store"
  },
  {
    "item": "Q811530",
    "label": "hardware store",
    "value": "Tag:shop=doityourself"
  },
  {
    "item": "Q47516351",
    "label": "door shop",
    "value": "Tag:shop=doors"
  },
  {
    "item": "Q42817497",
    "label": "dry cleaner",
    "value": "Tag:shop=dry_cleaning"
  },
  {
    "item": "Q21017121",
    "label": "vape shop",
    "value": "Tag:shop=e-cigarette"
  },
  {
    "item": "Q47515948",
    "label": "electrical supply store",
    "value": "Tag:shop=electrical"
  },
  {
    "item": "Q43156817",
    "label": "electronics store",
    "value": "Tag:shop=electronics"
  },
  {
    "item": "Q65090225",
    "label": "consumer electronics store",
    "value": "Tag:shop=electronics"
  },
  {
    "item": "Q47515998",
    "label": "energy provider",
    "value": "Tag:shop=energy"
  },
  {
    "item": "Q221618",
    "label": "sex shop",
    "value": "Tag:shop=erotic"
  },
  {
    "item": "Q519076",
    "label": "real estate broker",
    "value": "Tag:shop=estate_agent"
  },
  {
    "item": "Q47508051",
    "label": "fabric shop",
    "value": "Tag:shop=fabric"
  },
  {
    "item": "Q1371823",
    "label": "farm shop",
    "value": "Tag:shop=farm"
  },
  {
    "item": "Q2090555",
    "label": "clothing store",
    "value": "Tag:shop=fashion"
  },
  {
    "item": "Q47516018",
    "label": "fireplace shop",
    "value": "Tag:shop=fireplace"
  },
  {
    "item": "Q47516535",
    "label": "fishing equipment store",
    "value": "Tag:shop=fishing"
  },
  {
    "item": "Q550594",
    "label": "fishmonger",
    "value": "Tag:shop=fishmonger"
  },
  {
    "item": "Q47516353",
    "label": "flooring shop",
    "value": "Tag:shop=flooring"
  },
  {
    "item": "Q10431511",
    "label": "flower shop",
    "value": "Tag:shop=florist"
  },
  {
    "item": "Q47517115",
    "label": "frame shop",
    "value": "Tag:shop=frame"
  },
  {
    "item": "Q47516538",
    "label": "free flying equipment store",
    "value": "Tag:shop=free_flying"
  },
  {
    "item": "Q47504702",
    "label": "frozen food shop",
    "value": "Tag:shop=frozen_food"
  },
  {
    "item": "Q47516533",
    "label": "fuel shop",
    "value": "Tag:shop=fuel"
  },
  {
    "item": "Q1466031",
    "label": "funeral home",
    "value": "Tag:shop=funeral_directors"
  },
  {
    "item": "Q316490",
    "label": "funeral director",
    "value": "Tag:shop=funerals_directors"
  },
  {
    "item": "Q47516358",
    "label": "furniture shop",
    "value": "Tag:shop=furniture"
  },
  {
    "item": "Q47517120",
    "label": "board games shop",
    "value": "Tag:shop=games"
  },
  {
    "item": "Q260569",
    "label": "garden centre",
    "value": "Tag:shop=garden_centre"
  },
  {
    "item": "Q47516049",
    "label": "garden furniture shop",
    "value": "Tag:shop=garden_furniture"
  },
  {
    "item": "Q47516067",
    "label": "bottled gas shop",
    "value": "Tag:shop=gas"
  },
  {
    "item": "Q1244860",
    "label": "general store",
    "value": "Tag:shop=general"
  },
  {
    "item": "Q865693",
    "label": "gift shop",
    "value": "Tag:shop=gift"
  },
  {
    "item": "Q1529413",
    "label": "glaziery",
    "value": "Tag:shop=glaziery"
  },
  {
    "item": "Q2017004",
    "label": "pro shop",
    "value": "Tag:shop=golf"
  },
  {
    "item": "Q145658",
    "label": "greengrocer",
    "value": "Tag:shop=greengrocer"
  },
  {
    "item": "Q1295201",
    "label": "grocery store",
    "value": "Tag:shop=grocery"
  },
  {
    "item": "Q350039",
    "label": "mercery",
    "value": "Tag:shop=haberdashery"
  },
  {
    "item": "Q55187",
    "label": "hairdresser",
    "value": "Tag:shop=hairdresser"
  },
  {
    "item": "Q47508170",
    "label": "hairdresser supply shop",
    "value": "Tag:shop=hairdresser_supply"
  },
  {
    "item": "Q811530",
    "label": "hardware store",
    "value": "Tag:shop=hardware"
  },
  {
    "item": "Q864440",
    "label": "health food store",
    "value": "Tag:shop=health_food"
  },
  {
    "item": "Q1644347",
    "label": "audiologist",
    "value": "Tag:shop=hearing_aids"
  },
  {
    "item": "Q3133901",
    "label": "herbalist",
    "value": "Tag:shop=herbalist"
  },
  {
    "item": "Q47516431",
    "label": "hifi store",
    "value": "Tag:shop=hifi"
  },
  {
    "item": "Q5874968",
    "label": "hobby shop",
    "value": "Tag:shop=hobby"
  },
  {
    "item": "Q47516128",
    "label": "houseware shop",
    "value": "Tag:shop=houseware"
  },
  {
    "item": "Q47516539",
    "label": "hunting shop",
    "value": "Tag:shop=hunting"
  },
  {
    "item": "Q1311064",
    "label": "ice cream parlor",
    "value": "Tag:shop=ice_cream"
  },
  {
    "item": "Q47516362",
    "label": "interior decorations shop",
    "value": "Tag:shop=interior_decoration"
  },
  {
    "item": "Q47516541",
    "label": "jetski store",
    "value": "Tag:shop=jetski"
  },
  {
    "item": "Q20708021",
    "label": "jewellery shop",
    "value": "Tag:shop=jewelry"
  },
  {
    "item": "Q693369",
    "label": "kiosk",
    "value": "Tag:shop=kiosk"
  },
  {
    "item": "Q47516368",
    "label": "kitchen shop",
    "value": "Tag:shop=kitchen"
  },
  {
    "item": "Q47516372",
    "label": "lamp store",
    "value": "Tag:shop=lamps"
  },
  {
    "item": "Q1143034",
    "label": "self-service laundry",
    "value": "Tag:shop=laundry"
  },
  {
    "item": "Q12893467",
    "label": "industrial laundry",
    "value": "Tag:shop=laundry"
  },
  {
    "item": "Q47508066",
    "label": "leather shop",
    "value": "Tag:shop=leather"
  },
  {
    "item": "Q47516372",
    "label": "lamp store",
    "value": "Tag:shop=lighting"
  },
  {
    "item": "Q3479990",
    "label": "locksmith",
    "value": "Tag:shop=locksmith"
  },
  {
    "item": "Q47519608",
    "label": "lottery store",
    "value": "Tag:shop=lottery"
  },
  {
    "item": "Q97395548",
    "label": "shopping mall",
    "value": "Tag:shop=mall"
  },
  {
    "item": "Q901922",
    "label": "massage shop",
    "value": "Tag:shop=massage"
  },
  {
    "item": "Q2221810",
    "label": "medical equipment shop",
    "value": "Tag:shop=medical_supply"
  },
  {
    "item": "Q3505412",
    "label": "military surplus",
    "value": "Tag:shop=military_surplus"
  },
  {
    "item": "Q47516435",
    "label": "mobile phone shop",
    "value": "Tag:shop=mobile_phone"
  },
  {
    "item": "Q2893189",
    "label": "moneylender",
    "value": "Tag:shop=money_lender"
  },
  {
    "item": "Q24455483",
    "label": "motorcycle rental",
    "value": "Tag:shop=motorcycle"
  },
  {
    "item": "Q47516542",
    "label": "motorcycle shop",
    "value": "Tag:shop=motorcycle"
  },
  {
    "item": "Q2243978",
    "label": "record shop",
    "value": "Tag:shop=music"
  },
  {
    "item": "Q24284215",
    "label": "musical instrument store",
    "value": "Tag:shop=musical_instrument"
  },
  {
    "item": "Q1528905",
    "label": "newsagent",
    "value": "Tag:shop=newsagent"
  },
  {
    "item": "Q47508200",
    "label": "nutrition supplements store",
    "value": "Tag:shop=nutrition_supplements"
  },
  {
    "item": "Q80144507",
    "label": "optician shop",
    "value": "Tag:shop=optician"
  },
  {
    "item": "Q1996635",
    "label": "optician",
    "value": "Tag:shop=optician"
  },
  {
    "item": "Q47516546",
    "label": "outdoor equipment store",
    "value": "Tag:shop=outdoor"
  },
  {
    "item": "Q47516196",
    "label": "paint store",
    "value": "Tag:shop=paint"
  },
  {
    "item": "Q47519648",
    "label": "party shop",
    "value": "Tag:shop=party"
  },
  {
    "item": "Q47505049",
    "label": "pasta store",
    "value": "Tag:shop=pasta"
  },
  {
    "item": "Q47505416",
    "label": "Konditorei",
    "value": "Tag:shop=pastry"
  },
  {
    "item": "Q176637",
    "label": "pawnbroker",
    "value": "Tag:shop=pawnbroker"
  },
  {
    "item": "Q1509937",
    "label": "perfumery",
    "value": "Tag:shop=perfumery"
  },
  {
    "item": "Q220142",
    "label": "pet store",
    "value": "Tag:shop=pet"
  },
  {
    "item": "Q47517141",
    "label": "photo shop",
    "value": "Tag:shop=photo"
  },
  {
    "item": "Q11642",
    "label": "pottery",
    "value": "Tag:shop=pottery"
  },
  {
    "item": "Q47519677",
    "label": "firework supply store",
    "value": "Tag:shop=pyrotechnics"
  },
  {
    "item": "Q47516439",
    "label": "radiotechnic store",
    "value": "Tag:shop=radiotechnics"
  },
  {
    "item": "Q47519786",
    "label": "religous merchandising store",
    "value": "Tag:shop=religion"
  },
  {
    "item": "Q47516423",
    "label": "robot shop",
    "value": "Tag:shop=robot"
  },
  {
    "item": "Q47516552",
    "label": "scuba diving equipment store",
    "value": "Tag:shop=scuba_diving"
  },
  {
    "item": "Q3393867",
    "label": "seafood market",
    "value": "Tag:shop=seafood"
  },
  {
    "item": "Q2925872",
    "label": "second-hand shop",
    "value": "Tag:shop=second_hand"
  },
  {
    "item": "Q47516232",
    "label": "security shop",
    "value": "Tag:shop=security"
  },
  {
    "item": "Q47508075",
    "label": "sewing shop",
    "value": "Tag:shop=sewing"
  },
  {
    "item": "Q2235104",
    "label": "ship chandler",
    "value": "Tag:shop=ship_chandler"
  },
  {
    "item": "Q7500021",
    "label": "shoe store",
    "value": "Tag:shop=shoes"
  },
  {
    "item": "Q11315",
    "label": "shopping center",
    "value": "Tag:shop=shopping_centre"
  },
  {
    "item": "Q47516563",
    "label": "ski store",
    "value": "Tag:shop=ski"
  },
  {
    "item": "Q47516564",
    "label": "snowmobile store",
    "value": "Tag:shop=snowmobile"
  },
  {
    "item": "Q47507844",
    "label": "spice store",
    "value": "Tag:shop=spices"
  },
  {
    "item": "Q47516567",
    "label": "sport shop",
    "value": "Tag:shop=sports"
  },
  {
    "item": "Q24309558",
    "label": "stationer",
    "value": "Tag:shop=stationery"
  },
  {
    "item": "Q401404",
    "label": "self storage",
    "value": "Tag:shop=storage_rental"
  },
  {
    "item": "Q180846",
    "label": "supermarket",
    "value": "Tag:shop=supermarket"
  },
  {
    "item": "Q47517083",
    "label": "swimming pool equipment shop",
    "value": "Tag:p=swimming_pool"
  },
  {
    "item": "Q47508085",
    "label": "tailor shop",
    "value": "Tag:shop=tailor"
  },
  {
    "item": "Q27038997",
    "label": "tattoo parlor",
    "value": "Tag:shop=tattoo"
  },
  {
    "item": "Q47507849",
    "label": "tea shop",
    "value": "Tag:shop=tea"
  },
  {
    "item": "Q47519615",
    "label": "ticket shop",
    "value": "Tag:shop=ticket"
  },
  {
    "item": "Q47516376",
    "label": "tile store",
    "value": "Tag:shop=tiles"
  },
  {
    "item": "Q16406",
    "label": "smoke shop",
    "value": "Tag:shop=tobacco"
  },
  {
    "item": "Q1318959",
    "label": "toy store",
    "value": "Tag:shop=toys"
  },
  {
    "item": "Q811891",
    "label": "building materials trade",
    "value": "Tag:shop=trade"
  },
  {
    "item": "Q217107",
    "label": "travel agency",
    "value": "Tag:shop=travel_agency"
  },
  {
    "item": "Q47517159",
    "label": "trophy store",
    "value": "Tag:shop=trophy"
  },
  {
    "item": "Q47516839",
    "label": "tire shop",
    "value": "Tag:shop=tyres"
  },
  {
    "item": "Q47519700",
    "label": "vacant shop",
    "value": "Tag:shop=vacant"
  },
  {
    "item": "Q47516441",
    "label": "vacuum cleaner store",
    "value": "Tag:shop=vacuum_cleaner"
  },
  {
    "item": "Q2301114",
    "label": "variety store",
    "value": "Tag:shop=variety_store"
  },
  {
    "item": "Q1756711",
    "label": "video rental shop",
    "value": "Tag:shop=video"
  },
  {
    "item": "Q7927919",
    "label": "video game store",
    "value": "Tag:shop=video_games"
  },
  {
    "item": "Q47508094",
    "label": "watch shop",
    "value": "Tag:shop=watches"
  },
  {
    "item": "Q25112996",
    "label": "gun shop",
    "value": "Tag:shop=weapons"
  },
  {
    "item": "Q320677",
    "label": "cash and carry",
    "value": "Tag:shop=wholesale"
  },
  {
    "item": "Q47516378",
    "label": "window blind shop",
    "value": "Tag:shop=window_blind"
  },
  {
    "item": "Q21117149",
    "label": "wine shop",
    "value": "Tag:shop=wine"
  },
  {
    "item": "Q213441",
    "label": "shop",
    "value": "Tag:shop=yes"
  },
  {
    "item": "Q57334497",
    "label": "retail store",
    "value": "Tag:shop=yes"
  },
  {
    "item": "Q164240",
    "label": "megalith",
    "value": "Tag:site_type=megalith"
  },
  {
    "item": "Q98596750",
    "label": "minilith",
    "value": "Tag:site_type=minilith"
  },
  {
    "item": "Q1149405",
    "label": "rock shelter",
    "value": "Tag:site_type=rock_shelter"
  },
  {
    "item": "Q751734",
    "label": "smoking ban",
    "value": "Tag:smoking=no"
  },
  {
    "item": "Q1052631",
    "label": "smoking room",
    "value": "Tag:smoking=separated"
  },
  {
    "item": "Q66361315",
    "label": "smoking allowed",
    "value": "Tag:smoking=yes"
  },
  {
    "item": "Q22908",
    "label": "retirement home",
    "value": "Tag:social_facility=assisted_living"
  },
  {
    "item": "Q837142",
    "label": "nursing home",
    "value": "Tag:social_facility=nursing_home"
  },
  {
    "item": "Q2274762",
    "label": "basic register addresses and buildings",
    "value": "Tag:source=BAG"
  },
  {
    "item": "Q863756",
    "label": "Bing Maps",
    "value": "Tag:source=Bing"
  },
  {
    "item": "Q1073185",
    "label": "China–Brazil Earth Resources Satellite program",
    "value": "Tag:source=CBERS"
  },
  {
    "item": "Q10265187",
    "label": "National Department of Transport Infrastructure",
    "value": "Tag:source=DNIT"
  },
  {
    "item": "Q731206",
    "label": "Fundação Nacional do Índio",
    "value": "Tag:source=Funai"
  },
  {
   "item": "Q18822",
    "label": "Global Positioning System",
    "value": "Tag:source=GPS"
  },
  {
    "item": "Q268072",
    "label": "Instituto Brasileiro de Geografia e Estatística",
    "value": "Tag:source=IBGE"
  },
  {
    "item": "Q3151725",
    "label": "Chico Mendes Institute for Biodiversity Conservation",
    "value": "Tag:source=ICMBio"
  },
  {
    "item": "Q24961802",
    "label": "Q24961802",
    "value": "Tag:source=IGVSB"
  },
  {
    "item": "Q6973463",
    "label": "National Hydrography Dataset",
    "value": "Tag:source=NHD"
  },
  {
    "item": "Q95630587",
    "label": "Town Hall of Laranjal Paulista",
    "value": "Tag:source=PMLP"
  },
  {
    "item": "Q191839",
    "label": "aerial photography",
    "value": "Tag:source=aerial_imagery"
  },
  {
    "item": "Q1116133",
    "label": "common knowledge",
    "value": "Tag:source=common_knowledge"
  },
  {
    "item": "Q1224697",
    "label": "DigitalGlobe",
    "value": "Tag:source=digitalglobe"
  },
  {
    "item": "Q744069",
    "label": "extrapolation",
    "value": "Tag:source=extrapolation"
  },
  {
    "item": "Q25469578",
    "label": "local knowledge",
    "value": "Tag:source=local_knowledge"
  },
  {
    "item": "Q10351025",
    "label": "Military Police of São Paulo State",
    "value": "Tag:source=pmsp"
  },
  {
    "item": "Q370766",
    "label": "ground truth",
    "value": "Tag:source=survey"
  },
  {
    "item": "Q1342743",
    "label": "Ulmus procera",
    "value": "Tag:species:en=English_Elm"
  },
  {
    "item": "Q1342743",
    "label": "Ulmus procera",
    "value": "Tag:species=Ulmus_procera"
  },
  {
    "item": "Q172809",
    "label": "ten-pin bowling",
    "value": "Tag:sport=10pin"
  },
  {
    "item": "Q3414499",
    "label": "eight-pin bowling",
    "value": "Tag:sport=8pin"
  },
  {
    "item": "Q706199",
    "label": "nine-pin bowling",
    "value": "Tag:sport=9pin"
  },
  {
    "item": "Q43114",
    "label": "aikido",
    "value": "Tag:sport=aikido"
  },
  {
    "item": "Q41323",
    "label": "American football",
    "value": "Tag:sport=american_football"
  },
  {
    "item": "Q108429",
    "label": "archery",
    "value": "Tag:sport=archery"
  },
  {
    "item": "Q542",
    "label": "athletics",
    "value": "Tag:sport=athletics"
  },
  {
    "item": "Q50776",
    "label": "Australian rules football",
    "value": "Tag:sport=australian_football"
  },
  {
    "item": "Q7291",
    "label": "badminton",
    "value": "Tag:sport=badminton"
  },
  {
    "item": "Q183018",
    "label": "bandy",
    "value": "Tag:sport=bandy"
  },
  {
    "item": "Q809831",
    "label": "BASE jumping",
    "value": "Tag:sport=base"
  },
  {
    "item": "Q5369",
    "label": "baseball",
    "value": "Tag:sport=baseball"
  },
  {
    "item": "Q5372",
    "label": "basketball",
    "value": "Tag:sport=basketball"
  },
  {
    "item": "Q4543",
    "label": "beach volleyball",
    "value": "Tag:sport=beachvolleyball"
  },
  {
    "item": "Q3341285",
    "label": "cue sports",
    "value": "Tag:sport=billiards"
  },
  {
    "item": "Q215184",
    "label": "BMX",
    "value": "Tag:sport=bmx"
  },
  {
    "item": "Q177275",
    "label": "bobsleigh",
    "value": "Tag:sport=bobsleigh"
  },
  {
    "item": "Q895060",
    "label": "boules",
    "value": "Tag:sport=boules"
  },
  {
    "item": "Q895471",
    "label": "bowls",
    "value": "Tag:sport=bowls"
  },
  {
    "item": "Q32112",
    "label": "boxing",
    "value": "Tag:sport=boxing"
  },
  {
    "item": "Q248534",
    "label": "Canadian football",
    "value": "Tag:sport=canadian_football"
  },
  {
    "item": "Q20856109",
    "label": "canoeing",
    "value": "Tag:sport=canoe"
  },
  {
    "item": "Q5386",
    "label": "auto racing",
    "value": "Tag:sport=car_racing"
  },
  {
    "item": "Q718",
    "label": "chess",
    "value": "Tag:sport=chess"
  },
  {
    "item": "Q5132811",
    "label": "Cliff jumping",
    "value": "Tag:sport=cliff_diving"
  },
  {
    "item": "Q852989",
    "label": "bouldering",
    "value": "Tag:sport=climbing"
  },
  {
    "item": "Q1541373",
    "label": "sport climbing",
    "value": "Tag:sport=climbing"
  },
  {
    "item": "Q22857",
    "label": "climbing",
    "value": "Tag:sport=climbing"
  },
  {
    "item": "Q1939700",
    "label": "rope course",
    "value": "Tag:sport=climbing_adventure"
  },
  {
    "item": "Q319771",
    "label": "cockfight",
    "value": "Tag:sport=cockfighting"
  },
  {
    "item": "Q5375",
    "label": "cricket",
    "value": "Tag:sport=cricket"
  },
  {
    "item": "Q682943",
    "label": "cricket field",
    "value": "Tag:sport=cricket"
  },
  {
    "item": "Q193387",
    "label": "croquet",
    "value": "Tag:sport=croquet"
  },
  {
    "item": "Q2072840",
    "label": "CrossFit",
    "value": "Tag:sport=crossfit"
  },
  {
    "item": "Q136851",
    "label": "curling",
    "value": "Tag:sport=curling"
  },
  {
    "item": "Q2215841",
    "label": "cycle sport",
    "value": "Tag:sport=cycling"
  },
  {
    "item": "Q131471",
    "label": "darts",
    "value": "Tag:sport=darts"
  },
  {
    "item": "Q876737",
    "label": "disc golf",
    "value": "Tag:sport=disc_golf"
  },
  {
    "item": "Q57833661",
    "label": "dog racing",
    "value": "Tag:sport=dog_racing"
  },
  {
    "item": "Q778020",
    "label": "dog track",
    "value": "Tag:sport=dog_racing"
  },
  {
    "item": "Q1345388",
    "label": "greyhound racing",
    "value": "Tag:sport=dog_racing"
  },
  {
    "item": "Q38490",
    "label": "dog training",
    "value": "Tag:sport=dog_training"
  },
  {
    "item": "Q902378",
    "label": "equestrian sport",
    "value": "Tag:sport=equestrian"
  },
  {
    "item": "Q219067",
    "label": "physical exercise",
    "value": "Tag:sport=exercise"
  },
  {
    "item": "Q1455",
    "label": "field hockey",
    "value": "Tag:sport=field_hockey"
  },
  {
    "item": "Q14373",
    "label": "fishing",
    "value": "Tag:sport=fishing"
  },
  {
    "item": "Q219067",
    "label": "physical exercise",
    "value": "Tag:sport=fitness"
  },
  {
    "item": "Q1065656",
    "label": "health club",
    "value": "Tag:sport=fitness"
  },
  {
    "item": "Q1439993",
    "label": "four square",
    "value": "Tag:sport=four_square"
  },
  {
    "item": "Q1453560",
    "label": "freeflying",
    "value": "Tag:sport=free_flying"
  },
  {
    "item": "Q171401",
    "label": "futsal",
    "value": "Tag:sport=futsal"
  },
  {
    "item": "Q2447366",
    "label": "gaelic games",
    "value": "Tag:sport=gaelic_games"
  },
  {
    "item": "Q5377",
    "label": "golf",
    "value": "Tag:sport=golf"
  },
  {
    "item": "Q43450",
    "label": "gymnastics",
    "value": "Tag:sport=gymnastics"
  },
  {
    "item": "Q8418",
    "label": "handball",
    "value": "Tag:sport=handball"
  },
  {
    "item": "Q200333",
    "label": "Hapkido",
    "value": "Tag:sport=hapkido"
  },
  {
    "item": "Q187916",
    "label": "horse racing",
    "value": "Tag:sport=horse_racing"
  },
  {
    "item": "Q179226",
    "label": "equestrianism",
    "value": "Tag:sport=horse_riding"
  },
  {
    "item": "Q2746282",
    "label": "horseshoes",
    "value": "Tag:sport=horseshoes"
  },
  {
    "item": "Q41466",
    "label": "ice hockey",
    "value": "Tag:sport=ice_hockey"
  },
  {
    "item": "Q779272",
    "label": "ice skating",
    "value": "Tag:sport=ice_skating"
  },
  {
    "item": "Q1070325",
    "label": "ice stock sport",
    "value": "Tag:sport=ice_stock"
  },
  {
    "item": "Q11420",
    "label": "judo",
    "value": "Tag:sport=judo"
  },
  {
    "item": "Q11419",
    "label": "karate",
    "value": "Tag:sport=karate"
  },
  {
    "item": "Q192420",
    "label": "kart racing",
    "value": "Tag:sport=karting"
  },
  {
    "item": "Q1232319",
    "label": "kart circuit",
    "value": "Tag:sport=karting"
  },
  {
    "item": "Q219554",
    "label": "kite surfing",
    "value": "Tag:sport=kitesurfing"
  },
  {
    "item": "Q192937",
    "label": "korfball",
    "value": "Tag:sport=korfball"
  },
  {
    "item": "Q2280583",
    "label": "krachtbal",
    "value": "Tag:sport=krachtbal"
  },
  {
    "item": "Q185851",
    "label": "lacrosse",
    "value": "Tag:sport=lacrosse"
  },
  {
    "item": "Q998303",
    "label": "Laser tag",
    "value": "Tag:sport=laser_tag"
  },
  {
    "item": "Q170737",
    "label": "long jump",
    "value": "Tag:sport=long_jump"
  },
  {
    "item": "Q11417",
    "label": "martial arts",
    "value": "Tag:sport=martial_arts"
  },
  {
    "item": "Q754796",
    "label": "miniature golf",
    "value": "Tag:sport=miniature_golf"
  },
  {
    "item": "Q2475583",
    "label": "radio-controlled aircraft",
    "value": "Tag:sport=model_aerodrome"
  },
  {
    "item": "Q215862",
    "label": "motocross",
    "value": "Tag:sport=motocross"
  },
  {
    "item": "Q5367",
    "label": "motorsport",
    "value": "Tag:sport=motor"
  },
  {
    "item": "Q223705",
    "label": "mountain bike",
    "value": "Tag:sport=mtb"
  },
  {
    "item": "Q349",
    "label": "sport",
    "value": "Tag:sport=multi"
  },
  {
    "item": "Q231200",
    "label": "netball",
    "value": "Tag:sport=netball"
  },
  {
    "item": "Q933851",
    "label": "obstacle course",
    "value": "Tag:sport=obstacle_course"
  },
  {
    "item": "Q29358",
    "label": "orienteering",
    "value": "Tag:sport=orienteering"
  },
  {
    "item": "Q3805008",
    "label": "paddle tennis",
    "value": "Tag:sport=paddle_tennis"
  },
  {
    "item": "Q1582389",
    "label": "padel",
    "value": "Tag:sport=padle"
  },
  {
    "item": "Q192832",
    "label": "paintball",
    "value": "Tag:sport=paintball"
  },
  {
    "item": "Q62603260",
    "label": "parachute club",
    "value": "Tag:sport=parachuting"
  },
  {
    "item": "Q193210",
    "label": "skydiving",
    "value": "Tag:sport=parachuting"
  },
  {
    "item": "Q178380",
    "label": "paragliding",
    "value": "Tag:sport=paragliding"
  },
  {
    "item": "Q212845",
    "label": "Basque pelota",
    "value": "Tag:sport=pelota"
  },
  {
    "item": "Q11928176",
    "label": "pelota",
    "value": "Tag:sport=pelota"
  },
  {
    "item": "Q189317",
    "label": "petanque",
    "value": "Tag:sport=petanque"
  },
  {
    "item": "Q866224",
    "label": "pickleball",
    "value": "Tag:sport=pickleball"
  },
  {
    "item": "Q272460",
    "label": "pilates",
    "value": "Tag:sport=pilates"
  },
  {
    "item": "Q754586",
    "label": "racquetball",
    "value": "Tag:sport=racquet"
  },
  {
    "item": "Q1419833",
    "label": "radio-controlled car",
    "value": "Tag:sport=rc_car"
  },
  {
    "item": "Q1154336",
    "label": "rock climbing",
    "value": "Tag:sport=rock_climbing"
  },
  {
    "item": "Q1707432",
    "label": "roller skating",
    "value": "Tag:sport=roller_skating"
  },
  {
    "item": "Q159354",
    "label": "rowing",
    "value": "Tag:sport=rowing"
  },
  {
    "item": "Q5849",
    "label": "rugby union",
    "value": "Tag:sport=rugby"
  },
  {
    "item": "Q5378",
    "label": "rugby",
    "value": "Tag:sport=rugby"
  },
  {
    "item": "Q10962",
    "label": "rugby league",
    "value": "Tag:sport=rugby"
  },
  {
    "item": "Q10962",
    "label": "rugby league",
    "value": "Tag:sport=rugby_league"
  },
  {
    "item": "Q5849",
    "label": "rugby union",
   "value": "Tag:sport=rugby_union"
  },
  {
    "item": "Q3694569",
    "label": "running",
    "value": "Tag:sport=running"
  },
  {
    "item": "Q14085739",
    "label": "sailing",
    "value": "Tag:sport=sailing"
  },
  {
    "item": "Q1719546",
    "label": "recreational diving",
    "value": "Tag:sport=scuba_diving"
  },
  {
    "item": "Q1096878",
    "label": "scuba diving",
    "value": "Tag:sport=scuba_diving"
  },
  {
    "item": "Q206989",
    "label": "shooting sport",
    "value": "Tag:sport=shooting"
  },
  {
    "item": "Q521839",
    "label": "shooting range",
    "value": "Tag:sport=shooting_range"
  },
  {
    "item": "Q1975513",
    "label": "shuffleboard",
    "value": "Tag:sport=shuffleboard"
  },
  {
    "item": "Q909906",
    "label": "skatepark",
    "value": "Tag:sport=skateboard"
  },
  {
    "item": "Q842284",
    "label": "skateboarding",
    "value": "Tag:sport=skateboard"
  },
  {
    "item": "Q14300548",
    "label": "skating",
    "value": "Tag:sport=skating"
  },
  {
    "item": "Q1109069",
    "label": "ski jumping hill",
    "value": "Tag:sport=ski_jumping"
  },
  {
    "item": "Q7718",
    "label": "ski jumping",
    "value": "Tag:sport=ski_jumping"
  },
  {
    "item": "Q130949",
    "label": "skiing",
    "value": "Tag:sport=skiing"
  },
  {
    "item": "Q8524",
    "label": "football pitch",
    "value": "Tag:sport=soccer"
  },
  {
    "item": "Q891698",
    "label": "Q891698",
    "value": "Tag:sport=soccer"
  },
  {
    "item": "Q2736",
    "label": "association football",
    "value": "Tag:sport=soccer"
  },
  {
    "item": "Q171038",
    "label": "softball",
    "value": "Tag:sport=softball"
  },
  {
    "item": "Q133201",
    "label": "squash",
    "value": "Tag:sport=squash"
  },
  {
    "item": "Q40561",
    "label": "sumo",
    "value": "Tag:sport=sumo"
  },
  {
    "item": "Q159992",
    "label": "surfing",
    "value": "Tag:sport=surfing"
  },
  {
    "item": "Q31920",
    "label": "swimming",
    "value": "Tag:sport=swimming"
  },
  {
    "item": "Q14922",
    "label": "table football",
    "value": "Tag:sport=table_soccer"
  },
  {
    "item": "Q3930",
    "label": "table tennis",
    "value": "Tag:sport=table_tennis"
  },
  {
    "item": "Q36389",
    "label": "taekwondo",
    "value": "Tag:sport=taekwondo"
  },
  {
    "item": "Q8418",
    "label": "handball",
    "value": "Tag:sport=team_handball"
  },
  {
    "item": "Q847",
    "label": "tennis",
    "value": "Tag:sport=tennis"
  },
  {
    "item": "Q273285",
    "label": "luge",
    "value": "Tag:sport=toboggan"
  },
  {
    "item": "Q465014",
    "label": "trampolining",
    "value": "Tag:sport=trampoline"
  },
  {
    "item": "Q244700",
    "label": "ultimate",
    "value": "Tag:sport=ultimate"
  },
  {
    "item": "Q678305",
    "label": "ultralight aviation",
    "value": "Tag:sport=ultralight_aviation"
  },
  {
    "item": "Q1734",
    "label": "volleyball",
    "value": "Tag:sport=volleyball"
  },
  {
    "item": "Q7707",
    "label": "water polo",
    "value": "Tag:sport=water_polo"
  },
  {
    "item": "Q472827",
    "label": "water skiing",
    "value": "Tag:sport=water_ski"
  },
  {
    "item": "Q83462",
    "label": "weightlifting",
    "value": "Tag:sport=weightlifting"
  },
  {
    "item": "Q42486",
    "label": "wrestling",
    "value": "Tag:sport=wrestling"
  },
  {
    "item": "Q27043907",
    "label": "yoga studio",
    "value": "Tag:sport=yoga"
  },
  {
    "item": "Q9350",
    "label": "Yoga",
    "value": "Tag:sport=yoga"
  },
  {
    "item": "Q928830",
    "label": "metro station",
    "value": "Tag:station=subway"
  },
  {
    "item": "Q1719654",
    "label": "serving area interface",
    "value": "Tag:street_cabinet=telecom"
  },
  {
    "item": "Q746369",
    "label": "recording studio",
    "value": "Tag:studio=audio"
  },
  {
    "item": "Q511355",
    "label": "television studio",
    "value": "Tag:studio=television"
  },
  {
    "item": "Q803616",
    "label": "rail transport electrical substation",
    "value": "Tag:substation=traction"
  },
  {
    "item": "Q361665",
    "label": "summit cross",
    "value": "Tag:summit:cross=yes"
  },
  {
    "item": "Q221706",
    "label": "ceiling",
    "value": "Tag:support=ceiling"
  },
  {
    "item": "Q148571",
    "label": "fence",
    "value": "Tag:support=fence"
  },
  {
    "item": "Q525800",
    "label": "pole",
    "value": "Tag:support=pole"
  },
  {
    "item": "Q233320",
    "label": "scaffold",
    "value": "Tag:support=scaffold"
  },
  {
    "item": "Q13397636",
    "label": "street furniture",
    "value": "Tag:support=street_furniture"
  },
  {
    "item": "Q42948",
    "label": "wall",
    "value": "Tag:support=wall"
  },
  {
    "item": "Q189259",
    "label": "asphalt concrete",
    "value": "Tag:surface=asphalt"
  },
  {
    "item": "Q2534206",
    "label": "concrete surface",
    "value": "Tag:surface=concrete"
  },
  {
    "item": "Q170449",
    "label": "mud",
    "value": "Tag:surface=mud"
  },
  {
    "item": "Q3328263",
    "label": "pavement",
    "value": "Tag:surface=paved"
  },
  {
    "item": "Q757022",
    "label": "sett",
    "value": "Tag:surface=sett"
  },
  {
    "item": "Q3179760",
    "label": "tarmac",
    "value": "Tag:surface=tarmac"
  },
  {
    "item": "P4238",
    "label": "webcam page URL",
    "value": "Tag:surveillance=webcam"
  },
  {
    "item": "Q256132",
    "label": "telephone exchange",
    "value": "Tag:telecom=exchange"
  },
  {
    "item": "Q54831",
    "label": "amphitheatre",
    "value": "Tag:theatre:type=amphi"
  },
  {
    "item": "Q675824",
    "label": "columbarium",
    "value": "Tag:tomb=columbarium"
  },
  {
    "item": "Q192619",
    "label": "crypt",
    "value": "Tag:tomb=crypt"
  },
  {
    "item": "Q665247",
    "label": "hypogeum",
    "value": "Tag:tomb=hypogeum"
  },
  {
    "item": "Q162875",
    "label": "mausoleum",
    "value": "Tag:tomb=mausoleum"
  },
  {
    "item": "Q12516",
    "label": "pyramid",
    "value": "Tag:tomb=pyramid"
  },
  {
    "item": "Q1404229",
    "label": "rock-cut tomb",
    "value": "Tag:tomb=rock-cut"
  },
  {
    "item": "Q48634",
    "label": "sarcophagus",
    "value": "Tag:tomb=sarcophagus"
  },
  {
    "item": "Q386037",
    "label": "Table tomb",
    "value": "Tag:tomb=table"
  },
  {
    "item": "Q34023",
    "label": "tumulus",
    "value": "Tag:tomb=tumulus"
  },
  {
    "item": "Q4998807",
    "label": "burial vault",
    "value": "Tag:tomb=vault"
  },
  {
    "item": "Q90717531",
    "label": "war grave",
    "value": "Tag:tomb=war_grave"
  },
  {
    "item": "Q1241568",
    "label": "military cemetery",
    "value": "Tag:tomb=war_grave"
  },
  {
    "item": "Q182676",
    "label": "mountain hut",
    "value": "Tag:tourism=alpine_hut"
  },
  {
    "item": "Q47520713",
    "label": "vacation apartment",
    "value": "Tag:tourism=apartment"
  },
  {
    "item": "Q336532",
    "label": "vacation rental",
    "value": "Tag:tourism=apartment"
  },
  {
    "item": "Q2281788",
    "label": "public aquarium",
    "value": "Tag:tourism=aquarium"
  },
  {
    "item": "Q838948",
    "label": "work of art",
    "value": "Tag:tourism=artwork"
  },
  {
    "item": "Q570116",
    "label": "tourist attraction",
    "value": "Tag:tourism=attraction"
  },
  {
    "item": "Q99586892",
    "label": "campsite",
    "value": "Tag:tourism=camp_pitch"
  },
  {
    "item": "Q832778",
    "label": "campsite",
    "value": "Tag:tourism=camp_site"
  },
  {
    "item": "Q1424620",
    "label": "motorhome stopover",
    "value": "Tag:tourism=caravan_site"
  },
  {
    "item": "Q1371789",
    "label": "holiday home",
    "value": "Tag:tourism=chalet"
  },
  {
    "item": "Q207694",
    "label": "art museum",
    "value": "Tag:tourism=gallery"
  },
  {
    "item": "Q2460422",
    "label": "guest house",
    "value": "Tag:tourism=guest_house"
  },
  {
    "item": "Q654772",
    "label": "hostel",
    "value": "Tag:tourism=hostel"
  },
  {
    "item": "Q27686",
    "label": "hotel",
    "value": "Tag:tourism=hotel"
  },
  {
    "item": "Q1587716",
    "label": "tourism office",
    "value": "Tag:tourism=information"
  },
  {
    "item": "Q216212",
    "label": "motel",
    "value": "Tag:tourism=motel"
  },
  {
    "item": "Q33506",
    "label": "museum",
    "value": "Tag:tourism=museum"
  },
  {
    "item": "Q47520603",
    "label": "picnic site",
    "value": "Tag:tourism=picnic_site"
  },
  {
    "item": "Q194195",
    "label": "amusement park",
    "value": "Tag:tourism=theme_park"
  },
  {
    "item": "Q6017969",
    "label": "scenic viewpoint",
    "value": "Tag:tourism=viewpoint"
  },
  {
    "item": "Q39425",
    "label": "bothy",
    "value": "Tag:tourism=wilderness_hut"
  },
  {
    "item": "Q22995",
    "label": "wine cellar",
    "value": "Tag:tourism=wine_cellar"
  },
  {
    "item": "Q49389",
    "label": "tourism",
    "value": "Tag:tourism=yes"
  },
  {
    "item": "Q43501",
    "label": "zoo",
    "value": "Tag:tourism=zoo"
  },
  {
    "item": "Q1087850",
    "label": "parabolic reflector",
    "value": "Tag:tower:construction=dish"
  },
  {
    "item": "Q12493",
    "label": "dome",
    "value": "Tag:tower:construction=dome"
  },
  {
    "item": "Q1440476",
    "label": "lattice tower",
    "value": "Tag:tower:construction=lattice"
  },
  {
    "item": "Q200334",
    "label": "bell tower",
    "value": "Tag:tower:type=bell_tower"
  },
  {
    "item": "Q996564",
    "label": "Bridge tower",
    "value": "Tag:tower:type=bridge"
  },
  {
    "item": "Q11166728",
    "label": "TV tower",
    "value": "Tag:tower:type=communication"
  },
  {
    "item": "Q1798641",
    "label": "communication tower",
    "value": "Tag:tower:type=communication"
  },
  {
    "item": "Q193886",
    "label": "cooling tower",
    "value": "Tag:tower:type=cooling"
  },
  {
    "item": "Q81917",
    "label": "fortified tower",
    "value": "Tag:tower:type=defensive"
  },
  {
    "item": "Q579772",
    "label": "diving platform",
    "value": "Tag:tower:type=diving"
  },
  {
    "item": "Q28861301",
    "label": "intake tower",
    "value": "Tag:tower:type=intake"
  },
  {
    "item": "Q699873",
    "label": "Q699873",
    "value": "Tag:tower:type=klockstapel"
  },
  {
    "item": "Q48356",
    "label": "minaret",
    "value": "Tag:tower:type=minaret"
  },
  {
    "item": "Q1440300",
    "label": "observation tower",
    "value": "Tag:tower:type=observation"
  },
  {
    "item": "Q1772282",
    "label": "radar tower",
    "value": "Tag:tower:type=radar"
  },
  {
    "item": "Q180987",
    "label": "stupa",
    "value": "Tag:tower:type=stupa"
  },
  {
    "item": "Q947103",
    "label": "watchtower",
    "value": "Tag:tower:type=watchtower"
  },
  {
    "item": "Q3278577",
    "label": "speed bump",
    "value": "Tag:traffic_calming=bump"
  },
  {
    "item": "Q74231",
    "label": "chicane",
    "value": "Tag:traffic_calming=chicane"
  },
  {
    "item": "Q1907989",
    "label": "distribution transformer",
    "value": "Tag:transformer=distribution"
  },
  {
    "item": "Q935908",
    "label": "dugout",
    "value": "Tag:trench=dugout"
  },
  {
    "item": "Q110701",
    "label": "overhead line",
    "value": "Tag:trolley_wire=yes"
  },
  {
    "item": "Q4168092",
    "label": "culvert",
    "value": "Tag:tunel=culvert"
  },
  {
    "item": "Q178512",
    "label": "public transport",
    "value": "Tag:type=public_transport"
  },
  {
    "item": "Q28136308",
    "label": "Turn restriction routing",
    "value": "Tag:type=restriction"
  },
  {
    "item": "Q4022",
    "label": "river",
    "value": "Tag:type=waterway"
  },
  {
    "item": "Q1267889",
    "label": "waterway",
    "value": "Tag:type=waterway"
  },
  {
    "item": "Q911379",
    "label": "spillway",
    "value": "Tag:usage=spillway"
  },
  {
    "item": "Q61960059",
    "label": "vegetarian restaurant",
    "value": "Tag:vegetarian=only"
  },
  {
    "item": "Q997921",
    "label": "book vending machine",
    "value": "Tag:vending=books"
  },
  {
    "item": "Q1572205",
    "label": "Reverse vending machine",
    "value": "Tag:vending=bottle_return"
  },
  {
    "item": "Q199329",
    "label": "cigarette machine",
    "value": "Tag:vending=cigarettes"
  },
  {
    "item": "Q1047284",
    "label": "condom machine",
    "value": "Tag:vending=condoms"
  },
  {
    "item": "Q16831578",
    "label": "drink vending machine",
    "value": "Tag:vending=drinks"
  },
  {
    "item": "Q2595247",
    "label": "bait machine",
    "value": "Tag:vending=fishing_bait"
  },
  {
    "item": "Q1524788",
    "label": "milk vending machine",
    "value": "Tag:vending=milk"
  },
  {
    "item": "Q187022",
    "label": "newspaper vending machine",
    "value": "Tag:vending=newspapers"
  },
  {
    "item": "Q2046594",
    "label": "parcel boxes",
    "value": "Tag:vending=parcel_mail_in"
  },
  {
    "item": "Q2046594",
    "label": "parcel boxes",
    "value": "Tag:vending=parcel_mail_in;parcel_pickup"
  },
  {
    "item": "Q2046594",
    "label": "parcel boxes",
    "value": "Tag:vending=parcel_pickup"
  },
  {
    "item": "Q2046594",
    "label": "parcel boxes",
    "value": "Tag:vending=parcel_pickup;parcel_mail_in"
  },
  {
    "item": "Q574511",
    "label": "Pay and display",
    "value": "Tag:vending=parking_tickets"
  },
  {
    "item": "Q657345",
    "label": "ticket machine",
    "value": "Tag:vending=public_transport_tickets"
  },
  {
    "item": "Q381222",
    "label": "stamp vending machine",
    "value": "Tag:vending=stamps"
  },
  {
    "item": "Q2295670",
    "label": "snack machine",
    "value": "Tag:vending=sweets"
  },
  {
    "item": "Q103821032",
    "label": "toll automat",
    "value": "Tag:vending=toll"
  },
  {
    "item": "Q1325302",
    "label": "dormant volcano",
    "value": "Tag:volcano:status=dormant"
  },
  {
    "item": "Q169358",
    "label": "stratovolcano",
    "value": "Tag:volcano:type=stratovolcano"
  },
  {
    "item": "Q1415234",
    "label": "15 kV, 16.7 Hz AC railway electrification",
    "value": "Tag:voltage=15000"
  },
  {
    "item": "Q601510",
    "label": "noise barrier",
    "value": "Tag:wall=noise_barrier"
  },
  {
    "item": "Q23397",
    "label": "lake",
    "value": "Tag:water=lake"
  },
  {
    "item": "Q3253281",
    "label": "pond",
    "value": "Tag:water=pond"
  },
  {
    "item": "Q131681",
    "label": "reservoir",
    "value": "Tag:water=reservoir"
  },
  {
    "item": "Q190928",
    "label": "shipyard",
    "value": "Tag:waterway=boatyard"
  },
  {
    "item": "Q12284",
    "label": "canal",
    "value": "Tag:waterway=canal"
  },
  {
    "item": "Q12323",
    "label": "dam",
    "value": "Tag:waterway=dam"
  },
  {
    "item": "Q2048319",
    "label": "ditch",
    "value": "Tag:waterway=ditch"
  },
  {
    "item": "Q124282",
    "label": "dock",
    "value": "Tag:waterway=dock"
  },
  {
    "item": "Q606619",
    "label": "fish ladder",
    "value": "Tag:waterway=fish_pass"
  },
  {
    "item": "Q42792757",
    "label": "lock gate",
    "value": "Tag:waterway=lock_gate"
  },
  {
    "item": "Q3434106",
    "label": "river mile",
    "value": "Tag:waterway=milestone"
  },
  {
    "item": "Q4022",
    "label": "river",
    "value": "Tag:waterway=river"
  },
  {
    "item": "Q47521",
    "label": "stream",
    "value": "Tag:waterway=stream"
  },
  {
    "item": "Q63565252",
    "label": "brook",
    "value": "Tag:waterway=stream"
  },
  {
    "item": "Q187971",
    "label": "wadi",
    "value": "Tag:waterway=wadi"
  },
  {
    "item": "Q34038",
    "label": "waterfall",
    "value": "Tag:waterway=waterfall"
  },
  {
    "item": "Q1066997",
    "label": "weir",
    "value": "Tag:waterway=weir"
  },
  {
    "item": "Q30198",
    "label": "marsh",
    "value": "Tag:wetland=marsh"
  },
  {
    "item": "Q166735",
    "label": "swamp",
    "value": "Tag:wetland=swamp"
  },
  {
    "item": "Q31796",
    "label": "mudflat",
    "value": "Tag:wetland=tidalflat"
  },
  {
    "item": "Q24192069",
    "label": "wheelchair inaccessible",
    "value": "Tag:wheelchair=no"
  },
  {
    "item": "Q24192067",
    "label": "wheelchair accessible",
    "value": "Tag:wheelchair=yes"
  },
  {
    "item": "Q5640773",
    "label": "wholesale market",
    "value": "Tag:wholesale=supermarket"
  },
  {
    "item": "Q1363025",
    "label": "aviary",
    "value": "Tag:zoo=aviary"
  },
  {
    "item": "Q1995305",
    "label": "bird park",
    "value": "Tag:zoo=birds"
  },
  {
    "item": "Q11946202",
    "label": "butterfly",
    "value": "Tag:zoo=butterfly"
  },
  {
    "item": "Q129211",
    "label": "cage",
    "value": "Tag:zoo=enclosure"
  },
  {
    "item": "Q1169958",
    "label": "Falconry display",
    "value": "Tag:zoo=falconry"
  },
  {
    "item": "Q459886",
    "label": "petting zoo",
    "value": "Tag:zoo=petting_zoo"
  },
  {
    "item": "Q10811",
    "label": "Reptilia",
    "value": "Tag:zoo=reptile"
  },
  {
    "item": "Q642682",
    "label": "safari park",
    "value": "Tag:zoo=safari_park"
  },
  {
    "item": "Q1711697",
    "label": "wildlife park",
    "value": "Tag:zoo=wildlife_park"
  },
  {
    "item": "Q53001749",
    "label": "subject of depiction",
    "value": "gpl"
  },
  {
    "item": "Q98806710",
    "label": "Q98806710",
    "value": "name=Waldmops"
  },
  {
    "item": "Q6468983",
    "label": "lactation room",
    "value": "t1815745428"
  }
]
