europeana
=========

Unofficial Node.js module for the Europeana API. Search and lookup art in various archives across Europe.

[![npm](https://img.shields.io/npm/v/europeana.svg?maxAge=3600)](https://github.com/fvdm/nodejs-europeana/blob/master/CHANGELOG.md)
[![Build Status](https://travis-ci.org/fvdm/nodejs-europeana.svg?branch=master)](https://travis-ci.org/fvdm/nodejs-europeana)
[![Coverage Status](https://coveralls.io/repos/github/fvdm/nodejs-europeana/badge.svg?branch=master)](https://coveralls.io/github/fvdm/nodejs-europeana?branch=master)
[![bitHound Dependencies](https://www.bithound.io/github/fvdm/nodejs-europeana/badges/dependencies.svg)](https://www.bithound.io/github/fvdm/nodejs-europeana/develop/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/fvdm/nodejs-europeana/badges/code.svg)](https://www.bithound.io/github/fvdm/nodejs-europeana)
[![Greenkeeper badge](https://badges.greenkeeper.io/fvdm/nodejs-europeana.svg)](https://greenkeeper.io/)

* [Europeana](http://europeana.eu/)
* [API documentation](http://labs.europeana.eu/api)


Example
-------

```js
var europeana = require ('europeana') ('abc123');

// Search
var params = {
  query: 'et in arcadia ego',
  rows: 5
};

europeana ('search', params, console.log);


// Record
var recordId = '/08501/03F4577D418DC84979C4E2EE36F99FECED4C7B11';

europeana ('record' + recordId, console.log);
```


Installation
------------

`npm install europeana`


Configuration
-------------

You _must_ specify an API key which you can request **[here](http://labs.europeana.eu/api/registration)**

param   | type   | required | default | description
:-------|:-------|:---------|:--------|:----------------------
apikey  | string | yes      |         | Your API key. Do not use your private key.
timeout | number | no       | 5000    | Request time out in ms


#### Example

```js
var apikey = 'abc123';
var timeout = 3000;

var europeana = require ('europeana') (apikey, timeout);
```


Callback
--------

Each method requires a callback _function_ to receive the results.

It receives two parameters: `err` and `data`.

property | type   | default | description
:--------|:-------|:--------|:-----------------------------
err      | Error  | null    | Includes `.code` and `.error`
data     | Object |         | Result object


#### Example

```js
function myCallback (err, data) {
  var set = {
    depth: null,
    colors: true
  };

  if (err) {
    console.dir (err, set);
    return;
  }

  console.dir (data, set);
}

// Search
europeana ('search', { query: 'vincent van gogh' }, myCallback);
```


#### Errors

message          | description                  | additional
:----------------|:-----------------------------|:-----------------------
apikey missing   | You did not set your API key |
request failed   | The request failed           | `err.error`
invalid response | API returned invalid data    |
API error        | API returned an error        | `err.error`, `err.code`


Unlicense
---------

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>


Author
------

[Franklin van de Meent](https://frankl.in)

[![Buy me a coffee](https://frankl.in/u/kofi/kofi-readme.png)](https://ko-fi.com/franklin)
