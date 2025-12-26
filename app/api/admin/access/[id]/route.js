import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

/* CEO VERIFY */
function verifyCEO(email, password) {
  return (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  );
}

/* DELETE ADMIN */
export async function DELETE(req, context) {
  const { id } = await context.params;

  const auth = await requireAuth(req);
  if (!auth.authenticated || auth.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { adminEmail, adminPassword } = await req.json();
  if (!verifyCEO(adminEmail, adminPassword)) {
    return NextResponse.json({ error: "CEO verification failed" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  await db.collection("users").deleteOne({
    _id: new ObjectId(id),
    role: "admin",
  });

  return NextResponse.json({ success: true });
}

/* UPDATE PASSWORD */
export async function PUT(req, context) {
  const { id } = await context.params;

  const auth = await requireAuth(req);
  if (!auth.authenticated || auth.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { password, adminEmail, adminPassword } = await req.json();

  if (!verifyCEO(adminEmail, adminPassword)) {
    return NextResponse.json({ error: "CEO verification failed" }, { status: 403 });
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be 6+ chars" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const client = await clientPromise;
  const db = client.db("logisticdb");

  await db.collection("users").updateOne(
    { _id: new ObjectId(id), role: "admin" },
    { $set: { password: hashed } }
  );

  return NextResponse.json({ success: true });
}
