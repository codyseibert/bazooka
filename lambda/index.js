var randomstring = require('randomstring');
var c = require('./other');

exports.handler = function (event, context, cb) {
  console.log(c.count++);
  cb(null, randomstring.generate(20));
}