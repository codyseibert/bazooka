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
var querystring = require('querystring');
var Route = require('route-parser');


async function main() {
  const conn = await require('amqplib').connect(process.env.RABBIT || 'amqp://localhost');
  const ch = await conn.createChannel();

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

  app.use(cors());
  app.use(bodyParser.json());

  const nodes = [];

  try {
    await ch.assertExchange('heartbeat', 'fanout', {durable: false})
    const ok = await ch.assertQueue('', {exclusive: true});
    await ch.bindQueue(ok.queue, 'heartbeat', '');
    await ch.consume(ok.queue, function(msg) {
      if (msg !== null) {
        const heartbeat = JSON.parse(msg.content.toString());
        const ip = heartbeat.ip;
        if (nodes.indexOf(ip) === -1) {
          nodes.push(ip);
        }
        console.log(nodes);
        ch.ack(msg);
      }
    })
  } catch (err) {
    console.warn(err);
  }

  function getRandomNode(arr) {
    arr = arr || nodes;
    if (!arr.length) {
      return null;
    }
    const randomIndex = parseInt(Math.random() * arr.length);
    return arr[randomIndex];
  }

  function removeNode(node) {
    nodes.splice(nodes.indexOf(node), 1);
  }

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
      // temp hack until activemq clear cache implemented
      return fn(input)

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
    return Object.keys(record.Item)
      .filter(key => key.indexOf('@') !== -1)
      .map(key => ({
        route: key.split('@')[1],
        method: key.split('@')[0],
        id: record.Item[key]
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

  function matchRoute(route, routes) {
    for (let i = 0; i < routes.length; i++) {
      const r = routes[i];
      const match = new Route(r.route).match(route);
      if (match) {
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
      const MAX_ATTEMPTS = 3;
      let attempts = 0;
      const routes = await getRoutes(key);
      while (attempts++ < MAX_ATTEMPTS) {
        // console.log('fetching', `${method}@${key}/${name.replace(/^\/+/g, '')}`);
        const match = matchRoute(name, routes);
        var route = new Route(match.route);
        const params = route.match(name) || {}
        // const id = await getId(`${method}@${key}/${name.replace(/^\/+/g, '')}`);
        const ipAddress = getRandomNode();
        try {
          await request(`http://${ipAddress}/status`);
          res.redirect(307, `http://${ipAddress}/snippits/${match.id}?_params=${encodeURIComponent(JSON.stringify(params))}&${querystring.stringify(req.query)}`);
          break;
        } catch (err) {
          console.warn('1', err);
          console.log('removing ip address', ipAddress);
          removeNode(ipAddress);
        }
      }
      if (attempts >= MAX_ATTEMPTS) {
        res.status(500).send('something is seriously wrong with connecting to the workers');
      }
    } catch (err) {
      console.warn('2', err);
      res.status(500).send(err.message);
    }
  });

  app.listen(process.env.PORT || 10000);
};

main();