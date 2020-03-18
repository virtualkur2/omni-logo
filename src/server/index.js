const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const config = require('../config');
const routes = require('./routes');
const notFoundHelper = require('./helpers/notfound.helper');
const errorHelper = require('./helpers/error.helper');
const setStaticHeader = require('./helpers/static.headers.helper');

const staticOptions = config.serveStatic.options;
staticOptions.setHeaders = setStaticHeader;


const router = express.Router();
const server = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true}));
  app.use(express.static(path.join(__dirname, config.paths.public), staticOptions));
  app.use(cookieParser(config.cookie.SECRET));
  app.use(routes(router));
  app.use(notFoundHelper);
  app.use(errorHelper);
  return app;
}

module.exports = server;
