const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const config = require('../../config');

const auth = {
  signin: (req, res, next) => {

  },
  signout: (req, res, next) => {

  },
  requireSignin: (req, res, next) => {

  },
  hasAuthorization: (req, res, next) => {

  }
}

module.exports = auth;