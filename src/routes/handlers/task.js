//
// File: ./src/routes/handlers/task.js
// Description: HTTP handlers for the task API. Each method maps to one endpoint
// and is responsible for reading the request, calling the controller, and sending the response.
//
const { NotFoundError, InvalidInputError } = require('../../datasources/errors');
const { InvalidParameterError } = require('../../controllers/errors');
const logger = require("../../logger")

class TaskHandlers {
  /**
   * @param {object} controller - The task controller instance.
   */
  constructor(controller) {
    this.controller = controller;

    // Express calls handler methods as plain functions, losing the class context.
    // Binding ensures `this` always refers to the TaskHandlers instance.
    this.getAll = this.getAll.bind(this);
    this.getByUuid = this.getByUuid.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  /**
   * Shapes the internal task object into the public API response format.
   * Strips createdAt and exposes updatedAt as last_update.
   * @param {object} task
   * @returns {object}
   */
  #transformTaskForGetResponse(task) {
    const { createdAt, updatedAt, ...rest } = task;
    return {
      ...rest,
      last_update: updatedAt,
    };
  }

  // --- Route Handlers ---

  async getAll(req, res) {
    try {
      const tasks = await this.controller.getAllTasks();

      const transformedTasks = tasks.map(task => this.#transformTaskForGetResponse(task));
      
      res.status(200).json(transformedTasks);
    } catch (error) {
      logger.error({err: error}, "TaskHandler.getAll fail")

      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getByUuid(req, res) {
    try {
      const { uuid } = req.params;

      const task = await this.controller.getTaskByUuid(uuid);

      const transformedTask = this.#transformTaskForGetResponse(task);

      res.status(200).json(transformedTask);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      
      if (error instanceof InvalidParameterError) {
        return res.status(400).json({ message: error.message });
      }
      
      logger.error({err: error, taskUuid: req.params.uuid}, "TaskHandler.getByUuid fail")
      
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async create(req, res) {
    try {
      const newTask = await this.controller.createTask(req.body);

      const transformedTask = this.#transformTaskForGetResponse(newTask);

      res.status(201).json(transformedTask);
    } catch (error) {
      if (error instanceof InvalidInputError) {
        return res.status(400).json({ message: error.message });
      }

      logger.error({err: error, taskUuid: req.params.uuid}, "TaskHandler.create fail")
      
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    try {
      const { uuid } = req.params;

      const updatedTask = await this.controller.updateTask(uuid, req.body);

      const transformedTask = this.#transformTaskForGetResponse(updatedTask);
      
      res.status(200).json(transformedTask);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ message: error.message });
      }

      if (error instanceof InvalidInputError) {
        return res.status(400).json({ message: error.message });
      }

      if (error instanceof InvalidParameterError) {
        return res.status(400).json({ message: error.message });
      }
      
      logger.error({err: error, taskUuid: req.params.uuid}, "TaskHandler.update fail")
      
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async remove(req, res) {
    try {
      const { uuid } = req.params;

      await this.controller.deleteTask(uuid);

      res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ message: error.message });
      }

      if (error instanceof InvalidParameterError) {
        return res.status(400).json({ message: error.message });
      }
      
      logger.error({err: error, taskUuid: req.params.uuid}, "TaskHandler.remove fail")

      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

module.exports = TaskHandlers;