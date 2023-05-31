const wppconnect = require('@wppconnect-team/wppconnect');
const fs = require('fs');
const csv = require('csv-parser');

const sessionPath = 'tokens/session';

if (fs.existsSync(sessionPath)) {
  fs.rmSync(sessionPath, { recursive: true });
}

// Read the CSV file and sanitize the phone numbers
const phoneNumbers = [];
fs.createReadStream('Indore/Amit_indore.csv')
  .pipe(csv())
  .on('data', (data) => {
    let phoneNumber = data['Phone Numbers']; // Assuming 'Phone Number' is the column header
    phoneNumber = phoneNumber.replace(/\D/g, ''); // Remove all non-digit characters
    if (phoneNumber.length === 10) {
      phoneNumber = '91' + phoneNumber; // Add '91' prefix for 10-digit numbers
    }
    if (phoneNumber.length === 12 && phoneNumber.startsWith('+')) {
      phoneNumber = phoneNumber.slice(1); // Remove '+' prefix for 12-digit numbers
    }
    phoneNumbers.push(phoneNumber);
  })
  .on('end', () => {
    wppconnect.create()
      .then(async (client) => {
        console.log("WPPConnect session ready!");

        // Create a function to check if a phone number is valid and send a message if valid
        const validateAndSendMessage = async (client, phoneNumber, messageText) => {
          return new Promise((resolve, reject) => {
            setTimeout(async () => {
              try {
                const response = await client.sendText(phoneNumber, messageText);
                console.log(`Message sent to ${phoneNumber}`);
                console.log(response);
                resolve(); // Resolve the promise after sending the message
              } catch (error) {
                console.error(`Failed to send message to ${phoneNumber}:`, error);
                reject(error); // Reject the promise if there's an error
              }
            }, Math.random() * 100000 + 5000); // Random interval between 5000 and 15000 milliseconds
          });
        };

        // const messageText = "Hello, world!"; // Replace with your desired message
        const messageText = "Greetings from Survey Duniya.\nFill and earn.\nThis is freelance survey work, fill the survey carefully and get Rs. 40 sent on your upi id immediately.\nLocation: Indore\nhttps://docs.google.com/forms/d/e/1FAIpQLSeweKxwzrRKQrLXlJ7wsdGjL-FT-eFskDthM-xmGuwjV0Kdew/viewform"; // Update with your desired message

        // Iterate over the phone numbers and validate/send messages with a random interval
        const promises = phoneNumbers.map(async (phoneNumber) => {
          await validateAndSendMessage(client, phoneNumber, messageText);
        });

        // Wait for all messages to be sent
        Promise.all(promises)
          .then(() => {
            // Close the session after all messages have been sent
            setTimeout(async () => {
              await client.close();
              console.log("Session closed.");
            }, 30000); // Wait for 30 seconds before closing the session
          })
          .catch((error) => {
            console.log(error);
          });

        console.log("Bulk messages sending...");
      })
      .catch((error) => {
        console.log(error);
      });
  });
