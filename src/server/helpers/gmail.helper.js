const nodemailer = require('nodemailer');

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
    accessToken: process.env.GMAIL_OAUTH_ACCESS_TOKEN,
    expires: Number.parseInt(process.env.GMAIL_OAUTH_TOKEN_EXPIRE, 10)
  }
});

const gmailHelper = {
  createTemplate: (activateToken, activationURL) => {
    return `
      <h3>Bienvenido a OmniPC Sistemas</h3>
      <p>Por favor haga clic en el siguiente enlace para activar su cuenta:</p>
      <a href="${activationURL}?token=${activateToken}&activate=true">Activar cuenta en OmniPC</a>
      <p>Gracias por su confianza</p>
    `;
  },
  sendMail: mailOptions => new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error) => {
      if(error) {
        console.error(error.stack || error);
        return reject(error);
      }
      resolve();
    })
  })
}

module.exports = gmailHelper;
