import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 🚨 Skip API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Protect only app pages
  if (!pathname.startsWith("/consignment") &&
      !pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
