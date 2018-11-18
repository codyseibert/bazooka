const Bluebird = require("bluebird");
const { upload } = require("../useCases/upload");
const applicationContext = require("../applicationContext");
const rimraf = require("rimraf");
const rimraf = Bluebird.promisify(require("rimraf"));

exports.upload = async function(req, res) {
  try {
    await upload({
      applicationContext,
      filePath: req.file.path
    });
    res.status(200).send("success");
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  } finally {
    await rimraf(req.file.path);
  }
};
