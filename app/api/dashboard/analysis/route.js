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
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const client = await clientPromise;
    const db = client.db("logisticdb");

    /* ================= MONTHLY ================= */
    if (type === "monthly") {
      const pipeline = [
        {
          $group: {
            _id: {
              year: { $year: { date: "$createdAt", timezone: "UTC" } },
              month: { $month: { date: "$createdAt", timezone: "UTC" } },
            },
            consignments: { $sum: 1 },
            totalCost: { $sum: "$totalCost" },
            totalProfit: { $sum: "$netProfit" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
      ];

      const results = await db
        .collection("profits")
        .aggregate(pipeline)
        .toArray();

      return NextResponse.json(
        results.map((r) => ({
          period: `${r._id.year}-${String(r._id.month).padStart(2, "0")}`,
          consignments: r.consignments,
          totalCost: r.totalCost,
          totalProfit: r.totalProfit,
        }))
      );
    }

    /* ================= YEARLY ================= */
    if (type === "yearly") {
      const pipeline = [
        {
          $group: {
            _id: { $year: { date: "$createdAt", timezone: "UTC" } },
            consignments: { $sum: 1 },
            totalCost: { $sum: "$totalCost" },
            totalProfit: { $sum: "$netProfit" },
          },
        },
        { $sort: { _id: -1 } },
      ];

      const results = await db
        .collection("profits")
        .aggregate(pipeline)
        .toArray();

      return NextResponse.json(
        results.map((r) => ({
          period: `${r._id}`,
          consignments: r.consignments,
          totalCost: r.totalCost,
          totalProfit: r.totalProfit,
        }))
      );
    }

    /* ================= CUSTOM ================= */
    if (type === "custom" && start && end) {
      const match = {
        createdAt: {
          $gte: new Date(`${start}T00:00:00.000Z`),
          $lte: new Date(`${end}T23:59:59.999Z`),
        },
      };

      const profits = await db
        .collection("profits")
        .find(match)
        .toArray();

      return NextResponse.json([
        {
          period: `${start} → ${end}`,
          consignments: profits.length,
          totalCost: profits.reduce((s, p) => s + (p.totalCost || 0), 0),
          totalProfit: profits.reduce((s, p) => s + (p.netProfit || 0), 0),
        },
      ]);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis data" },
      { status: 500 }
    );
  }
}
