const dotest = require ('dotest');
const app = require ('./');

// Setup
// $ EUROPEANA_KEY=abc123 npm test
const apikey = process.env.EUROPEANA_APIKEY || null;
const timeout = process.env.EUROPEANA_TIMEOUT || 5000;

const europeana = app (apikey, timeout);


dotest.add ('Module', test => {
  test()
    .isFunction ('fail', 'exports', app)
    .isFunction ('fail', 'module', europeana)
    .done();
});


dotest.add ('search', test => {
  const props = {
    query: 'who:"laurent de la hyre"'
  };

  europeana ('search', props, (err, data) => {
    test (err)
      .isObject ('fail', 'data', data)
      .isNotEmpty ('fail', 'data', data)
      .isExactly ('fail', 'data.success', data && data.success, true)
      .isArray ('fail', 'data.items', data && data.items)
      .isNotEmpty ('warn', 'data.items', data && data.items)
      .done();
  });
});


dotest.add ('record', test => {
  const record = '9200365/BibliographicResource_1000055039444';
  const props = {
    profile: 'params'
  };

  europeana ('record/' + record, props, (err, data) => {
    test (err)
      .isObject ('fail', 'data', data)
      .isNotEmpty ('fail', 'data', data)
      .isExactly ('fail', 'data.success', data && data.success, true)
      .isObject ('fail', 'data.object', data && data.object)
      .isNotEmpty ('warn', 'data.object', data && data.object)
      .done();
  });
});


dotest.add ('translateQuery', test => {
  const props = {
    languageCodes: 'nl,en,hu',
    term: 'painting'
  };

  europeana ('translateQuery', props, (err, data) => {
    test (err)
      .isObject ('fail', 'data', data)
      .isNotEmpty ('fail', 'data', data)
      .isExactly ('fail', 'data.success', data && data.success, true)
      .isArray ('warn', 'data.translations', data && data.translations)
      .done();
  });
});


dotest.add ('providers normal', test => {
  europeana ('providers', (err, data) => {
    test (err)
      .isObject ('fail', 'data', data)
      .isNotEmpty ('fail', 'data', data)
      .isExactly ('fail', 'data.success', data && data.success, true)
      .isArray ('warn', 'data.items', data && data.items)
      .done();
  });
});


dotest.add ('providers params', test => {
  const params = {
    pagesize: 3
  };

  europeana ('providers', params, (err, data) => {
    const items = data && data.items;

    test (err)
      .isObject ('fail', 'data', data)
      .isNotEmpty ('fail', 'data', data)
      .isExactly ('fail', 'data.success', data && data.success, true)
      .isArray ('fail', 'data.items', items)
      .isExactly ('warn', 'data.items.length', items && items.length, 3)
      .done();
  });
});


dotest.add ('Error: API error', test => {
  europeana ('record/-', (err, data) => {
    test()
      .isError ('fail', 'err', err)
      .isExactly ('fail', 'err.message', err && err.message, 'API error')
      .isNumber ('fail', 'err.code', err && err.code)
      .isString ('fail', 'err.error', err && err.error)
      .isUndefined ('fail', 'data', data)
      .done();
  });
});


dotest.add ('Error: request failed', test => {
  const tmp = app (apikey, 1);

  tmp ('providers', (err, data) => {
    test()
      .isError ('fail', 'err', err)
      .isExactly ('fail', 'err.message', err && err.message, 'request failed')
      .isError ('fail', 'err.error', err && err.error)
      .isUndefined ('fail', 'data', data)
      .done();
  });
});


dotest.add ('Error: apikey missing', test => {
  const tmp = app();

  tmp ('providers', (err, data) => {
    test()
      .isError ('fail', 'err', err)
      .isExactly ('fail', 'err.message', err && err.message, 'apikey missing')
      .isUndefined ('fail', 'data', data)
      .done();
  });
});


/*
// Suggestions is unavailable
// http://labs.europeana.eu/api/suggestions
dotest.add ('suggestions', test => {
  const props = {
    query: 'laurent de la hyre',
    rows: 10
  };

  app ('suggestions', props, (err, data) => {
    test (err)
      .isObject ('fail', 'data', data)
      .done();
  });
});
*/

// Start the tests
dotest.run();
