import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
  try {
      const pathname = new URL(req.url).pathname;

    const cn = pathname.split("/").pop();
params?.cn;
    if (!cn) {
      return NextResponse.json(
        { success: false, message: "Consignment number missing" },
        { status: 400 }
      );
    }

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

    let assignments = [];
    try {
      assignments = await db
        .collection("assignments")
        .find({ cn })
        .sort({ assignedAt: -1 })
        .toArray();
    } catch (e) {
      assignments = [];
    }

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
