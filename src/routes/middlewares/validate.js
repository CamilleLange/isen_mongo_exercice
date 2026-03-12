//
// File: ./src/routes/middlewares/validate.js
// Description: A generic validation middleware using Zod.
//

/**
 * A higher-order function that creates an Express middleware for validating
 * the request body against a given Zod schema.
 * @param {object} schema - A Zod schema object.
 * @returns {function} An Express middleware function.
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ errors: error.errors });
  }
};

module.exports = validate;