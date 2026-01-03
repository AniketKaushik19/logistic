import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const { customer,
    customerAddress,
    customerGstin,
    billNo,
    billDate,
    partyCode,
    vendorCode,
    consignments: [
      {
        cnNo,
        cnDate,
        from,
        to,
        freight,
        labour,
        detention,
        bonus,
        total,
      },
    ],
    grandTotal,
    amountInWord,} = await req.json();
     // Connect to DB
     const data={
       customer,
    customerAddress,
    customerGstin,
    billNo,
    billDate,
    partyCode,
    vendorCode,
    consignments: [
      {
        cnNo,
        cnDate,
        from,
        to,
        freight,
        labour,
        detention,
        bonus,
        total,
      },
    ],
    grandTotal,
    amountInWord,
    createdAt:new Date()
     }
    const client = await clientPromise;
    const db = client.db("logisticdb");   
     const result = await db.collection("E-bill").insertOne(data);
     if(result){
       return NextResponse.json({
         success: true,
         message: "E-bill  saved successfully",
        });
      }
    else {
       return NextResponse.json({
         success: true,
         message: "E-bill Not saved",
        });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error saving E-bill" },
      { status: 500 }
    );
  }
}



/**
 * GET → Fetch latest 5 consignments for profit calculation
 */
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
    const collection = db.collection("E-bill");
    const data = await collection
      .find()
      .sort({createdAt:-1})
      .limit(10)
      .toArray();
    return NextResponse.json({msg:"E-bill data",data});
  } catch (error) {
    console.error("Ebill get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ebill data" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, res){
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }  try{

    const {_id}=await req.json()
    console.log(_id)
    const client=await clientPromise;
    const db=client.db("logisticdb")
    const collection=db.collection("E-bill")
    const result=await collection.deleteOne({_id:new ObjectId(_id)})
    console.log(result)
    return NextResponse.json({msg:"E-bill deleted successfully"},{status:200})
  }
  catch(error){
    console.error("Error deleting E-bill:",error)
    return NextResponse.json({error:"Internal server error"},{status:500})    
  }
}