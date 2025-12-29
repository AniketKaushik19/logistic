import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

/* CEO VERIFY */
function verifyCEO(email, password) {
  return (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  );
}

/* DELETE ADMIN */
export async function DELETE(req, context) {
  const { id } = await context.params;

  const auth = await requireAuth(req);
  if (!auth.authenticated || auth.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { adminEmail, adminPassword } = await req.json();
  if (!verifyCEO(adminEmail, adminPassword)) {
    return NextResponse.json({ error: "CEO verification failed" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db("logisticdb");

  await db.collection("users").deleteOne({
    _id: new ObjectId(id),
    role: "admin",
  });

  return NextResponse.json({ success: true });
}

/* UPDATE PASSWORD */
export async function PUT(req) {
  try {
    const auth = await requireAuth(req);

    if (!auth.authenticated || auth.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { adminId, password } = body;

    if (!adminId || !ObjectId.isValid(adminId)) {
      return NextResponse.json(
        { error: "Invalid admin ID" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    /* 🔐 ADMIN CAN CHANGE ONLY OWN PASSWORD */
    const authUserId =
      auth.user?._id || auth.user?.id || auth.user?.userId;

    if (!authUserId || authUserId.toString() !== adminId.toString()) {
      return NextResponse.json(
        { error: "You can only change your own password" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(adminId) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin PUT error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

