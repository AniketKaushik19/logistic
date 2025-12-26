import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    /* -------------------- VALIDATION -------------------- */
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    /* =====================================================
       1️⃣ ENV ADMIN LOGIN (CEO / SUPER ADMIN)
    ===================================================== */
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        {
          email,
          role: "admin",
          source: "env",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      const res = NextResponse.json({
        success: true,
        message: "Admin login successful",
        user: {
          email,
          role: "admin",
        },
      });

      res.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      return res;
    }

    /* =====================================================
       2️⃣ DATABASE LOGIN (Admin / User)
    ===================================================== */
    const client = await clientPromise;
    const db = client.db("logisticdb");

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        source: "db",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const res = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
