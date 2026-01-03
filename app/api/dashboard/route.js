import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

/* ================= CACHE ================= */
let cache = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL = 1000 * 60 * 5; // ⏱ 5 minutes

export async function GET(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const now = Date.now();

    /* 🚀 RETURN CACHED DATA IF VALID */
    if (cache.data && now - cache.timestamp < CACHE_TTL) {
      return NextResponse.json({
        ...cache.data,
        cached: true, // optional (remove in prod if you want)
      });
    }

    /* 🔄 FETCH FRESH DATA */
    const client = await clientPromise;
    const db = client.db("logisticdb");

    const [stats] = await db
      .collection("consignments")
      .aggregate([
        {
          $group: {
            _id: null,
            totalConsignments: { $sum: 1 },
            totalProfit: {
              $sum: { $ifNull: ["$profit.amount", 0] },
            },
            totalCost: {
              $sum: { $ifNull: ["$profit.totalCost", 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalConsignments: 1,
            totalProfit: 1,
            totalCost: 1,
          },
        },
      ])
      .toArray();

    const responseData =
      stats || {
        totalConsignments: 0,
        totalProfit: 0,
        totalCost: 0,
      };

    /* 💾 UPDATE CACHE */
    cache = {
      data: responseData,
      timestamp: now,
    };

    return NextResponse.json({
      ...responseData,
      cached: false, // optional
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
