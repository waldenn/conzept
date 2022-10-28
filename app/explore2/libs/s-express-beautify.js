// https://github.com/fwg/s-expression
// The MIT License (MIT)

// Copyright (c) 2013, 2014 Friedemann Altrock and contributors (see package.json)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.            
'use strict';

function SParser(stream){
  this._line = this._col = this._pos = 0;
  this._stream = stream;
}

SParser.not_whitespace_or_end = /^(\S|$)/;
SParser.space_quote_paren_escaped_or_end = /^(\s|\\|"|'|`|,|\(|\)|$)/;
SParser.string_or_escaped_or_end = /^(\\|"|$)/;
SParser.string_delimiters = /["]/;
SParser.quotes = /['`,]/;
SParser.quotes_map = {
  '\'': '\'',
  //'`':  'quasiquote',
  //',':  'unquote'
};

SParser.prototype = {
  peek: peek,
  consume: consume,
  until: until,
  error: error,
  string: string,
  atom: atom,
  quoted: quoted,
  expr: expr,
  list: list
};

var sexpressionParser = function SParse(stream) {

  var parser = new SParse.Parser(stream);
  var expression = parser.expr();

  if (expression instanceof Error) {
      return expression;
  }

  // if anything is left to parse, it's a syntax error
  if (parser.peek() != '') {
      return parser.error('Superfluous characters after expression: `' + parser.peek() + '`');
  }

  return expression;
};

sexpressionParser.Parser = SParser;
sexpressionParser.SyntaxError = Error;

function error(msg) {
  var e = new Error('Syntax error: ' + msg);
  e.line = this._line + 1;
  e.col  = this._col + 1;
  return e;
}

function peek() {
  if (this._stream.length == this._pos) return '';
  return this._stream[this._pos];
}

function consume() {
  if (this._stream.length == this._pos) return '';

  var c = this._stream[this._pos];
  this._pos += 1;

  if (c == '\r') {
      if (this.peek() == '\n') {
          this._pos += 1;
          c += '\n';
      }
      this._line++;
      this._col = 0;
  } else if (c == '\n') {
      this._line++;
      this._col = 0;
  } else {
      this._col++;
  }

  return c;
}

function until(regex) {
  var s = '';

  while (!regex.test(this.peek())) {
      s += this.consume();
  }

  return s;
}

function string() {
  // consume "
  var delimiter = this.consume();

  var str = '';

  while (true) {
      str += this.until(SParser.string_or_escaped_or_end);
      var next = this.peek();

      if (next == '') {
          return this.error('Unterminated string literal');
      }

      if (next == delimiter) {
          this.consume();
          break;
      }

      if (next == '\\') {
          this.consume();
          next = this.peek();

          if (next == 'r') {
              this.consume();
              str += '\r';
          } else if (next == 't') {
              this.consume();
              str += '\t';
          } else if (next == 'n') {
              this.consume();
              str += '\n';
          } else if (next == 'f') {
              this.consume();
              str += '\f';
          } else if (next == 'b') {
              this.consume();
              str += '\b';
          } else {
              str += this.consume();
          }

          continue;
      }

      str += this.consume();
  }

  // wrap in object to make strings distinct from symbols
  return new String(str);
}

function atom() {
  if (SParser.string_delimiters.test(this.peek())) {
      return this.string();
  }

  var atom = '';

  while (true) {
      atom += this.until(SParser.space_quote_paren_escaped_or_end);
      var next = this.peek();

      if (next == '\\') {
          this.consume();
          atom += this.consume();
          continue;
      }

      break;
  }

  return atom;
}

function quoted() {
  var q = this.consume();
  var quote = SParser.quotes_map[q];

  if (quote == "unquote" && this.peek() == "@") {
      this.consume();
      quote = "unquote-splicing";
      q = ',@';
  }

  // ignore whitespace
  this.until(SParser.not_whitespace_or_end);
  var quotedExpr = this.expr();

  if (quotedExpr instanceof Error) {
      return quotedExpr;
  }

  // nothing came after '
  if (quotedExpr === '') {
      return this.error('Unexpected `' + this.peek() + '` after `' + q + '`');
  }

  return [quote, quotedExpr];
}

function expr(){
  // ignore whitespace
  this.until(SParser.not_whitespace_or_end);

  if (SParser.quotes.test(this.peek())) {
      return this.quoted();
  }

  var expr = this.peek() == '(' ? this.list() : this.atom();

  // ignore whitespace
  this.until(SParser.not_whitespace_or_end);

  return expr;
}

function list(){
  if (this.peek() != '(') {
      return this.error('Expected `(` - saw `' + this.peek() + '` instead.');
  }

  this.consume();

  var ls = [];
  var v = this.expr();

  if (v instanceof Error) {
      return v;
  }

  if (v !== '') {
      ls.push(v);

      while ((v = this.expr()) !== '') {
          if (v instanceof Error) return v;
          ls.push(v);
      }
  }

  if (this.peek() != ')') {
      return this.error('Expected `)` - saw: `' + this.peek() + '`');
  }

  // consume that closing paren
  this.consume();

  return ls;
}

function indent_recurse_tree(tree, current_indent, indent=2){
  let endl = "\n";
  let result = "";
  if (Array.isArray(tree))
  {
      result += current_indent + "(" + endl;
      let next_indent = current_indent + indent;
      for(let i=0; i<tree.length; ++i)
      {
          result += indent_recurse_tree(tree[i], next_indent, indent);
      }
      result += current_indent + ")" + endl;
  }
  else if (typeof(tree) == "string")
  {
      // some atom or number
      result += current_indent + tree + endl;
  }
  else 
  {
      // a string with "
      result += current_indent + '"' + tree + '"' + endl;
  }
  return result;
}

function indent_sexpr(sexpr, indent="    "){
  let tree = sexpressionParser(sexpr);
  let result = indent_recurse_tree(tree, "", indent);
  return result;
}

function indentS( code ){

  let indentation = "";
  let indent_length = 2;

  for (let i = 0; i < indent_length; ++i) indentation += " ";

  return indent_sexpr( code, indentation);
}

function minify_recurse_tree(tree){

  let result = "";

  if (Array.isArray(tree)){
      result += "(";
      for(let i=0; i<tree.length; ++i)
      {
          if (i > 0)
          {
              result += " ";
          }
          result += minify_recurse_tree(tree[i]);
      }
      result += ")";
  }
  else if (typeof(tree) == "string"){
      // some atom or number
      result += tree;
  }
  else 
  {
      // a string with "
      result += '"' + tree + '"';
  }
  return result;
}

function minify_sexpr(sexpr) {
  let tree = sexpressionParser(sexpr);
  let result = minify_recurse_tree(tree);
  return result;
}

function beautify( code ) {

  let newcode = indentS( code );

  return newcode;

}

/*
function minify()
{
  let textarea = document.getElementById('text');
  textarea.value = minify_sexpr(textarea.value);
  localStorage.setItem("online_sexpr_format_last_text", textarea.value);
}
*/
