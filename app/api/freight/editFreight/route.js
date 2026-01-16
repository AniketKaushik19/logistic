// import clientPromise from "@/lib/mongodb";
// import { requireAuth } from "@/lib/auth";
// import { NextResponse } from "next/server";
// import { ObjectId } from "mongodb";

// export async function POST(req) {
//   const auth = await requireAuth(req);
//   if (!auth.authenticated) {
//     return NextResponse.json(
//       { error: auth.error || "Unauthorized" },
//       { status: 401 }
//     );
//   }
//   try {
//     const _id=await req.json()
//     console.log(_id)
//     const client = await clientPromise;
//     const db = client.db("logisticdb");
//     const collection = db.collection("Freight");
//     const data = await collection
//       .findOne({_id:new ObjectId(_id)})
//     console.log(data)
//     return NextResponse.json({msg:"Edit Freight data",data});
//   } catch (error) {
//     console.error(" Error in edit Freight:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch edit Freight data" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Get id from query params
    const { searchParams } = req.nextUrl;
   
    
    const _id = searchParams.get("id");

    if (!_id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");
    const collection = db.collection("Freight");

    const data = await collection.findOne({ _id: new ObjectId(_id) });

    if (!data) {
      return NextResponse.json(
        { error: "Freight not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ msg: "Edit Freight data", data });
  } catch (error) {
    console.error("Error in edit Freight:", error);
    return NextResponse.json(
      { error: "Failed to fetch edit Freight data" },
      { status: 500 }
    );
  }
}