const { upload } = require("../useCases/upload");
const applicationContext = require("../applicationContext");

exports.upload = async function(req, res) {
  try {
    await upload({
      applicationContext,
      filePath: req.file.path
    });
    res.status(200).send("success");
  } catch (err) {
    res.status(500).send(err);
  } finally {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
};
