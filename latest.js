const wppconnect = require('@wppconnect-team/wppconnect');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

function delay(ms) {
  const date = Date.now();
  let currentDate = null;

  do {
    currentDate = Date.now();
  } while (currentDate - date < ms);
}

const moveTokensFolder = async (fromFolderName, toFolderName) => {
  const currentFolderPath = path.resolve(__dirname, fromFolderName, 'tokens');
  const newFolderPath = path.resolve(__dirname, toFolderName, 'tokens');
  fs.renameSync(currentFolderPath, newFolderPath);
  delay(5000);
};

const sendMessage = async (client, phoneNumber, message, sessionName) => {
  try {
    const response = await client.sendText(phoneNumber, message);
    console.log(`Message sent from ${sessionName}:`, response);
  } catch (error) {
    console.error(`Failed to send message from ${sessionName}:`, error);
  }
};

const createAndSendMessage = async (sessionName, phoneNumbers) => {
  const client = await wppconnect.create({
    session: sessionName,
    tokenStore: 'file',
    folderNameToken: `./tokens`,
  });

  for (let i = 0; i < phoneNumbers.length; i++) {
    const phoneNumber = phoneNumbers[i].replace(/\s/g, '').replace(/\+|-/g, '');
    await sendMessage(client, phoneNumber, `We are conducting an opinion poll for the Indore people; this is a paid survey in which you will be paid after the survey is done. If you are from Indore and interested to fill the survey and earn pls reply \nINTERESTED..`, sessionName);
    delay(Math.random() * 2000);
  }

  await client.close();
};

const main = async () => {
  const phoneNumbers = [];
  fs.createReadStream('test_indore_valid_2.csv')
    .pipe(csv())
    .on('data', (data) => {
      phoneNumbers.push(data['Phone Numbers']);
    })
    .on('end', async () => {
      const moveFolders = ['Move1', 'Move2','Move3'];
      const sessions = ['session_1', 'session_2', 'session_3'];

      let currentIndex = 0;
      while (phoneNumbers.length > 0) {
        const fromFolderName = moveFolders[currentIndex];
        await moveTokensFolder(fromFolderName, '.');
        const numMessagesToSend = Math.floor(Math.random() * 6) + 5;

        const sessionName = sessions[currentIndex];
        await createAndSendMessage(sessionName, phoneNumbers.slice(0, numMessagesToSend));
        phoneNumbers.splice(0, numMessagesToSend);

        await moveTokensFolder('.', fromFolderName);

        currentIndex = (currentIndex + 1) % moveFolders.length;
      }
    });
};

main().catch((error) => {
  console.error('Error:', error);
});
