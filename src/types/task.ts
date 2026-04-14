/**
 * Task status enum - defines the possible states of a task.
 * Order matters for display: In Progress > To Do > Done
 */
export type TaskStatus = "in_progress" | "todo" | "done";

/**
 * Core Task interface - represents a task entity in the system.
 * All properties align with the database schema.
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  time_estimation: number | null; // in hours
  sort_order: number | null; // null = default ordering, number = manual order
  author_id: number | null; // FK to users table
  author_email: string | null; // denormalized for display (joined from users)
  comment_count?: number; // number of comments on this task
  created_at: Date;
  updated_at: Date;
}

/**
 * Input type for creating a new task.
 * Only includes fields that can be set by the user.
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  time_estimation?: number;
}

/**
 * Input type for updating an existing task.
 * All fields are optional since we support partial updates.
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  time_estimation?: number | null;
}

/**
 * API response wrapper for consistent error handling
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Status display configuration for UI rendering
 */
export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; order: number; color: string }
> = {
  in_progress: {
    label: "In Progress",
    order: 1,
    color: "bg-blue-100 text-blue-800",
  },
  todo: { label: "To Do", order: 2, color: "bg-yellow-100 text-yellow-800" },
  done: { label: "Done", order: 3, color: "bg-green-100 text-green-800" },
};
