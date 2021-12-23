/*!
 * AllOrigins
 * written by Gabriel Nunes <gabriel@multiverso.me>
 * http://github.com/gnuns
 */
const express = require('express')

const { version } = require('./package.json')
// yep, global. it's ok
// https://softwareengineering.stackexchange.com/a/47926/289420
global.AO_VERSION = version

const processRequest = require('./app/process-request')

function enableCORS(req, res, next) {

  const whitelist = process.env.CONZEPT_CORS_PROXY_WHITELIST.split(',') || [];

  console.log( whitelist );

  //const whitelist = [ 'upload.wikimedia.org', 'commons.wikimedia.org', 'commons.m.wikimedia.org', 'maps.wikimedia.org' ];

  //  check if the req.url domain is in the whitelist
  const check = whitelist.filter(s => req.url.trim().startsWith( '?url=https://' + s));

  if ( check.length > 0 ){ // request not allowed

    res.status(403);
    res.render();

  }
  else { // request is allowed

    res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
    res.header('Access-Control-Allow-Credentials', true)
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Content-Encoding, Accept'
    )
    res.header(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PATCH, PUT, DELETE'
    )
    res.header('Via', `allOrigins v${version}`)

  }

  next()

}

module.exports = (function app() {
  const app = express()

  app.set('case sensitive routing', false)
  app.set('jsonp callback name', 'callback')
  app.disable('x-powered-by')
  app.enable("trust proxy")
  app.use(enableCORS)

  app.all('/:format(get|raw|json|info)', processRequest)

  return app
})()
