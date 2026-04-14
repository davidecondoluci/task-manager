import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

/**
 * POST /api/auth/logout
 * Destroys the current session.
 */
export async function POST() {
  try {
    await destroySession();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
