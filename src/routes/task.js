//
// File: ./src/routes/task.js
// Description: Defines the API routes and maps them to handler methods.
//
const express = require('express');

/**
 * A factory function that creates and configures the router for the task API.
 * @param {object} handlers - An instance of the TaskHandlers class.
 * @param {function} validateTaskMiddleware - The pre-configured Zod validation middleware.
 * @returns {object} An Express router instance.
 */
const tasksRouter = (handlers, validateTaskMiddleware) => {
  const router = express.Router();

  router.get('/', handlers.getAll);
  router.post('/', validateTaskMiddleware, handlers.create);
  
  router.get('/:uuid', handlers.getByUuid);
  router.put('/:uuid', validateTaskMiddleware, handlers.update);
  router.delete('/:uuid', handlers.remove);

  return router;
};

module.exports = tasksRouter;