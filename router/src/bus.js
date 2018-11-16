const redis = require("redis");
exports.sub = redis.createClient();
exports.pub = redis.createClient();

exports.sub.subscribe("upload");
