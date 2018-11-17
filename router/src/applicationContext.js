const awsPersistence = require("./persistence/awsPersistence");
const localPersistence = require("./persistence/localPersistence");
const localBus = require("./bus/localBus");
const redisBus = require("./bus/redisBus");

module.exports = {
  persistence: process.env.TEST ? localPersistence : awsPersistence,
  bus: process.env.TEST ? localBus : redisBus
};
