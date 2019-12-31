const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const config = require('../../config');

const auth = {
  signin: (req, res, next) => {
    // Find user with data provided in req object
    User.findOne({email: req.body.email}, async (error, user) => {
      if(error) {
        error.httpStatusCode = 500; // Internal Server Error
        return next(error);
      }
      if(!user) {
        let error = new Error(`User account for ${req.body.email}, was not found.`);
        error.name = 'NotFoundError';
        error.httpStatusCode = 404; // Not found
        return next(error);
      }
      try {
        const _user = await user.authenticate(req.body.password);
        if(!_user.isAuhtenticated) {
          let error = new Error(`User and password don't match.`);
          error.name = 'AuthenticateError';
          error.httpStatusCode = 401; // Unauthorized
          return next(error);
        }
        if(!_user.isActive) {
          let error = new Error(`Inactive user. Contact an administrator`);
          error.name = `AuthorizeError`;
          error.httpStatusCode = 403; // Forbiden
          return next(error);
        }
        const tokenExpIn = Math.floor((Date.now() + config.jwt.expTime)/1000);
        const token = jwt.sign({aud: user._id, exp: tokenExpIn, iss: config.jwt.issuer}, config.jwt.SECRET);
        res.cookie(config.cookie.name, token, config.cookie.options);
        return res.status(200).json({
          message: `Successfully signed in for account ${user.userName} .`,
          user: user.getSafeData(),
          token,
        });
      } catch(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
    });
  },
  signout: (req, res, next) => {
    res.clearCookie(config.cookie.name, config.cookie.options);
    return res.status(200).json({
      message: 'Signed out.'
    });
  },
  requireSignin: (req, res, next) => {
    const token = getToken(req);
    if(!token) {
      const error = new Error(`Missing credentials, please do login.`);
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403;
      return next(error);
    }
    jwt.verify(token, config.jwt.SECRET, {audience: req.profile._id, issuer: config.jwt.issuer, maxAge: config.jwt.expTime/1000}, (error, decoded) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      req.auth = decoded;
      next();
    });
  },
  hasAuthorization: (req, res, next) => {
    const authorized = req.profile && req.auth && (req.profile._id === req.auth.aud);
    if(!authorized) {
      const error = new Error(`User ${req.profile.userName} not authorized.`);
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403;
      return next(error);
    }
    next();
  }
}

const getToken = (req) => {
  console.log('Signed cookies:');
  console.log(req.signedCookies);
  if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } else if(req.query && req.query.token) {
    return req.query.token;
  } else if(req.signedCookies && req.signedCookies.name === config.cookie.name) {
    return req.signedCookies.token;
  } else {
    return;
  }
}

module.exports = auth;