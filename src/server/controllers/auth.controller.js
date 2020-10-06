const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const config = require('../../config');
const utils = require('../utils');

const authController = {
  signin: (req, res, next) => {
    // Find user with data provided in req object
    const query = utils.userQuery(req);
    if (!query) {
      const error = new ReferenceError(
        `Email or userName not provided, instead get: ${query}`,
      );
      error.httpStatusCode = 404;
      return next(error);
    }
    User.findOne(query, async (error, user) => {
      if (error) {
        error.httpStatusCode = 500; // Internal Server Error
        return next(error);
      }
      if (!user) {
        let error = new Error(
          `User account for '${
            query.email ? query.email : query.userName
          }', was not found.`,
        );
        error.name = 'NotFoundError';
        error.httpStatusCode = 404; // Not found
        return next(error);
      }
      try {
        const _user = await user.authenticate(req.body.password);
        if (!_user.isAuthenticated) {
          let error = new Error("User and password don't match.");
          error.name = 'AuthenticateError';
          error.httpStatusCode = 401; // Unauthorized
          return next(error);
        }
        if (!_user.isActive) {
          let error = new Error('Inactive user. Contact an administrator');
          error.name = 'AuthorizeError';
          error.httpStatusCode = 403; // Forbidden
          return next(error);
        }
        const tokenExpIn = Math.floor((Date.now() + config.jwt.expTime) / 1000);
        const token = jwt.sign(
          {
            _id: user._id,
            aud: config.jwt.audience,
            iss: config.jwt.issuer,
            exp: tokenExpIn,
          },
          config.jwt.SECRET,
        );
        res.cookie(config.cookie.name, token, config.cookie.options);
        return res.status(200).json({
          message: `Successfully signed in for account '${req.body.user}'.`,
          user: user.getSafeData(),
          token,
        });
      } catch (error) {
        error.httpStatusCode = 500;
        return next(error);
      }
    });
  },
  signout: (req, res, next) => {
    res.clearCookie(config.cookie.name, config.cookie.options);
    return res.status(200).json({
      message: 'Signed out.',
    });
  },
  requireSignin: (req, res, next) => {
    const token = utils.getToken(req);
    if (!token) {
      const error = new Error(`Missing credentials, please do login.`);
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    jwt.verify(
      token,
      config.jwt.SECRET,
      {
        audience: config.jwt.audience,
        issuer: config.jwt.issuer,
        maxAge: config.jwt.expTime / 1000,
      },
      (error, decoded) => {
        if (error) {
          error.httpStatusCode = 403; // Forbidden
          return next(error);
        }
        req.auth = decoded;
        next();
      },
    );
  },
  hasAuthorization: (req, res, next) => {
    const authorized =
      req.profile && req.auth && req.profile._id.toString() === req.auth._id;
    if (!authorized) {
      const error = new Error(`User ${req.profile.userName} not authorized.`);
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    next();
  },
  isAdmin: (req, res, next) => {
    const id = req.profile._id;
    Admin.findById(id, (error, result) => {
      if (error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      if (!result) {
        const error = new Error('Permission denied for user: ', id);
        error.name = 'AuthorizeError';
        error.httpStatusCode = 403;
        return next(error);
      }
      return next();
    });
  },
  validateCaptcha: (req, res, next) => {
    if (!req.body || !req.body['g-recaptcha-response']) {
      const error = new Error('Fail to get reCaptcha data');
      error.name = 'AuthorizeError';
      error.httpStatusCode = 400; // Bad Request
      return next(error);
    }
    utils
      .verifyCaptcha(
        req.body['g-recaptcha-response'],
        req.headers['x-forwarded-for'],
      )
      .then((result) => {
        if (!result.success) {
          const error = new Error('Invalid captcha, please try again.');
          error.name = 'AuthorizeError';
          error.httpStatusCode = 400; // Bad Request
          return next(error);
        }
        next();
      })
      .catch((error) => {
        error.httpStatusCode = 500; // Server Error
        return next(error);
      });
  },
  activate: (req, res, next) => {
    const token = utils.getToken(req);
    if (!token) {
      // Token not present in request, send API Error message.
      const error = new Error(
        `No token provided in request, please contact an administrator.`,
      );
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    const email = req.query.email;
    if (!email) {
      // Email not present in request, send API Error message.
      const error = new Error(
        `No email provided in request, please contact an administrator.`,
      );
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    if (
      !req.query.activate ||
      !(req.query.activate === 'true' || req.query.activate === 'false')
    ) {
      // Missing action or invalid action in request, send API Error message (Do I need send a template instead?)
      const error = new Error(
        `No action provided in request or invalid action, please contact an administrator.`,
      );
      error.name = 'AuthorizeError';
      error.httpStatusCode = 403; // Forbidden
      return next(error);
    }
    //check token
    jwt.verify(
      token,
      config.jwt.VERIFY_EMAIL_SECRET,
      {
        audience: config.jwt.audience,
        issuer: config.jwt.issuer,
        maxAge: config.jwt.emailVerifyExpTime / 1000,
      },
      (error, decoded) => {
        //TODO: if token is not valid, display send new token page using Captcha
        if (error) {
          error.httpStatusCode = 403; // Forbidden
          return next(error);
        }
        req.auth = decode;
        next();
      },
    );
  },
  redirectActivated: (req, res, next) => {
    if (!req.auth) {
      const error = new Error('No authorization gathered, please try again');
      error.name = 'AuthorizeError';
      error.httpStatusCode = 400; // Bad Request
      return next(error);
    }
    const redirectURI =
      (req.query && req.query.redirect) || config.env.LOGIN_REDIRECT_URI;
    return res.status(200).json({
      message: `Redirected to: ${redirectURI}`,
      redirect: true,
      url: redirectURI,
    });
  },
};

module.exports = authController;
