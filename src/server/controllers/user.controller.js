const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const gmailHelper = require('../helpers/gmail.helper');
const config = require('../../config');

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
      const tokenExpIn = Math.floor((Date.now() + config.jwt.emailVerifyExpTime)/1000);
      const activateToken = jwt.sign({_id: user._id, aud: config.jwt.audience, iss: config.jwt.issuer, exp: tokenExpIn,}, config.jwt.VERIFY_EMAIL_SECRET);
      const activateURI = config.env.ACTIVATE_EMAIL_URI;
      gmailHelper.sendMail(user.email, activateToken, activateURI)
        .then(info => {
          console.info(info);
          return res.status(201).json({
            message: `User created successfully.`,
            user: newUser.getSafeData(),
          });
        })
        .catch(error => {
          error.httpStatusCode = 500;
          return next(error);
        });
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
    const active = req.query.activate === 'true' ? true : false;
    User.findByIdAndUpdate(req.auth._id, {$set: {active: active}}, {new: true}, (error, user) => {
      if(error) {
        error.httpStatusCode(500);
        return next(error);
      }
      return res.status(201).json({
        message: `User account for ${user.userName} successfully updated.`,
        user: user.getSafeData(),
      });
    });
    
  },
  devRead: (req, res, next) => {
    User.find({}, (error, results) => {
      if(error) {
        error.httpStatusCode = 500;
        return next(error);
      }
      console.info('Development read of documents in Users collection.');
      return res.status(200).json(results);
    });
  }
}

module.exports = userController;
