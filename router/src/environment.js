exports.S3_ENDPOINT = process.env.LOCAL ?
  'http://localhost:4568' : 's3.us-east-1.amazonaws.com'

exports.DYNAMO_ENDPOINT = process.env.LOCAL ?
  'http://localhost:8000' : 'dynamodb.us-east-1.amazonaws.com'
