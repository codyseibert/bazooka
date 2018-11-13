const { DYNAMO_ENDPOINT } = require('./environment');
const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB({
  region: 'us-east-1',
  endpoint: DYNAMO_ENDPOINT
})

const params = {
  TableName: 'bazooka',
  KeySchema: [
    {
        AttributeName: 'pk',
        KeyType: 'HASH',
    },
    {
      AttributeName: 'sk',
      KeyType: 'RANGE',
    },
  ],
  AttributeDefinitions: [
    {
      AttributeName: 'pk',
      AttributeType: 'S',
    },{
      AttributeName: 'sk',
      AttributeType: 'S',
    },
  ],
  ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
  },
};

dynamo.createTable(params, function(err, data) {
  if (err) console.log('err', err);
  else console.log(data);
});