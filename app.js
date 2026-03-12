//
// File: ./app.js
// Description: Application entry point and Composition Root.
// All dependencies are wired together here before the server starts.
//
const express = require('express');

const packageJson = require('./package.json');

const config = require('./src/config');
const logger = require('./src/logger');
const pinoHttp = require('pino-http');

const createTimeoutMiddleware = require('./src/routes/middlewares/timeout.js');
const validate = require('./src/routes/middlewares/validate.js');

const { createTaskRepository } = require('./src/datasources/factory.js');
const TaskController = require('./src/controllers/task.js');
const TaskHandlers = require('./src/routes/handlers/task.js');
const tasksRouter = require('./src/routes/task.js');
const taskSchema = require('./src/models/task.js');

const app = express();
const PORT = config.server.port || 3000;

async function startServer() {
  // --- Global Middlewares ---
  app.use(createTimeoutMiddleware(config));
  app.use(pinoHttp({ logger: logger }));
  app.use(express.json());

  // --- Dependency Injection (Composition Root) ---
  // Dependencies are instantiated from the bottom up and injected upward:
  // Data layer → Business logic layer → HTTP handler layer
  const taskRepository = await createTaskRepository();
  const taskController = new TaskController(taskRepository);
  const taskHandlers = new TaskHandlers(taskController);

  const validateTask = validate(taskSchema);
  const tasksApiRouter = tasksRouter(taskHandlers, validateTask);

  // --- Route Registration ---
  app.get('/', (req, res) => {
    res.status(200).json({
      name: packageJson.name,
      version: packageJson.version,
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/v1/tasks', tasksApiRouter);

  app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
  });
}

startServer().catch(error => {
  logger.fatal(error, 'Failed to start server');
  process.exit(1);
});

module.exports = app;
