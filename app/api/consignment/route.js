import clientPromise from "@/lib/mongodb";

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
export async function POST(req) {
  try {
    const body = await req.json();

    // Add server-side fields
    const consignment = {
      ...body,
      status: "Booked",
      createdAt: new Date(),
    };

    const client = await clientPromise;
    const db = client.db("logisticdb");
    const collection = db.collection("consignments");

    const result = await collection.insertOne(consignment);

    return Response.json({
      success: true,
      message: "Consignment saved successfully",
      consignmentNo: body.cn,
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Failed to save consignment" },
      { status: 500 }
    );
  }
}
