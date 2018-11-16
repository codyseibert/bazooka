npm run s3 &
npm run dynamo &
npm run dynamo:admin &

sleep 3

npm run create-bucket
npm run create-table

LOCAL=true nodemon -w src src/index.js