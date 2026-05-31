import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

const convertNumber = (field) => ({
  $convert: {
    input: field,
    to: "double",
    onError: 0,
    onNull: 0,
  },
});

const valueOrProfit = (rawField, normalizedField, profitField) => ({
  $cond: [
    {
      $or: [
        { $in: [{ $type: rawField }, ["missing", "null"]] },
        { $eq: [rawField, ""] },
      ],
    },
    profitField,
    normalizedField,
  ],
});

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
        $addFields: {
          normalizedAmount: convertNumber("$amount"),
          normalizedProfitAmount: convertNumber("$profit.amount"),
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAtDate" },
            month: { $month: "$createdAtDate" }
          },
          totalProfit: {
            $sum: valueOrProfit(
              "$amount",
              "$normalizedAmount",
              "$normalizedProfitAmount"
            )
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
