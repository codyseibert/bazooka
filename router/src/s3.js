const { S3_ENDPOINT } = require('./environment');
const AWS = require('aws-sdk');

exports.s3 = new AWS.S3({
  region: 'us-east-1',
  s3ForcePathStyle: true,
  endpoint: S3_ENDPOINT
});