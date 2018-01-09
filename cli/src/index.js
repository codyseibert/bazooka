const path = require('path');
const fs = require('fs');
const Bluebird = require('bluebird');
const request = Bluebird.promisify(require('request'));
const randomstring = require('randomstring');
const BAZOOKA_FILE = 'bazooka.json';
const cp = require('child_process');
const mkdirp = Bluebird.promisify(require('mkdirp'));

module.exports = {
  async deploy () {
    const bazooka = require(path.join(process.cwd(), BAZOOKA_FILE));
    const endpoints = bazooka.endpoints;
    for (let key of Object.keys(endpoints)) {
      const value = endpoints[key];
      const [method, name] = key.split('@');
      await mkdirp('./.tmp');
      const [src, fun] = value.split('.');
      fs.writeFileSync(path.join(process.cwd(), '.tmp/', 'fun.js'), `
      const argv = process.argv;
      const request = JSON.parse(argv[2]);
      async function main() {
        const handler = require('../${src}').${fun};
        const response = await handler(request)
        console.log('response', response);
        console.log("output=|" + JSON.stringify(response) + "|");
      }
      main();
      `);
      const snippit = cp.execSync(`node ${path.join(__dirname, '../node_modules/browserify/bin/cmd.js')} --node ${path.join(process.cwd(), '.tmp/', 'fun.js')}`);
      try {
        const response = await request({
          url: 'http://localhost:10000/snippits',
          method: 'post',
          json: {
            key: bazooka.key,
            name: name,
            snippit: snippit.toString(),
            method: method
          } 
        })
        console.log('Endpoint Id: ', response.body);
      } catch (err) {
        console.error(err.message);
      }
    }
  },
  init () {
    fs.writeFileSync(path.join(process.cwd(), BAZOOKA_FILE), JSON.stringify({
      key: randomstring.generate(8),
      endpoints: {
        status: {
          method: 'get',
          src: 'src/file.export'
        }
      }
    }, null, 2))
  }
}