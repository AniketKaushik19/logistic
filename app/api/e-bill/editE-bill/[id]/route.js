import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const id=await req.json()
    const client = await clientPromise;
    const db = client.db("logisticdb");
    const collection = db.collection("E-bill");
    const data = await collection
      .findOne({_id:new ObjectId(id)})
    console.log(data)
    return NextResponse.json({msg:"Edit E-bill data",data});
  } catch (error) {
    console.error(" Error in edit ebill:", error);
    return NextResponse.json(
      { error: "Failed to fetch edit ebill data" },
      { status: 500 }
    );
  }
}