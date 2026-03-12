//
// File: ./src/datasources/mongodb/task.js
// Description: Implements the TaskRepository class for MongoDB using Mongoose.
//
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError, InvalidInputError } = require('../errors');
const logger = require('../../logger');

// --- Mongoose Schema ---
const taskMongoSchema = new mongoose.Schema(
  {
    // A custom uuid field is used instead of MongoDB's default ObjectId (_id),
    // so the API exposes the same identifier format as the model.
    uuid:        { type: String, default: uuidv4, unique: true, index: true },
    description: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    priority:    { type: Number, default: 2, min: 1, max: 3 },
    dueDate:     { type: Date, default: null },
    tags:        { type: [String], default: [] },
  },
  {
    // Automatically adds and manages createdAt and updatedAt fields on the document.
    timestamps: true,
  }
);

const TaskModel = mongoose.model('Task', taskMongoSchema);

/**
 * Maps a Mongoose document to a plain object (DTO).
 * Both repositories expose the same shape so the rest of the application is datasource-agnostic.
 */
function toDTO(doc) {
  return {
    uuid:        doc.uuid,
    description: doc.description,
    isCompleted: doc.isCompleted,
    priority:    doc.priority,
    createdAt:   doc.createdAt,
    updatedAt:   doc.updatedAt,
    dueDate:     doc.dueDate ?? null,
    tags:        doc.tags,
  };
}

/**
 * @class TaskRepository
 * MongoDB implementation of the task data access layer.
 * Exposes the same interface as the model.
 */
class TaskRepository {
  async getAllTasks() {
    try {
      const tasks = await TaskModel.find().sort({ createdAt: -1 });
      return tasks.map(toDTO);
    } catch (error) {
      logger.warn({ err: error }, 'TaskRepository.getAllTasks fail');
      throw error;
    }
  }

  async getTaskByUuid(uuid) {
    // TODO : implement me
  }

  async createTask(taskData) {
    // TODO : implement me
  }

  async updateTask(uuid, updates) {
    // TODO : implement me
  }

  async deleteTask(uuid) {
    // TODO : implement me
  }
}

/**
 * Connects to MongoDB and returns a ready TaskRepository instance.
 * Exits the process if the connection fails, as the application cannot run without a database.
 * @param {{ host: string, port: number, user: string, password: string, name: string }} dbConfig
 * @returns {Promise<TaskRepository>}
 */
const createTaskRepository = async (dbConfig) => {
  const uri = `mongodb://`+ /* TODO : implement me */ `?authSource=admin`;
  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connection successful.');
  } catch (error) {
    logger.fatal(error, 'Failed to connect to MongoDB. Application will exit.');
    process.exit(1);
  }
  return new TaskRepository();
};

module.exports = { createTaskRepository };
