const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const gmailHelper = require('../helpers/gmail.helper');
const config = require('../../config');
const utils = require('../utils');

const userController = {
  create: (req, res, next) => {
    const user = new User(req.body);
    if(user.active) {
      user.active = !user.active;
    }
    user.save((error, newUser) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      req.user = newUser.getSafeData();
      next();
    });
  },
  read: (req, res, next) => {
    if(!req.profile || !req.profile.getSafeData) {
      const error = new Error('Something went wrong with request.');
      error.name = 'RequestError';
      error.httpStatusCode = 400;
      return next(error);
    }
    return res.status(200).json({
      message: 'Request successfull.',
      user: req.profile.getSafeData(),
    });
  },
  update: (req, res, next) => {
    let user = req.profile;
    user = Object.assign(user, req.body);
    user.save((error, result) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      // TODO: check results
      return res.status(201).json({
        message: `User ${result.userName} successfully saved.`,
        user: result.getSafeData()
      });
    });
  },
  remove: (req, res, next) => {
    let user = req.profile;
    user.remove((error, deletedUser) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      if(!deletedUser) {
        const error = new Error('Something wrong with request.');
        error.name = 'RequestError';
        error.httpStatusCode = 400;
        return next(error);
      }
      return res.status(201).json({
        message: `User ${deletedUser.userName} successfully deleted.`
      });
    });
  },
  userById: (req, res, next, id) => {
    User.findById(id, (error, user) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      if(!user) {
        const error = new Error(`No such user: ${id}.`);
        error.name = 'NotFoundError';
        error.httpStatusCode = 404;
        return next(error);
      }
      req.profile = user;
      next();
    });
  },
  userByEmail: (req, res, next, email) => {
    User.find({email: email}, (error, users) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      if(Array.isArray(users) && users.length === 0) {
        const error = new Error(`No such user: ${email}.`);
        error.name = 'NotFoundError';
        error.httpStatusCode = 404;
        return next(error);
      }
      if(Array.isArray(users) && users.length > 1) {
        const error = new Error(`It's more than one such user: ${email}`);
        error.name = 'AmbiguousResultError';
        error.httpStatusCode = 418;
        return next(error);
      }
      req.profile = users[0];
      next();
    });
  },
  activate: (req, res, next) => {
    const token = utils.getToken(req);
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
    if(!req.query.activate || !(req.query.activate === 'true' || req.query.activate === 'false')) {
      // Missing action or invalid action in request, send API Error message (Do I need send a template instead?)
      const error = new Error(`No action provided in request or invalid action, please contact an administrator.`);
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    //check token
    jwt.verify(token, config.jwt.VERIFY_EMAIL_SECRET, {audience: config.jwt.audience, issuer: config.jwt.issuer, maxAge: config.jwt.emailVerifyExpTime/1000}, (error, decoded) => {
      //TODO: if token is not valid, display send new token page using Captcha
      if(error) {
        error.httpStatusCode = 403; // Forbidden
        return next(error);
      }
      req.auth = decode;
      next();
    });
  },
  redirectLogin: (req, res, next) => {
    if(req.auth) {
      console.log(`req.auth: ${req.auth}`);
    }
    if(req.query && req.query.redirect) {
      console.log(`req.query.redirect: ${req.query.redirect}`);
    }
    const redirectURI = (req.query && req.query.redirect) || config.env.LOGIN_REDIRECT_URI;
    return res.status(200).json({
      message: `Redirected to: ${redirectURI}`
    });
  }
}

module.exports = userController;
