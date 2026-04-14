import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import { createSession } from "@/lib/session";

/**
 * POST /api/auth/login
 * Authenticates a user and creates a session.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser({ email, password });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    await createSession({ userId: user.id, email: user.email });

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
