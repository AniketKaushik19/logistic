import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  const { email, password } = await req.json();

  // Replace with DB lookup
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { id: "123", email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json({ token }); // client stores this
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}