#!/usr/bin/env node
 
var cli = require('../src/index.js');

if (process.argv.length <= 2) {
  console.error('you must provide a command argument: [deploy, init]');
}

const command = process.argv[2];

if (command === 'deploy') {
  cli.deploy();
} else if (command === 'init') {
  cli.init();
}