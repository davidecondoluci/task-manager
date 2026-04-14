"use client";

import { Button } from "@/components/ui";

interface DeleteConfirmDialogProps {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Confirmation dialog content for task deletion.
 * Used inside a Modal component.
 */
export function DeleteConfirmDialog({
  taskTitle,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  return (
    <div>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete{" "}
        <span className="font-medium text-gray-900">
          &quot;{taskTitle}&quot;
        </span>
        ? This action cannot be undone.
      </p>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          className="flex-1"
          isLoading={isLoading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
