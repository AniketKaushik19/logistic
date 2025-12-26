import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    /* -------------------- VALIDATION -------------------- */
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    /* -------------------- DB -------------------- */
    const client = await clientPromise;
    const db = client.db("logisticdb");

    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    /* -------------------- HASH PASSWORD -------------------- */
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = {
      name,
      email,
      password: hashedPassword,
      role: "admin", // or "user" if needed
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);

    /* -------------------- JWT -------------------- */
    const token = jwt.sign(
      {
        id: result.insertedId,
        email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    /* -------------------- RESPONSE -------------------- */
    const response = NextResponse.json(
      {
        success: true,
        message: "Admin Access given successfully",
        user: {
          _id: result.insertedId,
          name,
          email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    /* -------------------- COOKIE -------------------- */
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error("Admin Access error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
