const argv = process.argv;
const key = argv[2];
const handler = argv[3];
const hash = argv[4];
const [file, method] = handler.split(".");

let stdin = "";

const listener = async function(data) {
  stdin += data.toString();
  const reg = /input=\|([^|]+)\|([^|]+)\|/;
  let match;
  while ((match = reg.exec(stdin))) {
    const session = match[1];
    let payload = JSON.parse(match[2]);
    stdin = stdin.replace(match[0], "");
    const snippit = require(`../snippits/${key}-${hash}/${file}`)[method];
    const response = await snippit(payload);
    process.stdout.write(`output=|${session}|${JSON.stringify(response)}|`);
  }
};

process.stdin.on("data", listener);
