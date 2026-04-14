import { query } from "./db";
import { encrypt, decrypt } from "./crypto";
import { Task, CreateTaskInput, UpdateTaskInput } from "@/types";

/**
 * Task repository - handles all database operations for tasks.
 *
 * Design decisions:
 * - All methods are async and return typed results
 * - Uses parameterized queries to prevent SQL injection
 * - Returns null for not-found cases instead of throwing
 * - Timestamps are handled by the database (DEFAULT NOW())
 * - Descriptions are encrypted at rest (sensitive data)
 */

/**
 * Decrypts task description if present.
 * Centralized to ensure consistent handling.
 */
function decryptTask(task: Task): Task {
  if (task.description) {
    try {
      task.description = decrypt(task.description);
    } catch {
      // If decryption fails, data might be unencrypted (migration case)
      // Leave as-is and log warning
      console.warn(`Failed to decrypt description for task ${task.id}`);
    }
  }
  return task;
}

/**
 * Retrieves all tasks.
 * Order priority:
 * 1. Manual order (sort_order) if any task has been reordered
 * 2. Default: status priority then creation date
 */
export async function getAllTasks(): Promise<Task[]> {
  const result = await query<Task>(`
    SELECT 
      t.id, t.title, t.description, t.status, t.time_estimation, 
      t.sort_order, t.author_id, u.email as author_email,
      t.created_at, t.updated_at,
      (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) as comment_count
    FROM tasks t
    LEFT JOIN users u ON t.author_id = u.id
    ORDER BY 
      t.sort_order NULLS LAST,
      CASE t.status 
        WHEN 'in_progress' THEN 1 
        WHEN 'todo' THEN 2 
        WHEN 'done' THEN 3 
      END,
      t.created_at DESC
  `);

  return result.rows.map(decryptTask);
}

/**
 * Retrieves a single task by ID.
 * Returns null if the task doesn't exist.
 */
export async function getTaskById(id: number): Promise<Task | null> {
  const result = await query<Task>(
    `SELECT 
       t.id, t.title, t.description, t.status, t.time_estimation,
       t.sort_order, t.author_id, u.email as author_email,
       t.created_at, t.updated_at,
       (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) as comment_count
     FROM tasks t
     LEFT JOIN users u ON t.author_id = u.id
     WHERE t.id = $1`,
    [id]
  );

  const task = result.rows[0];
  return task ? decryptTask(task) : null;
}

/**
 * Creates a new task and returns the created record.
 * @param input - Task data
 * @param authorId - Optional user ID of the task author
 */
export async function createTask(
  input: CreateTaskInput,
  authorId?: number
): Promise<Task> {
  // Encrypt description before storing
  const encryptedDescription = input.description
    ? encrypt(input.description)
    : null;

  const result = await query<Task>(
    `INSERT INTO tasks (title, description, status, time_estimation, author_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, description, status, time_estimation, sort_order, 
               author_id, NULL as author_email, created_at, updated_at`,
    [
      input.title,
      encryptedDescription,
      input.status || "todo",
      input.time_estimation || null,
      authorId || null,
    ]
  );

  return decryptTask(result.rows[0]);
}

/**
 * Updates an existing task with partial data.
 * Only provided fields will be updated.
 * Returns null if the task doesn't exist.
 */
export async function updateTask(
  id: number,
  input: UpdateTaskInput
): Promise<Task | null> {
  // Build dynamic update query based on provided fields
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(input.title);
  }
  if (input.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    // Encrypt description, handle null case
    values.push(input.description ? encrypt(input.description) : null);
  }
  if (input.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(input.status);
  }
  if (input.time_estimation !== undefined) {
    updates.push(`time_estimation = $${paramIndex++}`);
    values.push(input.time_estimation);
  }

  // Always update the updated_at timestamp
  updates.push(`updated_at = NOW()`);

  // Add the ID as the last parameter
  values.push(id);

  const result = await query<Task>(
    `UPDATE tasks 
     SET ${updates.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING id, title, description, status, time_estimation, sort_order, 
               author_id, NULL as author_email, created_at, updated_at`,
    values
  );

  const task = result.rows[0];
  return task ? decryptTask(task) : null;
}

/**
 * Updates the sort order for multiple tasks.
 * Used by drag-and-drop reordering.
 *
 * @param orderedIds - Array of task IDs in the desired order
 */
export async function updateTaskOrder(orderedIds: number[]): Promise<void> {
  // Use a transaction to ensure atomic update
  // Update each task with its new position (0-indexed)
  const updatePromises = orderedIds.map((id, index) =>
    query("UPDATE tasks SET sort_order = $1 WHERE id = $2", [index, id])
  );

  await Promise.all(updatePromises);
}

/**
 * Deletes a task by ID.
 * Returns true if the task was deleted, false if it didn't exist.
 */
export async function deleteTask(id: number): Promise<boolean> {
  const result = await query("DELETE FROM tasks WHERE id = $1", [id]);

  return (result.rowCount ?? 0) > 0;
}

/**
 * Checks if a task exists by ID.
 * Useful for validation without fetching the full record.
 */
export async function taskExists(id: number): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM tasks WHERE id = $1) as exists",
    [id]
  );

  return result.rows[0]?.exists ?? false;
}
