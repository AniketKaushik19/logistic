import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  requireAuth();
  try {

    const client = await clientPromise;
    const db = client.db("logisticdb");

    // Get total consignments
    const totalConsignments = await db.collection("consignments").countDocuments();

    // Get total profit and cost from profits collection
    const profits = await db.collection("profits").find({}).toArray();
    const totalProfit = profits.reduce((sum, p) => sum + (p.netProfit || 0), 0);
    const totalCost = profits.reduce((sum, p) => sum + (p.totalCost || 0), 0);

    return Response.json({
      totalConsignments,
      totalProfit,
      totalCost
    });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}