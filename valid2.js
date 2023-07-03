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
  .on('end', () => {
    wppconnect.create()
      .then(async (client) => {
        console.log("WPPConnect session ready!");

        // Create a function to check if a phone number is valid and send a message if valid
        const validateAndSendMessage = async (client, phoneNumber, messageText) => {
          return new Promise((resolve, reject) => {
            client.checkNumberStatus(phoneNumber)
              .then((isValid) => {
                if (isValid) {
                  const messageF = `${'Hi '}${phoneNumber}\n${messageText} `;
                  blockingDelay(Math.random() * 5000 + 4*60000) // Random delay between 5000 and 15000 milliseconds
                    .then(() => {
                      client.sendText(phoneNumber, messageF)
                        .then((response) => {
                          console.log(`Message sent to ${phoneNumber}`);
                          console.log(response);
                          resolve(); // Resolve the promise after sending the message
                        })
                        .catch((error) => {
                          console.error(`Failed to send message to ${phoneNumber}:`, error);
                          reject(error); // Reject the promise if there's an error
                        });
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

        const hexCode = Math.random().toString(16).substring(2, 10).toUpperCase();
        const message = 'Attention Rajasthan residents! Participate in our survey and get rewarded for your valuable opinions! 📝💪\n Claim your rewards now: [Link: https://forms.gle/JtmZaz3pTwbKuKjK8 ] \n'
        const messageWithHexCode = `${message} \n\n[${hexCode}]`;

        // Iterate over the phone numbers and validate/send messages with a random interval
        const sendMessageWithDelay = async (phoneNumber) => {
          await validateAndSendMessage(client, phoneNumber, messageWithHexCode);
          await blockingDelay(Math.random() * 5000 + 1000); // Random delay between 5000 and 15000 milliseconds
        };

        const sendMessagesSequentially = async () => {
          for (const phoneNumber of phoneNumbers) {
            await sendMessageWithDelay(phoneNumber);
          }
        };

        sendMessagesSequentially()
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

function blockingDelay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
