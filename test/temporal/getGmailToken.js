const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const tokensPath = path.join(__dirname, '../../src/server/helpers/tokens.json');

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_OAUTH_CLIENT_ID,
  process.env.GMAIL_OAUTH_CLIENT_SECRET,
  process.env.GMAIL_OAUTH_REDIRECT_URL,
);

const onToken = (tokens) => {
  console.log(`A 'tokens' event was occured on ${new Date()}.`);
  if (tokens.refresh_token) {
    fs.writeFile(tokensPath, JSON.stringify(tokens, null, 2), (error) => {
      if (error) throw error;
      console.log(`Refresh token successfully updated on ${new Date()}`);
    });
  }
};

const readTokens = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: 'utf8', flag: 'r' }, (error, dataStr) => {
      if (error) {
        console.error(`Error reading tokens file: ${error.message}.`);
        return reject(error);
      }
      const data = JSON.parse(dataStr);
      const expires = data.expiry_date;
      if (new Date() < new Date(expires - 30000)) {
        // If token is not about to expire in the next 30 secs
        const token = data.access_token;
        const refresh = data.refresh_token;
        return resolve({ token, expires, refresh });
      }
      oauth2Client.getAccessToken().then((result) => {
        const { data } = result.res;
        updateAccessToken(path, data)
          .then((result) => {
            const { token, expires, refresh } = result;
            return resolve({ token, expires, refresh });
          })
          .catch((error) => {
            console.error('Something went wrong.');
            return reject(error);
          });
      });
    });
  });
};

const updateAccessToken = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(data, null, 2), (error) => {
      if (error) {
        console.error(`Error saving tokens file: ${error.message}.`);
        return reject(error);
      }
      const token = data.access_token;
      const expires = data.expiry_date;
      const refresh = data.refresh_token;
      resolve({ token, expires, refresh });
    });
  });
};

oauth2Client.on('tokens', onToken);

const getToken = async () => {
  try {
    const { token, expires, refresh } = await readTokens(tokensPath);
    oauth2Client.setCredentials({
      refresh_token: refresh,
    });
    return { token, expires, refresh };
  } catch (e) {
    console.error(e);
  }
};

getToken().then(console.log).catch(console.error);

module.exports = getToken;
