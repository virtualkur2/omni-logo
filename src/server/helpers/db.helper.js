const mongoose = require('mongoose');
const config = require('../../config');

const connection = mongoose.connection;
const dbURI = config.mongo.URI;
const dbOptions = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  autoIndex: config.env.NODE_ENV === 'production' ? false : true,
  useCreateIndex: true,
  ssl: false, // check for using this option in production
  connectTimeoutMS: 15000,
  poolSize: 15,
};

const helper = {
  connect: function() {
    return mongoose.connect(dbURI, dbOptions);
  },
  disconnect: function() {
    return connection.close();
  },
  getDBName: function() {
    return connection.name;
  },
  getDBHost: function() {
    return connection.host;
  },
  getDBPort: function() {
    return connection.port;
  }
}

const connectionEvents = {
  connecting: 'Attempting connection to database...',
  disconnecting: 'Attempting disconnection from database...',
  connected: 'Successfully connected to database.',
  diconnected: 'Successfully disconnected from database',
  close: 'Database connection lost.',
  fullsetup: 'Replica set: Successfully connected to Primary and at least one Secondary.',
  all: 'Replica set: Successfully connected to All servers of the set.',
  reconnected: 'Successfully reconnected to database.',
  reconnectFailed: 'Max reconnect tries reach out.',
  error: 'Error connecting to:',
}

Object.keys(connectionEvents).forEach((key) => {
  if(key === 'error') {
    connection.on(key, (error) => {
      console.error(`${connectionEvents.error} ${connection.name} at ${connection.host} on port ${connection.port}`);
      if(error.reason) console.error(`Reason: ${error.reason}`);
    });
  } else {
    connection.on(key, () => {
      console.info(connectionEvents[key]);
    });
  }
});

module.exports = helper;
