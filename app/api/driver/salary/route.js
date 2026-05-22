import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";

/* =========================================================
   GET SALARY BY DRIVER + MONTH
========================================================= */
export async function GET(req) {
  const auth = await requireAuth(req);

  if (!auth.authenticated) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);

  const driverId = searchParams.get("driverId");
  const month = searchParams.get("month");

  if (!ObjectId.isValid(driverId)) {
    return NextResponse.json(
      { error: "Invalid driverId" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  /* ===== CURRENT MONTH DEFAULT ===== */
  const now = new Date();

  const currentMonth =
    month ||
    `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

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

          salary: {
            $ifNull: ["$salary", 0],
          },

          advance: {
            $ifNull: ["$advance", 0],
          },

          bonus: {
            $ifNull: ["$bonus", 0],
          },

         

          pendingAdvance: {
            $ifNull: ["$pendingAdvance", 0],
          },

          transactionType: {
            $ifNull: ["$transactionType", null],
          },

          status: {
            $ifNull: ["$status", "Unpaid"],
          },

          paidAt: 1,
          createdAt: 1,
          updatedAt: 1,

          /* ===== DRIVER FIELDS ===== */
          driver: {
            _id: "$driver._id",

            name: "$driver.name",

            contactNumber:
              "$driver.contactNumber",
            vehicleNumber:
              "$driver.vehicleNumber",

            salary: "$driver.salary",

            status: "$driver.status",
          },
        },
      },
    ])
    .toArray();

  const pendingAgg = await db
    .collection("driverSalaryHistory")
    .aggregate([
      {
        $match: {
          driverId: new ObjectId(driverId),
        },
      },
      {
        $group: {
          _id: null,
          totalAdvanceGiven: {
            $sum: {
              $cond: [
                { $eq: ["$transactionType", "ADVANCE_GIVEN"] },
                "$advance",
                0,
              ],
            },
          },
          totalAdvanceSettled: {
            $sum: {
              $cond: [
                { $eq: ["$transactionType", "SALARY_PAID"] },
                "$advance",
                0,
              ],
            },
          },
        },
      },
    ])
    .toArray();

  const currentPendingAdvance =
    Math.max(
      0,
      (pendingAgg[0]?.totalAdvanceGiven || 0) -
        (pendingAgg[0]?.totalAdvanceSettled || 0)
    );

  const salaryDetails = result[0] || {};
  salaryDetails.pendingAdvance = currentPendingAdvance;

  return NextResponse.json(salaryDetails, { status: 200 });
}

/* =========================================================
   CREATE / UPDATE DRIVER SALARY
========================================================= */
export async function POST(req) {
  const auth = await requireAuth(req);

  if (!auth.authenticated) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const {
    driverId,
    type,
    month,
    action = "PAY_SALARY", // "GIVE_ADVANCE" or "PAY_SALARY"
    salary = 0,
    advance = 0,
    bonus = 0,
  } = await req.json();

  if (
    !ObjectId.isValid(driverId) ||
    type !== "UPDATE" ||
    !month ||
    !["GIVE_ADVANCE", "PAY_SALARY"].includes(action)
  ) {
    return NextResponse.json(
      { error: "Invalid data" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  if (action === "GIVE_ADVANCE") {
    /* ===== GIVE ADVANCE ONLY ===== */
    const pendingAgg = await db
      .collection("driverSalaryHistory")
      .aggregate([
        {
          $match: {
            driverId: new ObjectId(driverId),
          },
        },
        {
          $group: {
            _id: null,
            totalAdvanceGiven: {
              $sum: {
                $cond: [
                  { $eq: ["$transactionType", "ADVANCE_GIVEN"] },
                  "$advance",
                  0,
                ],
              },
            },
            totalAdvanceSettled: {
              $sum: {
                $cond: [
                  { $eq: ["$transactionType", "SALARY_PAID"] },
                  "$advance",
                  0,
                ],
              },
            },
          },
        },
      ])
      .toArray();

    const currentPendingAdvance =
      Math.max(
        0,
        (pendingAgg[0]?.totalAdvanceGiven || 0) -
          (pendingAgg[0]?.totalAdvanceSettled || 0)
      );
    const newPendingAdvance = currentPendingAdvance + Number(advance);

    const advancePayload = {
      driverId: new ObjectId(driverId),
      month,
      salary: 0,
      advance: Number(advance),
      bonus: 0,
      pendingAdvance: newPendingAdvance,
      transactionType: "ADVANCE_GIVEN",
      status: "Advance Given",
      paidAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("driverSalaries").updateOne(
      {
        driverId: new ObjectId(driverId),
        month,
      },
      {
        $set: advancePayload,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    /* ===== INSERT TO HISTORY ===== */
    await db.collection("driverSalaryHistory").insertOne({
      ...advancePayload,
      createdBy: auth.user?.id || null,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Advance given",
      pendingAdvance: newPendingAdvance,
    });
  }

  if (action === "PAY_SALARY") {
    /* ===== PAY SALARY WITH PENDING ADVANCE SETTLEMENT ===== */
    const pendingAgg = await db
      .collection("driverSalaryHistory")
      .aggregate([
        {
          $match: {
            driverId: new ObjectId(driverId),
          },
        },
        {
          $group: {
            _id: null,
            totalAdvanceGiven: {
              $sum: {
                $cond: [
                  { $eq: ["$transactionType", "ADVANCE_GIVEN"] },
                  "$advance",
                  0,
                ],
              },
            },
            totalAdvanceSettled: {
              $sum: {
                $cond: [
                  { $eq: ["$transactionType", "SALARY_PAID"] },
                  "$advance",
                  0,
                ],
              },
            },
          },
        },
      ])
      .toArray();

    const pendingAdvance = Math.max(
      0,
      (pendingAgg[0]?.totalAdvanceGiven || 0) -
        (pendingAgg[0]?.totalAdvanceSettled || 0)
    );

    const salaryAmount = Number(salary);
    const bonusAmount = Number(bonus);
    const advanceSettled = Math.min(
      pendingAdvance,
      salaryAmount
    );
    const remainingPendingAdvance =
      pendingAdvance - advanceSettled;

    const netPay = Math.max(
      0,
      salaryAmount - advanceSettled + bonusAmount
    );

    const salaryPayload = {
      driverId: new ObjectId(driverId),
      month,
      salary: salaryAmount,
      advance: advanceSettled,
      bonus: bonusAmount,
      pendingAdvance: remainingPendingAdvance,
      transactionType: "SALARY_PAID",
      netPay,
      status: "Paid",
      paidAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("driverSalaries").updateOne(
      {
        driverId: new ObjectId(driverId),
        month,
      },
      {
        $set: salaryPayload,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    /* ===== INSERT TO HISTORY ===== */
    await db.collection("driverSalaryHistory").insertOne({
      ...salaryPayload,
      createdBy: auth.user?.id || null,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Salary paid",
      netPay,
      advanceSettled,
      pendingAdvance: remainingPendingAdvance,
    });
  }
}

/* =========================================================
   DELETE MONTH SALARY
========================================================= */
export async function DELETE(req) {
  const auth = await requireAuth(req);

  if (!auth.authenticated) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { driverId, month } =
    await req.json();

  if (
    !ObjectId.isValid(driverId) ||
    !month
  ) {
    return NextResponse.json(
      { error: "Invalid data" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  await db
    .collection("driverSalaries")
    .deleteOne({
      driverId: new ObjectId(driverId),
      month,
    });

  return NextResponse.json({
    success: true,
  });
}