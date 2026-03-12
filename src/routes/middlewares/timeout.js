//
// File: ./src/routes/middlewares/timeout.js
// Description: An Express middleware to handle request timeouts.
//

/**
 * Factory that creates a timeout middleware.
 * @param {object} config - The application configuration object.
 * @returns {function} An Express middleware function.
 */
const createTimeoutMiddleware = (config) => (req, res, next) => {
  const timeoutSeconds = config.server.timeoutSeconds || 15;
  const timeoutMillis = timeoutSeconds * 1000;

  const timer = setTimeout(() => {
    // res.headersSent guards against sending a second response if the handler already replied.
    if (!res.headersSent) {
      res.status(503).send({
        error: 'Service Unavailable',
        msg: `Request timed out after ${timeoutSeconds} seconds.`,
      });
    }
  }, timeoutMillis);

  const cleanup = () => clearTimeout(timer);

  res.on('finish', cleanup);
  res.on('close', cleanup);

  next();
}

module.exports = createTimeoutMiddleware;