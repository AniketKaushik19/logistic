import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, address, bloodGroup, contactNumber,  permanentLocal, vehicleNumber, salary } = await req.json();

    if (!name || !contactNumber || !salary) {
      return NextResponse.json({ error: 'Name, contact number and salary are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('logisticdb');
    const collection = db.collection('drivers');

    const result = await collection.insertOne({
      name,
      address: address || '',
      bloodGroup: bloodGroup || '',
      contactNumber,
      permanentLocal: permanentLocal || '',
      vehicleNumber: vehicleNumber || '',
      salary: parseFloat(salary),
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Driver added', id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error adding driver:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await requireAuth(req);

  if (!auth.authenticated) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get("driverId");

  const client = await clientPromise;
  const db = client.db("logisticdb");

  if (!driverId) {
    const drivers = await db
      .collection("drivers")
      .find({}, {
        projection: {
          name: 1,
          salary: 1,
          contactNumber: 1,
          vehicleNumber: 1,
        },
      })
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json(drivers);
  }

  if (!ObjectId.isValid(driverId)) {
    return NextResponse.json(
      { error: "Invalid driverId" },
      { status: 400 }
    );
  }

  /* =====================================================
     DRIVER DETAILS
  ===================================================== */
  const driver = await db
    .collection("drivers")
    .findOne(
      {
        _id: new ObjectId(driverId),
      },
      {
        projection: {
          name: 1,
          salary: 1,
          contactNumber: 1,
          vehicleNumber: 1,
        },
      }
    );

  if (!driver) {
    return NextResponse.json(
      { error: "Driver not found" },
      { status: 404 }
    );
  }

  /* =====================================================
     SALARY HISTORY
  ===================================================== */
  const history = await db
    .collection("driverSalaryHistory")
    .find({
      driverId: new ObjectId(driverId),
    })
    .sort({
      createdAt: -1,
    })
    .toArray();

  /* =====================================================
     CLEAN RESPONSE
  ===================================================== */
  const cleanedHistory = history.map((h) => ({
    _id: h._id,
    driverId: h.driverId,
    month: h.month,
    /* =========================
       DRIVER DETAILS
    ========================= */
    driver: {
      _id: driver._id,
      name: driver.name || "",
      contactNumber: driver.contactNumber || "",
      vehicleNumber: driver.vehicleNumber || "",
    },
    /* =========================
       SALARY DETAILS
    ========================= */
    salary: h.salary || 0,
    advance: h.advance || 0,
    bonus: h.bonus || 0,
    pendingAdvance: h.pendingAdvance || 0,
    netPay: h.netPay || 0,
    transactionType: h.transactionType || "SALARY_PAID",
    status: h.status || "Paid",
    markPaid: !!h.markPaid,
    createdBy: h.createdBy || null,
    createdAt: h.createdAt,
  }));

  return NextResponse.json(cleanedHistory);
}

export async function PUT(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, name, address, bloodGroup, contactNumber,  permanentLocal, vehicleNumber, salary } = await req.json();
    if (!id) return NextResponse.json({ error: 'Driver id is required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('logisticdb');
    const collection = db.collection('drivers');

    const update = {
      ...(name && { name }),
      ...(address !== undefined && { address }),
      ...(bloodGroup !== undefined && { bloodGroup }),
      ...(contactNumber && { contactNumber }),
      ...(permanentLocal !== undefined && { permanentLocal }),
      ...(vehicleNumber !== undefined && { vehicleNumber }),
      ...(salary !== undefined && { salary: parseFloat(salary) }),
      updatedAt: new Date(),
    };

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: update });
    return NextResponse.json({ message: 'Driver updated' }, { status: 200 });
  } catch (error) {
    console.error('Error updating driver:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Driver id is required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('logisticdb');
    const collection = db.collection('drivers');
    await collection.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'Driver deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
