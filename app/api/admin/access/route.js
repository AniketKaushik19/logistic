import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function GET(req) {
  const auth = await requireAuth(req);

  if (!auth.authenticated || auth.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("logisticdb");

    const admins = await db
      .collection("users")
      .find(
        { role: "admin" },
        { projection: { password: 0 } }
      )
      .toArray();

    // ✅ SAFELY extract current admin id
    const currentAdminId =
      auth.user._id ||
      auth.user.id ||
      auth.user.userId ||
      null;

    return NextResponse.json(
      {
        admins,
        currentAdminId: currentAdminId?.toString() || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin access GET error:", error);
    return NextResponse.json(
      { error: "Failed to load admins" },
      { status: 500 }
    );
  }
}


/* CEO VERIFY */
function verifyCEO(email, password) {
  return (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  );
}

/* ================= DELETE ADMIN (BODY BASED) ================= */
export async function DELETE(req) {
  const auth = await requireAuth(req);

  if (!auth.authenticated || auth.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { adminId, adminEmail, adminPassword } = body;

    if (!adminId || !ObjectId.isValid(adminId)) {
      return NextResponse.json(
        { error: "Invalid admin ID" },
        { status: 400 }
      );
    }

    /* CEO VERIFICATION */
    if (!verifyCEO(adminEmail, adminPassword)) {
      return NextResponse.json(
        { error: "CEO verification failed" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("logisticdb");

    const result = await db.collection("users").deleteOne({
      _id: new ObjectId(adminId),
      role: "admin",
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Admin DELETE error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

/* ================= UPDATE PASSWORD (BODY BASED) ================= */
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
    const authUserIdRaw =
      auth.user?._id || auth.user?.id || auth.user?.userId;

    const authUserId = authUserIdRaw?.toString();
    const requestAdminId = adminId.toString();

    if (!authUserId || authUserId !== requestAdminId) {
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

