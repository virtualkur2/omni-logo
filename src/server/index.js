const express = require('express');
const helmet = require('helmet');

const router = express.Router();
const server = () => {
  const app = express();
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true}));
  return app;
}

module.exports = server;