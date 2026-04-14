-- Users Schema Extension
-- Adds authentication to the Task Manager

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    
    -- Email: unique identifier for login
    -- Using CITEXT would be better for case-insensitive matching,
    -- but requires extension. Using LOWER() in queries instead.
    email VARCHAR(255) NOT NULL UNIQUE,
    
    -- Password hash: bcrypt output is always 60 chars
    password_hash CHAR(60) NOT NULL,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for efficient email lookup (login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
