import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("logisticdb");

    const pipeline = [
      /* ✅ Normalize createdAt */
      {
        $addFields: {
          createdAtDate: {
            $cond: [
              { $eq: [{ $type: "$createdAt" }, "date"] },
              "$createdAt",
              { $toDate: "$createdAt" }
            ]
          }
        }
      },

      /* ✅ Group by month */
      {
        $group: {
          _id: {
            year: { $year: "$createdAtDate" },
            month: { $month: "$createdAtDate" }
          },
          totalProfit: {
            $sum: { $ifNull: ["$profit.amount", 0] }
          }
        }
      },

      /* ✅ Sort */
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ];

    const data = await db
      .collection("consignments")
      .aggregate(pipeline)
      .toArray();

    const formatted = data.map(d => ({
      period: `${d._id.year}-${String(d._id.month).padStart(2, "0")}`,
      totalProfit: d.totalProfit
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Monthly profit error:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly profit" },
      { status: 500 }
    );
  }
}
