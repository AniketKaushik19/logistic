export const runtime = "nodejs";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET() {
  // ✅ AWAIT cookies()
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

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
    console.error("JWT verify failed:", err.message);
    return NextResponse.json({ authenticated: false });
  }
}
