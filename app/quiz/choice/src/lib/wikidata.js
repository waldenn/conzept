// Generated with https://query.wikidata.org/
// (some bits were adapted)

class SPARQLQueryDispatcher {
  constructor( endpoint ) {
    this.endpoint = endpoint;
  }

  query( sparqlQuery ) {
    const fullUrl = this.endpoint
      + '?query=' + encodeURIComponent( sparqlQuery )
      + '&ts=' + Date.now(); // cache-busting;
    const headers = { 'Accept': 'application/sparql-results+json' };
    return fetch( fullUrl, { headers } ).then( body => body.json() );
  }
}

const l   = window.getParameterByName('l') || 'en';
const p1  = window.getParameterByName('p1');
//const p2  = window.getParameterByName('p2');

const endpointUrl = 'https://query.wikidata.org/sparql';

// TODO: provide an option to switch Query-class: painters, architects, sculptors, taxon-groups, ...

const paintersQuery = `SELECT ?painter ?painterLabel ?painting ?paintingLabel ?image WITH {
  SELECT ?painter ?painting ?image WHERE {
    ?painting wdt:P18 ?image .
    ?painting wdt:P31 wd:Q3305213 . # instance of (P31) painting (Q3305213)
    ?painting wdt:P170 ?painter .   # created by (P170)
    ?painter wdt:P106 wd:Q1028181 . # give me all people with occupation (P106) painter (Q1028181)
    ?painter wdt:P135 wd:${p1} .   # who belonged to the this requested movement (P135)
    BIND(MD5(CONCAT(str(?painting),str(RAND()))) as ?random)
  }
  ORDER BY ?random
  LIMIT 5
} AS %results WHERE {
  INCLUDE %results.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${l},en,fr,es,de,pt,nl". }
}`;

const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );

export { queryDispatcher, paintersQuery };
