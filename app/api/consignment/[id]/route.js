import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";

/* ================= GET ================= */
export async function GET(req, { params }) {
  // const auth = await requireAuth(req);
  // if (!auth.authenticated) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const { id } = params; // ✅ FIX

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid consignment ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");

    const doc = await db.collection("consignments").findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return NextResponse.json(
        { error: "Consignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(doc, { status: 200 });
  } catch (error) {
    console.error("GET consignment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ================= PUT ================= */
export async function PUT(req, { params }) {
  // const auth = await requireAuth(req);
  // if (!auth.authenticated) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid consignment ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // 🚫 REMOVE _id FROM UPDATE PAYLOAD
    const { _id, ...safeBody } = body;

    const client = await clientPromise;
    const db = client.db("logisticdb");

    const result = await db.collection("consignments").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...safeBody,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return NextResponse.json(
        { error: "Consignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.value },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT consignment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ================= DELETE ================= */
export async function DELETE(req, { params }) {
  // const auth = await requireAuth(req);
  // if (!auth.authenticated) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const { id } = params; // ✅ FIX

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid or missing consignment ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");

    const result = await db.collection("consignments").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Consignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Consignment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE consignment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}