"use client";

import { useState, FormEvent } from "react";
import { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from "@/types";
import { Button, Input, Select, Textarea } from "@/components/ui";

interface TaskFormProps {
  /** Existing task for edit mode, undefined for create mode */
  task?: Task;
  /** Called when form is submitted with valid data */
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  /** Called when user cancels */
  onCancel: () => void;
  /** Whether the form is currently submitting */
  isLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

/**
 * Reusable form for creating or editing tasks.
 *
 * Form state is managed locally for simplicity.
 * Validation happens on submit - mirrors the server-side validation.
 */
export function TaskForm({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) {
  const isEditMode = !!task;

  // Form state
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "todo");
  const [timeEstimation, setTimeEstimation] = useState(
    task?.time_estimation?.toString() ?? ""
  );

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 255) {
      newErrors.title = "Title must be 255 characters or less";
    }

    if (timeEstimation) {
      const hours = parseFloat(timeEstimation);
      if (isNaN(hours)) {
        newErrors.timeEstimation = "Must be a valid number";
      } else if (hours < 0) {
        newErrors.timeEstimation = "Must be a positive number";
      } else if (hours > 10000) {
        newErrors.timeEstimation = "Value seems unreasonably high";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateTaskInput | UpdateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      time_estimation: timeEstimation ? parseFloat(timeEstimation) : undefined,
    };

    await onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Enter task title"
        required
        autoFocus
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter task description (optional)"
        rows={3}
      />

      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as TaskStatus)}
        options={STATUS_OPTIONS}
      />

      <Input
        label="Time Estimation (hours)"
        type="number"
        min="0"
        step="0.5"
        value={timeEstimation}
        onChange={(e) => setTimeEstimation(e.target.value)}
        error={errors.timeEstimation}
        placeholder="e.g., 2.5"
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          isLoading={isLoading}
        >
          {isEditMode ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
