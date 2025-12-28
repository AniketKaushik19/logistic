import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    // TODO: Save to DB (Mongo / SQL)
    console.log("Freight Saved:", body);

    return NextResponse.json({
      success: true,
      message: "Freight memo saved successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error saving freight" },
      { status: 500 }
    );
  }
}
