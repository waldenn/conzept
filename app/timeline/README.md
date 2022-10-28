# winkNLP Timeline

[![built with winkNLP](https://img.shields.io/badge/built%20with-winkNLP-blueviolet)](https://github.com/winkjs/wink-nlp) [![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/winkjs/Lobby) [![Follow on Twitter](https://img.shields.io/twitter/follow/winkjs_org?style=social)](https://twitter.com/winkjs_org)

## Wikipedia Article to Timeline

[<img align="right" src="https://decisively.github.io/wink-logos/logo-title.png" width="100px" >](https://winkjs.org/)

This demo takes an article from English Wikipedia and converts it into a timeline. It does this by using the [entity recognition](https://winkjs.org/wink-nlp/entities.html) in [winkNLP](https://github.com/winkjs/wink-nlp). For all the `DATE`s that it finds it looks for the [shapes](https://winkjs.org/wink-nlp/its-as-helper.html) that can be understood by the JavaScript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime) object.

### How to build this
[<img align="right" src="https://user-images.githubusercontent.com/9491/100735262-f2002800-33f6-11eb-97a6-4a8fe6ee77ff.png" width="220px" >](https://winkjs.org/showcase-timeline/)

```javascript
const winkNLP = require('wink-nlp');
const its = require( 'wink-nlp/src/its.js' );
const as = require( 'wink-nlp/src/as.js' );
const model = require('wink-eng-lite-model');
const nlp = winkNLP(model);

var text = "She was born in 1869. She died in 1940."

var doc = nlp.readDoc(text);
var timeline = [];
doc
  .entities()
  .filter((e) => {
    var shapes = e.tokens().out(its.shape);
    // We only want dates that can be converted to an actual
    // time using new Date()
    return (
      e.out(its.type) === 'DATE' &&
      (
        shapes[0] === 'dddd' ||
        ( shapes[0] === 'Xxxxx' && shapes[1] === 'dddd' ) ||
        ( shapes[0] === 'Xxxx' && shapes[1] === 'dddd' ) ||
        ( shapes[0] === 'dd' && shapes[1] === 'Xxxxx' && shapes[2] === 'dddd' ) ||
        ( shapes[0] === 'dd' && shapes[1] === 'Xxxx' && shapes[2] === 'dddd' ) ||
        ( shapes[0] === 'd' && shapes[1] === 'Xxxxx' && shapes[2] === 'dddd' ) ||
        ( shapes[0] === 'd' && shapes[1] === 'Xxxx' && shapes[2] === 'dddd' )
      )
    );
  })
  .each((e) => {
    e.markup();
    timeline.push({
      date: e.out(),
      unixTime: new Date(e.out()).getTime() / 1000,
      sentence: e.parentSentence().out(its.markedUpText)
    })
  });

timeline.sort((a, b) => {
  return a.unixTime - b.unixTime;
})

console.log(timeline);
```
