const nodemailer = require('nodemailer');
const getToken = require('./gmail.getToken.helper');

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
        .then(({ token, expires, refresh }) => {
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              type: 'OAuth2',
              user: process.env.GMAIL_ADDRESS,
              clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
              clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
              accessToken: token,
              refreshToken: refresh,
              expires: expires,
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
            transporter.close();
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

// DELIMITER $$
// CREATE TRIGGER checksalary_bi BEFORE INSERT ON mytable FOR EACH ROW
// BEGIN
//     DECLARE dummy,notallow INT;
//     SET notallow = 0;
//     IF NEW.salary < 0 THEN
//         SET notallow = 1;
//     END IF;
//     IF notallow = 1 THEN
//         SELECT CONCAT('Cannot Insert This Because Salary ',NEW.salary,' is Invalid')
//         INTO dummy FROM information_schema.tables;
//     END IF;
// END; $$
