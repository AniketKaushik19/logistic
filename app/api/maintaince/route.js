import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

function buildDateFilter(period, startDate, endDate) {
  const now = new Date();

  if (period === "monthly") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      0,
      23, 59, 59, 999
    ));

    return {
      date: {
        $gte: start.toISOString().split('T')[0],
        $lte: end.toISOString().split('T')[0],
      }
    };
  }

  if (period === "yearly") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    const end = new Date(Date.UTC(
      now.getUTCFullYear(),
      11,
      31,
      23, 59, 59, 999
    ));

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

export async function GET(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");
    const period = searchParams.get("period") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
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

    const records = await db
      .collection("maintenance")
      .find(filter)
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json({ status: "200", records });
  } catch (error) {
    console.error("Maintenance list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance records" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { _id, description, amount, date } = body;

    if (!_id) {
      return NextResponse.json({ error: "_id is required" }, { status: 400 });
    }

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (date !== undefined) updateData.date = date;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");
    const result = await db
      .collection("maintenance")
      .updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Maintenance record updated successfully" });
  } catch (error) {
    console.error("Maintenance update error:", error);
    return NextResponse.json({ error: "Failed to update maintenance record" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json({ error: "_id is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");
    const result = await db
      .collection("maintenance")
      .deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Maintenance record deleted successfully" });
  } catch (error) {
    console.error("Maintenance delete error:", error);
    return NextResponse.json({ error: "Failed to delete maintenance record" }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
  }

  try {
    const { vehicleId, description, amount, date } = await req.json();

    if (!vehicleId || !description || !amount || !date) {
      return NextResponse.json(
        { error: "vehicleId, description, amount, and date are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");
    const collection = db.collection("maintenance");

    const record = {
      vehicleId,
      description,
      amount: parseFloat(amount),
      date,
      createdAt: new Date(),
      createdBy: auth.user.email,
    };

    const result = await collection.insertOne(record);

    return NextResponse.json(
      { success: true, message: "Maintenance record saved successfully", recordId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Maintenance save error:", error);
    return NextResponse.json(
      { error: "Failed to save maintenance record" },
      { status: 500 }
    );
  }
}
