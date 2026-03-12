//
// File: ./src/models/task.js
// Description: Zod validation schema for incoming task request bodies.
// Server-generated fields (uuid, createdAt, updatedAt) are intentionally excluded.
//
const { z } = require('zod');

const taskSchema = z.object({
  description: z.string({
      required_error: "Description is required.",
      invalid_type_error: "Description must be a string.",
    })
    .min(5, { message: "Description must be at least 5 characters long." }),

  isCompleted: z.boolean({
      invalid_type_error: "isCompleted must be a boolean.",
    })
    .optional()
    .default(false),

  priority: z.number({
      invalid_type_error: "Priority must be a number.",
    })
    .int()
    .min(1, { message: "The minimum priority is 1." })
    .max(3, { message: "The maximum priority is 3." })
    .optional()
    .default(2),

  dueDate: z.string()
    .datetime({ message: "The due date must be a valid RFC-3339 datetime string." })
    .optional(),

  tags: z.array(z.string(), {
      invalid_type_error: "Tags must be an array of strings.",
    })
    .optional()
    .default([]),
});

module.exports = taskSchema;
