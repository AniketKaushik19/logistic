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

  const query = {
    driverId: new ObjectId(driverId),
  };

  if (month) query.month = month;

  const salary = await db.collection("driverSalaries").findOne(query);

  return NextResponse.json(salary || {}, { status: 200 });
}

export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { driverId, type } = body;

  if (!ObjectId.isValid(driverId)) {
    return NextResponse.json({ error: "Invalid driverId" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  /* ===== CURRENT MONTH ===== */
  const now = new Date();
  const month = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  /* ===== FETCH BASE SALARY ===== */
  const driver = await db
    .collection("drivers")
    .findOne(
      { _id: new ObjectId(driverId) },
      { projection: { salary: 1 } }
    );

  const baseSalary = Number(driver?.salary || 0);

  /* ===== BASE UPDATE ===== */
  const filter = { driverId: new ObjectId(driverId), month };

  const update = {
    $set: {
      updatedAt: new Date(),
    },
    $setOnInsert: {
      createdAt: new Date(),
      baseSalary,
      advance: 0,
      bonus: 0,
      penalty: 0,
    },
  };

  /* ===== ACTIONS ===== */
  if (type === "ADVANCE") {
    update.$inc = { advance: Number(body.amount || 0) };
  }

  if (type === "ADJUSTMENT") {
    update.$inc = {
      bonus: Number(body.bonus || 0),
      penalty: Number(body.penalty || 0),
    };
  }

  if (type === "MARK_PAID") {
    update.$set.status = "Paid";
    update.$set.paidAt = new Date();
  }

  // default unpaid (only when NOT marking paid)
  if (type !== "MARK_PAID") {
    update.$set.status = "Unpaid";
  }

  await db.collection("driverSalaries").updateOne(
    filter,
    update,
    { upsert: true }
  );

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
