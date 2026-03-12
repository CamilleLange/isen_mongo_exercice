//
// File: ./__tests__/controllers/task.controller.test.js
// Description: Unit tests for the TaskController class.
//
const TaskController = require('../../src/controllers/task');
const { NotFoundError, InvalidParameterError } = require('../../src/datasources/errors');

describe('TaskController', () => {
  let mockTaskRepository;
  let taskController;

  // beforeEach resets the mock and creates a fresh controller instance before every test,
  // preventing state from leaking between tests.
  beforeEach(() => {
    mockTaskRepository = {
      getAllTasks: jest.fn(),
      getTaskByUuid: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    };
    taskController = new TaskController(mockTaskRepository);
  });

  // --- Tests for getAllTasks ---
  describe('getAllTasks', () => {
    it('should return an array of tasks', async () => {
      // Arrange
      const sampleTasks = [{ uuid: 'uuid-1', description: 'Task 1' }];
      mockTaskRepository.getAllTasks.mockResolvedValue(sampleTasks);

      // Act
      const result = await taskController.getAllTasks();

      // Assert
      expect(result).toEqual(sampleTasks);
      expect(mockTaskRepository.getAllTasks).toHaveBeenCalledTimes(1);
    });
  });

  // --- Tests for getTaskByUuid ---
  describe('getTaskByUuid', () => {
    const validUuid = 'a1b2c3d4-e5f6-12d3-a456-426614174000';

    it('should return a task when found', async () => {
      // Arrange
      const sampleTask = { uuid: validUuid, description: 'Test task' };
      mockTaskRepository.getTaskByUuid.mockResolvedValue(sampleTask);

      // Act
      const result = await taskController.getTaskByUuid(validUuid);

      // Assert
      expect(result).toEqual(sampleTask);
      expect(mockTaskRepository.getTaskByUuid).toHaveBeenCalledWith(validUuid);
    });

    it('should re-throw a NotFoundError from the repository', async () => {
      // Arrange
      mockTaskRepository.getTaskByUuid.mockRejectedValue(NotFoundError.create('Task', validUuid));

      // Act & Assert
      await expect(taskController.getTaskByUuid(validUuid)).rejects.toThrow(NotFoundError);
    });

    it('should throw an InvalidParameterError for a malformed UUID', async () => {
      // Arrange
      const invalidUuid = 'not-a-valid-uuid';

      // Act & Assert
      await expect(taskController.getTaskByUuid(invalidUuid)).rejects.toThrow(InvalidParameterError);
      // Ensure the repository was NOT called because validation failed first.
      expect(mockTaskRepository.getTaskByUuid).not.toHaveBeenCalled();
    });
  });

  // --- Tests for createTask ---
  describe('createTask', () => {
    it('should create and return a new task', async () => {
      // Arrange
      const taskData = { description: 'A brand new task', priority: 1 };
      const createdTask = { uuid: 'new-uuid', ...taskData, isCompleted: false, tags: [] };
      mockTaskRepository.createTask.mockResolvedValue(createdTask);

      // Act
      const result = await taskController.createTask(taskData);

      // Assert
      expect(result).toEqual(createdTask);
      expect(mockTaskRepository.createTask).toHaveBeenCalledWith(taskData);
    });
  });

  // --- Tests for updateTask ---
  describe('updateTask', () => {
    const validUuid = 'a1b2c3d4-e5f6-12d3-a456-426614174000';
    
    it('should update and return the task', async () => {
      // Arrange
      const updates = { description: 'Updated description', isCompleted: true };
      const updatedTask = { uuid: validUuid, ...updates };
      mockTaskRepository.updateTask.mockResolvedValue(updatedTask);

      // Act
      const result = await taskController.updateTask(validUuid, updates);

      // Assert
      expect(result).toEqual(updatedTask);
      expect(mockTaskRepository.updateTask).toHaveBeenCalledWith(validUuid, updates);
    });

    it('should throw an InvalidParameterError for a malformed UUID', async () => {
      // Arrange
      const invalidUuid = 'invalid-id';
      const updates = { description: 'some update' };

      // Act & Assert
      await expect(taskController.updateTask(invalidUuid, updates)).rejects.toThrow(InvalidParameterError);
      expect(mockTaskRepository.updateTask).not.toHaveBeenCalled();
    });
  });

  // --- Tests for deleteTask ---
  describe('deleteTask', () => {
    const validUuid = 'a1b2c3d4-e5f6-12d3-a456-426614174000';

    it('should call the repository to delete the task', async () => {
      // Arrange
      const deletedTask = { uuid: validUuid, description: 'I will be deleted' };
      mockTaskRepository.deleteTask.mockResolvedValue(deletedTask);
      
      // Act
      const result = await taskController.deleteTask(validUuid);
      
      // Assert
      expect(result).toEqual(deletedTask);
      expect(mockTaskRepository.deleteTask).toHaveBeenCalledWith(validUuid);
    });

    it('should throw an InvalidParameterError for a malformed UUID', async () => {
      // Arrange
      const invalidUuid = 'invalid-id';

      // Act & Assert
      await expect(taskController.deleteTask(invalidUuid)).rejects.toThrow(InvalidParameterError);
      expect(mockTaskRepository.deleteTask).not.toHaveBeenCalled();
    });
  });
});
