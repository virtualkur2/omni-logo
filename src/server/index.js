const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const config = require('../config');
const routes = require('./routes');
const errorHelper = require('./helpers/error.helper');

const router = express.Router();
const server = () => {
  const app = express();
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true}));
  app.use(cookieParser(config.cookie.SECRET));
  app.use(routes(router));
  app.use(errorHelper);
  return app;
}

module.exports = server;