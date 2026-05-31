import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

function buildDateFilter(period, startDate, endDate) {
  const now = new Date();

  if (period === "monthly") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));

    return {
      date: {
        $gte: start.toISOString().split('T')[0],
        $lte: end.toISOString().split('T')[0],
      }
    };
  }

  if (period === "yearly") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59));

    return {
      date: {
        $gte: start.toISOString().split('T')[0],
        $lte: end.toISOString().split('T')[0],
      }
    };
  }

  if (period === "custom" && startDate && endDate) {
    return {
      date: {
        $gte: startDate,
        $lte: endDate,
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

/* ================= PUT: UPDATE EXPENSE ================= */
export async function PUT(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { _id, title, Amount, totalExpense, date } = body;

    if (!_id) {
      return NextResponse.json({ error: "_id is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");
    const collection = db.collection("expenses");

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (Amount !== undefined) updateData.Amount = Amount;
    if (totalExpense !== undefined) updateData.totalExpense = totalExpense;
    if (date !== undefined) updateData.date = date;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Expense updated successfully" });
  } catch (error) {
    console.error("Expense update error:", error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

/* ================= DELETE: REMOVE EXPENSE ================= */
export async function DELETE(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json({ error: "_id is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");
    const collection = db.collection("expenses");

    const result = await collection.deleteOne({ _id: new ObjectId(_id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Expense delete error:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
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
