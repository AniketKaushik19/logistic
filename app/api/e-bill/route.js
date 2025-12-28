import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
     // Connect to DB
    const client = await clientPromise;
    const db = client.db("logisticdb");
    
     const result = await db.collection("E-bil").insertOne(body);
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
