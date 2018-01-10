var app = require('express')();
var fs = require('fs');
var uuid = require('node-uuid');
var cp = require('child_process');
var bodyParser = require('body-parser');
var usage = require('usage');
var cors = require('cors');
var request = require('request');
var AWS = require('aws-sdk');
var Bluebird = require('bluebird');
var uuid = require('node-uuid');
var cp = require('child_process');
const ip = cp.execSync(`dig TXT +short o-o.myaddr.l.google.com @ns1.google.com | awk -F'"' '{ print $2}'`).toString().replace('\n', '');

let conn;
let ch;
async function setupRabbitMqConnection() {
  conn = await require('amqplib').connect(process.env.RABBIT || 'amqp://localhost');
  ch = await conn.createChannel();
}
setupRabbitMqConnection();

async function publishHeartbeat() {
  try {
    await ch.assertExchange('heartbeat', 'fanout', {durable: false})
    await ch.publish('heartbeat', '', Buffer.from(JSON.stringify({
      ip: `${process.env.IP || ip}:${process.env.PORT || 10001}`
    })));
  } catch (err) {
    console.warn(err);
  }
}
setInterval(publishHeartbeat, 5000);

const docClient = Bluebird.promisifyAll(
  new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1',
    endpoint: 'dynamodb.us-east-1.amazonaws.com'
  })
);

const s3 = Bluebird.promisifyAll(
  new AWS.S3({
    region: 'us-east-1'
  })
);

app.use(cors());
app.use(bodyParser.json());


function getModules(id) {
  const file = fs.readFileSync(`snippits/${id}/index.js`, 'utf-8');
  const reg = /require\(('|")([a-z_\-]+)('|")\)/g;
  const matches = [];
  let match = reg.exec(file);
  do {
    if (match) {
      const ignore = [ 
        'assert',
        'async_hooks',
        'buffer',
        'child_process',
        'cluster',
        'crypto',
        'dgram',
        'dns',
        'domain',
        'events',
        'fs',
        'http',
        'https',
        'net',
        'os',
        'path',
        'perf_hooks',
        'punycode',
        'querystring',
        'readline',
        'repl',
        'stream',
        'string_decoder',
        'tls',
        'tty',
        'url',
        'util',
        'v8',
        'vm',
        'zlib',
        'http2' 
      ]
      const m = match[2]
      if (ignore.indexOf(m) === -1) {
        matches.push(match[2]);
      }
    }
    match = reg.exec(file);
  } while (match !== null);
  return matches;
}

let limit = {};
const REQUESTS_PER_MIN = 100000;
setInterval(function() {
  limit = {};
}, 60000);

app.get('/status', function(req, res) {
  res.status(200).send('success');
})

const seen = {};

app.all('/snippits/:id', async function(req, res){
  const id = req.params.id;
  console.log('running', id);

  if (limit[id] !== undefined) {
    limit[id]--;
  } else {
    limit[id] = REQUESTS_PER_MIN;
  }

  if (limit[id] <= 0) {
    res.status(500).send(`you have hit your endpoint limit of ${REQUESTS_PER_MIN} requests per minute`);
    return;
  }

  let source;
  if (!seen[id]) {
    source = await s3.getObjectAsync({
      Bucket: 'bazooka',
      Key: id
    })
  }

  function run() {
    let realError = null;
    const MEM_LIMIT = 100e6;
    
    const interval = setInterval(function() {
      usage.lookup(runner.pid, function(err, result) {
        if (err) return;
        const mem = result.memory;
        if (mem > MEM_LIMIT) {
          realError = `memory limit of ${MEM_LIMIT}b exceeded.`
          clearInterval(interval);
          runner.kill();
        }
      });
    }, 1000);

    const TIME_LIMIT = 5000;
    const timeout = setTimeout(function() {
      realError = `time limit of ${TIME_LIMIT}ms exceeded`;
      clearInterval(interval);
      runner.kill();
    }, TIME_LIMIT);

    const params = JSON.parse(req.query._params);
    delete req.query._params;

    
    const request = JSON.stringify({
      body: req.body,
      params: params,
      query: req.query
    }).replace(/"/g, '\\\"');
    // console.time(id);
    // const runner = cp.spawn('node', [`snippits/${id}/index.js`, `"${request}"`])
    // let out = "";
    // runner.stdout.on('data', (data) => {
    //   out += data
    //   console.log(data.toString());

    //   const reg = /output=\|(.*)\|/;
    //   const match = reg.exec(out);
    //   if (match) {
    //     let payload = JSON.parse(match[1]);
    //     if (typeof payload === "number") {
    //       payload += "";
    //     }
    //     console.timeEnd(id);
    //     res.status(200).send(payload);
    //   }
    // });
    
    // runner.stderr.on('data', (data) => {
    //   clearInterval(interval);
    //   clearTimeout(timeout);
    //   runner.kill();
    //   res.status(500).send(data);
    // });
    
    // runner.on('close', (code) => {
    //   clearInterval(interval);
    //   clearTimeout(timeout);
    // });

    const runner = cp.exec(`node snippits/${id}/index.js "${request}"`, {
      maxBuffer: 1024 * 1024 * 1
      // uid: process.env.UID || 1000
    }, (err, stdout, stderr) => {
      console.log(stdout);
      clearInterval(interval);
      clearTimeout(timeout);

      try {
        if (err) {
          res.status(500).send(realError || err.message);
        } else {
          const reg = /output=\|(.*)\|/;
          const match = reg.exec(stdout);
          let payload = JSON.parse(match[1]);
          if (typeof payload === "number") {
            payload += "";
          }
          if (match) {
            res.status(200).send(payload);
          } else {
            res.status(500).send('error: snippit returned no data');
          }
        }
      } catch (err) {
        res.status(500).send(err.message);
      }
    })
  }
  
  if (!seen[id]) {
    fs.mkdir('snippits', () => {
      fs.mkdir(`snippits/${id}`, () => {
        fs.writeFile(`snippits/${id}/index.js`, source.Body, function(err) {
          run();
          seen[id] = true;
        });
      })
    })
  } else {
    run();
  }
});


app.listen(process.env.PORT || 10001);