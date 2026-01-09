import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { challanNo,
      date,
      grNos,     // multiple GR numbers
      to,
      from,
      lorryNo,

      packages,
      weight,
      rate,

      total,
      advance,
      netBalance,

      amountInWords,
      payableAt,

      driverName,
      ownerName,

      engineNo,
      chassisNo,
      licenceNo,

      through, } = await req.json();
    // Connect to DB
    const client = await clientPromise;
    const db = client.db("logisticdb");
    const result = await db.collection("Freight").insertOne({
      challanNo,
      date,
      grNos,     // multiple GR numbers
      to: to.toUpperCase(),
      from: from.toUpperCase(),
      lorryNo: lorryNo.toUpperCase(),

      packages,
      weight,
      rate,

      total,
      advance,
      netBalance,

      amountInWords,
      payableAt: payableAt.toUpperCase(),

      driverName: driverName.toUpperCase(),
      ownerName: ownerName.toUpperCase(),

      engineNo: engineNo.toUpperCase(),
      chassisNo: chassisNo.toUpperCase(),
      licenceNo: licenceNo.toUpperCase(),

      through: through.toUpperCase(),
      createdAt:new Date()
    });
    if (result) {
      return NextResponse.json({
        success: true,
        message: "Freight memo saved successfully",
      });
    }
    else {
      return NextResponse.json({
        success: true,
        message: "Freight memo Not saved",
      });
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { success: false, message: "Error saving freight" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const { challanNo,
      date,
      grNos,     // multiple GR numbers
      to,
      from,
      lorryNo,

      packages,
      weight,
      rate,

      total,
      advance,
      netBalance,

      amountInWords,
      payableAt,

      driverName,
      ownerName,

      engineNo,
      chassisNo,
      licenceNo,

      through,
    } = await req.json()
    const data = {
      challanNo,
      date,
      grNos,     // multiple GR numbers
      to,
      from,
      lorryNo,

      packages,
      weight,
      rate,

      total,
      advance,
      netBalance,

      amountInWords,
      payableAt,

      driverName,
      ownerName,

      engineNo,
      chassisNo,
      licenceNo,

      through,
    }
    const client = await clientPromise;
    const db = client.db("logisticdb");
    const result = await db.collection("Freight").findOneAndUpdate({ challanNo: challanNo },
      { $set: data });
    if (result) {
      return NextResponse.json({
        success: true,
        message: "Freight saved successfully",
      });
    }
    else {
      return NextResponse.json({
        success: true,
        message: "Freight Not saved",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error saving Freight" },
      { status: 500 }
    );
  }
}

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
    const data = await collection
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    return NextResponse.json({ msg: "freight data", data });
  } catch (error) {
    console.error("freight get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch freight data" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, res) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  } try {

    const { _id } = await req.json()
    console.log(_id)
    const client = await clientPromise;
    const db = client.db("logisticdb")
    const collection = db.collection("Freight")
    const result = await collection.deleteOne({ _id: new ObjectId(_id) })
    console.log(result)
    return NextResponse.json({ msg: "Freight deleted successfully" }, { status: 200 })
  }
  catch (error) {
    console.error("Error deleting Freight:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
