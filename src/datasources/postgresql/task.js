//
// File: ./src/datasources/postgresql/task.js
// Description: Implements the TaskRepository class and a factory to create it.
//
const { Pool } = require('pg');
const { DatasourceError, NotFoundError, InvalidInputError } = require('../errors');
const logger = require('../../logger');

/**
 * @class TaskRepository
 * This class encapsulates all data access logic for tasks.
 * It is not exported directly; the factory is used to create an instance.
 */
class TaskRepository {
  /**
   * @constructor
   * @param {Pool} pool - An instance of the pg connection pool.
   */
  constructor(pool) {
    this.pool = pool;
  }
  
  // A private helper to define the SELECT columns, mapping snake_case from the DB
  // to camelCase for the application DTO (Data Transfer Object).
  #selectColumns = `
    uuid,
    description,
    is_completed AS "isCompleted",
    priority,
    created_at AS "createdAt",
    updated_at AS "updatedAt",
    due_date AS "dueDate",
    tags
  `;

  /**
   * Fetches all tasks from the database, ordered by creation date.
   * @returns {Promise<Array>} A promise that resolves to an array of task objects.
   * @throws {error} If an unexpected database error occurs.
   */
  async getAllTasks() {
    const sql = `SELECT ${this.#selectColumns} FROM tasks ORDER BY "createdAt" DESC;`;

    try {
      const result = await this.pool.query(sql);
    
      return result.rows;
    } catch (error) {
      logger.warn({err: error}, "TaskRepository.getAllTasks fail")
      
      throw error;
    }
  }

  /**
   * Fetches a single task by its UUID.
   * @param {string} uuid
   * @returns {Promise<Object>} The task object.
   * @throws {NotFoundError} If the task is not found.
   */
  async getTaskByUuid(uuid) {
    const sql = `SELECT ${this.#selectColumns} FROM tasks WHERE uuid = $1;`;

    try {
      const result = await this.pool.query(sql, [uuid]);

      const task = result.rows[0];
      if (!task) {
        throw NotFoundError.create('Task', uuid);
      }

      return task;
    } catch (error) {
      logger.warn({err: error}, "TaskRepository.getTaskByUuid fail")
      
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      throw new Error('Database error while fetching task.');
    }
  }

  /**
   * Creates a new task from a data object.
   * @param {object} taskData - Object containing task properties.
   * @returns {Promise<Object>} The newly created task object.
   * @throws {InvalidInputError} If data violates a DB constraint.
   */
  async createTask(taskData) {
    const { description, isCompleted, priority, dueDate, tags } = taskData;
    const sql = `
      INSERT INTO tasks (description, is_completed, priority, due_date, tags)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${this.#selectColumns};
    `;

    try {
      const result = await this.pool.query(sql, [description, isCompleted, priority, dueDate, tags]);

      return result.rows[0];
    } catch (error) {
      // PostgreSQL error code for a check constraint violation
      if (error.code === '23514') {
        throw InvalidInputError.create('Input data violates a database constraint (e.g., priority out of range).', error);
      }

      logger.warn({err: error}, "TaskRepository.createTask fail")
      
      throw error;
    }
  }

  /**
   * Updates an existing task dynamically based on provided fields.
   * @param {string} uuid - The UUID of the task to update.
   * @param {object} updates - An object with the fields to update.
   * @returns {Promise<Object>} The updated task object.
   * @throws {NotFoundError} If the task is not found.
   * @throws {InvalidInputError} If data violates a DB constraint.
   */
  async updateTask(uuid, updates) {
    // Map JS camelCase keys from the API to DB snake_case column names.
    const keyToColumnMap = {
      description: 'description',
      isCompleted: 'is_completed',
      priority: 'priority',
      dueDate: 'due_date',
      tags: 'tags',
    };

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    // Dynamically build the SET clauses and the corresponding values array.
    // This makes the method flexible, allowing updates to any combination of fields.
    for (const key in updates) {
      if (keyToColumnMap[key]) {
        setClauses.push(`${keyToColumnMap[key]} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
      }
    }

    // If the updates object was empty or contained no valid keys, do not perform an update.
    if (setClauses.length === 0) {
      return this.getTaskByUuid(uuid);
    }
    
    // Add the uuid as the last parameter for the WHERE clause.
    values.push(uuid);

    const sql = `
      UPDATE tasks
      SET ${setClauses.join(', ')}
      WHERE uuid = $${paramIndex}
      RETURNING ${this.#selectColumns};
    `;
    
    try {
      const result = await this.pool.query(sql, values);

      const updatedTask = result.rows[0];
      
      if (!updatedTask) {
        throw NotFoundError.create('Task', uuid);
      }
      
      return updatedTask;
    } catch (error) {
      if (error.code === '23514') {
        throw InvalidInputError.create('Input data violates a database constraint.', error);
      }
      
      logger.warn({err: error, taskUuid: uuid}, "TaskRepository.updateTask fail")
      
      throw error;
    }
  }

  /**
   * Deletes a task by its UUID.
   * @param {string} uuid
   * @returns {Promise<Object>} The deleted task object.
   * @throws {NotFoundError} If the task is not found.
   */
  async deleteTask(uuid) {
    const sql = `DELETE FROM tasks WHERE uuid = $1 RETURNING ${this.#selectColumns};`;

    try {
      const result = await this.pool.query(sql, [uuid]);

      const deletedTask = result.rows[0];
      if (!deletedTask) {
        throw NotFoundError.create('Task', uuid);
      }
      
      return deletedTask;
    } catch (error) {
      logger.warn({err: error}, "TaskRepository.deleteTask fail")
      
      throw error;
    }
  }
}

/**
 * Factory method to create an instance of TaskRepository.
 * It now tests the database connection before returning the instance.
 * @function createTaskRepository
 * @param {object} dbConfig - The configuration object for the pg pool.
 * @returns {Promise<TaskRepository>} A promise that resolves to a ready-to-use instance of the TaskRepository.
 */
const createTaskRepository = async (dbConfig) => {
  const pool = new Pool(dbConfig);
  
  // Test the connection
  try {
    const client = await pool.connect();

    logger.info('Database connection successful.');
    
    client.release(); // Release the client back to the pool
  } catch (error) {
    logger.fatal(error, 'Failed to connect to the database. Application will exit.');
    
    // Exit the process if the database connection fails on startup.
    process.exit(1);
  }
  
  return new TaskRepository(pool);
};

module.exports = { createTaskRepository };