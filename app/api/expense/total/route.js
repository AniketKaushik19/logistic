import clientPromise from "@/lib/mongodb";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || 'all'; // all, monthly, yearly, custom
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const vehicleId = searchParams.get('vehicleId');

        const client = await clientPromise;
        const db = client.db("logisticdb");
        const collection = db.collection("expenses");

        let matchQuery = {};

        // Add vehicle filter if provided
        if (vehicleId) {
            matchQuery.vehicleId = vehicleId;
        }

        // Add date filters
        if (period === 'custom' && startDate && endDate) {
            matchQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (period === 'monthly') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            matchQuery.createdAt = {
                $gte: startOfMonth,
                $lte: endOfMonth
            };
        } else if (period === 'yearly') {
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            matchQuery.createdAt = {
                $gte: startOfYear,
                $lte: endOfYear
            };
        }

        // Aggregation pipeline to calculate total
        const pipeline = [
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: { $toDouble: "$Amount" } },
                    count: { $sum: 1 }
                }
            }
        ];

        const result = await collection.aggregate(pipeline).toArray();

        const totalAmount = result.length > 0 ? result[0].totalAmount : 0;
        const expenseCount = result.length > 0 ? result[0].count : 0;

        return Response.json({
            status: "200",
            success: true,
            totalAmount: totalAmount,
            expenseCount: expenseCount,
            period: period,
            filters: {
                vehicleId: vehicleId,
                startDate: startDate,
                endDate: endDate
            }
        });
    } catch (error) {
        console.error("Database error:", error);
        return Response.json({
            status: "500",
            success: false,
            error: "Failed to calculate total expenses"
        });
    }
}