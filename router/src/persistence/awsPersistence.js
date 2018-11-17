const AWS = require("aws-sdk");
const Bluebird = require("bluebird");
const nodePath = require("path");
const fs = require("fs");
const exec = Bluebird.promisify(require("child_process").exec);
const { s3 } = require("../s3");
const { client: docClient } = require("../dynamo");
const uuidv4 = require("uuid/v4");

exports.store = ({ file, key }) => {
  return s3
    .putObject({
      Bucket: "bazooka-uploads",
      Key: key,
      Body: file
    })
    .promise();
};

exports.save = ({ entity }) => {
  return docClient
    .put({
      TableName: "bazooka",
      Item: entity
    })
    .promise();
};
