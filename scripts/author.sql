-- Author Support Migration
-- Adds author tracking to tasks and comments

-- Add author_id to tasks (nullable for existing tasks)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add author_id to comments (nullable for existing comments)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Create indexes for efficient author lookups
CREATE INDEX IF NOT EXISTS idx_tasks_author_id ON tasks(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
