-- Comments Schema Extension
-- Adds comments feature to the Task Manager

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    
    -- Foreign key to tasks table
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- Comment content: required, unlimited length
    content TEXT NOT NULL,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for efficient lookup by task_id
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);

-- Index for ordering by creation date
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
