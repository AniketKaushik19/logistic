import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get("driverId");

  if (!ObjectId.isValid(driverId)) {
    return NextResponse.json({ error: "Invalid driverId" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  // Fetch base salary from drivers collection
  const driver = await db
    .collection("drivers")
    .findOne(
      { _id: new ObjectId(driverId) },
      { projection: { salary: 1, name: 1 } }
    );

  const baseSalary = driver?.salary || 0;

  // Fetch salary history
  const history = await db
    .collection("driverSalaryHistory")
    .find({ driverId: new ObjectId(driverId) })
    .sort({ createdAt: -1 })
    .toArray();

  // Remove note and amount fields, and add baseSalary to each record
  const cleanedHistory = history.map((h) => ({
    _id: h._id,
    driverId: h.driverId,
    month: h.month,
    advance: h.advance || 0,
    bonus: h.bonus || 0,
    penalty: h.penalty || 0,
    markPaid: !!h.markPaid,
    createdBy: h.createdBy || null,
    createdAt: h.createdAt,
    baseSalary, // add base salary from driver
  }));

  return NextResponse.json(cleanedHistory);
}
