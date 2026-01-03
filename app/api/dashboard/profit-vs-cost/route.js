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
      /* ✅ Ensure createdAt is a valid Date */
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

      /* ✅ Group by Year + Month */
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$createdAtDate" }, // ISO week year
            month: { $month: "$createdAtDate" }       // Month number
          },
          consignments: { $sum: 1 },
          totalProfit: { $sum: { $ifNull: ["$profit.amount", 0] } },
          totalCost: { $sum: { $ifNull: ["$profit.totalCost", 0] } },
        }
      },

      /* ✅ Calculate netProfit */
      {
        $addFields: {
          netProfit: { $subtract: ["$totalProfit", "$totalCost"] }
        }
      },

      /* ✅ Sort chronologically */
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ];

    const data = await db.collection("consignments").aggregate(pipeline).toArray();

    const formatted = data.map(d => ({
      period: `${d._id.year}-${String(d._id.month).padStart(2, "0")}`,
      consignments: d.consignments,
      totalProfit: d.totalProfit,
      totalCost: d.totalCost,
      netProfit: d.netProfit
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Monthly analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly analytics" },
      { status: 500 }
    );
  }
}
