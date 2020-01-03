require('dotenv').config();
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_OAUTH_CLIENT_ID,
  process.env.GMAIL_OAUTH_CLIENT_SECRET,
  process.env.GMAIL_OAUTH_REDIRECT_URL
);

const GMAIL_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send'
]

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: GMAIL_SCOPES
});

console.info(`authURL: ${url}`);

// https://omnipc.ddns.net/?code=4/vAE2WG8-pnt5cRlKzJu0BANXFBA8CqHuZ_0MmlN0Qt5aUpno66nEf16J1cq5d50hdB2aAbeARwtAhgrQic-e2pU&scope=https://mail.google.com/%20https://www.googleapis.com/auth/gmail.send%20https://www.googleapis.com/auth/gmail.compose%20https://www.googleapis.com/auth/gmail.modify
// code: 4/vAE2WG8-pnt5cRlKzJu0BANXFBA8CqHuZ_0MmlN0Qt5aUpno66nEf16J1cq5d50hdB2aAbeARwtAhgrQic-e2pU