import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";

/* ================= GET ================= */
export async function GET(req, { params }) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } =await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid consignment ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");

    const doc = await db.collection("consignments").findOne({
      _id: new ObjectId(id),
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Consignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error("GET consignment error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

/* ================= PUT ================= */
export async function PUT(req, { params }) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } =await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid consignment ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { _id, profit, ...rest } = body;

    const updateDoc = {
      ...rest,
      updatedAt: new Date(),
    };

    // ✅ handle profit safely
    if (profit !== undefined) {
      const amount = Number(profit.amount ?? profit);
      const totalCost = Number(profit.totalCost || 0);
      const expenses = Number(profit.expenses || 0);

      if (Number.isNaN(amount)) {
        return NextResponse.json(
          { error: "Invalid profit amount" },
          { status: 400 }
        );
      }
      updateDoc.profit = {
        amount,
        totalCost,
        expenses,
        updatedAt: new Date(),
        updatedBy: auth.user.email,
      };
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");

    const result = await db.collection("consignments").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );
    if (!result.profit) {
      return NextResponse.json(
        { error: "Consignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.profit,
    });
  } catch (error) {
    console.error("PUT consignment error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

/* ================= DELETE ================= */
export async function DELETE(req, { params }) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } =await params;
console.log(id)
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid consignment ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");

    const result = await db.collection("consignments").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Consignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE consignment error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
