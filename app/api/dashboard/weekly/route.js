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
      /* ✅ Convert createdAt safely */
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

      /* ✅ Group by ISO week */
      {
        $addFields: {
          normalizedAmount: convertNumber("$amount"),
          normalizedExpenses: convertNumber("$expenses"),
          normalizedProfitAmount: convertNumber("$profit.amount"),
          normalizedProfitExpenses: convertNumber("$profit.expenses"),
        }
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$createdAtDate" },
            week: { $isoWeek: "$createdAtDate" }
          },
          consignments: { $sum: 1 },
          totalProfit: {
            $sum: valueOrProfit(
              "$amount",
              "$normalizedAmount",
              "$normalizedProfitAmount"
            )
          },
          totalCost: {
            $sum: valueOrProfit(
              "$expenses",
              "$normalizedExpenses",
              "$normalizedProfitExpenses"
            )
          }
        }
      },

      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ];

    const data = await db
      .collection("consignments")
      .aggregate(pipeline)
      .toArray();

    const formatted = data.map(d => ({
      period: `W${d._id.week}-${d._id.year}`,
      consignments: d.consignments,
      totalProfit: d.totalProfit,
      totalCost: d.totalCost
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Weekly analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly analytics" },
      { status: 500 }
    );
  }
}
