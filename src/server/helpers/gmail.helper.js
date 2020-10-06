const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const fs = require('fs');

const tokensPath = './tokens.json';
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_OAUTH_CLIENT_ID,
  process.env.GMAIL_OAUTH_CLIENT_SECRET,
  process.env.GMAIL_OAUTH_REDIRECT_URL,
);

const onTokens = (tokens) => {
  if (tokens.refresh_token) {
    fs.writeFile(tokensPath, tokens, (error) => {
      if (error) {
        console.log('An error ocurred saving refresh token:');
        console.error(error.message);
        throw error;
      }
      console.log('Tokens file updated');
    });
  }
};

oauth2Client.on('tokens', onTokens);

oauth2Client.setCredentials({
  refresh_token: require(tokensPath).refresh_token,
});

const getToken = async () => {
  try {
    const { token, data } = await oauth2Client.getAccessToken();
    const expiry_date = data.expery_date;
    return { token, expiry_date };
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const gmailHelper = {
  send: (recipient, subject, body) =>
    new Promise((resolve, reject) => {
      if (!recipient || !subject || !body) {
        const error = new Error(`Recipient, subject and body required.`);
        error.name = 'ActivateEmailError';
        error.httpStatusCode = 500;
        return reject(error);
      }
      getToken()
        .then((result) => {
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              type: 'OAuth2',
              user: process.env.GMAIL_ADDRESS,
              clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
              clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
              refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
              accessToken: result.token,
              expires: result.expiry_date,
            },
          });
          const mailOptions = {
            from: process.env.GMAIL_ADDRESS,
            to: recipient,
            subject: subject,
            generateTextFromHTML: true,
            html: body,
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error(error.message);
              return reject(error);
            }
            const closed = transporter.close();
            resolve(info);
          });
        })
        .catch((error) => {
          console.error(error.message);
          return reject(error);
        });
    }),
};

module.exports = gmailHelper;
