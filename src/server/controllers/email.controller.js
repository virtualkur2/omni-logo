const jwt = require('jsonwebtoken');
const config = require('../../config');
const gmailHelper = require('../helpers/gmail.helper');
const utils = require('../utils');

const emailController = {
  sendActivateEmail: (req, res, next) => {
    if(!req.user) {
      const error = new Error('No user to send activation email.');
      error.httpStatusCode = 500;
      return next(error);
    }
    const tokenExpIn = Math.floor((Date.now() + config.jwt.emailVerifyExpTime)/1000);
    const token = jwt.sign({_id: req.user._id, aud: config.jwt.audience, iss: config.jwt.issuer, exp: tokenExpIn,}, config.jwt.VERIFY_EMAIL_SECRET);
    const activateURI = config.env.ACTIVATE_EMAIL_URI;
    const redirectURI = config.env.LOGIN_REDIRECT_URI;
    const template = utils.activationTemplate(req.user.email, token, activateURI, redirectURI);
    const subject = 'OmniPC Server account activation';
    gmailHelper.send(req.user.email, subject, template)
        .then(info => {
          console.info(info);
          let message = `Activation email for user: ${req.user.email} sent.`;
          return res.status(201).json({
            message: message,
            user: req.user,
          });
        })
        .catch(error => {
          error.httpStatusCode = 500;
          return next(error);
        });
  }
}

module.exports = emailController;
