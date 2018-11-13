const AWS = require('aws-sdk');
const uuid = require('node-uuid');

const s3 = new AWS.S3({
  region: 'us-east-1'
});

const docClient = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1',
  endpoint: 'dynamodb.us-east-1.amazonaws.com'
})

exports.updateSnippit = async function(req, res){
  try {
    const id = uuid.v4();
    const name = req.body.name;
    const method = req.body.method;
    const key = req.body.key;
    const snippit = req.body.snippit;

    await s3.putObject({
      Bucket: 'bazooka-uploads',
      Key: id,
      Body: snippit,
    }).promise();

    await docClient.update({
      TableName: 'bazooka',
      Key: {
        key: key
      },
      AttributeUpdates: {
        [`${method.toUpperCase()}@${name.replace(/^\/+/g, '')}`]: {
          Action: 'PUT',
          Value: id
        }
      }
    }).promise();

    res.status(200).send(`${id}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
};