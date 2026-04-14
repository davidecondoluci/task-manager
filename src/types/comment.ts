/**
 * Comment entity - represents a comment on a task
 */
export interface Comment {
  id: number;
  task_id: number;
  author_id: number | null;
  author_email: string | null; // denormalized for display (joined from users)
  content: string;
  created_at: Date;
}

/**
 * Input type for creating a new comment
 */
export interface CreateCommentInput {
  content: string;
}
