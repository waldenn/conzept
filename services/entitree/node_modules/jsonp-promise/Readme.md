# jsonp-promise
A simple JSONP es6 implementation (inspired from `https://github.com/webmodules/jsonp`) which returns an object containing a promise, so it can be used by generators and async functions.

It's supposed to be used with an es6 module loader. Works great with jspm/systemjs for cross-browser compatibility.

## Instalation
Install for node.js, browserify or jspm using `npm`:

```bash
$ npm install jsonp-promise
```
or
```bash
$ jspm install npm:jsonp-promise
```

## API

###jsonp(url, options)

- `url` (`String`) url to fetch
- `options` (`Object`), optional
  - `param` (`String`) name of the query string parameter to specify
    the callback (defaults to `callback`)
  - `timeout` (`Number`) how long after the request until a timeout error
    is emitted. `0` to disable (defaults to `15000`)
  - `prefix` (`String`) prefix for the global callback functions that
    handle jsonp responses (defaults to `__jp`)

Returns an object containing two properties:
- `promise` a promise which will be resolved if the jsonp request succeeds,
    otherwise will be rejected
- `cancel` a method which will cancel the request and reject the promise

If it times out or gets canceled, the promise will be rejected with an `Error` object.

```javascript
// e.g.: get the latest javascript subrredits
async function getJson() {
    let data = await jsonp('http://www.reddit.com/r/javascript/top.json', {param: 'jsonp'}).promise;
    console.log(data.data.children);
}
```

## License

MIT
