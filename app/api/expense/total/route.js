import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

function buildDateFilter(period, startDate, endDate) {
  const now = new Date();

  if (period === "monthly") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      0,
      23, 59, 59, 999
    ));

    return {
      date: {
        $gte: start.toISOString().split('T')[0],
        $lte: end.toISOString().split('T')[0],
      }
    };
  }

  if (period === "yearly") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    const end = new Date(Date.UTC(
      now.getUTCFullYear(),
      11,
      31,
      23, 59, 59, 999
    ));

    return {
      date: {
        $gte: start.toISOString().split('T')[0],
        $lte: end.toISOString().split('T')[0],
      }
    };
  }

  if (period === "custom" && startDate && endDate) {
    return {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };
  }

  return {};
}


export async function GET(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const vehicleId = searchParams.get("vehicleId");
    const period = searchParams.get("period") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!vehicleId) {
      return NextResponse.json(
        { error: "vehicleId required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");

    const filter = {
      vehicleId,
      ...buildDateFilter(period, startDate, endDate),
    };

    const result = await db
      .collection("expenses")
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $toDouble: "$Amount" } },
            totalExpense: { $sum: { $toDouble: "$totalExpense" } },
          },
        },
      ])
      .toArray();

    const maintenanceResult = await db
      .collection("maintenance")
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalMaintenance: { $sum: { $toDouble: "$amount" } },
            maintenanceCount: { $sum: 1 },
            latestMaintenanceDate: {
              $max: {
                $cond: [
                  { $eq: [{ $type: "$date" }, "date"] },
                  "$date",
                  { $toDate: "$date" }
                ]
              }
            }
          },
        },
      ])
      .toArray();

    const totalAmount = result[0]?.totalAmount || 0;
    const totalExpense = result[0]?.totalExpense || 0;
    const totalMaintenance = maintenanceResult[0]?.totalMaintenance || 0;
    const maintenanceCount = maintenanceResult[0]?.maintenanceCount || 0;
    const latestMaintenanceDate = maintenanceResult[0]?.latestMaintenanceDate
      ? maintenanceResult[0].latestMaintenanceDate.toISOString()
      : null;

    return NextResponse.json({
      success: true,
      totalAmount,
      totalExpense,
      totalMaintenance,
      maintenanceCount,
      latestMaintenanceDate,
      netProfit: totalAmount - totalExpense - totalMaintenance,
    });
  } catch (error) {
    console.error("Expense total error:", error);
    return NextResponse.json(
      { error: "Failed to calculate total" },
      { status: 500 }
    );
  }
}
