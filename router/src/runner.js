var path = require("path");
var fs = require("fs");
var uuid = require("node-uuid");
var cp = require("child_process");
var bodyParser = require("body-parser");
var usage = require("usage");
var request = require("request");
var AWS = require("aws-sdk");
var Bluebird = require("bluebird");
var uuid = require("node-uuid");
var cp = require("child_process");
var mkdirp = require("mkdirp");
// const ip = cp.execSync(`dig TXT +short o-o.myaddr.l.google.com @ns1.google.com | awk -F'"' '{ print $2}'`).toString().replace('\n', '');

const { s3 } = require("./s3");

// let limit = {};
// const REQUESTS_PER_MIN = 100000;
// setInterval(function() {
//   limit = {};
// }, 60000);

const runners = {};
const sessions = {};

function spawnRunner(key, handler, hash) {
  const runner = cp.spawn("node", ["src/job.js", key, handler, hash]);

  let stdout = "";
  runner.stdout.on("data", data => {
    stdout += data.toString();

    const reg = /output=\|([^|]+)\|([^|]+)\|/;
    let match;
    while ((match = reg.exec(stdout))) {
      const outSession = match[1];
      let payload = JSON.parse(match[2]);
      stdout = stdout.replace(match[0], "");
      sessions[outSession](payload);
      delete sessions[outSession];
    }
  });

  runner.stderr.on("data", stderr => {
    // console.log(stderr.toString());
  });

  runner.on("close", () => {
    console.log("this shit closed down");
    // loop through all sessions with same key + handler and send back 500
  });

  return runner;
}

module.exports = async function(key, handler, parameters, hash) {
  return new Promise(async (resolve, reject) => {
    const session = uuid.v4();
    sessions[session] = resolve;
    const id = `${key}-${hash}-${handler}`;

    if (!fs.existsSync(path.join(process.cwd(), `snippits/${key}-${hash}`))) {
      // await Bluebird.promisify(mkdirp)(path.join(process.cwd(), `snippits/${key}`));
      mkdirp.sync(path.join(process.cwd(), `snippits/${key}-${hash}`));
      const zip = await s3
        .getObject({
          Bucket: "bazooka-uploads",
          Key: hash
        })
        .promise();

      const bazookaZipPath = path.join(
        process.cwd(),
        `snippits/${key}-${hash}/bazooka.zip`
      );

      await Bluebird.promisify(fs.writeFile)(bazookaZipPath, zip.Body);
      await Bluebird.promisify(cp.exec)(
        `cd ${path.join(
          process.cwd(),
          `snippits/${key}-${hash}`
        )} && unzip bazooka.zip`
      );
      await Bluebird.promisify(cp.exec)(`rm -f ${bazookaZipPath}`);
    }

    if (!runners[id]) {
      runners[id] = spawnRunner(key, handler, hash);
    }

    runners[id].stdin.write(`input=|${session}|${JSON.stringify(parameters)}|`);
  });
};
