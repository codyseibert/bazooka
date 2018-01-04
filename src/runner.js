const argv = process.argv;
const id = argv[2];
const request = JSON.parse(argv[3]);

require(`../snippits/${id}`)(request, (err, response) => {
  if (err) {
    throw err
  } else {
    console.log("output=|" + JSON.stringify(response) + "|");
  }
});