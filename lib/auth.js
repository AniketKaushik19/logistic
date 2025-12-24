import jwt from "jsonwebtoken";

export async function requireAuth(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { authenticated: false };
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return { authenticated: true, user };
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return { authenticated: false };
  }
}