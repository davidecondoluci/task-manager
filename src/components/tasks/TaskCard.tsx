"use client";

import { Clock, User, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Task } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

/**
 * Task card component for displaying a task in the dashboard grid.
 *
 * Shows:
 * - Title (links to detail page)
 * - Status badge
 * - Time estimation
 * - Edit and Delete actions
 */
export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <article
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 
                 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
          {task.title}
        </h3>
        <StatusBadge status={task.status} />
      </div>

      {/* Time estimation */}
      {task.time_estimation !== null && (
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {task.time_estimation}{" "}
            {task.time_estimation === 1 ? "hour" : "hours"}
          </span>
        </div>
      )}

      {/* Author */}
      {task.author_email && (
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="truncate">{task.author_email}</span>
        </div>
      )}

      {/* Comments count */}
      {task.comment_count !== undefined && task.comment_count > 0 && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <span>
            {task.comment_count}{" "}
            {task.comment_count === 1 ? "comment" : "comments"}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <Button
          variant="ghost"
          onClick={() => onEdit(task)}
          className="flex-1 text-sm py-1.5"
          aria-label={`Edit task: ${task.title}`}
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </Button>
        <Button
          variant="danger"
          onClick={() => onDelete(task)}
          className="flex-1 text-sm py-1.5"
          aria-label={`Delete task: ${task.title}`}
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete
        </Button>
      </div>
    </article>
  );
}
