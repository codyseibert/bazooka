
      const argv = process.argv;
      const request = JSON.parse(argv[2]);
      async function main() {
        const handler = require('../src/users').update;
        const response = await handler(request)
        console.log('response', response);
        console.log("output=|" + JSON.stringify(response) + "|");
      }
      main();
      