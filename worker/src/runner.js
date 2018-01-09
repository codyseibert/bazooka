const argv = process.argv;
const id = argv[2];
const request = JSON.parse(argv[3]);
console.log('id', id);
console.log('request', request);
async function main() {
  const snippit = require(`../snippits/${id}`)
  const response = await snippit(request)
  console.log('response', response);
  console.log("output=|" + JSON.stringify(response) + "|");
}
main();