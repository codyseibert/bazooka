const Bluebird = require("bluebird");
const fs = require("fs");
const exec = Bluebird.promisify(require("child_process").exec);
const rimraf = Bluebird.promisify(require("rimraf"));
const uuidv4 = require("uuid/v4");
const path = require("path");

// what does this function actually do?
// - unzips the bazooka.json from out of the bazooka.zip
// - reads in the bazooka.json from the zip
// - saves the zip to s3 (using the hash)
// - saves the bazooka.json to dynamo (including that generated hash)
// - publishes an event to a redis topic
// - deletes the .zip file from disk

// how could I test this method does that I want?
// - verify we make a request to "save" the zip to s3
// - verify we make a request to "save" the metadata to dynamo with the expected data
// - verify it tries to publish an event to a topic named 'upload'
// - verify the code attempts to delete the zip from disk

function getBazookaJson({ zipFilePath }) {
  // extract .json from zip
  // read it in
  // add a hash to it
  // return it
}

function saveZip({ zipData, metadata }) {
  // write the zip data to s3 using the hash
}

function saveMetadata({ metadata }) {
  // write the metadata to dynamo
}

function publishUploadEvent({ key }) {
  // publish the key to the uploads topic
}

function deleteFile({ filePath }) {
  // deletes the file
}

exports.upload = async function({ applicationContext, filePath }) {
  let error;
  let extractDir;
  try {
    const prepath = filePath.substring(0, filePath.lastIndexOf("/"));
    const id = filePath.substring(filePath.lastIndexOf("/") + 1);
    const name = id;
    extractDir = `${filePath}_dir`;
    await exec(`unzip -j ${filePath} bazooka.json -d ${extractDir}`); //, async function(err, stdout, stderr) {
    const bazookaPath = `${extractDir}/bazooka.json`;
    const hash = uuidv4();
    const bazooka = {
      ...require(bazookaPath),
      hash
    };
    const endpoints = bazooka.endpoints;
    const key = bazooka.key;

    const data = await Bluebird.promisify(fs.readFile)(filePath);

    await applicationContext.persistence.store({
      key: hash,
      file: data
    });

    await applicationContext.persistence.save({
      entity: {
        ...bazooka,
        hash
      }
    });

    await applicationContext.bus.publish({
      key: "upload",
      data: key
    });

    return {
      ...bazooka,
      hash
    };
  } catch (err) {
    error = err;
  } finally {
    if (error) throw error;
    await rimraf(extractDir);
  }
};
