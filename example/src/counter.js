// var request = require('request');
console.time('req');
var randomstring = require('randomstring');

module.exports = {
  value({query, body, params}) {
    return new Promise((res, rej) => {
      // request({
      //   url: 'https://google.com',
      //   // url: 'https://api.keyvalue.xyz/ed4ee6a8/count',
      //   method: 'get'
      // }, function(err, response, body) {
      console.timeEnd('req');
      //   res('yup');
      // });
      res(randomstring.generate(20));
    });
  }
}