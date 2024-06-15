const amqp = require("amqplib/callback_api");

const rabbitMqUrl = "amqp://localhost"; // Update with your RabbitMQ server URL
const exportCertificateQueue = "export_certificate_queue"; // Queue to publish messages
const exportDeclarationQueue = "export_declaration_queue"; // Queue to publish messages

const exportCertificate = "export_certificate";
const exportDeclaration = "export_declaration";

amqp.connect("amqp://localhost", (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }
    const exchange = "file_changes_exchange";

    channel.assertExchange(exchange, "direct", {
      durable: false,
    });

    channel.assertQueue(
      exportCertificateQueue,
      {
        exclusive: true,
      },
      (error2, q) => {
        if (error2) {
          throw error2;
        }
        console.log(
          exportCertificateQueue,
          " [*] Waiting for logs. To exit press CTRL+C"
        );

        channel.bindQueue(exportCertificateQueue, exchange, exportCertificate);

        channel.consume(
          exportCertificateQueue,
          (msg) => {
            console.log(
              " [x] %s: '%s'",
              msg.fields.routingKey,
              msg.content.toString()
            );
          },
          {
            noAck: true,
          }
        );
      }
    );

    channel.assertQueue(
      exportDeclarationQueue,
      {
        exclusive: true,
      },
      (error2, q) => {
        if (error2) {
          throw error2;
        }
        console.log(
          exportDeclarationQueue,
          " [*] Waiting for logs. To exit press CTRL+C"
        );

        channel.bindQueue(exportDeclarationQueue, exchange, exportDeclaration);

        channel.consume(
          exportDeclarationQueue,
          (msg) => {
            console.log(
              " [x] %s: '%s'",
              msg.fields.routingKey,
              msg.content.toString()
            );
          },
          {
            noAck: true,
          }
        );
      }
    );
  });
});
