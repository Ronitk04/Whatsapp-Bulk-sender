const qrcode = require('qrcode-terminal');
const { Client, DefaultOptions } = require('whatsapp-web.js');

// Create a new client
const client = new Client({
  ...DefaultOptions
});

// Event: QR code generated
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

// Event: Ready to send messages
client.on('ready', async () => {
  console.log('Client is ready!');

  const number = '9826914255'; // Replace with the Indian phone number you want to send the message to
  const message = 'Hello, this is a test message!';

  // Transform the phone number to the WhatsApp format
  const transformedNumber = transformPhoneNumber(number);

  // Check if the number is registered on WhatsApp
  const isRegistered = await client.isRegisteredUser(transformedNumber);

  if (isRegistered) {
    // Number is registered, send the message
    client.sendMessage(transformedNumber, message).then(() => {
      console.log('Message sent successfully.');
      // Close the client after sending the message
      client.destroy();
    }).catch(error => {
      console.error('Failed to send message:', error);
      client.destroy();
    });
  } else {
    // Number is not registered on WhatsApp
    console.log('The number is not registered on WhatsApp.');
    client.destroy();
  }
});

// Initialize the client and generate QR code for authentication
client.initialize();

// Handle program termination
process.on('SIGINT', async () => {
  if (client) {
    await client.destroy();
  }
  process.exit(0);
});

// Function to transform the phone number to WhatsApp format
function transformPhoneNumber(phonenumber) {
  if (!phonenumber || phonenumber.indexOf('@c.us') > -1) {
    return phonenumber;
  }
  if (!phonenumber.startsWith('91')) {
    phonenumber = '91' + phonenumber.replace(/[^0-9]/g, '');
  }

  phonenumber = phonenumber.trim().replace(/[^a-zA-Z0-9]/g, '');

  phonenumber = phonenumber + '@c.us';
  return phonenumber;
}
