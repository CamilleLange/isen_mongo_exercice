--
-- This script initializes the database schema and adds some sample data.
--

-- Enable the pgcrypto extension to use gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing table and trigger function if they exist, for a clean setup
DROP TABLE IF EXISTS tasks;
DROP FUNCTION IF EXISTS trigger_set_timestamp();

-- Create a function that will be used as a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Create the tasks table based on our final schema
CREATE TABLE tasks (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority INTEGER NOT NULL DEFAULT 2 CHECK (priority >= 1 AND priority <= 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    tags TEXT[] NOT NULL DEFAULT '{}'::text[]
);

-- Create a trigger that calls the function before any update on a row
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Insert two sample tasks with fixed UUIDs
INSERT INTO tasks (uuid, description, priority, tags, due_date) VALUES
('684f2505-c09e-4867-86db-9b6968be3cc2', 'Configure the project CI/CD pipeline', 3, '{"devops", "urgent"}', NULL),
('b8923d9a-cb42-4c02-ab87-5cc2ae82c551', 'Review the Q3 financial report', 2, '{"finance", "review"}', '2025-10-01T09:00:00Z');