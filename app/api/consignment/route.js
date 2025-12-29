import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";
/**
 * GET → Fetch all consignments
 */
export async function GET(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("logisticdb");

    const data = await db
      .collection("consignments")
      .find(
        {},
        {
          projection: {
            cn: 1,
            amount: 1,
            consigneeName: 1,
            consignorName: 1,
            createdAt: 1,
            profit: 1, // 👈 important
            status: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch consignments" },
      { status: 500 }
    );
  }
}

/**
 * POST → Save new consignment
 */
export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");
    const counters = db.collection("counters");

    await counters.updateOne(
      { _id: "consignment" },
      { $setOnInsert: { seq: 0 } },
      { upsert: true }
    );

    const counterResult = await counters.findOneAndUpdate(
      { _id: "consignment" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const seq = counterResult?.seq;
    if (seq === undefined) {
      return NextResponse.json(
        { error: "Failed to generate consignment number" },
        { status: 500 }
      );
    }

    const cn = `ALC-${seq}`;
    const consignment = {
      ...body,
      cn,
      status: "Booked",
      profit: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: auth.user.email,
    };

    const result = await db.collection("consignments").insertOne(consignment);

    return NextResponse.json(
      {
        success: true,
        message: "Consignment created successfully",
        cn,
        insertedId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST consignment error:", error);
    return NextResponse.json(
      { error: "Failed to save consignment" },
      { status: 500 }
    );
  }
}

// DELETE CONSIGNMENT WITH THE GIVEN CONSIGNMENT NUMBER IN THE BODY
export async function DELETE(req, res) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { consignmentNumber } = await req.json();

    const client = await clientPromise;
    const db = client.db("logisticdb");

    const collection = await db.collection("consignments");
    const result = await collection.deleteOne({
      cn: consignmentNumber,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Consignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Consignment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE consignment error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ================= PUT ================= */
export async function PUT(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { _id, profit, ...rest } = body;

    if (!_id || !ObjectId.isValid(_id)) {
      return NextResponse.json(
        { error: "Invalid consignment ID" },
        { status: 400 }
      );
    }

    /* ================= UPDATE DOC ================= */
    const updateDoc = {
      ...rest,
      updatedAt: new Date(),
      updatedBy: auth.user.email,
    };

    /* ================= PROFIT (SAFE) ================= */
    if (profit !== undefined) {
      const amount = Number(
        typeof profit === "object" ? profit.amount : profit
      );

      const totalCost =
        typeof profit === "object" ? Number(profit.totalCost || 0) : 0;

      const expenses =
        typeof profit === "object" ? Number(profit.expenses || 0) : 0;

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

    /* ================= DB UPDATE ================= */
    const client = await clientPromise;
    const db = client.db("logisticdb");

    const result = await db.collection("consignments").findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );
console.log(result)
    if (!result) {
      return NextResponse.json(
        { error: "Consignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Consignment updated successfully",
        data: result.value,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT consignment error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
