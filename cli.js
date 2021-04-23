#!/usr/bin/env node

const printMsg = require('./index').printMsg;

const [,, ...args] = process.argv;

(function() {
    printMsg(args);
})()
