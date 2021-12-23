const endpoint = 'https://' + window.getParameterByName('l') + '.wikipedia.org/w/api.php';

const domParser = new DOMParser();

function queryApi(query) {
  const url = new URL(endpoint);
  const params = { format: 'json', origin: '*', ...query };
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  //console.log( url );
  return fetch(url).then(response => response.json());
}

/**
Get the title of a page from a URL quickly, but inaccurately (no redirects)
TODO: rename this and getPageName to be clearer
*/
const getPageTitle = url => url.split('/').filter(el => el).pop();

/**
Get the name of a Wikipedia page accurately by following redirects (slow)
*/
function getPageName(page) {
  return queryApi({ action: 'query', titles: page, redirects: 1 })
    .then(res => Object.values(res.query.pages)[0].title);
}

/**
Decide whether the name of a wikipedia page is an article, or belongs to another namespace.
See https://en.wikipedia.org/wiki/Wikipedia:Namespace
*/
// Pages outside of main namespace have colons in the middle, e.g. 'WP:UA'
// Remove any trailing colons and return true if the result still contains a colon
const isArticle = name => !(name.endsWith(':') ? name.slice(0, -1) : name).includes(':');


// --- MAIN FUNCTIONS ---

/**
Get a DOM object for the HTML of a Wikipedia page.
*/
function getPageHtml(pageName) {
  //return queryApi({ action: 'parse', page: pageName, prop: 'text', section: 0, redirects: 1 })
  return queryApi({ action: 'parse', page: pageName, prop: 'text', redirects: 1 })
    .then(res => res.parse.text['*']);
    //.then(res => domParser.parseFromString(res.parse.text['*'], 'text/html'));
}

/**
Get a DOM object for the first body paragraph in page HTML.
@param {HtmlElement} element - An HTML element as returned by `getPageHtml`
*/
function getFirstParagraph ( element ){
  // First paragraph that isn't marked as "empty"...
  r = Array.from(element.querySelectorAll('p:not(.mw-empty-elt)')).find(p => !p.querySelector('#coordinates'))
  //console.log( r );

  //s = Array.from(element.querySelectorAll('div'))[0];
  //console.log( s );

  //console.log( element);
  //return [ element.body.innerHTML ];

  //return s;
  return r;
}

/**
Get the name of each Wikipedia article linked.
@param {HtmlElement} element - An HTML element as returned by `getFirstParagraph`
*/
function getWikiLinks(html) {

  var element = '';

  var results;

  //console.log( 'html: ', html );

  var doc = $(html);
  var links = [];

  //console.log( doc );

  $('p a, li a', doc).each( function( key, value ) {

    // skip links in tables
    if ( $(this).parents().is('table') ){
      return 0;
    }

    value = $(this).attr('href') || '';

    // skip redirect-links
    if ( $(this).hasClass('mw-redirect')){
      return 0;
    }

    if ( value.startsWith('/wiki/') ){

      // TODO: how to handle these exceptions in all languages?
      // (note: this is also needed for the conzept browser-extension!)
      if (  value.startsWith('/wiki/Special:') ||
            value.startsWith('/wiki/Template:') ||
            value.startsWith('/wiki/Template_talk:') ||
            value.startsWith('/wiki/File:') ||
            value.startsWith('/wiki/File_talk:') ||
            value.startsWith('/wiki/Help:') ||
            value.startsWith('/wiki/Help_talk:') ||
            value.startsWith('/wiki/Wikipedia:') ||
            value.startsWith('/wiki/Wikipedia_talk:') ||
            value.startsWith('/wiki/User:') ||
            value.startsWith('/wiki/User_talk:') ||

            // special cases for this link tool
            //value.startsWith('/wiki/Category:') ||
            value.includes('(identifier)')
        ){

        // do nothing

      }
      else {

        //console.log( value );

        value = value.split('/').filter(el => el).pop(); // page title
        value = value.split('#')[0]; // remove anchor from link
        value = value.replace(/_/g, ' ');

        links.push( value );
      }

    }


  })

  links = links.filter((n, i, self) => self.indexOf(n) === i)
            .filter((i, index) => (index < 18 )) // only use the first X number of links

  //links = links.filter(isArticle).filter((n, i, self) => self.indexOf(n) === i); // Remove duplicates
  //console.log(links);

  /*
  results = links.filter( link => link.startsWith('/wiki/') ) // Only links to Wikipedia articles
    .map(getPageTitle) // Get the title
    .map(link => link.split('#')[0]) // Eliminate anchor links
    .filter(isArticle) // Make sure it's an article and not a part of another namespace
    .map(link => link.replace(/_/g, ' ')) // Replace underscores with spaces for more readable names
    .filter((i, index) => (index < 50 )) // only use the first X number of links
    .filter((n, i, self) => self.indexOf(n) === i); // Remove duplicates
  */


  /*
  if ( Array.from(element.querySelectorAll('a').length < 0 ) ){

    console.log('using DOM query 2');
    element = Array.from(element.querySelectorAll('p')).find(p => !p.querySelector('#coordinates'))
  }
  */

  /*
  results = Array.from(element.querySelectorAll('a'))
    .map(link => link.getAttribute('href'))
    .filter(link => link.startsWith('/wiki/')) // Only links to Wikipedia articles
    .map(getPageTitle) // Get the title
    .map(link => link.split('#')[0]) // Eliminate anchor links
    .filter(isArticle) // Make sure it's an article and not a part of another namespace
    .map(link => link.replace(/_/g, ' ')) // Replace underscores with spaces for more readable names
    .filter((i, index) => (index < 50 )) // only use the first X number of links
    .filter((n, i, self) => self.indexOf(n) === i); // Remove duplicates
  */

  //console.log( results );

  return links;
}


function getSubPages(pageName) {
  return getPageHtml(pageName)
    //.then(getFirstParagraph)
    .then(getWikiLinks);
}

/**
Get the name of a random Wikipedia article
*/
function getRandomArticle() {
  return queryApi({
    action: 'query',
    list: 'random',
    rnlimit: 1,
    rnnamespace: 0, // Limits results to articles
  }).then(res => res.query.random[0].title);
}

/**
Get completion suggestions for a query
*/
function getSuggestions(search) {
  return queryApi({
    action: 'opensearch',
    search,
    limit: 10,
    namespace: 0, // Limits results to articles
  })
    .then(res => res[1]);
}
