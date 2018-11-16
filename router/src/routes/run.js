const AWS = require("aws-sdk");
var Route = require("route-parser");
var runner = require("../runner");
const { client: docClient } = require("../dynamo");
const { sub } = require("../bus");

const metaMemo = {};
const routeMemo = {};

sub.on("message", function(channel, message) {
  console.log("decache", message);
  delete metaMemo[message];
  delete routeMemo[message];
});

function memo(fn, memo) {
  return function(input) {
    if (!memo[input]) {
      memo[input] = fn(input);
    }
    return memo[input];
  };
}

const getMetadata = memo(key => {
  return docClient
    .get({
      TableName: "bazooka",
      Key: {
        key
      }
    })
    .promise()
    .then(r => r.Item);
}, metaMemo);

const getRoutes = memo(async function(key) {
  const record = await getMetadata(key);

  return Object.keys(record.endpoints)
    .filter(key => key.indexOf("@") !== -1)
    .map(key => ({
      route: key.split("@")[1],
      method: key.split("@")[0],
      handler: record.endpoints[key]
    }))
    .sort((a, b) => {
      const ia = a.route.indexOf(":");
      const ib = b.route.indexOf(":");
      if (ia === ib) {
        return 0;
      } else if (ia !== -1) {
        return 1;
      } else {
        return -1;
      }
    });
}, routeMemo);

function matchRoute(route, method, routes) {
  for (let i = 0; i < routes.length; i++) {
    const r = routes[i];
    const match = new Route(r.route.replace(/^\/+/g, "")).match(route);
    if (r.method === method && match) {
      return r;
    }
  }
  return null;
}

exports.run = async function(req, res) {
  try {
    const name = req.params.name;
    const key = req.params.key;
    const method = req.method.toUpperCase();
    const meta = await getMetadata(key);
    const routes = await getRoutes(key);

    const match = matchRoute(name, method, routes);

    if (!match) {
      res.status(400).send("endpoint does not exist");
      return;
    }

    var route = new Route(match.route);
    const params = route.match(name) || {};

    const result = await runner(
      key,
      match.handler,
      {
        query: req.query,
        params: params,
        body: req.body
      },
      res,
      meta.hash
    );
  } catch (err) {
    console.log("we got an error!", err);
    res.status(500).send(err);
  }
};
