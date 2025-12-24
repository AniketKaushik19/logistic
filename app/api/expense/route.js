import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

export async function POST(req, res) {
    // requireAuth();
    try{

        const data=await req.json()
        const client=await clientPromise
        const db=client.db("logisticdb");
        const collection=db.collection("expenses");
        const result=await collection.insertOne(data);
        return Response.json({status:"200",success:true,message:"Expense saved successfully"})
    }
    catch(error){
        console.error("Database error:",error)
        return Response.json({status:"400",error:"Failed to insert data"})
    }
}

export async function GET(req, res) {
    // requireAuth();
    try {

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 10; // default limit 10
        const skip = parseInt(searchParams.get('skip')) || 0; // default skip 0
        const latest = searchParams.get('latest') === 'true'; // if latest=true, get latest records

        const client = await clientPromise;
        const db = client.db("logisticdb");
        const collection = db.collection("expenses");

        let query = {};
        let options = { skip, limit };

        if (latest) {
            // For latest, sort by createdAt descending
            options.sort = { createdAt: -1 };
        } else {
            // For full records, perhaps sort by date or something, but for now, default
            options.sort = { createdAt: -1 }; // assuming expenses have createdAt
        }

        const expenses = await collection.find(query, options).toArray();

        const total = await collection.countDocuments(query);

        return Response.json({
            status: "200",
            expenses: expenses,
            total: total,
            hasMore: skip + limit < total
        });
    } catch (error) {
        console.error("Database error:", error);
        return Response.json({ status: "400", error: "Failed to fetch data" });
    }
}

