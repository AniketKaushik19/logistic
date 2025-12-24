import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // <-- Make sure this path is correct

export async function POST(req) {
  try {
    const { name, email, message } = await req.json();

    // Validate input
    if (!email || !name || !message) {
      return NextResponse.json(
        { error: "Fill all required fields" },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message length should be greater than 10" },
        { status: 400 }
      );
    }

    // Connect to DB
    const client = await clientPromise;
    const db = client.db("logisticdb");

    // Create contact object
    const contact = {
      name,
      email,
      message,
      createdAt: new Date(),
    };

    // Insert into collection
    const result = await db.collection("contact").insertOne(contact);

    if (!result.insertedId) {
      return NextResponse.json(
        { error: "Error while saving..." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Successfully saved" }, { status: 200 });
  } catch (error) {
    console.error("Error while saving:", error);
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}