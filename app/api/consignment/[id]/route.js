import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";

/* ================= GET ================= */
export async function GET(req, { params }) {
  const { id } = await params; // ✅ IMPORTANT

  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid consignment ID" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  const doc = await db
    .collection("consignments")
    .findOne({ _id: new ObjectId(id) });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(doc);
}

/* ================= PUT ================= */
export async function PUT(req, { params }) {
  const { id } = await params; // ✅ IMPORTANT

  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid consignment ID" }, { status: 400 });
  }

  const body = await req.json();
  const { _id, ...safeBody } = body;

  const client = await clientPromise;
  const db = client.db("logisticdb");

  const result = await db.collection("consignments").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...safeBody, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  return NextResponse.json({ success: true, data: result.value });
}

/* ================= DELETE ================= */
export async function DELETE(req, { params }) {
  const { id } = await params; // ✅ IMPORTANT

  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid consignment ID" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  await db.collection("consignments").deleteOne({
    _id: new ObjectId(id),
  });

  return NextResponse.json({ success: true });
}
