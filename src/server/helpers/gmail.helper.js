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
  const result = await oauth2Client.getAccessToken();
  const token = result.token;
  const data = result.res.data;
  if(process.env.GMAIL_OAUTH_REFRESH_TOKEN !== data.refresh_token) {
    process.env.GMAIL_OAUTH_REFRESH_TOKEN = data.refresh_token;
  }
  return { token, data};
}

const createTemplate = (activationRecipient, activateToken, activationURI) => {
  return `
    <h3>Bienvenido a <a href="https://omnipc.ddns.net">OmniPC Sistemas</a></h3>
    <p>Por favor haga clic en el siguiente enlace para activar su cuenta:</p>
    <a href="${activationURI}?token=${activateToken}&email=${activationRecipient}&activate=true">Activar cuenta en OmniPC</a>
    <p>Gracias por su confianza.</p>
  `;
}

const gmailHelper = {
  sendMail: (recipient, activateToken, activateURI) => new Promise((resolve, reject) => {
    if(!recipient || !activateToken || !activateURI) {
      const error = new Error(`${!recipient ? 'Recipient' : (!activateToken ? 'Activate Token' : 'Activate URI')} required.`);
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
          expires: result.data.expiry_date
        }
      });
      const mailOptions = {
        from: process.env.GMAIL_ADDRESS,
        to: recipient,
        subject: 'OmniPC Server account activation',
        generateTextFromHTML: true,
        html: createTemplate(recipient, activateToken, activateURI)
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
