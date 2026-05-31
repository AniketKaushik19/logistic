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
                year: { $year: "$createdAtDate" },
                month: { $month: "$createdAtDate" },
              },
              consignments: { $sum: 1 },
              totalCost: {
                $sum: valueOrProfit(
                  "$expenses",
                  "$normalizedExpenses",
                  "$normalizedProfitExpenses"
                ),
              },
              totalProfit: {
                $sum: valueOrProfit(
                  "$amount",
                  "$normalizedAmount",
                  "$normalizedProfitAmount"
                ),
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
            $addFields: {
              normalizedAmount: convertNumber("$amount"),
              normalizedExpenses: convertNumber("$expenses"),
              normalizedProfitAmount: convertNumber("$profit.amount"),
              normalizedProfitExpenses: convertNumber("$profit.expenses"),
            }
          },
          {
            $group: {
              _id: { $year: "$createdAtDate" },
              consignments: { $sum: 1 },
              totalCost: {
                $sum: valueOrProfit(
                  "$expenses",
                  "$normalizedExpenses",
                  "$normalizedProfitExpenses"
                ),
              },
              totalProfit: {
                $sum: valueOrProfit(
                  "$amount",
                  "$normalizedAmount",
                  "$normalizedProfitAmount"
                ),
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
            $addFields: {
              normalizedAmount: convertNumber("$amount"),
              normalizedExpenses: convertNumber("$expenses"),
              normalizedProfitAmount: convertNumber("$profit.amount"),
              normalizedProfitExpenses: convertNumber("$profit.expenses"),
            }
          },
          {
            $group: {
              _id: null,
              consignments: { $sum: 1 },
              totalCost: {
                $sum: valueOrProfit(
                  "$expenses",
                  "$normalizedExpenses",
                  "$normalizedProfitExpenses"
                ),
              },
              totalProfit: {
                $sum: valueOrProfit(
                  "$amount",
                  "$normalizedAmount",
                  "$normalizedProfitAmount"
                ),
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
