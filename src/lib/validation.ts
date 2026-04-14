import { TaskStatus, CreateTaskInput, UpdateTaskInput } from "@/types";

/**
 * Validation error with field-specific messages
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validation result type
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] };

/**
 * Valid task statuses for validation
 */
const VALID_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

/**
 * Validates input for creating a new task.
 *
 * Rules:
 * - title is required and must be non-empty (max 255 chars)
 * - status must be a valid TaskStatus if provided
 * - time_estimation must be a positive number if provided
 */
export function validateCreateTaskInput(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object") {
    return {
      valid: false,
      errors: [
        { field: "body", message: "Request body must be a JSON object" },
      ],
    };
  }

  const data = input as Record<string, unknown>;

  // Title validation
  if (!data.title) {
    errors.push({ field: "title", message: "Title is required" });
  } else if (typeof data.title !== "string") {
    errors.push({ field: "title", message: "Title must be a string" });
  } else if (data.title.trim().length === 0) {
    errors.push({ field: "title", message: "Title cannot be empty" });
  } else if (data.title.length > 255) {
    errors.push({
      field: "title",
      message: "Title must be 255 characters or less",
    });
  }

  // Description validation (optional)
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== "string") {
      errors.push({
        field: "description",
        message: "Description must be a string",
      });
    }
  }

  // Status validation (optional, defaults to 'todo')
  if (data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status as TaskStatus)) {
      errors.push({
        field: "status",
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }
  }

  // Time estimation validation (optional)
  if (data.time_estimation !== undefined && data.time_estimation !== null) {
    if (typeof data.time_estimation !== "number") {
      errors.push({
        field: "time_estimation",
        message: "Time estimation must be a number",
      });
    } else if (data.time_estimation < 0) {
      errors.push({
        field: "time_estimation",
        message: "Time estimation must be positive",
      });
    } else if (data.time_estimation > 10000) {
      errors.push({
        field: "time_estimation",
        message: "Time estimation seems unreasonably high",
      });
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

/**
 * Validates input for updating an existing task.
 * Similar to create validation but all fields are optional.
 */
export function validateUpdateTaskInput(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object") {
    return {
      valid: false,
      errors: [
        { field: "body", message: "Request body must be a JSON object" },
      ],
    };
  }

  const data = input as Record<string, unknown>;

  // At least one field should be provided for update
  const hasAnyField = [
    "title",
    "description",
    "status",
    "time_estimation",
  ].some((field) => data[field] !== undefined);

  if (!hasAnyField) {
    errors.push({
      field: "body",
      message: "At least one field must be provided for update",
    });
  }

  // Title validation (optional but must be valid if provided)
  if (data.title !== undefined) {
    if (typeof data.title !== "string") {
      errors.push({ field: "title", message: "Title must be a string" });
    } else if (data.title.trim().length === 0) {
      errors.push({ field: "title", message: "Title cannot be empty" });
    } else if (data.title.length > 255) {
      errors.push({
        field: "title",
        message: "Title must be 255 characters or less",
      });
    }
  }

  // Description validation (can be null to clear)
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== "string") {
      errors.push({
        field: "description",
        message: "Description must be a string",
      });
    }
  }

  // Status validation
  if (data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status as TaskStatus)) {
      errors.push({
        field: "status",
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }
  }

  // Time estimation validation (can be null to clear)
  if (data.time_estimation !== undefined && data.time_estimation !== null) {
    if (typeof data.time_estimation !== "number") {
      errors.push({
        field: "time_estimation",
        message: "Time estimation must be a number",
      });
    } else if (data.time_estimation < 0) {
      errors.push({
        field: "time_estimation",
        message: "Time estimation must be positive",
      });
    } else if (data.time_estimation > 10000) {
      errors.push({
        field: "time_estimation",
        message: "Time estimation seems unreasonably high",
      });
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

/**
 * Validates that an ID is a valid positive integer
 */
export function validateId(
  id: string
): { valid: true; id: number } | { valid: false; message: string } {
  const parsed = parseInt(id, 10);

  if (isNaN(parsed)) {
    return { valid: false, message: "ID must be a valid number" };
  }

  if (parsed <= 0) {
    return { valid: false, message: "ID must be a positive number" };
  }

  if (!Number.isInteger(parsed)) {
    return { valid: false, message: "ID must be an integer" };
  }

  return { valid: true, id: parsed };
}

/**
 * Safely parse JSON from request body
 */
export function parseCreateInput(
  data: Record<string, unknown>
): CreateTaskInput {
  return {
    title: (data.title as string).trim(),
    description: data.description
      ? (data.description as string).trim()
      : undefined,
    status: (data.status as TaskStatus) || "todo",
    time_estimation: data.time_estimation as number | undefined,
  };
}

/**
 * Safely parse update input
 */
export function parseUpdateInput(
  data: Record<string, unknown>
): UpdateTaskInput {
  const result: UpdateTaskInput = {};

  if (data.title !== undefined) {
    result.title = (data.title as string).trim();
  }
  if (data.description !== undefined) {
    result.description =
      data.description === null ? null : (data.description as string).trim();
  }
  if (data.status !== undefined) {
    result.status = data.status as TaskStatus;
  }
  if (data.time_estimation !== undefined) {
    result.time_estimation = data.time_estimation as number | null;
  }

  return result;
}
