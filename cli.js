#!/usr/bin/env node

const DeployFlow = require('./index');

(function() {
    const df = new DeployFlow();
    df.run();
})()