import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

export async function GET(req, { params }) {
  const { cn } = await params; // ✅ MUST await params

  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }

  if (!cn) {
    return NextResponse.json(
      { success: false, message: "Consignment number missing" },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("logisticdb");

    const consignment = await db
      .collection("consignments")
      .findOne({ cn });

    if (!consignment) {
      return NextResponse.json(
        { success: false, message: "Consignment not found" },
        { status: 404 }
      );
    }

    const assignments = await db
      .collection("assignments")
      .find({ cn })
      .sort({ assignedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      consignment,
      assignments,
    });
  } catch (error) {
    console.error("Track API error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
