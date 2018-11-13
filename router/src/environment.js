exports.S3_ENDPOINT = process.env.NODE_ENV === 'production' ?
  's3.us-east-1.amazonaws.com' : 'http://localhost:4568'

exports.DYNAMO_ENDPOINT = process.env.NODE_ENV === 'production' ?
  'dynamodb.us-east-1.amazonaws.com' : 'http://localhost:8000'
