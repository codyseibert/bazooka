const HEARTBEAT_QUEUE_NAME = 'heartbeat';

async function main() {
  const conn = await require('amqplib').connect(process.env.RABBIT || 'amqp://localhost');
  const ch = await conn.createChannel();

  // Consumer
  try {
    // await ch.assertExchange('logs', 'fanout', {durable: false})
    // await ch.bindQueue(ok.queue, 'logs', '');
    await ch.assertQueue(HEARTBEAT_QUEUE_NAME, {durable: false});
    await ch.consume(HEARTBEAT_QUEUE_NAME, function(msg) {
      if (msg !== null) {
        const heartbeat = JSON.parse(msg.content.toString());
        console.log(heartbeat.ip);
        ch.ack(msg);
      }
    })
  } catch (err) {
    console.warn(err);
  }

  // Publisher
  // try {
  //   const obj = {
  //     id: '123'
  //   };
  //   await ch.assertExchange('logs', 'fanout', {durable: false})
  //   await ch.publish('logs', '', Buffer.from(JSON.stringify(obj)));
  // } catch (err) {
  //   console.warn(err);
  // }
}

main();
