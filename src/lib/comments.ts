import { query } from "./db";
import { encrypt, decrypt } from "./crypto";
import { Comment, CreateCommentInput } from "@/types";

/**
 * Comment repository - handles database operations for comments.
 *
 * Design: Simple CRUD operations following the same pattern as tasks.
 * Comments are always associated with a task (task_id is required).
 * Comment content is encrypted at rest (sensitive data).
 */

/**
 * Decrypts comment content if present.
 */
function decryptComment(comment: Comment): Comment {
  if (comment.content) {
    try {
      comment.content = decrypt(comment.content);
    } catch {
      // If decryption fails, data might be unencrypted (migration case)
      console.warn(`Failed to decrypt content for comment ${comment.id}`);
    }
  }
  return comment;
}

/**
 * Retrieves all comments for a specific task.
 * Ordered by creation date (newest first).
 */
export async function getCommentsByTaskId(taskId: number): Promise<Comment[]> {
  const result = await query<Comment>(
    `SELECT c.id, c.task_id, c.author_id, u.email as author_email, 
            c.content, c.created_at
     FROM comments c
     LEFT JOIN users u ON c.author_id = u.id
     WHERE c.task_id = $1
     ORDER BY c.created_at DESC`,
    [taskId]
  );

  return result.rows.map(decryptComment);
}

/**
 * Creates a new comment for a task.
 * @param taskId - The task this comment belongs to
 * @param input - Comment content
 * @param authorId - Optional user ID of the comment author
 */
export async function createComment(
  taskId: number,
  input: CreateCommentInput,
  authorId?: number
): Promise<Comment> {
  // Encrypt content before storing
  const encryptedContent = encrypt(input.content);

  const result = await query<Comment>(
    `INSERT INTO comments (task_id, content, author_id)
     VALUES ($1, $2, $3)
     RETURNING id, task_id, author_id, NULL as author_email, content, created_at`,
    [taskId, encryptedContent, authorId || null]
  );

  return decryptComment(result.rows[0]);
}
