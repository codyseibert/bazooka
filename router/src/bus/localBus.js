const EventEmitter = require("events");
class Emitter extends EventEmitter {}
const emitter = new Emitter();

exports.publish = async ({ key, data }) => {
  emitter.emit(key, data);
};

exports.subscribe = async ({ key, cb }) => {
  emitter.on(key, cb);
};
