import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
  // 1. Read Authorization header
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { authenticated: false, error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  // 2. Extract token
  const token = authHeader.split(" ")[1];

  // 3. Verify token
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return NextResponse.json(
      { authenticated: false, error: "Invalid or expired token" },
      { status: 403 }
    );
  }
}