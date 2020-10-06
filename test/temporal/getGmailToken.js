const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

const tokensPath = '../../src/server/helpers/tokens.json';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_OAUTH_CLIENT_ID,
  process.env.GMAIL_OAUTH_CLIENT_SECRET,
  process.env.GMAIL_OAUTH_REDIRECT_URL,
);

console.log(`REFRESH_TOKEN_BEFORE: ${require(tokensPath).refresh_token}`);

oauth2Client.setCredentials({
  refresh_token: require(tokensPath).refresh_token,
});

const onToken = (tokens) => {
  if (tokens.refresh_token) {
    fs.writeFile(tokensPath, tokens, (error) => {
      if (error) throw error;
      console.log('Tokens file updated');
      console.log(`REFRESH_TOKEN_AFTER: ${require(tokensPath).refresh_token}`);
    });
  }
};

oauth2Client.on('tokens', onToken);

const getToken = async () => {
  try {
    const result = await oauth2Client.getAccessToken();
    console.log(result);
  } catch (e) {
    console.error(e);
  }
};

getToken();
