require('dotenv').config();
const { google } = require('googleapis');

const code = '4/vAE2WG8-pnt5cRlKzJu0BANXFBA8CqHuZ_0MmlN0Qt5aUpno66nEf16J1cq5d50hdB2aAbeARwtAhgrQic-e2pU';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_OAUTH_CLIENT_ID,
  process.env.GMAIL_OAUTH_CLIENT_SECRET,
  process.env.GMAIL_OAUTH_REDIRECT_URL
);

const getToken = async () => {
  const { tokens } = await oauth2Client.getToken(code);
  console.info(tokens);
}

getToken();

// {
//   access_token: 'ya29.Il-4ByorijV0jgnFBmOwNyQJPDiSHWmlG6jI0GVzE4NkZQR_l7tjf59H3XTc1asLzfs57YKgEe0gbMlTYMwywVx_uQZFpqEQuKWdCM_Vm2l4Zq0TlYq4HwYtJ_cqWD0-zA',
//   refresh_token: '1//03s94OvvKQ5P2CgYIARAAGAMSNwF-L9IrcaJqV3M8MhwaGDoDrqCdcX24WEZWismBwAABFd1415l0ArZtdnt-8HBG5pVqtQ9hFxU',
//   scope: 'https://www.googleapis.com/auth/gmail.send https://mail.google.com/ https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.modify',
//   token_type: 'Bearer',
//   expiry_date: 1578065612810
// }
