import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("auth_token")?.value;

  const pathname = req.nextUrl.pathname;

  // Allow public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/track") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Protect consignment routes
  if (pathname.startsWith("/consignment")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/consignment/:path*"],
};
