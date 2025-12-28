import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(req) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }  try {
    const { truckNumber, model, capacity, registrationYear, driverName } = await req.json();

    if (!truckNumber || !model || !capacity || !registrationYear || !driverName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('logisticdb'); // Adjust database name if needed
    const collection = db.collection('vehicles');

    const result = await collection.insertOne({
      truckNumber: truckNumber.toUpperCase(),
      model: model.toUpperCase(),
      capacity: parseFloat(capacity),
      registrationYear: parseInt(registrationYear),
      driverName: driverName.toUpperCase(),
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Vehicle added successfully', id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req, res ){
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }  try{

        const client =await clientPromise;
        const db =client.db('logisticdb')
        const collection =db.collection('vehicles');
        const vehicles = await collection.find({}).toArray();
        return NextResponse.json(vehicles, {status:200});
    }
    catch(error){
        console.error('Error fetching vehicles:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req, res){
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }  try {
     const { truckNumber, driverName , capacity }=await req.json()
    const client=await clientPromise;
    const db=client.db("logisticdb")
    const collection=db.collection("vehicles")
    const result=await collection.updateOne(
      { truckNumber: truckNumber.toUpperCase() },
      { $set: { driverName: driverName.toUpperCase(), capacity: parseFloat(capacity) } }
    );
    return NextResponse.json({message:"Vehicle updated successfully"},{status:200})

  } catch (error) {
      console.error("Error udpating vehicle:",error)
      return NextResponse.json({error:"Internal server error"},{status:500})    
  }
}

export async function DELETE(req, res){
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }  try{

    const {truckNumber}=await req.json()
    const client=await clientPromise;
    const db=client.db("logisticdb")
    const collection=db.collection("vehicles")
    const result=await collection.deleteOne({truckNumber:truckNumber.toUpperCase()})
   
    return NextResponse.json({message:"Vehicle deleted successfully"},{status:200})
  }
  catch(error){
    console.error("Error deleting vehicle:",error)
    return NextResponse.json({error:"Internal server error"},{status:500})    
  }
}