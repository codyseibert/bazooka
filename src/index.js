var app = require('express')();
var fs = require('fs');
var uuid = require('node-uuid');
var cp = require('child_process');
var bodyParser = require('body-parser');
var usage = require('usage');
var cors = require('cors');

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
const REQUESTS_PER_MIN = 10;
setInterval(function() {
  limit = {};
}, 60000);

app.post('/snippits/:id', function(req, res){
  const id = req.params.id;
  const payload = JSON.stringify(req.body).replace(/"/g, '\\\"');
  
  console.log(limit);
  if (limit[id] !== undefined) {
    limit[id]--;
  } else {
    limit[id] = REQUESTS_PER_MIN;
  }

  if (limit[id] <= 0) {
    res.status(500).send(`you have hit your endpoint limit of ${REQUESTS_PER_MIN} requests per minute`);
    return;
  }

  function run() {
    let realError = null;
    const MEM_LIMIT = 50e6;
    
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
    
    const runner = cp.exec(`node src/runner.js ${id} "${payload}"`, {
      maxBuffer: 1024 * 1024 * 1,
      uid: process.env.UID || 1001
    }, (err, stdout, stderr) => {
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

  run();
});

app.post('/snippits', function(req, res){
  const id = uuid.v4();
  const snippit = req.body.snippit;
  fs.mkdir('snippits', () => {
    fs.mkdir(`snippits/${id}`, () => {
      fs.writeFile(`snippits/${id}/index.js`, snippit, (err, n) => {
        const modules = getModules(id);
        cp.exec(`npm install --prefix=snippits/${id} ${modules.join(' ')}`, function(err) {
          if (err) {
            res.status(500).send('error creating your bazooka function');
          } else {
            res.send(`${id}`);
          }
        });
      });
    })
  })
});

app.listen(8080);