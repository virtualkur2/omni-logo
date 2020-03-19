const nodemailer = require('nodemailer');
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
  try {
    const result = await oauth2Client.getAccessToken();
    const token = result.token;
    if(result.res && result.res.data) {
      if(process.env.GMAIL_OAUTH_REFRESH_TOKEN !== result.res.data.refresh_token) {
        process.env.GMAIL_OAUTH_REFRESH_TOKEN = result.res.data.refresh_token;
      }
      process.env.GMAIL_OAUTH_TOKEN_EXPIRY_DATE = result.res.data.expiry_date;
    }
    const expiry_date = process.env.GMAIL_OAUTH_TOKEN_EXPIRY_DATE;
    return { token, expiry_date};
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

const gmailHelper = {
  send: (recipient, subject, body) => new Promise((resolve, reject) => {
    if(!recipient || !subject || !body) {
      const error = new Error(`Recipient, subject and body required.`);
      error.name = 'ActivateEmailError';
      error.httpStatusCode = 500;
      return reject(error);
    }
    getToken().then(result => {
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
          expires: result.expiry_date
        }
      });
      const mailOptions = {
        from: process.env.GMAIL_ADDRESS,
        to: recipient,
        subject: subject,
        generateTextFromHTML: true,
        html: body
      }
      transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
          console.error(error.message);
          return reject(error);
        }
        const closed = transporter.close();
        resolve(info);
      });
    })
    .catch(error => {
      console.error(error.message);
      return reject(error);
    });
  })
}

module.exports = gmailHelper;
