require('dotenv').config();
const server = require('./server');
const dbHelper = require('./server/helpers/db.helper');
const PORT = require('./config').env.PORT;
const NODE_ENV = require('./config').env.NODE_ENV;

// Console Stamp basic
require('console-stamp')(console);

// For chokidar-------------------------------------
// if(NODE_ENV !== 'production') {
//   const path2watch = './src/server';
//   const chokidar = require('chokidar');
//   const watcher = chokidar.watch(path2watch);
  
//   watcher.on('ready', () => {
//     console.log('Initial scan complete, waiting for changes.');
//     watcher.on('all', (event, path) => {
//       console.log(`Event: ${event} at ${path}`);
//       console.log(`Clearing ${path2watch} module cache from app...`);
//       Object.keys(require.cache).forEach(id => {
//         if(/[\/\\]server[\/\\]/.test(id)) {
//           console.log('About to delete from cache: ', id);
//           delete require.cache[id];
//         }
//       });
//     });
//   });
// }
// --------------------------------------------------

console.log('Starting app...');
const app = server();
dbHelper.connect()
  .then(() => {
    console.info('Starting server...');
    app.listen(PORT, (err) => {
      if(err) {
        return console.error(`Server could not be initialized: ${err.message}`);
      }
      console.info(`Server started and listening on port: ${PORT}.`);
    });
  })
  .catch((error) => {
    console.error(`Connection to DB could not complete successfully: ${error.message}`);
  });

const processEvents = {
  SIGINT: '<Ctrl> + <C> occurred.',
  beforeExit: 'Terminating application...',
  exit: 'Application terminated.'
}

Object.keys(processEvents).forEach(key => {
  process.on(key, () => {
    if(key === 'exit') return console.info(processEvents[key]);
    console.info(processEvents[key]);
    const connectionState = dbHelper.getConnectionState();
    if(connectionState.stateCode || connectionState.stateCode !== 99) {
      dbHelper.disconnect()
        .then(() => {
          if(key === 'SIGINT') process.exit(1);
        })
        .catch(e => {
          console.error(`Connection to DB not properly closed, terminating process.`);
          process.exit(2);
        });
    } else {
      process.exit(1);
    }
  });
});
