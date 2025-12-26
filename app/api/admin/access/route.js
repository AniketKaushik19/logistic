import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated || auth.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  const admins = await db
    .collection("users")
    .find({ role: "admin" }, { projection: { password: 0 } })
    .toArray();

  return NextResponse.json({ admins });
}
