const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../../config');
const utils = require('../utils');

const authController = {
  signin: (req, res, next) => {
    // Find user with data provided in req object
    const query = utils.userQuery(req);
    if(!query) {
      const error = new ReferenceError(`Email or userName not provided, instead get: ${query}`);
      error.httpStatusCode = 404;
      return next(error);
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
        const token = jwt.sign({_id: user._id, aud: config.jwt.audience, iss: config.jwt.issuer, exp: tokenExpIn}, config.jwt.SECRET);
        res.cookie(config.cookie.name, token, config.cookie.options);
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
    const token = utils.getToken(req);
    if(!token) {
      const error = new Error(`Missing credentials, please do login.`);
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    jwt.verify(token, config.jwt.SECRET, {audience: config.jwt.audience, issuer: config.jwt.issuer, maxAge: config.jwt.expTime / 1000}, (error, decoded) => {
      if(error) {
        error.httpStatusCode = 403; // Forbidden
        return next(error);
      }
      req.auth = decoded;
      next();
    });
  },
  hasAuthorization: (req, res, next) => {
    const authorized = req.profile && req.auth && (req.profile._id.toString() === req.auth._id);
    if(!authorized) {
      const error = new Error(`User ${req.profile.userName} not authorized.`);
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    next();
  },
}


module.exports = authController;

