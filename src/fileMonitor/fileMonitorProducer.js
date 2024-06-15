const amqp = require("amqplib/callback_api");
const fs = require("fs");
const path = require("path");
const watch = require("watch");

// RabbitMQ connection details (replace with your configuration)
const rabbitMqUrl = "amqp://localhost"; // Update with your RabbitMQ server URL
const exchangeName = "file_changes_exchange"; // Exchange for routing messages (optional)

const exportCertificate = "export_certificate";
const exportDeclaration = "export_declaration";

// Function to send message to RabbitMQ
async function sendMessage(message, documentType) {
  amqp.connect(rabbitMqUrl, (error0, connection) => {
    if (error0) {
      throw error0;
    }

    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }

      channel.assertExchange(exchangeName, "direct", {
        durable: false,
      });

      channel.publish(exchangeName, documentType, Buffer.from(message));
      console.log(" [x] Sent %s: '%s'", documentType, message);
    });
  });
}

// Function to handle new file events
function onFileAdded(filename) {
  const message = `New file added: ${filename}`;
  if (filename.includes("HCDAEXPORTCERT")) {
    sendMessage(message, exportCertificate);
  }

  if (filename.includes("OG_UCR_REG")) {
    sendMessage(message, exportDeclaration);
  }
}

// Watch the target folder for changes
const folderPath = path.join(__dirname, "../../watchedFolder");
console.log("*** DIR NAME ***", folderPath);
watch.createMonitor(folderPath, { recursive: false }, (monitor) => {
  monitor.on("created", onFileAdded);
});

console.log("Monitoring folder for changes...");
