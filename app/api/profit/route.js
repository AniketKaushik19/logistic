import clientPromise from "@/lib/mongodb";

/**
 * GET → Fetch latest 5 consignments for profit calculation
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("logisticdb");
    const collection = db.collection("consignments");

    const data = await collection
      .find({}, { projection: { cn: 1, amount: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return Response.json(data);
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Failed to fetch consignments for profit" },
      { status: 500 }
    );
  }
}

/**
 * POST → Save profit data
 */
export async function POST(req) {
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

    return Response.json({
      success: true,
      message: "Profit saved successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Failed to save profit" },
      { status: 500 }
    );
  }
}