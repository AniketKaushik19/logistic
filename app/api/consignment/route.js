import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
/**
 * GET → Fetch all consignments (Admin / Dashboard)
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("logisticdb");
    const collection = db.collection("consignments");

    const data = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json(data);
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Failed to fetch consignments" },
      { status: 500 }
    );
  }
}

/**
 * POST → Save new consignment
 */

/* ================= CREATE CONSIGNMENT ================= */
export async function POST(req) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");

    const counters = db.collection("counters");

    /* ================= ENSURE COUNTER EXISTS ================= */
    await counters.updateOne(
      { _id: "consignment" },
      { $setOnInsert: { seq: 1000 } },
      { upsert: true }
    );

    /* ================= ATOMIC INCREMENT ================= */
    const counter = await counters.findOneAndUpdate(
      { _id: "consignment" },
      { $inc: { seq: 1 } },
      { returnDocument: "after" }
    );
    // if (!counter || typeof counter.value.seq !== "number") {
    //   throw new Error("Failed to generate consignment number");
    // }

    const cn = `ALC-${counter.seq}`;
    /* ================= BUILD CONSIGNMENT ================= */
    const consignment = {
      ...body,
      cn,
      status: "Booked",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    /* ================= SAVE ================= */
    const result = await db
      .collection("consignments")
      .insertOne(consignment);
    return NextResponse.json(
      {
        success: true,
        message: "Consignment created successfully",
        cn,
        insertedId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST consignment error:", error);

    return NextResponse.json(
      { error: "Failed to save consignment" },
      { status: 500 }
    );
  }
}




