import { NextRequest, NextResponse } from "next/server";
import { updateTaskOrder } from "@/lib/tasks";

/**
 * PUT /api/tasks/order
 * Updates the display order of tasks.
 *
 * Body: { orderedIds: number[] }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderedIds } = body;

    // Validation
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { success: false, error: "orderedIds must be an array" },
        { status: 400 }
      );
    }

    if (orderedIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "orderedIds cannot be empty" },
        { status: 400 }
      );
    }

    if (!orderedIds.every((id) => typeof id === "number" && id > 0)) {
      return NextResponse.json(
        { success: false, error: "All IDs must be positive numbers" },
        { status: 400 }
      );
    }

    await updateTaskOrder(orderedIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update task order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update task order" },
      { status: 500 }
    );
  }
}
