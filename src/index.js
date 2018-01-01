var app = require('express')();
var fs = require('fs');
var uuid = require('node-uuid');
var cp = require('child_process');
var bodyParser = require('body-parser');
var usage = require('usage');

app.use(bodyParser.json())

app.post('/snippits/:id', function(req, res){
  const id = req.params.id;
  const payload = JSON.stringify(req.body).replace(/"/g, '\\\"');

  const interval = setInterval(function() {
    usage.lookup(process.pid, function(err, result) {
      if (err) return;
      const mem = result.memory;
      if (mem > 50e6) {
        clearInterval(interval);
        process.kill();
      }
    });
  }, 1000);

  const timeout = setTimeout(function() {
    clearInterval(interval);
    process.kill();
  }, 10000);


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

  function run() {
    const process = cp.exec(`node src/runner.js ${id} "${payload}"`, {
      maxBuffer: 1024 * 1024 * 1,
      uid: 1001
    }, (err, stdout, stderr) => {
      clearInterval(interval);
      clearTimeout(timeout);

      if (err) {
        res.status(500).send(err.message);
      } else {
        const reg = /output=\|(.*)\|/;
        const match = reg.exec(stdout);
        if (match) {
          res.status(200).send(JSON.parse(match[1]));
        } else {
          res.status(500).send('error: snippit returned no data');
        }
      }
    })
  }

  if (!fs.existsSync(`snippits/${id}/node_modules`)) {
    cp.exec(`npm install --prefix=snippits/${id} ${matches.join(' ')}`, run);
  } else {
    run();
  }

});



app.post('/snippits', function(req, res){
  const id = uuid.v4();
  const snippit = req.body.snippit;
  fs.mkdir('snippits', () => {
    fs.mkdir(`snippits/${id}`, () => {
      fs.writeFile(`snippits/${id}/index.js`, snippit, (err, n) => {
        res.send(`${id}`);
      });
    })
  })
});

app.listen(8080);