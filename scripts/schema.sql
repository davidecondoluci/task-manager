-- Task Manager Database Schema
-- PostgreSQL

-- Create the tasks table
-- This is the main table for storing task data

CREATE TABLE IF NOT EXISTS tasks (
    -- Primary key: auto-incrementing integer
    -- SERIAL is PostgreSQL's auto-increment type
    id SERIAL PRIMARY KEY,
    
    -- Task title: required, max 255 characters
    -- VARCHAR chosen over TEXT for explicit length constraint
    title VARCHAR(255) NOT NULL,
    
    -- Task description: optional, unlimited length
    -- TEXT type allows for detailed descriptions
    description TEXT,
    
    -- Task status: constrained to valid values
    -- Using VARCHAR with CHECK constraint instead of ENUM for flexibility
    -- (ENUMs in PostgreSQL are harder to modify later)
    status VARCHAR(20) NOT NULL DEFAULT 'todo'
        CHECK (status IN ('todo', 'in_progress', 'done')),
    
    -- Time estimation in hours: optional
    -- DECIMAL allows for fractional hours (e.g., 1.5 hours)
    -- CHECK ensures non-negative values
    time_estimation DECIMAL(10, 2)
        CHECK (time_estimation IS NULL OR time_estimation >= 0),
    
    -- Timestamps: automatically managed
    -- created_at: set once when row is inserted
    -- updated_at: should be updated on each modification (handled by application)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create an index on status for faster filtering
-- This improves performance when ordering tasks by status
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Create an index on created_at for faster ordering
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Optional: Create a trigger to automatically update updated_at
-- This ensures updated_at is always current, even if the application forgets
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Create the trigger
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional, for testing)
-- Uncomment to add test data

-- INSERT INTO tasks (title, description, status, time_estimation) VALUES
--     ('Set up development environment', 'Install Node.js, PostgreSQL, and VS Code', 'done', 2),
--     ('Design database schema', 'Create tables and indexes for the task manager', 'done', 1.5),
--     ('Implement API endpoints', 'Create CRUD operations for tasks', 'in_progress', 4),
--     ('Build frontend components', 'Create React components with TailwindCSS', 'in_progress', 6),
--     ('Write unit tests', 'Add tests for API routes and validation', 'todo', 3),
--     ('Deploy to production', 'Set up hosting and configure environment', 'todo', 2);
