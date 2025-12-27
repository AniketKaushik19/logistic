import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";


export async function GET(req, context) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ CORRECT: params is a Promise
  const params = await context.params;
  const { id } = params;
 if (!id) {
    return NextResponse.json(
      { error: "Consignment id missing" },
      { status: 400 }
    );
  }

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: "Invalid consignment id" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  const profitDoc = await db.collection("profits").findOne({
    consignmentId: new ObjectId(id),
  });
 return NextResponse.json({
    profit: profitDoc?.profit ?? null,
  });
}

/**
 * POST → Save or update profit for a consignment
 */
export async function POST(req, { params }) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
  
    const profit = Number(body.profit);
    const totalCost = Number(body.totalCost || 0);
    const expenses = Number(body.expenses || 0);
    if (Number.isNaN(profit)) {
      return NextResponse.json({ error: "Invalid profit" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");

    // 🔁 UPSERT PROFIT (one profit per consignment)
    await db.collection("profits").updateOne(
      { consignmentId: new ObjectId(id) },
      {
        $set: {
          profit,
          totalCost,
          expenses,
          updatedAt: new Date(),
          createdBy: auth.user.email,
        },
        $setOnInsert: {
          consignmentId: new ObjectId(id),
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json(
      { success: true, profit },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profit API error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
