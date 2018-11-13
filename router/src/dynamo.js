const { DYNAMO_ENDPOINT } = require('./environment');
const AWS = require('aws-sdk');

exports.client = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1',
  endpoint: DYNAMO_ENDPOINT
})