var request = require('request');

module.handler = function (event, context, cb) {
  request({
    url: 'https://api.keyvalue.xyz/ed4ee6a8/count',
    method: 'get'
  }, function(err, response, body) {
    cb(null, body);
  })
}

