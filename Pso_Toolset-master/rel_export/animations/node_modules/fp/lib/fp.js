'use strict';

var _ = require('lodash');

var nthArg = _.curry(function(n, fn) {
    return function() {
        return fn(arguments[n]);
    };
});

module.exports = {
    nthArg: nthArg,
    fst: nthArg(0),
    snd: nthArg(1),
    thd: nthArg(2)
};