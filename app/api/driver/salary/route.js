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
  const month = searchParams.get("month"); // optional

  if (!ObjectId.isValid(driverId)) {
    return NextResponse.json({ error: "Invalid driverId" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  /* ===== CURRENT MONTH DEFAULT ===== */
  const now = new Date();
  const currentMonth =
    month ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  /* ===== AGGREGATION ===== */
  const result = await db
    .collection("driverSalaries")
    .aggregate([
      {
        $match: {
          driverId: new ObjectId(driverId),
          month: currentMonth,
        },
      },
      {
        $lookup: {
          from: "drivers",
          localField: "driverId",
          foreignField: "_id",
          as: "driver",
        },
      },
      {
        $unwind: {
          path: "$driver",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          month: 1,
          status: { $ifNull: ["$status", "Unpaid"] },
          baseSalary: { $ifNull: ["$baseSalary", 0] },
          advance: { $ifNull: ["$advance", 0] },
          bonus: { $ifNull: ["$bonus", 0] },
          penalty: { $ifNull: ["$penalty", 0] },
          paidAt: 1,
          createdAt: 1,
          updatedAt: 1,

          /* Driver fields */
          driver: {
            _id: "$driver._id",
            name: "$driver.name",
            contactNumber: "$driver.contactNumber",
            emailAddress: "$driver.emailAddress",
            vehicleNumber: "$driver.vehicleNumber",
            salary: "$driver.salary",
            status: "$driver.status",
          },
        },
      },
    ])
    .toArray();

  return NextResponse.json(result[0] || {}, { status: 200 });
}

export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { driverId, type, advance = 0, bonus = 0, penalty = 0, markPaid } =
    await req.json();

  if (!ObjectId.isValid(driverId) || type !== "UPDATE") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;

  // Fetch existing salary
  const existing = await db.collection("driverSalaries").findOne({
    driverId: new ObjectId(driverId),
    month,
  });

  const newAdvance = (existing?.advance || 0) + Number(advance);
  const newBonus = (existing?.bonus || 0) + Number(bonus);
  const newPenalty = (existing?.penalty || 0) + Number(penalty);

  const update = {
    $set: {
      advance: newAdvance,
      bonus: newBonus,
      penalty: newPenalty,
      status: markPaid ? "Paid" : existing?.status || "Unpaid",
      paidAt: markPaid ? new Date() : existing?.paidAt || null,
      updatedAt: new Date(),
    },
    $setOnInsert: {
      createdAt: new Date(),
    },
  };

  await db.collection("driverSalaries").updateOne(
    { driverId: new ObjectId(driverId), month },
    update,
    { upsert: true }
  );

  // Salary history
  await db.collection("driverSalaryHistory").insertOne({
    driverId: new ObjectId(driverId),
    month,
    advance: Number(advance),
    bonus: Number(bonus),
    penalty: Number(penalty),
    markPaid: !!markPaid,
    createdBy: auth.user?.id || null,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}

export async function PUT(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { driverId, month } = await req.json();

  if (!ObjectId.isValid(driverId) || !month) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  await db.collection("driverSalaries").updateOne(
    { driverId: new ObjectId(driverId), month },
    {
      $set: {
        status: "Paid",
        paidAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );

  return NextResponse.json({ success: true });
}
export async function DELETE(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { driverId, month } = await req.json();

  if (!ObjectId.isValid(driverId) || !month) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  await db.collection("driverSalaries").deleteOne({
    driverId: new ObjectId(driverId),
    month,
  });

  return NextResponse.json({ success: true });
}
