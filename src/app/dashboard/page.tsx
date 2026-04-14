"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, LogOut, ClipboardList } from "lucide-react";
import { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from "@/types";
import { Button, Modal } from "@/components/ui";
import {
  TaskCard,
  TaskForm,
  DeleteConfirmDialog,
  TimeStatsDisplay,
  SearchInput,
  KanbanBoard,
  CommentSection,
} from "@/components/tasks";
import { useDebounce } from "@/hooks";
import { calculateTimeStats } from "@/lib/stats";

/**
 * Task Dashboard Page
 *
 * Main view for managing tasks. Displays tasks grouped by status
 * with CRUD operations available via modals.
 *
 * Data fetching happens client-side for simplicity.
 * In a larger app, consider using React Query or SWR for caching.
 */
export default function DashboardPage() {
  const router = useRouter();

  // Data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Logout handler - clears session and redirects to landing page
   */
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh(); // Ensure server components re-evaluate auth state
    } catch {
      // Even if API fails, redirect to landing (session will be invalid)
      router.push("/");
    }
  }

  /**
   * Fetch all tasks from the API
   */
  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/tasks");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch tasks");
      }

      setTasks(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Filtered tasks based on search query.
   * Uses useMemo to avoid recalculation on every render.
   * Filtering is case-insensitive and matches title.
   */
  const filteredTasks = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return tasks;
    }
    const query = debouncedSearch.toLowerCase();
    return tasks.filter((task) => task.title.toLowerCase().includes(query));
  }, [tasks, debouncedSearch]);

  /**
   * Time statistics calculated from ALL tasks (not filtered).
   * Stats should reflect the entire project, not just search results.
   */
  const timeStats = useMemo(() => calculateTimeStats(tasks), [tasks]);

  /**
   * Create a new task
   */
  async function handleCreate(data: CreateTaskInput | UpdateTaskInput) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create task");
      }

      // Refetch to get updated list in correct order
      await fetchTasks();
      setIsCreateModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Update an existing task
   */
  async function handleUpdate(data: CreateTaskInput | UpdateTaskInput) {
    if (!editingTask) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update task");
      }

      // Refetch to get updated list in correct order
      await fetchTasks();
      setEditingTask(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Delete a task
   */
  async function handleDelete() {
    if (!deletingTask) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${deletingTask.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to delete task");
      }

      // Refetch to get updated list
      await fetchTasks();
      setDeletingTask(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Handle task reordering within a column from drag-and-drop
   */
  async function handleReorder(status: TaskStatus, orderedIds: number[]) {
    // Optimistic update - reorder locally first
    setTasks((prevTasks) => {
      const otherTasks = prevTasks.filter((t) => t.status !== status);
      const reorderedTasks = orderedIds
        .map((id) => prevTasks.find((t) => t.id === id))
        .filter((t): t is Task => t !== undefined)
        .map((t, index) => ({ ...t, sort_order: index }));
      return [...otherTasks, ...reorderedTasks];
    });

    try {
      const response = await fetch("/api/tasks/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });

      const result = await response.json();

      if (!result.success) {
        // Revert on failure
        await fetchTasks();
        throw new Error(result.error || "Failed to save order");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save order");
    }
  }

  /**
   * Handle status change from drag-and-drop between columns
   */
  async function handleStatusChange(taskId: number, newStatus: TaskStatus) {
    // Optimistic update - change status locally first
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!result.success) {
        // Revert on failure
        await fetchTasks();
        throw new Error(result.error || "Failed to update status");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Back to home"
              >
                <ArrowLeft className="w-6 h-6" aria-hidden="true" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Task Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-5 h-5 mr-1" aria-hidden="true" />
                New Task
              </Button>
              <Button variant="secondary" onClick={handleLogout}>
                <LogOut className="w-5 h-5 mr-1" aria-hidden="true" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <Button variant="secondary" onClick={fetchTasks} className="mt-2">
              Retry
            </Button>
          </div>
        )}

        {/* Dashboard content - only shown when loaded with tasks */}
        {!isLoading && !error && tasks.length > 0 && (
          <>
            {/* Time Statistics */}
            <TimeStatsDisplay stats={timeStats} />

            {/* Search Input */}
            <div className="mb-6">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search tasks by title..."
              />
            </div>

            {/* Kanban board with drag-and-drop */}
            {filteredTasks.length > 0 ? (
              debouncedSearch.trim() ? (
                // When searching, show regular grid (no drag during search)
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={setEditingTask}
                      onDelete={setDeletingTask}
                    />
                  ))}
                </div>
              ) : (
                // When not searching, show Kanban board
                <KanbanBoard
                  tasks={filteredTasks}
                  onStatusChange={handleStatusChange}
                  onReorder={handleReorder}
                  onEdit={setEditingTask}
                  onDelete={setDeletingTask}
                />
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No tasks match your search.</p>
              </div>
            )}
          </>
        )}

        {/* Empty state - no tasks at all */}
        {!isLoading && !error && tasks.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new task.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4">
              Create Task
            </Button>
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <div className="space-y-6">
            <TaskForm
              task={editingTask}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTask(null)}
              isLoading={isSubmitting}
            />

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-6">
              <CommentSection
                taskId={editingTask.id}
                onCommentAdded={fetchTasks}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Delete Task"
      >
        {deletingTask && (
          <DeleteConfirmDialog
            taskTitle={deletingTask.title}
            onConfirm={handleDelete}
            onCancel={() => setDeletingTask(null)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
}
