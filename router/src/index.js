var app = require('express')();
var cors = require('cors');
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var Bluebird = require('bluebird');
var uuid = require('node-uuid');
var AWS = require('aws-sdk');
var Bluebird = require('bluebird');
var uuid = require('node-uuid');
var request = Bluebird.promisify(require('request'));
var normalRequest = require('request');
var querystring = require('querystring');
var Route = require('route-parser');
var multer  = require('multer')
var cp = require('child_process');
var upload = multer({ dest: 'uploads/' })
var nodePath = require('path');
var fs = require('fs');
var runner = require('./runner');
var morgan = require('morgan')

const s3 = Bluebird.promisifyAll(
  new AWS.S3({
    region: 'us-east-1'
  })
);

const docClient = Bluebird.promisifyAll(
  new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1',
    endpoint: 'dynamodb.us-east-1.amazonaws.com'
  })
);


async function main() {
  const conn = await require('amqplib').connect(process.env.RABBIT || 'amqp://localhost');
  const ch = await conn.createChannel();

  app.use(cors());
  app.use(morgan('tiny'));
  app.use(bodyParser.json({
    limit: '5mb'
  }));

  // try {
  //   await ch.assertExchange('heartbeat', 'fanout', {durable: false})
  //   const ok = await ch.assertQueue('', {exclusive: true});
  //   await ch.bindQueue(ok.queue, 'heartbeat', '');
  //   await ch.consume(ok.queue, function(msg) {
  //     if (msg !== null) {
  //       const heartbeat = JSON.parse(msg.content.toString());
  //       const ip = heartbeat.ip;
  //       if (nodes.indexOf(ip) === -1) {
  //         nodes.push(ip);
  //       }
  //       console.log(nodes);
  //       ch.ack(msg);
  //     }
  //   })
  // } catch (err) {
  //   console.warn(err);
  // }

  app.get('/status', function (req, res) {
    res.status(200).send('success');
  });

  app.post('/upload', upload.single('zip'), async function(req, res) {
    try {
      const file = req.file;
      const path = file.path;
      const filename = file.filename;

      cp.exec(`unzip -j ${path} bazooka.json -d ${path}_dir`, async function(err, stdout, stderr) {
        const bazooka = require(nodePath.join(process.cwd(),`${path}_dir/bazooka.json`));
        const endpoints = bazooka.endpoints;
        const key = bazooka.key;
        const data = await Bluebird.promisify(fs.readFile)(file.path)

        await s3.putObjectAsync({
          Bucket: 'bazooka',
          Key: key,
          Body: data,
        });

        await docClient.putAsync({
          TableName: 'snippits',
          Key: {
            key: key
          },
          Item: bazooka
        });
        res.status(200).send('success');
      });
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.post('/snippits', async function(req, res){
    try {
      const id = uuid.v4();
      const name = req.body.name;
      const method = req.body.method;
      const key = req.body.key;
      const snippit = req.body.snippit;

      await s3.putObjectAsync({
        Bucket: 'bazooka',
        Key: id,
        Body: snippit,
      })

      await docClient.updateAsync({
        TableName: 'snippits',
        Key: {
          key: key
        },
        AttributeUpdates: {
          [`${method.toUpperCase()}@${name.replace(/^\/+/g, '')}`]: {
            Action: 'PUT',
            Value: id
          }
        }
      });

      res.status(200).send(`${id}`);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  function memo(fn) {
    const memo = {};
    return function(input) {
      if (!memo[input]) {
        memo[input] = fn(input) 
      } 
      return memo[input];
    }
  }

  const getRoutes = memo(async function(key) {
    const record = await docClient.getAsync({
      TableName: 'snippits',
      Key: {
        key: key
      }
    });
    return Object.keys(record.Item.endpoints)
      .filter(key => key.indexOf('@') !== -1)
      .map(key => ({
        route: key.split('@')[1],
        method: key.split('@')[0],
        handler: record.Item.endpoints[key]
      }))
      .sort((a, b) => {
        const ia = a.route.indexOf(':');
        const ib = b.route.indexOf(':');
        if (ia === ib) {
          return 0
        } else if (ia !== -1) {
          return 1;
        } else {
          return -1;
        }
      })
  })

  function matchRoute(route, method, routes) {
    for (let i = 0; i < routes.length; i++) {
      const r = routes[i];
      const match = new Route(r.route.replace(/^\/+/g, '')).match(route);
      if (r.method === method && match) {
        return r;
      }
    }
    return null;
  }

  const getId = memo(async function(name) {
    const record = await docClient.getAsync({
      TableName: 'snippits',
      Key: {
        name: name
      }
    })
    return record.Item.id
  })

  app.all('/snippits/:key/:name(*)', async function(req, res){
    try {
      const name = req.params.name;
      const key = req.params.key;
      const method = req.method.toUpperCase();
      const routes = await getRoutes(key);
      const match = matchRoute(name, method, routes);

      if (!match) {
        res.status(400).send('endpoint does not exist');
        return;
      }

      var route = new Route(match.route);
      const params = route.match(name) || {}

      const result = await runner(key, match.handler, {
        query: req.query,
        params: params,
        body: req.body
      }, res);
    
      // if (typeof result === 'number') {
      //   res.status(200).send(`${result}`);
      // } else {
      //   res.status(200).send(result);
      // }
    } catch (err) {
      console.log('we got an error!', err);
      res.status(500).send(err);
    }
  });

  const port = process.env.PORT || 10000
  console.log(`starting router on port ${port}`)
  app.listen(port);
};

main();