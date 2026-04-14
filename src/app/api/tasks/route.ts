import { NextRequest, NextResponse } from "next/server";
import { getAllTasks, createTask } from "@/lib/tasks";
import { validateCreateTaskInput, parseCreateInput } from "@/lib/validation";
import { getSession } from "@/lib/session";

/**
 * GET /api/tasks
 *
 * Retrieves all tasks ordered by status priority:
 * 1. In Progress
 * 2. To Do
 * 3. Done
 *
 * Within each status group, tasks are ordered by creation date (newest first).
 */
export async function GET() {
  try {
    const tasks = await getAllTasks();

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tasks. Please try again later.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 *
 * Creates a new task.
 *
 * Request body:
 * - title (required): string, max 255 chars
 * - description (optional): string
 * - status (optional): 'todo' | 'in_progress' | 'done', defaults to 'todo'
 * - time_estimation (optional): positive number (hours)
 */
export async function POST(request: NextRequest) {
  try {
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
    const validation = validateCreateTaskInput(body);
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

    // Parse and create task with author from session
    const input = parseCreateInput(body as Record<string, unknown>);
    const session = await getSession();
    const task = await createTask(input, session?.userId);

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create task. Please try again later.",
      },
      { status: 500 }
    );
  }
}
