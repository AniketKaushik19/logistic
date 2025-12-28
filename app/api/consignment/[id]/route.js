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




