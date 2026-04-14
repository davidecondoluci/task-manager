-- Task Ordering Extension
-- Adds manual ordering support to tasks

-- Add order column (nullable initially for existing tasks)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_tasks_sort_order ON tasks(sort_order NULLS LAST);
