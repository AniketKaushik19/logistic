import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

/**
 * GET → Fetch latest 5 consignments for profit calculation
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
    const collection = db.collection("consignments");

    const data = await collection
      .find({}, { projection: { cn: 1, amount: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch consignments for profit" },
      { status: 500 }
    );
  }
}

/**
 * POST → Save profit data
 */
export async function POST(req) {
    const auth = await requireAuth(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }
  try {
    const body = await req.json();

    // Add server-side fields
    const profitData = {
      ...body,
      date: new Date(body.date),
      createdAt: new Date(),
    };

    const client = await clientPromise;
    const db = client.db("logisticdb");
    const collection = db.collection("profits");

    const result = await collection.insertOne(profitData);

    return NextResponse.json({
      success: true,
      message: "Profit saved successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to save profit" },
      { status: 500 }
    );
  }
}