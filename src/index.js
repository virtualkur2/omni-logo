const server = require('./server');
const dbHelper = require('./server/helpers/db.helper');
const PORT = require('./config').env.PORT;

// Console Stamp basic
require('console-stamp')(console);

console.log('Starting app...');
const app = server();
dbHelper.connect()
  .then(() => {
    console.info('Starting server...');
    app.listen(PORT, (err) => {
      if(err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
      console.info(`Server started and listening on port: ${PORT}.`);
    });
  })
  .catch((error) => {
    console.error(`Error: ${error.message}.`);
    process.exit(1);
  });
