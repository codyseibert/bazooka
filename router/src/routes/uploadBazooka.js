const AWS = require('aws-sdk');
const Bluebird = require('bluebird');
const nodePath = require('path');
const fs = require('fs');
const exec = Bluebird.promisify(require('child_process').exec);
const { s3 } = require('../s3');
const { client: docClient } = require('../dynamo');

exports.uploadBazooka = async function(req, res) {
  let filePath;
  try {
    const file = req.file;
    const path = file.path;
    filePath = path;
    const filename = file.filename;
    console.log('here');
    await exec(`unzip -j ${path} bazooka.json -d ${path}_dir`);//, async function(err, stdout, stderr) {
    const bazooka = require(nodePath.join(process.cwd(),`${path}_dir/bazooka.json`));
    const endpoints = bazooka.endpoints;
    const key = bazooka.key;
    console.log('there');

    bazooka.pk = key;
    bazooka.sk = key;
    const data = await Bluebird.promisify(fs.readFile)(file.path)

    console.log('put object');
    await s3.putObject({
      Bucket: 'bazooka-uploads',
      Key: key,
      Body: data,
    }).promise();

    console.log('put dynamo');
    await docClient.put({
      TableName: 'bazooka',
      Item: bazooka
    }).promise();

    res.status(200).send('success');
  } catch (err) {
    console.log('err', err);
    res.status(500).send(err);
  } finally {
    // fs.unlink(filePath, (err) => {
    //   console.log(err);
    // });
  }
};