import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  const { email, password } = await req.json();

  // Replace with DB lookup
  if (email === "test@example.com" && password === "password123") {
    const token = jwt.sign(
      { id: "123", email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return NextResponse.json({ token }); // client stores this
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}