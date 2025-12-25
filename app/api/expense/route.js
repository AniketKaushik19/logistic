import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

function buildDateFilter(period, startDate, endDate) {
  const now = new Date();

  if (period === "monthly") {
   const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));

    return { createdAt: { $gte: start, $lte: end } };
  }

  if (period === "yearly") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59));

    return { createdAt: { $gte: start, $lte: end } };
  }

  if (period === "custom" && startDate && endDate) {
  return {
      createdAt: {
        $gte: new Date(`${startDate}T00:00:00.000Z`),
        $lte: new Date(`${endDate}T23:59:59.999Z`),
      },
    };
  }

  return {};
}

/* ================= GET: LIST EXPENSES ================= */
export async function GET(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const vehicleId = searchParams.get("vehicleId");
    const period = searchParams.get("period") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Number(searchParams.get("limit") || 10);
    const skip = Number(searchParams.get("skip") || 0);
    const latest = searchParams.get("latest") === "true";

    if (!vehicleId) {
      return NextResponse.json(
        { error: "vehicleId is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");

    const filter = {
      vehicleId,
      ...buildDateFilter(period, startDate, endDate),
    };

    const cursor = db
      .collection("expenses")
      .find(filter)
      .sort({ createdAt: -1 });

    if (!latest) cursor.skip(skip).limit(limit);
    if (latest) cursor.limit(5);

    const expenses = await cursor.toArray();
    const total = await db.collection("expenses").countDocuments(filter);

    return NextResponse.json({
      status: "200",
      expenses,
      hasMore: skip + expenses.length < total,
    });
  } catch (error) {
    console.error("Expense list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

/* ================= POST: CREATE EXPENSE ================= */
export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db("logisticdb");

    await db.collection("expenses").insertOne({
      ...body,
      createdAt: new Date(),
      createdBy: auth.user.email,
    });

    return NextResponse.json({
      success: true,
      message: "Expense saved successfully",
    });
  } catch (error) {
    console.error("Expense insert error:", error);
    return NextResponse.json(
      { error: "Failed to save expense" },
      { status: 500 }
    );
  }
}
