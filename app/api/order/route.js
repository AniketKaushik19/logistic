import clientPromise from '@/lib/mongodb';

export async function GET(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('logisticdb');
    const collection = db.collection('orders');
    const data = await collection.find({}).toArray();
    return Response.json(data);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const client = await clientPromise;
    const db = client.db('logisticdb');
    const collection = db.collection('orders');
    const result = await collection.insertOne(data);
    return Response.json({ success: true, message: 'Order saved successfully', insertedId: result.insertedId });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ error: "Failed to insert data" }, { status: 500 });
  }
}