import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const client = await clientPromise;
    const db = client.db("logisticdb");

    let matchCondition = {};

    if (type === 'monthly') {
      // Group by month
      const pipeline = [
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" }
            },
            consignments: { $sum: 1 },
            totalCost: { $sum: "$totalCost" },
            totalProfit: { $sum: "$netProfit" }
          }
        },
        {
          $sort: { "_id.year": -1, "_id.month": -1 }
        }
      ];

      const results = await db.collection("profits").aggregate(pipeline).toArray();

      const data = results.map(item => ({
        period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        consignments: item.consignments,
        totalCost: item.totalCost,
        totalProfit: item.totalProfit
      }));

      return Response.json(data);
    } else if (type === 'yearly') {
      // Group by year
      const pipeline = [
        {
          $group: {
            _id: { $year: "$date" },
            consignments: { $sum: 1 },
            totalCost: { $sum: "$totalCost" },
            totalProfit: { $sum: "$netProfit" }
          }
        },
        {
          $sort: { "_id": -1 }
        }
      ];

      const results = await db.collection("profits").aggregate(pipeline).toArray();

      const data = results.map(item => ({
        period: `${item._id}`,
        consignments: item.consignments,
        totalCost: item.totalCost,
        totalProfit: item.totalProfit
      }));

      return Response.json(data);
    } else if (type === 'custom' && start && end) {
      // Custom date range
      matchCondition = {
        date: {
          $gte: new Date(start),
          $lte: new Date(end)
        }
      };

      const profits = await db.collection("profits").find(matchCondition).toArray();

      const totalCost = profits.reduce((sum, p) => sum + (p.totalCost || 0), 0);
      const totalProfit = profits.reduce((sum, p) => sum + (p.netProfit || 0), 0);

      const data = [{
        period: `${start} to ${end}`,
        consignments: profits.length,
        totalCost,
        totalProfit
      }];

      return Response.json(data);
    }

    return Response.json([]);
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Failed to fetch analysis data" },
      { status: 500 }
    );
  }
}