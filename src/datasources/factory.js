//
// File: ./src/datasources/factory.js
// Description: Selects and instantiates the correct TaskRepository based on
//              the `database.type` configuration key.
//
const config = require('../config');
const logger = require('../logger');

const SUPPORTED_TYPES = ['postgresql', 'mongodb'];

/**
 * Creates and returns a TaskRepository instance for the configured datasource.
 * Reads `config.database.type` to decide which implementation to load.
 *
 * @returns {Promise<TaskRepository>}
 */
async function createTaskRepository() {
  const type = config.database?.type;

  if (!type) {
    throw new Error('Missing database.type in config.');
  }

  if (!SUPPORTED_TYPES.includes(type)) {
    throw new Error(`Invalid database.type "${type}". Expected one of: ${SUPPORTED_TYPES.join(', ')}.`);
  }

  logger.info(`Using datasource: ${type}`);

  if (type === 'postgresql') {
    const { createTaskRepository: createPgRepository } = require('./postgresql/task');
    return createPgRepository({
      host:     config.database.postgres.host,
      port:     config.database.postgres.port,
      user:     config.database.postgres.user,
      password: config.database.postgres.password,
      database: config.database.postgres.name,
    });
  }

  if (type === 'mongodb') {
    const { createTaskRepository: createMongoRepository } = require('./mongodb/task');
    return createMongoRepository(config.database.mongodb);
  }
}

module.exports = { createTaskRepository };
