//
// File: ./src/controllers/errors.js
// Description: Custom error classes for the controller layer.
//

/**
 * @class DatasourceError
 * Base error class for all errors originating from the data layer.
 */
class DatasourceError extends Error {
  /**
   * @param {string} message
   * @param {Error} [originalError] - The original error thrown by the database driver.
   */
  constructor(message, originalError = null) {
    super(message);
    this.name = this.constructor.name;
    this.originalError = originalError;
  }
}

/**
 * @class InvalidParameterError
 * Thrown when a route parameter fails validation (e.g., malformed UUID).
 */
class InvalidParameterError extends DatasourceError {
  static create(message, originalError = null) {
    return new InvalidParameterError(message, originalError);
  }
}

module.exports = {
  DatasourceError,
  InvalidParameterError,
};