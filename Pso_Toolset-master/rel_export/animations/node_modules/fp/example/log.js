'use strict';

var fp = require('..'),
    items = ['foo', 'bar', 'baz'],
    _ = require('lodash'),
    indentLog = _.partial(console.log, '  ');

console.log();
console.log('Just passing console.log by itself:');

items.forEach(indentLog);

console.log();
console.log('Wrapping console.log in fp.fst to only get the keys:');

items.forEach(fp.fst(indentLog));

console.log();
console.log('Wrapping console.log in fp.snd to only get the values:');
items.forEach(fp.snd(indentLog));