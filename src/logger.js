//
// File: ./src/logger.js
// Description: Exports a shared Pino logger instance for the entire application.
//
const pino = require('pino');
const config = require('./config');

const logger = pino({
  level: config.server.logLevel || 'info',
});

module.exports = logger;
