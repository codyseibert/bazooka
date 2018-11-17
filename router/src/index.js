const app = require("express")();
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const up = multer({ dest: "uploads/" });
const morgan = require("morgan");
const { run } = require("./routes/run");
const { upload } = require("./routes/upload");

async function main() {
  // const conn = await require('amqplib').connect(process.env.RABBIT || 'amqp://localhost');
  // const ch = await conn.createChannel();

  app.use(cors());
  app.use(morgan("tiny"));
  app.use(
    bodyParser.json({
      limit: "5mb"
    })
  );

  // try {
  //   await ch.assertExchange('heartbeat', 'fanout', {durable: false})
  //   const ok = await ch.assertQueue('', {exclusive: true});
  //   await ch.bindQueue(ok.queue, 'heartbeat', '');
  //   await ch.consume(ok.queue, function(msg) {
  //     if (msg !== null) {
  //       const heartbeat = JSON.parse(msg.content.toString());
  //       const ip = heartbeat.ip;
  //       if (nodes.indexOf(ip) === -1) {
  //         nodes.push(ip);
  //       }
  //       console.log(nodes);
  //       ch.ack(msg);
  //     }
  //   })
  // } catch (err) {
  //   console.warn(err);
  // }

  app.get("/status", function(req, res) {
    res.status(200).send("success");
  });

  app.post("/upload", up.single("zip"), upload);

  app.all("/snippits/:key/:name(*)", run);

  app.listen(process.env.PORT || 10000);
}

main();
