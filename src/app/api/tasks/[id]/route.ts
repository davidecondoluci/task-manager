import { NextRequest, NextResponse } from "next/server";
import { getTaskById, updateTask, deleteTask } from "@/lib/tasks";
import {
  validateId,
  validateUpdateTaskInput,
  parseUpdateInput,
} from "@/lib/validation";

/**
 * Route params type for Next.js 15+ App Router
 */
type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/tasks/[id]
 *
 * Retrieves a single task by ID.
 * Returns 404 if the task doesn't exist.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: idParam } = await params;

    // Validate ID parameter
    const idValidation = validateId(idParam);
    if (!idValidation.valid) {
      return NextResponse.json(
        { success: false, error: idValidation.message },
        { status: 400 }
      );
    }

    const task = await getTaskById(idValidation.id);

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Error fetching task:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch task. Please try again later.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks/[id]
 *
 * Updates an existing task with partial data.
 * Only provided fields will be updated.
 * Returns 404 if the task doesn't exist.
 *
 * Request body (all optional, but at least one required):
 * - title: string, max 255 chars
 * - description: string | null (null to clear)
 * - status: 'todo' | 'in_progress' | 'done'
 * - time_estimation: number | null (null to clear)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: idParam } = await params;

    // Validate ID parameter
    const idValidation = validateId(idParam);
    if (!idValidation.valid) {
      return NextResponse.json(
        { success: false, error: idValidation.message },
        { status: 400 }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate input
    const validation = validateUpdateTaskInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Parse and update task
    const input = parseUpdateInput(body as Record<string, unknown>);
    const task = await updateTask(idValidation.id, input);

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Error updating task:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update task. Please try again later.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 *
 * Deletes a task by ID.
 * Returns 404 if the task doesn't exist.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: idParam } = await params;

    // Validate ID parameter
    const idValidation = validateId(idParam);
    if (!idValidation.valid) {
      return NextResponse.json(
        { success: false, error: idValidation.message },
        { status: 400 }
      );
    }

    const deleted = await deleteTask(idValidation.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // 204 No Content is more RESTful, but we return 200 with a message for clarity
    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete task. Please try again later.",
      },
      { status: 500 }
    );
  }
}
