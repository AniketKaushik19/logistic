import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

/**
 * Verifies auth_token cookie
 * @returns decoded JWT payload
 * @throws Error if unauthorized
 */
export function requireAuth() {
  const token = cookies().get("auth_token")?.value;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new Error("INVALID_TOKEN");
  }
}
