// This script initializes the MongoDB database with sample data.
// Field names must match the Mongoose schema defined in src/datasources/mongodb/task.js.
// Note: createdAt and updatedAt are set manually here because the Mongoose
// timestamps option only applies to operations made through the Mongoose model.

db = db.getSiblingDB('todolist');

db.tasks.drop();

db.tasks.insertMany([
  {
    uuid: '684f2505-c09e-4867-86db-9b6968be3cc2',
    description: 'Configure the project CI/CD pipeline',
    isCompleted: false,
    priority: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    tags: ['devops', 'urgent']
  },
  {
    uuid: 'b8923d9a-cb42-4c02-ab87-5cc2ae82c551',
    description: 'Review the Q3 financial report',
    isCompleted: false,
    priority: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date('2025-10-01T09:00:00Z'),
    tags: ['finance', 'review']
  }
]);
