import clientPromise from "@/lib/mongodb";
export async function POST(req, res) {
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
