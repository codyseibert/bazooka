const AWS = require('aws-sdk');
const Bluebird = require('bluebird');
const cp = require('child_process');
const nodePath = require('path');
const fs = require('fs');

const s3 = new AWS.S3({
  region: 'us-east-1'
});

const docClient = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1',
  endpoint: 'dynamodb.us-east-1.amazonaws.com'
})

exports.uploadBazooka = async function(req, res) {
  try {
    const file = req.file;
    const path = file.path;
    const filename = file.filename;
    cp.exec(`unzip -j ${path} bazooka.json -d ${path}_dir`, async function(err, stdout, stderr) {
      const bazooka = require(nodePath.join(process.cwd(),`${path}_dir/bazooka.json`));
      const endpoints = bazooka.endpoints;
      const key = bazooka.key;
      bazooka.pk = key;
      bazooka.sk = key;
      const data = await Bluebird.promisify(fs.readFile)(file.path)
      console.log('1', key);
      console.log('data', data);

      await s3.putObject({
        Bucket: 'bazooka-uploads',
        Key: key,
        Body: data,
      }).promise();

      await docClient.put({
        TableName: 'bazooka',
        Item: bazooka
      }).promise();

      res.status(200).send('success');
    });
  } catch (err) {
    res.status(500).send(err);
  }
};