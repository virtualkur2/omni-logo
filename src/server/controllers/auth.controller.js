const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../../config');
const cookieParser = require('cookie-parser');

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const authController = {
  signin: (req, res, next) => {
    // Find user with data provided in req object
    const query = {};
    if(emailRegex.test(req.body.user)) {
      query.email = req.body.user;
    } else {
      query.userName = req.body.user;
    }
    User.findOne(query, async (error, user) => {
      if(error) {
        error.httpStatusCode = 500; // Internal Server Error
        return next(error);
      }
      if(!user) {
        let error = new Error(`User account for '${req.body.user}', was not found.`);
        error.name = 'NotFoundError';
        error.httpStatusCode = 404; // Not found
        return next(error);
      }
      try {
        const _user = await user.authenticate(req.body.password);
        if(!_user.isAuthenticated) {
          let error = new Error('User and password don\'t match.');
          error.name = 'AuthenticateError';
          error.httpStatusCode = 401; // Unauthorized
          return next(error);
        }
        if(!_user.isActive) {
          let error = new Error('Inactive user. Contact an administrator');
          error.name = 'AuthorizeError';
          error.httpStatusCode = 403; // Forbidden
          return next(error);
        }
        const tokenExpIn = Math.floor((Date.now() + config.jwt.expTime)/1000);
        const token = jwt.sign({aud: user._id, exp: tokenExpIn, iss: config.jwt.issuer}, config.jwt.SECRET);
        res.cookie(config.cookie.name, token, config.cookie.options);
        console.log('Sign in res.cookie:');
        console.log(res.cookie);
        return res.status(200).json({
          message: `Successfully signed in for account '${req.body.user}'.`,
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
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    jwt.verify(token, config.jwt.SECRET, {audience: req.profile._id, issuer: config.jwt.issuer, maxAge: config.jwt.expTime/1000}, (error, decoded) => {
      if(error) {
        error.httpStatusCode = 403; // Forbidden
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
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    next();
  },
  verifyEmail: (req, res, next) => {
    const token = getToken(req);
    // TODO: next lines are very repetitive, please create an Error Class
    if(!token) {
      // Token not present in request, send API Error message (Do I need send a template instead?)
      const error = new Error(`No token provided in request, please contact an administrator.`);
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    const email = req.query.email;
    if(!email) {
      // Email not present in request, send API Error message (Do I need send a template instead?)
      const error = new Error(`No email provided in request, please contact an administrator.`);
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    const activate = req.query.activate;
    if(!activate || !(activate === 'true' || activate === 'false')) {
      // Missing action or invalid action in request, send API Error message (Do I need send a template instead?)
      const error = new Error(`No action provided in request or invalid action, please contact an administrator.`);
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    //check token
    jwt.verify(token, config.jwt.VERIFY_EMAIL_SECRET, {audience: email, issuer: config.jwt.issuer, maxAge: config.jwt.emailVerifyExpTime/1000}, (error, decoded) => {
      //TODO: if token is not valid, display send new token page using Captcha
      if(error) {
        error.httpStatusCode = 403; // Forbidden
        return next(error);
      }
      req.auth = decoded;
      next();
    });
  },
  devRead: (req, res, next) => {
    if(!req.query.dev || !(req.query.dev === 'true')) {
      const error = new Error('A parameter is missing, please try again.');
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    next();
  }
}

const getToken = (req) => {
  console.log(req.signedCookies);
  console.log(req.cookies);
  if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } else if(req.query && req.query.token) {
    return req.query.token;
  } else if(req.signedCookies) {
    let token = undefined;
    Object.keys(req.signedCookies).forEach(cookieName => {
      console.log(cookieName);
      console.log(config.cookie.name);
      if(cookieName === config.cookie.name) {
        token = req.signedCookies[config.cookie.name];
      }
    });
    console.log('token: ', token);
    return token;
  } else {
    return;
  }
}

module.exports = authController;
