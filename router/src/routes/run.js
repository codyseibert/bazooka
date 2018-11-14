const AWS = require('aws-sdk');
var Route = require('route-parser');
var runner = require('../runner');
const { client: docClient } = require('../dynamo');

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
  const record = await docClient.get({
    TableName: 'bazooka',
    Key: {
      pk: key,
      sk: key,
    }
  }).promise();

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

exports.run = async function(req, res){
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

    console.log('result', result);

    // if (typeof result === 'number') {
    //   res.status(200).send(`${result}`);
    // } else {
    //   res.status(200).send(result);
    // }
  } catch (err) {
    console.log('we got an error!', err);
    res.status(500).send(err);
  }
};