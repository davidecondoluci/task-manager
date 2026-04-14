import { Task } from "@/types";

/**
 * Time statistics for task dashboard.
 * All values are in hours.
 */
export interface TimeStats {
  /** Total estimated time across all tasks */
  total: number;
  /** Time for tasks with status 'todo' */
  todo: number;
  /** Time for tasks with status 'in_progress' */
  inProgress: number;
  /** Time for tasks with status 'done' */
  done: number;
}

/**
 * Calculates time statistics from a list of tasks.
 *
 * Design decisions:
 * - Pure function: easy to test, no side effects
 * - Handles null time_estimation gracefully (treats as 0)
 * - Single pass through the array for efficiency
 *
 * @param tasks - Array of tasks to calculate statistics for
 * @returns TimeStats object with calculated values
 */
export function calculateTimeStats(tasks: Task[]): TimeStats {
  const stats: TimeStats = {
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
  };

  // Single pass through tasks - O(n) complexity
  for (const task of tasks) {
    const hours = task.time_estimation ?? 0;
    stats.total += hours;

    // Accumulate by status
    switch (task.status) {
      case "todo":
        stats.todo += hours;
        break;
      case "in_progress":
        stats.inProgress += hours;
        break;
      case "done":
        stats.done += hours;
        break;
    }
  }

  return stats;
}

/**
 * Formats hours for display.
 * Shows one decimal place only when needed.
 *
 * @param hours - Number of hours
 * @returns Formatted string (e.g., "5h", "2.5h")
 */
export function formatHours(hours: number | string | null | undefined): string {
  const numHours = Number(hours) || 0;
  if (numHours === 0) return "0h";

  // Use toFixed(1) but remove trailing .0
  const formatted = numHours.toFixed(1).replace(/\.0$/, "");
  return `${formatted}h`;
}
