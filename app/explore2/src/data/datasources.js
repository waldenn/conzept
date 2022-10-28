const datasources = {

  'wikipedia': {
    active:                 true,
    name:                   'Wikipedia',
    protocol:               'rest',
    endpoint:               'wikipedia.org/w/api.php',
    format:                 'json',
    connect:                'jsonp',
    pagesize:               5,
    filter:                 '0|14', // Wikipedia-API specific: list of Wikipedia namespaces
    url:                    'https://${explore.language}.${datasources.wikipedia.endpoint}?action=query&format=${datasources.wikipedia.format}&srsearch=${explore.q}&srnamespace=${datasources.wikipedia.filter}&srlimit=${datasources.wikipedia.pagesize}&list=search&continue=-||&sroffset=${ (explore.page -1) * datasources.wikipedia.pagesize}',
    icon:                   '<i class="fa-brands fa-wikipedia-w"></i>',
    autocomplete_active:    true, // FIXME: no de-activation support yet
    autocomplete_protocol:  'opensearch',
    autocomplete_url:       'https://${explore.language}.wikipedia.org/w/api.php?action=${datasources.wikipedia.autocomplete_protocol}&format=${datasources.wikipedia.autocomplete_format}&search=${term}&namespace=${datasources.wikipedia.autocomplete_filter}&limit=${datasources.wikipedia.autocomplete_limit}&profile=${datasources.wikipedia.autocomplete_mode}',
    autocomplete_format:    'json',
    autocomplete_connect:   'jsonp',
    autocomplete_limit:     7,
    autocomplete_filter:    '0|14', // Wikipedia-API specific: list of Wikipedia namespaces
    autocomplete_mode:      'fuzzy',
  },

  'wikidata': {
    active:                 true,
    name:                   'Wikidata',
    protocol:               'sparql',
    endpoint:               'https://query.wikidata.org/sparql',
    format:                 'json',
    connect:                'json',
    pagesize:               5, // NOTE: sync this value with "structured query builder"!
    filter:                 '',
    count_url:              '${datasources.wikidata.endpoint}?format=${datasources.wikidata.format}&query=SELECT (COUNT(*) AS ?count) WHERE { hint:Query hint:optimizer "None".  VALUES ?searchTerm { "${explore.q.replace(/"/g, "") }" } SERVICE wikibase:mwapi { bd:serviceParam wikibase:api "EntitySearch".  bd:serviceParam wikibase:endpoint "www.wikidata.org".  bd:serviceParam mwapi:search ?searchTerm.  bd:serviceParam mwapi:language "${explore.language}".  ?item wikibase:apiOutputItem mwapi:item.  } FILTER NOT EXISTS { ?article schema:about ?item; schema:isPartOf <https://${explore.language}.wikipedia.org/>. } SERVICE wikibase:label { bd:serviceParam wikibase:language "${explore.language}". } }',
    url:                    '${datasources.wikidata.endpoint}?format=${datasources.wikidata.format}&query=SELECT DISTINCT ?item ?itemLabel WHERE { hint:Query hint:optimizer "None".  VALUES ?searchTerm { "${explore.q.replace(/"/g, "") }" } SERVICE wikibase:mwapi { bd:serviceParam wikibase:api "EntitySearch".  bd:serviceParam wikibase:endpoint "www.wikidata.org".  bd:serviceParam mwapi:search ?searchTerm.  bd:serviceParam mwapi:language "${explore.language}".  ?item wikibase:apiOutputItem mwapi:item.  } FILTER NOT EXISTS { ?article schema:about ?item; schema:isPartOf <https://${explore.language}.wikipedia.org/>. } SERVICE wikibase:label { bd:serviceParam wikibase:language "${explore.language}". } } OFFSET ${ (explore.page -1) * datasources.wikidata.pagesize } LIMIT ${datasources.wikidata.pagesize}',
    icon:                   '<img class="datasource-icon" src="/assets/icons/wikidata.png"></img>',
    instance:               'https://www.wikidata.org',             // Wikibase specific
    instance_api:           'https://www.wikidata.org/w/api.php',   // Wikibase specific
    autocomplete_active:    true, // FIXME: no de-activation support yet
    autocomplete_protocol:  'sparql',
    autocomplete_url:       '${datasources.wikidata.endpoint}?format=${datasources.wikidata.autocomplete_format}&query=SELECT DISTINCT ?item ?itemLabel { hint:Query hint:optimizer "None".  VALUES ?searchTerm { "${term.replace(/"/g, "") }" } SERVICE wikibase:mwapi { bd:serviceParam wikibase:api "EntitySearch".  bd:serviceParam wikibase:endpoint "www.wikidata.org".  bd:serviceParam wikibase:limit ${datasources.wikidata.autocomplete_limit} .  bd:serviceParam mwapi:search ?searchTerm.  bd:serviceParam mwapi:language "${explore.language}".  ?item wikibase:apiOutputItem mwapi:item. ?num wikibase:apiOrdinal true.  } ?item (wdt:P279|wdt:P31) ?type.  FILTER NOT EXISTS { ?article schema:about ?item; schema:isPartOf <https://${explore.language}.wikipedia.org/>. } SERVICE wikibase:label { bd:serviceParam wikibase:language "${explore.language}". } } ORDER BY ?searchTerm ?num',
    autocomplete_format:    'json',
    autocomplete_connect:   'json',
    autocomplete_limit:     5,
    autocomplete_mode:      '',
  },

};
