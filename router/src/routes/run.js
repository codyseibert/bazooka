const { run } = require("../useCases/run");
const applicationContext = require("../applicationContext");

exports.run = async function(req, res) {
  try {
    const result = await run({
      key: key,
      path: name,
      payload: {
        query: req.query,
        body: req.body
      },
      applicationContext
    });
    res.status(200).send(result);
  } catch (err) {
    console.log("we got an error!", err);
    res.status(500).send(err);
  }
};
