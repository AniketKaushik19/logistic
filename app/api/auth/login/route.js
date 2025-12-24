import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, password } = await req.json();

  // TODO: validate user from DB
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    { email, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  const response = NextResponse.json({ success: true });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return response;
}
