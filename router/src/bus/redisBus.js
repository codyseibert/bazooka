const redis = require("redis");

let sub;
let pub;

const getSub = () => {
  if (!sub) {
    sub = redis.createClient();
  }
  return sub;
};

const getPub = () => {
  if (!pub) {
    pub = redis.createClient();
  }
  return pub;
};

exports.publish = async ({ key, data }) => {
  getPub().emit(key, data);
};

exports.subscribe = async ({ key, cb }) => {
  const s = getSub();
  s.subscribe(key);
  s.on("message", cb);
};
