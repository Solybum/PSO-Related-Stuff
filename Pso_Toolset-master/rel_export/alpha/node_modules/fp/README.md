fp
==

> fun with functional programming in js

### Methods
**fp.fst(fn)**: Returns a function that calls **fn** with only the first argument passed.

**fp.snd(fn)**: Returns a function that calls **fn** with only the second argument passed.

**fp.thd(fn)**: Returns a function that calls **fn** with only the third argument passed.

**fp.nthArg(nth, fn)**: Returns a function that calls **fn** with only the **nth** argument passed.

### Example

````js
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
````

This produces:

````
$ node example/log.js

Just passing console.log by itself:
   foo 0 [ 'foo', 'bar', 'baz' ]
   bar 1 [ 'foo', 'bar', 'baz' ]
   baz 2 [ 'foo', 'bar', 'baz' ]

Wrapping console.log in fp.fst to only get the keys:
   foo
   bar
   baz

Wrapping console.log in fp.snd to only get the values:
   0
   1
   2
````

### Contributing

PRs welcome. I don't have a specific direction in mind yet for this package; I just wanted someplace to stick
the small functional tools I keep replicating between projects.