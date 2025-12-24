import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/**
 * GET → Fetch all consignments
 */
export async function GET(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("logisticdb");

    const data = await db
      .collection("consignments")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch consignments" },
      { status: 500 }
    );
  }
}

/**
 * POST → Save new consignment
 */
export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");
    const counters = db.collection("counters");

    await counters.updateOne(
      { _id: "consignment" },
      { $setOnInsert: { seq: 0 } },
      { upsert: true }
    );

    const counterResult = await counters.findOneAndUpdate(
      { _id: "consignment" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const seq = counterResult?.seq;
    if (seq === undefined) {
      return NextResponse.json({ error: "Failed to generate consignment number" }, { status: 500 });
    }

    const cn = `ALC-${seq}`;
    const consignment = {
      ...body,
      cn,
      status: "Booked",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: auth.user.email,
    };

    const result = await db.collection("consignments").insertOne(consignment);

    return NextResponse.json({
      success: true,
      message: "Consignment created successfully",
      cn,
      insertedId: result.insertedId,
    }, { status: 201 });

  } catch (error) {
    console.error("POST consignment error:", error);
    return NextResponse.json({ error: "Failed to save consignment" }, { status: 500 });
  }
}
