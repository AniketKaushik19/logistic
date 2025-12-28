import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

/* =========================
   GET → Fetch profit
========================= */
export async function GET(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ✅ ALWAYS SAFE (works on Vercel)
 const parts = req.url.split("/");
const id = parts[parts.length - 2]; // second last element
console.log("profit id  " + id);
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
      totalCost: profitDoc?.totalCost ?? 0,
      expenses: profitDoc?.expenses ?? 0,
    });
  } catch (error) {
    console.error("GET Profit error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

/* =========================
   POST → Save / Update profit
========================= */
export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
  const parts = req.url.split("/");
const id = parts[parts.length - 2]; // second last element
console.log("post profit id " + id);

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid consignment id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const profit = Number(body.profit);
    const totalCost = Number(body.totalCost || 0);
    const expenses = Number(body.expenses || 0);

    if (Number.isNaN(profit)) {
      return NextResponse.json(
        { error: "Invalid profit value" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");

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
    console.error("POST Profit error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
