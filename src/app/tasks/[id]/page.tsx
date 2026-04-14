"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, User, Clock, AlertTriangle } from "lucide-react";
import { Task, UpdateTaskInput } from "@/types";
import { Button, Modal } from "@/components/ui";
import {
  StatusBadge,
  TaskForm,
  DeleteConfirmDialog,
  CommentSection,
} from "@/components/tasks";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Task Detail Page
 *
 * Dedicated page for viewing and editing a single task.
 * Displays all task information with inline edit and delete capabilities.
 */
export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);

  // Data state
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Fetch task by ID
   */
  const fetchTask = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/tasks/${id}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Task not found");
        }
        throw new Error(data.error || "Failed to fetch task");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch task");
      }

      setTask(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  /**
   * Update the task
   */
  async function handleUpdate(data: UpdateTaskInput) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update task");
      }

      setTask(result.data);
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Delete the task and navigate back to dashboard
   */
  async function handleDelete() {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to delete task");
      }

      router.push("/dashboard");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete task");
      setIsSubmitting(false);
    }
  }

  /**
   * Format date for display
   */
  function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" aria-hidden="true" />
            <h3 className="mt-2 text-lg font-medium text-red-800">{error}</h3>
            <Link href="/dashboard">
              <Button variant="secondary" className="mt-4">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        )}

        {/* Task details */}
        {!isLoading && !error && task && (
          <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Task header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {task.title}
                  </h1>
                  <StatusBadge status={task.status} />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Pencil className="w-4 h-4 mr-1" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            {/* Task body */}
            <div className="p-6">
              {/* Description */}
              <div className="mb-6">
                <h2 className="text-sm font-medium text-gray-500 mb-2">
                  Description
                </h2>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {task.description || (
                    <span className="text-gray-400 italic">
                      No description provided
                    </span>
                  )}
                </p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Author */}
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">
                    Author
                  </h2>
                  <p className="text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-400" aria-hidden="true" />
                    {task.author_email || "Unknown"}
                  </p>
                </div>

                {/* Time estimation */}
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">
                    Time Estimation
                  </h2>
                  <p className="text-gray-900 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-gray-400" aria-hidden="true" />
                    {task.time_estimation !== null
                      ? `${task.time_estimation} ${
                          task.time_estimation === 1 ? "hour" : "hours"
                        }`
                      : "Not specified"}
                  </p>
                </div>

                {/* Created at */}
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">
                    Created
                  </h2>
                  <p className="text-gray-900">{formatDate(task.created_at)}</p>
                </div>

                {/* Updated at */}
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">
                    Last Updated
                  </h2>
                  <p className="text-gray-900">{formatDate(task.updated_at)}</p>
                </div>
              </div>

              {/* Comments Section */}
              <CommentSection taskId={task.id} />
            </div>
          </article>
        )}
      </main>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task"
      >
        {task && (
          <TaskForm
            task={task}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Task"
      >
        {task && (
          <DeleteConfirmDialog
            taskTitle={task.title}
            onConfirm={handleDelete}
            onCancel={() => setIsDeleteModalOpen(false)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
}
