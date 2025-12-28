import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function requireAuth(req) {
  try {
    let token;

    // ✅ 1. Try cookie (Vercel-safe)
    token = req.cookies.get("token")?.value;

    // ✅ 2. Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return { authenticated: false, error: "No token provided" };
    }

    const { payload } = await jwtVerify(token, secret);

    return {
      authenticated: true,
      user: payload, // { email, role }
    };
  } catch (err) {
    console.error("Auth error:", err);
    return {
      authenticated: false,
      error: "Invalid or expired token",
    };
  }
}
