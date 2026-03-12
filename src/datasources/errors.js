//
// File: ./src/datasources/errors.js
// Description: Database-agnostic error classes for the data layer.
//

const { DatasourceError } = require('../controllers/errors');

/**
 * @class NotFoundError
 * Thrown when a requested resource does not exist in the database.
 */
class NotFoundError extends DatasourceError {
  /**
   * @param {string} resource - The type of resource (e.g., 'Task').
   * @param {string} identifier - The identifier used in the lookup.
   */
  static create(resource, identifier) {
    return new NotFoundError(`${resource} with identifier [${identifier}] not found.`);
  }
}

/**
 * @class InvalidInputError
 * Thrown when input data violates a database constraint (e.g., a schema validator or CHECK constraint).
 */
class InvalidInputError extends DatasourceError {
  /**
   * @param {string} message
   * @param {Error} [originalError] - The original database error.
   */
  static create(message, originalError = null) {
    return new InvalidInputError(message, originalError);
  }
}

module.exports = {
  NotFoundError,
  InvalidInputError,
};
