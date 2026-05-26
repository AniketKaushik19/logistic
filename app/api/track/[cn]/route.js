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
      { success: false, message: "Search query missing" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "consignment";

  try {
    const client = await clientPromise;
    const db = client.db("logisticdb");

    if (type === "consignment") {
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
    } else if (type === "freight") {
      const freight = await db
        .collection("Freight")
        .findOne({ challanNo: { $regex: new RegExp(`^${cn}$`, "i") } });

      if (!freight) {
        return NextResponse.json(
          { success: false, message: "Freight Memo not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        freight,
      });
    } else if (type === "ebill") {
      const ebill = await db
        .collection("E-bill")
        .findOne({ billNo: { $regex: new RegExp(`^${cn}$`, "i") } });

      if (!ebill) {
        return NextResponse.json(
          { success: false, message: "E-Bill not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        ebill,
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid tracking type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Track API error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
