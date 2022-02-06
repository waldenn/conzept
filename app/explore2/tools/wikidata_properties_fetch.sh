#!/bin/sh

# Fetch the JSON file of all Wikidata properties

# output file
file='wikidata_properties.json'

wget -U 'Firefox 77' -O $file 'https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20%3Fproperty%20%3FpropertyType%20%3FpropertyLabel%20%3FpropertyDescription%20%3FpropertyAltLabel%20%3FformatterURL%20WHERE%20%7B%0A%20%20%3Fproperty%20wikibase%3ApropertyType%20%3FpropertyType.%0A%20%20OPTIONAL%20%7B%20%3Fproperty%20wdt%3AP1630%20%3FformatterURL.%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%7D%0A%7D%0AORDER%20BY%20(xsd%3Ainteger(STRAFTER(STR(%3Fproperty)%2C%20%22P%22)))'
