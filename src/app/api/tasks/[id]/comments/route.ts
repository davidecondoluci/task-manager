import { NextRequest, NextResponse } from "next/server";
import { getCommentsByTaskId, createComment } from "@/lib/comments";
import { getTaskById } from "@/lib/tasks";
import { validateId } from "@/lib/validation";
import { getSession } from "@/lib/session";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/tasks/[id]/comments
 *
 * Retrieves all comments for a specific task.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: idParam } = await params;

    // Validate task ID
    const idValidation = validateId(idParam);
    if (!idValidation.valid) {
      return NextResponse.json(
        { success: false, error: idValidation.message },
        { status: 400 }
      );
    }

    // Verify task exists
    const task = await getTaskById(idValidation.id);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    const comments = await getCommentsByTaskId(idValidation.id);

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error("Error fetching comments:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks/[id]/comments
 *
 * Creates a new comment for a task.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: idParam } = await params;

    // Validate task ID
    const idValidation = validateId(idParam);
    if (!idValidation.valid) {
      return NextResponse.json(
        { success: false, error: idValidation.message },
        { status: 400 }
      );
    }

    // Verify task exists
    const task = await getTaskById(idValidation.id);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
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

    // Validate content
    const data = body as Record<string, unknown>;
    if (!data.content || typeof data.content !== "string") {
      return NextResponse.json(
        { success: false, error: "Content is required and must be a string" },
        { status: 400 }
      );
    }

    const content = data.content.trim();
    if (content.length === 0) {
      return NextResponse.json(
        { success: false, error: "Content cannot be empty" },
        { status: 400 }
      );
    }

    // Get author from session
    const session = await getSession();
    const comment = await createComment(
      idValidation.id,
      { content },
      session?.userId
    );

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
