import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

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
    const collection = db.collection("Freight");

    const data = await collection.findOne(
      {},
      { sort: { createdAt: -1 }, projection: { challanNo: 1, _id: 0 } }
    );

    // If no record found, return default "0001"
    if (!data) {
      return NextResponse.json({
        msg: "No Freight found, starting fresh",
        data:{billNo: "CH-0000"},
      });
    }

    // Otherwise return the last billNo
    return NextResponse.json({
      msg: "Freight last entry",
      data
    });
  } catch (error) {
    console.error("Freight get last error:", error);
    return NextResponse.json(
      { error: "Failed to fetch last Freight data" },
      { status: 500 }
    );
  }
}