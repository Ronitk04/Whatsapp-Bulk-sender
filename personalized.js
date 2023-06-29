const wppconnect = require('@wppconnect-team/wppconnect');
const fs = require('fs');
const csv = require('csv-parser');

const sessionPath = 'tokens/session';

if (fs.existsSync(sessionPath)) {
  fs.rmSync(sessionPath, { recursive: true });
}

// Read the CSV file and sanitize the phone numbers
const phoneNumbers = [];
fs.createReadStream('Indore/Vaibhav_indore.csv')
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

      // Define a function to send personalized messages
      const sendPersonalizedMessage = async (client, phoneNumber) => {
        return new Promise((resolve, reject) => {
          // Customize the message for each phone number
          const messageText = getMessageForPhoneNumber(phoneNumber);

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

      // Iterate over the phone numbers and send personalized messages with a delay between each message
      for (const phoneNumber of phoneNumbers) {
        await sendPersonalizedMessage(client, phoneNumber);
        await delay(Math.random() * 10000 + 10000); // Sleep for 1.5 to 3 seconds (1500 to 3000 milliseconds)
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

function getMessageForPhoneNumber(phoneNumber) {

  // Example: Generating a personalized message based on the last digit of the phone number
  const lastDigit = parseInt(phoneNumber.slice(-1));
  let messageText = "";

  switch (lastDigit) {
    case 0:
      messageText = "📣 Earn Money! Join SurveyDuniya.com! Share your opinion, get paid! 💸✅ Indore residents, participate in our paid survey now: [Link: https://forms.gle/JtmZaz3pTwbKuKjK8 ] Limited slots! Reply to this message to access the survey. 📝🔒 Your valuable opinion counts!.";
      break;
    case 1:
      messageText = "📣 Earn Cash with SurveyDuniya.com! Paid Survey Alert! 💸✅ Indore residents, participate in our exclusive survey, get rewarded! Fill the form: [Link: https://forms.gle/JtmZaz3pTwbKuKjK8 ] Limited slots! Reply now to access the survey. 📝🔒 Your opinion matters!";
      break;
    case 2:
      messageText = "📣 Earn Money! Join SurveyDuniya.com and get paid for your opinion! 💸✅ Indore residents, fill the form now: [Link: https://forms.gle/JtmZaz3pTwbKuKjK8 ] Limited slots! Reply to this message for instant access. 📝🔒 Share your valuable opinion!"
      break;
    case 3:
      messageText = "📣 Cash Opportunity! Join SurveyDuniya.com, a paid survey for Indore residents! 💸✅ Fill the form: [Link: https://forms.gle/JtmZaz3pTwbKuKjK8 ] Limited slots! Reply now to access the survey. 📝🔒 Your opinion is valuable!"
      break;
    case 4:
      messageText = "📣 Earn Money! Participate in SurveyDuniya.com's paid survey for Indore residents! 💸✅ Fill the form: [Link: https://forms.gle/JtmZaz3pTwbKuKjK8] Limited slots! Reply for instant access. 📝🔒 Share your opinion and get rewarded!"
      break;
    case 5:
      messageText = "📣 Earn Cash! Join SurveyDuniya.com's paid survey for Indore residents! 💸✅ Fill the form: [Link: https://forms.gle/JtmZaz3pTwbKuKjK8] Limited slots! Reply now to access the survey. 📝🔒 Your valuable opinion counts!"
      break;
    case 6:
      messageText = "📣 Earn Money! Participate in SurveyDuniya.com's paid survey for Indore residents! 💸✅ Fill the form now: [Link: https://forms.gle/JtmZaz3pTwbKuKjK8] Limited slots! Reply for instant access. 📝🔒 Your opinion matters!"
      break;
    case 7:
      messageText = "📣 Cash Opportunity! Join SurveyDuniya.com's paid survey for Indore residents! 💸✅ Fill the form: [Link: https://forms.gle/JtmZaz3pTwbKuKjK8] Limited slots! Reply for instant access. 📝🔒 Share your opinion!"
      break;
    case 8:
      messageText = "📣 Earn Money! Join SurveyDuniya.com, a paid survey for Indore residents! 💸✅ Fill the form: [Link: https://forms.gle/JtmZaz3pTwbKuKjK8] Limited slots! Reply now for instant access. 📝🔒 Your valuable opinion matters!"
      break;
    case 9:
      messageText = "📣 Earn Cash! Participate in SurveyDuniya.com's paid survey for Indore residents! 💸✅ Fill the form: [Link: https://forms.gle/JtmZaz3pTwbKuKjK8] Limited slots! Reply now"
      break;
    default:
      messageText = "Hello, this is a default personalized message for other phone numbers.";
  }

  return messageText;
}

function delay(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
