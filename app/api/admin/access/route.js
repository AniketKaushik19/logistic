import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const auth = await requireAuth(req);

  if (!auth.authenticated || auth.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("logisticdb");

    const admins = await db
      .collection("users")
      .find(
        { role: "admin" },
        { projection: { password: 0 } }
      )
      .toArray();

    // ✅ SAFELY extract current admin id
    const currentAdminId =
      auth.user._id ||
      auth.user.id ||
      auth.user.userId ||
      null;

    return NextResponse.json(
      {
        admins,
        currentAdminId: currentAdminId?.toString() || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin access GET error:", error);
    return NextResponse.json(
      { error: "Failed to load admins" },
      { status: 500 }
    );
  }
}
