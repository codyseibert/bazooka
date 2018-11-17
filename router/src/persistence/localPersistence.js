const EventEmitter = require("events");
class Emitter extends EventEmitter {}

const s3 = {};
const dynamo = {};
const emitter = new Emitter();

exports.fetch = async ({ key }) => {
  return s3[key];
};

exports.store = async ({ file, key }) => {
  s3[key] = file;
  return key;
};

exports.save = async ({ entity }) => {
  dynamo[entity.key] = entity;
  return entity;
};

exports.get = async ({ key }) => {
  return dynamo[key];
};

exports.publish = async ({ key, data }) => {
  emitter.emit(key, data);
};

exports.subscribe = async ({ key, cb }) => {
  emitter.on(key, cb);
};
