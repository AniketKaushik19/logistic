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
      const results = await db
        .collection("consignments")
        .aggregate([
          {
            $addFields: {
              createdAtDate: { $toDate: "$createdAt" },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAtDate" },
                month: { $month: "$createdAtDate" },
              },
              consignments: { $sum: 1 },
              totalCost: {
                $sum: { $ifNull: ["$profit.totalCost", 0] },
              },
              totalProfit: {
                $sum: { $ifNull: ["$profit.amount", 0] },
              },
            },
          },
          { $sort: { "_id.year": -1, "_id.month": -1 } },
        ])
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
      const results = await db
        .collection("consignments")
        .aggregate([
          {
            $addFields: {
              createdAtDate: { $toDate: "$createdAt" },
            },
          },
          {
            $group: {
              _id: { $year: "$createdAtDate" },
              consignments: { $sum: 1 },
              totalCost: {
                $sum: { $ifNull: ["$profit.totalCost", 0] },
              },
              totalProfit: {
                $sum: { $ifNull: ["$profit.amount", 0] },
              },
            },
          },
          { $sort: { _id: -1 } },
        ])
        .toArray();

      return NextResponse.json(
        results.map((r) => ({
          period: String(r._id),
          consignments: r.consignments,
          totalCost: r.totalCost,
          totalProfit: r.totalProfit,
        }))
      );
    }

    /* ================= CUSTOM ================= */
    if (type === "custom" && start && end) {
      const results = await db
        .collection("consignments")
        .aggregate([
          {
            $addFields: {
              createdAtDate: { $toDate: "$createdAt" },
            },
          },
          {
            $match: {
              createdAtDate: {
                $gte: new Date(`${start}T00:00:00.000Z`),
                $lte: new Date(`${end}T23:59:59.999Z`),
              },
            },
          },
          {
            $group: {
              _id: null,
              consignments: { $sum: 1 },
              totalCost: {
                $sum: { $ifNull: ["$profit.totalCost", 0] },
              },
              totalProfit: {
                $sum: { $ifNull: ["$profit.amount", 0] },
              },
            },
          },
        ])
        .toArray();

      const stats = results[0] || {
        consignments: 0,
        totalCost: 0,
        totalProfit: 0,
      };

      return NextResponse.json([
        {
          period: `${start} → ${end}`,
          consignments: stats.consignments,
          totalCost: stats.totalCost,
          totalProfit: stats.totalProfit,
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
