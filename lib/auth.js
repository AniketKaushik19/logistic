import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function requireAuth(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return { authenticated: false, error: "No token provided" };
    }

    const { payload } = await jwtVerify(token, secret);
    return {
      authenticated: true,
      user: payload, // { email, role, ... }
    };
  } catch (err) {
    return {
      authenticated: false,
      error: "Invalid or expired token",
    };
  }
}
