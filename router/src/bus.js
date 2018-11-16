const redis = require("redis");
exports.sub = redis.createClient();
exports.pub = redis.createClient();

exports.sub.on("message", function(channel, message) {
  console.log(message);
});

exports.sub.subscribe("upload");
