const AWS = require("aws-sdk");
var Route = require("route-parser");
var runner = require("../runner");
const { client: docClient } = require("../dynamo");

const metaMemo = {};
const routeMemo = {};

// sub.on("message", function(channel, message) {
//   console.log("decache", message);
//   delete metaMemo[message];
//   delete routeMemo[message];
// });

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

// get the routes for the key
// determine with "snippit" to run using the path provided
// spin up a runner and pass the necessary info for it to know which function to run
// pass in STDIN
exports.run = async ({ key, path, payload, applicationContext }) => {
  const method = req.method.toUpperCase();
  const meta = await getMetadata(key);
  const routes = await getRoutes(key);

  const match = matchRoute(path, method, routes);

  if (!match) {
    res.status(400).send("endpoint does not exist");
    return;
  }

  var route = new Route(match.route);
  const params = route.match(path) || {};

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
};
