const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_OAUTH_CLIENT_ID,
  process.env.GMAIL_OAUTH_CLIENT_SECRET,
  process.env.GMAIL_OAUTH_REDIRECT_URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_OAUTH_REFRESH_TOKEN
});

const getToken = async () => {
  const result = await oauth2Client.getAccessToken();
  const token = result.token;
  const data = result.res.data;
  return { token, data};
}

module.exports = getToken;