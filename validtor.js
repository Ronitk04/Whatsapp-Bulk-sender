const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const readline = require('readline');

// Create a new instance of the WhatsApp Web Client
const client = new Client();

client.on('qr', (qr) => {
  // Generate and scan this code with your phone
  qrcode.generate(qr, { small: true });
});

// Event listener for client initialization
client.on('ready', () => {
  console.log('Client is ready');
  bulkCheckPhoneNumbers();
});

// Event listener for incoming messages
client.on('message', (message) => {
  // Handle incoming messages
});

// Initialize the client
client.initialize();

// Function to perform bulk phone number checking
async function bulkCheckPhoneNumbers() {
  // Read the CSV file
  const inputFile = 'number.csv';
  const outputFile = 'number1.csv';

  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true; // Flag to skip the first line

  // Create a write stream to the output CSV file
  const outputStream = fs.createWriteStream(outputFile);

  // Process each phone number from the CSV file
  for await (const line of rl) {
    try {
      if (isFirstLine) {
        isFirstLine = false;
        // Write the header line with an additional column
        outputStream.write(`${line}\n`);
        continue; // Skip the first line (header)
      }

      // Split the line by comma (assuming comma-separated values)
      const phoneNumbers = line.split(',');

      // Iterate through each phone number
      for (const phoneNumber of phoneNumbers) {
        // Sanitize the phone number
        const sanitizedNumber = phoneNumber.replace(/[^\d]/g, '');

        // Check if the number is registered on WhatsApp
        const isRegistered = await isNumberOnWhatsapp(sanitizedNumber);

        if (isRegistered) {
          // Write the line with the phone number and validity information
          const outputLine = `${phoneNumber}\n`;
          outputStream.write(outputLine);
        }
      }
    } catch (error) {
      console.error('An error occurred while processing the phone numbers:', error);
    }
  }

  // Close the output stream
  outputStream.end();
  console.log('Bulk phone number checking completed.');
}

// Function for checking if number is registered on WhatsApp
async function isNumberOnWhatsapp(number) {
  try {
    const isRegistered = await client.isRegisteredUser(number);
    return isRegistered;
  } catch (error) {
    console.error('An error occurred while checking the number:', error);
    return false;
  }
}
