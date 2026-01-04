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
    const { name, address, bloodGroup, contactNumber, emailAddress, permanentLocal, vehicleNumber, salary } = await req.json();

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
      emailAddress: emailAddress || '',
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
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('logisticdb');
    const collection = db.collection('drivers');
    const drivers = await collection.find({}).toArray();
    return NextResponse.json(drivers, { status: 200 });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, name, address, bloodGroup, contactNumber, emailAddress, permanentLocal, vehicleNumber, salary } = await req.json();
    if (!id) return NextResponse.json({ error: 'Driver id is required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('logisticdb');
    const collection = db.collection('drivers');

    const update = {
      ...(name && { name }),
      ...(address !== undefined && { address }),
      ...(bloodGroup !== undefined && { bloodGroup }),
      ...(contactNumber && { contactNumber }),
      ...(emailAddress !== undefined && { emailAddress }),
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
