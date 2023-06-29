const wppconnect = require('@wppconnect-team/wppconnect');
const fs = require('fs');
const csv = require('csv-parser');

const sessionPath = 'tokens/session';

if (fs.existsSync(sessionPath)) {
  fs.rmSync(sessionPath, { recursive: true });
}

// Read the CSV file and sanitize the phone numbers
const phoneNumbers = [];
fs.createReadStream('numbers.csv')
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
  .on('end', async () => {
    try {
      const client = await wppconnect.create();
      console.log("WPPConnect session ready!");

      const messageText = "We are conducting an opinion poll for the Indore people; this is a paid survey in which you will be paid after the survey is done. If you are from Indore and interested to fill the survey and earn pls reply \nINTERESTED."; // Update with your desired message

      // Create a function to check if a phone number is valid and send a message if valid
      const validateAndSendMessage = async (client, phoneNumber, messageText) => {
        return new Promise((resolve, reject) => {
          client.checkNumberStatus(phoneNumber)
            .then((isValid) => {
              if (isValid) {
                client.sendText(phoneNumber, messageText)
                  .then((response) => {
                    console.log(`Message sent to ${phoneNumber}`);
                    console.log(response);
                    resolve(); // Resolve the promise after sending the message
                  })
                  .catch((error) => {
                    console.error(`Failed to send message to ${phoneNumber}:`, error);
                    reject(error); // Reject the promise if there's an error
                  });
              } else {
                console.log(`Phone number ${phoneNumber} is invalid. Skipping message send.`);
                resolve(); // Resolve the promise without sending the message
              }
            })
            .catch((error) => {
              console.error(`Failed to check number status for ${phoneNumber}:`, error);
              reject(error); // Reject the promise if there's an error
            });
        });
      };

      // Iterate over the phone numbers and validate/send messages with a sleep between each message
      for (const phoneNumber of phoneNumbers) {
        await validateAndSendMessage(client, phoneNumber, messageText);
        await delay(Math.random() * 9000 + 5000); // Sleep for 1.5 to 3 seconds (1500 to 3000 milliseconds)
      }

      // Close the session after all messages have been sent
      setTimeout(async () => {
        await client.close();
        console.log("Session closed.");
      }, 30000); // Wait for 30 seconds before closing the session

      console.log("Bulk messages sending...");
    } catch (error) {
      console.error(error);
    }
  });

function delay(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
