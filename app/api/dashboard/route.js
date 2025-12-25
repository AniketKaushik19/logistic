import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

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

    const totalConsignments = await db
      .collection("consignments")
      .countDocuments();

    const profits = await db.collection("profits").find({}).toArray();

    return NextResponse.json({
      totalConsignments,
      totalProfit: profits.reduce((s, p) => s + (p.netProfit || 0), 0),
      totalCost: profits.reduce((s, p) => s + (p.totalCost || 0), 0),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
