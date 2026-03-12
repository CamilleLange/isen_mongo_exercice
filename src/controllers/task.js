//
// File: ./src/controllers/task.js
// Description: A controller class for handling task-related business logic.
// It catches errors from the repository and translates them into business-level errors.
//
const { z } = require('zod');
const { DatasourceError, NotFoundError, InvalidInputError } = require('../datasources/errors');
const { InvalidParameterError } = require('../controllers/errors');

class TaskController {
  /**
   * @constructor
   * @param {object} taskRepository - The repository for data access.
   */
  constructor(taskRepository) {
    this.repository = taskRepository;
  }

  /**
   * A private helper method to validate the UUID format.
   * @param {string} uuid - The UUID to validate.
   * @throws {InvalidParameterError} If the UUID format is invalid.
   */
  #validateUuid(uuid) {
    try {
      z.string().uuid({ message: "The provided task ID is not a valid UUID." }).parse(uuid);
    } catch (error) {
      // Translate the Zod-specific error into our application's generic InvalidParameterError.
      throw InvalidParameterError.create("The provided task ID is not a valid UUID.", error);
    }
  }


  /**
   * Orchestrates the fetching of all tasks.
   * @returns {Promise<Array>} A list of task objects.
   * @throws {DatasourceError} If an unexpected database error occurs.
   */
  async getAllTasks() {
    try {
      return await this.repository.getAllTasks();
    } catch (error) {
      throw new DatasourceError('An unexpected error occurred while fetching tasks.', error);
    }
  }

  /**
   * Orchestrates the fetching of a single task by its UUID.
   * @param {string} uuid - The UUID of the task.
   * @returns {Promise<Object>} A task object.
   * @throws {NotFoundError} If the task is not found.
   * @throws {DatasourceError} If an unexpected database error occurs.
   */
  async getTaskByUuid(uuid) {
    this.#validateUuid(uuid);

    try {
      return await this.repository.getTaskByUuid(uuid);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      throw new DatasourceError(`An unexpected error occurred while fetching task ${uuid}.`, error);
    }
  }

  /**
   * Orchestrates the creation of a new task.
   * @param {object} taskData - The validated data for the new task.
   * @returns {Promise<Object>} The newly created task object.
   * @throws {InvalidInputError} If data violates a DB constraint.
   * @throws {DatasourceError} If an unexpected database error occurs.
   */
  async createTask(taskData) {
    try {
      return await this.repository.createTask(taskData);
    } catch (error) {
      if (error instanceof InvalidInputError) {
        throw error;
      }
      
      throw new DatasourceError('An unexpected error occurred while creating the task.', error);
    }
  }

  /**
   * Orchestrates the update of a task.
   * @param {string} uuid - The UUID of the task to update.
   * @param {object} updates - An object with the fields to update.
   * @returns {Promise<Object>} The updated task object.
   * @throws {NotFoundError} If the task is not found.
   * @throws {InvalidInputError} If data violates a DB constraint.
   * @throws {DatasourceError} If an unexpected database error occurs.
   */
  async updateTask(uuid, updates) {
    this.#validateUuid(uuid);

    try {
      return await this.repository.updateTask(uuid, updates);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof InvalidInputError) {
        throw error;
      }

      throw new DatasourceError(`An unexpected error occurred while updating task ${uuid}.`, error);
    }
  }

  /**
   * Orchestrates the deletion of a task.
   * @param {string} uuid - The UUID of the task to delete.
   * @returns {Promise<Object>} The deleted task object.
   * @throws {NotFoundError} If the task is not found.
   * @throws {DatasourceError} If an unexpected database error occurs.
   */
  async deleteTask(uuid) {
    this.#validateUuid(uuid);

    try {
      return await this.repository.deleteTask(uuid);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      throw new DatasourceError(`An unexpected error occurred while deleting task ${uuid}.`, error);
    }
  }
}

module.exports = TaskController;