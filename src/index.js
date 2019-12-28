const server = require('./server');
const dbHelper = require('./server/helpers/db.helper');
// Console Stamp basic
require('console-stamp')(console);

console.log('Starting app...');
const app = server();
dbHelper.connect()
  .then(() => {
    console.info('Starting server...');
  })
  .catch((error) => {
    console.error(`Error: ${error.message}.`);
  });
  