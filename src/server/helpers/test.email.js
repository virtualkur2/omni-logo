require('dotenv').config();
const jwt = require('jsonwebtoken');
const config = require('../../config');
const gmailHelper = require('./gmail.helper');

const tokenExpIn = Math.floor((Date.now() + config.jwt.emailVerifyExpTime)/1000);
const recipient = 'virtual.kur2@gmail.com';
const activateToken = jwt.sign({aud: recipient, exp: tokenExpIn, iss: config.jwt.issuer}, config.jwt.VERIFY_EMAIL_SECRET);
const activateURI = config.env.ACTIVATE_EMAIL_URI;

gmailHelper.sendMail(recipient, activateToken, activateURI)
  .then(info => {
    console.log(info);
  })
  .catch(error => {
    console.log(error);
  });
