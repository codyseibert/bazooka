const Bluebird = require("bluebird");
const fs = require("fs");
const exec = Bluebird.promisify(require("child_process").exec);
const rimraf = Bluebird.promisify(require("rimraf"));
const uuidv4 = require("uuid/v4");
const path = require("path");

const getBazookaJson = async ({ filePath }) => {
  const prepath = filePath.substring(0, filePath.lastIndexOf("/"));
  const id = filePath.substring(filePath.lastIndexOf("/") + 1);
  const name = id;
  const extractDir = `${filePath}_dir`;
  await rimraf(extractDir);
  await exec(`unzip -j ${filePath} bazooka.json -d ${extractDir}`); //, async function(err, stdout, stderr) {
  const bazookaPath = `${extractDir}/bazooka.json`;
  const hash = uuidv4();
  const bazooka = {
    ...require(bazookaPath),
    hash
  };
  return bazooka;
};

const readFile = ({ filePath }) => Bluebird.promisify(fs.readFile)(filePath);

const saveZip = ({ zip, hash, applicationContext }) =>
  applicationContext.persistence.store({
    key: hash,
    file: zip
  });

const saveMetadata = ({ metadata, applicationContext }) =>
  applicationContext.persistence.save({
    entity: metadata
  });

const publishUploadEvent = ({ key, applicationContext }) =>
  applicationContext.bus.publish({
    key: "upload",
    data: key
  });

exports.upload = async function({ applicationContext, filePath }) {
  console.log("upload");
  const bazooka = await getBazookaJson({ filePath });

  await saveZip({
    hash: bazooka.hash,
    zip: await readFile({ filePath }),
    applicationContext
  });

  await saveMetadata({
    metadata: bazooka,
    applicationContext
  });

  await publishUploadEvent({
    key: bazooka.key,
    applicationContext
  });

  return bazooka;
};
